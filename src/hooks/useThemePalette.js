import { useColorScheme } from 'react-native';
import { darkPalette, lightPalette } from '@/theme';
import { useAppStore } from '@/store/app.store';

export function useThemePalette() {
  const systemScheme = useColorScheme();
  const themeSetting = useAppStore((state) => state.settings.theme);

  const isDark =
    themeSetting === 'dark' || (themeSetting === 'system' && systemScheme === 'dark');

  return isDark ? darkPalette : lightPalette;
}

export function useIsDarkTheme() {
  const systemScheme = useColorScheme();
  const themeSetting = useAppStore((state) => state.settings.theme);
  return themeSetting === 'dark' || (themeSetting === 'system' && systemScheme === 'dark');
}
