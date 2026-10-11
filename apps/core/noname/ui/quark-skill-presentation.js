// UI interface adaptation of supplied 手杀ui skill/main1.js:41-56,266-275,
// 742-817,971-1029. Native controls remain authoritative for availability/input.
import {lib, game, ui, _status, get} from '../../noname.js';
let panel, signature='';
const hiddenControls=new Set();
export function restoreQuarkSkills(){
 panel?.remove();panel=null;signature='';
 for(const n of hiddenControls)n.classList.remove('quark-native-skill-source');
 hiddenControls.clear();
}
function availableButtons(){
 if(ui.control?.classList.contains('hidden'))return [];
 return [ui.skills,ui.skills2,ui.skills3].filter(n=>n?.isConnected && n.style.display!=='none' && !n.classList.contains('hidden') && !n.classList.contains('disabled') && !n.classList.contains('removing')).flatMap(n=>[...n.children].filter(b=>typeof b.link==='string'));
}
export function syncQuarkSkills(){
 if(lib.config.theme!=='quark_migration'||!ui.arena||!game.me?.name||['chess','tafang','stone'].includes(lib.config.mode)){restoreQuarkSkills();return;}
 const controls=[ui.skills,ui.skills2,ui.skills3].filter(n=>n?.isConnected);
 for(const n of hiddenControls)if(!controls.includes(n)){n.classList.remove('quark-native-skill-source');hiddenControls.delete(n);}
 for(const n of controls){n.classList.add('quark-native-skill-source');hiddenControls.add(n);}
 const buttons=availableButtons(), available=new Set(_status.event?.player===game.me?buttons.map(b=>b.link):[]);
 const ids=[...new Set([...game.me.getSkills(),...available])].filter(id=>{
  const info=lib.skill[id];return info&&!info.charlotte&&!info.hiddenSkill&&lib.translate[id]&&(!info.zhuSkill||game.me.hasZhuSkill(id));
 });
 const items=[];
 for(const id of ids){
  const expanded=game.expandSkills([id]).filter(k=>lib.skill[k]?.enable&&lib.translate[k]);
  const show=[id,...expanded.filter(k=>get.translation(k)!==get.translation(id))];
  for(const key of show)if(!items.some(n=>n.id===key)){
   const info=lib.skill[key];if(!info)continue;
   const selected=_status.event?.player===game.me&&_status.event?.skill===key;
   items.push({id:key,name:String(lib.translate[key+'_ab']||get.translation(key)).slice(0,4),active:!!info.enable,usable:available.has(key),selected});
  }
 }
 const next=JSON.stringify([game.me.name,items]);
 if(next===signature&&panel?.parentNode===ui.arena)return;
 signature=next;
 if(!panel||panel.parentNode!==ui.arena){panel?.remove();panel=document.createElement('div');panel.className='quark-skill-panel';ui.arena.append(panel);}
 panel.replaceChildren();
 const enable=document.createElement('div'),trigger=document.createElement('div');enable.className='enable';trigger.className='trigger';
 panel.append(enable,trigger);
 for(const item of items){
  const n=document.createElement('div');n.className='skillitem';n.dataset.id=item.id;n.link=item.id;n.textContent=item.name;
  n.classList.toggle('usable',item.usable);n.classList.toggle('select',item.selected);
  n.setAttribute('role',item.active?'button':'note');if(item.active)n.setAttribute('aria-disabled',String(!item.usable));
  n.title=get.skillInfoTranslation(item.id,game.me)||item.name;
  if(item.active){
   // Supplied clickSkill forwards to the current underlying native control.
   // Re-check live availability, never directly invoke ui.click.skill/useSkill.
   n.addEventListener(lib.config.touchscreen?'touchend':'click',e=>{
    e.stopPropagation();if(_status.event?.player!==game.me)return;
    const source=availableButtons().find(b=>b.link===item.id);if(!source)return;
    source.dispatchEvent(new Event(lib.config.touchscreen?'touchend':'click'));
   });
  }
  (item.active?enable:trigger).append(n);
 }
 enable.style.width=enable.children.length>2?'200px':enable.children.length?'120px':'0px';
 trigger.style.width=enable.children.length>2?'200px':'120px';
}
