import { create } from 'zustand';
import { ProfileService } from './profile.service';

export const useProfileStore = create((set, get) => ({
  profile: null,
  allergies: [],
  isLoading: false,
  error: null,

  loadProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const [profile, allergies] = await Promise.all([
        ProfileService.getProfile(),
        ProfileService.getAllergies(),
      ]);
      set({ profile, allergies, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  saveProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const saved = await ProfileService.saveProfile(data);
      set({ profile: saved, isLoading: false });
      return saved;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  addAllergy: async (data) => {
    const allergy = await ProfileService.addAllergy(data);
    set((state) => ({ allergies: [allergy, ...state.allergies] }));
    return allergy;
  },

  updateAllergy: async (id, partial) => {
    const updated = await ProfileService.updateAllergy(id, partial);
    set((state) => ({
      allergies: state.allergies.map((a) => (a.id === id ? updated : a)),
    }));
    return updated;
  },

  deleteAllergy: async (id) => {
    await ProfileService.deleteAllergy(id);
    set((state) => ({
      allergies: state.allergies.filter((a) => a.id !== id),
    }));
  },

  addSurgery: async (name) => {
    const surgeries = await ProfileService.addSurgery(name);
    set((state) => ({
      profile: state.profile ? { ...state.profile, surgeries } : null,
    }));
  },

  removeSurgery: async (name) => {
    const surgeries = await ProfileService.removeSurgery(name);
    set((state) => ({
      profile: state.profile ? { ...state.profile, surgeries } : null,
    }));
  },

  addVaccination: async (name) => {
    const vaccinations = await ProfileService.addVaccination(name);
    set((state) => ({
      profile: state.profile ? { ...state.profile, vaccinations } : null,
    }));
  },

  removeVaccination: async (name) => {
    const vaccinations = await ProfileService.removeVaccination(name);
    set((state) => ({
      profile: state.profile ? { ...state.profile, vaccinations } : null,
    }));
  },
}));
