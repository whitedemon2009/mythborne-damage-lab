export const rowanKit={
 minor:{crit:.104,elementDamage:.078,atk:.12},
 sync(r,u){if(r.vm(u,4))r.buff(u,u,'VM4',{atk:r.enemies().length>=4?.15:0});for(const t of r.enemies())r.triumph(u)?r.buff(u,t,'Khải Hoàn Kháng Hiệu Ứng',{resist:-.5},null,{debuff:true}):r.remove(u,t,'Khải Hoàn Kháng Hiệu Ứng');},
 resolve(r,u,k){return k==='Basic'?{name:'Open Current',ratio:.8}:k==='Skill'?{name:'Wide Arc',ratio:1.2,aoe:true,cost:r.state(u).free?0:1,bonus:r.asc(u)&&r.enemies().length>=4?.12:0}:{name:'Full Spread',ratio:1.65,aoe:true,energyCost:r.asc(u)?110:120,bonus:Math.min(4,Math.max(0,r.enemies().length-1))*(r.vm(u,2)?.12:.1)};},
 before(r,u,a){if(a.source==='Skill')r.state(u).free=false;},
 after(r,u,a,targets){if(targets.size>=4){r.buff(u,u,'Crowd Pressure',{atk:.18},1);if(r.asc(u))r.gain(u,5);if(a.source==='Ult'&&r.vm(u,6))r.state(u).free=true;}},
 event(r,u,type,e){if(type==='modify'&&e.unit===u&&e.action.source==='Skill'&&r.vm(u,1)&&e.count>=3)e.bonus+=.08;}
};
