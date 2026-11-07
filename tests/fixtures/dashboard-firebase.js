// Browser-only test double. Served by the test router, never by the production artifact.
const state=window.__dashboardFixture ||= (()=>{
 const now=Date.now(),stamp=ms=>({seconds:Math.floor(ms/1000),toDate:()=>new Date(ms)});
 const user={uid:'member-a',email:'member-a@example.test'};
 const data=new Map(Object.entries({
  'users/member-a':{fullName:'Test Neighbour',region:'Sharjah',userLat:25.3463,userLng:55.4209,leaderboardPoints:0,equippedSkin:'ocean'},
  'users/member-b':{fullName:'Other Neighbour',region:'Sharjah',leaderboardPoints:0},
  'requests/live-request':{title:'Help with groceries',description:'A real visible test request',category:'Food',location:'Sharjah',region:'Sharjah',userId:'member-b',userName:'Other Neighbour',createdAt:stamp(now),lat:25.347,lng:55.421,volunteers:[]},
  'requests/other-region':{title:'Another emirate',category:'Food',region:'Dubai',createdAt:stamp(now),lat:25.2,lng:55.3},
  'lostfound/expired-item':{item:'Expired phantom',type:'Found',region:'Sharjah',createdAt:stamp(now-40*86400000),lat:25.345,lng:55.422},
  'lostfound/current-item':{item:'Visible keys',type:'Found',description:'Keys',location:'Sharjah',region:'Sharjah',userId:'member-b',userName:'Other Neighbour',createdAt:stamp(now),lat:25.348,lng:55.423},
  'chats/member-a_member-b_live-request':{participants:['member-a','member-b'],itemLabel:'Help with groceries',chatType:'community',postOwnerId:'member-b',requestId:'live-request','unread_member-a':true,lastUpdated:stamp(now)},
  'chats/member-a_member-b_live-request/messages/first':{text:'Could you help?',senderId:'member-b',createdAt:stamp(now)},
  'notifications/old-read':{toUid:'member-a',title:'Old read notice',body:'Old',read:true,createdAt:stamp(now-40*86400000)},
  'notifications/new-unread':{toUid:'member-a',title:'New notification',body:'Unread',read:false,createdAt:stamp(now)},
  'notifications/other-user':{toUid:'member-b',title:'Other account notification',read:false,createdAt:stamp(now)}
 }));
 return {data,user,stamp,subscriptions:new Set(),writes:[],failDelete:false};
})();
function snapshot(path){const value=state.data.get(path);return {id:path.split('/').at(-1),exists:()=>!!value,data:()=>value?{...value}:undefined};}
function result(ref){
 if(ref.type==='doc')return snapshot(ref.path);
 let docs=[...state.data.keys()].filter(path=>path.startsWith(ref.path+'/')&&path.split('/').length===ref.path.split('/').length+1).map(snapshot);
 for(const c of ref.constraints||[]){if(c.type==='where')docs=docs.filter(d=>c.op==='array-contains'?d.data()[c.field]?.includes(c.value):d.data()[c.field]===c.value);if(c.type==='orderBy')docs.sort((a,b)=>((a.data()[c.field]?.seconds||0)-(b.data()[c.field]?.seconds||0))*(c.direction==='desc'?-1:1));}
 return {docs,forEach:fn=>docs.forEach(fn)};
}
function deliver(sub){
 if(!state.subscriptions.has(sub))return;
 const value=result(sub.ref);
 if(value.docs){const next=new Map(value.docs.map(d=>[d.id,JSON.stringify(d.data())]));const changes=[];for(const d of value.docs){if(sub.previous.get(d.id)!==next.get(d.id))changes.push({type:sub.previous.has(d.id)?'modified':'added',doc:d});}for(const id of sub.previous.keys())if(!next.has(id))changes.push({type:'removed',doc:{id,data:()=>({})}});sub.previous=next;value.docChanges=()=>changes;}
 sub.callback(value);
}
function emit(){for(const sub of [...state.subscriptions])queueMicrotask(()=>deliver(sub));}
export const initializeApp=()=>({});
export const getAuth=()=>({currentUser:state.user});
export const onAuthStateChanged=(auth,fn)=>{setTimeout(()=>fn(state.user),0);return ()=>{};};
export const signOut=async()=>{};
export const getFirestore=()=>({});
export const doc=(db,...parts)=>({type:'doc',path:parts.join('/')});
export const collection=(db,...parts)=>({type:'collection',path:parts.join('/')});
export const query=(ref,...constraints)=>({...ref,constraints});
export const where=(field,op,value)=>({type:'where',field,op,value});
export const orderBy=(field,direction='asc')=>({type:'orderBy',field,direction});
export const getDoc=async ref=>result(ref);
export const getDocs=async ref=>result(ref);
export const onSnapshot=(ref,callback)=>{const sub={ref,callback,previous:new Map()};state.subscriptions.add(sub);queueMicrotask(()=>deliver(sub));return ()=>state.subscriptions.delete(sub);};
export const serverTimestamp=()=>state.stamp(Date.now());
export const increment=value=>({increment:value});
export const arrayUnion=(...values)=>({arrayUnion:values});
export async function updateDoc(ref,patch){const data={...(state.data.get(ref.path)||{})};for(const [key,value] of Object.entries(patch))data[key]=value?.increment!==undefined?(data[key]||0)+value.increment:value?.arrayUnion?[...(data[key]||[]),...value.arrayUnion]:value;state.data.set(ref.path,data);state.writes.push({path:ref.path,operation:'update',patch});emit();}
export async function setDoc(ref,data){state.data.set(ref.path,{...(state.data.get(ref.path)||{}),...data});emit();}
export async function addDoc(ref,data){const id='generated-'+Date.now();state.data.set(ref.path+'/'+id,data);emit();return {id};}
export async function deleteDoc(ref){if(state.failDelete)throw new Error('permission-denied');state.data.delete(ref.path);state.writes.push({path:ref.path,operation:'delete'});emit();}
state.put=(path,data)=>{state.data.set(path,data);emit();};
state.remove=path=>{state.data.delete(path);emit();};
state.receive=()=>{const path='chats/member-a_member-b_live-request';state.data.set(path,{...state.data.get(path),'unread_member-a':true,lastUpdated:state.stamp(Date.now())});const msg=path+'/messages/message-'+Date.now();state.data.set(msg,{senderId:'member-b',text:'A new live message',createdAt:state.stamp(Date.now())});emit();};
