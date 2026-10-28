import { httpClient } from '../http/httpClient';
import { UserItem, UserProgress } from '@/domain/entities';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    username: string;
    role: string;
  };
  progress?: UserProgress;
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  token: string;
  user: {
    username: string;
    role: string;
  };
  error?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>('/api/auth/login', credentials);
  },

  async register(credentials: LoginCredentials): Promise<RegisterResponse> {
    return httpClient.post<RegisterResponse>('/api/auth/register', credentials);
  },

  async changePassword(
    payload: ChangePasswordPayload,
    token?: string | null
  ): Promise<{ success: boolean; message: string }> {
    return httpClient.post<{ success: boolean; message: string }>(
      '/api/auth/change-password',
      payload,
      { token }
    );
  },

  async getMe(token?: string | null): Promise<{ user: UserItem }> {
    return httpClient.get<{ success: boolean; user: UserItem }>('/api/auth/me', { token });
  },
};
