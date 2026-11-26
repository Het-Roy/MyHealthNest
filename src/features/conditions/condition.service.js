import { StorageService } from '@/services/storage.service';
import { generateId } from '@/utils/id.utils';

export const CONDITION_COLORS = [
  '#0F766E', // Primary teal
  '#2563EB', // Blue
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#059669', // Emerald
  '#DC2626', // Red
  '#DB2777', // Pink
];

export const ConditionService = {
  async getConditions() {
    return await StorageService.getConditions();
  },

  async createCondition(name, color = '#0F766E') {
    const conditions = await StorageService.getConditions();
    const newCondition = {
      id: generateId('cnd'),
      name: name.trim(),
      color: color || '#0F766E',
      createdAt: new Date().toISOString(),
    };
    const updated = [newCondition, ...conditions];
    await StorageService.saveConditions(updated);

    // Sync to profile
    const profile = await StorageService.getProfile();
    if (profile && !profile.conditionIds.includes(newCondition.id)) {
      profile.conditionIds.push(newCondition.id);
      await StorageService.saveProfile(profile);
    }

    return newCondition;
  },

  async updateCondition(id, name, color) {
    const conditions = await StorageService.getConditions();
    const index = conditions.findIndex((c) => c.id === id);
    if (index === -1) return null;

    conditions[index] = {
      ...conditions[index],
      name: name.trim(),
      ...(color ? { color } : {}),
    };
    await StorageService.saveConditions(conditions);
    return conditions[index];
  },

  async deleteCondition(id) {
    const conditions = await StorageService.getConditions();
    const filtered = conditions.filter((c) => c.id !== id);
    await StorageService.saveConditions(filtered);

    // Unlink records without deleting them
    const records = await StorageService.getRecords();
    let recordsUpdated = false;
    for (const record of records) {
      if (record.conditionId === id) {
        record.conditionId = null;
        recordsUpdated = true;
      }
    }
    if (recordsUpdated) {
      await StorageService.saveRecords(records);
    }

    // Unlink from profile
    const profile = await StorageService.getProfile();
    if (profile) {
      profile.conditionIds = profile.conditionIds.filter((cid) => cid !== id);
      await StorageService.saveProfile(profile);
    }

    return true;
  },
};
