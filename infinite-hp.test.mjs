import assert from 'node:assert/strict';
import {runCombat} from './combat.mjs';
const unit={name:'Test',level:60,atk:10000,hp:100000,speed:100,crit:0,energyCap:120,aspect:'Vajra',element:'Quang'};
const cfg={count:1,level:60,hp:1,maxToughness:30,toughness:30,weaknesses:['Quang'],speed:100,attack:100,hitEnergy:10,cycles:2,res:0,critMode:'normal',seed:1,report:true};
const hit={actor:0,av:1,source:'Basic',ratio:1,targets:1,hits:1,toughness:30,realTurn:true,energy:0};
const finite=runCombat(cfg,[unit],[hit]);assert.equal(finite.totals.Test,1);assert.equal(finite.enemies[0].hp,0);
const infinite=runCombat({...cfg,infiniteHP:true},[unit],[hit,{...hit,av:2,source:'FUA'},{...hit,av:3,source:'Diệt Kích'},{...hit,av:4,source:'DoT',duration:2}]);
assert.equal(infinite.complete,true);assert.equal(infinite.enemies[0].hp,1);assert.equal(infinite.enemies[0].maxHP,1);assert.ok(infinite.enemies[0].turn>=2);assert.ok(infinite.units[0].currentHP<unit.hp);
for(const kind of ['direct','Break','Diệt Kích','DoT'])assert.ok(infinite.damageEvents.some(e=>e.kind===kind&&e.actual>1),kind);
assert.ok(infinite.damageEvents.every(e=>e.actual===e.calculated&&e.overkill===0));assert.equal(infinite.enemies[0].damageTaken,infinite.totals.Test);
const immortalHit=runCombat({...cfg,infiniteHP:true,weaknesses:[]},[unit],[hit]);assert.equal(immortalHit.units[0].currentEnergy,80); // 60 initial + two enemy hits, no kill energy
const large=runCombat({...cfg,hp:10000000},[unit],[hit]);assert.equal(large.complete,true);assert.ok(large.enemies[0].hp>0);assert.equal(large.enemies[0].damageTaken,large.totals.Test);
assert.doesNotThrow(()=>JSON.parse(JSON.stringify(infinite)));assert.ok(!JSON.stringify(infinite).includes('null,"actual"'));
console.log('PASS finite 10M HP, infinite direct/FUA/Break/DoT/DK uncapped damage, no kill energy, enemy turns and finite reference HP');
