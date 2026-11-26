import * as Notifications from 'expo-notifications';
import { AppError, logServiceError } from '@/utils/error.utils';

// Configure default notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (error) {
      logServiceError('NotificationService', 'NOTIFICATION_FAILED', error);
      return false;
    }
  },

  async scheduleMedicineReminder(medicineName, timeStr) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const [hours, minutes] = timeStr.split(':').map(Number);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

      // Privacy-safe generic message
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'MyHealthNest Reminder',
          body: `Time for your scheduled medicine (${timeStr}).`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });

      return notificationId;
    } catch (error) {
      logServiceError('NotificationService', 'NOTIFICATION_FAILED', error);
      return null;
    }
  },

  async scheduleFollowUpReminder(title, reminderDate) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const target = new Date(reminderDate);
      if (Number.isNaN(target.getTime())) return null;

      // Schedule at 9:00 AM on the reminder date
      target.setHours(9, 0, 0, 0);
      const secondsUntil = Math.floor((target.getTime() - Date.now()) / 1000);
      if (secondsUntil <= 0) return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'MyHealthNest Follow-up',
          body: `Upcoming appointment: ${title}`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntil,
        },
      });

      return notificationId;
    } catch (error) {
      logServiceError('NotificationService', 'NOTIFICATION_FAILED', error);
      return null;
    }
  },

  async cancelNotification(notificationId) {
    if (!notificationId) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      logServiceError('NotificationService', 'NOTIFICATION_FAILED', error);
    }
  },

  async cancelAllNotifications(notificationIds = []) {
    for (const id of notificationIds) {
      await this.cancelNotification(id);
    }
  },
};
