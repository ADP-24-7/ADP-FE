import { env } from '../../../shared/config/env';
import type { AuthRole } from '../../auth';

export function hasRuntimeExecutionRole(roles: readonly AuthRole[] | undefined) {
  return roles?.some((role) => role === 'OPERATOR' || role === 'DEVELOPER') ?? false;
}

export const runtimeExecutionCapabilities = {
  canExecute: env.localBffEnabled,
  authBoundary: env.localBffEnabled ? 'LOCAL_BFF' : 'UNAVAILABLE',
} as const;
