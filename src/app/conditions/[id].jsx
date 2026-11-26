import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Edit2, Plus, Trash2, X } from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { useConditionStore } from '@/features/conditions/condition.store';
import { useRecordStore } from '@/features/records/record.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { RECORD_TYPE_LABELS } from '@/types/common.types';
import { formatDayMonth } from '@/utils/date.utils';
import { radii, spacing, typography } from '@/theme';

export default function ConditionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const palette = useThemePalette();
  const { conditions, updateCondition, deleteCondition } = useConditionStore();
  const { records, loadRecords } = useRecordStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');

  const condition = conditions.find((c) => c.id === id);

  useEffect(() => {
    loadRecords();
    if (condition) {
      setEditName(condition.name);
    }
  }, [id, condition]);

  if (!condition) {
    return (
      <ScreenContainer>
        <Text style={[styles.title, { color: palette.text }]}>Condition Not Found</Text>
        <Button title="Back to Conditions" onPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  const linkedRecords = records.filter((r) => r.conditionId === condition.id);

  const handleDelete = () => {
    Alert.alert(
      'Delete Condition',
      `Deleting "${condition.name}" will not delete any associated medical records. Associated records will simply remain as unlinked records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Condition',
          style: 'destructive',
          onPress: async () => {
            await deleteCondition(condition.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleSaveEdit = async () => {
    if (editName.trim()) {
      await updateCondition(condition.id, editName, condition.color);
      setIsEditModalOpen(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={palette.text} size={28} />
        </TouchableOpacity>
        <View style={styles.topRightBtns}>
          <TouchableOpacity onPress={() => setIsEditModalOpen(true)} style={styles.iconBtn}>
            <Edit2 color={palette.text} size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
            <Trash2 color={palette.alert} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.header}>
        <View style={[styles.colorBar, { backgroundColor: condition.color || palette.primary }]} />
        <Text style={[styles.title, { color: palette.text }]}>{condition.name}</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          {linkedRecords.length} {linkedRecords.length === 1 ? 'record' : 'records'} associated
        </Text>
      </View>

      <View style={styles.recordsSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Associated Records</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/add')}>
            <Text style={{ color: palette.primary, fontWeight: '600' }}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {linkedRecords.length === 0 ? (
          <EmptyState
            title="No Records Yet"
            description="When adding medical records, select this condition to organize them here."
            actionLabel="Add Record"
            onAction={() => router.push('/(tabs)/add')}
          />
        ) : (
          <View style={styles.recordsList}>
            {linkedRecords.map((item) => (
              <Card
                key={item.id}
                onPress={() => router.push(`/records/${item.id}`)}
                style={styles.recordCard}
              >
                <View style={styles.dateCol}>
                  <Text style={[styles.dayMonth, { color: palette.primary }]}>
                    {formatDayMonth(item.date)}
                  </Text>
                </View>
                <View style={styles.recordInfo}>
                  <Text numberOfLines={1} style={[styles.recordTitle, { color: palette.text }]}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} style={[styles.recordMeta, { color: palette.textSecondary }]}>
                    {[item.doctor, item.hospital].filter(Boolean).join(' • ') ||
                      RECORD_TYPE_LABELS[item.type]}
                  </Text>
                  <Badge label={RECORD_TYPE_LABELS[item.type]} tone="primary" />
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* Edit Modal */}
      <Modal visible={isEditModalOpen} animationType="slide">
        <ScreenContainer keyboardAvoiding>
          <View style={styles.topBar}>
            <Text style={[styles.title, { color: palette.text }]}>Edit Condition</Text>
            <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
              <X color={palette.text} size={24} />
            </TouchableOpacity>
          </View>

          <View style={{ gap: spacing.md, marginTop: spacing.md }}>
            <Input label="Condition Name" value={editName} onChangeText={setEditName} />
            <Button title="Save Changes" onPress={handleSaveEdit} />
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
  topRightBtns: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  header: {
    gap: spacing.xs,
    marginVertical: spacing.md,
  },
  colorBar: {
    width: 40,
    height: 6,
    borderRadius: radii.full,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.caption,
  },
  recordsSection: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h3,
  },
  recordsList: {
    gap: spacing.sm,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  dateCol: {
    width: 50,
    alignItems: 'center',
  },
  dayMonth: {
    ...typography.label,
    fontWeight: '700',
  },
  recordInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  recordTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  recordMeta: {
    ...typography.caption,
  },
});
