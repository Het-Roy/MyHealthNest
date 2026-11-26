import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  isLocked: false,
  isDoctorMode: false,
  biometricAvailable: false,
  isAuthenticating: false,
  lastBackgroundAt: null,
  authError: null,

  setBiometricAvailable: (biometricAvailable) => set({ biometricAvailable }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setLocked: (isLocked) => set({ isLocked, isAuthenticated: !isLocked }),
  setDoctorMode: (isDoctorMode) => set({ isDoctorMode }),
  setAuthenticating: (isAuthenticating) => set({ isAuthenticating }),
  setLastBackgroundAt: (lastBackgroundAt) => set({ lastBackgroundAt }),
  setAuthError: (authError) => set({ authError }),
  resetAuth: () =>
    set({
      isAuthenticated: false,
      isLocked: false,
      isDoctorMode: false,
      isAuthenticating: false,
      lastBackgroundAt: null,
      authError: null,
    }),
}));
