import {createRemoteJWKSet, jwtVerify} from 'jose';
import {assert} from './security.js';
import {deliverEmail, emailStatus} from './email.js';

const project='beaconofunityofficial';
const admins=new Set(['vVzdX3mSWqWHgTLKQpfrrPb5dSv1']);
const keys=createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export async function verifyBeaconAdmin(request, verifier=token=>jwtVerify(token,keys,{issuer:'https://securetoken.google.com/'+project,audience:project,algorithms:['RS256']})) {
  const header=request.headers.get('Authorization')||'';
  assert(header.startsWith('Bearer ')&&header.length<8192,401,'Sign in to the Beacon admin panel.');
  const token=header.slice(7);
  let payload;
  try {({payload}=await verifier(token));}catch{assert(false,401,'Your admin session expired. Sign in again.');}
  assert(admins.has(payload.sub),403,'Beacon administrator access required.');
  return token;
}

export function approvalMessage(name) {
  const clean=String(name||'friend').replace(/[\r\n]/g,' ').slice(0,120);
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Welcome to Beacon of Unity</title></head><body style="margin:0;background:#edf3f4;color:#193443;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden">Your account is approved. A little kindness goes a long way.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edf3f4"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fffdf8;border-radius:18px;overflow:hidden"><tr><td style="height:6px;background:#237e89"></td></tr><tr><td align="center" style="padding:32px 28px 20px"><img src="https://beaconofunity.com/logo.png" width="88" height="88" alt="Beacon of Unity lighthouse" style="display:block;border:0;border-radius:16px"><p style="font-size:13px;font-weight:bold;letter-spacing:2px;color:#237e89;margin:20px 0 0">BEACON OF UNITY</p></td></tr><tr><td style="padding:8px 32px 32px"><p style="font-size:14px;color:#237e89;margin:0 0 12px">ACCOUNT APPROVED</p><h1 style="font-size:30px;line-height:1.2;letter-spacing:-1px;margin:0 0 24px;color:#183747">You belong here.</h1><p style="font-size:16px;line-height:1.7;margin:0 0 16px">Hi ${esc(clean)},</p><p style="font-size:16px;line-height:1.7;margin:0 0 24px">Your Beacon of Unity account has been verified and approved. Thank you for being part of a community built on kindness, trust, and helping one another.</p><table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#237e89" style="border-radius:9px"><a href="https://beaconofunity.com/login.html" style="display:inline-block;padding:16px 24px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none">Open Beacon of Unity &#8594;</a></td></tr></table><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:30px;background:#f0f5f2;border-radius:12px"><tr><td style="padding:22px;font-size:14px;line-height:1.9"><strong>A good place to start</strong><br>Offer a hand to someone who needs support.<br>Respond to requests in your community.<br>Connect with verified members.</td></tr></table><p style="font-size:15px;line-height:1.7;margin:24px 0 0">Every act of help, however small, matters.<br><strong>The Beacon of Unity team</strong></p></td></tr><tr><td style="padding:24px 32px;background:#183747;color:#dbe9e9;font-size:12px;line-height:1.8">Questions? Reply to this email or contact<br><a href="mailto:beaconofunityofficial@gmail.com" style="color:#f0ca72">beaconofunityofficial@gmail.com</a><br>You received this account update after your membership application was approved.</td></tr></table><p style="font-size:11px;color:#687d83;margin:20px 0">Beacon of Unity &middot; Small acts. Stronger communities.</p></td></tr></table></body></html>`;
  return {subject:'Welcome to Beacon of Unity, '+clean+'!',senderName:'Beacon of Unity',replyTo:'beaconofunityofficial@gmail.com',html,text:`Hi ${clean},\n\nYour Beacon of Unity account has been verified and approved. Welcome to our community.\n\nOpen Beacon of Unity: https://beaconofunity.com/login.html\n\nOffer help, respond to community requests, and connect with verified members. Every act of help, however small, matters.\n\nThe Beacon of Unity team\nQuestions: beaconofunityofficial@gmail.com`};
}

