export const serenKit={
 minor:{hp:.12,def:.12,speed:6},
 init(r,u){if(r.asc(u))for(const t of r.allies())r.shieldValue(u,t,.04*r.eff(u).hp,1,{ability:'Passive'});},
 sync(r,u){for(const t of r.allies()){const shielded=t.shieldLayers.some(l=>l.owner===u.index&&l.value>0);r.buff(u,t,'Khiên Seren',{reduction:r.asc(u)&&shielded?.06:0,speedPct:r.vm(u,4)&&shielded?.1:0});}},
 resolve(r,u,k){return k==='Basic'?{name:'Quiet Weight',ratio:.65}:k==='Skill'?{name:'Common Ground',support:true}:{name:'Stay Together',support:true,energyCost:120};},
 after(r,u,a){const c=r.eff(u);if(['Skill','Ult'].includes(a.ability))for(const t of r.allies())r.shieldValue(u,t,a.ability==='Skill'?(.08*c.def+.05*c.hp)*(r.vm(u,1)?1.1:1):.14*c.def+.07*c.hp,2,a);},
 event(r,u,type,e){if(type!=='shieldAttack')return;const s=r.state(u),threshold=r.vm(u,2)?4:5;s.pressure=Math.min(threshold,(s.pressure||0)+1);if(s.pressure<threshold||!r.once(u,'Shared Burden'))return;s.pressure=0;const c=r.eff(u);for(const t of r.allies()){for(const l of t.shieldLayers)if(l.owner===u.index&&l.value>0)l.value+=.05*c.hp*(r.vm(u,6)?1.5:1);t.shields=t.shieldLayers.map(l=>l.value);const old=r.effect(u,t,'Shared Burden'),attack=r.eff(t).atk-(old?.mods.atkFlat||0);r.buff(u,t,'Shared Burden',{atkFlat:Math.min(.2*attack,.2*c.def)},r.vm(u,6)?3:2);}if(r.asc(u))r.gain(u,4);}
};
