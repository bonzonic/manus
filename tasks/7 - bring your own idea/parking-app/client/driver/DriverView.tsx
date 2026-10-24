import { useEffect, useMemo, useRef, useState } from 'react';
import type { DriverViewProps } from '../ui-contracts';
import type { Id, Snapshot } from '../../shared/contracts/model';
import type { Route, RouteResponse } from '../../shared/contracts/routing';

const formatDuration = (seconds: number): string => {
  const rounded = Math.max(0, Math.round(seconds));
  if (rounded < 60) return `${rounded} sec`;
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return remainder ? `${minutes} min ${remainder} sec` : `${minutes} min`;
};

const formatDistance = (meters: number): string =>
  meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;

const outcomeMessage = (response: RouteResponse): string => {
  if (response.outcome.ok) return '';
  if (response.outcome.code === 'NO_AVAILABLE_SPACE') return 'No available parking spaces right now.';
  if (response.outcome.code === 'NO_REACHABLE_SPACE') return 'Available spaces exist, but none are reachable from this start.';
  return response.outcome.message || 'Choose a valid route start.';
};

export function DriverView({ snapshot, connectionState, api, Renderer }: DriverViewProps) {
  const starts = useMemo(
    () => snapshot.map.nodes.filter((node) => node.kind !== 'space'),
    [snapshot.map.nodes]
  );
  const defaultStart = starts.find((node) => node.kind === 'entrance')?.id ?? starts[0]?.id ?? '';
  const [startNodeId, setStartNodeId] = useState<Id>(defaultStart);
  const [floorId, setFloorId] = useState<Id>(snapshot.map.floors[0]?.id ?? '');
  const [route, setRoute] = useState<Route | undefined>();
  const [routeVersion, setRouteVersion] = useState<string>();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsRecalculate, setNeedsRecalculate] = useState(false);
  const requestNumber = useRef(0);
  const versionKey = `${snapshot.epoch}:${snapshot.revision}`;
  const latestVersion = useRef(versionKey);
  latestVersion.current = versionKey;
  const displayedVersion = useRef(versionKey);
  const previousConnection = useRef(connectionState);

  useEffect(() => {
    if (displayedVersion.current !== versionKey) {
      displayedVersion.current = versionKey;
      requestNumber.current += 1;
      setRoute(undefined);
      setRouteVersion(undefined);
      setMessage('Map updated. Recalculate your route.');
      setNeedsRecalculate(true);
      setLoading(false);
    }
  }, [versionKey]);

  useEffect(() => {
    if (connectionState !== 'live' && previousConnection.current === 'live') {
      requestNumber.current += 1;
      setRoute(undefined);
      setRouteVersion(undefined);
      setLoading(false);
      setMessage('Live map connection lost. Recalculate when the connection returns.');
      setNeedsRecalculate(true);
    }
    previousConnection.current = connectionState;
  }, [connectionState]);

  useEffect(() => {
    if (!snapshot.map.floors.some((floor) => floor.id === floorId)) {
      setFloorId(snapshot.map.floors[0]?.id ?? '');
    }
    if (!starts.some((node) => node.id === startNodeId)) setStartNodeId(defaultStart);
  }, [defaultStart, floorId, snapshot.map.floors, startNodeId, starts]);

  const findRoute = async (): Promise<void> => {
    if (!startNodeId || connectionState !== 'live') {
      setMessage('Wait for a live map connection before finding a space.');
      return;
    }
    const requestId = ++requestNumber.current;
    const requestedVersion = versionKey;
    setLoading(true);
    setMessage('Finding the closest available space…');
    try {
      const response = await api.getRoute({
        expectedEpoch: snapshot.epoch,
        expectedRevision: snapshot.revision,
        startNodeId
      });
      if (requestId !== requestNumber.current || requestedVersion !== latestVersion.current) return;
      if (response.epoch !== snapshot.epoch || response.revision !== snapshot.revision) {
        setRoute(undefined);
        setRouteVersion(undefined);
        setMessage('The map changed while routing. Recalculate.');
        return;
      }
      if (!response.outcome.ok) {
        setRoute(undefined);
        setRouteVersion(undefined);
        setMessage(outcomeMessage(response));
        return;
      }
      setRoute(response.outcome.route);
      setRouteVersion(requestedVersion);
      setNeedsRecalculate(false);
      setMessage('');
      const destinationId = response.outcome.route.destinationSpaceId;
      const destination = snapshot.map.nodes.find((node) => node.id === destinationId);
      if (destination) setFloorId(destination.floorId);
    } catch (error) {
      if (requestId !== requestNumber.current) return;
      setRoute(undefined);
      setRouteVersion(undefined);
      setMessage(error instanceof Error ? error.message : 'Could not find a route.');
    } finally {
      if (requestId === requestNumber.current) setLoading(false);
    }
  };

  const displayedRoute = routeVersion === versionKey && connectionState === 'live' ? route : undefined;
  const destination = displayedRoute
    ? snapshot.map.nodes.find((node) => node.id === displayedRoute.destinationSpaceId)
    : undefined;
  const nodeById = new Map(snapshot.map.nodes.map((node) => [node.id, node]));

  return (
    <div className="driver-view" style={{ margin: '0 auto', padding: 16, color: 'var(--ink)' }}>
      <header style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Parking navigator</p>
        <h1 style={{ margin: '4px 0', fontSize: 28 }}>Find your space</h1>
        <p style={{ margin: 0, color: '#64748b' }}>{snapshot.map.name}</p>
      </header>

      <section aria-label="Live map status" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: connectionState === 'live' ? '#087f5b' : '#9a6700', fontSize: 13 }}>
        <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: '50%', background: connectionState === 'live' ? '#12b886' : '#f59f00' }} />
        {connectionState === 'live' ? 'Live availability' : connectionState === 'reconnecting' ? 'Reconnecting…' : connectionState === 'offline' ? 'Offline' : 'Connecting…'}
      </section>

      <section aria-label="Route controls" style={{ border: '1px solid #dbe4f0', borderRadius: 18, padding: 16, background: '#fff' }}>
        <label htmlFor="driver-start" style={{ display: 'block', fontWeight: 700, marginBottom: 7 }}>Start from</label>
        <select id="driver-start" value={startNodeId} onChange={(event) => { setStartNodeId(event.target.value); setRoute(undefined); setRouteVersion(undefined); setMessage(''); requestNumber.current += 1; }} style={{ width: '100%', minHeight: 44, border: '1px solid #cbd5e1', borderRadius: 10, padding: '0 12px', fontSize: 16, background: '#fff' }}>
          {starts.map((node) => <option key={node.id} value={node.id}>{node.label} · {node.kind.replace('_', ' ')}</option>)}
        </select>
        <button type="button" onClick={() => void findRoute()} disabled={loading || !startNodeId || connectionState !== 'live'} style={{ width: '100%', minHeight: 46, marginTop: 12, border: 0, borderRadius: 11, background: loading ? '#94a3b8' : '#2563eb', color: '#fff', fontSize: 16, fontWeight: 800, cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'Finding space…' : displayedRoute || needsRecalculate ? 'Recalculate' : 'Find closest available space'}
        </button>
        {message && <p role="alert" style={{ margin: '12px 0 0', color: '#9a3412', lineHeight: 1.4 }}>{message}</p>}
      </section>

      <section aria-label="Parking floors" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '16px 0 12px' }}>
        {snapshot.map.floors.map((floor) => <button key={floor.id} type="button" onClick={() => setFloorId(floor.id)} aria-pressed={floor.id === floorId} style={{ flex: '0 0 auto', border: floor.id === floorId ? '2px solid #2563eb' : '1px solid #cbd5e1', borderRadius: 999, padding: '8px 13px', background: floor.id === floorId ? '#eff6ff' : '#fff', color: '#1e40af', fontWeight: 700 }}>{floor.label}</button>)}
      </section>

      <section aria-label="Parking map" style={{ overflow: 'hidden', borderRadius: 16, border: '1px solid #dbe4f0', background: '#f8fafc', minHeight: 190 }}>
        <Renderer map={snapshot.map} floorId={floorId} selectedId={destination?.id} route={displayedRoute} readOnly />
      </section>

      {displayedRoute && destination && <section aria-label="Route summary" style={{ marginTop: 16, border: '1px solid #bfdbfe', borderRadius: 16, padding: 16, background: '#eff6ff' }}>
        <p style={{ margin: 0, color: '#1d4ed8', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Closest available space</p>
        <h2 style={{ margin: '5px 0 8px', fontSize: 23 }}>{destination.label}</h2>
        <p style={{ margin: 0, color: '#334155' }}>{formatDuration(displayedRoute.totalDurationSeconds)} · {formatDistance(displayedRoute.totalDistanceMeters)} · {snapshot.map.floors.find((floor) => floor.id === destination.floorId)?.label ?? destination.floorId}</p>
        <ol aria-label="Route steps" style={{ margin: '16px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
          {displayedRoute.segments.map((segment, index) => {
            const from = nodeById.get(segment.fromNodeId);
            const to = nodeById.get(segment.toNodeId);
            const isRamp = segment.kind === 'ramp';
            const movement = isRamp ? (segment.movement === 'up' ? 'Ramp up' : 'Ramp down') : 'Continue';
            return <li key={`${segment.edgeId}-${index}`}><button type="button" onClick={() => setFloorId(segment.toFloorId)} style={{ width: '100%', textAlign: 'left', border: '1px solid #dbeafe', borderRadius: 10, padding: '10px 12px', background: '#fff', color: '#1e293b' }}><strong>{index + 1}. {movement}</strong><br /><span style={{ fontSize: 13, color: '#64748b' }}>{from?.label ?? segment.fromNodeId} → {to?.label ?? segment.toNodeId} · {formatDistance(segment.distanceMeters)} · {formatDuration(segment.durationSeconds)}</span></button></li>;
          })}
        </ol>
      </section>}
    </div>
  );
}
