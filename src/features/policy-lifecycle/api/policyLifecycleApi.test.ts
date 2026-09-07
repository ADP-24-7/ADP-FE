import { describe, expect, it } from 'vitest';
import { getPolicyLifecycle } from './policyLifecycleApi';

describe('policyLifecycleApi', () => {
  it('loads a policy lifecycle by its composite identity', async () => {
    await expect(getPolicyLifecycle('policy-contract', '1.0.0')).resolves.toMatchObject({
      artifactId: 'policy-contract',
      artifactVersion: '1.0.0',
      lifecycleStage: 'ACTIVE',
    });
  });
});
