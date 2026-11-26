import { create } from 'zustand';
import { RecordService } from './record.service';

export const useRecordStore = create((set, get) => ({
  records: [],
  selectedRecord: null,
  capturedImages: [],
  isLoading: false,
  error: null,

  setCapturedImages: (images) => set({ capturedImages: images }),
  addCapturedImage: (uri) =>
    set((state) => ({ capturedImages: [...state.capturedImages, uri] })),
  removeCapturedImage: (index) =>
    set((state) => ({
      capturedImages: state.capturedImages.filter((_, i) => i !== index),
    })),
  clearCapturedImages: () => set({ capturedImages: [] }),

  loadRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const records = await RecordService.getRecords();
      set({ records, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  getRecordById: async (id) => {
    const record = await RecordService.getRecordById(id);
    set({ selectedRecord: record });
    return record;
  },

  addRecord: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const newRecord = await RecordService.createRecord(input);
      set((state) => ({
        records: [newRecord, ...state.records],
        capturedImages: [],
        isLoading: false,
      }));
      return newRecord;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateRecord: async (id, partial) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await RecordService.updateRecord(id, partial);
      set((state) => ({
        records: state.records.map((r) => (r.id === id ? updated : r)),
        selectedRecord: updated,
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteRecord: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await RecordService.deleteRecord(id);
      set((state) => ({
        records: state.records.filter((r) => r.id !== id),
        selectedRecord: null,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
