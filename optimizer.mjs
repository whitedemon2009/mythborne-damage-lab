export const optimizerPatternIds=['basic-skill','skill-basic','skill','skill-basic-basic','skill-skill-basic','basic'];
export const optimizerSustainAspects=new Set(['Aegis','Caduceus']);

export function optimizerRandom(seed=1){
 let value=(Number(seed)||1)>>>0;return ()=>{value=(value+0x6D2B79F5)>>>0;let t=value;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
}
export const optimizerTeamKey=team=>team.join('|');
export function optimizerTeamValid(team,profiles,{locked='',sustain='atLeastOne'}={}){
 if(!Array.isArray(team)||team.length!==5||new Set(team).size!==5||team.some(name=>!profiles[name]))return false;
 if(locked&&!team.includes(locked))return false;const count=team.filter(name=>optimizerSustainAspects.has(profiles[name].aspect)).length;
 return sustain==='exactlyOne'?count===1:sustain==='atLeastOne'?count>=1:true;
}
export function optimizerMetrics(result,config={}){
 const damage=Object.values(result?.totals||{}).reduce((sum,value)=>sum+value,0),cleared=!config.infiniteHP&&result?.enemies?.length>0&&result.enemies.every(enemy=>enemy.hp<=0),survivors=result?.units?.filter(unit=>unit.currentHP>0).length||0;
 return {damage,cleared,elapsedAV:result?.elapsedAV??Infinity,survivors,planck:result?.planck??0};
}
export function compareOptimizerResults(a,b){
 if(a.metrics.cleared!==b.metrics.cleared)return a.metrics.cleared?-1:1;
 if(a.metrics.cleared&&a.metrics.elapsedAV!==b.metrics.elapsedAV)return a.metrics.elapsedAV-b.metrics.elapsedAV;
 return b.metrics.damage-a.metrics.damage||b.metrics.survivors-a.metrics.survivors||a.key.localeCompare(b.key,'vi');
}
export function randomOptimizerTeam(pool,profiles,options={},random=Math.random){
 const locked=options.locked?[options.locked]:[],available=pool.filter(name=>!locked.includes(name)),team=[...locked];
 const sustains=available.filter(name=>optimizerSustainAspects.has(profiles[name].aspect));
 if(options.sustain!=='free'&&!team.some(name=>optimizerSustainAspects.has(profiles[name].aspect))&&sustains.length){const pick=sustains[Math.floor(random()*sustains.length)];team.push(pick);available.splice(available.indexOf(pick),1);}
 while(team.length<5&&available.length){const index=Math.floor(random()*available.length);team.push(available.splice(index,1)[0]);}
 if(options.sustain==='exactlyOne'){
  const keep=team.find(name=>optimizerSustainAspects.has(profiles[name].aspect));for(let i=0;i<team.length;i++)if(team[i]!==keep&&optimizerSustainAspects.has(profiles[team[i]].aspect)){const candidates=pool.filter(name=>!team.includes(name)&&!optimizerSustainAspects.has(profiles[name].aspect));if(candidates.length)team[i]=candidates[Math.floor(random()*candidates.length)];}
 }
 return optimizerTeamValid(team,profiles,options)?team:null;
}
export function mutateOptimizerTeam(team,pool,profiles,options={},random=Math.random){
 const next=[...team],replaceable=next.map((name,index)=>({name,index})).filter(item=>item.name!==options.locked);if(!replaceable.length)return next;
 for(let attempt=0;attempt<30;attempt++){
  const candidate=[...next],slot=replaceable[Math.floor(random()*replaceable.length)].index,choices=pool.filter(name=>!candidate.includes(name));if(!choices.length)return next;candidate[slot]=choices[Math.floor(random()*choices.length)];
  if(random()<.2){const a=Math.floor(random()*5),b=Math.floor(random()*5);[candidate[a],candidate[b]]=[candidate[b],candidate[a]];}
  if(optimizerTeamValid(candidate,profiles,options))return candidate;
 }
 return next;
}
