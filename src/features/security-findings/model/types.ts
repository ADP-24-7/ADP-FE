export type SecurityFindingExecutionPack = 'COMMON' | 'AI' | 'DIGITAL_ASSET' | 'SAAS';

export type SecurityFindingItem = {
  findingId: number;
  executionId: string;
  requestId: string;
  traceId: string;
  institutionId: string;
  executionPack: SecurityFindingExecutionPack;
  workloadId: string;
  purposeCode: string;
  findingType: string;
  location: string;
  detectorVersion: string;
  evidenceDigest: string;
  createdAt: string;
};

export type SecurityFindingDetail = SecurityFindingItem & {
  runtimeStatus: string;
  startOffset: number;
  endOffset: number;
  connectorExecutionId: string;
  connectorStatus: string;
  responseGuardStatus: string;
  responseDigest: string | null;
  tracePath: string;
  evidencePath: string;
};

export type SecurityFindingPage = {
  items: SecurityFindingItem[];
  page: number;
  size: number;
  totalElements: number;
};

export type SecurityFindingSearchParams = {
  executionPack?: SecurityFindingExecutionPack;
  workloadId?: string;
  findingType?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
};
