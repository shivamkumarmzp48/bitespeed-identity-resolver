import { api } from './api';

export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const signup = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/signup', { email, password });
  return response.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};