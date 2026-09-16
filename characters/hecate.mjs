export const hecateKit={
 minor:{hp:.25,speed:8,energy:.04},
 sync(r,u){if(r.vm(u,6))for(const t of r.allies())r.buff(u,t,'Hecate VM6',{},null,{scoped:{resPen:.15}});},
 resolve(r,u,k){return k==='Basic'?{name:'Pale Ember',ratio:.65}:k==='Skill'?{name:'Torch at the Crossroads',support:true,needsRecipient:true}:{name:'The Torch Beyond Night',support:true,energyCost:130};},
 follow(r,u,a,repeat=false){const t=r.enemies().sort((a,b)=>r.eff(b).speed-r.eff(a).speed||a.index-b.index)[0];if(!t)return;r.queue(u,{name:'Flame at the Third Road',source:'FUA',scaling:'hp',ratio:r.vm(u,1)?.3:.1,noCrit:!r.vm(u,1),forceCrit:r.vm(u,1),target:t.index,hecateRepeat:repeat},a);},
 allowSelfFollowUp(r,u,a){return r.vm(u,6)&&a.hecateRepeat===true&&(r.state(u).repeats||0)<=2;},
 after(r,u,a,targets){const s=r.state(u);
  if(a.ability==='Skill'){
   const t=r.ctx.units[a.recipient];r.heal(u,t,.17,250,a);
   if(r.cleanse(u,t,a)>0){r.heal(u,t,.05,0,a);r.buff(u,t,'Torch at the Crossroads',{resist:.2},1);if(r.asc(u))r.gain(u,5);}
   s.fire=Math.min(r.vm(u,1)?1:2,(s.fire||0)+1);r.allySkill(u,t,a);
  }
  if(a.ability==='Ult'){s.repeats=0;s.saved={};const attack=Math.min(r.vm(u,4)?600:450,r.eff(u).hp*(r.vm(u,4)?.05:.04));for(const t of r.allies()){r.buff(u,t,'Dẫn Hỏa',{atkFlat:attack},2);r.heal(u,t,.07,120,a);}}
  if(a.source==='FUA'){
   for(const i of targets)r.buff(u,r.ctx.enemies[i],'Flame at the Third Road',{speedPct:-.1,speed:r.asc(u)?-5:0},2,{debuff:true});
   const t=r.allies().sort((a,b)=>a.currentHP-b.currentHP||a.index-b.index)[0];if(t)r.heal(u,t,.04,80,a);
   if(r.vm(u,2)){r.buff(u,u,'Hecate VM2',{hp:.4},2);r.gain(u,4);}
   if(r.vm(u,6)&&(s.repeats||0)<2&&r.ctx.random()<.3){s.repeats=(s.repeats||0)+1;hecateKit.follow(r,u,a,true);}
  }
  if(r.vm(u,6))r.gain(u,3);
 },
 observe(r,u,{action:a,targets}){const s=r.state(u);if(!['Basic','Skill','Ult'].includes(a.source)||!targets.size||(s.fire||0)<(r.vm(u,1)?1:2))return;s.fire=0;hecateKit.follow(r,u,a);},
 event(r,u,type,e){
  if(type==='modify'&&e.unit===u&&e.action.source==='FUA'&&r.vm(u,1))e.stats.critDmg=.001*r.eff(u).hp;
  if(type==='hpLost'&&e.amount>0&&r.asc(u)){const t=e.unit,s=r.state(u);s.saved??={};if(r.alive(t)&&r.effect(u,t,'Dẫn Hỏa')&&!s.saved[t.index]&&t.currentHP<r.eff(t).hp*.5){s.saved[t.index]=true;r.heal(u,t,.05,100,{ability:'Talent'});}}
 }
};
