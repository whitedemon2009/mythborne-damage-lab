import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runCombat} from './combat.mjs';
import {actionPatterns,patternedAction} from './action-patterns.mjs';
import {rotationTeam} from './rotation.mjs';
const c=JSON.parse(fs.readFileSync(new URL('./catalog.json',import.meta.url))).characters.find(c=>c.name==='Kael');
const unit={name:c.name,...c.baseStats['60'].values,level:60,aspect:c.aspect,element:c.element,energyCap:c.energy.cap,characterId:c.id,characterHash:c.contentHash,kitEnabled:true,kitFate:0,kitAutoUlt:false};
const config={count:1,hp:1e7,infiniteHP:true,level:60,res:0,maxToughness:720,toughness:720,weaknesses:[],speed:100,attack:0,cycles:6,critMode:'normal',dynamic:true,seed:1,hitEnergy:0,initialPlanck:100,planckCap:100,report:true};
const actions=[{actor:0,kitAction:'Basic',source:'Basic',realTurn:true,recipient:0}];
for(const p of actionPatterns.filter(p=>p.sequence)){
 const r=runCombat(config,[{...unit,kitPattern:p.id}],actions);assert.equal(r.complete,true,r.error);
 const own=r.executions.filter(e=>e.realTurn);assert.ok(own.length>=6);assert.deepEqual(own.slice(0,6).map(e=>e.ability),Array.from({length:6},(_,i)=>p.sequence[i%p.sequence.length]));
}
const starved=runCombat({...config,initialPlanck:0,planckCap:5},[{...unit,kitPattern:'skill'}],actions);assert.equal(starved.complete,true);assert.deepEqual(starved.executions.filter(e=>e.realTurn).slice(0,3).map(e=>e.ability),['Basic','Skill','Basic']);
const roster=[{...unit,kitPattern:'skill'}],rotation={enabled:true,team:rotationTeam(roster),turns:{'0:2':{kitAction:'Basic',target:0,recipient:0}},ultimates:{}};
const override=runCombat({...config,rotation},roster,actions);assert.equal(override.complete,true);assert.deepEqual(override.executions.slice(0,3).map(e=>e.ability),['Skill','Basic','Skill']);
const manual=runCombat({...config,dynamic:false},roster,[{...actions[0],av:1}]);assert.equal(manual.executions[0].ability,'Basic');
assert.equal(patternedAction({...unit,index:0,turn:3,kitPattern:'skill-basic-basic'},{preserveDurations:true},true).kitAction,'Basic');
assert.equal(patternedAction({...unit,index:0,turn:4,kitPattern:'skill-basic-basic'},{preserveDurations:true},true).kitAction,'Skill');
console.log('PASS all action patterns, repetition, Planck fallback, per-turn override, manual timeline and extra-turn indexing');
