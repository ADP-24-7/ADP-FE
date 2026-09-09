# Backend Phase Mapping

기준은 2026-09-09 `ADP-BE origin/main@b99752f`와 Notion `개발단계 추적`이다.

| Backend scope | FE area | Current integration |
| --- | --- | --- |
| BE-7 Common/AI Runtime | Gateway Lab | Runtime POST → executionId → trace 연결 |
| AI Evaluation Producer/Consumer E2E | Gateway Lab, Runtime · Recovery | Evaluation reference 입력, Readiness와 Bundle 단건 조회 연결 |
| DA-P0-1~P0-4 | Gateway Lab | Approved Transaction Reference + Canonical Outbound Request DTO/검증 반영 |
| DA-P0-5 Artifact Loader | 정책 · 승인 | Artifact ingest와 ID/Version 단건 조회 연결 |
| DA-P0-6 Runtime Snapshot | Gateway Lab, Trace | Privileged activate와 pinned Snapshot 표시 연결 |
| DA-P0-7 PRE_EXECUTION Guard | Gateway Lab | 6 Control 결과, Reason Code, Payload Digest 표시 |
| DA-P0-8 POST_EXECUTION/Recovery | Gateway Lab, Decision Trace | External Evidence, Receipt/Finality, Re-binding, `SENT_UNKNOWN` 표시 |
| BE-9A Idempotency | Gateway Lab | 논리 요청 동안 동일 key 유지, 입력 변경/새 실행 시 갱신 |
| BE-9B/11 Recovery | Runtime · Recovery | Read Model/API 대기 |
| BE-10 Shadow Diff | 정책 · 승인 | REPLAY Candidate 평가, typed Diff와 privacy-safe Digest 표시 |
| BE-10 Shadow Approval Gate | 정책 · 승인 | Shadow Evidence ID 기반 Maker-Checker 승인 명령 연결 |
| BE-10 Current Selection | 정책 · 승인 | Scope 단일 ACTIVE 조회, revision fencing 활성화 연결 |
| BE-10 Rollback | 정책 · 승인 | SUPERSEDED target과 Selection revision 기반 롤백 연결 |
| BE-11 Observability | 통합 관제, Monitoring | Readiness 연결, Aggregate/Prometheus BFF 대기 |
| BE-11 Audit Read Model | Decision Trace | 목록과 privileged Evidence Pack 연결 |
| NCP-5 ContentStore | 정책 · 승인 | Manifest Reference ingest만 사용하고 server-owned storage adapter 경계 유지 |

## Integration Rule

- Runtime 내부 단계를 FE가 여러 API로 조합하지 않는다.
- BE `main`의 record, JSON naming, SecurityConfig, Controller test를 FE DTO의 기준으로 사용한다.
- BE 작업 브랜치 필드는 병합 전 production path에 추가하지 않는다.
- 운영 집계는 브라우저가 Runtime DB를 직접 읽지 않고 Read Model API 또는 Prometheus BFF를 사용한다.
- Policy/Artifact mutation은 조회와 분리하고 명시적 사용자 확인과 서버 권한 검증을 거친다.
- Raw-sensitive 값 대신 digest, status, reason code, version identity를 표시한다.
