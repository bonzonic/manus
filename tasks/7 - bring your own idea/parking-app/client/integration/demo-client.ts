import type { Snapshot, AvailabilityCommand, ReplaceMapCommand, ConnectionState } from '../../shared/contracts';
import { validateMap } from '../../shared/contracts/validation';
import type { ClientOptions } from '../ui-contracts';
import { createParkingApi } from './api-client';
import { createLiveMapClient } from './live-map-client';
export type DemoClient = { getMap():Promise<Snapshot>; replaceMap(command:ReplaceMapCommand):Promise<Snapshot>; setAvailability(command:AvailabilityCommand):Promise<Snapshot>; subscribe(onSnapshot:(snapshot:Snapshot)=>void,onState:(state:ConnectionState)=>void):()=>void };
export function createDemoClient(layoutId:string,options:ClientOptions={}):DemoClient {
 const api=createParkingApi({...options,layoutId});const live=createLiveMapClient({...options,layoutId});
 return {getMap:api.getMap,replaceMap:command=>api.replaceMap(command,''),subscribe:live.subscribe,
 setAvailability:command=>new Promise((resolve,reject)=>{
  const url=new URL('/ws',options.baseUrl??window.location.origin);url.protocol=url.protocol==='https:'?'wss:':'ws:';url.searchParams.set('layout',layoutId);
  const requestId=globalThis.crypto?.randomUUID?.()??`park-${Date.now()}-${Math.random()}`;
  let socket:WebSocket;try{socket=(options.webSocketFactory??(u=>new WebSocket(u)))(url.toString());}catch(error){reject(error);return;}
  let settled=false;const finish=(error?:Error,snapshot?:Snapshot)=>{if(settled)return;settled=true;clearTimeout(timer);socket.onopen=null;socket.onmessage=null;socket.onerror=null;socket.onclose=null;socket.close();if(error)reject(error);else resolve(snapshot!);};
  const timer=setTimeout(()=>finish(new Error('Parking update timed out. Reconnect and try again.')),5000);
  socket.onopen=()=>socket.send(JSON.stringify({type:'availability.set',protocolVersion:1,requestId,command}));
  socket.onmessage=event=>{try{const message=JSON.parse(String(event.data));if(message.protocolVersion!==1||message.requestId!==requestId)return;
   if(message.type==='error'){finish(Object.assign(new Error(message.message),{code:message.code,currentVersion:message.currentVersion}));return;}
   if(message.type==='command.result'){const s=message.snapshot;const checked=validateMap(s?.map);if(!checked.ok||typeof s.epoch!=='string'||!s.epoch||!Number.isSafeInteger(s.revision)||s.revision<=0){finish(new Error('Invalid server snapshot'));return;}finish(undefined,{epoch:s.epoch,revision:s.revision,map:checked.value});}
  }catch{finish(new Error('Invalid WebSocket response'));}};
  socket.onerror=()=>finish(new Error('WebSocket parking update failed.'));
  socket.onclose=()=>finish(new Error('WebSocket closed before the parking update was confirmed.'));
 })};
}
