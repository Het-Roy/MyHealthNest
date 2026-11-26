import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { FileText, FolderHeart, Share2 } from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useThemePalette } from '@/hooks/useThemePalette';
import { radii, spacing, typography } from '@/theme';

const SLIDES = [
  {
    title: 'Capture',
    message: 'Keep all your prescriptions and medical reports in one place.',
    icon: (color) => <FileText color={color} size={64} />,
  },
  {
    title: 'Organize',
    message: 'Organize your medical history and find everything easily.',
    icon: (color) => <FolderHeart color={color} size={64} />,
  },
  {
    title: 'Share',
    message: 'Share your medical history with doctors whenever you need it.',
    icon: (color) => <Share2 color={color} size={64} />,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const palette = useThemePalette();

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      router.replace('/profile-setup');
    }
  };

  const handleSkip = () => {
    router.replace('/profile-setup');
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <ScreenContainer scroll={false} style={styles.container}>
      <View style={styles.header}>
        <Logo size={44} />
        {currentIndex < SLIDES.length - 1 ? (
          <Button
            title="Skip"
            variant="outline"
            onPress={handleSkip}
            style={styles.skipButton}
          />
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <View style={styles.body}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: palette.surfaceSecondary },
          ]}
        >
          {currentSlide.icon(palette.primary)}
        </View>

        <Text style={[styles.title, { color: palette.text }]}>
          {currentSlide.title}
        </Text>
        <Text style={[styles.message, { color: palette.textSecondary }]}>
          {currentSlide.message}
        </Text>

        {/* Indicator dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentIndex ? palette.primary : palette.disabled,
                  width: i === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    minHeight: 36,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    maxWidth: 280,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dot: {
    height: 8,
    borderRadius: radii.full,
  },
  footer: {
    paddingHorizontal: spacing.md,
  },
});
