export const heimdallKit={
 minor:{hp:.12,speed:8,energy:.1},
 guarded(r,u){return r.allies().find(t=>r.effect(u,t,'Người Gác Bình Minh'));},
 init(r,u){if(!r.vm(u,2))return;const choices=r.allies().filter(t=>t!==u&&t.aspect==='Fragarach').sort((a,b)=>(b.threat-a.threat)||(r.eff(b).atk-r.eff(a).atk));if(choices[0])heimdallKit.guard(r,u,choices[0]);},
 guard(r,u,t){for(const ally of r.ctx.units)if(ally!==t)r.remove(u,ally,'Người Gác Bình Minh');r.buff(u,t,'Người Gác Bình Minh',{},3);},
 sync(r,u){for(const t of r.allies()){const b=r.effect(u,t,'Người Gác Bình Minh');if(!b)continue;const oldThreat=b.mods?.threat||0,base=Math.max(0,r.eff(t).threat-oldThreat);b.mods={CounterDamage:.3,...(t.aspect==='Fragarach'?{threat:base*1.5,reduction:.2}:{})};}},
 resolve(r,u,k){return k==='Basic'?{name:'First Watch at Dawn',ratio:.7,toughness:30}:k==='Skill'?{name:'The Gate Knows Its Guardian',support:true,otherRecipient:true,needsRecipient:true}:{name:'The Horn Before the Last Dawn',support:true,energyCost:140};},
 after(r,u,a){if(a.ability==='Skill'){heimdallKit.guard(r,u,r.ctx.units[a.recipient]);r.allySkill(u,r.ctx.units[a.recipient],a);}if(a.ability==='Ult'){for(const t of r.allies())r.buff(u,t,'Hừng Đông Đã Được Báo Trước',{},2,{scoped:{critDmg:.36},sources:['Counter']});const s=r.state(u);s.forcedTurn=u.turn;s.forced=0;s.vm6Free=false;}},
 event(r,u,type,e){const s=r.state(u),guard=heimdallKit.guarded(r,u);
  if(type==='enemyCounterCheck'&&guard?.aspect==='Fragarach'&&r.alive(e.enemy)&&!e.naturalCounters.has(guard.index)&&!guard.effects.some(x=>x.type==='control')){if(s.forcedTurn!==u.turn){s.forcedTurn=u.turn;s.forced=0;s.vm6Free=false;}const limit=r.vm(u,6)?3:2;if(s.forced<limit){const free=r.vm(u,6)&&!s.vm6Free;if(r.forceCounter(guard,e.enemy,e,{noConsume:free,bonus:r.asc(u)?.25:0})){s.forced++;if(free)s.vm6Free=true;}}}
  if(type==='after'&&e.action?.source==='Counter'&&guard&&e.unit===guard){
   if(r.effect(u,guard,'Hừng Đông Đã Được Báo Trước')){const key=guard.index+':'+guard.turn;s.advances??={};if((s.advances[key]||0)<2){s.advances[key]=(s.advances[key]||0)+1;r.advance(guard,.15);}}
   if(r.asc(u)){if(s.energyTurn!==u.turn){s.energyTurn=u.turn;s.energyUses=0;}if(s.energyUses<2){s.energyUses++;r.gain(u,5);}}
   if(r.vm(u,1)){if(s.healTurn!==u.turn){s.healTurn=u.turn;s.heals=0;}if(s.heals<2){s.heals++;r.heal(u,guard,.04,80,e.action);}}
   if(r.vm(u,4))for(const i of e.targets||[])r.buff(u,r.ctx.enemies[i],'Tiếng Kèn Phán Quyết',{},2,{debuff:true,incoming:{vulnerability:.12},sources:['Counter']});
  }
  if(type==='modify'&&guard&&e.unit===guard&&e.action.source==='Counter'){if(r.asc(u))e.crit+=.15;if(r.effect(u,guard,'Hừng Đông Đã Được Báo Trước'))e.pen+=.18;}
 }
};
