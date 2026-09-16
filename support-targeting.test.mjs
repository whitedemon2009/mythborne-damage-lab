import assert from 'node:assert/strict';
import fs from 'node:fs';
import {supportRecipient} from './support-targeting.mjs';
import {criticalTriggerUsers} from './character-runtime.mjs';
import {runCombat} from './combat.mjs';
import {rotationTeam} from './rotation.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('./catalog.json',import.meta.url)));
const roster=names=>names.map((name,index)=>{const c=catalog.characters.find(c=>c.name===name);return {name,index,...c.baseStats['60'].values,level:60,aspect:c.aspect,element:c.element,crit:.05,critDmg:.5,energyCap:c.energy.cap,characterId:c.id,characterHash:c.contentHash,kitEnabled:true,kitAscensions:true,kitMinor:true,kitFate:6,kitAutoUlt:'ready',kitRecipient:-1};});
const cfg={count:3,hp:1e7,infiniteHP:true,level:60,res:.2,maxToughness:720,toughness:720,weaknesses:['Thủy','Phong','Hỏa'],speed:100,attack:200,cycles:4,critMode:'sampled',dynamic:true,seed:1,hitEnergy:10,report:true};
const actions=units=>units.flatMap((_,actor)=>['Skill','Basic'].map(kitAction=>({actor,kitAction,realTurn:true,recipient:-1,fallbackBasic:true})));
let units=[{index:0,aspect:'Keraunos',currentHP:100,kitRecipient:-1},{index:1,aspect:'Caduceus',currentHP:100},{index:2,aspect:'Pandora',currentHP:100},{index:3,aspect:'Mjolnir',currentHP:100}];
assert.equal(supportRecipient(units[0],units,-1,[0,999,30,20]),2); // Pandora is eligible, larger support total cannot displace candidate pool
assert.equal(supportRecipient(units[0],units,1,[0,999,30,20]),1); // manual turn choice
assert.equal(supportRecipient({...units[0],kitRecipient:3},units,-1,[0,999,30,20]),3); // card preference
units[2].currentHP=0;assert.equal(supportRecipient(units[0],units,-1,[0,999,30,20]),3); // dead carry is skipped
units[3].currentHP=0;assert.equal(supportRecipient(units[0],units,-1,[0,999,30,20]),1); // no candidate Aspect
const team=roster(['Hermes','Amphitrite','Poseidon','Hephaestus','Hera']);
assert.deepEqual(criticalTriggerUsers(team),['Hermes']);assert.ok(!criticalTriggerUsers(team.map(u=>({...u,kitFate:0}))).length);
const expected=runCombat({...cfg,critMode:'expected'},team,actions(team));assert.equal(expected.complete,false);assert.match(expected.error,/Hermes.*Chí Mạng/);
const result=runCombat(cfg,team,actions(team));assert.equal(result.complete,true,result.error);
const targeted=result.executions.filter(e=>e.supportTarget);assert.ok(targeted.length);assert.ok(targeted.every(e=>e.recipient===2));
assert.ok(result.executions.some(e=>e.actor===0&&e.ability==='Basic'&&e.name==='Passing Gale'));assert.ok(result.totals.Hermes>0);
const repeat=runCombat(cfg,team,actions(team));assert.deepEqual(result.totals,repeat.totals);assert.deepEqual(result.supportScores,repeat.supportScores);
const multiple=roster(['Nemty','Apollo','Astraeus','Agni','Durga']);const many=runCombat(cfg,multiple,actions(multiple));assert.equal(many.complete,true,many.error);
const winner=[1,2,3].sort((a,b)=>many.supportScores[b]-many.supportScores[a]||a-b)[0];assert.ok(many.executions.filter(e=>e.actor===0&&e.ability==='Skill').every(e=>e.recipient===winner));
const plan={enabled:true,team:rotationTeam(team),turns:{'0:1':{kitAction:'Skill',target:0,recipient:1,fallbackBasic:true},'0:2':{kitAction:'Basic',target:0,recipient:-1}},ultimates:{}};
const override=runCombat({...cfg,rotation:plan},team,actions(team));assert.equal(override.complete,true,override.error);assert.equal(override.executions.find(e=>e.actor===0&&e.ability==='Skill').recipient,1);
console.log('PASS automatic carry selection, Pandora, multiple/no carries, dead target, manual overrides, VM6 Poseidon team, Hermes BA and deterministic damage preview');
