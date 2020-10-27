const { version, name } = require('../package.json');

const ibt = require('ibackuptool');
const _ = require('lodash');
const sqlite3 = require('sqlite3');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;
const chalk = require('chalk');
const { program } = require('commander');

program
  .storeOptionsAsProperties(false)
  .name(name)
  .version(version)
  .option('-s, --ssid <SSID>', 'filter devices by SSID')
  .option('-n, --name <name>', 'filter devices by name')
  .parse(process.argv);

const EXTRACT_PATH = path.resolve(process.cwd(), 'extracted');
const MI_HOME_PATH = 'App/com.xiaomi.miHome';

function findAllMiHomeDevices({ db }) {
  return new Promise((resolve, reject) => {
    db.all('SELECT ZNAME, ZTOKEN, ZMAC, ZLOCALIP, ZSSID FROM ZDEVICE;', (error, rows) => {
      if (error) return reject(error);

      const formattedRows = _.map(rows, (row) => ({
        name: row.ZNAME,
        token: row.ZTOKEN,
        mac: row.ZMAC,
        localIp: row.ZLOCALIP,
        ssid: row.ZSSID,
      }));

      return resolve(formattedRows);
    });
  })
}

function decryptToken({ token }) {
  const KEY = Buffer.from('00000000000000000000000000000000', 'hex');

  const decipher = crypto.createDecipheriv('aes-128-ecb', KEY, '');
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(token, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString();
}

function filterDevices({ devices, deviceSsidFilter, deviceNameFilter }) {
  const ssidFilter = deviceSsidFilter
    ? _.toLower(deviceSsidFilter)
    : undefined;
  const nameFilter = deviceNameFilter
    ? _.toLower(deviceNameFilter)
    : undefined;

  if (!ssidFilter && !nameFilter) {
    return devices;
  }

  return _.filter(devices, (device) => {
    const isMatchingSsid = _.toLower(device.ssid).includes(ssidFilter);
    const isMatchingName = _.toLower(device.name).includes(nameFilter);

    return isMatchingSsid || isMatchingName;
  });
}

function printDevices({ devices }) {
  if (devices.length === 0) {
    console.log('No devices found!');
    return;
  }

  const devicesBySsid = _.sortBy(devices, 'ssid');

  _.forEach(devicesBySsid, (device) =>
      console.log(
`${chalk.greenBright(device.name)} \
- ${chalk.greenBright(device.ssid)}
${chalk.bgBlueBright('[TOKEN]')} ${chalk.inverse(device.decryptedToken)}
${chalk.bgBlueBright('[IP]')} ${device.localIp} \
- ${chalk.bgBlueBright('[MAC]')} ${device.mac}\n`));
}

process.on('unhandledRejection', (error) => {
  console.error(error.message);
  process.exit(-1);
});

(async () => {
  let exitCode = 0;

  try {
    const { ssid: deviceSsidFilter, name: deviceNameFilter } = program.opts();

    const backups = await ibt.run('backups.list');
  
    const newestBackup = _.first(backups);
    
    if (!newestBackup) {
      throw new Error('Cannot find iPhone backups!');
    }

    const backupFiles = await ibt.run('backup.files', {
      backup: newestBackup.udid,
      filter: 'mihome.sqlite',
      extract: EXTRACT_PATH,
    });

    const miHomeSqliteFiles = _.filter(backupFiles, (file) => _.get(file, 'path', '').includes('mihome.sqlite'));
  
    if (miHomeSqliteFiles.length === 0) {
      throw new Error('Cannot find Mi Home sqlite files!');
    }
  
    const newestMiHomeSqliteFile = _.maxBy(miHomeSqliteFiles, 'mtime');
  
    const sqliteFilePath = path.resolve(EXTRACT_PATH, MI_HOME_PATH, newestMiHomeSqliteFile.path);
  
    const db = new sqlite3.Database(sqliteFilePath, sqlite3.OPEN_READONLY);
  
    const devices = await findAllMiHomeDevices({ db });
  
    db.close();

    const filteredDevices = filterDevices({ devices, deviceSsidFilter, deviceNameFilter });
  
    const devicesWithDecryptedToken = _.map(filteredDevices, (device) => ({
      ...device,
      decryptedToken: decryptToken({ token: device.token }),
    }));
  
    printDevices({ devices: devicesWithDecryptedToken });
  } catch (error) {
    console.error(error.message);
    exitCode = -1;
  } finally {
    await fs.rmdir(EXTRACT_PATH, { recursive: true }).catch(() => {
      console.error('Failed to remove "extracted" directory!');
      exitCode = -1;
    });
    process.exit(exitCode);
  }
})();
