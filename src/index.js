import { parseArgs } from "node:util";
import os from 'node:os';
import assert from 'node:assert';
import { Database } from 'bun:sqlite';
import crypto from 'node:crypto';

import { createBackupsService } from "./backups.service";

const { values: argsValues } = parseArgs({
  args: Bun.argv,
  options: {
    backupDeviceName: {
      type: 'string',
      short: 'b',
    },
  },
  strict: true,
  allowPositionals: true,
})

const platform = os.platform();
assert(platform === 'darwin' || platform === 'win32', 'Platform not supported');

const backupsService = createBackupsService({ platform });

const backups = await backupsService.listBackups();
assert(backups.length > 0, 'No backups found');
console.info(`Found ${backups.length} backups`);

const backup = backups
  .sort((a, b) => b.backupDate.getTime() - a.backupDate.getTime())
  .find((backup) => argsValues.backupDeviceName
    ? new RegExp(argsValues.backupDeviceName.trim(), 'i').test(backup.deviceName)
    : true,
  );
assert(backup, 'Backup not found');
console.info(`Using backup ${backup.deviceName} (${backup.backupDate.toISOString()})`);

const mihomeSqlite = await backupsService.findFiles(backup.path, 'mihome.sqlite');

const decryptToken = ({ token }) => {
  const KEY = Buffer.from('00000000000000000000000000000000', 'hex');

  const decipher = crypto.createDecipheriv('aes-128-ecb', KEY, '');
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(token, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString();
};

const getDevices = async (databasePath) => {
  try {
    const db = new Database(databasePath);
    const rows = db.query('SELECT ZNAME, ZTOKEN, ZMAC, ZLOCALIP, ZSSID FROM ZDEVICE').all();
    db.close();

    if (!rows || rows.length === 0) {
      return [];
    }

    return rows.map((row) => ({
      name: row.ZNAME,
      token: decryptToken({ token: row.ZTOKEN }),
      mac: row.ZMAC,
      localIp: row.ZLOCALIP,
      ssid: row.ZSSID,
    }));
  } catch (error) {
    return []
  }
};

const devices = (await Promise.all(mihomeSqlite.map(async (file) => getDevices(file.path))))
  .flat()
  .filter((device) => device !== undefined);
assert(devices.length > 0, 'No devices found');

console.info(`Found ${devices.length} devices`);
devices.forEach((device) =>
  console.info(`
DEVICE    ${device.name}
TOKEN     ${device.token}
MAC       ${device.mac}
LOCAL IP  ${device.localIp}
SSID      ${device.ssid}`));