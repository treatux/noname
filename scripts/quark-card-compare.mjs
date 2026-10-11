// Geometry subset only: random games are NOT full same-stage visual acceptance.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const [referencePath,targetPath,outputPath]=process.argv.slice(2);
if (!outputPath) throw new Error('Usage: node scripts/quark-card-compare.mjs reference.json target.json output.json');
const reference=JSON.parse(await fs.readFile(referencePath,'utf8'));
const target=JSON.parse(await fs.readFile(targetPath,'utf8'));
const aliases={'image':'art','suit-num':'suit','top-name':'title','card-type':'type','distance':'distance','quark-card-art':'art','quark-suit-num':'suit','quark-top-name':'title','quark-card-type':'type','quark-card-distance':'distance'};
function normalized(card,rect){
 return Object.fromEntries(card.positions.map(p=>[aliases[p.class.split(' ')[0]],{
  x:(p.rect.x-rect.x)/rect.width*108,y:(p.rect.y-rect.y)/rect.height*150,
  width:p.rect.width/rect.width*108,height:p.rect.height/rect.height*150
 }]));
}
const report={scope:'Card-layer geometry subset only; random cards, characters and events differ. No full visual acceptance.',reference:referencePath,target:targetPath,tolerance:0.03,comparisons:[],unmatchedTypes:[],passed:false};
for(const [i,card] of target.runtime.cardPresentation.entries()){
 const type=card.type || (card.typeImage?.includes('type2.png')?'equip':card.typeImage?.includes('type.png')?'trick':'basic');
 const j=reference.geometry.cardPresentation.findIndex(c=>c.type===type);
 if(j<0){report.unmatchedTypes.push({name:card.name,type});continue;}
 const expected=normalized(reference.geometry.cardPresentation[j],reference.geometry.hand[j]);
 const actual=normalized(card,target.runtime.handLayout.cards[i]);
 for(const [layer,values] of Object.entries(expected)){
  for(const [property,value] of Object.entries(values)){
   const delta=actual[layer]?Math.abs(actual[layer][property]-value):null;
   report.comparisons.push({name:card.name,referenceName:reference.geometry.cardPresentation[j].name,type,layer,property,reference:value,target:actual[layer]?.[property],delta,matched:delta!==null&&delta<=report.tolerance});
  }
 }
}
report.passed=report.comparisons.length>0&&report.comparisons.every(c=>c.matched);
await fs.writeFile(outputPath,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({scope:report.scope,comparisons:report.comparisons.length,unmatchedTypes:report.unmatchedTypes,passed:report.passed}));
assert(report.passed,'Measured card-layer subset differs; see output report');
