// Copy only explicitly selected local UI assets; no downloads or skin resources.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root = path.resolve(import.meta.dirname, '..');
const reference = '/root/noname-cloud/reference/quark-handheld/runtime';
const pairs = [
 ['image/background/cdv_cdv_ol_bg.jpg','background.jpg'],
 ['font/shousha.ttf','shousha.ttf'],
 ['theme/style/card/image/ol.png','card-ol.png'],
 ['theme/style/cardback/image/ol.png','cardback-ol.png'],
 ['theme/style/cardback/image/ol2.png','cardback-ol2.png'],
 ...['btn.png','confirm-bg-c.png','cbtn.png','QX.png','huanpai2.png','qipai.png'].map(x=>[`extension/手杀ui/lbtn/images/uibutton/${x}`,x]),
 ['extension/手杀ui/fonts/HYZLSJ.ttf','HYZLSJ.ttf'],
 ...['common','rare','epic','legend','junk'].map(x=>[`extension/十周年UI/assets/image/long_${x}.png`,`long_${x}.png`]),
];
const entries=[];
for(const [from,to] of pairs){
 const bytes=await fs.readFile(path.join(reference,from));
 for(const base of ['apps/core/theme/quark_migration','dist/theme/quark_migration']){
  await fs.mkdir(path.join(root,base,'assets'),{recursive:true});
  await fs.writeFile(path.join(root,base,'assets',to),bytes);
 }
 entries.push({source:from,target:`theme/quark_migration/assets/${to}`,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
await fs.writeFile(path.join(root,'docs/cloud/quark-migration/ui-assets.json'),JSON.stringify({scope:'First batch: actual supplied UI assets only; no full restoration claim',entries},null,2)+'\n');
console.log(`Copied ${entries.length} UI assets with SHA-256 manifest`);
