// UI-only decoration; native Player, events, rules and AI stay authoritative.
import {lib, game, ui, _status, get} from '../../noname.js';
let installed = false;
export function installQuarkPresentation() {
 if (installed) return;
 installed = true;
 let scheduled = false;
 const playerMounts = new Map();
 function restorePlayer(player, mount) {
  for (const original of mount.originals) {
   if (original.next?.parentNode === original.parent) original.parent.insertBefore(original.node, original.next);
   else original.parent.append(original.node);
   original.node.className = original.className;
  }
  mount.camp.remove(); mount.hp.remove();
  playerMounts.delete(player);
 }
 function sync() {
  scheduled = false;
  const enabled = lib.config.theme === 'quark_migration';
  for (const card of document.querySelectorAll('.card')) {
   let title = card.querySelector(':scope > .quark-top-name');
   if (!enabled || !card.name) {title?.remove();continue;}
   if (!title) {title=document.createElement('div');title.className='quark-top-name';title.setAttribute('aria-hidden','true');card.append(title);}
   const text=get.translation(card.name);
   if(title.textContent!==text)title.textContent=text;
   title.classList.toggle('base',get.type(card)==='basic');
  }
  for (const control of document.querySelectorAll('.control')) {
   const confirm = enabled && control === ui.confirm;
   control.classList.toggle('quark-confirm', confirm);
   for (const button of control.children) {
    const ok = confirm && button.link === 'ok';
    const cancel = confirm && button.link === 'cancel';
    button.classList.toggle('quark-ok', ok);
    button.classList.toggle('quark-cancel', cancel);
    button.classList.toggle('quark-redraw', ok && _status.event?.name === 'gameDraw');
    button.classList.toggle('quark-discard', ok && _status.event?.name === 'chooseToDiscard' && _status.event?.parent?.name === 'phaseDiscard');
   }
  }
  for (const [player, mount] of playerMounts) if (!enabled || !player.isConnected) restorePlayer(player, mount);
  const arena = document.querySelector('#arena');
  if (arena) arena.classList.toggle('quark-player-presentation', enabled);
  for (const player of document.querySelectorAll('#arena > .player')) {
   if (enabled && player.node?.name && player.node?.hp && !playerMounts.has(player)) {
    const camp = document.createElement('div'); camp.className = 'camp-wrap';
    const hp = document.createElement('div'); hp.className = 'hp-wrap';
    const originals = [player.node.name, player.node.hp].map(node => ({node, parent:node.parentNode, next:node.nextSibling, className:node.className}));
    const campName = document.createElement('div'); campName.className = 'camp-name';camp.append(campName);
    const placeholder = document.createElement('div'); placeholder.className = 'avatar-name-default';placeholder.innerHTML = '主<br>将';camp.append(placeholder);
    camp.append(player.node.name); player.node.name.classList.add('avatar-name');
    hp.append(player.node.hp);player.append(camp, hp);
    playerMounts.set(player, {camp, hp, campName, originals});
   }
   const mount = playerMounts.get(player);
   if (mount) {
    const group = ['wei','shu','wu','qun','shen','jin','key'].includes(player.group) ? player.group : '';
    if (mount.camp.dataset.camp !== group) {
     mount.camp.dataset.camp = group;
     mount.campName.style.backgroundImage = group ? `url("${lib.assetURL}theme/quark_migration/assets/name2_${group}.png")` : '';
    }
   }
   let ornament = player.querySelector(':scope > .quark-rarity-long');
   const rarity = player.name ? game.getRarity(player.name) : 'junk';
   const show = enabled && lib.config.mode !== 'guozhan' && rarity !== 'junk';
   if (!show) { ornament?.remove(); continue; }
   if (!ornament) {
    ornament = document.createElement('img');
    ornament.className = 'quark-rarity-long';
    ornament.alt = ''; ornament.setAttribute('aria-hidden', 'true');
    player.append(ornament);
   }
   const safeRarity = ['common','rare','epic','legend'].includes(rarity) ? rarity : 'common';
   const src = `${lib.assetURL}theme/quark_migration/assets/long_${safeRarity}.png`;
   if (ornament.getAttribute('src') !== src) ornament.setAttribute('src', src);
  }
 }
 const schedule = () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(sync);
 };
 new MutationObserver(schedule).observe(document.documentElement, {childList: true, subtree: true});
 lib.announce.subscribe('Noname.Apperaence.Theme.onChangeFinished', schedule);
 schedule();
}
