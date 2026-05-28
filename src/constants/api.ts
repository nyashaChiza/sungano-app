export const API_BASE_URL = 'https://api.sungano.app/v1';

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  rounds: {
    list: '/rounds',
    detail: (id: string) => `/rounds/${id}`,
    create: '/rounds',
    payment: (id: string) => `/rounds/${id}/payments`,
  },
  goals: {
    list: '/goals',
    detail: (id: string) => `/goals/${id}`,
    create: '/goals',
    deposit: (id: string) => `/goals/${id}/deposits`,
    members: (id: string) => `/goals/${id}/members`,
  },
  trust: {
    score: '/trust/score',
    history: '/trust/history',
  },
  users: {
    profile: '/users/me',
    update: '/users/me',
    search: '/users/search',
  },
} as const;
