import { NotificationService } from '@/services/notification.service';
import { StorageService } from '@/services/storage.service';
import { generateId } from '@/utils/id.utils';

export const MedicineService = {
  async getMedicines() {
    return await StorageService.getMedicines();
  },

  async addMedicine(data) {
    const medicines = await StorageService.getMedicines();
    const times = data.times || [];
    const notificationIds = [];

    // Schedule notifications for each time slot
    for (const t of times) {
      const nid = await NotificationService.scheduleMedicineReminder(data.name, t);
      if (nid) notificationIds.push(nid);
    }

    const newMed = {
      id: generateId('med'),
      name: data.name.trim(),
      dose: data.dose.trim(),
      frequency: data.frequency || 'Daily',
      times,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || null,
      notificationIds,
      active: true,
    };

    const updated = [newMed, ...medicines];
    await StorageService.saveMedicines(updated);
    return newMed;
  },

  async toggleActive(id) {
    const medicines = await StorageService.getMedicines();
    const index = medicines.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const med = medicines[index];
    const newStatus = !med.active;

    if (!newStatus) {
      // Deactivating -> cancel scheduled notifications
      await NotificationService.cancelAllNotifications(med.notificationIds);
      med.notificationIds = [];
    } else {
      // Re-activating -> re-schedule notifications
      const newIds = [];
      for (const t of med.times) {
        const nid = await NotificationService.scheduleMedicineReminder(med.name, t);
        if (nid) newIds.push(nid);
      }
      med.notificationIds = newIds;
    }

    med.active = newStatus;
    medicines[index] = med;
    await StorageService.saveMedicines(medicines);
    return med;
  },

  async updateMedicine(id, partial) {
    const medicines = await StorageService.getMedicines();
    const index = medicines.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const med = medicines[index];
    // Cancel old notifications
    await NotificationService.cancelAllNotifications(med.notificationIds);

    const times = partial.times || med.times;
    const notificationIds = [];
    if (partial.active !== false) {
      for (const t of times) {
        const nid = await NotificationService.scheduleMedicineReminder(partial.name || med.name, t);
        if (nid) notificationIds.push(nid);
      }
    }

    const updatedMed = {
      ...med,
      ...partial,
      times,
      notificationIds,
    };

    medicines[index] = updatedMed;
    await StorageService.saveMedicines(medicines);
    return updatedMed;
  },

  async deleteMedicine(id) {
    const medicines = await StorageService.getMedicines();
    const target = medicines.find((m) => m.id === id);
    if (target) {
      await NotificationService.cancelAllNotifications(target.notificationIds);
    }
    const filtered = medicines.filter((m) => m.id !== id);
    await StorageService.saveMedicines(filtered);
    return true;
  },
};
