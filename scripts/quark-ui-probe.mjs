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
page.on('pageerror',e=>{report.errors.push(String(e));console.error('pageerror:',String(e));});
page.on('response',r=>{if(r.status()>=400&&r.url().includes('/theme/quark_migration/'))report.failedResources.push({path:new URL(r.url()).pathname,status:r.status()});});
page.on('dialog',d=>d.dismiss());
try {
 await page.route('**/preload.js',r=>r.fulfill({status:404,body:''}));
 await page.route('**/cloud-seed.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>isolated seed</title>'}));
 console.log('stage: seed');
 await page.goto('http://127.0.0.1:18091/cloud-seed.html');
 await page.evaluate(async({probeMode,probePlayers})=>{
  localStorage.setItem('gplv3_noname_alerted','true'); sessionStorage.setItem('isJITReloaded','true');sessionStorage.setItem('canUseTs','true');
  await new Promise((resolve,reject)=>{
   const req=indexedDB.open('noname_0.9_data',4);
   req.onupgradeneeded=()=>{for(const n of ['config','data','image','audio'])if(!req.result.objectStoreNames.contains(n))req.result.createObjectStore(n);if(!req.result.objectStoreNames.contains('video'))req.result.createObjectStore('video',{keyPath:'time'});};
   req.onerror=reject;req.onsuccess=()=>{const db=req.result;const tx=db.transaction('config','readwrite');
    const settings={mode:probeMode,theme:'quark_migration',layout:'nova',player_number:probePlayers,new_tutorial:true,show_splash:'off',version:'1.11.7',free_choose:true,characters:['standard','shenhua','refresh'],cards:['standard','extra'],extensions:[],totouched:true,touchscreen:false,identity_mode:'normal',game_speed:'vvfast',connect_read_clipboard:false,background_music:'music_off',volumn_audio:0,volumn_background:0};
    for(const [k,v]of Object.entries(settings))tx.objectStore('config').put(v,k);
    tx.oncomplete=()=>{db.close();resolve();};tx.onerror=reject;
   };
  });
 },{probeMode,probePlayers});
 console.log('stage: engine');
 await page.goto('http://127.0.0.1:18091/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(async expected=>{const{game,lib}=await import('/noname.js');return game.players.length===expected&&Object.keys(lib.character).length>10;},probePlayers,{timeout:90000});
 await page.waitForFunction(async expected=>{const{ui,game}=await import('/noname.js');return game.players.length===expected && ui.arena?.getBoundingClientRect().width>0;},probePlayers,{timeout:90000});
 await page.waitForTimeout(1000);
 console.log('stage: chooser');
 const chooserVisible=await page.locator('.button.character.selectable').first().isVisible();
 if(chooserVisible) await page.screenshot({path:out+'/selection.png'});
 else report.selectionScreenshotValid=false;
 for(let i=0;i<100;i++){
  if(await page.locator('.handcards > .card').count())break;
  let button=page.locator('.button.character.selectable:not(.selected)').first();
  if (process.env.SKILL_ACTIVE && !report.chosenActiveCharacter) {
   const candidate=await page.evaluate(async()=>{
    const {lib}=await import('/noname.js');
    const candidates=[...document.querySelectorAll('.button.character.selectable:not(.selected)')].map((n,index)=>({name:n.link,index,skills:lib.character[n.link]?.skills || lib.character[n.link]?.[3] || []}));
    return candidates.find(c=>c.skills.includes('zhiheng')) || candidates.find(c=>c.skills.includes('rende')) || candidates.find(c=>c.skills.some(k=>{const en=lib.skill[k]?.enable;return en==='phaseUse'||Array.isArray(en)&&en.includes('phaseUse');}));
   });
   if(candidate){report.chosenActiveCharacter=candidate;button=page.locator('.button.character.selectable:not(.selected)').nth(candidate.index);}
  }
  if (process.env.SKILL_CHARACTER) {
   const index=await page.locator('.button.character.selectable:not(.selected)').evaluateAll((nodes,name)=>nodes.findIndex(n=>n._link===name||n.link===name),process.env.SKILL_CHARACTER);
   if (index<0) throw new Error('Requested native chooser character is unavailable: '+process.env.SKILL_CHARACTER);
   if (index>=0) button=page.locator('.button.character.selectable:not(.selected)').nth(index);
  }
  if(await button.isVisible({timeout:500}).catch(()=>false))await button.click({timeout:1500}).catch(()=>{});
  const confirm=page.locator('.control > div').filter({hasText:/^确定$/}).first();if(await confirm.isVisible({timeout:500}).catch(()=>false))await confirm.click({timeout:1500}).catch(()=>{});
  await page.waitForTimeout(500);
 }
 await page.waitForFunction(()=>document.querySelector('.handcards > .card'),null,{timeout:30000});
 await page.evaluate(()=>document.fonts.load('16px quark-shousha'));
 await page.waitForTimeout(500);
 report.runtime=await page.evaluate(async()=>{
  const{lib,game,ui}=await import('/noname.js');
  return{version:lib.version,theme:lib.config.theme,mode:lib.config.mode,players:game.players.length,handcards:document.querySelectorAll('.handcards > .card').length,href:ui.css.theme.href,playerCounters:[...document.querySelectorAll('#arena > .player')].map(p=>({position:p.dataset.position,count:p.node.count.textContent,countText:p.node.count.dataset.text,countClass:p.node.count.className,countRect:JSON.parse(JSON.stringify(p.node.count.getBoundingClientRect())),countVisibility:getComputedStyle(p.node.count).visibility,identityText:p.node.identity.firstElementChild?.textContent,identityImage:p.node.identity.querySelector('.quark-identity-art')?.getAttribute('src'),identityLoaded:!!p.node.identity.querySelector('.quark-identity-art')?.naturalWidth,identityRect:JSON.parse(JSON.stringify(p.node.identity.getBoundingClientRect()))})),playerMounts:[...document.querySelectorAll('#arena > .player')].map(p=>({nameInCamp:p.node.name.parentNode.className,hpInWrap:p.node.hp.parentNode.className,originalHpSame:p.node.hp===p.querySelector('.hp'),group:p.group,rect:JSON.parse(JSON.stringify(p.getBoundingClientRect())),nameVisible:getComputedStyle(p.node.name).visibility,paint:[...p.children].map(n=>({class:n.className,rect:JSON.parse(JSON.stringify(n.getBoundingClientRect())),bg:getComputedStyle(n).backgroundColor,image:getComputedStyle(n).backgroundImage,z:getComputedStyle(n).zIndex,display:getComputedStyle(n).display}))})),cardPresentation:[...document.querySelectorAll('#handcards1 > .handcards > .card')].map(c=>({name:c.name,nature:c.nature,suit:c.suit,number:c.number,title:c.querySelector('.quark-top-name')?.innerText,titleImage:c.querySelector('.quark-top-name img')?.getAttribute('src'),suitText:c.querySelector('.quark-suit-num')?.innerText,art:c.querySelector('.quark-card-art img')?.getAttribute('src'),typeImage:c.querySelector('.quark-card-type img')?.getAttribute('src'),images:[...c.querySelectorAll('[class^="quark-"] img')].map(n=>({src:n.getAttribute('src'),loaded:n.complete&&n.naturalWidth>0})),nativeInfo:c.node.info.innerText,infoVisibility:getComputedStyle(c.node.info).visibility,artVisibility:c.querySelector('.quark-card-art')?getComputedStyle(c.querySelector('.quark-card-art')).visibility:null,positions:[...c.querySelectorAll('.quark-top-name,.quark-suit-num,.quark-card-art,.quark-card-type,.quark-card-distance')].map(n=>({class:n.className,rect:JSON.parse(JSON.stringify(n.getBoundingClientRect()))}))})),cardTitles:document.querySelectorAll('.quark-top-name').length,cardFace:document.querySelector('.handcards > .card')?getComputedStyle(document.querySelector('.handcards > .card')).backgroundImage:null,skillPanel:[...document.querySelectorAll('.quark-skill-panel .skillitem')].map(n=>({id:n.dataset.id,text:n.textContent,usable:n.classList.contains('usable'),selected:n.classList.contains('select'),group:n.parentNode.className,image:getComputedStyle(n,'::before').backgroundImage,rect:JSON.parse(JSON.stringify(n.getBoundingClientRect()))})),skillControls:[...document.querySelectorAll('.skill-control, .quark-skill-control,.quark-skill-panel')].map(n=>({class:n.className,children:n.children.length,rect:JSON.parse(JSON.stringify(n.getBoundingClientRect())),font:getComputedStyle(n).fontFamily})),handLayout:{updateHook:ui.updatehl.name,me:ui.me?JSON.parse(JSON.stringify(ui.me.getBoundingClientRect())):null,container:document.querySelector('#handcards1')?JSON.parse(JSON.stringify(document.querySelector('#handcards1').getBoundingClientRect())):null,transforms:[...document.querySelectorAll('#handcards1 > .handcards > .card')].map(n=>({base:n._transform,paint:n.style.transform,scale:getComputedStyle(n).scale,selected:n.classList.contains('selected')})),cards:[...document.querySelectorAll('#handcards1 > .handcards > .card')].map(n=>JSON.parse(JSON.stringify(n.getBoundingClientRect())))},menus:[...document.querySelectorAll('.menu, .new-menu, .dialog.popped')].map(n=>({class:n.className,quark:n.classList.contains('quark-menu')})),background:getComputedStyle(document.documentElement).backgroundImage,font:document.fonts.check('16px quark-shousha'),ornaments:[...document.querySelectorAll('.quark-rarity-long')].map(n=>({src:n.getAttribute('src'),loaded:n.complete&&n.naturalWidth>0,pointerEvents:getComputedStyle(n).pointerEvents}))};
 });
 for(const p of report.runtime.playerCounters){assert.equal(p.countText,p.count);if(p.position==='0')assert.equal(p.countVisibility,'hidden');if(p.identityImage)assert(p.identityLoaded,'Identity image did not load');}
 await page.screenshot({path:out+'/battle.png'});
 await fs.writeFile(out+'/battle-state.json',JSON.stringify(report,null,2));
 console.log('stage: menu');
 report.menuProbe = await (async()=>{
  const before = await page.locator('.menu:visible, .new-menu:visible, .dialog.popped:visible').count();
  const option = page.getByText('选项',{exact:true}).first();
  const clicked = await option.isVisible().catch(()=>false);
  if (clicked) await option.click({timeout:3000}).catch(()=>{});
  await page.waitForTimeout(500);
  const visible = await page.locator('.menu:visible, .new-menu:visible, .dialog.popped:visible').count();
  const nodes = await page.evaluate(()=>[...document.querySelectorAll('.menu,.new-menu,.dialog.popped')].filter(n=>n.checkVisibility({visibilityProperty:true,opacityProperty:true})&&!n.closest('.hidden')).map(n=>({class:n.className,quark:n.classList.contains('quark-menu'),text:n.innerText.slice(0,180)})));
  await page.screenshot({path:out+'/menu-click.png'});
  if(clicked) await page.locator('.menu-container:not(.hidden)').click({position:{x:8,y:8},timeout:2000}).catch(()=>{});
  return {before,clicked,visible,opened:clicked&&visible>0,nodes};
 })();
 console.log('stage: skill');
 if (process.env.SKILL_PROBE) {
  report.skillProbe = {scope:'Native skill control and legal selections only; no injected skill/event/AI',seen:false,clicked:false,completed:false,inputs:[],samples:[]};
  const skillState=()=>page.evaluate(async()=>{
   const{game,_status,ui}=await import('/noname.js');const e=_status.event;
   const ancestors=[];let ownPhaseUse=false;for(let p=e,depth=0;p&&depth<20;p=p.parent,depth++){ancestors.push({name:p.name,player:p.player?.name,isMine:p.player===game.me});if(p.name==='phaseUse'&&p.player===game.me)ownPhaseUse=true;}
   return {ancestors,name:game.me.name,skills:game.me.getSkills(),event:e.name,eventSkill:e.skill,ownPhaseUse,auto:!!_status.auto,paused2:!!_status.paused2,
    useSkill:game.me.getAllHistory('useSkill').map(h=>({skill:h.skill,targets:h.targets?.map(p=>p.name)})),
    useCard:game.me.getAllHistory('useCard').map(h=>({skill:h.skill,card:h.card?.name,targets:h.targets?.map(p=>p.name)})),
    available:[ui.skills,ui.skills2,ui.skills3].filter(Boolean).flatMap(n=>[...n.children].filter(b=>b.checkVisibility({visibilityProperty:true})&&!b.closest('.hidden')).map(b=>b.link))};
  });
  report.skillProbe.before=await skillState();
  const deadline = Date.now() + Number(process.env.SKILL_WAIT_MS || 45000);
  while (Date.now() < deadline) {
   const state=await skillState();report.skillProbe.samples.push(state);
   if(report.skillProbe.clicked && state.eventSkill===report.skillProbe.clickedSkill && !report.skillProbe.selectedPresentation){
    report.skillProbe.selectedPresentation=await page.evaluate(()=>[...document.querySelectorAll('.quark-skill-panel .skillitem')].map(n=>({id:n.dataset.id,selected:n.classList.contains('select'),usable:n.classList.contains('usable'),group:n.parentNode.className,image:getComputedStyle(n,'::before').backgroundImage})));
    await page.screenshot({path:out+'/skill-selected.png'});
   }
   await fs.writeFile(out+'/skill-progress.json',JSON.stringify(report.skillProbe,null,2));
   if(report.skillProbe.clicked && (state.useSkill.slice(report.skillProbe.before.useSkill.length).some(h=>h.skill===report.skillProbe.clickedSkill) || state.useCard.slice(report.skillProbe.before.useCard.length).some(h=>h.skill===report.skillProbe.clickedSkill))){
    report.skillProbe.completed=true;report.skillProbe.after=state;break;
   }
   if(!report.skillProbe.clicked && state.ownPhaseUse && !state.auto && state.available.length){
    const buttons=page.locator('.quark-skill-panel > .enable > .skillitem.usable:visible');
    if(await buttons.count()){
     report.skillProbe.seen=true;
     const link=await buttons.first().evaluate(n=>n.link);
     try {await buttons.first().click({timeout:2500});report.skillProbe.clicked=true;report.skillProbe.clickedSkill=link;report.skillProbe.inputs.push({kind:'skill',link});}catch{}
    }
   }else if(report.skillProbe.clicked){
    const cards=page.locator('.handcards > .card.selectable:not(.selected)');
    if(await cards.count()){try{await cards.first().click({timeout:1500});report.skillProbe.inputs.push({kind:'card'});}catch{}}
    const targets=page.locator('#arena > .player.selectable:not(.selected)');
    if(await targets.count()){try{await targets.first().click({timeout:1500});report.skillProbe.inputs.push({kind:'target'});}catch{}}
    const options=page.locator('.dialog .button.selectable:not(.selected):visible');
    if(await options.count()){try{await options.first().click({timeout:1500});report.skillProbe.inputs.push({kind:'button'});}catch{}}
    const confirm=page.locator('.control > div').filter({hasText:/^确定$/}).first();
    if(await confirm.isVisible().catch(()=>false)){try{await confirm.click({timeout:1500});report.skillProbe.inputs.push({kind:'confirm'});}catch{}}
   }else if(!state.ownPhaseUse && !report.skillProbe.clicked && ['chooseToRespond','chooseToUse','chooseToDiscard','chooseBool','chooseControl'].includes(state.event)){
    // Advance blocking native response/discard prompts with actual UI input;
    // never auto-play or manufacture a skill/event.
    const cancel=page.locator('.control > div').filter({hasText:/^取消$/}).first();
    if(await cancel.isVisible().catch(()=>false)){try{await cancel.click({timeout:1500});report.skillProbe.inputs.push({kind:'response-cancel',event:state.event});}catch{}}
    else {
     const no=page.locator('.control > div').filter({hasText:/^(取消|不发动|否)$/}).first();
     if(await no.isVisible().catch(()=>false)){try{await no.click({timeout:1500});report.skillProbe.inputs.push({kind:'optional-decline',event:state.event});}catch{}}
     const card=page.locator('.handcards > .card.selectable:not(.selected)').first();
     if(await card.isVisible().catch(()=>false))await card.click({timeout:1500}).catch(()=>{});
     const ok=page.locator('.control > div').filter({hasText:/^确定$/}).first();
     if(await ok.isVisible().catch(()=>false))await ok.click({timeout:1500}).catch(()=>{});
    }
   }
   await page.waitForTimeout(500);
  }
  report.skillProbe.after ??= await skillState();
  await fs.writeFile(out+'/skill-progress.json',JSON.stringify(report.skillProbe,null,2));
  await page.screenshot({path:out+'/skill-state.png'});
  if(report.skillProbe.clicked && !report.skillProbe.completed){
   const cancel=page.locator('.control > div').filter({hasText:/^取消$/}).first();
   if(await cancel.isVisible().catch(()=>false)){try{await cancel.click({timeout:1500});report.skillProbe.inputs.push({kind:'incomplete-skill-cancel'});}catch{}}
  }
 }
 await fs.writeFile(out+'/interaction-state.json',JSON.stringify(report,null,2));
 console.log('stage: card input');
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
 report.cardDisplayChecks=await page.evaluate(async()=>{
  const {syncQuarkCard}=await import('/noname/ui/quark-card-presentation.js');
  const cards=[...document.querySelectorAll('.card.quark-epic-card')];
  const duplicates=cards.filter(c=>['.quark-suit-num','.quark-card-type','.quark-card-art','.quark-card-distance'].some(s=>c.querySelectorAll(':scope > '+s).length>1)).length;
  // CSS-only audit clone outside the engine arena; no Card.init/events/cards
  // added to a player. Keep this separate from real useCard evidence.
  const original=document.querySelector('#handcards1 > .handcards > .card.quark-epic-card');
  let hidden=null;
  if(original){const copy=original.cloneNode(true);copy.classList.add('infohidden');copy.style.position='fixed';copy.style.left='-500px';document.body.append(copy);
   hidden=[...copy.querySelectorAll('.quark-top-name,.quark-suit-num,.quark-card-art,.quark-card-type,.quark-card-distance')].map(n=>({class:n.className,visibility:getComputedStyle(n).visibility}));copy.remove();}
  // Isolated presentation clones with explicit equipment metadata, never
  // inserted into a player or game event. Check native tags remain visible.
  const equipment=document.createElement('div');equipment.className='card fullskin';
  Object.assign(equipment,{name:'qinglong',suit:'spade',number:5});
  const range=document.createElement('div');range.className='range';range.textContent='范围: 3';equipment.append(range);
  const title=document.createElement('div');title.className='quark-top-name';equipment.append(title);
  equipment.style.position='fixed';equipment.style.left='-500px';equipment.style.visibility='visible';range.style.transition='none';document.body.append(equipment);const baselineVisibility=getComputedStyle(range).visibility;syncQuarkCard(equipment,title);
  const matchingRules=[];const inspectRules=rules=>{for(const rule of rules){if(rule.selectorText){try{if(range.matches(rule.selectorText)&&rule.style?.visibility)matchingRules.push(rule.cssText);}catch{}}if(rule.cssRules)inspectRules(rule.cssRules);if(rule.styleSheet){try{inspectRules(rule.styleSheet.cssRules);}catch{}}}};for(const sheet of document.styleSheets){try{inspectRules(sheet.cssRules);}catch{}}
  const plain={text:range.textContent,replaced:equipment.classList.contains('quark-distance-replaced'),visibility:getComputedStyle(range).visibility,matchingRules};
  const tag=document.createElement('span');tag.className='cardtag';tag.textContent='audit-tag';range.append(tag);syncQuarkCard(equipment,title);
  const tagged={tag:tag.textContent,replaced:equipment.classList.contains('quark-distance-replaced'),visibility:getComputedStyle(range).visibility};equipment.remove();
  return {scope:'Display clone CSS only; not engine input',duplicates,hidden,distance:{baselineVisibility,plain,tagged}};
 });
 assert.equal(report.cardDisplayChecks.duplicates,0);
 assert.equal(report.cardDisplayChecks.distance.plain.replaced,true);assert.equal(report.cardDisplayChecks.distance.plain.visibility,'hidden');assert.equal(report.cardDisplayChecks.distance.plain.text,'范围: 3');
 assert.equal(report.cardDisplayChecks.distance.tagged.replaced,false);assert.equal(report.cardDisplayChecks.distance.tagged.visibility,report.cardDisplayChecks.distance.baselineVisibility);assert.equal(report.cardDisplayChecks.distance.tagged.tag,'audit-tag');
 if(report.cardDisplayChecks.hidden)assert(report.cardDisplayChecks.hidden.every(n=>n.visibility==='hidden'));
 await page.screenshot({path:out+'/input-state.png'});
 assert.equal(report.runtime.theme,'quark_migration');assert.equal(report.runtime.version,'1.11.7');assert.equal(report.runtime.players,probePlayers);assert(report.runtime.handcards>0);assert(report.runtime.background.includes('/assets/background.jpg'));assert(report.runtime.font);assert.deepEqual(report.failedResources,[]);assert.deepEqual(report.errors,[]);
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
 report.fallback=await page.evaluate(async()=>{const{lib,ui}=await import('/noname.js');await lib.configMenu.appearence.config.theme.onclick('simple');await new Promise(r=>requestAnimationFrame(r));return{theme:lib.config.theme,updateHook:ui.updatehl.name,href:ui.css.theme.href,ornaments:document.querySelectorAll('.quark-rarity-long').length,campWrappers:document.querySelectorAll('#arena > .player > .camp-wrap').length,cardTitles:document.querySelectorAll('.quark-top-name').length,cardDecorations:document.querySelectorAll('.quark-suit-num,.quark-card-art,.quark-card-type,.quark-card-distance').length,epicCards:document.querySelectorAll('.quark-epic-card').length,distanceClasses:document.querySelectorAll('.quark-distance-replaced').length,counterClasses:document.querySelectorAll('.quark-card-count').length,identityImages:document.querySelectorAll('.quark-identity-art').length,skillPanels:document.querySelectorAll('.quark-skill-panel').length,hiddenSkillSources:document.querySelectorAll('.quark-native-skill-source').length,originalParentsRestored:[...document.querySelectorAll('#arena > .player')].every(p=>p.node.hp.parentNode===p&&p.node.name.parentNode===p)};});
 assert.equal(report.fallback.theme,'simple');assert.equal(report.fallback.updateHook,'updatehl');assert.equal(report.fallback.ornaments,0);assert.equal(report.fallback.campWrappers,0);assert.equal(report.fallback.cardTitles,0);assert.equal(report.fallback.cardDecorations,0);assert.equal(report.fallback.epicCards,0);assert.equal(report.fallback.distanceClasses,0);assert.equal(report.fallback.counterClasses,0);assert.equal(report.fallback.identityImages,0);assert.equal(report.fallback.skillPanels,0);assert.equal(report.fallback.hiddenSkillSources,0);assert(report.fallback.originalParentsRestored);
 await page.screenshot({path:out+'/fallback.png'});
 report.resourceBatchPassed=true;
}catch(e){report.resourceBatchPassed=false;report.failure=String(e);process.exitCode=1;await page.screenshot({path:out+'/failure.png'}).catch(()=>{});}
finally{await fs.writeFile(out+'/runtime.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();}
