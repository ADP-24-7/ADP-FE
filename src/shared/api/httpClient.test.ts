import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../app/mocks/server';
import { configureUnauthorizedHandler, httpClient } from './httpClient';

describe('httpClient session expiry boundary', () => {
  afterEach(() => configureUnauthorizedHandler(() => undefined));

  it('reports a protected API 401 to the session boundary', async () => {
    const unauthorized = vi.fn();
    configureUnauthorizedHandler(unauthorized);
    server.use(http.get('/api/admin/session-expired', () => new HttpResponse(null, { status: 401 })));

    await expect(httpClient.get('/api/admin/session-expired')).rejects.toBeDefined();

    expect(unauthorized).toHaveBeenCalledOnce();
  });

  it('does not redirect for the expected unauthenticated auth context response', async () => {
    const unauthorized = vi.fn();
    configureUnauthorizedHandler(unauthorized);
    server.use(http.get('/api/auth/me', () => new HttpResponse(null, { status: 401 })));

    await expect(httpClient.get('/api/auth/me')).rejects.toBeDefined();

    expect(unauthorized).not.toHaveBeenCalled();
  });
});
