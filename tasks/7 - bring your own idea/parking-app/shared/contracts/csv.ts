import type { ParkingMap, Result } from './model';

export interface CsvPort {
  parse(text: string): Result<ParkingMap>;
  serialize(map: ParkingMap): string;
}
