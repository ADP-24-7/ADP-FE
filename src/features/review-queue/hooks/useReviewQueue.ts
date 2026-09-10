import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getReviewQueue, getReviewQueueDetail } from '../api/reviewQueueApi';
import type { ReviewQueueSearchParams } from '../model/types';

export const reviewQueueKeys = {
  all: ['review-queue'] as const,
  list: (params: ReviewQueueSearchParams) => [...reviewQueueKeys.all, 'list', params] as const,
  detail: (executionId: string) => [...reviewQueueKeys.all, 'detail', executionId] as const,
};

export function useReviewQueue(params: ReviewQueueSearchParams) {
  return useQuery({
    queryKey: reviewQueueKeys.list(params),
    queryFn: () => getReviewQueue(params),
    retry: false,
    placeholderData: keepPreviousData,
  });
}

export function useReviewQueueDetail(executionId: string) {
  return useQuery({
    queryKey: reviewQueueKeys.detail(executionId),
    queryFn: () => getReviewQueueDetail(executionId),
    enabled: executionId.length > 0,
    retry: false,
  });
}
