import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../../app/mocks/server';
import { login } from '../api/authContextApi';
import { useLogout } from './useAuthContext';

describe('useLogout', () => {
  it('clears protected query data even when server logout fails', async () => {
    server.use(http.post('/api/auth/logout', () => new HttpResponse(null, { status: 500 })));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    queryClient.setQueryData(['protected', 'audit'], { executionId: 'sensitive-execution' });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync().catch(() => undefined);
    });

    expect(queryClient.getQueryData(['protected', 'audit'])).toBeUndefined();
  });

  it('clears protected query data when csrf token lookup fails before logout', async () => {
    server.use(http.get('/api/auth/csrf', () => new HttpResponse(null, { status: 500 }), { once: true }));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    queryClient.setQueryData(['protected', 'audit'], { executionId: 'sensitive-execution' });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync().catch(() => undefined);
    });

    expect(queryClient.getQueryData(['protected', 'audit'])).toBeUndefined();
    await login('operator-local', 'operator-demo');
  });
});
