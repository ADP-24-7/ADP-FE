import { useQuery } from '@tanstack/react-query';
import { getAdminIdentities, getAdminIdentityDetail } from '../api/adminIdentityApi';
import type { AdminIdentitySearchParams } from '../model/types';

export const adminIdentityKeys = {
  all: ['admin-identities'] as const,
  list: (params: AdminIdentitySearchParams) => [...adminIdentityKeys.all, 'list', params] as const,
  detail: (principalId: string) => [...adminIdentityKeys.all, 'detail', principalId] as const,
};

export function useAdminIdentities(params: AdminIdentitySearchParams) {
  return useQuery({
    queryKey: adminIdentityKeys.list(params),
    queryFn: () => getAdminIdentities(params),
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useAdminIdentityDetail(principalId: string) {
  return useQuery({
    queryKey: adminIdentityKeys.detail(principalId),
    queryFn: () => getAdminIdentityDetail(principalId),
    enabled: principalId.length > 0,
    retry: false,
  });
}
