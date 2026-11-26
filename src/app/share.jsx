import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Check, ChevronLeft, FileDown, ShieldAlert, Users } from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SharingService } from '@/services/sharing.service';
import { useRecordStore } from '@/features/records/record.store';
import { useProfileStore } from '@/features/profile/profile.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { RECORD_TYPE_LABELS } from '@/types/common.types';
import { formatDisplayDate } from '@/utils/date.utils';
import { radii, spacing, typography } from '@/theme';

export default function SelectiveSharingScreen() {
  const palette = useThemePalette();
  const { records, loadRecords } = useRecordStore();
  const { profile, allergies, loadProfile } = useProfileStore();

  const [selectedRecordIds, setSelectedRecordIds] = useState([]);
  const [includeProfile, setIncludeProfile] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadRecords();
    loadProfile();
  }, []);

  const toggleSelectRecord = (id) => {
    if (selectedRecordIds.includes(id)) {
      setSelectedRecordIds(selectedRecordIds.filter((item) => item !== id));
    } else {
      setSelectedRecordIds([...selectedRecordIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRecordIds.length === records.length) {
      setSelectedRecordIds([]);
    } else {
      setSelectedRecordIds(records.map((r) => r.id));
    }
  };

  const handleSharePdf = () => {
    if (selectedRecordIds.length === 0 && !includeProfile) {
      Alert.alert('Selection Required', 'Please select at least one record or include health profile.');
      return;
    }

    Alert.alert(
      'Privacy Warning',
      'These files will leave your secure vault. Make sure you are sharing them with the correct person.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Share',
          onPress: async () => {
            setIsExporting(true);
            try {
              const selectedRecords = records.filter((r) => selectedRecordIds.includes(r.id));
              const pdfUri = await SharingService.generateMedicalSummaryPdf(
                selectedRecords,
                includeProfile ? profile : null,
                includeProfile ? allergies : []
              );
              await SharingService.shareFile(pdfUri);
            } catch (err) {
              Alert.alert('Sharing Failed', err.message || 'Could not export records.');
            } finally {
              setIsExporting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={palette.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette.text }]}>Selective Sharing</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>Export & Share Records</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          Generate a consolidated, privacy-safe PDF summary for consultations.
        </Text>
      </View>

      {/* Profile inclusion toggle */}
      <Card style={styles.toggleCard}>
        <TouchableOpacity
          onPress={() => setIncludeProfile((prev) => !prev)}
          style={styles.toggleRow}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: includeProfile ? palette.primary : palette.card,
                borderColor: palette.border,
              },
            ]}
          >
            {includeProfile ? <Check color={palette.white} size={16} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.toggleTitle, { color: palette.text }]}>
              Include Health Profile & Allergies
            </Text>
            <Text style={[styles.toggleDesc, { color: palette.textSecondary }]}>
              Appends age, blood group, and critical allergy warnings to the top of report.
            </Text>
          </View>
        </TouchableOpacity>
      </Card>

      {/* Records Selection Section */}
      <View style={styles.recordsSection}>
        <View style={styles.recordsHeader}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            Select Medical Records ({selectedRecordIds.length}/{records.length})
          </Text>
          <TouchableOpacity onPress={handleSelectAll}>
            <Text style={{ color: palette.primary, fontWeight: '600' }}>
              {selectedRecordIds.length === records.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>

        {records.length === 0 ? (
          <EmptyState
            title="No Records Available"
            description="Add medical records to your vault first before creating a sharing package."
          />
        ) : (
          <View style={styles.recordsList}>
            {records.map((r) => {
              const isSelected = selectedRecordIds.includes(r.id);
              return (
                <Card
                  key={r.id}
                  onPress={() => toggleSelectRecord(r.id)}
                  style={[
                    styles.recordItem,
                    isSelected ? { borderColor: palette.primary } : null,
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: isSelected ? palette.primary : palette.card,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    {isSelected ? <Check color={palette.white} size={16} /> : null}
                  </View>

                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.recordTitle, { color: palette.text }]}>
                      {r.title}
                    </Text>
                    <Text style={[styles.recordMeta, { color: palette.textSecondary }]}>
                      {formatDisplayDate(r.date)} • {RECORD_TYPE_LABELS[r.type]}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>

      <Button
        title="Generate & Share PDF Summary"
        loading={isExporting}
        icon={<FileDown color={palette.white} size={20} />}
        onPress={handleSharePdf}
        style={styles.shareBtn}
      />
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
  toggleCard: {
    padding: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  toggleDesc: {
    ...typography.caption,
  },
  recordsSection: {
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h3,
  },
  recordsList: {
    gap: spacing.xs,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  recordTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  recordMeta: {
    ...typography.caption,
  },
  shareBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
});
