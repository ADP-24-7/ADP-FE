import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the real API console without mock environment labels', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: '운영 개요' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Workload · Data Access' })).toHaveAttribute('href', '/data-access');
    expect(screen.getByRole('link', { name: '분석 · Evidence' })).toHaveAttribute('href', '/analysis');
    expect(screen.queryByText('MOCK DATA')).not.toBeInTheDocument();
    expect(screen.queryByText('PROJECT_PROVISIONAL')).not.toBeInTheDocument();
    expect(screen.getByText('REAL API MODE')).toBeInTheDocument();
  });

  it('updates overview pack state and navigates main content without page reload', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole('heading', { name: '운영 개요' });
    await user.click(screen.getByRole('tab', { name: /SaaS/ }));

    expect(screen.getByRole('heading', { name: 'SaaS' })).toBeInTheDocument();
    expect(screen.getByText('SAAS · CONTRACT VALIDATION')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Data Access & Context/ }));
    await user.click(screen.getByRole('button', { name: /관련 화면으로 이동/ }));

    expect(await screen.findByRole('heading', { name: 'Workload · Data Access' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Workload · Data Access' })).toHaveClass('active');
  });
});
