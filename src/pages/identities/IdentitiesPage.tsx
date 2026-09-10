import { ShieldCheck } from 'lucide-react';
import { AdminIdentityPanel } from '../../features/admin-identities';
import { PageHeader, StatusBadge } from '../../shared/components';

export function IdentitiesPage() {
  return (
    <section className="page-section">
      <PageHeader
        eyebrow="ADMIN ACCESS PLANE · INSTITUTION SCOPED"
        title="Identity · 권한"
        description="관리자와 Runtime Service의 역할, Workload 및 Purpose 권한을 조회합니다."
        actions={<StatusBadge tone="success"><ShieldCheck size={13} />SCOPED READ</StatusBadge>}
      />
      <AdminIdentityPanel />
    </section>
  );
}
