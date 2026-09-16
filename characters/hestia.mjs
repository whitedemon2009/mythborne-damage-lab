import {normalizeElement} from '../formulas.mjs';
export const hestiaKit={
 minor:{hp:.25,speed:8,energy:.04},
 sync(r,u){if(r.vm(u,1))for(const t of r.allies())r.buff(u,t,'Hestia VM1',{efficiency:.5});for(const t of r.enemies())if(t.toughness>0){r.remove(u,t,'Hestia VM2');r.remove(u,t,'Hestia VM6');}},
 resolve(r,u,k){return k==='Basic'?{name:'Ember Waltz',ratio:.7}:k==='Skill'?{name:'Supper Before the Hearth Dies',ratio:.8}:{name:'All Lights Return Home',support:true,energyCost:130};},
 after(r,u,a){if(a.source==='Skill')for(const t of r.allies())r.buff(u,t,'Dạ Yến Hồng Lô',{},3);if(a.ability==='Ult')for(const t of r.allies())r.heal(u,t,.11,180,a);},
 observe(r,u,{unit:t,action:a,targets}){for(const i of a.hestiaCandidates?.[u.index]||[]){const enemy=r.ctx.enemies[i];if(!r.alive(enemy)||enemy.toughness===0||!targets.has(i))continue;r.queue(t,{name:'Dạ Yến Hồng Lô',source:'Diệt Kích',auxiliary:true,target:i,toughness:a.baseToughnessByTarget?.[i]??a.toughness,efficiency:a.efficiency||0,dkMultiplier:r.vm(u,6)?1:.7,allowUnbrokenDK:true,energy:0,hestiaOwner:u.index,hestiaAction:a.uid,pen:r.asc(u)&&normalizeElement(t.element)==='Hỏa'?.1:0,resPen:r.vm(u,1)&&normalizeElement(t.element)==='Hỏa'?.15:0},a);}},
 event(r,u,type,e){
  if(type==='hit'&&r.attack(e.action)&&e.amount>0&&!e.brokenBefore&&r.effect(u,e.unit,'Dạ Yến Hồng Lô')){e.action.hestiaCandidates??={};e.action.hestiaCandidates[u.index]??=new Set();e.action.hestiaCandidates[u.index].add(e.target.index);}
  if(type==='hit'&&e.action.hestiaOwner===u.index){if(r.asc(u)&&r.once(u,'Hestia A1 '+e.unit.index,e.action.hestiaAction))r.heal(u,e.unit,.02,40,e.action);if(r.vm(u,2))r.buff(u,e.target,'Men Nứt',{},2,{debuff:true});}
  if(type==='break'){
   if(r.vm(u,2)&&r.effect(u,e.target,'Men Nứt'))r.buff(u,e.target,'Hestia VM2',{},null,{incoming:{dkBonus:.15},sources:['Diệt Kích'],debuff:true});
   if(r.vm(u,6)&&r.allies().some(t=>r.effect(u,t,'Dạ Yến Hồng Lô')))r.buff(u,e.target,'Hestia VM6',{},null,{incoming:{dkBonus:.2},sources:['Diệt Kích'],debuff:true});
   if(!r.once(u,'Hestia Talent',e.action.uid))return;
   for(const t of r.allies()){r.heal(u,t,.04,80,e.action,t.currentHP<r.eff(t).hp*.5?1.25:1);if(r.vm(u,4))r.buff(u,t,'Hestia VM4',{break:.2},2);}
   if(r.asc(u)){r.gain(u,5);for(const t of r.enemies())r.delay(t,.05);}
  }
 }
};
