import { type CSSProperties, type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, Ban, Bot, CalendarRange, ChevronLeft, ChevronRight, DatabaseZap,
  RefreshCw, Search, ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ErrorState, LoadingPanel, StatusBadge } from '../../../shared/components';
import { EChart, type DashboardChartOption } from '../../digital-asset/components/EChart';
import { useAiOperationsOverview } from '../hooks/useAiOperationsOverview';
import type { OverviewMetric } from '../model/types';

const palette = {
  ink: '#162036', grid: '#e3e9f1', blue: '#2878e8', teal: '#11a7a0', green: '#1cad70',
  red: '#ec4f5f', amber: '#f2a51a', gray: '#9aa8bc', purple: '#7057d9',
};
const labels: Record<string, string> = {
  REQUESTED: '전체 요청', POLICY_TRANSFORM: '변환 적용', POLICY_ALLOW: '정책 허용', POLICY_BLOCK: '정책 차단',
  POLICY_REVIEW: '정책 검토', POLICY_NOT_EVALUATED: '판정 증적 없음', DATA_RETRIEVED: '데이터 조회',
  DATA_NOT_RECORDED: '조회 증적 없음', DATA_NOT_REQUIRED: '조회 불필요', MINIMIZATION_APPLIED: '최소화 적용',
  MINIMIZATION_NOT_RECORDED: '최소화 증적 없음', MINIMIZATION_NOT_REQUIRED: '최소화 불필요',
  PROVIDER_COMPLETED: '외부 AI 완료', PROVIDER_FAILED: '외부 AI 실패', PROVIDER_UNKNOWN: '외부 결과 미확정',
  PROVIDER_NOT_CALLED: '외부 호출 없음', RESPONSE_PASSED: '응답 검사 통과', RESPONSE_REJECTED: '응답 차단',
  RESPONSE_NOT_EVALUATED: '응답 검사 없음', RESPONSE_NOT_REQUIRED: '응답 검사 불필요', FINAL_COMPLETED: '최종 완료',
  FINAL_BLOCKED: '최종 차단', FINAL_REVIEW_REQUIRED: '최종 검토 필요', FINAL_EGRESSING: '최종 처리 중',
  FINAL_EXTERNALLY_RECONCILED: '최종 조정 완료', FINAL_FAILED: '최종 실패', COMPLETED: '완료', BLOCKED: '차단',
  REVIEW_REQUIRED: '검토 필요', EGRESSING: '처리 중', EXTERNALLY_RECONCILED: '조정 완료', FAILED: '실패',
};
const dataClassLabels: Record<string, string> = {
  CUSTOMER_IDENTIFIER: '고객 식별자', ACCOUNT_IDENTIFIER: '계좌 식별자', TRANSACTION_IDENTIFIER: '거래 식별자',
  FINANCIAL_AMOUNT: '금융 금액', BUSINESS_METADATA: '업무 메타데이터', CONTACT_INFORMATION: '연락처 정보', UNKNOWN: '분류 미확인',
  FINANCIAL_METADATA: '금융 메타데이터',
};
const signalLabels: Record<string, string> = {
  RESPONSE_REJECTED: '민감정보 응답 차단', PROVIDER_FAILED: '외부 AI 실행 실패', PROVIDER_UNKNOWN: '외부 AI 결과 미확정',
  POLICY_BLOCKED: '정책 차단', REVIEW_REQUIRED: '정책 검토 필요',
};
const actionLabels: Record<string, string> = {
  REVIEW_RESPONSE_FINDINGS: '응답 탐지 항목과 원문 반영 여부를 확인하세요.',
  INSPECT_PROVIDER_FAILURE: 'Provider 오류와 재시도 가능 여부를 확인하세요.',
  VERIFY_PROVIDER_STATUS: '재호출 전에 Provider 처리 상태를 확인하세요.',
  REVIEW_POLICY_DECISION: '정책 판정 사유와 승인 범위를 검토하세요.',
};
const stageLabels: Record<string, string> = { RESPONSE_GUARD: '응답 보호', EXTERNAL_AI: '외부 AI', POLICY_DECISION: '정책 판정' };
const flowStages = ['업무', '요청', '정책 판정', '데이터 조회', '최소화', '외부 AI', '응답 보호', '최종 처리'];
const violationTypes = ['VALUE_MISMATCH', 'DESTINATION_MISMATCH', 'DATA_SCOPE', 'PURPOSE_SCOPE', 'POLICY_CONTROL', 'OTHER'];
const violationLabels: Record<string, string> = {
  VALUE_MISMATCH: '금액·수치 불일치', DESTINATION_MISMATCH: '목적지 불일치', DATA_SCOPE: '데이터 범위 초과',
  PURPOSE_SCOPE: '목적·보유 범위', POLICY_CONTROL: '정책·승인 통제', OTHER: '기타',
};
const violationColors: Record<string, string> = {
  VALUE_MISMATCH: '#08786f', DESTINATION_MISMATCH: '#f2b744', DATA_SCOPE: '#20a8b5',
  PURPOSE_SCOPE: '#7057d9', POLICY_CONTROL: '#ec4f5f', OTHER: '#9aa8bc',
};
const heatmapStatuses = ['COMPLETED', 'BLOCKED', 'FAILED', 'EGRESSING', 'REVIEW_REQUIRED'];
const heatmapColors: Record<string, string> = {
  COMPLETED: '28, 173, 112', BLOCKED: '236, 79, 95', FAILED: '190, 43, 58',
  EGRESSING: '40, 120, 232', REVIEW_REQUIRED: '112, 87, 217',
};

