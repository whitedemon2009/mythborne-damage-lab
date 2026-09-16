import {normalizeElement} from '../formulas.mjs';
export const hadesKit={
 minor:{hit:.18,elementDamage:.1,speed:8},
 record(r,u,t,a){const dots=t.dots.filter(d=>d.name!=='Chết Chóc');if(!dots.length||!r.alive(t))return;const value=dots.reduce((n,d)=>n+r.dotValue(t,d),0)*((r.asc(u)?.9:.8)+(r.vm(u,2)?.2:0));t.dots=t.dots.filter(d=>d.name!=='Chết Chóc');t.dots.push({name:'Chết Chóc',owner:u.index,action:{ratio:0,flat:value,scaling:'atk',bonus:0},duration:2,stacks:1,row:a.row,nextBonus:r.vm(u,2)?Math.min(.2,new Set(dots.map(d=>d.name)).size*.05):0});},
 sync(r,u){if(r.vm(u,4))for(const t of r.enemies())r.buff(u,t,'Hades VM4',{},null,{incoming:{vulnerability:.35},sources:['DoT'],debuff:true});},
 resolve(r,u,k){return k==='Basic'?{name:'Last Courtesy',ratio:.85}:k==='Skill'?{name:'No One Leaves Twice',ratio:1.1,splash:.6,blast:true}:{name:'The Kingdom Beneath Every Name',ratio:1.2,aoe:true,energyCost:140,refund:1};},
 before(r,u,a){if(['Basic','Skill','Ult'].includes(a.source)){a.manyDots=r.enemies().some(t=>t.dots.length>=3&&(a.source!=='Skill'||a.targetIndices.includes(t.index)));for(const t of r.enemies())hadesKit.record(r,u,t,a);}},
 after(r,u,a,targets){
  if(a.source==='Skill'){for(const i of targets){const t=r.ctx.enemies[i];if(r.debuff(u,t,'Mộ Chí',2,a))r.buff(u,t,'Mộ Chí',{},2,{incoming:{vulnerability:.18},sources:['DoT'],debuff:true});}if(r.asc(u)&&a.manyDots&&r.once(u,'Hades A3'))r.gain(u,8);}
  if(['Basic','Skill'].includes(a.source))for(const t of r.enemies()){const d=t.dots.find(d=>d.owner===u.index&&d.name==='Chết Chóc');if(d)r.tick(u,t,d,1,a);}
  if(a.source==='Skill'&&r.vm(u,1))for(const t of r.enemies())for(const d of [...t.dots])r.tick(u,t,d,.65,a);
  if(a.source==='Ult')for(let n=0;n<(r.vm(u,6)?3:2);n++)for(const t of r.enemies())for(const d of [...t.dots])r.tick(u,t,d,1,a);
 },
 event(r,u,type,e){
  if(type==='modify'){
   if(normalizeElement(e.unit.element)==='Ám'&&r.effect(u,e.target,'Mộ Chí'))e.resPen+=.12;
   if(e.unit===u&&e.action.effectName==='Chết Chóc'){const d=e.target.dots.find(d=>d.owner===u.index&&d.name==='Chết Chóc');e.bonus+=d?.nextBonus||0;if(r.asc(u)&&r.effect(u,e.target,'Mộ Chí'))e.pen+=.1;}
  }
  if(type==='after'&&e.unit===u&&e.action.effectName==='Chết Chóc')for(const i of e.targets){const d=r.ctx.enemies[i].dots.find(d=>d.owner===u.index&&d.name==='Chết Chóc');if(d)d.nextBonus=0;}
  if(type==='debuff'&&e.unit!==u&&r.vm(u,1)&&e.action?.source==='DoT'&&r.once(u,'Hades VM1 '+e.target.index))hadesKit.record(r,u,e.target,e.action);
  if(type==='breakResolved'&&normalizeElement(e.unit.element)==='Ám'){if(r.asc(u))hadesKit.record(r,u,e.target,e.action);if(r.vm(u,6)){const d=e.target.dots.find(d=>d.owner===u.index&&d.name==='Chết Chóc');if(d)r.tick(u,e.target,d,1,e.action);}}
 }
};
