import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runCombat} from './combat.mjs';
import {composeGear} from './gear.mjs';
import {newPiece} from './artifacts.mjs';
import {characterBattleRules} from './character-runtime.mjs';
import {effectiveStats} from './effects.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('./catalog.json',import.meta.url)));
const names=['Apollo','Agni','Astraeus','Nemesis','Durga'];
const memories=[96,94,86,72,93];
function roster(fate){return names.map((name,i)=>{const c=catalog.characters.find(c=>c.name===name),base={name,...c.baseStats['60'].values,level:60,aspect:c.aspect,element:c.element,crit:.05,critDmg:.5,energyCap:c.energy.cap,characterId:c.id,characterHash:c.contentHash,kitEnabled:true,kitAscensions:true,kitMinor:true,kitFate:fate,kitAutoUlt:i===2?'full':'ready'};return composeGear(base,{memory:catalog.memories[memories[i]].name,refine:5,artifacts:Array.from({length:6},(_,slot)=>({...newPiece(slot),set:catalog.artifacts[16].name}))},catalog);});}
const actions=names.flatMap((n,actor)=>(n==='Agni'?['Skill','Basic','Basic']:n==='Apollo'?['Skill','Skill']:['Skill','Basic']).map(kitAction=>({actor,kitAction,source:kitAction,realTurn:true,fallbackBasic:true,recipient:actor===0?1:0})));
let scenarios=0;
for(const fate of [0,1,2,3,4,5,6])for(const count of [1,2,3,4,5]){
 const r=runCombat({count,level:60,hp:1e7,maxToughness:720,toughness:720,weaknesses:['Quang','Hỏa','Nham','Lôi','Phong'],speed:100,attack:600,cycles:5,res:0,critMode:'sampled',dynamic:true,seed:7,hitEnergy:10},roster(fate),actions);
 assert.equal(r.complete,true,`VM${fate}/${count} Myrk: ${r.error}`);assert.ok(Object.values(r.totals).every(Number.isFinite));assert.ok(r.planck>=0&&r.planck<=5);
 for(const u of r.units){assert.ok(u.currentEnergy>=0&&u.currentEnergy<=u.energyCap);assert.ok(u.shieldLayers.every(l=>l.value>=0));for(const key of ['atk','hp','def','speed','crit','energy'])assert.ok(Number.isFinite(effectiveStats(u)[key]),key);}
 assert.ok(r.executions.some(e=>e.name==='The Sky Cannot Hold This Noon'));assert.ok(r.executions.some(e=>e.variant===2));scenarios++;
}
console.log(`PASS ${scenarios} five-Veyr team scenarios with memories/artifacts, VM0–6, 1–5 Myrk, automatic Ult, resources and finite combat results`);
// Exercise the actual support pairings, including DoT/DK cross-triggers and multi-target counters.
const teams=[['Hades','Prometheus','Anubis','Hephaestus','Hestia'],['Surtr','Nike','Hephaestus','Janus','Hestia'],['Poseidon','Amphitrite','Hermes','Hephaestus','Hera'],['Athena','Sekhmet','Máni','Nemty','Asclepius'],['Lugh','Nemty','Bellona','Eos','Asclepius'],['Hou Yi','Máni','Sekhmet','Hermes','Asclepius']];
let mixed=0;
for(const team of teams)for(const fate of [0,2,6])for(const count of [1,3,5]){
 const units=team.map((name,i)=>{const c=catalog.characters.find(c=>c.name===name),memory=catalog.memories.find(m=>m.aspect===c.aspect&&m.rarity===5);return composeGear({name,...c.baseStats['60'].values,level:60,aspect:c.aspect,element:c.element,crit:.5,critDmg:1,energyCap:c.energy.cap,characterId:c.id,characterHash:c.contentHash,kitEnabled:true,kitAscensions:true,kitMinor:true,kitFate:fate,kitAutoUlt:'ready',kitRecipient:i===0?1:0},{memory:memory?.name||'',refine:5,artifacts:Array.from({length:6},(_,slot)=>({...newPiece(slot),set:catalog.artifacts[0].name}))},catalog);});
 const sequence=team.flatMap((name,actor)=>(name==='Surtr'?['Skill','Skill','Skill','Basic']:['Skill','Basic']).map(kitAction=>({actor,kitAction,source:kitAction,realTurn:true,fallbackBasic:true,recipient:actor===0?1:0})));
 const result=runCombat({count,level:60,hp:1e8,maxToughness:140,toughness:140,weaknesses:['Hỏa','Quang','Nham','Phong','Thủy','Băng','Lôi','Ám'],speed:120,enemyTargets:5,enemyHits:3,attack:200,cycles:5,res:.1,critMode:'sampled',dynamic:true,seed:19,hitEnergy:10},units,sequence);
 assert.ok(result.complete,`${team[0]} VM${fate}/${count}: ${result.error}`);assert.ok(result.executions.some(e=>e.actor===0));assert.ok(Object.values(result.totals).every(Number.isFinite));assert.ok(result.planck>=0&&result.planck<=characterBattleRules(units,{}).cap,`${team[0]} Planck ${result.planck}`);for(const u of result.units)assert.ok(u.currentEnergy>=0&&u.currentEnergy<=u.energyCap);mixed++;
}
console.log(`PASS ${mixed} DoT, Break, single-target and counter team scenarios with matching memories and multi-target Myrk`);
