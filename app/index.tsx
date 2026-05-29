import React, { useState } from 'react';
import SplashScreen from '../src/screens/SplashScreen';
import OnboardingScreen from '../src/screens/OnboardingScreen';
import AppNavigator from '../src/navigation/AppNavigator';
import { useAuth } from '../src/hooks/useAuth';
import LoginScreen from './(auth)/login';
import type { User } from '../src/types';

type AppPhase = 'splash' | 'onboarding' | 'login' | 'app';

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
  const [phase, setPhase] = useState<AppPhase>('splash');
  const { user, isAuthenticated, isInitialized } = useAuth();

  const handleSplashFinish = () => {
    if (isInitialized && isAuthenticated && user) {
      setPhase('app');
    } else {
      setPhase('onboarding');
    }
  };

  if (phase === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (phase === 'onboarding') {
    return <OnboardingScreen onComplete={() => setPhase('login')} />;
  }

  if (phase === 'login') {
    return <LoginScreen onLoginSuccess={() => setPhase('app')} />;
  }

  if (!user) {
    return <LoginScreen onLoginSuccess={() => setPhase('app')} />;
  }

  return <AppNavigator user={mapUser(user)} />;
}
