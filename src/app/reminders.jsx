import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  Bell,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Plus,
  Trash2,
  X,
} from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { NotificationService } from '@/services/notification.service';
import { StorageService } from '@/services/storage.service';
import { useThemePalette } from '@/hooks/useThemePalette';
import { formatDisplayDate } from '@/utils/date.utils';
import { generateId } from '@/utils/id.utils';
import { radii, spacing, typography } from '@/theme';

export default function RemindersScreen() {
  const palette = useThemePalette();
  const [reminders, setReminders] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('follow-up');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    const list = await StorageService.getReminders();
    setReminders(list);
  };

  const handleAdd = async () => {
    if (!title.trim() || !date.trim()) return;

    // Schedule notification
    const nid = await NotificationService.scheduleFollowUpReminder(title, date);

    const newReminder = {
      id: generateId('rem'),
      title: title.trim(),
      date: date.trim(),
      type,
      notificationId: nid || null,
      active: true,
    };

    const updated = [newReminder, ...reminders];
    setReminders(updated);
    await StorageService.saveReminders(updated);

    setTitle('');
    setDate('');
    setIsAddModalOpen(false);
  };

  const handleDelete = async (id, notificationId) => {
    if (notificationId) {
      await NotificationService.cancelNotification(notificationId);
    }
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    await StorageService.saveReminders(updated);
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
        <Text style={[styles.title, { color: palette.text }]}>Medical Reminders</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          Doctor appointments, annual check-ups, and lab test schedules
        </Text>
      </View>

      {reminders.length === 0 ? (
        <EmptyState
          icon={<Bell color={palette.primary} size={48} />}
          title="No Scheduled Reminders"
          description="Create follow-up reminders for doctor appointments or recurring lab tests."
          actionLabel="Add Reminder"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <View style={styles.list}>
          {reminders.map((rem) => (
            <Card key={rem.id} style={styles.reminderCard}>
              <View style={styles.remInfo}>
                <View style={styles.typeRow}>
                  <Badge
                    label={rem.type.toUpperCase()}
                    tone={rem.type === 'follow-up' ? 'primary' : 'neutral'}
                  />
                  <Text style={[styles.dateText, { color: palette.primary }]}>
                    {formatDisplayDate(rem.date)}
                  </Text>
                </View>
                <Text style={[styles.remTitle, { color: palette.text }]}>
                  {rem.title}
                </Text>
              </View>

              <TouchableOpacity onPress={() => handleDelete(rem.id, rem.notificationId)}>
                <Trash2 color={palette.alert} size={18} />
              </TouchableOpacity>
            </Card>
          ))}
        </View>
      )}

      {/* Add Reminder Modal */}
      <Modal visible={isAddModalOpen} animationType="slide">
        <ScreenContainer keyboardAvoiding>
          <View style={styles.topBar}>
            <Text style={[styles.title, { color: palette.text }]}>New Reminder</Text>
            <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
              <X color={palette.text} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Input
              label="Reminder Title *"
              placeholder="e.g. Dr. Patel Checkup, Annual Blood Test"
              value={title}
              onChangeText={setTitle}
            />

            <Input
              label="Date (YYYY-MM-DD) *"
              placeholder="2026-12-15"
              value={date}
              onChangeText={setDate}
            />

            <View style={styles.field}>
              <Text style={[styles.label, { color: palette.text }]}>Type</Text>
              <View style={styles.typeRow}>
                {['follow-up', 'report', 'vaccination'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setType(t)}
                    style={[
                      styles.choiceChip,
                      {
                        backgroundColor: type === t ? palette.primary : palette.card,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text style={{ color: type === t ? palette.white : palette.text }}>
                      {t.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button title="Schedule Reminder" onPress={handleAdd} style={{ marginTop: spacing.md }} />
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
    marginVertical: spacing.md,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.caption,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  reminderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  remInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    ...typography.label,
    fontWeight: '600',
  },
  remTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  choiceChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
});
