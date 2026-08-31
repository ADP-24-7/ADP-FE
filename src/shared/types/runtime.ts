export const RUNTIME_ACTIONS = ['ALLOW', 'TRANSFORM', 'REVIEW', 'BLOCK'] as const;

export type RuntimeAction = (typeof RUNTIME_ACTIONS)[number];

export type RuntimeDecision = {
  traceId: string;
  policyAction: RuntimeAction;
  finalAction: RuntimeAction;
  reasonCode: string;
};
