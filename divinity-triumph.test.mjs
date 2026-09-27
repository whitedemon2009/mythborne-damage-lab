import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runCombat} from './combat.mjs';
import {effectiveStats} from './effects.mjs';

const catalog=JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url)));
const cfg={count:1,level:60,hp:1e8,maxToughness:10000,toughness:10000,weaknesses:[],speed:1,attack:0,cycles:1,res:.5,effectRes:.8,critMode:'normal',dynamic:false,seed:7,hitEnergy:0,report:true,initialPlanck:5};
const v=(name,extra={})=>{const c=catalog.characters.find(c=>c.name===name);return {name,...c.baseStats['60'].values,aspect:c.aspect,element:c.element,energyCap:c.energy.cap,characterId:c.id,characterHash:c.contentHash,kitEnabled:true,kitAscensions:false,kitMinor:false,kitAutoUlt:false,kitFate:0,...extra};};
const a=(actor,kitAction,av=1,extra={})=>({actor,kitAction,source:kitAction,av,...extra});
const run=(roster,actions,extra={})=>{const result=runCombat({...cfg,...extra},roster,actions);assert.equal(result.complete,true,result.error);return result;};
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-7,`${x} != ${y}`);

// Kael always inherits half of the highest pre-inheritance ATK. The resistance
// reduction exists only in an all-Fire/Lightning roster.
let r=run([v('Kael',{atk:500}),v('Veylen',{atk:1000})],[]);
near(effectiveStats(r.units[0]).atk,1000);
near(effectiveStats(r.enemies[0]).HỏaResReduction,.24);
near(effectiveStats(r.enemies[0]).LôiResReduction,.24);
r=run([v('Kael',{atk:500}),v('Sol',{atk:1000})],[]);
near(effectiveStats(r.units[0]).atk,1000);
near(effectiveStats(r.enemies[0]).HỏaResReduction,0);
r=run([v('Kael',{atk:500,kitDivinityTriumph:false}),v('Veylen',{atk:1000})],[]);
near(effectiveStats(r.units[0]).atk,500);
near(effectiveStats(r.enemies[0]).HỏaResReduction,0);

// Rowan's reduction participates in the actual effect-chance stat.
r=run([v('Rowan')],[]);
near(effectiveStats(r.enemies[0]).resist,.3);
r=run([v('Rowan',{kitDivinityTriumph:false})],[]);
near(effectiveStats(r.enemies[0]).resist,.8);

// Skill installs Vết Cháy before the Khải Hoàn trigger; a later Basic triggers
// the same DoT once more without shortening it.
r=run([v('Nadia')],[a(0,'Skill'),a(0,'Basic',2)],{effectRes:0});
assert.equal(r.damageEvents.filter(e=>e.kind==='DoT').length,2);
assert.equal(r.enemies[0].dots.find(d=>d.name==='Vết Cháy').duration,2);
r=run([v('Nadia',{kitDivinityTriumph:false})],[a(0,'Skill'),a(0,'Basic',2)],{effectRes:0});
assert.equal(r.damageEvents.filter(e=>e.kind==='DoT').length,0);

// A real Tomas heal permanently raises that target's maximum HP once.
r=run([v('Tomas',{kitAscensions:true}),v('Kael',{kitEnabled:false})],[{actor:1,source:'Basic',ratio:0,selfHPCost:.5,av:1},{...a(0,'Skill',2),recipient:1}]);
const life=r.units[1].effects.find(e=>e.characterKey==='Khải Hoàn Sinh Lực');
assert.equal(life.charges,1);near(life.mods.hp,.01);
r=run([v('Tomas',{kitAscensions:true,kitDivinityTriumph:false}),v('Kael',{kitEnabled:false})],[{actor:1,source:'Basic',ratio:0,selfHPCost:.5,av:1},{...a(0,'Skill',2),recipient:1}]);
assert.equal(r.units[1].effects.some(e=>e.characterKey==='Khải Hoàn Sinh Lực'),false);

// A teammate attack calls Veylen's extra damage at most three times and the
// Seraphine FUA grants Phản Hồi. Seraphine is capped at six calls per interval.
const driver=v('Skadi',{kitEnabled:false,energyCap:140});
const attacks=Array.from({length:7},(_,i)=>({actor:2,source:'Basic',ratio:1,av:i+1,targets:1,target:0,toughness:0,energy:0}));
r=run([v('Veylen'),v('Seraphine'),driver],attacks,{res:0});
assert.equal(r.executions.filter(e=>e.name==='Khải Hoàn Veylen').length,3);
assert.equal(r.executions.filter(e=>e.name==='Answering Blade').length,6);
assert.equal(r.units[0].characterState.feedback,4);
r=run([v('Veylen',{kitDivinityTriumph:false}),v('Seraphine',{kitDivinityTriumph:false}),driver],attacks,{res:0});
assert.equal(r.executions.filter(e=>e.name==='Khải Hoàn Veylen').length,0);
assert.equal(r.executions.filter(e=>e.name==='Answering Blade').length,0);
assert.equal(r.units[0].characterState?.feedback||0,0);

// Nhịp Điệu now reaches ten stacks, is not consumed by Answering Blade, and
// grants matching Ice/Lightning resistance reduction plus Seraphine speed.
const skills=Array.from({length:5},(_,i)=>a(0,'Skill',i+1));
r=run([v('Seraphine')],skills,{initialPlanck:5,res:0});
const rhythm=r.enemies[0].effects.find(e=>e.characterKey==='Nhịp Điệu');
assert.equal(rhythm.charges,5);near(effectiveStats(r.enemies[0]).BăngResReduction,.15);near(effectiveStats(r.enemies[0]).LôiResReduction,.15);
near(r.units[0].effects.find(e=>e.characterKey==='Khải Hoàn Nhịp Điệu').mods.speedPct,.25);
r=run([v('Seraphine',{kitDivinityTriumph:false})],skills,{initialPlanck:5,res:0});
assert.equal(r.enemies[0].effects.find(e=>e.characterKey==='Nhịp Điệu').charges,2);
near(effectiveStats(r.enemies[0]).BăngResReduction,0);
assert.equal(r.units[0].effects.some(e=>e.characterKey==='Khải Hoàn Nhịp Điệu'),false);

console.log('PASS six toggleable Khải Hoàn Thần Tính upgrades, disabled baselines, team gates, trigger caps, permanent battle stacks and elemental resistance');
