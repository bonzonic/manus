import type { ExpectedVersion, Snapshot } from './model';
import type { AvailabilityCommand, ReplaceMapCommand } from './transport';
import type { RouteRequest, RouteResponse } from './routing';

export interface ParkingApi {
  getMap(): Promise<Snapshot>;
  replaceMap(command: ReplaceMapCommand, token: string): Promise<Snapshot>;
  setAvailability(command: AvailabilityCommand, token: string): Promise<Snapshot>;
  getRoute(command: ExpectedVersion & RouteRequest): Promise<RouteResponse>;
}

export type ConnectionState = 'connecting' | 'live' | 'reconnecting' | 'offline';

export interface LiveMapClient {
  subscribe(
    onSnapshot: (snapshot: Snapshot) => void,
    onState: (state: ConnectionState) => void
  ): () => void;
}
