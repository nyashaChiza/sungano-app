import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import SplashScreen from '../src/screens/SplashScreen';
import OnboardingScreen from '../src/screens/OnboardingScreen';
import AppNavigator from '../src/navigation/AppNavigator';
import { useAuth } from '../src/hooks/useAuth';
import { useAuthStore } from '../src/store/authStore';
import LoginScreen from './(auth)/login';
import RegisterScreen from './(auth)/register';
import type { User } from '../src/types';

type AppPhase = 'splash' | 'onboarding' | 'login' | 'register' | 'app';

function mapUser(storeUser: NonNullable<ReturnType<typeof useAuth>['user']>): User {
  return {
    id: storeUser.id,
    name: storeUser.full_name,
    phone: storeUser.phone,
    email: storeUser.email,
    avatarUrl: storeUser.profile_photo_url,
    createdAt: new Date().toISOString(),
    trustScore: {
      score: 0,
      tier: 'new',
      onTimePayments: 0,
      totalPayments: 0,
      defaultCount: 0,
      lateCount: 0,
      history: [],
    },
  };
}

export default function AppEntry() {
  const router = useRouter();
  const [phase, setPhase] = useState<AppPhase>('splash');
  const { user, isAuthenticated, isInitialized } = useAuth();
  const { user: storeUser, token: storeToken, pendingInviteToken } = useAuthStore();

  // After authentication, redirect to pending invite if one exists
  useEffect(() => {
    if (storeUser && storeToken && pendingInviteToken) {
      router.push({
        pathname: '/(app)/rounds/join/[token]',
        params: { token: pendingInviteToken },
      });
    }
  }, [storeUser, storeToken, pendingInviteToken]);

  const handleSplashFinish = () => {
    if (isInitialized && isAuthenticated && user) {
      setPhase('app');
    } else {
      setPhase('onboarding');
    }
  };

  // Already authenticated in memory — show app immediately
  if (storeUser && storeToken) {
    return <AppNavigator user={mapUser(storeUser)} />;
  }

  if (phase === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (phase === 'onboarding') {
    return (
      <OnboardingScreen
        onComplete={() => setPhase('login')}
      />
    );
  }

  if (phase === 'register') {
    return (
      <RegisterScreen
        onRegisterSuccess={() => setPhase('app')}
        onLogin={() => setPhase('login')}
      />
    );
  }

  if (phase === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={() => setPhase('app')}
        onRegister={() => setPhase('register')}
      />
    );
  }

  if (!user) {
    return (
      <LoginScreen
        onLoginSuccess={() => setPhase('app')}
        onRegister={() => setPhase('register')}
      />
    );
  }

  return <AppNavigator user={mapUser(user)} />;
}
