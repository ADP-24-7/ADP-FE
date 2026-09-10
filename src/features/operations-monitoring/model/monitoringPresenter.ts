import type { RecoveryIncidentSummary } from '../../recovery-operations';
import type { OperationsSummary } from './types';
import type { MonitoringIssue, MonitoringMetric, MonitoringSignalState, OperationsMonitoringViewModel, RuntimeStageHealth } from './monitoringViewModel';

const stateLabels: Record<MonitoringSignalState, string> = {
  normal: '정상',
  info: '발생 · 관찰',
  attention: '확인 필요',
  critical: '즉시 조치',
  unknown: '미연결',
};

function signalState(value: number, positiveState: MonitoringSignalState = 'attention'): MonitoringSignalState {
  return value > 0 ? positiveState : 'normal';
}

function metric(input: Omit<MonitoringMetric, 'stateLabel'>): MonitoringMetric {
  return { ...input, stateLabel: stateLabels[input.state] };
}

function formatDuration(seconds: number | null) {
  if (seconds == null) return '측정되지 않음';
  if (seconds < 60) return `${seconds}초`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분`;
  return `${Math.floor(seconds / 3600)}시간 ${Math.floor((seconds % 3600) / 60)}분`;
}

function presentIssue(incident: RecoveryIncidentSummary): MonitoringIssue {
  const isExhausted = incident.recoveryStatus === 'EXHAUSTED';
  const isManualReview = incident.recoveryStatus === 'MANUAL_REVIEW';
  const isSentUnknown = incident.observedStatus === 'SENT_UNKNOWN';
  const state: MonitoringSignalState = isExhausted || isManualReview ? 'attention' : 'info';
  const recommendation = isSentUnknown
    ? '즉시 재전송하지 말고 외부 상태를 먼저 조회한 뒤 결과를 대사하세요.'
    : isExhausted
      ? '자동 복구 횟수가 소진되었습니다. 실행 증적과 외부 처리 결과를 수동 검토하세요.'
      : isManualReview
        ? '담당자가 실행 증적과 외부 상태를 확인해 후속 조치를 결정하세요.'
        : '예약된 복구 시각과 최근 외부 상태를 확인하세요.';

  return {
    id: incident.recoveryId,
    title: isSentUnknown ? '외부 처리 결과 확인 필요' : isExhausted ? '자동 복구 소진' : isManualReview ? '수동 검토 대기' : '복구 처리 대기',
    state,
    stateLabel: stateLabels[state],
    summary: `${incident.workloadId} · 시도 ${incident.attemptCount}/${incident.maxAttempts}`,
    recommendation,
    executionId: incident.executionId,
    workloadId: incident.workloadId,
    observedStatus: incident.observedStatus,
    recoveryStatus: incident.recoveryStatus,
    retryDisposition: incident.retryDisposition,
    updatedAt: incident.updatedAt,
  };
}

export function presentRecoveryIssues(incidents: RecoveryIncidentSummary[]): MonitoringIssue[] {
  return incidents.filter((incident) => incident.recoveryStatus !== 'RECONCILED').map(presentIssue);
}

function stage(input: Omit<RuntimeStageHealth, 'stateLabel' | 'connectionLabel'>): RuntimeStageHealth {
  const connectionLabels = { observed: 'OBSERVED', partial: 'PARTIAL', 'not-connected': 'NOT CONNECTED' } as const;
  return { ...input, stateLabel: stateLabels[input.state], connectionLabel: connectionLabels[input.connection] };
}

export function presentOperationsMonitoring(summary: OperationsSummary, incidents: RecoveryIncidentSummary[]): OperationsMonitoringViewModel {
  const metrics: MonitoringMetric[] = [
    metric({
      id: 'recovery-backlog', label: '외부 결과 확인 대기', value: `${summary.recovery.backlog}건`,
      state: signalState(summary.recovery.backlog, 'info'),
      interpretation: summary.recovery.backlog > 0 ? '외부 처리 결과가 확정되지 않은 실행이 남아 있습니다.' : '현재 확인 대기 중인 외부 실행이 없습니다.',
      impact: summary.recovery.backlog > 0 ? `가장 오래된 대기는 ${formatDuration(summary.recovery.oldestBacklogAgeSeconds)}입니다.` : '추가 복구 작업이 필요하지 않습니다.',
      recommendation: summary.recovery.backlog > 0 ? '외부 상태 조회 후 대사 결과에 따라 복구 절차를 진행하세요.' : '현재 상태를 유지하세요.',
      rawField: 'recovery.backlog', rawValue: String(summary.recovery.backlog), criterion: 'PENDING · CLAIMED · RETRY_SCHEDULED 상태 집계',
      priority: 'primary',
    }),
    metric({
      id: 'manual-review', label: '운영자 수동 검토', value: `${summary.recovery.manualReview}건`,
      state: signalState(summary.recovery.manualReview),
      interpretation: summary.recovery.manualReview > 0 ? '자동 판단을 중단하고 담당자 결정을 기다리는 건이 있습니다.' : '수동 검토 대기 건이 없습니다.',
      impact: '검토 전에는 안전한 재시도 또는 종결 여부를 확정할 수 없습니다.',
      recommendation: summary.recovery.manualReview > 0 ? 'Recovery 화면에서 증적과 외부 결과를 함께 검토하세요.' : '추가 조치가 없습니다.',
      rawField: 'recovery.manualReview', rawValue: String(summary.recovery.manualReview), criterion: 'MANUAL_REVIEW 상태 집계',
      priority: 'primary',
    }),
    metric({
      id: 'recovery-exhausted', label: '자동 복구 소진', value: `${summary.recovery.exhausted}건`,
      state: signalState(summary.recovery.exhausted),
      interpretation: summary.recovery.exhausted > 0 ? '허용된 자동 복구 횟수를 모두 사용한 건이 있습니다.' : '자동 복구 한도를 소진한 건이 없습니다.',
      impact: '소진 건은 자동 처리만으로 정상화되지 않습니다.',
      recommendation: summary.recovery.exhausted > 0 ? '외부 처리 여부를 확인하고 수동 대사 또는 검토로 전환하세요.' : '추가 조치가 없습니다.',
      rawField: 'recovery.exhausted', rawValue: String(summary.recovery.exhausted), criterion: 'EXHAUSTED 상태 집계',
      priority: 'secondary',
    }),
    metric({
      id: 'stale-recovery', label: '지연된 복구 명령', value: `${summary.recovery.staleOperations}건`,
      state: signalState(summary.recovery.staleOperations, 'critical'),
      interpretation: summary.recovery.staleOperations > 0 ? 'BE가 설정한 지연 기준을 넘긴 복구 명령이 있습니다.' : '지연 기준을 넘긴 복구 명령이 없습니다.',
      impact: summary.recovery.staleOperations > 0 ? `가장 오래 지연된 명령은 ${formatDuration(summary.recovery.oldestStaleOperationAgeSeconds)}입니다.` : '복구 명령 지연이 관측되지 않았습니다.',
      recommendation: summary.recovery.staleOperations > 0 ? 'Worker 상태와 해당 명령의 작업 이력을 확인하세요.' : '현재 상태를 유지하세요.',
      rawField: 'recovery.staleOperations', rawValue: String(summary.recovery.staleOperations), criterion: 'BE가 적용한 stale 기준 집계 · 임계값은 응답에 미포함',
      priority: 'secondary',
    }),
    metric({
      id: 'runtime-failed', label: '실행 실패', value: `${summary.runtime.failed}건`,
      state: signalState(summary.runtime.failed, 'info'),
      interpretation: summary.runtime.failed > 0 ? '지정 시간창에 실패로 종결된 실행이 있습니다.' : '지정 시간창에 실패 실행이 없습니다.',
      impact: '실패율 기준선이 제공되지 않아 증가 또는 이상 여부는 판단하지 않습니다.',
      recommendation: summary.runtime.failed > 0 ? 'Audit에서 실행 증적과 실패 단계를 확인하세요.' : '기준선이 제공될 때까지 절대 건수로 관찰하세요.',
      rawField: 'runtime.failed', rawValue: String(summary.runtime.failed), criterion: 'FAILED 상태 절대 건수 · 기준선 미제공',
      priority: 'secondary',
    }),
    metric({
      id: 'runtime-blocked', label: '정상 정책 차단', value: `${summary.runtime.blocked}건`,
      state: signalState(summary.runtime.blocked, 'info'),
      interpretation: '정책이 허용하지 않은 요청을 외부 전송 전에 차단한 통제 결과입니다.',
      impact: 'BLOCKED와 NOT_SENT는 시스템 장애가 아니라 보안 통제가 동작한 상태입니다.',
      recommendation: summary.runtime.blocked > 0 ? '반복 패턴이 의심될 때만 Audit 증적을 검토하세요.' : '추가 조치가 없습니다.',
      rawField: 'runtime.blocked', rawValue: String(summary.runtime.blocked), criterion: 'BLOCKED 상태 집계 · 장애 집계에서 제외',
      priority: 'secondary',
    }),
    metric({
      id: 'policy-drift', label: '정책 선택 불일치', value: `${summary.policy.driftedSelections}건`,
      state: signalState(summary.policy.driftedSelections),
      interpretation: summary.policy.driftedSelections > 0 ? '현재 선택과 ACTIVE 정책의 버전·Digest·Revision이 일치하지 않는 항목이 있습니다.' : '현재 정책 선택의 정합성이 유지되고 있습니다.',
      impact: '불일치가 지속되면 의도와 다른 정책 Artifact가 참조될 수 있습니다.',
      recommendation: summary.policy.driftedSelections > 0 ? 'Policy Operations에서 Current Selection과 Artifact 상태를 대조하세요.' : '추가 조치가 없습니다.',
      rawField: 'policy.driftedSelections', rawValue: String(summary.policy.driftedSelections), criterion: 'BE Current Selection 정합성 판정 집계',
      priority: 'primary',
    }),
    metric({
      id: 'scope-mismatch', label: '기관 범위 불일치', value: `${summary.security.institutionScopeMismatch}건`,
      state: signalState(summary.security.institutionScopeMismatch, 'info'),
      interpretation: summary.security.institutionScopeMismatch > 0 ? '요청 기관과 허용된 운영 범위가 일치하지 않은 시도가 있습니다.' : '기관 범위 불일치가 관측되지 않았습니다.',
      impact: '거부 자체는 정상 통제이지만 반복 시 권한 설정 또는 접근 시도를 확인해야 합니다.',
      recommendation: summary.security.institutionScopeMismatch > 0 ? '반복 주체와 관련 Audit 증적을 확인하세요.' : '추가 조치가 없습니다.',
      rawField: 'security.institutionScopeMismatch', rawValue: String(summary.security.institutionScopeMismatch), criterion: 'INSTITUTION_SCOPE_MISMATCH 사유 집계',
      priority: 'primary',
    }),
  ];

  const issues = presentRecoveryIssues(incidents);
  const stages: RuntimeStageHealth[] = [
    stage({ id: 'authorization', label: '권한 · 기관 범위', connection: 'observed', state: signalState(summary.security.institutionScopeMismatch, 'info'), summary: summary.security.institutionScopeMismatch > 0 ? '기관 범위 불일치가 정상 차단됐습니다.' : '범위 통제가 정상 작동 중입니다.', evidence: 'security.institutionScopeMismatch' }),
    stage({ id: 'policy', label: '정책 바인딩', connection: 'observed', state: signalState(summary.policy.driftedSelections), summary: summary.policy.driftedSelections > 0 ? 'Current Selection 정합성 확인이 필요합니다.' : '정책 선택 불일치가 없습니다.', evidence: 'policy.driftedSelections' }),
    stage({ id: 'data', label: '데이터 접근 · 공개', connection: 'not-connected', state: 'unknown', summary: '단계별 집계 API가 아직 연결되지 않았습니다.', evidence: 'Data Access/Disclosure summary API 필요' }),
    stage({ id: 'connector', label: '외부 Provider · Adapter', connection: 'partial', state: signalState(summary.recovery.exhausted + summary.recovery.staleOperations), summary: summary.recovery.backlog > 0 ? `${summary.recovery.backlog}건의 외부 결과가 확인 대기 중입니다.` : '확인 대기 중인 외부 실행이 없습니다.', evidence: 'recovery.backlog · exhausted · staleOperations' }),
    stage({ id: 'response', label: '응답 Guard · Settlement', connection: 'not-connected', state: 'unknown', summary: '도메인별 결과 집계 API가 아직 연결되지 않았습니다.', evidence: 'Response Guard/Settlement summary API 필요' }),
  ];
  const priorityCount = metrics.filter((item) => item.state === 'attention' || item.state === 'critical').length;
  const briefState: MonitoringSignalState = metrics.some((item) => item.state === 'critical') ? 'critical' : priorityCount > 0 ? 'attention' : metrics.some((item) => item.state === 'info') ? 'info' : 'normal';
  const priorities = [
    summary.recovery.exhausted > 0 ? `자동 복구 소진 ${summary.recovery.exhausted}건` : null,
    summary.recovery.manualReview > 0 ? `수동 검토 ${summary.recovery.manualReview}건` : null,
    summary.recovery.staleOperations > 0 ? `지연된 복구 명령 ${summary.recovery.staleOperations}건` : null,
    summary.policy.driftedSelections > 0 ? `정책 선택 불일치 ${summary.policy.driftedSelections}건` : null,
  ].filter((item): item is string => item != null);
  const controlSummary = summary.runtime.blocked > 0
    ? `정책 차단 ${summary.runtime.blocked}건은 정상 통제로 처리됐습니다.`
    : '정책 차단은 관측되지 않았습니다.';

  return {
    brief: {
      state: briefState,
      title: briefState === 'critical' ? '지연 기준을 넘긴 운영 건을 즉시 확인하세요' : priorityCount > 0 ? '운영자 확인이 필요한 항목이 있습니다' : '현재 우선 조치가 필요한 항목이 없습니다',
      summary: priorities.length ? `${priorities.slice(0, 2).join(', ')}이 우선 확인 대상입니다. ${controlSummary}` : `${summary.windowMinutes}분 범위에 우선 조치 대상이 없습니다. ${controlSummary}`,
      priorityCount,
      generatedAt: summary.generatedAt,
    },
    metrics,
    issues,
    stages,
  };
}
