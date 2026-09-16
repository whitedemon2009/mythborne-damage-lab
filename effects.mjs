export function effectChance(base,hit,res,guaranteed=false,immune=false){
  if(immune)return 0;
  return guaranteed?1:Math.max(0,Math.min(1,base*(1+hit)*(1-Math.max(0,res))));
}
export function addEffect(unit,effect){
  const old=unit.effects.find(e=>e.name===effect.name);
  const stacks=effect.maxStacks?Math.min(effect.maxStacks,(old?.stacks||0)+(effect.stacks||1)):1;
  const next={...effect,stacks};
  unit.effects=unit.effects.filter(e=>e.name!==effect.name);unit.effects.push(next);return next;
}
export function expireEffects(unit){
  for(const e of unit.effects)if(e.duration!==null&&e.clockOwner===undefined)e.duration--;
  unit.effects=unit.effects.filter(e=>e.duration===null||e.duration>0);
}
export function effectiveStats(unit){
  const out={...unit};
  const sum=type=>unit.effects.reduce((n,e)=>n+((e.type===type?e.value:0)+(e.mods?.[type]||0))*(e.stacks||1),0);
  for(const stat of ['atk','hp','def']){
    out[stat]=(unit[stat]||0)+(unit[stat+'BaseTotal']??unit[stat]??0)*sum(stat)+(sum(stat+'Flat'));
  }
  out.speed=Math.max(1,Math.round((unit.speedRaw??unit.speed)+(unit.speedBaseTotal??unit.speed)*sum('speedPct')+sum('speed')));
  const mapping={efficiency:'efficiency',BasicDamage:'BasicDamage',shieldBonus:'shieldBonus',outgoing:'outgoing',SkillDamage:'SkillDamage',UltDamage:'UltDamage',FUADamage:'FUADamage',CounterDamage:'CounterDamage',DoTDamage:'DoTDamage',damage:'allDamage',crit:'crit',critDmg:'critDmg',energy:'energy',hit:'hit',resist:'resist',pierce:'pierce',break:'break',elementDamage:'elementDamage',threat:'threat'};
  for(const [type,key] of Object.entries(mapping))out[key]=(unit[key]||0)+sum(type);
  out.defReduction=(unit.defReduction||0)+sum('defReduction');
  out.res=(unit.res||0)-sum('resReduction');
  out.vulnerability=(unit.vulnerability||0)+sum('vulnerability');
  out.reductions=[...(unit.reductions||[]),sum('reduction')];
  out.hp=Math.max(1,out.hp);out.threat=Math.max(0,out.threat);
  return out;
}
