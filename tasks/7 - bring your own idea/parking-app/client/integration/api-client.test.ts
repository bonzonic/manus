import { describe, expect, it, vi } from 'vitest';
import { createParkingApi, ApiClientError } from './api-client';
import { makeDemoMap } from '../../shared/fixtures/demo';

const snapshot = { epoch: 'epoch-a', revision: 3, map: makeDemoMap() };

describe('createParkingApi', () => {
  it('uses same-origin paths and keeps write tokens in the request header', async () => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) =>
      new Response(JSON.stringify(snapshot), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const api = createParkingApi({ fetchImpl });

    await api.replaceMap({ expectedEpoch: snapshot.epoch, expectedRevision: snapshot.revision, map: snapshot.map }, 'memory-token');

    expect(fetchImpl).toHaveBeenCalledWith('/api/map', expect.objectContaining({
      method: 'PUT',
      headers: expect.any(Headers)
    }));
    const init = fetchImpl.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer memory-token');
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json');
  });

  it('preserves structured server errors including current version', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      error: { code: 'VERSION_CONFLICT', message: 'stale map' },
      currentVersion: { epoch: 'epoch-b', revision: 4 }
    }), { status: 409, headers: { 'Content-Type': 'application/json' } }));
    const api = createParkingApi({ fetchImpl });

    await expect(api.getMap()).rejects.toMatchObject({
      name: 'ApiClientError', code: 'VERSION_CONFLICT', status: 409,
      currentVersion: { epoch: 'epoch-b', revision: 4 }
    });
    try { await api.getMap(); } catch (error) { expect(error).toBeInstanceOf(ApiClientError); }
  });
});
