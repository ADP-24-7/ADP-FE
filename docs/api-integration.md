# API Integration

## Mode

`VITE_API_MODE=mock`이면 MSW가 `/v1/**` 요청을 HTTP layer에서 intercept합니다. `real`이면 동일한 Axios 호출이 Vite proxy 또는 배포 reverse proxy를 통해 BE로 전달됩니다.

`VITE_API_MODE`는 fail-closed로 검증합니다. 값이 없거나 `mock`, `real` 외 값이면 앱이 시작되지 않습니다. `mock`은 `VITE_APP_ENV=local`에서만 허용합니다.

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
