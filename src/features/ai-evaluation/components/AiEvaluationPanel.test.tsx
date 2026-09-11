import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AiEvaluationPanel } from './AiEvaluationPanel'

describe('AiEvaluationPanel', () => {
  it('shows frozen E2 governance while preserving unexecuted provider semantics', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <AiEvaluationPanel />
      </QueryClientProvider>,
    )

    expect(await screen.findByText('Workload / Regulatory Control Context')).toBeInTheDocument()
    expect(await screen.findByText('E2 Field Control')).toBeInTheDocument()
    expect(await screen.findByText('E2_POLICY_REQUIREMENT_VALIDATED')).toBeInTheDocument()
    expect(await screen.findByText('PROVIDER_GOVERNANCE_BLOCKED')).toBeInTheDocument()
    expect(await screen.findByText('PENDING_EXTERNAL_EXECUTION')).toBeInTheDocument()
    expect(await screen.findByText('NOT_EXECUTED')).toBeInTheDocument()
    expect((await screen.findAllByText('account.balance')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('transaction.amount')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('REVISION REQUIRED')).length).toBe(2)
    expect(screen.queryByText('HTTP 200')).not.toBeInTheDocument()
    expect(screen.queryByText('RAW_VALUE_REFLECTION')).not.toBeInTheDocument()
    expect(screen.queryByText('AI Chat')).not.toBeInTheDocument()
  })
})
