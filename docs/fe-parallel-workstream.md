# FE Parallel Workstream

## Baseline

- FE: `origin/main@7a67852`
- BE: `origin/main@b5897a5`
- Notion Source of Truth: `개발단계 추적`, 2026-09-09
- Principle: 확정된 BE `main` 계약만 일반 실행 경로에 연결하고, 작업 브랜치 계약은 명시적인 Preview로만 검증한다.

## Track A: Runtime Contract

현재 진행 가능:

- AI Runtime 요청과 optional Evaluation Run/Case 결속
- Digital Asset P0-4 Canonical input DTO와 client validation
- P0-6 Runtime Snapshot identity/digest 표시
- P0-7 PRE_EXECUTION 6 Control/Reason/Digest 표시
- P0-8 POST_EXECUTION Status/External Evidence/Re-binding 표시
- POST execution → GET trace → privacy-safe Evidence 표시
- 401/403/404/409/422 공통 오류 처리
- 논리 요청 단위 Idempotency Key 유지

대기 Gate:

- Recovery incident 목록/요약/수동 명령 Controller
- BE-10 Shadow Evidence 목록/단건 Read Model과 Active Runtime Selection Read Model

BE-10 병렬 Preview:

- 로컬 BE 작업 브랜치의 Shadow Evaluation POST 계약을 Policy 화면에 Preview로 연결
- `REPLAY` Candidate에 한해 Evaluation Case를 전송하고 Baseline/Candidate Diff와 Digest를 표시
- BE-10 `main` 병합 전까지 일반 연결 완료로 분류하지 않음

## Track B: AI Evaluation

현재 진행 가능:

- 정확한 Evaluation Run ID로 Readiness 조회
- `bundle_available=true`인 경우 Bundle 조회
- Case × Model Evidence completeness 표시
- Bundle identity, dataset provenance, failure summary 표시

후속:

- Run 목록 API가 생기면 검색/선택 UI 전환
- Quality/Hallucination/Task Success/Utility 계약 확정 후 지표 추가

## Track C: Digital Asset Artifact

현재 진행 가능:

- P0-5 Artifact 단건 조회
- `manifestReference + expectedContentDigest` ingest 명령
- Candidate Lifecycle, Contract Digest, Workload/Purpose/Destination 표시
- Privileged Operator의 명시적 확인 후 단일 ACTIVE 승격
- 명시적 확인 전 mutation 비활성화

유지할 경계:

- NCP ContentStore가 연결돼도 Storage endpoint, bucket, credential을 FE 입력으로 추가하지 않음

## Track D: Operations Read Models

BE와 병렬로 먼저 고정할 계약:

- Finding summary/search filter와 pagination
- Recovery incident status, attempt lineage, safe command
- Policy active snapshot/list/review queue
- Prometheus metric name, label cardinality, aggregation window

FE는 위 계약이 없을 때 빈 배열이나 0을 성공 응답처럼 만들지 않는다. `unconnected`, `empty`, `loading`, `error`, `restricted`, `value` 상태를 분리한다.

## Search UX

- 목록 API가 있는 Audit은 Workload, Status, 기간, Pagination을 서버 조건으로 전달한다.
- 실제 Audit 결과에서 Execution ID 후보를 만들고 선택 시 Evidence 조회로 연결한다.
- 목록 API가 없는 AI Evaluation/Policy/Artifact는 정확한 ID 조회를 유지한다.
- BE local fixture 값은 `LOCAL 예시`, API에서 받은 값은 `API 결과`로 출처를 구분한다.
- 사용자가 입력한 문자열은 후보 필터에만 사용하고 임의 결과 데이터를 만들지 않는다.

## Completion Gate

- BE `main` DTO와 FE DTO의 field/name/type가 일치한다.
- 브라우저에 service credential이 포함되지 않는다.
- Raw-sensitive data를 저장하거나 출력하지 않는다.
- API 단위 contract fixture와 UI state test가 통과한다.
- Docker 환경에서 readiness와 연결된 GET API를 실제 응답으로 확인한다.
