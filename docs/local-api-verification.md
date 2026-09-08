# Local API Verification

## Verified Baseline

- Date: 2026-09-09
- Backend main baseline: `ADP-BE origin/main@b5897a5`
- Backend parallel preview: local `feature/be-10-lifecycle-shadow-evidence` worktree
- Database: fresh Docker PostgreSQL volume in Compose project `adp-fe-p08`
- Flyway: fresh migration through local V33
- Frontend branch: `feat/fe-p0-8-runtime-search`

P0-8 Runtime/Audit 계약은 최신 `main` 기준으로 검증했다. BE-10 Shadow 계약은 아직 `main`에 없는 로컬 작업 브랜치이므로 별도의 Preview 결과로 기록한다. FE 검증 과정에서 BE 파일은 수정하지 않았다.

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
| Digital Asset Runtime P0-4 request | 200, `COMPLETED` |
| Digital Asset Runtime trace | 14 stages + P0-6 Snapshot + P0-7 Guard + P0-8 Evidence 반환 |
| Audit workload/status 검색 | `tokenized_asset_purchase / COMPLETED`, 실행 1건 반환 |
| Audit Evidence 조회 | schema v1, Runtime `COMPLETED`, Export Digest 반환 |

## P0-6 Snapshot Evidence

실제 Trace에서 다음 identity가 함께 반환되는 것을 확인했다.

- `snapshotId`, `snapshotDigest`, `selectedAt`
- Artifact ID/Version/Digest
- Approved Policy Snapshot ID/Version/Digest
- Destination Profile ID/Version/Digest
- Runtime Control Version/Digest
- Crosswalk Version/Digest

## P0-7/P0-8 Evidence

실제 Digital Asset 실행 `exec_9cb05456-c225-4a48-9f52-3a87c0678fa0`에서 다음을 확인했다.

- Trace 14 stages에 `PRE_EXECUTION_GUARD`, `POST_EXECUTION_REBINDING` 포함
- PRE_EXECUTION 결과 `PASSED`, 6개 Control과 Reason/Payload Digest 반환
- POST_EXECUTION 결과 `VERIFIED`, Evidence Source `INDEPENDENT_EXTERNAL`
- Receipt `SUCCESS`, Finality `FINALIZED`, Re-binding mismatch 없음
- Audit 검색 결과의 Execution ID와 Evidence Execution ID 일치
- Evidence Export Digest는 64자리 Hex 문자열

## BE-10 Parallel Preview

로컬 작업 브랜치에서 Candidate `fe-shadow-1788886112176@2.0.0`을 `REPLAY`까지 전이한 뒤 Shadow Evaluation을 검증했다.

- Endpoint: `POST /api/admin/policy-lifecycle/{artifactId}/versions/{artifactVersion}/shadow-evaluations`
- Evaluation Case: `GOLDEN_ALLOW`
- Result: `DIFF`
- Diff fields: `FINAL_ACTION`, `REASON_CODES`, `REQUIRED_CONTROLS`
- Baseline Artifact: `DA-DIGITAL-ASSET-RUNTIME-LOCAL-ACTIVE-001`
- Input Digest: 64자리 Hex 문자열
- 동일 Candidate/Case 재평가는 저장된 Evidence 충돌로 `409`를 반환

이 결과는 BE-10의 병렬 개발 계약 검증이며, `main` 연결 완료 판정이 아니다.

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

- Recovery incident 목록/요약/수동 명령은 Controller 확정 후 검증한다.
- Shadow Evidence 목록/단건 조회와 Active Runtime Selection Read Model은 BE-10 후속 계약이 필요하다.
- NCP ContentStore E2E는 server-side Adapter 범위이며 FE에 Bucket/Endpoint/Credential 입력을 추가하지 않는다.

## Environment Note

기존 공유 Docker DB에는 V23 Flyway checksum mismatch가 있어 데이터를 변경하거나 repair하지 않았다. 검증은 새 Compose 프로젝트와 새 볼륨으로 수행했다. 이 문제는 기존 DB migration history와 현재 BE migration 파일의 정합성을 별도로 확인해야 한다.
