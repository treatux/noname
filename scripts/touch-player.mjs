import fs from 'node:fs/promises';
// Input via actual WebView touch events, not ai.basic or game.choose replacement.
export async function touchPlayerChoices(page,path){
 const actions=[];const started=Date.now(),end=started+180000;
 const counts={character:0,card:0,target:0,confirm:0};
 let last='';
 while(Date.now()<end){
  const state=await page.evaluate(async()=>{
   const {game,ui,_status}=await import('/noname.js');
   const nodes=[...document.querySelectorAll('.button.selectable,.card.selectable,.player.selectable,.control>div')];
   const items=nodes.filter(n=>{const r=n.getBoundingClientRect();return r.width>0&&r.height>0&&!n.closest('#menu-container');}).map(n=>{const r=n.getBoundingClientRect();return{type:n.matches('.button')?'character':n.matches('.card')?'card':n.matches('.player')?'target':'confirm',text:n.innerText.slice(0,80),selected:n.classList.contains('selected'),x:r.x+r.width/2,y:r.y+r.height/2,card:n.name,classes:n.className};});
   return{event:_status.event?.name,step:_status.event?.step,me:game.me?.name,over:!!_status.over,selected:{buttons:ui.selected.buttons.length,cards:ui.selected.cards.length,targets:ui.selected.targets.length},items};
  });
  if(state.over)break;
  let item;
  // Buttons first; then a playable card, legal targets, and visible confirmation.
  if(!state.selected.buttons)item=state.items.find(n=>n.type==='character'&&!n.selected);
  if(!item&&!state.selected.cards)item=state.items.find(n=>n.type==='card'&&!n.selected);
  if(!item)item=state.items.find(n=>n.type==='target'&&!n.selected);
  if(!item)item=state.items.find(n=>n.type==='confirm'&&/^(确定|确认|结束回合|结束|取消)$/.test(n.text));
  if(item){const key=JSON.stringify([state.event,state.step,state.selected,item.type,item.text,item.card]);if(key!==last){last=key;const before=Date.now();await page.tap(item.x,item.y);await page.waitForTimeout(200);const after=await page.evaluate(async()=>{const {game,ui,_status}=await import('/noname.js');return {event:_status.event?.name,me:game.me?.name,selected:{buttons:ui.selected.buttons.length,cards:ui.selected.cards.length,targets:ui.selected.targets.length},result:_status.event?.result,history:game.me?.getHistory('useCard')?.map(e=>({name:e.card.name,targets:e.targets.map(p=>p.name)}))};});actions.push({elapsedMs:Date.now()-started,touch:item,before:state,after,observationLatencyMs:Date.now()-before});counts[item.type]++;await fs.writeFile(path,JSON.stringify({counts,actions},null,2));}}
  if(counts.character&&counts.card&&counts.target&&counts.confirm)break;
  await page.waitForTimeout(250);
 }
 await fs.writeFile(path,JSON.stringify({counts,actions,completedAt:new Date().toISOString(),note:'Touch via Input.dispatchTouchEvent; observation latency includes fixed200ms wait and CDP, not native end-to-end phone latency.'},null,2));
 await page.screenshot({path:path.replace('.json','.png')});
}
