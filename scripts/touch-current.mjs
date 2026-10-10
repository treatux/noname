import {androidPage} from './android-cdp.mjs';import {touchPlayerChoices} from './touch-player.mjs';
const page=await androidPage(process.env.ANDROID_CDP||'http://127.0.0.1:19222');page.on('dialog',d=>d.accept());
try{await touchPlayerChoices(page,'/root/noname-cloud/evidence/android-touch-current.json');}finally{await page.evaluate(async()=>{const {ui,_status}=await import('/noname.js');if(!_status.auto)ui.click.auto('forced');});await page.close();}
