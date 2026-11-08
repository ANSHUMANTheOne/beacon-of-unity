"""Search layout, persistent lost/found and admin messaging, isolated from Firebase."""
import json,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1];out=root/'playwright-results/member-messaging';out.mkdir(parents=True,exist_ok=True)
fixture=(root/'tests/fixtures/dashboard-firebase.js').read_text(encoding='utf-8')
admin='vVzdX3mSWqWHgTLKQpfrrPb5dSv1';results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 for width,role in [(1440,'member'),(390,'member'),(320,'member'),(1440,'admin'),(390,'admin')]:
  context=browser.new_context(viewport={'width':width,'height':900 if width>800 else 844},is_mobile=width<800,has_touch=width<800,reduced_motion='reduce')
  source=fixture.replace('member-a',admin).replace('member-a@example.test','luckyansh.t@gmail.com') if role=='admin' else fixture
  if role=='admin':source=source.replace(admin+'@example.test','luckyansh.t@gmail.com')
  def route_request(route):
   if 'www.gstatic.com/firebasejs/' in route.request.url:route.fulfill(content_type='application/javascript',body=source)
   elif route.request.url.startswith('http://127.0.0.1:4174') or route.request.resource_type in ['image','font','stylesheet','script']:route.continue_()
   else:route.fulfill(content_type='application/json',body='{"items":[]}',headers={'Access-Control-Allow-Origin':'*'})
  context.route('**/*',route_request);page=context.new_page();page.set_default_timeout(12000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('http://127.0.0.1:4174/dashboard.html',wait_until='domcontentloaded');expect(page.locator('#welcomeUser')).to_have_text('Hello, Test Neighbour')
  for tab,selector in [('community','#requestFeed'),('lostfound','#lfFeed')]:
   page.evaluate('(tab)=>switchTab(tab)',tab)
   search=page.locator(selector).locator('xpath=preceding-sibling::div[contains(@class,"app-filterbar")]').locator('input')
   assert float(search.evaluate('(e)=>parseFloat(getComputedStyle(e).paddingLeft)'))>=39
   search.fill('no matches');expect(page.locator(selector+' .card:visible')).to_have_count(0);search.fill('')
  expect(page.locator('#lfFeed')).to_contain_text('Older unclaimed umbrella')
  expect(page.locator('#lfFeed')).not_to_contain_text('left')
  assert page.evaluate("__dashboardFixture.data.has('lostfound/expired-item')")
  assert not page.evaluate("__dashboardFixture.writes.some(w=>w.path==='lostfound/expired-item'&&w.operation==='delete')")
  page.wait_for_function('window._map');page.wait_for_timeout(400)
  assert page.evaluate('()=>{let yes=false;_map.eachLayer(l=>{if(l.getPopup()?.getContent().includes("Older unclaimed umbrella"))yes=true});return yes}')
  page.screenshot(path=str(out/f'{width}-{role}-search-and-items.png'))
  page.once('dialog',lambda d:d.accept());page.locator('#lfFeed .card').filter(has_text='Older unclaimed umbrella').get_by_role('button',name=re.compile('Delete')).click()
  expect(page.locator('#lfFeed')).not_to_contain_text('Older unclaimed umbrella')
  if role=='member':
   expect(page.locator('.admin-message-action')).to_have_count(0)
   before=page.evaluate('__dashboardFixture.writes.length');page.evaluate("startAdminChat('member-b');openAdminMessagePicker()")
   assert page.evaluate('__dashboardFixture.writes.length')==before
   # A role field and chatType cannot turn a normal sender into an admin.
   page.evaluate("""()=>{const f=__dashboardFixture;f.put('chats/member-a_member-b_spoof',{participants:['member-a','member-b'],chatType:'admin',admin:true,itemLabel:'Untrusted claim'});f.put('chats/member-a_member-b_spoof/messages/m',{text:'Not an administrator',senderId:'member-b',senderRole:'admin',createdAt:f.stamp(Date.now())});resumeChat('member-a_member-b_spoof','Other Neighbour','member-b','admin','member-b')}""")
   expect(page.locator('#messageArea')).to_contain_text('Not an administrator');expect(page.locator('#messageArea .app-admin-badge')).to_have_count(0)
   # A message from the established admin UID is labelled for the recipient.
   page.evaluate("""admin=>{const f=__dashboardFixture;f.put('users/'+admin,{fullName:'Anshuman Tripathy'});const id=[admin,'member-a'].sort().join('_')+'_admin';f.put('chats/'+id,{participants:[admin,'member-a'],chatType:'admin',itemLabel:'Beacon of Unity admin','unread_member-a':true});f.put('chats/'+id+'/messages/m',{text:'How can I help?',senderId:admin,createdAt:f.stamp(Date.now())});resumeChat(id,'Anshuman Tripathy',admin,'admin',admin)}""",admin)
   expect(page.locator('#chatSubline')).to_contain_text('Admin');expect(page.locator('#messageArea .app-admin-badge')).to_have_text('Admin')
   page.screenshot(path=str(out/f'{width}-recipient-admin-chat.png'))
  else:
   page.evaluate("switchTab('community')" if width>800 else "switchTab('chats-mobile')")
   action=page.locator('.admin-message-action:visible');expect(action).to_have_count(1);action.click()
   expect(page.locator('#adminMessageModal')).to_be_visible();page.locator('#adminRecipientSearch').fill('Other Neighbour')
   expect(page.locator('.admin-recipient-row')).to_have_count(1)
   page.evaluate('__dashboardFixture.failSet=true');page.locator('.admin-recipient-row').click();expect(page.locator('#adminMessageStatus')).to_contain_text('Could not open')
   page.evaluate('__dashboardFixture.failSet=false');page.locator('.admin-recipient-row').click()
   expect(page.locator('#chatPopup')).to_be_visible();expect(page.locator('#chatSubline')).to_contain_text('messaging as Admin')
   page.locator('#msgInput').fill('Hello from the admin');page.locator('#sendMsgBtn').click()
   expect(page.locator('#messageArea')).to_contain_text('Hello from the admin');expect(page.locator('#messageArea .app-admin-badge')).to_have_text('Admin')
   chat_id='_'.join(sorted([admin,'member-b']))+'_admin'
   assert page.evaluate('(id)=>__dashboardFixture.data.get("chats/"+id)["unread_member-b"]',chat_id)
   page.wait_for_function("[...__dashboardFixture.data].some(([path,value])=>path.startsWith('notifications/')&&value.toUid==='member-b'&&value.title?.includes('Admin'))")
   # Reopening the same member preserves conversation history.
   page.evaluate('closeChatPopup()');page.evaluate("startAdminChat('member-b')");expect(page.locator('#messageArea')).to_contain_text('Hello from the admin')
   page.screenshot(path=str(out/f'{width}-admin-sent-chat.png'))
   page.evaluate("closeChatPopup();openUserProfile({uid:'member-b',name:'Other Neighbour',pts:0})")
   page.locator('#adminMessageFromProfile').click();expect(page.locator('#chatPopup')).to_be_visible()
   expect(page.locator('#messageArea')).to_contain_text('Hello from the admin')
  assert not errors,errors
  results.append({'width':width,'role':role,'passed':True});print(results[-1],flush=True);context.close()
 browser.close()
(out/'results.json').write_text(json.dumps(results,indent=2))
