import { create } from 'zustand';
import { ContactsService } from './contacts.service';

export const useContactsStore = create((set, get) => ({
  contacts: [],
  isLoading: false,
  error: null,

  loadContacts: async () => {
    set({ isLoading: true, error: null });
    try {
      const contacts = await ContactsService.getContacts();
      set({ contacts, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  addContact: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const contact = await ContactsService.addContact(data);
      const contacts = await ContactsService.getContacts();
      set({ contacts, isLoading: false });
      return contact;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateContact: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await ContactsService.updateContact(id, data);
      const contacts = await ContactsService.getContacts();
      set({ contacts, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteContact: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await ContactsService.deleteContact(id);
      const contacts = await ContactsService.getContacts();
      set({ contacts, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  importContact: async () => {
    const result = await ContactsService.importDeviceContact();
    if (result.success) {
      const contacts = await ContactsService.getContacts();
      set({ contacts });
    }
    return result;
  },
}));
