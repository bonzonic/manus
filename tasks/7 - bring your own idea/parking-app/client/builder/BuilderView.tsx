import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { BuilderViewProps } from '../ui-contracts';
import type { Edge, EdgeKind, Floor, Node, NodeKind, ParkingMap, Point, Direction, Snapshot } from '../../shared/contracts/model';
import { EDITOR_DEFAULTS } from '../../shared/contracts/model';
import { validateMap, getMapWarnings } from '../../shared/contracts/validation';
import '../styles/tokens.css';

export type BuilderTool = 'select' | 'road' | 'space' | 'entrance' | 'ramp';

const clone = <T,>(value: T): T => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
};

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(idCounter += 1).toString(36)}`;
const distance = (a: Node, b: Node) => Math.hypot(a.x - b.x, a.y - b.y);
const nodeCanConnect = (node: Node) => node.kind !== 'space';

export function validateRampDraft(map: ParkingMap, sourceId: string, destinationId: string): string | null {
  const source = map.nodes.find((node) => node.id === sourceId);
  const destination = map.nodes.find((node) => node.id === destinationId);
  if (!source || !destination) return 'Choose both a source landing and a destination node.';
  if (source.id === destination.id) return 'Ramp endpoints must be different nodes.';
  if (source.floorId === destination.floorId) return 'Ramp endpoints must be on different floors.';
  if (!nodeCanConnect(source) || !nodeCanConnect(destination)) return 'Ramp endpoints cannot be parking spaces.';
  const sourceFloor = map.floors.find((floor) => floor.id === source.floorId);
  const destinationFloor = map.floors.find((floor) => floor.id === destination.floorId);
  if (!sourceFloor || !destinationFloor) return 'Ramp endpoint floor is missing.';
  return null;
}

function freshMap(): ParkingMap {
  return {
    schemaVersion: 1,
    id: nextId('lot'),
    name: 'New parking lot',
    floors: [{ id: 'ground', label: 'Ground', level: 0, elevationMeters: 0 }],
    nodes: [],
    edges: []
  };
}

function edgeFromNodes(id: string, label: string, kind: EdgeKind, from: Node, to: Node, direction: Direction = 'both', speedMps: number = EDITOR_DEFAULTS.roadSpeedMps): Edge {
  return { id, label, kind, fromNodeId: from.id, toNodeId: to.id, direction: kind === 'parking_access' ? 'forward' : direction, enabled: true, lengthMeters: distance(from, to), speedMps };
}

const controlStyle = { border: '1px solid var(--line, #b8c7cd)', borderRadius: 'var(--radius-control, 8px)', padding: '7px 9px', background: 'var(--white, #fff)', color: 'var(--ink, #18323d)', font: 'inherit' } as const;
const panelStyle = { background: 'rgba(255,255,255,.82)', border: '1px solid var(--line, #b8c7cd)', borderRadius: 'var(--radius-control, 8px)', padding: 12 } as const;

export function BuilderView({ snapshot, csv, api, managementToken, Renderer, onSaved }: BuilderViewProps) {
  const [draft, setDraft] = useState<ParkingMap>(() => clone(snapshot.map));
  const [base, setBase] = useState({ epoch: snapshot.epoch, revision: snapshot.revision });
  const [dirty, setDirty] = useState(false);
  const [floorId, setFloorId] = useState(snapshot.map.floors[0]?.id ?? '');
  const [tool, setTool] = useState<BuilderTool>('select');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | undefined>();
  const [notice, setNotice] = useState('Select a tool, then click the map to place geometry.');
  const [saving, setSaving] = useState(false);
  const [rampDestinationFloorId, setRampDestinationFloorId] = useState('');
  const [rampDestinationNodeId, setRampDestinationNodeId] = useState('');
  const [rampLength, setRampLength] = useState('10');
  const [rampSpeed, setRampSpeed] = useState(String(EDITOR_DEFAULTS.rampSpeedMps));
  const [rampDirection, setRampDirection] = useState<Direction>('both');

  useEffect(() => {
    if (dirty) return;
    const incoming = clone(snapshot.map);
    setDraft(incoming);
    setBase({ epoch: snapshot.epoch, revision: snapshot.revision });
    setFloorId((current) => incoming.floors.some((floor) => floor.id === current) ? current : (incoming.floors[0]?.id ?? ''));
  }, [snapshot, dirty]);

  const selectedNode = useMemo(() => draft.nodes.find((node) => node.id === selectedId), [draft.nodes, selectedId]);
  const selectedEdge = useMemo(() => draft.edges.find((edge) => edge.id === selectedEdgeId), [draft.edges, selectedEdgeId]);
  const currentFloor = draft.floors.find((floor) => floor.id === floorId);
  const destinationNodes = draft.nodes.filter((node) => node.floorId === rampDestinationFloorId && node.kind !== 'space');

  const commit = (next: ParkingMap, message?: string) => {
    const byId = new Map(next.nodes.map(node => [node.id, node]));
    next = { ...next, edges: next.edges.map(edge => {
      const from = byId.get(edge.fromNodeId), to = byId.get(edge.toNodeId);
      return edge.kind !== 'ramp' && from && to ? { ...edge, lengthMeters: distance(from, to) } : edge;
    }) };
    const checked = validateMap(next);
    if (!checked.ok) { setNotice(`Edit rejected: ${checked.errors[0].message}`); return false; }
    setDraft(checked.value);
    setDirty(true);
    if (message) setNotice(message);
    return true;
  };

  const updateNode = (id: string, patch: Partial<Node>) => {
    commit({ ...draft, nodes: draft.nodes.map((node) => node.id === id ? { ...node, ...patch } : node) });
  };

  const updateEdge = (id: string, patch: Partial<Edge>) => {
    commit({ ...draft, edges: draft.edges.map((edge) => edge.id === id ? { ...edge, ...patch } : edge) });
  };

  const handleBackgroundPoint = (point: Point) => {
    if (!currentFloor || tool === 'select') return;
    const nodeKind: NodeKind = tool === 'space' ? 'space' : tool === 'entrance' ? 'entrance' : tool === 'ramp' ? 'ramp_landing' : 'junction';
    const node: Node = {
      id: nextId(nodeKind),
      label: `${nodeKind === 'space' ? 'Space' : nodeKind === 'ramp_landing' ? 'Ramp landing' : nodeKind === 'entrance' ? 'Entrance' : 'Junction'} ${draft.nodes.length + 1}`,
      kind: nodeKind,
      floorId: currentFloor.id,
      x: Math.round(point.x),
      y: Math.round(point.y),
      headingDegrees: 0,
      ...(nodeKind === 'space' ? { status: 'free' as const } : {})
    };
    const next = clone(draft);
    next.nodes.push(node);
    const source = selectedId ? next.nodes.find((candidate) => candidate.id === selectedId) : undefined;
    if (nodeKind === 'junction' && source && source.id !== node.id && source.floorId === node.floorId && nodeCanConnect(source)) {
      next.edges.push(edgeFromNodes(nextId('road'), 'Road', 'road', source, node));
      setNotice('Road junction placed and connected to the selected endpoint.');
    } else if (nodeKind === 'space' && source && source.floorId === node.floorId && nodeCanConnect(source)) {
      next.edges.push(edgeFromNodes(nextId('access'), 'Parking access', 'parking_access', source, node, 'forward', EDITOR_DEFAULTS.accessSpeedMps));
      setNotice('Space placed with explicit parking access to the selected endpoint.');
    } else if (nodeKind === 'space') {
      setNotice('Space placed unattached; select a same-floor junction and add access later.');
    } else if (nodeKind === 'ramp_landing') {
      setNotice('Ramp landing placed. Use the ramp form to choose its destination floor and node.');
    } else {
      setNotice(`${node.label} placed.`);
    }
    if (!commit(next)) return;
    setSelectedId(node.id);
    setSelectedEdgeId(undefined);
    if (nodeKind === 'ramp_landing') {
      setRampDestinationFloorId(next.floors.find((floor) => floor.id !== node.floorId)?.id ?? '');
      setRampDestinationNodeId('');
    }
  };

  const addFloor = () => {
    const highest = draft.floors.reduce((max, floor) => Math.max(max, floor.level), -1);
    const elevation = draft.floors.length ? Math.max(...draft.floors.map(f => f.elevationMeters)) + 3.2 : 0;
    const floor: Floor = { id: nextId('floor'), label: `Floor ${highest + 1}`, level: highest + 1, elevationMeters: elevation };
    if (!commit({ ...draft, floors: [...draft.floors, floor] }, `${floor.label} added.`)) return;
    setFloorId(floor.id);
  };

  const newLot = () => {
    const next = freshMap();
    commit(next, 'New lot draft created; save to make it authoritative.');
    setFloorId(next.floors[0].id);
    setSelectedId(undefined);
    setSelectedEdgeId(undefined);
  };

  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = csv.parse(await file.text());
    if (!result.ok) {
      setNotice(`CSV import rejected: ${result.errors[0]?.message ?? 'invalid CSV'}`);
      return;
    }
    const next = clone(result.value);
    commit(next, 'CSV imported as a draft; save to publish it.');
    setFloorId(next.floors[0]?.id ?? '');
    setSelectedId(undefined);
    event.target.value = '';
  };

  const exportCsv = () => {
    const blob = new Blob([csv.serialize(draft)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${draft.name.replace(/[^A-Za-z0-9_-]+/g, '-').toLowerCase() || 'parking-map'}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Draft CSV exported.');
  };

  const save = async () => {
    setSaving(true);
    try {
      const saved = await api.replaceMap({ expectedEpoch: base.epoch, expectedRevision: base.revision, map: clone(draft) }, managementToken);
      setDraft(clone(saved.map));
      setBase({ epoch: saved.epoch, revision: saved.revision });
      setDirty(false);
      setNotice(`Saved revision ${saved.revision}.`);
      onSaved(saved);
    } catch (error) {
      const candidate = error as { code?: string; status?: number; message?: string; currentVersion?: { epoch: string; revision: number } };
      if (candidate.code === 'VERSION_CONFLICT' || candidate.status === 409 || candidate.currentVersion) {
        setNotice(`Save conflict at revision ${candidate.currentVersion?.revision ?? 'latest'}; your dirty draft was preserved. Export or reload before retrying.`);
      } else {
        setNotice(`Save failed: ${candidate.message ?? 'unknown error'}; your dirty draft was preserved.`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = (id: string) => {
    const target = draft.nodes.find(node => node.id === id);
    if (selectedNode && target && selectedNode.id !== target.id && selectedNode.floorId === target.floorId && nodeCanConnect(selectedNode)) {
      if (tool === 'road' && nodeCanConnect(target)) commit({ ...draft, edges: [...draft.edges, edgeFromNodes(nextId('road'), 'Road', 'road', selectedNode, target)] }, 'Existing junctions connected.');
      if (tool === 'space' && target.kind === 'space' && !draft.edges.some(edge => edge.kind === 'parking_access' && edge.toNodeId === target.id)) commit({ ...draft, edges: [...draft.edges, edgeFromNodes(nextId('access'), 'Parking access', 'parking_access', selectedNode, target, 'forward', EDITOR_DEFAULTS.accessSpeedMps)] }, 'Existing space attached.');
    }
    setSelectedId(id); setSelectedEdgeId(undefined);
  };

  const createRamp = () => {
    if (!selectedNode) {
      setNotice('Select a source landing or junction before creating a ramp.');
      return;
    }
    const error = validateRampDraft(draft, selectedNode.id, rampDestinationNodeId);
    const length = Number(rampLength);
    const speed = Number(rampSpeed);
    if (error) {
      setNotice(error);
      return;
    }
    if (!(length > 0) || !(speed > 0) || !Number.isFinite(length) || !Number.isFinite(speed)) {
      setNotice('Ramp length and speed must be positive finite numbers.');
      return;
    }
    const destination = draft.nodes.find((node) => node.id === rampDestinationNodeId);
    if (!destination) return;
    const next = clone(draft);
    next.nodes = next.nodes.map((node) => {
      if (node.id !== selectedNode.id && node.id !== destination.id) return node;
      const { status: _status, ...withoutStatus } = node;
      return { ...withoutStatus, kind: 'ramp_landing' as const };
    });
    const ramp: Edge = { id: nextId('ramp'), label: `Ramp ${selectedNode.label} → ${destination.label}`, kind: 'ramp', fromNodeId: selectedNode.id, toNodeId: destination.id, direction: rampDirection, enabled: true, lengthMeters: length, speedMps: speed };
    next.edges.push(ramp);
    if (!commit(next, 'Ramp created; both endpoints promoted to ramp landings.')) return;
    setSelectedEdgeId(ramp.id);
  };

  const selectedTools: BuilderTool[] = ['select', 'road', 'space', 'entrance', 'ramp'];
  const labelForTool = (value: BuilderTool) => value[0].toUpperCase() + value.slice(1);

  return (
    <div className="builder-view" style={{ minHeight: '100%', padding: 'var(--space-4, 16px)', background: 'var(--paper, #f4f7f8)', color: 'var(--ink, #18323d)', fontFamily: 'var(--font-ui, Segoe UI, sans-serif)' }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <p style={{ margin: 0, color: 'var(--muted-ink, #49636d)', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}>Parking Navigator / Builder</p>
          <h1 style={{ margin: '3px 0 0', fontSize: 24 }}>{draft.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" style={controlStyle} onClick={newLot}>New lot</button>
          <button type="button" style={controlStyle} onClick={addFloor}>Add floor</button>
          <label style={{ ...controlStyle, cursor: 'pointer' }}>Import CSV<input type="file" accept=".csv,text/csv" onChange={importCsv} style={{ display: 'none' }} /></label>
          <button type="button" style={controlStyle} onClick={exportCsv}>Export CSV</button>
          <button type="button" style={{ ...controlStyle, background: 'var(--route-blue, #176b87)', color: 'white', borderColor: 'var(--route-blue, #176b87)' }} onClick={save} disabled={saving || !managementToken}>{saving ? 'Saving…' : !managementToken ? 'Load key to save' : dirty ? 'Save draft' : 'Save'}</button>
        </div>
      </header>
      <div role="status" style={{ minHeight: 26, marginBottom: 10, color: notice.toLowerCase().includes('conflict') ? 'var(--danger-red, #a33131)' : 'var(--muted-ink, #49636d)' }}>{notice}</div>
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 320px)', gap: 12, alignItems: 'start' }}>
        <div>
          <div style={{ ...panelStyle, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600 }}>Floor
              <select value={floorId} onChange={(event) => setFloorId(event.target.value)} style={controlStyle}>
                {draft.floors.map((floor) => <option key={floor.id} value={floor.id}>{floor.label} · L{floor.level}</option>)}
              </select>
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} aria-label="Editing tools">
              {selectedTools.map((value) => <button key={value} type="button" aria-pressed={tool === value} style={{ ...controlStyle, background: tool === value ? 'var(--ink, #18323d)' : 'var(--white, #fff)', color: tool === value ? 'white' : 'var(--ink, #18323d)' }} onClick={() => setTool(value)}>{labelForTool(value)}</button>)}
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted-ink, #49636d)' }}>{dirty ? 'Draft changed' : `Base ${base.epoch} / r${base.revision}`}</span>
          </div>
          <Renderer map={draft} floorId={floorId} selectedId={selectedId ?? selectedEdgeId} readOnly={saving} onSelect={handleSelect} onBackgroundPoint={handleBackgroundPoint} />
          <div style={{ display: 'flex', gap: 16, marginTop: 8, color: 'var(--muted-ink, #49636d)', fontSize: 12 }}>
            <span aria-label="Draft nodes">Draft nodes: {draft.nodes.length}</span>
            <span aria-label="Draft edges">Draft edges: {draft.edges.length}</span>
            <span>Green free · hatch occupied · cross closed</span>
          </div>
        </div>
        <aside style={{ display: 'grid', gap: 10 }}>
          <section style={panelStyle}>
            <h2 style={{ margin: '0 0 8px', fontSize: 15 }}>Node inspector</h2>
            {selectedNode ? <div style={{ display: 'grid', gap: 8 }}>
              <small style={{ color: 'var(--muted-ink, #49636d)' }}>{selectedNode.kind} · {selectedNode.id}</small>
              <label>Node label<input aria-label="Node label" value={selectedNode.label} onChange={(event) => updateNode(selectedNode.id, { label: event.target.value })} style={{ ...controlStyle, width: '100%', boxSizing: 'border-box' }} /></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <label>X (m)<input aria-label="Node x" type="number" value={selectedNode.x} onChange={(event) => updateNode(selectedNode.id, { x: Number(event.target.value) })} style={{ ...controlStyle, width: '100%', boxSizing: 'border-box' }} /></label>
                <label>Y (m)<input aria-label="Node y" type="number" value={selectedNode.y} onChange={(event) => updateNode(selectedNode.id, { y: Number(event.target.value) })} style={{ ...controlStyle, width: '100%', boxSizing: 'border-box' }} /></label>
              </div>
              {selectedNode.kind === 'space' && <label>Status<select aria-label="Space status" value={selectedNode.status} onChange={(event) => updateNode(selectedNode.id, { status: event.target.value as Node['status'] })} style={{ ...controlStyle, width: '100%' }}><option value="free">free</option><option value="occupied">occupied</option><option value="closed">closed</option></select></label>}
            </div> : <p style={{ margin: 0, color: 'var(--muted-ink, #49636d)' }}>Select a node on the map.</p>}
          </section>
          <section style={panelStyle}>
            <h2 style={{ margin: '0 0 8px', fontSize: 15 }}>Edge inspector</h2>
            <div style={{ display: 'grid', gap: 5, maxHeight: 145, overflow: 'auto', marginBottom: 8 }}>
              {draft.edges.map((edge) => <button key={edge.id} type="button" aria-label={`Select edge ${edge.label}`} onClick={() => { setSelectedEdgeId(edge.id); setSelectedId(undefined); }} style={{ ...controlStyle, textAlign: 'left', background: selectedEdgeId === edge.id ? '#e4f0f3' : 'var(--white, #fff)' }}>{edge.label} <small>· {edge.kind}</small></button>)}
              {draft.edges.length === 0 && <small style={{ color: 'var(--muted-ink, #49636d)' }}>No edges yet. Select a junction before placing a space or road.</small>}
            </div>
            {selectedEdge ? <div style={{ display: 'grid', gap: 8 }}>
              <small>{selectedEdge.fromNodeId} → {selectedEdge.toNodeId} · {selectedEdge.lengthMeters.toFixed(1)} m</small>
              <label>Direction<select aria-label="Edge direction" value={selectedEdge.direction} onChange={(event) => updateEdge(selectedEdge.id, { direction: event.target.value as Direction })} style={{ ...controlStyle, width: '100%' }}><option value="forward">forward</option><option value="reverse">reverse</option><option value="both">both</option></select></label>
              <label>Speed (m/s)<input aria-label="Edge speed" type="number" min="0.01" step="0.01" value={selectedEdge.speedMps} onChange={(event) => updateEdge(selectedEdge.id, { speedMps: Number(event.target.value) })} style={{ ...controlStyle, width: '100%', boxSizing: 'border-box' }} /></label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input aria-label="Edge enabled" type="checkbox" checked={selectedEdge.enabled} onChange={(event) => updateEdge(selectedEdge.id, { enabled: event.target.checked })} /> Enabled</label>
            </div> : <p style={{ margin: 0, color: 'var(--muted-ink, #49636d)' }}>Select an edge to edit direction, speed, or enabled state.</p>}
          </section>
          <section style={panelStyle}>
            <h2 style={{ margin: '0 0 8px', fontSize: 15 }}>Direct ramp</h2>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--muted-ink, #49636d)' }}>Select a source junction/landing, then a destination on any other floor. Length must cover the 3D separation. Skipped floors have no implicit exits.</p>
            <div style={{ display: 'grid', gap: 8 }}>
              <label>Destination floor<select aria-label="Ramp destination floor" value={rampDestinationFloorId} onChange={(event) => { setRampDestinationFloorId(event.target.value); setRampDestinationNodeId(''); }} style={{ ...controlStyle, width: '100%' }}><option value="">Choose floor</option>{draft.floors.filter((floor) => floor.id !== selectedNode?.floorId).map((floor) => <option key={floor.id} value={floor.id}>{floor.label} · L{floor.level}</option>)}</select></label>
              <label>Destination node<select aria-label="Ramp destination node" value={rampDestinationNodeId} onChange={(event) => setRampDestinationNodeId(event.target.value)} style={{ ...controlStyle, width: '100%' }}><option value="">Choose node</option>{destinationNodes.map((node) => <option key={node.id} value={node.id}>{node.label} · {node.kind}</option>)}</select></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><label>Length (m)<input aria-label="Ramp length" type="number" min="0.01" value={rampLength} onChange={(event) => setRampLength(event.target.value)} style={{ ...controlStyle, width: '100%', boxSizing: 'border-box' }} /></label><label>Speed<input aria-label="Ramp speed" type="number" min="0.01" value={rampSpeed} onChange={(event) => setRampSpeed(event.target.value)} style={{ ...controlStyle, width: '100%', boxSizing: 'border-box' }} /></label></div>
              <label>Direction<select aria-label="Ramp direction" value={rampDirection} onChange={(event) => setRampDirection(event.target.value as Direction)} style={{ ...controlStyle, width: '100%' }}><option value="forward">forward</option><option value="reverse">reverse</option><option value="both">both</option></select></label>
              <button type="button" style={{ ...controlStyle, background: 'var(--alert-amber, #9a5b00)', color: 'white', borderColor: 'var(--alert-amber, #9a5b00)' }} onClick={createRamp}>Create ramp</button>
            </div>
          </section>
        </aside>
      </section>
      {getMapWarnings(draft).length > 0 && <p className="draft-warning">{getMapWarnings(draft).map(w => w.message).join('. ')}</p>}
      <style>{`@media (max-width: 850px) { .builder-view > section { grid-template-columns: 1fr !important; } } .builder-view label { display: grid; gap: 4px; font-size: 12px; font-weight: 600; }`}</style>
    </div>
  );
}

export default BuilderView;
