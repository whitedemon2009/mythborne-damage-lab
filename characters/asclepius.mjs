export const asclepiusKit={
 minor:{hp:.25,speed:5,energy:.1},
 base(r,u){return .12*r.eff(u).hp+220;},
 sync(r,u){for(const t of r.allies()){
  const b=r.effect(u,t,'Dược Dẫn');if(!b)continue;
  if(b.reserve<=0){r.remove(u,t,'Dược Dẫn');continue;}
  b.mods={damage:.25,resist:r.asc(u)?.2:0,hp:r.vm(u,1)?.5:0};
  b.scoped={resPen:r.vm(u,6)&&b.reserve>b.initial?.18:0};
 }},
 resolve(r,u,k){return k==='Basic'?{name:'Light Along the Staff',ratio:.7,toughness:30}:k==='Skill'?{name:'Oath Before the Wound',support:true,needsRecipient:true}:{name:'No Life Is Spent in Vain',support:true,energyCost:160};},
 after(r,u,a){
  if(a.ability==='Skill'){
   const t=r.ctx.units[a.recipient];r.heal(u,t,.16,240,a);const base=asclepiusKit.base(r,u),old=r.effect(u,t,'Dược Dẫn');
   r.buff(u,t,'Dược Dẫn',{},3,{reserve:Math.max(base,old?.reserve||0),initial:base,limit:old?.limit||1,cleansed:false,spent:false});r.allySkill(u,t,a);
  }
  if(a.ability==='Ult'){
   const maxHP=r.eff(u).hp,base=asclepiusKit.base(r,u);
   for(const t of r.allies()){
    r.ctx.heal(u,t,.08*maxHP+160,{action:a});r.buff(u,t,'No Life Is Spent in Vain',{hpFlat:.26*maxHP+500},3);
    const old=r.effect(u,t,'Dược Dẫn'),limit=r.vm(u,6)?1.8:1;
    r.buff(u,t,'Dược Dẫn',{},Math.max(2,old?.duration||0),{reserve:Math.min(base*limit,(old?.reserve||0)+.7*base),initial:base,limit,cleansed:false,spent:false});
   }
  }
 },
 event(r,u,type,e){
  if(type!=='damageActionEnd')return;const s=r.state(u);
  if(s.energyTurn!==u.turn){s.energyTurn=u.turn;s.energyUses=0;}
  for(const i of e.recipients){
   const t=r.ctx.units[i],b=r.effect(u,t,'Dược Dẫn');if(!r.alive(t)||!b||b.reserve<=0)continue;
   const gap=.8*r.eff(t).hp-t.currentHP;if(gap<=0)continue;
   const cap=Math.min(gap,b.reserve),amount=r.ctx.heal(u,t,cap,{maxHeal:cap,action:{ability:'Talent'},delayed:true});
   const remaining=Math.max(0,b.reserve-amount);if(amount<1)continue;
   if(r.once(u,'Mạch Sáng '+i))r.buff(u,t,'Mạch Sáng',{},1,{scoped:{bonus:.2,crit:r.vm(u,2)?.15:0},consume:'damage'});
   if(r.asc(u)&&!b.cleansed){b.cleansed=true;r.cleanse(u,t,{ability:'Talent'});}
   if(remaining===0){if(r.vm(u,4)&&!b.spent){b.spent=true;r.heal(u,t,.06,120,{ability:'Talent'});}r.remove(u,t,'Dược Dẫn');}else b.reserve=remaining;
   if(r.asc(u)&&s.energyUses<2){s.energyUses++;r.gain(u,5);}
  }
 }
};
