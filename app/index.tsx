import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SplashScreen from '../src/screens/SplashScreen';
import OnboardingScreen from '../src/screens/OnboardingScreen';
import AppNavigator from '../src/navigation/AppNavigator';
import { useAuth } from '../src/hooks/useAuth';
import LoginScreen from './(auth)/login';

type AppPhase = 'splash' | 'onboarding' | 'app' | 'login';

export default function AppEntry() {
  const [phase, setPhase] = useState<AppPhase>('splash');
  const { user, isAuthenticated } = useAuth();

  const handleSplashFinish = () => {
    if (isAuthenticated && user) {
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

  if (phase === 'login' || !isAuthenticated || !user) {
    return <LoginScreen onLoginSuccess={() => setPhase('app')} />;
  }

  return <AppNavigator user={user} />;
}
