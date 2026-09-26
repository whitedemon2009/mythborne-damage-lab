import {isIceLightningTeam} from '../element-conversion.mjs';
export const seraphineKit={
 minor:{crit:.104,critDmg:.12,elementDamage:.078},
 triumph(r){return isIceLightningTeam(r.ctx.units);},
 sync(r,u){let total=0;for(const t of r.enemies()){const b=r.effect(u,t,'Nhịp Điệu');if(!b)continue;b.mods={BăngResReduction:Math.min(.3,.03*b.charges),LôiResReduction:Math.min(.3,.03*b.charges)};total+=b.charges;}r.buff(u,u,'Khải Hoàn Nhịp Điệu',{speedPct:Math.min(.5,.05*total)});},
 resolve(r,u,k){return k==='Basic'?{name:'Thin Line',ratio:.85}:k==='Skill'?{name:'Threefold Cue',ratio:1.45,splash:.8,blast:true}:{name:'Curtain Call',ratio:1.9,splash:1.05,blast:true,energyCost:120};},
 fua(r,u,targets,a){if(!targets.length)return;const echo=!!r.effect(u,u,'Dư Âm');r.queue(u,{name:'Answering Blade',source:'FUA',target:targets[0],targetIndices:targets,targets:targets.length,primaryTarget:targets[0],ratio:(r.vm(u,1)?1.1:.95)*(r.asc(u)&&echo?1.2:1)},a);},
 after(r,u,a,targets){if(a.source==='Skill')for(const i of targets){const t=r.ctx.enemies[i],charges=Math.min(10,(r.effect(u,t,'Nhịp Điệu')?.charges||0)+1);r.buff(u,t,'Nhịp Điệu',{},2,{charges,debuff:true});}if(a.source==='Ult')r.buff(u,u,'Dư Âm',{FUADamage:.25},2);if(a.source==='FUA'){if(r.asc(u)&&targets.size>=3)r.gain(u,4);if(r.vm(u,4)){const s=r.state(u);s.followups=(s.followups||0)+1;if(s.followups%6===0)r.advance(u,.5);}}},
 observe(r,u,{unit:t,action:a,targets}){if(t===u||!r.attack(a)||!targets.size)return;const s=r.state(u);if(seraphineKit.triumph(r)){if((s.triumphFuas||0)>=6)return;s.triumphFuas=(s.triumphFuas||0)+1;seraphineKit.fua(r,u,[...targets].slice(0,3),a);return;}if(![...targets].some(i=>r.effect(u,r.ctx.enemies[i],'Nhịp Điệu')))return;seraphineKit.fua(r,u,r.enemies().filter(t=>r.effect(u,t,'Nhịp Điệu')).slice(0,3).map(t=>t.index),a);},
 event(r,u,type,e){if(type==='turnStart'&&e.unit===u)r.state(u).triumphFuas=0;if(type==='break'&&r.vm(u,2)&&r.effect(u,e.target,'Nhịp Điệu'))seraphineKit.fua(r,u,[e.target.index],e.action);if(type==='modify'&&e.unit===u&&e.action.source==='FUA'){if(r.asc(u))e.crit+=.1;if(r.vm(u,6)&&r.effect(u,u,'Dư Âm')&&e.target.index===e.action.primaryTarget)e.bonus+=.3;}}
};
