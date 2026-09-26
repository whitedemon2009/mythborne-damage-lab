import {normalizeElement} from '../formulas.mjs';
export const kaelKit={
 minor:{crit:.08,elementDamage:.078,atk:.12},
 resolve(r,u,k){return k==='Basic'?{name:'Zeroing Shot',ratio:.9}:k==='Skill'?{name:'Target Lock',ratio:2}:{name:'Dead Center',ratio:3,energyCost:110};},
 sync(r,u){
  if(r.vm(u,4))r.buff(u,u,'VM4',{atk:r.enemies().some(t=>r.effect(u,t,'Nòng Súng'))?.12:0});
  const elemental=r.ctx.units.every(t=>['Hỏa','Lôi'].includes(normalizeElement(t.element)));
  for(const t of r.enemies())elemental?r.buff(u,t,'Khải Hoàn Kháng',{HỏaResReduction:.24,LôiResReduction:.24},null,{debuff:true}):r.remove(u,t,'Khải Hoàn Kháng');
  const old=r.effect(u,u,'Khải Hoàn Tấn Công')?.mods.atkFlat||0,own=r.eff(u).atk-old;
  const highest=Math.max(own,...r.ctx.units.filter(t=>t!==u).map(t=>r.eff(t).atk));
  r.buff(u,u,'Khải Hoàn Tấn Công',{atkFlat:highest*.5});
 },
 after(r,u,a,targets){const s=r.state(u),t=r.ctx.enemies[a.target],marked=a.kaelMarked;if(marked&&r.attack(a)){if(r.asc(u))r.gain(u,5);if(['Skill','Ult'].includes(a.source))s.fire=Math.min(r.asc(u)?4:3,(s.fire||0)+1+(a.source==='Ult'&&r.vm(u,2)?1:0));}
  if(a.source==='Skill'&&targets.has(a.target)){if(!r.effect(u,t,'Nòng Súng'))s.fire=0;for(const enemy of r.ctx.enemies)r.remove(u,enemy,'Nòng Súng');r.buff(u,t,'Nòng Súng',{},2,{debuff:true});}
  if(a.source==='Ult'&&marked)r.buff(u,t,'Nòng Súng',{},2,{debuff:true});
 },
 event(r,u,type,e){if(type==='break'&&r.asc(u)&&r.effect(u,e.target,'Nòng Súng'))r.buff(u,u,'A3',{critDmg:.2},2);if(e.unit!==u)return;const marked=e.target&&r.effect(u,e.target,'Nòng Súng');if(type==='hit'&&marked)e.action.kaelMarked=true;if(type==='modify'&&marked){const stacks=r.state(u).fire||0;e.bonus+=stacks*.06;if(e.action.source==='Ult')e.bonus+=.2;if(r.vm(u,1))e.critDmg+=stacks*.02;if(r.vm(u,6)&&e.action.source==='Ult'&&stacks>=(r.asc(u)?4:3))e.pen+=.05;}}
};
