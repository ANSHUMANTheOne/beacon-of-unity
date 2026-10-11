// Protocol adapter. Frames below come from two community sources (wporter82/lotus-lamp-python PROTOCOL.md,
// l0lsec/LotusLampX). They are REPORTED, not verified on your CozyLady hardware. Swap this file to change protocol.
export const UUID={service:'0000fff0-0000-1000-8000-00805f9b34fb',write:'0000fff3-0000-1000-8000-00805f9b34fb',notify:'0000fff4-0000-1000-8000-00805f9b34fb'};
const c=(v,a=0,b=255)=>Math.max(a,Math.min(b,Math.round(+v||0)));
const fr=(len,cmd,p3,p4=255,p5=255,p6=255,p7=0)=>Uint8Array.of(0x7e,len,cmd,p3,p4,p5,p6,p7,0xef);
export const hexs=b=>[...b].map(x=>x.toString(16).padStart(2,'0')).join(' ').toUpperCase();
export const LotusE1={
  id:'lotus-e1',label:'LotusLamp X E1 (9-byte frames)',
  caps:{rgb:'reported',rgbw:'unknown',builtinEffects:'reported (mode 0-212, MELK-OA10 numbering)',pixels:'not supported (single zone reported)',power:'no documented bytes; "off" = black colour',ack:'none documented'},
  color:(r,g,b)=>fr(7,5,3,c(r),c(g),c(b),0x10),   // 7E 07 05 03 RR GG BB 10 EF
  brightness:p=>fr(7,1,c(p,0,100)),               // 7E 07 01 XX FF FF FF 00 EF (0-100; l0lsec says 0-255: conflict)
  speed:p=>fr(4,2,c(p,0,100)),                    // 7E 04 02 XX FF FF FF 00 EF
  mode:n=>fr(7,3,c(n))                            // 7E 07 03 XX FF FF FF 00 EF
};
// Returns an adapter only if the connected device really exposes the service and a writable characteristic.
export function detect(services){
  const s=services.find(x=>x.uuid===UUID.service),w=s&&s.chars.find(x=>x.uuid===UUID.write);
  return w&&(w.props.includes('write')||w.props.includes('writeWithoutResponse'))?{adapter:LotusE1,writeUuid:UUID.write}:null;
}
