export const eosKit={
 minor:{atk:.12,crit:.08,elementDamage:.1},
 order(r,targets){const mid=(r.ctx.enemies.length-1)/2;return targets.sort((a,b)=>b.maxHP-a.maxHP||Math.abs(a.index-mid)-Math.abs(b.index-mid)||a.index-b.index);},
 mark(r,u,t,duration=2){if(!r.alive(t))return;const s=r.state(u);r.buff(u,t,'Hừng Tuyến',{},duration,{order:s.order=(s.order||0)+1,debuff:true});const marked=r.enemies().filter(t=>r.effect(u,t,'Hừng Tuyến'));if(marked.length>3){marked.sort((a,b)=>r.effect(u,a,'Hừng Tuyến').duration-r.effect(u,b,'Hừng Tuyến').duration||r.effect(u,a,'Hừng Tuyến').order-r.effect(u,b,'Hừng Tuyến').order);r.remove(u,marked[0],'Hừng Tuyến');}},
 init(r,u){if(r.asc(u))for(const t of eosKit.order(r,r.enemies()).slice(0,3))eosKit.mark(r,u,t);},
 resolve(r,u,k){return k==='Basic'?{name:'First Light on the Rim',ratio:.8,toughness:30}:k==='Skill'?{name:'Three Roads Toward Dawn',ratio:1.5,splash:.85,blast:true,toughness:60}:{name:'Morning Finds Every Ruin',ratio:2.4,splash:1.3,blast:true,toughness:60,energyCost:120};},
 before(r,u,a){
  if(a.source==='FUA'){
   const candidates=a.recovered.map(x=>r.ctx.enemies[x.index]).filter(t=>r.alive(t)),t=eosKit.order(r,candidates)[0];if(!t)return;
   const enhanced=!!r.state(u).light;r.state(u).light=false;a.enhanced=enhanced;a.primaryTarget=t.index;a.target=t.index;a.targetIndices=[t.index,t.index-1,t.index+1].filter(i=>i>=0&&i<r.ctx.enemies.length);a.targets=a.targetIndices.length;a.ratio=enhanced?1:.7;a.targetRatios={[t.index]:enhanced?1.9:1.3};
   a.targetToughness=Object.fromEntries(a.targetIndices.map(i=>[i,i===t.index?30:15]));a.quangTarget=a.recovered.find(x=>x.index===t.index)?.quangDamage>0?t.index:null;
   if(r.vm(u,4))r.buff(u,u,'Eos VM4',{critDmg:.3},2);
  }else if(['Skill','Ult'].includes(a.source))a.targetToughness=Object.fromEntries(a.targetIndices.map(i=>[i,i===a.primaryTarget?60:30]));
 },
 after(r,u,a,targets){
  if(['Skill','Ult'].includes(a.source)){for(const i of targets)eosKit.mark(r,u,r.ctx.enemies[i]);if(a.source==='Ult')r.state(u).light=true;}
  if(a.source==='FUA'){
   for(const item of a.recovered)r.remove(u,r.ctx.enemies[item.index],'Hừng Tuyến');
   if(r.vm(u,1))eosKit.mark(r,u,r.ctx.enemies[a.primaryTarget],1);
   if(r.vm(u,6))for(const item of a.recovered.filter(x=>x.index!==a.primaryTarget).slice(0,2))r.queue(u,{name:'Eos VM6',source:'Extra',ratio:.8,target:item.index,toughness:0,energy:0},a);
   if(r.asc(u)&&r.once(u,'Eos A3'))r.gain(u,10);
  }
 },
 event(r,u,type,e){
  if(type==='modify'){if(r.vm(u,2)&&e.unit.element==='Quang'&&r.effect(u,e.target,'Hừng Tuyến'))e.resPen+=.1;if(e.unit===u&&r.asc(u)&&e.action.source==='FUA'&&e.action.quangTarget===e.target.index)e.bonus+=.2;}
  if(type==='recover'&&r.effect(u,e.enemy,'Hừng Tuyến')){const s=r.state(u),item={index:e.enemy.index,quangDamage:e.quangDamage||0};if(s.recoveryChain===e.chain&&s.pendingRecovery){s.pendingRecovery.recovered.push(item);return;}s.recoveryChain=e.chain;s.pendingRecovery=r.queue(u,{name:'Daybreak Returns',source:'FUA',recovered:[item],target:e.enemy.index,toughness:30},{actor:u.index,chain:e.chain});}
 }
};
