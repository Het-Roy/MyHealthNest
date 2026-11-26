import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Logo } from '@/components/ui/Logo';
import { useAppBootstrap } from '@/hooks/useAppBootstrap';
import { useAppLock } from '@/hooks/useAppLock';
import { useThemePalette } from '@/hooks/useThemePalette';
import { spacing, typography } from '@/theme';

export default function EntryScreen() {
  const palette = useThemePalette();
  useAppBootstrap();
  useAppLock();

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Logo size={96} />
      <Text style={[styles.title, { color: palette.text }]}>MyHealthNest</Text>
      <Text style={[styles.tagline, { color: palette.textSecondary }]}>
        Your Health. Your History. Your Safe Space.
      </Text>
      <ActivityIndicator color={palette.primary} size="large" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    ...typography.h1,
    marginTop: spacing.md,
  },
  tagline: {
    ...typography.caption,
    textAlign: 'center',
  },
  spinner: {
    marginTop: spacing.xl,
  },
});
