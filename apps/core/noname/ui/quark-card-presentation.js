// Supplied EpicFX extension.js:4318-4418 and cardFace/1000/face.css.
// DOM-only adapter: never replaces Card.init or modifies card rule data.
import {lib, get} from '../../noname.js';
import {quarkCardTextures} from './quark-card-textures.js';
const mounts = new Map();
function texture(name) {
 return quarkCardTextures.has(name) ? `${lib.assetURL}theme/quark_migration/assets/epic-texture/${name}` : null;
}
function image(file, className='') {
 const src=texture(file);
 if (!src) return null;
 const img=document.createElement('img');img.src=src;img.className=className;img.alt='';img.setAttribute('aria-hidden','true');
 return img;
}
export function restoreQuarkCards() {
 for (const [card,mount] of mounts) {
  mount.suit.remove();mount.type.remove();mount.art?.remove();mount.distance.remove();
  card.classList.remove('quark-epic-card','quark-epic-art','quark-distance-replaced');
 }
 mounts.clear();
 // Include transient engine clones which may never enter the mount map.
 for (const n of document.querySelectorAll('.quark-suit-num,.quark-card-type,.quark-card-art,.quark-card-distance')) n.remove();
 for (const card of document.querySelectorAll('.quark-epic-card,.quark-epic-art,.quark-distance-replaced')) card.classList.remove('quark-epic-card','quark-epic-art','quark-distance-replaced');
}
function syncNativeDistance(card,distance){
 const ranges=card.querySelectorAll(':scope > .range');
 card.classList.toggle('quark-distance-replaced',distance.children.length>0 && ranges.length===1 && ranges[0].children.length===0 && !lib.card[card.name]?.addinfo);
}
export function syncQuarkCard(card, title) {
 if (!card.name || !title || card.classList.contains('fullborder') || card.classList.contains('fullimage')) return;
 const type=get.type(card), subtype=get.subtype(card);
 const signature=JSON.stringify([card.name,card.nature,card.suit,card.number,type,subtype]);
 let mount=mounts.get(card);
 if (mount?.signature === signature && mount.suit.parentNode===card) {syncNativeDistance(card,mount.distance);return;}
 if (mount) {mount.suit.remove();mount.type.remove();mount.art?.remove();mount.distance.remove();}
 // Engine visual copies clone DOM but are not the original Card identity.
 // Remove inherited decorations before mounting, avoiding duplicated suit/art.
 for (const n of card.querySelectorAll(':scope > .quark-suit-num,:scope > .quark-card-type,:scope > .quark-card-art,:scope > .quark-card-distance')) n.remove();
 const suit=document.createElement('div');suit.className='quark-suit-num';suit.setAttribute('aria-hidden','true');
 const num=document.createElement('span');num.className='number';num.textContent=({1:'A',11:'J',12:'Q',13:'K'})[card.number] || (card.number || '');
 const suitText=document.createElement('span');suitText.className='suit';suitText.textContent=get.translation(card.suit || '');
 suit.append(num,document.createElement('br'),suitText);
 suit.classList.toggle('red',card.suit==='heart'||card.suit==='diamond');
 const badge=document.createElement('div');badge.className='quark-card-type';badge.classList.toggle('trick',type==='trick'||type==='delay');badge.classList.toggle('equip',type==='equip');badge.setAttribute('aria-hidden','true');
 const badgeImage=image(type==='equip'?'type2.png':type==='trick'||type==='delay'?'type.png':'');
 if (badgeImage) badge.append(badgeImage);
 const name=card.name==='sha'?({fire:'huosha',thunder:'leisha',kami:'shensha',ice:'bingsha',stab:'cisha'})[card.nature] || card.name:card.name;
 const nameImage=image(`${name}.png`);
 title.replaceChildren(nameImage || document.createTextNode(get.translation(card.name)));
 title.classList.toggle('base',type==='basic');
 const pic=image(`pic_${card.name}.png`,type==='equip'?`equip ${subtype}`:'');
 const art=pic?document.createElement('div'):null;
 if (art) {art.className='quark-card-art';art.setAttribute('aria-hidden','true');art.append(pic);card.append(art);}
 const distance=document.createElement('div');distance.className='quark-card-distance';distance.setAttribute('aria-hidden','true');
 const dist=lib.card[card.name]?.distance;
 if (type==='equip' && ['equip1','equip3','equip4'].includes(subtype)) {
  const weapon=subtype==='equip1';
  const icon=image(weapon?'wuqi_distance.png':subtype==='equip3'?'pic_def.png':'pic_att.png',weapon?'fanwei':'aas');
  const value=weapon?(dist?.attackFrom ? -dist.attackFrom+1:1):Math.abs((subtype==='equip3'?dist?.globalTo:dist?.globalFrom) || 1);
  const digit=image(`card_distance_${value}.png`,weapon?'juli':'num');
  if (icon) distance.append(icon);if (digit) distance.append(digit);
 }
 card.append(suit,badge,distance);
 card.classList.add('quark-epic-card');card.classList.toggle('quark-epic-art',!!art);
 // Replace only plain native distance text. Tagged/additional ranges remain
 // native so card tags and supplementary rule descriptions are never hidden.
 syncNativeDistance(card,distance);
 mounts.set(card,{signature,suit,type:badge,art,distance});
 for (const [old,m] of mounts) if (!old.isConnected) {m.suit.remove();m.type.remove();m.art?.remove();m.distance.remove();mounts.delete(old);}
}
