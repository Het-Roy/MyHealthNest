import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Camera, Plus, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRecordStore } from '@/features/records/record.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { radii, spacing, typography } from '@/theme';

export default function RecordPreviewScreen() {
  const palette = useThemePalette();
  const { capturedImages, removeCapturedImage, addCapturedImage, setCapturedImages } =
    useRecordStore();

  const handleAddMoreFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (!res.canceled && res.assets?.length > 0) {
      for (const asset of res.assets) {
        addCapturedImage(asset.uri);
      }
    }
  };

  const handleAddFromCamera = () => {
    router.push('/records/capture');
  };

  const handleContinue = () => {
    router.push('/records/add');
  };

  if (capturedImages.length === 0) {
    return (
      <ScreenContainer>
        <Text style={[styles.title, { color: palette.text }]}>No Images Selected</Text>
        <Button
          title="Take a Photo"
          onPress={handleAddFromCamera}
          style={{ marginTop: spacing.md }}
        />
        <Button
          title="Choose from Photos"
          variant="outline"
          onPress={handleAddMoreFromGallery}
          style={{ marginTop: spacing.sm }}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>Document Pages</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          {capturedImages.length} {capturedImages.length === 1 ? 'page' : 'pages'} selected
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {capturedImages.map((uri, index) => (
          <Card key={index} style={styles.pageCard}>
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
            <View style={styles.cardFooter}>
              <Text style={[styles.pageIndex, { color: palette.textSecondary }]}>
                Page {index + 1}
              </Text>
              <TouchableOpacity
                onPress={() => removeCapturedImage(index)}
                style={[styles.removeBtn, { backgroundColor: palette.alertSurface }]}
              >
                <Trash2 color={palette.alert} size={16} />
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>

      <View style={styles.addMoreRow}>
        <Button
          title="Add Camera Page"
          icon={<Camera color={palette.text} size={18} />}
          variant="secondary"
          onPress={handleAddFromCamera}
          style={styles.halfBtn}
        />
        <Button
          title="Add from Photos"
          icon={<Plus color={palette.text} size={18} />}
          variant="secondary"
          onPress={handleAddMoreFromGallery}
          style={styles.halfBtn}
        />
      </View>

      <Button
        title="Continue to Record Details"
        onPress={handleContinue}
        style={styles.continueBtn}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginVertical: spacing.md,
    gap: spacing.xs,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.caption,
  },
  scroll: {
    marginVertical: spacing.md,
  },
  pageCard: {
    width: 220,
    marginRight: spacing.md,
    padding: spacing.sm,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: radii.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  pageIndex: {
    ...typography.caption,
    fontWeight: '600',
  },
  removeBtn: {
    padding: spacing.xs,
    borderRadius: radii.sm,
  },
  addMoreRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  halfBtn: {
    flex: 1,
  },
  continueBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
