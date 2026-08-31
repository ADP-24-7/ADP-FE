import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { normalizeApiError } from './apiError';

describe('normalizeApiError', () => {
  it('preserves BE error contract fields', () => {
    const error = new AxiosError('Request failed', undefined, undefined, undefined, {
      data: {
        reasonCode: 'AUTHORIZATION_DENIED',
        message: 'Access denied',
        requestId: 'req-1',
        traceId: 'trace-1',
        timestamp: '2026-08-31T00:00:00Z',
      },
      status: 403,
      statusText: 'Forbidden',
      headers: {},
      config: { headers: new AxiosHeaders() },
    });

    expect(normalizeApiError(error)).toEqual({
      status: 403,
      reasonCode: 'AUTHORIZATION_DENIED',
      message: 'Access denied',
      requestId: 'req-1',
      traceId: 'trace-1',
      timestamp: '2026-08-31T00:00:00Z',
    });
  });
});
