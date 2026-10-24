import type { ParkingMap, Node, Edge } from '../contracts/model';

export function makeDemoMap(): ParkingMap {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const floors = Array.from({ length: 6 }, (_, level) => ({ id: level === 0 ? 'ground' : `floor-${level}`, label: level === 0 ? 'Ground' : `Floor ${level}`, level, elevationMeters: level * 3 }));
  const addNode = (node: Node) => { nodes.push(node); return node.id; };
  const addEdge = (id: string, from: string, to: string, kind: Edge['kind'] = 'road', duration?: number, length?: number) => {
    const a = nodes.find(n => n.id === from)!;
    const b = nodes.find(n => n.id === to)!;
    const distance = length ?? Math.hypot(a.x - b.x, a.y - b.y);
    edges.push({ id, label: kind === 'ramp' ? (id === 'edge-express-ramp' ? 'Express ramp' : 'Floor connector') : kind === 'parking_access' ? 'Parking access' : 'Main aisle', fromNodeId: from, toNodeId: to, kind, direction: kind === 'parking_access' ? 'forward' : 'both', enabled: true, lengthMeters: distance, speedMps: duration ? distance / duration : 2.78 });
  };
  addNode({ id: 'entrance', label: 'Entry A', kind: 'entrance', floorId: 'ground', x: 10, y: 40, headingDegrees: 0 });
  for (const floor of floors) {
    const level = floor.level;
    const landing = addNode({ id: `landing-${level}`, label: `Ramp ${level === 0 ? 'G' : level}`, kind: 'ramp_landing', floorId: floor.id, x: 20, y: 40, headingDegrees: 0 });
    let last = landing;
    for (let i = 0; i < 7; i++) {
      const x = 40 + i * 7;
      const junction = addNode({ id: `junction-${level}-${i}`, label: `Aisle ${i + 1}`, kind: 'junction', floorId: floor.id, x, y: 40, headingDegrees: 0 });
      addEdge(`road-${level}-${i}`, last, junction, 'road', i === 0 ? 20 : undefined);
      last = junction;
      for (const side of [-1, 1]) {
        const target = i === 0 && side === -1 && (level === 1 || level === 5);
        const spaceId = target ? `space-f${level}-target` : `space-${level}-${i}-${side === -1 ? 'a' : 'b'}`;
        addNode({ id: spaceId, label: `${level === 0 ? 'G' : level}-${String(i * 2 + (side === -1 ? 1 : 2)).padStart(2, '0')}`, kind: 'space', floorId: floor.id, x, y: target && level === 1 ? 39 : 40 + side * 7, headingDegrees: 0, status: target ? 'free' : (i === 6 ? 'closed' : 'occupied') });
        addEdge(target && level === 1 ? 'edge-f1-access' : `access-${spaceId}`, junction, spaceId, 'parking_access', target ? 5 : 7);
      }
    }
  }
  addEdge('entry-road', 'entrance', 'landing-0', 'road', 10);
  addEdge('edge-express-ramp', 'landing-0', 'landing-5', 'ramp', 25, 25);
  for (let level = 0; level < 5; level++) addEdge(`ramp-${level}-${level + 1}`, `landing-${level}`, `landing-${level + 1}`, 'ramp', level === 0 ? 55 : 15, level === 0 ? 55 : 15);
  addNode({ id: 'unconnected-space', label: 'Unconnected demo', kind: 'space', floorId: 'ground', x: 90, y: 18, headingDegrees: 0, status: 'free' });
  return { schemaVersion: 1, id: 'demo-lot', name: 'Northpoint Parking', floors, nodes, edges };
}
export const demoMap = makeDemoMap();