type RangeDays = 1 | 7 | 30;
type SelectedRange = RangeDays | 'custom';

function range(days: RangeDays) {
  const to = new Date();
  const from = new Date(to);
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - days + 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

function inputDate(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function periodLabel(from: string, to: string) {
  const format = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  return `${format.format(new Date(from))} - ${format.format(new Date(to))}`;
}

function flowColor(name: string) {
  if (name.startsWith('WORKLOAD_')) return '#36a9c0';
  if (name.includes('REJECTED') || name.includes('BLOCK') || name.includes('FAILED')) return palette.red;
  if (name.includes('REVIEW')) return palette.purple;
  if (name.includes('UNKNOWN') || name.includes('NOT_RECORDED') || name.includes('NOT_EVALUATED')) return palette.amber;
  if (name.includes('MINIMIZATION') || name.includes('TRANSFORM')) return palette.teal;
  if (name.includes('COMPLETED') || name.includes('PASSED') || name.includes('ALLOW')) return palette.green;
  if (name.includes('NOT_REQUIRED') || name.includes('NOT_CALLED')) return palette.gray;
  return palette.blue;
}

function statusTone(status?: string | null) {
  if (['COMPLETED', 'PASSED', 'ALLOW', 'TRANSFORM', 'ACKNOWLEDGED'].includes(status ?? '')) return 'success' as const;
  if (['BLOCKED', 'FAILED', 'REJECTED', 'BLOCK'].includes(status ?? '')) return 'danger' as const;
  if (['REVIEW_REQUIRED', 'REVIEW'].includes(status ?? '')) return 'info' as const;
  if (['EGRESSING', 'SENT_UNKNOWN'].includes(status ?? '')) return 'warning' as const;
  return 'neutral' as const;
}

function sparklinePoints(values: number[]) {
  if (!values.length) return '';
  const min = Math.min(...values); const span = Math.max(1, Math.max(...values) - min);
  return values.map((value, index) => `${values.length === 1 ? 60 : index / (values.length - 1) * 120},${22 - (value - min) / span * 18}`).join(' ');
}

function workloadLabel(value: string) {
  const displayNames: Record<string, string> = {
    customer_summary: '고객상담', document_analysis: '문서분석', research_assistant: '리서치',
    marketing_content: '마케팅', code_generation: '코드생성', internal_knowledge: '내부지식',
  };
  if (displayNames[value]) return displayNames[value];
  return value.split(/[-_]/).map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(' ');
}

function MetricTile({ label, metric, icon: Icon, tone, adverse, series }: {
  label: string; metric?: OverviewMetric; icon: typeof Bot; tone: string; adverse?: boolean; series: number[];
}) {
  const change = metric?.changePercent;
  const favorable = change != null && (adverse ? change < 0 : change > 0);
  const unfavorable = change != null && (adverse ? change > 0 : change < 0);
  const points = sparklinePoints(series);
  return <article className={`da-metric-tile da-tone-${tone}`}>
    <header><span>{label}</span><span className="da-metric-icon"><Icon size={18} /></span></header>
    <div><strong>{metric?.current.toLocaleString('ko-KR') ?? '—'}</strong><small className={favorable ? 'da-change-favorable' : unfavorable ? 'da-change-adverse' : 'da-change-neutral'}>{change == null ? '비교 없음' : `${change > 0 ? '+' : ''}${change}%`}</small></div>
    <span className="da-metric-baseline">이전 기간 {metric?.previous.toLocaleString('ko-KR') ?? '—'}건</span>
    {points ? <svg className="da-metric-sparkline" viewBox="0 0 120 24" preserveAspectRatio="none" aria-hidden="true"><polygon points={`0,24 ${points} 120,24`} /><polyline points={points} /></svg> : null}
  </article>;
}

export function AiOperationsOverviewDashboard() {
  const navigate = useNavigate();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<SelectedRange>(7);
  const [period, setPeriod] = useState(() => range(7));
  const [customOpen, setCustomOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(() => inputDate(range(7).from));
  const [customTo, setCustomTo] = useState(() => inputDate(range(7).to));
  const [rangeError, setRangeError] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const overview = useAiOperationsOverview(period.from, period.to, search, status, page);
  const data = overview.data;

  useEffect(() => {
    if (!customOpen) return;
    const outside = (event: PointerEvent) => { if (!popoverRef.current?.contains(event.target as Node)) setCustomOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setCustomOpen(false); };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [customOpen]);

  const sankey = useMemo<DashboardChartOption>(() => {
    const links = data?.flow ?? [];
    const names = Array.from(new Set(links.flatMap((link) => [link.source, link.target])));
    const incoming = new Map<string, number>(); const outgoing = new Map<string, number>();
    links.forEach((link) => {
      incoming.set(link.target, (incoming.get(link.target) ?? 0) + link.count);
      outgoing.set(link.source, (outgoing.get(link.source) ?? 0) + link.count);
    });
    const nodeTotal = (name: string) => Math.max(incoming.get(name) ?? 0, outgoing.get(name) ?? 0);
    const nodeLabel = (name: string) => name.startsWith('WORKLOAD_') ? workloadLabel(name.slice(9)) : labels[name] ?? name;
    return { tooltip: { trigger: 'item' }, series: [{
      type: 'sankey', left: 12, right: 120, top: 14, bottom: 12, nodeWidth: 15, nodeGap: 8,
      emphasis: { focus: 'adjacency' }, lineStyle: { color: 'gradient', opacity: .3, curveness: .5 },
      label: { color: palette.ink, fontSize: 9, formatter: (raw: unknown) => { const item = raw as { name: string }; return `${nodeLabel(item.name)} ${nodeTotal(item.name).toLocaleString('ko-KR')}건`; } },
      data: names.map((name) => ({ name, itemStyle: { color: flowColor(name) } })),
      links: links.map((link) => ({ source: link.source, target: link.target, value: link.count })),
    }] };
  }, [data]);

  const violationAnalysis = useMemo<DashboardChartOption>(() => {
    const lookup = new Map(data?.workloadViolations.map((item) => [`${item.workloadId}:${item.violationType}`, item.count]) ?? []);
    const workloads = Array.from(new Set(data?.workloadViolations.map((item) => item.workloadId) ?? []))
      .sort((left, right) => violationTypes.reduce((sum, type) => sum + (lookup.get(`${right}:${type}`) ?? 0) - (lookup.get(`${left}:${type}`) ?? 0), 0));
    const totals = workloads.map((workload) => violationTypes.reduce((sum, type) => sum + (lookup.get(`${workload}:${type}`) ?? 0), 0));
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { top: 2, textStyle: { fontSize: 8 }, itemWidth: 10, itemHeight: 8 },
      grid: { left: 72, right: 46, top: 42, bottom: 20 },
      xAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: palette.grid } } },
      yAxis: { type: 'category', inverse: true, data: workloads.map(workloadLabel), axisLabel: { fontSize: 9 } },
      series: violationTypes.map((type, index) => ({
        name: violationLabels[type], type: 'bar', stack: 'violations', barWidth: 16,
        data: workloads.map((workload) => lookup.get(`${workload}:${type}`) ?? 0),
        itemStyle: { color: violationColors[type], borderRadius: index === violationTypes.length - 1 ? [0, 2, 2, 0] : 0 },
        label: index === violationTypes.length - 1 ? { show: true, position: 'right', fontSize: 8, color: palette.ink, formatter: (raw: unknown) => `${totals[(raw as { dataIndex: number }).dataIndex]}건` } : undefined,
      })),
    };
  }, [data?.workloadViolations]);

  const workloadOutcome = useMemo<DashboardChartOption>(() => {
    const outcomes = data?.workloadOutcomes ?? [];
    const categories = outcomes.map((item) => workloadLabel(item.workloadId));
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
      legend: { top: 2, data: ['정책 허용', '최종 완료'], textStyle: { fontSize: 9 }, itemWidth: 10, itemHeight: 8 },
      grid: { left: 72, right: 32, top: 42, bottom: 20 },
      xAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: palette.grid } } },
      yAxis: { type: 'category', inverse: true, data: categories, axisLabel: { fontSize: 9 } },
      series: [
        { name: '기준점', type: 'bar', stack: 'connector', silent: true, barWidth: 2, data: outcomes.map((item) => Math.min(item.policyAllowed, item.finalCompleted)), itemStyle: { color: 'transparent' }, tooltip: { show: false } },
        { name: '완료 차이', type: 'bar', stack: 'connector', silent: true, barWidth: 2, data: outcomes.map((item) => Math.abs(item.policyAllowed - item.finalCompleted)), itemStyle: { color: '#73b9b5' }, tooltip: { show: false } },
        { name: '정책 허용', type: 'scatter', symbolSize: 9, data: outcomes.map((item, index) => [item.policyAllowed, index]), itemStyle: { color: palette.green } },
        { name: '최종 완료', type: 'scatter', symbolSize: 9, data: outcomes.map((item, index) => [item.finalCompleted, index]), itemStyle: { color: '#0c6674' }, label: { show: true, position: 'right', fontSize: 8, color: palette.ink, formatter: (raw: unknown) => `${(raw as { value: number[] }).value[0]}건` } },
      ],
    };
  }, [data?.workloadOutcomes]);

  const heatmap = useMemo<DashboardChartOption>(() => {
    const lookup = new Map(data?.hourlyStatuses.map((item) => [`${item.hour}:${item.status}`, item.count]) ?? []);
    return {
      tooltip: { formatter: (raw: unknown) => { const value = (raw as { value: number[] }).value; return `${value[0]}시 · ${labels[heatmapStatuses[value[1]]] ?? heatmapStatuses[value[1]]}: ${value[2]}건`; } },
      visualMap: heatmapStatuses.map((item, index) => ({ show: false, seriesIndex: index, min: 0, max: Math.max(1, ...Array.from({ length: 24 }, (_, hour) => lookup.get(`${hour}:${item}`) ?? 0)), dimension: 2, inRange: { color: [`rgba(${heatmapColors[item]}, .1)`, `rgb(${heatmapColors[item]})`] } })),
      grid: { left: 70, right: 12, top: 8, bottom: 30 }, xAxis: { type: 'category', data: Array.from({ length: 24 }, (_, hour) => hour), axisLabel: { interval: 1, fontSize: 8 }, splitArea: { show: true } },
      yAxis: { type: 'category', data: heatmapStatuses.map((item) => labels[item]), axisLabel: { fontSize: 8 } },
      series: heatmapStatuses.map((item, y) => ({ name: labels[item], type: 'heatmap', data: Array.from({ length: 24 }, (_, hour) => [hour, y, lookup.get(`${hour}:${item}`) ?? 0]), itemStyle: { borderColor: '#fff', borderWidth: 1 } })),
    };
  }, [data?.hourlyStatuses]);

  const selectRange = (value: RangeDays) => { setDays(value); setPeriod(range(value)); setCustomOpen(false); setPage(0); };
  const applyRange = (event: FormEvent) => {
    event.preventDefault(); const from = new Date(`${customFrom}T00:00:00`); const to = new Date(`${customTo}T23:59:59.999`);
    if (from > to) { setRangeError('시작일은 종료일보다 늦을 수 없습니다.'); return; }
    if ((to.getTime() - from.getTime()) / 86_400_000 > 31) { setRangeError('조회 기간은 최대 31일입니다.'); return; }
    setRangeError(''); setDays('custom'); setPeriod({ from: from.toISOString(), to: to.toISOString() }); setCustomOpen(false); setPage(0);
  };
  const auditPath = (executionId: string, section = 'decision') => `/audit?executionId=${encodeURIComponent(executionId)}&section=${section}`;
  const controls = data ? [
    ['AI-01', '정책 판정', data.coverage.policyDecisions],
    ['AI-02', '데이터 접근', data.coverage.dataAccessEvents],
    ['AI-03', '데이터 최소화', data.coverage.transformEvidence],
    ['AI-04', '외부 전달', data.coverage.outboundEvidence],
    ['AI-05', '모델 실행', data.coverage.modelEvidence],
    ['AI-06', '응답 보호', data.coverage.responseGuardEvidence],
  ] as const : [];
  const actionItems = data ? [
    { key: 'response', title: '민감정보 응답 차단', count: data.actionSummary.responseRejected, tone: 'critical', reason: '응답 보호 단계에서 민감정보 노출 가능성이 탐지되었습니다.', action: '탐지 필드와 반환 차단 결과를 확인하세요.', path: '/audit?section=response-guard' },
    { key: 'provider-failed', title: '외부 AI 실행 실패', count: data.actionSummary.providerFailures, tone: 'critical', reason: 'Provider 호출이 정상적으로 완료되지 않았습니다.', action: '오류 원인과 재시도 가능 여부를 확인하세요.', path: '/audit?section=post-execution' },
    { key: 'provider-unknown', title: '외부 결과 미확정', count: data.actionSummary.providerUnknown, tone: 'warning', reason: '외부 전송 이후 최종 상태가 확정되지 않았습니다.', action: '재호출 전에 Provider 처리 상태를 확인하세요.', path: '/audit?section=post-execution' },
    { key: 'review', title: '정책 검토 필요', count: data.actionSummary.reviewRequired, tone: 'review', reason: '정책 판정 또는 실행 증적에 운영자 판단이 필요합니다.', action: '판정 사유와 적용 범위를 검토하세요.', path: '/audit?section=decision' },
    { key: 'blocked', title: '정책 차단 확인', count: data.actionSummary.policyBlocked, tone: 'blocked', reason: '사전 정책 조건과 요청 범위가 일치하지 않았습니다.', action: '정책 판정 사유를 확인하세요.', path: '/audit?section=decision' },
  ].filter((item) => item.count > 0) : [];
  const protectedDataClasses = data?.dataClassControls.filter((item) => item.protectionRequired) ?? [];
  const protectedFieldTotal = protectedDataClasses.reduce((sum, item) => sum + item.transformedFields + item.retainedFields, 0);
  const protectedTransformedFieldTotal = protectedDataClasses.reduce((sum, item) => sum + item.transformedFields, 0);
  const protectedFieldTransformationRate = protectedFieldTotal ? protectedTransformedFieldTotal / protectedFieldTotal * 100 : 0;
  const maxDataClassFields = Math.max(1, ...(data?.dataClassControls.map((item) => item.transformedFields + item.retainedFields) ?? []));
  const policyCoverageTotal = data?.policyCoverage.reduce((sum, item) => sum + item.total, 0) ?? 0;
  const policyCoverageTotals = data?.policyCoverage.reduce((sum, item) => ({ normal: sum.normal + item.normal, review: sum.review + item.review, blocked: sum.blocked + item.blocked }), { normal: 0, review: 0, blocked: 0 }) ?? { normal: 0, review: 0, blocked: 0 };

  return <div className="da-overview ai-overview">
    <header className="da-overview-header"><div><span>AI CONTROL OPERATIONS</span><h1>AI Operations Overview</h1><p>정책 판정부터 데이터 최소화, 외부 AI 실행과 응답 보호까지 운영 증적을 추적합니다.</p></div><div className="da-overview-controls" ref={popoverRef}><span className="da-period-label"><CalendarRange size={14} />{periodLabel(period.from, period.to)}</span><div className="da-range-control">{([1, 7, 30] as RangeDays[]).map((value) => <button key={value} type="button" className={days === value ? 'active' : ''} onClick={() => selectRange(value)}>{value}D</button>)}<button type="button" className={days === 'custom' || customOpen ? 'active' : ''} onClick={() => setCustomOpen((open) => !open)}>직접 설정</button><button type="button" aria-label="현재 기간 새로고침" onClick={() => days === 'custom' ? void overview.refetch() : setPeriod(range(days))}><RefreshCw size={15} /></button></div>{customOpen ? <form className="da-custom-range" role="dialog" aria-label="사용자 지정 조회 기간" onSubmit={applyRange}><div className="da-custom-range-heading"><strong>조회 기간 직접 설정</strong><button type="button" aria-label="닫기" onClick={() => setCustomOpen(false)}><X size={15} /></button></div><div className="da-custom-range-fields"><label><span>시작일</span><input type="date" value={customFrom} max={customTo} onChange={(event) => setCustomFrom(event.target.value)} /></label><span>-</span><label><span>종료일</span><input type="date" value={customTo} min={customFrom} max={inputDate(new Date().toISOString())} onChange={(event) => setCustomTo(event.target.value)} /></label></div>{rangeError ? <small role="alert">{rangeError}</small> : null}<button className="da-custom-range-apply" type="submit">적용</button></form> : null}</div></header>
    {overview.isLoading ? <LoadingPanel label="AI 운영 현황을 불러오는 중입니다" /> : null}
    {overview.isError ? <ErrorState title="AI 운영 현황을 불러오지 못했습니다" description="현재 계정의 Institution·Workload 권한과 BE 연결 상태를 확인하세요." onRetry={() => overview.refetch()} /> : null}
    {data ? <>
      <div className="da-metric-grid"><MetricTile label="전체 요청" metric={data.metrics.total} icon={DatabaseZap} tone="blue" series={data.trend.map((item) => item.total)} /><MetricTile label="최소화 적용" metric={data.metrics.minimized} icon={Sparkles} tone="teal" series={data.trend.map((item) => item.minimized)} /><MetricTile label="외부 AI 실행" metric={data.metrics.externalCalls} icon={Bot} tone="green" series={data.trend.map((item) => item.externalCalls)} /><MetricTile label="정책 차단" metric={data.metrics.blocked} icon={Ban} tone="red" adverse series={data.trend.map((item) => item.blocked)} /><MetricTile label="검토 필요" metric={data.metrics.reviewRequired} icon={AlertTriangle} tone="purple" adverse series={data.trend.map((item) => item.reviewRequired)} /><MetricTile label="응답 차단" metric={data.metrics.responseRejected} icon={XCircle} tone="red" adverse series={data.trend.map((item) => item.responseRejected)} /></div>
      <div className="ai-rate-strip">{[['정책 증적 연결률', data.rates.policyCoverage], ['외부 실행 증적률', data.rates.evidenceCoverage], ['안전 응답 통과율', data.rates.responseSafe]].map(([label, metric]) => { const value = typeof metric === 'object' ? metric.current : 0; const delta = typeof metric === 'object' ? metric.changePoint : null; return <div key={String(label)}><span>{String(label)}</span><strong>{value.toFixed(1)}%</strong><small className={delta == null ? 'da-change-neutral' : delta >= 0 ? 'da-change-favorable' : 'da-change-adverse'}>{delta == null ? '비교 없음' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%p`}</small><i><b style={{ width: `${Math.min(100, value)}%` }} /></i></div>; })}</div>
      <article className="da-dashboard-panel da-flow-panel"><header><div><h2>AI 통제 운영 흐름</h2><p>업무별 요청이 정책 판정부터 최종 처리까지 이동한 실제 Runtime 경로입니다.</p></div><StatusBadge tone="info">8 STAGES</StatusBadge></header><div className="da-flow-stage-strip ai-flow-stage-strip">{flowStages.map((stage, index) => <div key={stage}><span>{stage}</span>{index < flowStages.length - 1 ? <i /> : null}</div>)}</div><EChart option={sankey} ariaLabel="업무별 AI 8단계 통제 운영 Sankey 차트" height={390} /></article>
      <div className="da-dashboard-grid ai-minimization-grid">
        <article className="da-dashboard-panel ai-minimization-panel"><header><div><h2>데이터 최소화 효과</h2><p>외부 AI 전달 전 데이터 클래스별 원본 필드와 변환·마스킹 결과를 비교합니다.</p></div></header><div className="ai-butterfly-head"><span>원본 데이터 필드</span><span>변환율</span><span>원문 유지 필드</span></div><div className="ai-butterfly">{data.dataClassControls.slice(0, 7).map((item) => { const total = item.transformedFields + item.retainedFields; const rate = total ? item.transformedFields / total * 100 : 0; return <div key={item.dataClass}><strong>{dataClassLabels[item.dataClass] ?? item.dataClass}</strong><span className="ai-butterfly-left"><b>{total.toLocaleString('ko-KR')}</b><i style={{ width: `${total / maxDataClassFields * 100}%` }} /></span><em>{rate > 0 ? `-${rate.toFixed(1)}%` : '0.0%'}</em><span className="ai-butterfly-right"><i style={{ width: `${item.retainedFields / maxDataClassFields * 100}%` }} /><b>{item.retainedFields.toLocaleString('ko-KR')}</b></span>{item.responseFindings > 0 ? <small>응답 탐지 {item.responseFindings.toLocaleString('ko-KR')}건</small> : null}</div>; })}{!data.dataClassControls.length ? <p>조회 기간에 데이터 최소화 필드 증적이 없습니다.</p> : null}</div></article>
        <article className="da-dashboard-panel ai-minimization-summary"><header><div><h2>보호 대상 필드 변환율</h2><p>보호 대상 중 원문 유지 없이 변환·마스킹된 필드 비율</p></div></header><div className="ai-minimization-donut" style={{ '--ai-minimization-rate': `${protectedFieldTransformationRate * 3.6}deg` } as CSSProperties}><div><strong>{protectedFieldTransformationRate.toFixed(1)}%</strong><span>보호 적용</span></div></div><p>변환 <strong>{protectedTransformedFieldTotal.toLocaleString('ko-KR')}</strong> / 보호 대상 <strong>{protectedFieldTotal.toLocaleString('ko-KR')}</strong> 필드</p><div className="ai-minimization-note"><ShieldCheck size={17} /><span>식별자·금융 데이터와 분류 미확인 필드를 보호 대상으로 집계합니다.</span></div></article>
        <article className="da-dashboard-panel da-control-panel"><header><div><h2>통제 검증 현황</h2><p>기간 내 AI Runtime 실행과 연결된 통제·증적입니다.</p></div><StatusBadge tone={controls.every((item) => item[2] > 0) ? 'success' : 'warning'}>{controls.every((item) => item[2] > 0) ? '전체 정상' : '확인 필요'}</StatusBadge></header><div className="da-control-list">{controls.map(([code, label, count]) => { const connected = count > 0; return <div key={code}><code>{code}</code><span className="da-control-icon"><ShieldCheck size={15} /></span><span><strong>{label}</strong><small>근거 연결 {count.toLocaleString('ko-KR')}건</small></span><StatusBadge tone={connected ? 'success' : 'warning'}>{connected ? '정상' : '확인 필요'}</StatusBadge></div>; })}</div></article>
      </div>
      <div className="da-dashboard-grid ai-workload-analysis-grid"><article className="da-dashboard-panel"><header><div><h2>위반 유형 분석 (업무별)</h2><p>정책 차단·검토 실행의 대표 판정 사유를 업무별로 비교합니다.</p></div></header><EChart option={violationAnalysis} ariaLabel="업무별 AI 정책 위반 유형 누적 막대 차트" height={265} /></article><article className="da-dashboard-panel"><header><div><h2>정책 허용 vs 최종 완료</h2><p>업무별 허용 요청 중 실행·응답 통제를 통과한 결과를 비교합니다.</p></div></header><EChart option={workloadOutcome} ariaLabel="업무별 정책 허용과 최종 완료 Dumbbell 차트" height={265} /></article></div>
      <div className="da-dashboard-grid ai-dashboard-grid-analytics"><article className="da-dashboard-panel ai-policy-coverage-panel"><header><div><h2>정책 커버리지 현황 (Marimekko)</h2><p>Workload별 정책 처리 비중을 동일한 폭으로 비교합니다.</p></div></header><div className="ai-policy-coverage"><div className="ai-policy-scale"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="ai-policy-bars">{data.policyCoverage.slice(0, 7).map((item) => <div key={item.workloadId} title={`${workloadLabel(item.workloadId)} · 전체 ${item.total.toLocaleString('ko-KR')}건`}><div className="ai-policy-stack"><i className="ai-policy-blocked" style={{ height: `${item.blocked / Math.max(1, item.total) * 100}%` }}><span>{item.blocked ? item.blocked : ''}</span></i><i className="ai-policy-review" style={{ height: `${item.review / Math.max(1, item.total) * 100}%` }}><span>{item.review ? item.review : ''}</span></i><i className="ai-policy-normal" style={{ height: `${item.normal / Math.max(1, item.total) * 100}%` }}><span>{item.normal ? item.normal : ''}</span></i></div><strong>{workloadLabel(item.workloadId)}</strong><small>{item.total.toLocaleString('ko-KR')}건</small></div>)}{!data.policyCoverage.length ? <p>조회 기간에 정책 처리 데이터가 없습니다.</p> : null}</div><div className="ai-policy-summary">{[['정상 처리', policyCoverageTotals.normal, 'normal'], ['검토·처리 중', policyCoverageTotals.review, 'review'], ['차단·실패', policyCoverageTotals.blocked, 'blocked']].map(([label, count, tone]) => <div key={String(label)}><i className={`ai-policy-${tone}`} /><span>{String(label)}</span><strong>{policyCoverageTotal ? (Number(count) / policyCoverageTotal * 100).toFixed(1) : '0.0'}%</strong></div>)}</div></div></article><article className="da-dashboard-panel ai-hourly-panel"><header><div><h2>시간대별 실행 상태</h2><p>Asia/Seoul 기준 · 진할수록 실행이 많습니다.</p></div></header><EChart option={heatmap} ariaLabel="AI 시간대별 실행 상태" height={236} /><div className="da-heatmap-legend">{heatmapStatuses.map((item) => <span key={item}><i style={{ background: `rgb(${heatmapColors[item]})` }} />{labels[item]}</span>)}</div></article><article className="da-dashboard-panel ai-signal-panel"><header><div><h2>우선 확인 항목</h2><p>위험도와 최신성 기준 운영 신호</p></div><button type="button" onClick={() => navigate('/audit')}>전체 Trace</button></header><div className="da-signal-list">{data.recentSignals.map((signal) => <button key={`${signal.executionId}-${signal.signalType}`} type="button" onClick={() => navigate(auditPath(signal.executionId, signal.stage === 'RESPONSE_GUARD' ? 'response-guard' : signal.stage === 'EXTERNAL_AI' ? 'post-execution' : 'decision'))}><span className={`da-signal-mark da-signal-${signal.severity.toLowerCase()}`}><AlertTriangle size={14} /></span><span><strong>{signalLabels[signal.signalType] ?? signal.signalType} · {workloadLabel(signal.workloadId)}</strong><small>{stageLabels[signal.stage] ?? signal.stage} · {signal.reasonCode ?? '상세 사유 확인 필요'}</small><em>{actionLabels[signal.nextAction] ?? signal.nextAction}</em></span><time>{new Date(signal.occurredAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</time></button>)}{!data.recentSignals.length ? <div className="da-execution-empty">현재 조회 기간에 우선 확인할 AI 운영 신호가 없습니다.</div> : null}</div></article></div>
      <article className="da-dashboard-panel da-action-panel"><header><div><h2>운영 조치 요약</h2><p>현재 기간에 관리자가 먼저 확인할 AI 통제 항목</p></div><StatusBadge tone={actionItems.length ? 'warning' : 'success'}>{actionItems.length ? `${actionItems.length} ACTIONS` : 'STABLE'}</StatusBadge></header><div className="da-action-list ai-action-list">{actionItems.length ? actionItems.map((item) => <button key={item.key} type="button" className={`da-action-${item.tone}`} onClick={() => navigate(item.path)}><span><strong>{item.title}</strong><b>{item.count.toLocaleString('ko-KR')}건</b></span><small>{item.reason}</small><em>{item.action}</em></button>) : <p>현재 조회 기간에 즉시 확인할 외부 실행 오류, 미확정, 검토 또는 차단 항목이 없습니다.</p>}</div></article>
      <article className="da-dashboard-panel da-recent-panel"><header><div><h2>최근 AI 실행</h2><p>관리 판단에 필요한 정책, 외부 모델, 응답 통제 상태만 표시합니다.</p></div><button type="button" onClick={() => navigate('/audit')}>Decision Trace</button></header><form className="da-execution-filters" onSubmit={(event) => { event.preventDefault(); setSearch(searchDraft.trim()); setPage(0); }}><label><Search size={14} /><input aria-label="최근 AI 실행 검색" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Request ID, Execution ID, Workload 검색" /></label><select aria-label="AI 실행 상태 필터" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}><option value="">전체 상태</option><option value="COMPLETED">완료</option><option value="BLOCKED">차단</option><option value="REVIEW_REQUIRED">검토 필요</option><option value="EGRESSING">처리 중</option><option value="FAILED">실패</option></select><button type="submit"><Search size={14} />검색</button></form><div className="da-table-shell"><div className="da-recent-table ai-recent-table da-table-head"><span>요청</span><span>Workload</span><span>정책 결정</span><span>외부 AI</span><span>응답 통제</span><span>지연시간</span><span>작업</span></div>{data.recentExecutions.items.map((item) => <button className="da-recent-table ai-recent-table" type="button" key={item.executionId} onClick={() => navigate(auditPath(item.executionId, item.responseGuardStatus === 'REJECTED' ? 'response-guard' : 'decision'))}><span><strong>{item.requestId}</strong><small>{new Date(item.requestedAt).toLocaleString('ko-KR')} · {item.executionId}</small></span><span>{item.workloadId}</span><span><StatusBadge tone={statusTone(item.finalAction)}>{item.finalAction ?? 'N/A'}</StatusBadge><small>{item.policyVersion ?? '정책 증적 없음'}</small></span><span><StatusBadge tone={statusTone(item.providerStatus)}>{item.providerStatus ?? 'NOT_CALLED'}</StatusBadge><small>{item.providerModelId ?? '모델 증적 없음'}</small></span><span><StatusBadge tone={statusTone(item.responseGuardStatus)}>{item.responseGuardStatus ?? 'NOT_EVALUATED'}</StatusBadge><small>{item.reasonCodes ?? '탐지 사유 없음'}</small></span><span>{item.latencyMs == null ? '—' : `${item.latencyMs.toLocaleString('ko-KR')}ms`}</span><span className="da-trace-link">Trace 확인</span></button>)}{!data.recentExecutions.items.length ? <div className="da-execution-empty">조건에 맞는 AI 실행이 없습니다.</div> : null}</div><footer className="da-execution-pagination"><span>총 {data.recentExecutions.totalElements.toLocaleString('ko-KR')}건 · {data.recentExecutions.page + 1} / {Math.max(1, data.recentExecutions.totalPages)} 페이지</span><div><button type="button" aria-label="이전 페이지" disabled={data.recentExecutions.page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}><ChevronLeft size={15} /></button><button type="button" aria-label="다음 페이지" disabled={data.recentExecutions.page + 1 >= data.recentExecutions.totalPages} onClick={() => setPage((value) => value + 1)}><ChevronRight size={15} /></button></div></footer></article>
    </> : null}
  </div>;
}
