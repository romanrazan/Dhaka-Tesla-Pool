import { api } from '@/lib/api';
import { AuthResponse, User } from '@/types';

export const authService = {
  login: async (values: { email: string; password: string }) =>
    (await api.post<AuthResponse>('/auth/login', values)).data,
  register: async (values: { name: string; email: string; phone?: string; password: string }) =>
    (await api.post<AuthResponse>('/auth/register', values)).data,
  me: async () => (await api.get<User>('/auth/me')).data,
};

