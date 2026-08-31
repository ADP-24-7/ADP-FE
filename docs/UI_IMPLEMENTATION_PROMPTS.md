# ADP-FE UI 적용 프롬프트

아래 프롬프트는 Codex 등 코드 작업 도구에 단계별로 지시할 때 사용합니다. 한 번에 전부 적용하기보다 단계별 브랜치 또는 커밋으로 나누는 편이 안전합니다.

## Prompt 1 — Overlay 적용 및 Mock 런타임 제거

```text
현재 저장소는 ADP-FE이며 Vite + React + TypeScript 구조다.

먼저 현재 브랜치와 변경 파일을 확인하고 사용자 변경을 보존해라. 제공된 adp-fe-ui-no-mock Overlay를 레포 루트 기준으로 적용하되 기존 app/pages/features/shared 레이어 규칙을 유지해라.

요구사항:
- 일반 npm run dev에서 MSW browser worker를 시작하지 않는다.
- VITE_API_MODE 기본값은 real이다.
- Axios는 상대 경로 `/v1`을 사용하고 Local에서는 Vite proxy가 VITE_API_BASE_URL로 전달한다.
- Mock fixture 숫자를 운영 화면에 표시하지 않는다.
- index.html에 UI를 직접 작성하지 않는다. 화면은 TSX 컴포넌트와 CSS로 구현한다.
- src/**/mocks는 테스트에서 사용 중이면 유지하되 production bootstrap에서 import하지 않는다.
- 작업 후 npm run build, npm run test, npm run lint를 실행한다.
- 실패 시 설정을 임의로 완화하지 말고 원인과 수정 내용을 보고한다.
```

## Prompt 2 — 공통 로딩·빈 상태·오류 정책 적용

```text
ADP-FE 전체 페이지에 서버 데이터 상태 규칙을 적용해라.

상태 규칙:
1. 로딩 중에만 Skeleton을 표시한다.
2. 실제 빈 응답은 명시적인 Empty State로 표시한다.
3. API 미구현은 'API 연결 대기'와 필요한 Endpoint를 표시한다.
4. 네트워크·서버 오류는 Error State와 재시도를 표시한다.
5. 실제 값 0은 0으로 표시한다.
6. null과 undefined는 '집계 데이터 없음'으로 표시한다.
7. 권한 제한 데이터는 서버가 원문을 보내지 않았을 때만 Blur Placeholder를 표시한다.
8. 임의 숫자, 임의 그래프, 임의 정책 버전, 임의 Trace를 만들지 않는다.

공통 컴포넌트는 src/shared/components에 두고 page에서 재사용해라. 도메인 API 함수는 shared가 아니라 각 feature에 둬라.
```

## Prompt 3 — Overview 실제 API 연결

```text
OverviewPage를 GET /v1/monitoring/overview에 연결해라.

기존 features/monitoring/api, hooks, model 구조를 유지한다. TanStack Query의 isLoading, isError, data 상태를 모두 처리한다.

검증 항목:
- requestCount=0을 빈 데이터로 판단하지 않는다.
- 응답 자체가 null인 경우 빈 상태를 표시한다.
- 실패 시 기존 숫자를 유지해 성공처럼 보이게 하지 않는다.
- 새로고침 버튼으로 refetch할 수 있다.
- Mock handler의 provisionalDashboardSummary를 화면에서 사용하지 않는다.
- 응답 타입이 BE OpenAPI와 다르면 타입을 서버 계약 기준으로 수정하고 docs/api-integration.md도 갱신한다.
```

## Prompt 4 — Gateway Lab 실제 Runtime Execution 연결

```text
GatewayLabPage를 단일 POST /v1/runtime/executions API에 연결해라.

FE가 Detection, Decision, Transform, Connector API를 순차 호출해서 오케스트레이션하지 않도록 한다. BE가 반환한 finalAction, reasonCodes, policyVersion, artifactVersion, stages, privacy-safe output만 표시한다.

요구사항:
- workloadId, purposeCode, subjectScope, providerProfileId, 입력 내용을 사용자가 직접 입력한다.
- 샘플 개인정보나 샘플 AWS credential을 자동 주입하지 않는다.
- idempotencyKey는 실행마다 안전하게 생성한다.
- 원문 입력은 Local Storage, Session Storage, console, analytics에 저장하지 않는다.
- 실행 전, 실행 중, 성공, REVIEW, BLOCK, 실패 상태를 구분한다.
- 서버가 raw data나 token map을 반환하더라도 UI에 렌더링하지 말고 계약 위반으로 처리한다.
- 실행 단계 목록은 서버 stages 배열을 그대로 시각화한다.
```

## Prompt 5 — 정책 및 Review Queue 연결

```text
PoliciesPage의 빈 상태 UI를 실제 정책 API에 점진적으로 연결해라.

필요 API:
- GET /v1/policies
- GET /v1/policies/{policyId}
- GET /v1/review-items?type=POLICY
- POST /v1/policies/{policyId}/shadow
- POST /v1/policies/{policyId}/activate
- POST /v1/policies/{policyId}/rollback

관리 명령에는 reason, expectedVersion, idempotencyKey, 필요한 경우 approvalId를 포함한다. 확인 Modal에서 작업 대상과 영향을 보여주되 비밀번호나 민감값을 다시 입력받지 않는다.

VALIDATED, CANDIDATE, SHADOW, ACTIVE 상태를 실제 서버 응답으로만 활성화한다. 활성 정책이 없으면 그대로 '활성 정책 없음'을 표시한다. 존재하지 않는 policy-v1 같은 값을 만들지 않는다.
```

## Prompt 6 — Monitoring 및 Audit 연결

```text
MonitoringPage와 AuditPage를 서버 조회 API에 연결해라.

Monitoring 범주:
- Data Access
- Privacy
- Utility
- Runtime
- Governance

공통 필터는 from, to, workloadId, policyVersion으로 통일하고 UTC 기준을 표시한다. 시계열 응답이 비어 있으면 빈 차트를 그리지 말고 Empty State를 표시한다.

Audit 요구사항:
- Trace ID 검색
- 안정적인 최신순 정렬
- 페이지네이션 또는 cursor 처리
- policyAction과 finalAction 분리
- 원문 prompt, 계좌번호, 고객번호, token mapping 표시 금지
- 403은 '데이터 없음'이 아니라 '권한 없음'으로 표시
- export는 서버가 생성한 privacy-safe 파일만 다운로드
```

## Prompt 7 — 완료 검증

```text
ADP-FE UI 적용 결과를 검증해라.

검색 범위:
- provisionalDashboardSummary
- runtimeExecutionFixture
- PROJECT_PROVISIONAL
- MOCK DATA
- 하드코딩된 requestCount/reviewCount/blockCount
- FE-only trace_001, exec_001, policy-v1, artifact-v1

운영 bootstrap과 페이지에서 위 값이 사용되지 않는지 확인한다. 테스트 fixture는 BE Controller test의 실제 JSON shape와 맞아야 하며 FE가 임의로 만든 response 구조를 검증하지 않는다.

검증 명령:
- npm ci
- npm run build
- npm run test
- npm run lint

또한 VITE_API_MODE=real에서 백엔드 중단 상태로 앱을 열었을 때 Mock 값이 나타나지 않고 Error 또는 API 연결 대기 상태가 표시되는지 확인한다.
```
