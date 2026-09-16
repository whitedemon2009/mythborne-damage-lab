export const orsenKit={
 minor:{crit:.104,atk:.12,elementDamage:.078},
 resolve(r,u,k){return k==='Basic'?{name:'Primer Round',ratio:.8}:k==='Skill'?{name:'Loading Cycle',ratio:1.05,aoe:true,cost:r.state(u).free?0:1,bonus:r.asc(u)&&r.enemies().length>=4?.1:0}:{name:'Overhead Salvo',ratio:2.1,aoe:true,energyCost:130,loaded:r.state(u).loaded||0,bonus:(r.state(u).loaded||0)*.18,consumedStacks:(r.state(u).loaded||0)>0};},
 sync(r,u){if(r.vm(u,4))r.buff(u,u,'VM4',{atk:(r.state(u).loaded||0)>=3?.18:0});},
 after(r,u,a,targets){const s=r.state(u),cap=r.vm(u,1)?4:3;if(a.source==='Skill'){s.loaded=Math.min(cap,(s.loaded||0)+1+(s.free?1:0));s.free=false;r.gain(u,5+(s.loaded>=3?3:0));}if(a.source==='Ult'){s.loaded=r.asc(u)?1:0;if(r.vm(u,2)&&targets.size>=4)r.gain(u,10);if(r.vm(u,6)&&a.loaded>=3)s.free=true;}},
 event(r,u,type,e){if(type==='turnStart'&&e.unit===u){r.state(u).allyTurns=0;r.state(u).granted=0;}if(type==='modify'&&e.unit===u&&e.action.source==='Ult'&&r.asc(u)&&e.action.loaded>=3)e.crit+=.12;},
 observe(r,u,{unit:t,action:a}){if(t===u||!a.realTurn||!r.vm(u,1))return;const s=r.state(u);s.allyTurns=(s.allyTurns||0)+1;if(s.allyTurns%2===0&&(s.granted||0)<2){s.granted=(s.granted||0)+1;s.loaded=Math.min(4,(s.loaded||0)+1);}}
};
