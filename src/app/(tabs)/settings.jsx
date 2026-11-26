import React from 'react';
import {
  Alert,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  Bell,
  Download,
  Info,
  Lock,
  Moon,
  Shield,
  Trash2,
} from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { AuthService } from '@/services/auth.service';
import { StorageService } from '@/services/storage.service';
import { useAppStore } from '@/store/app.store';
import { useAuthStore } from '@/store/auth.store';
import { useThemePalette } from '@/hooks/useThemePalette';
import { radii, spacing, typography } from '@/theme';

const AUTO_LOCK_OPTIONS = [
  { label: '15s', seconds: 15 },
  { label: '30s', seconds: 30 },
  { label: '1m', seconds: 60 },
  { label: '5m', seconds: 300 },
];

export default function SettingsScreen() {
  const palette = useThemePalette();
  const { settings, updateSettingsLocal, resetAppState, setTheme } = useAppStore();
  const { biometricAvailable, resetAuth } = useAuthStore();

  const handleToggleBiometric = async (value) => {
    updateSettingsLocal({ biometricEnabled: value });
    await StorageService.saveSettings({ ...settings, biometricEnabled: value });
  };

  const handleSetAutoLock = async (seconds) => {
    updateSettingsLocal({ autoLockSeconds: seconds });
    await StorageService.saveSettings({ ...settings, autoLockSeconds: seconds });
  };

  const handleToggleNotifications = async (value) => {
    updateSettingsLocal({ notificationsEnabled: value });
    await StorageService.saveSettings({ ...settings, notificationsEnabled: value });
  };

  const handleSetTheme = async (mode) => {
    setTheme(mode);
    await StorageService.saveSettings({ ...settings, theme: mode });
  };

  const handleExportAllData = async () => {
    try {
      const [profile, allergies, records, conditions, medicines, contacts, reminders] =
        await Promise.all([
          StorageService.getProfile(),
          StorageService.getAllergies(),
          StorageService.getRecords(),
          StorageService.getConditions(),
          StorageService.getMedicines(),
          StorageService.getContacts(),
          StorageService.getReminders(),
        ]);

      const backup = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        profile,
        allergies,
        records,
        conditions,
        medicines,
        contacts,
        reminders,
      };

      await Share.share({
        message: JSON.stringify(backup, null, 2),
        title: 'MyHealthNest_Backup.json',
      });
    } catch (err) {
      Alert.alert('Export Failed', err.message || 'Could not export data.');
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'DELETE ALL DATA',
      'WARNING: This will permanently erase your health profile, all scanned medical documents, medications, and emergency contacts. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase Everything',
          style: 'destructive',
          onPress: async () => {
            // Require authentication before deletion
            try {
              const authResult = await AuthService.authenticateUser('Confirm Identity to Erase All Data');
              if (authResult.success) {
                await StorageService.wipeAllData();
                resetAppState();
                resetAuth();
                Alert.alert('Vault Erased', 'All data has been securely deleted.');
                router.replace('/onboarding');
              } else {
                Alert.alert('Authentication Failed', 'Data deletion cancelled.');
              }
            } catch {
              Alert.alert('Authentication Error', 'Could not authenticate deletion.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          Vault preferences, biometric lock, and data management
        </Text>
      </View>

      {/* SECTION: Security */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Lock color={palette.primary} size={18} />
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Security</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: palette.text }]}>Biometric Vault Lock</Text>
              <Text style={[styles.rowSubtitle, { color: palette.textSecondary }]}>
                {biometricAvailable
                  ? 'Require Face ID or Fingerprint on app open'
                  : 'Biometric hardware not enrolled on device'}
              </Text>
            </View>
            <Switch
              disabled={!biometricAvailable}
              value={settings.biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: palette.disabled, true: palette.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <View style={styles.col}>
            <Text style={[styles.rowTitle, { color: palette.text }]}>Auto-Lock Timeout</Text>
            <Text style={[styles.rowSubtitle, { color: palette.textSecondary }]}>
              Lock vault after app is backgrounded
            </Text>
            <View style={styles.optionsRow}>
              {AUTO_LOCK_OPTIONS.map((opt) => {
                const isSelected = settings.autoLockSeconds === opt.seconds;
                return (
                  <TouchableOpacity
                    key={opt.seconds}
                    onPress={() => handleSetAutoLock(opt.seconds)}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: isSelected ? palette.primary : palette.surface,
                        borderColor: isSelected ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? palette.white : palette.text },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Card>
      </View>

      {/* SECTION: Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Bell color={palette.primary} size={18} />
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Notifications</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: palette.text }]}>Prescription Reminders</Text>
              <Text style={[styles.rowSubtitle, { color: palette.textSecondary }]}>
                Generic, privacy-safe notifications for daily doses
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: palette.disabled, true: palette.primary }}
            />
          </View>
        </Card>
      </View>

      {/* SECTION: Appearance */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Moon color={palette.primary} size={18} />
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Appearance</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.optionsRow}>
            {['system', 'light', 'dark'].map((m) => {
              const isSelected = settings.theme === m;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => handleSetTheme(m)}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: isSelected ? palette.primary : palette.surface,
                      borderColor: isSelected ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? palette.white : palette.text },
                    ]}
                  >
                    {m.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </View>

      {/* SECTION: Data Management */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Download color={palette.primary} size={18} />
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Data Management</Text>
        </View>

        <Card style={styles.card}>
          <TouchableOpacity onPress={handleExportAllData} style={styles.touchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: palette.text }]}>Export All Vault Data</Text>
              <Text style={[styles.rowSubtitle, { color: palette.textSecondary }]}>
                Export a local JSON backup of your records and profile
              </Text>
            </View>
            <Download color={palette.primary} size={20} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <TouchableOpacity onPress={handleDeleteAllData} style={styles.touchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: palette.alert }]}>Delete All Data</Text>
              <Text style={[styles.rowSubtitle, { color: palette.textSecondary }]}>
                Permanently wipe all records, images, and settings
              </Text>
            </View>
            <Trash2 color={palette.alert} size={20} />
          </TouchableOpacity>
        </Card>
      </View>

      {/* SECTION: About & Disclaimer */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Info color={palette.primary} size={18} />
          <Text style={[styles.sectionTitle, { color: palette.text }]}>About</Text>
        </View>

        <Card style={styles.card}>
          <Text style={[styles.aboutTitle, { color: palette.text }]}>
            MyHealthNest v1.0.0
          </Text>
          <Text style={[styles.aboutText, { color: palette.textSecondary }]}>
            Privacy-first offline personal medical records manager. All data is kept strictly private on your device file system.
          </Text>
          <View style={[styles.disclaimerBox, { backgroundColor: palette.surface }]}>
            <Text style={[styles.disclaimerLabel, { color: palette.text }]}>
              Medical Disclaimer:
            </Text>
            <Text style={[styles.disclaimerText, { color: palette.textMuted }]}>
              MyHealthNest is an organization and storage tool for user-provided health records. It does not provide medical diagnoses, treatment advice, or prescriptions. In emergencies, contact your local emergency services immediately.
            </Text>
          </View>
        </Card>
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  section: {
    gap: spacing.xs,
    marginVertical: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.label,
    fontWeight: '700',
  },
  card: {
    padding: spacing.md,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  touchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  col: {
    gap: spacing.xs,
  },
  rowTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  rowSubtitle: {
    ...typography.small,
  },
  divider: {
    height: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  optionChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  chipText: {
    ...typography.small,
    fontWeight: '600',
  },
  aboutTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  aboutText: {
    ...typography.caption,
  },
  disclaimerBox: {
    padding: spacing.md,
    borderRadius: radii.md,
    gap: 4,
  },
  disclaimerLabel: {
    ...typography.small,
    fontWeight: '700',
  },
  disclaimerText: {
    ...typography.small,
    lineHeight: 16,
  },
});
