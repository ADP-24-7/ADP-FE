# Backend Phase Mapping

이 문서는 BE 단계별 구현 범위와 FE 연결 위치를 추적하기 위한 작업 문서입니다.

| BE Phase | FE Area | Notes |
| --- | --- | --- |
| Auth and workload context | `features/auth`, `features/workloads` | 관리자 세션, workload scope, role 표시 |
| Detection | `features/detection`, `pages/gateway-lab` | 민감정보 탐지 평가 결과 표시 |
| Runtime decision | `features/runtime-decision`, `pages/gateway-lab` | `policy_action`, `final_action` 분리 |
| Transformation | `features/transformation`, `pages/gateway-lab` | 원문 prompt 저장 없이 preview metadata 표시 |
| Analysis and evaluation | `features/analysis`, `pages/analysis` | 평가 결과와 분석 대시보드 표시 |
| Policy lifecycle | `features/policy-lifecycle`, `pages/policies` | shadow, activate, rollback workflow |
| Audit trace | `features/audit-trace`, `pages/audit` | traceId 기반 검색과 상세 표시 |

Notion BE 기획 링크의 phase 정의가 확정되면 이 표를 API path, DTO, release dependency 단위로 갱신합니다.
