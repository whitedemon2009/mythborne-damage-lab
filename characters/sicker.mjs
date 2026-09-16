export const sickerKit={
 minor:{hp:.18,speed:6,energy:.04},
 heal(r,u,t,ratio,flat,a,mult=1){const stacks=r.effect(u,t,'Điện Dẫn')?.charges||0;return r.heal(u,t,ratio,flat,a,mult*(1+.05*stacks));},
 charge(r,u,t){r.buff(u,t,'Điện Dẫn',{},2,{charges:Math.min(2,(r.effect(u,t,'Điện Dẫn')?.charges||0)+1)});},
 resolve(r,u,k){const next=!!r.state(u).next;return k==='Basic'?{name:'Static Pulse',ratio:.7,efficiency:(r.state(u).basic&&r.asc(u)?.15:0)+(next&&r.vm(u,6)?1:0)}:k==='Skill'?{name:'Emergency Current',support:true,needsRecipient:true,cost:next&&r.vm(u,6)?0:1}:{name:'Crash Cart Protocol',ratio:.6,aoe:true,efficiency:r.vm(u,1)?1:.8,energyCost:120};},
 after(r,u,a){const s=r.state(u),next=s.next;s.next=false;
  if(a.ability==='Skill'){const t=r.ctx.units[a.recipient],low=t.currentHP<r.eff(t).hp*.5;sickerKit.heal(r,u,t,.12,180,a,(low?1.25:1)*(next&&r.asc(u)?1.15:1));sickerKit.charge(r,u,t);r.buff(u,t,'Dòng Ổn Định',{def:.1},2);r.allySkill(u,t,a);}
  if(a.source==='Basic'){s.basic=false;if(next&&r.asc(u))for(const t of r.allies())r.gain(t,4);}
  if(a.source==='Ult'){for(const t of r.allies()){sickerKit.heal(r,u,t,.08,120,a);sickerKit.charge(r,u,t);}r.advance(u,r.vm(u,1)?.75:.5);s.basic=true;s.next=true;}
 },
 event(r,u,type,e){
  if(type==='heal'&&e.unit===u&&r.vm(u,4))for(const t of r.allies())r.buff(u,t,'Sicker VM4',{break:.15},2);
  if(type!=='break'||!r.once(u,'Sicker break',e.action.uid))return;
  const t=r.allies().filter(t=>(r.effect(u,t,'Điện Dẫn')?.charges||0)>0).sort((a,b)=>a.currentHP/r.eff(a).hp-b.currentHP/r.eff(b).hp)[0];if(!t)return;
  const charge=r.effect(u,t,'Điện Dẫn');if(!(r.vm(u,2)&&r.once(u,'Sicker VM2'))){charge.charges--;if(!charge.charges)r.remove(u,t,'Điện Dẫn');}
  sickerKit.heal(r,u,t,.03,50,{ability:'Talent'});if(r.asc(u)&&r.once(u,'Sicker A2'))r.gain(u,4);
 }
};
