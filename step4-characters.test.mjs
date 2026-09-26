import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runCombat} from './combat.mjs';

const catalog=JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url)));
const v=(name,extra={})=>{const c=catalog.characters.find(c=>c.name===name);return {name,...c.baseStats['60'].values,aspect:c.aspect,element:c.element,energyCap:c.energy.cap,characterId:c.id,characterHash:c.contentHash,kitEnabled:true,kitAscensions:true,kitMinor:false,kitAutoUlt:false,kitFate:0,...extra};};
const a=(actor,kitAction,av=1,extra={})=>({actor,kitAction,source:kitAction,av,realTurn:true,...extra});
const cfg={count:3,level:60,hp:1e8,maxToughness:720,toughness:720,weaknesses:['Quang','Lôi','Băng','Thủy','Nham','Vật Lý'],speed:100,attack:1000,cycles:2,res:0,effectRes:0,critMode:'normal',dynamic:false,seed:9,hitEnergy:0,initialPlanck:5};
const run=(roster,actions,extra={})=>{const out=runCombat({...cfg,...extra},roster,actions);assert.equal(out.complete,true,out.error);return out;};

// Chang’e turns an ally's qualifying single-target action into separate mirror actions.
let r=run([v('Chang’e'),v('Hou Yi')],[a(0,'Skill',1,{target:0}),a(1,'Basic',2,{target:0})]);
assert.equal(r.executions.filter(x=>x.name==='Moon in the Second Mirror').length,1);

// Ishtar creates a route between marked enemies when the primary target changes.
r=run([v('Ishtar')],[a(0,'Skill',1,{target:0}),a(0,'Basic',2,{target:1}),a(0,'Skill',3,{target:2})]);
assert.ok(r.executions.some(x=>x.name==='A Queen Crosses Every Gate'));

// Skadi reaches the enhanced Skill after her Ultimate loads enough shells.
r=run([v('Skadi',{kitFate:2})],[a(0,'Basic',1),a(0,'Basic',2),a(0,'Basic',3),a(0,'Basic',4),a(0,'Ult',5),a(0,'Skill',6)]);
assert.ok(r.executions.some(x=>x.name==='White Silence at Point-Blank'&&x.enhanced));

// The Ice/Lightning core creates Taranis's loop and Dian Mu's Superconduct gate.
r=run([v('Skadi'),v('Veylen'),v('Seraphine'),v('Taranis'),v('Dian Mu')],[a(3,'Skill',1,{recipient:0}),a(4,'Skill',2),a(1,'Basic',3)]);
assert.ok(r.units[0].effects.some(x=>x.characterKey==='Người Giữ Nét'));
assert.equal(r.units[4].characterState.superconduct,true);

// Marek adds toughness damage on the weak joint; Marduk swaps to his enhanced Basic.
r=run([v('Marek'),v('Kaien')],[a(0,'Skill',1,{target:0}),a(1,'Basic',2,{target:0})]);
assert.ok(r.enemies[0].toughness<720-60-30);
r=run([v('Marduk')],[a(0,'Skill',1),a(0,'Basic',2)]);
assert.ok(r.executions.some(x=>x.name==='The Guard Opens Once'&&x.enhanced));

// Freyja pays HP to restore her linked ally after enemy damage.
r=run([v('Freyja',{threat:1}),v('Kael',{kitEnabled:false,threat:100000})],[a(0,'Skill',1,{recipient:1})],{count:1,cycles:1,attack:500});
assert.ok(r.units[0].currentHP<r.units[0].hp);
assert.ok(r.units[1].currentHP>0);

// A newly applied allied damage-over-time effect gives Nyx a separate Bleed stack.
r=run([v('Nyx'),v('Nadia')],[a(1,'Skill',1,{target:0})],{cycles:1,speed:1});
assert.ok(r.enemies[0].dots.some(d=>d.name==='Chảy Máu'&&d.owner===0));

console.log('PASS Chang’e mirrors, Ishtar routes, Skadi shells, Ice/Lightning core, Marek pressure, Marduk stance, Freyja link and Nyx Bleed');
