export const cassianKit={
 minor:{speed:8,hp:.12,def:.1},
 sync(r,u){if(r.vm(u,4))r.buff(u,u,'VM4',{speed:r.planckCount()<=2?5:0});},
 resolve(r,u,k){return k==='Basic'?{name:'Clean Ledger',ratio:.7}:k==='Skill'?{name:'Priority Order',support:true,needsRecipient:true}:{name:'Full Authorization',support:true,energyCost:115};},
 after(r,u,a){if(a.ability==='Skill'){const t=r.ctx.units[a.recipient];r.buff(u,t,'Ưu Tiên',{atk:r.vm(u,1)?.24:.2,critDmg:r.asc(u)?.08:0},2);r.allySkill(u,t,a);}if(a.ability==='Ult'){for(const t of r.allies())r.buff(u,t,'Full Authorization',{atk:.14,critDmg:r.effect(u,t,'Ưu Tiên')?.12:0},2);if(r.asc(u)&&r.planckCount()<=2)r.planck(u,1);}},
 observe(r,u,{unit:t,action:a}){if(a.ability!=='Skill'||a.cost<=0||!r.effect(u,t,'Ưu Tiên'))return;if(r.state(u).limits?.refund===u.turn)return;if(r.ctx.random()>=(r.vm(u,2)?.2:.15))return;r.once(u,'refund');r.planck(u,1);if(r.asc(u))for(const [target,value] of Object.entries(a.damageByTarget||{}))r.queue(t,{name:'Cassian A2',source:'Extra',ratio:0,flat:value*.15,trueDamage:true,energy:0,toughness:0,target:Number(target)},a);if(r.vm(u,6))for(const ally of r.allies())if(r.effect(u,ally,'Ưu Tiên'))r.buff(u,ally,'VM6',{damage:.1},1);}
};
