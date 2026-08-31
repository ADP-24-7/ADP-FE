# API Integration

## Mode

일반 개발 실행은 `VITE_API_MODE=real`을 기본으로 사용합니다. Axios는 same-origin `/v1/**` 요청을 보내고, 로컬에서는 Vite proxy가 `VITE_API_BASE_URL`로 전달합니다. 배포 환경에서는 같은 `/v1/**` 경로를 reverse proxy가 처리해야 합니다.

MSW는 브라우저 bootstrap에서 시작하지 않습니다. MSW handler는 contract test에서만 사용하며, 운영 UI가 Mock 숫자나 임시 Trace를 생성하지 않도록 유지합니다.

## Planned Endpoints

| Page | Endpoints |
| --- | --- |
| Overview | `GET /v1/monitoring/overview` |
| Workload · Data Access | `GET /v1/workloads`, `GET /v1/data-access/decisions` |
| Gateway Lab | `POST /v1/runtime/executions`, `GET /v1/runtime/executions/{executionId}`, `GET /v1/runtime/executions/{executionId}/trace` |
| Policy artifacts | `POST /v1/policy-evaluation-artifacts`, `GET /v1/policy-evaluation-artifacts/{artifactId}` |
| Policies | `GET /v1/policies`, `GET /v1/policies/{policyId}`, `POST /v1/policies/{policyId}/shadow`, `POST /v1/policies/{policyId}/activate`, `POST /v1/policies/{policyId}/rollback` |
| Monitoring | `/v1/monitoring/runtime`, `/v1/monitoring/privacy`, `/v1/monitoring/governance` |
| Audit | `GET /v1/audit-events` |

Gateway Lab은 Detection, Decision, Transform API를 직접 조합하지 않습니다. FE orchestration boundary는 runtime execution API 하나로 유지합니다. 현재 BE #5에서 실제 관측 가능한 stage는 `RECEIVED`, `AUTHORIZATION`, `RETRIEVAL`, `CANONICAL_CONTEXT`, `DECISION`이며, Transform/Provider/Response Guard/Audit는 Target Pipeline으로만 구분해 표시합니다.

브라우저 FE는 `X-ADP-API-Key`를 환경변수로 주입하지 않습니다. Admin 인증 또는 Local BFF에서 서버 측 credential을 붙이기 전까지 Gateway Lab의 Execute control은 비활성화합니다.

Audit 화면의 Trace ID 검색은 원문 재구성이 아니라 `GET /v1/audit-events?traceId={traceId}` 또는 Runtime Execution trace API의 privacy-safe 응답을 표시하는 흐름으로 연결합니다.

## Runtime Execution Contract

```ts
type RuntimeExecutionRequest = {
  workloadId: string;
  purposeCode: string;
  subjectScope: string;
  providerProfileId: string;
  idempotencyKey: string;
  processingContexts: string[];
  input: Record<string, unknown>;
};

type RuntimeExecution = {
  executionId: string;
  status: 'DECIDED' | 'BLOCKED' | 'FAILED';
  decisionId: string;
  policyAction: PolicyAction;
  finalAction: FinalAction;
  authorizationResult: 'ALLOWED' | 'DENIED';
  applicabilityResult: 'APPLICABLE' | 'NOT_APPLICABLE' | 'INCOMPLETE';
  runtimeContextDigest: string;
  policyVersion?: string;
  snapshotDigest?: string;
  sourceArtifactId?: string;
  sourceArtifactVersion?: string;
  sourceArtifactDigestAlgorithm?: string;
  sourceArtifactDigestValue?: string;
  connectorStatus?: string;
  auditId?: string;
};

type RuntimeExecutionTrace = {
  executionId: string;
  traceId: string;
  status: RuntimeExecutionStatus;
  stages: Array<{
    stage: 'RECEIVED' | 'AUTHORIZATION' | 'RETRIEVAL' | 'CANONICAL_CONTEXT' | 'DECISION' | 'RUNTIME_EXECUTION';
    status: RuntimeExecutionStatus;
    observedAt?: string;
  }>;
};
```

## Runtime Action Contract

FE에서 허용하는 policy/final action은 다음 값으로 고정합니다.

```ts
type PolicyAction = 'ALLOW' | 'TRANSFORM' | 'REVIEW' | 'BLOCK';
type FinalAction = 'ALLOW' | 'TRANSFORM' | 'REVIEW' | 'BLOCK';
```

`policy_action`과 `final_action`은 별도로 표시하고 저장합니다.

## Error Contract

BE error response는 다음 필드를 기준으로 normalize합니다.

```ts
type ApiError = {
  status?: number;
  errorCode: string;
  message: string;
  requestId?: string;
  traceId?: string;
};
```

전환 기간 동안 legacy `reasonCode`는 `errorCode`로 normalize합니다.
