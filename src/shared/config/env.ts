type ApiMode = 'mock' | 'real';
type AppEnv = 'local' | 'dev' | 'staging' | 'prod';

function readApiMode(value: string | undefined): ApiMode {
  return value === 'real' ? 'real' : 'mock';
}

function readAppEnv(value: string | undefined): AppEnv {
  if (value === 'dev' || value === 'staging' || value === 'prod') {
    return value;
  }

  return 'local';
}

export const env = {
  appEnv: readAppEnv(import.meta.env.VITE_APP_ENV),
  apiMode: readApiMode(import.meta.env.VITE_API_MODE),
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
} as const;
