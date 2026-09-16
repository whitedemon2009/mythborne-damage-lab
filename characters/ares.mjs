export const aresKit={
 minor:{crit:.104,critDmg:.12,elementDamage:.078},
 sync(r,u){if(r.asc(u))r.buff(u,u,'Ares A2',{crit:Math.min(.2,Math.max(0,r.eff(u).atk-2000)*.0002)});if(r.vm(u,4))r.buff(u,u,'Ares VM4',{resist:1});},
 resolve(r,u,k,input){const tier=Number(input.kitVariant)||(r.planckCount()>=2?2:1);return k==='Basic'?{name:'First Blood',ratio:1.1}:k==='Skill'?{name:'Spearhead: Break the Line · '+tier,tier,cost:tier>=2?2:1,ratio:[0,1.5,2.4,3][tier],splash:[0,.8,1.3,1.5][tier],blast:true,selfHPCurrentCost:tier===3?.5:0,minHP:tier===3?1:0,pen:tier===3?.1+(r.vm(u,2)?.2:0)+(r.asc(u)&&r.effect(u,u,'Tiến Quân Bất Tận')?.08:0):0,bonus:(r.state(u).seals||0)*.06+(r.asc(u)&&tier>=2?.1:0)}:{name:'March Until None Remain',ratio:2.6,splash:1.5,blast:true,energyCost:130};},
 before(r,u,a){a.fullSeals=(r.state(u).seals||0)>=(r.vm(u,1)?3:4);a.hungryTargets=new Set(r.effect(u,u,'Khát Máu')?r.enemies().filter(t=>t.hp/t.maxHP>u.currentHP/r.eff(u).hp).map(t=>t.index):[]);},
 after(r,u,a,targets){const s=r.state(u),cap=r.vm(u,1)?3:4;
  if(a.source==='Skill'){
   if(a.fullSeals){s.seals=r.vm(u,6)?2:0;r.queue(u,{name:'Red Reprisal',source:'FUA',ratio:1.8,splash:.9,blast:true,target:a.primaryTarget},a);}else s.seals=Math.min(cap,(s.seals||0)+(a.tier===3?2:a.tier===2?1:0));
   if(a.tier>=2&&r.effect(u,u,'Tiến Quân Bất Tận')&&r.once(u,'Ares refund'))r.planck(u,1);
   if(a.tier===3&&r.vm(u,2)&&targets.size>=3)r.gain(u,8);
   if(a.tier===3&&r.vm(u,6)&&r.effect(u,u,'Tiến Quân Bất Tận')&&r.once(u,'Ares VM6'))r.queue(u,{name:'Ares VM6',source:'Extra',damageSource:'Skill',ratio:1.2,splash:.6,blast:true,target:a.primaryTarget,toughness:0,energy:0},a);
  }
  if(a.source==='Ult'){s.seals=Math.min(cap,(s.seals||0)+2);r.buff(u,u,'Tiến Quân Bất Tận',{},2);}
  if(a.source==='FUA'){r.heal(u,u,.1,0,a);if(r.vm(u,1)){r.gain(u,10);r.buff(u,u,'Khát Máu',{},3);}}
  if(r.attack(a))for(const [i,amount] of Object.entries(a.damageByTarget||{}))if(a.hungryTargets?.has(Number(i)))r.queue(u,{name:'Khát Máu',source:'Extra',flat:amount*.3,target:Number(i),toughness:0,energy:0},a);
 },
 event(r,u,type,e){if(type==='modify'&&e.unit===u&&e.action.source==='Skill')e.crit+=e.action.tier===3?.2:e.action.tier===2?.15:0;}
};
