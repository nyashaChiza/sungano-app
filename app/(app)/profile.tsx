import React from 'react';
import TrustScoreScreen from '../../src/screens/TrustScoreScreen';
import { useAuth } from '../../src/hooks/useAuth';

export default function ProfileTab() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <TrustScoreScreen
      trustScore={user.trustScore}
      userName={user.name}
      onBack={() => {}}
    />
  );
}
