import {normalizeElement} from '../formulas.mjs';
export const hephaestusKit={
 minor:{speed:8,hit:.18,energy:.04},
 battleRules(u,rules){if(u.kitAscensions!==false){rules.cap=Math.max(rules.cap,8);rules.initial=Math.max(rules.initial,6);}if((u.kitFate||0)>=4)rules.cap=Math.max(rules.cap,9);},
 sync(r,u){if(r.asc(u))for(const t of r.allies())r.buff(u,t,'Phế Liệu',{atk:(r.state(u).scrap||0)*.05});},
 resolve(r,u,k){return k==='Basic'?{name:'First Spark',ratio:.7}:k==='Skill'?{name:'Temper the Fault',ratio:1.2}:{name:'The Forge Gives Back',support:true,energyCost:130};},
 after(r,u,a,targets){const s=r.state(u);if(a.ability==='Basic'&&r.asc(u))r.gain(u,15);if(a.ability==='Skill'){for(const i of targets){const t=r.ctx.enemies[i];if(r.debuff(u,t,'Vết Nứt Nhiệt',2,a)){r.buff(u,t,'Vết Nứt Nhiệt',{},2,{debuff:true});r.ctx.gear.dispatch('debuff',{unit:u,target:t,action:a});}}for(const t of r.allies())r.buff(u,t,'Phôi Rèn',{},2);}
  if(a.ability==='Ult'){const overflow=Math.min(3,Math.max(0,r.planckCount()+3-r.planckCap()));r.planck(u,3);for(const t of r.allies()){r.buff(u,t,'The Forge Gives Back',{atk:.2,SkillDamage:overflow*.06},2);if(r.vm(u,1))r.buff(u,t,'VM1',{},2);}if(r.vm(u,6)){s.greatSmith=3;r.buff(u,u,'Đại Rèn',{},2);}}
 },
 observe(r,u,{unit:t,action:a}){if(a.ability!=='Skill'||a.cost<=0)return;const s=r.state(u);s.scrap=Math.min(6,(s.scrap||0)+a.cost);
  if(s.scrap>=4&&u.turn>=(s.nextRefundTurn||0)&&r.planckCount()<r.planckCap()){s.scrap-=4;s.nextRefundTurn=u.turn+2;r.planck(u,1);r.buff(u,t,'Thiên Phú · Chiến Kĩ kế tiếp',{},null,{scoped:{bonus:.1},sources:['Skill'],consume:'damage'});if(r.vm(u,6)&&r.once(u,'Đại Rèn ưu tiên '+t.index))r.advance(t,.12);}
  if(r.vm(u,6)&&r.effect(u,u,'Đại Rèn')&&s.greatSmith>0){s.greatSmith--;r.planck(u,1);}
 },
 event(r,u,type,e){if(type!=='modify')return;const fire=normalizeElement(e.unit.element)==='Hỏa',crack=r.effect(u,e.target,'Vết Nứt Nhiệt');if(fire&&crack)e.resPen+=r.vm(u,2)?.15:.1;if(fire&&r.vm(u,1)&&r.effect(u,e.unit,'VM1'))e.resPen+=.24;if(e.action.source==='Skill'&&crack){if(r.effect(u,e.unit,'Phôi Rèn'))e.bonus+=.12;if(r.vm(u,2))e.critDmg+=.15;}}
};
