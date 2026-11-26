import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  AlertCircle,
  ChevronLeft,
  Phone,
  Share2,
  Shield,
  ShieldAlert,
} from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StorageService } from '@/services/storage.service';
import { useProfileStore } from '@/features/profile/profile.store';
import { useConditionStore } from '@/features/conditions/condition.store';
import { useContactsStore } from '@/features/emergency-contacts/contacts.store';
import { useAppStore } from '@/store/app.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { radii, spacing, typography } from '@/theme';

export default function EmergencyCardScreen() {
  const palette = useThemePalette();
  const { profile, allergies, loadProfile } = useProfileStore();
  const { conditions, loadConditions } = useConditionStore();
  const { contacts, loadContacts } = useContactsStore();
  const { metadata, setMetadata } = useAppStore();

  const [config, setConfig] = useState(metadata.emergencyCardConfig || {
    showName: true,
    showBloodGroup: true,
    showAllergies: true,
    showConditions: true,
    showPrimaryContact: true,
  });

  const [isConfiguring, setIsConfiguring] = useState(false);

  useEffect(() => {
    loadProfile();
    loadConditions();
    loadContacts();
  }, []);

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0] || null;

  const toggleField = async (field) => {
    const updatedConfig = { ...config, [field]: !config[field] };
    setConfig(updatedConfig);
    const updatedMeta = { ...metadata, emergencyCardConfig: updatedConfig };
    setMetadata(updatedMeta);
    await StorageService.saveMetadata(updatedMeta);
  };

  const handleShareText = async () => {
    const lines = ['--- MYHEALTHNEST EMERGENCY CARD ---'];
    if (config.showName && profile?.name) lines.push(`Name: ${profile.name}`);
    if (config.showBloodGroup && profile?.bloodGroup) lines.push(`Blood Group: ${profile.bloodGroup}`);
    if (config.showAllergies && allergies.length > 0) {
      lines.push(`Allergies: ${allergies.map((a) => `${a.name} (${a.severity})`).join(', ')}`);
    }
    if (config.showConditions && conditions.length > 0) {
      lines.push(`Conditions: ${conditions.map((c) => c.name).join(', ')}`);
    }
    if (config.showPrimaryContact && primaryContact) {
      lines.push(`Emergency Contact: ${primaryContact.name} (${primaryContact.phone})`);
    }

    try {
      await Share.share({ message: lines.join('\n') });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <ScreenContainer>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={palette.text} size={28} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsConfiguring((prev) => !prev)}>
          <Text style={{ color: palette.primary, fontWeight: '600' }}>
            {isConfiguring ? 'Done' : 'Configure'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Security Warning Notice */}
      <View style={[styles.warningBox, { backgroundColor: palette.alertSurface }]}>
        <AlertCircle color={palette.alert} size={20} />
        <Text style={[styles.warningText, { color: palette.alert }]}>
          Emergency Card is accessible without vault unlock so responders can act fast. Anyone holding the phone can view this selected information.
        </Text>
      </View>

      {/* The Physical Emergency Card */}
      <Card variant="alert" style={styles.emergencyCard}>
        <View style={styles.cardHeader}>
          <ShieldAlert color={palette.alert} size={26} />
          <Text style={[styles.cardHeaderTitle, { color: palette.alert }]}>
            EMERGENCY MEDICAL IDENTIFICATION
          </Text>
        </View>

        {config.showName ? (
          <View style={styles.cardItem}>
            <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>PATIENT NAME</Text>
            <Text style={[styles.fieldValueBig, { color: palette.text }]}>
              {profile?.name || 'Unknown Patient'}
            </Text>
          </View>
        ) : null}

        {config.showBloodGroup ? (
          <View style={styles.cardItem}>
            <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>BLOOD GROUP</Text>
            <Text style={[styles.bloodGroupText, { color: palette.alert }]}>
              {profile?.bloodGroup || 'UNKNOWN'}
            </Text>
          </View>
        ) : null}

        {config.showAllergies ? (
          <View style={styles.cardItem}>
            <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>ALLERGIES</Text>
            {allergies.length === 0 ? (
              <Text style={[styles.fieldValue, { color: palette.text }]}>No Known Allergies</Text>
            ) : (
              <View style={styles.tagsRow}>
                {allergies.map((a) => (
                  <Badge
                    key={a.id}
                    label={`${a.name} (${a.severity.toUpperCase()})`}
                    tone={a.severity === 'severe' ? 'alert' : 'neutral'}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}

        {config.showConditions ? (
          <View style={styles.cardItem}>
            <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>CHRONIC CONDITIONS</Text>
            {conditions.length === 0 ? (
              <Text style={[styles.fieldValue, { color: palette.text }]}>None Listed</Text>
            ) : (
              <View style={styles.tagsRow}>
                {conditions.map((c) => (
                  <Badge key={c.id} label={c.name} tone="primary" />
                ))}
              </View>
            )}
          </View>
        ) : null}

        {config.showPrimaryContact && primaryContact ? (
          <View style={styles.cardItem}>
            <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>PRIMARY CONTACT</Text>
            <View style={styles.contactRow}>
              <View>
                <Text style={[styles.fieldValue, { color: palette.text }]}>
                  {primaryContact.name} ({primaryContact.relationship})
                </Text>
                <Text style={[styles.contactPhone, { color: palette.textSecondary }]}>
                  {primaryContact.phone}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${primaryContact.phone}`)}
                style={[styles.callBtn, { backgroundColor: palette.alert }]}
              >
                <Phone color="#fff" size={18} />
                <Text style={styles.callText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </Card>

      {/* Configuration Switches Section */}
      {isConfiguring ? (
        <Card style={styles.configCard}>
          <Text style={[styles.configTitle, { color: palette.text }]}>
            Card Visibility Controls
          </Text>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: palette.text }]}>Show Patient Name</Text>
            <Switch
              value={config.showName}
              onValueChange={() => toggleField('showName')}
              trackColor={{ false: palette.disabled, true: palette.primary }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: palette.text }]}>Show Blood Group</Text>
            <Switch
              value={config.showBloodGroup}
              onValueChange={() => toggleField('showBloodGroup')}
              trackColor={{ false: palette.disabled, true: palette.primary }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: palette.text }]}>Show Allergies</Text>
            <Switch
              value={config.showAllergies}
              onValueChange={() => toggleField('showAllergies')}
              trackColor={{ false: palette.disabled, true: palette.primary }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: palette.text }]}>Show Conditions</Text>
            <Switch
              value={config.showConditions}
              onValueChange={() => toggleField('showConditions')}
              trackColor={{ false: palette.disabled, true: palette.primary }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: palette.text }]}>Show Primary Contact</Text>
            <Switch
              value={config.showPrimaryContact}
              onValueChange={() => toggleField('showPrimaryContact')}
              trackColor={{ false: palette.disabled, true: palette.primary }}
            />
          </View>
        </Card>
      ) : null}

      <Button
        title="Share Emergency Info as Text"
        variant="outline"
        icon={<Share2 color={palette.primary} size={18} />}
        onPress={handleShareText}
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  warningText: {
    ...typography.small,
    flex: 1,
    lineHeight: 18,
  },
  emergencyCard: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F2B8B8',
    paddingBottom: spacing.sm,
  },
  cardHeaderTitle: {
    ...typography.label,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardItem: {
    gap: 2,
  },
  fieldLabel: {
    ...typography.small,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  fieldValueBig: {
    ...typography.h2,
    fontWeight: '800',
  },
  fieldValue: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  bloodGroupText: {
    ...typography.h1,
    fontWeight: '900',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  contactPhone: {
    ...typography.caption,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
  },
  callText: {
    ...typography.label,
    color: '#fff',
  },
  configCard: {
    marginTop: spacing.md,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  configTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    ...typography.body,
  },
  shareBtn: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
});
