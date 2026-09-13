import { httpClient } from '../../../shared/api/httpClient';
import type { DigitalAssetOperationsOverview } from '../model/operationsOverviewTypes';

export async function getDigitalAssetOperationsOverview(
  from: string,
  to: string,
  executionQuery: string,
  executionStatus: string,
  executionPage: number,
) {
  const response = await httpClient.get<DigitalAssetOperationsOverview>('/api/admin/digital-assets/overview', {
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
