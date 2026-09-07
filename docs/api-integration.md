# API Integration

## Contract Baseline

- Backend source: `ADP-BE origin/main`
- Backend commit: `b5d8d289c76843b064c41d92ee3d8aad987c468c`
- Reviewed: 2026-09-07
- Product plan: Notion `개발단계 추적`

Controller, request/response DTO, controller test를 함께 확인한 결과만 연결 대상으로 분류합니다. Notion의 목표 API와 FE의 화면 문구만 존재하는 경로는 구현 완료로 보지 않습니다.

## Connected Endpoints

| FE | Method | Endpoint | BE role | State |
| --- | --- | --- | --- | --- |
| Gateway Lab | POST | `/v1/runtime/executions` | `RUNTIME_EXECUTOR` | 연결 |
| Gateway Lab | GET | `/v1/runtime/executions/{executionId}` | `RUNTIME_EXECUTOR` | API client 연결 |
| Gateway Lab | GET | `/v1/runtime/executions/{executionId}/trace` | `RUNTIME_EXECUTOR` | 연결 |
| Workload · Data Access | POST | `/api/runtime/context/preview` | `RUNTIME_EXECUTOR` | 로컬 Preview 연결 |
| Workload · Data Access | POST | `/api/runtime/data-access/preview` | `RUNTIME_EXECUTOR` | 원문 Record 포함으로 UI 미사용 |
| Decision Trace | GET | `/api/admin/audit/executions` | `OPERATOR` | 연결 |
| Decision Trace | GET | `/api/admin/audit/executions/{executionId}/evidence` | `PRIVILEGED_OPERATOR` | 연결 |
| 정책 · 승인 | GET | `/api/admin/policy-lifecycle/{artifactId}/versions/{artifactVersion}` | `AUDITOR` 이상 | 연결 |
| 정책 · 승인 | POST | `/api/admin/policy-lifecycle` | `OPERATOR` 이상 | API client만 제공 |
| 정책 · 승인 | POST | `/api/admin/policy-lifecycle/{artifactId}/versions/{artifactVersion}/transitions` | 단계별 Maker/Checker | API client만 제공 |
| Runtime 상태 | GET | `/actuator/health/readiness` | Public | 프록시 가능 |
| Metrics | GET | `/actuator/prometheus` | Auth 또는 Public 설정 | 프록시 가능 |

Policy create/transition은 서버 상태를 변경하므로 조회 UI와 분리했습니다. Admin 인증·권한 UX와 확인 절차가 정해지기 전에는 화면에서 임의 실행하지 않습니다.

## Local BFF Boundary

브라우저 코드에는 API Key와 로컬 사용자 헤더를 넣지 않습니다. `VITE_LOCAL_BFF_ENABLED=true`일 때 Vite 개발 서버가 proxy 요청에만 아래 서버 환경변수를 사용합니다.

```dotenv
VITE_LOCAL_BFF_ENABLED=true
ADP_LOCAL_RUNTIME_API_KEY=local-dev-api-key
ADP_LOCAL_USER_ID=operator-local
ADP_LOCAL_USER_ROLES=OPERATOR,PRIVILEGED_OPERATOR
```

`ADP_LOCAL_*`에는 `VITE_` 접두사가 없으므로 client bundle에 포함되지 않습니다. 이 방식은 로컬 E2E 검증 전용이며 배포 환경에서는 Admin User 인증을 처리하는 BFF 또는 API Gateway가 같은 역할을 맡아야 합니다.

## Runtime Request

```ts
type RuntimeExecutionRequest = {
  institutionId: string;
  approvalReference: string;
  workloadId: string;
  purposeCode: string;
  subjectScope: string;
  destinationProfileId: string;
  idempotencyKey: string;
  processingContexts: string[];
  input: Record<string, unknown>;
};
```

AI Pack 입력은 `input.prompt`를 사용합니다. 현재 Digital Asset Thin E2E 입력은 정확히 `customerId`, `accountId`, `walletAddress`, `assetId`, `amount` 다섯 필드를 요구합니다. 다만 최신 Notion 기준의 `ApprovedTransaction + OutboundRequest` Realignment 계약은 아직 확정되지 않았으므로 Digital Asset UI는 현재 계약과 향후 계약을 혼동하지 않아야 합니다.

## Runtime Flow

```text
POST /v1/runtime/executions
  -> executionId
  -> GET /v1/runtime/executions/{executionId}/trace
  -> observed stages + privacy-safe evidence
```

FE가 Detection, Decision, Transform 내부 API를 직접 조합하지 않습니다. `policyAction`과 `finalAction`은 별도 필드로 유지하고, Raw Prompt·고객/계좌 원문·Token Map은 브라우저 저장소나 로그에 기록하지 않습니다.

## Error Handling

401, 403, 404, 409, 422와 네트워크 오류는 공통 `normalizeApiError`를 통해 `status`, `errorCode`, `message`, `requestId`, `traceId`로 정규화합니다. 데이터 없음과 API 오류는 별도 UI 상태로 표시합니다.
