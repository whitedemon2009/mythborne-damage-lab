import assert from 'node:assert/strict';
import {runCombat,effectChance} from './combat.mjs';
import {Timeline} from './timeline.mjs';
const c={name:'A',level:60,atk:1000,hp:10000,def:500,speed:100,crit:0,critDmg:.5,energyCap:120,aspect:'Gungnir',element:'Hỏa'};
const cfg={count:1,level:60,hp:100000,maxToughness:720,toughness:720,weaknesses:[],speed:100,attack:100,hitEnergy:10,cycles:4,res:0,critMode:'normal',seed:1,dynamic:true};
const basic={actor:0,source:'Basic',ratio:1,hits:1,targets:1,target:0,toughness:30,efficiency:0,cost:0,refund:1,energy:20,realTurn:true};
const run=(as,cs=[c],conf={})=>runCombat({...cfg,...conf},cs,as);
const times=(r,actor=0)=>r.log.filter(e=>e.type==='turnStart'&&e.actor===actor).map(e=>e.av);
let r=run([basic]);assert.deepEqual(times(r),[100,200,300,400]);assert.equal(r.complete,true);
// 100 SPD -> 200 at AV50: remaining 50 becomes25; new real turns continue beyond original schedule.
r=run([{...basic,actor:1},{actor:0,source:'Buff',recipient:1,buffType:'speed',buffValue:100,duration:2,effectName:'Fast',av:50,realTurn:false}], [{...c,name:'Support'},{...c,name:'DPS'}]);
assert.deepEqual(times(r,1),[75,125,225,325,425]);
// AA subtracts full BaseAV, not remaining AV; capped to current time.
r=run([basic,{actor:1,source:'Buff',recipient:0,buffType:'advance',buffValue:.5,effectName:'Advance',av:75,realTurn:false}], [c,{...c,name:'B'}]);assert.equal(times(r)[0],75);
// Different names add, same name refreshes. Buff applied off-turn keeps full duration.
r=run([{...basic,av:50},{actor:0,source:'Buff',recipient:0,buffType:'damage',buffValue:.2,duration:2,effectName:'x',av:1},{actor:0,source:'Buff',recipient:0,buffType:'damage',buffValue:.2,duration:2,effectName:'x',av:2},{actor:0,source:'Buff',recipient:0,buffType:'damage',buffValue:.3,duration:2,effectName:'y',av:3}], [c],{dynamic:false,cycles:1});
assert.equal(r.log.find(e=>e.kind==='direct').amount,675);assert.equal(r.units[0].effects.length,2);assert.equal(r.units[0].effects[0].duration,1);
// No duration loss on FUA inserts.
r=run([{actor:0,source:'Buff',recipient:0,buffType:'damage',buffValue:.2,duration:2,effectName:'x',av:1},{...basic,source:'FUA',realTurn:false,av:2}], [c],{dynamic:false,cycles:1});assert.equal(r.units[0].effects[0].duration,2);
// Debuff modifies actual damage and expires after enemy actual turn.
r=run([{actor:0,source:'Debuff',buffType:'defReduction',buffValue:.5,effectName:'shred',duration:1,av:1},{...basic,av:2},{...basic,av:110}], [c],{dynamic:false,cycles:1});
assert.equal(r.log.filter(e=>e.kind==='direct')[0].amount,600);assert.equal(r.log.filter(e=>e.kind==='direct')[1].amount,450);
assert.equal(effectChance(1,.5,.3),1);assert.equal(effectChance(1,0,.3),.7);assert.equal(effectChance(1,100,1,true,true),0);
// Weakness implant never changes resistance.
r=run([{actor:0,source:'Debuff',buffType:'weakness',implantElement:'Hỏa',effectName:'weak',duration:2,av:1},{...basic,av:2}], [c],{dynamic:false,cycles:1});assert.equal(r.enemies[0].res,0);assert.equal(r.enemies[0].toughness,690);
// Multi-hit transfers remaining hits. True damage bypasses every mitigation.
r=run([{...basic,ratio:1,hits:2,av:1,trueDamage:true}], [c],{dynamic:false,count:2,hp:300,res:.9,reduction:.9,cycles:1});assert.equal(Object.values(r.totals)[0],600);assert.deepEqual(r.enemies.map(e=>e.hp),[0,0]);
// Bounce samples living targets reproducibly.
const bounce=[{...basic,ratio:2,hits:4,bounce:true,av:1}];assert.deepEqual(run(bounce,[c],{dynamic:false,count:3}).log,run(bounce,[c],{dynamic:false,count:3}).log);
// DoT kill awards energy once even when no further actions exist.
r=run([{...basic,source:'DoT',effectName:'burn',duration:2,av:1,energy:0,refund:0,realTurn:false}], [c],{dynamic:false,hp:100,cycles:1});assert.equal(r.units[0].currentEnergy,70);
// Astraeus-like explicit Ult costs differ from cap.
r=run([{...basic,source:'Ult',energyCost:100,av:1,realTurn:false,energy:0,refund:0}], [{...c,energyCap:200}],{dynamic:false,attack:0,hitEnergy:0,cycles:1});assert.equal(r.units[0].currentEnergy,0);assert.equal(r.executions.length,1);
// A -> B -> A allowed; own immediate re-trigger forbidden; bounded by owner-turn counters.
r=run([{...basic,av:1},{...basic,source:'FUA',actor:1,realTurn:false,trigger:'afterAttack',maxPerTurn:1,fuaId:'B',energy:10},{...basic,source:'FUA',actor:0,realTurn:false,trigger:'afterAttack',maxPerTurn:1,fuaId:'A',energy:10}], [c,{...c,name:'B'}],{dynamic:false,cycles:1});assert.deepEqual(r.executions.map(e=>e.actor),[0,1,0]);
// Multi-hit enemy action triggers only one counter, even with a higher per-turn limit.
r=run([{...basic,source:'Counter',trigger:'enemyHit',maxPerTurn:10,realTurn:false}], [c],{enemyHits:5,cycles:1});assert.equal(r.executions.filter(e=>e.source==='Counter').length,1);
// Immediate revive preserves remaining AV and consumes only highest priority source.
r=run([basic],[{...c,hp:100,speed:80,revives:[{type:'ally',uses:1},{type:'talent',uses:1}]}],{attack:1000,cycles:1});assert.equal(times(r)[0],125);assert.equal(r.units[0].revives[0].uses,1);assert.equal(r.units[0].revives[1].uses,0);assert.equal(r.units[0].effects.length,0);
// Additional true turn expires effects, does not reset the pending natural turn.
r=run([basic,{actor:1,source:'Buff',recipient:0,buffType:'extraTurn',av:50,realTurn:false}], [c,{...c,name:'B'}],{cycles:1});assert.deepEqual(times(r),[50,100]);
// Ready FIFO beats later advance, while genuine simultaneous natural turns favor allies.
const q=new Timeline();q.add({at:100,side:'enemy',index:0,natural:true});q.add({at:100,side:'ally',index:0,natural:true});q.add({at:200,side:'ally',index:1,natural:true});assert.equal(q.take(()=>100).side,'ally');q.advance('ally',1,100,1);assert.equal(q.take(()=>100).side,'enemy');
console.log('PASS dynamic timeline, effect lifecycle, probability, targeting, DoT kills, Ult costs, FUA chains, counter, revive, extra turn and FIFO');
// Self advance applies to the next natural turn, including when cast during current turn.
r=run([{actor:0,source:'Buff',recipient:0,buffType:'advance',buffValue:.5,realTurn:true,effectName:'selfAA'}],[c],{cycles:2});assert.deepEqual(times(r),[100,150,200,250]);
// A counter that breaks during Myrk's own action must not restore toughness in that same turn.
r=run([{...basic,source:'Counter',trigger:'enemyHit',maxPerTurn:1,realTurn:false,toughness:30}], [c],{weaknesses:['Hỏa'],maxToughness:30,toughness:30,cycles:1});assert.equal(r.enemies[0].toughness,0);assert.equal(r.log.filter(e=>e.type==='recover').length,0);
// Two shields from one owner with distinct sources share the incoming hit, never sum for HP overflow.
r=run([{actor:0,source:'Shield',recipient:0,ratio:0,flat:1000,shieldSource:'one',duration:2,av:1},{actor:0,source:'Shield',recipient:0,ratio:0,flat:600,shieldSource:'two',duration:2,av:2}], [c],{dynamic:false,attack:2400,cycles:1});assert.equal(r.units[0].currentHP,9800);assert.deepEqual(r.units[0].shields,[0,0]);
// A truly unbounded extra-turn loop is visibly failed, never returned as a completed DPS result.
r=run([{actor:0,source:'Buff',recipient:0,buffType:'advance',buffValue:1,realTurn:true,effectName:'loop'}],[c],{cycles:1});assert.equal(r.complete,false);assert.ok(r.error);
console.log('PASS self advance, break during enemy action, multi-source shields and explicit loop failure');
