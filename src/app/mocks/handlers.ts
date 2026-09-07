import { auditTraceHandlers } from '../../features/audit-trace/mocks/handlers';
import { monitoringHandlers } from '../../features/monitoring/mocks/handlers';
import { policyLifecycleHandlers } from '../../features/policy-lifecycle/mocks/handlers';
import { runtimeExecutionHandlers } from '../../features/runtime-execution/mocks/handlers';
import { workloadHandlers } from '../../features/workloads/mocks/handlers';

export const handlers = [
  ...auditTraceHandlers,
  ...monitoringHandlers,
  ...policyLifecycleHandlers,
  ...runtimeExecutionHandlers,
  ...workloadHandlers,
];
