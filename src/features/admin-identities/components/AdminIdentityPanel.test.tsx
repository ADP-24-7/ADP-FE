import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AdminIdentityPanel } from './AdminIdentityPanel';

function renderPanel() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminIdentityPanel />
    </QueryClientProvider>,
  );
}

describe('AdminIdentityPanel', () => {
  it('opens scoped permission detail without secret or subject identity', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(await screen.findByRole('button', { name: /Local Runtime Harness/ }));

    expect(await screen.findByText('CUSTOMER_SUPPORT')).toBeInTheDocument();
    expect(screen.getByText('2 scoped grant')).toBeInTheDocument();
    expect(screen.getByText('WORKLOAD ENABLED')).toBeInTheDocument();
    expect(screen.queryByText(/local-dev-api-key/)).not.toBeInTheDocument();
    expect(screen.queryByText(/customer-100/)).not.toBeInTheDocument();
  });
});
