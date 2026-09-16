import {normalizeElement} from '../formulas.mjs';
export const prometheusKit={
 minor:{hit:.18,elementDamage:.078,atk:.12},
 init(r,u){r.state(u).embers=r.asc(u)?10:0;},
 resolve(r,u,k){const n=r.state(u).embers||0,enhanced=n>=50;return k==='Basic'?{name:'Ash Without Permission',ratio:.85}:k==='Skill'?{name:enhanced?'Steal Another Spark: Unbound Flame':'Steal Another Spark',ratio:enhanced?3:.75+.2*Math.floor(n/10),splash:enhanced?1.6:.4+.1*Math.floor(n/10),blast:true,enhanced,forceCrit:r.asc(u),bonus:enhanced?(r.vm(u,1)?.2:0)+(r.vm(u,6)?.4:0):0}:{name:'Let Them Come Closer to the Fire',ratio:1,aoe:true,energyCost:130};},
 after(r,u,a,targets){const s=r.state(u);
  if(a.source==='Skill'){
   for(const i of targets){const t=r.ctx.enemies[i];r.dot(u,t,'Long Diệm',.35,2,a);}
   if(a.enhanced){for(const i of targets){const t=r.ctx.enemies[i],d=t.dots.find(d=>d.owner===u.index&&d.name==='Long Diệm');if(d){r.tick(u,t,d,1,a);if(r.vm(u,6))r.tick(u,t,d,.8,a);}}s.embers=0;}else s.embers=Math.min(50,(s.embers||0)+10);
  }
  if(a.source==='Ult')for(const i of targets){const t=r.ctx.enemies[i];if(r.debuff(u,t,'Hỏa Khế',2,a))r.buff(u,t,'Hỏa Khế',{damage:-.15},2,{debuff:true});r.delay(t,-.25);}
 },
 event(r,u,type,e){
  if(type==='modify'){
   if(normalizeElement(e.unit.element)==='Hỏa'&&r.effect(u,e.target,'Hỏa Khế'))e.resPen+=.12;
   if(e.unit!==u)return;
   if(e.action.source==='Skill'&&r.asc(u))e.stats.critDmg=.5*r.eff(u).hit;
   if(e.action.source==='DoT'&&e.action.effectName==='Long Diệm'){
    const n=r.state(u).embers||0;e.bonus+=n*(r.vm(u,1)?.04:.03);
    if(r.asc(u)&&new Set(e.target.dots.map(d=>d.name)).size>=2)e.pen+=.1;
    if(r.vm(u,2)&&e.action.external)e.pen+=.18;
    if(r.vm(u,2)&&e.action.triggerCharacter===u.characterId&&e.action.triggerEnhanced)e.bonus+=.3;
    if(r.vm(u,4)&&n>=25){e.action.allowDotCrit=true;e.stats.crit=.2;e.stats.critDmg=n/100;}
   }
  }
  if(type==='after'&&e.unit===u&&e.action.source==='DoT'&&e.action.effectName==='Long Diệm'&&e.action.external){const s=r.state(u);if(s.dotScope!==e.action.uid){s.dotScope=e.action.uid;s.dotGains=0;}if(s.dotGains<6){s.dotGains+=2;s.embers=Math.min(50,(s.embers||0)+2);}}
 }
};
