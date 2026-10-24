// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DriverView } from './DriverView';
import { makeDemoMap } from '../../shared/fixtures/demo';
import { routing } from '../../shared/routing';
import type { ParkingApi } from '../../shared/contracts/client';

afterEach(cleanup);
const map=makeDemoMap();
const snapshot={epoch:'epoch-a',revision:1,map};
const Renderer=({floorId}:{floorId:string})=><div>Floor {floorId}</div>;
const outcome=routing.findFastestAvailable(map,{startNodeId:'entrance'});
const api:ParkingApi={getMap:async()=>snapshot,replaceMap:async()=>snapshot,setAvailability:async()=>snapshot,getRoute:vi.fn(async()=>({epoch:snapshot.epoch,revision:snapshot.revision,outcome}))};

describe('DriverView',()=>{
  it('defaults to the entrance and displays the Floor 5 express ramp route',async()=>{
    render(<DriverView snapshot={snapshot} connectionState="live" api={api} Renderer={Renderer}/>);
    expect(screen.getByLabelText('Start from')).toHaveValue('entrance');
    fireEvent.click(screen.getByRole('button',{name:'Find closest available space'}));
    expect(await screen.findByText('5-01')).toBeInTheDocument();
    expect(screen.getByRole('button',{name:/Ramp up/})).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Floor 5'})).toHaveAttribute('aria-pressed','true');
    expect(screen.getByText(/1 min ·/)).toBeInTheDocument();
  });
  it('removes stale guidance when the authoritative map revision changes',async()=>{
    const view=render(<DriverView snapshot={snapshot} connectionState="live" api={api} Renderer={Renderer}/>);
    fireEvent.click(screen.getByRole('button',{name:'Find closest available space'}));
    await screen.findByText('5-01');
    view.rerender(<DriverView snapshot={{...snapshot,revision:2}} connectionState="live" api={api} Renderer={Renderer}/>);
    expect(screen.queryByRole('region',{name:'Route summary'})).not.toBeInTheDocument();
    expect(screen.getByText(/Map updated/)).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Recalculate'})).toBeInTheDocument();
  });
});
