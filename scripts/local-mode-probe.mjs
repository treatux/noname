import { chromium } from '/root/pi-web/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const root='/root/noname-cloud/evidence';
const browser=await chromium.launch({executablePath:'/root/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const events=[];
let activeHost;
const mode=process.env.TEST_MODE||'boss';
const seconds=Number(process.env.TEST_SECONDS||600);
const runName=process.env.RUN_NAME||mode;
const samples=[];
const started=Date.now();
async function until(page,fn,timeout=60000){const end=Date.now()+timeout;while(Date.now()<end){try{if(await page.evaluate(fn))return;}catch{}await page.waitForTimeout(500);}throw new Error('State wait timed out: '+fn.toString().slice(0,120));}
async function boot(name){
 const context=await browser.newContext();const page=await context.newPage();
 await page.addInitScript(()=>{const Native=WebSocket;window.cloudNet={sent:0,received:0,messages:0};window.WebSocket=class extends Native{constructor(...args){super(...args);this.addEventListener('message',e=>{window.cloudNet.received+=typeof e.data==='string'?new TextEncoder().encode(e.data).length:0;window.cloudNet.messages++;});}send(data){window.cloudNet.sent+=typeof data==='string'?new TextEncoder().encode(data).length:0;return super.send(data);}};});
 await page.route('**/preload.js',route=>route.fulfill({status:404,body:''}));
 page.on('pageerror',e=>{events.push({name,error:String(e)});console.log('pageerror',name,String(e));});
 page.on('console',m=>{if(m.type()==='error')console.log('console',name,m.text().slice(0,500));});
 page.on('response',r=>{if(r.status()>=400||r.url().endsWith('.ts'))console.log('response',r.status(),r.url());});
 page.on('framenavigated',f=>{if(f===page.mainFrame())console.log('navigation',name,f.url());});
 page.on('dialog',async d=>{events.push({name,dialog:d.message()});console.log('dialog',name,d.message().slice(0,200));if(d.message().includes('重置')||d.message().includes('未正常')||d.message().includes('邀请链接'))await d.dismiss();else await d.accept();});
 await page.route('**/cloud-seed.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>seed</title>'}));
 await page.goto('http://127.0.0.1:18091/cloud-seed.html',{waitUntil:'domcontentloaded',timeout:20000});
 await page.evaluate(async mode=>{
  localStorage.setItem('gplv3_noname_alerted','true');localStorage.setItem('noname_0.9_loadtime','120000');sessionStorage.setItem('isJITReloaded','true');sessionStorage.setItem('canUseTs','true');
  await new Promise((resolve,reject)=>{const r=indexedDB.open('noname_0.9_data',4);r.onupgradeneeded=()=>{for(const n of ['config','data','image','audio'])if(!r.result.objectStoreNames.contains(n))r.result.createObjectStore(n);if(!r.result.objectStoreNames.contains('video'))r.result.createObjectStore('video',{keyPath:'time'});};r.onerror=reject;r.onsuccess=()=>{const db=r.result;const tx=db.transaction('config','readwrite');const s=tx.objectStore('config');for(const [k,v] of Object.entries({mode,new_tutorial:true,show_splash:'off',version:'1.11.7',characters:['standard','shenhua','refresh'],cards:['standard','extra'],extensions:[],totouched:true,touchscreen:false,game_speed:'vvfast',connect_mode:'identity',connect_read_clipboard:false,background_music:'music_off',volumn_audio:0,volumn_background:0}))s.put(v,k);tx.oncomplete=()=>{db.close();resolve();};};});
 },mode);
 await page.goto('http://127.0.0.1:18091/',{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(2000);
 console.log('before-ready',name,await page.evaluate(async()=>{const {lib,ui}=await import('/noname.js');return {version:lib.version,mode:lib.config?.mode,characters:Object.keys(lib.character).length,ip:!!ui.ipnode,body:document.body.innerText.slice(0,600),resources:performance.getEntriesByType('resource').filter(r=>r.name.includes('init')||r.name.endsWith('.ts')).map(r=>r.name)};}));
 await until(page,async()=>{const {ui,lib}=await import('/noname.js');return !!lib.version&&Object.keys(lib.character).length>10;});
 await page.waitForTimeout(500);
 await page.screenshot({path:root+'/'+name+'-boot.png'});
 console.log('body',name,(await page.textContent('body')).slice(0,1600));
 console.log('sandbox probe', await page.evaluate(async()=>{const {game,lib}=await import('/noname.js');const {security}=await import('/noname/util/sandbox.js');const box=await import('/noname/util/sandbox/sandbox.js');return {sandboxEnabled:box.SANDBOX_ENABLED,SandboxType:typeof box.Sandbox,version:lib.version,characters:Object.keys(lib.character).length,resources:performance.getEntriesByType('resource').filter(r=>r.name.includes('sandbox')).map(r=>r.name)};}));
 return page;
}

try{
 const page=await boot('local-'+mode);
 if(mode==='brawl') {
  await until(page,()=>!!document.querySelector('.menubutton.round.highlight'));
  await page.locator('.menubutton.round.highlight').filter({hasText:'斗'}).click();
  await until(page,async()=>{const {game}=await import('/noname.js');return game.players.length>0;});
 }
 await page.evaluate(async()=>{const {ui,_status,lib}=await import('/noname.js');lib.config.game_speed='vvfast';if(!_status.auto)ui.click.auto('forced');});
 await page.waitForTimeout(15000);
 const result=await page.evaluate(async()=>{const {game,lib,_status}=await import('/noname.js');return {mode:lib.config.mode,event:_status.event?.name,players:game.players.map(p=>({name:p.name,hp:p.hp})),over:_status.over,body:document.body.innerText.slice(-2500),errors:[]};});
 result.errors=events;await fs.writeFile(root+'/local-'+runName+'.json',JSON.stringify(result,null,2));await page.screenshot({path:root+'/local-'+runName+'.png'});console.log(JSON.stringify(result,null,2));
}catch(e){console.error(e);await fs.writeFile(root+'/local-'+mode+'-errors.json',JSON.stringify(events,null,2));process.exitCode=1;}finally{await browser.close();}
