import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure heads-up display and system shutter tray behavior
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('[NotificationService] setNotificationHandler:', e);
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
}

export const NotificationService = {
  /**
   * Request push/local notification permissions from the OS (Android & iOS)
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const res = await window.Notification.requestPermission();
          return res === 'granted';
        }
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: true,
            allowCriticalAlerts: true,
            provideAppNotificationSettings: true,
          },
        });
        finalStatus = status;
      }

      // Configure Android Channel with MAX priority for immediate OS Notification Shuttle
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('flyora_shuttle_channel', {
          name: 'Flyora Alerts & Updates',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#089A8D',
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: false,
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
          sound: 'default',
        });
      }

      return finalStatus === 'granted';
    } catch (err) {
      console.warn('[NotificationService] Permission request error:', err);
      return false;
    }
  },

  /**
   * Check current permission status
   */
  async hasPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          window.Notification.permission === 'granted'
        );
      }
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Trigger native system shutter / status bar notification (OS-level Notification Tray)
   */
  async triggerLocalNotification({ title, body, data = {} }: NotificationPayload): Promise<string | null> {
    try {
      await this.requestPermissions();

      if (Platform.OS === 'web') {
        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          window.Notification.permission === 'granted'
        ) {
          new window.Notification(title, {
            body,
            icon: '/favicon.ico',
            data,
          });
          return 'web-notif';
        }
      }

      // 1-second timeout scheduler puts notification directly into Android / iOS Shuttle
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
          badge: 1,
          color: '#089A8D',
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
          repeats: false,
          channelId: 'flyora_shuttle_channel',
        },
      });

      return identifier;
    } catch (error) {
      console.warn('[NotificationService] Trigger error:', error);
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data,
          },
          trigger: null,
        });
        return id;
      } catch (err2) {
        console.error('[NotificationService] Fallback trigger failed:', err2);
        return null;
      }
    }
  },
};
