import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Ban,
  CalendarRange,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  RotateCw,
  X,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ErrorState, LoadingPanel, StatusBadge } from '../../../shared/components';
import { useDigitalAssetOperationsOverview } from '../hooks/useDigitalAssetOperationsOverview';
import type { OverviewMetric } from '../model/operationsOverviewTypes';
import { EChart } from './EChart';
import type { DashboardChartOption } from './EChart';

const palette = {
  ink: '#162036', muted: '#69778f', grid: '#e3e9f1', blue: '#2878e8', green: '#1cad70',
  red: '#ec4f5f', amber: '#f2a51a', gray: '#9aa8bc', purple: '#7057d9',
};

const reasonLabels: Record<string, string> = {
  DIGITAL_ASSET_APPROVED_AMOUNT_EXCEEDED: '승인 금액 초과',
  DIGITAL_ASSET_APPROVED_DESTINATION_MISMATCH: '목적지 불일치',
  DIGITAL_ASSET_APPROVED_ASSET_MISMATCH: '자산 불일치',
  DIGITAL_ASSET_APPROVED_BENEFICIARY_MISMATCH: '수익자 불일치',
  DIGITAL_ASSET_APPROVED_PERIOD_VIOLATION: '승인 기간 위반',
  AMOUNT: '실행 금액 불일치',
  RECIPIENT_ADDRESS: '실행 수신 주소 불일치',
  EXTERNAL_REQUEST_ID: '외부 요청 ID 불일치',
  PROVIDER_NOT_CONFIGURED: '외부 실행 대상 설정 누락',
  TRANSPORT_ERROR: '외부 실행 통신 오류',
  SENT_UNKNOWN: '외부 처리 결과 미확정',
  FAILED: '외부 실행 실패',
};

const stageLabels: Record<string, string> = {
  POLICY_DECISION: '정책 판정',
  PRE_EXECUTION_GUARD: '실행 전 통제',
  EXTERNAL_EXECUTION: '외부 실행',
  POST_EXECUTION_EVIDENCE: '실행 결과 검증',
  RECONCILIATION: '외부 상태 조정',
};

const actionLabels: Record<string, string> = {
  INSPECT_EXECUTION_FAILURE: '실패 원인과 외부 응답을 확인하세요.',
  REVIEW_POLICY_DECISION: '차단 정책과 승인 조건을 확인하세요.',
  REVIEW_EVIDENCE: '예상값과 실제 실행 증적을 비교하세요.',
  RECONCILE_EXTERNAL_STATUS: '재전송 전 외부 상태를 먼저 확인하세요.',
  VERIFY_RECONCILIATION_EVIDENCE: '조정 완료 증적을 확인하세요.',
};

const heatmapColors: Record<string, string> = {
  COMPLETED: '28, 173, 112',
  BLOCKED: '236, 79, 95',
  FAILED: '190, 43, 58',
  EGRESSING: '242, 165, 26',
  EXTERNALLY_RECONCILED: '40, 120, 232',
  REVIEW_REQUIRED: '112, 87, 217',
};

const heatmapStatusOrder = ['COMPLETED', 'BLOCKED', 'FAILED', 'EGRESSING', 'EXTERNALLY_RECONCILED', 'REVIEW_REQUIRED'];

function flowNodeColor(name: string) {
  if (name.includes('FAILED') || name.includes('BLOCK')) return palette.red;
  if (name.includes('UNCERTAIN') || name.includes('EGRESSING')) return palette.amber;
  if (name.includes('REVIEW')) return palette.purple;
  if (name.includes('RECONCILED')) return palette.blue;
  if (name.includes('SUCCEEDED') || name.includes('COMPLETED') || name.includes('PASS')) return palette.green;
  if (name.includes('NOT_SENT') || name.includes('NOT_EVALUATED')) return palette.gray;
  return palette.blue;
}

