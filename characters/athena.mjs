export const athenaKit={
 minor:{crit:.104,critDmg:.12,elementDamage:.078},
 resolve(r,u,k,input){const s=r.state(u);return k==='Basic'?{name:'Crimson Oath',ratio:1.3}:k==='Skill'?{name:'Twin Decree',ratio:2.75,bonus:s.basicSinceSkill?.25:0,cost:input.athenaExtra?0:1}:{name:'Red Sky, Unbowed',ratio:4.3,energyCost:105,decrees:!!(s.sword&&s.order)};},
 before(r,u,a){const s=r.state(u);if(['Basic','Skill','Ult'].includes(a.source)){a.switched=!!s.previous&&s.previous!==a.source;if(a.switched&&r.asc(u))a.bonus+=.12;a.athenaKills=0;}},
 after(r,u,a){const s=r.state(u),p=r.effect(u,u,'Pallas');
  if(p&&r.vm(u,2)&&['Basic','Skill','Ult'].includes(a.source)){s.pallasUsed??=new Set();s.pallasUsed.add(a.source);if(s.pallasUsed.size===3&&!s.extended){p.duration++;s.extended=true;}}
  if(a.source==='Basic'){s.sword=true;s.basicSinceSkill=true;}
  if(a.source==='Skill'){if(s.basicSinceSkill)r.gain(u,8);s.basicSinceSkill=false;s.order=true;r.buff(u,u,'Twin Decree',{crit:.1},2);if(r.vm(u,1)){s.sword=true;const n=Math.min(2,(r.effect(u,u,'Athena VM1')?.count||0)+1);r.buff(u,u,'Athena VM1',{speedPct:.25*n},2,{count:n});}}
  if(a.source==='Ult'){s.triumph=true;if(a.decrees)r.advance(u,.4);}
  if(a.switched&&a.athenaKills&&r.vm(u,4))r.gain(u,5);
  if(r.attack(a))s.previous=a.source;
  if(s.sword&&s.order&&s.triumph){s.sword=s.order=s.triumph=false;s.pallasUsed=new Set();s.extended=false;r.buff(u,u,'Pallas',{crit:.18,critDmg:.3,pierce:.12},2);if(r.asc(u)){r.planck(u,1);r.gain(u,10);}const t=r.enemies().sort((a,b)=>b.hp-a.hp)[0];if(t)r.queue(u,{name:'Victory Wastes Nothing',ratio:2,target:t.index,damageSource:'Ult'},a);if(r.vm(u,6))r.ctx.extraTurn(u,{kitAction:'Skill',athenaExtra:true,target:t?.index??0});}
 },
 event(r,u,type,e){if(e.unit!==u)return;const a=e.action;
  if(type==='modify'){if(r.vm(u,6))e.resPen+=.2;if(a.carryDamage!==undefined){if(a.firstCarry&&r.asc(u))e.pen+=.15;}if(a.decrees){e.crit+=.2;e.critDmg+=.3;}if(a.switched&&r.vm(u,4))e.critDmg+=.2;if(r.effect(u,u,'Pallas')&&r.vm(u,2)&&['Basic','Skill','Ult'].includes(a.damageSource||a.source))e.pen+=.15;}
  if(type==='hit'&&e.calculated>=e.target.hp){a.athenaKills=(a.athenaKills||0)+1;if(e.calculated<=e.target.hp||!e.defResFactor)return;const candidates=r.enemies().filter(t=>t!==e.target),t=candidates[Math.floor(r.ctx.random()*candidates.length)];if(t)r.queue(u,{name:'Victory Wastes Nothing — Carry',source:'Extra',damageSource:a.damageSource||a.source,carryDamage:(e.calculated-e.target.hp)/e.defResFactor,firstCarry:!a.carryDamage&&r.once(u,'Athena first carry',a.uid),target:t.index,energy:0,toughness:0,noCrit:true,auxiliary:true},a);}
 }
};
