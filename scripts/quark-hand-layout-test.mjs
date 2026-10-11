import assert from 'node:assert/strict';
import {computeQuarkHandLayout} from '../apps/core/noname/ui/quark-hand-layout.js';
const base={width:773*.996,cardWidth:108,cardHeight:150,scale:720*.18/(150*.95),fold:true};
const four=computeQuarkHandLayout({...base,count:4});
assert.deepEqual(four.positions,[-5,93,192,290]);
assert.equal(four.y,-7);assert.equal(four.expand,false);
for(const count of [0,1,4,8,20,40]){
 const r=computeQuarkHandLayout({...base,count});
 assert.equal(r.positions.length,count);
 assert(r.positions.every(Number.isFinite));
 assert(r.margin>=27*base.scale);
 if(count===40){assert(r.expand);assert(r.width>base.width);assert.equal(r.margin,27*base.scale);}
}
const noFold=computeQuarkHandLayout({...base,count:40,fold:false});
assert.equal(noFold.expand,false);assert(noFold.margin<27*base.scale);
const one=computeQuarkHandLayout({...base,count:1});assert.equal(one.positions.length,1);
console.log('quark hand arithmetic: original 4-card offsets, empty/single, crowded 8/20/40, min27 and fold-off PASS');
