import './style.css';
import './cinematic.css';
import './mascot.css';
import './mascot.js';
import './beacon-chat.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let world, paused=reduce.matches;

// Rendering is progressive enhancement: content, navigation, and links never wait for WebGL.
const timeout=setTimeout(()=>document.documentElement.classList.add('world-unavailable'),12000);
async function loadWorld(){try{const {UnityWorld}=await import('./world.js');world=new UnityWorld($('#unity-canvas'));world.setPaused(paused||!!$('dialog[open]'));await world.initialize(()=>{clearTimeout(timeout);document.documentElement.classList.remove('world-unavailable');document.documentElement.classList.add('world-ready');});}catch(error){clearTimeout(timeout);world?.dispose();world=undefined;document.documentElement.classList.add('world-unavailable');console.warn('The lightweight world illustration is active.',error.message);}}
loadWorld();

const data={
 help:[['↗','A ladder for a little home improvement','Al Nahda, Sharjah · Nearby','Tools & everyday help'],['↗','An extra pair of hands with groceries','Al Majaz, Sharjah · Nearby','Community support'],['↗','A friendly hand setting up a laptop','Abu Shagara, Sharjah · Nearby','Tech help']],
 found:[['⌕','A set of keys, waiting to come home','Al Majaz waterfront · Example listing','Found'],['⌕','Looking for a much-loved backpack','Al Nahda park · Example listing','Lost'],['⌕','A wallet found on an evening walk','Abu Shagara · Example listing','Found']],
 volunteer:[['✳','A cleaner coast, together','Community beach cleanup · Example event','Environment'],['✳','Give a little time. Share a meal.','Community food drive · Example event','Community care'],['✳','Help someone take their next step','Neighbourhood skills exchange · Example event','Share a skill']],
 news:[['↗','Keep up with your neighbourhood','Discover community updates in one place','Local updates'],['↗','Find stories with their sources attached','Explore the platform’s local news space','Stay informed'],['↗','Know what is happening nearby','Open the demo to explore news categories','Community news']]
};
function selectFeature(name,focus=false){if(!data[name])return;$$('[data-preview]').forEach(b=>{const selected=b.dataset.preview===name;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;if(selected&&focus)b.focus();});$('#feature-panel').setAttribute('aria-labelledby','tab-'+name);const routes={help:'community',found:'lostfound',volunteer:'volunteer-opps',news:'reliable-news'};const action=$('.preview-cta');action.dataset.demo=routes[name];action.firstChild.textContent={help:'Try posting or answering a request ',found:'Try searching Lost & Found ',volunteer:'Explore volunteer opportunities ',news:'Try the news filters '}[name];const content=$('#preview-content');content.replaceChildren();const descriptions={"help": "Ask for groceries, transport, tools or tech support. See distance, time remaining and volunteer counts, then message a neighbour directly.", "found": "Photo listings, clear Lost and Found labels, and Emirate locations. Contact the person who posted an item directly.", "volunteer": "Community events sourced from Volunteers.ae, with dates, locations and direct registration links.", "news": "Stories from Al Jazeera, BBC News, NPR News and Times of India. Filter by source or topic. Demo stories are fictional examples."};const description=document.createElement('p');description.className='preview-description';description.textContent=descriptions[name];content.append(description);data[name].forEach(([symbol,title,location,tag])=>{const item=document.createElement('article');item.className='preview-item';const icon=document.createElement('span');icon.className='preview-symbol';icon.textContent=symbol;const text=document.createElement('div');const heading=document.createElement('h3');heading.textContent=title;const meta=document.createElement('p');meta.textContent=location;const label=document.createElement('span');label.className='tag';label.textContent=tag;text.append(heading,meta,label);item.append(icon,text);content.append(item);});}
$$('[data-preview]').forEach((b,i)=>{b.addEventListener('click',()=>selectFeature(b.dataset.preview));b.addEventListener('keydown',e=>{const tabs=$$('[data-preview]');let next;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(i+1)%tabs.length;if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();selectFeature(tabs[next].dataset.preview,true);}});});
$$('[data-select]').forEach(a=>a.addEventListener('click',()=>selectFeature(a.dataset.select)));selectFeature('help');

