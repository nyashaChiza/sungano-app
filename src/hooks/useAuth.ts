import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types';

const AUTH_TOKEN_KEY = '@sungano/auth_token';
const AUTH_USER_KEY = '@sungano/auth_user';

const MOCK_USER: User = {
  id: 'user-1',
  name: 'Amara Nwosu',
  phone: '+234 801 234 5678',
  email: 'amara@example.com',
  createdAt: '2024-01-15T00:00:00Z',
  trustScore: {
    score: 87,
    tier: 'gold',
    onTimePayments: 23,
    totalPayments: 25,
    defaultCount: 0,
    lateCount: 2,
    history: [
      { date: '2024-12-01', score: 87, event: 'On-time payment', delta: 1 },
      { date: '2024-11-01', score: 86, event: 'On-time payment', delta: 1 },
      { date: '2024-10-15', score: 85, event: 'Late payment', delta: -2 },
      { date: '2024-10-01', score: 87, event: 'On-time payment', delta: 1 },
    ],
  },
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: MOCK_USER,
    token: 'mock-token-123',
    isAuthenticated: true,
    isLoading: false,
  });

  const login = useCallback(async (phone: string, _password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    await new Promise(r => setTimeout(r, 1000));
    const token = 'mock-token-' + Date.now();
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(MOCK_USER));
    setAuthState({
      user: MOCK_USER,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const register = useCallback(async (name: string, phone: string, _password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    await new Promise(r => setTimeout(r, 1200));
    const newUser: User = {
      ...MOCK_USER,
      id: 'user-new-' + Date.now(),
      name,
      phone,
    };
    const token = 'mock-token-' + Date.now();
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    setAuthState({
      user: newUser,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    setAuthState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  return { ...authState, login, register, logout };
}
