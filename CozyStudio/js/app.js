import {BLE} from './bluetooth.js';
import {detect,hexs} from './protocol.js';
import {TYPES,colorAt,Player} from './animations.js';
import {Presets} from './presets.js';
const $=s=>document.querySelector(s),ble=new BLE(),P=new Presets();
let cfg={gap:100,scan:'all',extra:''};try{Object.assign(cfg,JSON.parse(localStorage.getItem('cozystudio.cfg')))}catch{}
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
  try{if(await ble.send(proto.writeUuid,frame,key)){$('#last').textContent='Last GATT write accepted: '+hexs(ble.lastBytes)+' (this does not prove the LEDs changed)';if(key!=='stream')log('> '+hexs(ble.lastBytes));return true}}
  catch(e){stopStream();fail(e)}return false}
const solid=()=>colorAt({...A,type:'solid'},0,0);
const pushSolid=()=>{stopStream();modeOn=false;return hw(proto&&proto.adapter.color(...solid()),'color')};
// ---- preview ----
const frame=(t,n=48)=>Array.from({length:n},(_,i)=>colorAt(A,t,i/(n-1)));
function draw(cv,px){const w=cv.clientWidth,h=cv.clientHeight,d=devicePixelRatio||1;if(!w)return;
  if(cv.width!==Math.round(w*d)||cv.height!==Math.round(h*d)){cv.width=w*d;cv.height=h*d}
  const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);const bw=Math.min(w*.13,52),sh=(h-28)/px.length,av=[0,1,2].map(k=>px.reduce((a,c)=>a+c[k],0)/px.length|0);
  [w*.3,w*.7].forEach(cx=>{x.save();x.shadowColor=`rgb(${av})`;x.shadowBlur=40;x.fillStyle=`rgba(${av},.35)`;x.beginPath();x.roundRect(cx-bw/2-4,10,bw+8,h-20,12);x.fill();x.restore();
    x.fillStyle='#0c0d11';x.beginPath();x.roundRect(cx-bw/2-3,11,bw+6,h-22,11);x.fill();
    px.forEach((c,i)=>{x.fillStyle=`rgb(${c})`;x.fillRect(cx-bw/2,14+i*sh,bw,sh+.5)})})}
const pl=new Player(t=>{const px=frame(t);draw($('#bars'),px);draw($('#prev'),px)});
addEventListener('resize',()=>pl.redraw());
// ---- UI sync ----
function sync(){$('#col').value=A.colors[0];$('#bri').value=A.brightness;$('#spd').value=A.speed;document.querySelectorAll('#types button').forEach(b=>b.classList.toggle('on',b.dataset.k===A.type));$('#bri2').value=A.brightness;$('#spd2').value=A.speed;$('#dir').value=A.dir;
  $('#pal').replaceChildren(...A.colors.map((c,i)=>{const e=document.createElement('input');e.type='color';e.value=c;e.title='Right-click to remove';
    e.oninput=()=>{A.colors[i]=e.value;pl.redraw()};e.oncontextmenu=ev=>{ev.preventDefault();if(A.colors.length>1){A.colors.splice(i,1);sync();pl.redraw()}};return e}));
  const h=TYPES[A.type]?.hw;$('#hwnote').textContent=h==='stream'?`Single-zone: can be streamed as one colour over time (about ${(1000/Math.max(cfg.gap,ble.minGap)).toFixed(1)} updates/s).`:'Preview only: needs individually addressable pixels, which are not confirmed on this hardware.';
  $('#apply').disabled=h!=='stream';pl.redraw()}
