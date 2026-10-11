// Isolated context on existing reference browser; never writes existing profile.
import {chromium} from '/root/pi-web/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const out=process.env.EVIDENCE_DIR || '/root/noname-cloud/evidence/quark-migration/full-reference';await fs.mkdir(out,{recursive:true});
const backup=JSON.parse(Buffer.from(await fs.readFile('/root/noname-cloud/reference/quark-handheld/runtime/无名杀 - 数据 - 2025.7.21 16.06.26','utf8'),'base64').toString()).config;
const probeMode=process.env.PROBE_MODE || 'doudizhu';
const probePlayers=Number(process.env.PROBE_PLAYERS || (probeMode==='identity'?8:3));
const extensions=['十周年UI','手杀ui','皮肤切换','EpicFX','如真似幻','假装无敌','选将美化'];
const config={};
const cosmetics=new Set(['theme','layout','touchscreen','image_background','card_style','cardback_style','hp_style','name_font','identity_font','cardtext_font','global_font','ui_zoom']);
for(const[k,v]of Object.entries(backup))if(cosmetics.has(k)||extensions.some(n=>k.startsWith(`extension_${n}_`)))config[k]=v;
Object.assign(config,{video:'0',extensions,mode:probeMode,player_number:probePlayers,identity_mode:'normal',new_tutorial:true,show_splash:'off',version:'1.12.7.0711_β',connect_read_clipboard:false,background_music:'music_off',volumn_audio:0,volumn_background:0,characters:['standard','shenhua','refresh'],cards:['standard','extra']});
for(const n of extensions)config[`extension_${n}_enable`]=true;
config.extension_十周年UI_dynamicSkin=false;config.extension_皮肤切换_useDynamic=false;config.extension_皮肤切换_previewDynamic=false;config.skin={};config.qhly_skinset={};
const report={scope:'All seven available UI extensions enabled in isolated context; skin payload excluded',requestedExtensions:extensions,errors:[],failedRequests:[],httpErrors:[],runtimePassed:false};
const browser=await chromium.launch({executablePath:'/root/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const context=await browser.newContext({viewport:{width:1280,height:720},hasTouch:true});const page=await context.newPage();page.setDefaultTimeout(15000);
page.on('pageerror',e=>report.errors.push(String(e.stack||e).slice(0,2400)));page.on('dialog',d=>d.dismiss());
page.on('requestfailed',r=>report.failedRequests.push({path:new URL(r.url()).pathname,error:r.failure()?.errorText}));
page.on('response',r=>{if(r.status()>=400)report.httpErrors.push({path:decodeURIComponent(new URL(r.url()).pathname),status:r.status()});});
await context.addInitScript(()=>{
 window.quarkProbeErrors=[];
 window.addEventListener('error',e=>window.quarkProbeErrors.push({message:e.message,file:e.filename,line:e.lineno,column:e.colno,stack:e.error?.stack}));
 window.addEventListener('unhandledrejection',e=>window.quarkProbeErrors.push({message:String(e.reason),stack:e.reason?.stack}));
});
const root='/root/noname-cloud/reference/quark-handheld/runtime';
await context.route('**/*',async r=>{
 const u=new URL(r.request().url());
 if(u.hostname==='gitee.com' && u.pathname.startsWith('/UnknownMaxin/as-real-as-fantasy/raw/master/')){
  const rel=u.pathname.slice('/UnknownMaxin/as-real-as-fantasy/raw/master/'.length);
  if(!rel.split('/').includes('..'))try{return await r.fulfill({path:root+'/extension/如真似幻/'+rel});}catch{}
 }
 if(u.origin!=='http://127.0.0.1:18112'){await r.abort();return;}
 const p=decodeURIComponent(u.pathname);
 if(p==='/extension/EpicFX/asset/font/STXINGKA.ttf')return r.fulfill({path:root+'/extension/EpicFX/asset/font/STXINGKA.TTF'});
 if(p==='/extension/如真似幻/fonts/shousha.TTF')return r.fulfill({path:root+'/extension/如真似幻/fonts/shousha.ttf'});
 if(p==='/preset.json')return r.fulfill({contentType:'application/json',body:JSON.stringify(config)});
 if(p==='/'||p==='/index.html'||p==='/app.html')return r.fulfill({contentType:'text/html',path:'/root/noname-quark/deploy/index.html'});
 if(p==='/bridge.js')return r.fulfill({contentType:'text/javascript',path:'/root/noname-quark/deploy/bridge.js'});
 if(p==='/getFileList'||p==='/checkFile'){
  const rel=u.searchParams.get('dir')||u.searchParams.get('fileName')||'';
  if(rel.split('/').includes('..')||rel.startsWith('/'))return r.fulfill({status:403,body:'forbidden'});
  try{let data;
   if(p==='/getFileList'){const entries=await fs.readdir(root+'/'+rel,{withFileTypes:true});data={folders:entries.filter(e=>e.isDirectory()).map(e=>e.name),files:entries.filter(e=>e.isFile()).map(e=>e.name)};}
   else{const s=await fs.stat(root+'/'+rel);data=s.isDirectory()?'directory':'file';}
   return r.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data})});
  }catch{return r.fulfill({contentType:'application/json',body:JSON.stringify({success:false,errorMsg:'absent local resource'})});}
 }
 if(p==='/createDir'||p==='/writeFile')return r.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data:null})});
 return r.continue();
});
const bounded=(promise,label,ms=20000)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label+' timed out')),ms))]);
try{
 console.log('stage: navigation');
 await page.goto('http://127.0.0.1:18112/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForTimeout(15000);
 console.log('stage: home capture');
 await page.screenshot({path:out+'/home-or-start.png',timeout:15000,animations:'disabled'});
 report.home=await page.evaluate(()=>{
  const n=document.querySelector('#offlinebutton');const r=n?.getBoundingClientRect();const center=r?{x:r.x+r.width/2,y:r.y+r.height/2}:null;
  return {path:location.pathname,loading:document.querySelector('#rzshLoading')?.textContent,loadingDisplay:document.querySelector('#rzshLoading')?getComputedStyle(document.querySelector('#rzshLoading')).display:null,offline:center,hit:center?document.elementFromPoint(center.x,center.y)?.id:null,canvases:document.querySelectorAll('canvas').length};
 });
 if(await page.locator('#updatelogmodal').isVisible()){
  await page.mouse.click(30,100);
  await page.waitForTimeout(700);
 }
 const offline=page.locator('#offlinebutton');
 if(await offline.isVisible()){
  await page.touchscreen.tap(report.home.offline.x,report.home.offline.y);
  console.log('stage: offline navigation initiated');
  await page.waitForTimeout(Number(process.env.REFERENCE_BOOT_WAIT || 30000));
  console.log('stage: post-navigation inspection');
  // Touch can be swallowed by the homepage animation/modal. Retry using the
  // real DOM click path and hit-test coordinates, never call game start APIs.
  for (let retry=0;retry<3 && !await page.locator('#arena').count();retry++) {
   const target=page.locator('#offlinebutton');
   if (!await target.isVisible().catch(()=>false)) break;
   const box=await target.boundingBox();
   report.homeRetries ??= [];
   report.homeRetries.push(await page.evaluate(({x,y})=>({x,y,hit:document.elementFromPoint(x,y)?.id,path:location.pathname}),{x:box.x+box.width/2,y:box.y+box.height/2}));
   await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
   await page.waitForTimeout(10000);
  }
  const qa=page.locator('.cookie_qa input');
  if(await qa.count()===2){
   await qa.nth(0).fill('无名杀十周年');await qa.nth(1).fill('去fanbook频道');
   await page.locator('button').filter({hasText:/^提交$/}).click({timeout:5000});
   await page.waitForTimeout(1200);
   report.onboarding={answeredFromShippedHint:true,remaining:await page.locator('.cookie_qa').count()};
  }
  await page.screenshot({path:out+'/selection.png',timeout:15000});
  for(let attempt=0;attempt<50;attempt++){
   if(await page.locator('.handcards > .card').count())break;
   const choose=page.locator('.button.character.selectable:not(.selected)').first();
   if(await choose.isVisible())await choose.tap({timeout:1500}).catch(()=>{});
   const ok=page.locator('.control > .primary').first();
   if(await ok.isVisible())await ok.tap({timeout:1500}).catch(()=>{});
   await page.waitForTimeout(500);
  }
 }
 report.runtime=await bounded(page.evaluate(()=>{
  const rt=window.quarkRuntime;return{loadingState:rt?{onload:typeof rt.lib.init.onload,extensions:rt.lib.extensions?.map(e=>({name:e[0],content:typeof e[1]})),loaded:rt.lib.loaded,imported:Object.keys(rt.lib.imported||{}),appPlugins:window.app?.plugins?.map(p=>p.name),scripts:[...document.scripts].map(n=>new URL(n.src||location.href).pathname),resources:performance.getEntriesByType('resource').map(e=>({path:decodeURIComponent(new URL(e.name).pathname),duration:e.duration})).slice(-30)}:null,path:location.pathname,version:rt?.lib.version,event:rt?.status.event?.name,paused:rt?.status.paused,ready:document.readyState,body:document.body.textContent?.trim().slice(0,300),diagnosticErrors:window.quarkProbeErrors,players:rt?.game.players?.length||0,handcards:document.querySelectorAll('.handcards > .card').length,arena:!!document.querySelector('#arena'),savedEnable:JSON.parse(localStorage.getItem('noname_0.9_config')||'{}').extensions,activeEnable:rt?.lib.config.extensions?.filter(n=>rt.lib.config[`extension_${n}_enable`]),visibleButtons:[...document.querySelectorAll('button,.button,.control')].filter(n=>n.offsetWidth).map(n=>n.textContent?.trim().slice(0,50)).slice(0,25)};
 }), 'runtime inspection');
 report.geometry=await bounded(page.evaluate(()=>{
  const rect=n=>{const r=n.getBoundingClientRect();const s=getComputedStyle(n);return {class:n.className,position:n.dataset.position,x:r.x,y:r.y,width:r.width,height:r.height,font:s.fontFamily,fontSize:s.fontSize,background:s.backgroundImage,transform:s.transform};};
  return {playerCounters:[...document.querySelectorAll('#arena > .player')].map(p=>({position:p.dataset.position,count:p.node.count.textContent,countText:p.node.count.dataset.text,countRect:rect(p.node.count),countVisibility:getComputedStyle(p.node.count).visibility,identityText:p.node.identity.firstElementChild?.textContent,identityBackground:getComputedStyle(p.node.identity).backgroundImage,identityRect:rect(p.node.identity)})),cardPresentation:[...document.querySelectorAll('.hand-cards > .handcards > .card')].map(c=>({name:c.name,nature:c.nature,suit:c.suit,number:c.number,type:c.dataset.cardType,title:c.querySelector('.top-name')?.innerText,titleImage:c.querySelector('.top-name img')?.getAttribute('src'),suitText:c.querySelector('.suit-num')?.innerText,art:c.querySelector('.image img')?.getAttribute('src'),typeImage:c.querySelector('.card-type')?getComputedStyle(c.querySelector('.card-type')).backgroundImage:null,images:[...c.querySelectorAll('.top-name img,.image img,.distance img')].map(n=>({src:n.getAttribute('src'),loaded:n.complete&&n.naturalWidth>0})),positions:[...c.querySelectorAll('.top-name,.suit-num,.image,.card-type,.distance')].map(n=>({class:n.className,rect:rect(n)}))})),handBounds:window.decadeUI ? {scale:window.decadeUI.getCardBestScale(),size:window.decadeUI.getHandCardSize(),bounds:{width:window.decadeUI.boundsCaches.hand.width,height:window.decadeUI.boundsCaches.hand.height,cardWidth:window.decadeUI.boundsCaches.hand.cardWidth,cardHeight:window.decadeUI.boundsCaches.hand.cardHeight}}:null,handContainers:[...document.querySelectorAll('#me,#handcards1,.hand-wrap,.hand-cards,.handcards')].map(rect),arena:document.querySelector('#arena')?rect(document.querySelector('#arena')):null,players:[...document.querySelectorAll('#arena > .player')].map(rect),hand:[...document.querySelectorAll('.handcards > .card')].map(rect),skills:[...document.querySelectorAll('.skill-control,.skill-control > div,.skill-control .skillitem')].map(rect),controls:[...document.querySelectorAll('.control')].map(rect)};
 }), 'geometry');
 await fs.writeFile(out+'/runtime-before-screenshot.json',JSON.stringify(report,null,2));
 await page.screenshot({path:out+'/offline-or-battle.png',timeout:15000,animations:'disabled'});
 report.runtimePassed=!!report.runtime.arena&&report.runtime.players>0;
 if(report.runtime.handcards>0){
  await page.waitForTimeout(32000);
  await page.screenshot({path:out+'/battle-clean.png',timeout:15000});
  const menu=page.locator('#system').getByText('选项',{exact:true});
  if(await menu.isVisible()){await menu.tap({timeout:3000}).catch(()=>{});await page.waitForTimeout(500);await page.screenshot({path:out+'/menu.png',timeout:15000});await page.touchscreen.tap(15,400);}
  if(Number(process.env.NATURAL_SECONDS||0)>0){
   await bounded(page.evaluate(()=>{const rt=window.quarkRuntime;if(!rt.status.auto)rt.ui.click.auto();}),'auto');
   for(let i=0;i<Number(process.env.NATURAL_SECONDS);i++){
    const state=await bounded(page.evaluate(()=>{const r=window.quarkRuntime;return{over:!!r.status.over,round:r.game.roundNumber,alive:r.game.players.length,dead:r.game.dead.length,useCard:[...r.game.players,...r.game.dead].reduce((s,p)=>s+p.getAllHistory('useCard').length,0)};}),'natural state');
    if(i%10===0)await fs.appendFile(out+'/natural.jsonl',JSON.stringify(state)+'\n');
    if(state.over){report.natural=state;await page.screenshot({path:out+'/natural-result.png',timeout:15000});break;}
    await page.waitForTimeout(1000);
   }
  }
 }
}catch(e){report.failure=String(e);}
finally{await fs.writeFile(out+'/runtime.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await bounded(context.close(),'context close',5000).catch(()=>{});await bounded(browser.close(),'browser close',5000).catch(()=>{});}
