export const durgaKit={
 minor:{atk:.18,speed:8,elementDamage:.1},
 init(r,u){if(r.asc(u)){for(const t of r.allies())r.shield(u,t,.08,200,1,{source:'Passive',ability:'Passive'});r.state(u).tiger=1;}},
 sync(r,u){if(r.asc(u))r.buff(u,u,'A3',{FUADamage:.2});if(r.vm(u,4))r.buff(u,u,'VM4',{critDmg:.6,elementDamage:.2});if(r.vm(u,1)){const n=r.enemies().length;for(const t of r.allies())if(t.aspect==='Mjolnir')r.buff(u,t,'VM1',{damage:n>=5?.25:n>=3?.35:n>=1?.75:0});}},
 resolve(r,u,k){if(k==='Basic')return {name:'Ivory Fang',ratio:.8};if(k==='Skill')return {name:'White Tiger Holds the Gate',ratio:.85,aoe:true};if(k==='Ult')return {name:'Five Claws Beneath the Gale',ratio:1.5,aoe:true};},
 before(r,u,a){if(['Skill','Ult'].includes(a.source))for(const t of r.allies())r.shield(u,t,a.source==='Skill'?.15:.2,a.source==='Skill'?380:560,2,a);},
 after(r,u,a,targets){const s=r.state(u);
  if(['Skill','Ult'].includes(a.source)){for(const i of targets){const t=r.ctx.enemies[i];if(r.debuff(u,t,'Hổ Văn',2,a)){r.buff(u,t,'Hổ Văn',{vulnerability:.08},2,{debuff:true});r.ctx.gear.dispatch('debuff',{unit:u,target:t,action:a});}}if(a.source==='Ult')s.tiger=Math.min(3,(s.tiger||0)+2);if(a.source==='Skill'&&r.vm(u,2)&&targets.size>=3)s.tiger=Math.min(3,(s.tiger||0)+1);}
  if(a.source==='FUA')for(const t of r.allies()){const layer=t.shieldLayers.find(l=>l.key===r.shieldKey(u)&&l.value>0);if(layer){layer.value=Math.min(layer.initial,layer.value+layer.initial*.3);t.shields=t.shieldLayers.map(l=>l.value);r.log(u,`phục hồi Khiên cho ${t.name}: ${layer.value.toFixed(2)}/${layer.initial.toFixed(2)}`);}}
 },
 observe(r,u,{unit:t,action:a,targets}){const s=r.state(u);if(a.characterId===u.characterId&&a.source==='FUA')return;if(targets.size>=3&&r.attack(a)&&t.shieldLayers.some(l=>l.key===r.shieldKey(u)&&l.value>0))s.tiger=Math.min(3,(s.tiger||0)+1);if((s.tiger||0)>=(r.vm(u,6)?2:3)){s.tiger=0;r.queue(u,{name:'Tiger’s Talon',source:'FUA',aoe:true,ratio:r.vm(u,6)?2.5:1.1,trueDamage:r.vm(u,6)},a);}},
 event(r,u,type,e){if(type!=='modify')return;if(r.effect(u,e.target,'Hổ Văn')&&e.unit.aspect==='Mjolnir')e.vulnerability+=.06;if(e.unit===u){if(r.asc(u))e.action.forceCrit=true;if(e.action.source==='FUA'&&r.asc(u)&&r.effect(u,e.target,'Hổ Văn'))e.pen+=.15;}}
};
