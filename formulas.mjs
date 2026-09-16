// Canon confirmed in this conversation, 2026-09-13. No character-specific rules inferred.
export const elements=['Nham','Hỏa','Phong','Băng','Lôi','Thủy','Ám','Quang'];
export const normalizeElement=e=>({'Hoả':'Hỏa','Hỏa Ngục':'Hỏa','Hoả Ngục':'Hỏa','Thuỷ':'Thủy','Thuỷ Triều':'Thủy','Thủy Triều':'Thủy'}[e]||e);
export const coefficients={Nham:2,Hỏa:2,Phong:1.5,Băng:1,Lôi:1,Thủy:.5,Ám:.5,Quang:1};
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const baseAV=spd=>10000/Math.max(1,Math.round(spd));
export const changeSpeedAV=(remaining,oldSpeed,newSpeed)=>remaining*Math.max(1,Math.round(oldSpeed))/Math.max(1,Math.round(newSpeed));
export const advanceAV=(remaining,spd,amount)=>Math.max(0,remaining-baseAV(spd)*amount);
export const defMultiplier=(lv,targetLv,reduction=0,pen=0)=>(lv+20)/((lv+20)+(targetLv+20)*(1-clamp(reduction+pen,0,1)));
export const resMultiplier=(res,pen=0)=>Math.max(0,1-res+pen);
export const mitigation=reductions=>1-clamp(reductions.reduce((a,b)=>a+b,0),0,.9);
export const baseBreak=lv=>1691*lv/60;
export const energyGain=(amount,er=0,percentMax=false)=>amount*(percentMax?1:1+er);
export const threat=aspect=>({Fragarach:150,Aegis:130,Vajra:110}[aspect]||100);
export const canFollow=(previous,current)=>previous!==current; // A -> B -> A is legal; kit limits still apply.
export function weightedTarget(units,random){const living=units.filter(u=>u.currentHP>0);let n=random()*living.reduce((s,u)=>s+u.threat,0);for(const u of living){n-=u.threat;if(n<0)return u;}return living.at(-1);}
export function applyShields(damage,shields){const largest=Math.max(0,...shields);return {hpDamage:Math.max(0,damage-largest),shields:shields.map(v=>Math.max(0,v-damage))};}
export function directDamage(c,t,a,mode='expected'){
 if(a.trueDamage)return Math.max(0,((a.ratio||0)+(a.extraRatio||0))*(c[a.scaling||'atk']||0)+(a.flat||0));
 const crit=(a.dot&&!a.allowDotCrit)||a.noCrit?1:mode==='crit'?1+((c.critDmg||0)+(a.gearCritDmg||0)):mode==='normal'?1:1+clamp(c.crit??.05,0,1)*((c.critDmg??.5)+(a.gearCritDmg||0));
 return Math.max(0,(((a.ratio||0)+(a.extraRatio||0))*(c[a.scaling||'atk']||0)+(a.flat||0))*(1+(a.bonus||0)+(c.elementDamage||0)+(c.allDamage||0)+(c[a.dot?'DoTDamage':(a.damageSource||a.source)+'Damage']||0)+(normalizeElement(c.element)==='Thủy'?(c.waterDamage||0):0))*crit*(1+(a.vulnerability||0)+(t.vulnerability||0))*(a.ignoreDefRes?1:defMultiplier(c.level||60,t.level,(a.defReduction||0)+(t.defReduction||0),(c.pierce||0)+(a.pen||0))*resMultiplier(t.res,a.resPen||0))*(t.toughness>0?.9:1)*mitigation(t.reductions||[]));
}
export function breakDamage(c,t,a){return baseBreak(c.level||60)*coefficients[normalizeElement(c.element)]*(.5+t.maxToughness/120)*(1+(c.break||0)+(a.breakBonus||0))*(a.ignoreDefRes?1:defMultiplier(c.level||60,t.level,(a.defReduction||0)+(t.defReduction||0),(c.pierce||0)+(a.pen||0))*resMultiplier(t.res,a.resPen||0))*(1+(a.vulnerability||0)+(t.vulnerability||0))*mitigation(t.reductions||[]);}
export function annihilation(c,t,a){return baseBreak(c.level||60)*(a.toughness/30)*(1+(a.efficiency||0)+(c.efficiency||0))*(1+(c.break||0)+(a.breakBonus||0))*(a.ignoreDefRes?1:defMultiplier(c.level||60,t.level,(a.defReduction||0)+(t.defReduction||0),(c.pierce||0)+(a.pen||0))*resMultiplier(t.res,a.resPen||0))*(1+(a.vulnerability||0)+(t.vulnerability||0))*mitigation(t.reductions||[]);}
export function quangValue(q,units){return Math.min(q.recorded,2*Math.max(0,units[q.owner].atk));}
export function seeded(seed){let s=seed>>>0;return ()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};}
