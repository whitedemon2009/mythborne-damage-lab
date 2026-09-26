export const nezhaKit={
 minor:{atk:.12,crit:.104,elementDamage:.1},
 marked(r,u,t){return !!r.effect(u,t,'Khóa Luân')||!!r.effect(u,u,'Liên Đài Trên Không');},
 resolve(r,u,k){return k==='Basic'?{name:'Cinder Draws the First Line',ratio:.85,toughness:30}:k==='Skill'?{name:'Ring the Spear Before the Drum',ratio:1.8,toughness:60}:{name:'Heaven Has No Road Ahead',ratio:1.5,aoe:true,toughness:90,energyCost:130};},
 counter(r,u,target,parent,options={}){const s=r.state(u);if(s.counterTurn!==u.turn){s.counterTurn=u.turn;s.counters=0;}if(!options.noConsume&&s.counters>=2)return false;if(!options.noConsume)s.counters++;const lotus=!!r.effect(u,u,'Liên Đài Trên Không');r.queue(u,{name:'Red Lotus Crosses First',source:'Counter',ratio:lotus?2.6:2.3,...(lotus?{splash:1.3,blast:true}:{}),target:target.index,toughness:60,parentEnemyAction:parent,actualMark:!!r.effect(u,target,'Khóa Luân'),bonus:options.bonus||0},parent);parent.preCounters?.add(u.index);return true;},
 forceCounter(r,u,target,parent,options={}){return nezhaKit.counter(r,u,target,parent,options);},
 finishInterception(r,u,a,broke){const parent=a.parentEnemyAction;if(!parent)return;if(broke){parent.cancelled=true;if(r.asc(u)&&r.once(u,'Nezha A2')){r.gain(u,8);r.advance(u,.2);}if(r.vm(u,4)){const mark=r.effect(u,r.ctx.enemies[a.primaryTarget??a.target],'Khóa Luân');if(mark&&!mark.extended){mark.duration++;mark.extended=true;}}}else if(r.asc(u))parent.damageMultiplier*=.8;},
 after(r,u,a,targets){if(a.source==='Skill'){for(const t of r.enemies())r.remove(u,t,'Khóa Luân');r.buff(u,r.ctx.enemies[a.primaryTarget],'Khóa Luân',r.vm(u,1)?{HỏaResReduction:.15}:{},2,{debuff:true,extended:false});}
  if(a.source==='Ult'){const s=r.state(u);s.lotus=(s.lotus||0)+1;s.lotusTargets=new Set();r.buff(u,u,'Liên Đài Trên Không',{},2);}
  if(a.name==='Red Lotus Crosses First'){
   const index=a.primaryTarget??a.target,t=r.ctx.enemies[index],broke=a.actionUnbroken?.includes(t.index)&&t.toughness===0,lotus=r.effect(u,u,'Liên Đài Trên Không'),s=r.state(u),first=r.vm(u,6)&&lotus&&!s.lotusTargets.has(t.index);if(first){s.lotusTargets.add(t.index);r.queue(u,{name:'Lotus Wheel Burns Backward',source:'Counter',ratio:1.8,target:t.index,toughness:30,parentEnemyAction:a.parentEnemyAction},a);}else nezhaKit.finishInterception(r,u,a,broke);
  }
  if(a.name==='Lotus Wheel Burns Backward'){const t=r.ctx.enemies[a.primaryTarget??a.target],broke=a.actionUnbroken?.includes(t.index)&&t.toughness===0;nezhaKit.finishInterception(r,u,a,broke);}
 },
 event(r,u,type,e){
  if(type==='enemyTargetsSelected'&&nezhaKit.marked(r,u,e.enemy)&&r.alive(e.enemy))nezhaKit.counter(r,u,e.enemy,e);
  if(type==='enemyAttackEnd'){const s=r.state(u);if(r.vm(u,2)&&s.preCounterChain===e.chain&&!e.cancelled&&r.alive(e.enemy))r.queue(u,{name:'Ash Returns to the Wheel',source:'Counter',ratio:1,target:e.enemy.index,toughness:30},{actor:u.index,chain:e.chain});}
  if(type==='modify'&&e.unit===u&&e.action.name==='Red Lotus Crosses First'){if(r.asc(u))e.crit+=.2;if(r.asc(u)&&e.action.actualMark)e.critDmg+=.3;}
  if(type==='enemyTargetsSelected'&&nezhaKit.marked(r,u,e.enemy))r.state(u).preCounterChain=e.chain;
 }
};
