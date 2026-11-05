from playwright.sync_api import sync_playwright
from pathlib import Path
import json,sys
sys.stdout.reconfigure(encoding='utf-8');out=Path('playwright-results');out.mkdir(exist_ok=True);rows=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 for w,h in [(320,740),(360,800),(375,812),(390,844),(430,932),(768,1024),(1024,768),(1440,900),(1920,1080),(844,390)]:
  c=b.new_context(viewport={'width':w,'height':h},has_touch=w<=800,is_mobile=w<=800);page=c.new_page();page.set_default_timeout(20000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)[:180]))
  page.goto('http://127.0.0.1:4174/dashboard_updated.html?demo=1',wait_until='domcontentloaded');page.wait_for_timeout(2000);r={'width':w,'height':h,'screens':[]}
  for tab in ['community','lostfound','leaderboard','volunteer-opps','reliable-news','thankyou','rewards','badges','updates','chats-mobile']:
   page.evaluate('(tab)=>window.switchTab(tab)',tab);page.wait_for_timeout(250)
   r['screens'].append({'tab':tab,'overflow':page.evaluate('document.documentElement.scrollWidth>innerWidth')});page.screenshot(path=str(out/f'matrix-{w}x{h}-{tab}.png'))
  if w<=800:page.locator('.app-bottom-nav [data-tab="more"]').click();page.screenshot(path=str(out/f'matrix-{w}x{h}-navigation.png'))
  r['errors']=errors;rows.append(r);c.close();print(w,'done',flush=True);(out/'all-screen-matrix.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
 for w,h in [(1440,900),(390,844),(320,740)]:
  c=b.new_context(viewport={'width':w,'height':h},has_touch=w<700,is_mobile=w<700);page=c.new_page();page.goto('http://127.0.0.1:4174',wait_until='domcontentloaded');page.wait_for_timeout(2500)
  for name in ['home','story-help','story-found','story-volunteer','story-unity','community','trust','beyond','questions','join']:
   page.evaluate('(id)=>window.scrollTo({top:document.getElementById(id).offsetTop,behavior:"instant"})',name);page.wait_for_timeout(650);page.screenshot(path=str(out/f'final-{w}-{name}.png'))
  page.evaluate('window.scrollTo({top:document.body.scrollHeight,behavior:"instant"})');page.wait_for_timeout(400);page.screenshot(path=str(out/f'final-{w}-footer.png'));c.close()
 b.close()

assert all(not s["overflow"] for r in rows for s in r["screens"]), "Horizontal overflow detected"
assert all(not r["errors"] for r in rows), "Browser errors detected"
