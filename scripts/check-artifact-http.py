"""Serve and verify every mapped artifact resource locally using bytes and MIME types."""
import argparse,functools,hashlib,http.server,json,mimetypes,threading,urllib.parse,urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from build import ROOT,manifest_entries
from validate import validate
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--directory',type=Path,default=ROOT/'dist');p.add_argument('--report',type=Path,default=ROOT/'.verification/local-http.json');a=p.parse_args();output=a.directory.resolve()
assert validate(ROOT,output,ROOT/'config/routes.json')['passed'],'A fresh source-matching artifact is required'
m=json.loads((ROOT/'config/routes.json').read_text(encoding='utf-8'));rows=manifest_entries(ROOT,m)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(output)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
tasks=[('/'+x['original'],x) for x in rows];by_path={x['original']:x for x in rows}
mime={'.html':{'text/html'},'.css':{'text/css'},'.js':{'text/javascript','application/javascript'},'.json':{'application/json'},'.gif':{'image/gif'},'.png':{'image/png'},'.mp3':{'audio/mpeg'},'.mp4':{'video/mp4'},'.ico':{'image/x-icon','image/vnd.microsoft.icon'},'.zip':{'application/zip','application/x-zip-compressed'}}
def check(task):
 path,row=task;result={'path':path,'original_url':'https://beaconofunity.com'+path,'source':row['source'],'published_url':path,'expected_local_status':200}
 try:
  with urllib.request.urlopen(base+urllib.parse.quote(path),timeout=20) as response:
   data=response.read();kind=response.headers.get_content_type();source=(ROOT/row['source']).read_bytes();allowed=mime.get(Path(row['original']).suffix)
   result.update(status=response.status,resource_type=kind,bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),passed=response.status==200 and data==source and (not allowed or kind in allowed))
 except Exception as error:result.update(passed=False,error=type(error).__name__)
 return result
with ThreadPoolExecutor(max_workers=8) as pool:results=list(pool.map(check,tasks))
server.shutdown();report={'scope':'Generated local artifact, every explicit resource plus directory aliases; exact source bytes and MIME checked. Provider behavior is separate.','checked':len(results),'passed':sum(x['passed'] for x in results),'failed':[x for x in results if not x['passed']],'results':results};a.report.parent.mkdir(parents=True,exist_ok=True);a.report.write_bytes((json.dumps(report,indent=2)+'\n').encode());print(json.dumps({k:report[k] for k in ['checked','passed','failed']},indent=2));raise SystemExit(0 if not report['failed'] else 1)
