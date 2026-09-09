# Local API Verification

## Verified Baseline

- Date: 2026-09-09
- Backend main baseline: `ADP-BE origin/main@b99752f`
- Database: fresh Docker PostgreSQL volume in Compose project `adp-fe-gov`
- Flyway: fresh migration through V35
- Frontend baseline: `ADP-FE origin/main@3277d10`
- Frontend branch: `feat/fe-governance-operations-integration`

BE #34~#36의 Shadow Diff, Evidence Approval, Current Selection, Rollback 계약을 빈 DB에서 검증했다. FE 검증 과정에서 BE 파일은 수정하지 않았다.

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
| AI Policy Artifact 등록 | 201, `DRAFT / revision 0` |
| Lifecycle 상태 명령 | `DRAFT → VALIDATED → CANDIDATE → REPLAY → SHADOW` 성공 |
| Shadow Evaluation | `GOLDEN_ALLOW/1.0.0`, `MATCH`, raw-free Digest 반환 |
| Evidence Approval | 별도 Maker/Checker, `APPROVED / revision 5` |
| Current Selection Activation | 기존 ACTIVE를 `SUPERSEDED`, 신규 ACTIVE와 selection revision 생성 |
| Current Selection Rollback | SUPERSEDED target 복원, selection revision 단조 증가 |

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

## BE-10 Governance Verification

Privacy-safe ACTIVE baseline과 서로 다른 Maker가 생성한 Candidate 2개를 사용해 브라우저에서 전체 흐름을 검증했다.

```text
DRAFT → VALIDATED → CANDIDATE → REPLAY
→ Shadow MATCH Evidence
→ SHADOW → Evidence-bound APPROVED
→ ACTIVE selection revision 1
→ 다음 Candidate ACTIVE selection revision 2
→ 이전 SUPERSEDED Candidate rollback selection revision 3
```

- Candidate 생성자와 승인/활성화 사용자를 분리했다.
- Shadow 요청에는 Evaluation Case ID만 전달했다.
- 승인 요청에는 BE가 발급한 Shadow Evaluation ID만 전달했다.
- 활성화와 롤백은 화면에 표시된 Artifact/Selection revision을 그대로 fencing 값으로 사용했다.
- 활성화 후 현재 Artifact와 Selection revision이 `GET /current-selection` 결과로 갱신됐다.
- 롤백 후 이전 Candidate가 다시 `ACTIVE`가 되고 Selection revision이 3으로 증가했다.
- 화면 이동과 상태 갱신은 `/policies` 경로에서 새로고침 없이 수행됐다.

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
- Shadow Evidence 목록/단건 조회와 Current Selection Event 이력 API가 필요하다.
- Policy 목록/검색 및 Review Queue Read Model이 필요하다.
- NCP ContentStore E2E는 server-side Adapter 범위이며 FE에 Bucket/Endpoint/Credential 입력을 추가하지 않는다.

## Environment Note

기존 공유 Docker DB에는 V23 Flyway checksum mismatch가 있어 데이터를 변경하거나 repair하지 않았다. 검증은 새 Compose 프로젝트와 새 볼륨으로 수행했다. 이 문제는 기존 DB migration history와 현재 BE migration 파일의 정합성을 별도로 확인해야 한다.
