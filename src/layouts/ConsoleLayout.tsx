import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Activity,
  ChevronDown,
  FileCheck2,
  FlaskConical,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { executionPacks, useExecutionPack } from '../shared/prototype';
import { env } from '../shared/config/env';

const navItems = [
  { to: '/overview', label: '통합 관제', icon: LayoutDashboard },
  { to: '/policies', label: '정책 · 승인', icon: SlidersHorizontal },
  { to: '/gateway-lab', label: 'Gateway Lab', icon: FlaskConical },
  { to: '/monitoring', label: 'Security Monitoring', icon: ShieldAlert },
  { to: '/analysis', label: 'Runtime · Recovery', icon: Activity },
  { to: '/audit', label: 'Decision Trace', icon: FileCheck2 },
];

const runtimeDomainPacks = executionPacks.filter((pack) => pack.key === 'ai' || pack.key === 'digital-asset');

function getRuntimeDomainLabel(packKey: string, fallback: string) {
  return packKey === 'ai' ? 'AI · Agent' : fallback;
}

export function ConsoleLayout() {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPolicyMenuOpen, setIsPolicyMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { selectedPackKey, selectPack } = useExecutionPack();
  const activeNavItem = navItems.find((item) => location.pathname.startsWith(item.to));

  return (
    <div className={isSidebarCollapsed ? 'console-shell console-shell-collapsed' : 'console-shell'}>
      <aside className="console-sidebar" aria-label="ADP Console navigation">
        <div className="console-brand-row">
          <div className="console-brand">
              <span className="console-brand-logo" aria-hidden="true"><ShieldCheck size={20} /></span>
            <span className="console-brand-copy">
              <span className="console-brand-mark">FPG</span>
              <span className="console-brand-title">Governance Console</span>
              <span className="console-brand-subtitle">PoC Workspace · v3.2</span>
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
          <span className={env.localBffEnabled ? 'connection-dot' : 'connection-dot connection-dot-warning'} aria-hidden="true" />
          <div>
            <strong>DATA SOURCE</strong>
            <span>{env.localBffEnabled ? 'Local BFF' : 'API 연결 대기'}</span>
            <small>No mock operations</small>
          </div>
        </div>
      </aside>

      <div className="console-content">
        <header className="console-topbar">
          <div className="console-topbar-copy">
            <strong>Financial Privacy Gateway</strong>
            <span>{activeNavItem?.label ?? 'Policy Decision → Finding → Trace → Recovery'}</span>
          </div>
          <div className="topbar-actions">
            <div className="runtime-domain-toggle" role="tablist" aria-label="화면 Viewing Context">
              <span className="runtime-domain-context-label">CONTEXT</span>
              {runtimeDomainPacks.map((pack) => (
                <button
                  key={pack.key}
                  type="button"
                  role="tab"
                  aria-selected={pack.key === selectedPackKey}
                  className={pack.key === selectedPackKey ? 'active' : ''}
                  title={pack.scope}
                  onClick={() => {
                    selectPack(pack.key);
                    setIsPolicyMenuOpen(false);
                    setIsSettingsOpen(false);
                  }}
                >
                  {getRuntimeDomainLabel(pack.key, pack.label)}
                </button>
              ))}
            </div>
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
                    <span>Policy 목록 API 구현 후 선택할 수 있습니다.</span>
                  </div>
                </div>
              ) : null}
            </div>
            <span className="live-mode-badge">NO MOCK DATA</span>
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
