from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path('playwright-results/cinematic');out.mkdir(parents=True,exist_ok=True);rows=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 for w,h in [(320,800),(360,800),(375,812),(390,844),(430,932),(768,1024),(1024,768),(1440,900),(1920,1080),(844,390)]:
  c=b.new_context(viewport={'width':w,'height':h},is_mobile=w<700,has_touch=w<700);page=c.new_page();errs=[];page.on('pageerror',lambda e:errs.append(str(e)));page.goto('http://127.0.0.1:4174',wait_until='domcontentloaded');page.wait_for_timeout(2200);r={'width':w,'height':h,'screens':[]}
  for id in ['home','story-help','story-found','story-volunteer','story-unity','community','how','trust','compare','beyond','questions','join']:
   page.evaluate('(id)=>scrollTo({top:document.getElementById(id).offsetTop,behavior:"instant"})',id);page.wait_for_timeout(1200 if w in [320,390,1440] else 250)
   r['screens'].append({'id':id,'overflow':page.evaluate('document.documentElement.scrollWidth>innerWidth')})
   if w in [320,390,1440]:page.screenshot(path=str(out/f'{w}-{id}.png'))
  r['errors']=errs;rows.append(r);print(w,'done',flush=True);c.close();(out/'viewport-checks.json').write_text(json.dumps(rows,indent=2))
 page=b.new_page(viewport={'width':1440,'height':900});page.goto('http://127.0.0.1:4174');page.wait_for_timeout(1600)
 page.locator('#unity-canvas').focus();page.keyboard.press('ArrowRight');page.wait_for_timeout(400);yaw=page.evaluate('window.__unityWorld.yaw');assert yaw>.05
 page.keyboard.press('Escape');page.mouse.move(900,190);page.mouse.down();page.mouse.move(1050,190,steps=12);page.mouse.up();page.wait_for_timeout(400);assert page.evaluate('window.__unityWorld.yaw')>.1
 page.get_by_role('button',name='Open navigation').click();page.wait_for_timeout(400);page.screenshot(path=str(out/'navigation.png'));page.get_by_role('button',name='Close navigation',exact=True).click()
 print('Keyboard and drag interaction passed',flush=True);b.close()

assert all(not r["errors"] for r in rows)
assert all(not screen["overflow"] for r in rows for screen in r["screens"])
