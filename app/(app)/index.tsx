import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

// This route is rendered by expo-router when (app) stack is shown.
// Actual navigation is handled by AppNavigator in app/index.tsx.
// Just redirect back to root so AppNavigator takes over.
export default function AppIndex() {
  const { user } = useAuthStore();
  if (!user) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/" />;
}
