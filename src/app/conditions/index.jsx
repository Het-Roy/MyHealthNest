import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, FolderHeart, Plus, X } from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import {
  CONDITION_COLORS,
  useConditionStore,
} from '@/features/conditions/condition.store';
import { useRecordStore } from '@/features/records/record.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { formatDisplayDate } from '@/utils/date.utils';
import { radii, spacing, typography } from '@/theme';

export default function ConditionsIndexScreen() {
  const palette = useThemePalette();
  const { conditions, loadConditions, createCondition } = useConditionStore();
  const { records, loadRecords } = useRecordStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCondName, setNewCondName] = useState('');
  const [newCondColor, setNewCondColor] = useState(CONDITION_COLORS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConditions();
    loadRecords();
  }, []);

  const handleCreate = async () => {
    if (!newCondName.trim()) {
      setError('Condition name is required.');
      return;
    }
    setError('');
    await createCondition(newCondName, newCondColor);
    setNewCondName('');
    setIsAddModalOpen(false);
  };

  return (
    <ScreenContainer>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={palette.text} size={28} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsAddModalOpen(true)}
          style={[styles.addBtn, { backgroundColor: palette.primary }]}
        >
          <Plus color={palette.white} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>Medical Conditions</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          Group your reports and prescriptions by diagnosis
        </Text>
      </View>

      {conditions.length === 0 ? (
        <EmptyState
          icon={<FolderHeart color={palette.primary} size={48} />}
          title="No Conditions Added"
          description="Track chronic conditions like Diabetes, Hypertension, or Thyroid."
          actionLabel="Add Condition"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <View style={styles.conditionList}>
          {conditions.map((cond) => {
            const linked = records.filter((r) => r.conditionId === cond.id);
            const latestRecord = linked.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0];

            return (
              <Card
                key={cond.id}
                onPress={() => router.push(`/conditions/${cond.id}`)}
                style={styles.condCard}
              >
                <View
                  style={[
                    styles.colorPill,
                    { backgroundColor: cond.color || palette.primary },
                  ]}
                />
                <View style={styles.condInfo}>
                  <Text style={[styles.condName, { color: palette.text }]}>
                    {cond.name}
                  </Text>
                  <Text style={[styles.condMeta, { color: palette.textSecondary }]}>
                    {linked.length} {linked.length === 1 ? 'record' : 'records'}
                    {latestRecord ? ` • Last updated ${formatDisplayDate(latestRecord.date)}` : ''}
                  </Text>
                </View>
                <ChevronRight color={palette.textMuted} size={20} />
              </Card>
            );
          })}
        </View>
      )}

      {/* Add Condition Modal */}
      <Modal visible={isAddModalOpen} animationType="slide">
        <ScreenContainer keyboardAvoiding>
          <View style={styles.modalHeader}>
            <Text style={[styles.title, { color: palette.text }]}>New Condition</Text>
            <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
              <X color={palette.text} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Input
              label="Condition Name *"
              placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
              value={newCondName}
              onChangeText={setNewCondName}
              error={error}
            />

            <View style={styles.colorSection}>
              <Text style={[styles.label, { color: palette.text }]}>Accent Color</Text>
              <View style={styles.colorRow}>
                {CONDITION_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setNewCondColor(c)}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      newCondColor === c ? styles.colorDotSelected : null,
                    ]}
                  />
                ))}
              </View>
            </View>

            <Button title="Save Condition" onPress={handleCreate} style={{ marginTop: spacing.md }} />
          </View>
        </ScreenContainer>
      </Modal>
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
    marginVertical: spacing.sm,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.caption,
  },
  conditionList: {
    gap: spacing.md,
    marginTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  condCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  colorPill: {
    width: 10,
    height: 44,
    borderRadius: radii.full,
  },
  condInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  condName: {
    ...typography.h3,
  },
  condMeta: {
    ...typography.caption,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  modalBody: {
    gap: spacing.md,
  },
  colorSection: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#0B2A3C',
  },
});
