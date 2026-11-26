import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useThemePalette } from '@/hooks/useThemePalette';
import { radii, shadows, spacing } from '@/theme';

export function Card({ children, variant = 'default', onPress, style }) {
  const palette = useThemePalette();

  const backgroundColor =
    variant === 'alert'
      ? palette.alertSurface
      : variant === 'surface'
      ? palette.surface
      : palette.card;

  const borderColor = variant === 'alert' ? palette.alert : palette.border;

  const cardStyle = [
    styles.card,
    shadows.sm,
    { 
      backgroundColor,
      borderColor,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed ? { opacity: 0.9 } : null]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
});
