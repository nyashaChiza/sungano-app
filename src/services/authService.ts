import api from './api';

export const authService = {
  register: async (
    full_name: string,
    email: string,
    phone: string,
    password: string
  ) => {
    const response = await api.post('/auth/register', {
      full_name,
      email,
      phone,
      password,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  verifyPhone: async (token: string) => {
    const response = await api.post('/auth/verify-phone', {
      verification_token: token,
    });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', {
      verification_token: token,
    });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', {
      reset_token: token,
      new_password: newPassword,
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh-token', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  resendVerificationCode: async (phone: string) => {
    const response = await api.post('/auth/resend-verification-code', {
      phone,
    });
    return response.data;
  },
};
