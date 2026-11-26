import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, Camera, Flashlight, FlashlightOff, Image } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/Button';
import { useRecordStore } from '@/features/records/record.store';
import { colors, radii, spacing, typography } from '@/theme';

export default function CameraCaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState(false);
  const cameraRef = useRef(null);
  const { addCapturedImage, setCapturedImages, capturedImages } = useRecordStore();

  if (!permission) {
    return <View style={styles.fallbackContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permDesc}>
          MyHealthNest needs camera permission to scan your physical prescriptions and reports.
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
        <Button
          title="Choose from Photos instead"
          variant="outline"
          onPress={async () => {
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsMultipleSelection: true,
              quality: 0.85,
            });
            if (!res.canceled && res.assets?.length > 0) {
              setCapturedImages(res.assets.map((a) => a.uri));
              router.replace('/records/preview');
            }
          }}
          style={{ marginTop: spacing.md }}
        />
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
        });
        if (photo?.uri) {
          addCapturedImage(photo.uri);
          router.push('/records/preview');
        }
      } catch (err) {
        console.warn('Capture error:', err);
      }
    }
  };

  const handlePickGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (!res.canceled && res.assets?.length > 0) {
      setCapturedImages(res.assets.map((a) => a.uri));
      router.push('/records/preview');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        enableTorch={flash}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => router.back()}
          >
            <ArrowLeft color={colors.white} size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => setFlash((prev) => !prev)}
          >
            {flash ? (
              <Flashlight color={colors.white} size={24} />
            ) : (
              <FlashlightOff color={colors.white} size={24} />
            )}
          </TouchableOpacity>
        </View>

        {/* Document frame overlay */}
        <View style={styles.overlayContainer}>
          <View style={styles.docFrame}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
          <Text style={styles.instruction}>
            Place the report on a flat surface and avoid shadows.
          </Text>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.circleBtn} onPress={handlePickGallery}>
            <Image color={colors.white} size={26} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
            <View style={styles.captureInner}>
              <Camera color={colors.primary} size={30} />
            </View>
          </TouchableOpacity>

          <View style={styles.badgeWrapper}>
            {capturedImages.length > 0 ? (
              <TouchableOpacity
                style={styles.pagesBtn}
                onPress={() => router.push('/records/preview')}
              >
                <Text style={styles.pagesText}>{capturedImages.length} pgs</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 44 }} />
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  permTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  permDesc: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: spacing.lg,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  docFrame: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.white,
  },
  tl: {
    top: -1,
    left: -1,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  tr: {
    top: -1,
    right: -1,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bl: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  br: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  instruction: {
    ...typography.caption,
    color: colors.white,
    marginTop: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 48,
    paddingHorizontal: spacing.xl,
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: radii.full,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrapper: {
    width: 44,
    alignItems: 'center',
  },
  pagesBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  pagesText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '700',
  },
});
