export const darianKit={
 minor:{speed:8,elementDamage:.078,atk:.1},
 resolve(r,u,k){return k==='Basic'?{name:'Linebreaker',ratio:.85}:k==='Skill'?{name:'Breach Pattern',ratio:1.45,splash:.8,blast:true,efficiency:.25,cost:r.state(u).free?0:1}:{name:'Hard Entry',ratio:1.9,splash:1.1,blast:true,efficiency:.35,energyCost:120};},
 before(r,u,a){if(a.source==='Skill')r.state(u).free=false;},
 event(r,u,type,e){if(e.unit!==u)return;if(type==='break'){r.buff(u,u,'Xung Kích',{damage:.22,critDmg:r.vm(u,2)?.1:0,atk:r.vm(u,4)?.15:0},r.asc(u)?2:1);if(r.asc(u))r.gain(u,8);if(r.vm(u,6)&&r.once(u,'VM6'))r.state(u).free=true;}if(type==='modify'&&e.target.toughness>0){if(r.asc(u))e.bonus+=.1;if(r.vm(u,1)&&['Skill','Ult'].includes(e.action.source))e.efficiency+=.1;}}
};
