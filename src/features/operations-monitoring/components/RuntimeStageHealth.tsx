import { StatusBadge } from '../../../shared/components';
import type { RuntimeStageHealth as RuntimeStageHealthItem } from '../model/monitoringViewModel';

const toneByState = {
  normal: 'success',
  info: 'info',
  attention: 'warning',
  critical: 'danger',
  unknown: 'neutral',
} as const;

export function RuntimeStageHealth({ stages }: { stages: RuntimeStageHealthItem[] }) {
  return (
    <div className="interpreted-stage-grid">
      {stages.map((stage, index) => (
        <article key={stage.id} className={`interpreted-stage-${stage.state}`}>
          <div><span>{String(index + 1).padStart(2, '0')}</span><StatusBadge tone={stage.connection === 'observed' ? 'success' : stage.connection === 'partial' ? 'warning' : 'neutral'}>{stage.connectionLabel}</StatusBadge></div>
          <strong>{stage.label}</strong>
          <p>{stage.summary}</p>
          <footer><StatusBadge tone={toneByState[stage.state]}>{stage.stateLabel}</StatusBadge><code>{stage.evidence}</code></footer>
        </article>
      ))}
    </div>
  );
}
