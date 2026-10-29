// Screen-space observing guide. The FITS coordinates determine the marker;
// the light guide is a readable, explicitly schematic rendering of the selected band.
export function installObservationOverlay({ui,c,focusSpacecraft,cancelCameraMotion,rotateMission,earthRadius}){
 const beam=document.createElementNS('http://www.w3.org/2000/svg','svg');
 beam.setAttribute('class','observation-beam');
 beam.setAttribute('aria-hidden','true');
 beam.innerHTML=`<defs><linearGradient id="observationBeamGradient" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a9f5df" stop-opacity=".9"/><stop offset=".7" stop-color="#7bdcd7" stop-opacity=".55"/><stop offset="1" stop-color="#7bdcd7" stop-opacity="0"/></linearGradient></defs><path class="recorded-trail recorded-trail-a"/><path class="recorded-trail recorded-trail-b"/><text class="recorded-trail-label" data-trail="a">A</text><text class="recorded-trail-label" data-trail="b">B</text><g class="observation-light-guide"><path class="observation-beam-halo"/><path class="observation-beam-wave"/><path class="observation-beam-ticks"/><circle class="observation-beam-pulse" r="2.6"/></g>`;
 ui.appendChild(beam);
 const gradient=beam.querySelector('linearGradient'),halo=beam.querySelector('.observation-beam-halo'),wave=beam.querySelector('.observation-beam-wave'),ticks=beam.querySelector('.observation-beam-ticks'),pulse=beam.querySelector('.observation-beam-pulse');
 const marker=document.createElement('button');marker.className='spacecraft-beacon';marker.type='button';marker.setAttribute('aria-label','Inspect SPHEREx at this exposure');marker.innerHTML='<span class="spacecraft-beacon-ring"><span class="spacecraft-beacon-core"></span></span><span class="spacecraft-beacon-title">SPHEREx <small>inspect</small></span>';
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
  const W=innerWidth,H=innerHeight,p=screen(craft),origin=screen(earth),limit=cardOpen&&W>800?document.querySelector('.mission-comparison').getBoundingClientRect().left-18:W-18;
  trails?.forEach((points,i)=>{const path=beam.querySelector(i?'.recorded-trail-b':'.recorded-trail-a'),label=beam.querySelector(`[data-trail="${i?'b':'a'}"]`);if(!points||points.some(point=>hiddenBehindEarth(point,earth))){path.setAttribute('d','');label.style.display='none';return;}const s=screen(points[0]),e=screen(points[1]);path.setAttribute('d',`M ${s.x.toFixed(1)} ${s.y.toFixed(1)} L ${e.x.toFixed(1)} ${e.y.toFixed(1)}`);path.classList.toggle('is-current',i===index);label.setAttribute('x',String(e.x+5));label.setAttribute('y',String(e.y-5));label.style.display=e.x<limit&&e.y>70&&e.y<H-24?'block':'none';label.classList.toggle('is-current',i===index);});
  const visible=Boolean(record)&&p.z>-1&&p.z<1&&p.x>22&&p.x<limit-12&&p.y>70&&p.y<H-32&&!hiddenBehindEarth(craft,earth);
  marker.hidden=!visible;beam.hidden=!visible;locate.hidden=visible||!record;
  if(!visible){info.hidden=true;return;}
  marker.style.left=`${p.x}px`;marker.style.top=`${p.y}px`;
  const stage=document.querySelector('.mission-stage'),floor=!cardOpen&&W>800&&stage?stage.getBoundingClientRect().top-14:H-22;
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
  const bounds=[vx>0?(limit-p.x)/vx:Infinity,vx<0?(p.x-18)/-vx:Infinity,vy>0?(floor-p.y)/vy:Infinity,vy<0?(p.y-82)/-vy:Infinity];
  const reach=Math.min(165,...bounds.filter(n=>Number.isFinite(n)&&n>0));
  if(!Number.isFinite(reach)||reach-startOffset<35){beam.hidden=true;return;}
  const start={x:p.x+vx*startOffset,y:p.y+vy*startOffset},end={x:p.x+vx*reach,y:p.y+vy*reach},crossX=-vy,crossY=vx;
  gradient.setAttribute('x1',String(start.x));gradient.setAttribute('y1',String(start.y));gradient.setAttribute('x2',String(end.x));gradient.setAttribute('y2',String(end.y));
  const path=`M ${start.x.toFixed(1)} ${start.y.toFixed(1)} L ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  halo.setAttribute('d',path);wave.setAttribute('d',path);
  const spacing=Number.isFinite(wavelength)?14+Math.max(0,Math.min(1,(wavelength-.75)/4.26))*22:24;
  const marks=[];for(let d=startOffset+spacing;d<reach-12;d+=spacing){const x=p.x+vx*d,y=p.y+vy*d;marks.push(`M ${(x-crossX*3).toFixed(1)} ${(y-crossY*3).toFixed(1)} L ${(x+crossX*3).toFixed(1)} ${(y+crossY*3).toFixed(1)}`);}ticks.setAttribute('d',marks.join(' '));
  const u=reducedMotion?.18:(elapsed*.18)%1;pulse.setAttribute('cx',String(start.x+(end.x-start.x)*u));pulse.setAttribute('cy',String(start.y+(end.y-start.y)*u));
  beam.classList.toggle('is-replaying',Boolean(playing));
  if(performance.now()-lastInfo>100){lastInfo=performance.now();info.querySelector('#spacecraftInfoDate').textContent=`${index?'Later':'Earlier'} · ${date||'archived visit'} UTC`;const km=record.start.map((v,i)=>v+(record.end[i]-v)*progress);info.querySelector('#spacecraftInfoPosition').textContent=`X ${Math.round(km[0])} · Y ${Math.round(km[1])} · Z ${Math.round(km[2])} km from Earth center · ~${Math.round(Math.hypot(...km)-6371)} km altitude`;info.querySelector('#spacecraftInfoLight').textContent=Number.isFinite(wavelength)?`${wavelength.toFixed(4)} µm infrared toward RA ${field.ra.toFixed(3)}°, Dec ${field.dec.toFixed(3)}°`:'No clean wavelength sample at this scan point.';}
  if(!info.hidden){const width=270,left=Math.max(16,Math.min(p.x+30,limit-width-8)),stageTop=!cardOpen&&stage?stage.getBoundingClientRect().top:H,top=Math.max(84,Math.min(p.y+25,stageTop-info.offsetHeight-12,H-info.offsetHeight-24));info.style.left=`${left}px`;info.style.top=`${top}px`;}
 }
 return {update};
}
