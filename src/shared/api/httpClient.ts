import axios from 'axios';
export const httpClient = axios.create({
  // Local development uses the Vite /v1 proxy. Deployed environments should
  // route /v1 through the same-origin reverse proxy to avoid exposing secrets
  // or duplicating CORS/auth behavior in the browser.
  baseURL: '',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});
