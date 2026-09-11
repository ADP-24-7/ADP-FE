import { describe, expect, it } from 'vitest';
import { parseEnv, readApiMode } from './env';

function createEnv(overrides: Partial<ImportMetaEnv>): ImportMetaEnv {
  return {
    BASE_URL: '/',
    DEV: true,
    MODE: 'test',
    PROD: false,
    SSR: false,
    VITE_APP_ENV: 'local',
    VITE_API_MODE: 'mock',
    VITE_API_BASE_URL: 'http://localhost:8080',
    VITE_LOCAL_BFF_ENABLED: 'false',
    VITE_RUNTIME_PROFILE: 'production-like',
    VITE_DATA_PROVENANCE: 'NONE',
    ...overrides,
  };
}

describe('env parsing', () => {
  it('rejects missing or invalid api mode', () => {
    expect(() => readApiMode(undefined)).toThrow('Invalid VITE_API_MODE');
    expect(() => readApiMode('rael')).toThrow('Invalid VITE_API_MODE');
  });

  it('blocks mock api outside local environment', () => {
    expect(() => parseEnv(createEnv({ VITE_APP_ENV: 'prod', VITE_API_MODE: 'mock' }))).toThrow(
      'Mock API is allowed only in local environment',
    );
  });

  it('accepts real api mode in production', () => {
    expect(parseEnv(createEnv({ VITE_APP_ENV: 'prod', VITE_API_MODE: 'real' }))).toMatchObject({
      appEnv: 'prod',
      apiMode: 'real',
    });
  });

  it('enables the credential proxy only in local environment', () => {
    expect(parseEnv(createEnv({ VITE_LOCAL_BFF_ENABLED: 'true' })).localBffEnabled).toBe(true);
    expect(parseEnv(createEnv({ VITE_APP_ENV: 'prod', VITE_API_MODE: 'real', VITE_LOCAL_BFF_ENABLED: 'true' })).localBffEnabled).toBe(false);
  });

  it('reads bounded integration profile and data provenance values', () => {
    const config = parseEnv(createEnv({
      VITE_RUNTIME_PROFILE: 'demo',
      VITE_DATA_PROVENANCE: 'SYNTHETIC',
    }));

    expect(config.runtimeProfile).toBe('demo');
    expect(config.dataProvenance).toBe('SYNTHETIC');
  });
});
