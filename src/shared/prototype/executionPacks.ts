export type ExecutionPackKey = 'common' | 'ai' | 'saas' | 'digital-asset';

export type ExecutionPack = {
  key: ExecutionPackKey;
  label: string;
  role: string;
  scope: string;
  badge: string;
  descriptor: string;
  priority: string;
  implementation: string;
  objective: string;
  baseline: string;
  executionSurfaces: ReadonlyArray<string>;
  policyHarness: ReadonlyArray<{
    title: string;
    description: string;
  }>;
  destinationProfile: ReadonlyArray<readonly [string, string]>;
  fieldTreatments: ReadonlyArray<readonly [string, string]>;
  evidenceChecks: ReadonlyArray<readonly [string, string]>;
  runtimeFocus: ReadonlyArray<readonly [string, string]>;
  defaultProcessingContexts: ReadonlyArray<string>;
  gatewayRequest: {
    workloadPlaceholder: string;
    purposePlaceholder: string;
    subjectPlaceholder: string;
    destinationPlaceholder: string;
    inputLabel: string;
    inputPlaceholder: string;
  };
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
    priority: 'Foundation',
    implementation: '공통 계약 우선',
    objective: '기존 금융권 통제 결과를 입력으로 받아 Workload, Policy, Destination, Audit 계약을 표준화합니다.',
    baseline: 'IAM·마스킹·DLP·반출승인·감사 로그를 대체하지 않고 승인 조건을 Runtime에서 재사용합니다.',
    executionSurfaces: ['승인된 Workload', 'Data Access Profile', 'Policy Snapshot', 'Decision Trace'],
    policyHarness: [
      { title: 'Institution Policy Pack', description: '법규, 내부 규정, 샌드박스 조건, 승인권자 기준을 버전으로 고정' },
      { title: 'Workload Contract', description: '목적, 주체, 데이터 범위, 허용 Destination을 실행 단위로 제한' },
      { title: 'Destination Profile', description: 'Provider, Tenant, Region, Retention, Training Use 조건을 외부 대상별로 관리' },
    ],
    destinationProfile: [
      ['Provider', '—'],
      ['Tenant / Region', '—'],
      ['Retention', '—'],
      ['Training Use', '—'],
    ],
    fieldTreatments: [
      ['Default', 'DENY'],
      ['Sensitive Field', 'REMOVE · MASK · TOKEN'],
      ['Exact Required', 'KEEP_EXACT_PROTECTED'],
      ['Unknown Class', 'REVIEW'],
    ],
    evidenceChecks: [
      ['Baseline Control', '기존 승인·마스킹·DLP 결과를 Evidence로 연결'],
      ['Policy Binding', '승인 조건과 Runtime Snapshot의 버전 일치 확인'],
      ['Audit Completeness', 'Raw 원문 없이 Reason Code와 Digest로 재현'],
    ],
    runtimeFocus: [
      ['Core Goal', 'Zero-Unapproved Raw Egress'],
      ['Decision', 'ALLOW · TRANSFORM · REVIEW · BLOCK'],
      ['Trace', '요청부터 전달까지 단일 Decision Trace'],
    ],
    defaultProcessingContexts: ['REGULATED_EXTERNAL_EXECUTION'],
    gatewayRequest: {
      workloadPlaceholder: '승인된 workload ID',
      purposePlaceholder: '승인된 purpose code',
      subjectPlaceholder: '마스킹된 subject scope',
      destinationPlaceholder: '승인된 destination profile',
      inputLabel: '실행 입력',
      inputPlaceholder: '민감한 실제 고객정보 대신 테스트용 입력을 사용하세요.',
    },
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
    priority: 'Phase 1',
    implementation: 'Full E2E 기준 구현',
    objective: '상담·문서 RAG 흐름에서 Prompt, Retrieved Context, Provider Request, Response를 양방향으로 검증합니다.',
    baseline: '기존 고객정보 조회 승인과 마스킹 결과를 RAG Context 입력 경계로 재사용합니다.',
    executionSurfaces: ['Prompt', 'RAG Context', 'Provider Request', 'Model Response'],
    policyHarness: [
      { title: 'Purpose-bound Retrieval', description: '승인 목적과 Dataset Scope에 맞는 Context만 조회' },
      { title: 'Prompt / Context Treatment', description: '계좌·식별자·민감 필드를 목적별로 제거, 마스킹, 토큰화' },
      { title: 'Response Guard', description: '응답에서 재식별, 원문 회귀, 금칙 조언을 다시 검증' },
    ],
    destinationProfile: [
      ['Provider', 'LLM Provider Profile'],
      ['Tenant / Region', '승인된 Tenant·Region만 허용'],
      ['Retention', 'No retention 또는 계약 조건 필요'],
      ['Training Use', 'Disabled 확인 필요'],
    ],
    fieldTreatments: [
      ['Account Number', 'TOKEN'],
      ['Customer Name', 'MASK'],
      ['Transaction Detail', 'GENERALIZE'],
      ['Required Citation', 'KEEP_EXACT_PROTECTED'],
    ],
    evidenceChecks: [
      ['Privacy-Utility', '변환 후 상담 답변 유용성과 누출 위험 비교'],
      ['RAG Grounding', '응답 근거가 승인 Context 범위 안에 있는지 확인'],
      ['Response Leakage', 'Provider 응답에서 원문 또는 간접식별자 회귀 탐지'],
    ],
    runtimeFocus: [
      ['Input', 'Prompt · RAG Context'],
      ['Outbound', 'Provider payload raw-value residual 검사'],
      ['Inbound', 'Response Guard 후 Controlled Delivery'],
    ],
    defaultProcessingContexts: ['AI_USE', 'CUSTOMER_SUPPORT'],
    gatewayRequest: {
      workloadPlaceholder: 'customer-advisory-rag',
      purposePlaceholder: 'CUSTOMER_SUPPORT',
      subjectPlaceholder: 'customer:{masked-id}',
      destinationPlaceholder: 'llm-provider-approved',
      inputLabel: '사용자 질문',
      inputPlaceholder: '고객 상담 또는 문서 RAG 테스트 질문을 입력하세요. 실제 고객 원문은 넣지 마세요.',
    },
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
    badge: 'CONTRACT VALIDATION',
    descriptor: 'SAAS · CONTRACT VALIDATION',
    priority: 'Phase 3',
    implementation: 'Contract 중심 검증',
    objective: '외부 SaaS 문서, 첨부 메타데이터, Workflow API, Webhook 응답을 승인된 업무 범위로 제한합니다.',
    baseline: '기존 파일·메일 반출 승인과 DLP Finding을 SaaS API/Webhook 실행 경계로 확장합니다.',
    executionSurfaces: ['Document Payload', 'Attachment Metadata', 'Workflow API JSON', 'Webhook Response'],
    policyHarness: [
      { title: 'SaaS Destination Profile', description: 'Workspace, Tenant, App Scope, Region, Retention 조건을 고정' },
      { title: 'Attachment Boundary', description: '파일 본문과 메타데이터의 반출 가능 필드를 분리' },
      { title: 'Webhook Guard', description: '외부 SaaS 응답 또는 Callback이 내부 상태를 오염시키지 않도록 검증' },
    ],
    destinationProfile: [
      ['Provider', 'SaaS Connector'],
      ['Workspace / Tenant', '승인된 업무 Workspace'],
      ['Region', '계약·내규 허용 Region'],
      ['Webhook', '서명·Scope 검증 필요'],
    ],
    fieldTreatments: [
      ['Document Body', 'MASK · GENERALIZE'],
      ['Attachment Metadata', 'ALLOWLIST'],
      ['Customer Identifier', 'TOKEN'],
      ['Unknown File Class', 'REVIEW'],
    ],
    evidenceChecks: [
      ['DLP Reuse', '기존 DLP Finding과 Workload 필요성 연결'],
      ['Destination Drift', 'Tenant, Region, Retention 변경 시 재검토'],
      ['Webhook Integrity', '외부 Callback의 trace, signature, state 검증'],
    ],
    runtimeFocus: [
      ['Input', '문서·첨부·업무 Workflow JSON'],
      ['Outbound', '허용 Field만 SaaS API로 전송'],
      ['Inbound', 'Webhook·External Response Guard'],
    ],
    defaultProcessingContexts: ['SAAS_WORKFLOW', 'DOCUMENT_EXPORT'],
    gatewayRequest: {
      workloadPlaceholder: 'saas-document-workflow',
      purposePlaceholder: 'DOCUMENT_COLLABORATION',
      subjectPlaceholder: 'workspace:{approved-scope}',
      destinationPlaceholder: 'saas-connector-approved',
      inputLabel: 'Workflow Payload',
      inputPlaceholder: '문서 요약, 첨부 메타데이터, Webhook 처리 등 SaaS 업무 Payload를 입력하세요.',
    },
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
    badge: 'THIN E2E CONTRACT',
    descriptor: 'DIGITAL ASSET · CONTRACT VALIDATION',
    priority: 'Phase 2',
    implementation: 'Thin E2E 검증',
    objective: '정산, 지갑, 온체인 이벤트 처리에서 Protocol Field와 개인정보성 메타데이터를 분리해 집행합니다.',
    baseline: '기존 정산 승인, 이상거래 모니터링, 외부기관 보고 기준을 실행 정책으로 연결합니다.',
    executionSurfaces: ['Settlement Request', 'Wallet Reference', 'On-chain Event', 'Protocol Payload'],
    policyHarness: [
      { title: 'Protocol Field Policy', description: '정확성이 필요한 필드와 개인정보성 메타데이터의 처리 방식을 분리' },
      { title: 'Counterparty Scope', description: '거래상대, 기관, 네트워크, 자산 유형별 승인 조건을 고정' },
      { title: 'Event Traceability', description: '온체인 이벤트와 내부 결정 근거를 원문 없이 연결' },
    ],
    destinationProfile: [
      ['Network', '승인된 Network / Protocol'],
      ['Counterparty', '기관·지갑 Scope 필요'],
      ['Region', '보고·규제 기준 확인'],
      ['Retention', '감사 보존 정책 적용'],
    ],
    fieldTreatments: [
      ['Wallet Address', 'TOKEN · KEEP_EXACT_PROTECTED'],
      ['Settlement Amount', 'KEEP_EXACT_PROTECTED'],
      ['Customer Linkage', 'TOKEN'],
      ['Free-text Memo', 'MASK · REVIEW'],
    ],
    evidenceChecks: [
      ['Protocol Exactness', '정산 필수 필드가 과도하게 변환되지 않았는지 확인'],
      ['Privacy Linkage', '지갑·거래·고객 연결 가능성 평가'],
      ['Audit Reconciliation', '내부 승인과 외부 이벤트의 trace 연결성 확인'],
    ],
    runtimeFocus: [
      ['Input', '정산 요청·온체인 이벤트'],
      ['Outbound', 'Protocol 필수값과 개인정보성 필드 분리'],
      ['Inbound', '외부 상태·이벤트 재검증'],
    ],
    defaultProcessingContexts: ['DIGITAL_ASSET_SETTLEMENT', 'ONCHAIN_EVENT'],
    gatewayRequest: {
      workloadPlaceholder: 'digital-asset-settlement',
      purposePlaceholder: 'SETTLEMENT_RECONCILIATION',
      subjectPlaceholder: 'counterparty:{approved-scope}',
      destinationPlaceholder: 'protocol-network-approved',
      inputLabel: '정산·이벤트 Payload',
      inputPlaceholder: '정산 요청, 지갑 참조, 온체인 이벤트 등 테스트 Payload를 입력하세요.',
    },
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
