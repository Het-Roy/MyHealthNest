import { create } from 'zustand';
import { MedicineService } from './medicine.service';

export const useMedicineStore = create((set, get) => ({
  medicines: [],
  isLoading: false,
  error: null,

  loadMedicines: async () => {
    set({ isLoading: true, error: null });
    try {
      const medicines = await MedicineService.getMedicines();
      set({ medicines, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  addMedicine: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newMed = await MedicineService.addMedicine(data);
      set((state) => ({
        medicines: [newMed, ...state.medicines],
        isLoading: false,
      }));
      return newMed;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  toggleActive: async (id) => {
    const updated = await MedicineService.toggleActive(id);
    set((state) => ({
      medicines: state.medicines.map((m) => (m.id === id ? updated : m)),
    }));
  },

  updateMedicine: async (id, partial) => {
    const updated = await MedicineService.updateMedicine(id, partial);
    set((state) => ({
      medicines: state.medicines.map((m) => (m.id === id ? updated : m)),
    }));
  },

  deleteMedicine: async (id) => {
    await MedicineService.deleteMedicine(id);
    set((state) => ({
      medicines: state.medicines.filter((m) => m.id !== id),
    }));
  },
}));
