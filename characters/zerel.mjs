export const zerelKit={
 minor:{hit:.18,elementDamage:.078,atk:.1},
 dot(r,u,t){return t.dots.find(d=>d.owner===u.index&&d.name==='Điện Tích');},
 charge(r,u,t,count,a,reapply=false){const old=zerelKit.dot(r,u,t),total=Math.min(5,(old?.stacks||0)+count);if(!r.dot(u,t,'Điện Tích',.28,2,a))return;const d=zerelKit.dot(r,u,t);d.stacks=total;if(total>=5&&!reapply&&r.once(u,'Quá Tải '+t.index,a.uid)){const other=t.dots.some(d=>d.name!=='Điện Tích');t.dots=t.dots.filter(d=>d!==zerelKit.dot(r,u,t));r.queue(u,{name:'Quá Tải',source:'Extra',ratio:r.vm(u,1)?2.1:1.8,target:t.index,toughness:0,energy:0,bonus:r.vm(u,6)&&other?.25:0},a);if(r.asc(u)){if(r.once(u,'Quá Tải NL'))r.gain(u,5);zerelKit.charge(r,u,t,r.vm(u,6)?2:1,a,true);}}},
 sync(r,u){if(r.vm(u,4)){const active=r.enemies().some(t=>zerelKit.dot(r,u,t));r.buff(u,u,'VM4',{atk:active?.18:0,hit:active?.1:0});}},
 resolve(r,u,k){return k==='Basic'?{name:'Static Touch',ratio:.75}:k==='Skill'?{name:'Charge Burial',ratio:.9}:{name:'Blackout Sequence',ratio:.85,aoe:true,energyCost:120};},
 before(r,u,a){a.priorCharges=Object.fromEntries(r.enemies().map(t=>[t.index,zerelKit.dot(r,u,t)?.stacks||0]));},
 after(r,u,a,targets){if(!r.attack(a)||a.source==='FUA')return;for(const i of targets){const t=r.ctx.enemies[i];if(a.source==='Basic'&&(a.priorCharges[i]||0)>0&&r.once(u,'BA'))zerelKit.charge(r,u,t,1,a);if(a.source==='Skill')zerelKit.charge(r,u,t,r.vm(u,1)?3:2,a);if(a.source==='Ult')zerelKit.charge(r,u,t,1+((a.priorCharges[i]||0)>=3?1:0),a);}},
 event(r,u,type,e){if(!e.target||e.unit!==u||e.action?.effectName!=='Điện Tích')return;const stacks=zerelKit.dot(r,u,e.target)?.stacks||0;if(type==='modify'&&r.asc(u)&&stacks>=3)e.bonus+=.15;if(type==='hit'&&r.vm(u,2)&&stacks>=4)r.buff(u,e.target,'VM2',{},1,{incoming:{vulnerability:.12},sources:['DoT'],debuff:true});}
};