const statusLabels: Record<string, string> = {
  REQUESTED: '전체 요청', DECISION_PASS: '정책 통과', DECISION_BLOCK: '정책 차단',
  DECISION_NOT_EVALUATED: '판정 증적 없음', EXECUTION_SUCCEEDED: '실행 성공',
  EXECUTION_FAILED: '실행 실패', EXECUTION_UNCERTAIN: '결과 미확정',
  EXECUTION_RECONCILED: '복구 확인', EXECUTION_NOT_SENT: '미전송',
  FINAL_COMPLETED: '최종 완료', FINAL_BLOCKED: '최종 차단', FINAL_FAILED: '최종 실패',
  FINAL_EGRESSING: '최종 미확정', FINAL_EXTERNALLY_RECONCILED: '최종 조정 완료',
  FINAL_REVIEW_REQUIRED: '최종 검토 필요', FINAL_RECEIVED: '최종 접수',
  FINAL_AUTHORIZED: '최종 인가 완료', FINAL_RETRIEVED: '최종 조회 완료',
  FINAL_DECIDED: '최종 판정 완료', FINAL_TRANSFORMED: '최종 변환 완료',
  COMPLETED: '완료', BLOCKED: '차단', FAILED: '실패', EGRESSING: '미확정',
  EXTERNALLY_RECONCILED: '조정 완료', REVIEW_REQUIRED: '검토 필요', RECEIVED: '접수',
  AUTHORIZED: '인가 완료', RETRIEVED: '조회 완료', DECIDED: '판정 완료', TRANSFORMED: '변환 완료',
};

type RangeDays = 1 | 7 | 30;
type SelectedRange = RangeDays | 'custom';

function range(days: RangeDays) {
  const to = new Date();
  const from = new Date(to);
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (days - 1));
  return { from: from.toISOString(), to: to.toISOString() };
}

function dateInputValue(value: string) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function periodLabel(from: string, to: string) {
  const format = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  return `${format.format(new Date(from))} - ${format.format(new Date(to))}`;
}

function changeLabel(metric?: OverviewMetric) {
  if (!metric || metric.changePercent == null) return '이전 기간 비교 없음';
  const sign = metric.changePercent > 0 ? '+' : '';
  return `${sign}${metric.changePercent.toLocaleString('ko-KR')}%`;
}

function MetricTile({ label, metric, icon: Icon, tone, adverse = false }: {
  label: string;
  metric?: OverviewMetric;
  icon: typeof Activity;
  tone: string;
  adverse?: boolean;
}) {
  const direction = metric?.changePercent == null ? 'neutral' : metric.changePercent > 0 ? 'up' : metric.changePercent < 0 ? 'down' : 'neutral';
  const changeTone = adverse && direction !== 'neutral'
    ? direction === 'up' ? 'adverse' : 'favorable'
    : direction;
  return (
    <article className={`da-metric-tile da-tone-${tone}`}>
      <header><span>{label}</span><span className="da-metric-icon"><Icon size={18} /></span></header>
      <div><strong>{metric?.current?.toLocaleString('ko-KR') ?? '—'}</strong><small className={`da-change-${changeTone}`}>{changeLabel(metric)}</small></div>
      <span className="da-metric-baseline">이전 기간 {metric?.previous?.toLocaleString('ko-KR') ?? '—'}건</span>
    </article>
  );
}

