// FITS image decoding and TAN-SIP sky registration. No invented sky pixels.
export function parseFits(buffer) {
 const bytes=new Uint8Array(buffer), view=new DataView(buffer), decoder=new TextDecoder('ascii');let pos=0,result=null;
 while(pos+80<=bytes.length){
  const h={};let ended=false;
  while(pos+80<=bytes.length){const card=decoder.decode(bytes.subarray(pos,pos+80));pos+=80;let key=card.slice(0,8).trim();if(key==='END'){ended=true;break;}let raw;if(key==='HIERARCH'){const eq=card.indexOf('=',8);if(eq<0)continue;key=card.slice(8,eq).trim();raw=card.slice(eq+1).trim();}else{if(card.slice(8,10)!=='= ')continue;raw=card.slice(10).trim();}h[key]=raw.startsWith("'")?raw.slice(1,raw.indexOf("'",1)).trim():Number(raw.split('/')[0].trim().replace(/D/g,'E'));}
  if(!ended)throw Error('Incomplete FITS header.');pos=Math.ceil(pos/2880)*2880;
  const axes=h.NAXIS||0;let count=axes?1:0;for(let j=1;j<=axes;j++)count*=h['NAXIS'+j];
  const size=count*Math.abs(h.BITPIX)/8+(h.PCOUNT||0);
  if(pos+size>bytes.length)throw Error('Incomplete FITS image.');
  if(axes===2 && (h.EXTNAME==='IMAGE'||(!h.XTENSION&&h.NAXIS1))){
   if(!String(h.CTYPE1).includes('TAN'))throw Error('This image uses an unsupported sky projection. Download the FITS file to inspect it.');
   const data=new Float32Array(count), step=Math.abs(h.BITPIX)/8;
   const readers={'-32':'getFloat32','-64':'getFloat64','16':'getInt16','32':'getInt32','8':'getUint8'};const read=readers[h.BITPIX];if(!read)throw Error('Unsupported FITS pixel encoding.');
   for(let i=0;i<count;i++){let v=view[read](pos+i*step,false);data[i]=(h.BITPIX>0&&v===h.BLANK)?NaN:v*(h.BSCALE??1)+(h.BZERO??0);}
   result={h,data,width:h.NAXIS1,height:h.NAXIS2};
  }
  if(result && h.EXTNAME==='FLAGS' && axes===2){
   const flags=new Int32Array(count);for(let i=0;i<count;i++)flags[i]=view.getInt32(pos+i*4,false);result.flags=flags;
  }
  if(result && h.EXTNAME==='WCS-WAVE' && h.XTENSION==='BINTABLE'){
   const columns={};let offset=0;
   for(let j=1;j<=h.TFIELDS;j++){
    const format=String(h['TFORM'+j]).match(/^(\d*)([JEDIB])/),length=Number(format?.[1]||1),type=format?.[2];
    const width={J:4,E:4,D:8,I:2,B:1}[type];if(!width)throw Error('Unsupported wavelength-table format.');
    const read={J:'getInt32',E:'getFloat32',D:'getFloat64',I:'getInt16',B:'getUint8'}[type];
    const values=Array.from({length},(_,i)=>view[read](pos+offset+i*width,false));columns[h['TTYPE'+j]]=values;offset+=length*width;
   }
   result.wave=columns;
  }
  pos+=Math.ceil(size/2880)*2880;
 }
 if(result)return result;throw Error('No science image found in this FITS file.');
}
export function wavelengthAt(image,x,y){
 if(!image.wave)return [NaN,NaN];const h=image.h,w=image.wave;
 const px=(x+1-h.CRPIX1W)*(h.CDELT1W??1)+h.CRVAL1W,py=(y+1-h.CRPIX2W)*(h.CDELT2W??1)+h.CRVAL2W;
 const bracket=(a,v)=>{let i=0;while(i<a.length-2&&v>a[i+1])i++;return [i,Math.max(0,Math.min(1,(v-a[i])/(a[i+1]-a[i])))];};
 if(px<w.X[0]||px>w.X.at(-1)||py<w.Y[0]||py>w.Y.at(-1))return [NaN,NaN];
 const [ix,dx]=bracket(w.X,px),[iy,dy]=bracket(w.Y,py),nx=w.X.length;
 return [0,1].map(k=>{const sample=(x,y)=>w.VALUES[(y*nx+x)*2+k];return sample(ix,iy)*(1-dx)*(1-dy)+sample(ix+1,iy)*dx*(1-dy)+sample(ix,iy+1)*(1-dx)*dy+sample(ix+1,iy+1)*dx*dy;});
}
export function spectralProject(image,ra,dec,fov,n=280){
 const values=project(image,ra,dec,fov,n),wavelength=new Float32Array(n*n),bandwidth=new Float32Array(n*n),flags=new Int32Array(n*n);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x,world=outputToWorld(x,y,n,ra,dec,fov),[px,py]=worldToPixel(image.h,...world);const [wave,bw]=wavelengthAt(image,px,py);wavelength[i]=wave;bandwidth[i]=bw;const ix=Math.round(px),iy=Math.round(py);flags[i]=image.flags&&ix>=0&&iy>=0&&ix<image.width&&iy<image.height?image.flags[iy*image.width+ix]:-1;}
 return {values,wavelength,bandwidth,flags,n};
}
const rad=Math.PI/180;
function poly(h,p,u,v){let sum=0;for(let i=0;i<=(h[p+'_ORDER']||0);i++)for(let j=0;j<=(h[p+'_ORDER']||0)-i;j++)sum+=(h[`${p}_${i}_${j}`]||0)*u**i*v**j;return sum;}
export function worldToPixel(h,ra,dec){
 const a=ra*rad,d=dec*rad,a0=h.CRVAL1*rad,d0=h.CRVAL2*rad;
 const den=Math.sin(d)*Math.sin(d0)+Math.cos(d)*Math.cos(d0)*Math.cos(a-a0);
 if(den<=0)return [NaN,NaN];
 const x=Math.cos(d)*Math.sin(a-a0)/den/rad,y=(Math.sin(d)*Math.cos(d0)-Math.cos(d)*Math.sin(d0)*Math.cos(a-a0))/den/rad;
 const aa=h.CD1_1??((h.PC1_1??1)*(h.CDELT1??1)),b=h.CD1_2??((h.PC1_2??0)*(h.CDELT1??1)),c=h.CD2_1??((h.PC2_1??0)*(h.CDELT2??1)),dd=h.CD2_2??((h.PC2_2??1)*(h.CDELT2??1)),det=aa*dd-b*c;
 const U=(dd*x-b*y)/det,V=(-c*x+aa*y)/det;let u=U,v=V;
 for(let k=0;k<12;k++){const nu=U-poly(h,'A',u,v),nv=V-poly(h,'B',u,v);if(Math.abs(nu-u)+Math.abs(nv-v)<1e-7){u=nu;v=nv;break;}u=nu;v=nv;}
 return [u+h.CRPIX1-1,v+h.CRPIX2-1];
}
export function outputToWorld(x,y,n,ra,dec,fov){
 const xi=-(x/(n-1)-.5)*fov*rad,eta=-(y/(n-1)-.5)*fov*rad,d=dec*rad;
 const a=Math.atan2(xi,Math.cos(d)-eta*Math.sin(d))+ra*rad;
 const b=Math.atan2(Math.sin(d)+eta*Math.cos(d),Math.sqrt((Math.cos(d)-eta*Math.sin(d))**2+xi*xi));
 return [(a/rad+360)%360,b/rad];
}
export function project(image,ra,dec,fov,n=360){
 const out=new Float32Array(n*n);out.fill(NaN);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const world=outputToWorld(x,y,n,ra,dec,fov),[px,py]=worldToPixel(image.h,...world),ix=Math.floor(px),iy=Math.floor(py);
  if(ix<0||iy<0||ix>=image.width-1||iy>=image.height-1)continue;
  const dx=px-ix,dy=py-iy,i=iy*image.width+ix;
  out[y*n+x]=image.data[i]*(1-dx)*(1-dy)+image.data[i+1]*dx*(1-dy)+image.data[i+image.width]*(1-dx)*dy+image.data[i+image.width+1]*dx*dy;
 }
 return out;
}
export function limits(arrays){const s=[];for(const a of arrays)for(let i=0;i<a.length;i+=3)if(Number.isFinite(a[i]))s.push(a[i]);s.sort((a,b)=>a-b);if(!s.length)throw Error('No valid pixels cover this field. Try another observation or smaller field.');return [s[Math.floor(s.length*.02)],s[Math.floor(s.length*.995)]];}
export function paint(data,n,lo,hi,gain=1){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=n;const ctx=canvas.getContext('2d'),im=ctx.createImageData(n,n);
 for(let i=0;i<data.length;i++){const valid=Number.isFinite(data[i]),v=valid?Math.max(0,Math.min(1,Math.asinh(Math.max(0,(data[i]-lo)/(hi-lo||1))*12*gain)/Math.asinh(12))):0;
  im.data[i*4]=valid?Math.round(v*232):8;im.data[i*4+1]=valid?Math.round(v*243):18;im.data[i*4+2]=valid?Math.round(v*250):24;im.data[i*4+3]=255;
 }ctx.putImageData(im,0,0);return canvas;
}
