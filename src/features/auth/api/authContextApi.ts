import { httpClient } from '../../../shared/api/httpClient';
import type { AuthContext } from '../model/types';

export async function getAuthContext() {
  const response = await httpClient.get<AuthContext>('/api/auth/me');
  return response.data;
}

export async function getCsrfToken() {
  const response = await httpClient.get<{ headerName: string; token: string }>('/api/auth/csrf');
  return response.data;
}

export async function login(principalId: string, password: string) {
  await getCsrfToken();
  const response = await httpClient.post<AuthContext>('/api/auth/login', { principalId, password });
  return response.data;
}

export async function logout() {
  await httpClient.post('/api/auth/logout');
}
