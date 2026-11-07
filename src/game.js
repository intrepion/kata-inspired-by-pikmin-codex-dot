/** Original deterministic expedition simulation. Coordinates are x/z ground-plane metres. */
export const TYPES = { red:{name:'Ember',color:0xec6555,speed:3.25,attack:1.5},yellow:{name:'Spark',color:0xf1d35b,speed:3.25,attack:1},blue:{name:'Tide',color:0x66bddd,speed:3.25,attack:1} };
export const BASE={x:0,z:15};
export const FIELD_LIMIT=100;
export const ZONES=[
 {id:0,name:'Dewdrop Landing',unlock:0,color:0x748956},
 {id:1,name:'Copperleaf Grove',unlock:1,color:0x8b8456},
 {id:2,name:'Stillwater Basin',unlock:5,color:0x637f6e},
 {id:3,name:'Cinderroot Hollow',unlock:12,color:0x8b745c},
 {id:4,name:'The Last Canopy',unlock:20,color:0x718151}
];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const inside=(p,r,pad=0)=>p.x>r.x-r.w/2-pad&&p.x<r.x+r.w/2+pad&&p.z>r.z-r.d/2-pad&&p.z<r.z+r.d/2+pad;
export function getTerrain(zone=0){return {bounds:24,water:[{x:12,z:-7,w:10,d:10}],fire:[{x:-13,z:-5,r:2.6},{x:-18,z:-12,r:2}],rocks:[{x:-6,z:-8,w:3,d:8},{x:5,z:-15,w:5,d:3}],bridge:{x:12,z:-7,w:4,d:12},zone};}
function note(s,text){s.toast=text;s.events.push(text);if(s.events.length>25)s.events.shift();}
function unit(s,type,x=BASE.x,z=BASE.z,state='follow'){return {id:s.nextId++,type,x,z,state,maturity:0,hp:1,target:null,air:0,y:0,panic:0,bomb:false,path:[],pathAge:0};}
function makeObjects(zone){let id=zone*1000;const obj=(kind,x,z,extra={})=>({id:++id,kind,x,z,done:false,...extra});return [
 obj('part',-6,8,{name:'Navigation prism',weight:3,maxCarriers:6,required:true}),
 obj('part',-16,1,{name:'Thermal regulator',weight:8,maxCarriers:16,required:true}),
 obj('part',16,-7,{name:'Tidal condenser',weight:8,maxCarriers:16,required:true,water:true}),
 obj('part',1,-10,{name:'Signal mast',weight:5,maxCarriers:10,required:true,height:3}),
 obj('part',-18,-16,{name:'Ion spindle',weight:12,maxCarriers:24,required:true,gate:zone*1000+10}),
 obj('part',12,-15,{name:'Cabin keepsake',weight:10,maxCarriers:20,required:false}),
 obj('pellet',-5,13,{weight:1,maxCarriers:2,value:1,type:'red'}),
 obj('pellet',5,11,{weight:1,maxCarriers:2,value:1,type:'yellow'}),
 obj('pellet',8,5,{weight:3,maxCarriers:6,value:3,type:'blue'}),
 obj('gate',-17,-11,{name:'Stone barrier',workX:-17,workZ:-9,w:7,d:1,hp:90,maxHp:90,stone:true}),
 obj('bridge',12,-7,{name:'Reed bridge',w:4,d:12,workX:12,workZ:0,hp:36,maxHp:36}),
 obj('gate',0,-4,{name:'Root fence',workX:0,workZ:-2,w:7,d:1,hp:32,maxHp:32,stone:false}),
 obj('enemy',-12,4,{name:'Mossback',hp:18+zone*5,maxHp:18+zone*5,r:1.3,windup:0,cooldown:2,homeX:-12,homeZ:4,value:5,weight:5,maxCarriers:10}),
 obj('enemy',17,-15,{name:'Burrowbeetle',hp:24+zone*7,maxHp:24+zone*7,r:1.6,windup:0,cooldown:3,homeX:17,homeZ:-15,value:8,weight:8,maxCarriers:16}),
 obj('bomb',-3,5,{charges:6}),obj('nectar',3,10,{charges:18}),
 obj('pellet',-20,9,{weight:5,maxCarriers:10,value:5,type:'red'}),
 obj('pellet',18,7,{weight:5,maxCarriers:10,value:5,type:'blue'}),
 obj('pellet',-1,-18,{weight:5,maxCarriers:10,value:5,type:'yellow'})
 ];}
