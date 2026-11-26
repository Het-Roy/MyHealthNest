import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { BloodGroups } from '@/features/profile/profile.validation';
import { useProfileStore } from '@/features/profile/profile.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { StorageService } from '@/services/storage.service';
import { radii, spacing, typography } from '@/theme';

export default function ProfileSetupScreen() {
  const palette = useThemePalette();
  const { saveProfile } = useProfileStore();

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await saveProfile({
        name: name.trim(),
        dob: dob.trim() || null,
        bloodGroup,
        gender: gender.trim(),
      });

      const metadata = await StorageService.getMetadata();
      await StorageService.saveMetadata({
        ...metadata,
        onboardingCompleted: true,
      });

      router.replace('/(tabs)');
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer keyboardAvoiding>
      <View style={styles.header}>
        <Logo size={48} />
        <Text style={[styles.title, { color: palette.text }]}>Create Health Profile</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          Your medical records remain completely private and offline on this device.
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Full Name *"
          placeholder="e.g. Alex Morgan"
          value={name}
          onChangeText={setName}
          error={error}
        />

        <Input
          label="Date of Birth (YYYY-MM-DD)"
          placeholder="1990-05-15"
          value={dob}
          onChangeText={setDob}
        />

        <View style={styles.field}>
          <Text style={[styles.label, { color: palette.text }]}>Blood Group *</Text>
          <View style={styles.bloodGrid}>
            {BloodGroups.map((bg) => {
              const isSelected = bloodGroup === bg;
              return (
                <Pressable
                  key={bg}
                  onPress={() => setBloodGroup(bg)}
                  style={[
                    styles.bloodChip,
                    {
                      backgroundColor: isSelected
                        ? palette.primary
                        : palette.card,
                      borderColor: isSelected
                        ? palette.primary
                        : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.bloodText,
                      { color: isSelected ? palette.white : palette.text },
                    ]}
                  >
                    {bg}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Input
          label="Gender (Optional)"
          placeholder="e.g. Female, Male, Non-binary"
          value={gender}
          onChangeText={setGender}
        />

        <Button
          title="Complete Setup"
          loading={loading}
          onPress={handleSave}
          style={styles.saveButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.xs,
  },
  title: {
    ...typography.h2,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  form: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bloodChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    minWidth: 54,
    alignItems: 'center',
  },
  bloodText: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
