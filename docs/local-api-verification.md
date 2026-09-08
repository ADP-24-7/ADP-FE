# Local API Verification

## Verified Baseline

- Date: 2026-09-08
- Backend: `ADP-BE origin/main@31ae5f1`
- Database: isolated PostgreSQL database `adp_fe_origin_main_31ae5f1`
- Flyway: fresh migration through V29
- Frontend branch: `feat/fe-parallel-api-foundation`

로컬 `ADP-BE` 작업 브랜치와 기존 DB는 수정하지 않고, `origin/main` archive와 별도 DB로 검증했다.

## Verified Flows

| Flow | Result |
| --- | --- |
| `GET /actuator/health/readiness` | 200, `UP` |
| AI Runtime × 3 model profiles | 모두 `COMPLETED`, Evidence 저장 |
| `GET /api/admin/ai/evaluation-runs/{id}/readiness` | `READY`, complete 3/3, bundle available |
| `GET /api/admin/ai/evaluation-runs/{id}/bundle` | schema v1, executions 3, models 3, failures 0 |
| `POST /api/admin/digital-assets/artifacts/ingestions` | 201, 5 files, `CANDIDATE` |
| Policy `CANDIDATE → REPLAY → SHADOW → APPROVED` | Maker/Checker 분리 후 성공 |
| `POST /api/admin/digital-assets/artifacts/{id}/versions/{version}/activate` | `ACTIVE` Runtime Artifact 반환 |
| Digital Asset Runtime P0-4 request | 200, `COMPLETED / TRANSFORM` |
| Digital Asset Runtime trace | 12 stages + immutable P0-6 Snapshot 반환 |

## P0-6 Snapshot Evidence

실제 Trace에서 다음 identity가 함께 반환되는 것을 확인했다.

- `snapshotId`, `snapshotDigest`, `selectedAt`
- Artifact ID/Version/Digest
- Approved Policy Snapshot ID/Version/Digest
- Destination Profile ID/Version/Digest
- Runtime Control Version/Digest
- Crosswalk Version/Digest

## Maker-Checker Finding

Artifact ingest 직후 상태는 `CANDIDATE`이므로 activate를 바로 호출하면 422 `DIGITAL_ASSET_ACTIVE_ARTIFACT_INVALID`가 반환된다. 정상 흐름은 다음과 같다.

```text
CANDIDATE
→ REPLAY / REPLAY_PASSED
→ SHADOW / SHADOW_PASSED
→ APPROVED / APPROVAL_GRANTED (별도 PRIVILEGED_OPERATOR)
→ ACTIVE / activation endpoint
```

FE는 Policy Lifecycle이 `APPROVED`일 때만 활성화 확인 컨트롤을 사용할 수 있게 한다. 브라우저에서 사용자 헤더를 바꿔 Maker-Checker를 우회하지 않는다.

## Local Runtime Inputs

AI Evaluation baseline:

```text
evaluationRunId: ai-eval-baseline-2026-09-07
evalCaseId: customer-summary-ko-001
workloadId: customer_summary
purposeCode: CUSTOMER_SUPPORT
processingContexts: AI_USE
```

Digital Asset baseline:

```text
approvalReference: approval_digital_asset_purchase_v1
approvedTransactionReference: approved-tx-local-001
workloadId: tokenized_asset_purchase
purposeCode: DIGITAL_ASSET_PURCHASE
destinationProfileId: dest_mock_asset_platform_v1
processingContexts: DIGITAL_ASSET
```

실제 고객 데이터가 아닌 BE local synthetic fixture만 사용했다.

## Remaining Verification

- P0-7 PRE_EXECUTION 6 Controls는 아직 `main`에 없으므로 실제 결과 검증 대상이 아니다.
- P0-8 External Evidence/Reconciliation/Recovery도 API 확정 후 검증한다.
- NCP ContentStore E2E는 server-side Adapter 범위이며 FE에 Bucket/Endpoint/Credential 입력을 추가하지 않는다.
