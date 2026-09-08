# API Integration

## Contract Baseline

- Backend source: `ADP-BE origin/main`
- Backend commit: `31ae5f1a60d1a03bf8f9cdca896fbf5a29f42df1`
- Reviewed: 2026-09-08
- Product source: Notion `개발단계 추적`

Controller, DTO, SecurityConfig, Controller test가 모두 존재하는 계약만 연결 대상으로 분류한다.

## Connected Endpoints

| FE area | Method | Endpoint | Required role | Integration |
| --- | --- | --- | --- | --- |
| Gateway Lab | POST | `/v1/runtime/executions` | `RUNTIME_EXECUTOR` | AI/P0-4 Digital Asset 요청 연결 |
| Gateway Lab | GET | `/v1/runtime/executions/{executionId}` | `RUNTIME_EXECUTOR` | API client 제공 |
| Gateway Lab | GET | `/v1/runtime/executions/{executionId}/trace` | `RUNTIME_EXECUTOR` | 관측 Stage/Evidence 연결 |
| AI Analysis | GET | `/api/admin/ai/evaluation-runs/{runId}/readiness` | `PRIVILEGED_OPERATOR` | Run 단건 조회 연결 |
| AI Analysis | GET | `/api/admin/ai/evaluation-runs/{runId}/bundle` | `PRIVILEGED_OPERATOR` | `bundle_available=true` 이후 연결 |
| Digital Asset Policy | POST | `/api/admin/digital-assets/artifacts/ingestions` | `OPERATOR` | 확인 절차가 있는 명시적 등록 명령 |
| Digital Asset Policy | GET | `/api/admin/digital-assets/artifacts/{artifactId}/versions/{version}` | `OPERATOR`, `PRIVILEGED_OPERATOR`, `AUDITOR` | P0-5 Candidate 단건 조회 |
| Digital Asset Policy | POST | `/api/admin/digital-assets/artifacts/{artifactId}/versions/{version}/activate` | `PRIVILEGED_OPERATOR` | 확인 후 단일 ACTIVE 승격 |
| Data Access | POST | `/api/runtime/context/preview` | `RUNTIME_EXECUTOR` | Privacy-safe metadata 연결 |
| Decision Trace | GET | `/api/admin/audit/executions` | `OPERATOR` | 목록 연결 |
| Decision Trace | GET | `/api/admin/audit/executions/{executionId}/evidence` | `PRIVILEGED_OPERATOR` | Digest Evidence 연결 |
| Policy | GET | `/api/admin/policy-lifecycle/{artifactId}/versions/{version}` | Admin roles | 단건 조회 연결 |
| Policy | POST | `/api/admin/policy-lifecycle` | Admin roles + service rule | API client 제공, UI 명령 미노출 |
| Policy | POST | `/api/admin/policy-lifecycle/{artifactId}/versions/{version}/transitions` | Maker/Checker rule | API client 제공, UI 명령 미노출 |
| Overview | GET | `/actuator/health/readiness` | Public | BE readiness 연결 |

## Runtime Request Contract

```ts
type RuntimeExecutionRequest = {
  institutionId: string;
  approvalReference: string;
  workloadId: string;
  purposeCode: string;
  subjectScope: string;
  destinationProfileId: string;
  idempotencyKey: string;
  evaluationRunId?: string;
  evalCaseId?: string;
  processingContexts: string[];
  input: Record<string, unknown>;
};
```

AI Evaluation reference는 `evaluationRunId`와 `evalCaseId`를 함께 전달해야 한다. 둘 중 하나만 보내면 BE가 `AI_EVALUATION_REFERENCE_INCOMPLETE`로 거부한다.

## Digital Asset P0-4 Contract

FE는 이전 `walletAddress / assetId / amount(number)` 입력을 사용하지 않는다. `amount`는 정밀도 손실을 막기 위해 1~78자리 Atomic Unit 문자열로 전달한다.

```json
{
  "approvedTransactionReference": "approved-tx-local-001",
  "customerId": "customer-100",
  "accountId": "acct-100-1",
  "outboundRequest": {
    "requestedAsset": {
      "chainId": "eip155:1",
      "assetKind": "FUNGIBLE_TOKEN",
      "assetSymbol": "asset-krw-token-001",
      "assetContractAddress": "0x0000000000000000000000000000000000000001",
      "operation": "TRANSFER"
    },
    "requestedAmount": "10000",
    "requestedDestination": "wallet-test-001",
    "requestedBeneficiaryReference": "beneficiary-local-001",
    "regulatoryOutboundData": {}
  }
}
```

`regulatoryOutboundData`는 Source/Allowlist 계약이 정해질 때까지 empty-only다. NATIVE, FUNGIBLE_TOKEN, NON_FUNGIBLE_TOKEN별 Contract Address/Token ID 조건은 submit 전에 FE에서도 검증한다.

P0-6 Digital Asset 실행의 GET/Trace 응답에는 `digitalAssetRuntimeSnapshot`이 포함된다. FE는 Snapshot ID/Digest, Artifact, Approved Policy, Destination, Runtime Control, Crosswalk의 고정 Version을 표시한다.

## Local BFF Boundary

브라우저는 API Key와 관리자 헤더를 보유하지 않는다. 로컬에서는 Vite 서버가 `ADP_LOCAL_*` 서버 환경변수로 인증 정보를 붙인다. 배포 환경에서는 Admin User 인증을 처리하는 BFF 또는 API Gateway가 같은 경계를 담당해야 한다.

## Data Handling

- Raw Prompt, 고객/계좌 원문, Token Map을 localStorage, 로그, Query cache 영속 저장소에 기록하지 않는다.
- AI Bundle은 Digest, Status, Count, Latency, Token usage 등 BE가 제공한 Evidence만 표시한다.
- Artifact ingest는 caller가 Bucket/Endpoint를 선택하지 못하고 `manifestReference + expectedContentDigest`만 전달한다.
- `policyAction`과 `finalAction`은 계속 분리한다.
- 데이터 없음, 권한 오류, API 오류, 미구현 상태를 서로 다른 UI 상태로 표시한다.
