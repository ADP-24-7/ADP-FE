import { describe, expect, it } from 'vitest';
import { createRuntimeExecution, getRuntimeExecution, getRuntimeExecutionTrace } from './runtimeExecutionApi';
import { runtimeExecutionFixture, runtimeExecutionRequestFixture, runtimeExecutionTraceFixture } from '../mocks/fixtures';

describe('runtimeExecutionApi', () => {
  it('creates a runtime execution with the v1 request contract', async () => {
    await expect(createRuntimeExecution(runtimeExecutionRequestFixture)).resolves.toEqual(runtimeExecutionFixture);
  });

  it('gets a runtime execution by execution id', async () => {
    await expect(getRuntimeExecution(runtimeExecutionFixture.executionId)).resolves.toEqual(runtimeExecutionFixture);
  });

  it('gets a runtime execution trace by execution id', async () => {
    await expect(getRuntimeExecutionTrace(runtimeExecutionFixture.executionId)).resolves.toEqual(runtimeExecutionTraceFixture);
  });
});
