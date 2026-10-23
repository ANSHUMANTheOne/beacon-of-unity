import * as T from 'three';
const canvas=document.querySelector('#spaces-canvas'),stage=canvas.parentElement;
const scene=new T.Scene();scene.background=new T.Color('#d5e5ea');
const camera=new T.PerspectiveCamera(35,1,.1,80);
let renderer;try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});}catch(e){stage.classList.add('space-fallback');throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
scene.add(new T.HemisphereLight(0xf0faff,0x697e88,2.6));const sun=new T.DirectionalLight(0xffebd1,3.2);sun.position.set(-4,9,5);scene.add(sun);
const mats={};function mat(c){return mats[c]??=(new T.MeshStandardMaterial({color:c,roughness:.65}));}
const boxGeo=new T.BoxGeometry(1,1,1),sphereGeo=new T.SphereGeometry(1,16,12);
function box(g,x,y,z,w,h,d,c){const m=new T.Mesh(boxGeo,mat(c));m.position.set(x,y,z);m.scale.set(w,h,d);g.add(m);return m;}
function ball(g,x,y,z,r,c){const m=new T.Mesh(sphereGeo,mat(c));m.position.set(x,y,z);m.scale.setScalar(r);g.add(m);return m;}
function cylinder(g,x,y,z,r,h,c){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,16),mat(c));m.position.set(x,y,z);g.add(m);return m;}
function person(g,x,z,shirt,opts={}){const a=new T.Group();a.position.set(x,0,z);g.add(a);const seated=opts.wheelchair;const y=seated?.57:.68;box(a,0,y,0,.3,.48,.23,shirt);ball(a,0,y+.4,0,.17,opts.skin||'#b88967');ball(a,0,y+.49,-.015,.155,opts.elder?'#d8d5ca':'#303538');box(a,-.1,seated?.25:.22,seated?.15:0,.12,.44,.13,'#243c50');box(a,.1,seated?.25:.22,seated?.15:0,.12,.44,.13,'#243c50');box(a,-.23,y-.08,.04,.11,.4,.12,shirt);const arm=box(a,.23,y+.02,.1,.11,.4,.12,shirt);arm.rotation.x=-.65;
 if(seated){for(const x of [-.27,.27]){const wheel=new T.Mesh(new T.TorusGeometry(.27,.035,8,24),mat('#284353'));wheel.rotation.y=Math.PI/2;wheel.position.set(x,.28,0);a.add(wheel);box(a,x,.28,0,.035,.48,.035,'#9dafb2');}box(a,0,.43,0,.48,.07,.44,'#426b7c');box(a,0,.65,-.18,.48,.48,.06,'#426b7c');}
 if(opts.bag)box(a,.32,.43,.19,.23,.27,.18,'#d0ac76');a.userData.arm=arm;return a;}
