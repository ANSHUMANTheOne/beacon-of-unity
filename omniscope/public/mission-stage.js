// The observation picker stays compact until someone asks to inspect the images.
export function installMissionStage({ui,card,bandPanel,getComparison,scanSample,setStoryState,loadPairChoice,chooseDetector,selectVisit,drawComparison}){
 const $=id=>document.getElementById(id);
 const stage=document.createElement('section');
 stage.className='mission-stage';
 stage.setAttribute('aria-label','Choose a SPHEREx observation');
 stage.innerHTML=`<div class="mission-stage-head"><div><span class="calm-eyebrow">THE OBSERVATION</span><h3>Select two visits</h3></div><span id="stageField">Opening archive…</span><button id="stageSkyArea" type="button">Change sky area ↗</button></div>
 <div class="mission-stage-pickers"><label>Earlier visit<select id="stageDateA" aria-label="Earlier observation date"></select></label><label>Later visit<select id="stageDateB" aria-label="Later observation date"></select></label></div>
 <div id="stageBandSlot"></div>
 <div class="mission-stage-actions"><button id="stageVisit" class="stage-primary">Compare images <span aria-hidden="true">↗</span></button><button id="stageReplay" class="stage-secondary" aria-pressed="false">Replay observation</button></div>
 <div class="mission-stage-readout" aria-live="off"><span id="stageTime">Choose a pair to see where SPHEREx was.</span><strong id="stageWave">Measured wavelength will appear here.</strong><span id="stageCoords">Recorded spacecraft position loads with each image.</span></div>
 <p class="mission-stage-note">Spacecraft position from FITS metadata. Diagram is not to scale.</p>`;
 ui.appendChild(stage);
 stage.querySelector('#stageSkyArea').onclick=()=>ui.querySelector('[data-panel="search"]').click();
 stage.querySelector('#stageBandSlot').appendChild(bandPanel);
 bandPanel.querySelector('.mission-band-top h4').textContent='Infrared band';
 bandPanel.querySelector('.mission-band-top .calm-eyebrow').textContent='CHOOSE THE LIGHT';
 const a=$('stageDateA'),b=$('stageDateB'),band=$('missionBand'),visitButton=$('stageVisit'),replayButton=$('stageReplay'),toggle=$('missionEnlarge');
 const cardReplay=document.createElement('button');cardReplay.id='missionReplay';cardReplay.type='button';cardReplay.textContent='▶ Replay';cardReplay.title='Replay both recorded exposures';cardReplay.setAttribute('aria-label','Replay observation');cardReplay.setAttribute('aria-pressed','false');toggle.before(cardReplay);
 toggle.hidden=false;
 card.classList.add('is-collapsed');
 card.setAttribute('aria-expanded','false');
 const indicator=document.createElement('div');indicator.className='mission-scan-indicator';indicator.hidden=true;
 card.querySelector('.mission-image-area').appendChild(indicator);
 const live=document.createElement('div');live.className='mission-live-readout';live.innerHTML='<strong id="missionLiveWave">Reading detector pixels…</strong><span id="missionLiveOrbit">Reading recorded spacecraft position…</span>';
 card.querySelector('.mission-visit-dates').after(live);
 let playing=false,started=0,lastIndex=-1,lastSignature='',lastPaint=0,busy=false,loadError='';
 function openCard(){card.classList.remove('is-collapsed');card.setAttribute('aria-expanded','true');toggle.textContent='← Observation';toggle.title='Return to observation controls';toggle.setAttribute('aria-label','Return to observation controls');drawComparison();document.dispatchEvent(new Event('omni-scan-pair'));}
 function closeCard(){card.classList.add('is-collapsed');card.setAttribute('aria-expanded','false');toggle.textContent='← Observation';toggle.title='Return to observation controls';toggle.setAttribute('aria-label','Return to observation controls');indicator.hidden=true;}
 closeCard();
 toggle.onclick=()=>card.classList.contains('is-collapsed')?openCard():closeCard();
 function stop(){playing=false;lastIndex=-1;setStoryState({playing:false,selectedVisit:null,progress:.5});replayButton.textContent='Replay observation';replayButton.setAttribute('aria-pressed','false');cardReplay.textContent='▶ Replay';cardReplay.setAttribute('aria-pressed','false');indicator.hidden=true;}
 function play(){if(playing){stop();return;}if(getComparison().images.length!==2)return;document.dispatchEvent(new Event('omni-stop-blink'));playing=true;started=performance.now();lastIndex=-1;replayButton.textContent='Pause replay';replayButton.setAttribute('aria-pressed','true');cardReplay.textContent='Ⅱ Pause';cardReplay.setAttribute('aria-pressed','true');}
 replayButton.onclick=play;cardReplay.onclick=play;
 visitButton.onclick=()=>{if(getComparison().images.length!==2)return;openCard();};
 document.addEventListener('omni-stop-replay',stop);
 async function choosePair(event){const ai=Number(a.value),bi=Number(b.value);if(ai===bi){$('stageTime').textContent='Choose two different visits.';return;}document.dispatchEvent(new Event('omni-stop-blink'));stop();busy=true;loadError='';visitButton.disabled=true;replayButton.disabled=true;$('stageTime').textContent='Reading the selected FITS images…';try{if(await loadPairChoice(ai,bi))selectVisit(event?.target===b?'B':'A');else loadError=$('surveyStatus').textContent||'The selected visit could not be opened.';}finally{busy=false;visitButton.disabled=false;replayButton.disabled=false;lastSignature='';drawComparison();}}
 a.onchange=choosePair;b.onchange=choosePair;
 band.onchange=async()=>{document.dispatchEvent(new Event('omni-stop-blink'));stop();busy=true;loadError='';visitButton.disabled=true;replayButton.disabled=true;$('stageTime').textContent=`Reading detector ${band.value}…`;try{if(!await chooseDetector(Number(band.value)))loadError=$('surveyStatus').textContent||'This detector could not be opened.';}finally{busy=false;visitButton.disabled=false;replayButton.disabled=false;lastSignature='';drawComparison();}};
 function choices(data){const signature=data.detector+'|'+data.choices.map(r=>r.id+':'+r.date).join('|');if(signature===lastSignature){if(!busy&&!data.busy)for(const [select,selected] of [[a,data.selectedChoices[0]],[b,data.selectedChoices[1]]])if(selected>=0&&select.value!==String(selected))select.value=String(selected);return;}lastSignature=signature;for(const [select,selected] of [[a,data.selectedChoices[0]],[b,data.selectedChoices[1]]]){select.replaceChildren();for(const item of data.choices){const option=document.createElement('option');option.value=String(item.index);option.textContent=`${item.date} · ${item.id||'observation '+(item.index+1)}`;select.appendChild(option);}select.value=String(selected??'');}
  a.disabled=b.disabled=data.choices.length<2||busy;}
 function update(time){const data=getComparison();choices(data);visitButton.disabled=busy||data.busy||data.images.length!==2;replayButton.disabled=visitButton.disabled;cardReplay.disabled=visitButton.disabled;band.disabled=busy||data.busy;
  if(data.field)$('stageField').textContent=`RA ${data.field.ra.toFixed(3)}° · Dec ${data.field.dec.toFixed(3)}°`;
  if(playing&&(data.busy||data.images.length!==2))stop();
  let index=data.visit,progress=.5;
  if(playing){const cycle=(time-started)/4600,indexNow=Math.floor(cycle)%2;progress=cycle%1;index=indexNow;if(lastIndex!==index){lastIndex=index;selectVisit(index?'B':'A');}setStoryState({playing:true,selectedVisit:index,progress});}
  if(time-lastPaint<90)return;lastPaint=time;
  const pos=data.positions[index];
  if(pos){const xyz=pos.start.map((v,i)=>v+(pos.end[i]-v)*progress);const altitude=Math.hypot(...xyz)-6371;
   $('stageTime').textContent=`${index?'B · later':'A · earlier'} · ${data.observationTimes[index]||data.dates[index]||'archived exposure'} UTC`;
   $('stageCoords').textContent=`Spacecraft from Earth center: X ${Math.round(xyz[0])}, Y ${Math.round(xyz[1])}, Z ${Math.round(xyz[2])} km · ~${Math.round(altitude)} km altitude`;
   $('missionLiveOrbit').textContent=`Recorded position: X ${Math.round(xyz[0])} · Y ${Math.round(xyz[1])} · Z ${Math.round(xyz[2])} km from Earth center · ~${Math.round(altitude)} km altitude`;
  }else if(!busy){$('stageTime').textContent=data.images.length?'No recorded position in this exposure.':'Opening archived observations…';$('stageCoords').textContent='A real position is shown only when the FITS metadata provides it.';$('missionLiveOrbit').textContent='Recorded spacecraft coordinates are unavailable for this exposure.';}
  const pixel=scanSample(progress,index);
  if(loadError)$('stageTime').textContent=loadError;
  $('stageWave').textContent=pixel?`Nearest clean pixel ${pixel.x}, ${pixel.y} · ${pixel.wavelength.toFixed(4)} µm infrared`:'No clean detector pixel in the selected band.';
  $('missionLiveWave').textContent=pixel?`${index?'Later':'Earlier'} exposure · measured infrared ${pixel.wavelength.toFixed(4)} µm at pixel ${pixel.x}, ${pixel.y}`:`${index?'Later':'Earlier'} exposure · no clean wavelength sample in this band`;
  if(playing&&!card.classList.contains('is-collapsed')&&pixel){const area=card.querySelector('.mission-image-area'),canvas=$('missionCanvas');const areaRect=area.getBoundingClientRect(),rect=canvas.getBoundingClientRect();indicator.hidden=false;indicator.style.left=`${rect.left-areaRect.left+rect.width*(index? .5+pixel.x/280*.5:pixel.x/280*.5)}px`;indicator.dataset.visit=index?'B':'A';}
  else indicator.hidden=true;
 }
 document.addEventListener('omni-comparison-frame',()=>update(performance.now()));
 document.addEventListener('omni-observe-request',e=>{if(e.detail?.comparison)openCard()});
 update(performance.now());
}
