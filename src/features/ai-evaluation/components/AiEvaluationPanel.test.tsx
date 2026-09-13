import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { authContextKey } from '../../auth/hooks/useAuthContext'

import { AiEvaluationPanel } from './AiEvaluationPanel'

describe('AiEvaluationPanel', () => {
  it('keeps restricted evaluation evidence requests out of an operator session', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } })
    queryClient.setQueryData(authContextKey, {
      principalId: 'operator-local', principalType: 'USER', displayName: 'Local Operations User',
      institutionId: 'institution_local', roles: ['OPERATOR'], workloadIds: ['*'],
      subjectAuthorizationRequired: false,
    })

    render(<QueryClientProvider client={queryClient}><AiEvaluationPanel /></QueryClientProvider>)

    expect(await screen.findByText('상세 검증 증적은 승인 담당자 전용입니다.')).toBeInTheDocument()
    expect(await screen.findByText('업무·규제 통제 기준')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: '검증 결과' })).not.toBeInTheDocument()
    expect(queryClient.getQueryState(['ai-evaluation-readiness', 'ai-experiment-02-financial-regulatory-v5'])?.fetchStatus).toBe('idle')
    expect(queryClient.getQueryData(['ai-evaluation-readiness', 'ai-experiment-02-financial-regulatory-v5'])).toBeUndefined()
  })

  it('shows frozen E2 governance while preserving unexecuted provider semantics', async () => {
    const user = userEvent.setup()
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

    await user.click(await screen.findByRole('tab', { name: '정책·필드 통제' }))
    expect(await screen.findByText('업무·규제 통제 기준')).toBeInTheDocument()
    expect(await screen.findByText('필드별 보호 정책')).toBeInTheDocument()
    expect(await screen.findByText('VALIDATED')).toBeInTheDocument()
    expect(await screen.findByText('ACTIVATED')).toBeInTheDocument()
    expect(await screen.findByText('E2_POLICY_REQUIREMENT_VALIDATED')).toBeInTheDocument()
    expect(await screen.findByText('PROVIDER_GOVERNANCE_BLOCKED')).toBeInTheDocument()
    expect(await screen.findByText('PENDING_EXTERNAL_EXECUTION')).toBeInTheDocument()
    expect(await screen.findByText('외부 AI 제공자 통제')).toBeInTheDocument()
    expect((await screen.findAllByText(/PROVIDER_REGION_REQUIRED/)).length).toBeGreaterThan(0)
    expect((await screen.findAllByText(/RETENTION_UNVERIFIED/)).length).toBeGreaterThan(0)
    expect((await screen.findAllByText(/MODEL_TRAINING_NOT_ALLOWED/)).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('NO')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('account.balance')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('transaction.amount')).length).toBeGreaterThan(0)
    expect(await screen.findByText('Requirement enforcement gaps')).toBeInTheDocument()
    expect(screen.queryByText('HTTP 200')).not.toBeInTheDocument()
    expect(screen.queryByText('RAW_VALUE_REFLECTION')).not.toBeInTheDocument()
    expect(screen.queryByText('AI Chat')).not.toBeInTheDocument()
  })
})
