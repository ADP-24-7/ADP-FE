import { describe, expect, it } from 'vitest';
import { normalizeApiError } from '../../../shared/api/apiError';
import {
  activatePolicyLifecycle,
  approvePolicyLifecycle,
  createPolicyLifecycle,
  getPolicyCurrentSelection,
  getPolicyLifecycle,
  rollbackPolicyLifecycle,
  runPolicyShadowEvaluation,
  transitionPolicyLifecycle,
} from './policyLifecycleApi';

describe('policyLifecycleApi', () => {
  it('creates a workload-scoped AI policy artifact', async () => {
    await expect(createPolicyLifecycle({
      artifactId: 'candidate-policy-contract',
      artifactVersion: '2.0.0',
      artifactDigest: 'f'.repeat(64),
      policyLayer: 'WORKLOAD',
      executionPack: 'AI',
      workloadId: 'customer_summary',
      purposeCode: 'CUSTOMER_SUPPORT',
    })).resolves.toMatchObject({ lifecycleStage: 'DRAFT', revision: 0 });
  });

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
      result: 'MATCH',
      diffFields: [],
    });
  });

  it('advances lifecycle and binds approval to shadow evidence', async () => {
    await expect(transitionPolicyLifecycle('candidate-policy-contract', '2.0.0', {
      targetStage: 'SHADOW',
      reasonCode: 'SHADOW_PASSED',
    })).resolves.toMatchObject({ lifecycleStage: 'SHADOW', revision: 5 });

    await expect(approvePolicyLifecycle('candidate-policy-contract', '2.0.0', {
      shadowEvaluationId: 'shadow-contract',
    })).resolves.toMatchObject({ lifecycleStage: 'APPROVED', revision: 6 });
  });

  it('loads, activates, and rolls back the authoritative current selection', async () => {
    const params = { executionPack: 'AI' as const, workloadId: 'customer_summary', purposeCode: 'CUSTOMER_SUPPORT' };
    await expect(getPolicyCurrentSelection(params)).resolves.toMatchObject({
      artifactId: 'active-policy-contract',
      artifactRevision: 7,
      selectionRevision: 3,
    });

    await expect(activatePolicyLifecycle('candidate-policy-contract', '2.0.0', {
      expectedArtifactRevision: 6,
      expectedSelectionRevision: 3,
    })).resolves.toMatchObject({ artifactId: 'candidate-policy-contract', selectionRevision: 4 });

    await expect(rollbackPolicyLifecycle('active-policy-contract', '1.0.0', {
      expectedTargetRevision: 8,
      expectedSelectionRevision: 4,
    })).resolves.toMatchObject({ artifactId: 'active-policy-contract', selectionRevision: 5 });
  });

  it('preserves BE governance failure reason codes', async () => {
    const diffApproval = approvePolicyLifecycle('candidate-policy-contract', '2.0.0', {
      shadowEvaluationId: 'shadow-diff',
    });
    await expect(diffApproval).rejects.toMatchObject({ response: { status: 422 } });
    await diffApproval.catch((error: unknown) => {
      expect(normalizeApiError(error)).toMatchObject({
        status: 422,
        errorCode: 'POLICY_SHADOW_DIFF_NOT_APPROVABLE',
      });
    });

    await expect(transitionPolicyLifecycle('candidate-policy-contract', '2.0.0', {
      targetStage: 'APPROVED',
      reasonCode: 'APPROVAL_GRANTED',
    })).rejects.toMatchObject({ response: { status: 422 } });

    await expect(activatePolicyLifecycle('candidate-policy-contract', '2.0.0', {
      expectedArtifactRevision: 5,
      expectedSelectionRevision: 2,
    })).rejects.toMatchObject({ response: { status: 409 } });

    await expect(rollbackPolicyLifecycle('active-policy-contract', '1.0.0', {
      expectedTargetRevision: 7,
      expectedSelectionRevision: 3,
    })).rejects.toMatchObject({ response: { status: 409 } });
  });
});
