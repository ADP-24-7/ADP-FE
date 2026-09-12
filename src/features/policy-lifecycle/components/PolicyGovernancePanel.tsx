import { ArrowRight, CheckCircle2, History, RotateCcw, ShieldCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, SearchAssistInput, SectionCard, StatusBadge } from '../../../shared/components';
import {
  useActivatePolicyLifecycle,
  useApprovePolicyLifecycle,
  usePolicyCurrentSelection,
  useRollbackPolicyLifecycle,
  useRunPolicyShadowEvaluation,
  useTransitionPolicyLifecycle,
} from '../hooks/usePolicyLifecycle';
import type { PolicyLifecycleRecord, PolicyLifecycleStage } from '../model/types';
import { useAuthContext } from '../../auth';
import { usePolicyRegulatoryEvidence } from '../../reference-evidence';

const nextTransitions: Partial<Record<PolicyLifecycleStage, { targetStage: PolicyLifecycleStage; reasonCode: string; label: string }>> = {
  DRAFT: { targetStage: 'VALIDATED', reasonCode: 'VALIDATION_PASSED', label: '검증 완료' },
  VALIDATED: { targetStage: 'CANDIDATE', reasonCode: 'CANDIDATE_PROMOTED', label: 'Candidate 승격' },
  CANDIDATE: { targetStage: 'REPLAY', reasonCode: 'REPLAY_PASSED', label: 'Replay 진입' },
  REPLAY: { targetStage: 'SHADOW', reasonCode: 'SHADOW_PASSED', label: 'Shadow 진입' },
};

type PolicyGovernancePanelProps = {
  policy: PolicyLifecycleRecord;
};

