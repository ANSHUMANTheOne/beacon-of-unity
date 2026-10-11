import {BLE} from './bluetooth.js';
import {detect,hexs} from './protocol.js';
import {TYPES,colorAt,Player} from './animations.js';
import {Presets} from './presets.js';
const $=s=>document.querySelector(s),ble=new BLE(),P=new Presets();
let cfg={gap:150,scan:'all',extra:''};try{Object.assign(cfg,JSON.parse(localStorage.getItem('cozystudio.cfg')))}catch{}
let A=structuredClone(P.l[0].anim),proto=null,armed=false,stream=null,modeOn=false;
const CATS={basic:[[0,2],[77,88],[181,212]],trans:[[3,22]],tail:[[23,38]],water:[[39,56]],curtain:[[57,76]],flow:[[143,166]]};
const set=(id,t,c='')=>{const e=$(id);e.textContent=t;e.className='b '+c};
const log=m=>{const l=$('#log');l.textContent=(l.textContent+m+'\n').split('\n').slice(-200).join('\n');l.scrollTop=1e9};
const toast=m=>{const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,8000);log('! '+m)};
function fail(e){const n=e.name,m=e.message||'';toast(n==='Unsupported'?m:n==='NotFoundError'?(/cancel/i.test(m)?'No device selected (chooser closed).':'Device or service not found: '+m):
  n==='SecurityError'||n==='NotAllowedError'?'Bluetooth permission denied or blocked: '+m:
  n==='NetworkError'?'GATT error. Device out of range, or still connected to another app (close LotusLamp X): '+m:(n||'Error')+': '+m)}
ble.addEventListener('log',e=>log(e.detail));
// ---- hardware sends (only after the user has run the protocol test) ----
const stopStream=()=>{if(stream){clearInterval(stream);stream=null;set('#sMode','Preview only')}};
async function hw(frame,key){
  if(!ble.connected||!proto||!armed||!frame){$('#last').textContent='Not sent: connect and run the protocol test (Diagnostics) first.';return false}
  try{if(await ble.send(proto.writeUuid,frame,key)){$('#last').textContent='Last GATT write accepted: '+hexs(frame)+' (this does not prove the LEDs changed)';log('> '+hexs(frame));return true}}
  catch(e){stopStream();fail(e)}return false}
const solid=()=>colorAt({...A,type:'solid'},0,0);
const pushSolid=()=>{stopStream();modeOn=false;return hw(proto&&proto.adapter.color(...solid()),'color')};
// ---- preview ----
const frame=(t,n=48)=>Array.from({length:n},(_,i)=>colorAt(A,t,i/(n-1)));
function draw(cv,px){const w=cv.clientWidth,h=cv.clientHeight,d=devicePixelRatio||1;if(!w)return;
  if(cv.width!==Math.round(w*d)||cv.height!==Math.round(h*d)){cv.width=w*d;cv.height=h*d}
  const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);const bw=Math.min(w*.14,56),sh=(h-20)/px.length;
  [w*.3,w*.7].forEach(cx=>px.forEach((c,i)=>{x.fillStyle=`rgb(${c})`;x.fillRect(cx-bw/2,10+i*sh,bw,sh-1.5)}))}
const pl=new Player(t=>{const px=frame(t);draw($('#bars'),px);draw($('#prev'),px)});
addEventListener('resize',()=>pl.redraw());
// ---- UI sync ----
function sync(){$('#col').value=A.colors[0];$('#bri').value=A.brightness;$('#spd').value=A.speed;$('#type').value=A.type;$('#dir').value=A.dir;
  $('#pal').replaceChildren(...A.colors.map((c,i)=>{const e=document.createElement('input');e.type='color';e.value=c;e.title='Right-click to remove';
    e.oninput=()=>{A.colors[i]=e.value;pl.redraw()};e.oncontextmenu=ev=>{ev.preventDefault();if(A.colors.length>1){A.colors.splice(i,1);sync();pl.redraw()}};return e}));
  const h=TYPES[A.type]?.hw;$('#hwnote').textContent=h==='stream'?`Single-zone: can be streamed as one colour over time (about ${(1000/Math.max(cfg.gap,ble.minGap)).toFixed(1)} updates/s).`:'Preview only: needs individually addressable pixels, which are not confirmed on this hardware.';
  $('#apply').disabled=h!=='stream';pl.redraw()}
