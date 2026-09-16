export const nemtyKit={
 minor:{hp:.12,speed:5,energy:.1},
 allowance(r,u,key,limit){const s=r.state(u);if(s[key+'Turn']!==u.turn){s[key+'Turn']=u.turn;s[key]=0;}if(s[key]>=limit)return false;s[key]++;return true;},
 road(r,u,t){r.buff(u,t,'Thuận Lộ',{},r.ctx.gear.ctx.activeUnit===t?2:1,{consume:'damage',scoped:{bonus:.25,pen:.12}});},
 sync(r,u){for(const t of r.allies()){const lead=r.effect(u,t,'Người Dẫn Đầu'),road=r.effect(u,t,'Thuận Lộ');if(road)road.scoped=lead&&r.effect(u,t,'Bầu Trời Mở')?{bonus:.35,pen:.18}:{bonus:.25,pen:.12};if(r.vm(u,1))r.buff(u,t,'Nemty VM1',{},null,{scoped:{resPen:.24},sources:['Counter']});}},
 resolve(r,u,k){return k==='Basic'?{name:'Feather Against the Current',ratio:.7,toughness:30}:k==='Skill'?{name:'Walk Where the Wind Parts',support:true,needsRecipient:true,otherRecipient:true}:{name:'No Road Refuses Her Wings',support:true,energyCost:140};},
 after(r,u,a){if(a.ability==='Skill'){const t=r.ctx.units[a.recipient];for(const old of r.allies())if(old!==t)r.remove(u,old,'Người Dẫn Đầu');r.buff(u,t,'Người Dẫn Đầu',{damage:.2,crit:r.asc(u)?.1:0},3,{extended:false});nemtyKit.road(r,u,t);r.allySkill(u,t,a);}if(a.ability==='Ult')for(const t of r.allies()){r.buff(u,t,'Bầu Trời Mở',{critDmg:.36},2,{selected:false,regranted:false});nemtyKit.road(r,u,t);}},
 event(r,u,type,e){
  if(type==='select'&&r.effect(u,e.target,'Người Dẫn Đầu'))r.buff(u,e.target,'Nemty trong hành động Myrk',{reduction:.15,resist:r.asc(u)?.3:0});
  if(type==='damageActionEnd'){
   for(const i of e.targets){const t=r.ctx.units[i];if(!r.alive(t))continue;const lead=r.effect(u,t,'Người Dẫn Đầu'),sky=r.effect(u,t,'Bầu Trời Mở');if(lead&&nemtyKit.allowance(r,u,'talent',2))nemtyKit.road(r,u,t);if(sky&&!sky.selected){sky.selected=true;nemtyKit.road(r,u,t);}}
   for(const t of r.allies())r.remove(u,t,'Nemty trong hành động Myrk');
  }
  if(type==='start'&&r.effect(u,e.unit,'Thuận Lộ')){e.action.nemtyRoad??={};e.action.nemtyRoad[u.index]=true;}
  if(type==='after'&&e.targets?.size&&e.action.nemtyRoad?.[u.index]){
   const t=e.unit,lead=r.effect(u,t,'Người Dẫn Đầu'),sky=r.effect(u,t,'Bầu Trời Mở');
   if(lead&&r.asc(u)&&nemtyKit.allowance(r,u,'energy',2))r.gain(u,5);
   if(lead&&r.vm(u,2)&&!lead.extended){lead.extended=true;lead.duration=Math.min(3,lead.duration+1);}
   if(r.vm(u,4)&&e.action.cost>0&&r.once(u,'Nemty VM4'))r.planck(u,1);
   if(r.vm(u,6)&&sky&&!sky.regranted){sky.regranted=true;nemtyKit.road(r,u,t);}
  }
 }
};
