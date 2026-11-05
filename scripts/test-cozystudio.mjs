import assert from 'node:assert/strict';
import {Player,colorAt,TYPES} from '../projects/CozyStudio/js/animations.js';
import {Presets} from '../projects/CozyStudio/js/presets.js';
let clock=100;
Object.defineProperty(globalThis,'performance',{value:{now:()=>clock},configurable:true});
let nextId=0;
globalThis.requestAnimationFrame=()=>++nextId;
globalThis.cancelAnimationFrame=()=>{};
const animation={type:'strobe',colors:['#ff0000','#0000ff'],speed:60,dir:1,brightness:100};
const frames=[];
const player=new Player(t=>frames.push(colorAt(animation,t,.5)));
player.play();
player.loop(99);
assert.equal(player.t,0,'A first frame timestamp before performance.now() must not make elapsed time negative');
player.loop(116);
assert.ok(Math.abs(player.t-.016)<1e-10,'Elapsed time remains monotonic');
player.pause();const count=frames.length;player.loop(180);assert.equal(frames.length,count);
clock=200;player.play();player.loop(199);player.loop(216);assert.ok(Math.abs(player.t-.032)<1e-10);
player.stop();assert.equal(player.t,0);assert.equal(player.run,false);
let combinations=0;
for(const type of Object.keys(TYPES))for(const t of [0,.01,1,20])for(const position of [0,.5,1])for(const dir of [-1,1]){
 const color=colorAt({...animation,type,dir},t,position);
 assert.equal(color.length,3);assert.ok(color.every(value=>Number.isFinite(value)&&value>=0&&value<=255));combinations++;
}


const presets=new Presets();
for(const value of [0,'0','0.0']) {
 const count=presets.import(JSON.stringify({presets:[{name:'zero',anim:{type:'solid',colors:['#000000'],speed:value,brightness:value,dir:1}}]}));
 assert.equal(count,1);
 assert.equal(presets.l.at(-1).anim.speed,0,'Imported zero speed must round-trip');
 assert.equal(presets.l.at(-1).anim.brightness,0,'Imported zero brightness must stay off');
}
for(const value of [null,'',false,'not-a-number']) {
 presets.import(JSON.stringify({presets:[{name:'invalid',anim:{type:'solid',colors:['#000000'],speed:value,brightness:value,dir:1}}]}));
 assert.equal(presets.l.at(-1).anim.speed,50);
 assert.equal(presets.l.at(-1).anim.brightness,100);
}
console.log(JSON.stringify({passed:true,animationCombinations:combinations,presetCases:7,checks:'first-frame timing, pause/resume, stop, finite RGB outputs and preset round trips; no Bluetooth writes'}));
