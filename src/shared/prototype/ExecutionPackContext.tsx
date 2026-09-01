import { useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { ExecutionPackContext } from './executionPackContextValue';
import { executionPacks } from './executionPacks';
import type { ExecutionPackKey } from './executionPacks';

export function ExecutionPackProvider({ children }: PropsWithChildren) {
  const [selectedPackKey, setSelectedPackKey] = useState<ExecutionPackKey>('common');
  const selectedPack = executionPacks.find((pack) => pack.key === selectedPackKey) ?? executionPacks[0];

  const value = useMemo(
    () => ({
      selectedPack,
      selectedPackKey,
      selectPack: setSelectedPackKey,
    }),
    [selectedPack, selectedPackKey],
  );

  return <ExecutionPackContext.Provider value={value}>{children}</ExecutionPackContext.Provider>;
}
