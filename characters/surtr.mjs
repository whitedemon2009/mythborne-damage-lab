export const surtrKit={
 minor:{break:.24,speed:8,atk:.1},
 resolve(r,u,k,input){const enhanced=(r.state(u).sun||0)>0,primary=input.target??0;return k==='Basic'?{name:'Ash Before Dawn',ratio:1,toughness:30,annihilate:true}:k==='Skill'?enhanced?{name:'The Sword That Burns the Road',enhanced:true,ratio:2.5,splash:1.25,blast:true,toughness:45,targetToughness:{[primary]:90},efficiency:.95,cost:r.vm(u,1)?0:1,annihilate:true}:{name:'Feed the Last Furnace',support:true,selfHPCurrentCost:.2,energy:0}:{name:'Two Steps Until the World Ends',ratio:1.4,splash:.7,blast:true,toughness:45,targetToughness:{[primary]:90},energyCost:160,annihilate:true};},
 before(r,u,a){if(a.annihilate){a.surtrNewBreak=new Set();a.dkTargetIndices=a.enhanced?r.enemies().filter(t=>t.toughness===0).map(t=>t.index):[];}},
 after(r,u,a,targets){const s=r.state(u);
  if(a.name==='Feed the Last Furnace'){u.currentEnergy=u.energyCap;if(r.asc(u)){s.ashDeadline=u.turn+1;s.ultAfterAsh=false;r.buff(u,u,'Da Tro');}}
  if(['Basic','Skill','Ult'].includes(a.source))for(const i of targets)if(r.alive(r.ctx.enemies[i]))r.dot(u,r.ctx.enemies[i],'Hỏa Táng',1,2,a);
  if(a.source==='Ult'&&!a.enhanced){s.sun=r.vm(u,6)?3:2;s.skills=0;s.ultAfterAsh=true;if(r.asc(u))s.trueDK=true;r.advance(u,1);}
  if(a.source==='Skill'&&a.enhanced){s.sun--;if(r.vm(u,2))r.advance(u,s.skills?.25:.5);s.skills=(s.skills||0)+1;if(s.sun===0)r.queue(u,{name:'Nothing Remains to Burn',source:'Ult',ability:'Ult',enhanced:true,ratio:1.8,aoe:true,toughness:120,efficiency:1,energyCost:0,energy:0,annihilate:true},a);}
  if(a.source==='Ult'&&a.enhanced){r.remove(u,u,'Da Tro');if(r.asc(u))r.heal(u,u,.1,0,a);if(r.vm(u,6))r.advance(u,.25);}
 },
 event(r,u,type,e){const a=e.action,s=r.state(u);
  if(type==='incomingDamage'&&e.unit===u&&r.effect(u,u,'Da Tro'))e.floor=1;
  if(type==='turnEnd'&&e.unit===u&&!s.ultAfterAsh&&u.turn>=s.ashDeadline)r.remove(u,u,'Da Tro');
  if(type==='dotStart'&&e.unit===u&&a.effectName==='Hỏa Táng'){a.countsAsDK=true;a.damageSource='Diệt Kích';a.dotHits=r.vm(u,4)?3:1;}
  if(type==='modify'&&e.unit===u){
   if(a.effectName==='Hỏa Táng'){a.countsAsDK=true;a.damageSource='Diệt Kích';}
   if(a.source==='Diệt Kích'||a.countsAsDK){if(r.vm(u,1))e.pen+=.15;a.ignoreDefRes=!!s.trueDK;
    if(a.annihilate)a.dkMultiplier=a.enhanced&&a.ability==='Ult'&&a.surtrNewBreak?.has(e.target.index)?2.5:a.enhanced&&a.ability==='Skill'&&!a.surtrNewBreak?.has(e.target.index)&&e.target.index!==a.primaryTarget?1:2;
   }
  }
  if(type==='hit'&&e.unit===u&&(a.source==='Diệt Kích'||a.countsAsDK)&&s.trueDK)s.trueDK=false;
  if(type==='break'&&e.unit===u){if(a.surtrNewBreak){a.surtrNewBreak.add(e.target.index);a.dkTargetIndices.push(e.target.index);}else r.queue(u,{name:'The Pyre Remembers Every Name',source:'Diệt Kích',toughness:20,dkMultiplier:2,target:e.target.index,energy:0},a);if(r.asc(u))r.buff(u,e.target,'Cháy Rụi',{},1,{type:'control',skipRecovery:true,debuff:true});}
  if(type==='dotEnd'&&e.unit===u&&a.effectName==='Hỏa Táng'&&r.alive(e.target)){if(e.target.toughness>0)r.ctx.reduceToughness(u,e.target,.1*e.target.maxToughness,a);else r.delay(e.target,.15);}
 }
};
