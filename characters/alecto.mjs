export const alectoKit={
 minor:{hit:.18,speed:5,atk:.12},
 judgments:['Đơn Án','Chúng Án','Khuyết Án'],
 clear(r,u,t){for(const key of ['Tội Thư','Đại Thẩm',...alectoKit.judgments])r.remove(u,t,key);},
 book(r,u,t){for(const other of r.enemies())if(other!==t)alectoKit.clear(r,u,other);r.buff(u,t,'Tội Thư',{vulnerability:r.vm(u,1)?.08:.05},3,{debuff:true});},
 judge(r,u,t,key,a,duration){
  if(!r.effect(u,t,'Đại Thẩm')&&!r.vm(u,6))for(const other of alectoKit.judgments)if(other!==key)r.remove(u,t,other);
  r.buff(u,t,key,{},duration??(key==='Khuyết Án'?1:2),{debuff:true});r.state(u).latest=key;
  r.ctx.gear.dispatch('debuff',{unit:u,target:t,action:a});
  const s=r.state(u);if(s.energyTurn!==u.turn){s.energyTurn=u.turn;s.energyUses=0;}
  if(r.asc(u)&&s.energyUses<2){s.energyUses++;r.gain(u,4);}
  if(r.asc(u)&&r.once(u,'A2',a.uid??a.chain))r.queue(u,{name:'The Verdict Follows the Deed',source:'Talent',ratio:r.vm(u,2)?1:.6,target:t.index,energy:0,toughness:0},a);
 },
 sync(r,u){for(const t of r.enemies()){
  if(!r.effect(u,t,'Tội Thư')){for(const key of ['Đại Thẩm',...alectoKit.judgments])if(r.effect(u,t,key))r.remove(u,t,key);continue;}
  const grand=!!r.effect(u,t,'Đại Thẩm');
  if(!grand&&!r.vm(u,6))for(const key of alectoKit.judgments)if(key!==r.state(u).latest&&r.effect(u,t,key))r.remove(u,t,key);
  const mult=grand&&r.vm(u,6)?1.2:1;
  for(const key of alectoKit.judgments){const b=r.effect(u,t,key);if(!b)continue;const old=r.eff(t).speed;b.mods=key==='Đơn Án'?{defReduction:.08*mult}:key==='Chúng Án'?{vulnerability:.1*mult}:{speed:-12*mult};r.ctx.retime(t,old);}
 }},
 resolve(r,u,k){return k==='Basic'?{name:'Ash on the Testimony',ratio:.7,toughness:30}:k==='Skill'?{name:'Name the Crime',ratio:1.2,toughness:30}:{name:'Let Every Charge Burn',ratio:1.8,toughness:60,energyCost:110};},
 after(r,u,a,targets){
  if(a.source==='Talent'&&r.vm(u,2))for(const i of targets)r.buff(u,r.ctx.enemies[i],'VM2',{},2,{debuff:true});
  if(!['Skill','Ult'].includes(a.ability))return;
  const t=r.ctx.enemies[a.primaryTarget];if(!r.alive(t))return;
  const prior=!!r.effect(u,t,'Tội Thư');alectoKit.book(r,u,t);
  if(a.ability==='Skill'&&r.vm(u,1)&&prior)for(const key of alectoKit.judgments){const b=r.effect(u,t,key);if(b)b.duration=key==='Khuyết Án'?1:2;}
  if(a.ability==='Ult'){
   r.buff(u,t,'Đại Thẩm',{},2,{debuff:true});const n=r.state(u).lastActions?.[t.index]??0;
   alectoKit.judge(r,u,t,n===1?'Đơn Án':n>=2?'Chúng Án':'Khuyết Án',a);
   if(r.vm(u,4)){const extra=alectoKit.judgments.find(key=>!r.effect(u,t,key));if(extra)alectoKit.judge(r,u,t,extra,a,2);}
  }
 },
 event(r,u,type,e){
  if(type==='modify'&&r.effect(u,e.target,'VM2')&&['Hỏa','Hoả','Hỏa Ngục','Hoả Ngục'].includes(e.unit.element))e.resPen+=.1;
  if(type!=='enemyEnd')return;const t=e.enemy,n=e.recipients.size,s=r.state(u);s.lastActions??={};s.lastActions[t.index]=n;
  if(!r.effect(u,t,'Tội Thư'))return;
  alectoKit.judge(r,u,t,n===1?'Đơn Án':n>=2?'Chúng Án':'Khuyết Án',{actor:u.index,chain:e.chain,uid:`enemy:${t.index}:${t.turn}`});
  if(r.asc(u)&&r.once(u,'A1'))r.advance(u,.12);
 }
};
