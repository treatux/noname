// UI-only decoration; native Player, events, rules and AI stay authoritative.
import {lib, game, ui, _status, get} from '../../noname.js';
import {computeQuarkHandLayout} from './quark-hand-layout.js';
let installed = false;
export function installQuarkPresentation() {
 if (installed) return;
 installed = true;
 let scheduled = false;
 const playerMounts = new Map();
 // Adapt only the presentation entry point. The original remains authoritative
 // for every other theme and is reinstated on fallback; no card/event/AI hook.
 const nativeUpdateHand = ui.updatehl;
 let handLayoutActive = false;
 function updateHand() {
  if (lib.config.theme !== 'quark_migration') return nativeUpdateHand.call(ui);
  handLayoutActive = true;
  for (const container of [ui.handcards1Container, ui.handcards2Container]) {
   const hand = container?.firstElementChild;
   if (!hand) continue;
   const cards = [...hand.children].filter(n => n.classList.contains('card') && !n.classList.contains('removing'));
   if (!cards.length) {hand.style.width = '100%';container.classList.remove('scrollh');continue;}
   // Supplied 十周年UI extension.js:9795-9877 (left aligned, min 27*scale).
   // getCardBestScale/getHandCardSize:10764-10777. Native card selection
   // adds its own translateY to _transform, so no input handler is replaced.
   const cw = cards[0].offsetWidth, ch = cards[0].offsetHeight;
   const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|OperaMini/i.test(navigator.userAgent);
   const scale = Math.min(document.body.offsetHeight * (mobile ? 0.23 : 0.18) / (ch * 0.95), 1);
   // Supplied layout.resize:10068-10072 sizes the hand wrapper from the
   // same scale, rather than the stylesheet's initial 170px placeholder.
   ui.arena.style.setProperty('--quark-hand-height', Math.round(ch * 0.95 * scale + 30.4) + 'px');
   const skillCount = ui.skills?.children.length || 0;
   const width = ui.me.offsetWidth * (skillCount > 2 ? 0.95 : 0.996);
   const layout = computeQuarkHandLayout({count:cards.length,width,cardWidth:cw,cardHeight:ch,scale,fold:lib.config.fold_card});
   const {expand, y} = layout;
   cards.forEach((card, i) => {
    const x = layout.positions[i];
    card._transform = `translate(${x}px,${y}px) scale(${scale})`;
    card.style.transform = card._transform + (card.classList.contains('selected') ? ' translateY(-20px)' : '');
    card.classList.remove('drawinghidden');
    // Clear only native cramped-card transforms, not suit/rank content.
    if (card.node?.info) {card.node.info.style.transform = '';const span = card.node.info.querySelector('span');if (span) span.style.display = '';}
    if (card.node?.name) {card.node.name.style.transform = '';card.node.name.style.transformOrigin = '';}
   });
   container.classList.toggle('scrollh', expand);
   container.style.overflowX = expand ? 'scroll' : '';
   container.style.overflowY = expand ? 'hidden' : '';
   hand.style.width = expand ? layout.width + 'px' : '100%';
  }
 }
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
  if (enabled) {
   if (ui.updatehl !== updateHand) ui.updatehl = updateHand;
   updateHand();
  } else if (handLayoutActive) {
   if (ui.updatehl === updateHand) ui.updatehl = nativeUpdateHand;
   for (const container of [ui.handcards1Container, ui.handcards2Container]) if (container) {container.style.overflowX = '';container.style.overflowY = '';}
   ui.arena?.style.removeProperty('--quark-hand-height');
   handLayoutActive = false;
   nativeUpdateHand.call(ui);
  }
  for (const card of document.querySelectorAll('.card')) {
   let title = card.querySelector(':scope > .quark-top-name');
   if (!enabled || !card.name) {title?.remove();continue;}
   if (!title) {title=document.createElement('div');title.className='quark-top-name';title.setAttribute('aria-hidden','true');card.append(title);}
   const text=get.translation(card.name);
   if(title.textContent!==text)title.textContent=text;
   title.classList.toggle('base',get.type(card)==='basic');
  }
  for (const skills of [ui.skills, ui.skills2, ui.skills3]) {
   if (!skills) continue;
   skills.classList.toggle('quark-skill-control', enabled);
   skills.classList.toggle('skill-control', enabled);
  }
  for (const menu of document.querySelectorAll('.menu, .new-menu, .dialog.popped')) {
   menu.classList.toggle('quark-menu', enabled);
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
 window.addEventListener('resize', schedule);
 lib.announce.subscribe('Noname.Apperaence.Theme.onChangeFinished', schedule);
 schedule();
}