const sectionLinks=$$('.desktop-nav a,#navigation nav a');
const sectionDestinations=$$('#home,#community,#how,#trust,#compare,#beyond,#questions');
let previousFocus;
function openDialog(dialog){previousFocus=document.activeElement;dialog.showModal();world?.setPaused(true);}
function closeDialog(dialog){dialog.close();world?.setPaused(paused);previousFocus?.focus();}
$$('dialog').forEach(d=>{d.querySelector('[data-close]').addEventListener('click',()=>closeDialog(d));d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d);}});d.addEventListener('close',()=>{world?.setPaused(paused);$('#menu-toggle').setAttribute('aria-expanded','false');if(d.id==='video-dialog')$('#video-frame').removeAttribute('src');});});
$('#menu-toggle').addEventListener('click',()=>{openDialog($('#navigation'));$('#menu-toggle').setAttribute('aria-expanded','true');});
$$('#navigation a').forEach(a=>a.addEventListener('click',()=>closeDialog($('#navigation'))));
let demoNavigationTimer;
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{
 const f=$('#demo-frame');const tab=b.dataset.demo||'community';
 if(!f.getAttribute('src'))f.src=f.dataset.src;
 if($('#navigation').open)closeDialog($('#navigation'));openDialog($('#demo-dialog'));clearTimeout(demoNavigationTimer);
 let attempts=0;function navigate(){if(!$('#demo-dialog').open)return;try{if(f.contentWindow?.__beaconDemoReady){f.contentWindow.switchTab(tab);return;}}catch{}
 if(++attempts<100)demoNavigationTimer=setTimeout(navigate,100);}
 navigate();
}));
// Existing same-origin demo remains intact, with its introductory overlay dismissed
// and its duplicate roaming mascot suppressed only inside the homepage dialog.
$('#demo-frame').addEventListener('load',()=>{try{const doc=$('#demo-frame').contentDocument;const style=doc.createElement('style');style.textContent='#bav-root,#bav-toggle,#bav-popover,#bav-chat{display:none!important}';doc.head.append(style);const skip=[...doc.querySelectorAll('button')].find(b=>b.textContent.trim().startsWith('Skip'));skip?.click();}catch{/* The demo also supports opening as a standalone page. */}});
$$('[data-video]').forEach(b=>b.addEventListener('click',()=>{$('#video-frame').src='https://www.youtube-nocookie.com/embed/md8suH2LcHs?autoplay=1&rel=0';openDialog($('#video-dialog'));}));
window.openSimDemo=()=>$$('[data-demo]')[0].click();window.closeSimDemo=()=>closeDialog($('#demo-dialog'));
function toggleMotion(){paused=!paused;window._bavPaused=paused;document.body.classList.toggle("motion-paused",paused);world?.setPaused(paused);$('#motion-toggle').textContent=paused?'Resume background motion':'Pause background motion';$('#motion-toggle').setAttribute('aria-pressed',String(paused));$('#footer-motion').textContent=paused?'Resume background motion':'Pause background motion';}
function syncMotionControls(){document.body.classList.toggle('motion-paused',paused);$('#motion-toggle').textContent=paused?'Resume background motion':'Pause background motion';$('#motion-toggle').setAttribute('aria-pressed',String(paused));$('#footer-motion').textContent=paused?'Resume background motion':'Pause background motion';}
syncMotionControls();
$('#motion-toggle').addEventListener('click',toggleMotion);$('#footer-motion').addEventListener('click',toggleMotion);
reduce.addEventListener('change',e=>{if(world){world.reduced=e.matches;world.lastFrame=0;}paused=e.matches;window._bavPaused=e.matches;document.body.classList.toggle("motion-paused",e.matches);$('#motion-toggle').setAttribute('aria-pressed',String(paused));world?.setPaused(paused);syncMotionControls();});
$('#theme-toggle').addEventListener('click',()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';$('#theme-toggle').textContent=dark?'Switch to day':'Switch to night';try{localStorage.setItem('beacon-theme',dark?'dark':'light');}catch{}});
try{if(localStorage.getItem('beacon-theme')==='dark'){$('#theme-toggle').click();}}catch{}
$('#year').textContent=new Date().getFullYear();
const chapters=$$('.chapter');let scrollScheduled=false;
function scrollUpdate(){scrollScheduled=false;let current='home';sectionDestinations.forEach(section=>{if(section.getBoundingClientRect().top<innerHeight*.35)current=section.id;});sectionLinks.forEach(a=>{if(a.getAttribute('href')==='#'+current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});const y=scrollY;$('.site-header').classList.toggle('scrolled',y>60);const past=y>$('#story-end').offsetTop-innerHeight*.6;document.body.classList.toggle('past-story',past);let active=0;chapters.forEach((s,i)=>{const rect=s.getBoundingClientRect();if(rect.top<innerHeight*.4)active=i;const copy=s.querySelector('.chapter-copy');if(!reduce.matches&&innerWidth>700){const offset=Math.max(-30,Math.min(30,-rect.top*.06));copy.style.transform=`translateY(${offset}px)`;}});$$('#chapter-progress a').forEach((a,i)=>{a.classList.toggle('active',i===active);if(i===active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});$('#chapter-number').textContent=`0${active+1} / 05`;document.body.classList.toggle('footer-visible',$('.site-footer').getBoundingClientRect().top<innerHeight-100);}
addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(scrollUpdate);}},{passive:true});scrollUpdate();

