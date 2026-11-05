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
function person(g,x,z,shirt,opts={}){
 const a=new T.Group();a.position.set(x,0,z);g.add(a);const seated=!!opts.wheelchair;
 const skin=opts.skin||'#b88967',hip=seated?.46:.5;
 const torso=new T.Mesh(new T.CapsuleGeometry(.14,.22,5,12),mat(shirt));torso.position.y=hip+.22;torso.scale.z=.8;a.add(torso);
 ball(a,0,hip+.62,0,.16,skin);const hair=ball(a,0,hip+.71,-.02,.145,opts.elder?'#d8d5ca':'#303538');hair.scale.y*=.65;
 function limb(x,y,length,c){const pivot=new T.Group();pivot.position.set(x,y,0);a.add(pivot);const m=new T.Mesh(new T.CapsuleGeometry(.055,length-.11,4,8),mat(c));m.position.y=-length/2;pivot.add(m);return pivot;}
 const legs=[limb(-.095,hip,.46,'#243c50'),limb(.095,hip,.46,'#243c50')];
 const arms=[limb(-.21,hip+.36,.37,shirt),limb(.21,hip+.36,.37,shirt)];arms.forEach(arm=>ball(arm,0,-.38,0,.058,skin));
 legs.forEach(leg=>box(leg,0,-.43,.045,.13,.08,.22,'#314959'));
 if(seated){legs.forEach(leg=>leg.rotation.x=-.4);for(const x of [-.29,.29]){const wheel=new T.Mesh(new T.TorusGeometry(.27,.035,8,24),mat('#284353'));wheel.rotation.y=Math.PI/2;wheel.position.set(x,.28,0);a.add(wheel);box(a,x,.28,0,.035,.48,.035,'#9dafb2');}box(a,0,.43,0,.48,.07,.44,'#426b7c');box(a,0,.65,-.18,.48,.48,.06,'#426b7c');}
 let bag;if(opts.bag){bag=box(arms[1],0,-.48,.03,.23,.27,.18,'#d0ac76');}
 a.userData={arm:arms[1],arms,legs,seated,bag};return a;
}
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
for(const name of ['neighbours','school','office']){const g=new T.Group();scenes[name]=g;root.add(g);g.visible=name==='neighbours';box(g,0,-.16,0,8,.3,5,'#b9ccd1');box(g,0,.015,.8,7.8,.03,2.6,'#e4e6da');if(name==='neighbours'){building(g,-1.5,-1.25,2.5,4.1,'#9ab8c6');building(g,1.45,-1.4,2.4,3.5,'#7798ab');actors.push(person(g,-.7,.8,'#438197'),person(g,.7,1,'#ccb68c',{elder:true}),person(g,1.8,1.2,'#7f9e88',{wheelchair:true}));bubbles.push(bubble(g,.2,2,1,'Need a hand with those?'));}else if(name==='school'){createSchool(g);}else{box(g,0,1.4,-1.6,7,2.8,.15,'#9eb7c1');for(let i=-3;i<4;i++){box(g,i,1.6,-1.48,.87,2,.04,'#6990a6');box(g,i+.47,1.6,-1.45,.04,2.3,.08,'#d7e2df');}for(const x of [-1.5,1.5]){box(g,x,.72,0,1.8,.12,1,'#d1ba94');box(g,x,.33,0,.15,.66,.5,'#617985');box(g,x,.99,-.1,.55,.4,.05,'#2b4b61');box(g,x,.77,.1,.6,.03,.4,'#748a93');}actors.push(person(g,-1.2,1,'#4f8395',{bag:true}),person(g,.3,.9,'#b8a17b'),person(g,1.6,.9,'#607e75'));bubbles.push(bubble(g,.3,2.4,.7,'Lunch drive. Count me in!'));}}
actors.push(person(scenes.neighbours,2.8,1.8,'#496e92',{bag:true,skin:'#89654e'}));
for(const name of ['neighbours','office']){scenarioActors[name]=actors.filter(a=>a.parent===scenes[name]);scenarioActors[name].forEach(a=>a.userData.start=a.position.clone());scenarioBubbles[name]=bubbles.find(b=>b.parent===scenes[name]);}
const requestPhone=box(scenarioActors.neighbours[1].userData.arms[1],0,-.34,.08,.1,.17,.025,'#2a6883');
const donationBox=box(scenes.office,0,.3,1.95,.65,.6,.5,'#c6a77a');donationBox.visible=true;
const donatedBag=box(scenes.office,0,.8,1.95,.23,.27,.18,'#d0ac76');donatedBag.visible=false;
const requestSignal=bubble(scenes.neighbours,.7,2.1,1,'Can someone come with me?');requestSignal.visible=false;
const officeSignal=bubble(scenes.office,0,2.1,1,'Join the food drive');officeSignal.visible=false;
const helpReply=bubble(scenes.neighbours,.7,2.1,1,'Thank you, neighbour!');helpReply.visible=false;
const teamReply=bubble(scenes.office,.3,2.4,.7,'Together for the food drive');teamReply.visible=false;
const copy={neighbours:['AT HOME','An appointment. Someone by your side.','An older neighbour needs a lift and company for a hospital appointment. A request on Beacon connects them with someone nearby, while another neighbour helps a wheelchair user with groceries.'],school:['SCHOOL CONCEPT','Every classroom. One connected school.','Imagine each classroom as a node in Beacon: coordinate announcements, classroom requests and shared resources from one school hub. Lost and found and parent support stay part of the same community.'],office:['AT WORK','Colleagues become a community.','Coordinate a donation drive, find shared support and bring people together beyond their desks.']};
['space-label','space-title','space-copy'].forEach((id,i)=>document.getElementById(id).textContent=copy.neighbours[i]);
document.querySelectorAll('[data-space]').forEach(button=>button.addEventListener('click',()=>{Object.entries(scenes).forEach(([name,g])=>g.visible=name===button.dataset.space);document.querySelectorAll('[data-space]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const c=copy[button.dataset.space];['space-label','space-title','space-copy'].forEach((id,i)=>document.getElementById(id).textContent=c[i]);root.rotation.y=-.12;activeSpace=button.dataset.space;schoolActive=activeSpace==='school';document.querySelectorAll('[data-scenario-controls]').forEach(el=>el.hidden=el.dataset.scenarioControls!==activeSpace);schoolControls.hidden=!schoolActive;stage.classList.toggle('school-active',schoolActive);document.querySelector('.space-example').textContent=schoolActive?'Classroom management concept, not an available product feature.':'Illustrative scenarios, not live activity.';}));

const schoolControls=document.createElement('div');schoolControls.className='school-controls';schoolControls.hidden=true;
schoolControls.innerHTML='<button id="connect-classrooms" aria-pressed="false">Connect the classrooms</button><button id="school-announcement" disabled>Preview school announcement</button><p id="school-status" role="status">Four classrooms, each with its own community.</p>';
stage.after(schoolControls);
document.getElementById('connect-classrooms').addEventListener('click',e=>{schoolConnected=!schoolConnected;e.currentTarget.setAttribute('aria-pressed',String(schoolConnected));e.currentTarget.textContent=schoolConnected?'Show the classrooms':'Connect the classrooms';document.getElementById('school-announcement').disabled=!schoolConnected;document.getElementById('school-status').textContent=schoolConnected?'Four class nodes connected to one Beacon school hub.':'Four classrooms, each with its own community.';});
document.getElementById('school-announcement').addEventListener('click',()=>{document.getElementById('school-status').textContent='Preview: one announcement reaches all four classrooms. Library book drive on Thursday.';});

const storyClock={neighbours:0,office:0},storyStep={neighbours:-1,office:-1};
const storySteps={neighbours:[['A request for company','I have a hospital appointment tomorrow, but no one to go with. Could a neighbour offer a lift and come along?'],['A neighbour replies','I can help. Let us arrange a time and meet at the entrance.'],['Meeting at the entrance','The helper walks over and stops beside the older neighbour. Another neighbour brings groceries to the wheelchair user.'],['On their way, together','They walk together to the agreed pickup point for the appointment.']],office:[['A team invitation','Thursday food drive: bring a contribution to the collection point.'],['Colleagues join in','The team agrees where to meet and what to bring.'],['Contributions arrive','Colleagues walk around the desks and stop beside the collection point.'],['One team effort','A contribution is placed at the collection point, ready for the drive.']]};
const storyPanel=document.createElement('div');storyPanel.className='scene-story';storyPanel.setAttribute('aria-live','polite');storyPanel.innerHTML='<span class="eyebrow">ILLUSTRATIVE STORY</span><strong></strong><p></p><div class="story-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></div>';stage.append(storyPanel);
function showStep(name,step){if(storyStep[name]===step&&storyPanel.dataset.storySpace===name)return;storyStep[name]=step;storyPanel.dataset.storySpace=name;storyPanel.querySelector('strong').textContent=storySteps[name][step][0];storyPanel.querySelector('p').textContent=storySteps[name][step][1];storyPanel.querySelectorAll('i').forEach((el,i)=>el.classList.toggle('active',i<=step));}
for(const name of ['neighbours','office']){
 const controls=document.createElement('div');controls.className='school-controls scenario-controls';controls.dataset.scenarioControls=name;controls.hidden=name!=='neighbours';
 controls.innerHTML='<button data-scenario-action="'+name+'">Play animation</button><button data-scenario-preview="'+name+'">Next moment</button><button data-story-pause="'+name+'" hidden>Pause animation</button><p>Request, reply, meet and help. Play to watch the full sequence.</p>';
 const primary=controls.querySelector('[data-scenario-action]');primary.setAttribute('aria-pressed','false');
 function reveal(){if(innerWidth<700)stage.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});}
 primary.addEventListener('click',()=>{storyClock[name]=0;scenarioOn[name]=true;primary.setAttribute('aria-pressed','true');primary.textContent='Restart animation';controls.querySelector('[data-story-pause]').hidden=false;controls.querySelector('[data-story-pause]').textContent='Pause animation';showStep(name,0);reveal();});
 controls.querySelector('[data-scenario-preview]').addEventListener('click',()=>{scenarioOn[name]=!reduced.matches;const next=(Math.max(0,storyStep[name])+1)%4;storyClock[name]=(reduced.matches?[0,1.5,7,14]:[0,1.5,3,8])[next];showStep(name,next);const pause=controls.querySelector('[data-story-pause]');pause.hidden=!scenarioOn[name];pause.textContent='Pause animation';reveal();});
 controls.querySelector('[data-story-pause]').addEventListener('click',e=>{scenarioOn[name]=!scenarioOn[name];e.currentTarget.textContent=scenarioOn[name]?'Pause animation':'Resume animation';});
 schoolControls.after(controls);
}
function walk(actor,x,z,phase,amount=1){actor.position.set(x,Math.sin(phase*2)*.018*amount,z);if(actor.userData.seated)return;actor.userData.legs.forEach((leg,i)=>leg.rotation.x=Math.sin(phase+i*Math.PI)*.38*amount);actor.userData.arms.forEach((arm,i)=>arm.rotation.x=-Math.sin(phase+i*Math.PI)*.25*amount);}
function smooth(v){v=T.MathUtils.clamp(v,0,1);return v*v*(3-2*v);}
function updateStory(name,dt,moving){
 if(scenarioOn[name]&&name===activeSpace)storyClock[name]=Math.min(14,storyClock[name]+dt);
 const time=storyClock[name];const step=time<1.5?0:time<3?1:time<8?2:3;
 if(name===activeSpace){storyPanel.hidden=false;showStep(name,step);storyPanel.dataset.playbackTime=time.toFixed(2);storyPanel.style.setProperty('--playback',time/14);}
 if(time>=14&&scenarioOn[name]){scenarioOn[name]=false;document.querySelector('[data-scenario-action='+name+']').textContent='Replay animation';document.querySelector('[data-story-pause='+name+']').hidden=true;}
 const meet=smooth((time-3)/4),escort=smooth((time-8)/6),walking=time>3&&time<7||name==='neighbours'&&time>8&&time<14;
 scenarioActors[name].forEach((actor,i)=>{const v=actor.userData.start;let x=v.x,z=v.z;
 if(name==='neighbours'){if(i===0){x=v.x+.6*meet-2*escort;z=v.z+.2*meet+.6*escort;}if(i===1){x=v.x-2*escort;z=v.z+.6*escort;}if(i===3){x=v.x-.15*meet;z=v.z-.6*meet;}}
 else{if(i===0){x=v.x+.25*meet;z=v.z+.5*meet;}if(i===1){x=v.x-.3*meet;z=v.z-.1*meet;}if(i===2){x=v.x-.6*meet;z=v.z+.6*meet;}}
 const actorWalking=walking&&(name==='office'||i===0||i===3&&time<7||i===1&&time>8);walk(actor,x,z,time*8,actorWalking?1:0);actor.rotation.y=actorWalking&&name==='neighbours'?(time>8?-1.28:i===0?1.25:-2.9):0;
 });
 if(scenarioBubbles[name])scenarioBubbles[name].visible=false;
 if(name==='neighbours'){requestSignal.visible=time<3&&scenarioOn[name];requestSignal.position.set(T.MathUtils.lerp(.7,-.7,smooth((time-1)/2)),2.1+Math.sin(time*3)*.08,1);requestPhone.visible=time<3;scenarioActors.neighbours[1].userData.arms[1].rotation.x=time<3?-1.15+Math.sin(time*4)*.12:scenarioActors.neighbours[1].userData.arms[1].rotation.x;helpReply.visible=time>=7;helpReply.position.set(-.2-2*escort,2,1);}
 else{officeSignal.visible=time<3&&scenarioOn[name];officeSignal.position.y=2.1+Math.sin(time*3)*.1;teamReply.visible=time>=8;donationBox.visible=true;const transfer=smooth((time-8)/3);const carrier=scenarioActors.office[0];if(carrier.userData.bag)carrier.userData.bag.visible=transfer===0;donatedBag.visible=transfer>0;donatedBag.position.set(T.MathUtils.lerp(-.75,0,transfer),.76+Math.sin(transfer*Math.PI)*.3,T.MathUtils.lerp(1.5,1.95,transfer));}
}
let visible=false;new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(stage);let target=0;
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){const r=canvas.getBoundingClientRect();target=(e.clientX-r.left)/r.width*.3-.15;}});canvas.addEventListener('pointerleave',()=>target=0);
function resize(){const w=stage.clientWidth,h=w<700?340:stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;const mobile=w<700;camera.position.set(mobile?8:8,mobile?7:6.2,mobile?14:10);camera.lookAt(mobile?new T.Vector3(0,.7,0):new T.Vector3(-1.8,.8,0));camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(stage);resize();const reduced=matchMedia('(prefers-reduced-motion: reduce)');let last=0;
function tick(t){requestAnimationFrame(tick);if(!visible||document.hidden||t-last<33)return;const dt=Math.min((t-last)/1000,.2);last=t;const moving=!reduced.matches&&!document.body.classList.contains('motion-paused');root.rotation.y=T.MathUtils.lerp(root.rotation.y,moving?target:0,.07);if(moving){bubbles.forEach((b,i)=>b.rotation.z=Math.sin(t*.0008+i)*.015);}const goal=schoolConnected?1:0;schoolProgress=moving?T.MathUtils.lerp(schoolProgress,goal,.06):goal;
 schoolRooms.forEach(({interior,node})=>{interior.scale.setScalar(Math.max(.001,1-schoolProgress));interior.visible=schoolProgress<.99;node.scale.setScalar(Math.max(.01,schoolProgress));});
 schoolLinks.forEach(link=>link.material.opacity=schoolProgress*.85);
 schoolPackets.forEach(({packet,curve,index})=>{packet.visible=schoolConnected;packet.position.copy(curve.getPoint(moving?(t*.00018+index*.2)%1:.5));});
 for(const name of ['neighbours','office'])updateStory(name,dt,moving);storyPanel.hidden=schoolActive;
 renderer.render(scene,camera);}requestAnimationFrame(tick);


function applySceneTheme(){const dark=document.documentElement.dataset.theme==='dark';scene.background.set(dark?'#102b3e':'#d5e5ea');sun.intensity=dark?2.1:3.2;}
new MutationObserver(applySceneTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});applySceneTheme();
