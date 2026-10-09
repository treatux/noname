import { chromium } from '/root/pi-web/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const root='/root/noname-cloud/evidence';
const browser=await chromium.launch({executablePath:'/root/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const events=[];
let activeHost;
const mode=process.env.TEST_MODE||'identity';
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
 await page.evaluate(async()=>{
  localStorage.setItem('gplv3_noname_alerted','true');localStorage.setItem('noname_0.9_loadtime','120000');sessionStorage.setItem('isJITReloaded','true');sessionStorage.setItem('canUseTs','true');
  await new Promise((resolve,reject)=>{const r=indexedDB.open('noname_0.9_data',4);r.onupgradeneeded=()=>{for(const n of ['config','data','image','audio'])if(!r.result.objectStoreNames.contains(n))r.result.createObjectStore(n);if(!r.result.objectStoreNames.contains('video'))r.result.createObjectStore('video',{keyPath:'time'});};r.onerror=reject;r.onsuccess=()=>{const db=r.result;const tx=db.transaction('config','readwrite');const s=tx.objectStore('config');for(const [k,v] of Object.entries({mode:'connect',new_tutorial:true,show_splash:'off',version:'1.11.7',characters:['standard','shenhua','refresh'],cards:['standard','extra'],extensions:[],totouched:true,touchscreen:false,game_speed:'vvfast',connect_mode:'identity',connect_read_clipboard:false,background_music:'music_off',volumn_audio:0,volumn_background:0}))s.put(v,k);tx.oncomplete=()=>{db.close();resolve();};};});
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
 const host=await boot('host');activeHost=host;
 if(process.env.HOST_HIDE_RENDER==='1')await host.addStyleTag({content:'body>*{visibility:hidden!important}'});
 const config=await host.evaluate(async mode=>{const {lib,game,get}=await import('/noname.js');lib.configOL.mode=mode;const c={};for(const k in lib.mode[mode].connect){if(k!=='update')c[k.slice(8)]=get.config(k,mode);}Object.assign(c,{mode,player_number:mode==='single'||mode==='versus'?'2':mode==='doudizhu'?'3':'8',number:mode==='single'||mode==='versus'?2:mode==='doudizhu'?3:8,identity_mode:'normal',...(mode==='versus'?{versus_mode:'1v1'}:{}),characterPack:['standard','shenhua','refresh'],cardPack:['standard','extra'],banned:[],bannedcards:[],choose_timeout:'10',observe:true});lib.configOL=c;const original=lib.message.client.createroom;lib.message.client.createroom=function(...args){const switchOriginal=game.switchMode;game.switchMode=function(name){game.switchMode=switchOriginal;return switchOriginal.call(game,name,c);};return original.apply(this,args);};game.send('server','create',game.onlineKey,'云端主持','caocao');return c;},mode);
 await until(host,async()=>{const {_status}=await import('/noname.js');return _status.waitingForPlayer;},30000);
 const room=await host.evaluate(async()=>{const {game}=await import('/noname.js');return game.roomId;});
 console.log('room',room,JSON.stringify(config));
 const client=await boot('client');
 await client.evaluate(async id=>{const {game}=await import('/noname.js');game.send('server','enter',id,'测试玩家','liubei');},room);
 await until(client,async()=>{const {game}=await import('/noname.js');return !!game.onlineID;},30000);
 await until(client,async()=>{const {game}=await import('/noname.js');return game.connectPlayers?.length>0;},30000);
 await client.waitForTimeout(1000);
 console.log('joined');
 await host.evaluate(async()=>{const {ui}=await import('/noname.js');ui.connectStartButton.click();});
 await until(host,async()=>{const {game}=await import('/noname.js');return !!game.me;},30000);
 await host.evaluate(async()=>{const {ui,_status}=await import('/noname.js');if(!_status.auto)ui.click.auto('forced');});
 await until(client,async()=>{const {game}=await import('/noname.js');return !!game.me;},30000);
 await client.evaluate(async()=>{const {ui,_status}=await import('/noname.js');if(!_status.auto)ui.click.auto('forced');});
 await host.evaluate(async()=>{const {ui,_status,lib}=await import('/noname.js');lib.config.game_speed='vvfast';if(!_status.auto)ui.click.auto('forced');});
 await client.evaluate(async()=>{const {ui,_status}=await import('/noname.js');if(!_status.auto)ui.click.auto('forced');});
 let disconnect;
 if(process.env.TEST_DISCONNECT==='1'){
  const before=await host.evaluate(async()=>{const {game}=await import('/noname.js');return {round:game.roundNumber,hosting:game.onlineroom};});
  await client.evaluate(async()=>{const {game}=await import('/noname.js');game.ws._nocallback=true;game.ws.close();});
  await host.waitForTimeout(5000);
  const after=await host.evaluate(async()=>{const {game,_status,lib}=await import('/noname.js');return {round:game.roundNumber,hosting:game.onlineroom,over:_status.over,event:_status.event?.name,clients:lib.node.clients.length};});
  await client.reload({waitUntil:'domcontentloaded'});
  await until(client,async()=>{const {game}=await import('/noname.js');return !!game.onlineID&&!!game.me;},60000);
  disconnect={before,after,reconnected:await client.evaluate(async()=>{const {game}=await import('/noname.js');return {id:game.onlineID,name:game.me?.name,online:game.online};})};
  await fs.writeFile(root+'/'+runName+'-disconnect.json',JSON.stringify(disconnect,null,2));
 }
 for(let i=0;i<seconds;i++){await host.waitForTimeout(1000);if(i%5===0){const sample=await host.evaluate(async()=>{const {game,_status}=await import('/noname.js');return {round:game.roundNumber,event:_status.event?.name,auto:_status.auto,over:_status.over,players:game.players.map(p=>({name:p.name,hp:p.hp,hand:p.countCards('h')})),dead:game.dead.length,network:window.cloudNet,heap:performance.memory?.usedJSHeapSize};});samples.push({elapsed:Date.now()-started,...sample});console.log('progress',JSON.stringify(sample));await fs.writeFile(root+'/'+runName+'-samples.json',JSON.stringify(samples,null,2));}if(await host.evaluate(async()=>{const {_status}=await import('/noname.js');return !!_status.over;}))break;}
 const state=async p=>p.evaluate(async()=>{const {game,lib,_status}=await import('/noname.js');return {mode:lib.config.mode,online:game.online,hosting:game.onlineroom,event:_status.event?.name,paused:_status.paused,over:_status.over,players:game.players.map(p=>({id:p.playerid,name:p.name,hp:p.hp,online:p.isOnline?.()})),text:document.body.innerText.slice(-1800)};});
 const result={mode,room,config,samples,disconnect,host:await state(host),client:await state(client),events};
 await fs.writeFile(root+'/'+runName+'-room.json',JSON.stringify(result,null,2));
 await host.screenshot({path:root+'/'+runName+'-host.png'});await client.screenshot({path:root+'/'+runName+'-client.png'});
 console.log(JSON.stringify(result,null,2));
}catch(e){console.error(e);if(activeHost){try{await fs.writeFile(root+'/'+runName+'-failure-state.json',JSON.stringify(await activeHost.evaluate(async()=>{const {game,lib,_status}=await import('/noname.js');return {mode:lib.config.mode,config:lib.configOL,event:_status.event?.name,waiting:_status.waitingForPlayer,paused:_status.paused,over:_status.over,players:game.players.map(p=>({name:p.name,hp:p.hp})),body:document.body.innerText.slice(-1500)};}),null,2));}catch{}}await fs.writeFile(root+'/cloud-room-errors.json',JSON.stringify(events,null,2));process.exitCode=1;}finally{await browser.close();}
