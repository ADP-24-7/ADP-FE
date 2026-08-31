import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ConsoleLayout } from '../layouts/ConsoleLayout';
import { AuditPage } from '../pages/audit/AuditPage';
import { GatewayLabPage } from '../pages/gateway-lab/GatewayLabPage';
import { MonitoringPage } from '../pages/monitoring/MonitoringPage';
import { OverviewPage } from '../pages/overview/OverviewPage';
import { PoliciesPage } from '../pages/policies/PoliciesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ConsoleLayout />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: 'overview', element: <OverviewPage /> },
      { path: 'gateway-lab', element: <GatewayLabPage /> },
      { path: 'policies', element: <PoliciesPage /> },
      { path: 'monitoring', element: <MonitoringPage /> },
      { path: 'audit', element: <AuditPage /> },
    ],
  },
]);
