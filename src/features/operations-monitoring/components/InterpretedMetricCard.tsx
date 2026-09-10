import { Activity, AlertTriangle, CheckCircle2, CircleHelp } from 'lucide-react';
import { StatusBadge } from '../../../shared/components';
import type { MonitoringMetric } from '../model/monitoringViewModel';

const toneByState = {
  normal: 'success',
  info: 'info',
  attention: 'warning',
  critical: 'danger',
  unknown: 'neutral',
} as const;

const IconByState = {
  normal: CheckCircle2,
  info: Activity,
  attention: AlertTriangle,
  critical: AlertTriangle,
  unknown: CircleHelp,
};

export function InterpretedMetricCard({ metric }: { metric: MonitoringMetric }) {
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
      <div className="interpreted-metric-guidance">
        <span>{metric.impact}</span>
        <strong><b aria-hidden="true">→</b> {metric.recommendation}</strong>
      </div>
      <details className="technical-details">
        <summary>기술 상세</summary>
        <div>
          <span>Read Model</span><code>{metric.rawField} = {metric.rawValue}</code>
          <span>집계 기준</span><p>{metric.criterion}</p>
        </div>
      </details>
    </article>
  );
}
