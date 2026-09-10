# Unconnected API Inventory

2026-09-10 `ADP-BE origin/main@8ffa729` 기준이다. 아래 항목은 FE 요구사항이 있지만 Controller 또는 확정 응답 계약이 아직 `main`에 없다.

| FE area | Needed contract | Current gate | FE behavior |
| --- | --- | --- | --- |
| AI Analysis | Evaluation Run 목록/검색 | 단건 Readiness/Bundle만 존재 | 정확한 Run ID 입력 방식 유지 |
| Digital Asset Policy | Artifact 목록/현재 ACTIVE 조회 | 단건 Candidate 조회와 activate만 존재 | 정확한 Artifact ID/Version 사용 |
| Policy | Policy Artifact 목록/검색 | 단건 Lifecycle과 Current Selection만 존재 | 정확한 Artifact ID/Version 조회 유지 |
| Policy | Review Queue | Review Read Model 없음 | API 연결 대기 |
| Policy | Shadow Evidence 목록/단건 Read Model | Shadow 평가/승인 POST만 존재 | 현재 세션 POST 결과만 표시하고 이력 목록은 만들지 않음 |
| Policy | 현재 관리자 Role/Maker-Checker 판단 정보 | Admin identity/role read contract 없음 | 권한을 추정해 숨기지 않고 요구 권한 안내 후 BE 403/422 표시 |
| Operations | Execution Pack별 Summary/Recovery 필터 | Summary는 `windowMinutes`, Recovery는 `status/page/size`만 지원 | 상단 Pack을 `Viewing Context`로 표시하고 운영 데이터는 전체 허용 Workload 범위임을 명시 |
| Monitoring | Security Finding 목록/상세 | Operations Summary는 aggregate만 제공 | 개별 사건을 추정하지 않고 상세 API 대기 |
| Monitoring | Prometheus 시계열 Query/BFF | Summary Read Model과 보호된 scrape endpoint만 존재 | 추세 Chart/p95는 Query/BFF 연결 대기 |
| Monitoring | 해석 상태·임계치·기준선 | Summary는 절대 건수만 제공하고 threshold/baseline 계약 없음 | FE는 증감·이상 여부를 추정하지 않고 `기준선 미제공` 표시 |
| Monitoring | 단계별 Data Access/Disclosure, Response Guard/Settlement 집계 | Operations Summary에 단계별 지표 없음 | 단계 상태를 `데이터 부족`으로 표시 |
| Monitoring | 데이터 출처 모드 | Summary/Recovery 응답에 LIVE/SYNTHETIC provenance 없음 | FE가 출처 Badge를 임의로 표시하지 않음 |
| Monitoring | 도메인별 Provider timeout/Guard/Settlement/Finality 집계 | Audit 단건 증적은 있으나 scoped aggregate 없음 | AI/DA 운영 지표를 임의 계산하지 않음 |
| Data Access | Workload Registry 및 Decision History | 목록/검색 Controller 없음 | Context Preview만 연결 |
| NCP Artifact | Artifact browser/prefix search | ContentStore ingest E2E만 존재 | FE는 Storage credential/endpoint를 받지 않음 |

## Endpoints That Must Not Be Invented

- `/v1/monitoring/overview`
- `/v1/metrics/summary`
- `/v1/security-findings/**`
- `/v1/incidents/**`
- `/v1/recovery/**` (`/api/admin/recovery/incidents/**`만 사용)
- `/v1/workloads`
- `/v1/data-access/decisions`
- `/v1/policies/**`
- `/v1/reviews`
- `/v1/audit-events`

## Operations Contract Gaps

운영 화면을 확장하려면 FE가 Prometheus를 직접 조회하는 대신 BE Read Model에 다음 정보가 필요하다.

- 지표별 stable code, 상태(`NORMAL/WARNING/ACTION/INSUFFICIENT`)와 판정 근거
- threshold/baseline 값, 비교 기간과 집계 방식
- 데이터 출처 모드와 생성 시각
- Execution Pack 또는 Workload scope filter
- Data Access/Disclosure, Provider/Adapter, Response Guard/Settlement 단계 집계
- 개별 Finding에서 Audit Execution/Evidence로 이동할 수 있는 안정적인 식별자

BE Controller가 추가될 때 DTO, SecurityConfig, Controller test를 함께 확인한 뒤 이 문서와 해당 feature API를 같은 PR에서 갱신한다.
