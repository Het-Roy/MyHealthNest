import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useIsDarkTheme, useThemePalette } from '@/hooks/useThemePalette';

export default function RootLayout() {
  const palette = useThemePalette();
  const isDark = useIsDarkTheme();

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palette.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="profile-setup" />
          <Stack.Screen name="lock" options={{ gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="doctor-mode" options={{ gestureEnabled: false }} />
          <Stack.Screen name="emergency-card" />
          <Stack.Screen name="reminders" />
          <Stack.Screen name="share" />
          <Stack.Screen name="records/capture" />
          <Stack.Screen name="records/preview" />
          <Stack.Screen name="records/add" />
          <Stack.Screen name="records/[id]" />
          <Stack.Screen name="conditions/index" />
          <Stack.Screen name="conditions/[id]" />
          <Stack.Screen name="medicines/index" />
          <Stack.Screen name="medicines/add" />
        </Stack>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
