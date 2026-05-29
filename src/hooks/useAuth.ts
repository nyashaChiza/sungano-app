import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth() {
  const { user, token, isLoading, setAuth, loadAuth, logout: storeLogout } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load auth on mount
  useEffect(() => {
    const initAuth = async () => {
      await loadAuth();
      setIsInitialized(true);
    };
    initAuth();
  }, [loadAuth]);

  const register = useCallback(
    async (full_name: string, email: string, phone: string, password: string) => {
      try {
        const body = await authService.register(full_name, email, phone, password);
        const registerData = body?.data ?? body;
        if (registerData?.user && registerData?.access_token) {
          setAuth(registerData.user, registerData.access_token, registerData.refresh_token);
          if (registerData.user?.id) {
            await notificationService.registerForPushNotifications(registerData.user.id);
          }
        }
        return registerData;
      } catch (error) {
        throw error;
      }
    },
    [setAuth]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const body = await authService.login(email, password);
      // Handle both { data: { user, access_token } } and { user, access_token }
      const loginData = body?.data ?? body;
      const accessToken: string = loginData?.access_token ?? loginData?.token;
      const refreshToken: string = loginData?.refresh_token ?? '';

      if (!accessToken) throw new Error('No access token in login response');

      // Persist tokens so the /users/me request can attach the header
      await AsyncStorage.setItem('access_token', accessToken);
      if (refreshToken) await AsyncStorage.setItem('refresh_token', refreshToken);

      // Prefer user from login response; fall back to fetching from /users/me
      let userData = loginData?.user;
      if (!userData) {
        const res = await api.get('/users/me');
        userData = res.data?.data ?? res.data;
      }

      setAuth(userData, accessToken, refreshToken);
      notificationService.setupNotificationHandlers();
      notificationService.registerForPushNotifications(userData?.id ?? '');
      return userData;
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    await storeLogout();
  }, [storeLogout]);

  const verifyPhone = useCallback(async (token: string) => {
    try {
      const response = await authService.verifyPhone(token);
      if (response.data) {
        setAuth(response.data.user, response.data.access_token, response.data.refresh_token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }, [setAuth]);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const response = await authService.verifyEmail(token);
      if (response.data) {
        setAuth(response.data.user, response.data.access_token, response.data.refresh_token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }, [setAuth]);

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    isInitialized,
    login,
    register,
    logout,
    verifyPhone,
    verifyEmail,
  };
}
