import type { ParkingMap, Node } from '../shared/contracts/model';
import type { Route } from '../shared/contracts/routing';
export function groundEntrance(map:ParkingMap):Node|undefined {const floor=map.floors.find(f=>f.level===0);return map.nodes.find(n=>n.id==='entrance'&&n.kind==='entrance'&&n.floorId===floor?.id)??map.nodes.find(n=>n.kind==='entrance'&&n.floorId===floor?.id);}
export function SimpleParkingBoard({map,route,disabled,onToggle}:{map:ParkingMap;route?:Route;disabled:boolean;onToggle:(id:string)=>void}){
 const byId=new Map(map.nodes.map(n=>[n.id,n]));const entrance=groundEntrance(map);
 const floors=[...map.floors].sort((a,b)=>a.level-b.level);
 return <>{floors.map(floor=>{
  const nodes=map.nodes.filter(n=>n.floorId===floor.id),spaces=nodes.filter(n=>n.kind==='space');
  const minX=Math.min(0,...nodes.map(n=>n.x-8)),minY=Math.min(0,...nodes.map(n=>n.y-8));const maxX=Math.max(100,...nodes.map(n=>n.x+8)),maxY=Math.max(65,...nodes.map(n=>n.y+8));
  const paths:string[]=[];let points:string[]=[];for(const id of route?.nodeIds??[]){const n=byId.get(id)!;if(n.floorId===floor.id)points.push(`${n.x},${n.y}`);else{if(points.length>1)paths.push(points.join(' '));points=[];}}if(points.length>1)paths.push(points.join(' '));
  const grid=`grid-${floor.id}`,arrow=`arrow-${floor.id}`;
  return <section key={floor.id} className="simple-board" aria-label={map.floors.length===1?map.name:`${map.name} · ${floor.label}`}>
   {map.floors.length>1&&<h2 className="board-floor-title">{floor.label}</h2>}
   <svg viewBox={`${minX} ${minY} ${maxX-minX} ${maxY-minY}`} role="group" aria-label={`${floor.label} parking map`}>
    <defs><pattern id={grid} width="5" height="5" patternUnits="userSpaceOnUse"><path d="M5 0H0V5" fill="none" stroke="#e5ebee" strokeWidth=".1"/></pattern><marker id={arrow} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="2.5" markerHeight="2.5" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 0L10 5L0 10" fill="#81929d"/></marker></defs>
    <rect x={minX} y={minY} width={maxX-minX} height={maxY-minY} fill={`url(#${grid})`}/><rect x={minX+3} y={minY+3} width={maxX-minX-6} height={maxY-minY-6} rx="2" fill="none" stroke="#d3dde2" strokeWidth=".25"/>
    <text x={minX+7} y={minY+8} fontSize="2" fill="#637883">{map.name}</text>
    {map.edges.map(edge=>{const a=byId.get(edge.fromNodeId)!,b=byId.get(edge.toNodeId)!;if(a.floorId!==floor.id&&b.floorId!==floor.id)return null;
     if(edge.kind==='ramp'){const n=a.floorId===floor.id?a:b,other=a.floorId===floor.id?b:a;const destination=map.floors.find(f=>f.id===other.floorId)!;return <g key={edge.id} opacity={edge.enabled?1:.35}><path d={`M${n.x} ${n.y}l4 -4`} stroke="#af8e5e" strokeWidth="1.2" strokeDasharray="1 1"/><text x={n.x+5} y={n.y-4} fontSize="1.5" fill="#84642f">{destination.level>floor.level?'Up':'Down'}: {destination.label}</text></g>;}
     if(a.floorId!==floor.id||b.floorId!==floor.id)return null;
     return <g key={edge.id} opacity={edge.enabled?1:.35}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={edge.kind==='road'?'#d6e0e6':'#b3c2cb'} strokeWidth={edge.kind==='road'?5:.4} strokeLinecap="round"/>{edge.kind==='road'&&<line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#a7b8c2" strokeWidth=".15" strokeDasharray="1 1" markerEnd={edge.direction==='forward'?`url(#${arrow})`:undefined} markerStart={edge.direction==='reverse'?`url(#${arrow})`:undefined}/>}</g>;
    })}
    {paths.map((path,i)=><polyline key={i} points={path} stroke="#176b87" strokeWidth=".8" strokeLinecap="round" strokeLinejoin="round" fill="none" pointerEvents="none"/>)}
    {spaces.map(node=>{const blocked=disabled||node.status==='closed';const name=(node.status==='free'?`Park car in ${node.label}`:`Free ${node.label}`)+(map.floors.length>1?` on ${floor.label}`:'');return <g key={node.id} role="button" aria-label={name} aria-disabled={blocked} tabIndex={blocked?-1:0} onClick={()=>{if(!blocked)onToggle(node.id);}} onKeyDown={e=>{if(!blocked&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onToggle(node.id);}}} style={{cursor:blocked?'default':'pointer'}}><title>{node.label}: {node.status}. Click to simulate parking.</title><g transform={`translate(${node.x} ${node.y}) rotate(${node.headingDegrees})`}><rect x="-3.2" y="-4.5" width="6.4" height="9" fill="transparent"/><rect x="-2" y="-3" width="4" height="6" rx=".4" fill={node.status==='free'?'#bce3ce':'#eff2f4'} stroke={node.id===route?.destinationSpaceId?'#176b87':node.status==='free'?'#58876b':'#a6b5be'} strokeWidth={node.id===route?.destinationSpaceId?'.65':'.25'}/>{node.status==='occupied'&&<rect x="-1.1" y="-2" width="2.2" height="4" rx=".6" fill="#c1cbd1"/>}{node.status==='closed'&&<path d="M-1 -2L1 2M1 -2L-1 2" stroke="#a33131" strokeWidth=".4"/>}</g><text x={node.x} y={node.y+5.1} textAnchor="middle" fontSize="1.6" fill="#355361">{node.label}</text></g>;})}
    {entrance?.floorId===floor.id&&<><circle cx={entrance.x} cy={entrance.y} r="1.3" fill="#176b87" stroke="white" strokeWidth=".4"/><text x={entrance.x} y={entrance.y+5} textAnchor="middle" fontSize="1.6" fill="#176b87">Entry</text></>}
   </svg>
  </section>;
 })}</>;
}
