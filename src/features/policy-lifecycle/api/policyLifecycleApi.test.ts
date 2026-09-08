import { describe, expect, it } from 'vitest';
import { getPolicyLifecycle, runPolicyShadowEvaluation } from './policyLifecycleApi';

describe('policyLifecycleApi', () => {
  it('loads a policy lifecycle by its composite identity', async () => {
    await expect(getPolicyLifecycle('policy-contract', '1.0.0')).resolves.toMatchObject({
      artifactId: 'policy-contract',
      artifactVersion: '1.0.0',
      lifecycleStage: 'ACTIVE',
    });
  });

  it('runs a raw-free shadow evaluation for a replay candidate', async () => {
    await expect(runPolicyShadowEvaluation('candidate-policy-contract', '2.0.0', {
      evaluationCaseId: 'GOLDEN_ALLOW',
    })).resolves.toMatchObject({
      candidateArtifactId: 'candidate-policy-contract',
      evaluationCaseId: 'GOLDEN_ALLOW',
      result: 'DIFF',
      diffFields: ['FINAL_ACTION'],
    });
  });
});
