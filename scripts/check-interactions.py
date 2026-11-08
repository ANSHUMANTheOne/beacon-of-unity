"""Read-only desktop/mobile UI flows; remote data-changing requests are blocked.

Requires optional Playwright tooling and Chromium/Chrome. Uses fresh browser contexts.
Exports and test reports stay under ignored .verification/interaction-tests/.
"""
import argparse,os,tempfile,pathlib,json,threading,http.server,functools,time,shutil
from playwright.sync_api import sync_playwright,expect
R=pathlib.Path(__file__).resolve().parents[1]
W=R/'.verification';Q=W/'interaction-tests';Q.mkdir(parents=True,exist_ok=True);(W/'tmp').mkdir(exist_ok=True)
os.environ['TEMP']=str(W/'tmp');os.environ['TMP']=str(W/'tmp');tempfile.tempdir=str(W/'tmp')
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base-url',help='Optional uploaded preview origin; omit to serve a local artifact')
parser.add_argument('--directory',type=pathlib.Path,default=R/'dist')
parser.add_argument('--case')
parser.add_argument('--viewport',choices=['desktop','mobile'],help='Run only the selected viewport; default runs both')
parser.add_argument('--browser',default=os.environ.get('BEACON_BROWSER_EXECUTABLE'))
args=parser.parse_args();output=args.directory.resolve()
browser_path=args.browser or shutil.which('google-chrome') or shutil.which('chromium')
if not browser_path and pathlib.Path(r'C:\Program Files\Google\Chrome\Application\chrome.exe').exists():browser_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe'
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def copyfile(self,source,output):
  try:super().copyfile(source,output)
  except (ConnectionResetError,BrokenPipeError):pass
server=None
if args.base_url:
 base=args.base_url.rstrip('/')
