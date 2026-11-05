import './cursor.css';
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
const contrast=matchMedia('(forced-colors: active)');
const root=document.documentElement;
let enabled=true;
try{enabled=localStorage.getItem('beacon-cursor')!=='standard';}catch{}
const orb=document.createElement('div');
orb.id='beacon-orbit';orb.setAttribute('aria-hidden','true');orb.setAttribute('popover','manual');
orb.innerHTML='<span class="orbit-trail"></span><span class="orbit-shell"><i></i><i></i></span>';
document.body.append(orb);
const toggle=document.createElement('button');toggle.id='cursor-toggle';
const active=()=>finePointer.matches&&enabled&&!contrast.matches&&typeof orb.showPopover==='function';
function hide(){root.classList.remove('beacon-cursor-ready');orb.classList.remove('visible','pressed');resetTrail();}
function update(){root.classList.toggle('beacon-cursor',active());toggle.textContent=enabled?'Use standard cursor':'Use Beacon cursor';hide();}
toggle.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem('beacon-cursor',enabled?'beacon':'standard');}catch{}update();});
document.querySelector('.menu-bottom')?.append(toggle);
finePointer.addEventListener('change',update);contrast.addEventListener('change',update);
const trail=orb.querySelector('.orbit-trail');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let trailX=0,trailY=0,aimX=0,aimY=0,trailFrame=0,trailTime=0,trailStarted=false;
function resetTrail(){cancelAnimationFrame(trailFrame);trailFrame=0;trailStarted=false;trail.style.transform='translate3d(0,0,0)';}
function animateTrail(now){
 const dt=Math.min(40,now-trailTime);trailTime=now;
 const blend=1-Math.exp(-dt/65);
 trailX+=(aimX-trailX)*blend;trailY+=(aimY-trailY)*blend;
 const dx=trailX-aimX,dy=trailY-aimY;
 trail.style.transform=`translate3d(${dx}px,${dy}px,0)`;
 if(Math.hypot(dx,dy)>.15)trailFrame=requestAnimationFrame(animateTrail);
 else{trailFrame=0;trail.style.transform='translate3d(0,0,0)';}
}
function followTrail(x,y){
 aimX=x;aimY=y;
 if(!trailStarted||reducedMotion.matches){trailX=x;trailY=y;trailStarted=true;}
 // Bound separation so fast movements never leave a detached ring across the page.
 const distance=Math.hypot(trailX-x,trailY-y);
 if(distance>42){trailX=x+(trailX-x)*42/distance;trailY=y+(trailY-y)*42/distance;}
 trail.style.transform=`translate3d(${trailX-x}px,${trailY-y}px,0)`;
 if(!trailFrame&&!reducedMotion.matches){trailTime=performance.now();trailFrame=requestAnimationFrame(animateTrail);}
}
reducedMotion.addEventListener('change',resetTrail);
let topDialog=null;
let lastPosition=null;
function move(e){
 if(!active()||e.pointerType==='touch'){hide();return;}
 const target=e.target instanceof Element?e.target:null;
 if(!target){hide();return;}
 lastPosition={x:e.clientX,y:e.clientY};
 const world=target.closest('#unity-canvas');
 const native=target.closest('iframe,select,input,textarea,[contenteditable=true],#bav-wrap,[disabled],[aria-disabled=true],[aria-busy=true]');
 if(native){orb.classList.remove('visible','pressed');resetTrail();return;}
 const dialog=target.closest('dialog[open]');
 if(dialog!==topDialog){if(orb.matches(':popover-open'))orb.hidePopover();topDialog=dialog;}
 try{if(!orb.matches(':popover-open'))orb.showPopover();}catch{hide();return;}
 followTrail(e.clientX,e.clientY);
 orb.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0)`;
 orb.classList.add('visible');
 orb.classList.toggle('world-drag',!!world);
 root.classList.add('beacon-cursor-ready');
 orb.classList.toggle('clickable',!!target.closest('a,button,summary,[role=button],label[for]'));
}
document.addEventListener('pointermove',move,{passive:true,capture:true});
document.addEventListener('pointerover',move,{passive:true,capture:true});
document.addEventListener('pointerdown',e=>{move(e);if(e.button===0)orb.classList.add('pressed');},{passive:true});
window.addEventListener('pointerup',()=>orb.classList.remove('pressed'),{passive:true});
window.addEventListener('pointercancel',hide);window.addEventListener('blur',hide);
document.documentElement.addEventListener('pointerleave',hide);
document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});
let scrollFrame=0;
document.addEventListener('scroll',()=>{if(!lastPosition||scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;const {x,y}=lastPosition;move({target:document.elementFromPoint(x,y),clientX:x,clientY:y,pointerType:'mouse'});});},{passive:true,capture:true});
update();