export async function enqueueApproval(env, token, userId) {
  assert(typeof userId==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(userId),400,'Choose a valid member.');
  const response=await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/users/${encodeURIComponent(userId)}`,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(15000)});
  assert(response.ok,409,'Could not verify this membership. Refresh the admin panel and retry.');
  const {fields={}}=await response.json();
  assert(fields.status?.stringValue==='approved'&&fields.approvedAt?.stringValue,409,'Save the membership approval first.');
  const email=fields.email?.stringValue||'',name=(fields.fullName?.stringValue||'friend').slice(0,120);
  assert(/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email)&&email.length<=254,409,'This member has no valid email address.');
  await env.DB.prepare("INSERT INTO approval_outbox(user_id,recipient,name,next_attempt,created_at) VALUES(?,?,?,?,?) ON CONFLICT(user_id) DO NOTHING").bind(userId,email,name,Date.now(),Date.now()).run();
  return env.DB.prepare('SELECT user_id,status,created_at,accepted_at FROM approval_outbox WHERE user_id=?').bind(userId).first();
}

export async function approvalOverview(env) {
  const {results}=await env.DB.prepare('SELECT user_id,recipient,name,status,attempts,created_at,accepted_at,last_error FROM approval_outbox ORDER BY created_at DESC LIMIT 50').all();
  const {results:counts}=await env.DB.prepare('SELECT status,COUNT(*) AS count FROM approval_outbox GROUP BY status').all();
  const usage=await emailStatus(env);
  return {items:results,counts,usage:{hourly_limit:usage.hourly_limit,hourly_used:usage.hourly_used,monthly_limit:usage.monthly_limit,monthly_used:usage.monthly_used}};
}

export async function retryApproval(env,userId) {
  assert(typeof userId==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(userId),400,'Choose a valid member.');
  await env.DB.prepare("UPDATE approval_outbox SET status='pending',attempts=0,next_attempt=?,last_error=NULL WHERE user_id=? AND status='failed'").bind(Date.now(),userId).run();
  return {queued:true};
}

export async function drainApprovals(env,send=deliverEmail) {
  const now=Date.now();
  const {results}=await env.DB.prepare("SELECT * FROM approval_outbox WHERE (status='pending' AND next_attempt<=?) OR (status='sending' AND lease_until<?) ORDER BY created_at LIMIT 5").bind(now,now).all();
  for(const row of results){
    const lease=now+120000;
    const claimed=await env.DB.prepare("UPDATE approval_outbox SET status='sending',lease_until=? WHERE user_id=? AND ((status='pending' AND next_attempt<=?) OR (status='sending' AND lease_until<?)) RETURNING user_id").bind(lease,row.user_id,now,now).first();
    if(!claimed)continue;
    try {
      await send(env,{to:row.recipient,...approvalMessage(row.name)});
      await env.DB.prepare("UPDATE approval_outbox SET status='accepted',accepted_at=?,lease_until=0,last_error=NULL WHERE user_id=? AND status='sending' AND lease_until=?").bind(Date.now(),row.user_id,lease).run();
    }catch(error){
      const quota=error.status===429,attempts=row.attempts+(quota?0:1);
      let delay=Math.min(86400000,60000*2**Math.min(attempts,10));
      if(quota){const usage=await emailStatus(env),date=new Date();delay=usage.monthly_used>=usage.monthly_limit?Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,1)-Date.now()+1000:3600000-Date.now()%3600000+1000;}
      await env.DB.prepare("UPDATE approval_outbox SET status=?,attempts=?,next_attempt=?,lease_until=0,last_error=? WHERE user_id=? AND status='sending' AND lease_until=?").bind(attempts>=8?'failed':'pending',attempts,Date.now()+delay,quota?'Sending allowance reached; queued for the next window.':'Provider did not confirm acceptance; automatic retry scheduled.',row.user_id,lease).run();
    }
  }
}