export function createGame({mode='quick'}={}){const s={version:1,mode,phase:'playing',day:1,time:0,duration:mode==='classic'?780:240,zone:0,zones:ZONES,terrain:getTerrain(),player:{x:0,z:12,hp:100},units:[],objects:makeObjects(0),worlds:{},reserves:{red:15,yellow:15,blue:15},selectedType:'red',recovered:0,recoveredRequired:0,recoveredIds:[],nextId:1,events:[],toast:'Welcome to Dewdrop Landing. Throw scouts onto the nearby prism.',whistleRadius:0,aim:{x:-6,z:8},lost:0,totalGrown:0,summary:null};for(const type of Object.keys(TYPES))for(let i=0;i<10;i++)s.units.push(unit(s,type,(i%5-2)*.6,14+Math.floor(i/5)*.6));return s;}
function waterAt(s,p,pad=0){return s.terrain.water.some(r=>inside(p,r,pad))&&!s.objects.some(o=>o.kind==='bridge'&&o.done&&inside(p,o,-pad));}
function solidAt(s,p,type='player'){if(Math.abs(p.x)>23||Math.abs(p.z)>23)return true;if(s.terrain.rocks.some(r=>inside(p,r,.3)))return true;if(s.objects.some(o=>o.kind==='gate'&&!o.done&&inside(p,o,.35)))return true;return false;}
function route(s,from,to,type,avoidHazards=true){const sx=Math.round(from.x),sz=Math.round(from.z),tx=Math.round(clamp(to.x,-22,22)),tz=Math.round(clamp(to.z,-22,22));const key=(x,z)=>`${x},${z}`;const start=key(sx,sz),goal=key(tx,tz),open=[{x:sx,z:sz,g:0,f:0}],best=new Map([[start,0]]),prev=new Map();let end=null;for(let n=0;open.length&&n<2200;n++){open.sort((a,b)=>a.f-b.f);const p=open.shift(),k=key(p.x,p.z);if(k===goal||Math.hypot(p.x-tx,p.z-tz)<1.1){end=k;break;}for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const q={x:p.x+dx,z:p.z+dz},qk=key(q.x,q.z);if(solidAt(s,q,type))continue;let cost=1;if(avoidHazards&&type!=='blue'&&waterAt(s,q,.5))cost+=30;if(avoidHazards&&type!=='red'&&s.terrain.fire.some(f=>dist(q,f)<f.r+.5))cost+=20;const g=p.g+cost;if(g>=(best.get(qk)??Infinity))continue;best.set(qk,g);prev.set(qk,k);open.push({...q,g,f:g+Math.abs(q.x-tx)+Math.abs(q.z-tz)});}}if(!end)return [];const path=[];while(end!==start){const [x,z]=end.split(',').map(Number);path.unshift({x,z});end=prev.get(end);if(!end)break;}path.push({x:to.x,z:to.z});return path;}
function move(s,u,to,speed,dt,paths=false){if(dist(u,to)<.08)return;let target=to;if(paths){u.pathAge=(u.pathAge||0)-dt;if(!u.path?.length||u.pathAge<=0){u.path=route(s,u,to,u.type||'player');u.pathAge=2;}if(u.path.length){target=u.path[0];if(dist(u,target)<.16){u.path.shift();target=u.path[0]||to;}}else return;}const d=dist(u,target),step=Math.min(d,speed*dt);if(!d)return;const nx=u.x+(target.x-u.x)/d*step,nz=u.z+(target.z-u.z)/d*step;if(!solidAt(s,{x:nx,z:u.z},u.type))u.x=nx;if(!solidAt(s,{x:u.x,z:nz},u.type))u.z=nz;}
function release(u){u.target=null;u.path=[];u.pathAge=0;}
function workers(s,o){return s.units.filter(u=>u.target===o.id&&['carry','work'].includes(u.state));}
function canWork(s,u,o){if(o.done)return false;if(o.kind==='enemy'&&o.hp>0)return true;if(['part','pellet','carcass'].includes(o.kind)){if(o.height&&u.type!=='yellow')return false;if(o.gate&&s.objects.find(g=>g.id===o.gate&&!g.done))return false;return workers(s,o).length<o.maxCarriers;}if(o.kind==='gate')return !o.stone||u.bomb;if(o.kind==='bridge')return true;if(o.kind==='bomb')return u.type==='yellow'&&!u.bomb&&o.charges>0;if(o.kind==='nectar')return u.maturity<2&&o.charges>0;return false;}
function assign(s,u,o){if(!canWork(s,u,o))return false;release(u);u.target=o.id;u.state=['part','pellet','carcass'].includes(o.kind)?'carry':'work';return true;}
const workPoint=o=>['bridge','gate'].includes(o.kind)&&!o.done?{x:o.workX,z:o.workZ}:o;
function nearestJob(s,u,r=1.7){return s.objects.filter(o=>canWork(s,u,o)&&dist(u,workPoint(o))<r).sort((a,b)=>dist(u,workPoint(a))-dist(u,workPoint(b)))[0];}
export function command(s,action,p={}){if(action==='restart')return createGame({mode:s.mode});if(action==='select'){if(TYPES[p.type])s.selectedType=p.type;return s;}if(action==='nextDay'){if(s.phase!=='sunset')return s;const zone=Number(p.zone??s.zone);if(!ZONES[zone]||s.recovered<ZONES[zone].unlock)return s;if(s.day>=30){s.phase=s.recoveredRequired>=25?'won':'lost';return s;}s.worlds[s.zone]={objects:s.objects,seedlings:s.units.filter(u=>u.state==='seed')};s.zone=zone;s.terrain=getTerrain(zone);s.objects=s.worlds[zone]?.objects||makeObjects(zone);s.units=(s.worlds[zone]?.seedlings||[]).map(u=>({...u}));s.day++;s.time=0;s.phase='playing';s.player={x:0,z:12,hp:100};for(const type of Object.keys(TYPES)){const survives=s.reserves[type]>0||s.units.some(u=>u.type===type)||Object.values(s.worlds).some(w=>w.seedlings.some(u=>u.type===type));if(!survives){if(s.units.length<FIELD_LIMIT)s.units.push(unit(s,type,BASE.x,BASE.z,'seed'));else s.reserves[type]=1;note(s,`${TYPES[type].name} extinction recovery: the nest preserved one new scout.`);}}for(const type of Object.keys(TYPES)){const count=Math.min(10,s.reserves[type],FIELD_LIMIT-s.units.length);s.reserves[type]-=count;for(let i=0;i<count;i++)s.units.push(unit(s,type,BASE.x+(i%5-2)*.55,BASE.z+Math.floor(i/5)*.55));}note(s,`Day ${s.day}: ${ZONES[zone].name}.`);return s;}if(s.phase!=='playing')return s;
 if(action==='throw'){const u=s.units.filter(u=>u.state==='follow'&&u.type===s.selectedType&&dist(u,s.player)<=5).sort((a,b)=>dist(a,s.player)-dist(b,s.player))[0];if(!u){note(s,`No ${TYPES[s.selectedType].name} scouts within throwing reach. Wait for your squad.`);return s;}let target={x:p.x??s.aim.x,z:p.z??s.aim.z};if(!Number.isFinite(target.x)||!Number.isFinite(target.z))return s;const structure=s.objects.find(o=>['bridge','gate'].includes(o.kind)&&!o.done&&dist(o,target)<2);if(structure)target=workPoint(structure);const d=dist(s.player,target),range=u.type==='yellow'?12:9;u.startX=s.player.x;u.startZ=s.player.z;u.x=s.player.x;u.z=s.player.z;u.landX=s.player.x+(target.x-s.player.x)*Math.min(1,range/(d||1));u.landZ=s.player.z+(target.z-s.player.z)*Math.min(1,range/(d||1));u.air=.7;u.state='air';release(u);return s;}
 if(action==='dismiss'){for(const u of s.units)if(u.state==='follow'){u.state='idle';release(u);}note(s,'Squad dismissed. Idle scouts will help with nearby jobs.');}
 if(action==='pluck'){const seeds=s.units.filter(u=>u.state==='seed'&&dist(u,s.player)<3);for(const u of seeds){u.state='follow';u.maturity=Math.min(2,Math.floor((u.growth||0)/45));}note(s,seeds.length?`Plucked ${seeds.length} new scouts.`:'Move close to seedlings at the nest to pluck them.');}
 if(action==='deploy'){if(dist(s.player,BASE)>5){note(s,'Return to the landing nest to withdraw scouts.');return s;}const type=p.type||s.selectedType;if(!TYPES[type]||!Number.isFinite(p.count??10))return s;const count=Math.min(Math.max(0,Math.floor(p.count??10)),s.reserves[type]||0,FIELD_LIMIT-s.units.length);s.reserves[type]-=count;for(let i=0;i<count;i++)s.units.push(unit(s,type,BASE.x+(i%5-2)*.5,BASE.z));note(s,`Withdrew ${count} ${TYPES[type].name} scouts.`);}
 if(action==='store'){if(dist(s.player,BASE)>5){note(s,'Return to the landing nest to store scouts.');return s;}const type=p.type||s.selectedType;if(!TYPES[type]||!Number.isFinite(p.count??10))return s;const us=s.units.filter(u=>u.type===type&&u.state==='follow').slice(0,Math.max(0,Math.floor(p.count??10)));s.reserves[type]+=us.length;s.units=s.units.filter(u=>!us.includes(u));note(s,`Stored ${us.length} ${TYPES[type].name} scouts.`);}
 if(action==='endDay')sunset(s);return s;}
