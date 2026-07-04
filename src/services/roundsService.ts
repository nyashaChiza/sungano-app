import api from './api';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1');

export const roundsService = {
  getRounds: async () => {
    const response = await api.get('/rounds/');
    return response.data;
  },

  getRound: async (id: string) => {
    const response = await api.get(`/rounds/${id}`);
    return response.data;
  },

  createRound: async (data: any) => {
    const response = await api.post('/rounds/', data);
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

  getRoundLedger: async (id: string) => {
    const response = await api.get(`/rounds/${id}/ledger`);
    return response.data;
  },

  getCurrentCycle: async (id: string) => {
    const response = await api.get(`/cycles/${id}/cycles/current`);
    return response.data;
  },

  getCycles: async (id: string) => {
    const response = await api.get(`/cycles/${id}/cycles`);
    return response.data;
  },

  getCyclePayments: async (cycleId: string) => {
    const response = await api.get(`/cycles/${cycleId}/payments`);
    return response.data;
  },

  generateInviteLink: async (id: string) => {
    const response = await api.post(`/rounds/${id}/invite-link`);
    return response.data;
  },

  signContract: async (contractId: string, signatureData: string) => {
    const response = await api.post(`/contracts/${contractId}/sign`, { signature_data: signatureData });
    return response.data;
  },

  getContract: async (contractId: string) => {
    const response = await api.get(`/contracts/${contractId}`);
    return response.data;
  },

  setPayoutOrder: async (id: string, order: Record<string, number>) => {
    const response = await api.post(`/rounds/${id}/payout-order`, { payout_order: order });
    return response.data;
  },

  dissolveRound: async (id: string) => {
    const response = await api.delete(`/rounds/${id}`);
    return response.data;
  },

  // Submit proof of payment for a cycle (multipart or JSON)
  recordPayment: async (cycleId: string, data: any) => {
    const response = await api.post(`/payments/${cycleId}/payments`, data);
    return response.data;
  },

  // Confirm a payment as recipient
  confirmPayment: async (paymentId: string) => {
    const response = await api.put(`/payments/${paymentId}/confirm`);
    return response.data;
  },

  // Dispute a payment
  disputePayment: async (paymentId: string, reason: string) => {
    const response = await api.put(`/payments/${paymentId}/dispute`, { reason });
    return response.data;
  },

  // Guest preview — tries with auth token if available, works without too
  previewRound: async (inviteToken: string) => {
    const token = await AsyncStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.get(
      `${BASE_URL}/rounds/join/${inviteToken}`,
      { headers, timeout: 15000 }
    );
    return response.data;
  },

  // Join a round (requires auth)
  joinRound: async (inviteToken: string) => {
    const response = await api.post(`/rounds/join/${inviteToken}`, {});
    return response.data;
  },
};
