export const maniKit={
 minor:{hp:.12,speed:5,energy:.1},
 direct(a){return ['Basic','Skill','Ult','FUA','Counter','Extra','Talent'].includes(a.source);},
 partner(r,u){return r.allies().find(t=>r.effect(u,t,'Ngân Tuyến'));},
 choose(r,targets){return targets.sort((a,b)=>b.maxHP-a.maxHP||a.index-b.index)[0];},
 link(r,u,t,duration){const old=maniKit.partner(r,u),s=r.state(u);if(old&&old!==t){r.remove(u,old,'Ngân Tuyến');s.cycle=false;s.focus=null;s.transfers={};}r.buff(u,t,'Ngân Tuyến',{},duration);},
 init(r,u){if(r.asc(u)){const t=r.allies().filter(t=>t!==u).sort((a,b)=>r.eff(b).atk-r.eff(a).atk||Math.abs(a.index-u.index)-Math.abs(b.index-u.index))[0];if(t)maniKit.link(r,u,t,1);}},
 sync(r,u){if(!maniKit.partner(r,u)){r.state(u).focus=null;r.state(u).cycle=false;}},
 resolve(r,u,k){return k==='Basic'?{name:'Crescent Without Shadow',ratio:.7,toughness:30}:k==='Skill'?{name:'Follow the Silver Thread',support:true,needsRecipient:true,otherRecipient:true}:{name:'The Moon Has Chosen Where to Fall',support:true,needsRecipient:true,otherRecipient:true,energyCost:140};},
 after(r,u,a){if(['Skill','Ult'].includes(a.ability)){
  const t=r.ctx.units[a.recipient];maniKit.link(r,u,t,a.ability==='Skill'&&r.vm(u,1)?3:2);
  if(a.ability==='Skill')r.allySkill(u,t,a);
  else {r.advance(t,.5);r.buff(u,t,'Trăng Định',{},2,{pauses:0});if(r.state(u).focus===null||r.state(u).focus===undefined)r.state(u).focus=maniKit.choose(r,r.enemies())?.index;}
 }},
 observe(r,u,{unit:t,action:a,targets}){
  if(t!==maniKit.partner(r,u)||!maniKit.direct(a)||!targets.size)return;const s=r.state(u),old=s.focus;targets=new Set([...targets].map(i=>{const seen=new Set();while(s.transfers?.[i]!==undefined&&!seen.has(i)){seen.add(i);i=s.transfers[i];}return i;}));
  if(old===undefined||old===null||[...targets].some(i=>i!==old)){const next=maniKit.choose(r,[...targets].map(i=>r.ctx.enemies[i]).filter(t=>r.alive(t)));s.focus=next?.index??s.focus;s.cycle=false;}
  if(s.turnActor===t.index)for(const i of targets)s.turnTargets.add(i);
  if(r.asc(u)&&targets.size===1&&targets.has(s.focus)&&r.once(u,'Máni A3 '+t.index,t.turn))r.gain(t,5);
 },
 event(r,u,type,e){const s=r.state(u),t=maniKit.partner(r,u);
  if(type==='modify'&&e.target.index===s.focus&&t){if(r.effect(u,t,'Trăng Định'))e.vulnerability+=r.vm(u,6)?.2:.12;if(e.unit===t){e.bonus+=.2;if(e.count===1&&maniKit.direct(e.action))e.pen+=.12;if(r.effect(u,t,'Trăng Định'))e.crit+=.15;if(r.vm(u,2))e.critDmg+=.3;}}
  if(type==='death'&&e.unit.side==='enemy'&&e.unit.index===s.focus){if(r.asc(u)){const old=s.focus;s.focus=r.enemies().filter(x=>x!==e.unit).sort((a,b)=>b.hp-a.hp)[0]?.index??null;if(s.focus!==null){s.transfers??={};s.transfers[old]=s.focus;if(s.turnTargets?.delete(old))s.turnTargets.add(s.focus);}}else{s.focus=null;s.cycle=false;}}
  if(type==='turnStart'&&e.unit===t){s.turnActor=t.index;s.turnTargets=new Set();const moon=r.effect(u,t,'Trăng Định');s.pause=!!(r.vm(u,6)&&moon&&(moon.pauses||0)<2);if(s.pause)moon.pauses++;}
  if(type==='turnEnd'&&e.unit===t){
   if(s.turnTargets?.size===1&&s.turnTargets.has(s.focus)){if(s.cycle){if(r.once(u,'Máni Talent')){s.cycle=false;r.planck(u,1);r.gain(u,8);if(r.vm(u,4)){r.gain(t,15);r.advance(t,.15);}}}else s.cycle=true;}
   else if(s.turnTargets?.size)s.cycle=false;
   if(s.pause)for(const key of ['Ngân Tuyến','Trăng Định']){const b=r.effect(u,t,key);if(b)b.duration++;}s.turnActor=null;s.turnTargets=null;s.pause=false;
  }
 }
};
