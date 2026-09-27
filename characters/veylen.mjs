export const veylenKit={
 requiresCrit:u=>u.kitAscensions!==false,minor:{crit:.104,atk:.12,elementDamage:.078},
 cap(r,u){return r.vm(u,1)?5:4;},
 feedback(r,u,amount){const s=r.state(u),old=s.feedback||0;s.feedback=Math.min(veylenKit.cap(r,u),old+amount);if(old<veylenKit.cap(r,u)&&s.feedback===veylenKit.cap(r,u))r.advance(u,.75);},
 resolve(r,u,k){const stacks=r.state(u).feedback||0,enhanced=stacks>=2;return k==='Basic'?{name:'Return Stroke',ratio:1}:k==='Ult'?{name:'Closed Circuit',ratio:3.3,energyCost:125,bonus:stacks*.04}:{name:enhanced?'Chain Vector: Rebound':'Chain Vector',feedback:stacks,enhanced,bonus:stacks*.05,consumedStacks:enhanced,...(enhanced?{phases:[{ratio:2.2,toughness:60},{ratio:.55*stacks,hits:stacks,toughness:10*stacks}]}:{ratio:2.15})};},
 after(r,u,a){const s=r.state(u);if(a.source==='Skill'){if(a.enhanced){if(r.vm(u,2)){const actual=Object.values(a.damageByTarget||{}).reduce((x,y)=>x+y,0);r.queue(u,{name:'Veylen VM2',source:'Extra',ratio:0,flat:actual*.03*a.feedback,trueDamage:true,toughness:0,energy:0,aoe:true},a);}s.feedback=s.keepTwo?Math.min(2,a.feedback):0;s.keepTwo=false;if(r.asc(u)&&a.actualCrit)r.gain(u,8);}else veylenKit.feedback(r,u,1);if(r.vm(u,4)){s.skills=(s.skills||0)+1;if(s.skills%2===0)veylenKit.feedback(r,u,1);}}
  if(a.source==='Ult'){veylenKit.feedback(r,u,2);if(r.asc(u))r.buff(u,u,'A2',{},null,{scoped:{bonus:.15},sources:['Skill'],consume:'damage'});if(r.vm(u,6))s.keepTwo=true;}
 },
 observe(r,u,{unit:t,action:a,targets}){if(t===u||!r.triumph(u))return;if(a.source==='FUA')veylenKit.feedback(r,u,1);if(!r.attack(a)||a.source==='FUA'||!targets.size)return;const s=r.state(u);if((s.triumphHits||0)>=3)return;s.triumphHits=(s.triumphHits||0)+1;const indices=[...targets];r.queue(u,{name:'Khải Hoàn Veylen',source:'Extra',ratio:1,element:'Lôi',target:indices[0],targetIndices:indices,targets:indices.length,energy:0,toughness:0},a);},
 event(r,u,type,e){if(type==='turnStart'&&e.unit===u)r.state(u).triumphHits=0;if(e.unit!==u)return;if(type==='hit'&&e.crit&&e.amount>0)e.action.actualCrit=true;if(type==='modify'&&e.action.source==='Skill'&&e.action.enhanced&&e.action.feedback>=3&&r.asc(u))e.crit+=.12;}
};
