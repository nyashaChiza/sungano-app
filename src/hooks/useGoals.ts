import { useCallback, useEffect } from 'react';
import { useGoalsStore } from '../store/goalsStore';
import { goalsService } from '../services/goalsService';

interface CreateGoalData {
  name: string;
  target_amount: number;
  currency: string;
  target_date: string;
  type: 'solo' | 'group';
  frequency?: string;
}

export function useGoals() {
  const { goals, currentGoal, isLoading, error, fetchGoals, fetchGoal, createGoal } =
    useGoalsStore();

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const getGoal = useCallback(
    (id: string) => {
      return goals.find((g) => g.id === id);
    },
    [goals]
  );

  const recordDeposit = useCallback(
    async (goalId: string, amount: number, proofUrl?: string, note?: string) => {
      try {
        const response = await goalsService.recordDeposit(goalId, {
          amount,
          proof_url: proofUrl,
          note,
        });
        await fetchGoal(goalId);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    [fetchGoal]
  );

  const createNewGoal = useCallback(
    async (data: CreateGoalData) => {
      try {
        const newGoal = await createGoal(data);
        return newGoal;
      } catch (error) {
        throw error;
      }
    },
    [createGoal]
  );

  return {
    goals,
    currentGoal,
    isLoading,
    error,
    fetchGoals,
    fetchGoal,
    getGoal,
    recordDeposit,
    createNewGoal,
  };
}
