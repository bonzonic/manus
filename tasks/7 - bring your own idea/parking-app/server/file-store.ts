import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, basename, join } from 'node:path';
import type { MapStore, StoredMap } from '../shared/contracts';

const clone = <T>(value: T): T =>
  typeof structuredClone === 'function'
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);

export class FileMapStore implements MapStore {
  constructor(private readonly filePath: string) {}

  async load(): Promise<StoredMap | null> {
    try {
      const text = await readFile(this.filePath, 'utf8');
      return clone(JSON.parse(text) as StoredMap);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  async save(value: StoredMap): Promise<void> {
    const directory = dirname(this.filePath);
    await mkdir(directory, { recursive: true });
    const temporary = join(directory, `.${basename(this.filePath)}.${process.pid}.${Date.now()}.tmp`);
    try {
      await writeFile(temporary, JSON.stringify(value), 'utf8');
      await rename(temporary, this.filePath);
    } catch (error) {
      try {
        const { unlink } = await import('node:fs/promises');
        await unlink(temporary);
      } catch {
        // Preserve the original persistence error.
      }
      throw error;
    }
  }
}
