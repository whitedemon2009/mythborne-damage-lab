import {runCombat} from './combat.mjs';
import {characterRegistry} from './character-data.mjs';
import {memoryRules,setRules} from './gear-data.mjs';
import {summarizeReport} from './report.mjs';
const cloneTeamData=x=>JSON.parse(JSON.stringify(x));
export function teamSnapshot(name,input,build){
 const stamps={...build?.stamps};for(const u of input.roster){if(u.gear?.memory){const id=u.gear.memory.id;stamps[id]=memoryRules[id]?.sourceHash;}for(const key of Object.keys(u.gear?.sets||{})){const entry=Object.entries(setRules).find(([,v])=>String(v.key)===key);if(entry)stamps[entry[0]]=entry[1].sourceHash;}}
 return cloneTeamData({id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),name,roster:input.roster,actions:input.actions,rotation:input.config.rotation,dynamic:input.config.dynamic,config:input.config,build,stamps});
}
export function validateTeamSnapshot(saved){
 if(!saved||!Array.isArray(saved.roster)||saved.roster.length!==5||!Array.isArray(saved.actions))throw Error('Bản đội hình đã lưu không hợp lệ.');
 for(const u of saved.roster){if(characterRegistry[u.characterId]?.hash!==u.characterHash)throw Error(`${u.name}: nguồn kit đã thay đổi, cần lưu lại đội.`);if(u.gear?.warnings?.length)throw Error(`${u.name}: trang bị có cảnh báo nguồn hoặc nội tại chưa đầy đủ.`);}
 for(const [id,hash] of Object.entries(saved.stamps||{}))if((memoryRules[id]||setRules[id])?.sourceHash!==hash)throw Error('Nguồn trang bị đã đổi, cần lưu lại đội.');
}
export function compareTeamSnapshot(saved,commonConfig){
 validateTeamSnapshot(saved);
 const result=runCombat({...commonConfig,report:true,dynamic:saved.dynamic,rotation:saved.rotation},cloneTeamData(saved.roster),cloneTeamData(saved.actions));
 if(!result.complete)throw Error(result.error);
 const summary=summarizeReport(result),windowAV=150+100*(commonConfig.cycles-1);
 return {saved,result,summary,windowAV,damagePer100AV:summary.total/windowAV*100,cleared:result.enemies.every(e=>e.hp<=0),survivors:result.units.filter(u=>u.currentHP>0).length,kitCount:saved.roster.filter(u=>u.kitEnabled).length};
}
const teamArchiveFormat='mythborne-damage-lab-teams';
export function exportTeamArchive(saved){
 if(!Array.isArray(saved)||!saved.length)throw Error('Chưa có đội hình đã lưu để xuất.');
 if(saved.length>10)throw Error('Mỗi tệp chỉ hỗ trợ tối đa 10 đội hình.');
 for(const team of saved){validateTeamSnapshot(team);if(!team.build||!Array.isArray(team.seeds))throw Error(`“${team.name}” chưa có đủ trang bị hoặc rotation để xuất.`);}
 return JSON.stringify({format:teamArchiveFormat,version:1,teams:cloneTeamData(saved)},null,2);
}
export function importTeamArchive(text){
 let archive;try{archive=JSON.parse(text);}catch{throw Error('Tệp cấu hình không phải JSON hợp lệ.');}
 if(archive?.format!==teamArchiveFormat||archive?.version!==1)throw Error('Tệp không đúng định dạng Mythborne Damage Lab.');
 if(!Array.isArray(archive.teams)||!archive.teams.length||archive.teams.length>10)throw Error('Tệp phải chứa từ 1 đến 10 đội hình.');
 for(const team of archive.teams){validateTeamSnapshot(team);if(!team.build||!Array.isArray(team.seeds))throw Error(`“${team.name||'Đội không tên'}” thiếu trang bị hoặc rotation.`);}
 return cloneTeamData(archive.teams);
}
