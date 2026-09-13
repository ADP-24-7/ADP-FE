import { lazy, Suspense } from 'react';
import { LoadingPanel } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

const DigitalAssetOperationsOverviewDashboard = lazy(() =>
  import('../../features/digital-asset/components/DigitalAssetOperationsOverviewDashboard')
    .then((module) => ({ default: module.DigitalAssetOperationsOverviewDashboard })),
);
const AiOperationsOverviewDashboard = lazy(() =>
  import('../../features/ai-operations/components/AiOperationsOverviewDashboard')
    .then((module) => ({ default: module.AiOperationsOverviewDashboard })),
);

export function OverviewPage() {
  const { selectedPack } = useExecutionPack();

  return (
    <section className="page-section">
      <Suspense fallback={<LoadingPanel label={`${selectedPack.label} 운영 화면을 준비하는 중입니다`} />}>
        {selectedPack.key === 'digital-asset'
          ? <DigitalAssetOperationsOverviewDashboard />
          : <AiOperationsOverviewDashboard />}
      </Suspense>
    </section>
  );
}
