import { env } from '../../../shared/config/env';

export const runtimeExecutionCapabilities = {
  canExecute: env.localBffEnabled,
  authBoundary: env.localBffEnabled ? 'LOCAL_BFF' : 'UNAVAILABLE',
} as const;
