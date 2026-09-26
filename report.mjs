import {baseBreak,coefficients,normalizeElement,damageElements,damageDefenseMultiplier,damageResistanceMultiplier,mitigation,clamp} from './formulas.mjs';
export const reportSources={Basic:'Tấn Công Thường',Skill:'Chiến Kĩ',Ult:'Tuyệt Kĩ',FUA:'Đòn Đánh Theo Sau',Counter:'Phản Kích',DoT:'DoT',Break:'Phá Vỡ','Diệt Kích':'Diệt Kích',Extra:'Sát thương phụ',Talent:'Cơ chế nhân vật',true:'Sát Thương Chuẩn',gear:'Trang bị',Quang:'Quang Tích'};
const activeEffects=u=>(u.effects||[]).map(e=>({name:e.characterKey||e.gearKey||e.name,duration:e.duration,stacks:e.stacks||1,owner:e.owner}));
export function describeDamage(c,t,a={},type='direct',mode='normal',multiplier=1,fixed){
 const factors=[],add=(label,value)=>factors.push({label,value});
 const els=damageElements(c,a),df=damageDefenseMultiplier(c,t,a),rf=damageResistanceMultiplier(t,a,els);
 const raw=((a.ratio||0)+(a.extraRatio||0))*(c[a.scaling||'atk']||0)+(a.flat||0);
 if(fixed!==undefined)add('Giá trị đã xác định / ghi nhận',fixed);
 else if(a.carryDamage!==undefined){add('Sát thương dư trước DEF/Kháng',a.carryDamage);add('Hệ số DEF mục tiêu mới',df);add('Hệ số Kháng mục tiêu mới',rf);}
 else if(a.trueDamage)add('Giá trị gốc Sát Thương Chuẩn',raw);
 else {
  if(type==='Break'||type==='Diệt Kích'){
   add('Sát thương Phá Vỡ cơ bản theo cấp',baseBreak(c.level||60));
   if(type==='Break'){add('Hệ số nguyên tố',coefficients[normalizeElement(c.element)]);add('Sức Bền tối đa',.5+t.maxToughness/120);}
   else {add('Bào Sức Bền gốc / 30',a.toughness/30);add('Hiệu Suất Phá Vỡ',1+(a.efficiency||0)+(c.efficiency||0));}
   add('Diệt Phá',1+(c.break||0)+(a.breakBonus||0));
  }else{
   add('Chỉ số × hệ số + sát thương cố định',raw);
   add('Tăng sát thương',1+(a.bonus||0)+(c.elementDamage||0)+els.reduce((n,el)=>n+(c[el+'Damage']||0),0)+(c.allDamage||0)+(c[a.dot?'DoTDamage':(a.damageSource||a.source)+'Damage']||0)+(els.includes('Thủy')?(c.waterDamage||0):0));
   const critRate=clamp((c.crit??.05)+(a.critBonus||0),0,1),critDamage=(c.critDmg??.5)+(a.critDmgBonus||0)+(a.gearCritDmg||0);
   add('Chí Mạng',(a.dot&&!a.allowDotCrit)||a.noCrit?1:mode==='crit'?1+critDamage:mode==='normal'?1:1+critRate*critDamage);
  }
  add('Sát thương phải nhận',1+(a.vulnerability||0)+(t.vulnerability||0));add('Hệ số DEF',df);add('Hệ số Kháng',rf);
  if(!['Break','Diệt Kích'].includes(type))add('Sức Bền trước hit',t.toughness>0?.9:1);
  add('Giảm sát thương',mitigation(t.reductions||[]));
 }
 if(multiplier!==1)add('Hệ số bổ sung của cơ chế',multiplier);
 return {name:a.reportName||a.name||a.effectName||reportSources[a.source]||type,source:a.source||type,damageSource:a.damageSource||a.source||type,countsAsDK:!!a.countsAsDK,actionId:a.uid,formulaType:type,mode,factors,formulaValue:Math.max(0,factors.reduce((v,f)=>v*f.value,1)),stats:{atk:c.atk,hp:c.hp,def:c.def,speed:c.speed,crit:c.crit,critDmg:c.critDmg,break:c.break,element:c.element,level:c.level},parameters:{scaling:a.scaling||'atk',ratio:a.ratio||0,extraRatio:a.extraRatio||0,flat:a.flat||0,defReduction:(a.defReduction||0)+(t.defReduction||0),pen:(c.pierce||0)+(a.pen||0),res:t.res,resPen:a.resPen||0,ignoreDef:!!a.ignoreDef||c.element==='Hàn Băng',ignoreDefRes:!!a.ignoreDefRes,damageElements:els},effects:activeEffects(c),targetEffects:activeEffects(t)};
}
export function summarizeReport(result){
 const groups=new Map();for(const h of result.damageEvents||[]){const key=JSON.stringify([h.actor,h.category,h.name]);const g=groups.get(key)||{actor:h.actor,source:h.category,name:h.name,hits:0,actual:0,calculated:0,overkill:0};g.hits++;g.actual+=h.actual;g.calculated+=h.calculated;g.overkill+=h.overkill;groups.set(key,g);}
 return {groups:[...groups.values()].sort((a,b)=>b.actual-a.actual),total:Object.values(result.totals||{}).reduce((a,b)=>a+b,0),overkill:(result.damageEvents||[]).reduce((n,h)=>n+h.overkill,0),diagnostics:result.diagnostics||[]};
}
export function reportCategory(kind,detail){if(kind==='DoT')return 'DoT';if(kind==='Break')return 'Break';if(kind==='Diệt Kích')return 'Diệt Kích';if(kind==='true')return 'true';if(kind.startsWith('Quang'))return 'Quang';return detail.source||kind;}
