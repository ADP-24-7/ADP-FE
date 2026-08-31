import { monitoringHandlers } from '../../features/monitoring/mocks/handlers';
import { runtimeExecutionHandlers } from '../../features/runtime-execution/mocks/handlers';

export const handlers = [...monitoringHandlers, ...runtimeExecutionHandlers];
