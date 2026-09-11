type ApiMode = 'mock' | 'real';
type AppEnv = 'local' | 'dev' | 'staging' | 'prod';
type RuntimeProfile = 'local' | 'demo' | 'production-like';
type DataProvenance = 'LOCAL_DEVELOPMENT' | 'SYNTHETIC' | 'NONE';

export type AppConfig = {
  appEnv: AppEnv;
  apiMode: ApiMode;
  apiBaseUrl: string;
  localBffEnabled: boolean;
  runtimeProfile: RuntimeProfile;
  dataProvenance: DataProvenance;
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

function readRuntimeProfile(value: string | undefined): RuntimeProfile {
  if (value === 'local' || value === 'demo' || value === 'production-like') return value;
  return 'production-like';
}

function readDataProvenance(value: string | undefined): DataProvenance {
  if (value === 'LOCAL_DEVELOPMENT' || value === 'SYNTHETIC' || value === 'NONE') return value;
  return 'NONE';
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
    localBffEnabled: appEnv === 'local' && rawEnv.VITE_LOCAL_BFF_ENABLED === 'true',
    runtimeProfile: readRuntimeProfile(rawEnv.VITE_RUNTIME_PROFILE),
    dataProvenance: readDataProvenance(rawEnv.VITE_DATA_PROVENANCE),
  };
}

export const env = parseEnv(import.meta.env);
