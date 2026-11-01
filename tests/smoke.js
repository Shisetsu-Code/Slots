import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';

fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:980,height:700},deviceScaleFactor:1});
 const errors=[];
 const browserWarnings=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('console',msg=>{
   if(msg.type()==='error'||msg.type()==='warning'){
     browserWarnings.push(msg.type()+': '+msg.text());
     console.log('Browser:',msg.type(),msg.text().slice(0,400));
   }
 });
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle',timeout:30000});
 await page.waitForTimeout(1500);
 const assetManifest=await page.evaluate(async()=>await (await fetch('/assets/manifest.json')).json());
 if(assetManifest.productionArtReady) {
   try {
     await page.waitForFunction(()=>Boolean(document.documentElement.dataset.productionArt),undefined,{timeout:60000});
     const state=await page.evaluate(()=>document.documentElement.dataset.productionArt);
     console.log('Production GLB loading status:',state,'warnings',JSON.stringify(browserWarnings.slice(-12)));
     assert.equal(state,'loaded','Production assets were rejected: '+browserWarnings.join('; '));
   }catch(e){
     console.log('Failed to load GLB art:',String(e),'errors',JSON.stringify(errors),'warnings',JSON.stringify(browserWarnings.slice(-12)));
     throw e;
   }
 }
 let status=await page.locator('#status').textContent();
 console.log('Initial status:',status);
 await page.screenshot({path:'artifacts/jester-desktop.png',fullPage:false,timeout:120000});
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
 await page.locator('#buy-feature').click();
 assert.ok(await page.locator('#buy-dialog').evaluate(e=>e.open),'Bonus modal did not open');
 await page.locator('#buy-cancel').click();
 // End-to-end bonus: the physical roulette must choose and credit free spins.
 await page.locator('#buy-feature').click();
 await page.locator('#buy-confirm').click();
 await page.waitForFunction(() => document.getElementById('wheel-outcome').classList.contains('active'),undefined,{timeout:10000});
 await page.screenshot({path:'artifacts/jester-bonus-wheel.png',fullPage:false,timeout:120000});
 await page.waitForFunction(() => document.getElementById('wheel-outcome').textContent.includes('GIROS GRATIS'),undefined,{timeout:90000});
 const prize=await page.locator('#wheel-outcome').textContent();
 console.log('Roulette result:',prize);
 assert.match(prize,/8|10|12|15/);
 await page.setViewportSize({width:425,height:820});
 await page.waitForTimeout(650);
 const mobile=await page.locator('#game-canvas').evaluate(c=>({canvas:c.getBoundingClientRect().width,viewport:c.parentElement.clientWidth,pixels:c.width}));
 assert.ok(Math.abs(mobile.canvas-mobile.viewport)<3,'Canvas overflows mobile viewport: '+JSON.stringify(mobile));
 assert.ok(mobile.pixels>=300,'Mobile WebGL resolution too small: '+JSON.stringify(mobile));
 await page.screenshot({path:'artifacts/jester-mobile.png',fullPage:false,timeout:120000});
 assert.ok(!errors.length,'JS errors: '+errors.join('; '));
 console.log('WebGL smoke test passed; screenshots in artifacts/');
}finally{await browser.close();}
