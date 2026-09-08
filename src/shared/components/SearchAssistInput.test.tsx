import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { SearchAssistInput } from './SearchAssistInput';

function Harness() {
  const [value, setValue] = useState('');
  return (
    <SearchAssistInput
      value={value}
      onChange={setValue}
      ariaLabel="Workload search"
      placeholder="Workload 입력"
      suggestions={[
        { value: 'customer_summary', label: 'AI 고객 요약', source: 'local-example' },
        { value: 'tokenized_asset_purchase', label: 'Digital Asset 구매', source: 'api' },
      ]}
    />
  );
}

describe('SearchAssistInput', () => {
  it('shows examples on focus, filters by a partial term, and applies the selected value', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const input = screen.getByRole('combobox', { name: 'Workload search' });
    await user.click(input);
    expect(screen.getByRole('option', { name: /AI 고객 요약/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Digital Asset 구매/ })).toBeInTheDocument();

    await user.type(input, 'tokenized');
    expect(screen.queryByRole('option', { name: /AI 고객 요약/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: /Digital Asset 구매/ }));

    expect(input).toHaveValue('tokenized_asset_purchase');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });
});
