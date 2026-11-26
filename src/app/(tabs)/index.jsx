import React, { useEffect } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  Activity,
  AlertCircle,
  Bell,
  Camera,
  ChevronRight,
  Pill,
  Plus,
  Shield,
  Stethoscope,
  User,
} from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { AuthService } from '@/services/auth.service';
import { useProfileStore } from '@/features/profile/profile.store';
import { useRecordStore } from '@/features/records/record.store';
import { useMedicineStore } from '@/features/medicines/medicine.store';
import { useConditionStore } from '@/features/conditions/condition.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { RECORD_TYPE_LABELS } from '@/types/common.types';
import { calculateAge, formatDisplayDate } from '@/utils/date.utils';
import { radii, shadows, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const palette = useThemePalette();
  const { profile, allergies, loadProfile } = useProfileStore();
  const { records, loadRecords } = useRecordStore();
  const { medicines, loadMedicines } = useMedicineStore();
  const { conditions, loadConditions } = useConditionStore();

  useEffect(() => {
    loadProfile();
    loadRecords();
    loadMedicines();
    loadConditions();
  }, []);

  const handleEnterDoctorMode = async () => {
    try {
      const result = await AuthService.authenticateUser('Authorize Doctor Mode Access');
      if (result.success) {
        router.push('/doctor-mode');
      } else {
        Alert.alert('Access Denied', 'Authentication is required to enter Doctor Mode.');
      }
    } catch {
      Alert.alert('Authentication Error', 'Could not verify biometric authorization.');
    }
  };

  const age = calculateAge(profile?.dob);
  const activeMeds = medicines.filter((m) => m.active);
  const recentRecords = [...records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <ScreenContainer>
      {/* 1. Greeting & Profile Summary */}
      <View style={styles.header}>
        <View style={styles.greetingSection}>
          <Text style={[styles.greeting, { color: palette.textSecondary }]}>
            Good day,
          </Text>
          <Text style={[styles.patientName, { color: palette.text }]}>
            {profile?.name || 'My Health Vault'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          style={[styles.profileAvatar, { backgroundColor: palette.surfaceSecondary }]}
        >
          <User color={palette.primary} size={22} />
        </TouchableOpacity>
      </View>

      {/* Profile quick stats pill */}
      <Card style={styles.profileSummaryCard}>
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>Blood</Text>
            <Text style={[styles.statValue, { color: palette.primary }]}>
              {profile?.bloodGroup || 'N/A'}
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: palette.border }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>Age</Text>
            <Text style={[styles.statValue, { color: palette.text }]}>
              {age !== null ? `${age}y` : 'N/A'}
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: palette.border }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>Allergies</Text>
            <Text
              style={[
                styles.statValue,
                { color: allergies.length > 0 ? palette.alert : palette.text },
              ]}
            >
              {allergies.length}
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: palette.border }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>Active Rx</Text>
            <Text style={[styles.statValue, { color: palette.text }]}>
              {activeMeds.length}
            </Text>
          </View>
        </View>
      </Card>

      {/* 3. PROMINENT DOCTOR MODE BUTTON */}
      <TouchableOpacity
        onPress={handleEnterDoctorMode}
        style={[styles.doctorModeBtn, { backgroundColor: palette.primary }]}
      >
        <View style={styles.doctorBtnLeft}>
          <View style={styles.stethIcon}>
            <Stethoscope color={palette.white} size={28} />
          </View>
          <View>
            <Text style={styles.doctorBtnTitle}>ENTER DOCTOR MODE</Text>
            <Text style={styles.doctorBtnSub}>
              Read-only clinical summary for consultations
            </Text>
          </View>
        </View>
        <ChevronRight color={palette.white} size={22} />
      </TouchableOpacity>

      {/* 6. Quick Actions Row */}
      <View style={styles.quickActionsSection}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/add')}
            style={[styles.actionCard, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: palette.surfaceSecondary }]}>
              <Camera color={palette.primary} size={22} />
            </View>
            <Text style={[styles.actionLabel, { color: palette.text }]}>Scan Record</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/medicines/add')}
            style={[styles.actionCard, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: palette.surfaceSecondary }]}>
              <Pill color={palette.primary} size={22} />
            </View>
            <Text style={[styles.actionLabel, { color: palette.text }]}>Add Medicine</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/emergency-card')}
            style={[styles.actionCard, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: palette.alertSurface }]}>
              <AlertCircle color={palette.alert} size={22} />
            </View>
            <Text style={[styles.actionLabel, { color: palette.text }]}>Emergency Card</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Active Medicines Preview */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>
          Daily Medicines ({activeMeds.length})
        </Text>
        <TouchableOpacity onPress={() => router.push('/medicines')}>
          <Text style={{ color: palette.primary, fontWeight: '600' }}>View All</Text>
        </TouchableOpacity>
      </View>

      {activeMeds.length === 0 ? (
        <Card style={styles.emptyMiniCard}>
          <Text style={[styles.emptyMiniText, { color: palette.textSecondary }]}>
            No active medicine schedules. Tap "+ Add Medicine" above to create dosage reminders.
          </Text>
        </Card>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {activeMeds.map((med) => (
            <Card key={med.id} style={styles.medMiniCard}>
              <Text style={[styles.medMiniName, { color: palette.text }]}>{med.name}</Text>
              <Text style={[styles.medMiniDose, { color: palette.primary }]}>{med.dose}</Text>
              <Text style={[styles.medMiniTimes, { color: palette.textSecondary }]}>
                {med.times?.join(', ') || med.frequency}
              </Text>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* 5. Recent Medical Records */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Recent Records</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/timeline')}>
          <Text style={{ color: palette.primary, fontWeight: '600' }}>Timeline</Text>
        </TouchableOpacity>
      </View>

      {recentRecords.length === 0 ? (
        <EmptyState
          icon={<Activity color={palette.primary} size={42} />}
          title="Vault is Empty"
          description="Scan prescriptions, lab reports, and imaging documents to build your timeline."
          actionLabel="Scan Document"
          onAction={() => router.push('/(tabs)/add')}
        />
      ) : (
        <View style={styles.recentList}>
          {recentRecords.map((r) => (
            <Card
              key={r.id}
              onPress={() => router.push(`/records/${r.id}`)}
              style={styles.recentCard}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.recentTitle, { color: palette.text }]}>{r.title}</Text>
                <Text style={[styles.recentMeta, { color: palette.textSecondary }]}>
                  {formatDisplayDate(r.date)} • {RECORD_TYPE_LABELS[r.type]}
                </Text>
              </View>
              {r.images?.[0] ? (
                <Image source={{ uri: r.images[0] }} style={styles.recentThumb} />
              ) : null}
            </Card>
          ))}
        </View>
      )}

      <View style={{ height: spacing.xxl }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  greetingSection: {
    gap: 2,
  },
  greeting: {
    ...typography.caption,
  },
  patientName: {
    ...typography.h1,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSummaryCard: {
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statCol: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    ...typography.small,
  },
  statValue: {
    ...typography.h3,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  doctorModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginVertical: spacing.md,
    ...shadows.md,
  },
  doctorBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  stethIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorBtnTitle: {
    ...typography.h3,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  doctorBtnSub: {
    ...typography.small,
    color: 'rgba(255,255,255,0.85)',
  },
  quickActionsSection: {
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    ...typography.small,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyMiniCard: {
    padding: spacing.md,
  },
  emptyMiniText: {
    ...typography.caption,
  },
  horizontalScroll: {
    marginVertical: spacing.xs,
  },
  medMiniCard: {
    width: 150,
    padding: spacing.md,
    marginRight: spacing.sm,
    gap: 2,
  },
  medMiniName: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  medMiniDose: {
    ...typography.small,
    fontWeight: '600',
  },
  medMiniTimes: {
    ...typography.small,
  },
  recentList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  recentTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  recentMeta: {
    ...typography.caption,
  },
  recentThumb: {
    width: 48,
    height: 56,
    borderRadius: radii.sm,
  },
});
