import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { normalizeApiError } from './apiError';

describe('normalizeApiError', () => {
  it('preserves BE error contract fields', () => {
    const error = new AxiosError('Request failed', undefined, undefined, undefined, {
      data: {
        errorCode: 'AUTHORIZATION_DENIED',
        message: 'Access denied',
        requestId: 'req-1',
        traceId: 'trace-1',
      },
      status: 403,
      statusText: 'Forbidden',
      headers: {},
      config: { headers: new AxiosHeaders() },
    });

    expect(normalizeApiError(error)).toEqual({
      status: 403,
      errorCode: 'AUTHORIZATION_DENIED',
      message: 'Access denied',
      requestId: 'req-1',
      traceId: 'trace-1',
    });
  });

  it('maps legacy reasonCode to errorCode during BE contract transition', () => {
    const error = new AxiosError('Request failed', undefined, undefined, undefined, {
      data: {
        reasonCode: 'LEGACY_DENIED',
        message: 'Legacy error',
      },
      status: 403,
      statusText: 'Forbidden',
      headers: {},
      config: { headers: new AxiosHeaders() },
    });

    expect(normalizeApiError(error)).toMatchObject({
      status: 403,
      errorCode: 'LEGACY_DENIED',
      message: 'Legacy error',
    });
  });
});
