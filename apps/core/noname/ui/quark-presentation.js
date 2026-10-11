// UI-only decoration; native Player, events, rules and AI stay authoritative.
import {lib, game, ui, _status} from '../../noname.js';
let installed = false;
export function installQuarkPresentation() {
 if (installed) return;
 installed = true;
 let scheduled = false;
 function sync() {
  scheduled = false;
  const enabled = lib.config.theme === 'quark_migration';
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
  for (const player of document.querySelectorAll('#arena > .player')) {
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
