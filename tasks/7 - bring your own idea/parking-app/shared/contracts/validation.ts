import { z } from 'zod';
import {
  MAP_LIMITS,
  type Direction,
  type Edge,
  type Floor,
  type Id,
  type Issue,
  type Node,
  type ParkingMap,
  type Result,
  type Warning
} from './model';

const idPattern = /^[A-Za-z0-9_-]{1,64}$/;
const idSchema = z.string().regex(idPattern, 'must match [A-Za-z0-9_-]{1,64}');
const labelSchema = z.string().min(1).max(MAP_LIMITS.maxLabelCharacters);
const finiteNumber = z.number().finite();

export const floorSchema = z
  .object({
    id: idSchema,
    label: labelSchema,
    level: z.number().int().finite(),
    elevationMeters: finiteNumber
  })
  .strict();

export const nodeSchema = z
  .object({
    id: idSchema,
    label: labelSchema,
    kind: z.enum(['entrance', 'junction', 'ramp_landing', 'space']),
    floorId: idSchema,
    x: finiteNumber,
    y: finiteNumber,
    headingDegrees: finiteNumber,
    status: z.enum(['free', 'occupied', 'closed']).optional()
  })
  .strict();

export const edgeSchema = z
  .object({
    id: idSchema,
    label: labelSchema,
    kind: z.enum(['road', 'ramp', 'parking_access']),
    fromNodeId: idSchema,
    toNodeId: idSchema,
    direction: z.enum(['forward', 'reverse', 'both']),
    enabled: z.boolean(),
    lengthMeters: finiteNumber,
    speedMps: finiteNumber
  })
  .strict();

export const parkingMapSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: idSchema,
    name: labelSchema,
    floors: z.array(floorSchema),
    nodes: z.array(nodeSchema),
    edges: z.array(edgeSchema)
  })
  .strict();

const issue = (code: string, path: string, message: string): Issue => ({ code, path, message });

const zodPath = (path: (string | number)[]): string =>
  path.length === 0 ? '$' : path.map((part) => (typeof part === 'number' ? `[${part}]` : `.${part}`)).join('').replace(/^\./, '');

const detached = <T>(value: T): T => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
};

const distance2d = (a: Node, b: Node): number => Math.hypot(a.x - b.x, a.y - b.y);

const distance3d = (a: Node, b: Node, floors: Map<Id, Floor>): number => {
  const floorA = floors.get(a.floorId);
  const floorB = floors.get(b.floorId);
  if (!floorA || !floorB) return Number.POSITIVE_INFINITY;
  return Math.hypot(a.x - b.x, a.y - b.y, floorA.elevationMeters - floorB.elevationMeters);
};

const addDuplicateIssues = <T extends { id: Id }>(
  values: T[],
  collection: string,
  globalIds: Map<Id, string>,
  issues: Issue[]
): void => {
  values.forEach((value, index) => {
    const path = `${collection}[${index}].id`;
    const previousPath = globalIds.get(value.id);
    if (previousPath) {
      issues.push(issue('DUPLICATE_ID', path, `ID ${value.id} is already used at ${previousPath}`));
    } else {
      globalIds.set(value.id, path);
    }
  });
};

