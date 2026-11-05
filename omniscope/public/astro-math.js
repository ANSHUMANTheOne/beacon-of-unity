export const OBLIQUITY=23.439291111*Math.PI/180;
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>Math.hypot(...a),scale=(a,s)=>a.map(v=>v*s);
export function equatorialToScene(ra,dec,radius=1){const a=ra*Math.PI/180,d=dec*Math.PI/180,x=Math.cos(d)*Math.cos(a),y=Math.cos(d)*Math.sin(a),z=Math.sin(d),ey=y*Math.cos(OBLIQUITY)+z*Math.sin(OBLIQUITY),ez=-y*Math.sin(OBLIQUITY)+z*Math.cos(OBLIQUITY);return [x*radius,ez*radius,-ey*radius];}
export function sceneToEquatorial([x,y,z]){const ey=-z,ez=y,qy=ey*Math.cos(OBLIQUITY)-ez*Math.sin(OBLIQUITY),qz=ey*Math.sin(OBLIQUITY)+ez*Math.cos(OBLIQUITY);return [(Math.atan2(qy,x)*180/Math.PI+360)%360,Math.atan2(qz,Math.hypot(x,qy))*180/Math.PI];}
export const eclipticToScene=(r,scale=12)=>[r[0]*scale,r[2]*scale,-r[1]*scale];
export function osculatingOrbit(position,velocity){
 const mu=0.0002959122082855911,r=norm(position),v2=dot(velocity,velocity),rv=dot(position,velocity),a=1/(2/r-v2/mu);
 const evec=position.map((x,i)=>((v2-mu/r)*x-rv*velocity[i])/mu),e=norm(evec),p=e>1e-9?scale(evec,1/e):scale(position,1/r),h=cross(position,velocity),q=cross(scale(h,1/norm(h)),p);
 const E0=Math.atan2(dot(position,q)/(a*Math.sqrt(1-e*e)),dot(position,p)/a+e),M0=E0-e*Math.sin(E0),n=Math.sqrt(mu/a**3);
 return {a,e,p,q,M0,n};
}
export function orbitPosition(orbit,days){const {a,e,p,q,M0,n}=orbit,M=M0+n*days;let E=M;for(let j=0;j<10;j++){const d=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));E-=d;if(Math.abs(d)<1e-12)break;}return p.map((x,i)=>a*(Math.cos(E)-e)*x+a*Math.sqrt(1-e*e)*Math.sin(E)*q[i]);}
export function orbitPoints(orbit,count=256){return Array.from({length:count+1},(_,i)=>{const E=i/count*Math.PI*2;return orbit.p.map((x,j)=>orbit.a*(Math.cos(E)-orbit.e)*x+orbit.a*Math.sqrt(1-orbit.e**2)*Math.sin(E)*orbit.q[j]);});}
