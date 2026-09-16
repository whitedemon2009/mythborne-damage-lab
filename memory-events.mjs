import {normalizeElement} from './formulas.mjs';
export function memoryEvent(g,u,type,e){
 const k=g.key(u);if(k===undefined)return;const v=i=>g.v(u,i),s=g.state(u).data,a=e.action||{},own=e.unit===u,ability=a.ability||a.source,t=e.target;
 const buff=(key,mods,d=2,cap=0,extra={})=>g.buff(u,u,key,mods,d,cap,extra);
 const scoped=(key,mods,d=2,cap=0,extra={})=>buff(key,{},d,cap,{scoped:mods,...extra});
 const each=fn=>g.allies().forEach(fn);
 if(type==='modify'&&own){
  if(k===1&&e.count===1)e.bonus+=v(0);
  if(k===3&&e.count>=2)e.bonus+=v(0);
  if(k===6&&e.count>=3)e.bonus+=v(0);
  if(k===8&&g.enemies().length>=4)e.stats.atk+=(u.atkBaseTotal??u.atk)*v(0);
  if(k===21&&e.count===1)e.crit+=v(0);
  if(k===23&&e.count===3)e.bonus+=v(0);
  if(k===25&&e.count===g.enemies().length)e.bonus+=v(0);
  if(k===37&&u.currentHP>=g.eff(u).hp)e.stats.atk+=(u.atkBaseTotal??u.atk)*v(0);
  if(k===54&&s.previousTargets?.includes(t.index))e.bonus+=v(1);
  if(k===55&&[2,3].includes(e.count))e.bonus+=v(1);
  if(k===56)e.bonus+=v(1)*Math.min(5,e.count);
  if(k===51&&(t.toughness>0||a.actionUnbroken?.includes(t.index)))e.efficiency+=v(1);
  if(k===61&&(a.fullToughnessTargets||[]).includes(t.index))e.efficiency+=v(1);
  if(k===53&&a.source==='Diệt Kích'&&g.stacks(u,u,'Rạn Tuyến')>=3){e.pen+=v(1);a.consumeRan=true;}
 }
 if(type==='start'&&own){
  if(k===61)a.fullToughnessTargets=g.enemies().filter(t=>t.toughness===t.maxToughness).map(t=>t.index);
 }
 if(type==='after'&&own){
  const n=e.targets.size;
  if(k===2)for(const index of e.targets)scoped('Truy Dấu '+index,{bonus:v(0)},2,0,{target:index});
  if(k===4&&ability==='Skill')buff('Tam Tuần',{atk:v(0)},1);
  if(k===5&&n>=2)g.gain(u,v(0)*100);
  if(k===7&&ability==='Ult')buff('Dư Chấn',{SkillDamage:v(0)},1);
  if(k===24&&n>=2)buff('Liên Phong',{speed:v(0)*100});
  if(k===36&&ability==='Ult')buff('Phá Thiên',{SkillDamage:v(1)});
  if(k===38&&n>=2)buff('Tam Hội',{damage:v(n>=3?1:0)});
  if(k===39&&n>=3)buff('Tam Tàn',{energy:v(0)});
  if(k===40&&ability==='Ult'&&n>=4)g.gain(u,v(1)*100);
  if(k===13&&ability==='Ult')each(t=>g.buff(u,t,'Minh Ân',{atk:v(0)},1));
  if(k===45&&ability==='Ult')each(t=>{if(normalizeElement(t.element)===normalizeElement(u.element))g.buff(u,t,'Phụng Mệnh',{elementDamage:v(0)});});
  if(k===46&&ability==='Ult')each(t=>{if(t.shields.some(n=>n>0))g.buff(u,t,'Thiên Môn Hộ',{reduction:v(1)},1);});
  if(k===55&&n===3&&g.once(u,'Đồng Ảnh'))g.gain(u,v(2)*100);
  if(k===62&&a.source==='Counter'&&n&&g.once(u,'Cắn Trả'))g.heal(u,u,g.eff(u).hp*v(2));
  if(k===63&&a.source==='Counter'&&n)g.remove(u,u,'Nghênh Kích');
  if(n)s.previousTargets=[...e.targets];else if(k===54)s.previousTargets=[];
 }
 if(type==='allySkill'&&own){
  if(k===12)g.buff(u,t,'Ban Phúc',{atk:v(0)});
  if(k===29)g.buff(u,t,'Đèn Sau Lưng',{critDmg:v(0)});
  if(k===44){g.buff(u,t,'Khải Ân',{damage:v(0)});buff('Khải Ân tốc độ',{speed:v(1)*100});}
  if(k===58&&t!==u)g.buff(u,t,'Phần Dành Lại',{critDmg:v(1)});
 }
 if(type==='debuff'&&own){
  if(k===10)buff('Hắc Ngôn',{atk:v(0)});
  if(k===28)g.buff(u,t,'Trang Giấy Xé',{defReduction:v(0)},1);
  if(k===42)g.buff(u,t,'Vô Danh Chú',{vulnerability:v(1)},1);
 }
 if(type==='hit'&&own&&e.amount>0){
  if(k===11&&g.debuffs(t).length&&g.once(u,'Tai Ách '+a.uid,1,'action'))g.gain(u,v(0)*100);
  if(k===43&&g.debuffs(t).length>=3&&g.once(u,'Hắc Khế '+a.uid,1,'action'))g.gain(u,v(1)*100);
  if(k===50&&a.source==='DoT'&&g.once(u,'Dư Điện'))g.gain(u,v(1)*100);
  if(k===52&&(e.brokenBefore||a.source==='Break'))scoped('Chấn Sau Vết Vỡ',{dkBonus:v(1)},2,0,{sources:['Diệt Kích']});
  if(k===53&&a.source==='Diệt Kích'){
   if(a.consumeRan)g.remove(u,u,'Rạn Tuyến');else scoped('Rạn Tuyến',{dkBonus:v(0)},2,3,{sources:['Diệt Kích']});
  }
 }
 if(type==='beforeHeal'&&own){
  if(k===31&&t.currentHP<g.eff(t).hp*.5)e.outgoing+=v(0);
  if(k===70&&t.currentHP<g.eff(t).hp*.5&&g.once(u,'Dư Âm heal '+t.index)){e.outgoing+=v(3);g.buff(u,t,'Dư Âm phòng thủ',{def:v(4)},1);}
 }
 if(type==='heal'&&own){
  if(k===20)g.buff(u,t,'Hơi Thở',{hp:v(0)},1);
  if(k===48&&e.before<g.eff(t).hp*.5&&g.once(u,'Sinh Tuyền '+t.index))g.gain(t,t.energyCap*v(1),true);
  if(k===49)g.buff(u,t,'Hồi Ca',{atk:v(0)});
  if(k===60&&t.currentHP>=g.eff(t).hp*.8)g.buff(u,t,'Canh Đèn',{damage:v(1)});
 }
 if(type==='shield'&&own&&k===16)buff('Bất Động',{def:v(0)});
 if(type==='select'&&t===u){
  if(k===35)buff('Chuông Gió',{def:v(0)},1);
  if(k===63)g.next(u,u,'Nghênh Kích',{},{scoped:{critDmg:v(1)},sources:['Counter']});
 }
 if(type==='shieldBroken'&&e.owner===u&&k===59&&g.once(u,'Hồi Môn '+t.index))g.restore(u,t,g.eff(u).def*v(1)+v(2)*100);
 if(type==='enemyEnd'&&k===57&&g.debuffs(e.enemy,u).length)g.buff(u,e.enemy,'Nhiệt Ấn',{vulnerability:v(1)},1);
 if(type==='sync'){
  if(k===17)each(t=>{if(g.shielded(t,u))g.buff(u,t,'Hộ Thệ',{def:v(0)},null);else g.remove(t,u,'Hộ Thệ');});
  if(k===47){if(u.currentHP<g.eff(u).hp*.5)buff('Tàn Thân',{def:v(0)},null);else g.remove(u,u,'Tàn Thân');}
  if(k===41){if(g.enemies().length>=5)buff('Chung Mạt',{atk:v(0)},null);else {const b=g.effect(u,u,'Chung Mạt');if(b?.duration===null)b.duration=3;}}
 }
 memoryFiveStar(g,u,type,e,{k,v,s,a,own,ability,t,buff,scoped,each});
}
function memoryFiveStar(g,u,type,e,h){
 const {k,v,s,a,own,ability,t,buff,scoped,each}=h;
 if(k<64)return;
 if(type==='start'&&own){
  if(k===64&&ability==='Skill')buff('Hồi Quy',{SkillDamage:v(1)},2,3);
  if(k===66&&ability==='Skill')buff('Chuẩn Bị',{atk:v(1)},3,3);
  if(k===64&&ability==='Ult'){buff('Hồi Quy',{SkillDamage:v(1)},2,3);buff('Hồi Quy',{SkillDamage:v(1)},2,3);}
  if(k===66&&ability==='Ult')a.preparation=g.stacks(u,u,'Chuẩn Bị');
 }
 if(type==='modify'&&own){
  if(k===64&&ability==='Skill'&&a.consumedStacks)e.pen+=v(2);
  if(k===65&&a.source==='FUA'&&g.effect(u,u,'Dư Vũ')&&e.count>=2)e.bonus+=v(2);
  if(k===66&&ability==='Ult'&&a.preparation>=2)e.crit+=v(2);
  if(k===71&&g.effect(u,u,'Khải Hoàn Đỏ')&&['Basic','Skill','Ult'].includes(ability))e.bonus+=v(4);
  if(k===75&&ability==='Basic'&&s.baTarget!==undefined&&(s.baTarget!==t.index||e.count!==1)){e.pen-=g.stacks(u,u,'Truy Nguyệt')*v(2);}
  if(k===77&&ability==='Skill')e.pen+=Math.min(2,a.cost||0)*v(2);
  if(k===84&&(t.toughness>0||a.actionUnbroken?.includes(t.index))&&['Basic','Skill','Ult'].includes(ability))e.efficiency+=v(1);
  if(k===84&&a.firstBroken)e.pen+=v(4);
  if(k===86)e.bonus+=Math.min(.4,Math.max(0,u.energyCap-100)*.004);
  if(k===88&&u.effects.some(b=>b.name==='Sừng Thứ Hai')&&a.source==='Diệt Kích')e.dkBonus+=v(1);
  if(k===90&&g.effect(u,u,'Phượng Hoàng')&&ability==='Skill'){e.efficiency+=v(1);if(a.source==='Diệt Kích')e.dkBonus+=v(2);}
  if(k===92&&ability==='Ult'){e.efficiency+=v(1);if(e.count>=3&&a.source==='Diệt Kích')e.dkBonus+=v(2);}
  if(k===96&&ability==='Ult'&&(a.energyCost??u.energyCap)>=150){e.bonus+=v(3);e.resPen+=v(4);}
  if(k===98&&a.source==='Counter'&&s.selectedChain===a.chain)e.bonus+=v(2);
 }
 if(type==='beforeDamage'&&own){
  if(k===84&&t.toughness===0&&!a.firstBroken&&g.once(u,'Núi Cúi Đầu'))a.firstBroken=true;
  if(k===65&&a.source==='FUA'&&a.triggerActor!==undefined&&a.triggerActor!==u.index)g.mark(u,u,'Dư Vũ');
 }
 if(type==='after'&&own){
  const n=e.targets.size;
  if(k===65&&a.source==='FUA'&&n>=2&&g.effect(u,u,'Dư Vũ')&&g.once(u,'Dư Vũ NL'))g.gain(u,v(3)*100);
  if(k===66){if(ability==='Ult'){if(a.preparation>=2&&n)g.gain(u,v(3)*100);g.remove(u,u,'Chuẩn Bị');}}
  if(k===68&&ability==='Ult')each(t=>{if(t!==u)g.buff(u,t,'Thời Khắc',{atk:v(4)});});
  if(k===71&&n&&['Basic','Skill','Ult'].includes(ability)){
   buff('Thệ Ấn '+ability,{damage:v(2)},3);
   if(['Basic','Skill','Ult'].every(b=>g.effect(u,u,'Thệ Ấn '+b))){for(const b of ['Basic','Skill','Ult'])g.remove(u,u,'Thệ Ấn '+b);buff('Khải Hoàn Đỏ',{pierce:v(3)});}
  }
  if(k===72&&n>=2&&['Skill','Ult'].includes(ability))buff('Phán Tích',{SkillDamage:v(1),UltDamage:v(2)},2,3);
  if(k===73&&ability==='Ult'){s.ults=(s.ults||0)+1;if(s.ults%2===1){each(t=>g.advance(t,.1));g.planck(u,1);}}
  if(k===74&&ability==='Ult'&&e.grantedBuff){buff('Người Giữ Lửa',{damage:.6});g.gain(u,u.energyCap*.05,true);}
  if(k===75){if(ability==='Skill'&&(!n||a.enhancesBasic))buff('Cung Trăng',{BasicDamage:v(1)});if(ability==='Basic'&&n===1){const index=[...e.targets][0];if(s.baTarget!==index)g.remove(u,u,'Truy Nguyệt');else scoped('Truy Nguyệt',{pen:v(2)},2,3,{sources:['Basic']});s.baTarget=index;if(g.stacks(u,u,'Truy Nguyệt')>=3&&g.once(u,'Truy Nguyệt NL'))g.gain(u,v(3)*100);}}
  if(k===83&&ability==='Skill'){if(a.releaseHeat&&[...e.targets].some(i=>g.ctx.enemies[i].dots.some(d=>d.owner===u.index))){g.remove(u,u,'Dư Nhiệt');for(const index of e.targets){const target=g.ctx.enemies[index],dot=target.dots.filter(d=>d.owner===u.index).sort((a,b)=>g.ctx.dotValue(target,b)-g.ctx.dotValue(target,a))[0];if(dot)g.ctx.tick(target,dot,v(4),true,u,a);}}else {buff('Dư Nhiệt',{SkillDamage:v(2),DoTDamage:v(3)},3,5);if([...e.targets].some(i=>g.ctx.enemies[i].dots.some(d=>d.owner===u.index)))buff('Dư Nhiệt',{SkillDamage:v(2),DoTDamage:v(3)},3,5);}}
  if(k===84&&a.firstBroken&&n)g.gain(u,v(5)*100);
  if(k===85&&ability==='Ult'&&g.eff(u).break>.7)g.planck(u,1);
  if(k===86&&ability==='Ult'){g.gain(u,v((a.energyCost??u.energyCap)>=150?2:3)*100);g.remove(u,u,'Tích Áp');}
  if(k===87&&ability==='Ult')scoped('Sau Cái Chết',{critDmg:v(3)},2,0,{sources:['Skill'],consume:'damage'});
  if(k===88&&a.source==='FUA'&&n&&g.once(u,'Chiến Tranh NL'))g.gain(u,v(2)*100);
  if(k===89&&ability==='Skill')each(t=>g.buff(u,t,'Điệu Waltz',{},2,0,{scoped:{dkBonus:v(2)},sources:['Diệt Kích']}));
  if(k===90){if(ability==='Ult')g.mark(u,u,'Phượng Hoàng',null,0,{charges:2});else if(ability==='Skill'&&n){const b=g.effect(u,u,'Phượng Hoàng');if(b&&--b.charges===0){g.remove(u,u,'Phượng Hoàng');g.planck(u,1);}}}
  if(k===91){if(ability==='Ult'&&a.recipient!==undefined&&['Buff','Heal','Shield'].includes(a.source))g.buff(u,g.ctx.units[a.recipient],'Hải Quyền',{},2,0,{scoped:{bonus:v(1)},sources:['Skill','FUA']});if(n&&n===a.livingCount)for(const i of e.targets)g.buff(u,g.ctx.enemies[i],'Hải Quyền suy yếu',{vulnerability:v(4)},1);}
  if(k===92&&ability==='Ult'&&a.dkTargets?.size>=2)g.gain(u,v(3)*100);
  if(k===101&&n===1&&!['DoT','Diệt Kích'].includes(a.source)){const i=[...e.targets][0];s.record={target:i,hp:g.ctx.enemies[i].hp};}
 }
 if(type==='start'&&own&&k===83&&ability==='Skill'&&g.stacks(u,u,'Dư Nhiệt')>=5)a.releaseHeat=true;
 if(type==='allySkill'&&own){
  if(k===68)g.buff(u,t,'Tinh Thời',{damage:v(1)},2,0,{charges:1});
  if(k===73){g.buff(u,t,'Đường Bay',{damage:v(1)});if(a.buffType==='advance'||a.advance)g.buff(u,t,'Đường Bay STCM',{critDmg:v(2)},1);}
  if(k===97&&t!==u)g.mark(u,t,'Dẫn Quỹ',2,0,{charges:1,previous:null});
  if(k===99&&t!==u)g.buff(u,t,'Lộ Ấn',{damage:v(1)});
  if(k===100)g.buff(u,t,'Tiên Dược',{damage:v(1)},2,0,{charges:1});
 }
 if(type==='after'&&e.unit!==u){
  const n=e.targets.size,ally=e.unit;
  if(k===68&&ability==='Ult'){const b=g.effect(ally,u,'Tinh Thời');if(b){g.gain(u,v(2)*100);if(b.charges){b.charges=0;g.gain(ally,ally.energyCap*v(3),true);}}}
  if(k===94&&n&&!['DoT','Diệt Kích'].includes(a.source))for(let i=0;i<Math.min(n,3);i++)scoped('Dư Hỏa',{bonus:v(1)},2,3,{sources:['FUA']});
  if(k===96&&n&&g.once(u,'Apollo '+ally.index))g.gain(u,v(ally.aspect===u.aspect?2:1)*100);
  if(k===91&&n>=2&&g.effect(ally,u,'Hải Quyền')){if(g.once(u,'Hải Quyền NL'))g.gain(u,v(2)*100);g.buff(u,ally,'Hải Quyền nhịp',{damage:v(3)},1);}
  if(k===93&&n>=3&&g.shielded(ally,u)&&g.once(u,'Bạch Hổ NL'))g.gain(u,v(3)*100);
 }
 if(type==='modify'){
  const ally=e.unit;
  if(k===94&&own&&a.source==='FUA'&&g.stacks(u,u,'Dư Hỏa')>=3)e.critDmg+=v(2);
  if(k===97&&e.count===1&&g.effect(ally,u,'Dẫn Quỹ')){e.bonus+=v(1);if(g.state(ally).data.previousDamageTarget===t.index)e.critDmg+=v(2);}
  if(k===95&&['Basic','Skill','Ult','FUA'].includes(a.source)&&g.debuffs(t,u).length){const prev=s.sources?.[t.index];if(prev&&prev!==a.source){e.pen+=v(1);a.sekhmetChanged??=new Set();a.sekhmetChanged.add(u.index);}}
 }
 if(type==='hit'&&e.amount>0){
  if(k===67&&g.effect(t,u,'Chú Giải')){if(s.commentTurn!==u.turn){s.commentTurn=u.turn;s.commentEnergy=0;}const amount=Math.min(1,v(3)*100-s.commentEnergy);if(amount>0){g.gain(u,amount);s.commentEnergy+=amount;}}
  if(k===71&&own&&e.crit)g.gain(u,5,true);
  if(k===76&&a.source==='DoT'&&g.once(u,'Cân Đen '+t.index,1,a.uid))g.mark(u,u,'Cân Đen',null,4);
  if(k===95&&['Basic','Skill','Ult','FUA'].includes(a.source)&&g.debuffs(t,u).length){s.sources??={};s.sources[t.index]=a.source;if(a.sekhmetChanged?.has(u.index)&&g.once(u,'Sư Tử NL'))g.gain(u,v(2)*100);}
  if(own){
   if(k===72&&!a.gearExtra&&g.stacks(u,u,'Phán Tích')&&g.debuffs(t,u).some(b=>!b.gearKey)&&g.once(u,'Phán Tích '+a.uid,1,'action')){
    const b=g.effect(u,u,'Phán Tích');b.stacks--;if(!b.stacks)g.remove(u,u,'Phán Tích');g.ctx.extraDamage(u,v(3),'Nham',a);if(!b.stacks)for(const enemy of g.enemies())g.buff(u,enemy,'Lệch Cân',{},2,0,{incoming:{vulnerability:v(4)},onlyOwner:true});
   }
   if(k===76&&a.source!=='DoT'&&t.dots.length&&g.stacks(u,u,'Cân Đen')>=4){g.remove(u,u,'Cân Đen');g.planck(u,1);}
   if(k===84&&(a.source==='Break'||a.source==='Diệt Kích'))buff('Trọng Kích',{damage:v(2)},2,0,{scoped:{dkBonus:v(3)},sources:['Diệt Kích']});
  }
 }
 if(type==='break'){
  if(k===85){each(t=>g.buff(u,t,'Cánh Chiến Thắng',{break:v(1)}));if(g.once(u,'Chiến Thắng '+a.uid,1,'action'))g.gain(u,v(2)*100);}
  if(k===89&&g.once(u,'Waltz '+a.uid,1,'action')){g.gain(u,v(3)*100);const low=g.allies().sort((a,b)=>a.currentHP/g.eff(a).hp-b.currentHP/g.eff(b).hp)[0];if(low)g.heal(u,low,g.eff(u).hp*v(4)+v(5)*100);}
 }
 if(type==='heal'&&own){
  if(k===70&&e.origin!=='Dư Âm')g.mark(u,t,'Dư Âm');
  if(k===74)g.buff(u,t,'Tàn Hỏa',{damage:v(2)});
 }
 if(type==='turnStart'){
  const ally=e.unit;
  if(k===70&&g.effect(ally,u,'Dư Âm'))g.heal(u,ally,g.eff(u).hp*v(2),{origin:'Dư Âm',delayed:true});
  if(k===101&&own&&s.record){const r=s.record,target=g.ctx.enemies[r.target];if(target.hp>0&&target.hp<r.hp)scoped('Tàn Dương',{bonus:v(1),pen:v(2)},1,0,{target:r.target});s.record=null;}
 }
 if(type==='hpLost'&&own&&e.amount>0&&k===77)buff('Chiến Phí hồi năng lượng',{energy:.1});
 if(type==='hpLost'&&!e.self&&e.amount>0&&k===100){const b=g.effect(e.unit,u,'Tiên Dược');if(b?.charges&&e.unit.currentHP>0&&e.unit.currentHP<g.eff(e.unit).hp*.8){b.charges=0;g.heal(u,e.unit,g.eff(u).hp*v(2)+v(3)*100,{delayed:true});g.next(u,e.unit,'Tiên Dược nhịp',{},{scoped:{bonus:v(1)}});}}
 if(type==='advance'&&own&&k===87)scoped('Nhịp Tim',{pen:v(2)},1,0,{sources:['Skill'],consume:'damage'});
 if(type==='select'&&t===u&&k===98){s.selectedChain=e.chain;g.buff(u,u,'Bạch Băng đón đòn',{reduction:v(1)},null,0,{enemyChain:e.chain});}
 if(type==='select'&&k===99&&g.effect(t,u,'Lộ Ấn')&&g.once(u,'Lộ Ấn '+t.index,2)){g.buff(u,t,'Lộ Ấn đón đòn',{reduction:v(2)},null,0,{enemyChain:e.chain,afterEnemy:{bonus:v(3)}});}
 if(type==='shield'&&own&&k===93)each(t=>{if(t.shields.some(n=>n>0))g.buff(u,t,'Bạch Hổ',{damage:v(1)+(t.aspect==='Mjolnir'?v(2):0)});});
 if(type==='cleanse'&&own&&k===74&&e.count&&g.once(u,'Giữ Lửa '+t.index)){g.heal(u,t,g.eff(u).hp*v(3));g.buff(u,t,'Lửa thanh tẩy',{resist:v(4)},1);}
 if(type==='debuff'&&own){
  if(k===67)g.buff(u,t,'Chú Giải',{vulnerability:v(1)},2,0,{extraVulnerability:v(2)});
  if(k===79&&e.disrupt){g.buff(u,t,'Lệch Nhịp',{resReduction:v(1)});if(g.debuffs(t,u).filter(b=>!b.gearKey?.startsWith('Lệch Nhịp')).length>=2)g.buff(u,t,'Lệch Nhịp giáp',{defReduction:v(2)});if(e.hardDisrupt&&g.once(u,'Lệch Nhịp NL'))g.gain(u,v(3)*100);}
 }
 if(type==='beforeDamage'&&own&&k===78&&['Skill','FUA'].includes(a.source)&&!g.effect(u,u,'Đại Triều')&&g.effect(u,u,'Hải Tuyến Skill')&&g.effect(u,u,'Hải Tuyến FUA')&&(a.damageTargetCount||a.targets)>=2){
  buff('Đại Triều',{crit:v(4)},2);a.greatTidePen=v(3);s.hadTide=true;
 }
 if(type==='modify'&&own&&k===78&&a.greatTidePen)e.pen+=a.greatTidePen;
 if(type==='after'&&own&&k===78&&e.targets.size&&['Skill','FUA'].includes(a.source))buff('Hải Tuyến '+a.source,{damage:v(2)});
 if(type==='expired'&&own&&k===78&&s.hadTide&&!g.effect(u,u,'Đại Triều')){s.hadTide=false;g.advance(u,.25);g.gain(u,v(5)*100);}
 if(type==='shield'&&own&&k===80)g.mark(u,u,'Quan Sát');
 if(type==='shieldHit'&&e.owner===u){
  if(k===80&&g.effect(u,u,'Quan Sát'))g.mark(u,e.enemy,'Phản Ảnh');
  if(k===69){g.mark(u,u,'Trấn Tuyến',null,5);if(g.stacks(u,u,'Trấn Tuyến')>=5&&g.once(u,'Trấn Tuyến hồi')){g.remove(u,u,'Trấn Tuyến');each(t=>{if(g.shielded(t,u)){g.restore(u,t,g.eff(u).def*v(2)+v(3)*100);g.buff(u,t,'Trấn Tuyến giảm ST',{reduction:v(4)},1);}});}}
 }
 if(type==='modify'&&k===80&&normalizeElement(e.unit.element)===normalizeElement(u.element)&&g.effect(t,u,'Phản Ảnh'))e.resPen+=v(2);
 if(type==='debuff'&&own&&k===80){
  if(e.disrupt&&g.effect(t,u,'Phản Ảnh'))g.buff(u,t,'Phản Ảnh phòng thủ',{defReduction:v(3)});
  if(e.hardDisrupt&&g.once(u,'Quan Sát hồi')){const allies=g.allies().filter(t=>g.shielded(t,u)).sort((a,b)=>Math.max(...a.shieldLayers.filter(l=>l.owner===u.index).map(l=>l.value))-Math.max(...b.shieldLayers.filter(l=>l.owner===u.index).map(l=>l.value)));if(allies[0])g.restore(u,allies[0],g.eff(u).def*v(4)+v(5)*100);}
 }
 if(type==='after'&&k===81){if(own&&['Skill','Ult'].includes(ability))each(t=>g.buff(u,t,'Than Hồng',{crit:v(1)}));if(ability==='Skill'&&a.cost>0){g.mark(u,u,'Tàn Nhiệt',2,3);if(g.stacks(u,u,'Tàn Nhiệt')>=3&&g.once(u,'Tàn Nhiệt hoàn')){g.remove(u,u,'Tàn Nhiệt');g.planck(u,1);}}}
 if(type==='planck'&&own&&k===81&&e.amount>0)each(t=>g.buff(u,t,'Than Hồng chiến kỹ',{SkillDamage:v(2)},1));
 if(type==='after'&&own&&k===82&&ability==='Ult')g.mark(u,u,'Mặt Nạ hồi NL',2,0,{charges:2});
 if(type==='hit'&&own&&k===82&&a.source!=='DoT'&&t.dots.length>=2)g.mark(u,u,'Mặt Nạ xuyên giáp');
 if(type==='modify'&&k===82&&a.source==='DoT'&&a.external&&(a.triggerOwner??e.unit.index)===u.index&&g.effect(u,u,'Mặt Nạ xuyên giáp'))e.pen+=v(3);
 if(type==='externalDot'&&own&&k===82){g.buff(u,t,'Tận Kỳ',{},2,0,{incoming:{vulnerability:v(2)},sources:['DoT']});const b=g.effect(u,u,'Mặt Nạ hồi NL');if(b?.charges&&g.once(u,'Mặt Nạ NL',1,a.uid)){b.charges--;g.gain(u,v(4)*100);}}
 if(type==='modify'&&k===67&&g.effect(t,u,'Chú Giải')&&g.debuffs(t,u).length>=2)e.vulnerability+=v(2);
 if(type==='turnStart'&&k===97){const mark=g.effect(e.unit,u,'Dẫn Quỹ');if(mark)mark.turnTargets=new Set();}
 if(type==='after'&&k===97&&g.ctx.activeUnit===e.unit&&!['DoT','Diệt Kích'].includes(a.source)&&!a.storedDamage){const mark=g.effect(e.unit,u,'Dẫn Quỹ');if(mark){mark.turnTargets??=new Set();for(const index of e.targets)mark.turnTargets.add(index);}}
 if(type==='turnEnd'&&k===97){const mark=g.effect(e.unit,u,'Dẫn Quỹ');if(mark){const target=mark.turnTargets?.size===1?[...mark.turnTargets][0]:null;if(target!==null&&target===mark.previous&&mark.previousTurn===e.unit.turn-1&&mark.charges){mark.charges=0;g.gain(u,v(3)*100);}mark.previous=target;mark.previousTurn=e.unit.turn;}}


 if(type==='after'&&own&&k===68&&ability==='Ult'){const mark=g.effect(u,u,'Tinh Thời');if(mark){g.gain(u,v(2)*100);if(mark.charges){mark.charges=0;g.gain(u,u.energyCap*v(3),true);}}}
 if(type==='after'&&own&&k===91&&e.targets.size>=2&&g.effect(u,u,'Hải Quyền')){if(g.once(u,'Hải Quyền NL'))g.gain(u,v(2)*100);buff('Hải Quyền nhịp',{damage:v(3)},1);}
 if(type==='sync'&&k===95&&s.sources)for(const key of Object.keys(s.sources))if(!g.debuffs(g.ctx.enemies[key],u).length)delete s.sources[key];

}
