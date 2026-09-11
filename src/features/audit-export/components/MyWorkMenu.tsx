import { Bell, Download, FileClock, ListChecks } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../auth';
import { useAuditExportWorkSummary } from '../hooks/useAuditExport';

export function MyWorkMenu() {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const [open, setOpen] = useState(false);
  const eligible = Boolean(auth.data?.roles.some((role) => role === 'AUDITOR' || role === 'PRIVILEGED_OPERATOR'));
  const summary = useAuditExportWorkSummary(eligible);
  if (!eligible) return null;

  const total = summary.data
    ? summary.data.personal.pendingApproval + summary.data.personal.readyToDownload + summary.data.approvals.pending
    : 0;
  const go = (view: 'MY_REQUESTS' | 'APPROVAL_QUEUE') => {
    setOpen(false);
    navigate(`/policies?section=approvals&view=${view}`);
  };

  return <div className="dropdown my-work">
    <button
      type="button"
      className="my-work-trigger"
      aria-label={`My Work${total ? ` ${total}건` : ''}`}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen((value) => !value)}
    >
      <Bell size={16} /><span>My Work</span>{total > 0 ? <b>{total}</b> : null}
    </button>
    {open ? <div className="dropdown-menu dropdown-menu-right my-work-menu" role="menu">
      <div className="my-work-title"><strong>My Work</strong><span>내 요청과 처리할 승인 업무</span></div>
      <button type="button" role="menuitem" onClick={() => go('MY_REQUESTS')}>
        <span><FileClock size={15} />승인 대기</span><b>{summary.data?.personal.pendingApproval ?? '—'}</b>
      </button>
      <button type="button" role="menuitem" onClick={() => go('MY_REQUESTS')}>
        <span><Download size={15} />다운로드 가능</span><b>{summary.data?.personal.readyToDownload ?? '—'}</b>
      </button>
      {summary.data?.approvalAvailable ? <button type="button" role="menuitem" onClick={() => go('APPROVAL_QUEUE')}>
        <span><ListChecks size={15} />승인 필요</span><b>{summary.data.approvals.pending}</b>
      </button> : null}
      <button className="my-work-all" type="button" role="menuitem" onClick={() => go('MY_REQUESTS')}>
        전체 업무 보기 <span aria-hidden="true">→</span>
      </button>
    </div> : null}
  </div>;
}
