import {apolloEntryCrit} from '../character-rules.mjs';
export const apolloKit={
 minor:{energy:.15,critDmg:.12,elementDamage:.1},
 init(r,u){const s=r.state(u);s.chargers=new Set();s.used=new Set();if(r.asc(u))r.buff(u,u,'A1 Chí Mạng',{crit:apolloEntryCrit(u.currentEnergy)});},
 sync(r,u){
  const allies=r.allies().filter(t=>t.aspect==='Mjolnir'&&(r.vm(u,2)||t!==u)),n=allies.length;
  for(const t of r.ctx.units){if(allies.includes(t))r.buff(u,t,'Every Battlefield Faces the Sun',{energy:n>=1?(r.vm(u,2)?.15:.1):0,speedPct:n>=2?(r.vm(u,2)?.4:.25):0,critDmg:n>=3?(r.vm(u,2)?.8:.4):0});else r.remove(u,t,'Every Battlefield Faces the Sun');}
  if(r.asc(u))r.buff(u,u,'A1 Hồi Năng Lượng',{energy:Math.min(.4,Math.max(0,r.eff(u).atk-2000)*.0002)});
  if(r.vm(u,4))r.buff(u,u,'VM4',{crit:.12});
 },
 resolve(r,u,k){const s=r.state(u);
  if(k==='Basic')return {name:'Gilded Meridian',ratio:1,toughness:30};
  if(k==='Skill'){const enhanced=!!(s.axis||s.afterglow);return {name:enhanced?'Call Down the Meridian':'Turn the Mirrors East',ratio:enhanced?2.4:1.2,toughness:enhanced?60:30,aoe:true,enhanced,cost:s.afterglow?0:1};}
  if(k==='Ult'){const last=s.zenith?4.8:3.6;return {name:'The Sky Cannot Hold This Noon',aoe:true,bonus:r.asc(u)?Math.min(3,s.chargers.size)*.1:0,phases:[{ratio:1,toughness:40},{ratio:1.8,toughness:40},{ratio:last,toughness:40},...(r.vm(u,6)?[{ratio:last*.5,toughness:0}]:[])]};}
 },
 after(r,u,a){const s=r.state(u);
  if(a.source==='Skill'){if(a.enhanced){r.gain(u,80);s.zenith=true;s.axis=false;s.afterglow=false;}else s.axis=true;}
  if(a.source==='Ult'){s.zenith=false;s.chargers.clear();if(r.asc(u))r.gain(u,u.energyCap*.1,true);if(r.vm(u,6))s.afterglow=true;}
 },
 observe(r,u,e){const s=r.state(u),{unit:t,action:a,targets}=e;
  if(t===u)return;
  if(a.ability==='Ult'&&r.vm(u,1)&&!s.advanced){s.ults=(s.ults||0)+1;if(s.ults>=2){s.axis=true;s.advanced=true;r.advance(u,.36);}}
  if(t.aspect==='Mjolnir'&&targets.size&&r.attack(a)&&!s.used.has(t.index)){s.used.add(t.index);s.chargers.add(t.index);r.gain(u,20);r.log(u,`${t.name} sạc Thiên Phú +20 NL cơ bản`);if(r.vm(u,4))r.buff(u,t,'VM4 Sát Thương Chí Mạng',{critDmg:.2},2);}
 },
 event(r,u,type,e){if(type==='turnStart'&&e.unit===u){const s=r.state(u);s.used.clear();s.ults=0;s.advanced=false;}}
};
