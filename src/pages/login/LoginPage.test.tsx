import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { server } from '../../app/mocks/server';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('uses credentials only, clears protected cache, and returns to the requested execution', async () => {
    let loginBody: Record<string, unknown> | undefined;
    server.use(
      http.get('/api/auth/me', () => new HttpResponse(null, { status: 401 })),
      http.post('/api/auth/login', async ({ request }) => {
        loginBody = await request.json() as Record<string, unknown>;
        return HttpResponse.json({
          principalId: 'auditor-local', principalType: 'USER', displayName: 'Local Audit User',
          institutionId: 'institution_local', roles: ['AUDITOR'],
          workloadIds: ['customer_summary'], subjectAuthorizationRequired: false,
        });
      }),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['audit', 'protected'], { executionId: 'old-user-execution' });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/login?returnTo=%2Faudit%3FexecutionId%3Dexec-123']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/audit" element={<div>감사 실행 복귀</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.change(await screen.findByLabelText('사용자 ID'), { target: { value: 'auditor-local' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'auditor-demo' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByText('감사 실행 복귀')).toBeInTheDocument();
    expect(loginBody).toEqual({ principalId: 'auditor-local', password: 'auditor-demo' });
    expect(queryClient.getQueryData(['audit', 'protected'])).toBeUndefined();
    await waitFor(() => expect(queryClient.getQueryData(['auth', 'context'])).toMatchObject({
      principalId: 'auditor-local', roles: ['AUDITOR'],
    }));
  });
});
