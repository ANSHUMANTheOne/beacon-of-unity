// hw: 'stream' = expressible as one colour over time (works on a single-zone controller);
//     'preview' = needs per-pixel addressing (NOT confirmed) -> browser preview only.
export const TYPES={
  solid:{label:'Solid colour',hw:'stream'},gradient:{label:'Gradient (2+ colours)',hw:'preview'},
  rainbow:{label:'Rainbow cycle',hw:'stream'},fade:{label:'Colour loop (smooth flow through your palette)',hw:'stream'},strobe:{label:'Strobe (palette colours flash in turn)',hw:'stream'},
  wave:{label:'Colour wave',hw:'preview'},alternating:{label:'Alternating colours',hw:'stream'},
  running:{label:'Running gradient',hw:'preview'},bounce:{label:'Bouncing colour',hw:'preview'},
  meteor:{label:'Meteor trail',hw:'preview'},keyframe:{label:'Keyframes (hold + ease)',hw:'stream'}};
export const hexToRgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)||0);
const mix=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*k);
const cyc=(cs,x)=>{const n=cs.length;x=(((x%1)+1)%1)*n;const i=Math.floor(x);return mix(cs[i],cs[(i+1)%n],x-i)};
const lin=(cs,x)=>{if(cs.length<2)return cs[0];x=Math.min(.9999,Math.max(0,x))*(cs.length-1);const i=Math.floor(x);return mix(cs[i],cs[i+1],x-i)};
const hsv=h=>{h=(((h%1)+1)%1)*6;const i=Math.floor(h),f=h-i;return[[1,f,0],[1-f,1,0],[0,1,f],[0,1-f,1],[f,0,1],[1,0,1-f]][i].map(v=>v*255)};
// colour of animation `a` at time t (s) and position p (0..1 along the bar)
export function colorAt(a,t,p){
  const cs=a.colors.map(hexToRgb),n=cs.length,d=a.dir<0?-1:1,ph=t*(.05+a.speed/100*.6),bg=cs[1]||[0,0,0];let c;
  switch(a.type){
    case'gradient':c=lin(cs,p);break;
    case'rainbow':c=hsv(p*.5-d*ph);break;
    case'fade':c=cyc(cs,ph*d);break;
    case'strobe':{const f=t*(.5+a.speed/100*3),i=Math.floor(f)%n;c=f%1<.5?cs[i]:[0,0,0];break}
    case'wave':c=mix(cs[0],bg,(Math.sin(6.283*(p*1.5-d*ph))+1)/2);break;
    case'alternating':c=cs[(Math.floor(p*6)+Math.floor(ph*4))%n];break;
    case'running':c=cyc(cs,p-d*ph);break;
    case'bounce':{let b=1-Math.abs((ph*2)%2-1);if(d<0)b=1-b;c=mix(bg,cs[0],Math.max(0,1-Math.abs(p-b)*7));break}
    case'meteor':{const h=(((ph*d)%1)+1)%1,s=(((h-p)*d)%1+1)%1;c=mix(bg,cs[0],s<.35?Math.pow(1-s/.35,2):0);break}
    case'keyframe':{const s=ph*n,i=Math.floor(s)%n;let k=Math.min(1,Math.max(0,(s%1-.7)/.3));k=k*k*(3-2*k);c=mix(cs[i],cs[(i+1)%n],k);break}
    default:c=cs[0];
  }
  return c.map(v=>Math.round(v*a.brightness/100));
}
// rAF loop that only runs while playing (zero CPU when paused/stopped)
export class Player{
  constructor(fn){this.fn=fn;this.t=0;this.run=false;this.raf=0;this.last=0}
  loop=ts=>{if(!this.run)return;this.t+=(ts-this.last)/1000;this.last=ts;this.fn(this.t);this.raf=requestAnimationFrame(this.loop)};
  play(){if(this.run)return;this.run=true;this.last=performance.now();this.raf=requestAnimationFrame(this.loop)}
  pause(){this.run=false;cancelAnimationFrame(this.raf)}
  stop(){this.pause();this.t=0;this.fn(0)}
  redraw(){if(!this.run)this.fn(this.t)}
}
