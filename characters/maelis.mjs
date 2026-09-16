export const maelisKit={
 minor:{hit:.18,speed:8,hp:.12},
 init(r,u){if(r.asc(u)){const t=r.enemies().sort((a,b)=>b.hp-a.hp)[0];if(t&&r.debuff(u,t,'Biên Chú',1,{}))r.buff(u,t,'Biên Chú',{vulnerability:.08},1,{debuff:true});}},
 sync(r,u){if(r.vm(u,1))for(const t of r.enemies())r.buff(u,t,'VM1',{resist:-.1,resReduction:.1});if(r.vm(u,4)){const active=r.enemies().some(t=>r.effect(u,t,'Khai Khoản')&&r.effect(u,t,'Biên Chú'));for(const t of r.allies())r.buff(u,t,'VM4',{atk:active?.1:0});}},
 resolve(r,u,k){return k==='Basic'?{name:'Margin Note',ratio:.7}:k==='Skill'?{name:'Open Clause',ratio:.95}:{name:'Public Record',ratio:.8,aoe:true,energyCost:120};},
 after(r,u,a,targets){if(!['Skill','Ult'].includes(a.source))return;for(const i of targets){const t=r.ctx.enemies[i],key=a.source==='Skill'?'Khai Khoản':'Biên Chú';if(!r.debuff(u,t,key,2,a))continue;if(a.source==='Skill')for(const enemy of r.ctx.enemies)r.remove(u,enemy,key);r.buff(u,t,key,a.source==='Skill'?{vulnerability:.18,resist:r.asc(u)?-.1:0}:{vulnerability:r.effect(u,t,'Khai Khoản')?.12:.08,defReduction:r.vm(u,2)?.08:0},2,{debuff:true});r.ctx.gear.dispatch('debuff',{unit:u,target:t,action:a});}},
 event(r,u,type,e){if(!e.target||e.target.side!=='enemy')return;const clause=r.effect(u,e.target,'Khai Khoản'),note=r.effect(u,e.target,'Biên Chú');if(type==='hit'&&e.amount>0&&clause&&note){const s=r.state(u);s.compare=Math.min(4,(s.compare||0)+1);if(s.compare>=4&&r.once(u,'Đối Chiếu')){s.compare=0;clause.duration++;if(r.asc(u))r.gain(u,6);}}if(type==='modify'&&r.vm(u,6)&&clause)e.critDmg+=.12+(note?.08:0);}
};
