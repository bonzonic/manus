import type { PointerEvent as ReactPointerEvent } from 'react';
import type { MapCanvasProps } from '../ui-contracts';
import type { Edge, Node, Point } from '../../shared/contracts/model';

const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 65;

const pointFor = (node: Node): Point => ({ x: node.x, y: node.y });

function screenPoint(event: ReactPointerEvent<SVGSVGElement>): Point {
  const rect = event.currentTarget.getBoundingClientRect();
  const width = rect.width || VIEW_WIDTH;
  const height = rect.height || VIEW_HEIGHT;
  return {
    x: Math.max(0, Math.min(VIEW_WIDTH, ((event.clientX - rect.left) / width) * VIEW_WIDTH)),
    y: Math.max(0, Math.min(VIEW_HEIGHT, ((event.clientY - rect.top) / height) * VIEW_HEIGHT))
  };
}

function edgeColor(edge: Edge): string {
  if (edge.kind === 'ramp') return '#7b6f65';
  if (edge.kind === 'parking_access') return '#88979d';
  return '#536570';
}

export function MapCanvas({
  map,
  floorId,
  selectedId,
  route,
  onSelect,
  onBackgroundPoint,
  readOnly
}: MapCanvasProps) {
  const nodes = map.nodes.filter((node) => node.floorId === floorId);
  const nodesById = new Map(map.nodes.map((node) => [node.id, node]));
  const floorEdges = map.edges.filter((edge) => {
    const from = nodesById.get(edge.fromNodeId);
    const to = nodesById.get(edge.toNodeId);
    return from?.floorId === floorId || to?.floorId === floorId;
  });
  const routeSegments: Point[][] = [];
  let currentRouteSegment: Point[] = [];
  for (const id of route?.nodeIds ?? []) {
    const node = nodesById.get(id);
    if (node?.floorId === floorId) {
      currentRouteSegment.push(pointFor(node));
    } else {
      if (currentRouteSegment.length > 1) routeSegments.push(currentRouteSegment);
      currentRouteSegment = [];
    }
  }
  if (currentRouteSegment.length > 1) routeSegments.push(currentRouteSegment);

  const handleBackground = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!readOnly && onBackgroundPoint) onBackgroundPoint(screenPoint(event));
  };

  return (
    <svg
      className="parking-map-canvas"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`${map.name} ${floorId} map canvas`}
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={handleBackground}
      style={{
        width: '100%',
        minHeight: 360,
        display: 'block',
        background: '#e7edf0',
        border: '1px solid var(--line, #b8c7cd)',
        borderRadius: 'var(--radius-control, 8px)',
        touchAction: 'none'
      }}
    >
      <defs>
        <pattern id="board-grid" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#cdd8dc" strokeWidth="0.12" />
        </pattern>
        <pattern id="occupied-hatch" width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="1.6" height="1.6" fill="#d0d7da" />
          <path d="M 0 0 L 0 1.6" stroke="#71828a" strokeWidth="0.35" />
        </pattern>
      </defs>
      <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="url(#board-grid)" />
      <rect x="2" y="2" width="96" height="61" rx="1.5" fill="none" stroke="#aebfc5" strokeWidth="0.25" />
      {floorEdges.map((edge) => {
        const from = nodesById.get(edge.fromNodeId);
        const to = nodesById.get(edge.toNodeId);
        if (!from || !to) return null;
        const bothOnFloor = from.floorId === floorId && to.floorId === floorId;
        const endpoint = from.floorId === floorId ? from : to;
        const other = from.floorId === floorId ? to : from;
        if (!bothOnFloor && edge.kind !== 'ramp') return null;
        return (
          <g key={edge.id} aria-label={edge.label} opacity={edge.enabled ? 1 : 0.4}>
            <line
              x1={endpoint.x}
              y1={endpoint.y}
              x2={bothOnFloor ? other.x : endpoint.x + 4}
              y2={bothOnFloor ? other.y : endpoint.y - 4}
              stroke={edgeColor(edge)}
              strokeWidth={edge.kind === 'road' ? 2.2 : edge.kind === 'ramp' ? 1.6 : 0.7}
              strokeDasharray={edge.kind === 'ramp' ? '1.5 1' : undefined}
              strokeLinecap="round"
              pointerEvents="none"
            />
            {edge.kind === 'road' && <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#75858b" strokeWidth="0.18" strokeDasharray="0.8 0.8" pointerEvents="none" />}
          </g>
        );
      })}
      {routeSegments.map((points, index) => <polyline key={`route-${index}`} points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke="var(--route-blue, #176b87)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 0.8" pointerEvents="none" />)}
      {nodes.map((node) => {
        const isSpace = node.kind === 'space';
        const selected = node.id === selectedId;
        const fill = !isSpace ? '#f7fbfc' : node.status === 'free' ? '#b8dfc7' : node.status === 'occupied' ? 'url(#occupied-hatch)' : '#c8ced1';
        const nodeWidth = isSpace ? 2.5 : 1.8;
        const nodeHeight = isSpace ? 5 : 1.8;
        return (
          <g
            key={node.id}
            role="button"
            aria-label={node.label}
            tabIndex={readOnly ? -1 : 0}
            transform={`translate(${node.x} ${node.y}) rotate(${node.headingDegrees})`}
            onPointerDown={(event) => {
              event.stopPropagation();
              onSelect?.(node.id);
            }}
            style={{ cursor: readOnly ? 'default' : 'pointer' }}
          >
            <rect x={-nodeWidth / 2} y={-nodeHeight / 2} width={nodeWidth} height={nodeHeight} rx={isSpace ? 0.25 : 0.9} fill={fill} stroke={selected ? 'var(--route-blue, #176b87)' : node.kind === 'ramp_landing' ? '#a76b28' : '#244b59'} strokeWidth={selected ? 0.55 : 0.3} />
            {node.status === 'closed' && isSpace && <path d="M -0.8 -1.7 L 0.8 1.7 M 0.8 -1.7 L -0.8 1.7" stroke="var(--danger-red, #a33131)" strokeWidth="0.45" />}
            {!isSpace && node.kind === 'entrance' && <path d="M -0.6 0.45 L 0 -0.55 L 0.6 0.45" fill="none" stroke="#176b87" strokeWidth="0.35" />}
            {!isSpace && node.kind === 'ramp_landing' && <path d="M -0.6 0 L 0.6 0 M 0.15 -0.45 L 0.6 0 L 0.15 0.45" fill="none" stroke="#a76b28" strokeWidth="0.3" />}
            <text x={nodeWidth / 2 + 0.8} y={isSpace ? 0.7 : 0.8} fontSize="1.75" fill="var(--ink, #18323d)" transform={`rotate(${-node.headingDegrees} ${nodeWidth / 2 + 0.8} ${isSpace ? 0.7 : 0.8})`} pointerEvents="none">
              {node.label}
            </text>
          </g>
        );
      })}
      <text x="4" y="60.5" fontSize="1.8" fill="#49636d" pointerEvents="none">{map.floors.find((floor) => floor.id === floorId)?.label ?? floorId} · metres</text>
    </svg>
  );
}

export default MapCanvas;
