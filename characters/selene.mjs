export const seleneKit={
 minor:{crit:.104,elementDamage:.078,atk:.12},
 resolve(r,u,k){return k==='Basic'?{name:'Quick Spark',ratio:.8}:k==='Skill'?{name:'Scatterline',ratio:.95,aoe:true}:{name:'Second Chorus',ratio:1.45,aoe:true,energyCost:120};},
 after(r,u,a,targets){if(a.source==='Ult')r.buff(u,u,'Hợp Âm',{},2,{extended:false});if(a.source==='FUA'){if(r.vm(u,4))r.buff(u,u,'VM4',{atk:.12},1);const b=r.effect(u,u,'Hợp Âm');if(r.vm(u,2)&&targets.size>=4&&b&&!b.extended){b.extended=true;b.duration++;}}if(r.asc(u)&&['Skill','FUA'].includes(a.source)&&targets.size>=4)r.gain(u,5);},
 observe(r,u,{unit:t,action:a,targets}){if(t===u||!r.attack(a)||targets.size<3)return;const s=r.state(u),chorus=!!r.effect(u,u,'Hợp Âm');if(s.turn!==u.turn){s.turn=u.turn;s.used=0;}if((s.used||0)>=(r.vm(u,6)&&chorus?3:2))return;s.used=(s.used||0)+1;r.queue(u,{source:'FUA',name:'Echo Step',aoe:true,ratio:chorus?.8:r.vm(u,1)?.65:.55},a);},
 event(r,u,type,e){if(type==='modify'&&e.unit===u&&r.asc(u)){if(e.action.source==='FUA'&&e.target.toughness===0)e.bonus+=.15;if(e.action.source==='Skill'&&r.effect(u,u,'Hợp Âm'))e.bonus+=.15;}}
};
