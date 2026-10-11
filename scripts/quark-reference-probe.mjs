// Isolated context on existing reference browser; never writes existing profile.
import {chromium} from '/root/pi-web/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const out='/root/noname-cloud/evidence/quark-migration/full-reference';await fs.mkdir(out,{recursive:true});
const backup=JSON.parse(Buffer.from(await fs.readFile('/root/noname-cloud/reference/quark-handheld/runtime/无名杀 - 数据 - 2025.7.21 16.06.26','utf8'),'base64').toString()).config;
const extensions=['十周年UI','手杀ui','皮肤切换','EpicFX','如真似幻','假装无敌','选将美化'];
const config={};
const cosmetics=new Set(['theme','layout','touchscreen','image_background','card_style','cardback_style','hp_style','name_font','identity_font','cardtext_font','global_font','ui_zoom']);
for(const[k,v]of Object.entries(backup))if(cosmetics.has(k)||extensions.some(n=>k.startsWith(`extension_${n}_`)))config[k]=v;
Object.assign(config,{extensions,mode:'doudizhu',new_tutorial:true,show_splash:'off',version:'1.12.7.0711_β',connect_read_clipboard:false,background_music:'music_off',volumn_audio:0,volumn_background:0,characters:['standard','shenhua','refresh'],cards:['standard','extra']});
for(const n of extensions)config[`extension_${n}_enable`]=true;
config.extension_十周年UI_dynamicSkin=false;config.extension_皮肤切换_useDynamic=false;config.extension_皮肤切换_previewDynamic=false;config.skin={};config.qhly_skinset={};
const report={scope:'All seven available UI extensions enabled in isolated context; skin payload excluded',requestedExtensions:extensions,errors:[],runtimePassed:false};
const browser=await chromium.launch({executablePath:'/root/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const context=await browser.newContext({viewport:{width:1280,height:720},hasTouch:true});const page=await context.newPage();page.setDefaultTimeout(15000);
page.on('pageerror',e=>report.errors.push(String(e).slice(0,1000)));page.on('dialog',d=>d.dismiss());
const root='/root/noname-cloud/reference/quark-handheld/runtime';
await context.route('**/*',async r=>{
 const u=new URL(r.request().url());
 if(u.origin!=='http://127.0.0.1:18112'){await r.abort();return;}
 const p=decodeURIComponent(u.pathname);
 if(p==='/preset.json')return r.fulfill({contentType:'application/json',body:JSON.stringify(config)});
 if(p==='/'||p==='/index.html')return r.fulfill({contentType:'text/html',path:'/root/noname-quark/deploy/index.html'});
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
try{
 await page.goto('http://127.0.0.1:18112/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForTimeout(15000);
 await page.screenshot({path:out+'/home-or-start.png',timeout:15000});
 const offline=page.locator('#offlinebutton');
 if(await offline.isVisible()){
  await offline.click({timeout:10000});
  await page.waitForTimeout(15000);
  await page.screenshot({path:out+'/offline-or-battle.png',timeout:15000});
 }
 report.runtime=await page.evaluate(()=>{
  const rt=window.quarkRuntime;return{path:location.pathname,version:rt?.lib.version,players:rt?.game.players?.length||0,arena:!!document.querySelector('#arena'),savedEnable:JSON.parse(localStorage.getItem('noname_0.9_config')||'{}').extensions,activeEnable:rt?.lib.config.extensions?.filter(n=>rt.lib.config[`extension_${n}_enable`]),visibleButtons:[...document.querySelectorAll('button,.button,.control')].filter(n=>n.offsetWidth).map(n=>n.textContent?.trim().slice(0,50)).slice(0,25)};
 });
 report.runtimePassed=!!report.runtime.arena&&report.runtime.players>0;
}catch(e){report.failure=String(e);}
finally{await fs.writeFile(out+'/runtime.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await context.close();await browser.close();}
