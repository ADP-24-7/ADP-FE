import { createContext } from 'react';
import type { ExecutionPack, ExecutionPackKey } from './executionPacks';

export type ExecutionPackContextValue = {
  selectedPack: ExecutionPack;
  selectedPackKey: ExecutionPackKey;
  selectPack: (packKey: ExecutionPackKey) => void;
};

export const ExecutionPackContext = createContext<ExecutionPackContextValue | null>(null);
