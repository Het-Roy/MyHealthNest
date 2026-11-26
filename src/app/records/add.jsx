import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useRecordStore } from '@/features/records/record.store';
import { useConditionStore } from '@/features/conditions/condition.store';
import { useAppStore } from '@/store/app.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { RECORD_TYPE_LABELS, RECORD_TYPES } from '@/types/common.types';
import { toISODate } from '@/utils/date.utils';
import { radii, spacing, typography } from '@/theme';

export default function AddRecordFormScreen() {
  const palette = useThemePalette();
  const { capturedImages, addRecord, isLoading } = useRecordStore();
  const { conditions, loadConditions } = useConditionStore();
  const { metadata } = useAppStore();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('prescription');
  const [date, setDate] = useState(toISODate());
  const [doctor, setDoctor] = useState('');
  const [hospital, setHospital] = useState('');
  const [conditionId, setConditionId] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadConditions();
    if (metadata.lastConditionId) {
      setConditionId(metadata.lastConditionId);
    }
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please provide a record title.');
      return;
    }
    if (capturedImages.length === 0) {
      setError('At least one document image is required.');
      return;
    }
    setError('');

    try {
      const created = await addRecord({
        title,
        type,
        date,
        doctor,
        hospital,
        conditionId,
        notes,
        images: capturedImages,
      });

      router.replace(`/(tabs)/timeline`);
    } catch (err) {
      setError(err.message || 'Failed to save record.');
    }
  };

  return (
    <ScreenContainer keyboardAvoiding>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>Record Information</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          {capturedImages.length} {capturedImages.length === 1 ? 'page' : 'pages'} attached
        </Text>
      </View>

      {/* Thumbnails row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbScroll}>
        {capturedImages.map((uri, idx) => (
          <Image key={idx} source={{ uri }} style={styles.thumb} />
        ))}
      </ScrollView>

      <View style={styles.form}>
        <Input
          label="Title *"
          placeholder="e.g. Blood Sugar Report, Dr. Smith Prescription"
          value={title}
          onChangeText={setTitle}
          error={error}
        />

        {/* Record Type Picker */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: palette.text }]}>Record Type *</Text>
          <View style={styles.typeGrid}>
            {RECORD_TYPES.map((t) => {
              const isSelected = type === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  style={[
                    styles.typeChip,
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
                      styles.typeText,
                      { color: isSelected ? palette.white : palette.text },
                    ]}
                  >
                    {RECORD_TYPE_LABELS[t]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Input
          label="Date (YYYY-MM-DD) *"
          placeholder="2026-11-26"
          value={date}
          onChangeText={setDate}
        />

        {/* Doctor field + suggestions */}
        <View style={styles.field}>
          <Input
            label="Doctor Name"
            placeholder="e.g. Dr. John Doe"
            value={doctor}
            onChangeText={setDoctor}
          />
          {metadata.recentDoctors?.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionRow}>
              {metadata.recentDoctors.map((doc) => (
                <TouchableOpacity
                  key={doc}
                  onPress={() => setDoctor(doc)}
                  style={[styles.suggestionChip, { backgroundColor: palette.surface }]}
                >
                  <Text style={[styles.suggestionText, { color: palette.textSecondary }]}>
                    {doc}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}
        </View>

        {/* Hospital field + suggestions */}
        <View style={styles.field}>
          <Input
            label="Hospital / Clinic"
            placeholder="e.g. Apollo Hospital"
            value={hospital}
            onChangeText={setHospital}
          />
          {metadata.recentHospitals?.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionRow}>
              {metadata.recentHospitals.map((hosp) => (
                <TouchableOpacity
                  key={hosp}
                  onPress={() => setHospital(hosp)}
                  style={[styles.suggestionChip, { backgroundColor: palette.surface }]}
                >
                  <Text style={[styles.suggestionText, { color: palette.textSecondary }]}>
                    {hosp}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}
        </View>

        {/* Condition Selector */}
        {conditions.length > 0 ? (
          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.text }]}>Linked Condition</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionRow}>
              <TouchableOpacity
                onPress={() => setConditionId(null)}
                style={[
                  styles.suggestionChip,
                  {
                    backgroundColor: conditionId === null ? palette.primary : palette.card,
                    borderColor: palette.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text style={{ color: conditionId === null ? palette.white : palette.text }}>
                  None
                </Text>
              </TouchableOpacity>
              {conditions.map((c) => {
                const isSelected = conditionId === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setConditionId(c.id)}
                    style={[
                      styles.suggestionChip,
                      {
                        backgroundColor: isSelected ? palette.primary : palette.card,
                        borderColor: palette.border,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text style={{ color: isSelected ? palette.white : palette.text }}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        <Input
          label="Notes (Optional)"
          placeholder="Prescription dosage notes, test conclusions..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80 }}
        />

        <Button
          title="Save Record"
          loading={isLoading}
          onPress={handleSave}
          style={styles.saveBtn}
        />
      </View>
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
  thumbScroll: {
    marginBottom: spacing.md,
  },
  thumb: {
    width: 64,
    height: 84,
    borderRadius: radii.sm,
    marginRight: spacing.sm,
  },
  form: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  typeChip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  typeText: {
    ...typography.small,
    fontWeight: '600',
  },
  suggestionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    marginRight: spacing.xs,
  },
  suggestionText: {
    ...typography.small,
  },
  saveBtn: {
    marginTop: spacing.md,
  },
});
