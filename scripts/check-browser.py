import pathlib,json,subprocess,threading,http.server,functools,urllib.request,hashlib,time,collections,os,tempfile
from playwright.sync_api import sync_playwright
R=pathlib.Path(__file__).resolve().parents[1];W=R/'.verification';W.mkdir(exist_ok=True);O=W/'original-public';T=W/'browser-results';T.mkdir(exist_ok=True)
(W/'tmp').mkdir(exist_ok=True);tempfile.tempdir=str(W/'tmp');os.environ['TEMP']=str(W/'tmp');os.environ['TMP']=str(W/'tmp')
only=os.environ.get('BEACON_ONLY')
m=json.loads((R/'config/routes.json').read_text(encoding='utf-8'))
for row in m['files']:
 p=O/row['original'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(subprocess.check_output(['git','-C',str(R),'show',m['baseline']+':'+row['original']]))
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
 def copyfile(self,source,output):
  try: super().copyfile(source,output)
  except (ConnectionResetError,BrokenPipeError): pass
servers=[]
for root in [O,R/'dist']:
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(root)))
 threading.Thread(target=server.serve_forever,daemon=True).start();servers.append(server)
orig=f'http://127.0.0.1:{servers[0].server_port}';new=f'http://127.0.0.1:{servers[1].server_port}'
checks=[]
for row in m['files']:
 values=[]
 for base in [orig,new]:
  with urllib.request.urlopen(base+'/'+row['original']) as response: values.append((response.status,response.headers.get('Content-Type'),hashlib.sha256(response.read()).hexdigest()))
 checks.append(dict(path='/'+row['original'],passed=values[0]==values[1] and values[0][2]==row['sha256'],status=values[1][0],mime=values[1][1]))
(T/'http-integrity.json').write_text(json.dumps(checks,indent=2)+'\n')
results=json.loads((T/'browser-parity.json').read_text()) if only else []
with sync_playwright() as p:
 browser=p.chromium.launch(**({'executable_path':os.environ['BEACON_BROWSER_EXECUTABLE']} if os.environ.get('BEACON_BROWSER_EXECUTABLE') else {}),headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--no-sandbox'])
 for row in [x for x in m['files'] if x['original'].endswith('.html') and (not only or x['original']==only)]:
  path='/'+row['original'];pair=[]
  for label,base in [('before',orig),('after',new)]:
   context=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
   page=context.new_page();errors=[];missing=[]
   context.route('**/*',lambda route: route.continue_() if route.request.url.startswith(('http://127.0.0.1:','data:','blob:')) else route.abort())
   page.on('pageerror',lambda error:errors.append(str(error)[:240]))
   page.on('response',lambda response:missing.append(response.url.split('/',3)[-1]) if response.status>=400 and response.url.startswith(base) else None)
   try:
    state=page.evaluate('''() => ({title:document.title, headings:[...document.querySelectorAll('h1')].map(x=>x.textContent.trim()), elements:document.querySelectorAll('*').length, scripts:document.scripts.length, canvas:document.querySelectorAll('canvas').length, images:[...document.images].filter(x=>!x.src.startsWith('data:')).map(x=>({path:new URL(x.src).pathname,loaded:x.complete&&x.naturalWidth>0})),media:[...document.querySelectorAll('video,audio')].map(x=>({tag:x.tagName,path:x.src?new URL(x.src).pathname:null})),base:new URL(document.baseURI).pathname})''')
    behavior={}
    if path=='/focus.html':
     page.evaluate("window.dispatchEvent(new Event('focus'));window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'))")
     behavior['focusCounter']=page.locator('#count').inner_text()
    if path=='/code.html':
     behavior['interactiveFunctions']=page.evaluate("['triggerSixSeven','triggerJob','triggerBazooka','triggerData','triggerEpstein','triggerRickroll'].map(x=>typeof window[x])")
     page.evaluate('triggerRickroll()');page.wait_for_function("[...document.images].some(x=>x.src.endsWith('/rick.gif')&&x.complete&&x.naturalWidth>0)",timeout=15000)
     behavior['gifLoaded']=page.locator('img[src$="rick.gif"]').evaluate_all('(xs)=>xs.some(x=>x.complete&&x.naturalWidth>0)')
     page.screenshot(path=str(T/(row['original'].replace('/','_')+'.png')),full_page=False)
    pair.append(dict(status=response.status if response else None,state=state,errors=sorted(set(errors)),missing=sorted(set(missing)),behavior=behavior))
   except Exception as e:pair.append(dict(exception=type(e).__name__,message=str(e)[:200]))
   context.close()
  passed=pair[0]==pair[1] and 'exception' not in pair[1]
  result=dict(path=path,passed=passed,before=pair[0],after=pair[1]);results=[x for x in results if x['path']!=path];results.append(result)
  print(json.dumps(dict(path=path,parity=passed,errors=pair[1].get('errors'),missing=pair[1].get('missing'))),flush=True)
  (T/'browser-parity.json').write_text(json.dumps(results,indent=2)+'\n')
 # Responsive checks verify actual app DOM is present at a narrow viewport.
 mobile=json.loads((T/'mobile.json').read_text()) if only else []
  context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,reduced_motion='reduce')
  context.route('**/*',lambda route: route.continue_() if route.request.url.startswith(('http://127.0.0.1:','data:','blob:')) else route.abort())
  page=context.new_page()
  try:
   response=page.goto(new+path,wait_until='domcontentloaded',timeout=15000);page.wait_for_timeout(700)
   mobile.append(dict(path=path,status=response.status,title=page.title(),body=page.locator('body').count(),viewport=390,scrollWidth=page.evaluate('document.documentElement.scrollWidth')))
   page.screenshot(path=str(T/('mobile-'+path.strip('/').replace('/','_')+'.png')))
  except Exception as e:mobile.append(dict(path=path,error=type(e).__name__))
  context.close()
 (T/'mobile.json').write_text(json.dumps(mobile,indent=2)+'\n')
 browser.close()
for server in servers:server.shutdown()
summary=dict(http_files=len(checks),http_passed=sum(x['passed'] for x in checks),html_pages=len(results),parity_passed=sum(x['passed'] for x in results),mobile_pages=len(mobile),mode='Offline external dependencies blocked equally before and after; authenticated and provider behavior not simulated')
(T/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary),flush=True)
