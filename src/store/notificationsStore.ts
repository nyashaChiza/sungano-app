import { create } from 'zustand';
import api from '../services/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsState {
  unreadCount: number;
  notifications: Notification[];
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  unreadCount: 0,
  notifications: [],
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/notifications');
      const notifications = res.data.data || res.data;
      const unreadCount = notifications.filter((n: Notification) => !n.is_read).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  markRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}`, { is_read: true });
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      // Handle error
    }
  },

  markAllRead: async () => {
    try {
      await api.patch('/notifications/mark-all-read', {});
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      // Handle error
    }
  },
}));
