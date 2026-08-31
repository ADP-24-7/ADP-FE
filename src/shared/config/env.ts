type ApiMode = 'mock' | 'real';
type AppEnv = 'local' | 'dev' | 'staging' | 'prod';

export type AppConfig = {
  appEnv: AppEnv;
  apiMode: ApiMode;
  apiBaseUrl: string;
};

export function readApiMode(value: string | undefined): ApiMode {
  if (value === 'mock' || value === 'real') {
    return value;
  }

  throw new Error('Invalid VITE_API_MODE. Expected "mock" or "real".');
}

export function readAppEnv(value: string | undefined): AppEnv {
  if (value === 'local' || value === 'dev' || value === 'staging' || value === 'prod') {
    return value;
  }

  throw new Error('Invalid VITE_APP_ENV. Expected "local", "dev", "staging", or "prod".');
}

export function parseEnv(rawEnv: ImportMetaEnv): AppConfig {
  const appEnv = readAppEnv(rawEnv.VITE_APP_ENV);
  const apiMode = readApiMode(rawEnv.VITE_API_MODE);

  if (appEnv !== 'local' && apiMode === 'mock') {
    throw new Error('Mock API is allowed only in local environment.');
  }

  return {
    appEnv,
    apiMode,
    apiBaseUrl: rawEnv.VITE_API_BASE_URL || 'http://localhost:8080',
  };
}

export const env = parseEnv(import.meta.env);
