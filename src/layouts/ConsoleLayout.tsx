import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  ChevronDown,
  DatabaseZap,
  CircleUserRound,
  FileCheck2,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  UsersRound,
} from 'lucide-react';
import { executionPacks, useExecutionPack } from '../shared/prototype';
import { useAuthContext, useLogout } from '../features/auth';
import type { AuthRole } from '../features/auth';
import { env } from '../shared/config/env';
import { MyWorkMenu } from '../features/audit-export';

const navItems = [
  { to: '/overview', label: '통합 관제', icon: LayoutDashboard },
  { to: '/policies', label: '정책 · 승인', icon: SlidersHorizontal },
  { to: '/identities', label: 'Identity · 권한', icon: UsersRound },
  { to: '/data-access', label: 'Workload · Data', icon: DatabaseZap },
  { to: '/gateway-lab', label: 'Gateway Lab', icon: FlaskConical },
  { to: '/monitoring', label: 'Security Monitoring', icon: ShieldAlert },
  { to: '/analysis', label: 'Runtime · Recovery', icon: Activity },
  { to: '/audit', label: 'Decision Trace', icon: FileCheck2 },
];

const runtimeDomainPacks = executionPacks.filter((pack) => pack.key === 'ai' || pack.key === 'digital-asset');

function getRuntimeDomainLabel(packKey: string, fallback: string) {
  return packKey === 'ai' ? 'AI · Agent' : fallback;
}

const roleLabels: Record<AuthRole, string> = {
  BUSINESS_OWNER: '업무 책임자',
  ANALYST: '분석가',
  COMPLIANCE_REVIEWER: '준법 검토',
  PRIVACY_REVIEWER: '개인정보 검토',
  SECURITY_REVIEWER: '보안 검토',
  DEVELOPER: '개발자',
  OPERATOR: '운영자',
  PRIVILEGED_OPERATOR: '승인 권한',
  AUDITOR: '감사 조회',
  METRICS_SCRAPER: '지표 수집',
  RUNTIME_EXECUTOR: '실행 권한',
};

function formatRoles(roles: AuthRole[] | undefined) {
  return roles?.map((role) => roleLabels[role]).join(' · ') || '권한 확인 중';
}

export function ConsoleLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOperatorMenuOpen, setIsOperatorMenuOpen] = useState(false);
  const { selectedPackKey, selectPack } = useExecutionPack();
  const auth = useAuthContext();
  const logout = useLogout();
  const activeNavItem = navItems.find((item) => location.pathname.startsWith(item.to));
  const navLabel = (item: typeof navItems[number]) => (
    item.to === '/analysis' && selectedPackKey === 'ai' ? 'AI Admin' : item.label
  );

  useEffect(() => {
    if (!location.hash) return;

    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!target) return;

      target.tabIndex = -1;
      target.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.hash, location.pathname]);

  return (
    <div className={isSidebarCollapsed ? 'console-shell console-shell-collapsed' : 'console-shell'}>
      <aside className="console-sidebar" aria-label="ADP Console navigation">
        <div className="console-brand-row">
          <div className="console-brand">
              <span className="console-brand-logo" aria-hidden="true"><ShieldCheck size={20} /></span>
            <span className="console-brand-copy">
              <span className="console-brand-mark">FPG</span>
              <span className="console-brand-title">Governance Console</span>
              <span className="console-brand-subtitle">AI · Digital Asset Control</span>
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
              title={navLabel(item)}
              className={({ isActive }) => (isActive ? 'console-nav-link active' : 'console-nav-link')}
            >
              <span className="console-nav-icon" aria-hidden="true"><item.icon size={18} /></span>
              <span className="console-nav-label">{navLabel(item)}</span>
            </NavLink>
          ))}
        </nav>

      </aside>

      <div className="console-content">
        <header className="console-topbar">
          <div className="console-topbar-copy">
            <strong>Financial Privacy Gateway</strong>
            <span>{activeNavItem ? navLabel(activeNavItem) : 'Policy Decision → Finding → Trace → Recovery'}</span>
          </div>
          <div className="topbar-actions">
            {env.dataProvenance === 'SYNTHETIC' ? (
              <span className="data-provenance-badge" title="실제 고객 데이터가 아닌 합성 데이터 환경입니다.">
                합성 데이터
              </span>
            ) : null}
            <div className="runtime-domain-toggle" role="tablist" aria-label="화면 Viewing Context">
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
                    setIsOperatorMenuOpen(false);
                  }}
                >
                  {getRuntimeDomainLabel(pack.key, pack.label)}
                </button>
              ))}
            </div>
            <MyWorkMenu />
            <div className="dropdown">
              <button
                className="operator-context"
                type="button"
                aria-label="현재 운영자 권한"
                aria-haspopup="menu"
                aria-expanded={isOperatorMenuOpen}
                onClick={() => setIsOperatorMenuOpen((current) => !current)}
              >
                <CircleUserRound size={17} aria-hidden="true" />
                <span>
                  <strong>{auth.data?.displayName ?? (auth.isError ? '인증 확인 필요' : '운영자 확인 중')}</strong>
                  <small>{formatRoles(auth.data?.roles)}</small>
                </span>
                <ChevronDown size={14} aria-hidden="true" />
              </button>
              {isOperatorMenuOpen ? (
                <div className="dropdown-menu dropdown-menu-right" role="menu">
                  <div className="operator-menu-summary">
                    <strong>{auth.data?.displayName ?? '운영자 정보 없음'}</strong>
                    <span>계정 ID <code>{auth.data?.principalId ?? '—'}</code></span>
                    <span>기관 <code>{auth.data?.institutionId ?? '—'}</code></span>
                    <span>권한 {formatRoles(auth.data?.roles)}</span>
                    <span>Workload {auth.data ? `${auth.data.workloadIds.length}개` : '—'}</span>
                  </div>
                  <button type="button" role="menuitem" onClick={() => { setIsOperatorMenuOpen(false); navigate('/identities'); }}>권한 상세 보기 <span aria-hidden="true">→</span></button>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={logout.isPending}
                    onClick={async () => {
                      const returnTo = `${location.pathname}${location.search}${location.hash}`;
                      setIsOperatorMenuOpen(false);
                      await logout.mutateAsync().catch(() => undefined);
                      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
                    }}
                  >
                    로그아웃 <LogOut size={14} aria-hidden="true" />
                  </button>
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
