import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import worker from '../omniscope/worker/index.js';
import {onRequestGet as rootArchive} from '../functions/api/archive.js';
import {onRequestGet as projectArchive} from '../omniscope/functions/api/archive.js';
import {onRequestGet as rootEphemeris} from '../functions/api/ephemeris.js';
import {onRequestGet as projectEphemeris} from '../omniscope/functions/api/ephemeris.js';
let assertions=0;
const check=(actual, expected)=>{assert.deepEqual(actual,expected); assertions++;};
const env={ASSETS:{fetch:async request=>new Response(new URL(request.url).pathname,{headers:{'Content-Type':'text/plain'}})}};
const realNow=Date.now;
try {
  Date.now=()=>Date.parse('2026-11-14T05:00:00Z');
  for (const entry of [worker]) {
    for (const [path,method,status,location,body] of [
      ['/omniscope','GET',308,'https://example.com/omniscope/?x=1'],
      ['/omniscope/index.html','GET',308,'https://example.com/omniscope/?x=1'],
      ['/elsewhere','GET',404,null,'Not found'],
      ['/omniscope/','GET',200,null,'/'],
      ['/omniscope/public/survey-system.js','GET',200,null,'/public/survey-system.js'],
      ['/omniscope/api/archive','POST',405,null,'Method not allowed'],
      ['/omniscope/api/ephemeris','POST',405,null,'Method not allowed'],
      ['/omniscope/api/archive','GET',400],
      ['/omniscope/api/ephemeris','GET',400],
    ]) {
      const r=await entry.fetch(new Request('https://example.com'+path+'?x=1',{method}),env);
      check(r.status,status);
      if(location) check(r.headers.get('Location'),location);
      if(body) check(await r.text(),body);
    }
  }
  Date.now=()=>Date.parse('2026-11-14T04:59:59Z');
  const launch=await worker.fetch(new Request('https://example.com/omniscope/'),env);
  check(launch.status,200);
  check((await launch.text()).includes('14 November 2026'),true);
  check((await worker.fetch(new Request('https://example.com/omniscope/public/survey-system.js'),env)).status,404);
} finally { Date.now=realNow; }
for (const fn of [rootArchive,projectArchive]) {
  for (const query of ['', '?ra=360&dec=0','?ra=0&dec=91','?ra=1&dec=2&collection=invalid','?ra=1&dec=2&file=/etc/passwd','?ra=1&dec=2&file=/ibe/data/spherex/qr3/level2/a.fits&size=9']) {
    check((await fn({request:new Request('https://example.com/api/archive'+query)})).status,400);
  }
}
for (const fn of [rootEphemeris,projectEphemeris]) {
  for (const query of ['', '?body=pluto&date=2026-11-05','?body=earth&date=2026-02-30','?body=earth&date=2040-01-01']) {
    check((await fn({request:new Request('https://example.com/api/ephemeris'+query)})).status,400);
  }
}
const realFetch=globalThis.fetch;
try {
  const calls=[];
  globalThis.fetch=async url=>{calls.push(String(url));return new Response('<VOTABLE/>');};
  for(const fn of [rootArchive,projectArchive]) {
    let r=await fn({request:new Request('https://example.com/api/archive?ra=1&dec=2')});
    check(r.status,200); check(r.headers.get('Content-Type'),'application/xml');check(await r.text(),'<VOTABLE/>');
    r=await fn({request:new Request('https://example.com/api/archive?ra=1&dec=2&file=/ibe/data/spherex/qr3/level2/a.fits')});
    check(r.status,200); check(r.headers.get('Content-Type'),'application/fits');
  }
  check(calls[0],calls[2]);check(calls[1],calls[3]);
  globalThis.fetch=async()=>Response.json({result:'$$SOE\n2460000,date,1,2,3,4,5,6\n$$EOE',signature:{version:'test'}});
  for(const fn of [rootEphemeris,projectEphemeris]) {
    const r=await fn({request:new Request('https://example.com/api/ephemeris?body=earth&date=2026-11-05')});
    check(r.status,200);const body=await r.json(); check(body.position,[1,2,3]); check(body.velocity,[4,5,6]);
  }
  globalThis.fetch=async()=>new Response('',{status:503});
  for(const fn of [rootArchive,projectArchive,rootEphemeris,projectEphemeris]) {
    const query=fn===rootArchive||fn===projectArchive?'?ra=1&dec=2':'?body=earth&date=2026-11-05';
    check((await fn({request:new Request('https://example.com/api/test'+query)})).status,502);
  }
} finally {globalThis.fetch=realFetch;}
const oldConfig=JSON.parse(await readFile(new URL('../omniscope/worker/wrangler.jsonc',import.meta.url)));
check(oldConfig.routes,[{pattern:'beaconofunity.com/omniscope*',zone_name:'beaconofunity.com'}]);check(oldConfig.name,'omniscope-beacon');check(oldConfig.assets.binding,'ASSETS');check(oldConfig.assets.run_worker_first,true);
console.log(JSON.stringify({passed:true,assertions,scope:'Worker redirects, path forwarding, HTTP methods, API validation, mocked upstream success/failure, unchanged deployment configuration'}));
