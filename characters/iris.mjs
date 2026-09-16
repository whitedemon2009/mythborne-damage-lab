export const irisKit={
 minor:{speed:8,hp:.12,def:.1},
 init(r,u){if(r.asc(u))r.buff(u,u,'A1',{speed:6},1);},
 resolve(r,u,k){return k==='Basic'?{name:'Light Step',ratio:.7}:k==='Skill'?{name:'Ahead of Time',support:true,needsRecipient:true}:{name:'Everyone, Move',support:true,energyCost:120};},
 after(r,u,a){if(a.ability==='Skill'){const t=r.ctx.units[a.recipient],slower=r.eff(t).speed<r.eff(u).speed;r.buff(u,t,'Ahead of Time',{speed:18+(r.asc(u)?2:0)+(r.vm(u,1)?4:0),atk:slower?.1:0,critDmg:r.vm(u,2)?.08:0},2);if(r.vm(u,4))r.buff(u,u,'VM4',{speed:8},2);r.allySkill(u,t,a);}if(a.ability==='Ult')for(const t of r.allies())r.buff(u,t,'Everyone, Move',{speed:10,damage:r.effect(u,t,'Ahead of Time')?.08:0},2);},
 event(r,u,type,e){if(type!=='turnStart')return;const t=e.unit;if(!r.effect(u,t,'Ahead of Time')&&!r.effect(u,t,'Everyone, Move'))return;const s=r.state(u);s.rhythm=Math.min(3,(s.rhythm||0)+1);if(s.rhythm>=3&&r.once(u,'Nhịp Dẫn')){s.rhythm=0;r.planck(u,1);if(r.asc(u)){const fastest=r.allies().filter(t=>t!==u).sort((a,b)=>r.eff(b).speed-r.eff(a).speed)[0];if(fastest)r.buff(u,fastest,'A3',{atk:.1},1);}if(r.vm(u,6))for(const ally of r.allies())if(r.effect(u,ally,'Ahead of Time'))r.advance(ally,.1);}}
};
