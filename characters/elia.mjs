export const eliaKit={
 minor:{speed:8,elementDamage:.078,atk:.12},
 marked(r,u){return r.enemies().filter(t=>r.effect(u,t,'Dấu Lướt'));},
 sync(r,u){if(r.vm(u,4))r.buff(u,u,'VM4',{atk:eliaKit.marked(r,u).length>=2?.12:0});},
 resolve(r,u,k){const enhanced=eliaKit.marked(r,u).length>=(r.vm(u,6)?2:3);return k==='Basic'?{name:'Passing Note',ratio:.85}:k==='Ult'?{name:'All at Once',ratio:1.7,splash:.95,blast:true,energyCost:115}:{name:enhanced?'Crossline: Sweep':'Crossline',ratio:enhanced?1.9:1.35,splash:enhanced?1.1:.75,blast:true,enhanced,cost:enhanced&&r.asc(u)?0:1,efficiency:enhanced&&r.asc(u)?.2:0,consumedStacks:enhanced};},
 after(r,u,a){const t=r.ctx.enemies[a.primaryTarget];if(a.source==='Skill'){if(a.enhanced){for(const target of r.ctx.enemies)r.remove(u,target,'Dấu Lướt');if(r.vm(u,2))r.buff(u,t,'Dấu Lướt',{},null,{debuff:true});}else r.buff(u,t,'Dấu Lướt',{},null,{debuff:true});}if(a.source==='Ult')for(const target of r.enemies().filter(t=>!r.effect(u,t,'Dấu Lướt')).slice(0,2))r.buff(u,target,'Dấu Lướt',{},null,{debuff:true});},
 event(r,u,type,e){if(type==='modify'&&e.unit===u&&r.effect(u,e.target,'Dấu Lướt')){if(r.asc(u))e.bonus+=.08;if(r.vm(u,1))e.vulnerability+=.05;}}
};
