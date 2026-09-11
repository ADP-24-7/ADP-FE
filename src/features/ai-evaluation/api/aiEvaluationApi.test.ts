import { describe, expect, it } from 'vitest';
import { getAiCalibrationEvidence, getAiEvaluationBundle, getAiEvaluationReadiness, getAiTransformGovernanceProfile } from './aiEvaluationApi';

describe('aiEvaluationApi', () => {
  it('normalizes readiness snake_case into the FE domain model', async () => {
    await expect(getAiEvaluationReadiness('ai-eval-da-provenance-2026-09-10-r2')).resolves.toMatchObject({
      status: 'READY',
      bundleAvailable: true,
      completeEvidenceCount: 3,
      caseModels: expect.arrayContaining([
        expect.objectContaining({ evalCaseId: 'customer-summary-da-10832-001', runtimeStatus: 'BLOCKED' }),
      ]),
    });
  });

  it('normalizes bundle identity and failure summary', async () => {
    await expect(getAiEvaluationBundle('ai-eval-da-provenance-2026-09-10-r2')).resolves.toMatchObject({
      manifest: { schemaVersion: 'adp-ai-evaluation-bundle/v2', executionCount: 3 },
      failureSummary: { evaluatedExecutionCount: 3, sentUnknown: 0 },
    });
  });

  it('normalizes the immutable E2 field-control requirement profile', async () => {
    await expect(getAiTransformGovernanceProfile('ai-experiment-02-financial-regulatory-v5')).resolves.toMatchObject({
      workloadId: 'customer_summary',
      purposeCode: 'CUSTOMER_SUPPORT',
      e2ValidationStatus: 'E2_POLICY_REQUIREMENT_VALIDATED',
      providerGovernanceStatus: 'PROVIDER_GOVERNANCE_BLOCKED',
      externalExecutionStatus: 'PENDING_EXTERNAL_EXECUTION',
      providerCallAuthorized: false,
      fieldControls: expect.arrayContaining([
        expect.objectContaining({
          fieldName: 'transaction.amount',
          fieldRequirement: 'REQUIRED_EXACT',
          currentRuntimeMethod: 'GENERALIZE',
          requiredTransformMethod: 'KEEP',
          currentRuntimeRequirementMatch: false,
        }),
      ]),
      requirementEnforcementGaps: expect.arrayContaining([
        expect.objectContaining({ fieldName: 'account.balance' }),
        expect.objectContaining({ fieldName: 'transaction.amount' }),
      ]),
    });
  });

  it('normalizes privacy-safe response finding calibration evidence', async () => {
    await expect(getAiCalibrationEvidence('ai-eval-da-provenance-2026-09-10-r2')).resolves.toMatchObject({
      calibrationReady: true,
      manifest: { schemaVersion: 'adp-ai-calibration-evidence/v1', executionCount: 3 },
      executions: expect.arrayContaining([
        expect.objectContaining({
          responseGuardStatus: 'REJECTED',
          controlledDeliveryStatus: 'WITHHELD',
          findingGroups: expect.arrayContaining([
            expect.objectContaining({ findingType: 'RAW_VALUE_REFLECTION', sourceDataClass: 'BUSINESS_METADATA' }),
          ]),
        }),
      ]),
    });
  });
});
