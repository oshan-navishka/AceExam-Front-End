import api from './api';
import { LoginPayload, RegisterPayload, AuthResponse } from '../types';

export const authService = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', data),

  getProfile: () =>
    api.get<{ success: boolean; user: AuthResponse['user'] }>('/auth/profile'),
};
