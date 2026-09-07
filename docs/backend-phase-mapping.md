# Backend Phase Mapping

기준은 2026-09-07 `ADP-BE origin/main@b5d8d289`와 Notion `개발단계 추적`입니다.

| Backend scope | FE area | Current integration |
| --- | --- | --- |
| BE-7 AI Full E2E | Gateway Lab | Runtime POST -> executionId -> trace 연결 |
| BE-8 Digital Asset Thin E2E | Gateway Lab | 현재 Purchase DTO 연결 가능, Runtime Realignment 후 재동기화 필요 |
| BE-9A Idempotency | Gateway Lab | 논리 요청 동안 동일 key 유지, 입력 변경/새 실행 시 갱신 |
| BE-9B Recovery | Runtime · Recovery | Runtime/Audit 증적에 포함, 집계·incident API 대기 |
| BE-10 Lifecycle Skeleton | 정책 · 승인 | 정확한 Artifact 조회 연결, create/transition client 제공 |
| BE-11A Observability | 통합 관제, Monitoring | Actuator/Prometheus 원천은 존재, FE용 aggregate API 대기 |
| BE-11B Audit Read Model | Decision Trace | 목록 및 privileged Evidence Pack 연결 |
| AI-EVAL-0 | Gateway Lab/Trace | Model provenance 응답 타입 수용 |
| AI-EVAL-1~3 | Analysis | Evaluation Run/Bundle API가 main에 아직 없음 |
| Digital Asset Realignment P0 | Gateway Lab | Canonical contract freeze 이후 현재 Purchase input 교체 필요 |

## Integration Rule

- UI는 Runtime 내부 단계를 개별 API로 호출하지 않습니다.
- FE DTO는 BE record와 Controller test JSON을 기준으로 갱신합니다.
- 운영 집계는 Runtime 원천 DB를 브라우저가 직접 읽지 않고 Read Model API 또는 Prometheus aggregation을 사용합니다.
- Digital Asset의 현재 Thin E2E 계약과 향후 승인 거래 Runtime 계약을 별도 상태로 추적합니다.
- 정책 변경 명령은 조회와 분리하고 Maker/Checker 권한 확인 전 UI에서 활성화하지 않습니다.
