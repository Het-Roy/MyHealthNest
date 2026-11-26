import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Plus, X } from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMedicineStore } from '@/features/medicines/medicine.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { toISODate } from '@/utils/date.utils';
import { radii, spacing, typography } from '@/theme';

const COMMON_FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'As needed',
  'Weekly',
];

const PRESET_TIMES = ['08:00', '13:00', '18:00', '21:00'];

export default function AddMedicineScreen() {
  const palette = useThemePalette();
  const { addMedicine, isLoading } = useMedicineStore();

  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [selectedTimes, setSelectedTimes] = useState(['08:00']);
  const [startDate, setStartDate] = useState(toISODate());
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const toggleTimePreset = (time) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter((t) => t !== time));
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Medicine name is required.');
      return;
    }
    if (!dose.trim()) {
      setError('Dose is required (e.g. 500mg, 1 tablet).');
      return;
    }
    setError('');

    try {
      await addMedicine({
        name,
        dose,
        frequency,
        times: selectedTimes,
        startDate,
        endDate: endDate.trim() || null,
      });

      router.back();
    } catch (err) {
      setError(err.message || 'Failed to save medicine.');
    }
  };

  return (
    <ScreenContainer keyboardAvoiding>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={palette.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette.text }]}>Add Medicine</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.form}>
        <Input
          label="Medicine Name *"
          placeholder="e.g. Metformin, Amoxicillin, Vitamin D"
          value={name}
          onChangeText={setName}
          error={error}
        />

        <Input
          label="Dose / Strength *"
          placeholder="e.g. 500 mg, 1 capsule, 10 ml"
          value={dose}
          onChangeText={setDose}
        />

        {/* Frequency */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: palette.text }]}>Frequency</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {COMMON_FREQUENCIES.map((freq) => (
              <TouchableOpacity
                key={freq}
                onPress={() => setFrequency(freq)}
                style={[
                  styles.choiceChip,
                  {
                    backgroundColor: frequency === freq ? palette.primary : palette.card,
                    borderColor: palette.border,
                  },
                ]}
              >
                <Text style={{ color: frequency === freq ? palette.white : palette.text }}>
                  {freq}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reminder Times */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: palette.text }]}>Reminder Times</Text>
          <View style={styles.chipsRow}>
            {PRESET_TIMES.map((time) => {
              const isSelected = selectedTimes.includes(time);
              return (
                <TouchableOpacity
                  key={time}
                  onPress={() => toggleTimePreset(time)}
                  style={[
                    styles.choiceChip,
                    {
                      backgroundColor: isSelected ? palette.primary : palette.card,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text style={{ color: isSelected ? palette.white : palette.text }}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.helper, { color: palette.textMuted }]}>
            Notifications will sound daily at selected times.
          </Text>
        </View>

        <Input
          label="Start Date (YYYY-MM-DD)"
          value={startDate}
          onChangeText={setStartDate}
        />

        <Input
          label="End Date (Optional)"
          placeholder="YYYY-MM-DD (leave empty if ongoing)"
          value={endDate}
          onChangeText={setEndDate}
        />

        <Button
          title="Save Schedule"
          loading={isLoading}
          onPress={handleSave}
          style={styles.saveBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  choiceChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  helper: {
    ...typography.small,
    marginTop: spacing.xs,
  },
  saveBtn: {
    marginTop: spacing.md,
  },
});