export function validateMap(input: unknown): Result<ParkingMap> {
  const parsed = parkingMapSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((zodIssue) =>
        issue(
          zodIssue.code === 'unrecognized_keys' ? 'UNKNOWN_FIELD' : 'INVALID_VALUE',
          zodPath(zodIssue.path),
          zodIssue.message
        )
      )
    };
  }

  const map = detached(parsed.data) as ParkingMap;
  const issues: Issue[] = [];
  const globalIds = new Map<Id, string>();
  globalIds.set(map.id, 'id');
  addDuplicateIssues(map.floors, 'floors', globalIds, issues);
  addDuplicateIssues(map.nodes, 'nodes', globalIds, issues);
  addDuplicateIssues(map.edges, 'edges', globalIds, issues);

  if (map.floors.length > MAP_LIMITS.maxFloors) {
    issues.push(issue('LIMIT_EXCEEDED', 'floors', `at most ${MAP_LIMITS.maxFloors} floors are allowed`));
  }
  if (map.nodes.length > MAP_LIMITS.maxNodes) {
    issues.push(issue('LIMIT_EXCEEDED', 'nodes', `at most ${MAP_LIMITS.maxNodes} nodes are allowed`));
  }
  if (map.edges.length > MAP_LIMITS.maxEdges) {
    issues.push(issue('LIMIT_EXCEEDED', 'edges', `at most ${MAP_LIMITS.maxEdges} edges are allowed`));
  }

  const floorsById = new Map<Id, Floor>();
  const levels = new Map<number, string>();
  map.floors.forEach((floor, index) => {
    floorsById.set(floor.id, floor);
    const prior = levels.get(floor.level);
    if (prior) issues.push(issue('DUPLICATE_LEVEL', `floors[${index}].level`, `level is already used by ${prior}`));
    else levels.set(floor.level, floor.id);
    if (Math.abs(floor.elevationMeters) > Number.MAX_VALUE) {
      issues.push(issue('INVALID_ELEVATION', `floors[${index}].elevationMeters`, 'elevation must be finite'));
    }
  });

  const orderedFloors = [...map.floors].sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));
  for (let index = 1; index < orderedFloors.length; index += 1) {
    if (!(orderedFloors[index].elevationMeters > orderedFloors[index - 1].elevationMeters)) {
      issues.push(
        issue(
          'INVALID_ELEVATION_ORDER',
          `floors[${map.floors.indexOf(orderedFloors[index])}].elevationMeters`,
          'elevation must strictly increase as level increases'
        )
      );
    }
  }

  const nodesById = new Map<Id, Node>();
  map.nodes.forEach((node, index) => {
    nodesById.set(node.id, node);
    if (!floorsById.has(node.floorId)) {
      issues.push(issue('MISSING_REFERENCE', `nodes[${index}].floorId`, `unknown floor ${node.floorId}`));
    }
    if (node.x < -10_000 || node.x > 10_000 || node.y < -10_000 || node.y > 10_000) {
      issues.push(issue('COORDINATE_OUT_OF_RANGE', `nodes[${index}]`, 'coordinates must be between -10000 and 10000 metres'));
    }
    if (node.headingDegrees < 0 || node.headingDegrees >= 360) {
      issues.push(issue('INVALID_HEADING', `nodes[${index}].headingDegrees`, 'heading must be in [0, 360)'));
    }
    if (node.kind === 'space' && node.status === undefined) {
      issues.push(issue('MISSING_STATUS', `nodes[${index}].status`, 'spaces require a parking status'));
    }
    if (node.kind !== 'space' && Object.prototype.hasOwnProperty.call(node, 'status')) {
      issues.push(issue('NON_SPACE_STATUS', `nodes[${index}].status`, 'only space nodes may have status'));
    }
  });

  const accessBySpace = new Map<Id, string>();
  const addReferenceIssue = (path: string, reference: Id, kind: string): void => {
    if (!nodesById.has(reference)) issues.push(issue('MISSING_REFERENCE', path, `unknown ${kind} ${reference}`));
  };

  map.edges.forEach((edge: Edge, index) => {
    const path = `edges[${index}]`;
    const from = nodesById.get(edge.fromNodeId);
    const to = nodesById.get(edge.toNodeId);
    addReferenceIssue(`${path}.fromNodeId`, edge.fromNodeId, 'node');
    addReferenceIssue(`${path}.toNodeId`, edge.toNodeId, 'node');
    if (!from || !to) return;
    if (edge.fromNodeId === edge.toNodeId) {
      issues.push(issue('SELF_LOOP', path, 'edges cannot connect a node to itself'));
      return;
    }
    if (!(edge.lengthMeters > 0) || !Number.isFinite(edge.lengthMeters)) {
      issues.push(issue('INVALID_WEIGHT', `${path}.lengthMeters`, 'length must be finite and strictly positive'));
    }
    if (!(edge.speedMps > 0) || !Number.isFinite(edge.speedMps)) {
      issues.push(issue('INVALID_WEIGHT', `${path}.speedMps`, 'speed must be finite and strictly positive'));
    }
    const duration = edge.lengthMeters / edge.speedMps;
    if (!(duration > 0) || !Number.isFinite(duration)) {
      issues.push(issue('INVALID_WEIGHT', path, 'derived travel duration must be finite and strictly positive'));
    }
    const sameFloor = from.floorId === to.floorId;
    if (edge.kind === 'road') {
      if (!sameFloor) issues.push(issue('CROSS_FLOOR_ROAD', path, 'roads must connect nodes on the same floor'));
      if (from.kind === 'space' || to.kind === 'space') {
        issues.push(issue('ROAD_TOUCHES_SPACE', path, 'roads may not touch spaces'));
      }
    } else if (edge.kind === 'parking_access') {
      if (!sameFloor) issues.push(issue('CROSS_FLOOR_ACCESS', path, 'parking access must stay on one floor'));
      if (from.kind === 'space' || to.kind !== 'space') {
        issues.push(issue('INVALID_ACCESS_ENDPOINTS', path, 'parking access must go from a non-space node to a space'));
      }
      if (edge.direction !== 'forward') {
        issues.push(issue('INVALID_ACCESS_DIRECTION', `${path}.direction`, 'parking access direction must be forward'));
      }
      if (to.kind === 'space') {
        const prior = accessBySpace.get(to.id);
        if (prior) issues.push(issue('MULTIPLE_SPACE_ACCESS', `${path}.toNodeId`, `space already has access edge ${prior}`));
        else accessBySpace.set(to.id, edge.id);
      }
    } else if (edge.kind === 'ramp') {
      if (sameFloor) issues.push(issue('SAME_FLOOR_RAMP', path, 'ramps must connect different floors'));
      if (from.kind !== 'ramp_landing' || to.kind !== 'ramp_landing') {
        issues.push(issue('INVALID_RAMP_ENDPOINTS', path, 'ramps must connect ramp_landing nodes'));
      }
    }

    if (edge.kind !== 'ramp' && sameFloor && Math.abs(edge.lengthMeters - distance2d(from, to)) > 1e-6) {
      issues.push(issue('LENGTH_MISMATCH', `${path}.lengthMeters`, 'road/access length must equal endpoint distance'));
    }
    if (edge.kind === 'ramp' && edge.lengthMeters + 1e-6 < distance3d(from, to, floorsById)) {
      issues.push(issue('RAMP_TOO_SHORT', `${path}.lengthMeters`, 'ramp length must be at least the 3D endpoint distance'));
    }
  });

  const maximumSimpleRouteDuration = map.edges.reduce((sum, edge) => sum + edge.lengthMeters / edge.speedMps, 0);
  if (!Number.isFinite(maximumSimpleRouteDuration)) issues.push(issue('INVALID_WEIGHT', 'edges', 'aggregate travel duration must not overflow'));

  return issues.length > 0 ? { ok: false, errors: issues } : { ok: true, value: map };
}

