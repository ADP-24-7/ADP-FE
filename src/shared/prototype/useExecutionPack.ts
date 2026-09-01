import { useContext } from 'react';
import { ExecutionPackContext } from './executionPackContextValue';

export function useExecutionPack() {
  const context = useContext(ExecutionPackContext);

  if (!context) {
    throw new Error('useExecutionPack must be used within ExecutionPackProvider');
  }

  return context;
}
