import { useQuery } from '@tanstack/react-query';
import { getAiOperationsOverview } from '../api/aiOperationsApi';

export function useAiOperationsOverview(
  from: string,
  to: string,
  executionQuery = '',
  executionStatus = '',
  executionPage = 0,
) {
  return useQuery({
    queryKey: ['ai-operations-overview', from, to, executionQuery, executionStatus, executionPage],
    queryFn: () => getAiOperationsOverview(from, to, executionQuery, executionStatus, executionPage),
    placeholderData: (previous) => previous,
    retry: false,
    refetchInterval: 30_000,
  });
}
