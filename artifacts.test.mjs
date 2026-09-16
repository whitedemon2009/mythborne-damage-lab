import assert from 'node:assert/strict';
import {newPiece,pieceStats,rollSlots,addPieceRoll,substats} from './artifacts.mjs';
for(const initial of [3,4])for(let level=1;level<=15;level++){
 const p=newPiece(0);p.initial=initial;p.level=level;
 const cap=Math.max(0,Math.floor(level/3)-(initial===3?1:0));assert.equal(rollSlots(p).length,cap);
 const before=pieceStats(p);let delta=0;
 for(let i=0;i<cap;i++){const tier=i%3;assert.equal(addPieceRoll(p,0,tier),true);delta+=substats[p.subs[0].stat][tier];}
 assert.equal(addPieceRoll(p,0,2),false);assert.ok(Math.abs(pieceStats(p)[p.subs[0].stat]-before[p.subs[0].stat]-delta)<1e-9);
 if(cap){p.rolls[rollSlots(p)[0]]=null;assert.equal(addPieceRoll(p,1,0),true);assert.equal(addPieceRoll(p,1,0),false);}
 assert.equal(pieceStats(p).hpBase,707*level/15);
}
const legacy=newPiece(0);legacy.rolls=Array.from({length:5},()=>({line:0,tier:1}));assert.ok(Math.abs(pieceStats(legacy).crit-16.8)<1e-9);legacy.initial=3;assert.equal(pieceStats(legacy).crit,14);
console.log('PASS min/mid/max totals and roll caps at all 15 levels, undo/refill, base scaling, legacy saves');
