import { FileRepository } from '@/storage/file.repository';
import { JsonRepository } from '@/storage/json.repository';
import { CURRENT_SCHEMA_VERSION, runMigrations } from '@/storage/migrations';
import { DEFAULT_METADATA, DEFAULT_SETTINGS } from '@/types/common.types';
import { AppError } from '@/utils/error.utils';

export const StorageService = {
  async initialize() {
    await FileRepository.ensureBaseDirectories();
    const metadata = await this.getMetadata();
    await runMigrations(metadata, this);
    return true;
  },

  // Metadata
  async getMetadata() {
    return await JsonRepository.read('metadata.json', DEFAULT_METADATA);
  },

  async saveMetadata(metadata) {
    return await JsonRepository.write('metadata.json', {
      ...DEFAULT_METADATA,
      ...metadata,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    });
  },

  // Settings
  async getSettings() {
    return await JsonRepository.read('settings.json', DEFAULT_SETTINGS);
  },

  async saveSettings(settings) {
    return await JsonRepository.write('settings.json', settings);
  },

  // Profile
  async getProfile() {
    return await JsonRepository.read('profile.json', null);
  },

  async saveProfile(profile) {
    return await JsonRepository.write('profile.json', profile);
  },

  // Allergies
  async getAllergies() {
    return await JsonRepository.read('allergies.json', []);
  },

  async saveAllergies(allergies) {
    return await JsonRepository.write('allergies.json', allergies);
  },

  // Medical Records
  async getRecords() {
    return await JsonRepository.read('records.json', []);
  },

  async saveRecords(records) {
    return await JsonRepository.write('records.json', records);
  },

  // Conditions
  async getConditions() {
    return await JsonRepository.read('conditions.json', []);
  },

  async saveConditions(conditions) {
    return await JsonRepository.write('conditions.json', conditions);
  },

  // Medicines
  async getMedicines() {
    return await JsonRepository.read('medicines.json', []);
  },

  async saveMedicines(medicines) {
    return await JsonRepository.write('medicines.json', medicines);
  },

  // Emergency Contacts
  async getContacts() {
    return await JsonRepository.read('contacts.json', []);
  },

  async saveContacts(contacts) {
    return await JsonRepository.write('contacts.json', contacts);
  },

  // Reminders
  async getReminders() {
    return await JsonRepository.read('reminders.json', []);
  },

  async saveReminders(reminders) {
    return await JsonRepository.write('reminders.json', reminders);
  },

  // File Operations for Records
  async persistRecordImages(recordId, imageUris) {
    if (!imageUris || imageUris.length === 0) {
      throw new AppError(
        'VALIDATION_FAILED',
        'At least one document image is required.',
        'StorageService'
      );
    }
    const savedPaths = [];
    try {
      for (let i = 0; i < imageUris.length; i++) {
        const destUri = await FileRepository.copyImageToRecord(
          imageUris[i],
          recordId,
          i
        );
        savedPaths.push(destUri);
      }
      return savedPaths;
    } catch (error) {
      // Clean up any partially copied files
      await FileRepository.deleteRecordFiles(recordId);
      throw error;
    }
  },

  async deleteRecordStorage(recordId) {
    return await FileRepository.deleteRecordFiles(recordId);
  },

  // Wipe All Data
  async wipeAllData() {
    await FileRepository.deleteAllData();
    await this.saveMetadata({ ...DEFAULT_METADATA, onboardingCompleted: false });
    await this.saveSettings(DEFAULT_SETTINGS);
    return true;
  },
};
