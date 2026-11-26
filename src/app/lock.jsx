import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AlertTriangle, Lock, ShieldCheck } from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import { AuthService } from '@/services/auth.service';
import { useThemePalette } from '@/hooks/useThemePalette';
import { radii, spacing, typography } from '@/theme';

export default function LockScreen() {
  const palette = useThemePalette();
  const { setLocked, setAuthenticated } = useAuthStore();
  const [error, setError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  const handleUnlock = async () => {
    setError('');
    setAuthenticating(true);
    try {
      const result = await AuthService.authenticateUser('Unlock your medical records');
      if (result.success) {
        setLocked(false);
        setAuthenticated(true);
        router.replace('/(tabs)');
      } else {
        setError(result.error || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleEmergencyCard = () => {
    router.push('/emergency-card');
  };

  return (
    <ScreenContainer scroll={false} style={styles.container}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: palette.surfaceSecondary },
          ]}
        >
          <Lock color={palette.primary} size={48} />
        </View>

        <Text style={[styles.title, { color: palette.text }]}>Vault Locked</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          Your medical records are protected by biometric security.
        </Text>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: palette.alertSurface }]}>
            <AlertTriangle color={palette.alert} size={18} />
            <Text style={[styles.errorText, { color: palette.alert }]}>{error}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button
          title="Unlock with Biometrics"
          icon={<ShieldCheck color={palette.white} size={20} />}
          loading={authenticating}
          onPress={handleUnlock}
        />

        <Button
          title="Emergency Card"
          variant="outline"
          onPress={handleEmergencyCard}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingVertical: spacing.xxl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    maxWidth: 280,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.caption,
  },
  actions: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
