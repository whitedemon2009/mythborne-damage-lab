import {normalizeElement} from '../formulas.mjs';
export const nadiaKit={
 minor:{hit:.18,elementDamage:.078,atk:.1},
 resolve(r,u,k){return k==='Basic'?{name:'Small Kindling',ratio:.75}:k==='Skill'?{name:'Lingering Mark',ratio:.9}:{name:'Burn Through',ratio:.75,aoe:true,energyCost:110};},
 after(r,u,a,targets){
  if(['Skill','Ult'].includes(a.source))for(const i of targets){const t=r.ctx.enemies[i],old=t.dots.find(d=>d.name==='Vết Cháy'&&d.owner===u.index),duration=2+(a.source==='Skill'&&r.vm(u,2)&&r.debuffs(t).length>=2?1:0);if(a.source==='Ult'&&old)r.tick(u,t,old,r.vm(u,6)?1:r.asc(u)?.7:.5,a);if(r.dot(u,t,'Vết Cháy',r.vm(u,1)?.7:.6,duration,a)&&a.source==='Skill'&&r.asc(u))r.gain(u,4);}
  if(r.triumph(u)&&['Basic','Skill','Ult'].includes(a.source))for(const i of targets){const t=r.ctx.enemies[i];r.triggerDots(u,t,{multiplier:1,predicate:d=>d.owner===u.index},a);}
 },
 event(r,u,type,e){if(type!=='modify')return;if(r.vm(u,4)&&normalizeElement(e.unit.element)==='Hỏa')e.resPen+=.1;if(e.unit===u&&e.action.effectName==='Vết Cháy'){if(r.debuffs(e.target).length>=2)e.bonus+=.2;if(r.asc(u)&&e.target.toughness===0)e.bonus+=.15;}}
};
