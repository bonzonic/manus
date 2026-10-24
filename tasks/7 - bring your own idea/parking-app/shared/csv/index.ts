import Papa from 'papaparse';
import type { CsvPort } from '../contracts/csv';
import type { ParkingMap, Issue, Result } from '../contracts/model';
import { MAP_LIMITS } from '../contracts/model';
import { canonicalizeMap, validateMap } from '../contracts/validation';

export const CSV_HEADER = ['record_type','schema_version','id','label','level','elevation_m','floor_id','node_kind','x_m','y_m','heading_deg','status','edge_kind','from_node_id','to_node_id','direction','length_m','speed_mps','enabled'];
const fields: Record<string, string[]> = {
  map: ['record_type','schema_version','id','label'], floor: ['record_type','id','label','level','elevation_m'],
  node: ['record_type','id','label','floor_id','node_kind','x_m','y_m','heading_deg','status'],
  edge: ['record_type','id','label','edge_kind','from_node_id','to_node_id','direction','length_m','speed_mps','enabled']
};
const numericPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;
const error = (code: string, message: string, row?: number, column?: string): Issue => ({ code, path: column ?? '$', message, row, column });
function physicalRows(text: string): number[] {
  const rows = [1]; let quoted = false, line = 1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"') { if (quoted && text[i + 1] === '"') i++; else quoted = !quoted; }
    else if (text[i] === '\n') { line++; if (!quoted) rows.push(line); }
    else if (text[i] === '\r' && text[i + 1] !== '\n') { line++; if (!quoted) rows.push(line); }
  }
  return rows;
}

