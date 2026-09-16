export const kaienKit={
 minor:{break:.18,speed:8,atk:.1},
 sync(r,u){if(r.vm(u,4))r.buff(u,u,'Kaien VM4',{break:r.enemies().some(t=>t.toughness===0)?.24:0});},
 resolve(r,u,k,input){return k==='Basic'?{name:'Knock Once',ratio:.85,efficiency:.5}:k==='Skill'?{name:'Drive the Wedge',ratio:1.5,splash:.7,blast:true,annihilate:true,dkTargetIndices:[input.target??0]}:{name:'Nothing Stands Forever',ratio:1.8,aoe:true,efficiency:.6,annihilate:true,dkMultiplier:1.6,energyCost:120};},
 before(r,u,a){a.kaienBroken=new Set();a.kaienAboveHalf=new Set(r.enemies().filter(t=>t.toughness>t.maxToughness*.5).map(t=>t.index));},
 event(r,u,type,e){if(e.unit!==u)return;const a=e.action;
  if(type==='break')a.kaienBroken?.add(e.target.index);
  if(type==='modify'){
   if(a.ability==='Skill'&&e.target.index===a.primaryTarget)e.efficiency+=.8+(r.vm(u,1)?.2:0);
   if(r.asc(u)&&a.kaienAboveHalf?.has(e.target.index))e.efficiency+=.15;
   if(a.source==='Diệt Kích'){
    if(a.ability==='Skill')a.dkMultiplier=a.kaienBroken?.has(e.target.index)?1.4:1.7;
    if(r.effect(u,u,'Phá Thế'))e.dkBonus+=.2;
    if(a.kaienBroken?.has(e.target.index)){if(r.asc(u))e.dkBonus+=.25;if(r.vm(u,1)&&a.ability==='Skill')e.dkBonus+=.2;}
   }
  }
  if(type==='hit'&&a.source==='Diệt Kích'){
   const power=r.effect(u,u,'Phá Thế');if(power){if(r.vm(u,6)&&!power.retained)power.retained=true;else{r.remove(u,u,'Phá Thế');r.remove(u,u,'Điểm Nứt');}}
   else {const old=r.effect(u,u,'Điểm Nứt')?.charges||0,extra=r.vm(u,2)&&r.once(u,'Kaien VM2',a.uid)?1:0,n=Math.min(3,old+(r.vm(u,6)&&a.kaienBroken?.has(e.target.index)?2:1)+extra);r.buff(u,u,'Điểm Nứt',{break:.12*n},2,{charges:n});if(n===3)r.buff(u,u,'Phá Thế',{efficiency:.3},1,{retained:false});}
   if(r.asc(u)&&r.once(u,'Kaien A3'))r.advance(u,.1);
  }
 }
};
