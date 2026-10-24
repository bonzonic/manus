// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import type { ParkingApi } from '../../shared/contracts/client';
import type { CsvPort } from '../../shared/contracts/csv';
import type { ParkingMap, Snapshot } from '../../shared/contracts/model';
import { BuilderView, validateRampDraft } from './BuilderView';
import { MapCanvas } from '../map/MapCanvas';
Object.defineProperty(window, 'PointerEvent', { value: MouseEvent, configurable: true });
afterEach(cleanup);
const map: ParkingMap = { schemaVersion:1,id:'m',name:'Test lot',floors:[{id:'ground',label:'Ground',level:0,elevationMeters:0},{id:'roof',label:'Roof',level:5,elevationMeters:15}],nodes:[{id:'j1',label:'Junction 1',kind:'junction',floorId:'ground',x:20,y:30,headingDegrees:0},{id:'r1',label:'Roof landing',kind:'ramp_landing',floorId:'roof',x:20,y:30,headingDegrees:0}],edges:[] };
const snapshot: Snapshot = {epoch:'epoch-a',revision:2,map};
const csv: CsvPort = {serialize:()=>'',parse:()=>({ok:true,value:map})};
const api: ParkingApi = {getMap:vi.fn(),replaceMap:vi.fn(async()=>snapshot),setAvailability:vi.fn(),getRoute:vi.fn()};
const renderBuilder = (overrides: Partial<ParkingApi> = {}) => render(<BuilderView snapshot={snapshot} csv={csv} api={{...api,...overrides}} managementToken="token" Renderer={MapCanvas} onSaved={vi.fn()}/>);

describe('BuilderView', () => {
  it('places a road junction and then a connected parking space', () => {
    const view = renderBuilder();
    fireEvent.click(view.getByRole('button',{name:'Road'}));
    fireEvent.pointerDown(view.container.querySelector('svg')!,{clientX:80,clientY:40});
    fireEvent.click(view.getByRole('button',{name:'Space'}));
    fireEvent.pointerDown(view.container.querySelector('svg')!,{clientX:90,clientY:40});
    expect(view.getByLabelText('Draft nodes').textContent).toMatch(/4/);
    expect(view.getByLabelText('Draft edges').textContent).toMatch(/1/);
  });
  it('allows direct Ground-to-Floor-5 ramps and descent without intermediate exits',()=>{
    expect(validateRampDraft(map,'j1','r1')).toBeNull();
    expect(validateRampDraft(map,'r1','j1')).toBeNull();
  });
  it('keeps dirty inspector edits after a version conflict',async()=>{
    const replaceMap=vi.fn(async()=>{throw Object.assign(new Error('stale'),{code:'VERSION_CONFLICT',currentVersion:{epoch:'epoch-a',revision:3}});});
    const view=renderBuilder({replaceMap});
    fireEvent.pointerDown(view.getByRole('button',{name:'Junction 1'}));
    fireEvent.change(view.getByLabelText('Node label'),{target:{value:'Unsaved junction'}});
    fireEvent.click(view.getByRole('button',{name:'Save draft'}));
    expect(await view.findByText(/conflict/i)).toBeTruthy();
    expect((view.getByLabelText('Node label') as HTMLInputElement).value).toBe('Unsaved junction');
  });
  it('rejects a Ground-to-Floor-5 ramp shorter than the 3D endpoint separation',()=>{
    const view=renderBuilder();
    fireEvent.pointerDown(view.getByRole('button',{name:'Junction 1'}));
    fireEvent.change(view.getByLabelText('Ramp destination floor'),{target:{value:'roof'}});
    fireEvent.change(view.getByLabelText('Ramp destination node'),{target:{value:'r1'}});
    fireEvent.change(view.getByLabelText('Ramp length'),{target:{value:'10'}});
    fireEvent.click(view.getByRole('button',{name:'Create ramp'}));
    expect(view.getByLabelText('Draft edges').textContent).toContain('0');
    expect(view.getByRole('status').textContent).toMatch(/at least|too short|invalid/i);
  });
});
