export const thorKit={
 minor:{break:.24,energy:.04,atk:.1},
 init(r,u){r.state(u).pressure=r.asc(u)?2:0;},
 sync(r,u){const n=r.state(u).pressure||0;if(r.vm(u,4))r.buff(u,u,'Thor VM4',{break:n>=3?.24:0,efficiency:n>=(r.vm(u,2)?10:5)?.12:0});},
 resolve(r,u,k){const n=r.state(u).pressure||0;return k==='Basic'?{name:'Stormhammer Oath',ratio:1,toughness:30}:k==='Skill'?{name:'Rampartbreaker',ratio:.9,aoe:true,toughness:45,damageSource:r.vm(u,6)?'Ult':'Skill'}:{name:'Heavenfall: Mjolnir',ratio:1.8,aoe:true,toughness:120,energyCost:150,pressure:n,efficiency:.1*n,breakBonus:.15*n,pen:r.asc(u)&&n>=3?.12:0,annihilate:true,allowUnbrokenDK:r.vm(u,6),dkMultiplier:2.5+(r.vm(u,2)?.3*n:0)};},
 before(r,u,a){if(a.source==='Ult')r.state(u).pressure=0;if(a.source==='Skill')a.priorToughness=Object.fromEntries(r.enemies().map(t=>[t.index,t.toughness]));},
 after(r,u,a,targets){const s=r.state(u),cap=r.vm(u,2)?10:5;
  if(a.source==='Skill'){
   const count=[...targets].filter(i=>a.priorToughness[i]>r.ctx.enemies[i].toughness).length;s.pressure=Math.min(cap,(s.pressure||0)+Math.min(5,count));r.gain(u,3*Math.min(5,count));if(r.vm(u,1)&&count>=3){s.pressure=Math.min(cap,s.pressure+1);r.gain(u,5);}
   if(r.vm(u,6)){const n=s.pressure||0;r.queue(u,{name:'Thor VM6',source:'Diệt Kích',aoe:true,toughness:120,efficiency:.1*n,breakBonus:.15*n,pen:r.asc(u)&&n>=3?.12:0,dkMultiplier:.5*(2.5+.3*n),allowUnbrokenDK:true,energy:0},a);}
  }
  if(a.source==='Ult'&&r.asc(u)&&a.dkTargets?.size>=2)r.gain(u,45);
 },
 event(r,u,type,e){if(type==='break'&&e.unit!==u&&r.once(u,'Thor ally break',e.action.uid)){const s=r.state(u),cap=r.vm(u,2)?10:5;if((s.pressure||0)>=cap)r.gain(u,5);else s.pressure=(s.pressure||0)+1;}}
};
