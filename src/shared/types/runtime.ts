export const RUNTIME_ACTIONS = ['ALLOW', 'TRANSFORM', 'REVIEW', 'BLOCK'] as const;

export type PolicyAction = (typeof RUNTIME_ACTIONS)[number];
export type FinalAction = (typeof RUNTIME_ACTIONS)[number];

export type RuntimeDecision = {
  traceId: string;
  policyAction: PolicyAction;
  finalAction: FinalAction;
  reasonCode: string;
};
