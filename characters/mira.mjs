export const miraKit={
 requiresCrit:true,minor:{crit:.104,critDmg:.12,elementDamage:.078},
 init(r,u){r.state(u).adjustment=r.asc(u)?1:0;},
 sync(r,u){if(r.vm(u,4))r.buff(u,u,'VM4',{atk:(r.state(u).adjustment||0)>0?.12:0});},
 resolve(r,u,k){const s=r.state(u),n=s.adjustment||0,enhanced=(s.precision||0)>=2,used=n-(r.vm(u,6)&&enhanced&&n>0?1:0);return k==='Basic'?{name:'Count One',ratio:.9}:k==='Ult'?{name:'No Second Take',ratio:2.5,energyCost:120}:{name:'Clean Cut',ratio:2.15,enhanced,usedAdjustment:used,heldAdjustment:n,bonus:enhanced?.25:0,consumedStacks:used>0||enhanced};},
 before(r,u,a){if(a.source==='Skill'){r.state(u).adjustment-=a.usedAdjustment;if(a.enhanced)r.state(u).precision=0;}},
 after(r,u,a){const s=r.state(u);if(a.source==='Basic')s.adjustment=Math.min(2,(s.adjustment||0)+1);if(a.source==='Ult'&&a.actualCrit){r.buff(u,u,'No Second Take',{critDmg:.2},2);if(r.asc(u))s.adjustment=Math.min(2,(s.adjustment||0)+1);}},
 event(r,u,type,e){if(e.unit!==u)return;const a=e.action;if(type==='modify'&&a.source==='Skill'){e.crit+=(a.usedAdjustment||0)*.12;e.critDmg+=(r.asc(u)?(a.heldAdjustment||0)*.04:0)+(r.vm(u,1)?(a.usedAdjustment||0)*.05:0);}if(type==='hit'&&e.crit&&e.amount>0){a.actualCrit=true;r.state(u).precision=Math.min(2,(r.state(u).precision||0)+1+(a.source==='Skill'&&r.vm(u,2)?1:0));}}
};
