"""Run the real dashboard module against an isolated Firebase test double.

No production accounts, writes or messages are used. This verifies frontend
subscription behavior; it does not verify deployed Firestore rules or indexes.
"""
import json,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
out=root/'playwright-results'/'original-flow';out.mkdir(parents=True,exist_ok=True)
fixture=(root/'tests/fixtures/dashboard-firebase.js').read_text()
source=(root/'website/runtime/entries/769c79c5c71b05178595.dat').read_text(encoding='utf-8')
category=source[source.index('        const _CATS ='):source.index('        function _ago(')]
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 for width in [1440,390,320,360,375,430,768,1024,1920]:
  context=browser.new_context(viewport={'width':width,'height':900 if width>700 else 844},is_mobile=width<700,has_touch=width<700)
  def route_request(route):
   if 'www.gstatic.com/firebasejs/' in route.request.url:route.fulfill(content_type='application/javascript',body=fixture)
   elif route.request.url.startswith('http://127.0.0.1:4174') or route.request.resource_type in ['image','font','stylesheet','script']:route.continue_()
   else:route.fulfill(content_type='application/json',body='{"status":"ok","items":[]}',headers={'Access-Control-Allow-Origin':'*'})
  context.route('**/*',route_request)
  context.add_init_script("try{if(location.origin==='http://127.0.0.1:4174')localStorage.setItem('bou_news_cache',JSON.stringify({t:Date.now(),items:[{title:'Gukesh visits temple before chess championship',description:'Sri Venkateswara temple and Jawokhir Sindarov',category:'conflict',source:'toi',sourceName:'Times of India',pubDate:new Date().toISOString(),link:'https://example.test/article'}]}))}catch{}")
  page=context.new_page();page.set_default_timeout(15000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('http://127.0.0.1:4174/dashboard.html',wait_until='domcontentloaded')
  expect(page.locator('#welcomeUser')).to_have_text('Hello, Test Neighbour')
  expect(page.locator('#requestFeed .card')).to_have_count(1)
  expect(page.locator('.app-welcome')).to_be_visible()
  expect(page.locator('.app-wordmark span')).to_have_text('BEACONOF UNITY')
  page.locator('#fabBtn').hover();assert page.locator('#fabBtn').evaluate('(e)=>getComputedStyle(e).transform')=='none'
  page.locator('#fabBtn').click();expect(page.locator('#requestModal')).to_be_visible();page.evaluate('closeRequestModal()')
  page.wait_for_function('window._map');page.wait_for_timeout(600)
  pins=page.evaluate('()=>{let labels=[];_map.eachLayer(l=>{if(l.getPopup())labels.push(l.getPopup().getContent())});return labels}')
  assert any('Help with groceries' in x for x in pins) and any('Visible keys' in x for x in pins),pins
  assert not any('phantom' in x.lower() or 'Another emirate' in x for x in pins),pins
  page.evaluate("__dashboardFixture.remove('lostfound/current-item')")
  page.wait_for_function('()=>{let found=false;_map.eachLayer(l=>{if(l.getPopup()?.getContent().includes("Visible keys"))found=true});return !found}')
  # Unread arrives through the actual onSnapshot handlers, without reload.
  page.wait_for_function('document.querySelector("#activeChatsList .chat-unread")')
  page.evaluate("resumeChat('member-a_member-b_live-request','Other Neighbour','member-b','lostfound','member-b')")
  expect(page.locator('#chatPopup')).to_be_visible();page.wait_for_function('!document.querySelector("#activeChatsList .chat-unread")')
  page.wait_for_timeout(150);page.evaluate('__dashboardFixture.receive()')
  expect(page.locator('#messageArea')).to_contain_text('A new live message')
  page.wait_for_function('!__dashboardFixture.data.get("chats/member-a_member-b_live-request")["unread_member-a"]')
  page.screenshot(path=str(out/f'{width}-phone-chat.png'))
  assert page.locator('#chatPopup').bounding_box()['width']<=361
  if width==390:
   page.evaluate("Object.defineProperty(visualViewport,'height',{configurable:true,get:()=>450});visualViewport.dispatchEvent(new Event('resize'))")
   box=page.locator('#chatPopup').bounding_box();assert box['y']>=0 and box['y']+box['height']<=450,box
   page.evaluate("delete visualViewport.height;visualViewport.dispatchEvent(new Event('resize'))")
  page.evaluate('closeChatPopup();__dashboardFixture.receive()')
  page.wait_for_function('document.querySelector("#activeChatsList .chat-unread")')
  if width<700:expect(page.locator('.app-chat-unread')).to_be_visible()
  # Ending a chat must not report success if the write fails.
  page.evaluate("resumeChat('member-a_member-b_live-request','Other Neighbour','member-b','lostfound','member-b')")
  page.wait_for_timeout(200);page.evaluate('__dashboardFixture.failDelete=true')
  page.locator('#chatFooterBar .endchat button').click();page.locator('#endChatYes').click()
  expect(page.locator('#chatActionError')).to_be_visible();expect(page.locator('#chatPopup')).to_be_visible()
  page.evaluate('__dashboardFixture.failDelete=false')
  page.locator('#chatFooterBar .endchat button').click();page.locator('#endChatYes').click()
  expect(page.locator('#chatPopup')).not_to_be_visible();expect(page.locator('#activeChatsList .chat-list-item')).to_have_count(0)
  page.evaluate('toggleNotifDrawer()');expect(page.locator('#notifList')).not_to_contain_text('Old read notice');expect(page.locator('#notifList')).to_contain_text('New notification')
  page.once('dialog',lambda d:d.accept());page.locator('#clearAllNotifications').click()
  page.wait_for_function('!__dashboardFixture.data.has("notifications/new-unread")')
  assert page.evaluate('__dashboardFixture.data.has("notifications/other-user")')
  page.evaluate('toggleNotifDrawer()');page.reload(wait_until='domcontentloaded')
  expect(page.locator('#requestFeed .card')).to_have_count(1);expect(page.locator('.app-welcome')).not_to_be_visible()
  page.wait_for_function('window._map');page.wait_for_timeout(1200)
  page.screenshot(path=str(out/f'{width}-returning-hub.png'))
  if width==1440:
   page.evaluate("document.querySelector('#reqTitle').value='Keep my draft';BeaconTutorial.start();BeaconTutorial._begin()")
   for _ in range(9):page.evaluate('BeaconTutorial._next()')
   expect(page.locator('#requestModal')).to_be_visible()
   post=page.locator('#fabBtn').bounding_box();skip=page.locator('#bt-skp').bounding_box()
   assert not (post['x']<skip['x']+skip['width'] and skip['x']<post['x']+post['width'] and post['y']<skip['y']+skip['height'] and skip['y']<post['y']+post['height'])
   page.evaluate('BeaconTutorial._finish();BeaconTutorial._enterDash()');page.wait_for_timeout(1100)
   expect(page.locator('#requestModal')).not_to_be_visible()
   assert not page.locator('#submitReqBtn').evaluate('(e)=>e._tutorialHooked')
   assert page.locator('#reqTitle').input_value()=='Keep my draft'
   assert page.locator('#bt-sim-mypost').count()==0
   page.locator('#fabBtn').click();expect(page.locator('#requestModal')).to_be_visible();page.evaluate('closeRequestModal()')
  page.evaluate("switchTab('reliable-news')");expect(page.locator('#newsFeed')).to_contain_text('Sports')
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  assert not errors,errors
  results.append({'width':width,'passed':True});print(results[-1],flush=True);context.unroute_all(behavior='wait');context.close()
 # Run exact production categorisation code against clear regression cases.
 page=browser.new_page()
 cases=[
  ("Gukesh visits Tirumala ahead of World C'ship title defence","The championship will be played by Jawokhir Sindarov at Sri Venkateswara temple.",'sports'),
  ('Military airstrikes target army base','An attack with missiles','conflict'),
  ('Ukraine wins football tournament','National team scores a goal','sports'),
  ('Film award ceremony','A celebrity wins an award','entertainment'),
  ('WHO vaccine programme','Health news','health'),
  ('New AI software launches','Technology announcement','tech'),
  ('Airstrikes hit stadium','Football match abandoned after military bombing','conflict'),
  ('War of words before championship','A player defends a title','sports')]
 cases += [('Army deploys along border','The defence ministry announced new exercises','conflict'),('Navy wins football cup','A championship match','sports')]
 actual=page.evaluate('(args)=>{'+category+';return args.map(([t,d])=>_categorise(t,d))}',cases)
 assert actual==[x[2] for x in cases],actual
 browser.close()
(out/'checks.json').write_text(json.dumps({'workflows':results,'newsCases':len(cases)},indent=2));print('Dashboard frontend checks passed.')
