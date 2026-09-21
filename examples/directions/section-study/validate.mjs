import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

// Run from the repository root after starting npm run dev. In a restricted host,
// launching Chromium may require the host's normal approval mechanism.
const destination=fileURLToPath(new URL('./',import.meta.url));
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl','--no-sandbox']});
const url='http://127.0.0.1:4173/examples/directions/section-study/?qa';
const errors=[];
const page=await browser.newPage({viewport:{width:1440,height:1080},deviceScaleFactor:1});
page.on('pageerror',e=>errors.push(e.message));
page.on('console',e=>{if(e.type()==='error')errors.push(e.text());});
try{
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.sectionQA?.state().ready);
  assert.equal(await page.evaluate(()=>window.sectionQA.state().revision),'186');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:destination+'desktop-initial.png',fullPage:true});
  const frames=await page.evaluate(()=>window.sectionQA.state().renders);
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>window.sectionQA.state().renders),frames,'idle scene must not render continuously');

  // Exercise real input paths. QA only supplies a projected target, never selection.
  const target=await page.evaluate(()=>window.sectionQA.project('front'));
  await page.mouse.click(target.x,target.y);
  assert.equal(await page.evaluate(()=>window.sectionQA.state().selected),'front');
  await page.locator('#focus').click();
  assert.equal(await page.evaluate(()=>window.sectionQA.state().focused),true);
  await page.locator('#focus').click();
  assert.equal(await page.evaluate(()=>window.sectionQA.state().focused),false);
  await page.locator('[data-part="rear"]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>window.sectionQA.state().selected),'rear');
  await page.locator('#expansion').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.evaluate(()=>window.sectionQA.state().expansion),0.25);
  await page.keyboard.press('End');
  assert.equal(await page.evaluate(()=>window.sectionQA.state().expansion),1);
  const positions=await page.evaluate(()=>window.sectionQA.positions());
  assert(positions.barrel<positions.rear&&positions.rear<positions.spacer&&positions.spacer<positions.front&&positions.front<positions.retainer);
  assert(positions.barrel+1.19<positions.rear-0.235,'at full expansion the rear lens must clear the barrel');
  await page.locator('#side').click();
  assert.equal(await page.evaluate(()=>window.sectionQA.state().side),true);
  await page.screenshot({path:destination+'desktop-expanded.png',fullPage:true});
  await page.locator('#reset').click();
  const reset=await page.evaluate(()=>window.sectionQA.state());
  assert.equal(reset.expansion,0.24);assert.equal(reset.selected,null);assert.equal(reset.side,false);assert.equal(reset.focused,false);

  // Lose an already-rendering context, not merely WebGL creation. Three r186 can
  // set an inline display style, so check actual canvas visibility explicitly.
  await page.evaluate(()=>{
    const gl=document.querySelector('#stage canvas').getContext('webgl2');
    const extension=gl?.getExtension('WEBGL_lose_context');
    if(!extension)throw new Error('WEBGL_lose_context is unavailable');
    extension.loseContext();
  });
  await page.waitForFunction(()=>!window.sectionQA.state().ready);
  assert.equal(await page.locator('#stage canvas').isHidden(),true);
  assert.equal(await page.locator('#stage canvas').evaluate(el=>getComputedStyle(el).display),'none');
  assert.equal(await page.locator('#fallback svg').isVisible(),true);
  assert.equal(await page.locator('#expansion').isDisabled(),true);
  assert.equal(await page.locator('#focus').isDisabled(),true);
  await page.locator('[data-part="rear"]').click();
  assert.match(await page.locator('#detail-name').textContent(),/Rear lens/);
  await page.screenshot({path:destination+'fallback.png',fullPage:true});
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.sectionQA?.state().ready);
  assert.equal(await page.locator('#stage canvas').isVisible(),true);
  assert.equal(await page.locator('#fallback').isHidden(),true);

  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push(e.message));
  await mobile.goto(url,{waitUntil:'networkidle'});
  await mobile.waitForFunction(()=>window.sectionQA?.state().ready);
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await mobile.locator('[data-part="front"]').tap();
  assert.equal(await mobile.evaluate(()=>window.sectionQA.state().selected),'front');
  await mobile.locator('#expansion').focus();
  await mobile.keyboard.press('End');
  await mobile.screenshot({path:destination+'mobile-expanded.png',fullPage:true});
  assert.equal(await mobile.evaluate(()=>getComputedStyle(document.querySelector('canvas')).touchAction),'pan-y');

  const fallback=await browser.newPage({viewport:{width:390,height:844}});
  await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...rest){return /^webgl/.test(type)?null:original.call(this,type,...rest);};});
  await fallback.goto(url,{waitUntil:'networkidle'});
  assert.equal(await fallback.locator('#fallback').isVisible(),true);
  assert.equal(await fallback.locator('#expansion').isDisabled(),true);
  await fallback.locator('[data-part="rear"]').click();
  assert.match(await fallback.locator('#detail-name').textContent(),/Rear lens/);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:['three-r186-render','desktop-no-overflow','idle-render-stop','canvas-pick','focus-return','keyboard-selection','keyboard-expansion','axial-order','side-view','reset','context-loss-fallback','reload-recovery','mobile-no-overflow','touch-selection','scroll-path','webgl-fallback'],browser:await browser.version(),desktop:[1440,1080],mobile:[390,844],deviceScaleFactor:1,renderer:reset.info,errors},null,2));
}finally{await browser.close();}
