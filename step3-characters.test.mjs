import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runCombat} from './combat.mjs';

const catalog=JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url)));
const v=(name,extra={})=>{const c=catalog.characters.find(c=>c.name===name);return {name,...c.baseStats['60'].values,aspect:c.aspect,element:c.element,energyCap:c.energy.cap,characterId:c.id,characterHash:c.contentHash,kitEnabled:true,kitAscensions:true,kitMinor:false,kitAutoUlt:false,kitFate:0,...extra};};
const a=(actor,kitAction,av=1,extra={})=>({actor,kitAction,source:kitAction,av,...extra});
const cfg={count:1,level:60,hp:1e8,maxToughness:720,toughness:720,weaknesses:['Quang','Phong','Nham','Hỏa'],speed:100,attack:1000,cycles:1,res:0,effectRes:0,critMode:'normal',dynamic:false,seed:7,hitEnergy:0,initialPlanck:5};
const run=(roster,actions,extra={})=>{const r=runCombat({...cfg,...extra},roster,actions);assert.equal(r.complete,true,r.error);return r;};

// Heimdall forces the guarded Fragarach counter when a single-target action
// selects somebody else; the natural counter and the forced counter never double.
let r=run([v('Heimdall',{threat:100000}),v('Lugh',{threat:1})],[a(0,'Skill',1,{recipient:1})]);
assert.equal(r.executions.filter(e=>e.name==='Fragarach Drawn').length,1);
r=run([v('Heimdall'),v('Lugh')],[a(0,'Skill',1,{recipient:1})]);
assert.equal(r.executions.filter(e=>e.name==='Fragarach Drawn').length,1);

// Nephele remembers that her shield existed when the hit began, applies Phong
// Thực even if the layer breaks, and VM2 creates two separate extra activations.
r=run([v('Nephele',{kitFate:2})],[a(0,'Skill')],{attack:1000,speed:100});
assert.ok(r.enemies[0].dots.some(d=>d.name==='Phong Thực'));
r=run([v('Nephele',{kitFate:2})],[a(0,'Basic'),a(0,'Basic',2),a(0,'Basic',3),a(0,'Basic',4),a(0,'Ult',5)],{attack:0,speed:100});
assert.ok(r.log.filter(e=>e.type==='damage'&&e.message.includes('(DoT)')).length>=3);

// Týr redirects part of a linked ally's HP damage and answers the completed
// action once. VM6 preserves the linked ally at one HP on the first lethal hit.
r=run([v('Týr',{threat:1,kitAscensions:false}),v('Kael',{kitEnabled:false,threat:100000})],[a(0,'Skill',1,{recipient:1})],{attack:1000});
assert.ok(r.units[0].currentHP<r.units[0].hp);assert.ok(r.units[1].currentHP<r.units[1].hp);
assert.equal(r.executions.filter(e=>e.name==='The Price of a Broken Word').length,1);
r=run([v('Týr',{kitFate:6,threat:1}),v('Kael',{kitEnabled:false,hp:100,threat:100000})],[a(0,'Skill',1,{recipient:1})],{attack:5000});
assert.equal(r.units[1].currentHP,1);assert.equal(r.executions.filter(e=>e.name==='The Price of a Broken Word').length,1);

// Nezha resolves her counter before damage. Breaking toughness cancels all Myrk
// hits in that action, while a failed break keeps the action and applies A3.
r=run([v('Nezha')],[a(0,'Skill')],{maxToughness:120,toughness:120,attack:1000});
assert.equal(r.executions.filter(e=>e.name==='Red Lotus Crosses First').length,1);assert.equal(r.log.filter(e=>e.type==='enemyHit').length,0);
r=run([v('Nezha')],[a(0,'Skill')],{maxToughness:720,toughness:720,attack:1000});
assert.equal(r.executions.filter(e=>e.name==='Red Lotus Crosses First').length,1);assert.ok(r.units[0].currentHP<r.units[0].hp);

console.log('PASS Heimdall forced counters, Nephele shield/DoT loop, Týr transfer/last stand and Nezha pre-hit cancellation');
