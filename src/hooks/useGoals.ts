import { useState, useCallback } from 'react';
import { Goal, GoalDeposit, ProofType, DepositFrequency, GoalType } from '../types';

const MOCK_GOALS: Goal[] = [
  {
    id: 'goal-1',
    name: 'New Laptop',
    emoji: '💻',
    type: 'solo',
    targetAmount: 450000,
    currentAmount: 315000,
    currency: 'NGN',
    targetDate: '2025-03-31T00:00:00Z',
    status: 'active',
    depositFrequency: 'monthly',
    suggestedDepositAmount: 45000,
    createdAt: '2024-09-01T00:00:00Z',
    adminId: 'user-1',
    myMemberId: 'member-goal-1',
    milestones: [
      { id: 'ms-1', percentage: 25, label: '25%', reachedAt: '2024-10-15T00:00:00Z' },
      { id: 'ms-2', percentage: 50, label: '50%', reachedAt: '2024-11-20T00:00:00Z' },
      { id: 'ms-3', percentage: 75, label: '75%' },
      { id: 'ms-4', percentage: 100, label: 'Done!' },
    ],
    deposits: [
      { id: 'dep-1', goalId: 'goal-1', memberId: 'member-goal-1', memberName: 'Amara Nwosu', amount: 45000, currency: 'NGN', depositDate: '2024-10-01T00:00:00Z', recordedAt: '2024-10-01T00:00:00Z', status: 'confirmed' },
      { id: 'dep-2', goalId: 'goal-1', memberId: 'member-goal-1', memberName: 'Amara Nwosu', amount: 45000, currency: 'NGN', depositDate: '2024-11-01T00:00:00Z', recordedAt: '2024-11-01T00:00:00Z', status: 'confirmed' },
      { id: 'dep-3', goalId: 'goal-1', memberId: 'member-goal-1', memberName: 'Amara Nwosu', amount: 45000, currency: 'NGN', depositDate: '2024-12-01T00:00:00Z', recordedAt: '2024-12-01T00:00:00Z', status: 'confirmed' },
      { id: 'dep-4', goalId: 'goal-1', memberId: 'member-goal-1', memberName: 'Amara Nwosu', amount: 45000, currency: 'NGN', depositDate: '2024-12-15T00:00:00Z', recordedAt: '2024-12-15T00:00:00Z', status: 'confirmed' },
      { id: 'dep-5', goalId: 'goal-1', memberId: 'member-goal-1', memberName: 'Amara Nwosu', amount: 45000, currency: 'NGN', depositDate: '2024-12-22T00:00:00Z', recordedAt: '2024-12-22T00:00:00Z', status: 'confirmed' },
      { id: 'dep-6', goalId: 'goal-1', memberId: 'member-goal-1', memberName: 'Amara Nwosu', amount: 45000, currency: 'NGN', depositDate: '2024-12-29T00:00:00Z', recordedAt: '2024-12-29T00:00:00Z', status: 'pending' },
      { id: 'dep-7', goalId: 'goal-1', memberId: 'member-goal-1', memberName: 'Amara Nwosu', amount: 45000, currency: 'NGN', depositDate: '2025-01-05T00:00:00Z', recordedAt: '2025-01-05T00:00:00Z', status: 'pending' },
    ],
    targetAccount: {
      id: 'acct-1',
      bankName: 'Access Bank',
      accountName: 'Amara Nwosu',
      accountNumber: '0123456789',
      type: 'savings',
    },
  },
  {
    id: 'goal-2',
    name: 'Family Holiday',
    emoji: '✈️',
    type: 'group',
    targetAmount: 1200000,
    currentAmount: 480000,
    currency: 'NGN',
    targetDate: '2025-06-30T00:00:00Z',
    status: 'active',
    depositFrequency: 'monthly',
    suggestedDepositAmount: 60000,
    createdAt: '2024-10-01T00:00:00Z',
    adminId: 'user-1',
    myMemberId: 'gm-1',
    milestones: [
      { id: 'ms-5', percentage: 25, label: '25%', reachedAt: '2024-11-15T00:00:00Z' },
      { id: 'ms-6', percentage: 50, label: '50%' },
      { id: 'ms-7', percentage: 75, label: '75%' },
      { id: 'ms-8', percentage: 100, label: 'Let\'s go!' },
    ],
    members: [
      { id: 'gm-1', userId: 'user-1', name: 'Amara Nwosu', splitPercentage: 40, targetAmount: 480000, currentAmount: 200000, trustScore: 87 },
      { id: 'gm-2', userId: 'user-2', name: 'Chidi Okafor', splitPercentage: 35, targetAmount: 420000, currentAmount: 180000, trustScore: 92 },
      { id: 'gm-3', userId: 'user-3', name: 'Fatima Abubakar', splitPercentage: 25, targetAmount: 300000, currentAmount: 100000, trustScore: 78 },
    ],
    deposits: [
      { id: 'dep-g1', goalId: 'goal-2', memberId: 'gm-1', memberName: 'Amara Nwosu', amount: 60000, currency: 'NGN', depositDate: '2024-11-01T00:00:00Z', recordedAt: '2024-11-01T00:00:00Z', status: 'confirmed' },
      { id: 'dep-g2', goalId: 'goal-2', memberId: 'gm-2', memberName: 'Chidi Okafor', amount: 60000, currency: 'NGN', depositDate: '2024-11-03T00:00:00Z', recordedAt: '2024-11-03T00:00:00Z', status: 'confirmed' },
      { id: 'dep-g3', goalId: 'goal-2', memberId: 'gm-3', memberName: 'Fatima Abubakar', amount: 40000, currency: 'NGN', depositDate: '2024-11-05T00:00:00Z', recordedAt: '2024-11-05T00:00:00Z', status: 'confirmed' },
    ],
    targetAccount: {
      id: 'acct-2',
      bankName: 'GTBank',
      accountName: 'Family Holiday Fund',
      accountNumber: '9876543210',
      type: 'savings',
    },
  },
];

