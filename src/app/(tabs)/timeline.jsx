import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { CalendarClock, Filter, Plus, Search, Tag } from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRecordStore } from '@/features/records/record.store';
import { useConditionStore } from '@/features/conditions/condition.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { RECORD_TYPE_LABELS, RECORD_TYPES } from '@/types/common.types';
import { formatDayMonth, formatMonthYear } from '@/utils/date.utils';
import { radii, spacing, typography } from '@/theme';

export default function TimelineScreen() {
  const palette = useThemePalette();
  const { records, loadRecords } = useRecordStore();
  const { conditions, loadConditions } = useConditionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedConditionId, setSelectedConditionId] = useState('all');

  useEffect(() => {
    loadRecords();
    loadConditions();
  }, []);

  const conditionMap = useMemo(() => {
    const map = {};
    for (const c of conditions) {
      map[c.id] = c;
    }
    return map;
  }, [conditions]);

  // Filter & Search records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Type filter
        if (selectedType !== 'all' && rec.type !== selectedType) {
          return false;
        }
        // Condition filter
        if (selectedConditionId !== 'all' && rec.conditionId !== selectedConditionId) {
          return false;
        }
        // Query search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const condName = conditionMap[rec.conditionId]?.name?.toLowerCase() || '';
          const matchTitle = rec.title?.toLowerCase().includes(q);
          const matchDoc = rec.doctor?.toLowerCase().includes(q);
          const matchHosp = rec.hospital?.toLowerCase().includes(q);
          const matchType = RECORD_TYPE_LABELS[rec.type]?.toLowerCase().includes(q);
          const matchCond = condName.includes(q);
          return matchTitle || matchDoc || matchHosp || matchType || matchCond;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, selectedType, selectedConditionId, searchQuery, conditionMap]);

  // Group by Month & Year
  const groupedSections = useMemo(() => {
    const sections = [];
    let currentHeader = null;
    let currentItems = [];

    for (const record of filteredRecords) {
      const header = formatMonthYear(record.date);
      if (header !== currentHeader) {
        if (currentHeader !== null) {
          sections.push({ title: currentHeader, data: currentItems });
        }
        currentHeader = header;
        currentItems = [record];
      } else {
        currentItems.push(record);
      }
    }
    if (currentHeader !== null) {
      sections.push({ title: currentHeader, data: currentItems });
    }
    return sections;
  }, [filteredRecords]);

  return (
    <ScreenContainer>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: palette.text }]}>Medical Timeline</Text>
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
            {records.length} records organized chronologically
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/add')}
          style={[styles.addBtn, { backgroundColor: palette.primary }]}
        >
          <Plus color={palette.white} size={22} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={[styles.searchBox, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Search color={palette.textMuted} size={18} />
        <TextInput
          placeholder="Search reports, doctors, conditions..."
          placeholderTextColor={palette.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: palette.text }]}
        />
      </View>

      {/* Filters Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
        <TouchableOpacity
          onPress={() => setSelectedType('all')}
          style={[
            styles.filterChip,
            {
              backgroundColor: selectedType === 'all' ? palette.primary : palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={{ color: selectedType === 'all' ? palette.white : palette.text, fontSize: 13, fontWeight: '600' }}>
            All Types
          </Text>
        </TouchableOpacity>
        {RECORD_TYPES.map((t) => {
          const isSelected = selectedType === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setSelectedType(isSelected ? 'all' : t)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? palette.primary : palette.card,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={{ color: isSelected ? palette.white : palette.text, fontSize: 13, fontWeight: '600' }}>
                {RECORD_TYPE_LABELS[t]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Timeline Content */}
      {groupedSections.length === 0 ? (
        <EmptyState
          icon={<CalendarClock color={palette.primary} size={48} />}
          title="No Medical Records"
          description={
            searchQuery || selectedType !== 'all'
              ? 'No records match your filter criteria.'
              : 'Add your first prescription, lab report, or scan.'
          }
          actionLabel="Add Record"
          onAction={() => router.push('/(tabs)/add')}
        />
      ) : (
        <View style={styles.timelineList}>
          {groupedSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={[styles.sectionHeader, { color: palette.primary }]}>
                {section.title}
              </Text>
              <View style={styles.recordList}>
                {section.data.map((item) => {
                  const cond = conditionMap[item.conditionId];
                  return (
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
                        <View style={styles.badgeRow}>
                          <Badge
                            label={RECORD_TYPE_LABELS[item.type]}
                            tone="primary"
                          />
                          {cond ? (
                            <Badge label={cond.name} tone="neutral" />
                          ) : null}
                        </View>
                      </View>

                      {item.images?.[0] ? (
                        <Image
                          source={{ uri: item.images[0] }}
                          style={styles.thumb}
                          resizeMode="cover"
                        />
                      ) : null}
                    </Card>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.caption,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 44,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    height: '100%',
  },
  filtersScroll: {
    marginVertical: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  timelineList: {
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    ...typography.label,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  recordList: {
    gap: spacing.sm,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  dateCol: {
    width: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayMonth: {
    ...typography.label,
    textAlign: 'center',
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
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 2,
  },
  thumb: {
    width: 52,
    height: 64,
    borderRadius: radii.sm,
  },
});
