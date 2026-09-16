import {memoryEvent} from './memory-events.mjs';
import {artifactEvent} from './artifact-events.mjs';
import {effectiveStats} from './effects.mjs';
import {normalizeElement} from './formulas.mjs';
export class GearEvents {
 constructor(ctx){this.ctx=ctx;this.serial=0;this.depth=0;}
 key(u){return u.gear?.memory?.key;}
 v(u,i){return u.gear?.memory?.values[i]||0;}
 has(u,n,tier=4){return (u.gear?.sets?.[n]||0)>=tier;}
 state(u){return u.gearState??=( {uses:{},data:{}} );}
 once(u,key,limit=1,scope=u.turn){const s=this.state(u),k=scope+':'+key,n=s.uses[k]||0;if(n>=limit)return false;s.uses[k]=n+1;return true;}
 effect(t,u,key){return t.effects.find(e=>e.gearKey===key&&e.owner===u.index);}
 stacks(t,u,key){return this.effect(t,u,key)?.stacks||0;}
 remove(t,u,key){const old=this.ctx.effective(t).speed;t.effects=t.effects.filter(e=>!(e.gearKey===key&&e.owner===u.index));this.ctx.retime(t,old);}
 buff(u,t,key,mods={},duration=2,cap=0,extra={}){
  const old=this.effect(t,u,key);if(duration===null&&old&&JSON.stringify(old.mods)===JSON.stringify(mods)&&!cap)return old;this.ctx.install(t,{name:`gear:${key}:${u.index}`,gearKey:key,type:'gear',value:0,mods,debuff:t.side==='enemy',duration,maxStacks:cap||undefined,owner:u.index,...extra});
  this.ctx.emit(`${u.name} · ${key}${cap?' '+this.stacks(t,u,key)+'/'+cap:''} → ${t.name||'Myrk '+(t.index+1)}`,'gear');return this.effect(t,u,key);
 }
 mark(u,t,key,duration=2,cap=0,extra={}){return this.buff(u,t,key,{},duration,cap,extra);}
 gain(u,n,percent=false){this.ctx.gain(u,n,percent);}
 planck(u,n){this.ctx.planck(u,n);}
 advance(u,n){this.ctx.advance(u,n);this.dispatch('advance',{unit:u,amount:n});}
 allies(){return this.ctx.units.filter(u=>u.currentHP>0);}
 enemies(){return this.ctx.enemies.filter(e=>e.hp>0);}
 eff(u){return this.ctx.effective(u);}
 debuffs(t,u){return [...t.effects.filter(e=>e.gearKey?e.debuff:e.type!=='marker'),...(t.dots||[])].filter(e=>!u||e.owner===u.index);}
 shielded(t,u){return t.shieldLayers?.some(s=>s.owner===u.index&&s.value>0);}
 restore(u,t,value){this.ctx.restore(u,t,value);}
 heal(u,t,value,extra={}){this.ctx.heal(u,t,value,{gear:true,...extra});}
 readyNext(t){return this.ctx.activeUnit===t?t.turn+1:t.turn;}
 next(u,t,key,mods,extra={}){return this.buff(u,t,key,mods,null,0,{consume:'damage',untilTurn:t.turn+1,...extra});}
 dispatch(type,event){
  if(++this.depth>40)throw Error('Nội tại trang bị kích hoạt đệ quy quá sâu');
  const originalAction=event.action;try{this.ctx.characterEvent?.(type,event);if(type==='modify'&&originalAction?.damageSource)event.action=new Proxy(originalAction,{get:(a,k)=>k==='source'?a.damageSource:a[k]});for(const u of this.allies()){memoryEvent(this,u,type,event);artifactEvent(this,u,type,event);}}finally{if(originalAction)event.action=originalAction;this.depth--;}
 }
 modifiers(u,t,a,count){
  const e={unit:u,target:t,action:a,stats:{...this.eff(u)},enemy:{...this.eff(t)},count,bonus:0,pen:0,resPen:0,crit:0,critDmg:0,efficiency:0,breakBonus:0,vulnerability:0,dkBonus:0};
  // Scoped buffs are evaluated for the actual damage source/target, never made permanent.
  for(const b of u.effects){if(!b.scoped)continue;if(b.enhancedOnly&&!a.enhanced)continue;if(b.sources&&!b.sources.includes(a.damageSource||a.source))continue;if(b.target!==undefined&&b.target!==t.index)continue;
   for(const [k,v] of Object.entries(b.scoped))e[k]=(e[k]||0)+v*(b.stacks||1);
  }
  for(const b of t.effects){if(!b.incoming)continue;if(b.onlyOwner&&b.owner!==u.index)continue;if(b.sources&&!b.sources.includes(a.damageSource||a.source))continue;
   for(const [k,v] of Object.entries(b.incoming))e[k]=(e[k]||0)+v*(b.stacks||1);
  }
  this.dispatch('modify',e);
  e.action={...a};for(const k of ['bonus','pen','resPen','efficiency','breakBonus','vulnerability'])e.action[k]=(a[k]||0)+e[k];
  e.action.dkMultiplier=(e.action.dkMultiplier??1)*(1+e.dkBonus);
  e.stats.crit=(e.stats.crit||0)+e.crit;e.stats.critDmg=(e.stats.critDmg||0)+e.critDmg;
  return e;
 }
 afterTurn(u){
  for(const t of [...this.ctx.units,...this.ctx.enemies])for(const e of [...t.effects])if(t===u&&e.untilTurn!==undefined&&u.turn>=e.untilTurn)this.remove(t,{index:e.owner},e.gearKey);
  this.dispatch('expired',{unit:u});
 }
}
