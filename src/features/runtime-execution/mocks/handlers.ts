import { http, HttpResponse } from 'msw';
import { runtimeExecutionDetailFixture, runtimeExecutionFixture, runtimeExecutionTraceFixture } from './fixtures';

export const runtimeExecutionHandlers = [
  http.post('/v1/runtime/executions', () => HttpResponse.json(runtimeExecutionFixture)),
  http.get('/v1/runtime/executions/:executionId', ({ params }) => {
    if (params.executionId !== runtimeExecutionFixture.executionId) {
      return HttpResponse.json({ errorCode: 'RUNTIME_EXECUTION_NOT_FOUND', message: 'Execution not found' }, { status: 404 });
    }

    return HttpResponse.json(runtimeExecutionDetailFixture);
  }),
  http.get('/v1/runtime/executions/:executionId/trace', ({ params }) => {
    if (params.executionId !== runtimeExecutionFixture.executionId) {
      return HttpResponse.json({ errorCode: 'RUNTIME_EXECUTION_NOT_FOUND', message: 'Execution trace not found' }, { status: 404 });
    }

    return HttpResponse.json(runtimeExecutionTraceFixture);
  }),
];
