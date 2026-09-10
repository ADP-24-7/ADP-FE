import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ReferenceEvidencePanel } from './ReferenceEvidencePanel';

describe('ReferenceEvidencePanel', () => {
  it('drills down from the scoped list without presenting evidence as runtime policy', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><ReferenceEvidencePanel /></QueryClientProvider>);

    await user.click(await screen.findByRole('button', { name: /AI 상담 개인정보 처리 기준/ }));

    expect(await screen.findByText('Claim Scope')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Analysis')).toBeInTheDocument();
    expect(screen.getAllByText('REFERENCE_ONLY').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /활성화|승인/ })).not.toBeInTheDocument();
  });
});
