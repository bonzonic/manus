import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import type { Snapshot, ConnectionState } from '../shared/contracts';
import { csv } from '../shared/csv';
import { routing } from '../shared/routing';
import { MAP_LIMITS } from '../shared/contracts/model';
import { createDemoClient, type DemoClient } from './integration/demo-client';
import { groundEntrance, SimpleParkingBoard } from './SimpleParkingBoard';
import './simple.css';
const ids=['straight','loop'];
const readText=(file:File):Promise<string>=>typeof file.text==='function'?file.text():new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Could not read CSV'));reader.readAsText(file);});

export function App({clientFactory=createDemoClient}:{clientFactory?:(layoutId:string)=>DemoClient}={}){
 const [index,setIndex]=useState(0),[snapshot,setSnapshot]=useState<Snapshot|null>(null),[connection,setConnection]=useState<ConnectionState>('connecting'),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const pending=useRef(false);const client=useMemo(()=>clientFactory(ids[index]),[clientFactory,index]);
 const apply=(next:Snapshot)=>setSnapshot(old=>old&&old.epoch===next.epoch&&old.revision>=next.revision?old:next);
 useEffect(()=>{let disposed=false;setSnapshot(null);setConnection('connecting');setMessage('');const stop=client.subscribe(next=>{if(!disposed)apply(next);},state=>{if(!disposed)setConnection(state);});return()=>{disposed=true;stop();};},[client]);
 const map=snapshot?.map;const start=map?groundEntrance(map):undefined;
 const outcome=useMemo(()=>map&&start&&connection==='live'?routing.findFastestAvailable(map,{startNodeId:start.id}):undefined,[map,start,connection]);
 const route=outcome?.ok?outcome.route:undefined;
 const destination=map?.nodes.find(n=>n.id===route?.destinationSpaceId);
 async function run(operation:()=>Promise<Snapshot>,success:string){if(pending.current)return;pending.current=true;setBusy(true);setMessage('');try{apply(await operation());setMessage(success);}catch(error){const e=error as Error&{code?:string};if(e.code==='VERSION_CONFLICT'){try{apply(await client.getMap());}catch{}setMessage('The layout changed in another tab. Latest data loaded; please try again.');}else setMessage(e.message??'Could not update parking.');}finally{pending.current=false;setBusy(false);}}
 function toggle(id:string){if(!snapshot||connection!=='live'||pending.current)return;const node=snapshot.map.nodes.find(n=>n.id===id);if(!node||node.kind!=='space'||node.status==='closed')return;const status=node.status==='free'?'occupied':'free';void run(()=>client.setAvailability({expectedEpoch:snapshot.epoch,expectedRevision:snapshot.revision,spaceId:id,status}),`${node.label} marked ${status} via WebSocket. Route updated.`);}
 async function importCsv(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value='';if(!file||!snapshot||connection!=='live'||pending.current)return;const version=snapshot;await run(async()=>{if(file.size>MAP_LIMITS.maxInputBytes)throw new Error('CSV import rejected: maximum file size is 2 MiB.');const parsed=csv.parse(await readText(file));if(!parsed.ok)throw new Error(`CSV import rejected: ${parsed.errors[0].message}`);if(!groundEntrance(parsed.value))throw new Error('CSV import rejected: the layout needs an entrance on Ground (floor level 0).');return client.replaceMap({expectedEpoch:version.epoch,expectedRevision:version.revision,map:parsed.value});},'CSV imported and saved. Route recalculated from Ground.');}
 function exportCsv(){if(!map)return;const url=URL.createObjectURL(new Blob([csv.serialize(map)],{type:'text/csv;charset=utf-8'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=`layout-${index+1}.csv`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),0);setMessage('CSV exported with roads, connections, ramps and current parking status.');}
 return <main className="simple-parking">
  <header className="simple-header"><div className="simple-brand"><img src="/favicon.svg" alt="" width="36" height="36"/><h1>Find parking</h1></div><span>Ground entrance</span></header>
  <div className="simple-controls"><nav className="simple-tabs" aria-label="Parking layouts">{ids.map((id,i)=><button key={id} aria-pressed={i===index} disabled={busy} onClick={()=>{if(i!==index){setSnapshot(null);setConnection('connecting');setIndex(i);}}}>Layout {i+1}</button>)}</nav><div className="csv-controls"><label className="csv-upload">Import CSV<input aria-label="Import CSV" type="file" accept=".csv,text/csv" disabled={busy||connection!=='live'} onChange={importCsv}/></label><button type="button" disabled={!map||busy} onClick={exportCsv}>Export CSV</button></div></div>
  <div className="simulation-hint"><span className={connection==='live'?'live-label':'offline-label'}>{connection==='live'?'Live WebSocket':connection==='reconnecting'?'Reconnecting…':'Connecting…'}</span><span>Click a space to park or free it.</span></div>
  {message&&<p className="simple-message" aria-live="polite">{message}</p>}
  <section className="simple-recommendation" role="status"><div><span className="simple-eyebrow">Your closest available space</span><strong>{busy?'Updating…':destination?.label??(connection!=='live'?'Waiting for live data…':'No reachable space')}</strong></div>{route&&!busy&&<p>{Math.round(route.totalDurationSeconds)} sec <span>·</span> {Math.round(route.totalDistanceMeters)} m</p>}</section>
  {map&&<SimpleParkingBoard map={map} route={busy?undefined:route} disabled={busy||connection!=='live'} onToggle={toggle}/>}
  <footer className="simple-legend"><span><i className="legend-free"/>Available</span><span><i className="legend-taken"/>Taken</span><span><i className="legend-route"/>Your route</span><small>Demo data · CSV replaces this layout</small></footer>
 </main>;
}
