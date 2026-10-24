import type { ParkingMap, Node } from '../contracts/model';

export function makeSimpleLayouts(): ParkingMap[] {
  function lot(id:string,name:string):ParkingMap {return {schemaVersion:1,id,name,floors:[{id:'ground',label:'Ground',level:0,elevationMeters:0}],nodes:[],edges:[]};}
  function node(map:ParkingMap,id:string,x:number,y:number,kind:Node['kind']='junction',status?:Node['status'],headingDegrees=0){map.nodes.push({id,label:id,kind,floorId:'ground',x,y,headingDegrees,...(status?{status}:{})});return id;}
  function edge(map:ParkingMap,from:string,to:string,access=false,oneWay=false){const a=map.nodes.find(n=>n.id===from)!,b=map.nodes.find(n=>n.id===to)!;map.edges.push({id:`${from}-${to}`,label:access?'Parking access':'Road',kind:access?'parking_access':'road',fromNodeId:from,toNodeId:to,direction:access||oneWay?'forward':'both',enabled:true,lengthMeters:Math.hypot(a.x-b.x,a.y-b.y),speedMps:access?1:2});}
  const straight=lot('straight','Straight aisle');
  node(straight,'entrance',10,32,'entrance');let last='entrance';
  for(let i=0;i<5;i++){const x=28+i*14;const junction=node(straight,`j${i}`,x,32);edge(straight,last,junction);last=junction;for(let side=0;side<2;side++){const number=i*2+side+1;const id=`A-${String(number).padStart(2,'0')}`;node(straight,id,x,side===0?24:40,'space',[3,7,10].includes(number)?'free':'occupied');edge(straight,junction,id,true);}}
  const loop=lot('loop','One-way loop');
  node(loop,'entrance',10,48,'entrance');
  const corners=[[24,48],[24,18],[76,18],[76,48]];
  corners.forEach(([x,y],i)=>node(loop,`j${i}`,x,y));
  edge(loop,'entrance','j0',false,true);for(let i=0;i<4;i++)edge(loop,`j${i}`,`j${(i+1)%4}`,false,true);
  const bays=[[24,56],[16,48],[24,10],[16,18],[76,10],[84,18],[76,56],[84,48]];
  bays.forEach(([x,y],i)=>{const id=`B-${String(i+1).padStart(2,'0')}`;node(loop,id,x,y,'space',[2,4,7].includes(i)?'free':'occupied',i%2?90:0);edge(loop,`j${Math.floor(i/2)}`,id,true);});
  return [straight,loop];
}
