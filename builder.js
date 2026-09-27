import {characterRegistry} from './character-data.mjs';
import {composeGear} from './gear.mjs';
import {newPiece,aggregate,pieceEditor,names} from './artifacts.mjs';
export async function mountBuilder(api) {
  const catalog = await fetch('./catalog.json').then(r => { if (!r.ok) throw Error('Không tải được danh sách'); return r.json(); });
  const key = name => name === 'Hou Yi' ? 'HouYi' : name;
  const label = name => name === 'HouYi' ? 'Hou Yi' : name;
  const field = (r, prefix) => r.text.find(t => t.startsWith(prefix))?.slice(prefix.length).trim() || 'Chưa có dữ liệu';
  for (const r of catalog.characters) {
    const id = key(r.name);
    const stats=r.baseStats?.['60']?.values;
    if(!stats) throw Error(`Thiếu chỉ số canon Lv60 của ${r.name}`);
    api.characters[id] = { ...stats, level:60, crit:.05, critDmg:.5,
      energyCap:r.energy?.cap ?? undefined,ultimateRequirement:r.energy?.ultimateCost??undefined,
      aspect:r.aspect, element:r.element, source:r.source,characterId:r.id,characterHash:r.contentHash };
  }
  const states = Array.from({length:5}, (_,i) => ({kitPattern:'inherit',kitRecipient:-1,memory:'',refine:1,kitEnabled:true,kitAscensions:true,kitMinor:true,kitFate:0,kitDivinityTriumph:true,kitAutoUlt:'ready',artifacts:Array.from({length:6},(_,j)=>newPiece(j))}));
  const bases=Object.fromEntries(Object.entries(api.characters).map(([k,v])=>[k,{...v}]));
  const host = document.querySelector('#team');
  const el = (tag, text) => { const n=document.createElement(tag); if(text!==undefined)n.textContent=text; return n; };
  function select(title, options, value, change) {
    const wrapper=el('label',title), input=el('select'); input.setAttribute('aria-label',title);
    for(const [id,name] of options) input.add(new Option(name,id));
    input.value=value;input.onchange=()=>change(input.value);wrapper.append(input);return wrapper;
  }
  function draw() {
    const opened=[...host.querySelectorAll('details')].map(d=>d.open);host.replaceChildren();
    api.getTeam().forEach((id,i)=>{
      const state=states[i],base=bases[id];state.kitPattern??='inherit';state.kitDivinityTriumph??=true; Object.assign(api.characters[id],composeGear(base,state,catalog),...['kitEnabled','kitAscensions','kitMinor','kitFate','kitDivinityTriumph','kitAutoUlt','kitRecipient','kitPattern'].map(k=>({[k]:state[k]}))); const c=api.characters[id],card=el('article');card.className='member';
      card.append(select(`Veyr ${i+1}`,catalog.characters.map(r=>[key(r.name),r.name]),id,next=>{
        if(next===id)return;
        if(api.getTeam().some((n,j)=>j!==i&&n===next)){draw();return;}
        state.memory='';state.refine=1;state.artifacts=Array.from({length:6},(_,slot)=>newPiece(slot));
        api.getTeam()[i]=next; api.renderTeam();draw();api.simulate();
      }));
      card.style.setProperty('--accent',colors[c.aspect]||'#74d9ff');
      const badge=el('p',`${c.aspect} · ${c.element}`);badge.className='aspect-badge';card.append(badge);
      const supported=characterRegistry[c.characterId]?.hash===c.characterHash;
      if(supported){
        const option=(title,values,prop,parse=v=>v)=>card.append(select(title,values,String(state[prop]),v=>{state[prop]=parse(v);draw();api.simulate();}));
        option('Cơ chế Veyr '+(i+1),[['false','Thủ công'],['true','Kit tự động']], 'kitEnabled',v=>v==='true');
        if(state.kitEnabled){
          option('Xu hướng hành động '+(i+1),actionPatterns.map(p=>[p.id,p.label]),'kitPattern');
          card.append(el('small','BA = Tấn Công Thường. Chuỗi lặp theo lượt Veyr, kể cả lượt thêm; Tuyệt Kĩ/FUA không chiếm bước. Thiếu Planck thì dùng BA. Lượt chỉnh riêng được ưu tiên.'));
          option('Đột Phá '+(i+1),[['true','Bật A1 / A2 / A3'],['false','Tắt Đột Phá']],'kitAscensions',v=>v==='true');
          const dossier=catalog.characters.find(r=>key(r.name)===id),hasTriumph=dossier?.text.some(line=>/^KHẢI HOÀN THẦN TÍNH\s*:/i.test(line));
          if(hasTriumph){const toggle=el('button',state.kitDivinityTriumph?'Khải Hoàn Thần Tính · Đang bật':'Khải Hoàn Thần Tính · Đang tắt');toggle.type='button';toggle.className='divinity-toggle'+(state.kitDivinityTriumph?' active':'');toggle.setAttribute('aria-label','Khải Hoàn Thần Tính '+(i+1));toggle.setAttribute('aria-pressed',String(state.kitDivinityTriumph));toggle.onclick=()=>{state.kitDivinityTriumph=!state.kitDivinityTriumph;draw();api.simulate();};card.append(toggle);}
          option('Mốc phụ '+(i+1),[['true','Bật Mốc phụ'],['false','Tắt Mốc phụ']],'kitMinor',v=>v==='true');
          option('Vận Mệnh '+(i+1),Array.from({length:7},(_,n)=>[String(n),'VM'+n]),'kitFate',Number);
          option('Tự dùng Tuyệt Kĩ '+(i+1),[['false','Theo hàng rotation'],['ready','Ngay khi đủ Năng Lượng'],...(id==='Astraeus'?[['full','Chờ Tuyệt Kĩ II']]:[])],'kitAutoUlt',v=>v==='false'?false:v);
          option('Chủ lực nhận buff '+(i+1),[['-1','Tự động — ưu tiên Aspect và sát thương'],...api.getTeam().map((name,j)=>[String(j),name]).filter((_,j)=>j!==i)],'kitRecipient',Number);
          card.append(el('small','Tự động chọn Gungnir, Mjolnir, Trishula, Fragarach, Vajra hoặc Pandora. Nhiều ứng viên hoặc không có: chọn sát thương cao nhất trong nhóm qua mô phỏng sơ bộ. Lựa chọn theo từng lượt được ưu tiên.'));
          card.append(el('p','VM3 / VM5 chưa tăng cấp kỹ năng theo xác nhận của bạn.'));
        }
      }else {c.kitEnabled=false;card.append(el('p','Kit này chưa tự động hóa; dùng hệ số và hiệu ứng thủ công.'));}
      if(base.energyCap===undefined)card.append(el('p','Nguồn chưa ghi rõ giới hạn Năng Lượng. Cần nhập giá trị xác nhận để chạy.'));
      const dossier=catalog.characters.find(r=>key(r.name)===id),kit=el('details');
      card.append(gearSuggestions(dossier,catalog,state,()=>{draw();api.simulate();}));
      kit.append(el('summary','Đối chiếu kit từ nguồn live'));
      const sourceLink=el('a','Mở thẻ nhân vật trong Google Doc');
      sourceLink.href='https://docs.google.com/document/d/11x9WycUZf_Ft3E1vSYzHAYPLXH6muQwBsMfZgD591Tc/edit?tab='+dossier.source.tabId;
      sourceLink.target='_blank';sourceLink.rel='noopener';kit.append(sourceLink);
      const kitText=el('p',dossier.text.join('\n'));kitText.className='gear-description';kit.append(kitText);card.append(kit);
      card.append(select(`Mảnh Ký Ức ${i+1}`,[['','Chưa trang bị'],...catalog.memories.map(r=>[r.name,r.name])],state.memory,v=>{state.memory=v;draw();api.simulate();}));
      card.append(select('Tinh luyện',[1,2,3,4,5].map(n=>[String(n),`TL${n}`]),String(state.refine),v=>{state.refine=Number(v);draw();api.simulate();}));
      const detail=el('details'),summary=el('summary','Xem mô tả Mảnh Ký Ức');detail.append(summary);
      const description=el('p',catalog.memories.find(r=>r.name===state.memory)?.text.join('\n')||'Chọn một Mảnh Ký Ức để xem nội dung.');description.className='gear-description';detail.append(description);card.append(detail);const memory=catalog.memories.find(r=>r.name===state.memory);if(memory){const match=memory.aspect===c.aspect;card.append(el('p',match?'Khớp Aspect — nội tại tự kích hoạt theo điều kiện và mức tinh luyện.':'Khác Aspect — chỉ cộng chỉ số cơ bản, không kích hoạt nội tại.'));}
      const artifacts=el('details');artifacts.append(el('summary','6 món Thần Vật'));
      state.artifacts.forEach(p=>artifacts.append(pieceEditor(p,catalog.artifacts,()=>{draw();api.simulate();})));
      const counts={};state.artifacts.filter(p=>p.set).forEach(p=>counts[p.set]=(counts[p.set]||0)+1);
      for(const [name,count] of Object.entries(counts)){
        artifacts.append(el('p',`${name}: ${count} món · Mốc ${[2,4,5].filter(n=>n<=count).join('/')||'chưa đủ'}`));
        const d=el('details');d.append(el('summary','Mô tả bộ'),el('p',catalog.artifacts.find(r=>r.name===name).text.join('\n')));artifacts.append(d);
      }
      card.append(artifacts);const provenance=el('details');const refreshSources=()=>{provenance.replaceChildren(el('summary','Nguồn cộng chỉ số đầu trận'));for(const source of c.gear.sources)provenance.append(el('p',source.label+': '+Object.entries(source.stats).map(([k,v])=>`${names[k]||k} ${v}`).join(' · ')));};refreshSources();card.append(provenance);for(const warning of c.gear.warnings)card.append(el('p','Chưa hoàn chỉnh: '+warning));
      const stats=el('details');stats.append(el('summary','Chỉ số Lv60 trước trang bị'));
      for(const [prop,title,scale,max] of [['atk','Tấn Công',1,10000000],['hp','HP',1,10000000],['def','Phòng Thủ',1,10000000],['speed','Tốc Độ',1,10000],['energyCap','NL tối đa (nhập theo kit)',1,10000],['crit','Chí Mạng %',100,100],['critDmg','ST Chí Mạng %',100,10000]]){
        const l=el('label',title),input=el('input');input.type='number';input.min='0';input.max=String(max);input.step='any';input.value=base[prop]===undefined?'':String(base[prop]*scale);input.placeholder='Nhập chỉ số';input.setAttribute('aria-label',`${label(id)} ${title}`);
        input.oninput=()=>{const v=Number(input.value);if(!Number.isFinite(v)||v<0||v>max){input.setCustomValidity('Giá trị ngoài giới hạn');return;}input.setCustomValidity('');base[prop]=v/scale;Object.assign(c,composeGear(base,state,catalog));updateTotal();refreshSources();api.simulate();};l.append(input);stats.append(l);
      }
      const total=el('p');total.className='computed-stats';const updateTotal=()=>total.textContent=`Sau trang bị: ATK ${(c.atk||0).toFixed(2)} · HP ${(c.hp||0).toFixed(2)} · PT ${(c.def||0).toFixed(2)} · Tốc Độ ${c.speed||0} · Chí Mạng ${((c.crit||0)*100).toFixed(2)}% · STCM ${((c.critDmg||0)*100).toFixed(2)}%`;updateTotal();const extra=el('p',`Diệt Phá ${((c.break||0)*100).toFixed(2)}% · Chính Xác ${((c.hit||0)*100).toFixed(2)}% · Kháng Hiệu Ứng ${((c.resist||0)*100).toFixed(2)}% · Hồi NL ${((c.energy||0)*100).toFixed(2)}% · Xuyên Giáp ${((c.pierce||0)*100).toFixed(2)}% · ST Nguyên Tố ${((c.elementDamage||0)*100).toFixed(2)}%`);card.append(stats,total,extra);host.append(card);
    });
    [...host.querySelectorAll('details')].forEach((d,i)=>{if(opened[i]!==undefined)d.open=opened[i];});
    refreshCharacterRows();
    document.querySelector('#teamRule').textContent='5 Veyr · 1 Mảnh Ký Ức/Veyr · 6 Thần Vật/Veyr';
  }
  document.addEventListener('mythborne-kit-team',()=>{states.forEach((s,i)=>{s.kitEnabled=!!characterRegistry[api.characters[api.getTeam()[i]].characterId];s.kitAscensions=true;s.kitMinor=true;s.kitDivinityTriumph=true;s.kitAutoUlt=api.getTeam()[i]==='Astraeus'?'full':'ready';});draw();});
  document.addEventListener('mythborne-kit-enable',()=>{states.forEach((s,i)=>{s.kitEnabled=!!characterRegistry[api.characters[api.getTeam()[i]].characterId];});draw();});
  document.addEventListener('mythborne-build-snapshot',event=>{const stamps={};for(const state of states){const memory=catalog.memories.find(m=>m.name===state.memory);if(memory)stamps[memory.id]=memory.contentHash;for(const p of state.artifacts){const set=catalog.artifacts.find(s=>s.name===p.set);if(set)stamps[set.id]=set.contentHash;}}event.detail.build=JSON.parse(JSON.stringify({team:api.getTeam(),states,stamps,bases:Object.fromEntries(api.getTeam().map(n=>[n,bases[n]]))}));});
  document.addEventListener('mythborne-optimizer-context',event=>{event.detail.context={catalog,bases:JSON.parse(JSON.stringify(bases))};});
  document.addEventListener('mythborne-build-restore',event=>{const b=event.detail.build;if(!b||b.team.length!==5||new Set(b.team).size!==5||b.team.some(n=>!bases[n]))throw Error('Đội hình không hợp lệ.');api.getTeam().splice(0,5,...b.team);for(const n of b.team)bases[n]={...b.bases[n]};b.states.forEach((s,i)=>{states[i]=JSON.parse(JSON.stringify(s));});api.renderTeam();draw();});
  draw();setupCycleExperience();const ready=new CustomEvent('mythborne-builder-ready',{detail:{restored:false}});document.dispatchEvent(ready);if(!ready.detail.restored)api.simulate();
}
