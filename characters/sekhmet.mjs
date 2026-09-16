export const sekhmetKit={
 minor:{hit:.18,speed:5,elementDamage:.1},
 mark(r,u,t,a,origin){if(!r.debuff(u,t,'Thánh Thập',3,a))return;const old=r.effect(u,t,'Thánh Thập');return r.buff(u,t,'Thánh Thập',{},3,{debuff:true,kinds:old?.kinds||[],origin});},
 init(r,u){if(r.asc(u)){const mid=(r.ctx.enemies.length-1)/2,t=r.enemies().sort((a,b)=>b.maxHP-a.maxHP||Math.abs(a.index-mid)-Math.abs(b.index-mid))[0];if(t)sekhmetKit.mark(r,u,t,{},'Passive');}},
 sync(r,u){if(r.vm(u,4))r.buff(u,u,'Sekhmet VM4',{hit:.2,speed:10});},
 resolve(r,u,k){return k==='Basic'?{name:'Lioness Draws the Circle',ratio:.8,toughness:30}:k==='Skill'?{name:'Mark the Four Corners',ratio:1,splash:.5,blast:true,toughness:60}:{name:'The Sun Turns on the Quarry',ratio:1,aoe:true,toughness:60,energyCost:120};},
 before(r,u,a){if(a.source==='Skill')a.targetToughness=Object.fromEntries(a.targetIndices.map(i=>[i,i===a.primaryTarget?60:30]));},
 after(r,u,a,targets){
  if(a.source==='Skill'){const s=r.state(u),old=r.ctx.enemies[s.skillTarget],t=r.ctx.enemies[a.primaryTarget];if(old&&old!==t&&r.effect(u,old,'Thánh Thập')?.origin==='Skill')r.remove(u,old,'Thánh Thập');const b=sekhmetKit.mark(r,u,t,a,'Skill');if(b){s.skillTarget=t.index;if(r.vm(u,1)&&!b.kinds.includes('Skill'))b.kinds.push('Skill');}}
  if(a.source==='Ult'){for(const i of targets)sekhmetKit.mark(r,u,r.ctx.enemies[i],a,'Ult');r.buff(u,u,'Săn Đuổi',{},2);}
  if(a.source==='Extra')for(const i of targets){const t=r.ctx.enemies[i];if(r.debuff(u,t,'Kết Tội',2,a))r.buff(u,t,'Kết Tội',{defReduction:.2,vulnerability:.25,resist:r.asc(u)?-.15:0},2,{debuff:true});if(r.vm(u,2))r.delay(t,.05);}
 },
 event(r,u,type,e){if(type!=='hit'||!['Basic','Skill','Ult','FUA'].includes(e.action.source)||e.amount<=0)return;const b=r.effect(u,e.target,'Thánh Thập');if(!b)return;e.action.sekhmetTargets??={};e.action.sekhmetTargets[u.index]??=new Set();e.action.sekhmetTargets[u.index].add(e.target.index);if(!b.kinds.includes(e.action.source)){b.kinds.push(e.action.source);if(r.asc(u)&&r.once(u,'Sekhmet A2',e.action.uid))r.gain(u,3);}},
 observe(r,u,{action:a}){const hunt=!!r.effect(u,u,'Săn Đuổi');for(const i of a.sekhmetTargets?.[u.index]||[]){const t=r.ctx.enemies[i],b=r.effect(u,t,'Thánh Thập');if(!b||b.kinds.length<(hunt?2:3)||!r.once(u,'Sekhmet '+i,a.uid))continue;b.kinds=r.vm(u,6)?[a.source]:[];r.queue(u,{name:"Stone Lion's Verdict",source:'Extra',ratio:hunt?1.8:1.2,target:i,toughness:0,energy:0},a);}}
};
