import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {beginUpload,putPart,completeUpload,uploadStatus,cancelUpload,storageStatus,connectStorage,readObject,LARGE_UPLOAD,UPLOAD_PART} from '../worker/object-storage.js';
import {digest} from '../worker/security.js';
import worker from '../worker/index.js';

function setup() {
  const db=new DatabaseSync(':memory:');
  for(const file of readdirSync(new URL('../migrations/',import.meta.url)).filter(x=>x.endsWith('.sql')).sort())db.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
  class Statement {
    constructor(sql,args=[]){this.sql=sql;this.args=args;}
    bind(...args){return new Statement(this.sql,args);}
    async first(){return db.prepare(this.sql).get(...this.args)||null;}
    async all(){return {results:db.prepare(this.sql).all(...this.args)};}
    async run(){return {meta:{changes:Number(db.prepare(this.sql).run(...this.args).changes)}};}
  }
  const env={EMAIL_SETTINGS_KEY:'a'.repeat(64),APP_ORIGIN:'https://test.local',DB:{prepare:sql=>new Statement(sql),async batch(items){db.exec('BEGIN');try{const out=[];for(const item of items)out.push(await item.run());db.exec('COMMIT');return out;}catch(e){db.exec('ROLLBACK');throw e;}}}};
  for(const id of ['alice','bob','carol','dave','erin'])db.prepare('INSERT INTO users(id,email,username,display_name,password_hash,created_at) VALUES(?,?,?,?,?,?)').run(id,id+'@example.test',id,id,'unused-test-hash',1);
  return {db,env,alice:{id:'alice'},bob:{id:'bob'}};
}
const credentials={endpoint:'https://s3.us-west-004.backblazeb2.com',bucket:'unit-test-private',access_key_id:'fakekeyid12345',application_key:'fake-secret-for-unit-tests-only'};
const hash='b'.repeat(64);
function png(size){const bytes=new Uint8Array(size);bytes.set([137,80,78,71,13,10,26,10]);return bytes;}
function provider({publicBucket=false}={}) {
  const uploads=new Map(),objects=new Map(),calls=[];
  const hooks={};let index=0;
  const fetch=async input=>{
    const r=input instanceof Request?input:new Request(input),url=new URL(r.url);calls.push({method:r.method,path:url.pathname,query:url.search});
    assert.equal(url.hostname,'s3.us-west-004.backblazeb2.com');
    assert.ok(r.headers.get('Authorization')?.startsWith('AWS4-HMAC-SHA256'));
    if(url.searchParams.has('acl'))return new Response('<AccessControlPolicy><Owner>test</Owner>'+(publicBucket?'<URI>http://acs.amazonaws.com/groups/global/AllUsers</URI>':'')+'</AccessControlPolicy>');
    if(r.method==='POST'&&url.searchParams.has('uploads')){const id='upload-'+(++index);uploads.set(id,{key:url.pathname,parts:new Map()});return new Response('<InitiateMultipartUploadResult><UploadId>'+id+'</UploadId></InitiateMultipartUploadResult>');}
    if(r.method==='PUT'&&!url.searchParams.has('partNumber')){const bytes=await r.arrayBuffer();objects.set(url.pathname,{size:bytes.byteLength,version:'probe-version'});return new Response(null,{headers:{'x-amz-version-id':'probe-version'}});}
    const upload=uploads.get(url.searchParams.get('uploadId'));
    if(r.method==='PUT'&&url.searchParams.has('partNumber')){
      if(!upload)return new Response(null,{status:404});
      const bytes=new Uint8Array(await r.arrayBuffer()),part=Number(url.searchParams.get('partNumber'));
      if(hooks.part)await hooks.part();
      const etag='"etag-'+part+'"';upload.parts.set(part,{size:bytes.length,etag});return new Response(null,{headers:{ETag:etag}});
    }
    if(r.method==='POST'&&url.searchParams.has('uploadId')){
      if(!upload)return new Response(null,{status:404});
      const xml=await r.text();assert.ok(xml.includes('&quot;etag-1&quot;'));
      const size=[...upload.parts.values()].reduce((n,p)=>n+p.size,0),version='version-'+url.searchParams.get('uploadId');
      if(hooks.beforeComplete)await hooks.beforeComplete();
      objects.set(upload.key,{size,version});uploads.delete(url.searchParams.get('uploadId'));
      if(hooks.afterComplete)await hooks.afterComplete();
      return new Response('<CompleteMultipartUploadResult/>',{headers:{'x-amz-version-id':version}});
    }
    if(r.method==='DELETE'&&url.searchParams.has('uploadId')){const found=uploads.delete(url.searchParams.get('uploadId'));return new Response(null,{status:found?204:404});}
    const object=objects.get(url.pathname);
    if(r.method==='HEAD')return object?new Response(null,{headers:{'Content-Length':String(object.size),'x-amz-version-id':object.version}}):new Response(null,{status:404});
    if(r.method==='DELETE'&&url.searchParams.has('versionId')){assert.equal(url.searchParams.get('versionId'),object?.version);objects.delete(url.pathname);return new Response(null,{status:204});}
    if(r.method==='GET'&&object)return new Response(new Uint8Array([1,2,3]),{status:206,headers:{'Content-Length':'3','Content-Range':`bytes 0-2/${object.size}`,'x-bz-private':'do-not-forward'}});
    throw Error('Unexpected mock storage operation '+r.method+' '+url.pathname+url.search);
  };
  return {fetch,uploads,objects,calls,hooks};
}

