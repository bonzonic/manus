import type { ClientOptions } from '../ui-contracts';
import type { ConnectionState, LiveMapClient } from '../../shared/contracts/client';
import type { Snapshot } from '../../shared/contracts/model';
import { validateMap } from '../../shared/contracts/validation';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseSnapshot = (value: unknown): Snapshot | undefined => {
  if (!isRecord(value)) return undefined;
  if (typeof value.epoch !== 'string' || value.epoch.length === 0 || value.epoch.length > 128) return undefined;
  if (!Number.isSafeInteger(value.revision) || (value.revision as number) <= 0) return undefined;
  const result = validateMap(value.map);
  return result.ok
    ? { epoch: value.epoch, revision: value.revision as number, map: result.value }
    : undefined;
};

export function createLiveMapClient(options: ClientOptions & { layoutId?: string } = {}): LiveMapClient {
  const fetcher = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const timers = options.timers ?? globalThis;
  const random = options.random ?? Math.random;
  const baseUrl = options.baseUrl;

  const endpoint = (path: string): string => {
    if (options.layoutId) path += `?layout=${encodeURIComponent(options.layoutId)}`;
    if (!baseUrl) return path;
    return new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
  };

  const socketUrl = (): string => {
    const origin = baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    const url = new URL('/ws', origin);
    if (url.protocol === 'http:') url.protocol = 'ws:';
    if (url.protocol === 'https:') url.protocol = 'wss:';
    if (options.layoutId) url.searchParams.set('layout', options.layoutId);
    return url.toString();
  };

  return {
    subscribe(onSnapshot, onState) {
      let stopped = false;
      let generation = 0;
      let socket: WebSocket | undefined;
      let timer: ReturnType<typeof globalThis.setTimeout> | undefined;
      let reconnectAttempt = 0;
      let current: Snapshot | undefined;
      let authoritativeEpochForGeneration: string | undefined;
      let state: ConnectionState = 'connecting';

      const setState = (next: ConnectionState): void => {
        if (state === next || stopped) return;
        state = next;
        onState(next);
      };

      onState('connecting');

      const acceptSnapshot = (snapshot: Snapshot, sourceGeneration: number, fromFreshFetch: boolean): boolean => {
        if (stopped || sourceGeneration !== generation) return false;
        if (fromFreshFetch) authoritativeEpochForGeneration = snapshot.epoch;
        if (current) {
          if (snapshot.epoch === current.epoch) {
            if (snapshot.revision <= current.revision) {
              setState('live');
              return false;
            }
          } else if (
            authoritativeEpochForGeneration !== undefined &&
            snapshot.epoch !== authoritativeEpochForGeneration
          ) {
            return false;
          }
        }
        current = snapshot;
        onSnapshot(snapshot);
        setState('live');
        return true;
      };

      const fetchFreshSnapshot = async (sourceGeneration: number): Promise<void> => {
        try {
          const response = await fetcher(endpoint('/api/map'));
          if (!response.ok) return;
          const snapshot = parseSnapshot(await response.json());
          if (snapshot) acceptSnapshot(snapshot, sourceGeneration, true);
        } catch {
          // The socket remains the source of truth; a later snapshot can recover this request.
        }
      };

      const scheduleReconnect = (sourceGeneration: number): void => {
        if (stopped || sourceGeneration !== generation || timer !== undefined) return;
        setState('reconnecting');
        reconnectAttempt += 1;
        const baseDelay = Math.min(30_000, 1_000 * 2 ** Math.min(reconnectAttempt - 1, 5));
        const jitter = Math.floor(Math.max(0, Math.min(1_000, random() * 250)));
        timer = timers.setTimeout(() => {
          timer = undefined;
          if (!stopped && sourceGeneration === generation) connect();
        }, baseDelay + jitter);
      };

      const connect = (): void => {
        if (stopped) return;
        const sourceGeneration = ++generation;
        authoritativeEpochForGeneration = undefined;
        setState(sourceGeneration === 1 ? 'connecting' : 'reconnecting');
        try {
          const next = (options.webSocketFactory ?? ((url: string) => new WebSocket(url)))(socketUrl());
          socket = next;
          next.onopen = () => {
            if (stopped || sourceGeneration !== generation || socket !== next) return;
            reconnectAttempt = 0;
            next.send(JSON.stringify({ type: 'subscribe', protocolVersion: 1 }));
            if (sourceGeneration > 1) void fetchFreshSnapshot(sourceGeneration);
          };
          next.onmessage = (event: MessageEvent) => {
            if (stopped || sourceGeneration !== generation || socket !== next) return;
            try {
              const message: unknown = JSON.parse(String(event.data));
              if (!isRecord(message) || message.type !== 'map.snapshot' || message.protocolVersion !== 1) return;
              const snapshot = parseSnapshot(message.snapshot);
              if (snapshot) acceptSnapshot(snapshot, sourceGeneration, false);
            } catch {
              // Ignore malformed or unsupported server messages.
            }
          };
          next.onerror = () => {
            if (!stopped && sourceGeneration === generation && socket === next) setState('reconnecting');
          };
          next.onclose = () => {
            if (stopped || sourceGeneration !== generation || socket !== next) return;
            socket = undefined;
            scheduleReconnect(sourceGeneration);
          };
        } catch {
          scheduleReconnect(sourceGeneration);
        }
      };

      connect();

      return () => {
        stopped = true;
        generation += 1;
        if (timer !== undefined) timers.clearTimeout(timer);
        timer = undefined;
        if (socket) {
          const obsolete = socket;
          socket = undefined;
          obsolete.onopen = null;
          obsolete.onmessage = null;
          obsolete.onerror = null;
          obsolete.onclose = null;
          obsolete.close();
        }
      };
    }
  };
}
