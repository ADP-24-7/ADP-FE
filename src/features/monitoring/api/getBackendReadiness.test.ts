import { describe, expect, it } from 'vitest';
import { getBackendReadiness } from './getBackendReadiness';

describe('getBackendReadiness', () => {
  it('uses the backend readiness actuator contract', async () => {
    await expect(getBackendReadiness()).resolves.toEqual({ status: 'UP' });
  });
});
