import { FilePlus2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { normalizeApiError } from '../../../shared/api/apiError';
import { ErrorState, KeyValues, SectionCard, StatusBadge } from '../../../shared/components';
import { useCreatePolicyLifecycle } from '../hooks/usePolicyLifecycle';
import type { PolicyLifecycleRecord } from '../model/types';

const digestPattern = /^[a-f0-9]{64}$/;

type PolicyArtifactCreatePanelProps = {
  onCreated: (record: PolicyLifecycleRecord) => void;
};

export function PolicyArtifactCreatePanel({ onCreated }: PolicyArtifactCreatePanelProps) {
  const [artifactId, setArtifactId] = useState('');
  const [artifactVersion, setArtifactVersion] = useState('');
  const [artifactDigest, setArtifactDigest] = useState('');
  const [workloadId, setWorkloadId] = useState('');
  const [purposeCode, setPurposeCode] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const create = useCreatePolicyLifecycle();
  const isValid = artifactId.trim().length > 0
    && artifactVersion.trim().length > 0
    && digestPattern.test(artifactDigest.trim())
    && workloadId.trim().length > 0
    && purposeCode.trim().length > 0;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || !confirmed) return;
    create.mutate({
      artifactId: artifactId.trim(),
      artifactVersion: artifactVersion.trim(),
      artifactDigest: artifactDigest.trim(),
      policyLayer: 'WORKLOAD',
      executionPack: 'AI',
      workloadId: workloadId.trim(),
      purposeCode: purposeCode.trim(),
    }, {
      onSuccess: (record) => {
        setConfirmed(false);
        onCreated(record);
      },
    });
  }

  return (
    <SectionCard
      title="AI Policy Artifact 등록"
      description="Generic Policy Lifecycle에 WORKLOAD 범위 Artifact를 DRAFT로 등록합니다."
      actions={<StatusBadge tone="info">AI CONTRACT</StatusBadge>}
    >
      <form className="form-grid compact-form-grid" onSubmit={submit}>
        <label className="field"><span>Artifact ID</span><input value={artifactId} onChange={(event) => setArtifactId(event.target.value)} placeholder="policy-customer-summary-v2" required /></label>
        <label className="field"><span>Version</span><input value={artifactVersion} onChange={(event) => setArtifactVersion(event.target.value)} placeholder="2.0.0" required /></label>
        <label className="field field-full"><span>Artifact Digest</span><input value={artifactDigest} onChange={(event) => setArtifactDigest(event.target.value)} placeholder="64자리 lowercase SHA-256 hex" required /></label>
        <label className="field"><span>Workload ID</span><input value={workloadId} onChange={(event) => setWorkloadId(event.target.value)} placeholder="customer_summary" required /></label>
        <label className="field"><span>Purpose Code</span><input value={purposeCode} onChange={(event) => setPurposeCode(event.target.value)} placeholder="CUSTOMER_SUPPORT" required /></label>
        <label className="checkbox-row field-full">
          <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={!isValid} />
          <span>입력한 identity와 digest로 DRAFT Artifact를 생성합니다.</span>
        </label>
        <button className="button button-primary" type="submit" disabled={!isValid || !confirmed || create.isPending}>
          <FilePlus2 size={15} />{create.isPending ? '등록 중...' : 'Policy Artifact 등록'}
        </button>
      </form>
      {create.isError ? <ErrorState title="Policy Artifact 등록에 실패했습니다" description={normalizeApiError(create.error).message} onRetry={() => create.reset()} /> : null}
      {create.data ? <KeyValues items={[
        ['Artifact', `${create.data.artifactId} · ${create.data.artifactVersion}`],
        ['Lifecycle', create.data.lifecycleStage],
        ['Revision', String(create.data.revision)],
        ['Scope', `${create.data.executionPack} · ${create.data.workloadId} · ${create.data.purposeCode}`],
      ]} /> : null}
    </SectionCard>
  );
}
