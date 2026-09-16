import {normalizeElement} from '../formulas.mjs';
export const erisKit={
 minor:{hit:.18,speed:8,hp:.12},
 slowed(t){return t.effects.some(b=>(b.type==='speed'&&b.value<0)||(b.mods?.speed||0)<0||(b.mods?.speedPct||0)<0);},
 slow(r,u,t,key,value,a){if(!r.debuff(u,t,key,2,a))return false;r.buff(u,t,key,{speed:value},2,{debuff:true});const n=Math.min(2,(r.effect(u,t,'Bất Hòa')?.charges||0)+1);r.buff(u,t,'Bất Hòa',{resReduction:.02*n},2,{charges:n,debuff:true});r.ctx.gear.dispatch('debuff',{unit:u,target:t,action:a,disrupt:true});return true;},
 airborne(r,u,t,a,own=true){
  if((r.effect(u,t,'Bất Hòa')?.charges||0)>=2){r.remove(u,t,'Bất Hòa');r.buff(u,t,'Mất Thăng Bằng',{defReduction:.07,damage:-.1,resReduction:r.asc(u)?.05:0},2,{debuff:true});if(r.vm(u,2)&&r.once(u,'VM2 '+t.index))r.gain(u,5);}
  const slip=r.effect(u,t,'Trượt Nhịp');if(r.asc(u)&&slip&&r.once(u,'A1 '+t.index))slip.duration=2;
  if(r.vm(u,6)){
   const s=r.state(u);if(s.airTurn!==u.turn){s.airTurn=u.turn;s.airUses=0;}
   if(own&&s.airUses<2){s.airUses++;for(const ally of r.allies())r.advance(ally,.08);}
   const gravity=r.effect(u,t,'Sai Trọng Lực'),balance=r.effect(u,t,'Mất Thăng Bằng');
   if(gravity&&balance&&!balance.gravityExtended){gravity.duration++;balance.gravityExtended=true;}
  }
 },
 lift(r,u,t,a,delay,chance=1){if(!r.debuff(u,t,'Hất Tung',0,a,chance))return;r.delay(t,delay);r.log(u,`Hất Tung trong kit → Myrk ${t.index+1}: trì hoãn ${delay*100}%`);r.ctx.gear.dispatch('debuff',{unit:u,target:t,action:a,disrupt:true,hardDisrupt:true});erisKit.airborne(r,u,t,a);},
 sync(r,u){if(r.vm(u,4)){const active=r.enemies().some(t=>erisKit.slowed(t)||t.effects.some(b=>b.type==='control'));r.buff(u,u,'VM4',{hit:active?.25:0,speed:active?8:0});}for(const t of r.enemies()){const balance=r.effect(u,t,'Mất Thăng Bằng');if(balance){const both=!!r.effect(u,t,'Sai Trọng Lực');balance.mods={defReduction:.07+(both&&r.vm(u,2)?.08:0),damage:-.1,resReduction:(r.asc(u)?.05:0)+(both&&r.vm(u,6)?.1:0)};}}},
 resolve(r,u,k){return k==='Basic'?{name:'Crooked Footnote',ratio:.7}:k==='Skill'?{name:'Up Is a Suggestion',ratio:.9,splash:.5,blast:true}:{name:'The World Forgets the Floor',ratio:.85,aoe:true,energyCost:130};},
 before(r,u,a){if(a.source==='Skill')a.airEligible=new Set(r.enemies().filter(t=>erisKit.slowed(t)||(r.vm(u,1)&&r.debuffs(t).length>0)).map(t=>t.index));},
 after(r,u,a,targets){
  if(a.source==='Skill')for(const i of targets){const t=r.ctx.enemies[i];erisKit.slow(r,u,t,'Trượt Nhịp',-12,a);if(a.airEligible.has(i))erisKit.lift(r,u,t,a,r.vm(u,1)?.2:.15,r.vm(u,1)?1:.8);}
  if(a.source==='Ult'){let applied=0;for(const i of targets){const t=r.ctx.enemies[i];if(r.debuff(u,t,'Sai Trọng Lực',2,a)){r.buff(u,t,'Sai Trọng Lực',{resReduction:.06,resist:-.1},2,{debuff:true});applied++;r.ctx.gear.dispatch('debuff',{unit:u,target:t,action:a});}if(erisKit.slowed(t))erisKit.lift(r,u,t,a,.2);else erisKit.slow(r,u,t,'The World Forgets the Floor',-8,a);}if(r.asc(u)&&applied>=3)r.gain(u,8);}
 },
 event(r,u,type,e){if(type==='break'&&r.alive(e.target)&&normalizeElement(e.unit.element)==='Phong')erisKit.airborne(r,u,e.target,e.action,e.unit===u);}
};
