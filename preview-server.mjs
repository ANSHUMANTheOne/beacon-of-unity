import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
if(!fs.existsSync(path.join(root,'index.html')))throw new Error('Build the compatibility artifact first: node scripts/cloudflare-build.mjs');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.gif':'image/gif','.mp4':'video/mp4','.mp3':'audio/mpeg','.woff2':'font/woff2'};
http.createServer((req,res)=>{let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}let target=path.resolve(root,'.'+url);if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}if(!path.extname(target)&&!fs.existsSync(target))target+='.html';if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');if(!fs.existsSync(target)){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(target).pipe(res);}).listen(4174,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:4174'));
