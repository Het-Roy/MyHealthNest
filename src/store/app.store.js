import { create } from 'zustand';
import { DEFAULT_METADATA, DEFAULT_SETTINGS } from '@/types/common.types';

export const useAppStore = create((set) => ({
  isInitialized: false,
  initError: null,
  settings: DEFAULT_SETTINGS,
  metadata: DEFAULT_METADATA,

  setInitialized: (isInitialized, initError = null) => set({ isInitialized, initError }),
  setSettings: (settings) => set({ settings }),
  updateSettingsLocal: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),
  setTheme: (theme) =>
    set((state) => ({ settings: { ...state.settings, theme } })),
  setMetadata: (metadata) => set({ metadata }),
  updateMetadataLocal: (partial) =>
    set((state) => ({ metadata: { ...state.metadata, ...partial } })),
  resetAppState: () =>
    set({
      isInitialized: true,
      initError: null,
      settings: DEFAULT_SETTINGS,
      metadata: DEFAULT_METADATA,
    }),
}));
