import React from 'react';
import GoalsHubScreen from '../../../src/screens/goals/GoalsHubScreen';
import { useGoals } from '../../../src/hooks/useGoals';

export default function GoalsTab() {
  const { goals } = useGoals();
  return (
    <GoalsHubScreen
      goals={goals}
      onGoalPress={() => {}}
      onCreateGoal={() => {}}
    />
  );
}
