import { useQuery } from '@tanstack/react-query';
import { getAiEvaluationBundle, getAiEvaluationReadiness } from '../api/aiEvaluationApi';

export function useAiEvaluationReadiness(evaluationRunId: string) {
  return useQuery({
    queryKey: ['ai-evaluation-readiness', evaluationRunId],
    queryFn: () => getAiEvaluationReadiness(evaluationRunId),
    enabled: evaluationRunId.length > 0,
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
