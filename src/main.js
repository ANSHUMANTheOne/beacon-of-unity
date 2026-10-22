import './style.css';
import './beacon-chat.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let world, paused=reduce.matches;

// Rendering is progressive enhancement: content, navigation, and links never wait for WebGL.
const timeout=setTimeout(()=>document.documentElement.classList.add('world-unavailable'),12000);
async function loadWorld(){try{const {UnityWorld}=await import('./world.js');world=new UnityWorld($('#unity-canvas'),()=>{clearTimeout(timeout);document.documentElement.classList.remove('world-unavailable');document.documentElement.classList.add('world-ready');});}catch(error){clearTimeout(timeout);document.documentElement.classList.add('world-unavailable');console.warn('The lightweight world illustration is active.',error.message);}}
loadWorld();

const data={
 help:[['↗','A ladder for a little home improvement','Al Nahda, Sharjah · Nearby','Tools & everyday help'],['↗','An extra pair of hands with groceries','Al Majaz, Sharjah · Nearby','Community support'],['↗','A friendly hand setting up a laptop','Abu Shagara, Sharjah · Nearby','Tech help']],
 found:[['⌕','A set of keys, waiting to come home','Al Majaz waterfront · Example listing','Found'],['⌕','Looking for a much-loved backpack','Al Nahda park · Example listing','Lost'],['⌕','A wallet found on an evening walk','Abu Shagara · Example listing','Found']],
 volunteer:[['✳','A cleaner coast, together','Community beach cleanup · Example event','Environment'],['✳','Give a little time. Share a meal.','Community food drive · Example event','Community care'],['✳','Help someone take their next step','Neighbourhood skills exchange · Example event','Share a skill']],
 news:[['↗','Keep up with your neighbourhood','Discover community updates in one place','Local updates'],['↗','Find stories with their sources attached','Explore the platform’s local news space','Stay informed'],['↗','Know what is happening nearby','Open the demo to explore news categories','Community news']]
};
function selectFeature(name,focus=false){if(!data[name])return;$$('[data-preview]').forEach(b=>{const selected=b.dataset.preview===name;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;if(selected&&focus)b.focus();});$('#feature-panel').setAttribute('aria-labelledby','tab-'+name);const content=$('#preview-content');content.replaceChildren();data[name].forEach(([symbol,title,location,tag])=>{const item=document.createElement('article');item.className='preview-item';const icon=document.createElement('span');icon.className='preview-symbol';icon.textContent=symbol;const text=document.createElement('div');const heading=document.createElement('h3');heading.textContent=title;const meta=document.createElement('p');meta.textContent=location;const label=document.createElement('span');label.className='tag';label.textContent=tag;text.append(heading,meta,label);item.append(icon,text);content.append(item);});}
$$('[data-preview]').forEach((b,i)=>{b.addEventListener('click',()=>selectFeature(b.dataset.preview));b.addEventListener('keydown',e=>{const tabs=$$('[data-preview]');let next;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(i+1)%tabs.length;if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();selectFeature(tabs[next].dataset.preview,true);}});});
$$('[data-select]').forEach(a=>a.addEventListener('click',()=>selectFeature(a.dataset.select)));selectFeature('help');

let previousFocus;
function openDialog(dialog){previousFocus=document.activeElement;dialog.showModal();world?.setPaused(true);}
function closeDialog(dialog){dialog.close();world?.setPaused(paused);previousFocus?.focus();}
$$('dialog').forEach(d=>{d.querySelector('[data-close]').addEventListener('click',()=>closeDialog(d));d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d);}});d.addEventListener('close',()=>{world?.setPaused(paused);$('#menu-toggle').setAttribute('aria-expanded','false');if(d.id==='video-dialog')$('#video-frame').removeAttribute('src');});});
$('#menu-toggle').addEventListener('click',()=>{openDialog($('#navigation'));$('#menu-toggle').setAttribute('aria-expanded','true');});
$$('#navigation a').forEach(a=>a.addEventListener('click',()=>closeDialog($('#navigation'))));
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{const f=$('#demo-frame');if(!f.getAttribute('src'))f.src=f.dataset.src;openDialog($('#demo-dialog'));}));
// Existing same-origin demo remains intact, with its introductory overlay dismissed
// and its duplicate roaming mascot suppressed only inside the homepage dialog.
$('#demo-frame').addEventListener('load',()=>{try{const doc=$('#demo-frame').contentDocument;const style=doc.createElement('style');style.textContent='#bav-root,#bav-toggle,#bav-popover,#bav-chat{display:none!important}';doc.head.append(style);const skip=[...doc.querySelectorAll('button')].find(b=>b.textContent.trim().startsWith('Skip'));skip?.click();}catch{/* The demo also supports opening as a standalone page. */}});
$$('[data-video]').forEach(b=>b.addEventListener('click',()=>{$('#video-frame').src='https://www.youtube-nocookie.com/embed/md8suH2LcHs?autoplay=1&rel=0';openDialog($('#video-dialog'));}));
window.openSimDemo=()=>$$('[data-demo]')[0].click();window.closeSimDemo=()=>closeDialog($('#demo-dialog'));
function toggleMotion(){paused=!paused;world?.setPaused(paused);$('#motion-toggle').textContent=paused?'Resume the world':'Pause the world';$('#motion-toggle').setAttribute('aria-pressed',String(paused));$('#footer-motion').textContent=paused?'Resume motion':'Pause motion';}
$('#motion-toggle').addEventListener('click',toggleMotion);$('#footer-motion').addEventListener('click',toggleMotion);
reduce.addEventListener('change',e=>{if(world){world.reduced=e.matches;world.lastFrame=0;}paused=e.matches;$('#motion-toggle').setAttribute('aria-pressed',String(paused));});
$('#theme-toggle').addEventListener('click',()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';$('#theme-toggle').textContent=dark?'Switch to day':'Switch to night';try{localStorage.setItem('beacon-theme',dark?'dark':'light');}catch{}});
try{if(localStorage.getItem('beacon-theme')==='dark'){$('#theme-toggle').click();}}catch{}
$('#year').textContent=new Date().getFullYear();
const chapters=$$('.chapter');let scrollScheduled=false;
function scrollUpdate(){scrollScheduled=false;const y=scrollY;$('.site-header').classList.toggle('scrolled',y>60);const past=y>$('#story-end').offsetTop-innerHeight*.6;document.body.classList.toggle('past-story',past);let active=0;chapters.forEach((s,i)=>{const rect=s.getBoundingClientRect();if(rect.top<innerHeight*.4)active=i;const copy=s.querySelector('.chapter-copy');if(!reduce.matches&&innerWidth>700){const offset=Math.max(-30,Math.min(30,-rect.top*.06));copy.style.transform=`translateY(${offset}px)`;}});$$('#chapter-progress a').forEach((a,i)=>{a.classList.toggle('active',i===active);if(i===active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});$('#chapter-number').textContent=`0${active+1} / 05`;document.body.classList.toggle('footer-visible',$('.site-footer').getBoundingClientRect().top<innerHeight-100);}
addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(scrollUpdate);}},{passive:true});scrollUpdate();

