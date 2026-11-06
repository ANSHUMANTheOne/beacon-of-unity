from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path('playwright-results');out.mkdir(exist_ok=True);results=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 for width in [1440,390]:
  page=b.new_page(viewport={'width':width,'height':900 if width>700 else 844},is_mobile=width<700,has_touch=width<700);page.set_default_timeout(15000);page.goto('http://127.0.0.1:4174',wait_until='domcontentloaded');page.wait_for_timeout(1000)
  for name,tab in [('help','community'),('found','lostfound'),('volunteer','volunteer-opps'),('news','reliable-news')]:
   page.locator('#tab-'+name).click();page.locator('.preview-cta').click();page.wait_for_function('document.querySelector("#demo-frame").contentWindow?.__beaconDemoReady===true');page.wait_for_timeout(250)
   selected=page.frame_locator('#demo-frame').locator('.nav-item.active').inner_text();assert {'help':'Community Hub','found':'Lost and Found','volunteer':'Volunteer Opportunities','news':'Reliable News'}[name] in selected,(name,selected)
   page.locator('#demo-dialog [data-close]').click()
  page.locator('#menu-toggle').click();numbers=page.locator('#navigation nav small').all_text_contents();assert len(set(numbers))==len(numbers)
  page.locator('#navigation .menu-actions [data-demo]').click();assert not page.locator('#navigation').evaluate('(e)=>e.open');assert page.locator('#demo-dialog').evaluate('(e)=>e.open');page.locator('#demo-dialog [data-close]').click()
  page.evaluate('scrollTo(0,0)');page.wait_for_timeout(400);page.locator('#beacon-hide').click();page.wait_for_timeout(1000)
  mascot=page.locator('#bav-wrap')
  if width<700:mascot.tap()
  else:mascot.click()
  page.locator('#bav-chat-input').wait_for(state='visible');page.locator('#bav-chat-close').click()
  if width>700:
   box=mascot.bounding_box();page.mouse.move(box['x']+20,box['y']+30);page.mouse.down();page.mouse.move(box['x']-120,box['y']-100,steps=12);page.mouse.up();page.wait_for_timeout(300);assert not page.locator('#bav-chat').evaluate('(e)=>e.classList.contains("open")')
  page.locator('#questions summary').first.click();assert page.locator('#questions details').first.get_attribute('open') is not None
  page.locator('#menu-toggle').click();page.locator('#theme-toggle').click();page.locator('#navigation [data-close]').click();assert page.locator('html').get_attribute('data-theme')=='dark'
  assert page.locator('#community').evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgb(13, 32, 48)'
  results.append({'width':width,'demoRoutes':True,'uniqueNavigation':True,'menuToDemo':True,'singleClickTap':True,'dragWithoutChat':width>700,'faq':True,'nightTokens':True});print(results[-1],flush=True);page.close()
 # Reduced motion: copy is immediately available and explicit stories remain opt-in.
 page=b.new_page(reduced_motion='reduce');page.goto('http://127.0.0.1:4174',wait_until='domcontentloaded');page.locator('#story-found').scroll_into_view_if_needed();page.wait_for_timeout(100)
 assert page.locator('#story-found h2').evaluate('(e)=>getComputedStyle(e).opacity')=='1'
 page.locator('.community-spaces').scroll_into_view_if_needed();page.locator('[data-scenario-action=neighbours]').wait_for(state='visible');page.locator('[data-scenario-action=neighbours]').click();page.wait_for_timeout(700);assert float(page.locator('.scene-story').get_attribute('data-playback-time'))>0
 results.append({'reducedMotionReadable':True,'explicitStoryPlayback':True});page.close()
 # WebGL fallback remains a composed neighbourhood with fully accessible content.
 page=b.new_page();page.add_init_script("const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:g.call(this,type,...args)}")
 page.goto('http://127.0.0.1:4174',wait_until='domcontentloaded');page.wait_for_timeout(1000);assert page.locator('html').evaluate('(e)=>e.classList.contains("world-unavailable")');page.screenshot(path=str(out/'refinement-fallback.png'));results.append({'webglFallback':True});b.close()
(out/'refinement-checks.json').write_text(json.dumps(results,indent=2));print('All refinement checks passed.')
