import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runCombat} from './combat.mjs';
import {composeGear} from './gear.mjs';
import {newPiece} from './artifacts.mjs';
import {effectiveStats} from './effects.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('./catalog.json',import.meta.url)));
const base={name:'A',level:60,hp:10000,atk:1000,def:1000,speed:100,crit:.5,critDmg:.5,energyCap:400,aspect:'Gungnir',element:'Hỏa'};
const cfg={count:3,level:60,hp:1e7,maxToughness:60,toughness:60,weaknesses:['Hỏa'],speed:100,attack:400,hitEnergy:0,cycles:3,res:0,critMode:'sampled',seed:7,dynamic:false};
function owner(i,sets=[]){const memory=catalog.memories[i];const artifacts=sets.map((n,slot)=>({...newPiece(slot),set:catalog.artifacts[n].name}));return {...composeGear({...base,aspect:memory?.aspect||'Gungnir'},{memory:memory?.name||'',refine:1,artifacts},catalog),name:'A'};}
const basic={actor:0,source:'Basic',av:1,ratio:1,target:0,targets:3,hits:1,toughness:10,cost:0,refund:0,energy:0};
function run(i,actions,sets=[],extra={}){const r=runCombat({...cfg,...extra},[owner(i,sets),{...base,name:'B',speed:110}],actions);assert.ok(r.complete,`${i}: ${r.error}`);assert.ok(Object.values(r.totals).every(Number.isFinite));for(const u of r.units)for(const stat of ['atk','hp','def','speed','energy'])assert.ok(Number.isFinite(effectiveStats(u)[stat]||0),`${i}: ${stat}`);return r;}
const scenario=[{...basic,source:'Shield',ability:'Skill',recipient:0,flat:500,ratio:0,duration:5},{...basic,av:2,source:'Debuff',ability:'Skill',effectName:'slow',buffType:'speed',buffValue:-10,duration:5},{...basic,av:3,source:'DoT',effectName:'burn',duration:4,ratio:.3},{...basic,av:4,source:'Skill',enhanced:true,selfHPCost:.1},{...basic,av:5,source:'Ult',energyCost:100},{...basic,av:6,source:'Heal',ability:'Skill',recipient:0,flat:1000,ratio:0,delayedHeal:true},{...basic,av:7,source:'FUA',triggerActor:1},{...basic,av:8,source:'Counter'},{...basic,av:9,source:'Skill',toughness:100,annihilate:true},{...basic,av:10,source:'Skill',triggerDoT:true},{...basic,av:11,source:'Buff',ability:'Skill',recipient:1,buffType:'damage',buffValue:.1,duration:3},{...basic,actor:1,av:12,targets:1},{...basic,av:13,source:'Ult',energyCost:100},{...basic,av:14,source:'Basic',storedDamage:true}];
for(let i=0;i<catalog.memories.length;i++)run(i,scenario);
for(let i=0;i<catalog.artifacts.length;i++)for(const count of [2,4,5])run(-1,scenario,Array(count).fill(i));
console.log('PASS all 102 memories and all 22 sets at 2/4/5 pieces execute the mixed combat scenario without invalid values');
let r=run(39,[{...basic,source:'Skill'}],[],{cycles:1,attack:0});assert.equal(effectiveStats(r.units[0]).energy,.08);
r=run(77,[{...basic,selfHPCost:.1},{...basic,av:2,selfHPCost:.1}],[],{cycles:1,attack:0});assert.equal(effectiveStats(r.units[0]).energy,.1);
r=run(74,[{...basic,source:'Buff',ability:'Ult',recipient:1,buffType:'damage',buffValue:.1,energyCost:100}],[],{cycles:1,attack:0});assert.equal(effectiveStats(r.units[0]).allDamage,.6);assert.equal(r.units[0].currentEnergy,120);
r=run(48,[{...basic,actor:1,selfHPCost:.7},{...basic,av:2,source:'Heal',ability:'Skill',recipient:1,flat:1,ratio:0},{...basic,av:3,source:'Heal',ability:'Skill',recipient:1,flat:1,ratio:0}],[],{cycles:1,attack:0});assert.equal(r.units[1].currentEnergy,212);
r=run(-1,[{...basic,source:'Ult',energyCost:160}],Array(5).fill(16),{cycles:1,attack:0});assert.ok(Math.abs(r.units[0].currentEnergy-52.8)<1e-9);
r=run(-1,[{...basic,source:'Skill'},{...basic,av:2,targets:1},{...basic,av:3,targets:1}],Array(5).fill(15),{cycles:1,attack:0});assert.ok(Math.abs(r.units[0].currentEnergy-205)<1e-9);
r=run(78,[{...basic,source:'Skill'},{...basic,av:2,source:'FUA'},{...basic,av:3,source:'Skill'},{...basic,av:4,source:'FUA'}],[],{cycles:1,attack:0});assert.equal(r.units[0].effects.filter(e=>e.gearKey?.startsWith('Hải Tuyến')).length,2);assert.equal(r.units[0].effects.filter(e=>e.gearKey==='Đại Triều').length,1);
console.log('PASS nonstacking two-turn energy buffs, support Ult cost and Hecate, per-recipient heal refund, Ult set percent refund, bow once-per-turn, Poseidon retains two Hai Tuyen');
// Source-specific damage must not bleed into unrelated sources.
const amount=(result,source='direct')=>result.log.filter(e=>e.kind===source).map(e=>e.amount);
let noGear=run(-1,[{...basic,targets:1}],[],{cycles:1,attack:0,critMode:'normal'});
let single=run(1,[{...basic,targets:1}],[],{cycles:1,attack:0,critMode:'normal'});
assert.ok(Math.abs(amount(single)[0] / ((base.atk+238)*.45)-1.2)<1e-9);
// Exactly three actual targets: each rank uses fractional interpolation, not rounded ranks.
const mid=owner(67);mid.gear.memory.values[3]=.045;
r=runCombat({...cfg,cycles:1,attack:0},[mid,{...base,name:'B'}],[{...basic,source:'Debuff',buffType:'defReduction',buffValue:.1,duration:3},...Array.from({length:6},(_,i)=>({...basic,actor:1,av:i+2,targets:1,energy:0}))]);assert.ok(r.complete);assert.ok(Math.abs(r.units[0].gearState.data.commentEnergy-4.5)<1e-9);
// Enemy-selected counters: five enemy hits still give one first-counter refund per action.
r=run(-1,[{...basic,source:'Counter',trigger:'enemyHit',maxPerTurn:10,realTurn:false,fuaId:'counter'}],Array(5).fill(14),{count:1,cycles:1,enemyHits:5});
const selected=r.log.find(e=>e.type==='enemyHit')?.actor;
if(selected===0){assert.equal(r.executions.length,1);assert.ok(r.units[0].currentEnergy>=206);}
// No-damage enemy action picks the speed penalty, not the one-damaged-ally branch.
r=run(-1,[{...basic,source:'Debuff',buffType:'defReduction',buffValue:.1,duration:5}],Array(5).fill(19),{cycles:1,attack:0});
assert.ok(r.enemies[0].effects.some(e=>e.gearKey==='Hậu Tội'&&e.mods.speed===-8));
// Ordinary shields retain provenance; Hoi Mon can restore only once for a recipient per owner turn.
r=run(59,[{...basic,source:'Shield',recipient:0,ratio:0,flat:1,duration:5}],[],{cycles:3,count:1,attack:5000,seed:1});
assert.ok(r.log.filter(e=>e.message.includes('phục hồi')&&e.message.includes('Khiên')).length<=1);
// End of Great Tide advances exactly once; refreshing Hai Tuyen does not refresh Great Tide.
r=run(78,[{...basic,source:'Skill',av:1},{...basic,source:'FUA',av:2},{...basic,source:'Skill',av:3},{...basic,source:'FUA',av:4},{actor:0,source:'Wait',av:10,realTurn:true},{actor:0,source:'Wait',av:20,realTurn:true}],[],{cycles:1,attack:0});assert.equal(r.units[0].effects.some(e=>e.gearKey==='Đại Triều'),false);assert.equal(r.units[0].currentEnergy,205);
// Mani counts two real turns, does not count inserted attacks as additional real turns.
r=run(97,[{...basic,source:'Buff',ability:'Skill',recipient:1,buffType:'damage',buffValue:.1,duration:3},{...basic,actor:1,av:2,targets:1,realTurn:true},{...basic,actor:1,av:3,targets:1,realTurn:true}],[],{cycles:1,attack:0});assert.ok(Math.abs(r.units[0].currentEnergy-206.48)<1e-9);
// A 2-turn buff applied during an owner's real turn counts that current turn (Bible §57–59).
r=run(39,[{...basic,source:'Skill',realTurn:true},{actor:0,source:'Wait',av:2,realTurn:true}],[],{cycles:1,attack:0});assert.equal(effectiveStats(r.units[0]).energy,0);
console.log('PASS scoped damage, fractional energy cap, counter-chain limit, no-damage enemy classification, shield provenance, Great Tide expiry, Mani real turns and canon duration');
