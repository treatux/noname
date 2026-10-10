// Minimal WebView page protocol adapter. Android WebView lacks Chromium's
// Browser context/download management required by Playwright connectOverCDP.
import fs from 'node:fs/promises';
export async function androidPage(endpoint) {
 const targets=await (await fetch(endpoint+'/json/list')).json();
 const target=targets.find(t=>t.type==='page');
 if(!target)throw new Error('No Android WebView page target');
 const socket=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 let id=0;const pending=new Map(),listeners=new Map();
 socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}}else for(const cb of listeners.get(m.method)||[])cb(m.params);});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;const timer=setTimeout(()=>{pending.delete(key);reject(new Error('CDP timeout: '+method));},60000);pending.set(key,{resolve,reject,timer});socket.send(JSON.stringify({id:key,method,params}));});
 const listen=(name,cb)=>{const l=listeners.get(name)||[];l.push(cb);listeners.set(name,l);};
 await send('Runtime.enable');await send('Page.enable');
 const evaluate=async(fn,arg)=>{const expression=`(${fn.toString()})(${arg===undefined?'undefined':JSON.stringify(arg)})`;const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 return {
  isAndroid:true,
  evaluate,
  addInitScript:fn=>send('Page.addScriptToEvaluateOnNewDocument',{source:`(${fn.toString()})()`}),
  route:async()=>{},
  goto:async url=>{const r=await send('Page.navigate',{url});if(r.errorText)throw new Error(r.errorText);await new Promise(r=>setTimeout(r,1500));},
  reload:async()=>{await send('Page.reload');await new Promise(r=>setTimeout(r,1500));},
  tap:async(x,y)=>{await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await new Promise(r=>setTimeout(r,80));await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});},
  waitForTimeout:ms=>new Promise(r=>setTimeout(r,ms)),
  textContent:()=>evaluate(()=>document.body.innerText),
  screenshot:async({path})=>{const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(path,Buffer.from(r.data,'base64'));},
  on(name,cb){
   if(name==='dialog')listen('Page.javascriptDialogOpening',p=>cb({message:()=>p.message,accept:()=>send('Page.handleJavaScriptDialog',{accept:true}),dismiss:()=>send('Page.handleJavaScriptDialog',{accept:false})}));
   if(name==='pageerror')listen('Runtime.exceptionThrown',p=>cb(new Error(p.exceptionDetails.exception?.description||p.exceptionDetails.text)));
   if(name==='console')listen('Runtime.consoleAPICalled',p=>cb({type:()=>p.type,text:()=>p.args.map(a=>a.value??a.description??'').join(' ')}));
  },
  close:async()=>socket.close(),
 };
}
