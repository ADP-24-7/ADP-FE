import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  RotateCw,
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
};

const statusLabels: Record<string, string> = {
  REQUESTED: '전체 요청', PASS: '정책 통과', BLOCK: '정책 차단', NOT_EVALUATED: '판정 증적 없음',
  COMPLETED: '완료', BLOCKED: '차단', FAILED: '실패', EGRESSING: '미확정',
  EXTERNALLY_RECONCILED: '조정 완료', REVIEW_REQUIRED: '검토 필요', RECEIVED: '접수',
  AUTHORIZED: '인가 완료', RETRIEVED: '조회 완료', DECIDED: '판정 완료', TRANSFORMED: '변환 완료',
};

type RangeDays = 1 | 7 | 30;

function range(days: RangeDays) {
  const to = new Date();
  const from = new Date(to);
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (days - 1));
  return { from: from.toISOString(), to: to.toISOString() };
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
  const [days, setDays] = useState<RangeDays>(7);
  const [period, setPeriod] = useState(() => range(7));
  const overview = useDigitalAssetOperationsOverview(period.from, period.to);
  const data = overview.data;

  const sankeyOption = useMemo<DashboardChartOption>(() => {
    const names = Array.from(new Set(data?.flow.flatMap((item) => [item.source, item.target]) ?? []));
    return {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'sankey', left: 12, right: 92, top: 12, bottom: 12, nodeWidth: 16, nodeGap: 10,
        emphasis: { focus: 'adjacency' },
        label: { color: palette.ink, fontSize: 11, formatter: (params: { name: string }) => statusLabels[params.name] ?? params.name },
        lineStyle: { color: 'gradient', opacity: 0.28, curveness: 0.52 },
        data: names.map((name) => ({ name })),
        links: data?.flow.map((item) => ({ source: item.source, target: item.target, value: item.count })) ?? [],
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
    const statuses = ['COMPLETED', 'BLOCKED', 'FAILED', 'EGRESSING', 'EXTERNALLY_RECONCILED', 'REVIEW_REQUIRED'];
    const lookup = new Map(data?.hourlyStatuses.map((item) => [`${item.hour}:${item.status}`, item.count]) ?? []);
    const values = statuses.flatMap((status, y) => Array.from({ length: 24 }, (_, hour) => [hour, y, lookup.get(`${hour}:${status}`) ?? 0]));
    return {
      tooltip: { formatter: (params: unknown) => {
        const value = (params as { value: number[] }).value;
        return `${value[0]}시 · ${statusLabels[statuses[value[1]]] ?? statuses[value[1]]}: ${value[2]}건`;
      } },
      grid: { left: 82, right: 18, top: 8, bottom: 34 },
      xAxis: { type: 'category', data: Array.from({ length: 24 }, (_, hour) => hour), splitArea: { show: true }, axisLabel: { interval: 1, fontSize: 9 } },
      yAxis: { type: 'category', data: statuses.map((status) => statusLabels[status]), splitArea: { show: true }, axisLabel: { fontSize: 9 } },
      visualMap: { min: 0, max: Math.max(1, ...values.map((item) => Number(item[2]))), show: false, inRange: { color: ['#edf5f2', '#9bdec1', '#15915b'] } },
      series: [{ type: 'heatmap', data: values, label: { show: false }, emphasis: { itemStyle: { shadowBlur: 6, shadowColor: 'rgba(0,0,0,.18)' } } }],
    };
  }, [data?.hourlyStatuses]);

  const selectRange = (next: RangeDays) => {
    setDays(next);
    setPeriod(range(next));
  };

  return (
    <div className="da-overview">
      <header className="da-overview-header">
        <div>
          <span>DIGITAL ASSET OPERATIONS</span>
          <h1>Digital Asset Overview</h1>
          <p>사전 승인 정책부터 외부 실행, 미확정 복구와 감사 증적까지 한 흐름으로 확인합니다.</p>
        </div>
        <div className="da-range-control" aria-label="조회 기간">
          {([1, 7, 30] as RangeDays[]).map((value) => <button key={value} type="button" className={days === value ? 'active' : ''} onClick={() => selectRange(value)}>{value}D</button>)}
          <button type="button" aria-label="현재 기간 새로고침" onClick={() => setPeriod(range(days))}><RefreshCw size={15} /></button>
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
          <article className="da-dashboard-panel da-flow-panel"><header><div><h2>정책 진행 흐름</h2><p>요청 시점에 고정된 정책 판정과 현재 실행 상태의 연결</p></div><StatusBadge tone="info">CURRENT PATH</StatusBadge></header><EChart option={sankeyOption} ariaLabel="Digital Asset 정책 진행 Sankey 차트" height={300} /></article>
          <article className="da-dashboard-panel"><header><div><h2>위반 사유</h2><p>사전 정책 위반과 사후 실행 불일치</p></div></header><EChart option={violationOption} ariaLabel="Digital Asset 위반 사유 막대 차트" height={300} /></article>
        </div>

        <div className="da-dashboard-grid da-dashboard-grid-secondary">
          <article className="da-dashboard-panel"><header><div><h2>거래 추이</h2><p>일별 요청과 최종 상태 건수</p></div></header><EChart option={trendOption} ariaLabel="Digital Asset 일별 거래 추이 선 차트" height={270} /></article>
          <article className="da-dashboard-panel"><header><div><h2>실행 상태 시간 분포</h2><p>Asia/Seoul 요청 시간 기준</p></div></header><EChart option={heatmapOption} ariaLabel="Digital Asset 실행 상태 시간대 Heatmap" height={270} /></article>
          <article className="da-dashboard-panel da-signal-panel"><header><div><h2>최근 운영 신호</h2><p>조사가 필요한 최신 상태</p></div><button type="button" onClick={() => navigate('/analysis')}>전체 보기</button></header><div className="da-signal-list">{data.recentSignals.map((signal) => <button key={signal.executionId} type="button" onClick={() => navigate(`/audit?executionId=${encodeURIComponent(signal.executionId)}`)}><span className={`da-signal-mark da-signal-${signal.severity.toLowerCase()}`}><AlertTriangle size={14} /></span><span><strong>{statusLabels[signal.status] ?? signal.signalType}</strong><small>{reasonLabels[signal.reasonCode ?? ''] ?? signal.reasonCode ?? signal.executionId}</small></span><time>{new Date(signal.occurredAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</time></button>)}</div></article>
        </div>

        <div className="da-dashboard-grid da-dashboard-grid-data">
          <article className="da-dashboard-panel"><header><div><h2>운영 데이터 범위</h2><p>해당 기간의 Evidence 연결 현황</p></div></header><div className="da-coverage-list">{[
            ['정책 판정', data.coverage.decisionEvidence], ['사전 실행 Guard', data.coverage.preExecutionGuardEvidence],
            ['거래 실행', data.coverage.transactionEvidence], ['사후 실행 증적', data.coverage.postExecutionEvidence], ['복구 증적', data.coverage.recoveryEvidence],
          ].map(([label, value]) => <div key={String(label)}><span>{label}</span><strong>{Number(value).toLocaleString('ko-KR')}</strong><div><i style={{ width: `${data.coverage.runtimeExecutions ? Number(value) / data.coverage.runtimeExecutions * 100 : 0}%` }} /></div></div>)}</div></article>
          <article className="da-dashboard-panel da-unavailable-panel"><header><div><h2>자산·금액·목적지 분석</h2><p>운영 DB 최소수집 경계</p></div><StatusBadge tone="neutral">NOT COLLECTED</StatusBadge></header><p>자산 Symbol, 정확 금액, 목적지 유형은 현재 Runtime Evidence에 저장하지 않습니다. 분석용 합성 데이터와 운영 지표를 혼합하지 않으며, Privacy-safe 차원 계약이 추가되기 전에는 차트를 생성하지 않습니다.</p><div>{data.coverage.unavailableDimensions.map((item) => <code key={item}>{item}</code>)}</div></article>
        </div>

        <article className="da-dashboard-panel da-recent-panel">
          <header><div><h2>최근 실행</h2><p>현재 권한 범위의 Digital Asset Runtime</p></div><button type="button" onClick={() => navigate('/audit')}>Decision Trace</button></header>
          <div className="da-table-shell"><div className="da-recent-table da-table-head"><span>요청 시각</span><span>Request ID</span><span>Workload</span><span>Policy</span><span>사전 결정</span><span>실행 상태</span><span>외부 상태</span></div>{data.recentExecutions.map((item) => <button className="da-recent-table" type="button" key={item.executionId} onClick={() => navigate(`/audit?executionId=${encodeURIComponent(item.executionId)}`)}><span>{new Date(item.requestedAt).toLocaleString('ko-KR')}</span><span><strong>{item.requestId}</strong><small>{item.executionId}</small></span><span>{item.workloadId}</span><span>{item.policyVersion ?? '—'}</span><span><StatusBadge tone={item.finalAction === 'BLOCK' ? 'danger' : item.finalAction ? 'success' : 'neutral'}>{item.finalAction ?? 'N/A'}</StatusBadge></span><span>{statusLabels[item.runtimeStatus] ?? item.runtimeStatus}</span><span>{item.recoveryStatus ?? item.connectorStatus ?? 'NOT_SENT'}</span></button>)}</div>
        </article>
      </> : null}
    </div>
  );
}
