import {normalizeElement} from '../formulas.mjs';
export const amphitriteKit={
 minor:{speed:8,hit:.18,energy:.04},
 attempt(r,u,a){const s=r.state(u);if((s.song||0)<3||s.lastWhale===u.turn)return;s.lastWhale=u.turn;s.song=0;r.queue(u,{name:"Leviathan's Answer",source:'FUA',ratio:r.vm(u,6)?1.6:1,aoe:true},a);},
 resolve(r,u,k){return k==='Basic'?{name:'Pearl on the Current',ratio:.7}:k==='Skill'?{name:'A Whale Beneath the Glass Sea',ratio:.95,aoe:true}:{name:'Crown of the Boundless Sea',support:true,needsRecipient:true,otherRecipient:true,energyCost:140};},
 after(r,u,a,targets){const s=r.state(u);
  if(a.source==='Skill'){let n=0;for(const i of targets){const t=r.ctx.enemies[i];if(r.debuff(u,t,'Thủy Áp',2,a)){r.buff(u,t,'Thủy Áp',{defReduction:r.asc(u)?.18:.15,vulnerability:r.vm(u,1)?.05:0},2,{debuff:true});n++;}}if(r.asc(u)&&n>=3)r.gain(u,5);if(r.vm(u,1)&&targets.size>=3)s.song=Math.min(3,(s.song||0)+1);}
  if(a.ability==='Ult'){const t=r.ctx.units[a.recipient],water=normalizeElement(t.element)==='Thủy';r.buff(u,t,'Vua Biển Cả',{SkillDamage:r.vm(u,2)?.4:.3,FUADamage:r.vm(u,2)?.4:.3,critDmg:water?.2:0},2,{scoped:{resPen:water&&r.asc(u)?.12:0}});r.advance(t,.5);if(r.vm(u,4))r.buff(u,u,'Amphitrite VM4',{speed:12,hit:.2},2);}
  if(a.source==='FUA'){if(r.asc(u)&&(s.refundTurn===undefined||u.turn-s.refundTurn>=2)){s.refundTurn=u.turn;r.planck(u,1);}if(r.vm(u,6))for(const t of r.allies())if(r.effect(u,t,'Vua Biển Cả')){r.advance(t,.2);if(normalizeElement(t.element)==='Thủy')r.buff(u,t,'Amphitrite VM6',{},null,{consume:'damage',scoped:{resPen:.2}});}}
 },
 observe(r,u,{unit:t,action:a,targets}){if(!r.attack(a)||targets.size<2||t===u&&a.source==='FUA')return;const king=!!r.effect(u,t,'Vua Biển Cả'),water=normalizeElement(t.element)==='Thủy',n=(water?(king&&r.vm(u,2)?2:1):0)+(king?1:0);r.state(u).song=Math.min(3,(r.state(u).song||0)+n);amphitriteKit.attempt(r,u,a);},
 event(r,u,type,e){if(type==='turnStart'&&e.unit===u)amphitriteKit.attempt(r,u,{actor:u.index});if(type==='modify'&&e.unit!==undefined){const next=r.effect(u,e.unit,'Amphitrite VM6');if(next&&!r.effect(u,e.unit,'Vua Biển Cả'))r.remove(u,e.unit,'Amphitrite VM6');}},
 sync(r,u){for(const t of r.allies())if(r.effect(u,t,'Amphitrite VM6')&&!r.effect(u,t,'Vua Biển Cả'))r.remove(u,t,'Amphitrite VM6');}
};
