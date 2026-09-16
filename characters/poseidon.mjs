export const poseidonKit={
 minor:{crit:.104,critDmg:.16,elementDamage:.1},
 gainTide(r,u,n,a){const s=r.state(u),cap=r.vm(u,1)?4:5;s.tide=Math.min(cap,(s.tide||0)+n);if(s.tide===cap&&!r.effect(u,u,'Cực Triều')){s.wasExtreme=true;s.extremeDynasty=!!r.effect(u,u,'Vương Triều');r.remove(u,u,'Nước Rút');r.buff(u,u,'Cực Triều',{},2);if(r.asc(u))r.gain(u,15);if(a?.source==='Skill'&&!a.enhanced)r.advance(u,1);}},
 sync(r,u){const s=r.state(u),extreme=r.effect(u,u,'Cực Triều');if(s.wasExtreme&&!extreme){s.wasExtreme=false;s.tide=r.vm(u,6)?2:0;r.buff(u,u,'Nước Rút',{},2);}const rising=!extreme&&!r.effect(u,u,'Nước Rút');r.buff(u,u,'Triều Thế',{SkillDamage:(r.vm(u,4)?.25:0)+(rising?(s.tide||0)*.05:0),efficiency:rising?(s.tide||0)*.03:0});},
 resolve(r,u,k){const enhanced=!!r.effect(u,u,'Cực Triều');return k==='Basic'?{name:'Low Tide',ratio:1.1}:k==='Skill'?{name:enhanced?'Sea Rises: Sovereign Tide':'Sea Rises',ratio:enhanced?3.2:1.8,splash:enhanced?2:1,blast:true,enhanced,pen:enhanced?.18:0}:{name:'The Sea Has No Shore',ratio:3.6,splash:1.7,blast:true,energyCost:140};},
 before(r,u,a){a.wasExtreme=!!r.effect(u,u,'Cực Triều');if(r.vm(u,4)&&['Basic','Skill','Ult','FUA','Extra'].includes(a.source))a.damageSource='Skill';},
 after(r,u,a,targets){const s=r.state(u);
  if(a.source==='Basic'&&!r.effect(u,u,'Nước Rút'))poseidonKit.gainTide(r,u,1,a);
  if(a.source==='Skill'){if(!a.enhanced&&!r.effect(u,u,'Nước Rút'))poseidonKit.gainTide(r,u,2,a);if(a.enhanced&&r.vm(u,2))s.undertowExtra=true;if(a.enhanced&&r.vm(u,6)&&s.extremeDynasty)r.advance(u,.25);}
  if(a.source==='Ult'){r.remove(u,u,'Nước Rút');poseidonKit.gainTide(r,u,3,a);if(a.wasExtreme){const b=r.effect(u,u,'Cực Triều');if(b)b.duration++;}r.buff(u,u,'Vương Triều',{},2);}
  if(a.source==='FUA'){
   if(r.asc(u)&&targets.size>=3&&(s.refunds||0)<2){s.refunds=(s.refunds||0)+1;r.planck(u,1);}const retreat=r.effect(u,u,'Nước Rút');if(retreat){retreat.duration--;if(retreat.duration<=0){r.remove(u,u,'Nước Rút');if(!r.vm(u,6))poseidonKit.gainTide(r,u,2,a);}if(r.vm(u,6))poseidonKit.gainTide(r,u,2,a);}s.undertowExtra=false;
  }
  if(r.vm(u,1)&&a.wasExtreme&&a.primaryTarget!==undefined&&r.attack(a)){const sum=Object.entries(a.damageByTarget||{}).filter(([i])=>Number(i)!==a.primaryTarget).reduce((n,[,v])=>n+v,0);if(sum)r.queue(u,{name:'Poseidon VM1',source:'Extra',flat:sum*.3,target:a.primaryTarget,toughness:0,energy:0},a);}
  if(r.attack(a))for(const i of targets){const b=r.effect(u,r.ctx.enemies[i],'Ngập Triều');if(b)b.previous=a.source;}
 },
 observe(r,u,{unit:t,action:a,targets}){if(t===u||!r.attack(a)||targets.size<2||!r.effect(u,u,'Nước Rút')||!r.once(u,'Undertow'))return;const extra=!!r.state(u).undertowExtra;r.queue(u,{name:'Undertow',source:'FUA',ratio:1.4+(extra?1.2:0),splash:.8+(extra?.6:0),blast:true,target:a.primaryTarget??a.target},a);},
 event(r,u,type,e){const s=r.state(u);
  if(type==='breakResolved'&&e.unit===u){r.breakHit(u,e.target,e.action);r.delay(e.target,.15);r.buff(u,e.target,'Ngập Triều',{},2,{debuff:true});}
  if(type==='death'&&e.unit.side==='enemy'&&e.unit.lastDamageActor===u.index&&r.asc(u)){s.kills=(s.kills||0)+1;if(s.kills%3===0&&(s.extensions||0)<2){const b=r.effect(u,u,'Cực Triều');if(b){b.duration++;s.extensions=(s.extensions||0)+1;}}}
  if(type==='modify'&&e.unit===u){const a=e.action;if(a.source==='Skill'&&a.enhanced){e.crit+=.2;if(r.vm(u,6)&&s.extremeDynasty)e.resPen+=.2;}if(a.source==='FUA'&&r.asc(u))e.crit+=.15;if(r.effect(u,u,'Vương Triều')&&(a.source==='FUA'||a.source==='Skill'&&a.enhanced))e.bonus+=.55;const b=r.effect(u,e.target,'Ngập Triều');if(b&&b.previous&&b.previous!==a.source)e.bonus+=.08;}
 }
};