export function DigitalAssetOperationsOverviewDashboard() {
  const navigate = useNavigate();
  const customPopoverRef = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<SelectedRange>(7);
  const [period, setPeriod] = useState(() => range(7));
  const [customOpen, setCustomOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(() => dateInputValue(range(7).from));
  const [customTo, setCustomTo] = useState(() => dateInputValue(range(7).to));
  const [rangeError, setRangeError] = useState('');
  const overview = useDigitalAssetOperationsOverview(period.from, period.to);
  const data = overview.data;

  useEffect(() => {
    if (!customOpen) return undefined;
    const closeOnOutside = (event: PointerEvent) => {
      if (!customPopoverRef.current?.contains(event.target as Node)) setCustomOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCustomOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [customOpen]);

  const sankeyOption = useMemo<DashboardChartOption>(() => {
    const links = data?.flow ?? [];
    const names = Array.from(new Set(links.flatMap((item) => [item.source, item.target])));
    const incoming = new Map<string, number>();
    const outgoing = new Map<string, number>();
    links.forEach((item) => {
      outgoing.set(item.source, (outgoing.get(item.source) ?? 0) + item.count);
      incoming.set(item.target, (incoming.get(item.target) ?? 0) + item.count);
    });
    return {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'sankey', left: 12, right: 104, top: 12, bottom: 12, nodeWidth: 16, nodeGap: 9,
        emphasis: { focus: 'adjacency' },
        label: {
          color: palette.ink,
          fontSize: 9,
          formatter: (rawParams: unknown) => {
            const params = rawParams as { name: string; data?: { value?: number } | null };
            return `${statusLabels[params.name] ?? params.name} ${Number(params.data?.value ?? 0).toLocaleString('ko-KR')}건`;
          },
        },
        labelLayout: { hideOverlap: true },
        lineStyle: { color: 'gradient', opacity: 0.28, curveness: 0.52 },
        data: names.map((name) => ({
          name,
          value: Math.max(incoming.get(name) ?? 0, outgoing.get(name) ?? 0),
          itemStyle: { color: flowNodeColor(name) },
        })),
        links: links.map((item) => ({ source: item.source, target: item.target, value: item.count })),
      }],
    };
  }, [data?.flow]);

  const trendOption = useMemo<DashboardChartOption>(() => ({
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { color: palette.muted, fontSize: 10 } },
    grid: { left: 38, right: 12, top: 16, bottom: 42 },
    xAxis: { type: 'category', data: data?.trend.map((point) => point.date.slice(5)) ?? [], axisLine: { lineStyle: { color: palette.grid } } },
    yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: palette.grid } } },
    series: [
      ['전체', 'total', palette.gray], ['완료', 'completed', palette.green], ['차단', 'blocked', palette.red],
      ['실패', 'failed', palette.amber], ['미확정', 'sentUnknown', palette.blue],
    ].map(([name, key, color]) => ({
      name, type: 'line', smooth: true, symbolSize: 6, itemStyle: { color }, lineStyle: { width: 2, color },
      data: data?.trend.map((point) => point[key as keyof typeof point]) ?? [],
    })),
  }), [data?.trend]);

  const violationOption = useMemo<DashboardChartOption>(() => {
    const violations = [...(data?.violations ?? [])].sort((a, b) => a.count - b.count).slice(-7);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 118, right: 22, top: 10, bottom: 24 },
      xAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: palette.grid } } },
      yAxis: { type: 'category', data: violations.map((item) => reasonLabels[item.reasonCode] ?? item.reasonCode), axisLabel: { fontSize: 10 } },
      series: [{ type: 'bar', barWidth: 13, data: violations.map((item) => ({ value: item.count, itemStyle: { color: item.stage === 'PRE_EXECUTION' ? palette.red : palette.amber } })) }],
    };
  }, [data?.violations]);

  const heatmapOption = useMemo<DashboardChartOption>(() => {
    const lookup = new Map(data?.hourlyStatuses.map((item) => [`${item.hour}:${item.status}`, item.count]) ?? []);
    const maximum = Math.max(1, ...Array.from(lookup.values()));
    const values = heatmapStatusOrder.flatMap((status, y) => Array.from({ length: 24 }, (_, hour) => {
      const count = lookup.get(`${hour}:${status}`) ?? 0;
      const opacity = count === 0 ? 1 : Math.min(.95, .28 + (count / maximum) * .67);
      return {
        value: [hour, y, count],
        itemStyle: { color: count === 0 ? '#f1f4f7' : 'rgba(' + heatmapColors[status] + ', ' + opacity + ')' },
      };
    }));
    return {
      tooltip: { formatter: (params: unknown) => {
        const value = (params as { value: number[] }).value;
        const status = heatmapStatusOrder[value[1]];
        return `${value[0]}시 · ${statusLabels[status] ?? status}: ${value[2]}건`;
      } },
      visualMap: { show: false, min: 0, max: maximum, inRange: { color: ['#f1f4f7', '#d8e0ea'] } },
      grid: { left: 82, right: 18, top: 8, bottom: 34 },
      xAxis: { type: 'category', data: Array.from({ length: 24 }, (_, hour) => hour), splitArea: { show: true }, axisLabel: { interval: 1, fontSize: 9 } },
      yAxis: { type: 'category', data: heatmapStatusOrder.map((status) => statusLabels[status]), splitArea: { show: true }, axisLabel: { fontSize: 9 } },
      series: [{ type: 'heatmap', data: values, label: { show: false }, emphasis: { itemStyle: { shadowBlur: 6, shadowColor: 'rgba(0,0,0,.18)' } } }],
    };
  }, [data?.hourlyStatuses]);

  const actionItems = useMemo(() => {
    if (!data) return [];
    const reviewRequired = data.flow
      .filter((link) => link.target === 'FINAL_REVIEW_REQUIRED')
      .reduce((sum, link) => sum + link.count, 0);
    return [
      {
        key: 'failed', count: data.metrics.failed.current, tone: 'critical',
        title: '실행 실패 조사', reason: '외부 실행이 정상 완료되지 않았습니다.',
        action: '외부 응답과 실패 증적을 확인하세요.', path: '/audit?status=FAILED',
      },
      {
        key: 'unknown', count: data.metrics.sentUnknown.current, tone: 'warning',
        title: '미확정 상태 조정', reason: '외부 전송 결과를 확정하지 못했습니다.',
        action: '재전송 전에 외부 상태를 조회하세요.', path: '/analysis#recovery-incidents',
      },
      {
        key: 'review', count: reviewRequired, tone: 'review',
        title: '검토 필요 실행', reason: '정책 또는 실행 증적 확인이 필요합니다.',
        action: '판정과 사후 증적을 비교하세요.', path: '/analysis#review-queue',
      },
      {
        key: 'blocked', count: data.metrics.blocked.current, tone: 'blocked',
        title: '정책 차단 확인', reason: '사전 승인 조건과 요청이 일치하지 않았습니다.',
        action: '정책 판정 사유를 확인하세요.', path: '/monitoring',
      },
    ].filter((item) => item.count > 0);
  }, [data]);

  const selectRange = (next: RangeDays) => {
    setDays(next);
    setPeriod(range(next));
    setCustomOpen(false);
    setRangeError('');
  };

  const applyCustomRange = (event: FormEvent) => {
    event.preventDefault();
    const from = new Date(`${customFrom}T00:00:00`);
    const requestedTo = new Date(`${customTo}T23:59:59.999`);
    const to = requestedTo > new Date() ? new Date() : requestedTo;
    const durationDays = (requestedTo.getTime() - from.getTime()) / (24 * 60 * 60 * 1000);
    if (!customFrom || !customTo || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
      setRangeError('시작일과 종료일을 올바르게 입력하세요.');
      return;
    }
    if (durationDays > 31) {
      setRangeError('조회 기간은 최대 31일입니다.');
      return;
    }
    setRangeError('');
    setDays('custom');
    setPeriod({ from: from.toISOString(), to: to.toISOString() });
    setCustomOpen(false);
  };

  const refresh = () => {
    if (days === 'custom') {
      void overview.refetch();
      return;
    }
    setPeriod(range(days));
  };

  return (
    <div className="da-overview">
      <header className="da-overview-header">
        <div>
          <span>DIGITAL ASSET OPERATIONS</span>
          <h1>Digital Asset Overview</h1>
          <p>사전 승인 정책부터 외부 실행, 미확정 복구와 감사 증적까지 한 흐름으로 확인합니다.</p>
        </div>
        <div className="da-overview-controls" ref={customPopoverRef}>
          <span className="da-period-label"><CalendarRange size={14} />{periodLabel(period.from, period.to)}</span>
          <div className="da-range-control" aria-label="조회 기간">
            {([1, 7, 30] as RangeDays[]).map((value) => <button key={value} type="button" className={days === value ? 'active' : ''} onClick={() => selectRange(value)}>{value}D</button>)}
            <button type="button" aria-expanded={customOpen} aria-haspopup="dialog" className={days === 'custom' || customOpen ? 'active' : ''} onClick={() => setCustomOpen((open) => !open)}>직접 설정</button>
            <button type="button" aria-label="현재 기간 새로고침" onClick={refresh}><RefreshCw size={15} /></button>
          </div>
          {customOpen ? (
            <form className="da-custom-range" role="dialog" aria-label="사용자 지정 조회 기간" onSubmit={applyCustomRange}>
              <div className="da-custom-range-heading"><strong>조회 기간 직접 설정</strong><button type="button" aria-label="닫기" onClick={() => setCustomOpen(false)}><X size={15} /></button></div>
              <div className="da-custom-range-fields">
                <label><span>시작일</span><input type="date" value={customFrom} max={customTo} onChange={(event) => setCustomFrom(event.target.value)} /></label>
                <span aria-hidden="true">-</span>
                <label><span>종료일</span><input type="date" value={customTo} min={customFrom} max={dateInputValue(new Date().toISOString())} onChange={(event) => setCustomTo(event.target.value)} /></label>
              </div>
              {rangeError ? <small role="alert">{rangeError}</small> : null}
              <button className="da-custom-range-apply" type="submit">적용</button>
            </form>
          ) : null}
        </div>
      </header>

      {overview.isLoading ? <LoadingPanel label="Digital Asset 운영 현황을 불러오는 중입니다" /> : null}
      {overview.isError ? <ErrorState title="Digital Asset 운영 현황을 불러오지 못했습니다" description="현재 계정의 Institution·Workload 권한과 BE 연결 상태를 확인하세요." onRetry={() => overview.refetch()} /> : null}

      {data ? <>
        <div className="da-metric-grid">
          <MetricTile label="전체 요청" metric={data.metrics.total} icon={FileText} tone="blue" />
          <MetricTile label="정책 통과" metric={data.metrics.passed} icon={CheckCircle2} tone="green" />
          <MetricTile label="정책 차단" metric={data.metrics.blocked} icon={Ban} tone="red" adverse />
          <MetricTile label="실행 실패" metric={data.metrics.failed} icon={XCircle} tone="red" adverse />
          <MetricTile label="미확정" metric={data.metrics.sentUnknown} icon={Clock3} tone="gray" adverse />
          <MetricTile label="조정 완료" metric={data.metrics.reconciled} icon={RotateCw} tone="blue" />
        </div>

        <div className="da-dashboard-grid da-dashboard-grid-main">
          <article className="da-dashboard-panel da-flow-panel"><header><div><h2>요청 처리 흐름</h2><p>요청 → 정책 판정 → 외부 실행 → 최종 상태</p></div><StatusBadge tone="info">4 STAGES</StatusBadge></header><EChart option={sankeyOption} ariaLabel="Digital Asset 요청 처리 Sankey 차트" height={300} /></article>
          <article className="da-dashboard-panel"><header><div><h2>위반 사유</h2><p>사전 정책 위반과 사후 실행 불일치</p></div></header><EChart option={violationOption} ariaLabel="Digital Asset 위반 사유 막대 차트" height={300} /></article>
        </div>

        <div className="da-dashboard-grid da-dashboard-grid-secondary">
          <article className="da-dashboard-panel"><header><div><h2>거래 추이</h2><p>일별 요청과 최종 상태 건수</p></div></header><EChart option={trendOption} ariaLabel="Digital Asset 일별 거래 추이 선 차트" height={270} /></article>
          <article className="da-dashboard-panel"><header><div><h2>실행 상태 시간 분포</h2><p>Asia/Seoul 요청 시간 기준</p></div></header><EChart option={heatmapOption} ariaLabel="Digital Asset 실행 상태 시간대 Heatmap" height={236} /><div className="da-heatmap-legend">{heatmapStatusOrder.map((status) => <span key={status}><i style={{ background: `rgb(${heatmapColors[status]})` }} />{statusLabels[status]}</span>)}</div></article>
          <article className="da-dashboard-panel da-signal-panel"><header><div><h2>우선 확인 항목</h2><p>위험도와 최신성 기준 운영 신호</p></div><button type="button" onClick={() => navigate('/analysis')}>전체 보기</button></header><div className="da-signal-list">{data.recentSignals.map((signal) => <button key={signal.executionId} type="button" onClick={() => navigate(`/audit?executionId=${encodeURIComponent(signal.executionId)}`)}><span className={`da-signal-mark da-signal-${signal.severity.toLowerCase()}`}><AlertTriangle size={14} /></span><span><strong>{statusLabels[signal.status] ?? signal.signalType} · {signal.workloadId}</strong><small>{stageLabels[signal.stage] ?? signal.stage} · {reasonLabels[signal.reasonCode ?? ''] ?? signal.reasonCode ?? '상세 증적 확인 필요'}</small><em>{actionLabels[signal.nextAction] ?? signal.nextAction}</em></span><time>{new Date(signal.occurredAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</time></button>)}</div></article>
        </div>

        <div className="da-dashboard-grid da-dashboard-grid-data">
          <article className="da-dashboard-panel"><header><div><h2>운영 데이터 범위</h2><p>해당 기간의 Evidence 연결 현황</p></div></header><div className="da-coverage-list">{[
            ['정책 판정', data.coverage.decisionEvidence], ['사전 실행 Guard', data.coverage.preExecutionGuardEvidence],
            ['거래 실행', data.coverage.transactionEvidence], ['사후 실행 증적', data.coverage.postExecutionEvidence], ['복구 증적', data.coverage.recoveryEvidence],
          ].map(([label, value]) => <div key={String(label)}><span>{label}</span><strong>{Number(value).toLocaleString('ko-KR')}</strong><div><i style={{ width: `${data.coverage.runtimeExecutions ? Number(value) / data.coverage.runtimeExecutions * 100 : 0}%` }} /></div></div>)}</div></article>
          <article className="da-dashboard-panel da-action-panel"><header><div><h2>운영 조치 요약</h2><p>현재 기간에 관리자가 먼저 확인할 항목</p></div><StatusBadge tone={actionItems.length ? 'warning' : 'success'}>{actionItems.length ? `${actionItems.length} ACTIONS` : 'STABLE'}</StatusBadge></header><div className="da-action-list">{actionItems.length ? actionItems.map((item) => <button key={item.key} type="button" className={`da-action-${item.tone}`} onClick={() => navigate(item.path)}><span><strong>{item.title}</strong><b>{item.count.toLocaleString('ko-KR')}건</b></span><small>{item.reason}</small><em>{item.action}</em></button>) : <p>현재 조회 기간에 즉시 확인할 실패, 미확정, 검토 필요 또는 차단 실행이 없습니다.</p>}</div></article>
        </div>

        <article className="da-dashboard-panel da-recent-panel">
          <header><div><h2>최근 실행</h2><p>현재 권한 범위의 Digital Asset Runtime</p></div><button type="button" onClick={() => navigate('/audit')}>Decision Trace</button></header>
          <div className="da-table-shell"><div className="da-recent-table da-table-head"><span>요청 시각</span><span>Request ID</span><span>Workload</span><span>Policy</span><span>사전 결정</span><span>실행 상태</span><span>외부 상태</span></div>{data.recentExecutions.map((item) => <button className="da-recent-table" type="button" key={item.executionId} onClick={() => navigate(`/audit?executionId=${encodeURIComponent(item.executionId)}`)}><span>{new Date(item.requestedAt).toLocaleString('ko-KR')}</span><span><strong>{item.requestId}</strong><small>{item.executionId}</small></span><span>{item.workloadId}</span><span>{item.policyVersion ?? '—'}</span><span><StatusBadge tone={item.finalAction === 'BLOCK' ? 'danger' : item.finalAction ? 'success' : 'neutral'}>{item.finalAction ?? 'N/A'}</StatusBadge></span><span>{statusLabels[item.runtimeStatus] ?? item.runtimeStatus}</span><span>{item.recoveryStatus ?? item.connectorStatus ?? 'NOT_SENT'}</span></button>)}</div>
        </article>
      </> : null}
    </div>
  );
}
