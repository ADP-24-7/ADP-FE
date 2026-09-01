import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  ChevronDown,
  Database,
  FileCheck2,
  FlaskConical,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPolicyMenuOpen, setIsPolicyMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className={isSidebarCollapsed ? 'console-shell console-shell-collapsed' : 'console-shell'}>
      <aside className="console-sidebar" aria-label="ADP Console navigation">
        <div className="console-brand-row">
          <div className="console-brand">
            <span className="console-brand-logo" aria-hidden="true"><ShieldCheck size={20} /></span>
            <span className="console-brand-copy">
              <span className="console-brand-mark">FPG</span>
              <span className="console-brand-title">Privacy Gateway</span>
              <span className="console-brand-subtitle">Runtime Control Plane</span>
            </span>
          </div>
          <button
            className="sidebar-toggle"
            type="button"
            aria-label={isSidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
            aria-pressed={isSidebarCollapsed}
            onClick={() => setIsSidebarCollapsed((current) => !current)}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>

        <nav className="console-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) => (isActive ? 'console-nav-link active' : 'console-nav-link')}
            >
              <span className="console-nav-icon" aria-hidden="true"><item.icon size={18} /></span>
              <span className="console-nav-label">{item.label}</span>
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
          <div className="console-topbar-copy">
            <strong>Financial Privacy Gateway</strong>
            <span>Request · Data Access · Egress · Response Guard · Audit</span>
          </div>
          <div className="topbar-actions">
            <div className="dropdown">
              <button
                className="policy-trigger"
                type="button"
                aria-haspopup="menu"
                aria-expanded={isPolicyMenuOpen}
                onClick={() => {
                  setIsPolicyMenuOpen((current) => !current);
                  setIsSettingsOpen(false);
                }}
              >
                <ShieldCheck size={15} />
                <span>Policy <b>—</b></span>
                <StatusPill>No Data</StatusPill>
                <ChevronDown size={14} />
              </button>
              {isPolicyMenuOpen ? (
                <div className="dropdown-menu dropdown-menu-right" role="menu">
                  <div className="dropdown-empty">
                    <strong>Policy 없음</strong>
                    <span>GET /v1/policies 연결 후 선택할 수 있습니다.</span>
                  </div>
                </div>
              ) : null}
            </div>
            <span className="live-mode-badge">REAL API MODE</span>
            <div className="dropdown">
              <button
                className="icon-button"
                type="button"
                aria-label="설정"
                aria-haspopup="menu"
                aria-expanded={isSettingsOpen}
                onClick={() => {
                  setIsSettingsOpen((current) => !current);
                  setIsPolicyMenuOpen(false);
                }}
              >
                <Settings2 size={17} />
              </button>
              {isSettingsOpen ? (
                <div className="dropdown-menu dropdown-menu-right" role="menu">
                  <button type="button" role="menuitem" disabled>Auth Integration</button>
                  <button type="button" role="menuitem" disabled>API Health</button>
                  <button type="button" role="menuitem" disabled>Console Preferences</button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="console-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function StatusPill({ children }: { children: string }) {
  return <span className="topbar-status-pill">{children}</span>;
}
