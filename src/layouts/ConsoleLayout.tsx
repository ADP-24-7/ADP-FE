import { NavLink, Outlet } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Database,
  FileCheck2,
  FlaskConical,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { env } from '../shared/config/env';

const navItems = [
  { to: '/overview', label: '운영 개요', icon: LayoutDashboard },
  { to: '/data-access', label: 'Workload · Data Access', icon: Database },
  { to: '/gateway-lab', label: 'Gateway Lab', icon: FlaskConical },
  { to: '/analysis', label: '분석 · Evidence', icon: BarChart3 },
  { to: '/policies', label: '정책 · Review', icon: SlidersHorizontal },
  { to: '/monitoring', label: '모니터링 · Recovery', icon: Activity },
  { to: '/audit', label: 'Decision Trace · Audit', icon: FileCheck2 },
];

export function ConsoleLayout() {
  return (
    <div className="console-shell">
      <aside className="console-sidebar" aria-label="ADP Console navigation">
        <div className="console-brand">
          <span className="console-brand-logo" aria-hidden="true"><ShieldCheck size={20} /></span>
          <span className="console-brand-mark">FPG</span>
          <span className="console-brand-title">Privacy Gateway</span>
          <span className="console-brand-subtitle">Runtime Control Plane</span>
        </div>

        <nav className="console-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'console-nav-link active' : 'console-nav-link')}
            >
              <span className="console-nav-icon" aria-hidden="true"><item.icon size={18} /></span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-status">
          <span className="connection-dot" aria-hidden="true" />
          <div>
            <strong>{env.appEnv.toUpperCase()}</strong>
            <span>실제 API 연결 모드</span>
          </div>
        </div>
      </aside>

      <div className="console-content">
        <header className="console-topbar">
          <div>
            <strong>Financial Privacy Gateway</strong>
            <span>Request · Data Access · Egress · Response Guard · Audit</span>
          </div>
          <div className="topbar-actions">
            <span className="live-mode-badge">LIVE API</span>
            <button className="icon-button" type="button" aria-label="설정">
              <Settings2 size={17} />
            </button>
          </div>
        </header>
        <main className="console-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
