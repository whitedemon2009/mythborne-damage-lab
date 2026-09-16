import assert from 'node:assert/strict';
import {actionToughness, apolloEntryCrit} from './character-rules.mjs';
import {runCombat} from './combat.mjs';

for (const aspect of ['Gungnir','Vajra','Mjolnir','Keraunos','Aegis']) {
 assert.equal(actionToughness('Basic',aspect),30);
 assert.equal(actionToughness('Skill',aspect),60);
 assert.equal(actionToughness('FUA',aspect),20);
 assert.equal(actionToughness('Ult',aspect),['Gungnir','Vajra'].includes(aspect)?120:90);
 assert.equal(actionToughness('Ult',aspect,40),40);
 assert.equal(actionToughness('Skill',aspect,0),0);
}
assert.equal(apolloEntryCrit(200),.1);
assert.equal(apolloEntryCrit(150),0);
assert.equal(apolloEntryCrit(400),.2);
const config={count:1,level:60,hp:1e6,maxToughness:720,toughness:720,weaknesses:['Quang'],speed:1,attack:0,cycles:1,res:0,critMode:'normal',dynamic:false};
const roster=[{name:'Test',aspect:'Mjolnir',element:'Quang',atk:1000,hp:10000,def:500,speed:100,energyCap:400}];
for (const [source,expected] of [['Basic',30],['Skill',60],['Ult',90],['FUA',20]]) {
 const r=runCombat(config,roster,[{actor:0,source,ratio:1,hits:3,energyCost:0,av:1}]);
 assert.equal(r.complete,true);
 assert.ok(Math.abs(r.enemies[0].toughness-(720-expected))<1e-9,'Total toughness is per action, not per hit');
}
const explicit=runCombat(config,roster,[{actor:0,source:'Skill',ratio:1,toughness:30,av:1}]);
assert.equal(explicit.enemies[0].toughness,690,'An explicit kit value overrides the shared default');
console.log('PASS canon toughness defaults, kit precedence, multi-hit totals, Apollo entry-energy formula');
