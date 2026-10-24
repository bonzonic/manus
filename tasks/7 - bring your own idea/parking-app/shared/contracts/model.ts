export type Id = string;

export type NodeKind = 'entrance' | 'junction' | 'ramp_landing' | 'space';
export type ParkingStatus = 'free' | 'occupied' | 'closed';
export type EdgeKind = 'road' | 'ramp' | 'parking_access';
export type Direction = 'forward' | 'reverse' | 'both';

export type Point = { x: number; y: number };

export type Floor = {
  id: Id;
  label: string;
  level: number;
  elevationMeters: number;
};

export type Node = {
  id: Id;
  label: string;
  kind: NodeKind;
  floorId: Id;
  x: number;
  y: number;
  headingDegrees: number;
  status?: ParkingStatus;
};

export type Edge = {
  id: Id;
  label: string;
  kind: EdgeKind;
  fromNodeId: Id;
  toNodeId: Id;
  direction: Direction;
  enabled: boolean;
  lengthMeters: number;
  speedMps: number;
};

export type ParkingMap = {
  schemaVersion: 1;
  id: Id;
  name: string;
  floors: Floor[];
  nodes: Node[];
  edges: Edge[];
};

export type Snapshot = {
  epoch: string;
  revision: number;
  map: ParkingMap;
};

export type ExpectedVersion = {
  expectedEpoch: string;
  expectedRevision: number;
};

export type Issue = {
  code: string;
  path: string;
  message: string;
  row?: number;
  column?: string;
};

export type Result<T> = { ok: true; value: T } | { ok: false; errors: Issue[] };

export type Warning = {
  code: 'UNCONNECTED_SPACE' | 'DISCONNECTED_NETWORK';
  ids: Id[];
  message: string;
};

export const MAP_LIMITS = {
  maxInputBytes: 2 * 1024 * 1024,
  maxFloors: 32,
  maxNodes: 5_000,
  maxEdges: 10_000,
  maxLabelCharacters: 120,
  maxEpochCharacters: 128
} as const;

export const EDITOR_DEFAULTS = {
  roadSpeedMps: 2.78,
  rampSpeedMps: 1.39,
  accessSpeedMps: 1,
  roadAttachmentToleranceMeters: 5,
  gridSnapMeters: 1
} as const;
