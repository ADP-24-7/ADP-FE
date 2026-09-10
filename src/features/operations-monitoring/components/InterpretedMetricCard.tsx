import { Activity, AlertTriangle, CheckCircle2, CircleHelp } from 'lucide-react';
import { StatusBadge } from '../../../shared/components';
import type { MonitoringMetric } from '../model/monitoringViewModel';

const toneByState = {
  normal: 'success',
  observe: 'warning',
  action: 'danger',
  insufficient: 'neutral',
} as const;

const IconByState = {
  normal: CheckCircle2,
  observe: Activity,
  action: AlertTriangle,
  insufficient: CircleHelp,
};

export function InterpretedMetricCard({ metric, endpoint, windowMinutes }: { metric: MonitoringMetric; endpoint: string; windowMinutes: number }) {
  const Icon = IconByState[metric.state];

  return (
    <article className={`interpreted-metric interpreted-metric-${metric.state}`}>
      <header>
        <span className="interpreted-metric-icon" aria-hidden="true"><Icon size={17} /></span>
        <StatusBadge tone={toneByState[metric.state]}>{metric.stateLabel}</StatusBadge>
      </header>
      <div className="interpreted-metric-value">
        <span>{metric.label}</span>
        <strong>{metric.value}</strong>
      </div>
      <p>{metric.interpretation}</p>
      <dl>
        <div><dt>영향</dt><dd>{metric.impact}</dd></div>
        <div><dt>권장 조치</dt><dd>{metric.recommendation}</dd></div>
      </dl>
      <details className="technical-details">
        <summary>기술 상세</summary>
        <div>
          <span>Read Model</span><code>{metric.rawField} = {metric.rawValue}</code>
          <span>집계 기준</span><p>{metric.criterion}</p>
          <span>관측 범위</span><p>최근 {windowMinutes}분</p>
          <span>데이터 출처</span><p>API 응답에 모드 정보 없음</p>
          <span>Endpoint</span><code>{endpoint}</code>
        </div>
      </details>
    </article>
  );
}
