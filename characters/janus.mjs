import {normalizeElement} from '../formulas.mjs';
export const janusKit={
 minor:{break:.24,speed:8,atk:.1},
 resolve(r,u,k){return k==='Basic'?{name:'First Horn at the Threshold',ratio:.9}:k==='Skill'?{name:'Ashes on Both Sides',support:true}:{name:'Open the Red Gate',ratio:1.4,energyCost:130};},
 after(r,u,a,targets){if(a.ability==='Skill')for(const t of r.allies())r.buff(u,t,'Dấu Hỏa Dương',{break:r.vm(u,1)?.48:.36},3);if(a.source==='Ult')for(const i of targets)r.buff(u,r.ctx.enemies[i],'Hồng Môn',{},2,{type:'weakness',element:'Hỏa',debuff:true});},
 before(r,u,a){if(a.name==='The Ram Comes Through'){const t=r.ctx.enemies[a.primaryTarget??a.target];if(t?.toughness===0){a.dkOnly=true;a.countsAsDK=true;a.damageSource='Diệt Kích';a.dkMultiplier=1.5;a.target=t.index;a.targets=1;a.targetIndices=[t.index];}}},
 observe(r,u,{unit,action:a,targets}){if(unit===u||!targets.size||!r.attack(a)||!r.effect(u,u,'Mặt Sau — Hỏa Dương'))return;const s=r.state(u);if(s.ramTurn!==u.turn){s.ramTurn=u.turn;s.rams=0;}if(s.rams>=(r.vm(u,6)?3:2))return;const original=r.ctx.enemies[a.primaryTarget??a.target],t=r.alive(original)?original:r.enemies().sort((a,b)=>b.hp-a.hp)[0];if(t){s.rams++;r.queue(u,{name:'The Ram Comes Through',ratio:1.2,splash:.5,blast:true,target:t.index,energy:5,efficiency:.6,resPen:r.vm(u,6)?.2:0},a);}},
 event(r,u,type,e){const a=e.action,s=r.state(u);
  if(type==='modify'){
   if(r.asc(u)&&normalizeElement(e.unit.element)==='Hỏa'){const count=r.allies().filter(t=>normalizeElement(t.element)==='Hỏa').length;e.resPen+=[0,.05,.1,.15,.25,.4][count];}
   if(normalizeElement(e.unit.element)==='Hỏa'&&r.effect(u,e.target,'Hồng Môn'))e.efficiency+=.15;
   if(e.unit===u&&a.name==='The Ram Comes Through'&&e.target.toughness===0&&r.asc(u))e.pen+=.12;
   if((a.source==='Diệt Kích'||a.countsAsDK)&&e.target.toughness===0){if(r.effect(u,e.target,'Janus VM2'))e.vulnerability+=.2;if(r.vm(u,6)&&r.effect(u,e.target,'Hồng Môn')&&e.target.weaknesses.includes('Hỏa'))e.vulnerability+=.15;}
  }
  if(type==='break'){
   r.buff(u,u,'Mặt Sau — Hỏa Dương',{break:.5},r.vm(u,6)?3:2);
   if(r.asc(u)&&r.once(u,'Janus A3',a.uid)){r.gain(u,10);r.advance(u,.25);}
   if(r.vm(u,1)&&r.effect(u,e.unit,'Dấu Hỏa Dương')&&r.once(u,'Janus VM1',a.uid))r.gain(u,5);
   if(r.vm(u,2)&&r.effect(u,e.target,'Hồng Môn'))r.buff(u,e.target,'Janus VM2',{},null,{debuff:true});
  }
  if(type==='recover')r.remove(u,e.enemy,'Janus VM2');
  if(type==='hit'&&r.vm(u,4)&&e.unit!==u&&normalizeElement(e.unit.element)==='Hỏa'&&(a.source==='Diệt Kích'||a.countsAsDK)&&r.effect(u,u,'Mặt Sau — Hỏa Dương')){if(s.dkTurn!==u.turn){s.dkTurn=u.turn;s.dkUses=0;}if(s.dkUses<4){s.dkUses++;r.queue(u,{name:'Janus VM4',source:'Diệt Kích',allowUnbrokenDK:true,auxiliary:true,dkMultiplier:.5,target:e.target.index,toughness:a.toughness||20,energy:0,originActionId:a.originActionId??a.uid},a);}}
 }
};
