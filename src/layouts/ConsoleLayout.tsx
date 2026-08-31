import { NavLink, Outlet } from 'react-router-dom';
import { env } from '../shared/config/env';

const navItems = [
  { to: '/overview', label: '운영 개요', icon: '▦' },
  { to: '/gateway-lab', label: 'Gateway Lab', icon: '⌁' },
  { to: '/analysis', label: '분석 및 평가', icon: '◫' },
  { to: '/policies', label: '정책 관리', icon: '◇' },
  { to: '/monitoring', label: '모니터링', icon: '⌁' },
  { to: '/audit', label: '감사 추적', icon: '◎' },
];

export function ConsoleLayout() {
  return (
    <div className="console-shell">
      <aside className="console-sidebar" aria-label="ADP Console navigation">
        <div className="console-brand">
          <span className="console-brand-mark">ADP</span>
          <span className="console-brand-title">Privacy Gateway</span>
          <span className="console-brand-subtitle">Admin Console</span>
        </div>

        <nav className="console-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'console-nav-link active' : 'console-nav-link')}
            >
              <span className="console-nav-icon" aria-hidden="true">{item.icon}</span>
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
            <span>Privacy-safe runtime operations</span>
          </div>
          <span className="live-mode-badge">LIVE API</span>
        </header>
        <main className="console-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
