export const nepheleKit={
 minor:{atk:.12,hit:.18,speed:8},
 key(u){return 'character-shield:'+u.index+':Vân Mạc';},
 shielded(r,u,t){return t.shieldLayers.find(l=>l.key===nepheleKit.key(u)&&l.value>0);},
 shieldAll(r,u,ratio,flat,duration,a){for(const t of r.allies())r.shieldValue(u,t,ratio*r.eff(u).atk+flat,duration,a,nepheleKit.key(u));},
 restore(r,u,mult=1){const candidates=r.allies().map(t=>({t,l:nepheleKit.shielded(r,u,t)})).filter(x=>x.l).sort((a,b)=>a.l.value-b.l.value);if(!candidates.length)return;const {t,l}=candidates[0],amount=(.1*r.eff(u).atk+80)*mult;l.value=Math.min(l.initial,l.value+amount);t.shields=t.shieldLayers.map(x=>x.value);},
 applyWind(r,u,t,a,fromAttack=false){const hadOther=t.dots.some(d=>d.name!=='Phong Thực');if(!r.dot(u,t,'Phong Thực',r.vm(u,1)?1.25:.9,2,a,1))return false;if(r.vm(u,1)&&hadOther&&r.once(u,'Nephele VM1 '+t.index))nepheleKit.restore(r,u);if(fromAttack&&r.vm(u,6)){const s=r.state(u);if(s.vm6Turn!==u.turn){s.vm6Turn=u.turn;s.vm6Uses=0;}if(s.vm6Uses<3){s.vm6Uses++;r.triggerDots(u,t,{multiplier:1},a);}}return true;},
 resolve(r,u,k){return k==='Basic'?{name:'Cloudline Etude',ratio:.8,toughness:30}:k==='Skill'?{name:'A Sky Woven for the Living',support:true}:{name:'When Every Cloud Becomes a Grave',ratio:1.4,aoe:true,toughness:90,energyCost:130};},
 after(r,u,a,targets){if(a.ability==='Skill')nepheleKit.shieldAll(r,u,.45,360,2,a);if(a.ability==='Ult'){nepheleKit.shieldAll(r,u,.6,480,2,a);for(const i of targets){const t=r.ctx.enemies[i];nepheleKit.applyWind(r,u,t,a);if(r.debuff(u,t,'Áp Thấp',2,a))r.buff(u,t,'Áp Thấp',{},2,{debuff:true});}}},
 event(r,u,type,e){const s=r.state(u);
  if(type==='shieldAttack'&&e.layers.some(l=>l.key===nepheleKit.key(u)&&l.value>0)){s.shieldChains??=new Set();s.shieldChains.add(e.chain);}
  if(type==='enemyAttackEnd'&&s.shieldChains?.has(e.chain)){s.shieldChains.delete(e.chain);nepheleKit.applyWind(r,u,e.enemy,{actor:u.index,chain:e.chain,uid:'nephele:'+e.chain},true);}
  if(type==='dotEnd'){
   const key=e.target.index+':'+e.target.turn;s.restoreUses??={};if((s.restoreUses[key]||0)<4){s.restoreUses[key]=(s.restoreUses[key]||0)+1;const layer=r.allies().map(t=>nepheleKit.shielded(r,u,t)).filter(Boolean).sort((a,b)=>a.value-b.value)[0];nepheleKit.restore(r,u,r.asc(u)&&layer&&layer.value<layer.initial*.5?1.5:1);}
   s.dotKinds??={};const dkey=e.target.index+':'+e.target.turn;s.dotKinds[dkey]??=new Set();s.dotKinds[dkey].add(e.action.effectName);
   if(r.vm(u,2)&&e.unit===u&&e.action.effectName==='Phong Thực'&&!e.action.nepheleVM2){for(let i=0;i<2;i++)r.tick(u,e.target,e.dot,.9,{...e.action,nepheleVM2:true});}
  }
  if(type==='beforeEnemyDamage'&&r.effect(u,e.enemy,'Áp Thấp')&&nepheleKit.shielded(r,u,e.target)){e.amount*=.88;const set=s.dotKinds?.[e.enemy.index+':'+e.enemy.turn];if(r.asc(u)&&set?.size>=3)e.amount*=.92;}
  if(type==='modify'&&e.action.dot&&r.effect(u,e.target,'Áp Thấp')){e.vulnerability+=.25;if(r.vm(u,4))e.pen+=.15;}
  if(type==='modify'&&e.action.dot&&r.asc(u)){const others=new Set(e.target.dots.filter(d=>d.name!==e.action.effectName).map(d=>d.name));if(others.size>=2)e.bonus+=.25;}
 }
};
