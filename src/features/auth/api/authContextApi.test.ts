import { describe, expect, it } from 'vitest';
import { getAuthContext, login, logout } from './authContextApi';

describe('authContextApi', () => {
  it('loads the server-owned principal roles and workload scope', async () => {
    const context = await getAuthContext();

    expect(context).toMatchObject({
      principalId: 'privileged-operator-local',
      principalType: 'USER',
      displayName: 'Local Privileged Operator',
      institutionId: 'institution_local',
      roles: ['PRIVILEGED_OPERATOR'],
      workloadIds: ['*'],
    });
  });

  it('authenticates and closes the user session through the auth boundary', async () => {
    const context = await login('operator-local', 'operator-demo');
    expect(context.principalId).toBe('operator-local');
    await expect(logout()).resolves.toBeUndefined();
  });
});
