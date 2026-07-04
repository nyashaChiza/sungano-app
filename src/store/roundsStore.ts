import { create } from 'zustand';
import api from '../services/api';

export interface Round {
  id: string;
  name: string;
  description?: string;
  contribution_amount: number;
  currency: string;
  cycle_frequency: string;
  status: 'active' | 'completed' | 'cancelled';
  start_date: string;
  number_of_members: number;
  total_cycles: number;
  payout_method: string;
  payout_order_method: string;
  grace_period_days: number;
  late_payment_penalty_percentage: number;
  collateral_required: boolean;
  contract_mode: 'simple' | 'formal';
  invite_token?: string;
  created_at: string;
  updated_at: string;
  current_cycle?: {
    cycle_number: number;
    due_date: string;
    recipient_id: string;
    recipient_name: string;
    payments: Payment[];
  };
}

export interface Payment {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'defaulted' | 'grace';
  due_date: string;
  payment_date?: string;
}

export interface RoundsState {
  rounds: Round[];
  currentRound: Round | null;
  isLoading: boolean;
  error: string | null;
  fetchRounds: () => Promise<void>;
  fetchRound: (id: string) => Promise<void>;
  createRound: (data: any) => Promise<Round>;
  reset: () => void;
}

export const useRoundsStore = create<RoundsState>((set) => ({
  rounds: [],
  currentRound: null,
  isLoading: false,
  error: null,

  fetchRounds: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/rounds/');
      const data = res.data?.data ?? res.data?.results ?? res.data;
      set({ rounds: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchRound: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/rounds/${id}`);
      set({ currentRound: res.data.data || res.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createRound: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/rounds/', data);
      const round = res.data.data || res.data;
      set((state) => ({
        rounds: [...state.rounds, round],
        isLoading: false,
      }));
      return round;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  reset: () => {
    set({ rounds: [], currentRound: null, isLoading: false, error: null });
  },
}));