// Retain the original Beacon SVG and double-click/double-tap chat gesture.
// Drag is opt-in, bounded, and returns to the dock rather than roaming over content.
const mascot=$('#bav-wrap');mascot.setAttribute('role','button');mascot.setAttribute('tabindex','0');mascot.setAttribute('aria-label','Beacon mascot. Double-click to chat, or drag to play.');mascot.title='Double-click to chat. Drag to play.';
$('#bav-chat-input').setAttribute('aria-label','Message Beacon');$('#bav-chat-body').setAttribute('aria-live','polite');
let lastPointerType='mouse';
$('#beacon-chat-button').addEventListener('click',()=>window.__bavOpenChat?.());mascot.addEventListener('dblclick',()=>{if(lastPointerType!=='touch')window.__bavOpenChat?.();});mascot.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.__bavOpenChat?.();}});
$('#beacon-hide').addEventListener('click',()=>{const hidden=document.body.classList.toggle('beacon-hidden');$('#beacon-hide').textContent=hidden?'+':'−';$('#beacon-hide').setAttribute('aria-label',hidden?'Show Beacon mascot':'Hide Beacon mascot');});
let drag=null,lastTap=0,animation=0;
mascot.addEventListener('pointerdown',e=>{lastPointerType=e.pointerType;if(e.button&&e.button!==0)return;cancelAnimationFrame(animation);const r=mascot.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:r.left,top:r.top,lastX:e.clientX,lastY:e.clientY,vx:0,vy:0,moved:false};mascot.setPointerCapture(e.pointerId);});
mascot.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved ||= Math.hypot(dx,dy)>6;drag.vx=e.clientX-drag.lastX;drag.vy=e.clientY-drag.lastY;drag.lastX=e.clientX;drag.lastY=e.clientY;if(drag.moved){mascot.style.right='auto';mascot.style.bottom='auto';mascot.style.left=Math.max(8,Math.min(innerWidth-60,drag.left+dx))+'px';mascot.style.top=Math.max(85,Math.min(innerHeight-105,drag.top+dy))+'px';}});
function dock(){mascot.style.left='';mascot.style.top='';mascot.style.right='';mascot.style.bottom='';}
function release(e){if(!drag)return;const d=drag;drag=null;if(!d.moved){const now=performance.now();if(e.pointerType==='touch'&&now-lastTap<330)window.__bavOpenChat?.();lastTap=now;return;}if(reduce.matches){dock();return;}let r=mascot.getBoundingClientRect(),x=r.left,y=r.top,vx=d.vx*.5,vy=d.vy*.5,start=performance.now(),last=start;function bounce(t){const dt=Math.min(2,(t-last)/16.67);last=t;vy+=.5*dt;x+=vx*dt;y+=vy*dt;if(x<8||x>innerWidth-60){vx*=-.55;x=Math.max(8,Math.min(innerWidth-60,x));}if(y>innerHeight-105){vy*=-.5;y=innerHeight-105;vx*=.9;}y=Math.max(85,y);mascot.style.left=x+'px';mascot.style.top=y+'px';if(t-start<1800)animation=requestAnimationFrame(bounce);else dock();}animation=requestAnimationFrame(bounce);}
mascot.addEventListener('pointerup',release);mascot.addEventListener('pointercancel',()=>{drag=null;dock();});addEventListener('resize',dock);
