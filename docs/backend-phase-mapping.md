# Backend Phase Mapping

기준은 2026-09-08 `ADP-BE origin/main@31ae5f1`와 Notion `개발단계 추적`이다.

| Backend scope | FE area | Current integration |
| --- | --- | --- |
| BE-7 Common/AI Runtime | Gateway Lab | Runtime POST → executionId → trace 연결 |
| AI Evaluation Producer/Consumer E2E | Gateway Lab, Runtime · Recovery | Evaluation reference 입력, Readiness와 Bundle 단건 조회 연결 |
| DA-P0-1~P0-4 | Gateway Lab | Approved Transaction Reference + Canonical Outbound Request DTO/검증 반영 |
| DA-P0-5 Artifact Loader | 정책 · 승인 | Artifact ingest와 ID/Version 단건 조회 연결 |
| DA-P0-6 Runtime Snapshot | Gateway Lab, Trace | Privileged activate와 pinned Snapshot 표시 연결 |
| DA-P0-7 PRE_EXECUTION Guard | Gateway Lab | 6 Control Target Pipeline만 표시, 실제 결과 API 대기 |
| DA-P0-8 POST_EXECUTION/Recovery | Runtime · Recovery | 실제 External Evidence/Reconciliation API 대기 |
| BE-9A Idempotency | Gateway Lab | 논리 요청 동안 동일 key 유지, 입력 변경/새 실행 시 갱신 |
| BE-9B/11 Recovery | Runtime · Recovery | Read Model/API 대기 |
| BE-10 Lifecycle | 정책 · 승인 | Policy 단건 조회, create/transition client 제공 |
| BE-11 Observability | 통합 관제, Monitoring | Readiness 연결, Aggregate/Prometheus BFF 대기 |
| BE-11 Audit Read Model | Decision Trace | 목록과 privileged Evidence Pack 연결 |
| NCP-5 ContentStore | 정책 · 승인 | FE 변경 없음. server-owned storage adapter 경계 유지 |

## Integration Rule

- Runtime 내부 단계를 FE가 여러 API로 조합하지 않는다.
- BE `main`의 record, JSON naming, SecurityConfig, Controller test를 FE DTO의 기준으로 사용한다.
- BE 작업 브랜치 필드는 병합 전 production path에 추가하지 않는다.
- 운영 집계는 브라우저가 Runtime DB를 직접 읽지 않고 Read Model API 또는 Prometheus BFF를 사용한다.
- Policy/Artifact mutation은 조회와 분리하고 명시적 사용자 확인과 서버 권한 검증을 거친다.
- Raw-sensitive 값 대신 digest, status, reason code, version identity를 표시한다.
