import * as Contacts from 'expo-contacts';
import { StorageService } from '@/services/storage.service';
import { generateId } from '@/utils/id.utils';

export const ContactsService = {
  async getContacts() {
    return await StorageService.getContacts();
  },

  async addContact(data) {
    const contacts = await StorageService.getContacts();
    let isPrimary = Boolean(data.isPrimary);

    // If first contact or marked primary, reset others
    if (contacts.length === 0) {
      isPrimary = true;
    }

    const updated = isPrimary
      ? contacts.map((c) => ({ ...c, isPrimary: false }))
      : [...contacts];

    const newContact = {
      id: generateId('cnt'),
      name: data.name.trim(),
      phone: data.phone.trim(),
      relationship: data.relationship || 'Other',
      isPrimary,
    };

    updated.push(newContact);
    await StorageService.saveContacts(updated);
    return newContact;
  },

  async updateContact(id, data) {
    const contacts = await StorageService.getContacts();
    const index = contacts.findIndex((c) => c.id === id);
    if (index === -1) return null;

    let isPrimary = Boolean(data.isPrimary);
    let updatedList = [...contacts];

    if (isPrimary) {
      updatedList = updatedList.map((c) => ({ ...c, isPrimary: false }));
    }

    updatedList[index] = {
      ...updatedList[index],
      ...data,
      isPrimary,
    };

    await StorageService.saveContacts(updatedList);
    return updatedList[index];
  },

  async deleteContact(id) {
    const contacts = await StorageService.getContacts();
    const filtered = contacts.filter((c) => c.id !== id);
    // If deleted contact was primary and others exist, make first primary
    if (filtered.length > 0 && !filtered.some((c) => c.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    await StorageService.saveContacts(filtered);
    return true;
  },

  async importDeviceContact() {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Contacts permission was denied.' };
    }

    const result = await Contacts.presentContactPickerAsync();
    if (result && result.name && result.phoneNumbers?.length > 0) {
      const imported = await this.addContact({
        name: result.name,
        phone: result.phoneNumbers[0].number || '',
        relationship: 'Other',
        isPrimary: false,
      });
      return { success: true, contact: imported };
    }

    return { success: false, error: 'No contact selected.' };
  },
};
