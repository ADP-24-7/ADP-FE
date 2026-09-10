import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthContext, login, logout } from '../api/authContextApi';

export const authContextKey = ['auth', 'context'] as const;

export function useAuthContext() {
  return useQuery({
    queryKey: authContextKey,
    queryFn: getAuthContext,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ principalId, password }: { principalId: string; password: string }) =>
      login(principalId, password),
    onSuccess: (context) => {
      queryClient.clear();
      queryClient.setQueryData(authContextKey, context);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.clear(),
  });
}
