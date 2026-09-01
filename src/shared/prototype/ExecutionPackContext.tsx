import { useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { ExecutionPackContext } from './executionPackContextValue';
import { executionPacks } from './executionPacks';
import type { ExecutionPackKey } from './executionPacks';

const executionPackStorageKey = 'adp.selectedExecutionPack';

function readInitialExecutionPackKey(): ExecutionPackKey {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'common';
  }

  const storedKey = window.localStorage.getItem(executionPackStorageKey);
  const matchedPack = executionPacks.find((pack) => pack.key === storedKey);

  return matchedPack?.key ?? 'common';
}

export function ExecutionPackProvider({ children }: PropsWithChildren) {
  const [selectedPackKey, setSelectedPackKey] = useState<ExecutionPackKey>(readInitialExecutionPackKey);
  const selectedPack = executionPacks.find((pack) => pack.key === selectedPackKey) ?? executionPacks[0];

  const value = useMemo(
    () => ({
      selectedPack,
      selectedPackKey,
      selectPack: (packKey: ExecutionPackKey) => {
        setSelectedPackKey(packKey);
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(executionPackStorageKey, packKey);
        }
      },
    }),
    [selectedPack, selectedPackKey],
  );

  return <ExecutionPackContext.Provider value={value}>{children}</ExecutionPackContext.Provider>;
}
