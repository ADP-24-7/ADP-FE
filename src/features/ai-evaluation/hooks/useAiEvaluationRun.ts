import { useQueries, useQuery } from '@tanstack/react-query';
import { getRuntimeExecutionTrace } from '../../runtime-execution';
import { getAiCalibrationEvidence, getAiEvaluationBundle, getAiEvaluationReadiness, getAiTransformGovernanceProfile } from '../api/aiEvaluationApi';

export function useAiEvaluationReadiness(evaluationRunId: string, enabled = true) {
  return useQuery({
    queryKey: ['ai-evaluation-readiness', evaluationRunId],
    queryFn: () => getAiEvaluationReadiness(evaluationRunId),
    enabled: enabled && evaluationRunId.length > 0,
    retry: false,
  });
}

export function useAiEvaluationBundle(evaluationRunId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['ai-evaluation-bundle', evaluationRunId],
    queryFn: () => getAiEvaluationBundle(evaluationRunId),
    enabled: enabled && evaluationRunId.length > 0,
    retry: false,
  });
}

export function useAiExecutionTraces(executionIds: string[]) {
  return useQueries({
    queries: executionIds.map((executionId) => ({
      queryKey: ['runtime-execution-trace', executionId],
      queryFn: () => getRuntimeExecutionTrace(executionId),
      enabled: executionId.length > 0,
      staleTime: 15_000,
    })),
  });
}

export function useAiTransformGovernanceProfile(evaluationRunId: string, enabled = true) {
  return useQuery({
    queryKey: ['ai-transform-governance-profile', evaluationRunId],
    queryFn: () => getAiTransformGovernanceProfile(evaluationRunId),
    enabled: enabled && evaluationRunId.length > 0,
    retry: false,
  });
}

export function useAiCalibrationEvidence(evaluationRunId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['ai-calibration-evidence', evaluationRunId],
    queryFn: () => getAiCalibrationEvidence(evaluationRunId),
    enabled: enabled && evaluationRunId.length > 0,
    retry: false,
  });
}
