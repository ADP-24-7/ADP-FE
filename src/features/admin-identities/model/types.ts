export type AdminPrincipalType = 'USER' | 'SERVICE';

export type AdminIdentityItem = {
  principalId: string;
  principalType: AdminPrincipalType;
  displayName: string;
  institutionId: string;
  enabled: boolean;
  subjectAuthorizationRequired: boolean;
  roles: string[];
  workloadIds: string[];
  enabledApiKeyCount: number;
  totalApiKeyCount: number;
  createdAt: string;
};

export type AdminIdentityPermission = {
  workloadId: string;
  workloadName: string;
  workloadRegistryStatus: 'ENABLED' | 'DISABLED' | 'UNRESOLVED';
  actionName: string;
  purpose: string;
  subjectType: string;
  subjectGrantCount: number;
};

export type AdminIdentityDetail = {
  identity: AdminIdentityItem;
  permissions: AdminIdentityPermission[];
};

export type AdminIdentityPage = {
  items: AdminIdentityItem[];
  page: number;
  size: number;
  totalElements: number;
};

export type AdminIdentitySearchParams = {
  principalType?: AdminPrincipalType;
  role?: string;
  workloadId?: string;
  enabled?: boolean;
  query?: string;
  page?: number;
  size?: number;
};
