import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const url='http://127.0.0.1:4173/examples/optical-assembly/?qa';
const evidence='docs/evidence';
async function load(page) {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(url);await page.waitForFunction(()=>window.sceneQA);await expect.poll(()=>page.evaluate(()=>window.sceneQA.state().renderCount)).toBeGreaterThan(0);return errors;
}
const state=page=>page.evaluate(()=>window.sceneQA.state());
async function settled(page){await expect.poll(async()=> (await state(page)).animating).toBe(false);await page.waitForTimeout(100);}
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(await page.evaluate(()=>[...document.querySelectorAll('button,h1,h2,p,label')].filter(e=>e.getBoundingClientRect().width&&e.scrollWidth>e.clientWidth+1).map(e=>e.textContent))).toEqual([]);}

test('desktop: real picking, keyboard expansion, focus, drag and reset',async({page})=>{
 const errors=await load(page);await settled(page);expect((await state(page)).revision).toBe('186');await noOverflow(page);await page.screenshot({path:`${evidence}/desktop-initial.png`,fullPage:true});
 const slider=page.locator('#explode');await slider.focus();await page.keyboard.press('End');await expect.poll(async()=> (await state(page)).expansion).toBe(1);
 const positions=Object.values((await state(page)).positions);expect(positions.every(p=>p[1]===0&&p[2]===0)).toBe(true);expect(positions.every((p,i)=>i===0||p[0]>positions[i-1][0])).toBe(true);
 const p=await page.evaluate(()=>window.sceneQA.project('front'));await page.mouse.move(p.x,p.y);await expect.poll(async()=> (await state(page)).hovered).toBe('front');await page.mouse.click(p.x,p.y);await expect.poll(async()=> (await state(page)).selected).toBe('front');await expect(page.locator('[data-part=front]')).toHaveAttribute('aria-pressed','true');
 await page.screenshot({path:`${evidence}/desktop-expanded.png`,fullPage:true});
 await page.getByRole('button',{name:'Focus selected'}).click();await settled(page);expect((await state(page)).target[0]).toBeCloseTo((await state(page)).positions.front[0]);
 await slider.focus();await page.keyboard.press('Home');expect((await state(page)).target[0]).toBeCloseTo((await state(page)).positions.front[0]);
 const box=await page.locator('canvas').boundingBox();await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.5+90,box.y+box.height*.5+25,{steps:8});await page.mouse.up();expect((await state(page)).selected).toBe('front');
 await page.getByRole('button',{name:'Reset',exact:true}).click();await settled(page);expect((await state(page)).selected).toBe(null);expect((await state(page)).expansion).toBe(.35);expect((await state(page)).zoom).toBe(1);expect(errors).toEqual([]);
});

test('alternate view, no idle loop, low quality and measured render cost',async({page})=>{
 const errors=await load(page);await page.getByRole('button',{name:'Exterior'}).click();await settled(page);expect((await state(page)).view).toBe('exterior');await page.screenshot({path:`${evidence}/desktop-exterior.png`,fullPage:true});
 const count=(await state(page)).renderCount;await page.waitForTimeout(350);expect((await state(page)).renderCount).toBe(count);
 const standard=await state(page);await page.locator('#low-quality').check();await settled(page);expect((await state(page)).dpr).toBe(1);const low=await state(page);
 const timing=await page.evaluate(async()=>{const deltas=[];let prev=performance.now();for(let i=0;i<75;i++){await new Promise(requestAnimationFrame);const now=performance.now();if(i>=15)deltas.push(now-prev);prev=now;const slider=document.querySelector('#explode');slider.value=String(i*100/74);slider.dispatchEvent(new Event('input',{bubbles:true}));}deltas.sort((a,b)=>a-b);return{samples:deltas.length,medianMs:deltas[30],p95Ms:deltas[57],maxMs:deltas.at(-1),method:'60 requestAnimationFrame intervals after 15 warmup frames during synthetic slider updates; headless Chromium; not GPU timing'};});
 await fs.writeFile(`${evidence}/performance.json`,JSON.stringify({browser:page.context().browser().version(),viewport:page.viewportSize(),standard,low,timing},null,2));expect(standard.info.render.calls).toBeGreaterThan(0);expect(standard.info.render.triangles).toBeGreaterThan(0);expect(errors).toEqual([]);
});

