import {UUID} from './protocol.js';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const tmo=(p,ms,m)=>Promise.race([p,new Promise((_,j)=>setTimeout(()=>j(new Error(m)),ms))]);
export class BLE extends EventTarget{
  constructor(){super();this.dev=null;this.chars=new Map();this.ok=new Set();this.q=[];this.busy=false;this.last=0;this.minGap=150;this.connected=false;this.nh=new Map()}
  emit(t,d){this.dispatchEvent(new CustomEvent(t,{detail:d}))}
  log(m){this.emit('log',new Date().toLocaleTimeString()+' '+m)}
  allow(u){this.ok=new Set(u)}  // only these characteristics may ever be written
  async connect({all,extra=[]}){
    if(!navigator.bluetooth)throw Object.assign(new Error('Web Bluetooth is unavailable. Use Chrome/Edge over HTTPS or localhost (iOS browsers are unsupported).'),{name:'Unsupported'});
    const optionalServices=[UUID.service,...extra];
    // acceptAllDevices lists every advertising device; GATT access is still limited to optionalServices.
    const o=all?{acceptAllDevices:true,optionalServices}:{filters:[{services:[UUID.service]},{namePrefix:'MELK'},{namePrefix:'ELK'}],optionalServices};
    this.log(all?'Chooser: all advertising devices':'Chooser: filtered (FFF0 / MELK / ELK)');
    const d=await navigator.bluetooth.requestDevice(o);
    if(this.dev)this.dev.removeEventListener('gattserverdisconnected',this.onDrop);
    this.dev=d;d.addEventListener('gattserverdisconnected',this.onDrop);
    await this.open();
  }
  onDrop=()=>{this.connected=false;this.q.splice(0).forEach(j=>j.res(false));this.emit('state','disconnected');this.log('Disconnected');this.emit('drop')};
  async open(){
    if(!this.dev)throw new Error('No device selected yet. Click Connect Lights.');
    this.emit('state','connecting');
    try{
      const s=await tmo(this.dev.gatt.connect(),12000,'Connection timed out');
      this.chars.clear();const out=[];let sv=[];
      try{sv=await s.getPrimaryServices()}catch(e){if(e.name!=='NotFoundError')throw e}
      for(const v of sv){const cs=await v.getCharacteristics();cs.forEach(c=>this.chars.set(c.uuid,c));
        out.push({uuid:v.uuid,chars:cs.map(c=>({uuid:c.uuid,props:Object.keys(c.properties).filter(k=>c.properties[k])}))})}
      this.connected=true;this.emit('state','connected');this.emit('services',out);this.log(`Connected, ${out.length} accessible service(s)`);
    }catch(e){this.connected=false;this.emit('state','disconnected');throw e}
  }
  disconnect(){this.q.splice(0).forEach(j=>j.res(false));if(this.dev&&this.dev.gatt.connected)this.dev.gatt.disconnect();else this.onDrop()}
  async read(u){const v=await this.chars.get(u).readValue();return new Uint8Array(v.buffer)}
  async notify(u,on){const c=this.chars.get(u);
    if(on){const h=e=>this.log('< notify '+u.slice(4,8)+': '+[...new Uint8Array(e.target.value.buffer)].map(x=>x.toString(16).padStart(2,'0')).join(' '));
      this.nh.set(u,h);c.addEventListener('characteristicvaluechanged',h);await c.startNotifications()}
    else{await c.stopNotifications();c.removeEventListener('characteristicvaluechanged',this.nh.get(u))}}
  // Queue: serialised, rate-limited, latest-wins per key (outdated frames are dropped and resolve false).
  send(uuid,bytes,key='cmd'){
    if(!this.connected)return Promise.reject(new Error('Not connected'));
    if(!this.ok.has(uuid))return Promise.reject(new Error('Refusing to write: characteristic not authorised'));
    return new Promise((res,rej)=>{this.q=this.q.filter(j=>j.key!==key||(j.res(false),false));this.q.push({uuid,bytes,key,res,rej});this.pump()});
  }
  async pump(){
    if(this.busy)return;this.busy=true;
    while(this.q.length&&this.connected){
      const j=this.q.shift(),w=this.minGap-(performance.now()-this.last);if(w>0)await sleep(w);
      if(!this.connected){j.res(false);break}
      try{const c=this.chars.get(j.uuid);c.properties.writeWithoutResponse?await c.writeValueWithoutResponse(j.bytes):await c.writeValue(j.bytes);this.last=performance.now();j.res(true)}
      catch(e){j.rej(e)}
    }
    this.busy=false;
  }
}
