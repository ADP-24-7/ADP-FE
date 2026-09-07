import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the real API console without mock environment labels', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Security Overview' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /정책 · 승인/ })).toHaveAttribute('href', '/policies');
    expect(screen.getByRole('link', { name: /Runtime · Recovery/ })).toHaveAttribute('href', '/analysis');
    expect(screen.queryByText('MOCK DATA')).not.toBeInTheDocument();
    expect(screen.queryByText('PROJECT_PROVISIONAL')).not.toBeInTheDocument();
    expect(screen.getAllByText('NO MOCK DATA').length).toBeGreaterThan(0);
  });

  it('updates runtime domain from the global selector without page reload', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole('heading', { name: 'Security Overview' });
    await user.click(screen.getByRole('button', { name: /Pack/ }));
    await user.click(screen.getByRole('menuitemradio', { name: /Digital Asset/ }));

    expect(window.location.pathname).toBe('/overview');
    expect(screen.getByRole('button', { name: /PackDigital Asset/ })).toBeInTheDocument();
    expect(screen.getByText('Value-use · Transaction · Settlement · Reconciliation')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /정책 · 승인/ }));

    expect(await screen.findByRole('heading', { name: '정책 · 승인' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /정책 · 승인/ })).toHaveClass('active');
    expect(screen.getByLabelText('선택된 Execution Pack')).toHaveTextContent('Digital Asset');
    expect(screen.getByText('STABLECOIN_CARD_SPEND')).toBeInTheDocument();
  });

  it('uses the global pack selector for Gateway Lab without a duplicate axis picker', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('link', { name: '통합 관제' }));
    await screen.findByRole('heading', { name: 'Security Overview' });
    await user.click(screen.getByRole('button', { name: /Pack/ }));
    await user.click(screen.getByRole('menuitemradio', { name: /Digital Asset/ }));
    await user.click(screen.getByRole('link', { name: 'Gateway Lab' }));

    expect(await screen.findByRole('heading', { name: 'Gateway Lab' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/gateway-lab');
    expect(screen.queryByRole('tablist', { name: 'Gateway 실행 축 선택' })).not.toBeInTheDocument();
    expect(screen.queryByText('Gateway 실행 축')).not.toBeInTheDocument();
    expect(screen.getByLabelText('선택된 Execution Pack')).toHaveTextContent('Digital Asset');
    expect(screen.getByText('정산·이벤트 Payload')).toBeInTheDocument();
    expect(screen.getByText('Protocol 필수값과 개인정보성 필드 분리')).toBeInTheDocument();
  });
});
