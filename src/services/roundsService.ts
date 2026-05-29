import api from './api';

export const roundsService = {
  getRounds: async () => {
    const response = await api.get('/rounds');
    return response.data;
  },

  getRound: async (id: string) => {
    const response = await api.get(`/rounds/${id}`);
    return response.data;
  },

  createRound: async (data: any) => {
    const response = await api.post('/rounds', data);
    return response.data;
  },

  updateRound: async (id: string, data: any) => {
    const response = await api.put(`/rounds/${id}`, data);
    return response.data;
  },

  getRoundMembers: async (id: string) => {
    const response = await api.get(`/rounds/${id}/members`);
    return response.data;
  },

  recordPayment: async (id: string, data: any) => {
    const response = await api.post(`/rounds/${id}/payments`, data);
    return response.data;
  },

  getRoundLedger: async (id: string) => {
    const response = await api.get(`/rounds/${id}/ledger`);
    return response.data;
  },

  getCurrentCycle: async (id: string) => {
    const response = await api.get(`/rounds/${id}/current-cycle`);
    return response.data;
  },

  signContract: async (id: string, data: any) => {
    const response = await api.post(`/rounds/${id}/sign-contract`, data);
    return response.data;
  },

  joinRound: async (inviteToken: string) => {
    const response = await api.post(`/rounds/join/${inviteToken}`, {});
    return response.data;
  },

  previewRound: async (inviteToken: string) => {
    const response = await api.get(`/rounds/preview/${inviteToken}`);
    return response.data;
  },
};
