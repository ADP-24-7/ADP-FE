import { AlertTriangle, CircleGauge, RefreshCw, RotateCcw, ShieldX } from 'lucide-react';
import { EmptyState, KeyValues, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

const runtimeStages = [
  ['01', '권한 확인', '미승인 실행 없음', 'GET /v1/runtime/executions/{id}/trace'],
  ['02', '최소 데이터 조회', 'Field Allowlist 적용', 'Runtime trace evidence'],
  ['03', '외부 실행', '결과 불명 여부 확인', 'Recovery Read Model 미구현'],
  ['04', '응답 검증', '재식별 위험 차단', 'Findings Read Model 미구현'],
  ['05', '감사 기록', 'Outbox committed', 'Prometheus audit metrics'],
] as const;

export function AnalysisPage() {
  const { selectedPack } = useExecutionPack();

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="INTERPRETED OPERATIONS · BE-ALIGNED"
        title="Runtime · Recovery"
        description="단순 수치가 아니라 발생 원인, 업무 영향과 다음 조치를 함께 설명합니다."
        actions={<StatusBadge tone="warning">API 연결 대기</StatusBadge>}
      />

      <PackContextSummary label={selectedPack.label} scope={selectedPack.scope} descriptor={selectedPack.descriptor} objective={selectedPack.objective} />

      <div className="content-grid content-grid-three">
        <SectionCard title="완료된 실행" description="Runtime terminal transition" actions={<StatusBadge tone="info">현재 BE</StatusBadge>}>
          <EmptyState compact title="API 연결 대기" description="완료/실패 terminal counter가 연결되면 표시합니다." endpoint="Prometheus query/BFF 집계 미구현" />
        </SectionCard>
        <SectionCard title="정책 차단" description="Decision + reasonCode 집계" actions={<StatusBadge tone="warning">집계 API 필요</StatusBadge>}>
          <EmptyState compact title="API 연결 대기" description="기간별 차단 사유 집계 API가 필요합니다." endpoint="Security Findings summary 미구현" />
        </SectionCard>
        <SectionCard title="Recovery 대기" description="Recovery Queue state" actions={<StatusBadge tone="info">현재 BE</StatusBadge>}>
          <EmptyState compact title="API 연결 대기" description="SENT_UNKNOWN 및 Retry 대기 건수를 표시합니다." endpoint="Recovery summary 미구현" />
        </SectionCard>
      </div>

      <SectionCard title="지금 확인할 문제" description="정상적인 BLOCK과 운영 장애를 구분합니다." actions={<StatusBadge>API 대기</StatusBadge>}>
        <div className="incident-grid">
          <article>
            <span><AlertTriangle size={16} />외부 상태 불명</span>
            <h2>Provider 응답 상태를 확인할 수 없습니다</h2>
            <p>내부 Authorization과 Policy Engine은 정상일 수 있으나 외부 호출 결과가 확정되지 않은 경우입니다.</p>
            <KeyValues items={[['업무 영향', 'Recovery incident API 미구현'], ['추정 위치', 'External Provider'], ['권장 조치', '재전송 금지 → 상태 조회 → Reconcile']]} />
            <button className="button button-secondary" type="button" disabled><RefreshCw size={14} />Recovery 확인</button>
          </article>
          <article>
            <span><ShieldX size={16} />보안 통제</span>
            <h2>승인 Scope를 벗어난 요청을 차단했습니다</h2>
            <p>시스템 장애가 아니라 FPG가 의도대로 작동한 결과로 구분해야 합니다.</p>
            <KeyValues items={[['업무 영향', 'Security finding API 미구현'], ['판정', 'BLOCKED · NOT_SENT'], ['권장 조치', 'Trace 확인 또는 승인 범위로 축소']]} />
            <button className="button button-secondary" type="button" disabled><RotateCcw size={14} />Trace 보기</button>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="실행 단계별 상태" description="어디에서 문제가 발생했는지 업무 흐름으로 표시">
        <div className="runtime-stage-grid">
          {runtimeStages.map(([number, title, description, endpoint]) => (
            <article key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <small>{description}</small>
              <code>{endpoint}</code>
            </article>
          ))}
        </div>
        <p className="helper-text">기준선이 없으면 이상 증가로 단정하지 않고 현재 관측값과 데이터 부족 상태를 분리해 표시합니다.</p>
      </SectionCard>

      <SectionCard title="구현 가능성 Map" description="현재 개발단계에서 UI 수치가 어떤 데이터로 만들어지는지">
        <div className="empty-table">
          <div className="table-head table-readiness">
            <span>UI 정보</span><span>BE Source</span><span>현재 상태</span><span>추가 작업</span>
          </div>
          <EmptyState title="API 연결 대기" description="각 지표는 Read Model 또는 Prometheus 연결 이후 실제값으로 표시합니다." endpoint="Prometheus Query API 또는 BFF Aggregation 미구현" />
        </div>
      </SectionCard>

      <div className="content-grid content-grid-wide-left">
        <SectionCard title="Prometheus 운영 지표 해석" description="BE 메트릭을 업무 의미와 운영 조치로 변환" actions={<StatusBadge tone="purple">PROMETHEUS READY</StatusBadge>}>
          <EmptyState icon={CircleGauge} title="API 연결 대기" description="정상 종결률, Recovery 처리시간 p95, Provider timeout은 Prometheus 연결 후 계산합니다." endpoint="/actuator/prometheus" />
        </SectionCard>

        <SectionCard title={`${selectedPack.label} 관측 지점`} description="도메인별 Runtime Focus">
          <KeyValues
            items={selectedPack.runtimeFocus}
          />
        </SectionCard>
      </div>
    </section>
  );
}
