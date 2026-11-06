import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;
const ease = t => t*t*(3-2*t);

/** One scene, a small material palette, shared geometries, and authored camera paths.
 * Scroll stays native. The animation loop only interpolates presentation state. */
export class UnityWorld {
  constructor(canvas, onReady) {
    this.canvas=canvas; this.mobile=innerWidth<700; this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.low=this.mobile || matchMedia("(pointer:coarse)").matches || (navigator.hardwareConcurrency||8)<5; this.paused=false; this.hidden=false;
    this.yaw=0;this.targetYaw=0;this.dragStart=null;this.lastDrag=0;this.progress=0;this.targetProgress=0;this.pointer=new THREE.Vector2();this.smoothed=new THREE.Vector2();
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:!this.low,alpha:true,powerPreference:'low-power'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,this.low?1.35:1.75));
    this.renderer.setSize(innerWidth,innerHeight); this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.3;
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x081827); this.scene.fog=new THREE.FogExp2(0x081827,.035);
    const pmrem=new THREE.PMREMGenerator(this.renderer);const studio=new RoomEnvironment();this.environment=pmrem.fromScene(studio,.06).texture;this.scene.environment=this.environment;this.scene.environmentIntensity=.75;studio.dispose();pmrem.dispose();
    this.camera=new THREE.PerspectiveCamera(this.mobile?43:36,innerWidth/innerHeight,.1,160);
    this.root=new THREE.Group();this.scene.add(this.root);
    this.scene.add(new THREE.HemisphereLight(0xb9ddff,0x38465e,2));
    const sun=new THREE.DirectionalLight(0xffdfb3,3.3);sun.position.set(-8,15,8);sun.castShadow=true;
    sun.shadow.mapSize.set(this.low?1024:2048,this.low?1024:2048);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:.5,far:60});sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;this.scene.add(sun);
    const rim=new THREE.DirectionalLight(0x98e0df,2);rim.position.set(6,5,-10);this.scene.add(rim);
    this.materials={
      stone:new THREE.MeshStandardMaterial({color:0xd1d7c8,roughness:.92}),
      cream:new THREE.MeshStandardMaterial({color:0x809bb3,roughness:.45,metalness:.24}),
      white:new THREE.MeshStandardMaterial({color:0xc4d6e5,roughness:.38,metalness:.3}),
      sand:new THREE.MeshStandardMaterial({color:0xd1b08a,roughness:.84}),
      teal:new THREE.MeshStandardMaterial({color:0x197a9a,roughness:.5,metalness:.18}),
      copper:new THREE.MeshStandardMaterial({color:0xb06d45,roughness:.35,metalness:.65}),
      glass:new THREE.MeshStandardMaterial({color:0x193d5b,roughness:.12,metalness:.85}),
      leaves:new THREE.MeshStandardMaterial({color:0x527b60,roughness:.85,side:THREE.DoubleSide}),
      light:new THREE.MeshStandardMaterial({color:0xc7fff0,emissive:0x7ed5ee,emissiveIntensity:1.1,roughness:.35}),
    };
    this.box=new THREE.BoxGeometry(1,1,1);this.cylinder=new THREE.CylinderGeometry(1,1,1,48);this.sphere=new THREE.SphereGeometry(1,16,12);
    this.islands=[];this.pickables=[];this.people=[];this.bridges=[];this.rings=[];
    const defs=[[-4.1,1.1,2.2,'help'],[2.7,2.1,1.9,'found'],[.4,-3.5,2.35,'volunteer']];
    defs.forEach((d,i)=>this.createIsland(d,i));this.batchArchitecture();this.createBridges();this.createWater();
    if(!this.low){this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));this.bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.28,.45,1.35);this.composer.addPass(this.bloom);this.composer.addPass(new OutputPass());}
    this.raycaster=new THREE.Raycaster();this.hit=new THREE.Vector2();this.clock=new THREE.Clock();this.lastFrame=0;
    this.pathPosition=new THREE.Vector3();this.pathLook=new THREE.Vector3();this.look=new THREE.Vector3(); this.camGoal=new THREE.Vector3();this.lookGoal=new THREE.Vector3();
    this.resize=()=>{this.mobile=innerWidth<700;this.camera.aspect=innerWidth/innerHeight;this.camera.fov=this.mobile?43:36;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);this.composer?.setSize(innerWidth,innerHeight);this.updateScroll();};
    this.updateScroll=()=>{const end=document.getElementById('story-end');this.targetProgress=clamp(scrollY/Math.max(1,end.offsetTop-innerHeight*.2),0,1);};
    this.onPointer=e=>{if(this.dragStart){const dx=e.clientX-this.dragStart.x;if(Math.abs(dx)>5){this.targetYaw=clamp(this.dragStart.yaw+dx*.004,-.5,.5);this.lastDrag=performance.now();}}this.pointer.set(e.clientX/innerWidth*2-1,e.clientY/innerHeight*2-1);if(e.target===canvas&&e.pointerType!=='touch'){this.hit.set(this.pointer.x,-this.pointer.y);this.raycaster.setFromCamera(this.hit,this.camera);this.hovered=this.raycaster.intersectObjects(this.pickables)[0]?.object;canvas.style.cursor=this.hovered?'pointer':'';}else this.hovered=null;};
    this.onClick=e=>{if(e.target!==canvas||performance.now()-this.lastDrag<350)return;this.hit.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);this.raycaster.setFromCamera(this.hit,this.camera);const hits=this.raycaster.intersectObjects(this.pickables);if(hits.length){const name=hits[0].object.userData.action;document.querySelector(`[data-preview="${name}"]`)?.click();document.getElementById('community').scrollIntoView({behavior:this.reduced?'instant':'smooth'});}};
    canvas.tabIndex=0;canvas.style.touchAction='pan-y';
    this.onDown=e=>{if(e.target===canvas){this.dragStart={x:e.clientX,yaw:this.targetYaw};canvas.setPointerCapture(e.pointerId);}};
    this.onUp=()=>{this.dragStart=null;};
    canvas.addEventListener('pointerdown',this.onDown);canvas.addEventListener('pointerup',this.onUp);canvas.addEventListener('pointercancel',this.onUp);
    canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();this.targetYaw=clamp(this.targetYaw+(e.key==='ArrowLeft'?-.12:.12),-.5,.5);}if(e.key==='Escape')this.targetYaw=0;});
    addEventListener('resize',this.resize);addEventListener('scroll',this.updateScroll,{passive:true});addEventListener('pointermove',this.onPointer,{passive:true});canvas.addEventListener('click',this.onClick);
    document.addEventListener('visibilitychange',()=>{this.hidden=document.hidden;});
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.paused=true;document.documentElement.classList.add('world-unavailable');});
    this.updateScroll();this.progress=this.targetProgress;this.render(0,true);onReady?.();this.tick=this.tick.bind(this);this.raf=requestAnimationFrame(this.tick);
    window.__unityWorld=this;
  }
  mesh(geometry,material,parent,position,scale){const m=new THREE.Mesh(geometry,material);if(position)m.position.set(...position);if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  block(parent,material,pos,scale){return this.mesh(this.box,material,parent,pos,scale);}
  batchArchitecture(){
    // Bake static architectural pieces by material: lower draw-call overhead on phones.
    this.islands.forEach(island=>{island.updateMatrixWorld(true);const inverse=island.matrixWorld.clone().invert();const batches=new Map();const remove=[];
      island.traverse(o=>{if(!o.isMesh||this.pickables.includes(o)||this.rings.includes(o))return;const geo=o.geometry.clone();geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld));const plain=geo.index?geo.toNonIndexed():geo;if(plain!==geo)geo.dispose();if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(plain);remove.push(o);});
      remove.forEach(o=>o.removeFromParent());batches.forEach((geos,material)=>{const merged=mergeGeometries(geos);if(merged)this.mesh(merged,material,island);geos.forEach(g=>g.dispose());});
    });
  }
  createIsland([x,z,r,name],index){
    const g=new THREE.Group();g.position.set(x,0,z);this.root.add(g);this.islands.push(g);g.userData={base:new THREE.Vector3(x,0,z),name};
    const m=this.materials;
    // Connected city blocks, not floating islands. These are original illustrative buildings.
    const pavement=this.block(g,m.stone.clone(),[0,-.08,0],[r*1.8,.2,r*1.7]);pavement.userData.action=name;this.pickables.push(pavement);
    this.block(g,m.cream,[0,.035,0],[r*1.72,.04,r*1.62]);
    if(index===0){this.apartment(g,-.65,-.45,1.35,5.8,12,name);this.apartment(g,.9,.25,.95,3.2,6,name);}
    if(index===1){this.apartment(g,-.35,-.3,1.55,7.1,15,name);this.apartment(g,.85,.8,.8,2.1,4,name);}
    if(index===2){this.apartment(g,-.6,-.45,1.25,4.7,10,name);this.apartment(g,.9,-.2,1.05,6,13,name);}
    this.palm(g,-r*.67,r*.58,1.15);this.palm(g,r*.65,-r*.6,1.3);
    this.bench(g,.1,r*.66);this.person(g,-.45,r*.62,0x258eac);this.person(g,.75,r*.61,0xc9a56b);
    // Lobby lighting and planted verges give the model the scale of a lived-in street.
    this.block(g,m.leaves,[-r*.7,.16,-.1],[.18,.19,1.1]);
    for(const dx of [-1,1]){this.block(g,m.teal,[dx*r*.7,.65,r*.66],[.025,1.2,.025]);this.block(g,m.light,[dx*r*.7,1.25,r*.66],[.18,.035,.1]);}
  }
  apartment(g,x,z,w,h,floors,action){
    const m=this.materials,b=new THREE.Group();b.position.set(x,.06,z);g.add(b);
    const body=this.block(b,m.cream.clone(),[0,h/2,0],[w,h,w*.8]);body.userData.action=action;this.pickables.push(body);
    this.block(b,m.glass,[0,h/2,w*.405],[w*.76,h*.93,.02]);
    this.block(b,m.glass,[w*.505,h/2,0],[.02,h*.93,w*.62]);
    for(let f=1;f<=floors;f++){
      const y=f*h/(floors+1);
      this.block(b,m.white,[0,y,w*.47],[w*1.06,.065,.19]);
      this.block(b,m.white,[w*.54,y,0],[.1,.065,w*.88]);
      for(let col=0;col<3;col++){
        const px=(col-1)*w*.25;
        this.block(b,m.sand,[px,y-.17,w*.43],[.025,.29,.035]);
        if((f*7+col*3+floors)%5===0)this.block(b,m.light,[px,y-.15,w*.422],[w*.16,.21,.018]);
      }
    }
    for(const px of [-w*.49,w*.49])this.block(b,m.white,[px,h/2,w*.44],[.09,h,.1]);
    this.block(b,m.white,[0,h+.07,0],[w*1.08,.14,w*.9]);
    this.block(b,m.stone,[0,h+.22,-.12],[w*.6,.2,w*.45]);
    this.block(b,m.glass,[0,.22,w*.42],[w*.4,.44,.04]);
    this.block(b,m.teal,[0,.52,w*.51],[w*.65,.07,.32]);
  }
  palm(g,x,z,h){const m=this.materials;this.mesh(new THREE.CylinderGeometry(.035,.065,h,7),m.sand,g,[x,h/2+.1,z]);
    for(let k=0;k<9;k++){const a=k*Math.PI*2/9;const positions=[],uv=[],indices=[];for(let j=0;j<=8;j++){const t=j/8,length=h*.57*t,width=Math.sin(t*Math.PI)*h*.085;for(const side of [-1,1]){positions.push(x+Math.cos(a)*length-Math.sin(a)*width*side,h+.1+Math.sin(t*Math.PI)*.16-t*t*.28,z+Math.sin(a)*length+Math.cos(a)*width*side);uv.push(t,(side+1)/2);}if(j<8){const n=j*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}}const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geom.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geom.setIndex(indices);geom.computeVertexNormals();this.mesh(geom,m.leaves,g);}
  }
  person(g,x,z,color){const group=new THREE.Group();group.position.set(x,.1,z);g.add(group);this.mesh(new THREE.CapsuleGeometry(.055,.13,3,6),new THREE.MeshStandardMaterial({color,roughness:.8}),group,[0,.16,0]);this.mesh(this.sphere,this.materials.sand,group,[0,.33,0],[.056,.056,.056]);this.people.push({group,x,z,phase:this.people.length*1.7});}
  bench(g,x,z){this.block(g,this.materials.copper,[x,.24,z],[.55,.07,.22]);for(const dx of [-.2,.2])this.block(g,this.materials.teal,[x+dx,.15,z],[.035,.2,.17]);}
  tower(g){const m=this.materials;for(let i=0;i<4;i++)this.mesh(this.cylinder,m.cream,g,[0,.12+i*.09,0],[.8-i*.1,.09,.8-i*.1]);
    for(const x of [-.2,.2]){const col=this.block(g,m.white,[x,1.5,0],[.15,2.3,.25]);col.rotation.z=x>0?-.09:.09;}
    const halo=this.mesh(new THREE.TorusGeometry(.58,.085,12,64),m.copper,g,[0,2.75,0]);halo.rotation.y=.3;this.rings.push(halo);
    this.mesh(this.sphere,m.light,g,[0,2.75,0],[.22,.22,.22]);this.block(g,m.teal,[0,2.05,0],[.7,.12,.36]);
  }
  createBridges(){
    const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uTime:{value:0},uProgress:{value:0},uColor:{value:new THREE.Color(0x36a7cb)}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;uniform float uTime;uniform float uProgress;uniform vec3 uColor;void main(){float edge=1.-smoothstep(uProgress-.035,uProgress,vUv.x);float pulse=pow(max(0.,sin(vUv.x*22.-uTime*1.5)),18.);float a=(.36+pulse*.5)*edge;gl_FragColor=vec4(uColor+vec3(pulse*.3),a);}`});
    for(const [i,j] of [[0,1],[1,2],[2,0]]){const a=this.islands[i].position.clone(),b=this.islands[j].position.clone();a.y=2.4;b.y=3.2;const dir=b.clone().sub(a).normalize();a.addScaledVector(dir,1.8);b.addScaledVector(dir,-1.65);const mid=a.clone().lerp(b,.5);mid.y=5.2;const curve=new THREE.QuadraticBezierCurve3(a,mid,b);const geometry=new THREE.TubeGeometry(curve,64,.028,6,false);const material=mat.clone();const bridge=this.mesh(geometry,material,this.root);bridge.castShadow=false;
      const rails=[];
      this.bridges.push({bridge,rails});
    }
  }
  createWater(){
    // A continuous street plane grounds all three blocks in the same neighbourhood.
    const road=new THREE.MeshStandardMaterial({color:0x283b50,roughness:.96});
    this.block(this.root,road,[0,-.22,0],[90,.14,90]);
    const marking=new THREE.MeshStandardMaterial({color:0x8da3b5,roughness:1});
    for(let j=-6;j<=6;j++)this.block(this.root,marking,[j,-.14,-.25],[.42,.012,.035]);
    for(let j=0;j<6;j++)this.block(this.root,marking,[-1.5+j*.16,-.14,2.5],[.075,.012,1.1]);
    // Background buildings establish apartment density without simulating real user locations.
    const distant=new THREE.MeshStandardMaterial({color:0x26435c,roughness:.85});
    const group=new THREE.Group();this.root.add(group);
    for(let i=0;i<8;i++){
      const h=2.5+(i*7%5)*.65;this.block(group,distant,[-6+i*1.7,h/2-.15,-6],[1.05,h,.8]);
      for(let f=1;f<h/.35;f++)this.block(group,marking,[-6+i*1.7,f*.35,-5.59],[.87,.025,.01]);
    }
    // Reuse the static batching path for the city ground and distant skyline.
    this.islands.push(group);this.batchArchitecture();this.islands.pop();
    this.waterMaterial={uniforms:{uTime:{value:0}}};
  }
  render(time,immediate=false){
    this.progress=mix(this.progress,this.targetProgress,immediate||this.reduced?1:.07);const p=this.progress;
    this.smoothed.lerp(this.pointer,this.reduced?0:.035);
    const mobile=this.mobile;
    const paths=mobile?[
      {p:0,pos:[12,7,21],look:[0,3,0]}, {p:.23,pos:[-1,4,9],look:[-4.7,3.1,1]},
      {p:.46,pos:[8,4.8,10],look:[2.5,3.2,2]}, {p:.69,pos:[8,20,12],look:[0,1,0]}, {p:1,pos:[-10,8,20],look:[0,2,0]}
    ]:[
      {p:0,pos:[11,6.5,17],look:[0,2.8,0]}, {p:.23,pos:[-.5,3.5,8],look:[-4.7,2.8,1]},
      {p:.46,pos:[9,4,9],look:[1.7,2.5,1]}, {p:.69,pos:[2,21,10],look:[0,1,0]}, {p:1,pos:[-10,7,15],look:[0,2.5,0]}
    ];
    let k=0;while(k<paths.length-2&&p>paths[k+1].p)k++;const a=paths[k],b=paths[k+1],t=ease(clamp((p-a.p)/(b.p-a.p),0,1));
    this.camGoal.fromArray(a.pos).lerp(this.pathPosition.fromArray(b.pos),t);this.lookGoal.fromArray(a.look).lerp(this.pathLook.fromArray(b.look),t);
    if(!this.reduced){this.camGoal.x+=this.smoothed.x*1.05;this.camGoal.y-=this.smoothed.y*.45;}
    this.camera.clearViewOffset();
    this.camera.position.copy(this.camGoal);this.camera.lookAt(this.lookGoal);
    this.yaw=mix(this.yaw,this.targetYaw,this.reduced?1:.07);this.root.rotation.y=this.yaw;
    if(!this.reduced){this.camera.position.x+=Math.sin(time*.18)*.16;this.camera.position.y+=Math.sin(time*.23)*.08;}
    // Buildings remain grounded; only the camera and connection lines move.
    this.bridges.forEach(({bridge,rails},i)=>{const amount=clamp((p-.08-i*.17)*3,0,1);bridge.material.uniforms.uProgress.value=this.reduced?1:amount;bridge.material.uniforms.uTime.value=time;rails.forEach(r=>{r.visible=amount>.95||this.reduced;});});
    this.rings.forEach(r=>r.rotation.y=.3+(this.reduced?0:Math.sin(time*.25)*.16));
    this.pickables.forEach(m=>{m.material.emissive.setHex(0x2b87ac);m.material.emissiveIntensity=mix(m.material.emissiveIntensity||0,m===this.hovered ? .18 : 0,.12);});
    this.materials.light.emissiveIntensity=this.reduced?1.7:.5+p*2.1;
    this.waterMaterial.uniforms.uTime.value=this.reduced?0:time;
    if(this.composer)this.composer.render();else this.renderer.render(this.scene,this.camera);
  }
  tick(ms){this.raf=requestAnimationFrame(this.tick);if(this.hidden||this.paused)return;const interval=this.low?33:16;if(ms-this.lastFrame<interval)return;
    const inStory=scrollY<document.getElementById('story-end').offsetTop;const atClose=document.getElementById('join').getBoundingClientRect().top<innerHeight;
    if(!inStory&&!atClose)return;
    if(this.reduced&&Math.abs(this.progress-this.targetProgress)<.0001&&this.lastFrame>0)return;
    this.lastFrame=ms;this.render(this.clock.getElapsedTime());
  }
  setPaused(value){this.paused=value;}
  dispose(){cancelAnimationFrame(this.raf);removeEventListener('resize',this.resize);removeEventListener('scroll',this.updateScroll);removeEventListener('pointermove',this.onPointer);this.scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of [].concat(o.material))m.dispose();}});this.composer?.dispose();this.renderer.dispose();}
}
