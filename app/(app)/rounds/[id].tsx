import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import RoundDetailScreen from '../../../src/screens/RoundDetailScreen';
import { useRounds } from '../../../src/hooks/useRounds';

export default function RoundDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rounds, recordPayment } = useRounds();
  const round = rounds.find(r => r.id === id);

  if (!round) return null;

  return (
    <RoundDetailScreen
      round={round}
      onBack={() => {}}
      onRecordPayment={() => {}}
    />
  );
}
