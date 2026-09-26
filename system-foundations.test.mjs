import assert from 'node:assert/strict';
import {addDot,dotStacks,elapseDot} from './dot-system.mjs';
import {isIceLightningTeam,superconductAction} from './element-conversion.mjs';
import {directDamage,runCombat} from './combat.mjs';
import {reviveState,spendHP} from './life-system.mjs';

const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const target={level:60,res:0,toughness:0,maxToughness:720,reductions:[],dots:[]};
const base={name:'A',level:60,atk:1000,hp:10000,def:500,speed:100,crit:1,critDmg:1,energyCap:120,aspect:'Gungnir',element:'Băng'};

const stacked={...target,dots:[]};
addDot(stacked,{name:'Chảy Máu',owner:0,action:{ratio:2},duration:2,maxStacks:3,independentDurations:true});
addDot(stacked,{name:'Chảy Máu',owner:0,action:{ratio:2},duration:2,maxStacks:3,independentDurations:true});
assert.deepEqual(stacked.dots[0].stackDurations,[2,2]);assert.equal(dotStacks(stacked.dots[0]),2);
elapseDot(stacked.dots[0]);addDot(stacked,{name:'Chảy Máu',owner:0,action:{ratio:2},duration:2,maxStacks:3,independentDurations:true});
assert.deepEqual(stacked.dots[0].stackDurations,[1,1,2]);elapseDot(stacked.dots[0]);assert.deepEqual(stacked.dots[0].stackDurations,[1]);
addDot(stacked,{name:'Chảy Máu',owner:1,action:{ratio:1},duration:2,exclusiveByName:true});assert.equal(stacked.dots.length,1);assert.equal(stacked.dots[0].owner,1);

const cold={...base,element:'Hàn Băng'},resistant={...target,res:.2};
close(directDamage(cold,resistant,{ratio:1},'normal'),800);close(directDamage(base,resistant,{ratio:1},'normal'),400);
const dual={...base,'BăngDamage':.2,'LôiDamage':.3};
const superconduct=superconductAction({ratio:1,ignoreDef:true,'BăngResPen':.1,'LôiResPen':.1});
close(directDamage(dual,resistant,superconduct,'normal'),1500);assert.deepEqual(superconduct.damageElements,['Băng','Lôi']);
assert.equal(isIceLightningTeam([{element:'Hàn Băng'},{element:'Lôi'}]),true);assert.equal(isIceLightningTeam([{element:'Băng'},{element:'Phong'}]),false);

const life={hp:1000,currentHP:600,energyCap:120,currentEnergy:30,effects:[{}],shields:[1],shieldDurations:[2],shieldLayers:[{}]};
assert.equal(spendHP(life,900,1),599);assert.equal(life.currentHP,1);life.currentHP=0;assert.equal(reviveState(life,{hpFraction:.35,energy:20}),true);assert.equal(life.currentHP,350);assert.equal(life.currentEnergy,20);assert.equal(life.effects.length,0);

const cfg={count:1,level:60,hp:1e7,maxToughness:720,toughness:720,weaknesses:[],speed:1,attack:0,hitEnergy:0,cycles:1,res:.2,critMode:'normal',seed:1,dynamic:false,report:true};
const strike={actor:0,av:1,source:'Skill',ratio:1,targets:1,target:0,toughness:60,cost:0,energy:0,realTurn:false};
let result=runCombat({...cfg,toughness:40,maxToughness:40,res:0,report:false},[{...base,element:'Vật Lý'}],[strike]);
assert.equal(result.enemies[0].toughness,10,'Vật Lý phải bào 50% Sức Bền dù Myrk không có Điểm Yếu');
result=runCombat({...cfg,toughness:30,maxToughness:30,res:0,report:false},[{...base,element:'Vật Lý'}],[strike]);
assert.equal(result.enemies[0].toughness,0);assert.equal(result.enemies[0].dots[0].name,'Chảy Máu');assert.equal(result.enemies[0].dots[0].duration,2);
result=runCombat({...cfg,toughness:30,maxToughness:30,weaknesses:['Băng'],res:0,report:false},[{...base,element:'Hàn Băng'}],[{...strike,toughness:30}]);
assert.equal(result.enemies[0].toughness,0);assert.equal(result.enemies[0].effects.some(e=>e.type==='control'),false,'Phá Vỡ Hàn Băng không được áp dụng Đóng Băng');
result=runCombat({...cfg,toughness:30,maxToughness:30,weaknesses:['Lôi'],res:0,report:false},[base],[{...strike,toughness:30,damageElements:['Băng','Lôi']}]);
assert.equal(result.enemies[0].toughness,0,'Siêu Dẫn phải đọc Điểm Yếu Lôi hoặc Băng');

const dot={actor:0,av:1,source:'DoT',effectName:'Test DoT',duration:2,ratio:1,targets:1,target:0,toughness:0,energy:0,realTurn:false};
const trigger={actor:0,av:2,source:'Skill',ratio:0,targets:1,target:0,toughness:0,cost:0,energy:0,realTurn:false,triggerDoT:true,triggerDotIgnoreDef:true};
result=runCombat(cfg,[{...base,element:'Hỏa'}],[dot,trigger]);
assert.equal(result.complete,true,result.error);assert.equal(result.enemies[0].dots[0].duration,2);close(result.damageEvents.find(e=>e.kind==='DoT').actual,720);
close(result.damageEvents.find(e=>e.kind==='DoT').formulaValue,result.damageEvents.find(e=>e.kind==='DoT').calculated);

result=runCombat({...cfg,res:0,toughness:0,critMode:'crit'},[{...base,element:'Hỏa'}],[{...dot,allowDotCrit:true}, {...trigger,triggerDotIgnoreDef:false}]);
close(result.damageEvents.find(e=>e.kind==='DoT').actual,1000);

const reviveCfg={...cfg,speed:100,attack:10000,res:0,report:false};
result=runCombat(reviveCfg,[{...base,name:'Medic',threat:1},{...base,name:'Fallen',hp:100,threat:10000}], [{actor:0,av:110,source:'Revive',recipient:1,hpFraction:.5,reviveEnergy:10,energy:0,realTurn:false}]);
assert.equal(result.units[1].currentHP,50);assert.equal(result.units[1].currentEnergy,10);assert.ok(result.log.some(e=>e.type==='revive'));

result=runCombat(cfg,[{...base,element:'Hỏa'}],[{actor:0,av:1,source:'Skill',ratio:0,selfHPCost:.5,targets:1,target:0,toughness:0,cost:0,energy:0,realTurn:false}]);
assert.equal(result.units[0].currentHP,5000);
console.log('PASS physical/bleed stacks, active DoT, DoT crit, Hàn Băng, Siêu Dẫn, HP sacrifice and delayed revive');
