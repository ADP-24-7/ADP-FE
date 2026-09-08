# API Integration

## Contract Baseline

- Backend source: `ADP-BE origin/main`
- Backend commit: `b5897a5d24c7346328b58d9437f537e8e31531ab`
- Reviewed: 2026-09-09
- Product source: Notion `개발단계 추적`

Controller, DTO, SecurityConfig, Controller test가 모두 존재하는 계약만 연결 대상으로 분류한다.

## Connected Endpoints

| FE area | Method | Endpoint | Required role | Integration |
| --- | --- | --- | --- | --- |
| Gateway Lab | POST | `/v1/runtime/executions` | `RUNTIME_EXECUTOR` | AI/P0-4 Digital Asset 요청 연결 |
| Gateway Lab | GET | `/v1/runtime/executions/{executionId}` | `RUNTIME_EXECUTOR` | API client 제공 |
| Gateway Lab | GET | `/v1/runtime/executions/{executionId}/trace` | `RUNTIME_EXECUTOR` | P0-6 Snapshot, P0-7 Guard, P0-8 Post-Execution Evidence 연결 |
| AI Analysis | GET | `/api/admin/ai/evaluation-runs/{runId}/readiness` | `PRIVILEGED_OPERATOR` | Run 단건 조회 연결 |
| AI Analysis | GET | `/api/admin/ai/evaluation-runs/{runId}/bundle` | `PRIVILEGED_OPERATOR` | `bundle_available=true` 이후 연결 |
| Digital Asset Policy | POST | `/api/admin/digital-assets/artifacts/ingestions` | `OPERATOR` | 확인 절차가 있는 명시적 등록 명령 |
| Digital Asset Policy | GET | `/api/admin/digital-assets/artifacts/{artifactId}/versions/{version}` | `OPERATOR`, `PRIVILEGED_OPERATOR`, `AUDITOR` | P0-5 Candidate 단건 조회 |
| Digital Asset Policy | POST | `/api/admin/digital-assets/artifacts/{artifactId}/versions/{version}/activate` | `PRIVILEGED_OPERATOR` | 확인 후 단일 ACTIVE 승격 |
| Data Access | POST | `/api/runtime/context/preview` | `RUNTIME_EXECUTOR` | Privacy-safe metadata 연결 |
| Decision Trace | GET | `/api/admin/audit/executions` | `OPERATOR` | `workloadId/status/from/to/page/size` 서버 검색 연결 |
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

## Digital Asset P0-6~P0-8 Trace Contract

Digital Asset 실행의 GET/Trace 응답에는 다음 server-owned 증적이 포함된다.

- `digitalAssetRuntimeSnapshot`: Snapshot ID/Digest, Artifact, Approved Policy, Destination, Runtime Control, Crosswalk의 고정 Version
- `digitalAssetPreExecutionGuard`: 6개 Runtime Control 결과, Reason Code, Outbound/Provider Payload Digest
- `digitalAssetPostExecutionEvidence`: Evidence Source, External/Provider/Receipt/Finality Status, Amount Source, Re-binding Digest, Mismatch Enum

`PRE_EXECUTION_GUARD`와 `POST_EXECUTION_REBINDING`은 `/trace`의 관측 Stage에도 포함된다. `SENT_UNKNOWN`은 성공으로 표현하지 않고 Post-Execution Status 및 Audit Recovery Evidence로 표시한다.

## Search Contract

- Audit 검색만 현재 목록/조건 검색 API가 있으므로 입력 조건을 서버에 전달한다.
- Audit 목록에서 반환된 Execution ID는 Evidence 조회 자동완성 후보로 재사용한다.
- AI Evaluation, Policy Lifecycle, Artifact는 목록 API가 없으므로 정확한 ID 조회를 유지한다.
- 정확한 ID 입력란의 자동완성은 실제 운영 목록처럼 가장하지 않고 `LOCAL 예시`로 출처를 표시한다.
- 검색 입력은 부분 문자열로 후보를 좁힐 수 있지만, 최종 결과 판정은 항상 BE 응답을 사용한다.

## Parallel BE-10 Preview Contract

아래 계약은 `origin/main@b5897a5`에는 없고 로컬 BE-10 작업 브랜치에서만 확인됐다. 따라서 FE는 향후 병합될 계약을 검증하기 위한 Preview UI로 표시하며, 배포 가능한 연결 계약으로 간주하지 않는다.

| FE area | Method | Endpoint | Request | Response |
| --- | --- | --- | --- | --- |
| Policy Shadow | POST | `/api/admin/policy-lifecycle/{artifactId}/versions/{artifactVersion}/shadow-evaluations` | `{ evaluationCaseId }` | Baseline/Candidate, `MATCH \| DIFF`, Diff fields, privacy-safe digests |

- Lifecycle이 `REPLAY`인 Candidate만 실행한다.
- 현재 로컬 Evaluator Case는 `GOLDEN_ALLOW`, `FAILURE_BLOCK`이며 UI에서 `LOCAL 예시`로 구분한다.
- 동일 Artifact Version과 Case의 증적을 다시 생성하면 Conflict가 발생할 수 있으며, 이를 새 평가 성공으로 표현하지 않는다.
- BE-10이 `main`에 병합되면 Controller, DTO, SecurityConfig, 테스트를 다시 확인하고 Connected Endpoints로 승격한다.

## Local BFF Boundary

브라우저는 API Key와 관리자 헤더를 보유하지 않는다. 로컬에서는 Vite 서버가 `ADP_LOCAL_*` 서버 환경변수로 인증 정보를 붙인다. 배포 환경에서는 Admin User 인증을 처리하는 BFF 또는 API Gateway가 같은 경계를 담당해야 한다.

## Data Handling

- Raw Prompt, 고객/계좌 원문, Token Map을 localStorage, 로그, Query cache 영속 저장소에 기록하지 않는다.
- AI Bundle은 Digest, Status, Count, Latency, Token usage 등 BE가 제공한 Evidence만 표시한다.
- Artifact ingest는 caller가 Bucket/Endpoint를 선택하지 못하고 `manifestReference + expectedContentDigest`만 전달한다.
- `policyAction`과 `finalAction`은 계속 분리한다.
- 데이터 없음, 권한 오류, API 오류, 미구현 상태를 서로 다른 UI 상태로 표시한다.
