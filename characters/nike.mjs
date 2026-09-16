export const nikeKit={
 minor:{break:.24,energy:.04,hp:.12},
 sync(r,u){if(r.asc(u)){const bonus=Math.min(.4,Math.floor((r.eff(u).break||0)/.05+1e-9)*.04);for(const t of r.allies())r.buff(u,t,'Nike A2',{damage:bonus});}},
 resolve(r,u,k){return k==='Basic'?{name:'Ember Before the Laurel',ratio:.7}:k==='Skill'?{name:'Wings Over the Breaking Line',support:true}:{name:'Victory Descends Before the Crown',ratio:.8,aoe:true,efficiency:1,energyCost:130};},
 after(r,u,a){if(a.ability==='Skill')for(const t of r.allies())r.buff(u,t,'Khải Lộ',{efficiency:r.vm(u,6)?.65:.5},3,{scoped:{resPen:r.vm(u,1)?.2:0}});if(a.source==='Ult')for(const t of r.allies())r.buff(u,t,'Đường Thắng',{pierce:r.vm(u,6)?.28:.08},2);},
 trigger(r,u,t,ally,a,broken){const origin=a.originActionId??a.uid;if(!r.once(u,'Nike '+t.index,origin))return;r.queue(u,{name:'Vũ Hỏa Khải Hoàn',source:'Diệt Kích',atkScaledDK:true,ratio:.9,splash:.4,blast:true,target:t.index,toughness:0,energy:0,allowUnbrokenDK:true,bonus:r.vm(u,4)?1:0,originActionId:origin,nikeBreak:broken},a);if(r.asc(u)&&r.once(u,'Nike A3'))r.gain(u,5);if(broken&&r.vm(u,2)&&r.once(u,'Nike VM2 '+ally.index))r.advance(ally,.12);},
 event(r,u,type,e){
  if(type==='break'&&r.asc(u)&&r.effect(u,e.unit,'Khải Lộ'))r.buff(u,e.unit,'Nike A1',{break:.2},2);
  if(type==='breakResolved'&&e.unit!==u)nikeKit.trigger(r,u,e.target,e.unit,e.action,true);
  if(type==='hit'&&r.vm(u,4)&&e.unit!==u&&(e.action.source==='Diệt Kích'||e.action.countsAsDK))nikeKit.trigger(r,u,e.target,e.unit,e.action,false);
  if(type==='hit'&&e.unit===u&&e.action.name==='Vũ Hỏa Khải Hoàn'&&e.action.nikeBreak&&r.vm(u,6)&&e.target.index===e.action.primaryTarget)r.queue(u,{name:'Nike VM6',source:'Diệt Kích',auxiliary:true,fixedDamage:e.calculated*.5,allowUnbrokenDK:true,target:e.target.index,toughness:0,energy:0,originActionId:e.action.originActionId},e.action);
 }
};
