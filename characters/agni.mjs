export const agniKit={
 minor:{atk:.18,critDmg:.08,elementDamage:.1},
 sync(r,u){const s=r.state(u);if(s.partner!==undefined&&(!r.alive(r.ctx.units[s.partner])||!r.effect(u,u,'Đồng Hỏa'))){for(const t of r.ctx.units)r.remove(u,t,'Đồng Hỏa');s.partner=undefined;}if(r.vm(u,1))r.buff(u,u,'VM1',{FUADamage:.36});if(r.vm(u,4))r.buff(u,u,'VM4',{crit:.12});},
 resolve(r,u,k){
  if(k==='Basic')return {name:'Ember-Cleaving Edge',ratio:1,toughness:30};
  if(k==='Skill')return {name:'Kindle the Chosen',ratio:2,toughness:30,aoe:true,otherRecipient:true};
  if(k==='Ult')return {name:'Crown of the First Flame',ratio:3.2,toughness:60,aoe:true};
 },
 fua(r,u,parent,free=false){const s=r.state(u),enhanced=free||(s.flame||0)>0;if(enhanced&&!free)s.flame--;r.queue(u,{name:enhanced?'Sunwheel Incarnate':'Sevenfold Pyre',source:'FUA',ratio:enhanced?3.2:1.6,toughness:enhanced?60:30,aoe:true,enhanced},parent);},
 after(r,u,a){const s=r.state(u);
  if(a.source==='Skill'){for(const t of r.ctx.units)r.remove(u,t,'Đồng Hỏa');s.partner=a.recipient;r.buff(u,u,'Đồng Hỏa',{FUADamage:.3},3,{clockOwner:u.index});r.buff(u,r.ctx.units[a.recipient],'Đồng Hỏa',{damage:.2+(r.vm(u,2)?.35:0)},3,{clockOwner:u.index});r.ctx.gear.dispatch('allySkill',{unit:u,target:r.ctx.units[a.recipient],action:a});if(r.asc(u)&&!s.firstSkill){s.firstSkill=true;s.seeds=Math.min(16,(s.seeds||0)+4);r.planck(u,1);}}
  if(a.source==='Ult'){s.flame=Math.min(r.vm(u,6)?2:1,(s.flame||0)+(r.vm(u,6)?2:1));if(r.vm(u,6))agniKit.fua(r,u,a,true);}
  if(a.source==='FUA'){if(a.enhanced&&r.asc(u))r.gain(u,15);if(r.vm(u,2)&&s.partner!==undefined)r.advance(r.ctx.units[s.partner],.25);}
 },
 observe(r,u,{unit:t,action:a,targets}){const s=r.state(u);if(t===u||t.index!==s.partner||!r.effect(u,u,'Đồng Hỏa')||!targets.size||!r.attack(a))return;s.seeds=Math.min(16,(s.seeds||0)+Math.min(5,targets.size));const threshold=r.vm(u,1)?6:8;r.log(u,`‘Hỏa Chủng’ ${s.seeds}/16`);if(s.seeds>=threshold){s.seeds-=threshold;agniKit.fua(r,u,a);}},
 event(r,u,type,e){if(type==='modify'&&e.unit===u&&e.action.source==='FUA'){if(r.effect(u,u,'Đồng Hỏa')){if(r.asc(u))e.resPen+=.12;if(r.vm(u,4))e.critDmg+=.3;}if(r.vm(u,6)&&e.action.enhanced)e.pen+=.2;}}
};
