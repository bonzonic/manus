import type { MapStore, StoredMap } from '../shared/contracts';

const clone = <T>(value: T): T =>
  typeof structuredClone === 'function'
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);

export class MemoryMapStore implements MapStore {
  private value: StoredMap | null;

  constructor(initial: StoredMap | null = null) {
    this.value = initial ? clone(initial) : null;
  }

  async load(): Promise<StoredMap | null> {
    return this.value ? clone(this.value) : null;
  }

  async save(value: StoredMap): Promise<void> {
    this.value = clone(value);
  }
}
