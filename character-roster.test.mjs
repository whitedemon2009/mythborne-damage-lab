import fs from 'node:fs';
import assert from 'node:assert/strict';
import {runCombat} from './combat.mjs';
import {characterRegistry} from './character-data.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('./catalog.json',import.meta.url)));
const make=(name,fate=0)=>{const c=catalog.characters.find(c=>c.name===name);return {name,...c.baseStats['60'].values,hp:20000,level:60,crit:.5,critDmg:1,energy:.2,aspect:c.aspect,element:c.element,energyCap:c.energy.cap,characterId:c.id,characterHash:c.contentHash,kitEnabled:true,kitAscensions:true,kitMinor:true,kitFate:fate,kitRecipient:1,kitAutoUlt:name==='Astraeus'?'full':'ready'};};
const cfg={count:5,level:60,hp:1e8,maxToughness:720,toughness:720,weaknesses:['Hỏa','Lôi','Nham','Phong','Băng','Thủy','Quang'],speed:130,attack:1000,cycles:5,res:0,effectRes:0,hitEnergy:10,dynamic:true,critMode:'sampled',seed:11};
let count=0;
for(const entry of Object.values(characterRegistry))for(const fate of [0,2,6]){
 const names=[entry.name,...['Apollo','Agni','Astraeus','Durga','Selene'].filter(n=>n!==entry.name)].slice(0,5),roster=names.map(n=>make(n,n===entry.name?fate:0));
 const actions=names.flatMap((name,actor)=>['Skill','Basic'].map(kitAction=>({actor,kitAction,source:kitAction,recipient:actor===1?0:1,realTurn:true,fallbackBasic:true})));
 const r=runCombat(cfg,roster,actions);assert.ok(r.complete,`${entry.name} VM${fate}: ${r.error}`);assert.ok(r.executions.some(e=>e.actor===0),`${entry.name} inactive`);assert.ok(r.units.every(u=>Number.isFinite(u.currentEnergy)&&u.currentEnergy>=0&&u.currentEnergy<=u.energyCap),entry.name);assert.ok(Object.values(r.totals).every(Number.isFinite));count++;
}
console.log(`PASS ${count} registered character/VM scenarios with live kit hashes and mixed team interactions`);