$('#type').replaceChildren(...Object.entries(TYPES).map(([k,v])=>new Option(v.label+(v.hw==='stream'?'':' (preview only)'),k)));
const Q=[['Red/blue strobe',{type:'strobe',colors:['#ff0000','#0000ff'],speed:60}],['Red > orange > yellow loop',{type:'fade',colors:['#ff0000','#ff7a00','#ffe600'],speed:40}],['Rainbow',{type:'rainbow',colors:['#ff0040','#00c8ff'],speed:50}],['Violet meteor (preview)',{type:'meteor',colors:['#8a5cff','#05060a'],speed:60}]];
$('#quick').replaceChildren(...Q.map(([n,o])=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>{A={...A,...structuredClone(o),dir:1};sync()};return b}));
$('#type').onchange=e=>{A.type=e.target.value;sync()};$('#dir').onchange=e=>{A.dir=+e.target.value;pl.redraw()};
$('#col').oninput=e=>{A.type='solid';A.colors[0]=e.target.value;sync();pushSolid()};
$('#bri').oninput=e=>{A.brightness=+e.target.value;pl.redraw();if(modeOn)hw(proto&&proto.adapter.brightness(A.brightness),'bri');else if(A.type==='solid'&&!stream)pushSolid()};
$('#spd').oninput=e=>{A.speed=+e.target.value;pl.redraw();if(modeOn)hw(proto&&proto.adapter.speed(A.speed),'spd')};
$('#padd').onclick=()=>{if(A.colors.length<12){A.colors.push('#22d3ee');sync()}};
$('#prem').onclick=()=>{if(A.colors.length>1){A.colors.pop();sync()}};
$('#play').onclick=()=>pl.play();$('#pause').onclick=()=>pl.pause();$('#stop').onclick=()=>pl.stop();
$('#apply').onclick=()=>{if(!ble.connected||!proto||!armed)return toast('Connect and run the protocol test first (Diagnostics).');
  stopStream();modeOn=false;const t0=performance.now();set('#sMode','Streaming colour to lights','ok');
  stream=setInterval(()=>hw(proto.adapter.color(...colorAt(A,(performance.now()-t0)/1000,0)),'stream'),Math.max(cfg.gap,ble.minGap))};
$('#unapply').onclick=stopStream;
// ---- tabs ----
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));
  document.querySelectorAll('main>section').forEach(s=>s.hidden=s.id!=='t-'+b.dataset.t);pl.redraw()});
// ---- effects ----
const sendMode=async n=>{stopStream();if(await hw(proto&&proto.adapter.mode(n),'mode'))modeOn=true};
$('#mgo').onclick=()=>sendMode(+$('#mn').value);
$('#cats').replaceChildren(...Object.entries(CATS).flatMap(([k,r])=>{const h=document.createElement('p');h.className='m';h.textContent=k;
  const d=document.createElement('div');r.forEach(([a,b])=>{for(let n=a;n<=b;n++){const x=document.createElement('button');x.textContent=n;x.onclick=()=>{$('#mn').value=n;sendMode(n)};d.append(x)}});return[h,d]}));
// ---- presets ----
function plist(){$('#plist').replaceChildren(...P.l.map((p,i)=>{const r=document.createElement('div');r.className='pi';const s=document.createElement('span');s.textContent=`${p.name} (${p.anim.type})`;
  const mkb=(t,f)=>{const b=document.createElement('button');b.textContent=t;b.onclick=f;return b};
  r.append(s,mkb('Load',()=>{A=structuredClone(p.anim);if(!TYPES[A.type])A.type='solid';sync()}),mkb('Rename',()=>{const n=prompt('Name',p.name);if(n){P.ren(i,n);plist()}}),
    mkb('Duplicate',()=>{P.dup(i);plist()}),mkb('Delete',()=>{if(confirm('Delete preset?')){P.del(i);plist()}}));return r}))}
