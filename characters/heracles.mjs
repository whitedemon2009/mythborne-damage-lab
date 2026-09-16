export const heraclesKit={
 minor:{break:.24,speed:8,atk:.1},
 sync(r,u){const active=r.enemies().some(t=>r.effect(u,t,'Gãy Trụ'));if(r.vm(u,4))r.buff(u,u,'Heracles VM4',{break:active?.3:0,efficiency:active?.15:0});},
 resolve(r,u,k){const enhanced=(r.state(u).labors||0)>0;return k==='Basic'?{name:enhanced?'A Labor Worth Remembering':'A Weight Meant for Giants',ratio:enhanced?2:1,...(enhanced?{blast:true,splash:.7}:{}),enhanced,efficiency:enhanced?0:.35,annihilate:enhanced}:k==='Skill'?{name:'Bring Down the Pillar',ratio:1.1,efficiency:.5,annihilate:true,dkMultiplier:.7}:{name:'Twelve Labors, One Answer',ratio:1.2,aoe:true,efficiency:.5,annihilate:true,dkMultiplier:.8,energyCost:140};},
 before(r,u,a){a.heraclesBroken=new Set();},
 after(r,u,a){const s=r.state(u);if(a.source==='Skill'){const t=r.ctx.enemies[a.primaryTarget];if(r.debuff(u,t,'Gãy Trụ',2,a))r.buff(u,t,'Gãy Trụ',{},2,{debuff:true});if(s.lastLabor){s.lastLabor=false;r.gain(u,5);}}
  if(a.source==='Ult'){s.labors=Math.min(4,(s.labors||0)+(r.vm(u,1)?4:3));s.free=r.vm(u,6)?2:0;r.advance(u,r.vm(u,1)?1:.5);}
  if(a.source==='Basic'&&a.enhanced){if(s.free>0)s.free--;else{s.labors--;if(s.labors===0)s.lastLabor=true;}if(r.asc(u)&&a.dkTargets?.size)r.gain(u,5);}
 },
 event(r,u,type,e){const a=e.action;
  if(type==='modify'){
   if(r.effect(u,e.target,'Gãy Trụ')){e.efficiency+=.08;if(e.target.toughness===0){if(a.source==='Diệt Kích')e.dkBonus+=.05;if(r.asc(u))e.enemy.defReduction=(e.enemy.defReduction||0)+.05;}}
   if(e.unit===u){if(a.ability==='Basic'&&a.enhanced)e.efficiency+=e.target.index===a.primaryTarget?.9:.4;
    if(a.source==='Diệt Kích'){if(a.ability==='Basic'&&a.enhanced){a.dkMultiplier=(a.heraclesBroken?.has(e.target.index)?1.5:1.4)-(e.target.index===a.primaryTarget?0:.8);if(r.vm(u,6))e.pen+=.2;}if(r.effect(u,e.target,'Gãy Trụ'))e.dkBonus+=.1+(r.asc(u)&&a.ability==='Basic'&&a.enhanced?.25:0);}
   }
  }
  if(type==='break'&&e.unit===u)a.heraclesBroken?.add(e.target.index);
  if(type==='hit'&&e.unit===u&&a.source==='Diệt Kích'&&a.ability==='Basic'&&a.enhanced&&r.vm(u,2)&&!a.heraclesRepeat&&r.effect(u,e.target,'Gãy Trụ'))r.queue(u,{name:'Heracles VM2',source:'Diệt Kích',auxiliary:true,fixedDamage:e.calculated*.5,heraclesRepeat:true,target:e.target.index,toughness:0,energy:0},a);
 }
};
