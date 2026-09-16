export const tomasKit={
 minor:{hp:.18,def:.1,speed:6},
 resolve(r,u,k){return k==='Basic'?{name:'Soft Passage',ratio:.65}:k==='Skill'?{name:'Keep Breathing',support:true,needsRecipient:true}:{name:'Second Wind',support:true,energyCost:110};},
 tick(r,u,t,a,mult=1){const low=t.currentHP<r.eff(t).hp*.5;r.heal(u,t,.06,70,{...a,delayedHeal:true},mult*(r.vm(u,1)?1.12:1));const stacks=Math.min(r.asc(u)?4:3,(r.effect(u,t,'Ổn Định')?.charges||0)+1+(r.vm(u,2)&&low?1:0));r.buff(u,t,'Ổn Định',{def:.03*stacks},2,{charges:stacks});},
 after(r,u,a){if(a.ability==='Skill'){const t=r.ctx.units[a.recipient];if(r.asc(u)&&!r.effect(u,t,'Dưỡng Hộ'))r.heal(u,t,.03,40,a);r.buff(u,t,'Dưỡng Hộ',{},3);if(r.asc(u))r.cleanse(u,t,a);r.allySkill(u,t,a);}if(a.ability==='Ult'){const targets=r.allies().filter(t=>r.effect(u,t,'Dưỡng Hộ'));if(targets.length){for(const t of targets){tomasKit.tick(r,u,t,a);if(r.vm(u,6))tomasKit.tick(r,u,t,a,.5);r.effect(u,t,'Dưỡng Hộ').duration++;if(r.asc(u))r.cleanse(u,t,a);}if(r.asc(u)&&targets.length>=3)r.planck(u,1);}else for(const t of r.allies()){r.heal(u,t,.05,80,a);if(r.asc(u))r.cleanse(u,t,a);}}},
 event(r,u,type,e){if(type==='turnStart'&&r.effect(u,e.unit,'Dưỡng Hộ'))tomasKit.tick(r,u,e.unit,{ability:'Talent'});},
 observe(r,u,{action:a,targets}){if(!r.vm(u,4)||!r.attack(a))return;for(const target of targets)r.queue(u,{name:'Tomas VM4',source:'Extra',ratio:.08,scaling:'hp',noCrit:true,energy:0,toughness:0,target},a);}
};
