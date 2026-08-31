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
};

export function SectionCard({ title, description, children, className = '' }: SectionCardProps) {
  return (
    <section className={`section-card ${className}`.trim()}>
      <div className="section-card-header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
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
};

export function EmptyState({ title, description, endpoint, action, compact = false }: EmptyStateProps) {
  return (
    <div className={compact ? 'state-panel state-panel-compact' : 'state-panel'} role="status">
      <span className="state-icon" aria-hidden="true">○</span>
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
};

export function MetricCard({ label, value, description, loading = false }: MetricCardProps) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      {loading ? <span className="skeleton skeleton-metric" aria-label="불러오는 중" /> : <strong>{value ?? '—'}</strong>}
      <small>{value == null && !loading ? '집계 데이터 없음' : description}</small>
    </article>
  );
}

export function EndpointNotice({ children }: { children: ReactNode }) {
  return <div className="endpoint-notice">연결 API <code>{children}</code></div>;
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

export function RestrictedValue({ label = '권한이 있는 사용자에게만 표시됩니다' }: { label?: string }) {
  return (
    <span className="restricted-value" aria-label={label} title={label}>
      <span aria-hidden="true">••••••••</span>
    </span>
  );
}

