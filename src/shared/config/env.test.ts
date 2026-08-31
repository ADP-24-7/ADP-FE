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
});
