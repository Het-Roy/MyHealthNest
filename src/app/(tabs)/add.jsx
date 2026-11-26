import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Sparkles } from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { useRecordStore } from '@/features/records/record.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { radii, spacing, typography } from '@/theme';

export default function AddChoiceScreen() {
  const palette = useThemePalette();
  const { setCapturedImages } = useRecordStore();

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uris = result.assets.map((asset) => asset.uri);
        setCapturedImages(uris);
        router.push('/records/preview');
      }
    } catch (err) {
      console.warn('Gallery pick error:', err);
    }
  };

  const handleOpenCamera = () => {
    router.push('/records/capture');
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>Add Medical Record</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          Prescriptions, lab reports, imaging scans, and bills.
        </Text>
      </View>

      <View style={styles.cards}>
        <Card onPress={handleOpenCamera} style={styles.optionCard}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: palette.surfaceSecondary },
            ]}
          >
            <Camera color={palette.primary} size={32} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionTitle, { color: palette.text }]}>
              Scan Document
            </Text>
            <Text style={[styles.optionDesc, { color: palette.textSecondary }]}>
              Use camera with document frame guide
            </Text>
          </View>
        </Card>

        <Card onPress={handlePickFromGallery} style={styles.optionCard}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: palette.surfaceSecondary },
            ]}
          >
            <ImageIcon color={palette.primary} size={32} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionTitle, { color: palette.text }]}>
              Upload from Photos
            </Text>
            <Text style={[styles.optionDesc, { color: palette.textSecondary }]}>
              Select one or multiple images
            </Text>
          </View>
        </Card>
      </View>

      <Card variant="surface" style={styles.tipCard}>
        <View style={styles.tipRow}>
          <Sparkles color={palette.primary} size={20} />
          <Text style={[styles.tipTitle, { color: palette.text }]}>
            Tip for best scan quality
          </Text>
        </View>
        <Text style={[styles.tipBody, { color: palette.textSecondary }]}>
          Place your prescription or lab report on a flat surface, avoid shadows, and ensure all text is clearly readable.
        </Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginVertical: spacing.md,
    gap: spacing.xs,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.body,
  },
  cards: {
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  optionTitle: {
    ...typography.h3,
  },
  optionDesc: {
    ...typography.caption,
  },
  tipCard: {
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipTitle: {
    ...typography.label,
  },
  tipBody: {
    ...typography.caption,
  },
});
