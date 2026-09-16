import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runCombat} from './combat.mjs';
import {characterRegistry} from './character-data.mjs';
const catalog=JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url)));
const cfg={count:5,level:60,hp:1e7,maxToughness:10000,toughness:10000,weaknesses:[],speed:1,attack:0,cycles:1,res:0,critMode:'normal',dynamic:false,seed:7,hitEnergy:0};
const v=(name,extra={})=>{const c=catalog.characters.find(c=>c.name===name);return {name,...c.baseStats['60'].values,aspect:c.aspect,element:c.element,energyCap:c.energy.cap,characterId:c.id,characterHash:c.contentHash,kitEnabled:true,kitAscensions:false,kitMinor:false,kitAutoUlt:false,kitFate:0,...extra};};
const a=(actor,kitAction,av=1,extra={})=>({actor,kitAction,source:kitAction,av,...extra});
const run=(roster,actions,conf={})=>{const r=runCombat({...cfg,...conf},roster,actions);assert.equal(r.complete,true,r.error);return r;};
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-7,`${x} != ${y}`);
let r=run([v('Apollo')],[a(0,'Skill'),a(0,'Skill',2),a(0,'Skill',3),a(0,'Skill',4),a(0,'Ult',5)],{initialPlanck:5,weaknesses:['Quang']});
assert.deepEqual(r.executions.map(e=>e.name),['Turn the Mirrors East','Call Down the Meridian','Turn the Mirrors East','Call Down the Meridian','The Sky Cannot Hold This Noon']);
near(r.enemies[0].toughness,10000-30-60-30-60-120);near(r.units[0].currentEnergy,0);
assert.equal(r.units[0].characterState.zenith,false);
r=run([v('Apollo',{kitAscensions:true})],[]);near(r.units[0].effects.find(e=>e.characterKey==='A1 Chí Mạng').mods.crit,.1);
// Each distinct Mjolnir ally charges once between Apollo turns; a three-wave Ult remains one action.
r=run([v('Apollo'),v('Astraeus')],[a(1,'Ult'),a(1,'Basic',2),a(1,'Basic',3)]);near(r.units[0].currentEnergy,220);
r=run([v('Agni',{kitAscensions:true}),v('Apollo')],[a(0,'Skill',1,{recipient:1}),a(1,'Skill',2)]);assert.equal(r.executions.filter(e=>e.source==='FUA').length,1);assert.equal(r.units[0].characterState.seeds,1);assert.equal(r.planck,2);
// Invalid ally selection consumes nothing.
r=run([v('Agni')],[a(0,'Skill',1,{recipient:0})]);assert.equal(r.executions.length,0);assert.equal(r.planck,3);near(r.units[0].currentEnergy,70);
// VM6 immediate enhanced follow-up consumes neither flame nor seeds.
r=run([v('Agni',{kitFate:6})],[a(0,'Basic'),a(0,'Basic',2),a(0,'Basic',3),a(0,'Basic',4),a(0,'Ult',5)]);assert.equal(r.units[0].characterState.flame,2);assert.equal(r.executions.at(-1).name,'Sunwheel Incarnate');
// Durga's own shielded AoE counts; FUA cannot feed itself and restores only surviving shields.
r=run([v('Durga',{kitAscensions:true})],[a(0,'Skill'),a(0,'Skill',2)]);assert.equal(r.executions.filter(e=>e.source==='FUA').length,1);assert.equal(r.units[0].characterState.tiger,0);assert.ok(r.units[0].shieldLayers.every(l=>l.value<=l.initial));
// Astraeus Ult II keeps six individual bounce hits at 10 toughness each.
r=run([v('Astraeus')],[a(0,'Skill'),a(0,'Skill',2),a(0,'Skill',3),a(0,'Ult',4)],{weaknesses:['Lôi']});assert.equal(r.executions.at(-1).variant,2);near(r.enemies.reduce((s,e)=>s+10000-e.toughness,0),5*(3*60+90)+60);
// Nemesis transitions accusations to verdict, unlocks enhanced skill and terminates echo chains.
r=run([v('Nemesis')],[a(0,'Basic'),a(0,'Skill',2),a(0,'Skill',3),a(0,'Skill',4)]);assert.ok(r.executions.some(e=>e.enhanced));assert.ok(r.executions.some(e=>e.source==='Extra'));assert.ok(r.executions.length<15);
// Distinct target conditions run once for all phases, including bounce targets.
r=run([v('Apollo'),v('Agni'),v('Astraeus'),v('Nemesis'),v('Durga')],[a(1,'Skill',1,{recipient:2}),a(2,'Skill',2),a(2,'Skill',3),a(2,'Basic',4),a(2,'Ult',5)]);assert.equal(r.units[1].characterState.seeds,0);assert.equal(r.executions.filter(e=>e.actor===1&&e.source==='FUA').length,2);
const stale=runCombat(cfg,[v('Apollo',{characterHash:'changed'})],[]);assert.equal(stale.complete,false);assert.match(stale.error,/nguồn kit đã đổi/);
for(const name of ['Apollo','Agni','Astraeus','Nemesis','Durga'])assert.ok(characterRegistry[v(name).characterId]);
console.log('PASS five character kits, resources, variants, multi-phase toughness, follow-ups, shields and source guard');
// Owner-clock link expires on Agni's third actual turn, never on the partner's turns.
r=run([v('Agni'),v('Apollo')],[a(0,'Skill',1,{recipient:1,realTurn:true}),a(1,'Basic',2,{realTurn:true}),a(1,'Basic',3,{realTurn:true}),a(0,'Basic',4,{realTurn:true})]);
assert.equal(r.units[1].effects.find(e=>e.characterKey==='Đồng Hỏa').duration,1);
r=run([v('Agni'),v('Apollo')],[a(0,'Skill',1,{recipient:1,realTurn:true}),a(0,'Basic',2,{realTurn:true}),a(0,'Basic',3,{realTurn:true})]);assert.ok(!r.units[1].effects.some(e=>e.characterKey==='Đồng Hỏa'));
// Partner reassignment removes the old recipient without losing accumulated resource.
r=run([v('Agni'),v('Apollo'),v('Astraeus')],[a(0,'Skill',1,{recipient:1}),a(1,'Basic',2),a(0,'Skill',3,{recipient:2})]);assert.equal(r.units[0].characterState.seeds,1);assert.ok(!r.units[1].effects.some(e=>e.characterKey==='Đồng Hỏa'));assert.ok(r.units[2].effects.some(e=>e.characterKey==='Đồng Hỏa'));
// The first Quang wave breaks, only subsequent waves are recorded; per-target cap applies.
r=run([v('Apollo')],[a(0,'Skill'),a(0,'Skill',2),a(0,'Skill',3),a(0,'Skill',4),a(0,'Ult',5)],{count:1,initialPlanck:5,weaknesses:['Quang'],maxToughness:220,toughness:220});assert.ok(r.enemies[0].quang.recorded>0);assert.ok(r.enemies[0].quang.recorded<=2*r.units[0].atk);
// Explicitly enabled fallback uses canonical BA, ignoring manual ratio/bonus fields.
r=run([v('Apollo')],[a(0,'Skill',1,{fallbackBasic:true,ratio:999,bonus:99})],{initialPlanck:0});assert.equal(r.executions[0].name,'Gilded Meridian');assert.equal(r.planck,1);
// Dynasty-wide aura thresholds include the clarified 4 and 2 enemy counts.
for(const [count,bonus] of [[1,.75],[2,.75],[3,.35],[4,.35],[5,.25]]){r=run([v('Durga',{kitFate:1}),v('Apollo')],[],{count});near(r.units[1].effects.find(e=>e.characterKey==='VM1').mods.damage,bonus);}
console.log('PASS owner-turn durations, link switching, Quang recording, canonical fallback and Durga VM1 thresholds');
// Fractional gear speed is rounded only after Apollo's percentage aura is added.
r=run([v('Apollo'),v('Agni',{speed:105,speedRaw:105.4,speedBaseTotal:101}),v('Nemesis')],[]);
const speedEffects=r.units[1].effects.filter(e=>e.mods?.speedPct);near(speedEffects.reduce((s,e)=>s+e.mods.speedPct,0),.25);
const {effectiveStats}=await import('./effects.mjs');assert.equal(effectiveStats(r.units[1]).speed,131);
console.log('PASS final-only speed rounding with fractional gear and character aura');
// Theo's extra reduction uses maximum toughness, not the current remainder.
r=run([v('Theo')],[a(0,'Skill'),a(0,'Basic',2),a(0,'Basic',3),a(0,'Ult',4)],{count:1,weaknesses:['Nham'],maxToughness:1000,toughness:800});
near(r.enemies[0].toughness,800-60-30-30-90-150);
// Lucan keeps the Skill shield independently when Ult creates its own layer.
r=run([v('Lucan',{kitFate:6})],[a(0,'Skill',1,{recipient:0}),a(0,'Basic',2),a(0,'Basic',3),a(0,'Ult',4)]);
const lucanSkill=r.units[0].shieldLayers.find(l=>l.key.endsWith(':Skill'));
const lucanUlt=r.units[0].shieldLayers.find(l=>l.key.endsWith(':Ult'));
assert.ok(lucanSkill&&lucanUlt);near(lucanSkill.value,(.2*r.units[0].def+500)*1.12*1.2);
assert.equal(r.units[0].effects.find(e=>e.characterKey==='VM6').duration,2);
// Veylen VM2 triggers only on the enhanced Skill, never the ordinary Skill or Ult.
r=run([v('Veylen',{kitFate:2})],[a(0,'Skill'),a(0,'Skill',2),a(0,'Skill',3)],{initialPlanck:5});
assert.equal(r.executions.filter(e=>e.name==='Veylen VM2').length,1);
console.log('PASS independent Lucan shield layers, VM6 duration and Veylen enhanced-only extra damage');
// Asclepius spends reserve after the complete enemy action and grants the next-damage buff.
r=run([v('Asclepius',{hp:1000,def:0,kitAscensions:true})],[a(0,'Skill',1,{recipient:0})],{count:1,speed:100,attack:1000,enemyHits:3,cycles:1});
const reserve=r.units[0].effects.find(e=>e.characterKey==='Dược Dẫn');
assert.ok(reserve);near(r.units[0].currentHP,800);near(reserve.reserve,40);
assert.ok(r.units[0].effects.some(e=>e.characterKey==='Mạch Sáng'));
assert.equal(r.log.filter(e=>e.type==='heal'&&e.av===100).length,1);
// Alecto classifies a completed attack without damage as Khuyet An, not Don An.
r=run([v('Alecto')],[a(0,'Skill')],{count:1,speed:100,attack:0});
assert.ok(r.enemies[0].effects.some(e=>e.characterKey==='Khuyết Án'));
assert.ok(!r.enemies[0].effects.some(e=>e.characterKey==='Đơn Án'));
r=run([v('Alecto')],[a(0,'Skill')],{count:1,speed:100,attack:100});
assert.ok(r.enemies[0].effects.some(e=>e.characterKey==='Đơn Án'));
console.log('PASS reserve spent once after multi-hit action and Alecto action classification');
// Rhydan VM1 samples the largest shield before incoming damage reduces it.
r=run([v('Rhydan',{kitFate:1})],[{actor:0,source:'Shield',flat:1000,recipient:0,av:1}],{count:1,speed:100,attack:1000});
near(r.totals.Rhydan,67.5);
// Seren restores only her shield and caps the recipient-based ATK bonus with her DEF.
r=run([v('Seren',{hp:1000,def:500,threat:0}),v('Lucan',{kitEnabled:false,atk:10000,threat:1})],[{actor:0,source:'Shield',flat:20000,recipient:1,av:1},{actor:1,source:'Shield',flat:20000,recipient:1,av:2}],{count:5,speed:100,attack:1000});
const shieldOwner=r.units[1].shieldLayers.find(l=>l.owner===0),shieldOther=r.units[1].shieldLayers.find(l=>l.owner===1);
near(shieldOwner.value-shieldOther.value,50);
const shared=r.units[1].effects.find(e=>e.characterKey==='Shared Burden');near(shared.mods.atkFlat,100);assert.equal(shared.duration,2);
console.log('PASS Rhydan pre-hit largest shield and Seren owner-only restoration/ATK cap');
// Hecate VM1 uses 30% HP and HP-derived critical damage even in non-critical mode.
r=run([v('Hecate',{hp:10000,kitFate:1}),v('Sol')],[a(0,'Skill',1,{recipient:1}),a(1,'Basic',2)],{count:1});
near(r.totals.Hecate,14850);assert.equal(r.executions.filter(e=>e.source==='FUA').length,1);
// VM2 refreshes one +40% HP effect; VM6 repeats remain bounded between Ults.
let sawTwoRepeats=false;
for(let seed=1;seed<=30;seed++){
 r=run([v('Hecate',{hp:10000,kitFate:6}),v('Sol')],[a(0,'Skill',1,{recipient:1}),a(1,'Basic',2)],{count:1,seed});
 const fuas=r.executions.filter(e=>e.actor===0&&e.source==='FUA');assert.ok(fuas.length>=1&&fuas.length<=3);if(fuas.length===3)sawTwoRepeats=true;
 const buffs=r.units[0].effects.filter(e=>e.characterKey==='Hecate VM2');assert.equal(buffs.length,1);near(buffs[0].mods.hp,.4);assert.equal(buffs[0].duration,2);
}assert.ok(sawTwoRepeats);
// Eris's kit delay does not install Break control; wind Break still does.
r=run([v('Eris')],[a(0,'Skill'),a(0,'Skill',2)],{count:1});assert.ok(!r.enemies[0].effects.some(e=>e.type==='control'));assert.ok(r.log.some(e=>e.message.includes('Hất Tung trong kit')));
r=run([v('Eris')],[a(0,'Skill')],{count:1,weaknesses:['Phong'],maxToughness:60,toughness:60});assert.ok(r.enemies[0].effects.some(e=>e.name==='Hất Tung'&&e.type==='control'&&e.skipRecovery===false));
// Eos waits for toughness recovery after Quang has resolved.
r=run([v('Eos')],[a(0,'Skill')],{count:1,weaknesses:['Quang'],maxToughness:60,toughness:60,speed:100});
assert.ok(r.executions.some(e=>e.name==='Daybreak Returns'));const recoveryIndex=r.log.findIndex(e=>e.type==='recover');assert.ok(recoveryIndex>=0&&r.log.findIndex(e=>e.message.includes('sử dụng Daybreak Returns'))>recoveryIndex);
// Mani refunds only after two actual focused turns, not two inserted actions.
const maniTeam=[v('Máni'),v('Sol')];
r=run(maniTeam,[a(0,'Skill',1,{recipient:1}),a(1,'Basic',2,{realTurn:true}),a(1,'Basic',3,{realTurn:true})],{count:1});near(r.units[0].currentEnergy,108);
r=run(maniTeam,[a(0,'Skill',1,{recipient:1}),a(1,'Basic',2),a(1,'Basic',3)],{count:1});near(r.units[0].currentEnergy,100);
console.log('PASS Hecate fixed crit/nonstacking/limited repeats, Eris separate controls, Eos recovery ordering and Mani real-turn refund');
// A multi-target, multi-hit Myrk action triggers Bellona once even when it deals zero damage.
r=run([v('Bellona'),v('Nemty')],[a(0,'Skill'),a(1,'Skill',2,{recipient:0})],{count:1,speed:100,enemyTargets:2,enemyHits:3,attack:0});
assert.equal(r.executions.filter(e=>e.name==='Red Standard Falls').length,1);
assert.equal(r.log.filter(e=>e.type==='enemyHit').length,6);
assert.ok(!r.units[0].effects.some(e=>e.characterKey==='Thuận Lộ'));
const counterDamage=r.log.filter(e=>e.type==='damage'&&e.actor===0&&e.av===100).reduce((n,e)=>n+e.amount,0);
near(counterDamage,603*1.3*1.75*(80/(80+80*.88))*.9);
// Nemty VM4 refunds after cost; VM6 regrants only once for each recipient's sky buff.
r=run([v('Nemty',{kitFate:6}),v('Bellona')],[a(0,'Skill',1,{recipient:1}),a(0,'Basic',2),a(0,'Basic',3),a(0,'Ult',4),a(1,'Skill',5),a(1,'Skill',6)],{count:1,initialPlanck:5});
assert.ok(!r.units[1].effects.some(e=>e.characterKey==='Thuận Lộ'));
assert.equal(r.log.filter(e=>e.message.includes('Nemty · Kit hồi 1 Planck')).length,1);
console.log('PASS multi-target Myrk, one counter per multi-hit action, pre-counter Nemty buff and limited refund/regrant');
// Hades records mitigated original DoT, then applies her own damage pipeline to the snapshot.
r=run([v('Hades'),v('Sol',{kitEnabled:false})],[{actor:1,source:'DoT',ratio:0,flat:100,effectName:'Test DoT',duration:2,av:1},a(0,'Basic',2)],{count:1});
near(r.enemies[0].dots.find(d=>d.name==='Chết Chóc').action.flat,36);near(r.totals.Hades,706*.85*.45+36*.45);
// Hestia's auxiliary DK requires a target to remain unbroken after the triggering action.
r=run([v('Hestia'),v('Sol')],[a(0,'Skill'),a(1,'Basic',2)],{count:1});assert.equal(r.executions.filter(e=>e.name==='Dạ Yến Hồng Lô').length,1);
r=run([v('Hestia'),v('Sol')],[a(0,'Skill'),a(1,'Basic',2)],{count:1,weaknesses:['Phong'],maxToughness:30,toughness:30});assert.equal(r.executions.filter(e=>e.name==='Dạ Yến Hồng Lô').length,0);
// Thor VM6 can deal DK to unbroken targets; its Skill uses current pressure including VM2.
r=run([v('Thor',{kitFate:6})],[a(0,'Skill')],{count:1});assert.equal(r.executions.filter(e=>e.name==='Thor VM6').length,1);assert.ok(r.log.some(e=>e.kind==='Diệt Kích'&&e.amount>0));
// The revised royal Lugh counter has 300% / 170% ratios and retains its counter identity.
r=run([v('Lugh')],[a(0,'Skill'),a(0,'Basic',2),a(0,'Basic',3),a(0,'Ult',4)],{count:3,speed:100,attack:0});
assert.equal(r.executions.filter(e=>e.name==='Fragarach Drawn'&&e.source==='Counter').length,3);
const firstMain=r.log.find(e=>e.type==='damage'&&e.av===100&&e.target===0);near(firstMain.amount,676*3*1.25*(80/(80+80*.85))*.9);
// Sekhmet observes attack categories; her extra hit is not a FUA and cannot feed its own mark.
r=run([v('Sekhmet'),v('Veylen')],[a(0,'Skill'),a(1,'Basic',2),a(1,'Skill',3),a(1,'Basic',4),a(1,'Ult',5)],{count:1,initialPlanck:5});
assert.equal(r.executions.filter(e=>e.name==="Stone Lion's Verdict").length,1);assert.ok(r.enemies[0].effects.some(e=>e.characterKey==='Kết Tội'));
console.log('PASS Hades snapshot pipeline, Hestia break exclusion, unbroken Thor DK, corrected Lugh ratios and Sekhmet source tracking');
// Athena carries pre-DEF/RES excess without applying crit or damage bonuses a second time.
r=run([v('Athena')],[a(0,'Basic')],{count:3,hp:300});near(r.totals.Athena,698*1.3*.45);
assert.equal(r.executions.filter(e=>e.name==='Victory Wastes Nothing — Carry').length,1);
r=run([v('Athena')],[a(0,'Skill'),a(0,'Skill',2),{actor:0,source:'Wait',av:3,realTurn:true}],{count:1});
assert.equal(r.units[0].effects.filter(e=>e.characterKey==='Twin Decree').length,1);near(r.units[0].effects.find(e=>e.characterKey==='Twin Decree').duration,1);
r=run([v('Athena',{kitFate:6})],[a(0,'Basic'),a(0,'Skill',2),a(0,'Basic',3),a(0,'Ult',4)],{count:1});
assert.equal(r.executions.filter(e=>e.name==='Twin Decree'&&e.realTurn).length,1);assert.equal(r.planck,4);near(r.units[0].effects.find(e=>e.characterKey==='Pallas').duration,2);
// Janus VM4 has four uses per Janus turn, not four per refresh of her state.
const dk=(av)=>({actor:1,source:'Diệt Kích',toughness:30,av});
r=run([v('Janus',{kitFate:4}),v('Sol',{kitEnabled:false,element:'Hỏa'})],[a(0,'Basic'),...Array.from({length:6},(_,i)=>dk(i+2)),a(0,'Basic',10,{realTurn:true}),...Array.from({length:6},(_,i)=>dk(i+11))],{count:1,toughness:30,maxToughness:30,weaknesses:['Hỏa']});
assert.equal(r.executions.filter(e=>e.name==='Janus VM4').length,8);
// Surtr's final enhanced Skill inserts one free enhanced Ult; VM6 requires three Skills.
for(const fate of [0,6]){const skills=fate===6?3:2;r=run([v('Surtr',{kitFate:fate})],[a(0,'Skill'),a(0,'Ult',2),...Array.from({length:skills},(_,i)=>a(0,'Skill',3+i))],{count:3,initialPlanck:5});assert.equal(r.executions.filter(e=>e.name==='Nothing Remains to Burn').length,1);assert.equal(r.units[0].characterState.sun,0);assert.equal(r.planck,fate===6?4:2);}
// The breaking BA has one talent DK; enhanced Ult upgrades only newly broken targets to 250%.
r=run([v('Surtr')],[a(0,'Basic')],{count:1,toughness:30,maxToughness:30,weaknesses:['Hỏa']});near(r.log.find(e=>e.kind==='Diệt Kích').amount,1691);
// VM4 Pyre deals three hits but removes toughness once, with one duration decrement.
r=run([v('Surtr',{kitFate:4})],[a(0,'Basic')],{count:1,speed:100});assert.equal(r.log.filter(e=>e.kind==='DoT').length,3);near(r.enemies[0].toughness,9000);near(r.enemies[0].dots.find(d=>d.name==='Hỏa Táng').duration,1);
// Ash Skin prevents lethal damage, and expires at the next real turn end without a normal Ult.
r=run([v('Surtr',{kitAscensions:true})],[a(0,'Skill',1,{realTurn:true})],{count:1,speed:100,attack:1e8});near(r.units[0].currentHP,1);
r=run([v('Surtr',{kitAscensions:true})],[a(0,'Skill',1,{realTurn:true}),{actor:0,source:'Wait',av:50,realTurn:true}],{count:1,speed:100,attack:1e8});near(r.units[0].currentHP,0);
// Tier III inherits Tier II's two Planck and then consumes half current HP.
r=run([v('Ares')],[a(0,'Skill',1,{kitVariant:3})],{count:1});near(r.planck,1);near(r.units[0].currentHP,r.units[0].hp*.5);
// Poseidon keeps Cực Triều after an enhanced Skill, then retains two stacks at VM6 expiry.
r=run([v('Poseidon',{kitFate:6})],[a(0,'Skill'),a(0,'Skill',2),a(0,'Skill',3)],{count:1,initialPlanck:5});assert.ok(r.units[0].effects.some(e=>e.characterKey==='Cực Triều'));
r=run([v('Poseidon',{kitFate:6})],[a(0,'Skill'),a(0,'Skill',2),a(0,'Skill',3,{realTurn:true}),a(0,'Basic',4,{realTurn:true})],{count:1,initialPlanck:5});assert.ok(r.units[0].effects.some(e=>e.characterKey==='Nước Rút'));near(r.units[0].characterState.tide,2);
console.log('PASS Athena carry/buff/extra turn, Janus per-turn limit, Surtr phases/DoT/survival, Ares cost and Poseidon timed retreat');
// The enhanced Ult's breaking hit upgrades its single DK to 250%, without a second talent proc.
r=run([v('Surtr')],[{actor:0,source:'Ult',ability:'Ult',name:'Nothing Remains to Burn',enhanced:true,kitResolved:true,characterId:'veyr:surtr',ratio:1.8,toughness:120,efficiency:1,energyCost:0,energy:0,annihilate:true,av:1}],{count:1,toughness:30,maxToughness:30,weaknesses:['Hỏa']});
assert.equal(r.log.filter(e=>e.kind==='Diệt Kích').length,1);near(r.log.find(e=>e.kind==='Diệt Kích').amount,1691*4*2*.5*2.5);
// A2 retains DK's base and other multipliers while bypassing both DEF and resistance exactly once.
r=run([v('Surtr',{kitAscensions:true})],[a(0,'Skill'),a(0,'Ult',2),a(0,'Skill',3)],{count:1,toughness:0,maxToughness:720,res:.5});
near(r.log.find(e=>e.kind==='Diệt Kích').amount,1691*3*1.95*2);
// A broken-target Ram remains a follow-up, uses 150% DK and grants its explicit 5 Energy.
r=run([v('Janus'),v('Sol',{kitEnabled:false,element:'Hỏa'})],[a(0,'Basic'),{actor:1,source:'Basic',ratio:1,toughness:0,av:2}],{count:1,toughness:30,maxToughness:30,weaknesses:['Hỏa']});
assert.equal(r.executions.filter(e=>e.name==='The Ram Comes Through'&&e.source==='FUA').length,1);near(r.units[0].currentEnergy,90);near(r.log.find(e=>e.kind==='Diệt Kích').amount,1691*(20/30)*1.6*1.5*.5*1.5);
console.log('PASS upgraded enhanced-Ult DK, single-use DEF/RES bypass and Janus FUA identity/energy');

const missingCap=runCombat(cfg,[v('Janus',{energyCap:undefined})],[]);assert.equal(missingCap.complete,false);assert.match(missingCap.error,/giới hạn Năng Lượng/);
