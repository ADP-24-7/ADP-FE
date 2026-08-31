import { NavLink, Outlet } from 'react-router-dom';
import { env } from '../shared/config/env';

const navItems = [
  { to: '/overview', label: '운영 개요' },
  { to: '/gateway-lab', label: 'Gateway Lab' },
  { to: '/analysis', label: '분석 및 평가' },
  { to: '/policies', label: '정책 관리' },
  { to: '/monitoring', label: '모니터링' },
  { to: '/audit', label: '감사 추적' },
];

export function ConsoleLayout() {
  return (
    <div className="console-shell">
      <aside className="console-sidebar" aria-label="ADP Console navigation">
        <div className="console-brand">
          <span className="console-brand-mark">ADP</span>
          <span className="console-brand-subtitle">Admin Console</span>
          {env.apiMode === 'mock' ? (
            <div className="environment-badges" aria-label="Environment mode">
              <span>LOCAL</span>
              <span>MOCK DATA</span>
              <span>PROJECT_PROVISIONAL</span>
            </div>
          ) : null}
        </div>
        <nav className="console-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'console-nav-link active' : 'console-nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="console-main">
        <Outlet />
      </main>
    </div>
  );
}
