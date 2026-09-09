# API Integration

## Contract Baseline

- Backend source: `ADP-BE origin/main`
- Backend commit: `d937f647d73a97913672bc55422ce1aaf97e7ca5`
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
| Policy | POST | `/api/admin/policy-lifecycle` | `OPERATOR` service rule | AI WORKLOAD Artifact 등록 UI 연결 |
| Policy | POST | `/api/admin/policy-lifecycle/{artifactId}/versions/{version}/transitions` | Lifecycle service rule | DRAFT→VALIDATED→CANDIDATE→REPLAY→SHADOW 상태 기반 명령 연결 |
| Policy | POST | `/api/admin/policy-lifecycle/{artifactId}/versions/{version}/shadow-evaluations` | Admin roles | REPLAY Candidate와 ACTIVE Baseline Diff 연결 |
| Policy | POST | `/api/admin/policy-lifecycle/{artifactId}/versions/{version}/approvals` | `PRIVILEGED_OPERATOR` + Maker-Checker | Shadow Evidence ID 기반 승인 연결 |
| Policy | GET | `/api/admin/policy-lifecycle/current-selection` | Admin roles + Workload scope | Pack/Workload/Purpose 단일 ACTIVE 조회 연결 |
| Policy | POST | `/api/admin/policy-lifecycle/{artifactId}/versions/{version}/activations` | `PRIVILEGED_OPERATOR` | Artifact/Selection revision fencing 활성화 연결 |
| Policy | POST | `/api/admin/policy-lifecycle/{artifactId}/versions/{version}/rollbacks` | `PRIVILEGED_OPERATOR` | SUPERSEDED target/Selection revision fencing 롤백 연결 |
| Recovery | GET | `/api/admin/recovery/incidents` | `OPERATOR`, `PRIVILEGED_OPERATOR`, `AUDITOR` | Status 조건 목록과 Pagination 연결 |
| Recovery | GET | `/api/admin/recovery/incidents/{recoveryId}` | `OPERATOR`, `PRIVILEGED_OPERATOR`, `AUDITOR` | 상태, Attempt, Digest, Operation Evidence 상세 연결 |
| Recovery | POST | `/api/admin/recovery/incidents/{recoveryId}/reconcile` | `PRIVILEGED_OPERATOR` | 재전송 없는 외부 상태 확인 명령 연결 |
| Recovery | POST | `/api/admin/recovery/incidents/{recoveryId}/retry` | `PRIVILEGED_OPERATOR` | BE가 `NOT_SENT`를 확인한 경우만 허용하는 안전 재시도 연결 |
| Recovery | POST | `/api/admin/recovery/incidents/{recoveryId}/review` | `PRIVILEGED_OPERATOR` | 수동 검토 전환 연결 |
| Operations | GET | `/api/admin/operations/summary` | `OPERATOR`, `PRIVILEGED_OPERATOR`, `AUDITOR` | Runtime/Recovery/Policy/Security 시간창 집계 연결 |
| Operations | GET | `/api/admin/operations/policy-events` | `OPERATOR`, `PRIVILEGED_OPERATOR`, `AUDITOR` | Lifecycle/Current Selection 통합 이력과 검색 연결 |
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

## BE-10 Governance Contract

- Shadow Evaluation은 `REPLAY` Candidate와 동일 Scope의 ACTIVE Baseline을 server-owned Case로 비교한다.
- 승인 요청은 `shadowEvaluationId`만 전달하며 최신 `GOLDEN_ALLOW/1.0.0`의 `MATCH` Evidence와 Maker-Checker 조건을 BE가 검증한다.
- 활성화 요청은 `expectedArtifactRevision`, `expectedSelectionRevision`을 전달한다.
- 롤백 요청은 `expectedTargetRevision`, `expectedSelectionRevision`을 전달한다.
- Current Selection은 Institution + Execution Pack + Workload + Purpose Scope에서 단일 ACTIVE를 반환한다.
- Generic activation/rollback은 `COMMON`, `AI` Policy를 지원한다. Digital Asset은 Runtime Control/Crosswalk가 결속되는 전용 Artifact activation API를 유지한다.
- Mutation 전 사용자가 명시적으로 명령을 확인하며, 403/404/409/422를 성공 상태로 변환하지 않는다.
- Current Selection mutation이 409 stale/concurrent 오류를 반환하면 Selection Query를 무효화해 최신 revision을 다시 조회한다.
- 현재 사용자 Role과 Artifact Maker를 조회하는 확정 API가 없으므로 FE는 권한을 추정하지 않는다. 명령 전 요구 권한을 안내하고 BE의 authoritative 403/422 검증 결과를 표시한다.
- Shadow Evidence 목록/단건 GET API는 아직 없으므로 POST 응답 이후의 이력 목록을 FE에서 임의 생성하지 않는다.

