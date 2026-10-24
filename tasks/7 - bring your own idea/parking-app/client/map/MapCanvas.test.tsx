// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import type { ParkingMap } from '../../shared/contracts/model';
import { MapCanvas } from './MapCanvas';

Object.defineProperty(window, 'PointerEvent', { value: MouseEvent, configurable: true });
afterEach(cleanup);

const map: ParkingMap = {
  schemaVersion: 1,
  id: 'm',
  name: 'Test lot',
  floors: [{ id: 'ground', label: 'Ground', level: 0, elevationMeters: 0 }],
  nodes: [
    { id: 'j1', label: 'Junction 1', kind: 'junction', floorId: 'ground', x: 20, y: 30, headingDegrees: 0 },
    { id: 's1', label: 'Space 1', kind: 'space', floorId: 'ground', x: 30, y: 30, headingDegrees: 0, status: 'free' }
  ],
  edges: [{ id: 'a1', label: 'Access', kind: 'parking_access', fromNodeId: 'j1', toNodeId: 's1', direction: 'forward', enabled: true, lengthMeters: 10, speedMps: 1 }]
};

describe('MapCanvas', () => {
  it('renders technical-board geometry and reports SVG metre coordinates', () => {
    const onBackgroundPoint = vi.fn();
    const { container, getByText } = render(
      <MapCanvas map={map} floorId="ground" readOnly={false} onBackgroundPoint={onBackgroundPoint} />
    );
    expect(container.querySelector('svg')).toBeTruthy();
    expect(getByText('Space 1')).toBeTruthy();
    fireEvent.pointerDown(container.querySelector('svg')!, { clientX: 55, clientY: 25 });
    expect(onBackgroundPoint).toHaveBeenCalled();
    expect(onBackgroundPoint.mock.calls[0][0].x).toBeGreaterThanOrEqual(0);
  });

  it('selects nodes without bubbling to the background', () => {
    const onSelect = vi.fn();
    const onBackgroundPoint = vi.fn();
    const { getByLabelText } = render(
      <MapCanvas map={map} floorId="ground" readOnly={false} onSelect={onSelect} onBackgroundPoint={onBackgroundPoint} />
    );
    fireEvent.pointerDown(getByLabelText('Junction 1'));
    expect(onSelect).toHaveBeenCalledWith('j1');
    expect(onBackgroundPoint).not.toHaveBeenCalled();
  });
});
