import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';

fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle',timeout:30000});
 await page.waitForTimeout(1500);
 let status=await page.locator('#status').textContent();
 console.log('Initial status:',status);
 await page.screenshot({path:'artifacts/jester-desktop.png',fullPage:true});
 assert.ok(!status.includes('NO SE PUDO'),status);
 assert.ok(!errors.length,'JS errors: '+errors.join('; '));
 const canvas=await page.locator('#game-canvas').evaluate(c=>({w:c.width,h:c.height}));
 assert.ok(canvas.w>=500&&canvas.h>=100,'Invalid PlayCanvas canvas size '+JSON.stringify(canvas));
 await page.locator('#turbo-button').click();
 await page.locator('#spin-button').click();
 await page.waitForFunction(() => !document.getElementById('spin-button').disabled, undefined, {timeout:30000});
 status=await page.locator('#status').textContent();
 console.log('Post-spin status:',status);
 assert.ok(!status.includes('NO SE PUDO'),status);
 assert.ok(await page.locator('#spin-button').isEnabled(),'Spin button remained disabled');
 await page.screenshot({path:'artifacts/jester-post-spin.png',fullPage:true});
 await page.locator('#buy-feature').click();
 assert.ok(await page.locator('#buy-dialog').evaluate(e=>e.open),'Bonus modal did not open');
 await page.locator('#buy-cancel').click();
 await page.setViewportSize({width:425,height:820});
 await page.waitForTimeout(650);
 const mobile=await page.locator('#game-canvas').evaluate(c=>({canvas:c.getBoundingClientRect().width,viewport:c.parentElement.getBoundingClientRect().width,pixels:c.width}));
 assert.ok(Math.abs(mobile.canvas-mobile.viewport)<3,'Canvas overflows mobile viewport: '+JSON.stringify(mobile));
 assert.ok(mobile.pixels>=300,'Mobile WebGL resolution too small: '+JSON.stringify(mobile));
 await page.screenshot({path:'artifacts/jester-mobile.png',fullPage:true});
 assert.ok(!errors.length,'JS errors: '+errors.join('; '));
 console.log('WebGL smoke test passed; screenshots in artifacts/');
}finally{await browser.close();}
