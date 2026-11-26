import React, { useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  Clock,
  Pill,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMedicineStore } from '@/features/medicines/medicine.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { radii, spacing, typography } from '@/theme';

export default function MedicinesScreen() {
  const palette = useThemePalette();
  const { medicines, loadMedicines, toggleActive, deleteMedicine } = useMedicineStore();

  useEffect(() => {
    loadMedicines();
  }, []);

  const activeMeds = medicines.filter((m) => m.active);
  const inactiveMeds = medicines.filter((m) => !m.active);

  const handleDelete = (id, name) => {
    Alert.alert('Delete Medicine', `Remove ${name} and cancel all reminders?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMedicine(id),
      },
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={palette.text} size={28} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/medicines/add')}
          style={[styles.addBtn, { backgroundColor: palette.primary }]}
        >
          <Plus color={palette.white} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>Medication Schedules</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          Track your daily doses and automated reminders
        </Text>
      </View>

      {medicines.length === 0 ? (
        <EmptyState
          icon={<Pill color={palette.primary} size={48} />}
          title="No Medicines Added"
          description="Add your daily prescriptions to receive privacy-safe dosage reminders."
          actionLabel="Add Medicine"
          onAction={() => router.push('/medicines/add')}
        />
      ) : (
        <View style={styles.content}>
          {/* Active Medicines */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              Active Prescriptions ({activeMeds.length})
            </Text>
            {activeMeds.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                  No currently active medications.
                </Text>
              </Card>
            ) : (
              activeMeds.map((med) => (
                <Card key={med.id} style={styles.medCard}>
                  <View style={styles.medHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.medName, { color: palette.text }]}>{med.name}</Text>
                      <Text style={[styles.medDose, { color: palette.textSecondary }]}>
                        {med.dose} • {med.frequency}
                      </Text>
                    </View>
                    <Switch
                      value={med.active}
                      onValueChange={() => toggleActive(med.id)}
                      trackColor={{ false: palette.disabled, true: palette.primary }}
                    />
                  </View>

                  {med.times?.length > 0 ? (
                    <View style={styles.timesRow}>
                      <Clock color={palette.primary} size={16} />
                      <Text style={[styles.timesText, { color: palette.primary }]}>
                        Reminder times: {med.times.join(', ')}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.cardActions}>
                    <Badge label="ACTIVE" tone="primary" />
                    <TouchableOpacity onPress={() => handleDelete(med.id, med.name)}>
                      <Trash2 color={palette.alert} size={18} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </View>

          {/* Inactive Medicines */}
          {inactiveMeds.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: palette.textMuted }]}>
                Past / Completed ({inactiveMeds.length})
              </Text>
              {inactiveMeds.map((med) => (
                <Card key={med.id} style={[styles.medCard, { opacity: 0.8 }]}>
                  <View style={styles.medHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.medName, { color: palette.text }]}>{med.name}</Text>
                      <Text style={[styles.medDose, { color: palette.textSecondary }]}>
                        {med.dose} • {med.frequency}
                      </Text>
                    </View>
                    <Switch
                      value={med.active}
                      onValueChange={() => toggleActive(med.id)}
                      trackColor={{ false: palette.disabled, true: palette.primary }}
                    />
                  </View>
                  <View style={styles.cardActions}>
                    <Badge label="INACTIVE" tone="neutral" />
                    <TouchableOpacity onPress={() => handleDelete(med.id, med.name)}>
                      <Trash2 color={palette.alert} size={18} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          ) : null}
        </View>
      )}
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    gap: spacing.xs,
    marginVertical: spacing.md,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.caption,
  },
  content: {
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
  },
  emptyCard: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.caption,
  },
  medCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medName: {
    ...typography.h3,
  },
  medDose: {
    ...typography.caption,
  },
  timesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timesText: {
    ...typography.small,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