function parse(text: string): Result<ParkingMap> {
  if (new TextEncoder().encode(text).length > MAP_LIMITS.maxInputBytes) return { ok: false, errors: [error('INPUT_TOO_LARGE', 'CSV must be at most 2 MiB.')] };
  text = text.replace(/^\ufeff/, '');
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: false, dynamicTyping: false });
  const lineNumbers = physicalRows(text);
  if (parsed.errors.length) return { ok: false, errors: parsed.errors.map(e => error('INVALID_CSV', e.message, lineNumbers[e.row ?? 0])) };
  const records = parsed.data.map((cells, i) => ({ cells, row: lineNumbers[i] ?? i + 1 })).filter(r => !r.cells.every(c => c === ''));
  const header = records.shift()?.cells;
  if (!header || header.length !== CSV_HEADER.length || new Set(header).size !== header.length || CSV_HEADER.some(h => !header.includes(h))) return { ok: false, errors: [error('INVALID_HEADER', 'CSV header must contain each documented column exactly once, with no extra columns.', 1)] };
  const errors: Issue[] = [];
  const floors: Record<string, unknown>[] = [], nodes: Record<string, unknown>[] = [], edges: Record<string, unknown>[] = [];
  const sourceRows: Record<string, number[]> = { floors: [], nodes: [], edges: [] };
  let metadata: Record<string, unknown> | undefined;
  let mapRow = 2;
  for (const record of records) {
    if (record.cells.length !== header.length) { errors.push(error('INVALID_ROW', 'Row has the wrong number of cells.', record.row)); continue; }
    const values = Object.fromEntries(header.map((h, i) => [h, record.cells[i]])) as Record<string, string>;
    const type = values.record_type, allowed = fields[type];
    if (!allowed) { errors.push(error('INVALID_RECORD', 'Unknown record type.', record.row, 'record_type')); continue; }
    for (const key of header) if (!allowed.includes(key) && values[key] !== '') errors.push(error('UNEXPECTED_CELL', `Column ${key} must be blank for ${type} rows.`, record.row, key));
    for (const key of allowed) if (key !== 'status' && values[key] === '') errors.push(error('MISSING_CELL', `Column ${key} is required.`, record.row, key));
    const number = (key: string) => {
      const value = values[key];
      if (!numericPattern.test(value) || !Number.isFinite(Number(value))) { errors.push(error('INVALID_NUMBER', `${key} must be a finite number.`, record.row, key)); return 0; }
      return Number(value);
    };
    if (type === 'map') {
      if (metadata) errors.push(error('DUPLICATE_MAP', 'CSV must contain exactly one map row.', record.row));
      if (values.schema_version !== '1') errors.push(error('UNSUPPORTED_VERSION', 'Only CSV schema version 1 is supported.', record.row, 'schema_version'));
      metadata = { schemaVersion: 1, id: values.id, name: values.label }; mapRow = record.row;
    } else if (type === 'floor') {
      floors.push({ id: values.id, label: values.label, level: number('level'), elevationMeters: number('elevation_m') }); sourceRows.floors.push(record.row);
    } else if (type === 'node') {
      const node: Record<string, unknown> = { id: values.id, label: values.label, floorId: values.floor_id, kind: values.node_kind, x: number('x_m'), y: number('y_m'), headingDegrees: number('heading_deg') };
      if (values.status !== '') node.status = values.status;
      nodes.push(node); sourceRows.nodes.push(record.row);
    } else {
      if (!['true','false'].includes(values.enabled)) errors.push(error('INVALID_BOOLEAN', 'enabled must be true or false.', record.row, 'enabled'));
      edges.push({ id: values.id, label: values.label, kind: values.edge_kind, fromNodeId: values.from_node_id, toNodeId: values.to_node_id, direction: values.direction, lengthMeters: number('length_m'), speedMps: number('speed_mps'), enabled: values.enabled === 'true' }); sourceRows.edges.push(record.row);
    }
  }
  if (!metadata) errors.push(error('MISSING_MAP', 'CSV requires one map row.'));
  if (errors.length) return { ok: false, errors };
  const validated = validateMap({ ...metadata, floors, nodes, edges });
  if (!validated.ok) {
    const columns: Record<string, string> = { floorId:'floor_id', kind:'node_kind', x:'x_m', y:'y_m', headingDegrees:'heading_deg', fromNodeId:'from_node_id', toNodeId:'to_node_id', lengthMeters:'length_m', speedMps:'speed_mps', elevationMeters:'elevation_m', name:'label' };
    return { ok: false, errors: validated.errors.map(issue => {
      const match = issue.path.match(/^(floors|nodes|edges)\[(\d+)\](?:\.(\w+))?/);
      const field = match?.[3];
      return { ...issue, row: match ? sourceRows[match[1]][Number(match[2])] : mapRow, column: field ? (field === 'kind' && match?.[1] === 'edges' ? 'edge_kind' : columns[field] ?? field) : undefined };
    }) };
  }
  return { ok: true, value: canonicalizeMap(validated.value) };
}

function serialize(input: ParkingMap): string {
  const map = canonicalizeMap(input);
  const rows: Record<string, string | number | boolean>[] = [{ record_type:'map', schema_version:1, id:map.id, label:map.name }];
  for (const f of map.floors) rows.push({ record_type:'floor', id:f.id, label:f.label, level:f.level, elevation_m:f.elevationMeters });
  for (const n of map.nodes) rows.push({ record_type:'node', id:n.id, label:n.label, floor_id:n.floorId, node_kind:n.kind, x_m:n.x, y_m:n.y, heading_deg:n.headingDegrees, ...(n.status ? {status:n.status} : {}) });
  for (const e of map.edges) rows.push({ record_type:'edge', id:e.id, label:e.label, edge_kind:e.kind, from_node_id:e.fromNodeId, to_node_id:e.toNodeId, direction:e.direction, length_m:e.lengthMeters, speed_mps:e.speedMps, enabled:e.enabled });
  return Papa.unparse({ fields:CSV_HEADER, data:rows.map(row => CSV_HEADER.map(key => row[key] ?? '')) }, { newline:'\r\n' }) + '\r\n';
}
export const csv: CsvPort = { parse, serialize };
