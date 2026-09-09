import type { RecoveryIncidentDetail, RecoveryOperationType } from './types';

export type RecoveryCommandAvailability = Record<RecoveryOperationType, {
  enabled: boolean;
  reason: string;
}>;

const commandTypes: RecoveryOperationType[] = ['RECONCILE', 'RETRY', 'MARK_REVIEW'];

function disableAll(reason: string): RecoveryCommandAvailability {
  return Object.fromEntries(commandTypes.map((type) => [type, { enabled: false, reason }])) as RecoveryCommandAvailability;
}

export function getRecoveryCommandAvailability(incident: RecoveryIncidentDetail): RecoveryCommandAvailability {
  if (incident.recoveryStatus === 'RECONCILED') {
    return disableAll('이미 외부 상태가 확정되어 추가 Recovery 명령이 필요하지 않습니다.');
  }
  if (incident.recoveryStatus === 'CLAIMED') {
    return disableAll('현재 Worker 또는 다른 운영자가 Incident를 처리하고 있습니다.');
  }

  const attemptsRemaining = incident.attemptCount < incident.maxAttempts;
  const alreadyInReview = incident.recoveryStatus === 'MANUAL_REVIEW';

  return {
    RECONCILE: {
      enabled: attemptsRemaining,
      reason: attemptsRemaining
        ? 'Provider 상태를 먼저 조회해 실행 결과를 확정합니다.'
        : '허용된 처리 횟수를 모두 사용했습니다. 수동 검토로 전환하세요.',
    },
    RETRY: {
      enabled: attemptsRemaining && incident.retryDisposition === 'RETRY_ALLOWED',
      reason: !attemptsRemaining
        ? '허용된 처리 횟수를 모두 사용해 재시도할 수 없습니다.'
        : incident.retryDisposition === 'RETRY_ALLOWED'
          ? 'BE가 현재 Incident를 안전 재시도 가능한 상태로 분류했습니다.'
          : `현재 Retry Disposition은 ${incident.retryDisposition}입니다. 외부 상태 확인을 먼저 수행하세요.`,
    },
    MARK_REVIEW: {
      enabled: !alreadyInReview,
      reason: alreadyInReview
        ? '이미 수동 검토 상태입니다.'
        : '자동 처리를 중단하고 운영자 수동 검토 대상으로 전환합니다.',
    },
  };
}
