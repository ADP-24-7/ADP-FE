import { http, HttpResponse } from 'msw';

const runId = 'ai-eval-baseline-2026-09-07';

export const aiEvaluationHandlers = [
  http.get('/api/admin/ai/evaluation-runs/:evaluationRunId/readiness', () => HttpResponse.json({
    evaluation_run_id: runId,
    evaluation_run_version: '1.0.0',
    status: 'READY',
    bundle_available: true,
    expected_execution_count: 3,
    stored_execution_count: 3,
    observed_execution_count: 3,
    complete_evidence_count: 3,
    missing_execution_count: 0,
    unexpected_execution_count: 0,
    case_models: [{
      eval_case_id: 'customer-summary-ko-001',
      profile_id: 'model-profile-1',
      execution_id: 'execution-1',
      runtime_status: 'COMPLETED',
      provider_status: 'COMPLETED',
      evidence_status: 'COMPLETE',
    }],
  })),
  http.get('/api/admin/ai/evaluation-runs/:evaluationRunId/bundle', () => HttpResponse.json({
    manifest: {
      schema_version: 'adp-ai-evaluation-bundle/v1',
      bundle_id: 'bundle-1',
      bundle_version: '1.0.0',
      content_digest: `sha256:${'b'.repeat(64)}`,
      evaluation_run_id: runId,
      evaluation_run_version: '1.0.0',
      execution_count: 3,
      case_count: 1,
      model_count: 3,
      generated_at: '2026-09-08T00:00:00Z',
      execution_from: '2026-09-08T00:00:00Z',
      execution_cutoff_at: '2026-09-08T00:01:00Z',
    },
    execution_config: {
      evaluation_run_id: runId,
      evaluation_run_version: '1.0.0',
      evaluation_contract_digest: `sha256:${'c'.repeat(64)}`,
      dataset_id: 'financial_synthetic',
      dataset_version: 'financial_synthetic_processed_v1',
      dataset_digest: `sha256:${'d'.repeat(64)}`,
      policy_snapshot_digest: `sha256:${'e'.repeat(64)}`,
      models: [],
    },
    case_results: [],
    runtime_metrics: [],
    failure_summary: { evaluated_execution_count: 3, failed: 0, sent_unknown: 0, not_attempted: 0, by_error_category: {} },
    trace_index: [],
  })),
];
