// Dedicated stream acceptance: rules stay server-side; taps go through WebRTC video.
import { chromium } from '/root/pi-web/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const root='/root/noname-cloud/evidence';
const targets=await(await fetch('http://127.0.0.1:19223/json/list')).json();
const target=targets.find(t=>t.type==='page'&&t.title==='无名杀');
if(!target)throw new Error('No responsive dedicated game target');
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pending=new Map();const errors=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;const timer=setTimeout(()=>{pending.delete(n);reject(Error('CDP timeout '+method));},20000);pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params}));});
const evaluate=async(fn,arg)=>{const r=await call('Runtime.evaluate',{expression:`(${fn})(${JSON.stringify(arg)??'undefined'})`,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const shot=async(name)=>{const r=await call('Page.captureScreenshot',{format:'png'});await fs.writeFile(root+'/handheld-stream-'+name+'.png',Buffer.from(r.data,'base64'));};
await call('Runtime.enable');await call('Page.enable');await call('Page.bringToFront');
await evaluate(async()=>{localStorage.setItem('gplv3_noname_alerted','true');localStorage.setItem('noname_0.9_loadtime','120000');sessionStorage.setItem('isJITReloaded','true');sessionStorage.setItem('canUseTs','true');await new Promise((resolve,reject)=>{const r=indexedDB.open('noname_0.9_data',4);r.onerror=reject;r.onsuccess=()=>{const db=r.result;const tx=db.transaction('config','readwrite');for(const[k,v]of Object.entries({theme:'handheld',mode:'identity',show_splash:'off',new_tutorial:true,layout:'mobile',player_number:'8',identity_mode:'normal',characters:['standard','shenhua','refresh'],cards:['standard','extra'],extensions:[],totouched:true,touchscreen:false,auto_confirm:false,game_speed:'vvfast',background_music:'music_off',volumn_background:0}))tx.objectStore('config').put(v,k);tx.oncomplete=()=>{db.close();resolve();};};});});
await call('Page.reload');await sleep(9000);
await shot('selection');
await evaluate(()=>{window.__hhInputs=[];for(const t of ['mousedown','mouseup','touchstart','touchend'])document.addEventListener(t,e=>window.__hhInputs.push({type:t,trusted:e.isTrusted,time:Date.now()}),true);});
const password=(await fs.readFile('/root/noname-stream/deploy/secrets/selkies-password','utf8')).trim();
const browser=await chromium.launch({executablePath:'/root/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const context=await browser.newContext({httpCredentials:{username:'cloudplayer',password},viewport:{width:1280,height:780},hasTouch:true});
await context.addInitScript(()=>{window.__pcs=[];const PC=window.RTCPeerConnection;window.RTCPeerConnection=class extends PC{constructor(...args){super(...args);window.__pcs.push(this);}};});
const client=await context.newPage();const paths=new Set();client.on('request',r=>paths.add(new URL(r.url()).pathname));
const report={target:target.id,automatedRemoteInput:true,physicalPhone:false,actions:[],errors};
const save=()=>fs.writeFile(root+'/handheld-stream-runtime.json',JSON.stringify(report,null,2));
try{
 await client.goto('https://buzz.webpimy.duckdns.org/cloud-phone/');await client.locator('#start').click();await sleep(12000);
 const frame=()=>client.frames().find(f=>f.url().includes('/stream/'));
 const stats=()=>frame().evaluate(async()=>({videos:[...document.querySelectorAll('video')].map(v=>({width:v.videoWidth,height:v.videoHeight,frames:v.getVideoPlaybackQuality().totalVideoFrames,dropped:v.getVideoPlaybackQuality().droppedVideoFrames})),rtp:await Promise.all((window.__pcs||[]).map(async pc=>[...await pc.getStats()].map(([,s])=>s).filter(s=>s.type==='inbound-rtp'&&s.kind==='video')))}));
 report.video=await stats();
 const tap=async(node)=>{const box=await frame().locator('video').boundingBox();const s=Math.min(box.width/1280,box.height/720);await client.touchscreen.tap(box.x+(box.width-1280*s)/2+node.x*s,box.y+(box.height-720*s)/2+node.y*s);report.actions.push({...node,time:Date.now()});await sleep(650);};
 const state=()=>evaluate(async()=>{const{game,ui,_status,lib}=await import('/noname.js');const center=n=>{const r=n.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,text:n.innerText.slice(0,80)};};const visible=n=>{const r=n.getBoundingClientRect();return r.width&&r.height&&r.x>=0&&r.y>=0&&r.bottom<=innerHeight&&n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));};return{theme:lib.config.theme,event:_status.event?.name,mine:!!_status.event?.isMine?.(),over:!!_status.over,round:game.roundNumber,players:game.players.length,me:game.me?.name,selected:{cards:ui.selected.cards.length,targets:ui.selected.targets.length,buttons:ui.selected.buttons.length},cards:[...document.querySelectorAll('.handcards > .card.selectable:not(.selected)')].filter(visible).map(center),targets:[...document.querySelectorAll('#arena > .player.selectable:not(.selected)')].filter(visible).map(center),characters:[...document.querySelectorAll('.button.character.selectable:not(.selected)')].filter(visible).map(center),controls:[...document.querySelectorAll('.control > div')].filter(visible).map(center),history:game.me?.getAllHistory('useCard').map(h=>({card:h.card.name,targets:h.targets.map(t=>t.name)}))||[]};});
 const begin=Date.now();let confirmed=false;let lastCard=false;let manualSuccess=false;
 for(let i=0;i<90;i++){
  const s=await state();report.latest=s;if(i%10===0){console.log(JSON.stringify(s));await save();}
  if(s.history.some(h=>h.targets.length>0)&&report.actions.some(a=>a.kind==='card')&&report.actions.some(a=>a.kind==='target')){manualSuccess=true;report.confirmation=confirmed?'explicit remote tap':'native automatic confirmation (auto_confirm)';break;}
  if(s.over)break;
  const ok=s.controls.find(n=>n.text==='确定');
  if(s.characters.length&&!s.selected.buttons){await tap({...s.characters[0],kind:'character'});continue;}
  if(ok&&(s.selected.buttons||s.selected.targets||(s.selected.cards&&!s.targets.length))){if(s.selected.cards){confirmed=true;await shot('confirm');}await tap({...ok,kind:'confirm'});lastCard=false;continue;}
  if(s.targets.length&&s.selected.cards){await tap({...s.targets[0],kind:'target'});await shot('target');continue;}
  if(s.cards.length&&(!s.selected.cards||s.event==='chooseToDiscard')){await tap({...s.cards.find(c=>c.text.includes('杀'))||s.cards[0],kind:'card'});lastCard=true;await shot('card');continue;}
  const end=s.controls.find(n=>/结束|取消/.test(n.text));if(end&&lastCard&&!s.targets.length){await tap({...end,kind:'cancel'});lastCard=false;continue;}
  if(end&&!s.cards.length&&!s.characters.length)await tap({...end,kind:'end'});
  await sleep(500);
 }
 report.manualTargetUseCard=manualSuccess;report.manualDurationSeconds=(Date.now()-begin)/1000;report.manualState=await state();report.inputs=await evaluate(()=>window.__hhInputs);await shot('battle');await client.screenshot({path:root+'/handheld-stream-client.png'});await save();
 // Paused identical scene: fixed encoder settings, alternating actual theme handler.
 await evaluate(async()=>{const{game}=await import('/noname.js');game.pause();});
 report.performance=[];
 for(const theme of ['simple','handheld','simple','handheld']){
  await evaluate(async theme=>{const{lib}=await import('/noname.js');await lib.configMenu.appearence.config.theme.onclick(theme);},theme);await sleep(2000);
  const a=await stats();const samples=[];
  for(let i=0;i<8;i++){const raw=execFileSync('docker',['stats','noname-stream','--no-stream','--format','{{json .}}'],{encoding:'utf8'}).trim();samples.push(JSON.parse(raw));await sleep(1000);}
  const b=await stats();report.performance.push({theme,scene:'same paused battle',samples,before:a,after:b});await save();
 }
 await evaluate(async()=>{const{game,ui,_status}=await import('/noname.js');game.resume();if(!_status.auto)ui.click.auto('forced');});
 // Observe a natural AI completion, never invoke game.over or alter HP/rules.
 for(let i=0;i<600;i++){const s=await state();report.latest=s;if(i%15===0){console.log('natural',s.round,s.players,s.over);await save();}if(s.over){report.naturalOver=true;await sleep(2000);await shot('result');break;}await sleep(1000);}
 report.final=await state();report.requestPaths=[...paths];await save();
}catch(error){report.failure=String(error);report.requestPaths=[...paths];await save();throw error;}finally{await browser.close();ws.close();}
