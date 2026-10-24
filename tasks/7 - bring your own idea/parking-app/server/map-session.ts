import {
  SessionError,
  canonicalizeMap,
  validateMap,
  type AvailabilityCommand,
  type CreateMapSessionOptions,
  type MapSession,
  type ReplaceMapCommand,
  type SessionChangeReason,
  type SessionListener,
  type Snapshot,
  type StoredMap,
  type ParkingMap
} from '../shared/contracts';

const clone = <T>(value: T): T =>
  typeof structuredClone === 'function'
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);

const versionIsValid = (epoch: unknown, revision: unknown): boolean =>
  typeof epoch === 'string' && epoch.length > 0 && epoch.length <= 128 &&
  typeof revision === 'number' && Number.isSafeInteger(revision) && revision > 0;

export async function createMapSession(options: CreateMapSessionOptions): Promise<MapSession> {
  const loaded = await options.store.load();
  let map: ParkingMap;
  let revision: number;
  if (loaded === null) {
    const checked = validateMap(options.seedMap);
    if (!checked.ok) {
      throw new SessionError('INVALID_INPUT', 400, 'Seed map is invalid', { issues: checked.errors });
    }
    map = canonicalizeMap(checked.value);
    revision = 1;
    try {
      await options.store.save({ revision, map: clone(map) });
    } catch (error) {
      throw new SessionError('PERSISTENCE_FAILED', 500, 'Could not persist the seed map', { issues: [{ code: 'PERSISTENCE_FAILED', path: '$', message: 'Map persistence failed' }] });
    }
  } else {
    if (!versionIsValid('loaded', loaded.revision)) {
      throw new SessionError('INVALID_INPUT', 400, 'Stored revision is invalid');
    }
    const checked = validateMap(loaded.map);
    if (!checked.ok) {
      throw new SessionError('INVALID_INPUT', 400, 'Stored map is invalid', { issues: checked.errors });
    }
    map = canonicalizeMap(checked.value);
    revision = loaded.revision;
  }
  const epoch = options.newEpoch();
  if (!versionIsValid(epoch, revision)) {
    throw new SessionError('INVALID_INPUT', 400, 'Epoch or revision is invalid');
  }

  let state: Snapshot = { epoch, revision, map: clone(map) };
  const listeners = new Set<SessionListener>();
  let mutationQueue: Promise<void> = Promise.resolve();
  const currentVersion = () => ({ epoch: state.epoch, revision: state.revision });
  const snapshot = () => clone(state);
  const runSerial = <T>(operation: () => Promise<T>): Promise<T> => {
    const result = mutationQueue.then(operation, operation);
    mutationQueue = result.then(() => undefined, () => undefined);
    return result;
  };
  const checkVersion = (expectedEpoch: string, expectedRevision: number): void => {
    if (expectedEpoch !== state.epoch || expectedRevision !== state.revision) {
      throw new SessionError('VERSION_CONFLICT', 409, 'Map version is stale', { currentVersion: currentVersion() });
    }
  };
  const checkExpectedInput = (expectedEpoch: unknown, expectedRevision: unknown): void => {
    if (!versionIsValid(expectedEpoch, expectedRevision)) {
      throw new SessionError('INVALID_INPUT', 400, 'Expected epoch and positive revision are required');
    }
  };
  const persistAndPublish = async (nextMap: ParkingMap, reason: SessionChangeReason): Promise<Snapshot> => {
    const next = { epoch: state.epoch, revision: state.revision + 1, map: clone(nextMap) };
    try {
      await options.store.save({ revision: next.revision, map: clone(next.map) });
    } catch (error) {
      throw new SessionError('PERSISTENCE_FAILED', 500, 'Could not persist map change', { issues: [{ code: 'PERSISTENCE_FAILED', path: '$', message: 'Map persistence failed' }] });
    }
    state = next;
    const delivered = snapshot();
    for (const listener of listeners) {
      try { listener(delivered, reason); } catch { /* subscribers cannot break authoritative state */ }
    }
    return delivered;
  };

  return {
    getSnapshot: snapshot,
    replace: (command: ReplaceMapCommand) => runSerial(async () => {
      checkExpectedInput(command.expectedEpoch, command.expectedRevision);
      checkVersion(command.expectedEpoch, command.expectedRevision);
      const checked = validateMap(command.map);
      if (!checked.ok) {
        throw new SessionError('INVALID_INPUT', 400, 'Map is invalid', { issues: checked.errors });
      }
      return persistAndPublish(canonicalizeMap(checked.value), 'layout');
    }),
    setAvailability: (command: AvailabilityCommand) => runSerial(async () => {
      checkExpectedInput(command.expectedEpoch, command.expectedRevision);
      checkVersion(command.expectedEpoch, command.expectedRevision);
      if (typeof command.spaceId !== 'string' || !['free', 'occupied', 'closed'].includes(command.status)) {
        throw new SessionError('INVALID_INPUT', 400, 'Availability command is invalid');
      }
      const index = state.map.nodes.findIndex((node) => node.id === command.spaceId);
      if (index < 0) throw new SessionError('SPACE_NOT_FOUND', 404, `Space ${command.spaceId} was not found`);
      const target = state.map.nodes[index];
      if (target.kind !== 'space') throw new SessionError('NOT_A_SPACE', 400, `${command.spaceId} is not a parking space`);
      if (target.status === command.status) return snapshot();
      const nextMap = clone(state.map);
      nextMap.nodes[index] = { ...nextMap.nodes[index], status: command.status };
      return persistAndPublish(nextMap, 'availability');
    }),
    subscribe: (listener: SessionListener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