$('#psave').onclick=()=>{P.add($('#pname').value||TYPES[A.type].label,A);plist()};
$('#pexp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([P.export()],{type:'application/json'}));a.download='cozystudio-presets.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1e3)};
$('#pimp').onchange=async e=>{try{toast('Imported '+P.import(await e.target.files[0].text())+' preset(s).');plist()}catch(x){toast('Import failed: '+x.message)}e.target.value=''};
// ---- settings ----
$('#scan').value=cfg.scan;$('#extra').value=cfg.extra;$('#gap').value=cfg.gap;
const saveCfg=()=>{cfg={scan:$('#scan').value,extra:$('#extra').value,gap:Math.max(50,+$('#gap').value||150)};ble.minGap=cfg.gap;try{localStorage.setItem('cozystudio.cfg',JSON.stringify(cfg))}catch{}sync()};
['#scan','#extra','#gap'].forEach(s=>$(s).onchange=saveCfg);ble.minGap=cfg.gap;
// ---- connection ----
$('#conn').onclick=async()=>{try{await ble.connect({all:cfg.scan==='all',extra:cfg.extra.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)})}catch(e){fail(e)}};
$('#reco').onclick=()=>ble.open().catch(fail);$('#disc').onclick=()=>{stopStream();ble.disconnect()};
ble.addEventListener('state',e=>{const s=e.detail;set('#sConn',s==='connected'?'Connected':s==='connecting'?'Connecting...':'Disconnected',s==='connected'?'ok':s==='connecting'?'warn':'bad');
  $('#dev').textContent=ble.dev?(ble.dev.name||'(unnamed device)'):'none'});
ble.addEventListener('drop',()=>{stopStream();armed=false;modeOn=false;proto=null;$('#test').disabled=true;set('#sProto','Protocol: unknown');$('#ask').hidden=true});
ble.addEventListener('services',e=>{const sv=e.detail;proto=detect(sv);armed=false;$('#ask').hidden=true;$('#test').disabled=!proto;ble.allow(proto?[proto.writeUuid]:[]);
  set('#sProto',proto?'Protocol: LotusLamp X candidate (unverified)':'Protocol: not detected',proto?'warn':'bad');
  $('#pst').textContent=proto?'FFF0 service and writable FFF3 found. Commands stay locked until you run the test and confirm the lights changed.':'No FFF0 service with a writable FFF3 characteristic is exposed. Nothing will be written. Add the right service UUID in Settings to inspect it.';
  const root=document.createDocumentFragment();if(!sv.length)root.append('No accessible services (add UUIDs in Settings, then reconnect).');
  sv.forEach(s=>{const h=document.createElement('b');h.textContent='Service '+s.uuid;root.append(h);
    s.chars.forEach(c=>{const d=document.createElement('div');d.className='ch';const t=document.createElement('span');t.textContent=c.uuid+' ['+c.props.join(', ')+'] ';d.append(t);
      const out=document.createElement('span');
      if(c.props.includes('read')){const b=document.createElement('button');b.textContent='Read';b.onclick=async()=>{try{out.textContent=hexs(await ble.read(c.uuid))}catch(x){fail(x)}};d.append(b)}
      if(c.props.includes('notify')){const b=document.createElement('button');let on=false;b.textContent='Notify';b.onclick=async()=>{try{await ble.notify(c.uuid,!on);on=!on;b.textContent=on?'Notify: on':'Notify'}catch(x){fail(x)}};d.append(b)}
      d.append(out);root.append(d)})});
  $('#svc').replaceChildren(root)});
$('#test').onclick=async()=>{armed=true;const ok=await hw(proto.adapter.color(0,0,255),'color');if(ok)$('#ask').hidden=false;else armed=false};
$('#yes').onclick=()=>{$('#ask').hidden=true;set('#sProto','Protocol: confirmed by you this session','ok');toast('Confirmed. Commands unlocked.')};
$('#no').onclick=()=>{armed=false;$('#ask').hidden=true;set('#sProto','Protocol: NOT working on this device','bad');toast('Commands locked. Check the log and your service/characteristic list.')};
if(!navigator.bluetooth)toast('Web Bluetooth is unavailable here. Use Chrome/Edge over HTTPS or localhost. The preview still works.');
sync();plist();pl.play();
