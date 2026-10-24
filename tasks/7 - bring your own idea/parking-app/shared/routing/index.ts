import type { ParkingMap, Edge, Node } from '../contracts/model';
import type { RoutingPort, RouteOutcome, RouteSegment, RouteRequest } from '../contracts/routing';

type QueueItem = { id: string; cost: number };
class MinHeap {
  private items: QueueItem[] = [];
  private less(a: QueueItem, b: QueueItem) { return a.cost < b.cost || (a.cost === b.cost && a.id < b.id); }
  push(item: QueueItem) {
    this.items.push(item);
    let i = this.items.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(this.items[i], this.items[p])) break;
      [this.items[i], this.items[p]] = [this.items[p], this.items[i]]; i = p;
    }
  }
  pop(): QueueItem | undefined {
    const first = this.items[0]; const last = this.items.pop();
    if (this.items.length && last) {
      this.items[0] = last; let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let next = i;
        if (l < this.items.length && this.less(this.items[l], this.items[next])) next = l;
        if (r < this.items.length && this.less(this.items[r], this.items[next])) next = r;
        if (next === i) break;
        [this.items[i], this.items[next]] = [this.items[next], this.items[i]]; i = next;
      }
    }
    return first;
  }
}

type Arc = { to: string; edge: Edge };
const failure = (code: 'INVALID_START' | 'NO_AVAILABLE_SPACE' | 'NO_REACHABLE_SPACE', message: string): RouteOutcome => ({ ok: false, code, message });

function findFastestAvailable(map: ParkingMap, request: RouteRequest): RouteOutcome {
  const nodes = new Map(map.nodes.map(n => [n.id, n]));
  const floors = new Map(map.floors.map(f => [f.id, f]));
  const start = nodes.get(request.startNodeId);
  if (!start || start.kind === 'space') return failure('INVALID_START', 'Choose an entrance, road junction or ramp landing as your starting point.');
  if (!map.nodes.some(n => n.kind === 'space' && n.status === 'free')) return failure('NO_AVAILABLE_SPACE', 'There are no available spaces in this lot.');
  const adjacency = new Map<string, Arc[]>();
  const add = (from: Node, to: Node, edge: Edge) => {
    if (from.kind === 'space' || (to.kind === 'space' && to.status !== 'free')) return;
    const arcs = adjacency.get(from.id) ?? []; arcs.push({ to: to.id, edge }); adjacency.set(from.id, arcs);
  };
  for (const edge of [...map.edges].sort((a, b) => a.id.localeCompare(b.id))) {
    if (!edge.enabled) continue;
    const from = nodes.get(edge.fromNodeId), to = nodes.get(edge.toNodeId);
    if (!from || !to) continue;
    if (edge.direction !== 'reverse') add(from, to, edge);
    if (edge.direction !== 'forward') add(to, from, edge);
  }
  const queue = new MinHeap(); queue.push({ id: start.id, cost: 0 });
  const costs = new Map<string, number>([[start.id, 0]]);
  const previous = new Map<string, { from: string; edge: Edge }>();
  let destination: Node | undefined; let best = Infinity;
  for (let item = queue.pop(); item; item = queue.pop()) {
    if (item.cost !== costs.get(item.id)) continue;
    if (item.cost > best) break;
    const node = nodes.get(item.id)!;
    if (node.kind === 'space') {
      if (!destination || item.cost < best || (item.cost === best && node.id < destination.id)) { destination = node; best = item.cost; }
      continue;
    }
    for (const arc of adjacency.get(item.id) ?? []) {
      const nextCost = item.cost + arc.edge.lengthMeters / arc.edge.speedMps;
      if (Number.isFinite(nextCost) && nextCost < (costs.get(arc.to) ?? Infinity)) {
        costs.set(arc.to, nextCost); previous.set(arc.to, { from: item.id, edge: arc.edge }); queue.push({ id: arc.to, cost: nextCost });
      }
    }
  }
  if (!destination) return failure('NO_REACHABLE_SPACE', 'Free spaces exist, but none can be reached from this starting point. Check road connections and directions.');
  const segments: RouteSegment[] = [];
  let current = destination.id;
  while (current !== start.id) {
    const step = previous.get(current)!;
    const from = nodes.get(step.from)!, to = nodes.get(current)!;
    const difference = floors.get(to.floorId)!.elevationMeters - floors.get(from.floorId)!.elevationMeters;
    segments.push({ edgeId: step.edge.id, fromNodeId: from.id, toNodeId: to.id, kind: step.edge.kind, fromFloorId: from.floorId, toFloorId: to.floorId, movement: difference > 0 ? 'up' : difference < 0 ? 'down' : 'flat', distanceMeters: step.edge.lengthMeters, durationSeconds: step.edge.lengthMeters / step.edge.speedMps });
    current = step.from;
  }
  segments.reverse();
  return { ok: true, route: { destinationSpaceId: destination.id, nodeIds: [start.id, ...segments.map(s => s.toNodeId)], edgeIds: segments.map(s => s.edgeId), segments, totalDistanceMeters: segments.reduce((v, s) => v + s.distanceMeters, 0), totalDurationSeconds: segments.reduce((v, s) => v + s.durationSeconds, 0) } };
}
export const routing: RoutingPort = { findFastestAvailable };
