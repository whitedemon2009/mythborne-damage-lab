export const solKit={
 minor:{speed:8,hp:.12,energy:.04},
 resolve(r,u,k){return k==='Basic'?{name:'Small Orbit',ratio:.7}:k==='Skill'?{name:'Borrowed Minute',support:true,otherRecipient:true,cost:r.state(u).free?0:1,consumedStacks:(r.state(u).time||0)>0}:{name:'Shared Horizon',support:true,energyCost:130};},
 after(r,u,a){const s=r.state(u);
  if(a.ability==='Skill'){const t=r.ctx.units[a.recipient],stacks=s.time||0;r.gain(t,t.energyCap*.03,true);r.gain(t,stacks);s.time=0;s.free=false;r.buff(u,t,'Borrowed Minute',{damage:.2,atk:r.asc(u)?.15:0},2);r.buff(u,t,'Sol hồi Năng Lượng',{},2);if(r.vm(u,1))r.advance(t,.25);if(r.vm(u,4))r.buff(u,u,'VM4',{speed:8},2);if(r.vm(u,6)&&stacks>=3)r.buff(u,t,'VM6',{damage:.18},2);r.allySkill(u,t,a);}
  if(a.ability==='Ult'){for(const t of r.allies()){r.buff(u,t,'Shared Horizon',{atk:.12},2);if(t!==u){const low=t.currentEnergy<t.energyCap*.5;r.gain(t,10+(r.asc(u)&&low?5:0));r.buff(u,t,'Sol hồi Năng Lượng',{},2);}}if(r.vm(u,1))s.free=true;}
 },
 observe(r,u,{unit:t,action:a}){if(t!==u&&a.ability==='Ult'){r.state(u).time=Math.min(r.vm(u,2)?4:3,(r.state(u).time||0)+1);if(r.asc(u)&&r.effect(u,t,'Sol hồi Năng Lượng'))r.gain(u,5);}}
};
