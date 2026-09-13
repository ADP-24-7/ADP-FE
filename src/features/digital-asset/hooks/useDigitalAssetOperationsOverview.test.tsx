import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import type { PropsWithChildren } from 'react';
import { server } from '../../../app/mocks/server';
import { useDigitalAssetOperationsOverview } from './useDigitalAssetOperationsOverview';

function wrapper({ children }: PropsWithChildren) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useDigitalAssetOperationsOverview', () => {
  it('keeps the current overview visible while the next execution page loads', async () => {
    server.use(http.get('/api/admin/digital-assets/overview', async ({ request }) => {
      const page = Number(new URL(request.url).searchParams.get('page') ?? 0);
      if (page === 1) await delay(100);
      return HttpResponse.json({ recentExecutions: { page } });
    }));

    const { result, rerender } = renderHook(
      ({ page }) => useDigitalAssetOperationsOverview('from', 'to', '', '', page),
      { initialProps: { page: 0 }, wrapper },
    );

    await waitFor(() => expect(result.current.data?.recentExecutions.page).toBe(0));
    rerender({ page: 1 });

    await waitFor(() => expect(result.current.isPlaceholderData).toBe(true));
    expect(result.current.data?.recentExecutions.page).toBe(0);
    await waitFor(() => expect(result.current.data?.recentExecutions.page).toBe(1));
  });
});
