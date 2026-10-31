// Progressive disclosure for the observatory. Scientific controls keep their existing handlers.
import {installMissionStage} from './mission-stage.js';
import {outputToWorld} from './sky-engine.js';
export function installCalmUI({ui,c,grid,setPerspective,getComparison,markSample,focusMission,chooseDetector,selectVisit,scanSample,setStoryState,loadPairChoice}){
 const $=id=>document.getElementById(id),make=(tag,props={})=>Object.assign(document.createElement(tag),props);
 let openPanel=null,returnFocus=null;
 const search=ui.querySelector('.survey-panel'),observation=ui.querySelector('.sensor-panel');
 document.body.classList.add('calm-layout');
 const header=(title,subtitle)=>{const h=make('div',{className:'calm-panel-header'});h.innerHTML=`<div><h2>${title}</h2><p>${subtitle}</p></div><button class="calm-close" aria-label="Close panel">×</button>`;return h;};
 search.prepend(header('Find a sky region','Choose a place, then look for SPHEREx visits.'));
 observation.prepend(header('Your observation','Two visits to the same patch of sky.'));
 const options=make('aside',{className:'calm-options'});options.prepend(header('View settings','Adjust the scene and explore more tools.'));ui.appendChild(options);
 const panels={search,observation,options};
 for(const [name,panel] of Object.entries(panels)){panel.id=panel.id||`calm-${name}-panel`;panel.classList.add('calm-panel');panel.setAttribute('aria-label',panel.querySelector('.calm-panel-header h2').textContent);panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-hidden','true');panel.inert=true;panel.querySelector('.calm-close').onclick=()=>close();}
 const backdrop=make('button',{className:'calm-backdrop',tabIndex:-1});backdrop.setAttribute('aria-label','Close tool panel');backdrop.hidden=true;backdrop.onclick=()=>close();ui.appendChild(backdrop);
 const intro=make('div',{className:'calm-intro'});intro.innerHTML='<span class="calm-eyebrow">OMNISCOPE EXPLORER</span><h2 id="calmTitle">Explore our solar system.</h2><p id="calmHint">Drag to orbit. Scroll to zoom. Select a planet.</p>';ui.appendChild(intro);
 const actions=make('div',{className:'calm-primary-actions'});actions.innerHTML='<button data-panel="search" class="calm-button emphasis" aria-expanded="false">⌕ <span>Find sky images</span></button><button data-panel="observation" class="calm-button" aria-expanded="false">◧ <span>Observation</span></button>';ui.appendChild(actions);
 const utility=make('div',{className:'calm-utility'});utility.innerHTML='<button id="calmHome" aria-label="Reset view" title="Reset view">⌂</button><button data-panel="options" aria-expanded="false" title="View settings">⚙ <span>Settings</span></button><button id="calmHelp" aria-label="How to explore" title="How to explore">?</button>';ui.appendChild(utility);
 const provenance=make('button',{className:'calm-provenance',textContent:'NASA JPL positions · NASA/IPAC imagery'});provenance.onclick=()=>$('surveyMethods').click();ui.appendChild(provenance);
 $('calmHome').onclick=()=>$('resetCamera').click();
 function close(restore=true){if(!openPanel)return;const old=panels[openPanel];old.classList.remove('is-open');old.setAttribute('aria-hidden','true');old.inert=true;openPanel=null;backdrop.hidden=true;document.body.classList.remove('calm-panel-open','panel-open','sensor-open','tools-open');ui.querySelectorAll('[data-panel]').forEach(b=>b.setAttribute('aria-expanded','false'));if(restore&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
 function open(name,focus=null){if(openPanel===name&&!focus){close();return;}const active=document.activeElement;close(false);c.selectBody(null,false);returnFocus=active;openPanel=name;const panel=panels[name];panel.inert=false;panel.setAttribute('aria-hidden','false');panel.classList.add('is-open');backdrop.hidden=false;document.body.classList.add('calm-panel-open');ui.querySelectorAll('[data-panel]').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.panel===name)));requestAnimationFrame(()=>(focus||panel.querySelector('.calm-close')).focus({preventScroll:true}));}
 ui.querySelectorAll('[data-panel]').forEach(b=>{b.setAttribute('aria-controls',panels[b.dataset.panel].id);b.onclick=()=>open(b.dataset.panel)});
 // Move infrequently needed controls into settings, rather than showing another permanent sidebar.
 const backgroundBlock=search.querySelector('.block');backgroundBlock.querySelector('.overline').textContent='SKY BACKGROUND';backgroundBlock.querySelector('h2').remove();backgroundBlock.querySelector('.sub').textContent='A real infrared reference map behind the solar system.';options.appendChild(backgroundBlock);
 const settings=make('div',{className:'calm-settings-block'});settings.innerHTML='<label class="calm-check"><input id="calmGrid" type="checkbox"> Show coordinate grid</label><p class="calm-small">The grid helps you read sky directions.</p>';options.appendChild(settings);grid.visible=false;$('calmGrid').onchange=()=>grid.visible=$('calmGrid').checked;
 const advanced=make('details',{className:'calm-details'});advanced.innerHTML='<summary>Advanced wavelength controls</summary><p class="calm-small">Filter the image by measured wavelength or pixel quality.</p>';advanced.append(ui.querySelector('.window-control'),ui.querySelector('.dock-bottom'));options.appendChild(advanced);
 const epoch=search.querySelector('.block:last-child');epoch.classList.add('calm-epoch-block');options.appendChild(epoch);epoch.prepend($('systemEpoch'));
 const layers=make('details',{className:'calm-details'});layers.innerHTML='<summary>Objects and launch calendar</summary>';layers.appendChild(c.overlay.querySelector('.control-panel'));options.appendChild(layers);
 const motion=make('details',{className:'calm-details'});motion.innerHTML='<summary>Animation and flight</summary><p class="calm-small">Animate the reference orbits, use the command console, or pilot the rocket.</p>';motion.append(c.overlay.querySelector('.timeline'),c.overlay.querySelector('.left-actions'));options.appendChild(motion);
 $('toggleTools').onclick=()=>open('options');$('toggleSurvey').onclick=()=>open('search');$('toggleSensor').onclick=()=>open('observation');
 $('showFootprints').checked=false;$('showFootprints').dispatchEvent(new Event('change'));$('showFootprints').addEventListener('change',()=>document.body.classList.toggle('calm-outlines',$('showFootprints').checked));
 // Planet positions stay prominent; other objects are available in Objects and launch calendar.
 for(const category of ['near-earth-asteroid','near-earth-comet','potentially-hazardous-asteroid','asteroid-belt','mission'])c.state.visibility[category]=false;
 c.applyVisibility();c.overlay.querySelectorAll('[data-cat]').forEach(b=>{const on=c.state.visibility[b.dataset.cat];b.classList.toggle('off',!on);b.querySelector('.dot')?.classList.toggle('on',on)});
 // Clarify the entry points without changing the data modes.
 ui.querySelector('[data-view="sky"]').textContent='Sky map';ui.querySelector('[data-view="field"]').textContent='SPHEREx';
 const nav=ui.querySelector('.survey-nav');nav.append(ui.querySelector('[data-view="field"]'),ui.querySelector('[data-view="sky"]'),ui.querySelector('[data-view="system"]'));
 search.querySelector('.overline').textContent='SPHEREX IMAGES';
 $('skyTarget').previousElementSibling.textContent='Choose a region';$('archiveSearch').textContent='Find observations';$('aimField').textContent='Look in this direction';
 const coordinates=make('details',{className:'calm-coordinate-details'});coordinates.innerHTML='<summary>Enter sky coordinates</summary>';const coordRow=$('fieldRa').closest('.row');coordRow.before(coordinates);coordinates.appendChild(coordRow);$('skyTarget').addEventListener('change',()=>{coordinates.open=$('skyTarget').value==='custom'});
 const detectorButtons=ui.querySelector('.detector-buttons'),detectorMeta=detectorButtons.nextElementSibling;const detectorDetails=make('details',{className:'calm-detector-details'});detectorDetails.innerHTML='<summary>Choose a detector band</summary><p class="calm-small">Six detector ranges sample different infrared wavelengths.</p>';detectorButtons.before(detectorDetails);detectorDetails.append(detectorButtons,detectorMeta);
 const measurements=make('details',{className:'calm-details calm-measurements'});measurements.innerHTML='<summary>Measurement details</summary>';const extra=make('div',{className:'sensor-data'}),data=observation.querySelector('.sensor-data');extra.append(...[...data.children].slice(2));measurements.append(extra,observation.querySelector('.spectral-chart').previousElementSibling,observation.querySelector('.spectral-chart'),$('pixelReadout'),$('comparisonNotice'));$('observeLoaded').before(measurements);
 const notebook=make('details',{className:'calm-details calm-notebook'});notebook.innerHTML='<summary>Notes and downloads</summary>';const sourceRow=$('sourceA').closest('.row');notebook.append(sourceRow,$('markSky'),$('candidateEditor'),$('exportSpatial'),$('candidateStatus'));observation.appendChild(notebook);
 $('observeLoaded').textContent='Compare these images';$('markSky').textContent='Mark something interesting';
 const compareBar=make('div',{className:'calm-compare-bar'});compareBar.innerHTML='<span class="calm-compare-title">Compare visits</span><div class="calm-compare-buttons"></div><span id="calmVisitDate"></span>';ui.appendChild(compareBar);
 const labels={A:'Earlier',B:'Later',blink:'Blink',difference:'Difference'};
 for(const [mode,label] of Object.entries(labels)){const b=make('button',{textContent:label});b.dataset.compare=mode;b.onclick=()=>ui.querySelector(`[data-visit="${mode}"]`).click();compareBar.querySelector('.calm-compare-buttons').appendChild(b);}
 function syncComparison(){for(const b of compareBar.querySelectorAll('button')){const selected=ui.querySelector(`[data-visit="${b.dataset.compare}"]`).classList.contains('active');b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));}$('calmVisitDate').textContent=$('sensorDate').textContent+' UTC · '+$('sensorBaseline').textContent+' apart';}
 new MutationObserver(syncComparison).observe(ui.querySelector('.pair-buttons'),{subtree:true,attributes:true,attributeFilter:['class']});new MutationObserver(syncComparison).observe($('sensorDate'),{childList:true,subtree:true});syncComparison();
 ui.querySelector('.wavelength-dock .overline').textContent='Wavelength';$('waveDescription').textContent='Infrared light / microns';
 const spectralSettings=make('button',{className:'calm-wave-settings',textContent:'Adjust',title:'Wavelength settings'});spectralSettings.onclick=()=>{open('options');advanced.open=true;advanced.scrollIntoView({block:'nearest'})};ui.querySelector('.wavelength-dock').appendChild(spectralSettings);
 const guide=make('dialog',{className:'calm-guide'});guide.innerHTML='<button class="calm-close" aria-label="Close guide">×</button><span class="calm-eyebrow">A QUICK START</span><h2>Three ways to explore.</h2><ol><li><b>Solar system</b><span>Select a planet, drag to orbit, and scroll to zoom.</span></li><li><b>Infrared sky</b><span>Look around the real sky map. Use Find sky images to choose a region.</span></li><li><b>Compare images</b><span>Switch between two SPHEREx visits. Try Blink to see what changes.</span></li></ol><p>The wavelength strip selects infrared light. Open Settings for filtering and extra layers.</p><button id="calmStart" class="calm-button emphasis">Try the loaded observations →</button>';document.body.appendChild(guide);guide.querySelector('.calm-close').onclick=()=>guide.close();$('calmHelp').onclick=()=>guide.showModal();$('calmStart').onclick=()=>{guide.close();close(false);setPerspective('field')};
 function syncView(){const field=document.body.classList.contains('field-mode'),sky=document.body.classList.contains('sky-mode');intro.querySelector('.calm-eyebrow').textContent=field?'PLANET X / SPHEREX':'OMNISCOPE EXPLORER';$('calmTitle').textContent=field?'Find what moves.':sky?'Explore the infrared sky.':'Explore our solar system.';$('calmHint').textContent=field?'Compare real NASA observations. Look for changes between visits.':sky?'Look around, then choose a region to search.':'Drag to orbit. Scroll to zoom. Select a planet.';}
 let lastView='system';new MutationObserver(()=>{const view=document.body.classList.contains('field-mode')?'field':document.body.classList.contains('sky-mode')?'sky':'system';if(view!==lastView){lastView=view;close(false);syncView();}}).observe(document.body,{attributes:true,attributeFilter:['class']});syncView();
 guide.querySelector('h2').textContent='Start with SPHEREx.';
 guide.querySelector('ol').innerHTML='<li><b>Compare two visits</b><span>Use Earlier and Later, or Blink, to see how the same field changes.</span></li><li><b>Explore a new region</b><span>Find sky images searches the real NASA/IPAC archive. The sky map and solar system provide context.</span></li><li><b>Record a possible moving source</b><span>Open Observation, then Notes and downloads, to mark a candidate. Confirm it against wavelength, image quality, and independent data.</span></li>';
 guide.querySelector('p').textContent='Built around the Planet X and SPHEREx challenge. A visual change is a candidate for investigation, not a confirmed planet.';
 c.overlay.querySelector('.top-left p').textContent='SPHEREx / moving sky explorer';
 const loadSelected=$('loadSurveyPair').onclick;$('loadSurveyPair').onclick=async e=>{await loadSelected(e);if(!$('surveyStatus').classList.contains('error')){close(false);setPerspective('field')}};
 $('markSky').addEventListener('click',()=>close(false));new MutationObserver(()=>{if(!$('candidateEditor').hidden){notebook.open=true;open('observation',$('candidateText'));}}).observe($('candidateEditor'),{attributes:true,attributeFilter:['hidden']});
 const inspect=$('inspector');new MutationObserver(()=>{if(inspect.classList.contains('open')&&openPanel)close(false)}).observe(inspect,{attributes:true,attributeFilter:['class']});
 window.addEventListener('keydown',e=>{if(!openPanel)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return;}if(e.key==='Tab'){const focusable=[...panels[openPanel].querySelectorAll('button,a[href],input,select,textarea,summary')].filter(e=>!e.disabled&&e.getClientRects().length);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}},{capture:true});
 // One continuous mission workspace: spacecraft context and observations share the same screen.
 document.body.classList.add('unified-mission');
 c.state.visibility.moon=false;c.applyVisibility();c.overlay.querySelector('[data-cat="moon"]')?.classList.add('off');c.overlay.querySelector('[data-cat="moon"] .dot')?.classList.remove('on');
 nav.hidden=true;compareBar.hidden=true;
 const badge=make('button',{className:'mission-source-badge',textContent:'NASA / IPAC data'});badge.onclick=()=>$('surveyMethods').click();ui.appendChild(badge);
 intro.querySelector('.calm-eyebrow').textContent='PLANET X / SPHEREX';$('calmTitle').textContent='Follow the mission. Find the change.';$('calmHint').textContent='SPHEREx surveys the sky. Compare its visits to look for possible moving sources.';
 $('calmHome').onclick=focusMission;$('resetCamera').onclick=focusMission;
 $('aimField').hidden=true;
 const card=make('section',{className:'mission-comparison',ariaLabel:'SPHEREx image comparison'});
 card.innerHTML=`<div class="mission-comparison-head"><div class="analysis-title"><span class="calm-eyebrow">OMNISCOPE / OBSERVATION ANALYSIS</span><h3>Observation analysis</h3><p id="missionFieldContext">Loading sky field…</p></div><button id="missionEnlarge" type="button" aria-label="Return to the observing scene">← Scene</button></div>
 <div class="mission-workspace-toolbar"><div class="mission-modes" role="group" aria-label="Image comparison mode"><button data-mission-mode="side" class="active" aria-pressed="true">Side by side</button><button data-mission-mode="swipe">Swipe</button><button data-mission-mode="blink">Blink</button><button data-mission-mode="difference">Difference</button></div><div class="mission-zoom" role="group" aria-label="Shared image zoom"><button id="missionZoomOut" type="button" aria-label="Zoom out">−</button><span id="missionZoomValue">100%</span><button id="missionZoomIn" type="button" aria-label="Zoom in">+</button><button id="missionZoomReset" type="button">Reset</button><button id="missionCoordinates" type="button" aria-pressed="false">Crosshair</button></div></div>
 <div class="mission-visit-dates"><span id="missionDateA">A / Earlier visit</span><span id="missionDateB">B / Later visit</span></div>
 <div class="mission-image-area"><span id="missionMobileDateB" class="mission-mobile-date-b"></span><canvas id="missionCanvas" width="900" height="430" aria-label="Registered SPHEREx observations. Images share zoom and pan; drag to pan and scroll to zoom."></canvas><div class="mission-crosshair" hidden></div></div>
 <div class="mission-registration"><span id="missionCanvasHint">Opening real observations…</span><span id="missionCursor">Scroll to zoom · drag to pan</span></div>
 <label class="mission-wipe" hidden>Earlier<input id="missionWipe" type="range" min="0" max="100" value="50" aria-label="Swipe between visits">Later</label>
 <div class="mission-comparison-foot"><span id="missionBaseline">Two visits to the same sky field</span><button id="missionDetails" type="button">More measurements</button></div>
 <p class="mission-caution">A change is a clue. Check wavelength and image quality before calling it motion.</p>`;
 ui.appendChild(card);
 // The main decision is which real infrared band to inspect; keep one clear selector next to the images.
 intro.querySelector('.calm-eyebrow').textContent='PLANET X / SPHEREX';
 $('calmTitle').textContent='SPHEREx survey';
 $('calmHint').textContent='';
 actions.querySelector('[data-panel="search"] span').textContent='Choose sky field';
 actions.querySelector('[data-panel="observation"]').hidden=true;
 card.querySelector('.mission-comparison-head .calm-eyebrow').textContent='SPHEREX / OBSERVATION PAIR';
 card.querySelector('.mission-comparison-head h3').textContent='Observation analysis';

 card.querySelector('[data-mission-mode="side"]').textContent='Side by side';

 card.querySelector('[data-mission-mode="difference"]').textContent='Difference';
 const bandPanel=make('div',{className:'mission-band-panel'});
 bandPanel.innerHTML='<div class="mission-band-top"><div><span class="calm-eyebrow">INFRARED WAVELENGTH</span><h4>Which light are we seeing?</h4></div><select id="missionBand" aria-label="Choose SPHEREx wavelength band"><option value="1">Band 1 · 0.75–1.12 µm</option><option value="2" selected>Band 2 · 1.10–1.65 µm</option><option value="3">Band 3 · 1.63–2.43 µm</option><option value="4">Band 4 · 2.40–3.85 µm</option><option value="5">Band 5 · 3.81–4.43 µm</option><option value="6">Band 6 · 4.41–5.01 µm</option></select></div><p id="missionBandValues" class="mission-band-values">Reading the measured wavelengths…</p><p class="mission-band-explain">A micrometer (µm) is one millionth of a meter. Each band captures a different part of infrared light; these values come from the images, not an applied color filter.</p>';
 card.querySelector('.mission-modes').before(bandPanel);
 const changePanel=make('section',{className:'mission-change-panel',ariaLabel:'Possible image changes'});
 changePanel.innerHTML='<div class="mission-change-head"><span>Change scan</span><button id="missionScan" type="button">↻ Rescan</button><strong id="missionChangeCount">Waiting for two visits</strong></div><div class="mission-change-picks" id="missionChangePicks"></div><p id="missionChangeDetail">Compare aligned pixels for compact changes.</p><small>Candidates are unconfirmed until reviewed.</small>';
 card.querySelector('.mission-registration').after(changePanel);
 $('missionBand').onchange=()=>{$('missionBandValues').textContent=`Opening Band ${$('missionBand').value} observations…`;chooseDetector(Number($('missionBand').value));};
 const context=make('div',{className:'mission-context'});
 context.innerHTML='<span class="mission-context-dot"></span><div><b>SPHEREx at the recorded exposure</b><span>Position comes from FITS coordinates. The spacecraft drawing is enlarged so it stays visible.</span></div>';
 ui.appendChild(context);
 const cleanDetails=make('details',{className:'mission-science-note'});
 cleanDetails.innerHTML='<summary>How to read a possible change</summary><p>Stars usually stay in place between visits. A nearby moving object may shift, but different wavelengths, image noise, or the instrument can also create an apparent change. Compare the same position in both images and check quality before recording a candidate.</p>';
 card.appendChild(cleanDetails);
 const link=document.createElementNS('http://www.w3.org/2000/svg','svg');link.setAttribute('class','mission-data-link');link.setAttribute('aria-hidden','true');link.innerHTML='<path fill="none" stroke="#88c9bd" stroke-opacity=".3" stroke-width="1" stroke-dasharray="3 7"/>';ui.appendChild(link);
 let displayMode='side',lastImages=[],lastVisit=-1,lastPin='',lastChangeSource=null,lastPanelSource=null,lastPanelSelection=-1,selectedChange=0,dirty=true,rects=[],blinkVisit=0,blinkTimer=null,scanActive=false,scanTimer=null;
 const cc=$('missionCanvas'),ctx=cc.getContext('2d');
 function stopBlink(){if(blinkTimer)clearInterval(blinkTimer);blinkTimer=null;}
 function startBlink(){stopBlink();blinkVisit=0;selectVisit('A');blinkTimer=setInterval(()=>{if(document.hidden||card.classList.contains('is-collapsed'))return;blinkVisit=1-blinkVisit;selectVisit(blinkVisit?'B':'A');dirty=true;drawComparison();},650);}
 function beginScan(){clearTimeout(scanTimer);scanActive=true;card.classList.add('is-scanning');lastPanelSource=null;dirty=true;scanTimer=setTimeout(()=>{scanActive=false;card.classList.remove('is-scanning');lastPanelSource=null;dirty=true;drawComparison();},1300);}
 $('missionScan').onclick=()=>{if(getComparison().images.length===2)beginScan();drawComparison();};
 document.addEventListener('omni-scan-pair',()=>{if(getComparison().images.length===2){beginScan();drawComparison();}});
 function updateChangePanel(changes){
  if(changes===lastPanelSource&&selectedChange===lastPanelSelection)return;
  lastPanelSource=changes;lastPanelSelection=selectedChange;
  const picks=$('missionChangePicks'),count=$('missionChangeCount'),detail=$('missionChangeDetail'),note=changePanel.querySelector('small');
  picks.replaceChildren();
  if(scanActive){changePanel.dataset.state='pending';count.textContent='Analyzing…';detail.textContent='Checking registered pixels at similar measured wavelengths.';note.textContent='Quick-look analysis in progress.';return;}
  const checked=changes?.checked||0,list=changes?.candidates||[];
  if(!changes||checked===0){changePanel.dataset.state='unavailable';count.textContent='Analysis unavailable';detail.textContent=changes?.reason||'A valid image pair is needed.';note.textContent='No wavelength-matched clean pixels were checked.';return;}
  if(checked<300){changePanel.dataset.state='inconclusive';count.textContent='Inconclusive';detail.textContent=changes.reason||'Too few clean pixels overlap at similar wavelengths.';note.textContent=`Only ${checked} valid pixel pairs checked; try another band or visit pair.`;return;}
  changePanel.dataset.state=list.length?'candidates':'complete';
  count.textContent=list.length?`${list.length} possible ${list.length===1?'change':'changes'}`:'No compact change detected';
  for(const [index,candidate] of list.entries()){const button=document.createElement('button');button.type='button';button.textContent=String(index+1);button.title=`Candidate ${index+1}: RA ${candidate.sky[0].toFixed(4)}°, Dec ${candidate.sky[1].toFixed(4)}°`;button.classList.toggle('active',index===selectedChange);button.onclick=()=>{selectedChange=index;dirty=true;drawComparison();};picks.appendChild(button);}
  const chosen=list[selectedChange];
  detail.textContent=chosen?`#${selectedChange+1} · ${chosen.direction} · RA ${chosen.sky[0].toFixed(4)}°, Dec ${chosen.sky[1].toFixed(4)}° · ${chosen.wavelengthA.toFixed(3)} / ${chosen.wavelengthB.toFixed(3)} µm`:changes.reason||'No compact residual passed the quick-look threshold.';
  note.textContent=`${checked} clean, wavelength-matched pixel pairs checked. Results are unconfirmed.`;
 }
 let imageZoom=1,imagePanX=0,imagePanY=0,panStart=null,suppressImageClick=false;
 const clampImagePan=()=>{const max=(imageZoom-1)/2;imagePanX=Math.max(-max,Math.min(max,imagePanX));imagePanY=Math.max(-max,Math.min(max,imagePanY));};
 const imagePoint=(r,x,y)=>({x:r.x+(.5+imagePanX+(x/279-.5)*imageZoom)*r.w,y:r.y+(.5+imagePanY+(y/279-.5)*imageZoom)*r.h});
 const imageCoordinate=(r,x,y)=>({x:((x-r.x)/r.w-.5-imagePanX)/imageZoom+.5,y:((y-r.y)/r.h-.5-imagePanY)/imageZoom+.5});
 function paintViewport(image,r){ctx.save();ctx.beginPath();ctx.rect(r.x,r.y,r.w,r.h);ctx.clip();ctx.drawImage(image,r.x+(imagePanX+.5-imageZoom/2)*r.w,r.y+(imagePanY+.5-imageZoom/2)*r.h,r.w*imageZoom,r.h*imageZoom);ctx.restore();}
 function drawComparison(){
  const data=getComparison();card.classList.toggle('is-loading',data.busy);if(data.busy)return;
  if(data.images.length!==2){updateChangePanel(null);return;}
  if(lastChangeSource!==data.changes){lastChangeSource=data.changes;selectedChange=0;beginScan();}
  if(!dirty&&lastImages[0]===data.images[0]&&lastImages[1]===data.images[1]&&lastVisit===data.visit&&lastPin===JSON.stringify(data.pin))return;
  dirty=false;lastImages=data.images;lastVisit=data.visit;lastPin=JSON.stringify(data.pin);updateChangePanel(data.changes);
  const stacked=innerWidth<=800&&displayMode==='side',canvasWidth=stacked?430:900,canvasHeight=stacked?880:410;
  if(cc.width!==canvasWidth||cc.height!==canvasHeight){cc.width=canvasWidth;cc.height=canvasHeight;}
  const w=cc.width,h=cc.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#071017';ctx.fillRect(0,0,w,h);rects=[];
  const box=(x,width)=>{const side=Math.min(width-14,h-12);return {x:x+(width-side)/2,y:(h-side)/2,w:side,h:side}};
  const stackedBox=(y,height)=>{const side=Math.min(w-14,height-14);return {x:(w-side)/2,y:y+(height-side)/2,w:side,h:side}};
  if(displayMode==='side'){for(let i=0;i<2;i++){const r=stacked?stackedBox(i*h/2,h/2):box(i*w/2,w/2);rects.push(r);paintViewport(data.images[i],r);}}
  else {const r=box(0,w);rects.push(r);paintViewport(displayMode==='difference'?data.preview:displayMode==='blink'?data.images[blinkVisit]:data.images[0],r);
   if(displayMode==='swipe'){const x=r.x+r.w*Number($('missionWipe').value)/100;ctx.save();ctx.beginPath();ctx.rect(x,r.y,r.x+r.w-x,r.h);ctx.clip();paintViewport(data.images[1],r);ctx.restore();ctx.strokeStyle='#d89a71';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,r.y);ctx.lineTo(x,r.y+r.h);ctx.stroke();}}
  if(!scanActive)for(const [index,candidate] of (data.changes?.candidates||[]).entries())for(const r of rects){const point=imagePoint(r,candidate.x,candidate.y);if(point.x<r.x||point.x>r.x+r.w||point.y<r.y||point.y>r.y+r.h)continue;ctx.beginPath();ctx.arc(point.x,point.y,index===selectedChange?12:9,0,Math.PI*2);ctx.strokeStyle=index===selectedChange?'#efbf81':'#b1d0cc';ctx.lineWidth=index===selectedChange?2.5:1.5;ctx.stroke();ctx.fillStyle='#101e24';ctx.fillRect(point.x+10,point.y-19,17,16);ctx.fillStyle='#f2eee2';ctx.font='bold 12px monospace';ctx.fillText(String(index+1),point.x+14,point.y-7);}
  if(data.pin)for(const r of rects){const point=imagePoint(r,data.pin.x,data.pin.y);if(point.x<r.x||point.x>r.x+r.w||point.y<r.y||point.y>r.y+r.h)continue;ctx.strokeStyle='#e4af80';ctx.lineWidth=2;ctx.beginPath();ctx.arc(point.x,point.y,12,0,Math.PI*2);ctx.stroke();}
  $('missionDateA').textContent='A / '+data.dates[0];$('missionDateB').textContent='B / '+data.dates[1];$('missionMobileDateB').textContent='B / '+data.dates[1];
  if($('analysisAcquiredA')){$('analysisAcquiredA').textContent=`A · ${data.observationTimes[0]||data.dates[0]} UTC`;$('analysisAcquiredB').textContent=`B · ${data.observationTimes[1]||data.dates[1]} UTC`;$('analysisSourceA').href=$('sourceA').href;$('analysisSourceB').href=$('sourceB').href;}
  $('missionBaseline').textContent=`Detector ${data.detector} · ${data.baseline} between visits`;
  $('missionCanvasHint').textContent=data.marking?'Click a source to mark it.':displayMode==='blink'?`Blinking ${blinkVisit?'later':'earlier'} visit`:displayMode==='difference'?'Uncalibrated pixel difference · exploratory':'Images registered to the same sky grid';
  const wavelength=Number.isFinite(data.wavelengths[0])?`${data.wavelengths[0].toFixed(3)} µm`:`Detector ${data.detector}`;
  $('missionFieldContext').textContent=`RA ${data.field.ra.toFixed(3)}° · Dec ${data.field.dec.toFixed(3)}° · ${wavelength}`;
  $('missionZoomValue').textContent=`${Math.round(imageZoom*100)}%`;card.dataset.imageZoom=String(imageZoom);card.dataset.stacked=String(stacked);
  if(data.wavelengths.every(Number.isFinite)){const delta=Math.abs(data.wavelengths[0]-data.wavelengths[1]);$('missionBandValues').textContent=`Earlier ${data.wavelengths[0].toFixed(4)} µm / later ${data.wavelengths[1].toFixed(4)} µm / difference ${delta.toFixed(4)} µm`;}else $('missionBandValues').textContent='No shared clean pixel in this band. Try another visit pair.';
  $('missionBand').value=String(data.detector);
 }
 for(const b of card.querySelectorAll('[data-mission-mode]'))b.onclick=()=>{document.dispatchEvent(new Event('omni-stop-replay'));stopBlink();displayMode=b.dataset.missionMode;card.querySelectorAll('[data-mission-mode]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});if(displayMode==='blink')startBlink();else selectVisit(displayMode==='difference'?'difference':'A');card.querySelector('.mission-wipe').hidden=displayMode!=='swipe';dirty=true;drawComparison();};
 $('missionWipe').oninput=()=>{dirty=true;drawComparison()};$('missionEnlarge').onclick=()=>{card.classList.toggle('is-large');dirty=true;drawComparison()};$('missionDetails').textContent='Measurements & notes';$('missionDetails').onclick=()=>{measurements.open=true;notebook.open=true;open('observation')};
 function canvasPosition(event){const bounds=cc.getBoundingClientRect();return {x:(event.clientX-bounds.left)/bounds.width*cc.width,y:(event.clientY-bounds.top)/bounds.height*cc.height,bounds};}
 function viewportAt(x,y){return rects.find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);}
 function zoomAt(factor,event){const center=event?canvasPosition(event):{x:cc.width/2,y:cc.height/2};const r=viewportAt(center.x,center.y)||rects[0];if(!r)return;const at=imageCoordinate(r,center.x,center.y),next=Math.max(1,Math.min(5,imageZoom*factor));imageZoom=next;imagePanX=(center.x-r.x)/r.w-.5-(at.x-.5)*next;imagePanY=(center.y-r.y)/r.h-.5-(at.y-.5)*next;clampImagePan();dirty=true;drawComparison();}
 $('missionZoomIn').onclick=()=>zoomAt(1.4);$('missionZoomOut').onclick=()=>zoomAt(1/1.4);
 $('missionZoomReset').onclick=()=>{imageZoom=1;imagePanX=imagePanY=0;dirty=true;drawComparison();};
 cc.addEventListener('wheel',event=>{event.preventDefault();zoomAt(event.deltaY<0?1.22:1/1.22,event);},{passive:false});
 const crosshair=card.querySelector('.mission-crosshair');let showCoordinates=false;
 $('missionCoordinates').onclick=()=>{showCoordinates=!showCoordinates;$('missionCoordinates').setAttribute('aria-pressed',String(showCoordinates));crosshair.hidden=!showCoordinates;$('missionCursor').textContent=showCoordinates?'Move over an image to read sky coordinates':'Scroll to zoom · drag to pan';};
 cc.addEventListener('pointerdown',event=>{if(event.button!==0||getComparison().marking)return;const p=canvasPosition(event);if(!viewportAt(p.x,p.y))return;panStart={x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,moved:false};cc.setPointerCapture(event.pointerId);});
 cc.addEventListener('pointermove',event=>{const p=canvasPosition(event),r=viewportAt(p.x,p.y);if(showCoordinates&&r){const u=imageCoordinate(r,p.x,p.y);if(u.x>=0&&u.x<=1&&u.y>=0&&u.y<=1){const data=getComparison(),sky=outputToWorld(u.x*279,u.y*279,280,data.field.ra,data.field.dec,.22);$('missionCursor').textContent=`RA ${sky[0].toFixed(4)}° · Dec ${sky[1].toFixed(4)}° · pixel ${Math.round(u.x*279)}, ${Math.round(u.y*279)}`;crosshair.hidden=false;crosshair.style.left=`${event.clientX-p.bounds.left}px`;crosshair.style.top=`${event.clientY-p.bounds.top}px`;}}
  if(!panStart)return;const dx=event.clientX-panStart.lastX,dy=event.clientY-panStart.lastY;if(Math.hypot(event.clientX-panStart.x,event.clientY-panStart.y)>4)panStart.moved=true;if(!panStart.moved||imageZoom===1)return;const box=viewportAt(p.x,p.y)||rects[0];imagePanX+=dx/p.bounds.width*cc.width/box.w;imagePanY+=dy/p.bounds.height*cc.height/box.h;clampImagePan();panStart.lastX=event.clientX;panStart.lastY=event.clientY;dirty=true;drawComparison();});
 const endPan=()=>{if(panStart?.moved){suppressImageClick=true;setTimeout(()=>suppressImageClick=false,120);}panStart=null;};cc.addEventListener('pointerup',endPan);cc.addEventListener('pointercancel',endPan);
 cc.addEventListener('pointerleave',()=>{crosshair.hidden=true;if(showCoordinates)$('missionCursor').textContent='Move over an image to read sky coordinates';});
 cc.onclick=event=>{if(suppressImageClick){suppressImageClick=false;return;}const p=canvasPosition(event),r=viewportAt(p.x,p.y);if(!r)return;const u=imageCoordinate(r,p.x,p.y);if(u.x<0||u.x>1||u.y<0||u.y>1)return;if(getComparison().marking){markSample(u.x,u.y);return;}const px=u.x*279,py=u.y*279,index=(getComparison().changes?.candidates||[]).findIndex(candidate=>Math.hypot(candidate.x-px,candidate.y-py)<13);if(index>=0){selectedChange=index;dirty=true;drawComparison();}};
 $('markSky').addEventListener('click',()=>{$('candidateStatus').textContent='Click a source in the comparison images.';dirty=true;drawComparison()});
 document.addEventListener('omni-comparison-frame',()=>{drawComparison();const p=c.missionMeshes.spherex.group.position.clone().project(c.camera),r=card.getBoundingClientRect(),x=(p.x*.5+.5)*innerWidth,y=(-p.y*.5+.5)*innerHeight;link.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);const visible=innerWidth>800&&!card.classList.contains('is-large')&&p.z> -1&&p.z<1&&x>0&&x<r.left;link.style.display=visible?'block':'none';if(visible)link.firstElementChild.setAttribute('d',`M ${x+12} ${y} C ${x+75} ${y}, ${r.left-65} ${r.top+135}, ${r.left} ${r.top+135}`);});
 document.addEventListener('omni-observe-request',e=>{if(e.detail?.comparison){close(false);card.classList.remove('is-collapsed');card.classList.add('attention');setTimeout(()=>card.classList.remove('attention'),900);}else open('search')});
 guide.querySelector('h2').textContent='One mission. Two visits.';guide.querySelector('ol').innerHTML='<li><b>Follow SPHEREx</b><span>The scene starts near Earth and SPHEREx. Drag or zoom to explore the connected solar system.</span></li><li><b>Compare the observations</b><span>Use side-by-side, swipe, blink, or difference in the comparison panel.</span></li><li><b>Investigate a candidate</b><span>Find sky images loads another field. Details and notes lets you inspect wavelengths and mark possible changes.</span></li>';
 guide.querySelector('p').textContent='Built around the Planet X and SPHEREx challenge. A visual change needs checks for wavelength, image quality, and independent confirmation.';
 $('calmStart').textContent='Explore the mission';$('calmStart').onclick=()=>{guide.close();focusMission()};
 installMissionStage({ui,card,bandPanel,getComparison,scanSample,setStoryState,loadPairChoice,chooseDetector,selectVisit,drawComparison});
 const analysisDetails=make('details',{className:'analysis-details'});
 analysisDetails.innerHTML='<summary>Observation details <span>Acquisition · spectrum · spacecraft · data quality</span></summary><div class="analysis-details-grid"></div>';
 const analysisGrid=analysisDetails.querySelector('.analysis-details-grid');
 const group=(title)=>{const section=make('section',{className:'analysis-detail-group'});const heading=make('h4',{textContent:title});section.appendChild(heading);analysisGrid.appendChild(section);return section;};
 const acquisition=group('Acquisition');acquisition.appendChild($('missionBaseline'));for(const id of ['analysisAcquiredA','analysisAcquiredB'])acquisition.appendChild(make('span',{id}));
 const spectrumDetails=group('Spectral measurement');spectrumDetails.append($('missionLiveWave'),$('missionBandValues'));
 const positionDetails=group('Recorded spacecraft position');positionDetails.appendChild($('missionLiveOrbit'));
 const qualityDetails=group('Interpretation & sources');qualityDetails.append(card.querySelector('.mission-caution'),cleanDetails);for(const suffix of ['A','B']){const link=make('a',{id:'analysisSource'+suffix,textContent:'Original FITS '+suffix+' ↗',target:'_blank',rel:'noopener noreferrer'});qualityDetails.appendChild(link);}qualityDetails.appendChild($('missionDetails'));
 card.querySelector('.mission-live-readout').remove();card.querySelector('.mission-comparison-foot').remove();
 changePanel.after(analysisDetails);

 document.addEventListener('omni-stop-blink',()=>{if(displayMode!=='side'){stopBlink();displayMode='side';card.querySelectorAll('[data-mission-mode]').forEach(button=>{const active=button.dataset.missionMode==='side';button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});dirty=true;drawComparison();}});
 return {open,close};
}
