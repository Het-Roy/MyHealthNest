import { useEffect } from 'react';
import { AppState } from 'react-native';
import { router } from 'expo-router';
import { AuthService } from '@/services/auth.service';
import { useAppStore } from '@/store/app.store';
import { useAuthStore } from '@/store/auth.store';

export function useAppLock() {
  const { settings } = useAppStore();
  const {
    isLocked,
    isDoctorMode,
    lastBackgroundAt,
    biometricAvailable,
    setLocked,
    setLastBackgroundAt,
  } = useAuthStore();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        setLastBackgroundAt(Date.now());
      } else if (nextAppState === 'active') {
        if (
          settings.biometricEnabled &&
          biometricAvailable &&
          !isLocked &&
          !isDoctorMode &&
          lastBackgroundAt
        ) {
          const shouldLock = AuthService.shouldAutoLock(
            lastBackgroundAt,
            settings.autoLockSeconds
          );
          if (shouldLock) {
            setLocked(true);
            router.push('/lock');
          }
        }
        setLastBackgroundAt(null);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [
    settings.autoLockSeconds,
    settings.biometricEnabled,
    biometricAvailable,
    isLocked,
    isDoctorMode,
    lastBackgroundAt,
  ]);
}
