import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../../shared/components';
import type { OperationsMonitoringViewModel } from '../model/monitoringViewModel';

export function OperationsBrief({ brief }: { brief: OperationsMonitoringViewModel['brief'] }) {
  const isNormal = brief.state === 'normal' || brief.state === 'info';

  return (
    <section className={`operations-brief operations-brief-${brief.state}`} aria-labelledby="operations-brief-title">
      <span className="operations-brief-icon" aria-hidden="true">
        {isNormal ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
      </span>
      <div>
        <span>OPERATIONAL BRIEF</span>
        <h2 id="operations-brief-title">{brief.title}</h2>
        <p>{brief.summary}</p>
      </div>
      <div className="operations-brief-meta">
        <StatusBadge tone={brief.state === 'critical' ? 'danger' : brief.state === 'attention' ? 'warning' : brief.state === 'info' ? 'info' : 'success'}>
          {brief.priorityCount} PRIORITIES
        </StatusBadge>
        <small>생성 {new Date(brief.generatedAt).toLocaleString('ko-KR')}</small>
      </div>
    </section>
  );
}
