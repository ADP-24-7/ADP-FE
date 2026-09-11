import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { normalizeApiError } from '../../shared/api/apiError';
import { env } from '../../shared/config/env';
import { useAuthContext, useLogin } from '../../features/auth';

const demoAccounts = [
  { label: '감사 담당자', principalId: 'auditor-local', password: 'auditor-demo' },
  { label: '승인 담당자', principalId: 'privileged-operator-local', password: 'approver-demo' },
  { label: '운영 담당자', principalId: 'operator-local', password: 'operator-demo' },
];

function safeReturnTo(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/overview';
}

export function LoginPage() {
  const auth = useAuthContext();
  const login = useLogin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [principalId, setPrincipalId] = useState('');
  const [password, setPassword] = useState('');
  const isLocal = import.meta.env.VITE_APP_ENV === 'local';
  const returnTo = safeReturnTo(searchParams.get('returnTo'));

  useEffect(() => {
    if (login.isSuccess) navigate(returnTo, { replace: true });
  }, [login.isSuccess, navigate, returnTo]);

  if (auth.data && !login.isSuccess) return <Navigate to={returnTo} replace />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await login.mutateAsync({ principalId: principalId.trim(), password }).catch(() => undefined);
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="login-brand-icon"><ShieldCheck size={23} /></span>
          <div><span>FPG</span><strong>Governance Console</strong></div>
          {env.dataProvenance === 'SYNTHETIC' ? (
            <span className="data-provenance-badge" title="실제 고객 데이터가 아닌 합성 데이터 환경입니다.">
              합성 데이터
            </span>
          ) : null}
        </div>
        <header>
          <LockKeyhole size={20} aria-hidden="true" />
          <div><h1 id="login-title">관리자 로그인</h1><p>허가된 계정으로 운영 콘솔에 접근합니다.</p></div>
        </header>
        <form className="login-form" onSubmit={submit}>
          <label className="field"><span>사용자 ID</span><input autoComplete="username" autoFocus maxLength={80} value={principalId} onChange={(event) => setPrincipalId(event.target.value)} /></label>
          <label className="field"><span>비밀번호</span><input type="password" autoComplete="current-password" maxLength={200} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {login.error ? <p className="login-error" role="alert">{normalizeApiError(login.error).message}</p> : null}
          <button className="button button-primary login-submit" type="submit" disabled={!principalId.trim() || !password || login.isPending}>
            {login.isPending ? '확인 중' : '로그인'}
          </button>
        </form>
        {isLocal ? (
          <div className="demo-accounts">
            <strong>로컬 데모 계정</strong>
            <div>{demoAccounts.map((account) => (
              <button type="button" key={account.principalId} onClick={() => { setPrincipalId(account.principalId); setPassword(account.password); }}>
                <span>{account.label}</span><code>{account.principalId}</code>
              </button>
            ))}</div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