interface CreateGoalData {
  name: string;
  emoji: string;
  type: GoalType;
  targetAmount: number;
  currency: string;
  targetDate: string;
  depositFrequency: DepositFrequency;
  memberIds?: string[];
  splits?: Record<string, number>;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setGoals(MOCK_GOALS);
    setIsLoading(false);
  }, []);

  const getGoal = useCallback((id: string): Goal | undefined => {
    return goals.find(g => g.id === id);
  }, [goals]);

  const recordDeposit = useCallback(async (
    goalId: string,
    amount: number,
    proofType: ProofType,
    proofUri: string,
    depositDate: string,
    note?: string
  ): Promise<void> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setGoals(prev => prev.map(goal => {
      if (goal.id !== goalId) return goal;
      const newDeposit: GoalDeposit = {
        id: 'dep-new-' + Date.now(),
        goalId,
        memberId: goal.myMemberId,
        memberName: 'Amara Nwosu',
        amount,
        currency: goal.currency,
        depositDate,
        recordedAt: new Date().toISOString(),
        proofType,
        proofUrl: proofUri,
        note,
        status: 'pending',
      };
      return {
        ...goal,
        currentAmount: goal.currentAmount + amount,
        deposits: [newDeposit, ...goal.deposits],
      };
    }));
    setIsLoading(false);
  }, []);

  const createGoal = useCallback(async (data: CreateGoalData): Promise<Goal> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const newGoal: Goal = {
      id: 'goal-new-' + Date.now(),
      name: data.name,
      emoji: data.emoji,
      type: data.type,
      targetAmount: data.targetAmount,
      currentAmount: 0,
      currency: data.currency,
      targetDate: data.targetDate,
      status: 'active',
      depositFrequency: data.depositFrequency,
      suggestedDepositAmount: Math.ceil(data.targetAmount / 10),
      createdAt: new Date().toISOString(),
      adminId: 'user-1',
      myMemberId: 'gm-new-1',
      milestones: [
        { id: 'ms-n1', percentage: 25, label: '25%' },
        { id: 'ms-n2', percentage: 50, label: '50%' },
        { id: 'ms-n3', percentage: 75, label: '75%' },
        { id: 'ms-n4', percentage: 100, label: 'Done!' },
      ],
      deposits: [],
    };
    setGoals(prev => [newGoal, ...prev]);
    setIsLoading(false);
    return newGoal;
  }, []);

  return { goals, isLoading, error, fetchGoals, getGoal, recordDeposit, createGoal };
}
