export const nemesisKit={
 minor:{crit:.104,atk:.12,elementDamage:.078},
 resolve(r,u,k){const s=r.state(u);
  if(k==='Basic')return {name:'First Verdict',ratio:.55,aoe:true,primaryRatio:1};
  if(k==='Skill'){const enhanced=(s.balance||0)>=3,free=enhanced&&!!r.effect(u,u,'Tối Hậu Phán');return {name:enhanced?'Iron Appeal: Final Sentence':'Iron Appeal',aoe:true,enhanced,cost:free?0:1,finalSentence:free,consumedStacks:enhanced,...(enhanced?{phases:[{ratio:2.2,toughness:60},{ratio:(r.vm(u,4)?16:10)*.2,hits:r.vm(u,4)?16:10,bounce:true,toughness:(r.vm(u,4)?16:10)*10}]}:{ratio:1.8})};}
  if(k==='Ult')return {name:'Last Tribunal',ratio:2.6,aoe:true,energyCost:120};
 },
 accuse(r,u,t,n){if(!r.alive(t))return false;const total=(r.effect(u,t,'Cáo Trạng')?.charges||0)+n;
  if(total>=3){r.remove(u,t,'Cáo Trạng');r.buff(u,t,'Bản Án',{},2,{incoming:{vulnerability:.18},onlyOwner:true,debuff:true});r.ctx.gear.dispatch('debuff',{unit:u,target:t,action:{source:'Debuff'}});return true;}
  r.buff(u,t,'Cáo Trạng',{},null,{charges:total,debuff:true});r.ctx.gear.dispatch('debuff',{unit:u,target:t,action:{source:'Debuff'}});return false;
 },
 after(r,u,a,targets){const s=r.state(u);if(a.source==='Extra'){if(r.vm(u,2)&&targets.size>=3)r.buff(u,u,'VM2',{critDmg:.2},2);return;}
  let conversions=0;
  if(a.source==='Basic'||a.source==='Ult'||a.source==='Skill'&&!a.enhanced){for(const i of targets){const n=a.source==='Basic'&&i===a.primaryTarget?2:1;if(nemesisKit.accuse(r,u,r.ctx.enemies[i],n))conversions++;}if(a.source==='Skill')s.balance=Math.min(3,(s.balance||0)+conversions);}
  if(r.vm(u,1)&&['Skill','Ult'].includes(a.source)){const t=r.enemies().sort((x,y)=>y.hp-x.hp||x.index-y.index)[0];if(t&&nemesisKit.accuse(r,u,t,1))conversions++;if(conversions)s.balance=Math.min(3,(s.balance||0)+1);}
  if(a.source==='Ult')s.balance=Math.min(3,(s.balance||0)+2);
  const echo=a.enhanced||a.markedHit||[...targets].some(i=>r.effect(u,r.ctx.enemies[i],'Bản Án'));
  if(echo&&targets.size){const count=a.finalSentence?2:1;for(let i=0;i<count;i++){r.queue(u,{source:'Extra',name:'Công Lý Dội Âm',ratio:.7,toughness:0,aoe:true,energy:0,finalSentence:a.finalSentence},a);s.balance=Math.min(3,(s.balance||0)+1);}}
  // Final Sentence explicitly clears all Quy Cân after its forced echo is triggered.
  if(a.source==='Skill'&&a.enhanced){s.balance=0;if(r.asc(u)){r.gain(u,8);if(targets.size>=3&&s.refundTurn!==u.turn){s.refundTurn=u.turn;r.planck(u,1);}}if(a.finalSentence)r.remove(u,u,'Tối Hậu Phán');}
  if(a.source==='Ult'&&r.vm(u,6))r.buff(u,u,'Tối Hậu Phán',{resPen:0},1);
 },
 event(r,u,type,e){if(e.unit!==u)return;const marked=e.target&&r.effect(u,e.target,'Bản Án');
  if(type==='hit'&&e.amount>0&&marked&&r.attack(e.action))e.action.markedHit=true;
  if(type==='modify'){
   if(e.action.source==='Extra'){if(r.asc(u)&&e.target.hp<e.target.maxHP*.5)e.bonus+=.25;if(r.vm(u,2)&&marked)e.pen+=.15;}
   if(r.asc(u)&&marked&&['Skill','Ult'].includes(e.action.source))e.pen+=.12;
   if(r.vm(u,6)&&(r.effect(u,u,'Tối Hậu Phán')||e.action.finalSentence))e.resPen+=.2;
  }
 }
};
