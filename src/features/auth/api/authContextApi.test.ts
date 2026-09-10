import { describe, expect, it } from 'vitest';
import { getAuthContext } from './authContextApi';

describe('authContextApi', () => {
  it('loads the server-owned principal roles and workload scope', async () => {
    const context = await getAuthContext();

    expect(context).toMatchObject({
      principalId: 'operator-local',
      principalType: 'USER',
      displayName: 'Local Operator',
      institutionId: 'institution_local',
      roles: ['OPERATOR', 'PRIVILEGED_OPERATOR'],
      workloadIds: ['*'],
    });
  });
});
