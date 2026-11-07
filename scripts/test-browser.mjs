import assert from 'node:assert/strict';
import {launch} from './browser-harness.mjs';
const app=await launch({width:1280,height:900});const {page,context,baseUrl,errors}=app;
const number=async key=>Number(await page.locator('#hud').getAttribute(`data-${key}`));
async function waitNumber(key,test,timeout=25000){await page.waitForFunction(({key,test})=>{const n=Number(document.querySelector('#hud').dataset[key]);return test==='positive'?n>0:n>=test;},{key,test},{timeout});}
async function press(key,ms){await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);}
async function clickObject(id){const b=await page.locator(`[data-object-id="${id}"]`).boundingBox();assert.ok(b,`Object${id} label visible`);await page.mouse.click(b.x+b.width/2,b.y+b.height/2);}
try{
 await page.goto(baseUrl,{waitUntil:'networkidle'});await page.locator('#world canvas').waitFor({state:'visible'});
 assert.equal(await page.locator('.arcade').getAttribute('href'),'https://intrepion.github.io/');await page.keyboard.press('Tab');assert.equal(await page.locator('.arcade').evaluate(e=>document.activeElement===e),true);
 await page.locator('#about').click();assert.match(await page.locator('.fidelity').textContent(),/not an exact remake/);await page.keyboard.press('Escape');assert.equal(await page.locator('#overlay').isHidden(),true);
 await page.locator('#start').focus();await page.keyboard.press('Space');await waitNumber('time','positive');assert.equal(await page.locator('#hud').getAttribute('data-phase'),'playing');
 await page.keyboard.press('f');await page.waitForTimeout(300);await page.keyboard.press('f');await page.waitForTimeout(300);await page.keyboard.press('f');
 await page.waitForFunction(()=>document.querySelector('[data-object-id="1"]').textContent.includes('3 / 3'),null,{timeout:15000});await waitNumber('parts',1,45000);assert.equal(await page.locator('#parts').textContent(),'01');
 await clickObject(7);await waitNumber('grown',2,30000);await press('s',500);await page.keyboard.press('e');await page.waitForTimeout(250);assert.equal(await number('seedlings'),0);
 const x=await number('x');await press('d',500);await page.waitForTimeout(150);assert.ok((await number('x'))>x+1.2);await press('a',500);
 await page.keyboard.press('2');assert.equal(await page.locator('#hud').getAttribute('data-selected'),'yellow');await page.keyboard.press('q');assert.equal(await page.locator('#hud').getAttribute('data-selected'),'blue');
 await page.keyboard.press('Escape');const time=await number('time');await page.waitForTimeout(600);assert.equal(await number('time'),time);await page.locator('#resume').click();
 await page.keyboard.press('Tab');assert.equal(await page.locator('.base-dialog').isVisible(),true);const field=await number('field');await page.locator('[data-deploy="red"]').click();assert.equal(await number('field'),field+10);await page.locator('[data-store="red"]').click();assert.equal(await number('field'),field);await page.keyboard.press('Escape');
 await page.keyboard.press('x');assert.equal(await number('follow'),0); // Public dismissal and recall at the captain's visible position.
 await page.mouse.move(640,510);await press(' ',1000);assert.ok((await number('follow'))>0);
 await page.keyboard.press('Escape');await page.locator('#sunset').click();await page.locator('#keep-day').click();assert.equal(await page.locator('#overlay').isHidden(),true);
 await page.keyboard.press('Escape');await page.locator('#sunset').click();await page.locator('#confirm-sunset').click();assert.equal(await page.locator('.sunset-dialog').isVisible(),true);
 await page.locator('#help').click();await page.keyboard.press('Escape');assert.equal(await page.locator('.sunset-dialog').isVisible(),true);
 await page.locator('[data-zone="1"]').click();await page.locator('#next-day').click();await page.waitForTimeout(300);assert.equal(await number('day'),2);assert.match(await page.locator('#zone-name').textContent(),/COPPERLEAF/);
 await page.keyboard.press('Escape');await page.locator('#to-menu').click();assert.equal(await page.locator('#continue').isVisible(),true);await page.reload({waitUntil:'networkidle'});await page.locator('#continue').click();assert.equal(await number('day'),2);assert.equal(await number('parts'),1);
 await page.keyboard.press('Escape');await page.locator('#to-menu').click();await page.locator('#start').click();await page.locator('#cancel-new').click();assert.equal(await page.locator('#menu').isVisible(),true);await page.locator('#start').click();await page.locator('#confirm-start').click();assert.equal(await number('day'),1);assert.equal(await number('parts'),0);
 const mobile=await context.newPage();await mobile.setViewportSize({width:390,height:844});await mobile.goto(baseUrl,{waitUntil:'networkidle'});assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await mobile.locator('#continue').click();const old=Number(await mobile.locator('#hud').getAttribute('data-x'));const r=await mobile.locator('#joystick').boundingBox();await mobile.mouse.move(r.x+50,r.y+50);await mobile.mouse.down();await mobile.mouse.move(r.x+84,r.y+50);await mobile.waitForTimeout(600);await mobile.mouse.up();await mobile.waitForTimeout(150);assert.ok(Number(await mobile.locator('#hud').getAttribute('data-x'))>old+1);await mobile.locator('#pause').click();await mobile.locator('#pause-base').click();assert.equal(await mobile.locator('.base-dialog').isVisible(),true);await mobile.keyboard.press('Escape');await mobile.screenshot({path:'/tmp/morrow-mobile.png'});await mobile.close();
 assert.deepEqual(errors,[]);console.log('PASS: WebGL; backlink; keyboard launch/navigation; aimed throws and weighted hauling; food/seed/pluck; movement; type selection; pause; reserves; dismiss/recall; sunset cancellation; summary help interruption; unlocked region; reload persistence; restart confirmation; mobile fit and joystick.');
}finally{await app.close();}
