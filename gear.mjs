import {aggregate,pieceStats,names} from './artifacts.mjs';
import {memoryRules,setRules} from './gear-data.mjs';
export function composeGear(base,state,catalog){
 if(!Number.isInteger(state.refine)||state.refine<1||state.refine>5)throw Error('Tinh luyện phải từ 1 đến 5');
 const memory=catalog.memories.find(m=>m.name===state.memory),bonus={},sources=[],warnings=[];
 const add=(label,stats)=>{sources.push({label,stats:{...stats}});for(const [k,v] of Object.entries(stats))bonus[k]=(bonus[k]||0)+v;};
 const match=!!memory&&memory.aspect===base.aspect;const current=!!memory&&memoryRules[memory.id]?.sourceHash===memory.contentHash;
 if(match&&!current)warnings.push(memory.name+': nguồn đã đổi, cần đối chiếu lại nội tại trước khi tính.');
 if(memory){const values=memory.baseStats?.['60']?.values;if(!values)throw Error('Thiếu chỉ số Mảnh Ký Ức Lv60');add(memory.name+' · chỉ số Lv60',Object.fromEntries(Object.entries(values).map(([k,v])=>[k+'Base',v])));
  if(match&&current){const rule=memoryRules[memory.id];for(const entry of rule?.static||[]){const value=memory.refinementRanges[entry.range]?.values[state.refine-1];if(!Number.isFinite(value))throw Error('Thiếu hệ số tinh luyện: '+memory.name);add(memory.name+' · TL'+state.refine,{[entry.stat]:value});}if(!rule?.complete)warnings.push(memory.name+': chưa mô phỏng đầy đủ phần nội tại có điều kiện.');}
 }
 const sets={};const counts={};for(const p of state.artifacts.filter(p=>p.set))counts[p.set]=(counts[p.set]||0)+1;
 for(const [name,count] of Object.entries(counts)){const set=catalog.artifacts.find(s=>s.name===name);if(!set)throw Error('Không tìm thấy bộ Thần Vật');const currentSet=setRules[set.id]?.sourceHash===set.contentHash;if(!currentSet){warnings.push(name+': nguồn đã đổi, cần đối chiếu lại hiệu ứng bộ.');continue;}sets[setRules[set.id].key]=count;if(count>=2){const r=setRules[set.id];if(!r)throw Error('Chưa có quy tắc bộ 2 món');add(name+' · 2 món',{[r.stat]:r.value});}if(count>=4&&!setRules[set.id].complete)warnings.push(name+': chưa mô phỏng đầy đủ hiệu ứng '+(count>=5?'4/5':'4')+' món.');}
 const out=aggregate(base,state.artifacts,bonus);
 sources.unshift({label:'Veyr · chỉ số trước trang bị',stats:{atk:base.atk,hp:base.hp,def:base.def,speed:base.speed}});
 for(const p of state.artifacts.filter(p=>p.set))sources.push({label:`Thần Vật ${p.slot+1} · cấp ${p.level}`,stats:pieceStats(p)});
 out.gear={memory:match&&current?{id:memory.id,key:memoryRules[memory.id].key,values:memory.refinementRanges.map(r=>r.values[state.refine-1]/100)}:null,counts,sets,warnings,sources};return out;
}
