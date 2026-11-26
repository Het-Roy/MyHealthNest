import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useThemePalette } from '@/hooks/useThemePalette';
import { radii, spacing, typography } from '@/theme';

export function Input({
  label,
  error,
  containerStyle,
  style,
  ...props
}) {
  const palette = useThemePalette();

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={palette.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: palette.card,
            color: palette.text,
            borderColor: error ? palette.alert : palette.border,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text style={[styles.error, { color: palette.alert }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 46,
  },
  error: {
    ...typography.small,
  },
});