$('#types').replaceChildren(...Object.entries(TYPES).map(([k,v])=>{const b=document.createElement('button');b.dataset.k=k;b.textContent=v.label.replace(/ \(.*\)/,'')+(v.hw==='stream'?'':' (preview)');if(v.hw!=='stream')b.className='pv';b.onclick=()=>{A.type=k;sync()};return b}));
const Q=[['Red/blue strobe',{type:'strobe',colors:['#ff0000','#0000ff'],speed:60}],['Red > orange > yellow loop',{type:'fade',colors:['#ff0000','#ff7a00','#ffe600'],speed:40}],['Rainbow',{type:'rainbow',colors:['#ff0040','#00c8ff'],speed:50}],['Violet meteor (preview)',{type:'meteor',colors:['#8a5cff','#05060a'],speed:60}]];
$('#quick').replaceChildren(...Q.map(([n,o])=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>{A={...A,...structuredClone(o),dir:1};sync()};return b}));
$('#dir').onchange=e=>{A.dir=+e.target.value;pl.redraw()};
$('#col').oninput=e=>{A.type='solid';A.colors[0]=e.target.value;sync();pushSolid()};
$('#bri').oninput=e=>{A.brightness=+e.target.value;pl.redraw();if(modeOn)hw(proto&&proto.adapter.brightness(A.brightness),'bri');else if(A.type==='solid'&&!stream)pushSolid()};
$('#spd').oninput=e=>{A.speed=+e.target.value;pl.redraw();if(modeOn)hw(proto&&proto.adapter.speed(A.speed),'spd')};
$('#padd').onclick=()=>{if(A.colors.length<12){A.colors.push('#22d3ee');sync()}};
$('#prem').onclick=()=>{if(A.colors.length>1){A.colors.pop();sync()}};
$('#play').onclick=()=>pl.play();$('#pause').onclick=()=>pl.pause();$('#stop').onclick=()=>pl.stop();
const applyHw=()=>{if(!ble.connected||!proto||!armed)return toast('Connect and run the protocol test first (Diagnostics).');
  stopStream();modeOn=false;const t0=performance.now();set('#sMode','Streaming colour to lights','ok');
  stream=setInterval(()=>hw(()=>proto.adapter.color(...colorAt(A,(performance.now()-t0)/1000,0)),'stream'),Math.max(cfg.gap,ble.minGap))};
$('#apply').onclick=applyHw;$('#unapply').onclick=stopStream;
// ---- tabs ----
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));
  document.querySelectorAll('main>section').forEach(s=>s.hidden=s.id!=='t-'+b.dataset.t);stopTour();sync()});
// ---- effects ----
const sendMode=async n=>{stopStream();if(await hw(proto&&proto.adapter.mode(n),'mode'))modeOn=true};

$('#cats').replaceChildren(...Object.entries(CATS).flatMap(([k,r])=>{const h=document.createElement('p');h.className='m';h.textContent=k;
  const d=document.createElement('div');r.forEach(([a,b])=>{for(let n=a;n<=b;n++){const x=document.createElement('button');x.textContent=n;x.onclick=()=>go(n);d.append(x)}});return[h,d]}));
// ---- presets ----
function plist(){$('#plist').replaceChildren(...P.l.map((p,i)=>{const r=document.createElement('div');r.className='pi';const s=document.createElement('span');s.textContent=`${p.name} (${p.anim.type})`;
  const mkb=(t,f)=>{const b=document.createElement('button');b.textContent=t;b.onclick=f;return b};
  r.append(s,mkb('Apply',()=>{A=structuredClone(p.anim);if(!TYPES[A.type])A.type='solid';sync();if(TYPES[A.type].hw!=='stream')toast('Preview only: this pattern needs individually addressable pixels, so it cannot run on the lights. Loaded into the preview.');else applyHw()}),mkb('Load',()=>{A=structuredClone(p.anim);if(!TYPES[A.type])A.type='solid';sync()}),mkb('Rename',()=>{const n=prompt('Name',p.name);if(n){P.ren(i,n);plist()}}),
    mkb('Duplicate',()=>{P.dup(i);plist()}),mkb('Delete',()=>{if(confirm('Delete preset?')){P.del(i);plist()}}));return r}))}
$('#psave').onclick=()=>{P.add($('#pname').value||TYPES[A.type].label,A);plist()};
$('#pexp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([P.export()],{type:'application/json'}));a.download='cozystudio-presets.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1e3)};
$('#pimp').onchange=async e=>{try{toast('Imported '+P.import(await e.target.files[0].text())+' preset(s).');plist()}catch(x){toast('Import failed: '+x.message)}e.target.value=''};
// ---- settings ----
$('#scan').value=cfg.scan;$('#extra').value=cfg.extra;$('#gap').value=cfg.gap;
const saveCfg=()=>{cfg={scan:$('#scan').value,extra:$('#extra').value,gap:Math.max(50,+$('#gap').value||100)};ble.minGap=cfg.gap;try{localStorage.setItem('cozystudio.cfg',JSON.stringify(cfg))}catch{}$('#smooth').value=[150,100,60].includes(cfg.gap)?String(cfg.gap):'x';sync()};
['#scan','#extra','#gap'].forEach(s=>$(s).onchange=saveCfg);ble.minGap=cfg.gap;
// ---- connection ----
$('#conn').onclick=async()=>{try{await ble.connect({all:cfg.scan==='all',extra:cfg.extra.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)})}catch(e){fail(e)}};
$('#reco').onclick=()=>ble.open().catch(fail);$('#disc').onclick=()=>{stopStream();ble.disconnect()};
ble.addEventListener('state',e=>{const s=e.detail;set('#sConn',s==='connected'?'Connected':s==='connecting'?'Connecting...':'Disconnected',s==='connected'?'ok':s==='connecting'?'warn':'bad');
  $('#dev').textContent=ble.dev?(ble.dev.name||'(unnamed device)'):'none'});
