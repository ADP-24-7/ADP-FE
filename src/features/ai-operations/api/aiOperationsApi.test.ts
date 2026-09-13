import { describe, expect, it } from 'vitest';
import { getAiOperationsOverview } from './aiOperationsApi';

describe('getAiOperationsOverview', () => {
  it('returns the AI operations dashboard contract', async () => {
    const result = await getAiOperationsOverview(
      '2026-09-08T00:00:00Z', '2026-09-15T00:00:00Z', '', '', 0,
    );

    expect(result.schemaVersion).toBe('adp-ai-operations-overview/v1');
    expect(result.metrics.total.current).toBeGreaterThan(0);
    expect(result.flow.some((link) => link.source === 'REQUESTED')).toBe(true);
    expect(result.policyCoverage.some((item) => item.workloadId === 'customer_summary')).toBe(true);
    expect(result.workloadViolations.some((item) => item.workloadId === 'customer_summary')).toBe(true);
    expect(result.workloadOutcomes.some((item) => item.workloadId === 'customer_summary')).toBe(true);
    expect(result.coverage.runtimeExecutions).toBeGreaterThan(0);
  });
});
