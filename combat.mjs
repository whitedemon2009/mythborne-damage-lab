import {CharacterRuntime,characterBattleRules} from './character-runtime.mjs';
import {needsSupportPreview} from './support-targeting.mjs';
import {patternedAction} from './action-patterns.mjs';
import {validateRotation,rotationAction} from './rotation.mjs';
import {describeDamage,reportCategory} from './report.mjs';
import {actionToughness} from './character-rules.mjs';
import {GearEvents} from './gear-events.mjs';
import {Timeline} from './timeline.mjs';
import {addEffect,expireEffects,effectiveStats,effectChance} from './effects.mjs';
import {baseAV,clamp,normalizeElement,threat,seeded,weightedTarget,applyShields,directDamage,breakDamage,annihilation,quangValue,energyGain,defMultiplier,resMultiplier,mitigation,canFollow} from './formulas.mjs';
export * from './formulas.mjs';
export {effectChance} from './effects.mjs';

// Generic engine. Character-specific triggers must be registered explicitly.
function runCombatPass(config,roster,actions){
 validateRotation(config.rotation,roster);
 const units=roster.map((c,index)=>({...c,crit:c.crit??.05,critDmg:c.critDmg??.5,index,side:'ally',level:c.level??60,speed:Math.max(1,Math.round(c.speed??100)),hp:c.hp??3000,currentHP:c.hp??3000,energyCap:c.energyCap??120,energyCapExplicit:Number.isFinite(c.energyCap)&&c.energyCap>0,currentEnergy:(c.energyCap??120)/2,threat:c.threat??threat(c.aspect),effects:[],shields:[],shieldDurations:[],shieldLayers:[],revives:(c.revives||[]).map(r=>({...r})),turn:0,script:0}));
 const enemies=Array.from({length:config.count},(_,index)=>({index,side:'enemy',level:config.level,res:config.res,maxHP:config.hp,hp:config.hp,speed:Math.round(config.speed),maxToughness:config.maxToughness,toughness:config.toughness,weaknesses:config.weaknesses.map(normalizeElement),reductions:[config.reduction||0],resist:config.effectRes??0,effects:[],dots:[],quang:null,turn:0}));
 const timeline=new Timeline(),random=seeded(config.seed??1),log=[],totals={},rows=[],executions=[],pending=[],triggerUses=new Map(),gearTargetCounts={},gearDeferred=[];
 const horizon=150+100*(config.cycles-1),startingRules=characterBattleRules(roster,config),planckCap=startingRules.cap;let runtime=null;let activeUnit=null,actionSerial=0;let planck=Math.min(planckCap,startingRules.initial),steps=0,chain=0,complete=true,error=null;
 const turnRecords=[],enemyRecords=[],damageEvents=[],diagnostics=[];let traceSerial=0,rotationMoment={phase:'start',key:'start'};
 const diagnose=(type,u,message,extra={})=>{if(config.report)diagnostics.push({av:timeline.time,type,actor:u?.index,message,...extra});};
 const detail=(...args)=>config.report?describeDamage(...args):undefined;
 const snapshot=()=>({planck,energy:units.map(u=>u.currentEnergy),toughness:enemies.map(e=>e.toughness),speed:units.map(u=>effective(u).speed),effects:units.map(u=>u.effects.map(e=>e.characterKey||e.gearKey||e.name))});
 const emit=(message,type='info',extra={})=>log.push({av:timeline.time,message,type,...extra});
 const effective=effectiveStats;
 const living=u=>!!u&&(u.side==='enemy'?u.hp>0:u.currentHP>0);
 const receivedDamage=(e,value)=>Math.min(config.infiniteHP?Infinity:e.hp,Math.max(0,value));
 const speed=e=>effective((e.side==='ally'?units:enemies)[e.index]).speed;
 const normalized=actions.map((a,row)=>({target:0,targets:1,hits:1,ratio:0,flat:0,scaling:'atk',toughness:0,efficiency:0,cost:0,refund:0,energy:['FUA','Counter'].includes(a.source)?10:0,duration:2,buffValue:0,baseChance:1,guaranteed:true,effectName:`Hiệu ứng ${row+1}`,outgoing:0,received:0,...a,toughness:actionToughness(a.source,units[a.actor]?.aspect,a.toughness),row}));
 const triggers=normalized.filter(a=>a.trigger&&a.trigger!=='manual');
 for(const t of triggers)if(!(t.maxPerTurn>0))throw Error('Trigger cần giới hạn kích hoạt mỗi lượt lớn hơn 0.');
 const scripts=units.map((u,i)=>normalized.filter(a=>a.actor===i&&a.realTurn&&(!a.trigger||a.trigger==='manual')));
 const natural=(u,at)=>timeline.add({at,side:u.side,index:u.index,natural:true});
 if(config.dynamic)for(const u of units)natural(u,baseAV(u.speed));
 for(const e of enemies)natural(e,baseAV(e.speed));
 for(const a of normalized)if((!config.dynamic||!a.realTurn)&&(!a.trigger||a.trigger==='manual'))timeline.add({at:a.av??0,side:'ally',index:a.actor,natural:false,action:a});
 const clampQuang=()=>{for(const e of enemies)if(e.quang)e.quang.recorded=quangValue(e.quang,units.map(effective));};
 const retime=(u,old)=>{const next=effective(u).speed;if(next!==old)timeline.retime(u.side,u.index,old,next);clampQuang();};
 const gain=(u,amount,percent=false)=>{if(living(u)){const value=energyGain(amount,effective(u).energy||0,percent),overflow=Math.max(0,u.currentEnergy+value-u.energyCap);if(overflow)diagnose('energyOverflow',u,`${u.name}: ${overflow.toFixed(2)} Năng Lượng vượt giới hạn`,{amount:overflow});u.currentEnergy=clamp(u.currentEnergy+value,0,u.energyCap);}runtime?.sync();};
 const gear=new GearEvents({units,enemies,effective,retime,install,gain,emit,random,characterEvent:(type,event)=>runtime?.event(type,event),
  get activeUnit(){return activeUnit;},
  planck:(u,n)=>{const before=planck;if(planck+n>planckCap)diagnose('planckOverflow',u,`${u.name}: ${planck+n-planckCap} Planck vượt giới hạn`,{amount:planck+n-planckCap});planck=Math.min(planckCap,planck+n);emit(`${u.name} · Trang bị hồi ${planck-before} Planck`,'gear');gear.dispatch('planck',{unit:u,amount:planck-before});},
  advance:(u,n)=>timeline.advance('ally',u.index,baseAV(effective(u).speed),n),
  restore:(owner,target,value)=>{let layer=target.shieldLayers.find(s=>s.owner===owner.index);if(!layer){layer={key:'gear:'+owner.index,owner:owner.index,value:0,duration:2};target.shieldLayers.push(layer);}layer.value+=value;target.shields=target.shieldLayers.map(s=>s.value);emit(`${owner.name} phục hồi ${value.toFixed(2)} Khiên cho ${target.name}`,'gear');},
  heal:(u,t,value,meta)=>healValue(u,t,value,meta),
  tick:(t,d,mult=1,external=false,triggerOwner,triggerAction)=>tick(t,d,mult,external,triggerOwner,triggerAction),
  dotValue:(t,d)=>directDamage(effective(units[d.owner]),effective(t),{...d.action,dot:true},'normal'),
  fixedDamage:(t,value,u,kind,a)=>damage(t,value,u.index,kind,a.row,a.reportDetail||detail(effective(u),effective(t),a,'stored','normal',1,value)),
  extraDamage:(u,ratio,element,a)=>{gearDeferred.push(()=>{for(const t of enemies.filter(living)){const c={...effective(u),element},action={ratio,source:'Extra',flat:0,name:'Sát thương phụ trang bị'};damage(t,directDamage(c,effective(t),action,config.critMode),u.index,'gear',a.row,detail(c,effective(t),action,'direct',config.critMode));}});}
 });
 runtime=new CharacterRuntime({extraTurn:(u,a)=>timeline.add({at:timeline.time,side:"ally",index:u.index,natural:false,extraTurn:true,action:{...a,actor:u.index,realTurn:true,preserveDurations:true}}),reduceToughness:(u,t,n,a)=>{const before=t.toughness;t.toughness=Math.max(0,before-n);if(before>0&&!t.toughness)breakTarget(t,{...a,actor:u.index});},units,enemies,config,gear,retime,install,gain,emit,random,pending,shield:createShield,applyDebuff,tick,heal:healValue,planckCount:()=>planck,planckCap:()=>planckCap,delay:(t,n)=>timeline.advance('enemy',t.index,baseAV(effective(t).speed),-n),planck:(u,n)=>{const old=planck;planck=Math.min(planckCap,planck+n);emit(`${u.name} · Kit hồi ${planck-old} Planck`,'character');if(planck>old)gear.dispatch('planck',{unit:u,amount:planck-old});}});
 runtime.ctx.rotationMoment=()=>rotationMoment;
 const originalPlanck=runtime.ctx.planck;runtime.ctx.planck=(u,n)=>{if(planck+n>planckCap)diagnose('planckOverflow',u,`${u.name}: ${planck+n-planckCap} Planck vượt giới hạn`,{amount:planck+n-planckCap});originalPlanck(u,n);};
 function createShield(u,t,ratio,flat,duration,key,a){
  const c=effective(u),value=Math.max(0,(ratio*c.atk+flat)*(1+(c.shieldBonus||0))),old=t.shieldLayers.find(s=>s.key===key),keep=(old?.value||0)>value;
  t.shieldLayers=t.shieldLayers.filter(s=>s.key!==key);t.shieldLayers.push({key,owner:u.index,value:keep?old.value:value,initial:keep?(old.initial??old.value):value,duration});t.shields=t.shieldLayers.map(s=>s.value);
  emit(`${u.name} tạo Khiên ${t.shieldLayers.at(-1).value.toFixed(2)} cho ${t.name}`,'shield');gear.dispatch('shield',{unit:u,target:t,action:a});return t.shieldLayers.find(s=>s.key===key);
 }
 function healValue(u,t,value,meta={}){
  if(!living(u)||!living(t))return 0;
  const event={unit:u,target:t,outgoing:effective(u).outgoing||0,...meta};gear.dispatch('beforeHeal',event);
  const before=t.currentHP,effectiveAmount=Math.max(0,Math.min(value*(1+event.outgoing),meta.maxHeal??Infinity)),actual=Math.max(0,Math.min(effectiveAmount,effective(t).hp-before));t.currentHP+=actual;
  emit(`${u.name} hồi ${actual.toFixed(2)} HP cho ${t.name}`,'heal');gear.dispatch('heal',{...event,before,amount:actual,effectiveAmount});gear.dispatch('sync',{});return actual;
 }
 function hook(event,parent=null){
  for(const t of triggers){
   const u=units[t.actor];if(!u||!living(u))continue;
   const id=t.fuaId||`trigger:${t.row}`;
   if(parent&&!canFollow(parent,id))continue;
   if(t.trigger!==event.type)continue;
   if(t.trigger==='afterAttack'&&(event.actor===t.actor||event.side!=='ally'))continue;
   if(t.trigger==='enemyHit'&&!event.recipients.includes(t.actor))continue;
   if(t.trigger==='break'&&event.side!=='ally')continue;
   const key=`${t.row}:${u.turn}`,used=triggerUses.get(key)||0;
   if(used>=t.maxPerTurn)continue;
   triggerUses.set(key,used+1);
   pending.push({...t,triggerActor:event.actor,chain,realTurn:false,fuaId:id,parent,target:t.followTarget?event.target??t.target:t.target});
  }
 }
 function death(u){
  const old=effective(u).speed;gear.dispatch('death',{unit:u});
  u.effects=[];u.gearState=undefined;if(u.side==='enemy'){u.dots=[];u.quang=null;timeline.remove(e=>e.side==='enemy'&&e.index===u.index);emit(`Myrk ${u.index+1} bị hạ`,'death');return;}
  u.currentEnergy=0;u.shields=[];u.shieldDurations=[];u.shieldLayers=[];
  emit(`${u.name} bị hạ`,'death');
  const priority={talent:0,ascension:1,skill:2,fate:3,ally:4,external:5};
  const extraRevives=[];runtime.event('reviveCheck',{unit:u,revivals:extraRevives});
  const revive=[...u.revives,...extraRevives].filter(r=>(r.uses??1)>0).sort((a,b)=>(priority[a.type]??5)-(priority[b.type]??5))[0];
  if(revive){revive.uses=(revive.uses??1)-1;revive.onUse?.();u.currentHP=Math.max(1,u.hp*(revive.hpFraction??.5));u.currentEnergy=clamp(revive.energy??0,0,u.energyCap);emit(`${u.name} hồi sinh; giữ tiến trình lượt`,'revive');revive.after?.();retime(u,old);}
  else timeline.remove(e=>e.side==='ally'&&e.index===u.index);
 }
 function damage(e,value,actor,kind,row,info){
  if(e.hp<=0)return 0;
  const u=units[actor],hpBefore=e.hp,actual=receivedDamage(e,value);
  if(config.report){const d=info||detail(effective(u),effective(e),{name:kind,source:kind},'stored','normal',1,value);damageEvents.push({...d,av:timeline.time,actor,target:e.index,kind,category:reportCategory(kind,d),actual,calculated:value,hpBefore,overkill:config.infiniteHP?0:Math.max(0,value-hpBefore)});}
  if(!config.infiniteHP)e.hp-=actual;e.damageTaken=(e.damageTaken||0)+actual;e.lastDamageActor=actor;
  totals[u.name]=(totals[u.name]||0)+actual;if(row!==undefined)rows[row]=(rows[row]||0)+actual;
  if(kind==='direct'&&e.quang){e.quang.recorded+=actual*.2;clampQuang();}
  if(actual)emit(`${u.name} → Myrk ${e.index+1}: ${actual.toFixed(2)} (${kind})`,'damage',{actor,target:e.index,amount:actual,kind});
  if(e.hp===0){gain(u,10);death(e);}
  return actual;
 }
 function install(u,e){
  if(!living(u))return;
  const old=effective(u).speed;addEffect(u,e);if(u.side==='ally')u.currentHP=Math.min(u.currentHP,effective(u).hp);retime(u,old);
 }
 function applyDebuff(e,a){
  const c=effective(units[a.actor]),t=effective(e);
  const immune=(config.immunities||[]).includes(a.effectName)||(config.immunities||[]).includes(a.buffType);
  const chance=effectChance(a.baseChance,c.hit||0,t.resist||0,a.guaranteed,immune);
  if(chance<1&&random()>=chance){emit(`Myrk ${e.index+1} kháng ${a.effectName}`,'resisted');return false;}
  if(a.source==='DoT'){
   const old=e.dots.find(d=>d.name===a.effectName),stacks=a.maxStacks?Math.min(a.maxStacks,(old?.stacks||0)+1):1;
   e.dots=e.dots.filter(d=>d.name!==a.effectName);e.dots.push({name:a.effectName,owner:a.actor,action:{...a},duration:a.duration,stacks,row:a.row});
  }else if(a.buffType==='delay'||a.buffType==='advance'){const delayed={unit:units[a.actor],target:e,action:a,amount:a.buffValue};if(a.buffType==='delay')gear.dispatch('delay',delayed);timeline.advance('enemy',e.index,baseAV(t.speed),a.buffType==='delay'?-delayed.amount:delayed.amount);}
  else install(e,{name:a.effectName,type:a.buffType,value:a.buffValue*(a.supportMultiplier||1),duration:a.duration,owner:a.actor,maxStacks:a.maxStacks,element:a.implantElement,skipRecovery:a.skipRecovery});
  gear.dispatch('debuff',{unit:units[a.actor],target:e,action:a,disrupt:['delay','control'].includes(a.buffType)||['speed','speedPct'].includes(a.buffType)&&a.buffValue<0,hardDisrupt:['delay','control'].includes(a.buffType)});
  emit(`${units[a.actor].name} áp dụng ${a.effectName} lên Myrk ${e.index+1}`,'effect');return true;
 }
 function tick(e,d,mult=1,external=false,triggerOwner=null,triggerAction=null){
  if(e.hp<=0)return;const u=units[d.owner],a={...d.action,actor:d.owner,uid:triggerAction?.uid??++actionSerial,triggerOwner:triggerOwner?.index,chain,source:'DoT',ability:'DoT',fuaId:triggerAction?.fuaId,triggerCharacter:triggerAction?.characterId,triggerEnhanced:!!triggerAction?.enhanced,dotGroup:external?'action:'+(triggerAction?.uid??actionSerial):'enemy:'+e.index+':'+e.turn,effectName:d.name,ratio:d.action.ratio*(d.stacks||1)*mult,flat:(d.action.flat||0)*(d.stacks||1)*mult,dot:true,external,duration:d.duration};
  if(external)gear.dispatch('externalDot',{unit:triggerOwner||u,target:e,action:a});
  gear.dispatch('dotStart',{unit:u,target:e,dot:d,action:a});
  let amount=0;for(let hit=0;hit<(a.dotHits||1)&&living(e);hit++){const m=gear.modifiers(u,e,a,1),mode=m.action.allowDotCrit?(config.critMode==='sampled'?(random()<m.stats.crit?'crit':'normal'):config.critMode):'normal';const value=directDamage(m.stats,m.enemy,m.action,mode)*(a.countsAsDK?(m.action.dkMultiplier??1):1),brokenBefore=e.toughness===0,info=detail(m.stats,m.enemy,m.action,'direct',mode,a.countsAsDK?(m.action.dkMultiplier??1):1);
  // Dispatch before death cleanup so transfer mechanics can still inspect marks.
  amount+=receivedDamage(e,value);gear.dispatch('hit',{unit:u,target:e,action:a,amount:receivedDamage(e,value),calculated:value,brokenBefore,crit:mode==='crit'});
  damage(e,value,u.index,'DoT',d.row,info);}
  gear.dispatch('dotEnd',{unit:u,target:e,dot:d,action:a});gear.dispatch('after',{unit:u,action:a,targets:new Set(amount>0?[e.index]:[])});
 }

 function breakTarget(e,a){
  e.brokenAtTurn=e.turn;
  const owner=units[a.actor],ba={...a,source:'Break',damageSource:undefined,ability:a.ability||a.source};const bm=gear.modifiers(owner,e,ba,1);
  const breakValue=breakDamage(bm.stats,bm.enemy,bm.action),info=detail(bm.stats,bm.enemy,bm.action,'Break');gear.dispatch('hit',{unit:owner,target:e,action:ba,amount:receivedDamage(e,breakValue),calculated:breakValue,defResFactor:defMultiplier(bm.stats.level||60,bm.enemy.level,(bm.action.defReduction||0)+(bm.enemy.defReduction||0),(bm.stats.pierce||0)+(bm.action.pen||0))*resMultiplier(bm.enemy.res,bm.action.resPen||0),brokenBefore:false});
  damage(e,breakValue,a.actor,'Break',a.row,info);gear.dispatch('break',{unit:owner,target:e,action:a});
  if(!living(e)){emit(`Myrk ${e.index+1}: Vỡ Khiên`,'break');hook({type:'break',side:'ally',actor:a.actor,target:e.index},a.fuaId);return;}
  const el=normalizeElement(units[a.actor].element);
  timeline.advance('enemy',e.index,baseAV(effective(e).speed),-(.25+(el==='Nham'?.3:0)));
  if(['Phong','Băng','Thủy'].includes(el))install(e,{name:{Phong:'Hất Tung',Băng:'Đóng Băng',Thủy:'Chết Đuối'}[el],type:'control',value:0,duration:1,owner:a.actor,skipRecovery:el!=='Phong'});
  if(['Hỏa','Lôi'].includes(el)){
   const name=el==='Hỏa'?'Thiêu Đốt':'Tê Liệt';e.dots=e.dots.filter(d=>d.name!==name);e.dots.push({name,owner:a.actor,action:{ratio:1,flat:0,scaling:'atk',bonus:a.breakDotBonus||0},duration:2,stacks:1,row:a.row});
  }
  if(el==='Ám')for(const d of [...e.dots])tick(e,d,1,true,owner,a);
  if(el==='Quang'&&living(e))e.quang={owner:a.actor,recorded:0};
  if(living(e))gear.dispatch('breakResolved',{unit:owner,target:e,action:a});
  emit(`Myrk ${e.index+1}: Vỡ Khiên`,'break');hook({type:'break',side:'ally',actor:a.actor,target:e.index},a.fuaId);
 }
 function hitTargets(a){
  const actualTargets=new Set();a.dkTargets??=new Set();a.damageByTarget??={};a.baseToughnessByTarget??={};
  if(a.phases){for(const phase of a.phases){const p={...a,...phase,phases:null,dkTargets:a.dkTargets};for(const i of hitTargets(p))actualTargets.add(i);if(p.markedHit)a.markedHit=true;if(p.actualCrit)a.actualCrit=true;}return actualTargets;}
  const initial=(a.targetIndices?a.targetIndices.map(i=>enemies[i]):enemies.slice(a.target,a.target+a.targets)).filter(living),dk=a.dkTargets;
  let victims=initial.length?initial:[enemies.find(living)].filter(Boolean);
  const hitCount=Math.max(1,Math.floor(a.hits));
  for(let hit=0;hit<hitCount;hit++){
   const roundTargets=a.bounce?[enemies.filter(living)[Math.floor(random()*enemies.filter(living).length)]].filter(Boolean):victims.map(e=>living(e)?e:enemies.find(living)).filter(Boolean);
   victims=roundTargets;
   for(let e of roundTargets){
    if(!living(e))e=enemies.find(living);
    if(!e)continue;
    const owner=units[a.actor],before=e.toughness;gear.dispatch('beforeDamage',{unit:owner,target:e,action:a});
    const m=gear.modifiers(owner,e,a,a.damageTargetCount||initial.length||1),c=m.stats,modified=m.action;
    if(a.source==='DoT'||a.source==='Debuff'){if(hit===0)applyDebuff(e,a);continue;}
    if(a.source==='Diệt Kích'||a.dkOnly){if(!dk.has(e.index)&&(before===0||a.allowUnbrokenDK)){const val=a.fixedDamage??(a.atkScaledDK?directDamage(c,m.enemy,{...modified,ratio:a.targetRatios?.[e.index]??a.ratio},'normal'):annihilation(c,m.enemy,modified))*(modified.dkMultiplier??1),info=detail(c,m.enemy,{...modified,ratio:a.targetRatios?.[e.index]??a.ratio},a.atkScaledDK?'direct':'Diệt Kích','normal',a.fixedDamage===undefined?(modified.dkMultiplier??1):1,a.fixedDamage);gear.dispatch('hit',{unit:owner,target:e,action:a,amount:receivedDamage(e,val),calculated:val,brokenBefore:true});const actual=damage(e,val,a.actor,'Diệt Kích',a.row,info);a.damageByTarget[e.index]=(a.damageByTarget[e.index]||0)+actual;dk.add(e.index);a.dkTargets.add(e.index);actualTargets.add(e.index);}continue;}
    const part={...modified,ratio:(a.targetRatios?.[e.index]??a.ratio)/hitCount,extraRatio:(a.extraRatio||0)/hitCount,flat:a.flat/hitCount};
    const hitMode=modified.forceCrit?'crit':config.critMode==='sampled'?(random()<Math.min(1,c.crit||0)?'crit':'normal'):config.critMode;
    const factor=defMultiplier(c.level||60,m.enemy.level,(part.defReduction||0)+(m.enemy.defReduction||0),(c.pierce||0)+(part.pen||0))*resMultiplier(m.enemy.res,part.resPen||0);
    const value=a.carryDamage!==undefined?a.carryDamage*factor:directDamage(c,m.enemy,part,hitMode),amount=receivedDamage(e,value),info=detail(c,m.enemy,part,'direct',hitMode);
    gear.dispatch('hit',{unit:owner,target:e,action:a,amount,calculated:value,defResFactor:factor,brokenBefore:before===0,crit:!a.trueDamage&&!modified.noCrit&&hitMode==='crit'});
    const actual=damage(e,value,a.actor,a.trueDamage?'true':'direct',a.row,info);if(actual>0){a.baseToughnessByTarget[e.index]=(a.baseToughnessByTarget[e.index]||0)+(a.targetToughness?.[e.index]??a.toughness)/hitCount;actualTargets.add(e.index);a.damageByTarget[e.index]=(a.damageByTarget[e.index]||0)+actual;}
    while(gearDeferred.length)gearDeferred.shift()();
    if(!living(e))continue;
    const weakness=e.weaknesses.includes(normalizeElement(c.element))||a.implant||e.effects.some(b=>b.type==='weakness'&&normalizeElement(b.element)===normalizeElement(c.element));
    if(weakness&&!a.trueDamage)e.toughness=Math.max(0,e.toughness-(a.targetToughness?.[e.index]??a.toughness)/hitCount*(1+(modified.efficiency||0)+(c.efficiency||0)));
    if(before>0&&e.toughness===0)breakTarget(e,a);
    // Once per action per actual target; includes the breaking hit.
    if(a.annihilate&&(!a.dkTargetIndices||a.dkTargetIndices.includes(e.index))&&(e.toughness===0||a.allowUnbrokenDK)&&living(e)&&!dk.has(e.index)){
     const da={...a,source:'Diệt Kích',damageSource:undefined,ability:a.ability||a.source,toughness:a.targetToughness?.[e.index]??a.toughness},dm=gear.modifiers(owner,e,da,initial.length||1),val=annihilation(dm.stats,dm.enemy,dm.action)*(dm.action.dkMultiplier??1),info=detail(dm.stats,dm.enemy,dm.action,'Diệt Kích','normal',dm.action.dkMultiplier??1);gear.dispatch('hit',{unit:owner,target:e,action:da,amount:receivedDamage(e,val),calculated:val,brokenBefore:true});damage(e,val,a.actor,'Diệt Kích',a.row,info);dk.add(e.index);a.dkTargets.add(e.index);
    }
   }
  }
  return actualTargets;
 }
 function perform(a){
  if(++steps>10000)throw Error('Chuỗi kích hoạt vượt giới hạn kiểm tra; cần xem lại trigger, không xuất kết quả bị cắt.');
  const u=units[a.actor];if(!u||!living(u))return false;
  const blocked=(type,message)=>{diagnose(type,u,message,{ability:a.ability||a.kitAction||a.source,energy:u.currentEnergy,planck});emit(message);return false;};
  const fallback=a.fallbackBasic;
  a=runtime.resolve(u,a);
  if(fallback&&a.kitResolved&&a.ability==='Skill'&&planck<a.cost){diagnose('fallback',u,`${u.name}: thiếu Planck, đổi Chiến Kĩ thành Tấn Công Thường`,{planck,required:a.cost});emit(`${u.name}: thiếu Planck, dùng Tấn Công Thường theo lựa chọn rotation`);a=runtime.resolve(u,{...a,kitAction:'Basic'});}
  if(a.needsRecipient&&!living(units[a.recipient]))return blocked('target',`${u.name}: cần chọn đồng minh còn sống; chưa tiêu tài nguyên`);
  if(a.otherRecipient&&(a.recipient===u.index||!living(units[a.recipient]||{})))return blocked('target',`${u.name}: cần chọn một đồng minh khác còn sống; chưa tiêu tài nguyên`);
  if(u.effects.some(e=>e.type==='control'))return blocked('control',`${u.name} không thể hành động vì khống chế`);
  if(a.minHP&&u.currentHP<=a.minHP)return blocked('hp',`${u.name}: không đủ HP để dùng kỹ năng`);
  if(['FUA','Counter'].includes(a.source)&&a.parent&&!canFollow(a.parent,a.fuaId)&&!runtime.canSelfFollow(u,a)){emit('Chặn FUA tự kích trực tiếp');return false;}
  if(planck<a.cost)return blocked('planck',`${u.name}: thiếu Planck, không thi triển`);
  const ultCost=a.energyCost??u.energyCap;
  if((a.ability||a.source)==='Ult'&&u.currentEnergy<ultCost)return blocked('energy',`${u.name}: thiếu Năng Lượng, không thi triển`);
  const recipient=units[a.recipient];
  if(['Buff','Heal','Shield'].includes(a.source)&&(!recipient||!living(recipient)))return blocked('target','Mục tiêu hỗ trợ không hợp lệ; chưa tiêu tài nguyên');
  a={...a,uid:++actionSerial,chain:a.chain??chain,ability:a.ability||a.source,livingCount:enemies.filter(living).length};
  a.hestiaCandidates??={};a.sekhmetTargets??={};a.houYiBreak??={};
  a.actionUnbroken=enemies.filter(e=>e.toughness>0).map(e=>e.index);
  a.damageTargetCount=config.gearTargetCounts?.[a.uid]??Math.max(1,(a.targetIndices?a.targetIndices.map(i=>enemies[i]):enemies.slice(a.target,a.target+a.targets)).filter(living).length);
  gear.dispatch('sync',{});const consumables=u.effects.filter(e=>e.consume==='damage');
  gear.dispatch('start',{unit:u,action:a});
  planck-=a.cost;if(a.ability==='Ult')u.currentEnergy-=ultCost;
  if(a.level)u.level=a.level;
  runtime.before(u,a);runtime.sync();
  if(a.name)emit(`${u.name} sử dụng ${a.name}`,'skill',{actor:u.index,name:a.name});
  if(a.selfHPCurrentCost>0){const lost=Math.min(u.currentHP-1,u.currentHP*a.selfHPCurrentCost);u.currentHP-=lost;gear.dispatch('hpLost',{unit:u,amount:lost,self:true,action:a});}
  if(a.selfHPCost>0){const lost=Math.min(u.currentHP-1,effective(u).hp*a.selfHPCost);u.currentHP-=lost;gear.dispatch('hpLost',{unit:u,amount:lost,self:true,action:a});}
  const c=effective(u);let grantedBuff=false;let gearTargets=new Set();
  if(a.source==='Buff'){
   if(a.buffType==='advance')gear.advance(recipient,a.buffValue);
   else if(a.buffType==='extraTurn')timeline.add({at:timeline.time,side:'ally',index:recipient.index,natural:false,extraTurn:true,action:a.extraAction??scripts[recipient.index][0]??{actor:recipient.index,source:'Wait',cost:0,refund:0,energy:0,realTurn:true}});
   else install(recipient,{name:a.effectName,type:a.buffType,value:a.buffValue*(a.supportMultiplier||1),duration:a.duration,owner:a.actor,maxStacks:a.maxStacks});
   grantedBuff=recipient!==u;
   emit(`${u.name} buff ${recipient.name}: ${a.effectName}`,'effect');
  }else if(a.source==='Heal'){
   healValue(u,recipient,Math.max(0,(a.ratio*(c[a.scaling]||0)+a.flat)*(a.supportMultiplier||1)*(1+a.received)),{outgoing:a.outgoing+(c.outgoing||0),action:a,delayed:a.delayedHeal});
  }else if(a.source==='Shield'){
   const key=a.shieldSource??String(a.actor),value=Math.max(0,(a.ratio*(c[a.scaling]||0)+a.flat)*(1+(c.shieldBonus||0))*(a.supportMultiplier||1)),old=recipient.shieldLayers.find(s=>s.key===key);
   recipient.shieldLayers=recipient.shieldLayers.filter(s=>s.key!==key);recipient.shieldLayers.push({key,owner:u.index,value:Math.max(old?.value||0,value),duration:a.duration});recipient.shields=recipient.shieldLayers.map(s=>s.value);emit(`${u.name} tạo Khiên cho ${recipient.name}`,'shield');gear.dispatch('shield',{unit:u,target:recipient,action:a});
  }else if(!['Wait','Support'].includes(a.source))gearTargets=hitTargets(a);
  if(a.triggerDoT)for(const target of enemies.slice(a.target,a.target+a.targets).filter(living))for(const dot of [...target.dots])tick(target,dot,a.dotMultiplier??1,true,u,a);
  if(a.ability==='Skill'&&recipient&&['Buff','Heal','Shield'].includes(a.source))gear.dispatch('allySkill',{unit:u,target:recipient,action:a});
  if(a.cleanse&&recipient){const bad=recipient.effects.filter(b=>b.value<0||b.type==='control');recipient.effects=recipient.effects.filter(b=>!bad.includes(b));gear.dispatch('cleanse',{unit:u,target:recipient,action:a,count:bad.length});}
  if(gearTargets.size)for(const b of consumables)if((!b.sources||b.sources.includes(a.damageSource||a.source))&&(b.target===undefined||gearTargets.has(b.target))&&(!b.enhancedOnly||a.enhanced))(b.character?runtime.remove(units[b.owner],u,b.characterKey):gear.remove(u,{index:b.owner},b.gearKey));
  gearTargetCounts[a.uid]=gearTargets.size;gear.dispatch('after',{unit:u,action:a,targets:gearTargets,grantedBuff});
  if(gearTargets.size)gear.state(u).data.previousDamageTarget=gearTargets.size===1?[...gearTargets][0]:null;
  if(living(u)){const prior=planck;if(planck+a.refund>planckCap)diagnose('planckOverflow',u,`${u.name}: ${planck+a.refund-planckCap} Planck vượt giới hạn`,{amount:planck+a.refund-planckCap});planck=Math.min(planckCap,planck+a.refund);if(planck>prior)gear.dispatch('planck',{unit:u,amount:planck-prior});gain(u,a.energy);}
  runtime.complete(u,a,gearTargets);gear.dispatch('sync',{});
  if(a.rotationPolicyKey)u.lastPolicyMoment=a.rotationPolicyKey;
  executions.push({av:timeline.time,order:traceSerial++,actor:a.actor,row:a.row,source:a.source,name:a.name,variant:a.variant,enhanced:!!a.enhanced,realTurn:!!a.realTurn,turn:u.turn,ability:a.ability,target:a.primaryTarget??a.target,recipient:a.recipient,supportTarget:!!(a.needsRecipient||a.otherRecipient||['Buff','Heal','Shield'].includes(a.source)),...(config.rotation?.enabled?{after:snapshot()}:{} )});
  emit(`${u.name}: Planck ${planck}/${planckCap} · NL ${u.currentEnergy.toFixed(2)}/${u.energyCap}`,'resource');
  if(!['Buff','Heal','Shield','Debuff','DoT','Wait','Diệt Kích','Extra','Support'].includes(a.source))hook({type:'afterAttack',side:'ally',actor:a.actor,target:a.target},a.fuaId);
  return true;
 }
 function drain(){while(true){if(pending.length){perform(pending.shift());continue;}const a=units.map(u=>runtime.autoAction(u)).find(Boolean);if(!a)break;if(!perform(a))break;}}
 function endTurn(u,preserveSelf=false){
  const expiring=config.report?[...units,...enemies].flatMap(t=>t.effects.filter(e=>e.duration!==null).map(e=>({t,e}))):[];
  const old=effective(u).speed;if(!preserveSelf)expireEffects(u);
  if(u.side==='ally')for(const t of [...units,...enemies]){const prior=effective(t).speed;for(const e of t.effects)if(e.clockOwner===u.index&&e.duration!==null&&!(preserveSelf&&t===u))e.duration--;t.effects=t.effects.filter(e=>e.duration===null||e.duration>0);retime(t,prior);}
  if(u.side==='ally'&&!preserveSelf){
   for(const s of u.shieldLayers)if(s.duration!==null)s.duration--;u.shieldLayers=u.shieldLayers.filter(s=>s.duration===null||s.duration>0);u.shields=u.shieldLayers.map(s=>s.value);u.shieldDurations=u.shieldLayers.map(s=>s.duration);
   u.currentHP=Math.min(u.currentHP,effective(u).hp);
  }
  retime(u,old);
  for(const {t,e} of expiring)if(!t.effects.includes(e)&&e.duration<=0)diagnose('expired',t.side==='ally'?t:units[e.owner],`${t.name||'Myrk '+(t.index+1)}: ‘${e.characterKey||e.gearKey||e.name}’ hết hạn`,{effect:e.characterKey||e.gearKey||e.name,side:t.side,target:t.index});
 }
 function allyTurn(u,a){
  if(!living(u))return;
  activeUnit=u;u.turn++;gear.dispatch('turnStart',{unit:u});triggerUses.forEach((_,k)=>{if(triggers.some(t=>t.actor===u.index&&k.startsWith(t.row+':')))triggerUses.delete(k);});
  emit(`${u.name} bắt đầu lượt ${u.turn}`,'turnStart',{actor:u.index});
  a=rotationAction(config.rotation,u,patternedAction(u,a,config.dynamic));
  const record=config.rotation?.enabled?{actor:u.index,turn:u.turn,av:timeline.time,extra:!!a.preserveDurations,choice:{kitAction:a.kitAction||'Wait',target:a.target??0,recipient:a.recipient??u.kitRecipient??0,kitVariant:a.kitVariant||0,fallbackBasic:a.fallbackBasic!==false},before:snapshot()}:null;
  rotationMoment={phase:'beforeTurn',actor:u.index,turn:u.turn,key:`before:${u.index}:${u.turn}`};if(config.rotation?.enabled)drain();
  rotationMoment={phase:'action',key:`action:${u.index}:${u.turn}`};
  const at=executions.length,performed=perform(a);drain();
  if(record){const own=executions.slice(at).find(e=>e.actor===u.index&&e.realTurn);Object.assign(record,{performed,name:own?.name||own?.source||'Không thi triển',after:snapshot()});turnRecords.push(record);}
  rotationMoment={phase:'afterTurn',actor:u.index,turn:u.turn,key:`after:${u.index}:${u.turn}`};if(config.rotation?.enabled)drain();
  gear.dispatch('turnEnd',{unit:u,preserveDurations:!!a.preserveDurations});endTurn(u,!!a.preserveDurations);if(!a.preserveDurations)gear.afterTurn(u);runtime.sync();activeUnit=null;rotationMoment={phase:'between',key:`between:${chain}`};
 }
 function enemyTurn(e){
  if(!living(e))return;e.turn++;
  emit(`Myrk ${e.index+1} bắt đầu lượt ${e.turn}`,'enemyTurn');
  if(config.rotation?.enabled)enemyRecords.push({av:timeline.time,index:e.index,turn:e.turn,order:traceSerial++});
  for(const d of [...e.dots]){tick(e,d);d.duration--;if(!living(e))break;}e.dots=e.dots.filter(d=>d.duration>0);
  if(!living(e))return;
  const control=e.effects.find(b=>b.type==='control');
  if(control)emit(`Myrk ${e.index+1}: bỏ hành động (${control.name})`);
  else{
   const chosen=[],recipients=[],damagedRecipients=new Set(),shieldNotified=new Set();
   for(let i=0;i<Math.max(1,Math.min(5,Math.floor(config.enemyTargets||1)));i++){const selected=weightedTarget(units.filter(u=>!chosen.includes(u.index)).map(u=>({...effective(u),currentHP:u.currentHP})),random);if(!selected)break;chosen.push(selected.index);}
   const initialTargets=new Set(chosen);
   if(chosen.length){
    gear.dispatch('enemyActionStart',{enemy:e,chain,targets:initialTargets});
    for(const index of chosen){recipients.push(index);gear.dispatch('select',{target:units[index],enemy:e,chain});}
    for(const index of chosen){let u=units[index];
    for(let hit=0;hit<(config.enemyHits??1);hit++){
     if(!living(u)){if(chosen.length>1)break;const next=weightedTarget(units.map(v=>({...effective(v),currentHP:v.currentHP})),random);if(!next)break;u=units[next.index];}
     if(!recipients.includes(u.index)){recipients.push(u.index);gear.dispatch('select',{target:u,enemy:e,chain});}
     gear.dispatch('sync',{});const target=effective(u),incoming=config.attack/(config.enemyHits??1)*Math.max(0,1+(effective(e).allDamage||0))*defMultiplier(config.level,u.level,target.defReduction)*resMultiplier((config.allyRes||0)+target.res)*mitigation([config.allyReduction||0,...target.reductions])*(1+target.vulnerability);
     if(incoming>0)damagedRecipients.add(u.index);const priorLayers=u.shieldLayers.map(s=>({...s}));const result=applyShields(incoming,u.shields);u.shields=result.shields;u.shieldLayers.forEach((s,i)=>s.value=result.shields[i]);const incomingEvent={unit:u,enemy:e,damage:result.hpDamage,floor:0};gear.dispatch('incomingDamage',incomingEvent);const lost=Math.min(Math.max(0,u.currentHP-incomingEvent.floor),result.hpDamage);u.currentHP-=lost;gear.dispatch('hpLost',{unit:u,amount:lost,self:false});
     if(!shieldNotified.has(u.index)&&priorLayers.some(l=>l.value>0)){shieldNotified.add(u.index);gear.dispatch('shieldAttack',{target:u,enemy:e,chain,layers:priorLayers,shield:Math.max(0,...priorLayers.map(l=>l.value))});}
     const shieldOwners=new Set();for(const layer of priorLayers)if(layer.value>0&&layer.owner!==undefined&&!shieldOwners.has(layer.owner)){shieldOwners.add(layer.owner);const owner=units[layer.owner];gear.dispatch('shieldHit',{owner,target:u,enemy:e,chain,layers:priorLayers,incoming});if(!u.shieldLayers.find(s=>s.key===layer.key)?.value)gear.dispatch('shieldBroken',{owner,target:u,enemy:e,chain});}
     emit(`Myrk ${e.index+1} đánh ${u.name}: mất ${lost.toFixed(2)} HP`,'enemyHit',{actor:u.index,amount:lost});
     if(!living(u))death(u);
    }
    }
    for(const index of recipients)gain(units[index],config.hitEnergy??0);
    gear.dispatch('damageActionEnd',{enemy:e,chain,recipients:damagedRecipients,targets:initialTargets});
    gear.dispatch('enemyAttackEnd',{enemy:e,chain,recipients:damagedRecipients,targets:initialTargets});
    hook({type:'enemyHit',side:'enemy',target:e.index,recipients});drain();e.gearRecipients=damagedRecipients;
    for(const ally of units)for(const b of [...ally.effects])if(b.enemyChain===chain){gear.remove(ally,{index:b.owner},b.gearKey);if(b.afterEnemy)gear.next(units[b.owner],ally,b.gearKey+' nhịp',{},{scoped:b.afterEnemy});}
   }
  }
  if(living(e)&&e.toughness===0&&(e.brokenAtTurn??0)<e.turn&&!control?.skipRecovery){
   let quangDamage=0;if(e.quang){const q=e.quang;e.quang=null;const stats=units.map(effective),value=quangValue(q,stats),info=detail(stats[q.owner],effective(e),{name:'Quang Tích',source:'Quang'},'stored','normal',1,value);if(info)info.quang={recorded:q.recorded,cap:2*Math.max(0,stats[q.owner].atk)};quangDamage=damage(e,value,q.owner,'Quang Tích (giá trị đã ghi)',undefined,info);}
   if(living(e)){e.toughness=e.maxToughness;gear.dispatch('recover',{enemy:e,chain,quangDamage});emit(`Myrk ${e.index+1} hồi toàn bộ Sức Bền`,'recover');}
  }
  endTurn(e);gear.dispatch('enemyEnd',{enemy:e,chain,recipients:e.gearRecipients||new Set()});e.gearRecipients=new Set();gear.dispatch('sync',{});
 }
 try{
  gear.dispatch('sync',{});runtime.init();drain();
  while(true){
   const next=timeline.peek(speed);if(!next||next.at>horizon||!enemies.some(living)||!units.some(living))break;
   if(++steps>10000)throw Error('Lịch lượt vượt giới hạn kiểm tra; cần xem lại hiệu ứng tạo lượt.');
   const event=timeline.take(speed);chain++;const u=(event.side==='ally'?units:enemies)[event.index];if(!u||!living(u))continue;
   if(event.side==='enemy'){natural(u,timeline.time+baseAV(effective(u).speed));enemyTurn(u);}
   else if(event.natural){natural(u,timeline.time+baseAV(effective(u).speed));const script=scripts[u.index];const a=script.length?script[u.script++%script.length]:{actor:u.index,source:'Wait',cost:0,refund:0,energy:0,realTurn:true};allyTurn(u,a);}
   else if(event.action.realTurn||event.extraTurn)allyTurn(u,event.action);
   else {perform(event.action);drain();}
   drain();clampQuang();
  }
 }catch(err){complete=false;error=err.message;emit(error,'error');}
 for(const u of units)u.buffs=u.effects; // compatibility with inspection tools
 return {totals,rows,log,units,enemies,planck,executions,complete,error,elapsedAV:timeline.time,chainCount:chain,gearTargetCounts,turnRecords,enemyRecords,damageEvents,diagnostics};
}

