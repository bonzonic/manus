import type { EdgeKind, Id, ParkingMap } from './model';

export type RouteRequest = {
  startNodeId: Id;
};

export type RouteSegment = {
  edgeId: Id;
  fromNodeId: Id;
  toNodeId: Id;
  kind: EdgeKind;
  fromFloorId: Id;
  toFloorId: Id;
  movement: 'flat' | 'up' | 'down';
  distanceMeters: number;
  durationSeconds: number;
};

export type Route = {
  destinationSpaceId: Id;
  nodeIds: Id[];
  edgeIds: Id[];
  segments: RouteSegment[];
  totalDistanceMeters: number;
  totalDurationSeconds: number;
};

export type RouteFailureCode = 'INVALID_START' | 'NO_AVAILABLE_SPACE' | 'NO_REACHABLE_SPACE';

export type RouteOutcome =
  | { ok: true; route: Route }
  | { ok: false; code: RouteFailureCode; message: string };

export type RouteResponse = {
  epoch: string;
  revision: number;
  outcome: RouteOutcome;
};

export interface RoutingPort {
  findFastestAvailable(map: ParkingMap, request: RouteRequest): RouteOutcome;
}
