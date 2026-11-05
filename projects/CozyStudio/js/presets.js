const K='cozystudio.presets.v1';
const mk=(name,type,colors,speed=50)=>({name,anim:{type,colors,speed,dir:1,brightness:100}});
const DEF=[mk('Red/blue strobe','strobe',['#ff0000','#0000ff'],60),mk('Red-orange-yellow loop','fade',['#ff0000','#ff7a00','#ffe600'],40),mk('Neon rainbow','rainbow',['#ff0040','#00c8ff']),mk('Violet meteor','meteor',['#8a5cff','#05060a'],60),
  mk('Ocean wave','wave',['#00c8ff','#1a2cff'],40),mk('Ember fade','fade',['#ff3b00','#ffb000','#3a0010'],30)];
export class Presets{
  constructor(){try{this.l=JSON.parse(localStorage.getItem(K));if(!Array.isArray(this.l)||!this.l.length)throw 0}catch{this.l=structuredClone(DEF)}}
  save(){try{localStorage.setItem(K,JSON.stringify(this.l))}catch{}}
  add(name,a){this.l.push({name,anim:structuredClone(a)});this.save()}
  ren(i,n){this.l[i].name=n;this.save()}
  dup(i){this.l.splice(i+1,0,{name:this.l[i].name+' copy',anim:structuredClone(this.l[i].anim)});this.save()}
  del(i){this.l.splice(i,1);this.save()}
  export(){return JSON.stringify({app:'CozyStudio',v:1,presets:this.l},null,2)}
  import(text){const d=JSON.parse(text),L=Array.isArray(d)?d:d.presets;if(!Array.isArray(L))throw new Error('No presets array found');
    const ok=L.filter(p=>p&&typeof p.name==='string'&&p.anim&&typeof p.anim.type==='string'&&Array.isArray(p.anim.colors)&&p.anim.colors.length&&p.anim.colors.every(c=>/^#[0-9a-f]{6}$/i.test(c)))
      .map(p=>({name:p.name.slice(0,60),anim:{type:p.anim.type,colors:p.anim.colors.slice(0,12),speed:+p.anim.speed||50,dir:p.anim.dir<0?-1:1,brightness:+p.anim.brightness||100}}));
    this.l.push(...ok);this.save();return ok.length}
}
