# API Integration

## Mode

일반 개발 실행은 `VITE_API_MODE=real`을 기본으로 사용합니다. Axios는 same-origin `/v1/**` 요청을 보내고, 로컬에서는 Vite proxy가 `VITE_API_BASE_URL`로 전달합니다. 배포 환경에서는 같은 `/v1/**` 경로를 reverse proxy가 처리해야 합니다.

MSW는 브라우저 bootstrap에서 시작하지 않습니다. MSW handler는 contract test에서만 사용하며, 운영 UI가 Mock 숫자나 임시 Trace를 생성하지 않도록 유지합니다.

## Planned Endpoints

| Page | Endpoints |
| --- | --- |
| Overview | `GET /v1/monitoring/overview` |
| Gateway Lab | `POST /v1/runtime/executions`, `GET /v1/runtime/executions/{executionId}`, `GET /v1/runtime/executions/{executionId}/trace` |
| Policy artifacts | `POST /v1/policy-evaluation-artifacts`, `GET /v1/policy-evaluation-artifacts/{artifactId}` |
| Policies | `GET /v1/policies`, `GET /v1/policies/{policyId}`, `POST /v1/policies/{policyId}/shadow`, `POST /v1/policies/{policyId}/activate`, `POST /v1/policies/{policyId}/rollback` |
| Monitoring | `/v1/monitoring/runtime`, `/v1/monitoring/privacy`, `/v1/monitoring/governance` |
| Audit | `GET /v1/audit-events` |

Gateway Lab은 Detection, Decision, Transform API를 직접 조합하지 않습니다. FE orchestration boundary는 runtime execution API 하나로 유지하고, Detection/Decision/Transform/Connector/Audit는 execution trace의 stage view model로 표현합니다.

## Runtime Execution Contract

```ts
type RuntimeExecutionRequest = {
  workloadId: string;
  purposeCode: string;
  subjectScope: string;
  providerProfileId: string;
  input: Record<string, unknown>;
  idempotencyKey: string;
};

type RuntimeExecution = {
  executionId: string;
  traceId: string;
  status: RuntimeExecutionStatus;
  finalAction?: FinalAction;
  reasonCodes: string[];
  policyVersion?: string;
  artifactVersion?: string;
  stages: RuntimeExecutionTraceStage[];
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
