import { httpClient } from '../../../shared/api/httpClient';
import type { AuthContext } from '../model/types';

type CsrfToken = {
  headerName: string;
  token: string;
};

let csrfHeaderName: string | undefined;

function applyCsrfToken(csrf: CsrfToken) {
  if (csrfHeaderName && csrfHeaderName !== csrf.headerName) {
    delete httpClient.defaults.headers.common[csrfHeaderName];
  }
  csrfHeaderName = csrf.headerName;
  httpClient.defaults.headers.common[csrf.headerName] = csrf.token;
}

function clearCsrfToken() {
  if (csrfHeaderName) {
    delete httpClient.defaults.headers.common[csrfHeaderName];
  }
  csrfHeaderName = undefined;
}

export async function getAuthContext() {
  const response = await httpClient.get<AuthContext>('/api/auth/me');
  await getCsrfToken();
  return response.data;
}

export async function getCsrfToken() {
  const response = await httpClient.get<CsrfToken>('/api/auth/csrf');
  applyCsrfToken(response.data);
  return response.data;
}

export async function login(principalId: string, password: string) {
  const csrf = await getCsrfToken();
  const response = await httpClient.post<AuthContext>(
    '/api/auth/login',
    { principalId, password },
    { headers: { [csrf.headerName]: csrf.token } },
  );
  await getCsrfToken();
  return response.data;
}

export async function logout() {
  const csrf = await getCsrfToken();
  try {
    await httpClient.post('/api/auth/logout', undefined, {
      headers: { [csrf.headerName]: csrf.token },
    });
  } finally {
    clearCsrfToken();
  }
}
