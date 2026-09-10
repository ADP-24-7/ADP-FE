import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAuditExport, decideAuditExport, downloadAuditExport, getAuditExport } from '../api/auditExportApi';
import type { CreateAuditExportRequest } from '../model/types';

export function useAuditExport(exportId: string) {
  return useQuery({
    queryKey: ['audit-export', exportId],
    queryFn: () => getAuditExport(exportId),
    enabled: exportId.length > 0,
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
    onSuccess: (job) => queryClient.setQueryData(['audit-export', job.exportId], { job, events: [] }),
  });
}

export function useDecideAuditExport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ exportId, action, reason }: { exportId: string; action: 'APPROVE' | 'REJECT' | 'REVOKE'; reason: string }) =>
      decideAuditExport(exportId, action, reason),
    onSuccess: (_job, variables) => queryClient.invalidateQueries({ queryKey: ['audit-export', variables.exportId] }),
  });
}

export function useDownloadAuditExport() {
  return useMutation({ mutationFn: downloadAuditExport });
}
