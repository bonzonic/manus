import { it, expect } from 'vitest';
import WebSocket from 'ws';
import { createDemoClient } from '../../client/integration/demo-client';
import { createServer } from '../../server/app';
import { createMapSession } from '../../server/map-session';
import { MemoryMapStore } from '../../server/memory-store';
import { makeSimpleLayouts } from '../../shared/fixtures/simple-layouts';
import { csv } from '../../shared/csv';import { routing } from '../../shared/routing';
import type { Snapshot } from '../../shared/contracts';
it('uses the real WebSocket parking command, receives authoritative snapshots and persists imported graphs',async()=>{
 const map=makeSimpleLayouts()[0];const session=await createMapSession({store:new MemoryMapStore(),seedMap:map,newEpoch:()=> 'adapter-epoch'});
 const server=createServer({session,csv,routing,managementToken:'test-only',allowedOrigins:['http://localhost'],demoSessions:{straight:session}});let stop:(()=>void)|undefined;
 try{await server.listen({host:'127.0.0.1',port:0});const address=server.httpServer.address();if(!address||typeof address==='string')throw new Error('No port');const baseUrl=`http://127.0.0.1:${address.port}`;
 const client=createDemoClient('straight',{baseUrl,webSocketFactory:url=>new WebSocket(url,{origin:'http://localhost'}) as unknown as globalThis.WebSocket});
 const first=await client.getMap();let pushed:Snapshot|undefined;const initial=new Promise<void>(resolve=>{stop=client.subscribe(s=>{pushed=s;resolve();},()=>{});});await initial;
 const changed=await client.setAvailability({expectedEpoch:first.epoch,expectedRevision:first.revision,spaceId:'A-03',status:'occupied'});expect(changed.revision).toBe(2);expect(changed.map.nodes.find(n=>n.id==='A-03')?.status).toBe('occupied');
 await new Promise(resolve=>setTimeout(resolve,10));expect(pushed?.revision).toBe(2);const next=routing.findFastestAvailable(changed.map,{startNodeId:'entrance'});expect(next.ok&&next.route.destinationSpaceId).toBe('A-07');
 const saved=await client.replaceMap({expectedEpoch:changed.epoch,expectedRevision:changed.revision,map:{...changed.map,name:'Imported layout'}});expect(saved.map.name).toBe('Imported layout');expect(session.getSnapshot().map.name).toBe('Imported layout');
 }finally{stop?.();await server.close();}
});
