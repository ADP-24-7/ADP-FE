import { aiEvaluationHandlers } from '../../features/ai-evaluation/mocks/handlers';
import { authHandlers } from '../../features/auth/mocks/handlers';
import { adminIdentityHandlers } from '../../features/admin-identities/mocks/handlers';
import { auditTraceHandlers } from '../../features/audit-trace/mocks/handlers';
import { digitalAssetHandlers } from '../../features/digital-asset/mocks/handlers';
import { monitoringHandlers } from '../../features/monitoring/mocks/handlers';
import { operationsMonitoringHandlers } from '../../features/operations-monitoring/mocks/handlers';
import { policyLifecycleHandlers } from '../../features/policy-lifecycle/mocks/handlers';
import { recoveryOperationsHandlers } from '../../features/recovery-operations/mocks/handlers';
import { referenceEvidenceHandlers } from '../../features/reference-evidence/mocks/handlers';
import { reviewQueueHandlers } from '../../features/review-queue/mocks/handlers';
import { securityFindingHandlers } from '../../features/security-findings/mocks/handlers';
import { runtimeExecutionHandlers } from '../../features/runtime-execution/mocks/handlers';
import { workloadHandlers } from '../../features/workloads/mocks/handlers';
import { auditExportHandlers } from '../../features/audit-export/mocks/handlers';

export const handlers = [
  ...authHandlers,
  ...auditExportHandlers,
  ...adminIdentityHandlers,
  ...aiEvaluationHandlers,
  ...auditTraceHandlers,
  ...digitalAssetHandlers,
  ...monitoringHandlers,
  ...operationsMonitoringHandlers,
  ...policyLifecycleHandlers,
  ...recoveryOperationsHandlers,
  ...referenceEvidenceHandlers,
  ...reviewQueueHandlers,
  ...securityFindingHandlers,
  ...runtimeExecutionHandlers,
  ...workloadHandlers,
];
