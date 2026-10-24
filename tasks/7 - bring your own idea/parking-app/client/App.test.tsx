// @vitest-environment jsdom
import { afterEach, it, expect } from 'vitest';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from './App';
import { makeSimpleLayouts } from '../shared/fixtures/simple-layouts';
import { csv } from '../shared/csv';
import type { Snapshot, ParkingMap, AvailabilityCommand, ReplaceMapCommand } from '../shared/contracts';
afterEach(cleanup);
function fakeFactory(){const states=new Map(makeSimpleLayouts().map(map=>[map.id,{epoch:map.id,revision:1,map} as Snapshot]));const listeners=new Map<string,Set<(s:Snapshot)=>void>>();return(id:string)=>({getMap:async()=>states.get(id)!,subscribe:(fn:(s:Snapshot)=>void,onState:(state:any)=>void)=>{const set=listeners.get(id)??new Set();listeners.set(id,set);set.add(fn);fn(states.get(id)!);onState('live');return()=>{set.delete(fn);};},replaceMap:async(c:ReplaceMapCommand)=>{const next={...states.get(id)!,revision:states.get(id)!.revision+1,map:c.map};states.set(id,next);listeners.get(id)?.forEach(fn=>fn(next));return next;},setAvailability:async(c:AvailabilityCommand)=>{const old=states.get(id)!;const next={...old,revision:old.revision+1,map:{...old.map,nodes:old.map.nodes.map(n=>n.id===c.spaceId?{...n,status:c.status}:n)}};states.set(id,next);listeners.get(id)?.forEach(fn=>fn(next));return next;}});}
it('keeps two Ground layouts simple while exposing CSV controls and rerouting after a parking click',async()=>{
 render(<App {...{clientFactory:fakeFactory()}}/>);
 expect(screen.getByRole('button',{name:'Export CSV'})).toBeTruthy();expect(screen.getByLabelText('Import CSV')).toBeTruthy();
 await waitFor(()=>expect(screen.getByRole('status').textContent).toContain('A-03'));
 expect(screen.queryByLabelText('Start from')).toBeNull();expect(screen.queryByText('Management integration')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Park car in A-03'}));await waitFor(()=>expect(screen.getByRole('status').textContent).toContain('A-07'));
 fireEvent.click(screen.getByRole('button',{name:'Free A-03'}));await waitFor(()=>expect(screen.getByRole('status').textContent).toContain('A-03'));
 fireEvent.click(screen.getByRole('button',{name:'Layout 2'}));await waitFor(()=>expect(screen.getByRole('status').textContent).toContain('B-03'));
});
it('imports a complete CSV into the current layout and preserves it when a later file is invalid',async()=>{
 render(<App {...{clientFactory:fakeFactory()}}/>);await waitFor(()=>expect(screen.getByRole('status').textContent).toContain('A-03'));
 const map:ParkingMap=makeSimpleLayouts()[0];map.name='Imported aisle';map.nodes=map.nodes.map(n=>n.id==='A-03'?{...n,status:'occupied'}:n);
 const input=screen.getByLabelText('Import CSV');fireEvent.change(input,{target:{files:[new File([csv.serialize(map)],'test.csv',{type:'text/csv'})]}});
 await waitFor(()=>expect(screen.getByRole('status').textContent).toContain('A-07'));expect(screen.getByRole('region',{name:'Imported aisle'})).toBeTruthy();
 fireEvent.change(input,{target:{files:[new File(['not a parking csv'],'invalid.csv')]}});await screen.findByText(/CSV import rejected/);expect(screen.getByRole('status').textContent).toContain('A-07');
});
