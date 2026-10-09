import { chromium } from '/root/pi-web/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const root='/root/noname-cloud/evidence';
const browser=await chromium.launch({executablePath:'/root/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const events=[];
async function until(page,fn,timeout=60000){const end=Date.now()+timeout;while(Date.now()<end){try{if(await page.evaluate(fn))return;}catch{}await page.waitForTimeout(500);}throw new Error('State wait timed out: '+fn.toString().slice(0,120));}
async function boot(name){
 const context=await browser.newContext();const page=await context.newPage();
 await page.route('**/preload.js',route=>route.fulfill({status:404,body:''}));
 page.on('pageerror',e=>{events.push({name,error:String(e)});console.log('pageerror',name,String(e));});
 page.on('console',m=>{if(m.type()==='error')console.log('console',name,m.text().slice(0,500));});
 page.on('response',r=>{if(r.status()>=400||r.url().endsWith('.ts'))console.log('response',r.status(),r.url());});
 page.on('framenavigated',f=>{if(f===page.mainFrame())console.log('navigation',name,f.url());});
 page.on('dialog',async d=>{events.push({name,dialog:d.message()});console.log('dialog',name,d.message().slice(0,200));if(d.message().includes('重置')||d.message().includes('未正常')||d.message().includes('邀请链接'))await d.dismiss();else await d.accept();});
 await page.route('**/cloud-seed.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>seed</title>'}));
 await page.goto('http://127.0.0.1:18091/cloud-seed.html',{waitUntil:'domcontentloaded',timeout:20000});
 await page.evaluate(async()=>{
  localStorage.setItem('gplv3_noname_alerted','true');localStorage.setItem('noname_0.9_loadtime','120000');sessionStorage.setItem('isJITReloaded','true');sessionStorage.setItem('canUseTs','true');
  await new Promise((resolve,reject)=>{const r=indexedDB.open('noname_0.9_data',4);r.onupgradeneeded=()=>{for(const n of ['config','data','image','audio'])if(!r.result.objectStoreNames.contains(n))r.result.createObjectStore(n);if(!r.result.objectStoreNames.contains('video'))r.result.createObjectStore('video',{keyPath:'time'});};r.onerror=reject;r.onsuccess=()=>{const db=r.result;const tx=db.transaction('config','readwrite');const s=tx.objectStore('config');for(const [k,v] of Object.entries({mode:'connect',new_tutorial:true,show_splash:'off',version:'1.11.7',characters:['standard','shenhua','refresh'],cards:['standard','extra'],extensions:[],totouched:true,touchscreen:false,game_speed:'vvfast',background_music:'music_off',volumn_audio:0,volumn_background:0}))s.put(v,k);tx.oncomplete=()=>{db.close();resolve();};};});
 });
 await page.goto('http://127.0.0.1:18091/',{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(2000);
 console.log('before-ready',name,await page.evaluate(async()=>{const {lib,ui}=await import('/noname.js');return {version:lib.version,mode:lib.config?.mode,characters:Object.keys(lib.character).length,ip:!!ui.ipnode,body:document.body.innerText.slice(0,600),resources:performance.getEntriesByType('resource').filter(r=>r.name.includes('init')||r.name.endsWith('.ts')).map(r=>r.name)};}));
 await until(page,async()=>{const {ui,lib}=await import('/noname.js');return !!ui.ipnode&&Object.keys(lib.character).length>10;});
 await page.waitForTimeout(500);
 await page.screenshot({path:root+'/'+name+'-boot.png'});
 console.log('body',name,(await page.textContent('body')).slice(0,1600));
 console.log('sandbox probe', await page.evaluate(async()=>{const {game,lib}=await import('/noname.js');const {security}=await import('/noname/util/sandbox.js');const box=await import('/noname/util/sandbox/sandbox.js');return {sandboxEnabled:box.SANDBOX_ENABLED,SandboxType:typeof box.Sandbox,version:lib.version,characters:Object.keys(lib.character).length,resources:performance.getEntriesByType('resource').filter(r=>r.name.includes('sandbox')).map(r=>r.name)};}));
 await page.evaluate(async()=>{const {game}=await import('/noname.js');game.connect('ws://127.0.0.1:18082');});
 await until(page,async()=>{const {game}=await import('/noname.js');return game.onlinehall===true;},20000);
 console.log('booted',name);return page;
}
try{
 const host=await boot('host');
 const config=await host.evaluate(async()=>{const {lib,game,get}=await import('/noname.js');lib.configOL.mode='identity';const c={};for(const k in lib.mode.identity.connect){if(k!=='update')c[k.slice(8)]=get.config(k,'identity');}Object.assign(c,{mode:'identity',player_number:'8',number:8,identity_mode:'normal',characterPack:['standard','shenhua','refresh'],cardPack:['standard','extra'],banned:[],bannedcards:[],choose_timeout:'10',observe:true});lib.configOL=c;const original=lib.message.client.createroom;lib.message.client.createroom=function(...args){const switchOriginal=game.switchMode;game.switchMode=function(name){game.switchMode=switchOriginal;return switchOriginal.call(game,name,c);};return original.apply(this,args);};game.send('server','create',game.onlineKey,'云端主持','caocao');return c;});
 await until(host,async()=>{const {_status}=await import('/noname.js');return _status.waitingForPlayer;},30000);
 const room=await host.evaluate(async()=>{const {game}=await import('/noname.js');return game.roomId;});
 console.log('room',room,JSON.stringify(config));
 const client=await boot('client');
 await client.evaluate(async id=>{const {game}=await import('/noname.js');game.send('server','enter',id,'测试玩家','liubei');},room);
 await until(client,async()=>{const {game}=await import('/noname.js');return !!game.onlineID;},30000);
 console.log('joined');
 await host.evaluate(async()=>{const {ui}=await import('/noname.js');ui.connectStartButton.click();});
 await until(host,async()=>{const {game}=await import('/noname.js');return !!game.me;},30000);
 await host.evaluate(async()=>{const {ui,_status}=await import('/noname.js');if(!_status.auto)ui.click.auto('forced');});
 await client.evaluate(async()=>{const {ui,_status}=await import('/noname.js');if(!_status.auto)ui.click.auto('forced');});
 await host.evaluate(async()=>{const {ui,_status,lib}=await import('/noname.js');lib.config.game_speed='vvfast';if(!_status.auto)ui.click.auto('forced');});
 await client.evaluate(async()=>{const {ui,_status}=await import('/noname.js');if(!_status.auto)ui.click.auto('forced');});
 for(let i=0;i<120;i++){await host.waitForTimeout(1000);if(i%10===0)console.log('progress',await host.evaluate(async()=>{const {game,_status}=await import('/noname.js');return {round:game.roundNumber,event:_status.event?.name,auto:_status.auto,over:_status.over,players:game.players.filter(p=>p.name).length};}));if(await host.evaluate(async()=>{const {_status}=await import('/noname.js');return !!_status.over;}))break;}
 const state=async p=>p.evaluate(async()=>{const {game,lib,_status}=await import('/noname.js');return {mode:lib.config.mode,online:game.online,hosting:game.onlineroom,event:_status.event?.name,paused:_status.paused,over:_status.over,players:game.players.map(p=>({id:p.playerid,name:p.name,hp:p.hp,online:p.isOnline?.()})),text:document.body.innerText.slice(-1800)};});
 const result={room,config,host:await state(host),client:await state(client),events};
 await fs.writeFile(root+'/cloud-room.json',JSON.stringify(result,null,2));
 await host.screenshot({path:root+'/host-room.png'});await client.screenshot({path:root+'/client-room.png'});
 console.log(JSON.stringify(result,null,2));
}catch(e){console.error(e);await fs.writeFile(root+'/cloud-room-errors.json',JSON.stringify(events,null,2));process.exitCode=1;}finally{await browser.close();}
