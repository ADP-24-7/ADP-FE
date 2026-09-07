import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8080';
  const localBffEnabled = env.VITE_LOCAL_BFF_ENABLED === 'true';
  const runtimeApiKey = env.ADP_LOCAL_RUNTIME_API_KEY;
  const localUserId = env.ADP_LOCAL_USER_ID || 'operator-local';
  const localUserRoles = env.ADP_LOCAL_USER_ROLES || 'OPERATOR,PRIVILEGED_OPERATOR';

  if (localBffEnabled && !runtimeApiKey) {
    throw new Error('ADP_LOCAL_RUNTIME_API_KEY is required when VITE_LOCAL_BFF_ENABLED=true.');
  }

  const runtimeHeaders = localBffEnabled ? { 'X-ADP-API-Key': runtimeApiKey } : undefined;
  const adminHeaders = localBffEnabled
    ? { 'X-ADP-User-Id': localUserId, 'X-ADP-User-Roles': localUserRoles }
    : undefined;

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      globals: true,
    },
    server: {
      port: 5173,
      proxy: {
        '/v1': {
          target: apiBaseUrl,
          changeOrigin: true,
          headers: runtimeHeaders,
        },
        '/api/admin': {
          target: apiBaseUrl,
          changeOrigin: true,
          headers: adminHeaders,
        },
        '/api/runtime': {
          target: apiBaseUrl,
          changeOrigin: true,
          headers: runtimeHeaders,
        },
        '/api/internal': {
          target: apiBaseUrl,
          changeOrigin: true,
          headers: runtimeHeaders,
        },
        '/actuator': {
          target: apiBaseUrl,
          changeOrigin: true,
          headers: runtimeHeaders,
        },
      },
    },
  };
});
