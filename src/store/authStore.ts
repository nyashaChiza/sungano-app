import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profile_photo_url?: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  pendingInviteToken: string | null;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  loadAuth: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  setPendingInviteToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  pendingInviteToken: null,

  setAuth: (user, token, refreshToken) => {
    set({ user, token, refreshToken });
    AsyncStorage.setItem('access_token', token);
    AsyncStorage.setItem('refresh_token', refreshToken);
  },

  loadAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('access_token');
      const refreshToken = await AsyncStorage.getItem('refresh_token');

      if (token && refreshToken) {
        try {
          const res = await api.get('/users/me');
          set({
            user: res.data.data,
            token,
            refreshToken,
            isLoading: false,
          });
        } catch (error) {
          // Token expired or invalid, clear storage
          await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
          set({
            user: null,
            token: null,
            refreshToken: null,
            isLoading: false,
          });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    set({ user: null, token: null, refreshToken: null });
  },

  updateUser: (data) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },

  setPendingInviteToken: (token) => {
    set({ pendingInviteToken: token });
  },
}));
