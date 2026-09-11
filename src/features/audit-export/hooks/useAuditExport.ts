import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAuditExport, decideAuditExport, downloadAuditExport, getAuditExport,
  getAuditExportWork, getAuditExportWorkSummary,
} from '../api/auditExportApi';
import type { AuditExportWorkView, CreateAuditExportRequest } from '../model/types';

export const auditExportWorkKeys = {
  all: ['audit-export-work'] as const,
  summary: () => [...auditExportWorkKeys.all, 'summary'] as const,
  list: (view: AuditExportWorkView, page: number, size: number) =>
    [...auditExportWorkKeys.all, 'list', view, page, size] as const,
};

export function useAuditExportWorkSummary(enabled = true) {
  return useQuery({
    queryKey: auditExportWorkKeys.summary(),
    queryFn: getAuditExportWorkSummary,
    enabled,
    retry: false,
    refetchInterval: 30_000,
  });
}

export function useAuditExportWork(view: AuditExportWorkView, page = 0, size = 20, enabled = true) {
  return useQuery({
    queryKey: auditExportWorkKeys.list(view, page, size),
    queryFn: () => getAuditExportWork(view, page, size),
    enabled,
    retry: false,
  });
}

export function useAuditExport(exportId: string, enabled = true) {
  return useQuery({
    queryKey: ['audit-export', exportId],
    queryFn: () => getAuditExport(exportId),
    enabled: enabled && exportId.length > 0,
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.job.status;
      return status === 'APPROVED' || status === 'GENERATING' ? 1_500 : false;
    },
  });
}

export function useCreateAuditExport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateAuditExportRequest) => createAuditExport(request),
    onSuccess: (job) => {
      queryClient.setQueryData(['audit-export', job.exportId], { job, events: [] });
      queryClient.invalidateQueries({ queryKey: auditExportWorkKeys.all });
    },
  });
}

export function useDecideAuditExport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ exportId, action, reason }: { exportId: string; action: 'APPROVE' | 'REJECT' | 'REVOKE'; reason: string }) =>
      decideAuditExport(exportId, action, reason),
    onSuccess: (_job, variables) => {
      queryClient.invalidateQueries({ queryKey: ['audit-export', variables.exportId] });
      queryClient.invalidateQueries({ queryKey: auditExportWorkKeys.all });
    },
  });
}

export function useDownloadAuditExport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: downloadAuditExport,
    onSuccess: (_result, exportId) => {
      queryClient.invalidateQueries({ queryKey: ['audit-export', exportId] });
      queryClient.invalidateQueries({ queryKey: auditExportWorkKeys.all });
    },
  });
}