// Resolve action-wide distinct-target conditions against the actual hit/retarget result.
// A self-inconsistent threshold is reported, never silently treated as a finished estimate.
export function runCombat(config,roster,actions){
 if(!config.supportPreview&&needsSupportPreview(roster,actions,config.rotation)){
  const preview=runCombat({...config,supportPreview:true,report:true},roster,actions);
  if(!preview.complete)return preview;
  const scores=roster.map((_,i)=>preview.damageEvents.filter(e=>e.actor===i).reduce((n,e)=>n+e.calculated,0));
  const result=runCombat({...config,supportPreview:true,supportScores:scores},roster,actions);
  result.supportScores=scores;return result;
 }
 if(config.critMode==='expected'&&roster.some(u=>u.gear?.memory?.key===71||(u.gear?.sets?.[1]||0)>=5))return {complete:false,error:'Trang bị kích hoạt theo Chí Mạng thực tế: chọn chế độ Chí mạng theo seed, Luôn Chí Mạng hoặc Không Chí Mạng.'};
 const sensitive=roster.some(u=>(u.kitEnabled&&u.characterId==='veyr:mani')||[1,3,6,21,23,25,54,55,56,65,78,92,97].includes(u.gear?.memory?.key)||(u.gear?.sets?.[1]||0)>=4);
 let previous=config.gearTargetCounts||null,result;
 for(let pass=0;pass<(sensitive?8:1);pass++){
  result=runCombatPass({...config,gearTargetCounts:previous},roster,actions);
  if(!result.complete||!sensitive||JSON.stringify(previous)===JSON.stringify(result.gearTargetCounts))return result;
  previous=result.gearTargetCounts;
 }
 result.complete=false;result.error='Điều kiện số mục tiêu của trang bị không hội tụ khi đòn đánh chuyển mục tiêu sau hạ địch. Cần đổi cấu hình HP hoặc tách đòn theo kit.';return result;
}
