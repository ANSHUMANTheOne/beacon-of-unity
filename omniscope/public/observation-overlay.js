// Screen-space observing guide. The FITS coordinates determine the marker;
// the light guide is a readable, explicitly schematic rendering of the selected band.
export function installObservationOverlay({ui,c,focusSpacecraft,cancelCameraMotion,rotateMission,earthRadius}){
 const beam=document.createElementNS('http://www.w3.org/2000/svg','svg');
 beam.setAttribute('class','observation-beam');
 beam.setAttribute('aria-hidden','true');
 beam.innerHTML=`<defs><linearGradient id="observationBeamGradient" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f4d5a9" stop-opacity=".8"/><stop offset=".28" stop-color="#e5b586" stop-opacity=".52"/><stop offset=".72" stop-color="#d9af87" stop-opacity=".23"/><stop offset="1" stop-color="#d9af87" stop-opacity="0"/></linearGradient></defs><path class="recorded-trail recorded-trail-a"/><path class="recorded-trail recorded-trail-b"/><text class="recorded-trail-label" data-trail="a">A</text><text class="recorded-trail-label" data-trail="b">B</text><g class="observation-light-guide"><path class="observation-beam-halo"/><path class="observation-beam-wave"/><g class="observation-beam-particles"></g></g>`;
 ui.appendChild(beam);
 const gradient=beam.querySelector('linearGradient'),halo=beam.querySelector('.observation-beam-halo'),wave=beam.querySelector('.observation-beam-wave');
 const particles=Array.from({length:11},()=>{const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('class','observation-beam-particle');beam.querySelector('.observation-beam-particles').appendChild(dot);return dot;});
 const marker=document.createElement('button');marker.className='spacecraft-beacon';marker.type='button';marker.setAttribute('aria-label','Inspect SPHEREx at this exposure');marker.innerHTML='<span class="spacecraft-beacon-ring"><span class="spacecraft-beacon-core"></span></span><span class="spacecraft-beacon-title">SPHEREx <small>infrared</small></span>';
 ui.appendChild(marker);
 const locate=document.createElement('button');locate.className='spacecraft-locate';locate.type='button';locate.textContent='⌖ Locate SPHEREx';locate.hidden=true;locate.onclick=focusSpacecraft;ui.appendChild(locate);
 const info=document.createElement('aside');info.className='spacecraft-info';info.hidden=true;info.setAttribute('aria-label','Recorded SPHEREx position');info.innerHTML='<div class="spacecraft-info-head"><span>SPHEREx / recorded exposure</span><button type="button" aria-label="Close spacecraft details">×</button></div><strong id="spacecraftInfoDate">—</strong><p id="spacecraftInfoPosition">Reading FITS position…</p><p id="spacecraftInfoLight">Reading wavelength…</p><div class="spacecraft-info-actions"><button type="button" id="spacecraftInfoFocus">Center spacecraft</button><button type="button" id="spacecraftInfoCompare">View images ↗</button></div><small>Earth-centered FITS coordinates. Spacecraft model and wavelength marks are enlarged diagrams.</small>';
 ui.appendChild(info);
 let markerDrag=null,suppressMarkerClick=false;
 marker.addEventListener('pointerdown',event=>{if(event.button!==0)return;cancelCameraMotion();markerDrag={x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,moved:false};try{marker.setPointerCapture(event.pointerId);}catch{};});
 marker.addEventListener('pointermove',event=>{if(!markerDrag)return;const dx=event.clientX-markerDrag.x,dy=event.clientY-markerDrag.y;if(Math.hypot(event.clientX-markerDrag.startX,event.clientY-markerDrag.startY)>4)markerDrag.moved=true;if(!markerDrag.moved)return;rotateMission(dx,dy);markerDrag.x=event.clientX;markerDrag.y=event.clientY;});
 const endMarkerDrag=()=>{if(markerDrag?.moved){suppressMarkerClick=true;setTimeout(()=>{suppressMarkerClick=false;},300);}markerDrag=null;};
 marker.addEventListener('pointerup',endMarkerDrag);marker.addEventListener('pointercancel',endMarkerDrag);
 marker.onclick=()=>{if(suppressMarkerClick){suppressMarkerClick=false;return;}info.hidden=!info.hidden;marker.setAttribute('aria-expanded',String(!info.hidden));};
 c.renderer.domElement.addEventListener('click',event=>{if(!document.body.classList.contains('unified-mission'))return;const r=marker.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;if(!marker.hidden&&Math.hypot(event.clientX-cx,event.clientY-cy)<34)marker.click();event.stopImmediatePropagation();},{capture:true});
 info.querySelector('.spacecraft-info-head button').onclick=()=>{info.hidden=true;marker.setAttribute('aria-expanded','false');marker.focus({preventScroll:true});};
 info.querySelector('#spacecraftInfoFocus').onclick=focusSpacecraft;
 info.querySelector('#spacecraftInfoCompare').onclick=()=>document.dispatchEvent(new CustomEvent('omni-observe-request',{detail:{comparison:true}}));
 const screen=(point)=>{const p=point.clone().project(c.camera);return {x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight,z:p.z};};
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function hiddenBehindEarth(craft,earth){const to=craft.clone().sub(c.camera.position),e=earth.clone().sub(c.camera.position),t=Math.max(0,Math.min(1,e.dot(to)/to.lengthSq()));return t>0&&t<1&&e.addScaledVector(to,-t).length()<earthRadius*.99;}
 let lastInfo=0,lastCardOpen=false;
 function update({craft,earth,direction,record,index,progress,wavelength,playing,date,field,elapsed,cardOpen,trails}){
  if(cardOpen&&!lastCardOpen){info.hidden=true;marker.setAttribute('aria-expanded','false');}lastCardOpen=cardOpen;
  const orbitContext=c.camera.position.distanceTo(earth)>=20;
  ui.classList.toggle('orbit-context',orbitContext);
  ui.classList.toggle('deep-orbit',c.camera.position.distanceTo(earth)>=80);
  beam.style.display=cardOpen||orbitContext?'none':'';
  const W=innerWidth,H=innerHeight,p=screen(craft),origin=screen(earth),limit=cardOpen&&W>800?document.querySelector('.mission-comparison').getBoundingClientRect().left-18:W-18;
  trails?.forEach((points,i)=>{const path=beam.querySelector(i?'.recorded-trail-b':'.recorded-trail-a'),label=beam.querySelector(`[data-trail="${i?'b':'a'}"]`);if(!points||points.some(point=>hiddenBehindEarth(point,earth))){path.setAttribute('d','');label.style.display='none';return;}const s=screen(points[0]),e=screen(points[1]);path.setAttribute('d',`M ${s.x.toFixed(1)} ${s.y.toFixed(1)} L ${e.x.toFixed(1)} ${e.y.toFixed(1)}`);path.classList.toggle('is-current',i===index);label.setAttribute('x',String(e.x+5));label.setAttribute('y',String(e.y-5));label.style.display=e.x<limit&&e.y>70&&e.y<H-24?'block':'none';label.classList.toggle('is-current',i===index);});
  if(cardOpen){marker.hidden=true;beam.hidden=true;locate.hidden=true;info.hidden=true;return;}
  const visible=Boolean(record)&&p.z>-1&&p.z<1&&p.x>22&&p.x<limit-12&&p.y>70&&p.y<H-32&&!hiddenBehindEarth(craft,earth);
  marker.hidden=!visible;beam.hidden=!visible||orbitContext;locate.hidden=visible||!record||orbitContext;
  if(!visible){info.hidden=true;return;}
  marker.style.left=`${p.x}px`;marker.style.top=`${p.y}px`;marker.querySelector('small').textContent=Number.isFinite(wavelength)?`${wavelength.toFixed(3)} µm`:'infrared';
  const stage=document.querySelector('.mission-stage'),stageRect=stage?.getBoundingClientRect(),floor=W<=800&&stageRect?stageRect.top-12:H-12;
  // Project a short local step: a far point can pass behind the camera and flip the guide.
  const near=screen(craft.clone().addScaledVector(direction,.25));
  let vx=near.x-p.x,vy=near.y-p.y,length=Math.hypot(vx,vy);
  const radialX=p.x-origin.x,radialY=p.y-origin.y,radialLength=Math.hypot(radialX,radialY);
  if(!Number.isFinite(length)||length<2||near.z>1||near.z< -1){vx=radialX;vy=radialY;length=radialLength||1;}
  vx/=length;vy/=length;
  // When the field direction projects across Earth, show a clear outward guide.
  // The marker still uses the FITS position; this graphic is a diagram.
  if(radialLength>1&&(vx*radialX+vy*radialY)/radialLength<.42){vx=radialX/radialLength;vy=radialY/radialLength;}
  const right=craft.clone().sub(earth).set(c.camera.matrixWorld.elements[0],c.camera.matrixWorld.elements[1],c.camera.matrixWorld.elements[2]).normalize();
  const edge=screen(earth.clone().addScaledVector(right,earthRadius));
  const ratio=Math.min(.95,earthRadius/c.camera.position.distanceTo(earth));
  const earthScreenRadius=Math.hypot(edge.x-origin.x,edge.y-origin.y)/Math.sqrt(1-ratio*ratio)+5;
  // Start at the apparent limb if the spacecraft projects onto the globe.
  const startOffset=Math.max(0,earthScreenRadius-radialLength+5);
  const left=W>800&&stageRect?stageRect.right+12:12;
  // Let the guide fade beyond an open viewport edge so it has no visible cap.
  // The instrument rail and mobile controls remain hard boundaries.
  const bounds=[vx>0?(W+32-p.x)/vx:Infinity,vx<0?(p.x-left)/-vx:Infinity,vy>0?(floor-p.y)/vy:Infinity,vy<0?(p.y+32)/-vy:Infinity];
  const reach=Math.min(...bounds.filter(n=>Number.isFinite(n)&&n>0));
  if(!Number.isFinite(reach)||reach-startOffset<35){beam.hidden=true;return;}
  const start={x:p.x+vx*startOffset,y:p.y+vy*startOffset},end={x:p.x+vx*reach,y:p.y+vy*reach};
  gradient.setAttribute('x1',String(start.x));gradient.setAttribute('y1',String(start.y));gradient.setAttribute('x2',String(end.x));gradient.setAttribute('y2',String(end.y));
  const guideLength=reach-startOffset,perpX=-vy,perpY=vx;
  const ripple=s=>reducedMotion?0:3.2*(1-Math.exp(-s/26))*(1-.45*s/guideLength)*Math.sin(s*Math.PI*2/116-elapsed*1.8);
  const point=s=>{const d=startOffset+s,offset=ripple(s);return {x:p.x+vx*d+perpX*offset,y:p.y+vy*d+perpY*offset};};
  const path=Array.from({length:Math.ceil(guideLength/7)+1},(_,i)=>{const q=point(Math.min(guideLength,i*7));return `${i?'L':'M'} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;}).join(' ');
  halo.setAttribute('d',path);wave.setAttribute('d',path);
  // A restrained traveling ripple and receding marks show observation direction.
  // Their spacing is illustrative; the measured wavelength is the numeric value.
  const speed=playing?95:61,flow=reducedMotion?0:(elapsed*speed)%guideLength;
  for(let i=0;i<particles.length;i++){
   const u=reducedMotion?(i+.5)/particles.length:((i*guideLength/particles.length+flow)%guideLength)/guideLength;
   const t=1-(1-u)*(1-u);
   const q=point(t*guideLength),dot=particles[i];
   dot.setAttribute('cx',q.x.toFixed(1));dot.setAttribute('cy',q.y.toFixed(1));
   dot.setAttribute('r',(1.7-1.2*t).toFixed(2));dot.setAttribute('opacity',(Math.min(1,u*7)*Math.pow(1-t,1.15)*.48).toFixed(2));
  }
  beam.classList.toggle('is-replaying',Boolean(playing));
  if(performance.now()-lastInfo>100){lastInfo=performance.now();info.querySelector('#spacecraftInfoDate').textContent=`${index?'Later':'Earlier'} · ${date||'archived visit'} UTC`;const km=record.start.map((v,i)=>v+(record.end[i]-v)*progress);info.querySelector('#spacecraftInfoPosition').textContent=`X ${Math.round(km[0])} · Y ${Math.round(km[1])} · Z ${Math.round(km[2])} km from Earth center · ~${Math.round(Math.hypot(...km)-6371)} km altitude`;info.querySelector('#spacecraftInfoLight').textContent=Number.isFinite(wavelength)?`${wavelength.toFixed(4)} µm infrared toward RA ${field.ra.toFixed(3)}°, Dec ${field.dec.toFixed(3)}°`:'No clean wavelength sample at this scan point.';}
  if(!info.hidden){const width=270,left=Math.max(16,Math.min(p.x+30,limit-width-8)),stageTop=!cardOpen&&stage?stage.getBoundingClientRect().top:H,top=Math.max(84,Math.min(p.y+25,stageTop-info.offsetHeight-12,H-info.offsetHeight-24));info.style.left=`${left}px`;info.style.top=`${top}px`;}
 }
 return {update};
}