test('storage rejects public buckets and arbitrary endpoints; credentials stay encrypted',async()=>{
  const {env,db}=setup(),original=globalThis.fetch;
  try {
    globalThis.fetch=provider({publicBucket:true}).fetch;
    await assert.rejects(()=>connectStorage(env,credentials),/private B2 bucket/);
    await assert.rejects(()=>connectStorage(env,{...credentials,endpoint:'http://127.0.0.1'}),/Backblaze S3 endpoint/);
    globalThis.fetch=provider().fetch;await connectStorage(env,credentials);
    const packed=db.prepare("SELECT value FROM app_settings WHERE key='storage'").get().value;
    assert.ok(!packed.includes(credentials.application_key));
    const status=await storageStatus(env);assert.equal(status.configured,true);assert.equal(status.max_file_bytes,LARGE_UPLOAD);
    assert.ok(!JSON.stringify(status).includes(credentials.application_key));assert.ok(!JSON.stringify(status).includes(credentials.access_key_id));
  } finally {globalThis.fetch=original;}
});

test('a complete 1 GiB file moves in bounded 8 MiB parts and supports private range reads',async()=>{
  const {env,alice,db}=setup(),original=globalThis.fetch,p=provider();
  globalThis.fetch=p.fetch;
  try {
    await connectStorage(env,credentials);
    const upload=await beginUpload(env,alice,{size:LARGE_UPLOAD,mime:'video/mp4',fingerprint:hash});
    const bytes=new Uint8Array(UPLOAD_PART);bytes.set([0,0,0,24,102,116,121,112]);
    for(let part=1;part<=LARGE_UPLOAD/UPLOAD_PART;part++)await putPart(env,alice,upload.id,part,bytes);
    const ready=await completeUpload(env,alice,upload.id);assert.equal(ready.ready,true);
    const media=db.prepare('SELECT * FROM media WHERE id=?').get(upload.id);
    assert.equal(media.size,1073741824);assert.equal(media.ready,1);assert.equal(db.prepare('SELECT COUNT(*) n FROM media_chunks').get().n,0);
    assert.equal([...p.objects.values()][0].size,1073741824);
    const reads=await readObject(env,media,new Request('https://test.local/file',{headers:{Range:'bytes=0-2'}}));
    assert.equal(reads.status,206);assert.equal(reads.headers.get('Cache-Control'),'private, no-store');assert.equal(reads.headers.has('x-bz-private'),false);assert.equal((await reads.arrayBuffer()).byteLength,3);
    assert.equal((await completeUpload(env,alice,upload.id)).ready,true);
    assert.equal((await readObject(env,media,new Request('https://test.local/file',{headers:{Range:'bytes=9999999999-'}}))).status,416);
  } finally {globalThis.fetch=original;}
});

test('resuming preserves confirmed parts, validates bytes and isolates upload ownership',async()=>{
  const {env,alice,bob}=setup(),original=globalThis.fetch,p=provider();globalThis.fetch=p.fetch;
  try {
    await connectStorage(env,credentials);
    await assert.rejects(()=>beginUpload(env,alice,{size:LARGE_UPLOAD+1,mime:'video/mp4',fingerprint:hash}),e=>e.status===413);
    const upload=await beginUpload(env,alice,{size:UPLOAD_PART+20,mime:'image/png',fingerprint:hash});
    await assert.rejects(()=>putPart(env,bob,upload.id,1,png(UPLOAD_PART)),e=>e.status===404);
    await assert.rejects(()=>putPart(env,alice,upload.id,1,png(20)),/unexpected size/);
    await assert.rejects(()=>putPart(env,alice,upload.id,1,new Uint8Array(UPLOAD_PART)),e=>e.status===415);
    await putPart(env,alice,upload.id,1,png(UPLOAD_PART));
    const calls=p.calls.length;await putPart(env,alice,upload.id,1,png(UPLOAD_PART));assert.equal(p.calls.length,calls);
    assert.deepEqual((await uploadStatus(env,alice,upload.id,hash)).parts,[1]);
    await assert.rejects(()=>uploadStatus(env,alice,upload.id,'c'.repeat(64)),e=>e.status===409);
    await assert.rejects(()=>completeUpload(env,alice,upload.id),/missing/);
    await putPart(env,alice,upload.id,2,png(20));
    assert.equal((await completeUpload(env,alice,upload.id)).ready,true);
  } finally {globalThis.fetch=original;}
});

