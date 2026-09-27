import assert from 'node:assert/strict';
import {optimizerRandom,optimizerTeamKey,optimizerTeamValid,optimizerMetrics,compareOptimizerResults,randomOptimizerTeam,mutateOptimizerTeam,optimizerPatternIds} from './optimizer.mjs';
const profiles=Object.fromEntries(Array.from({length:12},(_,i)=>['V'+i,{aspect:i<3?'Aegis':i<5?'Caduceus':'Gungnir'}])),pool=Object.keys(profiles),options={locked:'V8',sustain:'exactlyOne'};
const a=optimizerRandom(42),b=optimizerRandom(42);assert.deepEqual(Array.from({length:20},()=>a()),Array.from({length:20},()=>b()));
let team=randomOptimizerTeam(pool,profiles,options,a);assert.ok(optimizerTeamValid(team,profiles,options));assert.ok(team.includes('V8'));assert.equal(team.filter(n=>['Aegis','Caduceus'].includes(profiles[n].aspect)).length,1);
for(let i=0;i<100;i++){team=mutateOptimizerTeam(team,pool,profiles,options,a);assert.ok(optimizerTeamValid(team,profiles,options));}
assert.equal(new Set(optimizerPatternIds).size,6);assert.equal(optimizerTeamKey(['a','b','c','d','e']),'a|b|c|d|e');
const result={totals:{a:20,b:30},enemies:[{hp:0}],units:[{currentHP:1},{currentHP:0}],elapsedAV:90,planck:2};assert.deepEqual(optimizerMetrics(result,{infiniteHP:false}),{damage:50,cleared:true,elapsedAV:90,survivors:1,planck:2});
const ranked=[{key:'slow',metrics:{damage:100,cleared:true,elapsedAV:100,survivors:5}},{key:'fast',metrics:{damage:50,cleared:true,elapsedAV:80,survivors:1}},{key:'uncleared',metrics:{damage:999,cleared:false,elapsedAV:10,survivors:5}}].sort(compareOptimizerResults);assert.deepEqual(ranked.map(x=>x.key),['fast','slow','uncleared']);
console.log('PASS deterministic optimizer search, team constraints, mutation, patterns and result ranking');
