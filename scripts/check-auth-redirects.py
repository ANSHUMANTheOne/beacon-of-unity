"""Test existing Beacon redirects with isolated Firebase fixtures, never real accounts."""
import argparse,functools,http.server,json,os,pathlib,shutil,tempfile,threading
from playwright.sync_api import sync_playwright,expect
from validate import validate
ROOT=pathlib.Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--directory',type=pathlib.Path,default=ROOT/'dist');parser.add_argument('--case');parser.add_argument('--browser',default=os.environ.get('BEACON_BROWSER_EXECUTABLE'));args=parser.parse_args()
assert validate(ROOT,args.directory.resolve(),ROOT/'config/routes.json')['passed'],'Build a source-matching artifact first'
work=ROOT/'.verification/auth-redirects';work.mkdir(parents=True,exist_ok=True);os.environ['TEMP']=str(work);os.environ['TMP']=str(work);tempfile.tempdir=str(work)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(args.directory.resolve())));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
browser_path=args.browser or shutil.which('google-chrome') or shutil.which('chromium')
if not browser_path and pathlib.Path(r'C:\Program Files\Google\Chrome\Application\chrome.exe').exists():browser_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe'
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(**({'executable_path':browser_path} if browser_path else {}),headless=True,args=['--no-sandbox','--mute-audio'])
 for mobile in [False,True]:
  cases=[('login-approved','login.html','approved'),('login-pending','login.html','waiting for approval'),('login-banned','login.html','banned'),('login-guest','login.html','guest'),('dashboard-guest','dashboard.html','guest')]+[('logout-'+name+'-'+control,name,'silent') for name in ['dashboard.html','dashboard_updated.html'] for control in ['logoutBtn','logoutBtnNav','logoutBtnInner']]
  for case,path,state in cases:
   if args.case and case!=args.case:continue
   demo_suppressed=path=='dashboard_updated.html' and case.rsplit('-',1)[-1] in ['logoutBtn','logoutBtnInner']
   context=browser.new_context(viewport={'width':390 if mobile else 1440,'height':844 if mobile else 1000},is_mobile=mobile,reduced_motion='reduce');blocked=[];errors=[];checks=[]
   target=None if demo_suppressed else 'dashboard.html' if state=='approved' else 'login.html' if case.startswith(('logout-','dashboard-guest')) else None
   auth="""export const getAuth=()=>({currentUser:{uid:'qa-fixture',email:'qa@example.invalid'}});export const onAuthStateChanged=(auth,cb)=>{STATE!=='silent'&&setTimeout(()=>cb(STATE==='guest'?null:{uid:'qa-fixture',email:'qa@example.invalid'}),0);return()=>{}};export const signOut=async()=>{window.__fixtureSignOut=(window.__fixtureSignOut||0)+1};export const getRedirectResult=async()=>null;export class GoogleAuthProvider{addScope(){}setCustomParameters(){}};""".replace('STATE',json.dumps(state))
   auth+=';'.join('export const '+n+'=async()=>{throw Error("Real sign-in disabled in redirect fixture")}' for n in ['signInWithEmailAndPassword','createUserWithEmailAndPassword','signInWithPopup','signInWithRedirect'])+';'
   firestore="export const getFirestore=()=>({});export const doc=(...x)=>x;export const getDoc=async()=>({exists:()=>true,data:()=>(DATA)});export const getDocs=async()=>({docs:[],empty:true,forEach(){}});export const onSnapshot=()=>()=>{};".replace('DATA',json.dumps({'status':state,'banned':state=='banned','fullName':'QA Fixture','region':'General'}))
   firestore+=';'.join('export const '+n+'=(...x)=>x' for n in ['collection','query','orderBy','where','serverTimestamp','arrayUnion','increment'])+';'
   firestore+=';'.join('export const '+n+'=async()=>{throw Error("Live writes disabled in redirect fixture")}' for n in ['setDoc','addDoc','updateDoc','deleteDoc'])+';'
   def route(r):
    url=r.request.url
    if r.request.method not in ('GET','HEAD','OPTIONS'):blocked.append(r.request.method+' '+url.split('?')[0]);r.abort();return
    if 'www.gstatic.com/firebasejs/' in url:
     source='export const initializeApp=()=>({});' if url.endswith('firebase-app.js') else auth if url.endswith('firebase-auth.js') else firestore if url.endswith('firebase-firestore.js') else None
     if source is not None:r.fulfill(status=200,content_type='application/javascript',body=source);return
    if any(host in url for host in ['firestore.googleapis.com','identitytoolkit.googleapis.com','securetoken.googleapis.com']):blocked.append('LIVE_ENDPOINT');r.abort();return
    if target and url.split('?')[0]==base+'/'+target and r.request.is_navigation_request():r.fulfill(status=200,content_type='text/html',body='<title>Fixture redirect target</title><p>Redirect reached existing public path.</p>');return
    r.continue_()
   context.route('**/*',route);page=context.new_page();page.set_default_timeout(10000);page.on('pageerror',lambda e:errors.append(str(e)));dialogs=[];page.on('dialog',lambda d:(dialogs.append(d.message),d.dismiss()));failure=None
   def check(name,value):checks.append({'name':name,'passed':bool(value)});assert value,name
   try:
    response=page.goto(base+'/'+path,wait_until='commit');check('original entry serves HTML',response.status==200)
    if case.startswith('logout-'):
     control=case.rsplit('-',1)[1];page.wait_for_function('(id)=>typeof document.getElementById(id)?.onclick==="function"',arg=control);
     try:page.locator('#'+control).evaluate('(button)=>button.click()')
     except Exception as error:
      if 'ERR_ABORTED' not in str(error):raise
    if target:
     expect(page).to_have_url(base+'/'+target,timeout=10000);expect(page.get_by_text('Redirect reached existing public path.',exact=True)).to_be_visible();check('existing public redirect target renders',page.url==base+'/'+target)
    elif demo_suppressed:
     check('standalone demo preserves its disabled logout notice',any('Demo mode' in d for d in dialogs));check('demo stays at its existing route',page.url.endswith('/dashboard_updated.html'));check('demo does not sign out an account',page.evaluate('window.__fixtureSignOut||0')==0)
    elif state=='waiting for approval':expect(page.locator('#verifySection')).to_be_visible();check('pending approval remains in existing verification view',not page.locator('#uploadControls').is_visible())
    elif state=='banned':expect(page.locator('#loginForm')).to_be_visible();expect(page.locator('#statusMsg')).to_contain_text('suspended');check('banned fixture stays on login',page.url.endswith('/login.html'))
    else:expect(page.locator('#loginForm')).to_be_visible();check('anonymous login stays on login',page.url.endswith('/login.html'))
    check('no uncaught JavaScript errors',not errors);check('no attempted live writes',not blocked)
   except Exception as error:failure=str(error)[:800]
   row={'case':case,'mobile':mobile,'passed':failure is None,'failure':failure,'checks':checks,'page_errors':errors,'blocked_requests':blocked,'dialogs':dialogs};results.append(row);print(json.dumps({'case':case,'mobile':mobile,'passed':row['passed'],'failure':failure,'page_errors':errors}),flush=True);context.close()
 browser.close()
server.shutdown();report={'scope':'Redirect behavior with local Firebase fixtures; no real sign-in, database calls or writes; destination HTML intercepted only after navigation, actual artifact files verified separately.','flows':len(results),'passed':sum(x['passed'] for x in results),'assertions':sum(len(x['checks']) for x in results),'results':results};(work/'results.json').write_bytes((json.dumps(report,indent=2)+'\n').encode());print(json.dumps({k:report[k] for k in ['flows','passed','assertions']}));raise SystemExit(0 if all(x['passed'] for x in results) else 1)
