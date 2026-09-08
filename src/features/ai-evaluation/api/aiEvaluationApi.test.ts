import { describe, expect, it } from 'vitest';
import { getAiEvaluationBundle, getAiEvaluationReadiness } from './aiEvaluationApi';

describe('aiEvaluationApi', () => {
  it('normalizes readiness snake_case into the FE domain model', async () => {
    await expect(getAiEvaluationReadiness('ai-eval-baseline-2026-09-07')).resolves.toMatchObject({
      status: 'READY',
      bundleAvailable: true,
      completeEvidenceCount: 3,
      caseModels: [{ evalCaseId: 'customer-summary-ko-001' }],
    });
  });

  it('normalizes bundle identity and failure summary', async () => {
    await expect(getAiEvaluationBundle('ai-eval-baseline-2026-09-07')).resolves.toMatchObject({
      manifest: { schemaVersion: 'adp-ai-evaluation-bundle/v1', executionCount: 3 },
      failureSummary: { evaluatedExecutionCount: 3, sentUnknown: 0 },
    });
  });
});
