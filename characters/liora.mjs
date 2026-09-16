export const lioraKit={
 minor:{hp:.18,def:.1,speed:6},
 resolve(r,u,k){return k==='Basic'?{name:'Clear Chime',ratio:.65}:k==='Skill'?{name:'Gentle Return',support:true,needsRecipient:true}:{name:'Still Here',support:true,energyCost:125};},
 before(r,u,a){if(a.ability==='Ult'&&r.vm(u,4))r.buff(u,u,'VM4',{hp:.2},2);},
 after(r,u,a){if(a.ability==='Skill'){const t=r.ctx.units[a.recipient];r.heal(u,t,.18+(r.asc(u)&&t.currentHP<r.eff(t).hp*.35?.04:0),260,a);r.cleanse(u,t,a);r.allySkill(u,t,a);}if(a.ability==='Ult'){let low=0;for(const t of r.allies()){if(t.currentHP<r.eff(t).hp*.5)low++;r.heal(u,t,.12,180,a);r.buff(u,t,'Dưỡng Sinh',{},2);}if(r.asc(u)&&low>=3)r.gain(u,10);}},
 event(r,u,type,e){if(type==='beforeHeal'&&e.unit===u&&e.target.currentHP<r.eff(e.target).hp*.5&&r.once(u,'Aftercare '+e.target.index))e.outgoing+=.2;
  if(type==='heal'&&e.unit===u&&r.vm(u,1))r.state(u).charity=Math.min(18000,(r.state(u).charity||0)+(e.effectiveAmount||0));
  if(type==='turnStart'&&r.effect(u,e.unit,'Dưỡng Sinh')){const t=e.unit;r.heal(u,t,.04,0,{ability:'Talent',delayedHeal:true},r.vm(u,2)&&t.currentHP<r.eff(t).hp*.5?1.25:1);if(r.asc(u))r.buff(u,t,'A2',{def:.08},1);}
  if(type==='reviveCheck'&&r.vm(u,6)&&!r.state(u).revived)e.revivals.push({type:'ally',hpFraction:.35,uses:1,onUse:()=>{r.state(u).revived=true;},after:()=>r.buff(u,e.unit,'Dưỡng Sinh',{},2)});
 },
 observe(r,u,{unit:t,action:a,targets}){const s=r.state(u);if(!r.vm(u,1)||!r.attack(a)||!targets.size||!s.charity)return;const rate=Math.floor(s.charity/1000)*.01;s.charity=0;for(const [target,value] of Object.entries(a.damageByTarget||{}))if(rate>0)r.queue(t,{name:'Liora · Từ Thiện',source:'Extra',ratio:0,flat:value*rate,trueDamage:true,toughness:0,energy:0,target:Number(target)},a);}
};
