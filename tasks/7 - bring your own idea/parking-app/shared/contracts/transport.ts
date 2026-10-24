import type {
  ExpectedVersion,
  Id,
  Issue,
  ParkingMap,
  ParkingStatus,
  Snapshot
} from './model';
import type { RouteRequest, RouteResponse, RoutingPort } from './routing';
import type { CsvPort } from './csv';

export type StoredMap = {
  revision: number;
  map: ParkingMap;
};

export interface MapStore {
  load(): Promise<StoredMap | null>;
  save(value: StoredMap): Promise<void>;
}

export type AvailabilityCommand = ExpectedVersion & {
  spaceId: Id;
  status: ParkingStatus;
};

export type ReplaceMapCommand = ExpectedVersion & {
  map: ParkingMap;
};

export type CurrentVersion = {
  epoch: string;
  revision: number;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    issues?: Issue[];
  };
  currentVersion?: CurrentVersion;
};

export type SessionErrorCode =
  | 'VERSION_CONFLICT'
  | 'INVALID_INPUT'
  | 'SPACE_NOT_FOUND'
  | 'NOT_A_SPACE'
  | 'PERSISTENCE_FAILED';

export class SessionError extends Error {
  readonly name = 'SessionError';
  readonly code: SessionErrorCode;
  readonly status: number;
  readonly issues?: Issue[];
  readonly currentVersion?: CurrentVersion;

  constructor(
    code: SessionErrorCode,
    status: number,
    message: string,
    options: { issues?: Issue[]; currentVersion?: CurrentVersion } = {}
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.issues = options.issues;
    this.currentVersion = options.currentVersion;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export type SessionChangeReason = 'layout' | 'availability';
export type SessionListener = (snapshot: Snapshot, reason: SessionChangeReason) => void;

export interface MapSession {
  getSnapshot(): Snapshot;
  replace(command: ReplaceMapCommand): Promise<Snapshot>;
  setAvailability(command: AvailabilityCommand): Promise<Snapshot>;
  subscribe(listener: SessionListener): () => void;
}

export type CreateMapSessionOptions = {
  store: MapStore;
  seedMap: ParkingMap;
  newEpoch: () => string;
};

export type WsClientMessage =
  | { type: 'subscribe'; protocolVersion: 1 }
  | { type: 'authenticate'; protocolVersion: 1; token: string }
  | {
      type: 'availability.set';
      protocolVersion: 1;
      requestId: string;
      command: AvailabilityCommand;
    };

export type WsServerMessage =
  | {
      type: 'map.snapshot';
      protocolVersion: 1;
      reason: 'initial' | 'layout' | 'availability';
      snapshot: Snapshot;
    }
  | { type: 'authenticated'; protocolVersion: 1 }
  | { type: 'command.result'; protocolVersion: 1; requestId: string; snapshot: Snapshot }
  | {
      type: 'error';
      protocolVersion: 1;
      requestId?: string;
      code: string;
      message: string;
      currentVersion?: CurrentVersion;
    };

export type TransportDependencies = {
  routing: RoutingPort;
  csv: CsvPort;
};

export type RouteCommand = ExpectedVersion & RouteRequest;
export type { RouteRequest, RouteResponse };
