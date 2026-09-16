import {effectChance} from '../effects.mjs';
export const theoKit={
 minor:{hit:.18,energy:.05,hp:.12},
 resolve(r,u,k){return k==='Basic'?{name:'Plain Statement',ratio:.75}:k==='Skill'?{name:'Fault Found',ratio:1.05}:{name:'Open Record',ratio:.8,aoe:true,energyCost:110};},
 sync(r,u){if(r.vm(u,4))r.buff(u,u,'VM4',r.enemies().some(t=>r.effect(u,t,'Sơ Hở'))?{def:.15,hit:.1}:{def:0,hit:0});},
 before(r,u,a){if(a.source==='Ult'){a.priorOpen=new Set(r.enemies().filter(t=>r.effect(u,t,'Sơ Hở')).map(t=>t.index));a.targetToughness={};for(const t of r.enemies())a.targetToughness[t.index]=a.toughness+(a.priorOpen.has(t.index)?.15*t.maxToughness:0);}},
 after(r,u,a,targets){if(!['Skill','Ult'].includes(a.source))return;for(const i of targets){const t=r.ctx.enemies[i];if(!r.debuff(u,t,'Sơ Hở',2,a))continue;let duration=2;if(a.source==='Ult'&&a.priorOpen.has(i)){if(r.vm(u,2))duration++;if(r.asc(u)&&r.ctx.random()<effectChance(.5,r.eff(u).hit||0,r.eff(t).resist||0))duration++;}r.buff(u,t,'Sơ Hở',{defReduction:.18+(r.asc(u)?.03:0)+(r.vm(u,1)?.03:0)},duration,{debuff:true});r.ctx.gear.dispatch('debuff',{unit:u,target:t,action:a});}},
 event(r,u,type,e){if(type==='break'){const b=r.effect(u,e.target,'Sơ Hở');if(b){b.duration++;if(r.vm(u,6))r.buff(u,e.target,'VM6',{vulnerability:.06},2,{debuff:true});}}if(type==='hit'&&e.unit===u&&e.amount>0&&r.attack(e.action)&&r.asc(u)&&r.effect(u,e.target,'Sơ Hở')&&r.once(u,'A1 '+e.target.index,e.action.uid))r.gain(u,4);}
};