export function PolicyGovernancePanel({ policy }: PolicyGovernancePanelProps) {
  const auth = useAuthContext();
  const [evaluationCaseId, setEvaluationCaseId] = useState('');
  const [shadowEvaluationId, setShadowEvaluationId] = useState('');
  const [transitionConfirmed, setTransitionConfirmed] = useState(false);
  const [approvalConfirmed, setApprovalConfirmed] = useState(false);
  const [activationConfirmed, setActivationConfirmed] = useState(false);
  const [rollbackConfirmed, setRollbackConfirmed] = useState(false);
  const isGenericSelectionSupported = policy.executionPack !== 'DIGITAL_ASSET';
  const selectionParams = isGenericSelectionSupported ? {
    executionPack: policy.executionPack,
    workloadId: policy.workloadId,
    purposeCode: policy.purposeCode,
  } : null;
  const currentSelection = usePolicyCurrentSelection(selectionParams);
  const shadow = useRunPolicyShadowEvaluation();
  const transition = useTransitionPolicyLifecycle();
  const approval = useApprovePolicyLifecycle();
  const activation = useActivatePolicyLifecycle();
  const rollback = useRollbackPolicyLifecycle();
  const regulatoryLineage = usePolicyRegulatoryEvidence(policy.artifactId, policy.artifactVersion);
  const nextTransition = nextTransitions[policy.lifecycleStage];
  const selectionError = currentSelection.isError ? normalizeApiError(currentSelection.error) : null;
  const hasNoCurrentSelection = selectionError?.errorCode === 'POLICY_CURRENT_SELECTION_NOT_FOUND';
  const canUseSelectionRevision = currentSelection.isSuccess || hasNoCurrentSelection;
  const expectedSelectionRevision = currentSelection.data?.selectionRevision ?? 0;
  const enteredShadowEvaluationId = shadowEvaluationId.trim();
  const isKnownShadowEvidence = shadow.data?.shadowEvaluationId === enteredShadowEvaluationId;
  const isKnownDiffEvidence = isKnownShadowEvidence && shadow.data?.result === 'DIFF';
  const isMutating = transition.isPending || approval.isPending || activation.isPending || rollback.isPending;
  const canOperate = auth.data?.roles.some((role) => role === 'OPERATOR' || role === 'PRIVILEGED_OPERATOR') ?? false;
  const canRunPrivilegedCommand = auth.data?.roles.includes('PRIVILEGED_OPERATOR') ?? false;
  const operatorReason = auth.isLoading
    ? '현재 운영자 권한을 확인하고 있습니다.'
    : canOperate
      ? '현재 Role로 Lifecycle 검증과 Shadow 실행이 가능합니다.'
      : 'Lifecycle 변경에는 OPERATOR 또는 PRIVILEGED_OPERATOR Role이 필요합니다.';
  const privilegedReason = canRunPrivilegedCommand
    ? '현재 Role로 승인·활성화·롤백 명령을 요청할 수 있습니다.'
    : '승인·활성화·롤백에는 PRIVILEGED_OPERATOR Role이 필요합니다.';
  const terminalStateCopy: Partial<Record<PolicyLifecycleStage, { title: string; description: string }>> = {
    APPROVED: {
      title: 'Shadow Evidence 승인 완료',
      description: '승인 Evidence가 현재 Artifact revision에 결속됐습니다. Current Selection 활성화를 진행할 수 있습니다.',
    },
    ACTIVE: {
      title: 'Current Selection 적용 완료',
      description: '이 Artifact가 현재 Scope의 ACTIVE 정책입니다. 이후 실행은 선택된 revision을 Snapshot으로 고정합니다.',
    },
    SUPERSEDED: {
      title: '후속 정책으로 교체됨',
      description: '이 Artifact는 이전 ACTIVE 버전이며, 승인·활성화 이력이 유효한 경우 롤백 대상으로 사용할 수 있습니다.',
    },
    ROLLED_BACK: {
      title: '롤백으로 비활성화됨',
      description: 'Rollback Evidence와 revision은 서버에 보존되며 이 버전은 현재 선택이 아닙니다.',
    },
    REVIEW: {
      title: '운영 검토 필요',
      description: 'Current Selection을 변경하는 전용 Review command가 추가될 때까지 일반 전이는 차단됩니다.',
    },
    PROJECT_PROVISIONAL: {
      title: '프로젝트 임시 정책',
      description: '운영 Governance Lifecycle 명령 대상이 아닌 로컬 Runtime 기준 정책입니다.',
    },
  };
  const terminalState = terminalStateCopy[policy.lifecycleStage];

  useEffect(() => {
    setTransitionConfirmed(false);
    setApprovalConfirmed(false);
    setActivationConfirmed(false);
    setRollbackConfirmed(false);
  }, [policy.lifecycleStage, policy.revision]);

  function submitShadow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (policy.lifecycleStage !== 'REPLAY') return;
    shadow.mutate({
      artifactId: policy.artifactId,
      artifactVersion: policy.artifactVersion,
      evaluationCaseId: evaluationCaseId.trim(),
    }, {
      onSuccess: (evidence) => setShadowEvaluationId(evidence.shadowEvaluationId),
    });
  }

  function advanceLifecycle() {
    if (!nextTransition || !transitionConfirmed) return;
    if (nextTransition.targetStage === 'SHADOW' && !shadowEvaluationId.trim()) return;
    transition.mutate({
      artifactId: policy.artifactId,
      artifactVersion: policy.artifactVersion,
      targetStage: nextTransition.targetStage,
      reasonCode: nextTransition.reasonCode,
    });
  }

  function approve() {
    if (!approvalConfirmed || !enteredShadowEvaluationId || isKnownDiffEvidence) return;
    approval.mutate({
      artifactId: policy.artifactId,
      artifactVersion: policy.artifactVersion,
      shadowEvaluationId: enteredShadowEvaluationId,
    });
  }

  function activate() {
    if (!activationConfirmed || !canUseSelectionRevision) return;
    activation.mutate({
      artifactId: policy.artifactId,
      artifactVersion: policy.artifactVersion,
      request: {
        expectedArtifactRevision: policy.revision,
        expectedSelectionRevision,
      },
    });
  }

  function rollbackSelection() {
    if (!rollbackConfirmed || !currentSelection.data) return;
    rollback.mutate({
      artifactId: policy.artifactId,
      artifactVersion: policy.artifactVersion,
      request: {
        expectedTargetRevision: policy.revision,
        expectedSelectionRevision: currentSelection.data.selectionRevision,
      },
    });
  }

  const commandError = transition.error ?? approval.error ?? activation.error ?? rollback.error;
  const commandApiError = commandError ? normalizeApiError(commandError) : null;
  const selectionCommandError = activation.error ?? rollback.error;
  const selectionCommandApiError = selectionCommandError ? normalizeApiError(selectionCommandError) : null;
  const hasSelectionConflict = selectionCommandApiError?.status === 409;

  function refreshSelectionAfterConflict() {
    activation.reset();
    rollback.reset();
    setActivationConfirmed(false);
    setRollbackConfirmed(false);
    currentSelection.refetch();
  }

  return (
    <SectionCard
      className="search-assist-card"
      title="Policy Governance"
      description="Shadow Evidence, Maker-Checker 승인, Current Selection과 Rollback을 BE authoritative revision으로 실행합니다."
      actions={<StatusBadge tone={policy.lifecycleStage === 'ACTIVE' ? 'success' : policy.lifecycleStage === 'REVIEW' ? 'warning' : 'info'}>{policy.lifecycleStage}</StatusBadge>}
    >
      <div className={canRunPrivilegedCommand ? 'action-eligibility action-eligibility-allowed' : 'action-eligibility action-eligibility-blocked'}>
        <ShieldCheck size={16} />
        <p><strong>{auth.data?.principalId ?? '권한 확인 중'}</strong><span>{operatorReason} {privilegedReason}</span></p>
        <StatusBadge tone={canRunPrivilegedCommand ? 'success' : 'warning'}>{canRunPrivilegedCommand ? 'ACTION ELIGIBLE' : 'READ ONLY'}</StatusBadge>
      </div>
      <div className="governance-section-heading">
        <span><History size={17} />Regulatory Evidence Lineage</span>
        <small>Official Source → Evidence → Policy Version → Lifecycle</small>
      </div>
      {regulatoryLineage.isLoading ? (
        <LoadingPanel label="규제 Evidence lineage를 조회하는 중입니다" />
      ) : regulatoryLineage.isError ? (
        <ErrorState description={normalizeApiError(regulatoryLineage.error).message} onRetry={() => regulatoryLineage.refetch()} />
      ) : regulatoryLineage.data?.length ? (
        <div className="table-shell reference-evidence-table-shell" role="table" aria-label="Regulatory Evidence Lineage">
          <div className="table-head table-reference-evidence"><span>근거 법령 / 조문</span><span>Evidence</span><span>Policy</span><span>Lifecycle</span><span>Effective Date</span></div>
          {regulatoryLineage.data.map((item) => (
            <div className="table-row table-reference-evidence" role="row" key={`${item.regulatoryEvidenceId}:${item.sourceVersion}`}>
              <span><strong>{item.lawName}</strong><small>{item.applicableArticles}</small><small>Requirement: {item.requirementRefs.join(' · ')}</small><small>Control: {item.controlRefs.join(' · ')}</small></span>
              <span><code>{item.regulatoryEvidenceId}</code><small>{item.officialSource} · {item.sourceVersion}</small></span>
              <span><strong>{item.policyArtifactId}</strong><small>{item.policyVersion}</small></span>
              <span><StatusBadge tone={item.reviewStatus === 'CONNECTED' ? 'success' : 'warning'}>{item.reviewStatus}</StatusBadge><small>{item.lifecycleState} · {item.executionPack}</small></span>
              <span><strong>{item.effectiveDate ?? '—'}</strong><small title={item.sourceDigest}>{item.sourceDigest}</small></span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState compact title="연결된 Regulatory Evidence 없음" description="이 Policy Version에 명시적으로 결속된 규제 Evidence가 없습니다." endpoint="GET /api/admin/reference-evidence/policy-artifacts/{artifactId}/versions/{version}" />
      )}
      <div className="governance-grid">
        <div className="governance-column">
          <div className="governance-section-heading">
            <span><ShieldCheck size={17} />Evidence Gate</span>
            <small>{policy.artifactId} · rev {policy.revision}</small>
          </div>

          {policy.lifecycleStage === 'REPLAY' ? (
            <form className="form-grid compact-form-grid" onSubmit={submitShadow}>
              <label className="field field-full">
                <span>Evaluation Case ID</span>
                <SearchAssistInput
                  value={evaluationCaseId}
                  onChange={setEvaluationCaseId}
                  suggestions={[
                    { value: 'GOLDEN_ALLOW', label: '허용 기준 Case', description: 'Local evaluator 승인 기준 예시', source: 'local-example' },
                    { value: 'FAILURE_BLOCK', label: '차단 기준 Case', description: 'Local evaluator 차단 기준 예시', source: 'local-example' },
                  ]}
                  placeholder="golden 또는 failure 입력"
                  ariaLabel="Policy Shadow Evaluation Case ID"
                  required
                />
              </label>
              <button className="button button-secondary" type="submit" disabled={!canOperate || !evaluationCaseId.trim() || shadow.isPending} title={operatorReason}>
                {shadow.isPending ? '비교 중...' : 'Shadow 비교 실행'}
              </button>
            </form>
          ) : null}

          {shadow.isError ? <ErrorState title="Shadow 평가에 실패했습니다" description={normalizeApiError(shadow.error).message} onRetry={() => shadow.reset()} /> : null}
          {shadow.data ? (
            <KeyValues items={[
              ['Evaluation', `${shadow.data.shadowEvaluationId} · ${shadow.data.evaluationCaseId}/${shadow.data.evaluationCaseVersion}`],
              ['Result / Diff', `${shadow.data.result} / ${shadow.data.diffFields.join(' · ') || '없음'}`],
              ['Baseline', `${shadow.data.baselineArtifactId} · ${shadow.data.baselineArtifactVersion}`],
              ['Candidate Revision', String(shadow.data.candidateRevision)],
              ['Input Digest', shadow.data.inputDigest],
              ['Outcome Digests', `${shadow.data.baselineOutcomeDigest} / ${shadow.data.candidateOutcomeDigest}`],
            ]} />
          ) : null}

          {policy.lifecycleStage === 'SHADOW' ? (
            <label className="field">
              <span>Shadow Evaluation ID</span>
              <input value={shadowEvaluationId} onChange={(event) => setShadowEvaluationId(event.target.value)} placeholder="shadow_..." required />
            </label>
          ) : null}

          {policy.lifecycleStage === 'SHADOW' && isKnownDiffEvidence ? (
            <EmptyState
              compact
              title="이 Evidence는 승인할 수 없습니다"
              description="현재 세션에서 확인한 Evidence에 변경점이 존재합니다. 현재 Approval Policy는 MATCH Evidence만 승인합니다."
              endpoint={`Shadow Evaluation ${enteredShadowEvaluationId} · DIFF`}
            />
          ) : null}

          {terminalState ? (
            <EmptyState compact title={terminalState.title} description={terminalState.description} endpoint={`Lifecycle ${policy.lifecycleStage} · Artifact revision ${policy.revision}`} />
          ) : null}

          {nextTransition ? (
            <div className="governance-command">
              <label className="checkbox-row">
                <input type="checkbox" checked={transitionConfirmed} onChange={(event) => setTransitionConfirmed(event.target.checked)} disabled={!canOperate} />
                <span>{nextTransition.label} 명령과 현재 Revision 사용을 확인합니다.</span>
              </label>
              <button
                className="button button-primary"
                type="button"
                disabled={!canOperate || !transitionConfirmed || isMutating || (nextTransition.targetStage === 'SHADOW' && !shadowEvaluationId.trim())}
                title={operatorReason}
                onClick={advanceLifecycle}
              >
                <ArrowRight size={15} />{nextTransition.label}
              </button>
            </div>
          ) : null}

          {policy.lifecycleStage === 'SHADOW' ? (
            <div className="governance-command">
              <label className="checkbox-row">
                <input type="checkbox" checked={approvalConfirmed} onChange={(event) => setApprovalConfirmed(event.target.checked)} disabled={!canRunPrivilegedCommand || isKnownDiffEvidence} />
                <span>BE가 MATCH Evidence, 승인 권한과 Maker-Checker 조건을 검증하도록 요청합니다.</span>
              </label>
              <button className="button button-primary" type="button" disabled={!canRunPrivilegedCommand || !approvalConfirmed || !enteredShadowEvaluationId || isKnownDiffEvidence || isMutating} onClick={approve} title={privilegedReason}>
                <CheckCircle2 size={15} />Evidence 기반 승인
              </button>
            </div>
          ) : null}
        </div>

        <div className="governance-column">
          <div className="governance-section-heading">
            <span><History size={17} />Current Selection</span>
            <small>Scope 단일 ACTIVE · optimistic fencing</small>
          </div>
          {!isGenericSelectionSupported ? (
            <EmptyState compact title="전용 Digital Asset 활성화 사용" description="Digital Asset은 Runtime Control과 Crosswalk를 함께 고정하는 전용 Artifact 활성화 API를 사용합니다." endpoint="POST /api/admin/digital-assets/artifacts/{id}/versions/{version}/activate" />
          ) : currentSelection.isLoading ? (
            <LoadingPanel label="현재 Policy Selection을 조회하는 중입니다" />
          ) : currentSelection.data ? (
            <KeyValues items={[
              ['Current Artifact', `${currentSelection.data.artifactId} · ${currentSelection.data.artifactVersion}`],
              ['Scope', `${currentSelection.data.executionPack} · ${currentSelection.data.workloadId} · ${currentSelection.data.purposeCode}`],
              ['Artifact Revision', String(currentSelection.data.artifactRevision)],
              ['Selection Revision', String(currentSelection.data.selectionRevision)],
              ['Selected By', currentSelection.data.selectedBy],
              ['Selected At', currentSelection.data.selectedAt],
            ]} />
          ) : hasNoCurrentSelection ? (
            <EmptyState compact title="현재 선택 없음" description="첫 활성화는 Selection Revision 0을 기준으로 원자적으로 생성됩니다." endpoint="GET /api/admin/policy-lifecycle/current-selection" />
          ) : currentSelection.isError ? (
            <ErrorState description={selectionError?.message ?? 'Current Selection 조회에 실패했습니다.'} onRetry={() => currentSelection.refetch()} />
          ) : null}

          {isGenericSelectionSupported && policy.lifecycleStage === 'APPROVED' ? (
            <div className="governance-command">
              <label className="checkbox-row">
                <input type="checkbox" checked={activationConfirmed} onChange={(event) => setActivationConfirmed(event.target.checked)} disabled={!canRunPrivilegedCommand || !canUseSelectionRevision} />
                <span>Artifact rev {policy.revision} / Selection rev {expectedSelectionRevision} 기준으로 ACTIVE를 교체합니다.</span>
              </label>
              <button className="button button-primary" type="button" disabled={!canRunPrivilegedCommand || !activationConfirmed || !canUseSelectionRevision || isMutating} onClick={activate} title={privilegedReason}>
                <ShieldCheck size={15} />Current Selection 활성화
              </button>
            </div>
          ) : null}

          {isGenericSelectionSupported && policy.lifecycleStage === 'SUPERSEDED' ? (
            <div className="governance-command governance-command-danger">
              <label className="checkbox-row">
                <input type="checkbox" checked={rollbackConfirmed} onChange={(event) => setRollbackConfirmed(event.target.checked)} disabled={!canRunPrivilegedCommand || !currentSelection.data} />
                <span>선택 Revision을 검증하고 이 SUPERSEDED 버전으로 롤백합니다.</span>
              </label>
              <button className="button button-danger" type="button" disabled={!canRunPrivilegedCommand || !rollbackConfirmed || !currentSelection.data || isMutating} onClick={rollbackSelection} title={privilegedReason}>
                <RotateCcw size={15} />이 버전으로 롤백
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {commandApiError ? (
        <ErrorState
          title={hasSelectionConflict ? 'Current Selection이 변경됐습니다' : 'Policy 명령이 거부됐습니다'}
          description={hasSelectionConflict
            ? `${commandApiError.errorCode}: 최신 Selection Revision을 다시 조회했습니다. 변경 내용을 확인한 뒤 명령을 다시 판단하세요.`
            : `${commandApiError.errorCode}: ${commandApiError.message}`}
          onRetry={hasSelectionConflict ? refreshSelectionAfterConflict : undefined}
          retryLabel="최신 상태 다시 조회"
        />
      ) : null}
      {activation.data || rollback.data ? (
        <div className="governance-result">
          <StatusBadge tone="success">SELECTION UPDATED</StatusBadge>
          <span>{(activation.data ?? rollback.data)?.artifactId} · selection rev {(activation.data ?? rollback.data)?.selectionRevision}</span>
        </div>
      ) : approval.data ? (
        <div className="governance-result"><StatusBadge tone="success">APPROVED</StatusBadge><span>Shadow Evidence가 Lifecycle revision {approval.data.revision}에 결속됐습니다.</span></div>
      ) : null}
    </SectionCard>
  );
}
