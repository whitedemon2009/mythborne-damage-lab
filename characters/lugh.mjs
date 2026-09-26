import {normalizeElement} from '../formulas.mjs';
export const lughKit={
 minor:{atk:.12,crit:.08,elementDamage:.1},
 sync(r,u){const royal=!!r.effect(u,u,'Vương Lệnh'),stance=!!r.effect(u,u,'Thế Đón'),mult=royal?2.5:stance?1.5:0,old=r.effect(u,u,'Lugh đe dọa')?.mods.threat||0,base=r.eff(u).threat-old;r.buff(u,u,'Lugh đe dọa',{threat:base*mult,atk:r.asc(u)?Math.min(.5,mult*.2):0});},
 resolve(r,u,k){return k==='Basic'?{name:'Edge Before Winter',ratio:.8,toughness:30}:k==='Skill'?{name:'Let the First Blade Choose',ratio:1.9,toughness:60}:{name:'The King Answers at Samhain',ratio:3.2,toughness:90,energyCost:140};},
 draw(r,u,parent,source,target,bonus=0){const t=r.enemies().find(t=>r.effect(u,t,'Đối Vương'))||target||r.enemies().sort((a,b)=>b.hp-a.hp)[0];if(!t)return;const royal=!!r.effect(u,u,'Vương Lệnh');r.queue(u,{name:'Fragarach Drawn',source,ratio:royal?3:2.4,splash:royal?1.7:1.2,blast:true,target:t.index,toughness:60,bonus,enemyTriggered:source==='Counter'},parent);},
 counter(r,u,target,parent,options={}){const s=r.state(u);if(s.counterTurn!==u.turn){s.counterTurn=u.turn;s.counters=0;}if(!options.noConsume&&s.counters>=(r.effect(u,u,'Vương Lệnh')?3:2))return false;if(!options.noConsume)s.counters++;lughKit.draw(r,u,parent,'Counter',target,(r.vm(u,2)&&r.effect(u,target,'Đối Vương')?.35:0)+(options.bonus||0));return true;},
 forceCounter(r,u,target,parent,options={}){return lughKit.counter(r,u,target,{actor:u.index,chain:parent.chain},{noConsume:!!options.noConsume,bonus:options.bonus||0});},
 after(r,u,a,targets){const s=r.state(u);
  if(a.source==='Skill'){for(const t of r.enemies())r.remove(u,t,'Đối Vương');r.buff(u,r.ctx.enemies[a.primaryTarget],'Đối Vương',{},2,{debuff:true});r.buff(u,u,'Thế Đón',{CounterDamage:.25},2);}
  if(a.source==='Ult'){s.counterTurn=u.turn;s.counters=0;r.buff(u,u,'Vương Lệnh',{reduction:.2},r.ctx.gear.ctx.activeUnit===u?2:1,{seconds:0});}
  if(a.name==='Fragarach Drawn'){
   if(r.asc(u)&&[...targets].some(i=>r.effect(u,r.ctx.enemies[i],'Đối Vương'))){if(s.energyTurn!==u.turn){s.energyTurn=u.turn;s.energyUses=0;}if(s.energyUses<2){s.energyUses++;r.gain(u,5);}}
   if(r.vm(u,4))for(const i of targets)r.buff(u,r.ctx.enemies[i],'Lugh VM4',{},2,{debuff:true});
   const royal=r.effect(u,u,'Vương Lệnh'),t=r.ctx.enemies[a.primaryTarget];if(r.vm(u,6)&&royal&&a.enemyTriggered&&royal.seconds<2&&r.alive(t)){royal.seconds++;r.queue(u,{name:'Crownless Second Stroke',source:'Counter',ratio:1.1,target:t.index,toughness:30},a);}
  }
 },
 event(r,u,type,e){const s=r.state(u);
  if(type==='select'&&e.target===u&&r.vm(u,2)&&r.effect(u,e.enemy,'Đối Vương'))r.buff(u,u,'Lugh VM2 nhận đòn',{reduction:.15});
  if(type==='damageActionEnd')r.remove(u,u,'Lugh VM2 nhận đòn');
  if(type==='enemyAttackEnd'&&e.targets.has(u.index)&&r.alive(e.enemy))lughKit.counter(r,u,e.enemy,{actor:u.index,chain:e.chain});
  if(type==='turnEnd'&&e.unit!==u&&e.unit.side==='ally'&&r.vm(u,1)){s.allyTurns=(s.allyTurns||0)+1;if(s.allyTurns>=3){s.allyTurns=0;lughKit.draw(r,u,{actor:e.unit.index},'FUA');}}
  if(type==='modify'){
   if(normalizeElement(e.unit.element)==='Băng'&&r.effect(u,e.target,'Lugh VM4'))e.resPen+=.12;
   if(e.unit===u&&e.action.name==='Fragarach Drawn'){const marked=!!r.effect(u,e.target,'Đối Vương');if(marked)e.pen+=.15;if(r.asc(u))e.crit+=marked?.25:.15;}
  }
 }
};
