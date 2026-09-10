import { httpClient } from '../../../shared/api/httpClient';
import type { AuthContext } from '../model/types';

export async function getAuthContext() {
  const response = await httpClient.get<AuthContext>('/api/admin/auth/context');
  return response.data;
}
