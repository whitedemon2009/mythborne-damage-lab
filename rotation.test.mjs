import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runCombat} from './combat.mjs';
import {rotationTeam,rotationMetrics} from './rotation.mjs';
const catalog=JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url)));
const v=(name,extra={})=>{const c=catalog.characters.find(x=>x.name===name);return {name,...c.baseStats['60'].values,speed:100,element:c.element,aspect:c.aspect,energyCap:c.energy.cap,characterId:c.id,characterHash:c.contentHash,kitEnabled:true,kitAscensions:false,kitMinor:false,kitAutoUlt:false,kitRecipient:0,...extra};};
const cfg={count:2,level:60,hp:1e8,maxToughness:720,toughness:720,weaknesses:[],speed:1,attack:0,cycles:4,res:0,critMode:'normal',dynamic:true,seed:9};
const base=(actor,k='Basic')=>({actor,kitAction:k,source:k,realTurn:true,fallbackBasic:true,recipient:actor===0?1:0});
const plan=(roster,extra={})=>({enabled:true,team:rotationTeam(roster),turns:{},ultimates:{},...extra});
const run=(roster,actions,rotation,extra={})=>{const r=runCombat({...cfg,...extra,rotation},roster,actions);assert.ok(r.complete,r.error);return r;};
const roster=[v('Agni'),v('Apollo'),v('Astraeus')];
let p=plan(roster,{turns:{'0:1':{kitAction:'Skill',recipient:1,target:0},'0:2':{kitAction:'Skill',recipient:2,target:0}}});
let r=run(roster,roster.map((_,i)=>base(i)),p);
assert.equal(r.turnRecords.find(t=>t.actor===0&&t.turn===2).choice.recipient,2);
assert.deepEqual(r.executions.filter(a=>a.actor===0&&a.ability==='Skill').map(a=>a.recipient),[1,2]);
assert.ok(r.turnRecords.filter(t=>t.actor===0).length>=4);
// A choice is attached to an actor's turn number, even after a support changes its AV.
const fast=[v('Hermes',{speed:110}),v('Athena')];
p=plan(fast,{turns:{'1:2':{kitAction:'Skill',recipient:0,target:1}}});
r=run(fast,[base(0,'Skill'),base(1)],p);
const second=r.turnRecords.find(t=>t.actor===1&&t.turn===2);assert.equal(second.choice.kitAction,'Skill');assert.equal(second.choice.target,1);assert.ok(second.av<200);
// The same current setup and seed must give exactly reproducible comparisons.
assert.deepEqual(rotationMetrics(r),rotationMetrics(run(fast,[base(0,'Skill'),base(1)],p)));
// Before/after policies insert Ult at the selected ally's turn, not at a fixed AV.
const support=[v('Hephaestus',{speed:120,energy:2}),v('Athena')];
for(const mode of ['beforeAlly','afterAlly']){
 const policy=plan(support,{ultimates:{0:{mode,who:1,turn:2,target:0,recipient:1}}});
 const result=run(support,[base(0),base(1)],policy);
 const ult=result.executions.find(e=>e.actor===0&&e.ability==='Ult');assert.ok(ult);assert.equal(ult.av,200);
 const main=result.executions.find(e=>e.actor===1&&e.turn===2&&e.realTurn);assert.ok(mode==='beforeAlly'?ult.order<main.order:ult.order>main.order);
}
// Ready, hold and reserve are player choices; no Ult can bypass its cost.
const solo=[v('Janus')];
for(const mode of ['ready','manual','reserve']){const result=run(solo,[base(0)],plan(solo,{ultimates:{0:{mode,reserve:1,target:0,recipient:0}}}));assert.equal(result.executions.some(a=>a.ability==='Ult'),mode==='ready');}
// State condition can wait for a named support buff.
const effectTeam=[v('Athena',{energy:3}),v('Hephaestus',{speed:90})];
const effects=run(effectTeam,[base(0),base(1,'Skill')],plan(effectTeam));
const key=effects.turnRecords.flatMap(t=>t.after.effects[0]).find(n=>n!=='Mốc phụ');assert.ok(key);
const effectResult=run(effectTeam,[base(0),base(1,'Skill')],plan(effectTeam,{ultimates:{0:{mode:'effect',who:0,effect:key,target:0}}}));assert.ok(effectResult.executions.some(a=>a.actor===0&&a.ability==='Ult'));
// Invalid/stale teams fail instead of applying old turn decisions to new characters.
assert.throws(()=>runCombat({...cfg,rotation:p},solo,[base(0)]),/đội hình khác/);
// Preserved extra turns remain free when their chosen Skill is overridden.
const athena=[v('Athena',{kitFate:6,kitAutoUlt:'ready',energy:1})];
const ar=run(athena,[base(0,'Skill')],plan(athena,{turns:{'0:2':{kitAction:'Skill',target:0,recipient:0}}}),{initialPlanck:5,cycles:2});
assert.ok(ar.turnRecords.some(t=>t.extra));assert.ok(ar.planck>=0);
console.log('PASS turn-specific recipients, speed-dependent replanning, before/after Ult, hold/reserve/state conditions, deterministic comparisons, stale-team guard and extra turns');
