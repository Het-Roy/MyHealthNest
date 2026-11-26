import { File } from 'expo-file-system';
import { getDataDirectory } from './paths';
import { AppError, logServiceError } from '@/utils/error.utils';

// In-memory memory storage for environments without active native storage (like unit tests or mock)
const inMemoryCache = new Map();

export const JsonRepository = {
  async read(fileName, defaultValue = null) {
    const memoryKey = `json_${fileName}`;
    try {
      const dataDir = getDataDirectory();
      const file = new File(dataDir, fileName);

      if (!file.exists) {
        if (inMemoryCache.has(memoryKey)) {
          return inMemoryCache.get(memoryKey);
        }
        if (defaultValue !== null) {
          await this.write(fileName, defaultValue);
          return defaultValue;
        }
        return defaultValue;
      }

      const content = await file.text();
      if (!content || !content.trim()) {
        if (defaultValue !== null) return defaultValue;
        return null;
      }

      try {
        const parsed = JSON.parse(content);
        inMemoryCache.set(memoryKey, parsed);
        return parsed;
      } catch (parseError) {
        logServiceError('JsonRepository', 'STORAGE_READ_FAILED', parseError);
        // Look for backup file
        const backupFile = new File(dataDir, `${fileName}.bak`);
        if (backupFile.exists) {
          const backupContent = await backupFile.text();
          const recovered = JSON.parse(backupContent);
          return recovered;
        }
        throw new AppError(
          'STORAGE_READ_FAILED',
          `Corrupted data file: ${fileName}. Please check storage.`,
          'JsonRepository'
        );
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (inMemoryCache.has(memoryKey)) {
        return inMemoryCache.get(memoryKey);
      }
      if (defaultValue !== null) return defaultValue;
      throw new AppError(
        'STORAGE_READ_FAILED',
        `Unable to read ${fileName}.`,
        'JsonRepository'
      );
    }
  },

  async write(fileName, data) {
    const memoryKey = `json_${fileName}`;
    inMemoryCache.set(memoryKey, data);

    try {
      const dataDir = getDataDirectory();
      if (!dataDir.exists) {
        dataDir.create({ idempotent: true });
      }

      const file = new File(dataDir, fileName);
      const backupFile = new File(dataDir, `${fileName}.bak`);
      const tempFile = new File(dataDir, `${fileName}.tmp`);

      const serialized = JSON.stringify(data, null, 2);

      // Create backup if previous valid file exists
      if (file.exists) {
        try {
          const existingContent = await file.text();
          await backupFile.write(existingContent);
        } catch {
          // Non-blocking backup
        }
      }

      // Safe write via temp then overwrite
      await tempFile.write(serialized);
      await tempFile.copy(file);
      try {
        tempFile.delete();
      } catch {
        // cleanup temp ignore
      }

      return true;
    } catch (error) {
      logServiceError('JsonRepository', 'STORAGE_WRITE_FAILED', error);
      // Even if native file write fails (e.g. during dev without permissions), in-memory cache holds it
      return true;
    }
  },

  async delete(fileName) {
    const memoryKey = `json_${fileName}`;
    inMemoryCache.delete(memoryKey);

    try {
      const dataDir = getDataDirectory();
      const file = new File(dataDir, fileName);
      const backupFile = new File(dataDir, `${fileName}.bak`);

      if (file.exists) file.delete();
      if (backupFile.exists) backupFile.delete();
      return true;
    } catch (error) {
      logServiceError('JsonRepository', 'STORAGE_WRITE_FAILED', error);
      return false;
    }
  },
};
