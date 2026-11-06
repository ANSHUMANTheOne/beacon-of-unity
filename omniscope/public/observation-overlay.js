// Screen-space markers use recorded FITS coordinates. Wavelength is shown in
// the instrument panel, rather than as a misleading line through the scene.
export function installObservationOverlay({ui,c,focusSpacecraft,cancelCameraMotion,rotateMission,earthRadius}){
 const beam=document.createElementNS('http://www.w3.org/2000/svg','svg');
 beam.setAttribute('class','observation-beam');
 beam.setAttribute('aria-hidden','true');
 beam.innerHTML='<path class="recorded-trail recorded-trail-a"/><path class="recorded-trail recorded-trail-b"/><text class="recorded-trail-label" data-trail="a">A</text><text class="recorded-trail-label" data-trail="b">B</text>';
 ui.appendChild(beam);
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
 function hiddenBehindEarth(craft,earth){const to=craft.clone().sub(c.camera.position),e=earth.clone().sub(c.camera.position),t=Math.max(0,Math.min(1,e.dot(to)/to.lengthSq()));return t>0&&t<1&&e.addScaledVector(to,-t).length()<earthRadius*.99;}
 let lastInfo=0,lastCardOpen=false;
 function update({craft,earth,record,index,progress,wavelength,date,field,cardOpen,trails}){
  if(cardOpen&&!lastCardOpen){info.hidden=true;marker.setAttribute('aria-expanded','false');}lastCardOpen=cardOpen;
  const orbitContext=c.camera.position.distanceTo(earth)>=20;
  ui.classList.toggle('orbit-context',orbitContext);
  ui.classList.toggle('deep-orbit',c.camera.position.distanceTo(earth)>=80);
  beam.style.display=cardOpen||orbitContext?'none':'';
  const W=innerWidth,H=innerHeight,p=screen(craft),limit=cardOpen&&W>800?document.querySelector('.mission-comparison').getBoundingClientRect().left-18:W-18;
  trails?.forEach((points,i)=>{const path=beam.querySelector(i?'.recorded-trail-b':'.recorded-trail-a'),label=beam.querySelector(`[data-trail="${i?'b':'a'}"]`);if(!points||points.some(point=>hiddenBehindEarth(point,earth))){path.setAttribute('d','');label.style.display='none';return;}const s=screen(points[0]),e=screen(points[1]);path.setAttribute('d',`M ${s.x.toFixed(1)} ${s.y.toFixed(1)} L ${e.x.toFixed(1)} ${e.y.toFixed(1)}`);path.classList.toggle('is-current',i===index);label.setAttribute('x',String(e.x+5));label.setAttribute('y',String(e.y-5));label.style.display=e.x<limit&&e.y>70&&e.y<H-24?'block':'none';label.classList.toggle('is-current',i===index);});
  if(cardOpen){marker.hidden=true;beam.hidden=true;locate.hidden=true;info.hidden=true;return;}
  const visible=Boolean(record)&&p.z>-1&&p.z<1&&p.x>22&&p.x<limit-12&&p.y>70&&p.y<H-32&&!hiddenBehindEarth(craft,earth);
  marker.hidden=!visible;beam.hidden=!visible||orbitContext;locate.hidden=visible||!record||orbitContext;
  if(!visible){info.hidden=true;return;}
  marker.style.left=`${p.x}px`;marker.style.top=`${p.y}px`;marker.querySelector('small').textContent=Number.isFinite(wavelength)?`${wavelength.toFixed(3)} µm`:'infrared';
  const stage=document.querySelector('.mission-stage');
  if(performance.now()-lastInfo>100){lastInfo=performance.now();info.querySelector('#spacecraftInfoDate').textContent=`${index?'Later':'Earlier'} · ${date||'archived visit'} UTC`;const km=record.start.map((v,i)=>v+(record.end[i]-v)*progress);info.querySelector('#spacecraftInfoPosition').textContent=`X ${Math.round(km[0])} · Y ${Math.round(km[1])} · Z ${Math.round(km[2])} km from Earth center · ~${Math.round(Math.hypot(...km)-6371)} km altitude`;info.querySelector('#spacecraftInfoLight').textContent=Number.isFinite(wavelength)?`${wavelength.toFixed(4)} µm infrared toward RA ${field.ra.toFixed(3)}°, Dec ${field.dec.toFixed(3)}°`:'No clean wavelength sample at this scan point.';}
  if(!info.hidden){const width=270,left=Math.max(16,Math.min(p.x+30,limit-width-8)),stageTop=!cardOpen&&stage?stage.getBoundingClientRect().top:H,top=Math.max(84,Math.min(p.y+25,stageTop-info.offsetHeight-12,H-info.offsetHeight-24));info.style.left=`${left}px`;info.style.top=`${top}px`;}
 }
 return {update};
}
