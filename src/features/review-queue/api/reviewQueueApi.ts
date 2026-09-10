import { httpClient } from '../../../shared/api/httpClient';
import type { ReviewQueueDetail, ReviewQueuePage, ReviewQueueSearchParams } from '../model/types';

export async function getReviewQueue(params: ReviewQueueSearchParams = {}) {
  const response = await httpClient.get<ReviewQueuePage>('/api/admin/review-queue', { params });
  return response.data;
}

export async function getReviewQueueDetail(executionId: string) {
  const response = await httpClient.get<ReviewQueueDetail>(
    `/api/admin/review-queue/${encodeURIComponent(executionId)}`,
  );
  return response.data;
}
