import { create } from 'zustand';
import api from '../services/api';

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  target_date: string;
  type: 'solo' | 'group';
  frequency?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  progress_percentage?: number;
  members?: GoalMember[];
}

export interface GoalMember {
  id: string;
  user_id: string;
  user_name: string;
  amount_contributed: number;
}

export interface GoalsState {
  goals: Goal[];
  currentGoal: Goal | null;
  isLoading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  fetchGoal: (id: string) => Promise<void>;
  createGoal: (data: any) => Promise<Goal>;
  reset: () => void;
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: [],
  currentGoal: null,
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/goals');
      set({ goals: res.data.data || res.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/goals/${id}`);
      set({ currentGoal: res.data.data || res.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createGoal: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/goals', data);
      const goal = res.data.data || res.data;
      set((state) => ({
        goals: [...state.goals, goal],
        isLoading: false,
      }));
      return goal;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  reset: () => {
    set({ goals: [], currentGoal: null, isLoading: false, error: null });
  },
}));
