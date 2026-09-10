import axios from 'axios';

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | undefined;

export function configureUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
}

export const httpClient = axios.create({
  // Local development uses the Vite /v1 proxy. Deployed environments should
  // route /v1 through the same-origin reverse proxy to avoid exposing secrets
  // or duplicating CORS/auth behavior in the browser.
  baseURL: '',
  timeout: 10_000,
  withCredentials: true,
  // Spring returns the request token from /api/auth/csrf. The auth boundary
  // installs that value explicitly so Axios does not replace it with the raw
  // cookie token when dispatching a browser request.
  withXSRFToken: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? '';
      const expectedAuthenticationFailure = requestUrl.includes('/api/auth/login')
        || requestUrl.includes('/api/auth/me');
      if (!expectedAuthenticationFailure) unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);