function sunset(s){let rescued=0,lost=0;for(const u of s.units){if(u.state==='seed')continue;if(u.state==='follow'||dist(u,BASE)<7){s.reserves[u.type]++;rescued++;}else lost++;}s.units=s.units.filter(u=>u.state==='seed');s.lost+=lost;s.summary={rescued,lost,parts:s.recovered,day:s.day};s.phase=s.recovered===30?'won':s.day>=30?(s.recoveredRequired>=25?'won':'lost'):'sunset';note(s,`${rescued} scouts rescued. ${lost} left behind. ${s.recovered}/30 parts recovered.`);}
function deliver(s,o,crew){o.done=true;const types=Object.keys(TYPES),counts=Object.fromEntries(types.map(t=>[t,crew.filter(u=>u.type===t).length]));const color=types.sort((a,b)=>counts[b]-counts[a]||(a===s.selectedType?-1:1))[0];if(o.kind==='part'){s.recovered++;if(o.required)s.recoveredRequired++;s.recoveredIds.push(o.id);note(s,`Recovered ${o.name}! ${s.recovered}/30 parts.`);if(s.recovered===30){sunset(s);return;}}else{const n=o.value*(o.kind==='pellet'&&o.type===color?2:1);for(let i=0;i<n;i++){if(s.units.length<FIELD_LIMIT){const angle=s.nextId*2.399;s.units.push(unit(s,color,BASE.x+Math.cos(angle)*(2+(i%3)*.4),BASE.z+Math.sin(angle)*(2+(i%3)*.4),'seed'));}else s.reserves[color]++;}s.totalGrown+=n;note(s,`${n} ${TYPES[color].name} seedlings produced. Press E near the nest to pluck.`);}for(const u of crew){u.state='idle';release(u);}}
export function stepGame(s,dt,input={}){if(s.phase!=='playing')return s;dt=clamp(dt,0,.1);s.time+=dt;s.aim=input.aim||s.aim;let mx=input.moveX||0,mz=input.moveZ||0;const mag=Math.hypot(mx,mz);if(mag>1){mx/=mag;mz/=mag;}move(s,s.player,{x:s.player.x+mx,z:s.player.z+mz},5,dt);if(dist(s.player,BASE)<4)s.player.hp=Math.min(100,s.player.hp+dt*8);
 if(input.whistle){s.whistleRadius=Math.min(7.5,s.whistleRadius+dt*8);for(const u of s.units)if(u.state!=='seed'&&u.state!=='air'&&dist(u,s.aim)<s.whistleRadius){u.state='follow';u.panic=0;u.safety=.75;release(u);}}else s.whistleRadius=0;
 let fi=0;const dead=new Set();for(const u of s.units){if(u.state==='seed'){u.growth=(u.growth||0)+dt;continue;}if(u.state==='air'){u.air-=dt;const t=clamp(1-u.air/.7,0,1);u.x=u.startX+(u.landX-u.startX)*t;u.z=u.startZ+(u.landZ-u.startZ)*t;u.y=Math.sin(t*Math.PI)*(u.type==='yellow'?6:4);if(u.air<=0){u.y=0;u.state='idle';const job=nearestJob(s,u,2.2);if(job)assign(s,u,job);}continue;}
 u.safety=Math.max(0,(u.safety||0)-dt);const wet=waterAt(s,u)&&u.type!=='blue',burning=s.terrain.fire.some(f=>dist(u,f)<f.r)&&u.type!=='red';if((wet||burning)&&!u.safety){if(u.state!=='panic'){release(u);u.state='panic';u.panic=0;}u.panic+=dt;if(u.panic>5){dead.add(u.id);continue;}if(wet)move(s,u,{x:6,z:u.z},3,dt);else move(s,u,s.player,3,dt);continue;}
 if(u.state==='panic'){u.state='idle';u.panic=0;}if(u.state==='follow'){const i=fi++,r=1+Math.sqrt(i)*.45,ang=i*2.399;let to={x:s.player.x+Math.cos(ang)*r,z:s.player.z+Math.sin(ang)*r};if(input.swarm)to=s.aim;move(s,u,to,TYPES[u.type].speed*(1+u.maturity*.2),dt,true);if(input.swarm&&dist(u,s.aim)<3){const job=nearestJob(s,u,3);if(job)assign(s,u,job);}}
 else if(u.state==='idle'){const job=nearestJob(s,u);if(job)assign(s,u,job);}
 else if(u.state==='carry'||u.state==='work'){const o=s.objects.find(o=>o.id===u.target&&!o.done);if(!o){u.state='idle';release(u);continue;}if(dist(u,workPoint(o))>1.8)move(s,u,workPoint(o),TYPES[u.type].speed*(1+u.maturity*.2),dt,true);else if(u.state==='work'){
 if(o.kind==='bomb'){u.bomb=true;o.charges--;u.state='idle';release(u);if(o.charges<=0)o.done=true;note(s,'Spark scout picked up a blast stone. Throw it at the stone barrier.');}
 if(o.kind==='nectar'){u.maturity=2;o.charges--;u.state='idle';release(u);if(o.charges<=0)o.done=true;}
 if(o.kind==='gate'||o.kind==='bridge'){if(o.stone&&u.bomb){u.bomb=false;o.hp-=35;u.state='idle';release(u);note(s,'Blast stone cracked the barrier.');}else if(!o.stone)o.hp-=dt*(1+u.maturity*.15);else {u.state='idle';release(u);}if(o.hp<=0){o.done=true;note(s,o.kind==='bridge'?'Reed bridge complete.':'Barrier cleared.');}}
 if(o.kind==='enemy'&&o.hp>0)o.hp-=TYPES[u.type].attack*dt*(1+u.maturity*.2);
 }} }
 for(const o of s.objects){if(o.done)continue;if(o.kind==='enemy'){if(o.hp<=0){o.kind='carcass';for(const u of workers(s,o)){u.state='carry';}note(s,`${o.name} defeated. Carry it home to grow scouts.`);continue;}const targets=s.units.filter(u=>u.state!=='seed'&&u.state!=='air'&&dist(u,o)<2.8);o.cooldown-=dt;if(o.windup>0){o.windup-=dt;if(o.windup<=0){targets.slice(0,3).forEach(u=>dead.add(u.id));if(dist(s.player,o)<3)s.player.hp-=18;o.cooldown=3.3;}}else if(o.cooldown<=0&&(targets.length||dist(s.player,o)<3)){o.windup=1.3;note(s,`${o.name} is winding up! Whistle your scouts away.`);}else if(!targets.length&&dist(o,s.player)<7&&dist(o,{x:o.homeX,z:o.homeZ})<6)move(s,o,s.player,.7,dt);}
 if(['part','pellet','carcass'].includes(o.kind)){const crew=workers(s,o).filter(u=>!dead.has(u.id)&&dist(u,o)<2.4);o.carriers=crew.length;if(crew.length>=o.weight){const type=crew.every(u=>u.type==='blue')?'blue':crew.every(u=>u.type==='red')?'red':'yellow';if(o.typeForPath!==type){o.path=[];o.pathAge=0;}o.typeForPath=type;const old={x:o.x,z:o.z};o.type= o.kind==='pellet'?o.type:type;o.height=0;const proxy={...o,type};move(s,proxy,BASE,.9+crew.length/o.maxCarriers*1.4,dt,true);o.x=proxy.x;o.z=proxy.z;o.path=proxy.path;o.pathAge=proxy.pathAge;for(const u of crew){u.x+=o.x-old.x;u.z+=o.z-old.z;}if(dist(o,BASE)<2)deliver(s,o,crew);}}
 }
 if(dead.size){s.units=s.units.filter(u=>!dead.has(u.id));s.lost+=dead.size;note(s,`${dead.size} scout${dead.size===1?'':'s'} lost. Recall before danger strikes.`);}if(s.phase==='playing'&&(s.player.hp<=0||s.time>=s.duration))sunset(s);return s;}

