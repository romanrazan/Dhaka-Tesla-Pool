import axios from 'axios';
import { authStorage } from './auth-storage';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  timeout: 12_000,
});

api.interceptors.request.use((config) => {
  const token = authStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) authStorage.clear();
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}

