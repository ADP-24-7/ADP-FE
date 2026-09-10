import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { ExecutionPackProvider } from '../shared/prototype';
import { queryClient } from './queryClient';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ExecutionPackProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ExecutionPackProvider>
  );
}
