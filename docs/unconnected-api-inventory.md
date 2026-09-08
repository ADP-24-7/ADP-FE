# Unconnected API Inventory

2026-09-08 `ADP-BE origin/main@31ae5f1` 기준이다. 아래 항목은 FE 요구사항이 있지만 Controller 또는 확정 응답 계약이 아직 `main`에 없다.

| FE area | Needed contract | Current gate | FE behavior |
| --- | --- | --- | --- |
| Digital Asset Gateway | 6 PRE_EXECUTION Control 결과 | DA-P0-7 예정 | Target Pipeline만 표시 |
| Runtime · Recovery | External Evidence/Re-binding | DA-P0-8 예정 | 실제 결과 수치 미표시 |
| Runtime · Recovery | Recovery incident list/summary/manual command | P0-8 + BE-9/11 후속 | 비활성 조작과 API 대기 상태 |
| AI Analysis | Evaluation Run 목록/검색 | 단건 Readiness/Bundle만 존재 | 정확한 Run ID 입력 방식 유지 |
| Digital Asset Policy | Artifact 목록/현재 ACTIVE 조회 | 단건 Candidate 조회와 activate만 존재 | 정확한 Artifact ID/Version 사용 |
| Policy | Policy 목록/ACTIVE Snapshot | 단건 Lifecycle만 존재 | 목록을 만들지 않음 |
| Policy | Review Queue | Review Read Model 없음 | API 연결 대기 |
| Policy | Shadow Diff | Replay/Shadow 결과 API 없음 | API 연결 대기 |
| Overview | Security Finding/Open Incident 집계 | Aggregate Read Model 없음 | 숫자 대신 `—` |
| Monitoring | Runtime/Artifact/Recovery metric query | Prometheus 노출만 있고 BFF Query 없음 | Query/BFF 연결 대기 |
| Data Access | Workload Registry 및 Decision History | 목록/검색 Controller 없음 | Context Preview만 연결 |
| NCP Artifact | NCP ContentStore ingest E2E | NCP-5 BE Adapter 예정 | FE는 Storage credential/endpoint를 받지 않음 |

## Endpoints That Must Not Be Invented

- `/v1/monitoring/overview`
- `/v1/metrics/summary`
- `/v1/security-findings/**`
- `/v1/incidents/**`
- `/v1/recovery/**`
- `/v1/workloads`
- `/v1/data-access/decisions`
- `/v1/policies/**`
- `/v1/reviews`
- `/v1/audit-events`

BE Controller가 추가될 때 DTO, SecurityConfig, Controller test를 함께 확인한 뒤 이 문서와 해당 feature API를 같은 PR에서 갱신한다.
