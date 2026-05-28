import React from 'react';
import { View } from 'react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { useAuth } from '../../src/hooks/useAuth';

export default function HomeTab() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <HomeScreen
      user={user}
      onRoundPress={() => {}}
      onGoalPress={() => {}}
      onCreatePress={() => {}}
      onTrustPress={() => {}}
    />
  );
}
