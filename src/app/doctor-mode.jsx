import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  Activity,
  AlertTriangle,
  FolderHeart,
  LogOut,
  Phone,
  Pill,
  ShieldAlert,
  User,
  X,
} from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useProfileStore } from '@/features/profile/profile.store';
import { useConditionStore } from '@/features/conditions/condition.store';
import { useRecordStore } from '@/features/records/record.store';
import { useMedicineStore } from '@/features/medicines/medicine.store';
import { useContactsStore } from '@/features/emergency-contacts/contacts.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { RECORD_TYPE_LABELS } from '@/types/common.types';
import { calculateAge, formatDisplayDate } from '@/utils/date.utils';
import { radii, spacing, typography } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DoctorModeScreen() {
  const palette = useThemePalette();
  const { setDoctorMode } = useAuthStore();
  const { profile, allergies, loadProfile } = useProfileStore();
  const { conditions, loadConditions } = useConditionStore();
  const { records, loadRecords } = useRecordStore();
  const { medicines, loadMedicines } = useMedicineStore();
  const { contacts, loadContacts } = useContactsStore();

  const [selectedConditionId, setSelectedConditionId] = useState('all');
  const [viewerImageUri, setViewerImageUri] = useState(null);

  useEffect(() => {
    setDoctorMode(true);
    loadProfile();
    loadConditions();
    loadRecords();
    loadMedicines();
    loadContacts();

    // Prevent Android hardware back from casually exiting Doctor Mode
    const backAction = () => {
      handleExitDoctorMode();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      backHandler.remove();
      setDoctorMode(false);
    };
  }, []);

  const handleExitDoctorMode = async () => {
    try {
      const result = await AuthService.authenticateUser('Authenticate to exit Doctor Mode');
      if (result.success) {
        setDoctorMode(false);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Authentication Failed', 'Cannot exit Doctor Mode without authentication.');
      }
    } catch {
      Alert.alert('Authentication Required', 'Please authenticate to return to the application.');
    }
  };

  const age = calculateAge(profile?.dob);

  // Active medicines only
  const activeMedicines = useMemo(() => {
    return medicines.filter((m) => m.active);
  }, [medicines]);

  // Primary Emergency Contact
  const primaryContact = useMemo(() => {
    return contacts.find((c) => c.isPrimary) || contacts[0] || null;
  }, [contacts]);

  // 5 Most recent medical records (optionally filtered by condition)
  const recentRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (selectedConditionId === 'all') return true;
        return r.conditionId === selectedConditionId;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [records, selectedConditionId]);

  return (
    <ScreenContainer>
      {/* Read-Only Top Status Banner */}
      <View style={[styles.doctorBanner, { backgroundColor: palette.primary }]}>
        <View style={styles.bannerInfo}>
          <Text style={styles.bannerTitle}>DOCTOR MODE • READ ONLY</Text>
          <Text style={styles.bannerSubtitle}>Confidential Patient Clinical Summary</Text>
        </View>
        <TouchableOpacity
          onPress={handleExitDoctorMode}
          style={styles.exitBtn}
          accessibilityLabel="Exit Doctor Mode"
        >
          <LogOut color={palette.white} size={20} />
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
      </View>

      {/* SECTION 1: Patient Header */}
      <Card style={styles.patientCard}>
        <Text style={[styles.headerSectionLabel, { color: palette.textMuted }]}>
          SECTION 1 • PATIENT HEADER
        </Text>
        <Text style={[styles.patientName, { color: palette.text }]}>
          {profile?.name || 'Patient'}
        </Text>
        <View style={styles.patientStatsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>AGE</Text>
            <Text style={[styles.statValue, { color: palette.text }]}>
              {age !== null ? `${age} YRS` : 'N/A'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>GENDER</Text>
            <Text style={[styles.statValue, { color: palette.text }]}>
              {profile?.gender ? profile.gender.toUpperCase() : 'N/A'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>BLOOD GROUP</Text>
            <Text style={[styles.statValue, { color: palette.primary }]}>
              {profile?.bloodGroup || 'N/A'}
            </Text>
          </View>
        </View>
      </Card>

      {/* SECTION 2: Allergies (CRITICAL VISUAL PROMINENCE) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <ShieldAlert color={palette.alert} size={22} />
          <Text style={[styles.sectionTitle, { color: palette.alert }]}>
            SECTION 2 • ALLERGIES & ADVERSE REACTIONS ({allergies.length})
          </Text>
        </View>

        {allergies.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              NO KNOWN DRUG OR FOOD ALLERGIES RECORDED.
            </Text>
          </Card>
        ) : (
          <View style={styles.listGap}>
            {allergies.map((alg) => {
              const isSevere = alg.severity === 'severe';
              return (
                <Card
                  key={alg.id}
                  variant={isSevere ? 'alert' : 'default'}
                  style={styles.allergyCard}
                >
                  <View style={styles.allergyHeader}>
                    <Text
                      style={[
                        styles.allergyName,
                        { color: isSevere ? palette.alert : palette.text },
                      ]}
                    >
                      {alg.name}
                    </Text>
                    <Badge
                      label={alg.severity.toUpperCase()}
                      tone={isSevere ? 'alert' : 'neutral'}
                    />
                  </View>
                  <Text style={[styles.allergyMeta, { color: palette.textSecondary }]}>
                    Category: {alg.category.toUpperCase()}
                    {alg.notes ? ` • Reaction: ${alg.notes}` : ''}
                  </Text>
                </Card>
              );
            })}
          </View>
        )}
      </View>

      {/* SECTION 3: Current Medicines (Active only) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Pill color={palette.primary} size={20} />
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            SECTION 3 • CURRENT ACTIVE MEDICATIONS ({activeMedicines.length})
          </Text>
        </View>

        {activeMedicines.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              NO CURRENT ACTIVE MEDICATIONS ON FILE.
            </Text>
          </Card>
        ) : (
          <View style={styles.listGap}>
            {activeMedicines.map((med) => (
              <Card key={med.id} style={styles.medCard}>
                <Text style={[styles.medName, { color: palette.text }]}>{med.name}</Text>
                <Text style={[styles.medDose, { color: palette.primary }]}>
                  Dose: {med.dose} • Frequency: {med.frequency}
                </Text>
                {med.times?.length > 0 ? (
                  <Text style={[styles.medTimes, { color: palette.textSecondary }]}>
                    Schedule: {med.times.join(', ')}
                  </Text>
                ) : null}
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* SECTION 4: Chronic Conditions */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <FolderHeart color={palette.primary} size={20} />
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            SECTION 4 • CHRONIC CONDITIONS ({conditions.length})
          </Text>
        </View>

        {conditions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              NO CHRONIC CONDITIONS RECORDED.
            </Text>
          </Card>
        ) : (
          <View style={styles.conditionsRow}>
            {conditions.map((c) => (
              <View
                key={c.id}
                style={[
                  styles.conditionBadge,
                  { backgroundColor: palette.surfaceSecondary, borderColor: palette.border },
                ]}
              >
                <Text style={[styles.conditionText, { color: palette.text }]}>
                  {c.name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* SECTION 5: Recent Medical Reports (5 recent) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Activity color={palette.primary} size={20} />
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            SECTION 5 • RECENT MEDICAL REPORTS (5 MOST RECENT)
          </Text>
        </View>

        {/* Condition Filter for Doctor */}
        {conditions.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorFilterScroll}>
            <TouchableOpacity
              onPress={() => setSelectedConditionId('all')}
              style={[
                styles.doctorFilterChip,
                {
                  backgroundColor: selectedConditionId === 'all' ? palette.primary : palette.card,
                },
              ]}
            >
              <Text style={{ color: selectedConditionId === 'all' ? palette.white : palette.text }}>
                All Records
              </Text>
            </TouchableOpacity>
            {conditions.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedConditionId(c.id)}
                style={[
                  styles.doctorFilterChip,
                  {
                    backgroundColor: selectedConditionId === c.id ? palette.primary : palette.card,
                  },
                ]}
              >
                <Text style={{ color: selectedConditionId === c.id ? palette.white : palette.text }}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        {recentRecords.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              NO RECENT REPORTS FOUND.
            </Text>
          </Card>
        ) : (
          <View style={styles.listGap}>
            {recentRecords.map((r) => (
              <Card key={r.id} style={styles.reportCard}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.reportTitle, { color: palette.text }]}>{r.title}</Text>
                  <Text style={[styles.reportDate, { color: palette.textSecondary }]}>
                    {formatDisplayDate(r.date)} • {RECORD_TYPE_LABELS[r.type]}
                  </Text>
                  {r.doctor ? (
                    <Text style={[styles.reportDoctor, { color: palette.textMuted }]}>
                      Attending: {r.doctor} {r.hospital ? `(${r.hospital})` : ''}
                    </Text>
                  ) : null}
                </View>

                {r.images?.[0] ? (
                  <TouchableOpacity onPress={() => setViewerImageUri(r.images[0])}>
                    <Image
                      source={{ uri: r.images[0] }}
                      style={styles.reportThumb}
                      resizeMode="cover"
                    />
                    <Text style={[styles.thumbHint, { color: palette.primary }]}>Inspect</Text>
                  </TouchableOpacity>
                ) : null}
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* SECTION 6: Emergency Contact */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Phone color={palette.primary} size={20} />
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            SECTION 6 • PRIMARY EMERGENCY CONTACT
          </Text>
        </View>

        {primaryContact ? (
          <Card style={styles.contactCard}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.contactName, { color: palette.text }]}>
                {primaryContact.name} ({primaryContact.relationship})
              </Text>
              <Text style={[styles.contactPhone, { color: palette.textSecondary }]}>
                {primaryContact.phone}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${primaryContact.phone}`)}
              style={[styles.callBtn, { backgroundColor: palette.primary }]}
            >
              <Phone color={palette.white} size={18} />
              <Text style={styles.callText}>Call</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              NO PRIMARY CONTACT REGISTERED.
            </Text>
          </Card>
        )}
      </View>

      {/* Full-Screen Image Viewer for Doctor */}
      <Modal visible={Boolean(viewerImageUri)} transparent animationType="fade">
        <View style={styles.viewerModal}>
          <TouchableOpacity
            style={styles.closeViewer}
            onPress={() => setViewerImageUri(null)}
          >
            <X color="#fff" size={28} />
          </TouchableOpacity>
          {viewerImageUri ? (
            <Image
              source={{ uri: viewerImageUri }}
              style={styles.fullViewerImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  doctorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  bannerInfo: {
    gap: 2,
  },
  bannerTitle: {
    ...typography.label,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 1,
  },
  bannerSubtitle: {
    ...typography.small,
    color: 'rgba(255,255,255,0.85)',
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
  },
  exitText: {
    ...typography.label,
    color: '#fff',
  },
  patientCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  headerSectionLabel: {
    ...typography.small,
    fontWeight: '700',
    letterSpacing: 1,
  },
  patientName: {
    ...typography.h1,
    letterSpacing: 0.5,
  },
  patientStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#C9DED9',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  statBox: {
    gap: 2,
  },
  statLabel: {
    ...typography.small,
    fontWeight: '600',
  },
  statValue: {
    ...typography.h3,
    fontWeight: '700',
  },
  section: {
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.label,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  emptyCard: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.caption,
    fontWeight: '600',
  },
  listGap: {
    gap: spacing.xs,
  },
  allergyCard: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  allergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  allergyName: {
    ...typography.h3,
    fontWeight: '700',
  },
  allergyMeta: {
    ...typography.bodyMedium,
  },
  medCard: {
    padding: spacing.md,
    gap: 2,
  },
  medName: {
    ...typography.h3,
    fontWeight: '700',
  },
  medDose: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  medTimes: {
    ...typography.caption,
  },
  conditionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  conditionBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  conditionText: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  doctorFilterScroll: {
    marginBottom: spacing.xs,
  },
  doctorFilterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    marginRight: spacing.xs,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  reportTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  reportDate: {
    ...typography.caption,
  },
  reportDoctor: {
    ...typography.small,
  },
  reportThumb: {
    width: 60,
    height: 72,
    borderRadius: radii.sm,
  },
  thumbHint: {
    ...typography.small,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 2,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  contactName: {
    ...typography.h3,
    fontWeight: '700',
  },
  contactPhone: {
    ...typography.body,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  callText: {
    ...typography.bodyMedium,
    color: '#fff',
    fontWeight: '700',
  },
  viewerModal: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  closeViewer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: spacing.sm,
  },
  fullViewerImage: {
    width: '100%',
    height: '80%',
  },
});