test('narrow touch and keyboard paths preserve layout and page scrolling',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const page=await context.newPage();const errors=await load(page);
 await expect(page.locator('canvas')).toHaveCSS('touch-action','pan-y');await page.locator('[data-part=rear]').tap();expect((await state(page)).selected).toBe('rear');await page.locator('#explode').focus();await page.keyboard.press('End');expect((await state(page)).expansion).toBe(1);await noOverflow(page);
 await page.locator('#touch-toggle').tap();await expect(page.locator('canvas')).toHaveCSS('touch-action','none');await page.locator('#touch-toggle').tap();await expect(page.locator('canvas')).toHaveCSS('touch-action','pan-y');
 await page.screenshot({path:`${evidence}/mobile-expanded.png`,fullPage:true});await page.locator('#reset').tap();await settled(page);expect((await state(page)).selected).toBe(null);await noOverflow(page);expect(errors).toEqual([]);await context.close();
});

test('reduced motion reaches focus immediately',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await load(page);await page.locator('[data-part=spacer]').focus();await page.keyboard.press('Enter');expect((await state(page)).selected).toBe('spacer');await page.locator('#focus').click();expect((await state(page)).animating).toBe(false);expect((await state(page)).target[0]).toBeCloseTo((await state(page)).positions.spacer[0]);
});

test('WebGL creation failure keeps a useful fallback',async({page})=>{
 await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:old.call(this,type,...args);};});
 await page.goto(url);await page.waitForFunction(()=>window.sceneQA);expect((await state(page)).fallback).toBe(true);await expect(page.locator('#fallback')).toBeVisible();await expect(page.locator('#explode')).toBeDisabled();await page.locator('[data-part=front]').click();await expect(page.locator('#detail-title')).toHaveText('Front lens');await page.screenshot({path:`${evidence}/fallback.png`,fullPage:true});
});

test('context loss preserves explanation and disables inactive 3D controls',async({page})=>{
 await load(page);await page.evaluate(()=>window.sceneQA.loseContext());await expect.poll(async()=> (await state(page)).fallback).toBe(true);await expect(page.locator('canvas')).toBeHidden();await expect(page.locator('#fallback svg')).toBeVisible();await expect(page.locator('#focus')).toBeDisabled();await page.locator('[data-part=barrel]').click();await expect(page.locator('#detail-title')).toHaveText('Barrel');await page.screenshot({path:`${evidence}/context-loss.png`,fullPage:true});
});

test('module failure shows the original accessible 2D alternative',async({page})=>{
 await page.route('**/main.js',route=>route.abort());await page.goto(url);await expect(page.locator('#fallback-message')).toContainText('failed to load');await expect(page.locator('#fallback')).toBeVisible();await expect(page.locator('#explode')).toBeDisabled();
});

test('dispose and remount do not accumulate owned resources or canvases',async({page})=>{
 await load(page);const baseline=(await state(page)).info.memory;const cycles=[];
 for(let i=0;i<3;i++){
  await page.evaluate(()=>window.sceneQA.dispose());expect((await state(page)).alive).toBe(false);await expect(page.locator('canvas')).toHaveCount(0);const count=(await state(page)).renderCount;await page.waitForTimeout(100);expect((await state(page)).renderCount).toBe(count);
  cycles.push((await state(page)).info.memory);
  await page.evaluate(i=>import(`./main.js?cycle=${i}`),i);await settled(page);await expect(page.locator('canvas')).toHaveCount(1);expect((await state(page)).info.memory).toEqual(baseline);
 }
 await fs.writeFile(`${evidence}/lifecycle.json`,JSON.stringify({baseline,afterDispose:cycles,method:'three explicit dispose/import cycles on same DOM; GPU resource counts and canvas count, not a full browser heap profile'},null,2));
});
