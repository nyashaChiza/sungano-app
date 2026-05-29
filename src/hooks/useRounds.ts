import { useCallback, useEffect } from 'react';
import { useRoundsStore } from '../store/roundsStore';
import { roundsService } from '../services/roundsService';

export function useRounds() {
  const { rounds, currentRound, isLoading, error, fetchRounds, fetchRound, createRound } =
    useRoundsStore();

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  const getRound = useCallback(
    (id: string) => {
      return rounds.find((r) => r.id === id);
    },
    [rounds]
  );

  const recordPayment = useCallback(
    async (roundId: string, amount: number, proofUrl?: string, note?: string) => {
      try {
        const response = await roundsService.recordPayment(roundId, {
          amount,
          proof_url: proofUrl,
          note,
        });
        await fetchRound(roundId);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    [fetchRound]
  );

  const createNewRound = useCallback(
    async (data: any) => {
      try {
        const newRound = await createRound(data);
        return newRound;
      } catch (error) {
        throw error;
      }
    },
    [createRound]
  );

  return {
    rounds,
    currentRound,
    isLoading,
    error,
    fetchRounds,
    fetchRound,
    getRound,
    recordPayment,
    createNewRound,
  };
}
