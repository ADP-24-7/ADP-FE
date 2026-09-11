import { httpClient } from '../../../shared/api/httpClient';
import type { AiCalibrationEvidence, AiEvaluationBundle, AiEvaluationRunReadiness, AiTransformGovernanceProfile } from '../model/types';

type SnakeRecord = Record<string, unknown>;

function camelizeKey(key: string) {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function camelize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(camelize);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as SnakeRecord).map(([key, nested]) => [camelizeKey(key), camelize(nested)]),
    );
  }
  return value;
}

export async function getAiEvaluationReadiness(evaluationRunId: string) {
  const response = await httpClient.get<SnakeRecord>(
    `/api/admin/ai/evaluation-runs/${encodeURIComponent(evaluationRunId)}/readiness`,
  );
  return camelize(response.data) as AiEvaluationRunReadiness;
}

export async function getAiEvaluationBundle(evaluationRunId: string) {
  const response = await httpClient.get<SnakeRecord>(
    `/api/admin/ai/evaluation-runs/${encodeURIComponent(evaluationRunId)}/bundle`,
  );
  return camelize(response.data) as AiEvaluationBundle;
}

export async function getAiTransformGovernanceProfile(evaluationRunId: string) {
  const response = await httpClient.get<SnakeRecord>(
    `/api/admin/ai/evaluation-runs/${encodeURIComponent(evaluationRunId)}/transform-governance-profile`,
  );
  return camelize(response.data) as AiTransformGovernanceProfile;
}

export async function getAiCalibrationEvidence(evaluationRunId: string) {
  const response = await httpClient.get<SnakeRecord>(
    `/api/admin/ai/evaluation-runs/${encodeURIComponent(evaluationRunId)}/calibration-evidence`,
  );
  return camelize(response.data) as AiCalibrationEvidence;
}