/** Validate active and inactive region data before using a local saved snapshot. */
export function hydrateGame(raw){
 try {
 const s=typeof raw==='string'?JSON.parse(raw):JSON.parse(JSON.stringify(raw));
 const finite=(...xs)=>xs.every(Number.isFinite),point=o=>o&&finite(o.x,o.z)&&Math.abs(o.x)<=30&&Math.abs(o.z)<=30;
 const validUnit=u=>point(u)&&TYPES[u.type]&&Number.isInteger(u.id)&&u.id>0&&Number.isInteger(u.maturity)&&u.maturity>=0&&u.maturity<=2&&['follow','idle','air','work','carry','panic','seed'].includes(u.state)&&(u.state!=='air'||finite(u.air,u.startX,u.startZ,u.landX,u.landZ));
 const validObject=o=>{if(!point(o)||!Number.isInteger(o.id)||typeof o.done!=='boolean'||!['part','pellet','carcass','enemy','gate','bridge','bomb','nectar'].includes(o.kind))return false;
 if(['part','pellet','carcass','enemy'].includes(o.kind)&&(!finite(o.weight,o.maxCarriers)||o.weight<1||o.maxCarriers<o.weight||o.maxCarriers>100))return false;
 if(['enemy','gate','bridge'].includes(o.kind)&&!finite(o.hp,o.maxHp))return false;
 if(['gate','bridge'].includes(o.kind)&&(!finite(o.w,o.d)||o.w<=0||o.d<=0))return false;
 if(['bridge','gate'].includes(o.kind)&&!finite(o.workX,o.workZ))return false;
 if(['bomb','nectar'].includes(o.kind)&&(!Number.isInteger(o.charges)||o.charges<0))return false;
 if(['pellet','carcass','enemy'].includes(o.kind)&&(!finite(o.value)||o.value<1))return false;
 return true;};
 const list=(xs,validator,max=100)=>Array.isArray(xs)&&xs.length<=max&&xs.every(validator)&&new Set(xs.map(x=>x.id)).size===xs.length;
 if(!s||s.version!==1||!['quick','classic'].includes(s.mode)||!['playing','sunset','won','lost'].includes(s.phase)||!Number.isInteger(s.day)||s.day<1||s.day>30||!Number.isInteger(s.zone)||!ZONES[s.zone]||!point(s.player)||!s.reserves||!Array.isArray(s.recoveredIds))return null;
 if(!finite(s.player.hp,s.time,s.nextId,s.recovered,s.recoveredRequired,s.lost,s.totalGrown)||s.time<0||!Number.isInteger(s.recovered)||s.recovered<0||s.recovered>30||!Number.isInteger(s.recoveredRequired)||s.recoveredRequired<0||s.recoveredRequired>25||s.recoveredRequired>s.recovered)return null;
 if(Object.keys(TYPES).some(t=>!Number.isInteger(s.reserves[t])||s.reserves[t]<0||s.reserves[t]>100000)||!list(s.units,validUnit)||!list(s.objects,validObject))return null;
 if(s.recoveredIds.length!==s.recovered||new Set(s.recoveredIds).size!==s.recovered||s.recoveredIds.some(id=>!Number.isInteger(id)||id%1000<1||id%1000>6||id<1||id>4006))return null;
 if(!s.worlds||typeof s.worlds!=='object'||Array.isArray(s.worlds)||Object.keys(s.worlds).some(k=>!['0','1','2','3','4'].includes(k)))return null;
 for(const world of Object.values(s.worlds)){if(!world||!list(world.objects,validObject)||!list(world.seedlings,u=>validUnit(u)&&u.state==='seed'))return null;}
 if(!Number.isInteger(s.nextId)||s.nextId<=Math.max(0,...s.units.map(u=>u.id),...Object.values(s.worlds).flatMap(w=>w.seedlings.map(u=>u.id))))return null;
 for(const u of s.units){u.path=[];u.pathAge=0;}for(const o of s.objects){o.path=[];o.pathAge=0;}
 s.terrain=getTerrain(s.zone);s.zones=ZONES;s.duration=s.mode==='classic'?780:240;s.events=Array.isArray(s.events)?s.events.filter(x=>typeof x==='string').slice(-25):[];s.selectedType=TYPES[s.selectedType]?s.selectedType:'red';s.whistleRadius=0;s.aim=point(s.aim)?s.aim:{...BASE};
 return s;
 }catch{return null;}
}
