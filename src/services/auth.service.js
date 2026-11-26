import * as LocalAuthentication from 'expo-local-authentication';
import { AppError, logServiceError } from '@/utils/error.utils';

export const AuthService = {
  async checkBiometricAvailability() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return false;
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return isEnrolled;
    } catch (error) {
      logServiceError('AuthService', 'AUTHENTICATION_FAILED', error);
      return false;
    }
  },

  async authenticateUser(promptMessage = 'Unlock MyHealthNest') {
    try {
      const available = await this.checkBiometricAvailability();
      if (!available) {
        // Fallback on simulator / non-biometric devices: approve
        return { success: true };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use Device Passcode',
      });

      if (result.success) {
        return { success: true };
      }

      return {
        success: false,
        error: result.error || 'Authentication canceled or failed.',
      };
    } catch (error) {
      logServiceError('AuthService', 'AUTHENTICATION_FAILED', error);
      throw new AppError(
        'AUTHENTICATION_FAILED',
        'Could not complete biometric authentication.',
        'AuthService'
      );
    }
  },

  shouldAutoLock(lastBackgroundTimestamp, autoLockSeconds) {
    if (!lastBackgroundTimestamp || !autoLockSeconds) return false;
    const elapsedSeconds = (Date.now() - lastBackgroundTimestamp) / 1000;
    return elapsedSeconds >= autoLockSeconds;
  },
};