// Original mascot physics owns drag, throw, blink and double-click/tap behavior.
const mascot=$('#bav-wrap');mascot.setAttribute('role','button');mascot.tabIndex=$('#beacon-hide').getAttribute('aria-expanded')==='true'?0:-1;mascot.setAttribute('aria-label','Ask Beacon. Click or tap to chat, or drag to play.');
$('#bav-chat-input').setAttribute('aria-label','Message Beacon');$('#bav-chat-body').setAttribute('aria-live','polite');
$('#beacon-chat-button').addEventListener('click',()=>window.__bavOpenChat?.());
mascot.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.__bavOpenChat?.();}});
$('#beacon-hide').addEventListener('click',()=>window.__bavTogglePresence?.());
// Reuse the actual mascot artwork for the chat avatar, with unique SVG definition IDs.
const avatar=$('#bav-svg').cloneNode(true);const ids=new Map();[avatar,...avatar.querySelectorAll('[id]')].forEach(el=>{if(el.id){ids.set(el.id,'chat-'+el.id);el.id='chat-'+el.id;}});
[avatar,...avatar.querySelectorAll('*')].forEach(el=>{for(const attr of [...el.attributes]){let value=attr.value;ids.forEach((next,old)=>{value=value.replaceAll('url(#'+old+')','url(#'+next+')');if(value==='#'+old)value='#'+next;});if(value!==attr.value)el.setAttribute(attr.name,value);}});avatar.setAttribute('aria-hidden','true');$('#bav-chat-avatar').replaceChildren(avatar);

// Reveal by line, with native scrolling and readable content when scripting is unavailable.
const revealObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');revealObserver.unobserve(e.target);}});},{threshold:.08});
$$('.chapter-copy,.story-signal,.section-heading,.how-steps article,.platform-explained article,.organisation-types article,.compare-row,.beyond-layout,.trust-layout').forEach(el=>{el.classList.add('motion-reveal');revealObserver.observe(el);});
// Pointer light follows the visitor; touch devices retain their authored composition.
addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduce.matches)return;document.documentElement.style.setProperty('--pointer-x',`${e.clientX/innerWidth*100}%`);document.documentElement.style.setProperty('--pointer-y',`${e.clientY/innerHeight*100}%`);},{passive:true});

import './pillars.css';
import './pillars.js';

function showSpaceFallback(){
 const stage=$('.space-stage');stage.classList.add('space-fallback');
 const copy={neighbours:['AT HOME','A request. Someone nearby.','An older neighbour asks for company for a hospital appointment. Another neighbour offers support. A second example shows help with groceries for a wheelchair user.'],school:['SCHOOL CONCEPT','Every classroom. One connected school.','Classroom nodes illustrate how announcements and shared resources could connect a school. This is a concept, not an available classroom-management product.'],office:['WORKPLACE CONCEPT','A shared space. A shared purpose.','Colleagues coordinate a small community collection. This illustrative concept is available to discuss through the organisation enquiry link.']};
 function choose(name){const c=copy[name];$('#space-label').textContent=c[0];$('#space-title').textContent=c[1];$('#space-copy').textContent=c[2];$('.space-example').textContent='3D preview unavailable on this device. These text scenarios are illustrative, not live activity.';$$('[data-space]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.space===name)));}
 $$('[data-space]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.space)));choose('neighbours');
}
const spacesObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){import('./spaces.js').catch(showSpaceFallback);spacesObserver.disconnect();}},{rootMargin:'400px'});spacesObserver.observe(document.querySelector('.community-spaces'));

import './cursor.js';

import './night.css';

import './refinement.css';
