import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuthContext } from '../hooks/useAuthContext';

export function ProtectedRoute() {
  const auth = useAuthContext();
  const location = useLocation();

  if (auth.isPending) {
    return (
      <div className="auth-loading" role="status">
        <ShieldCheck size={24} />
        <span>인증 상태를 확인하고 있습니다.</span>
      </div>
    );
  }
  if (!auth.data) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  return <Outlet />;
}
