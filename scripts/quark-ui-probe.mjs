import {chromium} from '/root/pi-web/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR || '/root/noname-cloud/evidence/quark-migration/direct';
const probeMode=process.env.PROBE_MODE || 'doudizhu';
const probePlayers=Number(process.env.PROBE_PLAYERS || (probeMode==='identity' ? 8 : 3));
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/root/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const context=await browser.newContext({viewport:{width:1280,height:720}});
const page=await context.newPage();
const report={scope:'Real-resource first batch only',errors:[],failedResources:[],manualUseCard:false};
page.on('pageerror',e=>report.errors.push(String(e)));
page.on('response',r=>{if(r.status()>=400&&r.url().includes('/theme/quark_migration/'))report.failedResources.push({path:new URL(r.url()).pathname,status:r.status()});});
page.on('dialog',d=>d.dismiss());
try {
 await page.route('**/preload.js',r=>r.fulfill({status:404,body:''}));
 await page.route('**/cloud-seed.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>isolated seed</title>'}));
 await page.goto('http://127.0.0.1:18091/cloud-seed.html');
 await page.evaluate(async()=>{
  localStorage.setItem('gplv3_noname_alerted','true'); sessionStorage.setItem('isJITReloaded','true');sessionStorage.setItem('canUseTs','true');
  await new Promise((resolve,reject)=>{
   const req=indexedDB.open('noname_0.9_data',4);
   req.onupgradeneeded=()=>{for(const n of ['config','data','image','audio'])if(!req.result.objectStoreNames.contains(n))req.result.createObjectStore(n);if(!req.result.objectStoreNames.contains('video'))req.result.createObjectStore('video',{keyPath:'time'});};
   req.onerror=reject;req.onsuccess=()=>{const db=req.result;const tx=db.transaction('config','readwrite');
    const settings={mode:probeMode,theme:'quark_migration',layout:'nova',player_number:probePlayers,new_tutorial:true,show_splash:'off',version:'1.11.7',characters:['standard','shenhua','refresh'],cards:['standard','extra'],extensions:[],totouched:true,touchscreen:false,identity_mode:'normal',game_speed:'vvfast',connect_read_clipboard:false,background_music:'music_off',volumn_audio:0,volumn_background:0};
    for(const [k,v]of Object.entries(settings))tx.objectStore('config').put(v,k);
    tx.oncomplete=()=>{db.close();resolve();};tx.onerror=reject;
   };
  });
 });
 await page.goto('http://127.0.0.1:18091/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(async()=>{const{game,lib}=await import('/noname.js');return game.players.length===probePlayers&&Object.keys(lib.character).length>10;},null,{timeout:90000});
 await page.waitForFunction(async()=>{const{ui,game}=await import('/noname.js');return game.players.length===probePlayers && ui.arena?.getBoundingClientRect().width>0;},null,{timeout:90000});
 await page.waitForTimeout(1000);
 const chooserVisible=await page.locator('.button.character.selectable').first().isVisible();
 if(chooserVisible) await page.screenshot({path:out+'/selection.png'});
 else report.selectionScreenshotValid=false;
 for(let i=0;i<100;i++){
  if(await page.locator('.handcards > .card').count())break;
  const button=page.locator('.button.character.selectable:not(.selected)').first();if(await button.isVisible())await button.click({timeout:1500}).catch(()=>{});
  const confirm=page.locator('.control > div').filter({hasText:/^确定$/}).first();if(await confirm.isVisible())await confirm.click({timeout:1500}).catch(()=>{});
  await page.waitForTimeout(500);
 }
 await page.waitForFunction(()=>document.querySelector('.handcards > .card'),null,{timeout:30000});
 await page.evaluate(()=>document.fonts.load('16px quark-shousha'));
 await page.waitForTimeout(500);
 report.runtime=await page.evaluate(async()=>{
  const{lib,game,ui}=await import('/noname.js');
  return{version:lib.version,theme:lib.config.theme,mode:lib.config.mode,players:game.players.length,handcards:document.querySelectorAll('.handcards > .card').length,href:ui.css.theme.href,playerMounts:[...document.querySelectorAll('#arena > .player')].map(p=>({nameInCamp:p.node.name.parentNode.className,hpInWrap:p.node.hp.parentNode.className,originalHpSame:p.node.hp===p.querySelector('.hp'),group:p.group,rect:JSON.parse(JSON.stringify(p.getBoundingClientRect())),nameVisible:getComputedStyle(p.node.name).visibility,paint:[...p.children].map(n=>({class:n.className,rect:JSON.parse(JSON.stringify(n.getBoundingClientRect())),bg:getComputedStyle(n).backgroundColor,image:getComputedStyle(n).backgroundImage,z:getComputedStyle(n).zIndex,display:getComputedStyle(n).display}))})),cardTitles:document.querySelectorAll('.quark-top-name').length,cardFace:document.querySelector('.handcards > .card')?getComputedStyle(document.querySelector('.handcards > .card')).backgroundImage:null,skillControls:[...document.querySelectorAll('.skill-control, .quark-skill-control')].map(n=>({class:n.className,children:n.children.length,rect:JSON.parse(JSON.stringify(n.getBoundingClientRect())),font:getComputedStyle(n).fontFamily})),menus:[...document.querySelectorAll('.menu, .new-menu, .dialog.popped')].map(n=>({class:n.className,quark:n.classList.contains('quark-menu')})),background:getComputedStyle(document.documentElement).backgroundImage,font:document.fonts.check('16px quark-shousha'),ornaments:[...document.querySelectorAll('.quark-rarity-long')].map(n=>({src:n.getAttribute('src'),loaded:n.complete&&n.naturalWidth>0,pointerEvents:getComputedStyle(n).pointerEvents}))};
 });
 await page.screenshot({path:out+'/battle.png'});
 if (process.env.SKILL_PROBE) {
  report.skillProbe = {seen:false, clicked:false, historyBefore:0, historyAfter:0};
  report.skillProbe.historyBefore = await page.evaluate(async()=>{const{game}=await import('/noname.js');return game.me.getAllHistory('useSkill').length;});
  const deadline = Date.now() + Number(process.env.SKILL_WAIT_MS || 12000);
  while (Date.now() < deadline) {
   const skill = page.locator('.skill-control > div:not(:last-child), .quark-skill-control > div:not(:last-child)').filter({visible:true}).first();
   if (await skill.count() && await skill.isVisible().catch(()=>false)) {
    report.skillProbe.seen=true; await skill.click({timeout:3000}).catch(()=>{}); report.skillProbe.clicked=true; break;
   }
   await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1200);
  report.skillProbe.historyAfter = await page.evaluate(async()=>{const{game}=await import('/noname.js');return game.me.getAllHistory('useSkill').length;});
  report.skillProbe.controls = await page.evaluate(()=>[...document.querySelectorAll('.skill-control,.quark-skill-control')].map(n=>({class:n.className,children:n.children.length,html:n.innerText})));
  await page.screenshot({path:out+'/skill-state.png'});
 }
 // Native mouse input only: never call player.useCard or enable AI for proof.
 const initial=await page.evaluate(async()=>{const{game}=await import('/noname.js');return game.me.getAllHistory('useCard').length;});
 report.inputs=[];
 for(let i=0;i<(process.env.SKIP_INPUT ? 0 : 80);i++){
  const history=await page.evaluate(async()=>{const{game}=await import('/noname.js');return game.me.getAllHistory('useCard').map(e=>({card:e.card?.name,targets:e.targets?.map(p=>p.name)}));});
  if(history.length>initial){report.manualUseCard=true;report.useCardHistory=history;break;}
  const cards=page.locator('.handcards > .card.selectable:not(.selected)');
  if(await cards.count()) {await cards.first().click({timeout:2000}).catch(()=>{});report.inputs.push('card');
   report.confirmAppearance=await page.evaluate(()=>[...document.querySelectorAll('.quark-confirm > div')].map(n=>({link:n.link,image:getComputedStyle(n).backgroundImage,font:getComputedStyle(n).fontFamily,rect:JSON.parse(JSON.stringify(n.getBoundingClientRect()))})));}
  const targets=page.locator('#arena > .player.selectable:not(.selected)');
  if(await targets.count()){await targets.first().click({timeout:2000}).catch(()=>{});report.inputs.push('target');}
  const confirm=page.locator('.control > div').filter({hasText:/^确定$/}).first();
  if(await confirm.isVisible()){await confirm.click({timeout:2000}).catch(()=>{});report.inputs.push('confirm');}
  if(i%10===9){const cancel=page.locator('.control > div').filter({hasText:/^取消$/}).first();if(await cancel.isVisible()){await cancel.click({timeout:2000}).catch(()=>{});report.inputs.push('cancel');}}
  await page.waitForTimeout(500);
 }
 await page.screenshot({path:out+'/input-state.png'});
 assert.equal(report.runtime.theme,'quark_migration');assert.equal(report.runtime.version,'1.11.7');assert.equal(report.runtime.players,probePlayers);assert(report.runtime.handcards>0);assert(report.runtime.background.includes('/assets/background.jpg'));assert(report.runtime.font);assert.deepEqual(report.failedResources,[]);
 // Inspect native confirm rendering without submitting a synthetic game event.
 report.confirmPresentation=await page.evaluate(async()=>{
  const{ui}=await import('/noname.js');
  const prior=ui.confirm;const priorStr=prior?.str;
  ui.create.confirm('oc');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const nodes=[...ui.confirm.children].map(n=>({link:n.link,text:n.textContent,ok:n.classList.contains('quark-ok'),cancel:n.classList.contains('quark-cancel'),image:getComputedStyle(n).backgroundImage}));
  if(priorStr)ui.create.confirm(priorStr);else ui.create.confirm();
  return{scope:'Native Control appearance only; no synthetic submission',nodes};
 });
 assert(report.confirmPresentation.nodes.some(n=>n.link==='ok'&&n.ok&&n.image.includes('/btn.png')));
 assert(report.confirmPresentation.nodes.some(n=>n.link==='cancel'&&n.cancel&&n.image.includes('/confirm-bg-c.png')));
 report.fallback=await page.evaluate(async()=>{const{lib,ui}=await import('/noname.js');await lib.configMenu.appearence.config.theme.onclick('simple');await new Promise(r=>requestAnimationFrame(r));return{theme:lib.config.theme,href:ui.css.theme.href,ornaments:document.querySelectorAll('.quark-rarity-long').length,campWrappers:document.querySelectorAll('#arena > .player > .camp-wrap').length,cardTitles:document.querySelectorAll('.quark-top-name').length,originalParentsRestored:[...document.querySelectorAll('#arena > .player')].every(p=>p.node.hp.parentNode===p&&p.node.name.parentNode===p)};});
 assert.equal(report.fallback.theme,'simple');assert.equal(report.fallback.ornaments,0);assert.equal(report.fallback.campWrappers,0);assert.equal(report.fallback.cardTitles,0);assert(report.fallback.originalParentsRestored);
 await page.screenshot({path:out+'/fallback.png'});
 report.resourceBatchPassed=true;
}catch(e){report.resourceBatchPassed=false;report.failure=String(e);process.exitCode=1;await page.screenshot({path:out+'/failure.png'}).catch(()=>{});}
finally{await fs.writeFile(out+'/runtime.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();}
