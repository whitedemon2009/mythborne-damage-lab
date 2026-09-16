export function artifactEvent(g,u,type,e){
 const s=g.state(u).data,a=e.action||{},own=e.unit===u,t=e.target,ability=a.ability||a.source;
 const has=(n,tier=4)=>g.has(u,n,tier),b=(key,mods={},d=2,cap=0,extra={})=>g.buff(u,u,key,mods,d,cap,extra),sc=(key,mods,d=2,cap=0,extra={})=>b(key,{},d,cap,{scoped:mods,...extra});
 if(type==='start'&&own){
  a.setSnapshot={war:g.stacks(u,u,'Chiến Ý'),aim:g.stacks(u,u,'Khóa Chuẩn'),gear:g.stacks(u,u,'Bánh Răng')};
  if(has(16)&&ability==='Ult'){a.bonus=(a.bonus||0)+Math.min(.25,Math.floor(u.currentEnergy/40)*.05);if(has(16,5)&&(a.energyCost??u.energyCap)>=160)a.pen=(a.pen||0)+.12;}
  if(has(7)&&['Basic','Skill'].includes(ability)){const r=g.effect(u,u,'Cộng Hưởng');if(r&&!r.used){r.used=true;let multi=1;if(has(7,5)){g.gain(u,6);if(u.currentEnergy>=.8*(a.ultimateRequirement??u.ultimateRequirement??u.energyCap))multi=1.5;}if(['Buff','Shield','Heal'].includes(a.source))a.supportMultiplier=(a.supportMultiplier||1)*(1+.12*multi);else a.bonus=(a.bonus||0)+.2*multi;}}
  if(has(5)){const n=g.stacks(u,u,'Lệch Pha'),boost=s.phaseBoost?.09:.06;a.bonus=(a.bonus||0)+n*boost;if(['atk','critDmg','damage'].includes(a.buffType)&&a.source==='Buff')a.buffValue*=1+n*boost;s.phaseBoost=false;}
 }
 if(type==='modify'&&own){
  if(has(0,5)&&g.effect(u,u,'Thế Công')&&s.warSource&&s.warSource!==a.source)e.bonus+=.12;
  if(has(1)&&g.effect(t,u,'Tiêu Điểm')){e.bonus+=.18;if(has(1,5)&&a.setSnapshot?.aim>=3&&e.count===1){e.bonus+=.15;e.pen+=.08;a.consumeAim=true;}}
  if(has(6)&&g.effect(t,u,'Rạn Tầng'))e.bonus+=.18;
  if(has(6,5)&&a.source==='Break'&&g.stacks(u,u,'Nhiệt Lõi')>=3){e.breakBonus+=.3;a.consumeCore=true;}
  if(has(8)&&a.source==='DoT'){const n=g.stacks(t,u,'Trầm Tích');e.bonus+=n*.06;if(has(8,5)&&n>=3)a.sedimentExtra=true;}
  if(has(9,5)&&g.stacks(u,u,'Huyết Thế')>=3){e.critDmg+=.2;e.pen+=.1;}
  if(has(11,5)&&a.source==='FUA'&&a.setSnapshot?.gear>=3){e.pen+=.1;a.consumeGears=true;}
  if(has(12)&&(a.source==='FUA'||ability==='Skill'&&a.enhanced)&&g.effect(u,u,'Thượng Triều')&&g.effect(u,u,'Hạ Triều')){e.bonus+=.2;if(has(12,5))e.pen+=.1;}
  if(has(13)&&(t.toughness>0||a.actionUnbroken?.includes(t.index)))e.efficiency+=.2;
  if(has(13,5)&&a.source==='Diệt Kích'&&g.stacks(u,u,'Phá Tuyến')>=3){e.pen+=.12;e.breakBonus+=.15;a.consumeFault=true;}
  if(has(14)&&a.source==='Counter'&&s.swordChain===a.chain){e.bonus+=.24;if(has(14,5)&&(!s.swordUsed||a.swordFirst)){e.pen+=.12;a.swordFirst=true;}}
  if(has(15)&&ability==='Basic'&&g.effect(u,u,'Dây Căng')){e.bonus+=.24;if(has(15,5)){e.critDmg+=.18;e.pen+=.1;}}
  if(has(17)&&a.storedDamage){e.bonus+=.24;if(has(17,5)&&!a.storedFirstDone){e.pen+=.15;a.storedProc=true;}}
  if(has(21)&&['FUA','Ult'].includes(a.source)&&g.effect(u,u,'Tái Triều '+t.index)){e.bonus+=.25;if(has(21,5))e.pen+=.12;a.tideTargets??=new Set();a.tideTargets.add(t.index);}
 }
 if(type==='modify'&&has(2)){
  const target=e.target,n=g.stacks(target,u,'Hắc Văn');if(n){if(a.source==='DoT')e.vulnerability+=n*.04;if(own)e.vulnerability+=n*.03;}
 }
 if(type==='hit'&&e.amount>0){
  if(has(2,5)&&g.stacks(t,u,'Hắc Văn')>=3&&(own||a.source==='DoT')&&g.once(u,'Hắc Văn kéo dài '+t.index)){const pool=[...g.debuffs(t)].filter(b=>b.duration>0);if(pool.length)pool[Math.floor(g.ctx.random()*pool.length)].duration++;}
  if(!own)return;
  if(has(1,5)&&e.crit&&g.effect(t,u,'Tiêu Điểm'))b('Khóa Chuẩn',{critDmg:.06},2,3);
  if(has(6,5)&&g.effect(t,u,'Rạn Tầng')&&a.source!=='Break')b('Nhiệt Lõi',{break:.05},2,3);
  if(has(6,5)&&a.consumeCore){g.remove(u,u,'Nhiệt Lõi');a.consumeCore=false;}
  if(has(8)&&a.source==='DoT'){
   if(a.sedimentExtra){g.remove(t,u,'Trầm Tích');g.ctx.fixedDamage(t,e.calculated*.25,u,'DoT',{...a,reportName:'Trầm Tích'});a.sedimentExtra=false;}
   else if(g.once(u,'Trầm Tích '+t.index+':'+(a.effectName||''),1,a.dotGroup??a.uid))g.mark(u,t,'Trầm Tích',2,3);
  }
  if(has(13,5)&&a.source==='Diệt Kích'){if(a.consumeFault){g.remove(u,u,'Phá Tuyến');a.consumeFault=false;}else if(g.once(u,'Phá Tuyến '+t.index,1,a.uid))sc('Phá Tuyến',{dkBonus:.06},2,3,{sources:['Diệt Kích']});}
  if(has(14,5)&&a.swordFirst){s.swordUsed=true;s.swordRefund=true;}
  if(has(17,5)&&a.storedProc)a.storedFirstDone=true;
  if(has(21)&&e.brokenBefore){s.brokenTargets??=new Set();s.brokenTargets.add(t.index);}
 }
 if(type==='after'&&own){
  const n=e.targets.size;
  if(n&&has(0)&&['Basic','Skill','Ult','FUA','DoT'].includes(a.source)){
   const old=g.effect(u,u,'Chiến Ý');if(s.warSource&&s.warSource!==a.source)b('Chiến Ý',{damage:.05},2,3);else if(old)old.duration=2;
   s.warSource=a.source;if(has(0,5)&&g.stacks(u,u,'Chiến Ý')>=3&&!g.effect(u,u,'Thế Công'))b('Thế Công',{critDmg:.18});
  }
  if(n===1&&has(1)){for(const target of g.ctx.enemies)g.remove(target,u,'Tiêu Điểm');g.mark(u,g.ctx.enemies[[...e.targets][0]],'Tiêu Điểm');}
  if(a.consumeAim)g.remove(u,u,'Khóa Chuẩn');
  if(has(5,5)&&g.stacks(u,u,'Lệch Pha')>=2&&g.once(u,'Bước Qua Nhịp')){g.advance(u,.12);g.effect(u,u,'Lệch Pha').duration=2;s.phaseBoost=true;}
  if(has(7)&&ability==='Ult')g.mark(u,u,'Cộng Hưởng',2,0,{used:false});
  if(has(11)&&a.source==='FUA'&&n){if(a.consumeGears){g.remove(u,u,'Bánh Răng');if(n>=2)g.gain(u,6);}else if(g.once(u,'Bánh Răng',1,a.chain))b('Bánh Răng',{FUADamage:.06},2,3);else {const gear=g.effect(u,u,'Bánh Răng');if(gear)gear.duration=2;}}
  if(has(12)&&n){if(ability==='Skill'&&a.enhanced){b('Thượng Triều',{damage:.08});if(has(12,5))sc('Triều kế FUA',{bonus:.25},2,0,{sources:['FUA'],consume:'damage'});}if(a.source==='FUA'){b('Hạ Triều',{damage:.08});if(has(12,5))sc('Triều kế Skill',{bonus:.25},2,0,{sources:['Skill'],enhancedOnly:true,consume:'damage'});}}
  if(has(15)&&ability==='Skill')g.mark(u,u,'Dây Căng');
  if(has(15,5)&&ability==='Basic'&&n&&g.effect(u,u,'Dây Căng')&&g.once(u,'Dây Căng NL'))g.gain(u,5);
  if(has(16,5)&&ability==='Ult'&&(a.energyCost??u.energyCap)>=160)g.gain(u,(a.energyCost??u.energyCap)*.08,true);
  if(has(17,5)&&a.storedProc&&n)g.gain(u,6);
  if(a.tideTargets&&n)for(const index of a.tideTargets){if(!e.targets.has(index))continue;g.remove(u,u,'Tái Triều '+index);if(has(21,5))g.gain(u,6);}
 }
 if(type==='debuff'&&own){
  if(has(2))g.mark(u,t,'Hắc Văn',2,3);
  if(has(8)&&a.source==='DoT'){const b=g.effect(t,u,'Trầm Tích');if(b)b.duration=2;}
  if(has(10)&&e.disrupt&&g.once(u,'Lệch Trục '+t.index,1,a.uid)){
   if(has(10,5)&&g.stacks(t,u,'Lệch Trục')>=2){g.remove(t,u,'Lệch Trục');g.buff(u,t,'Trật Nhịp',{defReduction:.08});}
   else g.buff(u,t,'Lệch Trục',{resist:-.05},2,2);
  }
 }
 if(type==='delay'&&own&&has(10,5)&&g.effect(t,u,'Trật Nhịp')&&g.once(u,'Trật Nhịp '+t.index))e.amount+=.05;
 if(type==='break'&&own){
  if(has(6)){g.mark(u,t,'Rạn Tầng');a.breakDotBonus=.15;}
  if(has(13))sc('Dư Chấn đá',{dkBonus:.18},2,0,{sources:['Diệt Kích']});
 }
 if(type==='hpLost'&&own&&e.self&&has(9)&&e.amount&&g.once(u,'Huyết Thế',1,a.uid)){
  const was=g.stacks(u,u,'Huyết Thế')>=3;b('Huyết Thế',{damage:.06},2,3);
  if(has(9,5)&&was&&g.once(u,'Tử Chiến'))sc('Tử Chiến nhịp',{bonus:.15},null,0,{consume:'damage',untilTurn:u.turn});
 }
 if(type==='shield'&&own&&has(3))b('Trụ Thành',{shieldBonus:.12});
 if(type==='shieldHit'&&e.owner===u&&has(3)&&g.effect(u,u,'Trụ Thành')){
  g.mark(u,u,'Chấn Thành',null,5);if(has(3,5)&&g.stacks(u,u,'Chấn Thành')>=5&&g.once(u,'Cự Thạch')){g.remove(u,u,'Chấn Thành');for(const ally of g.allies())if(g.shielded(ally,u)){g.restore(u,ally,g.eff(u).def*.06+160);g.buff(u,ally,'Cự Thạch',{reduction:.08},1);}}
 }
 if(type==='beforeHeal'&&own&&e.delayed&&has(18))e.outgoing+=.18;
 if(type==='heal'&&own){
  if(has(4)){if(e.origin!=='Sinh Tuyền')g.mark(u,t,'Sinh Tuyền');if(t.currentHP>g.eff(t).hp*.9)g.buff(u,t,'Sinh Tuyền sức mạnh',{atk:.08},1);}
  if(has(18)&&e.delayed&&e.amount>0){g.buff(u,t,'An Mạch',{reduction:.08},1);if(has(18,5)&&g.once(u,'An Mạch '+t.index))g.next(u,t,'Đơn Thuốc',{},{scoped:{bonus:.12}});}
 }
 if(type==='turnStart'){
  const ally=e.unit;
  if(own&&has(5)&&g.eff(u).speed>(u.speedBaseTotal??u.speed))g.mark(u,u,'Lệch Pha',2,2);
  if(has(4)&&g.effect(ally,u,'Sinh Tuyền')){g.heal(u,ally,g.eff(u).hp*.025,{origin:'Sinh Tuyền',delayed:true});if(has(4,5)){g.mark(u,u,'Dưỡng Mạch',null,4);if(g.stacks(u,u,'Dưỡng Mạch')>=4&&g.once(u,'Mạch Nguồn')){g.remove(u,u,'Dưỡng Mạch');g.planck(u,1);for(const target of g.allies())if(g.effect(target,u,'Sinh Tuyền'))g.buff(u,target,'Mạch Nguồn',{damage:.1},1);}}}
 }
 if(type==='allySkill'&&own&&has(20))g.mark(u,t,'Tiền Lộ',2,0,{charges:1});
 if(type==='select'){
  if(t===u&&has(14)){s.swordChain=e.chain;s.swordUsed=false;s.swordRefund=false;if(has(14,5))g.buff(u,u,'Thế Nghênh',{reduction:.08},null,0,{enemyChain:e.chain});}
  const mark=g.effect(t,u,'Tiền Lộ');if(has(20)&&mark?.charges){mark.charges=0;g.buff(u,t,'Tiền Lộ đón đòn',{reduction:.08},null,0,{enemyChain:e.chain,afterEnemy:{bonus:.12,critDmg:has(20,5)?.18:0}});if(has(20,5))g.advance(t,.1);}
 }
 if(type==='enemyEnd'){
  const enemy=e.enemy;
  if(has(19)&&g.debuffs(enemy,u).length){const n=e.recipients.size;g.buff(u,enemy,'Hậu Tội',{vulnerability:.08+(has(19,5)&&n>=2?.06:0),defReduction:has(19,5)&&n===1?.08:0,speed:has(19,5)&&n===0?-8:0},1);}
  if(has(14,5)&&s.swordRefund){g.gain(u,6);s.swordRefund=false;}
 }
 if(type==='recover'&&has(21)&&s.brokenTargets?.has(e.enemy.index)){s.brokenTargets.delete(e.enemy.index);g.mark(u,u,'Tái Triều '+e.enemy.index);}
 if(type==='death'&&e.unit.side==='enemy'){
  const dead=e.unit;
  if(has(2,5)&&g.stacks(dead,u,'Hắc Văn')>=3){const pool=g.enemies();for(let i=0;i<Math.min(2,pool.length);i++){const j=i+Math.floor(g.ctx.random()*(pool.length-i));[pool[i],pool[j]]=[pool[j],pool[i]];g.mark(u,pool[i],'Hắc Văn',2,3);}}
  if(has(8,5)&&g.stacks(dead,u,'Trầm Tích')>=2){const target=g.enemies().sort((a,b)=>b.hp-a.hp)[0];if(target)g.mark(u,target,'Trầm Tích',2,3);}
 }
 if(type==='expired'&&own){
  if(has(0,5)&&s.hadWar&&!g.effect(u,u,'Thế Công'))g.remove(u,u,'Chiến Ý');s.hadWar=!!g.effect(u,u,'Thế Công');
  if(has(3)&&!g.effect(u,u,'Trụ Thành'))g.remove(u,u,'Chấn Thành');
 }
}
