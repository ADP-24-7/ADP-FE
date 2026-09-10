# FE API Connection Inventory

2026-09-10 기준 FE가 실제 사용하는 BE 계약과 아직 제품 UI로 노출하지 않는 계약을 구분한다. 각 화면은 아래의 대표 Read Model만 소유하며, 다른 화면에서 같은 요약을 반복하지 않는다.

## Connected Contracts

| Product area | Endpoint | State | UI owner / role |
| --- | --- | --- | --- |
| Authentication | `GET /api/admin/auth/context` | Connected | 전역 운영자 Identity, Institution, Role, Workload scope |
| Overview | `GET /api/admin/operations/summary` | Connected | 최근 운영 집계의 단일 대표 화면. FE 임계치 판정 없이 서버 값을 표시 |
| Security Monitoring | `GET /api/admin/security-findings` | Connected | Pack·Workload 범위 Finding 목록 |
| Security Monitoring | `GET /api/admin/security-findings/{findingId}` | Connected | Finding 상세와 Decision Trace 이동 |
| Security Monitoring | `GET /api/admin/operations/policy-events` | Connected | Lifecycle·Current Selection append-only 이력 |
| Runtime · Recovery | `GET /api/admin/review-queue` | Connected | 복수 Review 원인과 다음 조치 목록 |
| Runtime · Recovery | `GET /api/admin/review-queue/{executionId}` | Connected | Review 상세와 Evidence 구간 이동 |
| Runtime · Recovery | `GET /api/admin/recovery/incidents` | Connected | Pack 범위 Recovery incident 목록 |
| Runtime · Recovery | `GET /api/admin/recovery/incidents/{recoveryId}` | Connected | Recovery 상태·명령 가능 여부 |
| Runtime · Recovery | `POST /api/admin/recovery/incidents/{recoveryId}/command` | Connected | 서버가 허용한 수동 Recovery 명령 실행 |
| Decision Trace | `GET /api/admin/audit/executions` | Connected | Institution·Workload 범위 감사 실행 검색 |
| Decision Trace | `GET /api/admin/audit/executions/{executionId}/evidence` | Connected | Policy·Data·Egress·Recovery digest Evidence 조회 |
| Runtime | `POST /v1/runtime/executions` | Connected | AI·Digital Asset Runtime 실행 |
| Runtime | `GET /v1/runtime/executions/{executionId}/trace` | Connected | 실행 단계별 Decision Trace |
| Policy | `/api/admin/policy-lifecycle/**` | Connected | Artifact 생성·조회·전이·Shadow·승인·활성화·롤백 |
| Digital Asset Policy | `/api/admin/digital-assets/artifacts/**` | Connected | Artifact ingest·조회·활성화·Current State |
| Reference Evidence | `/api/admin/reference-evidence/**` | Connected, optional | Runtime과 분리된 관리자 보조 추적 정보 |
| Identity | `/api/admin/identities/**` | Connected | 관리자 Identity·Role·Workload 권한 조회 및 관리 |
| AI Evaluation | `/api/admin/ai/evaluation-runs/**` | Connected | Run readiness·실행·Bundle export |
| Data Access | `POST /api/runtime/context/preview` | Connected | 허용된 Retrieval과 Canonical Context preview |
| Platform health | `GET /actuator/health/readiness` | Connected | BE readiness 표시 |

## Deliberately Not Exposed

| Capability | Current decision |
| --- | --- |
| 전역 Policy selector | Current Policy는 Institution·Pack·Workload·Purpose별 서버 소유 상태이므로 단일 전역 선택기를 만들지 않는다. |
| FE Policy Decision Outcome 집계 | 확정된 서버 집계 계약이 없으므로 정적 `REUSE_ALLOWED / TRANSFORM_REQUIRED / REVIEW` 카드를 만들지 않는다. |
| FE Artifact sync | 실제 동기화 명령 계약이 없으므로 비활성 버튼을 노출하지 않는다. |
| FE 위험 임계치·이상 판정 | Summary는 절대값을 제공한다. threshold/baseline 계약 전에는 FE가 `Attention` 또는 이상 여부를 추론하지 않는다. |
| Prometheus 직접 조회 | 브라우저에서 scrape endpoint를 호출하지 않고 보호된 BE Read Model만 사용한다. |
| 미구현 Pack Artifact 도구 | 해당 Pack에 확정 Loader 계약이 없으면 `API 연결 대기` 패널 대신 UI 자체를 노출하지 않는다. |

## Screen Ownership

| Screen | Primary responsibility |
| --- | --- |
| Security Overview | Operations Summary와 현재 0이 아닌 서버 집계 신호 |
| Security Monitoring | Security Finding 조사와 Policy Operation History |
| Runtime · Recovery | Review Queue, Recovery incident, AI Evaluation |
| Decision Trace | 실행 단위 Evidence Chain과 요청한 Evidence 구간 포커스 |

새 Controller를 연결할 때 DTO, SecurityConfig, Controller test를 확인하고 이 문서와 해당 feature API를 같은 PR에서 갱신한다.
