"""Capture/compare public routes before and after the authorized publishing cutover."""
import argparse,hashlib,html,json,re,time,urllib.error,urllib.parse,urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from build import ROOT,manifest_entries
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--base-url',required=True);p.add_argument('--report',type=Path,required=True);p.add_argument('--baseline',type=Path);a=p.parse_args();base=a.base_url.rstrip('/')
if base not in ['https://beaconofunity.com','https://anshumantheone.github.io/beacon-of-unity']:raise ValueError('Only the two existing public site origins are allowed')
m=json.loads((ROOT/'config/routes.json').read_text(encoding='utf-8'));rows=manifest_entries(ROOT,m);mapping={'/'+x['original']:x for x in rows};paths=list(mapping)
paths+=['/','/gods-eye/','/CozyStudio/','/omniscope/','/social','/socialdemo','/index.html?migration_probe=keep','/login.html?next=dashboard.html','/carbon.html?migration_probe=keep','/eysc.html?media=original','/gods-eye?view=default','/CozyStudio?from=beacon','/omniscope?release=qr3','/social?ref=beacon','/socialdemo?ref=beacon','/omniscope/api/archive','/omniscope/api/ephemeris']
paths=list(dict.fromkeys(paths));binary={'.png','.jpg','.jpeg','.gif','.ico','.mp3','.mp4','.webm','.woff','.woff2','.ttf','.otf','.zip','.fits','.pdf'}
def capture(path):
 redirects=[]
 class Redirects(urllib.request.HTTPRedirectHandler):
  def redirect_request(self,request,fp,code,message,headers,newurl):
   redirects.append({'status':code,'target':newurl});return super().redirect_request(request,fp,code,message,headers,newurl)
 result={'path':path,'url':base+path}
 for attempt in range(2):
  redirects.clear()
  try:
   req=urllib.request.Request(base+urllib.parse.quote(path,safe='/?=&'),headers={'User-Agent':'Beacon-Authorized-ReadOnly-Cutover','Accept-Encoding':'identity'})
   try:response=urllib.request.build_opener(Redirects()).open(req,timeout=30)
   except urllib.error.HTTPError as error:response=error
   with response:
    data=response.read();kind=(response.headers.get('content-type') or '').split(';')[0].lower();title=re.search(br'<title[^>]*>(.*?)</title>',data,re.I|re.S) if kind=='text/html' else None
    result.update(status=response.status,final_url=response.url,redirects=redirects,content_type=kind,bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),title=' '.join(html.unescape(title.group(1).decode('utf-8','replace')).split()) if title else None)
   if result['status']<500:return result
  except Exception as error:result['error']=type(error).__name__
  if attempt==0:time.sleep(.5)
 return result
with ThreadPoolExecutor(max_workers=8) as pool:results=list(pool.map(capture,paths))
failures=[];before=None
if a.baseline:
 before=json.loads(a.baseline.read_text(encoding='utf-8'));assert before['base_url']==base;prior={x['path']:x for x in before['results']}
 for row in results:
  old=prior.get(row['path']);problems=[]
  if not old:continue
  if old.get('status')==200:
   if row.get('status')!=200:problems.append('Previously working route no longer returns200')
   if row.get('content_type')!=old.get('content_type'):problems.append('Content type changed')
   if row.get('redirects')!=old.get('redirects') or row.get('final_url')!=old.get('final_url'):problems.append('HTTP redirect contract changed')
   if old.get('title') and row.get('title')!=old['title']:problems.append('Page title changed')
   source=mapping.get(row['path'].split('?',1)[0])
   if source and Path(source['original']).suffix.lower() in binary:
    expected=hashlib.sha256((ROOT/source['source']).read_bytes()).hexdigest()
    if row.get('sha256') not in [expected,old.get('sha256')]:problems.append('Binary media differs from both source and previous public bytes')
  elif old.get('status') and old['status']!=404 and row.get('status')!=old['status']:problems.append('Existing endpoint status changed')
  if problems:failures.append({'path':row['path'],'problems':problems,'before':old,'after':row})
summary={'base_url':base,'checked':len(results),'previously_working':sum(x.get('status')==200 for x in before['results']) if before else None,'working_now':sum(x.get('status')==200 for x in results),'comparison_passed':not failures if before else None,'regressions':failures,'scope':'Read-only public GET routes, redirect/query preservation, MIME, page titles and existing binary integrity; not authenticated transactions or every possible UI state.'}
a.report.parent.mkdir(parents=True,exist_ok=True);a.report.write_bytes((json.dumps({**summary,'results':results},indent=2)+'\n').encode());print(json.dumps({k:v for k,v in summary.items() if k!='regressions'},indent=2));print(json.dumps({'regressions':len(failures)}));raise SystemExit(1 if failures else 0)
