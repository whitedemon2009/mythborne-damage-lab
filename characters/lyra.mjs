export const lyraKit={
 minor:{atk:.18,speed:8,elementDamage:.1},
 mark(r,u,t,n){r.buff(u,t,'Hàn Ngấn',{},r.asc(u)?3:2,{charges:Math.min(3,(r.effect(u,t,'Hàn Ngấn')?.charges||0)+n),debuff:true});},
 sync(r,u){if(r.vm(u,4))r.buff(u,u,'VM4',{atk:.24});},
 resolve(r,u,k){return k==='Basic'?{name:'Frostbound Arc',ratio:.8}:k==='Skill'?{name:'Twin Rings Through Snow',ratio:1,splash:.6,blast:true}:{name:'Three Orbits, One Winter',ratio:1.3,splash:.8,blast:true,energyCost:120};},
 after(r,u,a,targets){if(a.source==='Extra'){if(r.vm(u,2))lyraKit.mark(r,u,r.ctx.enemies[a.primaryTarget],1);if(r.vm(u,6))for(const i of targets)if(i!==a.primaryTarget)lyraKit.mark(r,u,r.ctx.enemies[i],1);return;}if(!r.attack(a))return;for(const i of targets)lyraKit.mark(r,u,r.ctx.enemies[i],a.source==='Ult'?2:1+(a.source==='Skill'&&r.vm(u,1)&&i===a.primaryTarget?1:0));if(a.shatterTarget!==undefined){const t=r.ctx.enemies[a.shatterTarget];r.remove(u,t,'Hàn Ngấn');r.queue(u,{name:'Shatterring',source:'Extra',target:t.index,ratio:r.vm(u,6)?1.2:.8,splash:r.vm(u,6)?.6:.4,blast:true,toughness:0,energy:0},a);if(r.asc(u))r.gain(u,5);}},
 event(r,u,type,e){if(e.unit!==u||!e.target)return;const charges=r.effect(u,e.target,'Hàn Ngấn')?.charges||0;if(type==='hit'&&r.attack(e.action)&&charges>=3&&e.action.shatterTarget===undefined)e.action.shatterTarget=e.target.index;if(type==='modify'&&r.asc(u)&&charges>=2)e.bonus+=.12;}
};