else:
 from validate import validate
 report=validate(R,output,R/'config/routes.json')
 if not report['passed']:raise RuntimeError('Build a fresh source-matching artifact before running UI checks')
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(output)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_port}'
results=[];selected=args.case or os.environ.get('BEACON_CASE')
old=Q/'interactions.json'
with sync_playwright() as p:
 browser=p.chromium.launch(**({'executable_path':browser_path} if browser_path else {}),headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--no-sandbox','--mute-audio'])
 for mobile in [False,True]:
  if args.viewport and (args.viewport=='mobile')!=mobile:continue
   if selected and not case.startswith(selected):continue
   context=browser.new_context(viewport={'width':390 if mobile else 1440,'height':844 if mobile else 1000},is_mobile=mobile,reduced_motion=('no-preference' if case=='main-demo' else 'reduce'),accept_downloads=True)
   blocked=[];errors=[];checks=[];dialogs=[]
   def route(r):
    if r.request.method not in ('GET','HEAD','OPTIONS'):blocked.append(r.request.url.split('?')[0]);r.abort()
    else:r.continue_()
   context.route('**/*',route);page=context.new_page();page.set_default_timeout(10000);page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:(dialogs.append(d.message),d.dismiss()))
   def check(name,condition):
    checks.append(dict(name=name,passed=bool(condition)))
    assert condition,name
   def goto(path,delay=1200):
    response=page.goto(case_origin+path,wait_until='domcontentloaded',timeout=30000)
    if response is None or response.status>=400:raise RuntimeError('Document unavailable: '+path+' HTTP '+str(response.status if response else 'no response'))
    page.wait_for_timeout(delay)
   failure=None
   try:
    if case.startswith('main-demo'):
     goto('/',2500)
     redesigned=page.locator('#demo-dialog').count()>0
     if not redesigned and page.locator('#skip-intro').is_visible():page.locator('#skip-intro').click();page.wait_for_timeout(500)
     if redesigned:page.get_by_role('button',name='Open navigation',exact=True).click()
     before=page.locator('html').get_attribute('data-theme');page.locator('#theme-toggle' if redesigned else '#theme-toggle-btn').click();check('theme toggles',page.locator('html').get_attribute('data-theme')!=before)
     if redesigned:
      page.locator('#motion-toggle').click();motion=page.locator('#motion-toggle').get_attribute('aria-pressed');page.locator('#motion-toggle').click();check('motion control toggles between both states',page.locator('#motion-toggle').get_attribute('aria-pressed')!=motion)
      page.get_by_role('button',name='Close navigation',exact=True).click();page.locator('[data-demo]:visible').first.click();expect(page.locator('#demo-dialog')).to_be_visible();frame=page.locator('#demo-frame').element_handle().content_frame()
     else:
      (page.locator('[onclick*=openSimDemo]').last if case=='main-demo-reduced' else page.locator('#bav-try-demo-btn')).click();expect(page.locator('#sim-overlay')).to_have_class(__import__('re').compile('active'));frame=page.locator('#sim-iframe').element_handle().content_frame()
     frame.wait_for_function("window.IS_DEMO_MODE===true&&document.getElementById('requestFeed').children.length>0",timeout=20000)
     check('demo iframe preserves query and loads simulated requests','demo=1' in frame.url);check('no demo parse errors',not errors)
     if not mobile:
      control=frame.locator('[data-tab=lostfound]:visible, [onclick*=switchTab][onclick*=lostfound]:visible') if redesigned else frame.locator("[onclick*=switchTab][onclick*=lostfound]:visible")
      control.first.click();expect(frame.locator('#lostFoundTab')).to_be_visible();check('demo lost-and-found tab',True)
      control=frame.locator('[data-tab=community]:visible, [onclick*=switchTab][onclick*=community]:visible') if redesigned else frame.locator("[onclick*=switchTab][onclick*=community]:visible")
      control.first.click();frame.locator('#requestFeed .btn-help').first.click();expect(frame.locator('#chatPopup')).to_be_visible();check('simulated help opens chat',True)
     if redesigned:page.get_by_role('button',name='Close demo',exact=True).click();check('demo closes',not page.locator('#demo-dialog').is_visible())
    elif case=='cozy':
     goto('/CozyStudio/',2000);check('animation boots without page errors',not errors)
     page.get_by_role('button',name='Animation Studio',exact=True).click();types=page.locator('#types button');check('all patterns available',types.count()==11)
     for i in range(types.count()):types.nth(i).click();page.wait_for_timeout(55)
     check('all patterns render without errors',not errors)
     page.locator('#types button[data-k=rainbow]').click();page.locator('#pause').click();snapshot=page.locator('#prev').evaluate('(x)=>x.toDataURL()');page.wait_for_timeout(220);check('pause stops canvas changes',snapshot==page.locator('#prev').evaluate('(x)=>x.toDataURL()'))
     page.locator('#play').click();page.wait_for_timeout(250);check('play resumes animation',snapshot!=page.locator('#prev').evaluate('(x)=>x.toDataURL()'))
     colors=page.locator('#pal input').count();page.locator('#padd').click();check('add palette color',page.locator('#pal input').count()==colors+1);page.locator('#prem').click();check('remove palette color',page.locator('#pal input').count()==colors)
     page.locator('#dir').select_option('-1');page.locator('#bri2').evaluate("x=>{x.value='0';x.dispatchEvent(new Event('input',{bubbles:true}))}");page.locator('#spd2').evaluate("x=>{x.value='0';x.dispatchEvent(new Event('input',{bubbles:true}))}")
     page.locator('#pname').fill('QA zero preset');page.locator('#psave').click();page.get_by_role('button',name='Presets',exact=True).click();check('preset appears',page.get_by_text('QA zero preset (rainbow)',exact=True).count()==1)
     with page.expect_download() as d:page.locator('#pexp').click()
     exported=Q/('cozy-'+str(mobile)+'.json');d.value.save_as(str(exported));data=json.loads(exported.read_text());preset=next(x for x in data['presets'] if x['name']=='QA zero preset');check('export preserves zero settings',preset['anim']['brightness']==0 and preset['anim']['speed']==0)
     page.locator('#pimp').set_input_files(dict(name='qa.json',mimeType='application/json',buffer=json.dumps({'presets':[preset]}).encode()));page.wait_for_timeout(300)
     stored=page.evaluate("JSON.parse(localStorage.getItem('cozystudio.presets.v1'))");check('import roundtrip preserves zero settings',stored[-1]['anim']['brightness']==0 and stored[-1]['anim']['speed']==0)
     page.reload(wait_until='domcontentloaded');page.wait_for_timeout(500);page.get_by_role('button',name='Presets',exact=True).click();check('presets survive reload',page.get_by_text('QA zero preset (rainbow)',exact=True).count()==2)
    elif case=='carbon':
     goto('/carbon.html');page.locator('#startBtn').click()
     for i in range(15):page.locator('#optionsGrid button').first.click();check('question '+str(i+1)+' accepts an answer',page.locator('#nextBtn').is_enabled());page.locator('#nextBtn').click()
     expect(page.locator('#resultsView')).to_be_visible();value=float(page.locator('#resultTotal').inner_text());check('complete questionnaire produces finite nonnegative result',0<=value<1000)
     page.reload(wait_until='domcontentloaded');page.locator('#resumeBtn').click();expect(page.locator('#resultsView')).to_be_visible();check('completed questionnaire resumes',True);page.locator('#retakeBtn').click();check('retake resets answers',page.locator('#nextBtn').is_disabled())
    elif case=='code':
     goto('/code.html',2200);page.locator('#code').fill('print(2 + 2)');page.get_by_role('button',name='Run',exact=True).click();page.wait_for_function("document.getElementById('terminal').innerText.includes('4')",timeout=20000);check('Python runner executes',True)
     page.get_by_role('button',name='Clear',exact=True).click();check('terminal clears','4' not in page.locator('#terminal').inner_text())
     with page.expect_download() as d:page.get_by_role('button',name='Download',exact=True).click()
     exported=Q/('code-'+str(mobile)+'.py');d.value.save_as(str(exported));check('code download preserves editor content','print(2 + 2)' in exported.read_text())
     for function,asset in [('triggerSixSeven','67.gif'),('triggerBazooka','bazooka.gif'),('triggerData','data.gif'),('triggerEpstein','user.gif'),('triggerRickroll','rick.gif')]:
      page.evaluate(function+'()');page.wait_for_function("asset=>[...document.images].some(x=>new URL(x.src).pathname.endsWith('/'+asset)&&x.complete&&x.naturalWidth>0)",arg=asset,timeout=12000);check(function+' loads original GIF',True)
    elif case=='focus':
     goto('/focus.html');page.evaluate("window.dispatchEvent(new Event('focus'));window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'))");check('focus counts one departure once',page.locator('#count').inner_text()=='1')
    elif case=='login-admin':
     goto('/login.html',2500);page.locator('#emailLoginBtn').click();check('empty login remains on form','login' in page.url);check('Google login control available',page.locator('#googleLoginBtn').is_visible());goto('/hellopotato.html',2500);check('anonymous admin visitor sees sign-in gate',page.locator('#authGate').is_visible());check('anonymous admin content hidden',not page.locator('#adminContent').is_visible())
     for detector in ['3','6','2']:
      control=page.get_by_role('button',name=__import__('re').compile('^Band '+detector+',')).first
      expect(control).to_be_enabled(timeout=90000);control.click();expect(control).to_be_enabled(timeout=90000)
      print(json.dumps({'case':case,'mobile':mobile,'band_loaded':detector}),flush=True)
     check('band controls remain responsive',not errors);expect(page.locator('#stageReplay')).to_be_enabled(timeout=90000);page.locator('#stageReplay').click();page.wait_for_timeout(1000);check('motion preview remains responsive',not errors)
     check('no horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    elif case=='eysc':
     goto('/eysc.html',1500);page.wait_for_function("document.querySelector('video').readyState>=1||document.querySelector('video').error",timeout=25000)
     media=page.locator('video').evaluate('(v)=>({ready:v.readyState,error:v.error?.code,duration:Number.isFinite(v.duration)?v.duration:null,width:v.videoWidth,src:v.currentSrc})');check('original video sources load metadata',media['ready']>=1 and media['duration'] is not None and media['width']>0)
     check('download retains original raw GitHub URL','raw.githubusercontent.com/ANSHUMANTheOne/beacon-of-unity/main/voltwayvideo.mp4' in page.locator('#downloadBtn').get_attribute('href'))
    check('no uncaught browser errors',not errors)
   except Exception as error:failure=str(error)[:900]
   try:page.screenshot(path=str(Q/(case+('-mobile' if mobile else '-desktop')+'.png')))
   except:pass
   row=dict(base_url=case_origin,case=case,mobile=mobile,checks=checks,passed=failure is None,failure=failure,page_errors=errors,blocked_mutations=sorted(set(blocked)),dialogs=dialogs)
   results=[x for x in results if (x['case'],x['mobile'])!=(case,mobile)]+[row];old.write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8');print(json.dumps(dict(case=case,mobile=mobile,passed=row['passed'],failure=failure,checks=len(checks))),flush=True)
   context.close()
 browser.close()
if server:server.shutdown()
print(json.dumps(dict(flows=len(results),passed=sum(x['passed'] for x in results),assertions=sum(len(x['checks']) for x in results))),flush=True)

raise SystemExit(0 if results and all(x["passed"] for x in results) else 1)
