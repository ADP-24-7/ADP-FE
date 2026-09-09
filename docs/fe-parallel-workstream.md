# FE Parallel Workstream

## Baseline

- FE: `origin/main@99c00f2`
- BE: `origin/main@d937f64`
- Notion Source of Truth: `개발단계 추적`, 2026-09-09
- Principle: 확정된 BE `main` 계약만 실행 경로에 연결하고, 아직 Controller가 없는 운영 기능은 명시적인 대기 상태로 유지한다.

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

- Shadow Evidence 목록/단건 Read Model

BE-10 연결 완료:

- Generic AI Policy Artifact 등록과 Lifecycle 전이
- REPLAY Candidate와 ACTIVE Baseline Shadow Diff
- MATCH Evidence 기반 Maker-Checker 승인
- Current Selection 조회와 revision fencing activation
- SUPERSEDED target rollback과 selection revision 갱신
- Digital Asset은 별도 Artifact activation 경계 유지

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

현재 연결 완료:

- Recovery Incident status 검색, 상세와 operation evidence
- reconciliation-first, safe retry, manual review 수동 명령
- Runtime/Recovery/Policy/Security Operations Summary
- Lifecycle Transition과 Current Selection Event 통합 이력

BE와 병렬로 추가 고정할 계약:

- Finding summary/search filter와 pagination
- Policy active snapshot/list/review queue
- Shadow Evidence 목록/상세
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