function bubble(g,x,y,z,label){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#f9fcff';ctx.beginPath();ctx.roundRect(0,0,512,110,24);ctx.fill();ctx.fillStyle='#183d50';ctx.font=label.length<12?'600 54px sans-serif':'600 30px sans-serif';ctx.textAlign='center';ctx.fillText(label,256,68);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false,toneMapped:false}));sprite.position.set(x,y,z);sprite.scale.set(2.2,.55,1);g.add(sprite);return sprite;}
function building(g,x,z,w,h,color){box(g,x,h/2,z,w,h,1.3,color);box(g,x,h+.05,z,w+.15,.1,1.45,'#edf3ef');for(let row=.65;row<h-.2;row+=.65)for(let col=-w/2+.3;col<w/2;col+=.55){box(g,x+col,row,z+.66,.32,.4,.025,'#386a80');box(g,x+col,row-.23,z+.74,.4,.04,.17,'#e4ebdf');}}
// A school concept: physical classrooms gather into a connected Beacon network.
const schoolRooms=[],schoolLinks=[],schoolPackets=[];
let schoolProgress=0,schoolConnected=false,schoolActive=false;
function createSchool(g){
 const hub=new T.Group();g.add(hub);cylinder(hub,0,.15,0,.65,.3,'#376d85');cylinder(hub,0,.37,0,.42,.15,'#79d2e8');ball(hub,0,.7,0,.22,'#e5f9ff');bubble(hub,0,1.35,0,'BEACON');
 [[-2.4,-1.25],[2.4,-1.25],[-2.4,1.45],[2.4,1.45]].forEach(([x,z],i)=>{
  const room=new T.Group();room.position.set(x,0,z);g.add(room);
  box(room,0,.09,0,1.8,.18,1.6,'#edf0e3');
  const interior=new T.Group();room.add(interior);
  box(interior,0,.65,-.75,1.8,1.15,.09,'#93b1bd');box(interior,-.86,.65,0,.09,1.15,1.6,'#abc4cb');box(interior,0,.73,-.68,1,.48,.03,'#2a5665');
  for(const dx of [-.4,.4]){box(interior,dx,.5,.1,.5,.07,.38,'#cab18b');box(interior,dx,.29,.1,.05,.4,.18,'#687e85');const student=person(interior,dx,.48,['#578999','#9cad8c','#bd9f80','#648195'][i]);student.scale.setScalar(.48);}
  const node=cylinder(room,0,.22,0,.52,.16,'#4e9bb7');node.scale.setScalar(.01);
  const label=bubble(room,0,1.55,0,'Class '+(i+1));label.scale.set(1.4,.35,1);
  schoolRooms.push({room,interior,node,x,z});
  const curve=new T.QuadraticBezierCurve3(new T.Vector3(x,.25,z),new T.Vector3(x*.5,.9,z*.5),new T.Vector3(0,.45,0));
  const link=new T.Mesh(new T.TubeGeometry(curve,32,.025,6,false),new T.MeshBasicMaterial({color:'#368dac',transparent:true,opacity:0}));g.add(link);schoolLinks.push(link);
  const packet=ball(g,x,.25,z,.075,'#e8fbff');packet.visible=false;schoolPackets.push({packet,curve,index:i});
 });
}
const root=new T.Group();scene.add(root);const scenes={},actors=[],bubbles=[];const scenarioActors={},scenarioBubbles={};let activeSpace='neighbours';const scenarioOn={neighbours:false,office:false};const scenarioProgress={neighbours:0,office:0};
for(const name of ['neighbours','school','office']){const g=new T.Group();scenes[name]=g;root.add(g);g.visible=name==='neighbours';box(g,0,-.16,0,8,.3,5,'#b9ccd1');box(g,0,.015,.8,7.8,.03,2.6,'#e4e6da');if(name==='neighbours'){building(g,-1.5,-1.25,2.5,4.1,'#9ab8c6');building(g,1.45,-1.4,2.4,3.5,'#7798ab');actors.push(person(g,-.7,.8,'#438197',{bag:true}),person(g,.7,1,'#ccb68c',{elder:true}),person(g,1.8,1.2,'#7f9e88',{wheelchair:true}));bubbles.push(bubble(g,.2,2,1,'Need a hand with those?'));}else if(name==='school'){createSchool(g);}else{box(g,0,1.4,-1.6,7,2.8,.15,'#9eb7c1');for(let i=-3;i<4;i++){box(g,i,1.6,-1.48,.87,2,.04,'#6990a6');box(g,i+.47,1.6,-1.45,.04,2.3,.08,'#d7e2df');}for(const x of [-1.5,1.5]){box(g,x,.72,0,1.8,.12,1,'#d1ba94');box(g,x,.33,0,.15,.66,.5,'#617985');box(g,x,.99,-.1,.55,.4,.05,'#2b4b61');box(g,x,.77,.1,.6,.03,.4,'#748a93');}actors.push(person(g,-1.2,1,'#4f8395',{bag:true}),person(g,.3,.9,'#b8a17b'),person(g,1.6,.9,'#607e75'));bubbles.push(bubble(g,.3,2.4,.7,'Lunch drive. Count me in!'));}}
actors.push(person(scenes.neighbours,2.8,1.8,'#496e92',{bag:true,skin:'#89654e'}));
for(const name of ['neighbours','office']){scenarioActors[name]=actors.filter(a=>a.parent===scenes[name]);scenarioActors[name].forEach(a=>a.userData.start=a.position.clone());scenarioBubbles[name]=bubbles.find(b=>b.parent===scenes[name]);}
const donationBox=box(scenes.office,0,.3,1.35,.65,.6,.5,'#c6a77a');donationBox.visible=false;
const helpReply=bubble(scenes.neighbours,.7,2.1,1,'Thank you, neighbour!');helpReply.visible=false;
const teamReply=bubble(scenes.office,.3,2.4,.7,'Together for the food drive');teamReply.visible=false;
const copy={neighbours:['AT HOME','A small favour. A familiar face.','Neighbours lend a hand with groceries and everyday errands, including support for older residents and wheelchair users. Small gestures make a building feel like a community.'],school:['SCHOOL CONCEPT','Every classroom. One connected school.','Imagine each classroom as a node in Beacon: coordinate announcements, classroom requests and shared resources from one school hub. Lost and found and parent support stay part of the same community.'],office:['AT WORK','Colleagues become a community.','Coordinate a donation drive, find shared support and bring people together beyond their desks.']};
document.querySelectorAll('[data-space]').forEach(button=>button.addEventListener('click',()=>{Object.entries(scenes).forEach(([name,g])=>g.visible=name===button.dataset.space);document.querySelectorAll('[data-space]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const c=copy[button.dataset.space];['space-label','space-title','space-copy'].forEach((id,i)=>document.getElementById(id).textContent=c[i]);root.rotation.y=-.12;activeSpace=button.dataset.space;schoolActive=activeSpace==='school';document.querySelectorAll('[data-scenario-controls]').forEach(el=>el.hidden=el.dataset.scenarioControls!==activeSpace);schoolControls.hidden=!schoolActive;stage.classList.toggle('school-active',schoolActive);document.querySelector('.space-example').textContent=schoolActive?'Classroom management concept, not an available product feature.':'Illustrative scenarios, not live activity.';}));

const schoolControls=document.createElement('div');schoolControls.className='school-controls';schoolControls.hidden=true;
schoolControls.innerHTML='<button id="connect-classrooms" aria-pressed="false">Connect the classrooms</button><button id="school-announcement" disabled>Preview school announcement</button><p id="school-status" role="status">Four classrooms, each with its own community.</p>';
stage.after(schoolControls);
document.getElementById('connect-classrooms').addEventListener('click',e=>{schoolConnected=!schoolConnected;e.currentTarget.setAttribute('aria-pressed',String(schoolConnected));e.currentTarget.textContent=schoolConnected?'Show the classrooms':'Connect the classrooms';document.getElementById('school-announcement').disabled=!schoolConnected;document.getElementById('school-status').textContent=schoolConnected?'Four class nodes connected to one Beacon school hub.':'Four classrooms, each with its own community.';});
document.getElementById('school-announcement').addEventListener('click',()=>{document.getElementById('school-status').textContent='Preview: one announcement reaches all four classrooms. Library book drive on Thursday.';});

for(const [name,action,preview,initial] of [
 ['neighbours','Show neighbours helping','Preview a help request','See how a nearby request can become a helping hand.'],
 ['office','Bring the team together','Preview a team activity','Turn a shared workplace into a community that helps.']]){
 const controls=document.createElement('div');controls.className='school-controls scenario-controls';controls.dataset.scenarioControls=name;controls.hidden=name!=='neighbours';
 const primary=document.createElement('button');primary.textContent=action;primary.dataset.scenarioAction=name;primary.setAttribute('aria-pressed','false');
 const secondary=document.createElement('button');secondary.textContent=preview;secondary.dataset.scenarioPreview=name;
 const status=document.createElement('p');status.setAttribute('role','status');status.textContent=initial;
 primary.addEventListener('click',()=>{if(innerWidth<700)stage.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});scenarioOn[name]=!scenarioOn[name];primary.setAttribute('aria-pressed',String(scenarioOn[name]));primary.textContent=scenarioOn[name]?'Reset the scene':action;status.textContent=scenarioOn[name]?(name==='neighbours'?'Two neighbours lend a hand: groceries for an older resident and a bag brought over to a wheelchair user.':'Colleagues coordinate a food drive and gather their contributions in one place.'):initial;});
 secondary.addEventListener('click',()=>{if(innerWidth<700)stage.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});scenarioOn[name]=true;primary.setAttribute('aria-pressed','true');primary.textContent='Reset the scene';status.textContent=name==='neighbours'?'Example request: Could someone bring my groceries to the building entrance? A nearby neighbour offers to help.':'Example activity: Thursday food drive. See the collection point, coordinate contributions and join your colleagues.';});
 controls.append(primary,secondary,status);schoolControls.after(controls);
}
let visible=false;new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(stage);let target=0;
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){const r=canvas.getBoundingClientRect();target=(e.clientX-r.left)/r.width*.3-.15;}});canvas.addEventListener('pointerleave',()=>target=0);
function resize(){const w=stage.clientWidth,h=w<700?340:stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;const mobile=w<700;camera.position.set(mobile?8:8,mobile?7:6.2,mobile?14:10);camera.lookAt(mobile?new T.Vector3(0,.7,0):new T.Vector3(-1.8,.8,0));camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(stage);resize();const reduced=matchMedia('(prefers-reduced-motion: reduce)');let last=0;
function tick(t){requestAnimationFrame(tick);if(!visible||document.hidden||t-last<33)return;last=t;const moving=!reduced.matches&&!document.body.classList.contains('motion-paused');root.rotation.y=T.MathUtils.lerp(root.rotation.y,moving?target:0,.07);if(moving){actors.forEach((a,i)=>a.userData.arm.rotation.x=-.65+Math.sin(t*.001+i)*.14);bubbles.forEach((b,i)=>b.rotation.z=Math.sin(t*.0008+i)*.015);}const goal=schoolConnected?1:0;schoolProgress=moving?T.MathUtils.lerp(schoolProgress,goal,.06):goal;
 schoolRooms.forEach(({interior,node})=>{interior.scale.setScalar(Math.max(.001,1-schoolProgress));interior.visible=schoolProgress<.99;node.scale.setScalar(Math.max(.01,schoolProgress));});
 schoolLinks.forEach(link=>link.material.opacity=schoolProgress*.85);
 schoolPackets.forEach(({packet,curve,index})=>{packet.visible=schoolConnected;packet.position.copy(curve.getPoint(moving?(t*.00018+index*.2)%1:.5));});
 for(const name of ['neighbours','office']){
 scenarioProgress[name]=moving?T.MathUtils.lerp(scenarioProgress[name],scenarioOn[name]?1:0,.035):(scenarioOn[name]?1:0);
 const progress=scenarioProgress[name];scenarioActors[name].forEach((a,i)=>{const start=a.userData.start;a.position.copy(start);if(name==='neighbours'&&i===0){a.position.x+=progress*.8;a.position.z+=progress*.2;}if(name==='neighbours'&&i===3){a.position.x-=progress*.65;a.position.z-=progress*.55;}if(name==='office'){a.position.x+=(i===0?.65:i===2?-.55:0)*progress;a.position.z+=progress*.35;}});
 if(scenarioBubbles[name])scenarioBubbles[name].visible=progress<.7;
 }
 helpReply.visible=scenarioProgress.neighbours>=.7;teamReply.visible=scenarioProgress.office>=.7;donationBox.visible=scenarioProgress.office>.2;donationBox.scale.setScalar(Math.max(.01,scenarioProgress.office));
 renderer.render(scene,camera);}requestAnimationFrame(tick);
