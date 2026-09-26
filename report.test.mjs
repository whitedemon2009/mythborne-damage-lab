import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runCombat} from './combat.mjs';
import {summarizeReport} from './report.mjs';
import {teamSnapshot,compareTeamSnapshot,exportTeamArchive,importTeamArchive} from './team-comparison.mjs';
import {composeGear} from './gear.mjs';
import {newPiece} from './artifacts.mjs';
import {characterRegistry} from './character-data.mjs';
const catalog=JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url)));
const unit=(name,extra={})=>{const c=catalog.characters.find(x=>x.name===name);return {name,...c.baseStats['60'].values,level:60,aspect:c.aspect,element:c.element,energyCap:c.energy.cap,characterId:c.id,characterHash:c.contentHash,kitEnabled:true,kitAscensions:true,kitMinor:true,kitFate:6,kitRecipient:1,kitAutoUlt:'ready',...extra};};
const config={count:3,hp:1e7,level:60,res:.2,maxToughness:140,toughness:140,weaknesses:['Hỏa','Lôi','Quang','Phong','Băng','Thủy','Nham','Ám'],speed:100,attack:100,cycles:2,critMode:'sampled',seed:4,dynamic:true};
const scripts=roster=>roster.flatMap((_,actor)=>['Skill','Basic'].map(kitAction=>({actor,kitAction,source:kitAction,realTurn:true,recipient:actor===0?1:0,fallbackBasic:true})));
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-8*Math.max(1,Math.abs(b)),`${a} != ${b}`);
let hits=0;
const implemented=catalog.characters.filter(c=>characterRegistry[c.id]);
for(const c of implemented){
 const roster=[c.name,...['Apollo','Agni','Asclepius','Astraeus','Hestia'].filter(n=>n!==c.name)].slice(0,5).map(n=>unit(n)),actions=scripts(roster);
 const plain=runCombat(config,roster,actions),report=runCombat({...config,report:true},roster,actions);assert.ok(report.complete,`${c.name}: ${report.error}`);assert.deepEqual(report.totals,plain.totals,c.name+' instrumentation changed damage');assert.equal(report.planck,plain.planck);
 const summary=summarizeReport(report);near(summary.groups.reduce((n,g)=>n+g.actual,0),summary.total);
 for(const h of report.damageEvents){near(h.formulaValue,h.calculated);near(h.actual,Math.min(h.hpBefore,h.calculated));assert.ok(h.name&&h.category);hits++;}
}
const roster=['Apollo','Agni','Astraeus','Nemesis','Durga'].map(n=>unit(n)),actions=scripts(roster);
const saved=teamSnapshot('Original',{roster,actions,config},{}),oldAtk=saved.roster[0].atk;roster[0].atk*=3;assert.equal(saved.roster[0].atk,oldAtk);
saved.build={team:roster.map(u=>u.name),states:[],stamps:{},bases:{}};saved.seeds=[];const archive=exportTeamArchive([saved]),imported=importTeamArchive(archive);assert.equal(imported.length,1);assert.equal(imported[0].name,'Original');assert.deepEqual(imported[0].config,config);assert.throws(()=>importTeamArchive('{}'),/định dạng/);assert.throws(()=>importTeamArchive('{'),/JSON/);
const a=compareTeamSnapshot(saved,{...config,count:1,cycles:1}),b=compareTeamSnapshot(saved,{...config,count:1,cycles:1});assert.equal(a.result.enemies.length,1);assert.equal(a.windowAV,150);assert.deepEqual(a.result.totals,b.result.totals);near(a.damagePer100AV,a.summary.total/150*100);
const stale=structuredClone(saved);stale.roster[0].characterHash='stale';assert.throws(()=>compareTeamSnapshot(stale,config),/nguồn kit/);
// A blocked manual Ult, a fallback Skill and an expired effect must be distinguishable.
const diagnostics=runCombat({...config,report:true,dynamic:false,cycles:1,speed:1,initialPlanck:0},[unit('Athena',{kitAutoUlt:false})],[{actor:0,kitAction:'Ult',av:1},{actor:0,kitAction:'Skill',av:2,fallbackBasic:true},{actor:0,source:'Buff',buffType:'damage',buffValue:.1,effectName:'Test',duration:1,recipient:0,av:3,realTurn:true}]);
assert.ok(diagnostics.complete);for(const type of ['energy','fallback','expired'])assert.ok(diagnostics.diagnostics.some(d=>d.type===type),type);
// Overkill is recorded separately; it is never added to actual total damage.
const over=runCombat({...config,report:true,dynamic:false,count:1,hp:1,speed:1},[unit('Athena',{kitAutoUlt:false})],[{actor:0,kitAction:'Basic',av:1}]);assert.equal(summarizeReport(over).total,1);assert.ok(summarizeReport(over).overkill>0);
console.log(`PASS ${implemented.length} VM6 kits, ${hits} hit formula reconstructions, instrumentation parity, contribution totals, team snapshots, common scenario, source guard, diagnostics and overkill`);
const probeActions=[{actor:0,source:'Basic',ratio:1,toughness:30,av:1},{actor:0,source:'Skill',ratio:2,toughness:60,cost:1,energy:30,av:2},{actor:0,source:'Ult',ratio:3,toughness:90,energyCost:0,av:3},{actor:0,source:'FUA',ratio:1,toughness:20,av:4},{actor:0,source:'DoT',ratio:1,effectName:'DoT kiểm tra',duration:2,av:5},{actor:0,source:'Diệt Kích',toughness:30,av:6}];
for(const item of [...catalog.memories.map(memory=>({memory})),...catalog.artifacts.map(set=>({set}))]){
 const base=unit('Janus',{kitEnabled:false,aspect:item.memory?.aspect||'Pandora'}),equipped=composeGear(base,{memory:item.memory?.name||'',refine:5,artifacts:Array.from({length:6},(_,slot)=>({...newPiece(slot),set:item.set?.name||''}))},catalog);
 const r=runCombat({...config,report:true,dynamic:false,toughness:0},[equipped],probeActions);assert.ok(r.complete,r.error);for(const h of r.damageEvents)near(h.formulaValue,h.calculated);
}
console.log(`PASS report formulas across all ${catalog.memories.length} memories and ${catalog.artifacts.length} artifact sets`);
