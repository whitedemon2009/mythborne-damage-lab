export const houYiKit={
 minor:{crit:.104,critDmg:.12,elementDamage:.078},
 marks(r,u){return r.state(u).marks??=[];},
 add(r,u,t,threshold,value,a){if(!r.alive(t))return;const s=r.state(u);s.marks=houYiKit.marks(r,u).filter(m=>m.target===t.index);s.marks.push({target:t.index,threshold,value,created:s.serial=(s.serial||0)+1,action:a.uid});if(s.marks.length>3){const weakest=[...s.marks].sort((a,b)=>a.value-b.value||a.created-b.created)[0];s.marks=s.marks.filter(m=>m!==weakest);}r.log(u,`Vạch Nhật → Myrk ${t.index+1}: ngưỡng ${threshold.toFixed(2)} HP, ghi ${value.toFixed(2)}`);},
 fire(r,u,m,a,forced=false){const t=r.ctx.enemies[m.target];if(!r.alive(t))return;const s=r.state(u);let value=m.value*(m.residual?.5:1);if(r.asc(u)&&t.hp<=t.maxHP*.5)value*=1.2;
  if(r.vm(u,1)){const c=r.eff(u),mode=r.ctx.config.critMode;if(mode==='crit'||mode==='sampled'&&r.ctx.random()<c.crit)value*=1+c.critDmg;else if(mode==='expected')value*=1+Math.min(1,c.crit)*c.critDmg;}
  if(forced&&r.vm(u,6)&&!m.residual)m.residual=true;else s.marks=houYiKit.marks(r,u).filter(x=>x!==m);
  r.fixed(u,t,value,a,'Vạch Nhật','Talent');
  if(!forced&&r.asc(u)){if(s.energyTurn!==u.turn){s.energyTurn=u.turn;s.energyUses=0;}if(s.energyUses<2){s.energyUses++;r.gain(u,5);}}
  if(!forced&&r.vm(u,2)&&a.actor!==u.index)r.buff(u,u,'Dẫn Xạ',{},2,{consume:'damage',target:t.index,scoped:{critDmg:.3},sources:['Basic','Skill','Ult','FUA','Counter']});
 },
 resolve(r,u,k){return k==='Basic'?{name:'Trace the Falling Sun',ratio:1.3,toughness:30}:k==='Skill'?{name:'Pin the Horizon',ratio:2.4,toughness:60}:{name:'All Nine Horizons Collapse',ratio:3.2,toughness:90,energyCost:140};},
 before(r,u,a){if(a.source==='Ult'){const marks=houYiKit.marks(r,u).filter(m=>m.target===a.primaryTarget&&!m.residual);let energy=0;for(const m of [...marks]){houYiKit.fire(r,u,m,a,true);if(r.vm(u,4)&&energy<15){energy+=5;r.gain(u,5);}}}},
 after(r,u,a,targets){if(!['Basic','Skill','Ult'].includes(a.source))return;for(const i of targets){const t=r.ctx.enemies[i],value=a.damageByTarget[i]||0;if(a.source==='Basic'){houYiKit.add(r,u,t,t.hp,.18*value,a);houYiKit.add(r,u,t,t.hp-.08*t.maxHP,.18*value,a);}else houYiKit.add(r,u,t,t.hp-.04*t.maxHP,value*(a.source==='Skill'?.6:.8),a);}},
 event(r,u,type,e){
  if(type==='death'&&e.unit.side==='enemy')r.state(u).marks=houYiKit.marks(r,u).filter(m=>m.target!==e.unit.index);
  if(type==='break'&&r.asc(u)&&houYiKit.marks(r,u).some(m=>m.target===e.target.index)){e.action.houYiBreak??={};e.action.houYiBreak[u.index]??=new Set();e.action.houYiBreak[u.index].add(e.target.index);}
  if(type==='after'&&!e.action.storedDamage&&e.targets?.size){const candidates=houYiKit.marks(r,u).filter(m=>m.action!==e.action.uid&&e.targets.has(m.target)&&r.ctx.enemies[m.target].hp<=m.threshold).sort((a,b)=>a.created-b.created),first=candidates[0];if(!first)return;houYiKit.fire(r,u,first,e.action);if(r.asc(u)&&e.action.houYiBreak?.[u.index]?.has(first.target)){const next=candidates.find(m=>m!==first&&m.target===first.target&&houYiKit.marks(r,u).includes(m));if(next)houYiKit.fire(r,u,next,e.action);}}
 }
};
