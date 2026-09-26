export const bellonaKit={
 minor:{atk:.12,crit:.08,elementDamage:.1},
 sync(r,u){if(r.vm(u,1))for(const t of r.allies())if(t!==u)r.buff(u,t,'Bellona VM1',{CounterDamage:r.effect(u,u,'Chiến Kỳ Đỏ')?.15:0});},
 resolve(r,u,k){return k==='Basic'?{name:'Ash Beneath the Standard',ratio:.8,toughness:30}:k==='Skill'?{name:'Draw the Battle Line',ratio:1.6,toughness:60}:{name:'Every Road Ends in the Red Field',ratio:2.1,splash:1.05,blast:true,toughness:60,energyCost:120};},
 counter(r,u,target,parent,selectedCount=1,options={}){const s=r.state(u);if(s.counterTurn!==u.turn){s.counterTurn=u.turn;s.counters=0;}const limit=r.effect(u,u,'Tổng Động Viên')?3:2;if(!options.noConsume&&s.counters>=limit)return false;if(!options.noConsume)s.counters++;r.queue(u,{name:'Red Standard Falls',source:'Counter',ratio:1.3,splash:.65,blast:true,target:target.index,toughness:60,selectedCount,wasSelected:parent.targets?.has(u.index),bonus:options.bonus||0},parent);return true;},
 forceCounter(r,u,target,parent,options={}){return bellonaKit.counter(r,u,target,{actor:u.index,chain:parent.chain,targets:parent.targets},parent.targets?.size||1,options);},
 before(r,u,a){if(['Ult','Counter','FUA'].includes(a.source))a.targetToughness=Object.fromEntries(a.targetIndices.map(i=>[i,i===a.primaryTarget?(a.source==='FUA'?30:60):(a.source==='FUA'?15:30)]));},
 after(r,u,a,targets){const s=r.state(u);
  if(a.source==='Skill')r.buff(u,u,'Chiến Kỳ Đỏ',{CounterDamage:.3},2);
  if(a.source==='Ult'){s.counterTurn=u.turn;s.counters=0;r.buff(u,u,'Tổng Động Viên',{CounterDamage:.35},2,{cohorts:0});}
  if(a.source==='Counter'){
   if(r.asc(u)){if(s.energyTurn!==u.turn){s.energyTurn=u.turn;s.energyUses=0;}if(s.energyUses<2){s.energyUses++;r.gain(u,5);}}
   if(r.vm(u,2)&&s.counters>=2&&r.once(u,'Bellona VM2'))r.planck(u,1);
   if(r.vm(u,4))for(const i of targets)r.buff(u,r.ctx.enemies[i],'Bellona VM4',{damage:-.1},1,{debuff:true});
   const mobilized=r.effect(u,u,'Tổng Động Viên');if(r.vm(u,6)&&mobilized&&a.selectedCount>=4&&mobilized.cohorts<2){mobilized.cohorts++;r.queue(u,{name:'Last Cohort Advances',source:'FUA',ratio:1,splash:.5,blast:true,target:a.primaryTarget,toughness:30},a);}
  }
 },
 event(r,u,type,e){
  if(type==='enemyActionStart'&&e.targets.size>=2&&r.effect(u,u,'Tổng Động Viên'))for(const i of e.targets)r.buff(u,r.ctx.units[i],'Bellona bảo hộ',{reduction:.12});
  if(type==='damageActionEnd')for(const t of r.allies())r.remove(u,t,'Bellona bảo hộ');
  if(type==='enemyAttackEnd'&&e.targets.size>=2&&r.alive(e.enemy))bellonaKit.counter(r,u,e.enemy,{actor:u.index,chain:e.chain,targets:e.targets},e.targets.size);
  if(type==='modify'&&e.unit===u&&e.action.source==='Counter'){if(r.asc(u))e.crit+=.15;if(r.asc(u)&&e.action.wasSelected&&e.target.index===e.action.primaryTarget)e.pen+=.15;}
 }
};
