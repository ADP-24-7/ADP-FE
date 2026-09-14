const workloadNames: Record<string, string> = {
  customer_summary: '고객상담',
  document_analysis: '문서분석',
  research_assistant: '리서치',
  marketing_content: '마케팅 콘텐츠',
  code_generation: '코드 생성',
  internal_knowledge: '내부 지식 조회',
  tokenized_asset_purchase: '디지털 자산 구매',
};

export function workloadDisplayName(workloadId: string) {
  return workloadNames[workloadId] ?? workloadId;
}
