import { useQuery } from '@tanstack/react-query';
import { getAuthContext } from '../api/authContextApi';

export const authContextKey = ['auth', 'context'] as const;

export function useAuthContext() {
  return useQuery({
    queryKey: authContextKey,
    queryFn: getAuthContext,
    retry: false,
  });
}

