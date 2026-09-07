import { httpClient } from '../../../shared/api/httpClient';
import type { ContextPreviewRequest, ContextPreviewResponse } from '../model/types';

export async function previewRuntimeContext(request: ContextPreviewRequest) {
  const response = await httpClient.post<ContextPreviewResponse>('/api/runtime/context/preview', request);
  return response.data;
}
