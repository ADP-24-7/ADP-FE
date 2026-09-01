export type ExecutionPackKey = 'common' | 'ai' | 'saas' | 'digital-asset';

export type ExecutionPack = {
  key: ExecutionPackKey;
  label: string;
  role: string;
  scope: string;
  badge: string;
  descriptor: string;
  versionContext: ReadonlyArray<readonly [string, string]>;
  boundaries: ReadonlyArray<{
    number: string;
    title: string;
    description: string;
    route: '/data-access' | '/gateway-lab' | '/analysis' | '/policies' | '/monitoring' | '/audit';
  }>;
};

const sharedBoundaries = [
  {
    number: '01',
    title: 'Request & Authorization',
    description: '주체·Workload·목적·승인 범위를 확인',
    route: '/gateway-lab',
  },
  {
    number: '02',
    title: 'Data Access & Context',
    description: '허용된 Dataset·Field·Subject 범위만 조회',
    route: '/data-access',
  },
  {
    number: '03',
    title: 'Policy Applicability',
    description: '유효 Evidence·Profile·승인 조건을 판정',
    route: '/policies',
  },
  {
    number: '04',
    title: 'Privacy & Payload Guard',
    description: '민감정보 탐지·변환 후 Payload를 검사',
    route: '/gateway-lab',
  },
  {
    number: '05',
    title: 'External Execution Guard',
    description: '외부 실행 결과와 상태를 채널별로 검증',
    route: '/monitoring',
  },
  {
    number: '06',
    title: 'Controlled Delivery & Audit',
    description: '안전한 결과만 전달하고 전 과정 기록',
    route: '/audit',
  },
] satisfies ExecutionPack['boundaries'];

export const executionPacks: ExecutionPack[] = [
  {
    key: 'common',
    label: 'Common Core',
    role: '공통 통제 계약',
    scope: 'Workload·Policy·Evidence·Audit',
    badge: 'SHARED CONTRACT',
    descriptor: 'COMMON · SHARED CONTRACT',
    versionContext: [
      ['Application', '—'],
      ['Policy Snapshot', '—'],
      ['Execution Pack', 'COMMON'],
      ['Profile Snapshot', '—'],
      ['Analysis Artifact', '—'],
      ['Dataset Snapshot', '—'],
    ],
    boundaries: sharedBoundaries,
  },
  {
    key: 'ai',
    label: 'AI',
    role: 'Reference Implementation',
    scope: '금융상담·문서 RAG',
    badge: 'FULL E2E REFERENCE',
    descriptor: 'AI · FULL E2E REFERENCE',
    versionContext: [
      ['Application', '—'],
      ['Policy Snapshot', '—'],
      ['Execution Pack', 'AI'],
      ['Profile Snapshot', '—'],
      ['Analysis Artifact', '—'],
      ['Dataset Snapshot', '—'],
    ],
    boundaries: sharedBoundaries,
  },
  {
    key: 'saas',
    label: 'SaaS',
    role: 'Contract Validation',
    scope: '외부 문서·업무 Workflow',
    badge: 'CONTRACT + PROTOTYPE',
    descriptor: 'SAAS · CONTRACT VALIDATION',
    versionContext: [
      ['Application', '—'],
      ['Policy Snapshot', '—'],
      ['Execution Pack', 'SAAS'],
      ['Profile Snapshot', '—'],
      ['Analysis Artifact', '—'],
      ['Dataset Snapshot', '—'],
    ],
    boundaries: sharedBoundaries,
  },
  {
    key: 'digital-asset',
    label: 'Digital Asset',
    role: 'Contract Validation',
    scope: '정산·온체인 Event',
    badge: 'CONTRACT + PROTOTYPE',
    descriptor: 'DIGITAL ASSET · CONTRACT VALIDATION',
    versionContext: [
      ['Application', '—'],
      ['Policy Snapshot', '—'],
      ['Execution Pack', 'DIGITAL_ASSET'],
      ['Profile Snapshot', '—'],
      ['Analysis Artifact', '—'],
      ['Dataset Snapshot', '—'],
    ],
    boundaries: sharedBoundaries,
  },
];

export const timeRanges = ['최근 24시간', '최근 7일', '최근 30일'] as const;
