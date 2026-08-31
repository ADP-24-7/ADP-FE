import { render, screen } from '@testing-library/react';
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
});
