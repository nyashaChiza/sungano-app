import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { router } from 'expo-router';

const isExpoGo = Constants.appOwnership === 'expo';

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
      shouldShowBanner: true,
      shouldShowList: true,
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
      await api.post('/users/me/device-token', {
        expo_token: token,
        device_type: 'android',
      });
    } catch (error) {
      console.error('Push notification registration failed:', error);
    }
  },

  setupNotificationHandlers: () => {
    if (!Notifications) return;

    Notifications.addNotificationReceivedListener((notification) => {
      if (__DEV__) console.log('[Notification received]', notification);
    });

    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as any;
      const { type, reference_id } = data ?? {};

      switch (type) {
        case 'payment_due':
        case 'cycle_opening':
        case 'proof_pending':
          if (reference_id) router.push(`/(app)/rounds/${reference_id}`);
          break;
        case 'round_update':
        case 'contract_signed':
        case 'member_joined':
          if (reference_id) router.push(`/(app)/rounds/${reference_id}`);
          break;
        case 'goal_milestone':
        case 'goal_due':
          if (reference_id) router.push(`/(app)/goals/${reference_id}`);
          break;
        default:
          router.push('/');
          break;
      }
    });
  },

  getNotifications: async () => {
    const response = await api.get('/notifications/notifications');
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await api.put(`/notifications/${notificationId}/read`, {});
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all', {});
    return response.data;
  },
};