## Local BFF Boundary

브라우저는 API Key와 관리자 헤더를 보유하지 않는다. 로컬에서는 Vite 서버가 `ADP_LOCAL_*` 서버 환경변수로 인증 정보를 붙인다. 배포 환경에서는 Admin User 인증을 처리하는 BFF 또는 API Gateway가 같은 경계를 담당해야 한다.

## Data Handling

- Raw Prompt, 고객/계좌 원문, Token Map을 localStorage, 로그, Query cache 영속 저장소에 기록하지 않는다.
- AI Bundle은 Digest, Status, Count, Latency, Token usage 등 BE가 제공한 Evidence만 표시한다.
- Artifact ingest는 caller가 Bucket/Endpoint를 선택하지 못하고 `manifestReference + expectedContentDigest`만 전달한다.
- `policyAction`과 `finalAction`은 계속 분리한다.
- 데이터 없음, 권한 오류, API 오류, 미구현 상태를 서로 다른 UI 상태로 표시한다.

## BE-9 Recovery Operations Contract

- Incident 조회는 인증 Principal의 Institution과 허용 Workload 범위를 BE SQL에서 적용한다.
- `RECONCILE`은 Provider 상태 조회만 수행하며 외부 결과가 불명확한 요청을 재전송하지 않는다.
- `RETRY`는 BE Status Query가 `NOT_SENT`를 확인한 경우에만 허용한다.
- 수동 명령은 FE가 생성한 `operationId`를 논리 명령 동안 유지하며, 오류 후 재시도에도 같은 ID를 사용한다.
- Incident 또는 명령 변경과 성공 완료 후에는 새 operation ID를 생성한다.
- 명령 성공 시 Recovery 목록·상세와 Operations Summary를 함께 무효화해 운영 지표를 즉시 다시 조회한다.
- FE는 `recoveryStatus`, `retryDisposition`, Attempt 잔여 횟수로 명령 가용성을 안내한다. 최종 권한·전이 검증은 계속 BE가 담당한다.
- Status 또는 Page 변경 시 기존 Incident 선택, 확인 상태와 pending operation ID를 즉시 초기화한다.
- `keepPreviousData` 재조회 중에는 `REFRESHING`을 표시하고 이전 목록의 행 선택을 차단한다.
- Provider correlation key와 요청/응답 원문은 FE DTO에 포함하지 않는다.

## BE-11 Operations Contract

- Summary는 5~1440분 범위의 `windowMinutes`를 사용하며 Runtime/Recovery/Policy/Security 집계를 반환한다.
- Policy Event는 `workloadId`, `category`, `from`, `to`, `page`, `size`를 서버 검색 조건으로 전달한다.
- Summary의 실제 `0`은 `0`으로 표시하고, API 오류나 미연결 상태와 구분한다.
- 단순 `deniedAttempts`는 정상 차단도 포함할 수 있으므로 Attention으로 분류하지 않는다. 현재는 `institutionScopeMismatch`가 있을 때만 Security Attention을 표시한다.
- 현재 Summary와 Recovery API에는 Execution Pack 검색 조건이 없다. Pack 선택은 `Viewing Context`이며 데이터 범위는 전체 허용 Workload임을 화면에 표시한다.
- `/actuator/prometheus`는 `METRICS_SCRAPER` 전용 경계이므로 브라우저에서 직접 조회하지 않는다.
- 개별 Security Finding은 Summary 집계로 추정하지 않고 별도 Read Model이 생길 때까지 API 대기로 유지한다.
