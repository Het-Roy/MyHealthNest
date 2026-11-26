import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemePalette } from '@/hooks/useThemePalette';
import { radii, spacing, typography } from '@/theme';

export function Badge({ label, tone = 'neutral' }) {
  const palette = useThemePalette();

  const backgroundColor =
    tone === 'alert'
      ? palette.alertSurface
      : tone === 'primary'
      ? palette.surfaceSecondary
      : palette.surface;

  const textColor =
    tone === 'alert'
      ? palette.alert
      : tone === 'primary'
      ? palette.primary
      : palette.textSecondary;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    ...typography.small,
    fontWeight: '600',
  },
});
