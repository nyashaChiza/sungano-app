import api from './api';

export const goalsService = {
  getGoals: async () => {
    const response = await api.get('/goals');
    return response.data;
  },

  getGoal: async (id: string) => {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },

  createGoal: async (data: any) => {
    const response = await api.post('/goals', data);
    return response.data;
  },

  updateGoal: async (id: string, data: any) => {
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
  },

  recordDeposit: async (id: string, data: any) => {
    const response = await api.post(`/goals/${id}/deposits`, data);
    return response.data;
  },

  getGoalDeposits: async (id: string) => {
    const response = await api.get(`/goals/${id}/deposits`);
    return response.data;
  },

  getGoalMembers: async (id: string) => {
    const response = await api.get(`/goals/${id}/members`);
    return response.data;
  },
};
