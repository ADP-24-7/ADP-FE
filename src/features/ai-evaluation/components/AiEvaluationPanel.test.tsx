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
    expect(await screen.findByText('E2 / E3 Field Control')).toBeInTheDocument()
    expect(await screen.findByText('VALIDATED')).toBeInTheDocument()
    expect(await screen.findByText('ACTIVATED')).toBeInTheDocument()
    expect(await screen.findByText('E2_POLICY_REQUIREMENT_VALIDATED')).toBeInTheDocument()
    expect(await screen.findByText('PROVIDER_GOVERNANCE_BLOCKED')).toBeInTheDocument()
    expect(await screen.findByText('PENDING_EXTERNAL_EXECUTION')).toBeInTheDocument()
    expect(await screen.findByText('Provider Governance / External Execution')).toBeInTheDocument()
    expect((await screen.findAllByText(/PROVIDER_REGION_REQUIRED/)).length).toBeGreaterThan(0)
    expect((await screen.findAllByText(/RETENTION_UNVERIFIED/)).length).toBeGreaterThan(0)
    expect((await screen.findAllByText(/MODEL_TRAINING_NOT_ALLOWED/)).length).toBeGreaterThan(0)
    expect(await screen.findByText('NOT_EXECUTED')).toBeInTheDocument()
    expect((await screen.findAllByText('account.balance')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('transaction.amount')).length).toBeGreaterThan(0)
    expect(await screen.findByText('Requirement enforcement gaps')).toBeInTheDocument()
    expect(screen.queryByText('HTTP 200')).not.toBeInTheDocument()
    expect(screen.queryByText('RAW_VALUE_REFLECTION')).not.toBeInTheDocument()
    expect(screen.queryByText('AI Chat')).not.toBeInTheDocument()
  })
})
