import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  ChevronLeft,
  Edit2,
  FileText,
  Hospital,
  Share2,
  Trash2,
  User,
  X,
} from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useRecordStore } from '@/features/records/record.store';
import { useConditionStore } from '@/features/conditions/condition.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { RECORD_TYPE_LABELS } from '@/types/common.types';
import { formatDisplayDate } from '@/utils/date.utils';
import { radii, spacing, typography } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RecordDetailsScreen() {
  const { id } = useLocalSearchParams();
  const palette = useThemePalette();
  const { getRecordById, updateRecord, deleteRecord, selectedRecord } = useRecordStore();
  const { conditions, loadConditions } = useConditionStore();

  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editDoctor, setEditDoctor] = useState('');
  const [editHospital, setEditHospital] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (id) {
      getRecordById(id);
      loadConditions();
    }
  }, [id]);

  useEffect(() => {
    if (selectedRecord) {
      setEditTitle(selectedRecord.title);
      setEditDoctor(selectedRecord.doctor || '');
      setEditHospital(selectedRecord.hospital || '');
      setEditDate(selectedRecord.date);
      setEditNotes(selectedRecord.notes || '');
    }
  }, [selectedRecord]);

  if (!selectedRecord) {
    return (
      <ScreenContainer>
        <Text style={[styles.title, { color: palette.text }]}>Record Not Found</Text>
        <Button title="Back to Timeline" onPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  const linkedCondition = conditions.find((c) => c.id === selectedRecord.conditionId);

  const handleDelete = () => {
    Alert.alert(
      'Delete Medical Record',
      'Are you sure you want to permanently delete this medical record and all scanned pages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRecord(selectedRecord.id);
            router.replace('/(tabs)/timeline');
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (selectedRecord.images?.length > 0) {
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          Alert.alert(
            'Privacy Notice',
            'This medical file will leave your secure offline vault. Confirm you are sharing with the intended recipient.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Share',
                onPress: async () => {
                  await Sharing.shareAsync(selectedRecord.images[activePageIndex] || selectedRecord.images[0]);
                },
              },
            ]
          );
        }
      } catch (err) {
        console.warn('Share error:', err);
      }
    }
  };

  const handleSaveEdit = async () => {
    await updateRecord(selectedRecord.id, {
      title: editTitle,
      doctor: editDoctor,
      hospital: editHospital,
      date: editDate,
      notes: editNotes,
    });
    setIsEditModalOpen(false);
  };

  return (
    <ScreenContainer>
      {/* Top action bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={palette.text} size={28} />
        </TouchableOpacity>
        <View style={styles.topRightBtns}>
          <TouchableOpacity onPress={() => setIsEditModalOpen(true)} style={styles.iconBtn}>
            <Edit2 color={palette.text} size={22} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
            <Share2 color={palette.text} size={22} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
            <Trash2 color={palette.alert} size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title & Badge */}
      <View style={styles.titleSection}>
        <Text style={[styles.title, { color: palette.text }]}>{selectedRecord.title}</Text>
        <View style={styles.badgeRow}>
          <Badge
            label={RECORD_TYPE_LABELS[selectedRecord.type] || selectedRecord.type}
            tone="primary"
          />
          {linkedCondition ? (
            <Badge label={linkedCondition.name} tone="neutral" />
          ) : null}
        </View>
      </View>

      {/* Document Pages Carousel */}
      {selectedRecord.images?.length > 0 ? (
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
              setActivePageIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {selectedRecord.images.map((uri, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.9}
                onPress={() => setIsViewerOpen(true)}
                style={styles.imageWrapper}
              >
                <Image source={{ uri }} style={styles.docImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.paginationRow}>
            <Text style={[styles.pageIndicator, { color: palette.textSecondary }]}>
              Page {activePageIndex + 1} of {selectedRecord.images.length} (Tap to zoom)
            </Text>
          </View>
        </View>
      ) : null}

      {/* Information Cards */}
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Calendar color={palette.primary} size={20} />
          <View>
            <Text style={[styles.infoLabel, { color: palette.textMuted }]}>Record Date</Text>
            <Text style={[styles.infoValue, { color: palette.text }]}>
              {formatDisplayDate(selectedRecord.date)}
            </Text>
          </View>
        </View>

        {selectedRecord.doctor ? (
          <View style={styles.infoRow}>
            <User color={palette.primary} size={20} />
            <View>
              <Text style={[styles.infoLabel, { color: palette.textMuted }]}>Doctor</Text>
              <Text style={[styles.infoValue, { color: palette.text }]}>
                {selectedRecord.doctor}
              </Text>
            </View>
          </View>
        ) : null}

        {selectedRecord.hospital ? (
          <View style={styles.infoRow}>
            <Hospital color={palette.primary} size={20} />
            <View>
              <Text style={[styles.infoLabel, { color: palette.textMuted }]}>Hospital / Clinic</Text>
              <Text style={[styles.infoValue, { color: palette.text }]}>
                {selectedRecord.hospital}
              </Text>
            </View>
          </View>
        ) : null}

        {selectedRecord.notes ? (
          <View style={styles.infoRow}>
            <FileText color={palette.primary} size={20} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: palette.textMuted }]}>Notes</Text>
              <Text style={[styles.infoValue, { color: palette.text }]}>
                {selectedRecord.notes}
              </Text>
            </View>
          </View>
        ) : null}
      </Card>

      {/* Full-Screen Image Viewer Modal */}
      <Modal visible={isViewerOpen} transparent animationType="fade">
        <View style={styles.modalBg}>
          <TouchableOpacity
            style={styles.closeViewerBtn}
            onPress={() => setIsViewerOpen(false)}
          >
            <X color={palette.white} size={28} />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedRecord.images[activePageIndex] }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {/* Edit Record Modal */}
      <Modal visible={isEditModalOpen} animationType="slide">
        <ScreenContainer keyboardAvoiding>
          <View style={styles.topBar}>
            <Text style={[styles.title, { color: palette.text }]}>Edit Record</Text>
            <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
              <X color={palette.text} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.editForm}>
            <Input label="Title" value={editTitle} onChangeText={setEditTitle} />
            <Input label="Date" value={editDate} onChangeText={setEditDate} />
            <Input label="Doctor" value={editDoctor} onChangeText={setEditDoctor} />
            <Input label="Hospital" value={editHospital} onChangeText={setEditHospital} />
            <Input
              label="Notes"
              value={editNotes}
              onChangeText={setEditNotes}
              multiline
              numberOfLines={3}
            />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
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
  titleSection: {
    gap: spacing.xs,
    marginVertical: spacing.sm,
  },
  title: {
    ...typography.h2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  imageSection: {
    marginVertical: spacing.md,
  },
  imageWrapper: {
    width: SCREEN_WIDTH - 32,
    height: 380,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  docImage: {
    width: '100%',
    height: '100%',
  },
  paginationRow: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  pageIndicator: {
    ...typography.caption,
  },
  infoCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  infoLabel: {
    ...typography.small,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '500',
  },
  modalBg: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  closeViewerBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: spacing.sm,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  editForm: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
