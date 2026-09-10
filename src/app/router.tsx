import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ConsoleLayout } from '../layouts/ConsoleLayout';
import { AnalysisPage } from '../pages/analysis/AnalysisPage';
import { AuditPage } from '../pages/audit/AuditPage';
import { DataAccessPage } from '../pages/data-access/DataAccessPage';
import { ErrorPage } from '../pages/error/ErrorPage';
import { GatewayLabPage } from '../pages/gateway-lab/GatewayLabPage';
import { IdentitiesPage } from '../pages/identities/IdentitiesPage';
import { MonitoringPage } from '../pages/monitoring/MonitoringPage';
import { NotFoundPage } from '../pages/not-found/NotFoundPage';
import { OverviewPage } from '../pages/overview/OverviewPage';
import { PoliciesPage } from '../pages/policies/PoliciesPage';
import { LoginPage } from '../pages/login/LoginPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <ConsoleLayout />,
        children: [
          { index: true, element: <Navigate to="/overview" replace /> },
          { path: 'overview', element: <OverviewPage /> },
          { path: 'data-access', element: <DataAccessPage /> },
          { path: 'gateway-lab', element: <GatewayLabPage /> },
          { path: 'identities', element: <IdentitiesPage /> },
          { path: 'analysis', element: <AnalysisPage /> },
          { path: 'policies', element: <PoliciesPage /> },
          { path: 'monitoring', element: <MonitoringPage /> },
          { path: 'audit', element: <AuditPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
