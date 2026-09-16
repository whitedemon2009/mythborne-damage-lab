export const arenKit={
 minor:{crit:.104,elementDamage:.078,atk:.12},
 resolve(r,u,k,input){const s=r.state(u),enhanced=k==='Skill'&&(s.pressure||0)>0;return k==='Basic'?{name:'First Measure',ratio:.9}:k==='Ult'?{name:'Limit Release',ratio:1.8,energyCost:120}:{name:enhanced?'Breakpoint: Overdrive':'Breakpoint',ratio:enhanced?3.2:2.1,enhanced,efficiency:enhanced?.3:0,consumedStacks:enhanced&&!(r.vm(u,6)&&s.freePressure)};},
 before(r,u,a){const s=r.state(u);if(s.target!==a.target){s.focus=0;s.target=a.target;s.previousSkill=false;}if(a.source==='Skill'){if(s.previousSkill)s.focus=Math.min(r.vm(u,2)?4:3,(s.focus||0)+1);s.previousSkill=true;}},
 after(r,u,a){const s=r.state(u);if(a.source==='Ult'){s.pressure=2;s.freePressure=r.vm(u,6);}if(a.source==='Skill'&&a.enhanced){if(s.freePressure)s.freePressure=false;else s.pressure--;if(r.asc(u))r.buff(u,u,'A2',{atk:.15},1);if(r.vm(u,4))r.buff(u,u,'VM4',{atk:.2},2);}},
 event(r,u,type,e){if(type!=='modify'||e.unit!==u)return;const a=e.action;if(a.ability==='Skill'){e.bonus+=(r.state(u).focus||0)*.08;if(e.target.toughness>0){if(r.asc(u))e.efficiency+=.15;if(r.vm(u,1)&&a.enhanced)e.efficiency+=.15;}if(r.asc(u)&&a.source==='Break')e.breakBonus+=.3;}}
};
