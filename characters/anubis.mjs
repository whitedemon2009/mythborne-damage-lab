export const anubisKit={
 minor:{hit:.18,elementDamage:.078,atk:.12},
 sync(r,u){if(r.vm(u,2))for(const t of r.enemies())r.buff(u,t,'Anubis VM2',{},null,{incoming:{vulnerability:.25},sources:['DoT'],debuff:true});},
 resolve(r,u,k){return k==='Basic'?{name:'Weight of Dust',ratio:.9}:k==='Skill'?{name:'Seal of the Black Scale',ratio:1.45,splash:.75,blast:true}:{name:'Hall of the Final Measure',ratio:1.5,aoe:true,energyCost:130};},
 before(r,u,a){if(a.source==='Skill')a.otherDots=new Set(r.enemies().filter(t=>t.dots.some(d=>d.name!=='Tử Lôi')).map(t=>t.index));if(r.state(u).pure&&r.attack(a)){a.trueDamage=true;r.state(u).pure=false;}},
 after(r,u,a,targets){const s=r.state(u);
  if(a.source==='Skill')for(const i of targets)r.dot(u,r.ctx.enemies[i],'Tử Lôi',.7,2,a);
  if(a.source==='Ult'){
   let count=0;for(const i of targets){const t=r.ctx.enemies[i];if(t.dots.length)count++;if(r.debuff(u,t,'Cân Tử',2,a))r.buff(u,t,'Cân Tử',{},2,{incoming:{vulnerability:.18},sources:['DoT'],debuff:true});for(const d of [...t.dots])r.tick(u,t,d,.6,a);}
   if(r.asc(u)&&count>=3)r.gain(u,5);if(r.vm(u,4))s.pure=true;
  }
  if(a.source==='FUA'){
   for(const i of targets){const t=r.ctx.enemies[i];for(const d of [...t.dots]){const own=d.owner===u.index&&d.name==='Tử Lôi';if(own)r.tick(u,t,d,.5,a);else if(r.asc(u))r.tick(u,t,d,.25,a);if(r.vm(u,6))r.tick(u,t,d,.5,a);}}
   if(r.vm(u,6)){s.weight=2;r.buff(u,u,'Anubis VM6',{},2,{scoped:{resPen:.2}});}
  }
 },
 event(r,u,type,e){
  if(type==='modify'&&e.unit===u){if(e.action.source==='Skill'&&e.action.otherDots?.has(e.target.index))e.bonus+=.2;if(r.asc(u)&&e.action.effectName==='Tử Lôi'&&e.target.dots.some(d=>d.name!=='Tử Lôi'))e.bonus+=.2;}
  if(type!=='after'||e.action.source!=='DoT'||!e.targets?.size)return;
  const s=r.state(u);if(r.vm(u,4))r.gain(u,2);
  const group=e.action.dotGroup;if(s.group!==group){s.group=group;s.counts={};}
  for(const i of e.targets){s.counts[i]??=0;if(s.counts[i]>=3)continue;s.counts[i]++;s.weight=Math.min(r.vm(u,1)?5:6,(s.weight||0)+1);}
  if(s.weight<(r.vm(u,1)?5:6))return;
  const target=r.enemies().sort((a,b)=>new Set(b.dots.map(d=>d.name)).size-new Set(a.dots.map(d=>d.name)).size||b.hp-a.hp)[0];if(!target)return;
  const queued=r.queue(u,{name:'Final Weighing',source:'FUA',ratio:r.vm(u,1)?2:1.6,target:target.index},e.action);if(queued)s.weight=0;
 }
};
