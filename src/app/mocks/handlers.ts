import { aiEvaluationHandlers } from '../../features/ai-evaluation/mocks/handlers';
import { auditTraceHandlers } from '../../features/audit-trace/mocks/handlers';
import { digitalAssetHandlers } from '../../features/digital-asset/mocks/handlers';
import { monitoringHandlers } from '../../features/monitoring/mocks/handlers';
import { operationsMonitoringHandlers } from '../../features/operations-monitoring/mocks/handlers';
import { policyLifecycleHandlers } from '../../features/policy-lifecycle/mocks/handlers';
import { recoveryOperationsHandlers } from '../../features/recovery-operations/mocks/handlers';
import { reviewQueueHandlers } from '../../features/review-queue/mocks/handlers';
import { securityFindingHandlers } from '../../features/security-findings/mocks/handlers';
import { runtimeExecutionHandlers } from '../../features/runtime-execution/mocks/handlers';
import { workloadHandlers } from '../../features/workloads/mocks/handlers';

export const handlers = [
  ...aiEvaluationHandlers,
  ...auditTraceHandlers,
  ...digitalAssetHandlers,
  ...monitoringHandlers,
  ...operationsMonitoringHandlers,
  ...policyLifecycleHandlers,
  ...recoveryOperationsHandlers,
  ...reviewQueueHandlers,
  ...securityFindingHandlers,
  ...runtimeExecutionHandlers,
  ...workloadHandlers,
];
