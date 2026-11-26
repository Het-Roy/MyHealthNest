import { create } from 'zustand';
import { ConditionService } from './condition.service';

export const useConditionStore = create((set, get) => ({
  conditions: [],
  isLoading: false,
  error: null,

  loadConditions: async () => {
    set({ isLoading: true, error: null });
    try {
      const conditions = await ConditionService.getConditions();
      set({ conditions, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  createCondition: async (name, color) => {
    set({ isLoading: true, error: null });
    try {
      const created = await ConditionService.createCondition(name, color);
      set((state) => ({
        conditions: [created, ...state.conditions],
        isLoading: false,
      }));
      return created;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateCondition: async (id, name, color) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await ConditionService.updateCondition(id, name, color);
      set((state) => ({
        conditions: state.conditions.map((c) => (c.id === id ? updated : c)),
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteCondition: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await ConditionService.deleteCondition(id);
      set((state) => ({
        conditions: state.conditions.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
