export const artemisKit={
 minor:{crit:.104,critDmg:.12,elementDamage:.078},
 resolve(r,u,k){const s=r.state(u),enhanced=(s.gold||0)>0;return k==='Basic'?{name:enhanced?'Moontrace: Full Draw':'Moontrace',ratio:enhanced?3:1.3,enhanced,trueDamage:enhanced&&!!s.trueNext}:k==='Skill'?{name:'Gilded Draw',support:true}:{name:'Where the Moon Points',support:true,energyCost:130};},
 before(r,u,a){const s=r.state(u);if(a.source==='Basic'){if(s.lastTarget!==undefined&&s.lastTarget!==a.primaryTarget)s.hunt=0;s.lastTarget=a.primaryTarget;a.free=!!(a.enhanced&&(s.hunt||0)>=3);a.hunt=s.hunt||0;a.fullGold=(s.gold||0)>=3;}},
 after(r,u,a,targets){const s=r.state(u);
  if(a.ability==='Skill'){s.gold=Math.min(3,(s.gold||0)+(r.vm(u,1)?3:2));r.buff(u,u,'Truy Nguyệt',{},3);if(r.asc(u)&&(s.trueTurn===undefined||u.turn-s.trueTurn>=3)){s.trueTurn=u.turn;s.trueNext=true;}}
  if(a.ability==='Ult'){for(const t of r.enemies())r.remove(u,t,'Nguyệt Tiêu');r.buff(u,r.ctx.enemies[a.primaryTarget],'Nguyệt Tiêu',{},2,{debuff:true});s.gold=Math.min(3,(s.gold||0)+2);r.advance(u,.25);}
  if(a.source==='Basic'&&a.enhanced){
   s.trueNext=false;if(a.free)s.hunt=r.vm(u,6)?1:0;else{s.gold=Math.max(0,s.gold-1);s.hunt=Math.min(3,(s.hunt||0)+1);if(s.hunt===3&&r.vm(u,2))r.advance(u,1);}
   for(const i of targets){const t=r.ctx.enemies[i];if(r.effect(u,t,'Nguyệt Tiêu')){r.queue(u,{name:'Where the Moon Points · Arrow',source:'Extra',damageSource:'Basic',ratio:r.vm(u,2)?1.1:.8,target:i,toughness:0,energy:0},a);if(r.asc(u)&&r.once(u,'Artemis A3'))r.gain(u,5);}}
   if(r.vm(u,4))for(const [index,value] of Object.entries(a.damageByTarget||{}))for(const i of [Number(index)-1,Number(index)+1])if(r.alive(r.ctx.enemies[i]))r.queue(u,{name:'Artemis VM4',source:'Extra',flat:value*.1,trueDamage:true,target:i,toughness:0,energy:0},a);
  }
 },
 event(r,u,type,e){if(type!=='modify'||e.unit!==u)return;const a=e.action,s=r.state(u),mark=!!r.effect(u,e.target,'Nguyệt Tiêu');if((a.damageSource||a.source)==='Basic'){if(mark)e.vulnerability+=.18;if(s.lastTarget===e.target.index)e.bonus+=.07*(a.hunt??s.hunt??0);}
  if(a.source==='Basic'&&a.enhanced){e.crit+=.2;if(r.effect(u,u,'Truy Nguyệt'))e.critDmg+=.25;if(a.free)e.critDmg+=.3;if(r.asc(u)&&e.target.hp>=e.target.maxHP*.5)e.bonus+=.12;if(r.vm(u,1)&&a.fullGold)e.bonus+=.15;if(mark&&r.vm(u,2))e.pen+=.15;if(mark&&r.vm(u,6))e.resPen+=.2;}
 }
};
