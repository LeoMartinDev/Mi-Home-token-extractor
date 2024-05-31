import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import { Database } from 'bun:sqlite';

const getBackupDirectory = (platform) => {
  if (platform === 'darwin') {
    return path.join(os.homedir(), '/Library/Application Support/MobileSync/Backup/');
  }

  if (platform === 'win32') {
    return path.join(require('os').homedir(), '\\Apple\\MobileSync\\Backup')
  }

  throw new Error('Platform not supported');
};

const getDeviceName = (plistContent) => {
  const deviceNameMatch = plistContent.match(/<key>Device Name<\/key>\s*<string>([^<]+)<\/string>/);

  return deviceNameMatch && deviceNameMatch[1] ? deviceNameMatch[1] : null;
};

const getBackupDate = (plistContent) => {
  const dateMatch = plistContent.match(/<key>Last Backup Date<\/key>\s*<date>([^<]+)<\/date>/);

  return dateMatch && dateMatch[1] ? new Date(dateMatch[1]) : null;
};

export const createBackupsService = ({
  platform,
}) => {
  return {
    listBackups: async () => {
      const dirs = await fs.readdir(getBackupDirectory(platform));
      const backups = [];

      for (const dir of dirs) {
        const backupPath = path.join(getBackupDirectory(platform), dir);
        const infoPlist = Bun.file(path.join(backupPath, 'Info.plist'));

        const hasManifestDbFile = await Bun.file(path.join(backupPath, 'Manifest.db')).exists();
    
        if (!await infoPlist.exists() || !hasManifestDbFile) {
          continue;
        }

        const plistContent = await infoPlist.text();

        const deviceName = getDeviceName(plistContent);
        const backupDate = getBackupDate(plistContent);

        if (!deviceName || !backupDate) {
          continue;
        }

        backups.push({
          deviceName,
          backupDate,
          path: backupPath,
        });
      }
    
      return backups;
    },
    findFiles: async (backupPath, fileNameEndsWith) => {
      const db = new Database(path.join(backupPath, 'Manifest.db'), { readonly: true });

      const files = db.query(`SELECT fileID, relativePath FROM Files WHERE relativePath LIKE '%${fileNameEndsWith}'`).all();
      db.close();

      return (await Promise.all(files.map(async (file) => {
        if (await fs.exists(path.join(backupPath, file.fileID))) {
          return {
            fileID: file.fileID,
            path: path.join(backupPath, file.fileID),
            internalPath: file.relativePath,
          };
        }

        const fileShortId = file.fileID.substring(0, 2);

        if (await fs.exists(path.join(backupPath, fileShortId, file.fileID))) {
          return {
            fileID: file.fileID,
            path: path.join(backupPath, fileShortId, file.fileID),
            internalPath: file.relativePath,
          };
        }

        return;
      }))).filter(Boolean);
    },
  };
};
