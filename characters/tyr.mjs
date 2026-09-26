export const tyrKit={
 minor:{def:.18,crit:.08,elementDamage:.1},
 links(r,u){return r.allies().filter(t=>r.effect(u,t,'Chiến Ước'));},
 sync(r,u){const n=tyrKit.links(r,u).length;r.buff(u,u,'Sức Mạnh Chiến Ước',{def:n?(.25+(r.vm(u,2)&&n>=2?.15:0)):0});},
 resolve(r,u,k){return k==='Basic'?{name:'Weight of the Empty Hand',ratio:.7,scaling:'def',toughness:30}:k==='Skill'?{name:'Stand Behind My Verdict',support:true,otherRecipient:true,needsRecipient:true}:{name:'A Kingdom Is Smaller Than Its Oath',ratio:1.6,scaling:'def',aoe:true,toughness:90,energyCost:140};},
 link(r,u,t){const max=r.vm(u,2)?2:1,s=r.state(u);s.linkOrder=(s.linkOrder||[]).filter(i=>r.effect(u,r.ctx.units[i],'Chiến Ước'));if(!s.linkOrder.includes(t.index)&&s.linkOrder.length>=max){const old=s.linkOrder.shift();r.remove(u,r.ctx.units[old],'Chiến Ước');}if(!s.linkOrder.includes(t.index))s.linkOrder.push(t.index);r.buff(u,t,'Chiến Ước',{},3,{saved:false});},
 counter(r,u,target,parent,options={}){const s=r.state(u);if(s.counterTurn!==u.turn){s.counterTurn=u.turn;s.counters=0;}if(!options.noConsume&&s.counters>=2)return false;if(!options.noConsume)s.counters++;const linked=new Set(tyrKit.links(r,u).map(t=>t.index)),relevant=new Set([u.index,...linked]),lost=options.maxExtra?Infinity:[...relevant].reduce((n,i)=>n+(parent.lostByUnit?.[i]||0),0),shield=r.vm(u,1)?[...relevant].reduce((n,i)=>n+(parent.shieldLostByUnit?.[i]||0),0):0,extra=options.maxExtra?1.8*r.eff(u).def:Math.min(1.8*r.eff(u).def,.5*(lost+shield)),linkedWasTarget=[...parent.targets||[]].some(i=>linked.has(i));r.queue(u,{name:'The Price of a Broken Word',source:'Counter',scaling:'def',ratio:2.2,splash:1.1,blast:true,target:target.index,toughness:60,linkedWasTarget,bonus:options.bonus||0,phases:[{ratio:1.1,targetRatios:{[target.index]:2.2}},{ratio:0,flat:extra,targetIndices:[target.index],targetRatios:null,splash:0,toughness:0}]},parent);return true;},
 forceCounter(r,u,target,parent,options={}){return tyrKit.counter(r,u,target,parent,options);},
 after(r,u,a,targets){if(a.ability==='Skill'){tyrKit.link(r,u,r.ctx.units[a.recipient]);r.allySkill(u,r.ctx.units[a.recipient],a);}if(a.ability==='Ult')for(const i of targets)r.buff(u,r.ctx.enemies[i],'Kẻ Bội Ước',{},2,{debuff:true});if(a.source==='Counter'){const s=r.state(u);if(r.asc(u)){if(s.healTurn!==u.turn){s.healTurn=u.turn;s.heals=0;}if(s.heals<2){s.heals++;r.heal(u,u,0,.1*r.eff(u).def+120,a);}if([...targets].some(i=>r.effect(u,r.ctx.enemies[i],'Kẻ Bội Ước'))){if(s.energyTurn!==u.turn){s.energyTurn=u.turn;s.energyUses=0;}if(s.energyUses<2){s.energyUses++;r.gain(u,5);}}}if(r.vm(u,4))r.buff(u,r.ctx.enemies[a.primaryTarget],'Týr VM4',{damage:-.15},2,{debuff:true});}},
 event(r,u,type,e){const links=tyrKit.links(r,u),target=e.target??e.unit,linked=links.includes(target);
  if(type==='beforeEnemyDamage'){
   if(r.effect(u,e.enemy,'Kẻ Bội Ước')&&(target===u||linked))e.amount*=.85;
   if(linked&&!e.transferred&&r.alive(u)){const ratio=r.asc(u)?.24:.3,amount=e.amount*ratio;e.amount-=amount;e.redirects.push({target:u,amount});}
  }
  if(type==='incomingDamage'&&r.vm(u,6)&&linked){const b=r.effect(u,target,'Chiến Ước');if(b&&!b.saved&&e.damage>=target.currentHP){e.floor=1;b.saved=true;b.savedChain=e.action.chain;}}
  if(type==='enemyAttackEnd'&&r.alive(e.enemy)){const saved=links.find(t=>r.effect(u,t,'Chiến Ước')?.savedChain===e.chain);if(saved){tyrKit.counter(r,u,e.enemy,e,{noConsume:true,maxExtra:true});return;}if(e.targets.has(u.index)||links.some(t=>e.targets.has(t.index))||r.effect(u,e.enemy,'Kẻ Bội Ước'))tyrKit.counter(r,u,e.enemy,e);}
  if(type==='modify'&&e.unit===u&&e.action.source==='Counter'&&e.action.linkedWasTarget&&r.asc(u)&&e.target.index===e.action.primaryTarget)e.pen+=.15;
 }
};
