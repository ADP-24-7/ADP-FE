export type AuthRole =
  | 'BUSINESS_OWNER'
  | 'ANALYST'
  | 'COMPLIANCE_REVIEWER'
  | 'PRIVACY_REVIEWER'
  | 'SECURITY_REVIEWER'
  | 'DEVELOPER'
  | 'OPERATOR'
  | 'PRIVILEGED_OPERATOR'
  | 'AUDITOR'
  | 'METRICS_SCRAPER'
  | 'RUNTIME_EXECUTOR';

export type AuthContext = {
  principalId: string;
  principalType: 'USER' | 'SERVICE';
  displayName: string;
  institutionId: string;
  roles: AuthRole[];
  workloadIds: string[];
  subjectAuthorizationRequired: boolean;
};
