export const astraeusKit={
 minor:{crit:.104,atk:.12,energy:.04},
 sync(r,u){r.buff(u,u,'Twin-Core Accumulator',{energy:u.currentEnergy<100?.05:0});if(r.asc(u)){r.buff(u,u,'A3',{crit:Math.min(.2,Math.max(0,u.currentEnergy-100)/5*.01)});if(u.currentEnergy>=100)r.state(u).threshold=true;}},
 resolve(r,u,k){
  if(k==='Basic')return {name:'Primer Spark',ratio:.8};
  if(k==='Skill')return {name:'Dynamo Sweep',ratio:1.15,aoe:true};
  if(k==='Ult'){const threshold=r.vm(u,4)?150:200,high=u.currentEnergy>=threshold;return {name:high?'When Heaven Runs Out of Thunder':'Hundredfold Discharge',variant:high?2:1,energyCost:high?threshold:100,aoe:true,pen:(r.asc(u)&&r.state(u).threshold?.1:0)+(high&&r.vm(u,2)?Math.min(.2,Math.max(0,u.currentEnergy-100)/20*.04):0),bonus:high&&r.vm(u,4)?Math.min(.4,Math.max(0,u.currentEnergy-150)/5*.04):0,resPen:high&&r.vm(u,6)?.2:0,...(high?{phases:[{ratio:3.2,toughness:90},{ratio:6*(r.vm(u,6)?.9:.5),hits:6,bounce:true,toughness:60}]}:{ratio:1.4})};}
 },
 before(r,u,a){if(a.source==='Ult')r.state(u).threshold=false;},
 after(r,u,a,targets){if(a.source==='Basic')r.gain(u,5);if(a.source==='Skill'){r.gain(u,Math.min(10,targets.size*2));if(r.asc(u)&&targets.size>=3)r.gain(u,2);}if(a.source==='Ult'){if(a.variant===1){r.gain(u,Math.min(r.vm(u,1)?30:20,targets.size*(r.vm(u,1)?6:4)));if(r.vm(u,1))r.advance(u,.2);}else if(r.vm(u,6))r.gain(u,50);}},
 observe(r,u,{unit:t,action:a}){if(t!==u&&a.ability==='Ult')r.gain(u,u.energyCap*.03,true);}
};
