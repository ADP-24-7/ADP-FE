import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ConsoleLayout } from '../layouts/ConsoleLayout';
import { AnalysisPage } from '../pages/analysis/AnalysisPage';
import { AuditPage } from '../pages/audit/AuditPage';
import { ErrorPage } from '../pages/error/ErrorPage';
import { GatewayLabPage } from '../pages/gateway-lab/GatewayLabPage';
import { MonitoringPage } from '../pages/monitoring/MonitoringPage';
import { NotFoundPage } from '../pages/not-found/NotFoundPage';
import { OverviewPage } from '../pages/overview/OverviewPage';
import { PoliciesPage } from '../pages/policies/PoliciesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ConsoleLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: 'overview', element: <OverviewPage /> },
      { path: 'gateway-lab', element: <GatewayLabPage /> },
      { path: 'analysis', element: <AnalysisPage /> },
      { path: 'policies', element: <PoliciesPage /> },
      { path: 'monitoring', element: <MonitoringPage /> },
      { path: 'audit', element: <AuditPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
