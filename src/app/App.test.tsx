import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the overview route shell', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: '운영 개요' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '분석 및 평가' })).toHaveAttribute('href', '/analysis');
  });
});
