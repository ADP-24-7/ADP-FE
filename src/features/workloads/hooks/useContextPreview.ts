import { useMutation } from '@tanstack/react-query';
import { previewRuntimeContext } from '../api/contextPreviewApi';

export function useContextPreview() {
  return useMutation({ mutationFn: previewRuntimeContext });
}
