import React from 'react';
import CreateGoalFlow from '../../../src/screens/goals/CreateGoalFlow';
import { useGoals } from '../../../src/hooks/useGoals';

export default function CreateGoalPage() {
  const { createGoal } = useGoals();
  return (
    <CreateGoalFlow
      onBack={() => {}}
      onComplete={async (data) => {
        await createGoal({
          name: data.name,
          emoji: data.emoji,
          type: data.type,
          targetAmount: data.targetAmount,
          currency: data.currency,
          targetDate: data.targetDate,
          depositFrequency: data.depositFrequency,
        });
      }}
    />
  );
}
