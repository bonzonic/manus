import { it, expect } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import WebSocket from 'ws';
import { createMapSession } from '../../server/map-session';
import { createServer } from '../../server/app';
import { FileMapStore } from '../../server/file-store';
import { makeDemoMap } from '../../shared/fixtures/demo';
import { routing } from '../../shared/routing';
import { csv } from '../../shared/csv';
import type { Snapshot } from '../../shared/contracts';

function waitMessage(socket:WebSocket,type:string):Promise<{type:string;snapshot:Snapshot}> {
  return new Promise((resolve,reject)=>{
    const listener=(raw:WebSocket.RawData)=>{const data=JSON.parse(raw.toString());if(data.type===type){clearTimeout(timer);socket.off('message',listener);resolve(data);}};
    const timer=setTimeout(()=>{socket.off('message',listener);reject(new Error('No WebSocket snapshot'));},2000);
    socket.on('message',listener);
  });
}
it('round-trips saved CSV, broadcasts REST availability and reroutes 60 to 90 seconds with persistent revision guards',async()=>{
  const directory=await mkdtemp(resolve('.test-integration-'));
  const path=resolve(directory,'map.json');
  const session=await createMapSession({store:new FileMapStore(path),seedMap:makeDemoMap(),newEpoch:()=> 'integration-epoch'});
  const handle=createServer({session,routing,csv,managementToken:'integration-test-only-key',allowedOrigins:[]});
  let socket:WebSocket|undefined;
  try{
    await handle.listen({host:'127.0.0.1',port:0});
    const address=handle.httpServer.address();if(!address||typeof address==='string')throw new Error('No TCP port');
    const base=`http://127.0.0.1:${address.port}`;
    const initial:Snapshot=await(await fetch(base+'/api/map')).json();
    const routeAt=async(snapshot:Snapshot)=>fetch(base+'/api/route',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedEpoch:snapshot.epoch,expectedRevision:snapshot.revision,startNodeId:'entrance'})});
    const first=await(await routeAt(initial)).json();
    expect(first.outcome.route.destinationSpaceId).toBe('space-f5-target');expect(first.outcome.route.totalDurationSeconds).toBeCloseTo(60);
    const exported=csv.parse(await(await fetch(base+'/api/map.csv')).text());
    expect(exported.ok).toBe(true);if(exported.ok)expect(exported.value).toEqual(initial.map);
    socket=new WebSocket(base.replace('http','ws')+'/ws');
    await new Promise<void>((resolve,reject)=>{socket!.once('open',resolve);socket!.once('error',reject);});
    const firstSnapshot=waitMessage(socket,'map.snapshot');socket.send(JSON.stringify({type:'subscribe',protocolVersion:1}));await firstSnapshot;
    const broadcast=waitMessage(socket,'map.snapshot');
    const changedResponse=await fetch(base+'/api/spaces/space-f5-target',{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer integration-test-only-key'},body:JSON.stringify({expectedEpoch:initial.epoch,expectedRevision:initial.revision,status:'occupied'})});
    expect(changedResponse.status).toBe(200);
    const changed:Snapshot=await changedResponse.json();expect(changed.revision).toBe(2);
    expect((await broadcast).snapshot.revision).toBe(2);
    expect((await routeAt(initial)).status).toBe(409);
    const second=await(await routeAt(changed)).json();expect(second.outcome.route.destinationSpaceId).toBe('space-f1-target');expect(second.outcome.route.totalDurationSeconds).toBeCloseTo(90);
    const reloaded=await createMapSession({store:new FileMapStore(path),seedMap:makeDemoMap(),newEpoch:()=> 'restarted-epoch'});
    expect(reloaded.getSnapshot().revision).toBe(2);expect(reloaded.getSnapshot().epoch).toBe('restarted-epoch');
    expect(reloaded.getSnapshot().map.nodes.find(n=>n.id==='space-f5-target')?.status).toBe('occupied');
  }finally{
    if(socket&&socket.readyState!==WebSocket.CLOSED){const closed=new Promise<void>(resolve=>socket!.once('close',()=>resolve()));socket.close();await closed;}
    await handle.close();await rm(directory,{recursive:true,force:true});
  }
});
