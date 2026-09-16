import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reviewedGearSuggestions} from './recommendations.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('./catalog.json',import.meta.url)));
const get=(name,fate=0,c=catalog)=>reviewedGearSuggestions(c.characters.find(v=>v.name===name),c,{kitFate:fate});
for(const character of catalog.characters)for(const fate of [0,1,4,6]){
 const r=get(character.name,fate);assert.ok(r.memories.length&&r.sets.length,character.name);
 for(const m of r.memories){assert.equal(m.item.aspect,character.aspect);assert.ok(m.reason);if(character.rarity===4)assert.notEqual(m.label,'Trấn');}
 for(const s of r.sets){assert.equal(s.pieces.reduce((n,p)=>n+p.count,0),6);assert.ok(s.reason);}
}
const hasSet=(name,index,fate=0)=>get(name,fate).sets.some(s=>s.pieces.some(p=>p.item.id===catalog.artifacts[index].id&&p.count>=4));
for(const name of ['Nemesis','Lyra','Sekhmet','Lugh','Bellona'])assert.equal(hasSet(name,11),false,`${name}: extra/counter is not FUA`);
assert.equal(hasSet('Hecate',11,0),false);assert.equal(hasSet('Hecate',11,1),true);
assert.equal(hasSet('Heracles',15),false);assert.equal(hasSet('Heracles',13),true);
assert.equal(hasSet('Hades',17),true);assert.equal(hasSet('Hades',8),true);
assert.equal(hasSet('Floria',17),false);assert.equal(hasSet('Asclepius',16),false);
for(const name of ['Hephaestus','Amphitrite','Nike']){assert.equal(hasSet(name,20),false);assert.ok(get(name).memories.every(x=>![44,58,68].some(i=>catalog.memories[i].id===x.item.id)));}
assert.ok(get('Durga').sets[0].pieces.every(p=>p.count===2));assert.equal(hasSet('Durga',3),false);
assert.ok(get('Astraeus',0).sets[0].pieces[0].count>=5);assert.deepEqual(get('Astraeus',4).sets[0].pieces.map(p=>p.count),[4,2]);
assert.match(get('Bellona').sets[1].reason,/Myrk chọn/);
assert.deepEqual(get('Apollo'),get('Apollo',0,{...catalog,characters:[...catalog.characters].reverse(),memories:[...catalog.memories].reverse(),artifacts:[...catalog.artifacts].reverse()}));
const stale=structuredClone(catalog);stale.characters.find(x=>x.name==='Apollo').contentHash='changed';assert.equal(get('Apollo',0,stale).memories.length,0);
stale.artifacts[16].contentHash='changed';assert.doesNotThrow(()=>get('Astraeus',0,stale));assert.equal(get('Astraeus',0,stale).sets.some(s=>s.pieces.some(p=>p.item.id===stale.artifacts[16].id)),false);
console.log('PASS 61 reviewed profiles across VM0/1/4/6; Aspect, source conditions, split sets, catalog reorder and stale-source guards');
