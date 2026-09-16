export const thanatosKit={
 minor:{crit:.104,critDmg:.12,elementDamage:.078},
 init(r,u){r.state(u).ticks=r.asc(u)?2:0;},
 sync(r,u){if(r.vm(u,4))r.buff(u,u,'Thanatos VM4',{critDmg:(r.state(u).ticks||0)>=4||r.effect(u,u,'Sau No Second Death')?.3:0});},
 resolve(r,u,k){const enhanced=(r.state(u).ticks||0)>=4;return k==='Basic'?{name:'Before the Bell',ratio:1}:k==='Skill'?{name:enhanced?'No Second Death':'Borrowed Second',ratio:enhanced?3.8:2.1,enhanced,resPen:enhanced&&r.vm(u,6)?.2:0}:{name:'The Last Name Spoken',ratio:3.4,energyCost:125};},
 echo(r,u,a,target,threshold=false){if(!r.alive(target))return;r.queue(u,{name:'Dư Tử',source:'FUA',damageSource:'Talent',ratio:1.4,target:target.index,resPen:r.vm(u,6)?.2:0,threshold},a);},
 before(r,u,a){if(a.name==='Dư Tử'&&r.vm(u,1)){const t=r.ctx.enemies[a.target],good=t.effects.find(e=>!e.debuff&&e.type!=='control'&&(e.value>0||e.mods&&Object.values(e.mods).some(v=>v>0)));if(good)t.effects=t.effects.filter(e=>e!==good);}},
 after(r,u,a,targets){const s=r.state(u),t=r.ctx.enemies[a.primaryTarget??a.target],old=s.ticks||0;let forced=false;
  if(a.source==='Basic')s.ticks=Math.min(4,old+1);
  if(a.source==='Skill'){if(a.enhanced){thanatosKit.echo(r,u,a,t);forced=true;s.ticks=s.keepTwo?2:0;s.keepTwo=false;r.buff(u,u,'Sau No Second Death',{},1);r.advance(u,.4);}else{s.ticks=Math.min(4,old+2);r.advance(u,.2);}}
  if(a.source==='Ult'){if(r.alive(t)){thanatosKit.echo(r,u,a,t,old<4);forced=true;}else r.gain(u,20);s.ticks=4;if(r.vm(u,6))s.keepTwo=true;}
  if(old<4&&s.ticks===4){if(!forced)thanatosKit.echo(r,u,a,t,true);r.advance(u,.75);}
  if(['Basic','Skill','Ult'].includes(a.source)&&r.asc(u)&&r.alive(t)&&r.ctx.random()<Math.min(.8,.2*r.debuffs(t).length))thanatosKit.echo(r,u,a,t);
  if(a.name==='Dư Tử'){
   if(r.asc(u)&&r.once(u,'Thanatos A3'))r.buff(u,u,'Thanatos A3',{speedPct:.25},2);
   for(const [i,damage] of Object.entries(a.damageByTarget||{})){
    if(r.vm(u,1)){const n=Math.min(4,r.debuffs(r.ctx.enemies[i]).length);if(n)r.queue(u,{name:'Thanatos VM1',source:'Extra',flat:damage*.3*n,trueDamage:true,target:Number(i),toughness:0,energy:0},a);}
    if(r.vm(u,2)&&a.threshold)r.queue(u,{name:'Thanatos VM2',source:'Extra',flat:damage*.6,target:Number(i),toughness:0,energy:0},a);
   }
  }
 },
 event(r,u,type,e){if(type==='modify'&&e.unit===u){if(e.action.source==='Skill'&&e.action.enhanced)e.crit+=.2;if(e.action.source==='Ult'&&e.target.hp<=e.target.maxHP*.5)e.bonus+=.3;}}
};
