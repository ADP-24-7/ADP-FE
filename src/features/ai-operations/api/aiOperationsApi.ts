import { httpClient } from '../../../shared/api/httpClient';
import type { AiOperationsOverview } from '../model/types';

export async function getAiOperationsOverview(
  from: string,
  to: string,
  executionQuery: string,
  executionStatus: string,
  executionPage: number,
) {
  const response = await httpClient.get<AiOperationsOverview>('/api/admin/ai/overview', {
    params: {
      from,
      to,
      query: executionQuery || undefined,
      status: executionStatus || undefined,
      page: executionPage,
      size: 10,
    },
  });
  return response.data;
}
