import { useQuery } from '@tanstack/react-query';
import { getSecurityFindingDetail, getSecurityFindings } from '../api/securityFindingApi';
import type { SecurityFindingSearchParams } from '../model/types';

export const securityFindingKeys = {
  all: ['security-findings'] as const,
  list: (params: SecurityFindingSearchParams) => [...securityFindingKeys.all, 'list', params] as const,
  detail: (findingId: number) => [...securityFindingKeys.all, 'detail', findingId] as const,
};

export function useSecurityFindings(params: SecurityFindingSearchParams) {
  return useQuery({
    queryKey: securityFindingKeys.list(params),
    queryFn: () => getSecurityFindings(params),
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useSecurityFindingDetail(findingId: number | null) {
  return useQuery({
    queryKey: securityFindingKeys.detail(findingId ?? 0),
    queryFn: () => getSecurityFindingDetail(findingId!),
    enabled: findingId != null,
    retry: false,
  });
}
