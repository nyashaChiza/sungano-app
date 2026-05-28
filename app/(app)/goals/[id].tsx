import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import GoalDetailScreen from '../../../src/screens/goals/GoalDetailScreen';
import { useGoals } from '../../../src/hooks/useGoals';

export default function GoalDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals } = useGoals();
  const goal = goals.find(g => g.id === id);

  if (!goal) return null;

  return (
    <GoalDetailScreen
      goal={goal}
      onBack={() => {}}
      onDeposit={() => {}}
    />
  );
}
