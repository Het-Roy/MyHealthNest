import { useEffect } from 'react';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthService } from '@/services/auth.service';
import { StorageService } from '@/services/storage.service';
import { useAppStore } from '@/store/app.store';
import { useAuthStore } from '@/store/auth.store';
import { useProfileStore } from '@/features/profile/profile.store';

export function useAppBootstrap() {
  const { setInitialized, setSettings, setMetadata } = useAppStore();
  const { setBiometricAvailable, setLocked, setAuthenticated } = useAuthStore();
  const { loadProfile } = useProfileStore();

  useEffect(() => {
    async function bootstrap() {
      try {
        await SplashScreen.preventAutoHideAsync().catch(() => {});
        await StorageService.initialize();

        const [settings, metadata, profile] = await Promise.all([
          StorageService.getSettings(),
          StorageService.getMetadata(),
          StorageService.getProfile(),
        ]);

        setSettings(settings);
        setMetadata(metadata);
        await loadProfile();

        const bioAvailable = await AuthService.checkBiometricAvailability();
        setBiometricAvailable(bioAvailable);

        setInitialized(true, null);
        await SplashScreen.hideAsync().catch(() => {});

        // Routing logic
        if (!metadata.onboardingCompleted) {
          router.replace('/onboarding');
        } else if (!profile) {
          router.replace('/profile-setup');
        } else if (settings.biometricEnabled && bioAvailable) {
          setLocked(true);
          router.replace('/lock');
        } else {
          setAuthenticated(true);
          router.replace('/(tabs)');
        }
      } catch (error) {
        setInitialized(true, error.message);
        await SplashScreen.hideAsync().catch(() => {});
        router.replace('/onboarding');
      }
    }

    bootstrap();
  }, []);
}
