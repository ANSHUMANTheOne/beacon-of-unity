"""Click through the complete tutorial with an isolated Firebase backend."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
out=root/'playwright-results/tutorial-actions';out.mkdir(parents=True,exist_ok=True)
fixture=(root/'tests/fixtures/dashboard-firebase.js').read_text(encoding='utf-8')
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 cases=[('dashboard.html',1440),('dashboard.html',390),('dashboard.html',320),('dashboard_updated.html?demo=1',390)]
 if os.getenv('TUTORIAL_NORMAL_MOTION'):cases=cases[:1]
 if os.getenv('TUTORIAL_DEMO_ONLY'):cases=cases[-1:]
 for url,width in cases:
  context=browser.new_context(viewport={'width':width,'height':900 if width>800 else 844},is_mobile=width<800,has_touch=width<800,reduced_motion='no-preference' if os.getenv('TUTORIAL_NORMAL_MOTION') else 'reduce')
  def route_request(route):
   if 'www.gstatic.com/firebasejs/' in route.request.url:route.fulfill(content_type='application/javascript',body=fixture)
   elif route.request.url.startswith('http://127.0.0.1:4174') or route.request.resource_type in ['image','font','stylesheet','script']:route.continue_()
   else:route.fulfill(content_type='application/json',body='{"items":[]}',headers={'Access-Control-Allow-Origin':'*'})
  context.route('**/*',route_request)
  context.add_init_script("try{localStorage.setItem('bou_tutorial_done','1')}catch{}")
  page=context.new_page();page.set_default_timeout(30000);errors=[];page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',str(e),flush=True)))
  page.goto('http://127.0.0.1:4174/'+url,wait_until='domcontentloaded')
  page.wait_for_function('!!window.BeaconTutorial && !!window.switchTab')
  if url=='dashboard.html':expect(page.locator('#welcomeUser')).to_have_text('Hello, Test Neighbour')
  def step(n):
   expect(page.locator('#bt-root')).to_have_attribute('data-step',str(n));print(url,width,'step',n,flush=True)
  def click_next(n):
   step(n);page.locator('#bt-nxt').click();step(n+1)
  def start():
   page.evaluate("document.querySelector('#reqTitle').value='Keep my draft';BeaconTutorial.start()")
   page.locator('#bt-go-btn').click();step(0)
  def reach_post():
   click_next(0);click_next(1)
   if url=='dashboard.html':page.evaluate("__dashboardFixture.put('requests/live-request',{...__dashboardFixture.data.get('requests/live-request'),title:'Updated during tutorial'})")
   page.locator('#bt-sim-help-btn').click();step(3)
   page.locator('#bt-sim-msg-field').fill('I can help with your appointment')
   page.wait_for_timeout(800);page.locator('#bt-sim-send-btn').click();step(4)
   expect(page.locator('#bt-sim-end-btn')).to_be_enabled()
   page.screenshot(path=str(out/f'{width}-{url.split("?")[0]}-end-chat.png'))
   page.locator('#bt-sim-end-btn').click();step(5)
   page.locator('#bt-sim-rating button').last.click();step(6)
   click_next(6);click_next(7)
   page.locator('#fabBtn').click();step(9)
   expect(page.locator('#requestModal')).to_be_visible()
   expect(page.locator('#reqTitle')).to_have_value('Need a ladder for ceiling repair')
  start();reach_post()
  page.screenshot(path=str(out/f'{width}-{url.split("?")[0]}-practice-form.png'))
  page.locator('#requestModal [onclick*=closeRequestModal]').click();step(8)
  page.locator('#fabBtn').click();step(9)
  expect(page.locator('#reqTitle')).to_have_value('Need a ladder for ceiling repair')
  page.locator('#submitReqBtn').click();step(10)
  expect(page.locator('#bt-sim-mypost')).to_be_visible()
  for n in range(10,18):click_next(n)
  page.locator('#app-map-button' if width<=800 else '#minimap-widget').click();step(19)
  page.locator('#bt-nxt').click();page.locator('#bt-fgo').click()
  expect(page.locator('#bt-root')).to_have_count(0)
  assert page.locator('#bt-sim-mypost').count()==0
  assert page.locator('#reqTitle').input_value()=='Keep my draft'
  assert not page.locator('#submitReqBtn').evaluate('(e)=>e._tutorialHooked')
  if url=='dashboard.html':
   writes=page.evaluate('__dashboardFixture.writes');assert not any(x.get('path','').startswith(('requests/','chats/')) for x in writes),writes
  # Leaving during the practice form must restore the existing draft and normal controls.
  start();reach_post();page.locator('#bt-skp').click();page.locator('#bt-wrn button').last.click()
  page.locator('#bt-fgo').click();expect(page.locator('#bt-root')).to_have_count(0)
  expect(page.locator('#requestModal')).not_to_be_visible()
  assert page.locator('#reqTitle').input_value()=='Keep my draft'
  page.evaluate("switchTab('community')");page.locator('#fabBtn').click();expect(page.locator('#requestModal')).to_be_visible()
  assert not page.locator('#submitReqBtn').evaluate('(e)=>e._tutorialHooked')
  assert not errors,errors
  results.append({'route':url,'width':width,'passed':True});context.close()
 browser.close()
(out/('results-normal-motion.json' if os.getenv('TUTORIAL_NORMAL_MOTION') else 'results.json')).write_text(json.dumps(results,indent=2))
