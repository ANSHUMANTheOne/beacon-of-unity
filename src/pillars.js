const gallery=document.querySelector('.pillar-gallery');
const cards=[...gallery.querySelectorAll('.pillar-card')];
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let pending=false;
function update(){pending=false;const rect=gallery.getBoundingClientRect();const enabled=!motion.matches&&!document.body.classList.contains('motion-paused')&&innerWidth>550;const progress=Math.max(-1,Math.min(1,(innerHeight/2-rect.top-rect.height/2)/innerHeight));cards.forEach((card,i)=>card.style.setProperty('--offset',enabled?`${progress*(i%2? -58:58)}px`:'0px'));}
addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);motion.addEventListener('change',update);update();
