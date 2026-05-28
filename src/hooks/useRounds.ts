import { useState, useCallback } from 'react';
import { Round, Payment, ProofType } from '../types';

const MOCK_ROUNDS: Round[] = [
  {
    id: 'round-1',
    name: 'Lagos Friends Circle',
    amount: 50000,
    currency: 'NGN',
    frequency: 'monthly',
    status: 'active',
    createdAt: '2024-09-01T00:00:00Z',
    startDate: '2024-10-01T00:00:00Z',
    adminId: 'user-1',
    myMemberId: 'member-1',
    currentCycleIndex: 2,
    members: [
      { id: 'member-1', userId: 'user-1', name: 'Amara Nwosu', payoutOrder: 1, trustScore: 87, currentPaymentStatus: 'paid' },
      { id: 'member-2', userId: 'user-2', name: 'Chidi Okafor', payoutOrder: 2, trustScore: 92, currentPaymentStatus: 'paid' },
      { id: 'member-3', userId: 'user-3', name: 'Fatima Abubakar', payoutOrder: 3, trustScore: 78, currentPaymentStatus: 'pending' },
      { id: 'member-4', userId: 'user-4', name: 'Emeka Eze', payoutOrder: 4, trustScore: 85, currentPaymentStatus: 'paid' },
      { id: 'member-5', userId: 'user-5', name: 'Ngozi Adeyemi', payoutOrder: 5, trustScore: 65, currentPaymentStatus: 'grace' },
    ],
    cycles: [
      {
        id: 'cycle-1', roundId: 'round-1', cycleNumber: 1, recipientMemberId: 'member-1',
        dueDate: '2024-10-31T00:00:00Z', paidAt: '2024-10-28T00:00:00Z',
        status: 'complete',
        payments: [],
      },
      {
        id: 'cycle-2', roundId: 'round-1', cycleNumber: 2, recipientMemberId: 'member-2',
        dueDate: '2024-11-30T00:00:00Z', paidAt: '2024-11-27T00:00:00Z',
        status: 'complete',
        payments: [],
      },
      {
        id: 'cycle-3', roundId: 'round-1', cycleNumber: 3, recipientMemberId: 'member-3',
        dueDate: '2024-12-31T00:00:00Z',
        status: 'active',
        payments: [
          { id: 'pay-1', cycleId: 'cycle-3', memberId: 'member-1', amount: 50000, currency: 'NGN', status: 'confirmed', paidAt: '2024-12-05T00:00:00Z', confirmedAt: '2024-12-06T00:00:00Z' },
          { id: 'pay-2', cycleId: 'cycle-3', memberId: 'member-2', amount: 50000, currency: 'NGN', status: 'confirmed', paidAt: '2024-12-04T00:00:00Z', confirmedAt: '2024-12-05T00:00:00Z' },
          { id: 'pay-3', cycleId: 'cycle-3', memberId: 'member-3', amount: 50000, currency: 'NGN', status: 'pending' },
          { id: 'pay-4', cycleId: 'cycle-3', memberId: 'member-4', amount: 50000, currency: 'NGN', status: 'confirmed', paidAt: '2024-12-03T00:00:00Z', confirmedAt: '2024-12-04T00:00:00Z' },
          { id: 'pay-5', cycleId: 'cycle-3', memberId: 'member-5', amount: 50000, currency: 'NGN', status: 'grace', graceDeadline: '2024-12-20T00:00:00Z' },
        ],
      },
      {
        id: 'cycle-4', roundId: 'round-1', cycleNumber: 4, recipientMemberId: 'member-4',
        dueDate: '2025-01-31T00:00:00Z',
        status: 'upcoming',
        payments: [],
      },
      {
        id: 'cycle-5', roundId: 'round-1', cycleNumber: 5, recipientMemberId: 'member-5',
        dueDate: '2025-02-28T00:00:00Z',
        status: 'upcoming',
        payments: [],
      },
    ],
  },
  {
    id: 'round-2',
    name: 'Market Traders Ajo',
    amount: 25000,
    currency: 'NGN',
    frequency: 'weekly',
    status: 'active',
    createdAt: '2024-11-01T00:00:00Z',
    startDate: '2024-11-15T00:00:00Z',
    adminId: 'user-6',
    myMemberId: 'member-6',
    currentCycleIndex: 5,
    members: [
      { id: 'member-6', userId: 'user-1', name: 'Amara Nwosu', payoutOrder: 3, trustScore: 87, currentPaymentStatus: 'pending' },
      { id: 'member-7', userId: 'user-7', name: 'Bisi Adewale', payoutOrder: 1, trustScore: 90, currentPaymentStatus: 'paid' },
      { id: 'member-8', userId: 'user-8', name: 'Kemi Oduola', payoutOrder: 2, trustScore: 75, currentPaymentStatus: 'overdue' },
    ],
    cycles: [
      {
        id: 'cycle-w1', roundId: 'round-2', cycleNumber: 1, recipientMemberId: 'member-7',
        dueDate: '2024-11-22T00:00:00Z', paidAt: '2024-11-21T00:00:00Z', status: 'complete',
        payments: [],
      },
      {
        id: 'cycle-w2', roundId: 'round-2', cycleNumber: 2, recipientMemberId: 'member-8',
        dueDate: '2024-11-29T00:00:00Z', status: 'active',
        payments: [
          { id: 'pay-w1', cycleId: 'cycle-w2', memberId: 'member-6', amount: 25000, currency: 'NGN', status: 'pending' },
          { id: 'pay-w2', cycleId: 'cycle-w2', memberId: 'member-7', amount: 25000, currency: 'NGN', status: 'paid', paidAt: '2024-11-27T00:00:00Z' },
          { id: 'pay-w3', cycleId: 'cycle-w2', memberId: 'member-8', amount: 25000, currency: 'NGN', status: 'overdue' },
        ],
      },
    ],
  },
];

export function useRounds() {
  const [rounds, setRounds] = useState<Round[]>(MOCK_ROUNDS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRounds = useCallback(async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setRounds(MOCK_ROUNDS);
    setIsLoading(false);
  }, []);

  const getRound = useCallback((id: string): Round | undefined => {
    return rounds.find(r => r.id === id);
  }, [rounds]);

  const recordPayment = useCallback(async (
    roundId: string,
    cycleId: string,
    amount: number,
    proofType: ProofType,
    proofUri: string,
    note?: string
  ): Promise<void> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setRounds(prev => prev.map(round => {
      if (round.id !== roundId) return round;
      return {
        ...round,
        cycles: round.cycles.map(cycle => {
          if (cycle.id !== cycleId) return cycle;
          const newPayment: Payment = {
            id: 'pay-new-' + Date.now(),
            cycleId,
            memberId: round.myMemberId,
            amount,
            currency: round.currency,
            status: 'paid',
            paidAt: new Date().toISOString(),
            proofType,
            proofUrl: proofUri,
            note,
          };
          return { ...cycle, payments: [...cycle.payments, newPayment] };
        }),
        members: round.members.map(m => {
          if (m.id !== round.myMemberId) return m;
          return { ...m, currentPaymentStatus: 'paid' as const };
        }),
      };
    }));
    setIsLoading(false);
  }, []);

  return { rounds, isLoading, error, fetchRounds, getRound, recordPayment };
}