ble.addEventListener('drop',()=>{stopTour();stopStream();armed=false;modeOn=false;proto=null;$('#test').disabled=true;set('#sProto','Protocol: unknown');$('#ask').hidden=true});
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
for(const[a,b]of[['bri2','bri'],['spd2','spd']])$('#'+a).oninput=e=>{$('#'+b).value=e.target.value;$('#'+b).oninput({target:$('#'+b)})};
$('#smooth').onchange=e=>{if(e.target.value!=='x'){$('#gap').value=e.target.value;saveCfg();toast('Smoothness set. Press Apply to Lights again to use it.')}};
const SW=['#ff0000','#ff7a00','#ffe600','#22c55e','#00e5ff','#2563eb','#8a5cff','#ff2bd6','#ffffff','#ffb36b'];
$('#sw').replaceChildren(...SW.map(c=>{const b=document.createElement('button');b.className='sw';b.style.background=c;b.title=c;b.setAttribute('aria-label','Colour '+c);b.onclick=()=>{A.type='solid';A.colors[0]=c;sync();pushSolid()};return b}));
const PALS={Fire:['#ff0000','#ff7a00','#ffe600'],Sunset:['#ff2d55','#ff8a00','#7b2ff7'],Ocean:['#00e5ff','#2563eb','#0b1d6e'],Neon:['#ff2bd6','#00e5ff','#8a5cff'],'Red + blue':['#ff0000','#0000ff'],Forest:['#16a34a','#bef264','#065f46'],Candy:['#ff77c8','#7dd3fc','#fde68a']};
$('#pals').replaceChildren(...Object.entries(PALS).map(([n,cs])=>{const b=document.createElement('button');b.textContent=n;b.style.background=`linear-gradient(#181a22cc,#181a22cc),linear-gradient(90deg,${cs})`;b.onclick=()=>{A.colors=[...cs];sync()};return b}));
// my effects: step through built-in modes, name the good ones
let FAV=[],cur=0,tour=null;try{FAV=JSON.parse(localStorage.getItem('cozystudio.fav'))||[]}catch{}
const saveFav=()=>{try{localStorage.setItem('cozystudio.fav',JSON.stringify(FAV))}catch{}};
function favs(){$('#favs').replaceChildren(...(FAV.length?FAV.map((f,i)=>{const d=document.createElement('span');d.className='chip';const b=document.createElement('button');b.textContent=f.name;b.onclick=()=>go(f.n);
  const x=document.createElement('button');x.textContent='x';x.title='Remove';x.onclick=()=>{FAV.splice(i,1);saveFav();favs()};d.append(b,x);return d}):['Nothing saved yet. Step through the effects and save the ones you like.']))}
function go(n){cur=(n+213)%213;$('#fn').textContent='Mode '+cur;sendMode(cur)}
function stopTour(){clearInterval(tour);tour=null;$('#ftour').textContent='Auto-tour'}
$('#fprev').onclick=()=>go(cur-1);$('#fnext').onclick=()=>go(cur+1);
$('#ftour').onclick=()=>{if(tour)return stopTour();if(!armed)return toast('Connect and run the protocol test first (Diagnostics).');$('#ftour').textContent='Stop tour';go(cur);tour=setInterval(()=>go(cur+1),3000)};
$('#ffav').onclick=()=>{const n=$('#fname').value.trim();FAV.push({n:cur,name:(n||'Effect')+' ('+cur+')'});saveFav();$('#fname').value='';favs()};
favs();$('#smooth').value=[150,100,60].includes(cfg.gap)?String(cfg.gap):'x';
if(BLE.v!==2)toast('Mismatched files: bluetooth.js is outdated. Upload ALL files from the latest zip, then hard-refresh (Ctrl+Shift+R).');
sync();plist();pl.play();
