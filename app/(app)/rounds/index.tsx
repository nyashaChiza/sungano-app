import React from 'react';
import { useRouter } from 'expo-router';
import RoundsScreen from '../../../src/screens/RoundsScreen';

export default function RoundsTab() {
  const router = useRouter();

  return (
    <RoundsScreen
      onRoundPress={id => router.push({ pathname: '/(app)/rounds/[id]', params: { id } })}
      onCreatePress={() => router.push('/(app)/rounds/create')}
    />
  );
}
