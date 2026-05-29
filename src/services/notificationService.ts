import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { router } from 'expo-router';

const isExpoGo = Constants.appOwnership === 'expo';

// Only load expo-notifications outside Expo Go — importing it in Expo Go triggers
// DevicePushTokenAutoRegistration.fx.js which throws at module load time (SDK 53+).
type NotificationsModule = typeof import('expo-notifications');
const Notifications: NotificationsModule | null = isExpoGo
  ? null
  : require('expo-notifications');

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export const notificationService = {
  registerForPushNotifications: async (userId: string) => {
    if (!Notifications) return;

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      await AsyncStorage.setItem('expo_push_token', token);
      await api.post('/users/device-token', {
        expo_token: token,
        device_type: 'mobile',
      });
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  },

  setupNotificationHandlers: () => {
    if (!Notifications) return;

    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    Notifications.addNotificationResponseReceivedListener((response) => {
      const { type, reference_id } = response.notification.request.content.data;

      switch (type) {
        case 'payment_due':
          router.push(`/rounds/${reference_id}/cycle`);
          break;
        case 'round_update':
          router.push(`/rounds/${reference_id}`);
          break;
        case 'goal_update':
          router.push(`/goals/${reference_id}`);
          break;
        case 'new_payment':
          router.push(`/rounds/${reference_id}`);
          break;
        default:
          router.push('/(app)');
          break;
      }
    });
  },

  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await api.patch(`/notifications/${notificationId}`, {
      is_read: true,
    });
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read', {});
    return response.data;
  },
};
