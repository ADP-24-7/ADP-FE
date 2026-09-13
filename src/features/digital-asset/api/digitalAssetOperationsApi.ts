import { httpClient } from '../../../shared/api/httpClient';
import type { DigitalAssetOperationsOverview } from '../model/operationsOverviewTypes';

export async function getDigitalAssetOperationsOverview(from: string, to: string) {
  const response = await httpClient.get<DigitalAssetOperationsOverview>('/api/admin/digital-assets/overview', {
    params: { from, to },
  });
  return response.data;
}
