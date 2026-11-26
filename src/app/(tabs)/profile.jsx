import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
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
  ChevronRight,
  Edit,
  FolderHeart,
  Phone,
  Plus,
  ShieldAlert,
  Syringe,
  Trash2,
  User,
  X,
} from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useProfileStore } from '@/features/profile/profile.store';
import { useConditionStore } from '@/features/conditions/condition.store';
import { useContactsStore } from '@/features/emergency-contacts/contacts.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { ALLERGY_CATEGORIES, ALLERGY_SEVERITIES, RELATIONSHIPS } from '@/types/common.types';
import { calculateAge } from '@/utils/date.utils';
import { radii, spacing, typography } from '@/theme';

export default function ProfileScreen() {
  const palette = useThemePalette();
  const {
    profile,
    allergies,
    loadProfile,
    saveProfile,
    addAllergy,
    deleteAllergy,
    addSurgery,
    removeSurgery,
    addVaccination,
    removeVaccination,
  } = useProfileStore();

  const { conditions, loadConditions } = useConditionStore();
  const { contacts, loadContacts, addContact, deleteContact, importContact } = useContactsStore();

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddAllergyOpen, setIsAddAllergyOpen] = useState(false);
  const [isAddSurgeryOpen, setIsAddSurgeryOpen] = useState(false);
  const [isAddVaccineOpen, setIsAddVaccineOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  // Profile Form state
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');

  // Allergy Form state
  const [algName, setAlgName] = useState('');
  const [algCategory, setAlgCategory] = useState('drug');
  const [algSeverity, setAlgSeverity] = useState('mild');
  const [algNotes, setAlgNotes] = useState('');

  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRel, setContactRel] = useState('Spouse');
  const [contactIsPrimary, setContactIsPrimary] = useState(false);

  // Single string inputs
  const [surgeryText, setSurgeryText] = useState('');
  const [vaccineText, setVaccineText] = useState('');

  useEffect(() => {
    loadProfile();
    loadConditions();
    loadContacts();
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setDob(profile.dob || '');
      setBloodGroup(profile.bloodGroup || '');
      setHeightCm(profile.heightCm ? String(profile.heightCm) : '');
      setWeightKg(profile.weightKg ? String(profile.weightKg) : '');
      setFamilyHistory(profile.familyHistory || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    await saveProfile({
      ...profile,
      name,
      dob: dob || null,
      bloodGroup,
      heightCm: heightCm ? Number(heightCm) : null,
      weightKg: weightKg ? Number(weightKg) : null,
      familyHistory,
    });
    setIsEditProfileOpen(false);
  };

  const handleSaveAllergy = async () => {
    if (!algName.trim()) return;
    await addAllergy({
      name: algName,
      category: algCategory,
      severity: algSeverity,
      notes: algNotes,
    });
    setAlgName('');
    setAlgNotes('');
    setIsAddAllergyOpen(false);
  };

  const handleSaveContact = async () => {
    if (!contactName.trim() || !contactPhone.trim()) return;
    await addContact({
      name: contactName,
      phone: contactPhone,
      relationship: contactRel,
      isPrimary: contactIsPrimary,
    });
    setContactName('');
    setContactPhone('');
    setIsAddContactOpen(false);
  };

  const age = calculateAge(profile?.dob);

  return (
    <ScreenContainer>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: palette.text }]}>Health Profile</Text>
          <TouchableOpacity
            onPress={() => setIsEditProfileOpen(true)}
            style={[styles.editBtn, { backgroundColor: palette.surfaceSecondary }]}
          >
            <Edit color={palette.primary} size={18} />
          </TouchableOpacity>
        </View>

        <Card style={styles.patientCard}>
          <View style={styles.patientRow}>
            <View style={[styles.avatar, { backgroundColor: palette.primary }]}>
              <Text style={styles.avatarText}>
                {profile?.name ? profile.name[0].toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.patientName, { color: palette.text }]}>
                {profile?.name || 'Anonymous User'}
              </Text>
              <Text style={[styles.patientMeta, { color: palette.textSecondary }]}>
                {[
                  age !== null ? `${age} yrs` : null,
                  profile?.gender,
                  profile?.bloodGroup ? `Blood: ${profile.bloodGroup}` : null,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </Text>
            </View>
          </View>

          {(profile?.heightCm || profile?.weightKg) ? (
            <View style={styles.vitalsRow}>
              {profile?.heightCm ? (
                <View style={styles.vitalItem}>
                  <Text style={[styles.vitalLabel, { color: palette.textMuted }]}>Height</Text>
                  <Text style={[styles.vitalValue, { color: palette.text }]}>
                    {profile.heightCm} cm
                  </Text>
                </View>
              ) : null}
              {profile?.weightKg ? (
                <View style={styles.vitalItem}>
                  <Text style={[styles.vitalLabel, { color: palette.textMuted }]}>Weight</Text>
                  <Text style={[styles.vitalValue, { color: palette.text }]}>
                    {profile.weightKg} kg
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </Card>
      </View>

      {/* SECTION: Allergies */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.rowAlign}>
            <ShieldAlert color={palette.alert} size={20} />
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              Allergies ({allergies.length})
            </Text>
          </View>
          <TouchableOpacity onPress={() => setIsAddAllergyOpen(true)}>
            <Text style={{ color: palette.primary, fontWeight: '600' }}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {allergies.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              No known drug or food allergies recorded.
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
                  style={styles.itemCard}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.rowAlign}>
                      <Text
                        style={[
                          styles.itemTitle,
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
                    <Text style={[styles.itemMeta, { color: palette.textSecondary }]}>
                      Category: {alg.category} {alg.notes ? `• ${alg.notes}` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteAllergy(alg.id)}>
                    <Trash2 color={palette.alert} size={18} />
                  </TouchableOpacity>
                </Card>
              );
            })}
          </View>
        )}
      </View>

      {/* SECTION: Conditions */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.rowAlign}>
            <FolderHeart color={palette.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              Chronic Conditions ({conditions.length})
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/conditions')}>
            <Text style={{ color: palette.primary, fontWeight: '600' }}>Manage</Text>
          </TouchableOpacity>
        </View>

        {conditions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              No chronic conditions specified.
            </Text>
          </Card>
        ) : (
          <View style={styles.chipsRow}>
            {conditions.map((c) => (
              <Badge key={c.id} label={c.name} tone="primary" />
            ))}
          </View>
        )}
      </View>

      {/* SECTION: Emergency Contacts */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.rowAlign}>
            <Phone color={palette.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              Emergency Contacts ({contacts.length})
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TouchableOpacity onPress={() => importContact()}>
              <Text style={{ color: palette.primary, fontWeight: '600' }}>Import</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsAddContactOpen(true)}>
              <Text style={{ color: palette.primary, fontWeight: '600' }}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {contacts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              No emergency contacts added yet.
            </Text>
          </Card>
        ) : (
          <View style={styles.listGap}>
            {contacts.map((c) => (
              <Card key={c.id} style={styles.itemCard}>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={styles.rowAlign}>
                    <Text style={[styles.itemTitle, { color: palette.text }]}>
                      {c.name}
                    </Text>
                    {c.isPrimary ? (
                      <Badge label="PRIMARY" tone="primary" />
                    ) : null}
                  </View>
                  <Text style={[styles.itemMeta, { color: palette.textSecondary }]}>
                    {c.relationship} • {c.phone}
                  </Text>
                </View>
                <View style={styles.rowAlign}>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${c.phone}`)}
                    style={[styles.phoneBtn, { backgroundColor: palette.surfaceSecondary }]}
                  >
                    <Phone color={palette.primary} size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteContact(c.id)}>
                    <Trash2 color={palette.alert} size={18} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* SECTION: Surgeries */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.rowAlign}>
            <Activity color={palette.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              Past Surgeries ({profile?.surgeries?.length || 0})
            </Text>
          </View>
          <TouchableOpacity onPress={() => setIsAddSurgeryOpen(true)}>
            <Text style={{ color: palette.primary, fontWeight: '600' }}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {(profile?.surgeries?.length || 0) === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              No surgical history recorded.
            </Text>
          </Card>
        ) : (
          <View style={styles.listGap}>
            {profile.surgeries.map((surg, idx) => (
              <Card key={idx} style={styles.itemCard}>
                <Text style={[styles.itemTitle, { color: palette.text, flex: 1 }]}>
                  {surg}
                </Text>
                <TouchableOpacity onPress={() => removeSurgery(surg)}>
                  <Trash2 color={palette.alert} size={18} />
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* SECTION: Vaccinations */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.rowAlign}>
            <Syringe color={palette.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              Vaccinations ({profile?.vaccinations?.length || 0})
            </Text>
          </View>
          <TouchableOpacity onPress={() => setIsAddVaccineOpen(true)}>
            <Text style={{ color: palette.primary, fontWeight: '600' }}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {(profile?.vaccinations?.length || 0) === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              No vaccinations tracked.
            </Text>
          </Card>
        ) : (
          <View style={styles.listGap}>
            {profile.vaccinations.map((vac, idx) => (
              <Card key={idx} style={styles.itemCard}>
                <Text style={[styles.itemTitle, { color: palette.text, flex: 1 }]}>
                  {vac}
                </Text>
                <TouchableOpacity onPress={() => removeVaccination(vac)}>
                  <Trash2 color={palette.alert} size={18} />
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={isEditProfileOpen} animationType="slide">
        <ScreenContainer keyboardAvoiding>
          <View style={styles.modalHeader}>
            <Text style={[styles.title, { color: palette.text }]}>Edit Health Profile</Text>
            <TouchableOpacity onPress={() => setIsEditProfileOpen(false)}>
              <X color={palette.text} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Input label="Full Name" value={name} onChangeText={setName} />
            <Input label="Date of Birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} />
            <Input label="Blood Group" value={bloodGroup} onChangeText={setBloodGroup} />
            <Input
              label="Height (cm)"
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
            />
            <Input
              label="Weight (kg)"
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="numeric"
            />
            <Input
              label="Family Medical History"
              value={familyHistory}
              onChangeText={setFamilyHistory}
              multiline
              numberOfLines={3}
            />
            <Button title="Save Profile" onPress={handleSaveProfile} />
          </View>
        </ScreenContainer>
      </Modal>

      {/* Add Allergy Modal */}
      <Modal visible={isAddAllergyOpen} animationType="slide">
        <ScreenContainer keyboardAvoiding>
          <View style={styles.modalHeader}>
            <Text style={[styles.title, { color: palette.text }]}>Record Allergy</Text>
            <TouchableOpacity onPress={() => setIsAddAllergyOpen(false)}>
              <X color={palette.text} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Input
              label="Allergen Name *"
              placeholder="e.g. Penicillin, Peanuts, Latex"
              value={algName}
              onChangeText={setAlgName}
            />

            <View style={styles.fieldGap}>
              <Text style={[styles.fieldLabel, { color: palette.text }]}>Category</Text>
              <View style={styles.chipsRow}>
                {ALLERGY_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setAlgCategory(cat)}
                    style={[
                      styles.choiceChip,
                      {
                        backgroundColor: algCategory === cat ? palette.primary : palette.card,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text style={{ color: algCategory === cat ? palette.white : palette.text }}>
                      {cat.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldGap}>
              <Text style={[styles.fieldLabel, { color: palette.text }]}>Severity</Text>
              <View style={styles.chipsRow}>
                {ALLERGY_SEVERITIES.map((sev) => (
                  <TouchableOpacity
                    key={sev}
                    onPress={() => setAlgSeverity(sev)}
                    style={[
                      styles.choiceChip,
                      {
                        backgroundColor:
                          algSeverity === sev
                            ? sev === 'severe'
                              ? palette.alert
                              : palette.primary
                            : palette.card,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: algSeverity === sev ? palette.white : palette.text,
                        fontWeight: '600',
                      }}
                    >
                      {sev.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Reaction Notes (Optional)"
              placeholder="e.g. Hives, difficulty breathing, rash"
              value={algNotes}
              onChangeText={setAlgNotes}
            />

            <Button title="Save Allergy" onPress={handleSaveAllergy} />
          </View>
        </ScreenContainer>
      </Modal>

      {/* Add Surgery Modal */}
      <Modal visible={isAddSurgeryOpen} animationType="slide">
        <ScreenContainer keyboardAvoiding>
          <View style={styles.modalHeader}>
            <Text style={[styles.title, { color: palette.text }]}>Add Surgery</Text>
            <TouchableOpacity onPress={() => setIsAddSurgeryOpen(false)}>
              <X color={palette.text} size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Input
              label="Procedure / Year"
              placeholder="e.g. Appendectomy (2018)"
              value={surgeryText}
              onChangeText={setSurgeryText}
            />
            <Button
              title="Add Surgery"
              onPress={async () => {
                if (surgeryText.trim()) {
                  await addSurgery(surgeryText);
                  setSurgeryText('');
                  setIsAddSurgeryOpen(false);
                }
              }}
            />
          </View>
        </ScreenContainer>
      </Modal>

      {/* Add Vaccine Modal */}
      <Modal visible={isAddVaccineOpen} animationType="slide">
        <ScreenContainer keyboardAvoiding>
          <View style={styles.modalHeader}>
            <Text style={[styles.title, { color: palette.text }]}>Add Vaccination</Text>
            <TouchableOpacity onPress={() => setIsAddVaccineOpen(false)}>
              <X color={palette.text} size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Input
              label="Vaccine / Dose"
              placeholder="e.g. COVID-19 Booster, Tetanus (2025)"
              value={vaccineText}
              onChangeText={setVaccineText}
            />
            <Button
              title="Add Vaccination"
              onPress={async () => {
                if (vaccineText.trim()) {
                  await addVaccination(vaccineText);
                  setVaccineText('');
                  setIsAddVaccineOpen(false);
                }
              }}
            />
          </View>
        </ScreenContainer>
      </Modal>

      {/* Add Contact Modal */}
      <Modal visible={isAddContactOpen} animationType="slide">
        <ScreenContainer keyboardAvoiding>
          <View style={styles.modalHeader}>
            <Text style={[styles.title, { color: palette.text }]}>Add Emergency Contact</Text>
            <TouchableOpacity onPress={() => setIsAddContactOpen(false)}>
              <X color={palette.text} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Input
              label="Name *"
              placeholder="e.g. Jane Doe"
              value={contactName}
              onChangeText={setContactName}
            />
            <Input
              label="Phone Number *"
              placeholder="e.g. +1 555-0199"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.fieldGap}>
              <Text style={[styles.fieldLabel, { color: palette.text }]}>Relationship</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                {RELATIONSHIPS.map((rel) => (
                  <TouchableOpacity
                    key={rel}
                    onPress={() => setContactRel(rel)}
                    style={[
                      styles.choiceChip,
                      {
                        backgroundColor: contactRel === rel ? palette.primary : palette.card,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text style={{ color: contactRel === rel ? palette.white : palette.text }}>
                      {rel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              onPress={() => setContactIsPrimary((prev) => !prev)}
              style={styles.checkboxRow}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: contactIsPrimary ? palette.primary : palette.card,
                    borderColor: palette.border,
                  },
                ]}
              />
              <Text style={[styles.checkboxLabel, { color: palette.text }]}>
                Set as Primary Emergency Contact
              </Text>
            </TouchableOpacity>

            <Button title="Save Contact" onPress={handleSaveContact} />
          </View>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
  },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h2,
    color: '#fff',
  },
  patientName: {
    ...typography.h3,
  },
  patientMeta: {
    ...typography.caption,
  },
  vitalsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#E0E8E6',
    paddingTop: spacing.sm,
  },
  vitalItem: {
    gap: 2,
  },
  vitalLabel: {
    ...typography.small,
  },
  vitalValue: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  section: {
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  listGap: {
    gap: spacing.xs,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  itemTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  itemMeta: {
    ...typography.caption,
  },
  phoneBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  choiceChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  checkboxLabel: {
    ...typography.body,
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
  fieldGap: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
  },
});
