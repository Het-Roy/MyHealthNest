import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useThemePalette } from '@/hooks/useThemePalette';
import { radii, spacing, typography } from '@/theme';

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon = null,
  style = null,
  accessibilityLabel,
}) {
  const palette = useThemePalette();
  const isDisabled = disabled || loading;

  const backgroundColor =
    isDisabled
      ? palette.disabled
      : variant === 'primary'
      ? palette.primary
      : variant === 'danger'
      ? palette.alert
      : variant === 'secondary'
      ? palette.surfaceSecondary
      : 'transparent';

  const textColor =
    isDisabled
      ? palette.disabledText
      : variant === 'primary' || variant === 'danger'
      ? palette.white
      : variant === 'secondary'
      ? palette.text
      : palette.primary;

  const borderColor =
    variant === 'outline'
      ? isDisabled
        ? palette.disabled
        : palette.primary
      : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          opacity: pressed && !isDisabled ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
});
