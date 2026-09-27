import {surtrKit} from './characters/surtr.mjs';
import {supportRecipient} from './support-targeting.mjs';
import {allowsUltimate} from './rotation.mjs';
import {describeDamage} from './report.mjs';
import {dotStacks} from './dot-system.mjs';
import {janusKit} from './characters/janus.mjs';
import {athenaKit} from './characters/athena.mjs';
import {poseidonKit} from './characters/poseidon.mjs';
import {houYiKit} from './characters/hou-yi.mjs';
import {aresKit} from './characters/ares.mjs';
import {thanatosKit} from './characters/thanatos.mjs';
import {nikeKit} from './characters/nike.mjs';
import {heraclesKit} from './characters/heracles.mjs';
import {kaienKit} from './characters/kaien.mjs';
import {hestiaKit} from './characters/hestia.mjs';
import {artemisKit} from './characters/artemis.mjs';
import {hadesKit} from './characters/hades.mjs';
import {thorKit} from './characters/thor.mjs';
import {lughKit} from './characters/lugh.mjs';
import {sekhmetKit} from './characters/sekhmet.mjs';
import {amphitriteKit} from './characters/amphitrite.mjs';
import {directDamage,breakDamage} from './formulas.mjs';
import {anubisKit} from './characters/anubis.mjs';
import {prometheusKit} from './characters/prometheus.mjs';
import {sickerKit} from './characters/sicker.mjs';
import {bellonaKit} from './characters/bellona.mjs';
import {nemtyKit} from './characters/nemty.mjs';
import {maniKit} from './characters/mani.mjs';
import {eosKit} from './characters/eos.mjs';
import {hecateKit} from './characters/hecate.mjs';
import {erisKit} from './characters/eris.mjs';
import {asclepiusKit} from './characters/asclepius.mjs';
import {alectoKit} from './characters/alecto.mjs';
import {heraKit} from './characters/hera.mjs';
import {lyraKit} from './characters/lyra.mjs';
import {zerelKit} from './characters/zerel.mjs';
import {floriaKit} from './characters/floria.mjs';
import {nadiaKit} from './characters/nadia.mjs';
import {maelisKit} from './characters/maelis.mjs';
import {orsenKit} from './characters/orsen.mjs';
import {seraphineKit} from './characters/seraphine.mjs';
import {theoKit} from './characters/theo.mjs';
import {veylenKit} from './characters/veylen.mjs';
import {lucanKit} from './characters/lucan.mjs';
import {serenKit} from './characters/seren.mjs';
import {rhydanKit} from './characters/rhydan.mjs';
import {irisKit} from './characters/iris.mjs';
import {solKit} from './characters/sol.mjs';
import {tomasKit} from './characters/tomas.mjs';
import {arenKit} from './characters/aren.mjs';
import {kaelKit} from './characters/kael.mjs';
import {miraKit} from './characters/mira.mjs';
import {darianKit} from './characters/darian.mjs';
import {eliaKit} from './characters/elia.mjs';
import {rowanKit} from './characters/rowan.mjs';
import {seleneKit} from './characters/selene.mjs';
import {cassianKit} from './characters/cassian.mjs';
import {hermesKit} from './characters/hermes.mjs';
import {averyKit} from './characters/avery.mjs';
import {lioraKit} from './characters/liora.mjs';
import {hephaestusKit} from './characters/hephaestus.mjs';
import {characterRegistry} from './character-data.mjs';
import {actionToughness} from './character-rules.mjs';
import {effectiveStats,effectChance} from './effects.mjs';
import {apolloKit} from './characters/apollo.mjs';
import {agniKit} from './characters/agni.mjs';
import {astraeusKit} from './characters/astraeus.mjs';
import {nemesisKit} from './characters/nemesis.mjs';
import {durgaKit} from './characters/durga.mjs';
import {heimdallKit} from './characters/heimdall.mjs';
import {nepheleKit} from './characters/nephele.mjs';
import {tyrKit} from './characters/tyr.mjs';
import {nezhaKit} from './characters/nezha.mjs';
import {changeKit} from './characters/change.mjs';
import {ishtarKit} from './characters/ishtar.mjs';
import {skadiKit} from './characters/skadi.mjs';
import {taranisKit} from './characters/taranis.mjs';
import {dianMuKit} from './characters/dian-mu.mjs';
import {marekKit} from './characters/marek.mjs';
import {mardukKit} from './characters/marduk.mjs';
import {freyjaKit} from './characters/freyja.mjs';
import {nyxKit} from './characters/nyx.mjs';
export const characterKits={'veyr:surtr':surtrKit,'veyr:janus':janusKit,'veyr:athena':athenaKit,'veyr:poseidon':poseidonKit,'veyr:hou-yi':houYiKit,'veyr:ares':aresKit,'veyr:thanatos':thanatosKit,'veyr:nike':nikeKit,'veyr:heracles':heraclesKit,'veyr:kaien':kaienKit,'veyr:hestia':hestiaKit,'veyr:artemis':artemisKit,'veyr:hades':hadesKit,'veyr:thor':thorKit,'veyr:lugh':lughKit,'veyr:sekhmet':sekhmetKit,'veyr:amphitrite':amphitriteKit,'veyr:anubis':anubisKit,'veyr:prometheus':prometheusKit,'veyr:sicker':sickerKit,'veyr:bellona':bellonaKit,'veyr:nemty':nemtyKit,'veyr:mani':maniKit,'veyr:eos':eosKit,'veyr:hecate':hecateKit,'veyr:eris':erisKit,'veyr:asclepius':asclepiusKit,'veyr:alecto':alectoKit,'veyr:hera':heraKit,'veyr:lyra':lyraKit,'veyr:zerel':zerelKit,'veyr:floria':floriaKit,'veyr:apollo':apolloKit,'veyr:agni':agniKit,'veyr:astraeus':astraeusKit,'veyr:nemesis':nemesisKit,'veyr:durga':durgaKit,'veyr:iris':irisKit,'veyr:sol':solKit,'veyr:tomas':tomasKit,'veyr:aren':arenKit,'veyr:kael':kaelKit,'veyr:mira':miraKit,'veyr:darian':darianKit,'veyr:elia':eliaKit,'veyr:rowan':rowanKit,'veyr:selene':seleneKit,'veyr:cassian':cassianKit,'veyr:hermes':hermesKit,'veyr:avery':averyKit,'veyr:liora':lioraKit,'veyr:hephaestus':hephaestusKit,'veyr:nadia':nadiaKit,'veyr:maelis':maelisKit,'veyr:orsen':orsenKit,'veyr:seraphine':seraphineKit,'veyr:theo':theoKit,'veyr:veylen':veylenKit,'veyr:lucan':lucanKit,'veyr:seren':serenKit,'veyr:rhydan':rhydanKit,'veyr:heimdall':heimdallKit,'veyr:nephele':nepheleKit,'veyr:tyr':tyrKit,'veyr:nezha':nezhaKit,'veyr:change':changeKit,'veyr:ishtar':ishtarKit,'veyr:skadi':skadiKit,'veyr:taranis':taranisKit,'veyr:dian-mu':dianMuKit,'veyr:marek':marekKit,'veyr:marduk':mardukKit,'veyr:freyja':freyjaKit,'veyr:nyx':nyxKit};
export function characterBattleRules(roster,config){const rules={cap:config.planckCap??5,initial:config.initialPlanck??3};for(const u of roster)if(u.kitEnabled)characterKits[u.characterId]?.battleRules?.(u,rules);return rules;}
export function criticalTriggerUsers(roster){return roster.filter(u=>{
 const kit=u.kitEnabled&&characterKits[u.characterId];
 return (typeof kit?.requiresCrit==='function'?kit.requiresCrit(u):kit?.requiresCrit)||u.gear?.memory?.key===71||(u.gear?.sets?.[1]||0)>=5;
}).map(u=>u.name);}
export class CharacterRuntime {
 constructor(ctx){this.ctx=ctx;this.syncing=false;this.ready=false;}
 enabled(u){return u?.kitEnabled===true;}
 kit(u){return this.enabled(u)?characterKits[u.characterId]:null;}
 state(u){return u.characterState??={};}
 alive(u){return !!u&&(u.side==='enemy'?u.hp>0:u.currentHP>0);}
 allies(){return this.ctx.units.filter(u=>this.alive(u));}
 fallen(){return this.ctx.units.filter(u=>!this.alive(u));}
 enemies(){return this.ctx.enemies.filter(u=>this.alive(u));}
 eff(u){return effectiveStats(u);}
 asc(u){return u.kitAscensions!==false;}
 triumph(u){return u.kitDivinityTriumph!==false;}
 vm(u,n){return (u.kitFate||0)>=n;}
 log(u,text){this.ctx.emit(`${u.name} · ${text}`,'character');}
 effect(u,t,key){return t.effects.find(e=>e.characterKey===key&&e.owner===u.index);}
 remove(u,t,key){const old=this.eff(t).speed;t.effects=t.effects.filter(e=>!(e.characterKey===key&&e.owner===u.index));this.ctx.retime(t,old);}
 buff(u,t,key,mods={},duration=null,extra={}){
  if(!this.alive(t))return;
  const old=this.effect(u,t,key);if(old&&duration===null&&JSON.stringify(old.mods)===JSON.stringify(mods)&&Object.entries(extra).every(([k,v])=>JSON.stringify(old[k])===JSON.stringify(v)))return old;
  this.ctx.install(t,{name:`character:${u.index}:${key}`,characterKey:key,character:true,type:'character',value:0,owner:u.index,mods,duration,...extra});
  if(duration!==null)this.log(u,`‘${key}’ → ${t.name||'Myrk '+(t.index+1)} (${duration} lượt)`);
  const effect=this.effect(u,t,key);
  if(t.side==='ally'&&t!==u&&!extra.debuff)this.ctx.gear.dispatch('buff',{unit:u,target:t,effect});
  return effect;
 }
 gain(u,n,percent=false){this.ctx.gain(u,n,percent);}
 planck(u,n){this.ctx.planck(u,n);}
 advance(u,n){this.ctx.gear.advance(u,n);}
 once(u,key,scope=u.turn){const s=this.state(u);s.limits??={};if(s.limits[key]===scope)return false;s.limits[key]=scope;return true;}
 targets(a){return this.ctx.enemies.slice(a.target,a.target+a.targets).filter(t=>this.alive(t));}
 heal(u,t,ratio,flat=0,a={},mult=1){return this.ctx.heal(u,t,(this.eff(u).hp*ratio+flat)*mult,{action:a,delayed:!!a.delayedHeal});}
 cleanse(u,t,a,count=1){const bad=t.effects.filter(e=>e.debuff||e.type==='control'||e.value<0).slice(0,count),old=this.eff(t).speed;t.effects=t.effects.filter(e=>!bad.includes(e));this.ctx.retime(t,old);this.ctx.gear.dispatch('cleanse',{unit:u,target:t,action:a,count:bad.length});return bad.length;}
 allySkill(u,t,a){this.ctx.gear.dispatch('allySkill',{unit:u,target:t,action:a});}
 dot(u,t,key,ratio,duration,a,baseChance=1,extra={}){return this.ctx.applyDebuff(t,{actor:u.index,row:a.row,source:'DoT',ability:'DoT',effectName:key,ratio,flat:0,scaling:'atk',bonus:0,toughness:0,duration,baseChance,guaranteed:false,...extra});}
 fixed(u,t,value,a,kind='Talent',source='Talent'){if(!this.alive(t))return 0;const action={...a,reportName:a.reportName||kind,source,storedDamage:true},amount=Math.min(t.hp,value);if(this.ctx.config.report&&!action.reportDetail)action.reportDetail=describeDamage(this.eff(u),this.eff(t),action,'stored','normal',1,value);this.ctx.gear.dispatch('hit',{unit:u,target:t,action,amount,calculated:value,crit:false,brokenBefore:t.toughness===0});const actual=this.ctx.gear.ctx.fixedDamage(t,value,u,kind,action);this.ctx.gear.dispatch('after',{unit:u,action,targets:new Set(actual>0?[t.index]:[])});return actual;}
 breakHit(u,t,a){const b={...a,source:'Break',damageSource:undefined},m=this.ctx.gear.modifiers(u,t,b,1),reportDetail=this.ctx.config.report?describeDamage(m.stats,m.enemy,{...m.action,reportName:'Phá Vỡ bổ sung'},'Break'):undefined;this.fixed(u,t,breakDamage(m.stats,m.enemy,m.action),{...a,reportDetail},'Break','Break');}
 dotValue(t,d){const u=this.ctx.units[d.owner],stacks=dotStacks(d),a={...d.action,source:'DoT',effectName:d.name,dot:true,ratio:d.action.ratio*stacks,flat:(d.action.flat||0)*stacks};if(a.maxHpRatio!==undefined)a.flat=Math.min(a.maxHpRatio*t.maxHP,(a.atkCapRatio??Infinity)*this.eff(u).atk)*stacks;this.ctx.gear.dispatch('dotStart',{unit:u,target:t,dot:d,action:a});const m=this.ctx.gear.modifiers(u,t,a,1);return directDamage(m.stats,m.enemy,m.action,'expected')*(a.dotHits||1)*(a.countsAsDK?(m.action.dkMultiplier??1):1);}
 tick(u,t,d,mult,a){this.ctx.tick(t,d,mult,true,u,a);}
 triggerDots(u,t,options,a){return this.ctx.triggerDots(u,t,options,a);}
 loseHP(u,t,value,a={},options={}){return this.ctx.loseHP(u,t,value,{action:a,sacrifice:true,...options});}
 revive(u,t,options={}){return this.ctx.revive(u,t,options);}
 forceCounter(u,target,parent,options={}){return this.kit(u)?.forceCounter?.(this,u,target,parent,options);}
 debuffs(t,u){return this.ctx.gear.debuffs(t,u);}
 shieldValue(u,t,value,duration,a,key=this.shieldKey(u)){return this.ctx.shield(u,t,0,value,duration,key,a);}
 delay(t,n){this.ctx.delay(t,n);}
 planckCount(){return this.ctx.planckCount();}
 planckCap(){return this.ctx.planckCap();}
 attack(a){return ['Basic','Skill','Ult','FUA','Counter'].includes(a.source);}
 shieldKey(u){return 'character-shield:'+u.index;}
 shield(u,t,ratio,flat,duration,a){this.ctx.shield(u,t,ratio,flat,duration,this.shieldKey(u),a);}
 debuff(u,t,key,duration,a,baseChance=1){if(!this.alive(t))return false;const chance=effectChance(baseChance,this.eff(u).hit||0,this.eff(t).resist||0,false,(this.ctx.config.immunities||[]).includes(key));if(chance<1&&this.ctx.random()>=chance){this.log(u,`Myrk ${t.index+1} kháng ‘${key}’`);return false;}return true;}
 init(){
  for(const u of this.ctx.units)if(this.enabled(u)){
   if(!Number.isInteger(u.kitFate??0)||(u.kitFate??0)<0||(u.kitFate??0)>6)throw Error(`${u.name}: Vận Mệnh phải từ 0 đến 6.`);
   if(!u.energyCapExplicit)throw Error(`${u.name}: cần nhập giới hạn Năng Lượng đã xác nhận; không tự dùng 120.`);
   const entry=characterRegistry[u.characterId];if(!entry||!this.kit(u))throw Error(`${u.name}: chưa có bộ thực thi kit; chọn chế độ thủ công.`);
   if(u.characterHash!==entry.hash)throw Error(`${u.name}: nguồn kit đã đổi; cần đối chiếu bộ thực thi trước khi tính.`);
   if(this.ctx.config.critMode==='expected'&&(typeof this.kit(u).requiresCrit==='function'?this.kit(u).requiresCrit(u):this.kit(u).requiresCrit))throw Error(`${u.name}: kit kích hoạt theo Chí Mạng thực tế; chọn Chí mạng theo seed, Luôn Chí Mạng hoặc Không Chí Mạng.`);
   if(u.kitMinor!==false)this.buff(u,u,'Mốc phụ',this.kit(u).minor);
  }
  this.ready=true;this.sync();
  for(const u of this.allies())this.kit(u)?.init?.(this,u);
  this.sync();
 }
 sync(){if(!this.ready||this.syncing)return;this.syncing=true;try{for(const u of this.allies())this.kit(u)?.sync?.(this,u);}finally{this.syncing=false;}}
 event(type,e){if(!this.ready)return;if(type==='sync')this.sync();for(const u of this.allies())this.kit(u)?.event?.(this,u,type,e);if(type==='death'){
   for(const owner of this.ctx.units)if(owner===e.unit){for(const t of [...this.ctx.units,...this.ctx.enemies]){const old=this.eff(t).speed;t.effects=t.effects.filter(b=>!(b.character&&b.owner===owner.index));this.ctx.retime(t,old);}}
   this.sync();
  }}
 resolve(u,input){
  if(input.recipient===-1||(input.recipient===undefined&&u.kitRecipient===-1))input={...input,recipient:supportRecipient(u,this.ctx.units,input.recipient,this.ctx.config.supportScores)};
  if(!input.kitAction)return input;
  const kit=this.kit(u);if(!kit)throw Error(`${u.name}: hãy bật kit tự động trước khi chọn kỹ năng từ kit.`);
  const k=input.kitAction,definition=kit.resolve(this,u,k,input);if(!definition)throw Error(`${u.name}: kỹ năng ${k} chưa được hỗ trợ.`);
  const action={actor:u.index,row:input.row,av:input.av,realTurn:input.realTurn,recipient:input.recipient??u.kitRecipient,target:input.target??0,targets:1,hits:1,source:k,ability:k,ratio:0,flat:0,scaling:'atk',cost:k==='Skill'?1:0,refund:k==='Basic'?1:0,energy:k==='Basic'?20:k==='Skill'?30:0,energyCost:u.energyCap,bonus:0,pen:0,resPen:0,efficiency:0,breakBonus:0,vulnerability:0,defReduction:0,...definition,characterId:u.characterId,kitResolved:true};
  action.primaryTarget=action.target;if(action.blast){action.targetIndices=[action.target,action.target-1,action.target+1].filter(i=>i>=0&&i<this.ctx.enemies.length);action.targets=action.targetIndices.length;action.targetRatios={[action.target]:action.ratio};action.ratio=action.splash;}if(action.aoe){action.target=0;action.targets=this.ctx.enemies.length;}
  if(action.support)action.source='Support';
  if(action.primaryRatio!==undefined)action.targetRatios={[action.primaryTarget]:action.primaryRatio};
  action.toughness=actionToughness(k,u.aspect,definition.toughness);
  return action;
 }
 before(u,a){if(a.kitResolved&&!a.auxiliary)this.kit(u)?.before?.(this,u,a);}
 complete(u,a,targets){
  if(a.kitResolved&&!a.auxiliary)this.kit(u)?.after?.(this,u,a,targets);
  this.sync();for(const t of this.allies())this.kit(t)?.observe?.(this,t,{unit:u,action:a,targets});this.sync();
 }
 queue(u,definition,parent){
  if(!this.alive(u))return;
  const a={actor:u.index,source:'FUA',target:0,targets:1,hits:1,ratio:0,flat:0,scaling:'atk',cost:0,refund:0,energy:10,bonus:0,pen:0,resPen:0,...definition,kitResolved:true,characterId:u.characterId,realTurn:false,row:parent.row,chain:parent.chain,triggerActor:parent.actor};
  a.toughness=actionToughness(a.source,u.aspect,definition.toughness);if(a.blast){a.primaryTarget=a.target;a.targetIndices=[a.target,a.target-1,a.target+1].filter(i=>i>=0&&i<this.ctx.enemies.length);a.targets=a.targetIndices.length;a.targetRatios={[a.target]:a.ratio};a.ratio=a.splash;}if(a.aoe)a.targets=this.ctx.enemies.length;
  if(a.source==='FUA'){a.fuaId=u.characterId;a.parent=parent.fuaId;if(a.parent===a.fuaId&&!this.canSelfFollow(u,a))return;}
  this.ctx.pending.push(a);return a;
 }
 canSelfFollow(u,a){return a.kitResolved===true&&a.characterId===u.characterId&&this.kit(u)?.allowSelfFollowUp?.(this,u,a)===true;}
 autoAction(u){const configured=this.ctx.config.rotation?.enabled&&this.ctx.config.rotation.ultimates?.[u.index],policy=configured?.mode==='inherit'?null:configured;
  if(!this.kit(u)||(!policy&&!u.kitAutoUlt)||!this.alive(u)||u.effects.some(e=>e.type==='control'))return null;const a=this.resolve(u,{kitAction:'Ult',realTurn:false,target:policy?.target??0,recipient:policy?.recipient??u.kitRecipient});
  if(a.otherRecipient&&(a.recipient===u.index||!this.alive(this.ctx.units[a.recipient])))return null;
  if(a.needsRecipient&&!this.alive(this.ctx.units[a.recipient]))return null;
  if(!policy&&u.kitAutoUlt==='full'&&a.variant===1)return null;
  const moment=this.ctx.rotationMoment?.();
  if(!allowsUltimate(policy,{u,action:a,moment,units:this.ctx.units,enhanced:()=>['Basic','Skill'].some(k=>this.resolve(u,{kitAction:k,target:a.target}).enhanced)}))return null;
  if(['beforeAlly','afterAlly'].includes(policy?.mode))a.rotationPolicyKey=moment.key;
  return u.currentEnergy>=a.energyCost?a:null;
 }
}
