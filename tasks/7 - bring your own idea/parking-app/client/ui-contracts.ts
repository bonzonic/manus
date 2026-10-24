import type { ComponentType } from 'react';
import type { CsvPort } from '../shared/contracts/csv';
import type { ConnectionState, ParkingApi } from '../shared/contracts/client';
import type { Id, Point, ParkingMap, Snapshot } from '../shared/contracts/model';
import type { Route } from '../shared/contracts/routing';

export type MapCanvasProps = {
  map: ParkingMap;
  floorId: Id;
  selectedId?: Id;
  route?: Route;
  onSelect?: (id: Id) => void;
  onBackgroundPoint?: (point: Point) => void;
  onMoveNode?: (id: Id, point: Point) => void;
  readOnly: boolean;
};

export type MapRenderer = ComponentType<MapCanvasProps>;

export type BuilderViewProps = {
  snapshot: Snapshot;
  csv: CsvPort;
  api: ParkingApi;
  managementToken: string;
  Renderer: MapRenderer;
  onSaved: (snapshot: Snapshot) => void;
};

export type DriverViewProps = {
  snapshot: Snapshot;
  connectionState: ConnectionState;
  api: ParkingApi;
  Renderer: MapRenderer;
};

export type ClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  webSocketFactory?: (url: string) => WebSocket;
  timers?: Pick<typeof globalThis, 'setTimeout' | 'clearTimeout'>;
  random?: () => number;
};