const addNeighbor = (adjacency: Map<Id, Set<Id>>, from: Id, to: Id): void => {
  const neighbors = adjacency.get(from) ?? new Set<Id>();
  neighbors.add(to);
  adjacency.set(from, neighbors);
};

const directionAllows = (direction: Direction, forward: boolean): boolean =>
  direction === 'both' || (forward ? direction === 'forward' : direction === 'reverse');

export function getMapWarnings(map: ParkingMap): Warning[] {
  const nonSpace = map.nodes.filter((node) => node.kind !== 'space');
  const nodesById = new Map(map.nodes.map((node) => [node.id, node]));
  const adjacency = new Map<Id, Set<Id>>();
  const roots = nonSpace.filter((node) => node.kind === 'entrance').map((node) => node.id);

  for (const edge of map.edges) {
    if (!edge.enabled) continue;
    const from = nodesById.get(edge.fromNodeId);
    const to = nodesById.get(edge.toNodeId);
    if (!from || !to || from.kind === 'space' || to.kind === 'space') continue;
    if (directionAllows(edge.direction, true)) addNeighbor(adjacency, from.id, to.id);
    if (directionAllows(edge.direction, false)) addNeighbor(adjacency, to.id, from.id);
  }

  const reachable = new Set<Id>(roots);
  const queue = [...roots];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    for (const next of adjacency.get(current) ?? []) {
      if (!reachable.has(next)) {
        reachable.add(next);
        queue.push(next);
      }
    }
  }

  const warnings: Warning[] = [];
  const disconnectedNetworkIds = nonSpace.filter((node) => !reachable.has(node.id)).map((node) => node.id).sort();
  if (disconnectedNetworkIds.length > 0) {
    warnings.push({
      code: 'DISCONNECTED_NETWORK',
      ids: disconnectedNetworkIds,
      message: `${disconnectedNetworkIds.length} non-space node(s) are not reachable from an entrance`
    });
  }

  const unconnectedSpaces = map.nodes
    .filter((node) => node.kind === 'space')
    .filter((space) => {
      const access = map.edges.find((edge) => edge.kind === 'parking_access' && edge.toNodeId === space.id && edge.enabled);
      return !access || !reachable.has(access.fromNodeId);
    })
    .map((space) => space.id)
    .sort();
  if (unconnectedSpaces.length > 0) {
    warnings.push({
      code: 'UNCONNECTED_SPACE',
      ids: unconnectedSpaces,
      message: `${unconnectedSpaces.length} space(s) have no reachable enabled parking access`
    });
  }

  return warnings;
}

export function canonicalizeMap(map: ParkingMap): ParkingMap {
  return detached({
    ...map,
    floors: [...map.floors].sort((a, b) => a.level - b.level || a.id.localeCompare(b.id)),
    nodes: [...map.nodes].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...map.edges].sort((a, b) => a.id.localeCompare(b.id))
  });
}
