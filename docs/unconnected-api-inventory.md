# Unconnected API Inventory

2026-09-07 기준 `ADP-BE origin/main`에 대응 Controller가 없는 FE 요구사항입니다. 화면에서는 실제 값이나 임시 숫자를 만들지 않고 `API 연결 대기`로 표시합니다.

| FE area | Needed contract | Source candidate | Blocker / owner phase |
| --- | --- | --- | --- |
| 통합 관제 | Security finding summary | Runtime transition + audit read model | BE-11/12 aggregate API 없음 |
| 통합 관제 | Open incident summary | Recovery queue + mismatch quarantine | Incident read model API 없음 |
| 통합 관제 | Runtime action summary | Runtime terminal metrics | Prometheus query/BFF aggregation 없음 |
| Workload · Data Access | Workload registry list | Auth workload scope + retrieval profile | 목록 Controller 없음 |
| Workload · Data Access | Data access decision history | Runtime trace evidence | 전용 검색 API 없음 |
| Security Monitoring | Findings search/category summary | Audit/reason code/guard/recovery | Findings read model API 없음 |
| Runtime · Recovery | Recovery incident list/summary | External interaction recovery tables | Admin recovery read API 없음 |
| 정책 · 승인 | Policy list/active snapshot | Policy lifecycle table | list/active query API 없음 |
| 정책 · 승인 | Review queue | Policy transition + runtime REVIEW | 통합 review read model 없음 |
| 정책 · 승인 | Shadow comparison result | Lifecycle stage alone is available | replay/shadow result API 없음 |
| 정책 · 승인 | Artifact content/integrity | DA Artifact Loader | P0 Loader 미구현 |
| Analysis | AI evaluation runs/results | AI-EVAL-1~3 | evaluation API/main merge 전 |
| Gateway Lab Digital Asset | ApprovedTransaction/OutboundRequest/6 controls | BE-8 Realignment | Canonical contract freeze 전 |

## Existing API Names To Remove

아래 경로는 현재 BE에 없으므로 신규 코드에서 실제 Endpoint로 취급하지 않습니다.

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

이름이 확정되기 전에는 화면의 Endpoint 안내도 `미구현`으로 표시하고, BE Controller가 추가될 때 이 문서와 feature API를 함께 갱신합니다.
