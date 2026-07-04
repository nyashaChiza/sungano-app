import { useCallback, useEffect } from 'react';
import { useRoundsStore } from '../store/roundsStore';
import api from '../services/api';

export function useRounds() {
  const { rounds, currentRound, isLoading, error, fetchRounds, fetchRound, createRound } =
    useRoundsStore();

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  const getRound = useCallback(
    (id: string) => rounds.find((r) => r.id === id),
    [rounds]
  );

  // Submit proof of payment for a cycle
  const submitProof = useCallback(
    async (cycleId: string, formData: FormData) => {
      const response = await api.post(`/payments/${cycleId}/payments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    []
  );

  // Confirm a payment as recipient
  const confirmPayment = useCallback(async (paymentId: string) => {
    const response = await api.put(`/payments/${paymentId}/confirm`);
    return response.data;
  }, []);

  // Dispute a payment
  const disputePayment = useCallback(async (paymentId: string, reason: string) => {
    const response = await api.put(`/payments/${paymentId}/dispute`, { reason });
    return response.data;
  }, []);

  const createNewRound = useCallback(
    async (data: any) => createRound(data),
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
    submitProof,
    confirmPayment,
    disputePayment,
    createNewRound,
  };
}