test('quota reservations are atomic and cancellation releases space',async()=>{
  const {env,alice,db}=setup(),original=globalThis.fetch,p=provider();globalThis.fetch=p.fetch;
  try {
    await connectStorage(env,credentials);const uploads=[];
    for(const user of ['alice','bob','carol','dave'])for(let i=0;i<2;i++)uploads.push(await beginUpload(env,{id:user},{size:LARGE_UPLOAD,mime:'video/mp4',fingerprint:hash}));
    assert.equal((await storageStatus(env)).used_bytes,8*LARGE_UPLOAD);
    await assert.rejects(()=>beginUpload(env,{id:'erin'},{size:20,mime:'video/mp4',fingerprint:hash}),e=>e.status===507);
    await assert.rejects(()=>connectStorage(env,{...credentials,bucket:'another-private'}),e=>e.status===409);
    await cancelUpload(env,alice,uploads[0].id);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM media').get().n,7);
    await beginUpload(env,alice,{size:LARGE_UPLOAD,mime:'video/mp4',fingerprint:hash});
  } finally {globalThis.fetch=original;}
});

test('part and completion leases prevent cancellation races; lost completion is cleaned safely',async()=>{
  const {env,alice,db}=setup(),original=globalThis.fetch,p=provider();globalThis.fetch=p.fetch;
  try {
    await connectStorage(env,credentials);const upload=await beginUpload(env,alice,{size:20,mime:'image/png',fingerprint:hash});
    let entered,release;const waiting=new Promise(r=>{entered=r;}),gate=new Promise(r=>{release=r;});
    p.hooks.part=async()=>{entered();await gate;};
    const inflight=putPart(env,alice,upload.id,1,png(20));await waiting;
    await assert.rejects(()=>putPart(env,alice,upload.id,1,png(20)),e=>e.status===409);
    await assert.rejects(()=>cancelUpload(env,alice,upload.id),e=>e.status===409);
    release();await inflight;
    p.hooks.afterComplete=async()=>{throw Error('Simulated lost completion response');};
    await assert.rejects(()=>completeUpload(env,alice,upload.id),/lost completion/);
    assert.equal(p.objects.size,1);
    await cancelUpload(env,alice,upload.id);
    assert.equal(p.objects.size,0);assert.equal(db.prepare('SELECT COUNT(*) n FROM media').get().n,0);
  } finally {globalThis.fetch=original;}
});

test('unfinished media stays unreadable and cannot be posted; upload API requires owner and origin',async()=>{
  const {env,alice,db}=setup(),original=globalThis.fetch,p=provider();globalThis.fetch=p.fetch;
  try {
    await connectStorage(env,credentials);
    const token='d'.repeat(64);db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(await digest(token),'alice',Date.now()+60000);
    const upload=await beginUpload(env,alice,{size:20,mime:'image/png',fingerprint:hash});
    const call=(path,method='GET',body,origin=env.APP_ORIGIN)=>worker.fetch(new Request(env.APP_ORIGIN+'/social/api'+path,{method,headers:{Origin:origin,Cookie:'social_session='+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}),env);
    assert.equal((await call('/media/'+upload.id)).status,404);
    assert.equal((await call('/posts','POST',{media_id:upload.id,kind:'photo',human_declared:true})).status,409);
    assert.equal((await call('/uploads/resumable','POST',{size:20,mime:'image/png',fingerprint:hash},'https://attacker.test')).status,403);
    assert.equal((await call('/admin/storage')).status,403);
    await putPart(env,alice,upload.id,1,png(20));await completeUpload(env,alice,upload.id);
    const post=await call('/posts','POST',{media_id:upload.id,kind:'photo',human_declared:true});assert.equal(post.status,201);
    const again=await call('/posts','POST',{media_id:upload.id,kind:'photo',human_declared:true});assert.equal(again.status,200);assert.equal(db.prepare('SELECT COUNT(*) n FROM posts').get().n,1);
    await assert.rejects(()=>cancelUpload(env,alice,upload.id),e=>e.status===409);
  } finally {globalThis.fetch=original;}
});
