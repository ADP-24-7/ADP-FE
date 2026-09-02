import { Database } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="page-header page-header-row">
      <div>
        <p className="page-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
};

export function SectionCard({ title, description, children, className = '', actions }: SectionCardProps) {
  return (
    <section className={`section-card ${className}`.trim()}>
      <div className="section-card-header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="section-card-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
  endpoint?: string;
  action?: ReactNode;
  compact?: boolean;
  icon?: LucideIcon;
};

export function EmptyState({ title, description, endpoint, action, compact = false, icon: Icon = Database }: EmptyStateProps) {
  return (
    <div className={compact ? 'state-panel state-panel-compact' : 'state-panel'} role="status">
      <span className="state-icon" aria-hidden="true"><Icon size={compact ? 17 : 22} /></span>
      <strong>{title}</strong>
      <p>{description}</p>
      {endpoint ? <code>{endpoint}</code> : null}
      {action ? <div className="state-action">{action}</div> : null}
    </div>
  );
}

type ErrorStateProps = {
  title?: string;
  description: string;
  onRetry?: () => void;
};

export function ErrorState({ title = '데이터를 불러오지 못했습니다', description, onRetry }: ErrorStateProps) {
  return (
    <div className="state-panel state-panel-error" role="alert">
      <span className="state-icon" aria-hidden="true">!</span>
      <strong>{title}</strong>
      <p>{description}</p>
      {onRetry ? <button className="button button-secondary" onClick={onRetry}>다시 시도</button> : null}
    </div>
  );
}

export function LoadingPanel({ label = '데이터를 불러오는 중입니다' }: { label?: string }) {
  return (
    <div className="loading-panel" role="status" aria-label={label}>
      <span className="skeleton skeleton-title" />
      <span className="skeleton skeleton-line" />
      <span className="skeleton skeleton-line skeleton-line-short" />
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value?: number | string | null;
  description: string;
  loading?: boolean;
  state?: 'loading' | 'value' | 'empty' | 'unconnected' | 'error';
  tone?: 'blue' | 'amber' | 'red' | 'purple' | 'green' | 'neutral';
  icon?: LucideIcon;
};

export function MetricCard({ label, value, description, loading = false, state, tone = 'blue', icon: Icon }: MetricCardProps) {
  const resolvedState = state ?? (loading ? 'loading' : value == null ? 'empty' : 'value');
  const metricValue = {
    loading: <span className="skeleton skeleton-metric" aria-label="불러오는 중" />,
    value: <strong>{value}</strong>,
    empty: <strong>—</strong>,
    unconnected: <strong>—</strong>,
    error: <strong>!</strong>,
  }[resolvedState];

  const helperText = {
    loading: description,
    value: description,
    empty: '데이터가 없습니다',
    unconnected: 'API 연결 대기',
    error: 'API 오류',
  }[resolvedState];

  return (
    <article className="metric-card">
      {Icon ? <span className={`metric-icon metric-icon-${tone}`} aria-hidden="true"><Icon size={18} /></span> : null}
      <span>{label}</span>
      {metricValue}
      <small>{helperText}</small>
    </article>
  );
}

export function EndpointNotice({ children }: { children: ReactNode }) {
  return <div className="endpoint-notice">연결 API <code>{children}</code></div>;
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'amber' | 'purple' }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

type PackContextSummaryProps = {
  label: string;
  scope: string;
  descriptor: string;
  objective?: string;
};

export function PackContextSummary({ label, scope, descriptor, objective }: PackContextSummaryProps) {
  return (
    <div className="pack-context-summary" aria-label="선택된 Execution Pack">
      <div>
        <span>SELECTED EXECUTION PACK</span>
        <strong>{label}</strong>
        <p>{objective ?? scope}</p>
      </div>
      <StatusBadge tone="purple">{descriptor}</StatusBadge>
    </div>
  );
}

type DomainSwitchProps<T extends string> = {
  label: string;
  value: T;
  options: ReadonlyArray<{
    key: T;
    label: string;
    description: string;
    badge: string;
  }>;
  onChange: (value: T) => void;
};

export function DomainSwitch<T extends string>({ label, value, options, onChange }: DomainSwitchProps<T>) {
  return (
    <div className="domain-switch" role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          role="tab"
          aria-selected={option.key === value}
          className={option.key === value ? 'active' : ''}
          onClick={() => onChange(option.key)}
        >
          <span>{option.label}</span>
          <b>{option.description}</b>
          <em>{option.badge}</em>
        </button>
      ))}
    </div>
  );
}

export function BulletList({ items }: { items: ReadonlyArray<string> }) {
  return (
    <ul className="bullet-list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

export function RestrictedValue({ label = '권한이 있는 사용자에게만 표시됩니다' }: { label?: string }) {
  return (
    <span className="restricted-value" aria-label={label} title={label}>
      <span aria-hidden="true">••••••••</span>
    </span>
  );
}

export function KeyValues({ items }: { items: Array<readonly [string, ReactNode]> | ReadonlyArray<readonly [string, ReactNode]> }) {
  return (
    <div className="key-values">
      {items.map(([key, value]) => (
        <div key={key}>
          <span>{key}</span>
          <b>{value}</b>
        </div>
      ))}
    </div>
  );
}
