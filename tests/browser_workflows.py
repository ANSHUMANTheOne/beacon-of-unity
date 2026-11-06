from playwright.sync_api import sync_playwright
from pathlib import Path
import json,sys
sys.stdout.reconfigure(encoding='utf-8');out=Path('playwright-results');out.mkdir(exist_ok=True);results=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 for w,h in [(320,740),(390,844),(1440,900)]:
  if len(sys.argv)>1 and str(w) not in sys.argv[1:]:continue
  c=b.new_context(viewport={'width':w,'height':h},is_mobile=w<700,has_touch=w<700);page=c.new_page();page.set_default_timeout(12000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)));r={'width':w,'checks':[]}
  def test(name,fn):
   try:fn();r['checks'].append({'name':name,'pass':True})
   except Exception as e:r['checks'].append({'name':name,'pass':False,'error':str(e)[:450]})
  page.goto('http://127.0.0.1:4174/dashboard_updated.html?demo=1',wait_until='domcontentloaded');page.wait_for_timeout(2500)
  def chat():
   page.locator('#requestFeed .btn-help').first.click();page.locator('#chatPopup').wait_for(state='visible');page.locator('#msgInput').fill('Happy to help — checking the demo.');page.locator('#sendMsgBtn').click();page.wait_for_timeout(800);assert 'Happy to help' in page.locator('#messageArea').inner_text();page.screenshot(path=str(out/f'verified-{w}-chat.png'));page.locator('#chatBackBtn').click();assert not page.locator('#chatPopup').is_visible()
  test('help-message-send-close',chat)
  def reopen():
   if w<700:page.locator('.app-bottom-nav [data-tab="chats-mobile"]').click()
   page.get_by_role('button',name='Open',exact=True).filter(visible=True).first.click();assert 'Happy to help' in page.locator('#messageArea').inner_text();page.locator('#chatBackBtn').click()
  test('conversation-history',reopen)
  def post():
   if w<700:page.locator('.app-bottom-nav [data-tab="create"]').click()
   else:page.locator('#fabBtn').click()
   page.locator('#reqTitle').fill('Design verification — demo only');page.locator('#reqLoc').fill('Al Majaz');page.locator('#reqDesc').fill('A local demo request for testing the existing form.');page.locator('#submitReqBtn').click();page.wait_for_timeout(400);page.evaluate("window.switchTab('community')");assert 'Design verification' in page.locator('#requestFeed').inner_text()
  test('demo-request-submit',post)
  def found():
   page.evaluate("window.switchTab('lostfound')");page.get_by_role('searchbox',name='Search lost and found').fill('wallet');assert page.locator('#lfFeed .card:visible').count()>0;page.get_by_role('searchbox',name='Search lost and found').fill('');page.locator('#lfFeed .btn-help').first.click();page.locator('#chatPopup').wait_for(state='visible');page.screenshot(path=str(out/f'verified-{w}-lostfound-chat.png'));page.locator('#chatBackBtn').click()
  test('lostfound-search-contact',found)
  page.goto('http://127.0.0.1:4174/',wait_until='domcontentloaded');page.wait_for_timeout(2000)
  def embed():
   page.locator('[data-demo]').first.click();page.frame_locator('#demo-frame').locator('#requestFeed .card').first.wait_for(state='visible');page.get_by_role('button',name='Close demo',exact=True).click();assert not page.locator('#demo-dialog').is_visible()
  test('homepage-demo-integration',embed)
  def double():
   if page.locator("#beacon-hide").get_attribute("aria-expanded")!="true":
    page.locator("#beacon-hide").click();page.wait_for_timeout(1000)
   if w<700:page.locator('#bav-wrap').tap();page.wait_for_timeout(80);page.locator('#bav-wrap').tap()
   else:page.locator('#bav-wrap').dblclick()
   page.locator('#bav-chat.open').wait_for(state='visible');page.locator('#bav-chat-close').click()
  test('mascot-double-gesture',double)
  r['errors']=errors;results.append(r);print(r,flush=True);c.close()
 (out/'workflow-checks.json').write_text(json.dumps(results,indent=2),encoding='utf-8');b.close()

assert all(c["pass"] for r in results for c in r["checks"]), "Workflow failures; inspect playwright-results/workflow-checks.json"
assert all(not r["errors"] for r in results), "Browser errors detected"
