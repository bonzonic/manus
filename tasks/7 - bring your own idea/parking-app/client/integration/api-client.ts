import type { ClientOptions } from '../ui-contracts';
import type { ParkingApi } from '../../shared/contracts/client';
import type { ExpectedVersion, Snapshot } from '../../shared/contracts/model';
import type { RouteRequest, RouteResponse } from '../../shared/contracts/routing';
import type { ApiError, AvailabilityCommand, ReplaceMapCommand } from '../../shared/contracts/transport';
import type { Issue } from '../../shared/contracts/model';

export class ApiClientError extends Error {
  readonly name = 'ApiClientError';
  readonly code: string;
  readonly status: number;
  readonly issues?: Issue[];
  readonly currentVersion?: ApiError['currentVersion'];

  constructor(
    code: string,
    status: number,
    message: string,
    options: { issues?: Issue[]; currentVersion?: ApiError['currentVersion'] } = {}
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.issues = options.issues;
    this.currentVersion = options.currentVersion;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const responsePayload = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
};

const asApiError = (value: unknown): ApiError | undefined => {
  if (!isRecord(value) || !isRecord(value.error)) return undefined;
  const error = value.error;
  if (typeof error.code !== 'string' || typeof error.message !== 'string') return undefined;
  return {
    error: {
      code: error.code,
      message: error.message,
      issues: Array.isArray(error.issues) ? (error.issues as Issue[]) : undefined
    },
    currentVersion: isRecord(value.currentVersion)
      ? {
          epoch: typeof value.currentVersion.epoch === 'string' ? value.currentVersion.epoch : '',
          revision: typeof value.currentVersion.revision === 'number' ? value.currentVersion.revision : 0
        }
      : undefined
  };
};

export function createParkingApi(options: ClientOptions & { layoutId?: string } = {}): ParkingApi {
  const fetcher = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const baseUrl = options.baseUrl;

  const endpoint = (path: string): string => {
    if (options.layoutId) path += `?layout=${encodeURIComponent(options.layoutId)}`;
    if (!baseUrl) return path;
    return new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
  };

  const request = async <T>(
    path: string,
    init: RequestInit = {},
    token?: string
  ): Promise<T> => {
    const headers = new Headers(init.headers);
    if (init.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetcher(endpoint(path), { ...init, headers });
    const payload = await responsePayload(response);
    if (!response.ok) {
      const apiError = asApiError(payload);
      throw new ApiClientError(
        apiError?.error.code ?? `HTTP_${response.status}`,
        response.status,
        apiError?.error.message ?? `Request failed with status ${response.status}`,
        { issues: apiError?.error.issues, currentVersion: apiError?.currentVersion }
      );
    }
    return payload as T;
  };

  return {
    getMap: () => request<Snapshot>('/api/map'),
    replaceMap: (command: ReplaceMapCommand, token: string) =>
      request<Snapshot>('/api/map', { method: 'PUT', body: JSON.stringify(command) }, token),
    setAvailability: (command: AvailabilityCommand, token: string) =>
      request<Snapshot>(`/api/spaces/${encodeURIComponent(command.spaceId)}`, {
        method: 'PATCH',
        body: JSON.stringify(command)
      }, token),
    getRoute: (command: ExpectedVersion & RouteRequest) =>
      request<RouteResponse>('/api/route', { method: 'POST', body: JSON.stringify(command) })
  };
}
