import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {verifyBeaconAdmin,enqueueApproval,drainApprovals,retryApproval,approvalMessage} from '../worker/beacon-mail.js';
import {deliverEmail} from '../worker/email.js';
import {HttpError} from '../worker/security.js';
function setup(){
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../migrations/0007_approval_outbox.sql',import.meta.url),'utf8'));db.exec('CREATE TABLE email_usage(bucket TEXT PRIMARY KEY,count INTEGER,expires_at INTEGER)');
 class Statement{constructor(sql,args=[]){this.sql=sql;this.args=args;}bind(...args){return new Statement(this.sql,args);}async first(){return db.prepare(this.sql).get(...this.args)||null;}async all(){return {results:db.prepare(this.sql).all(...this.args)};}async run(){return db.prepare(this.sql).run(...this.args);}}
 return {db,env:{SENDPULSE_API_KEY:'fake-unit-test-key',EMAIL_SENDER_ADDRESS:'anshuman@beaconofunity.com',DB:{prepare:sql=>new Statement(sql)}}};
}
const fields={email:{stringValue:'member@example.test'},fullName:{stringValue:'Asha & <friends>'},status:{stringValue:'approved'},approvedAt:{stringValue:new Date().toISOString()}};
test('main admin authorization rejects absent, invalid, and non-admin Firebase sessions',async()=>{
 const request=token=>new Request('https://test.local',{headers:token?{Authorization:'Bearer '+token}:{}});
 await assert.rejects(verifyBeaconAdmin(request()),{status:401});
 await assert.rejects(verifyBeaconAdmin(request('bad'),async()=>{throw Error('invalid signature');}),{status:401});
 await assert.rejects(verifyBeaconAdmin(request('valid'),async()=>({payload:{sub:'ordinary-user'}})),{status:403});
 assert.equal(await verifyBeaconAdmin(request('valid'),async()=>({payload:{sub:'vVzdX3mSWqWHgTLKQpfrrPb5dSv1'}})),'valid');
});
test('recipient comes from approved Firestore member; enqueue is idempotent and cannot inject paths',async()=>{
 const {db,env}=setup(),original=fetch;
 try{globalThis.fetch=async(url,options)=>{assert.ok(url.endsWith('/users/member'));assert.equal(options.headers.Authorization,'Bearer admin-token');return Response.json({fields});};
 await enqueueApproval(env,'admin-token','member');await enqueueApproval(env,'admin-token','member');
 assert.equal(db.prepare('SELECT count(*) n FROM approval_outbox').get().n,1);
 assert.equal(db.prepare('SELECT recipient FROM approval_outbox').get().recipient,'member@example.test');
 await assert.rejects(enqueueApproval(env,'admin-token','../other'),{status:400});
 globalThis.fetch=async()=>Response.json({fields:{...fields,status:{stringValue:'waiting for approval'}}});
 await assert.rejects(enqueueApproval(env,'admin-token','member'),{status:409});
 }finally{globalThis.fetch=original;db.close();}
});
test('concurrent queue runs send once; failed provider retries survive and accepted mail is never resent',async()=>{
 const {db,env}=setup();db.prepare('INSERT INTO approval_outbox(user_id,recipient,name,next_attempt,created_at) VALUES(?,?,?,?,?)').run('member','member@example.test','Asha',0,0);
 let sends=0,release;const gate=new Promise(r=>release=r);
 const first=drainApprovals(env,async()=>{sends++;await gate;});await new Promise(r=>setTimeout(r,10));await drainApprovals(env,async()=>{sends++;});release();await first;
 assert.equal(sends,1);assert.equal(db.prepare('SELECT status FROM approval_outbox').get().status,'accepted');await retryApproval(env,'member');await drainApprovals(env,async()=>{sends++;});assert.equal(sends,1);
 db.prepare("UPDATE approval_outbox SET status='pending',next_attempt=0").run();
 await drainApprovals(env,async()=>{throw Error('private provider secret should not persist');});
 const row=db.prepare('SELECT * FROM approval_outbox').get();assert.equal(row.status,'pending');assert.equal(row.attempts,1);assert.ok(row.next_attempt>Date.now());assert.ok(!row.last_error.includes('secret'));
 db.prepare("UPDATE approval_outbox SET attempts=7,next_attempt=0").run();await drainApprovals(env,async()=>{throw Error();});assert.equal(db.prepare('SELECT status FROM approval_outbox').get().status,'failed');await retryApproval(env,'member');assert.equal(db.prepare('SELECT attempts FROM approval_outbox').get().attempts,0);db.close();
});
test('quota exhaustion retains queued mail without consuming retry attempts',async()=>{
 const {db,env}=setup();db.prepare('INSERT INTO approval_outbox(user_id,recipient,name,next_attempt,created_at) VALUES(?,?,?,?,?)').run('member','member@example.test','Asha',0,0);
 await drainApprovals(env,async()=>{throw new HttpError(429,'Limit');});const row=db.prepare('SELECT * FROM approval_outbox').get();assert.equal(row.attempts,0);assert.equal(row.status,'pending');assert.ok(row.next_attempt>Date.now());db.close();
});
test('branded email escapes names and sends UTF-8 HTML plus text with verified From and official Reply-To',async()=>{
 const {db,env}=setup(),original=fetch;const message=approvalMessage('Zoë <script>');assert.ok(!message.html.includes('<script>'));assert.ok(message.html.includes('https://beaconofunity.com/logo.png'));
 try{globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.sendpulse.com/smtp/emails');const email=JSON.parse(options.body).email;assert.equal(email.from.email,'anshuman@beaconofunity.com');assert.equal(email.from.name,'Beacon of Unity');assert.equal(email.reply_to.email,'beaconofunityofficial@gmail.com');assert.equal(Buffer.from(email.html,'base64').toString('utf8'),message.html);assert.ok(email.text.includes('Zoë'));return Response.json({result:true});};assert.equal((await deliverEmail(env,{to:'member@example.test',...message})).accepted,true);}finally{globalThis.fetch=original;db.close();}
});
