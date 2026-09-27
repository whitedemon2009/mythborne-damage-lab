function gearSuggestions(character,catalog,state,changed){
 const root=rotationNode('details');root.className='gear-suggestions';root.append(rotationNode('summary','Đề cử trang bị'));
 const review=reviewedGearSuggestions(character,catalog,state);
 root.append(rotationNode('p',review.identity),rotationNode('small','Đề cử theo kit đã đối chiếu, không phải bảng xếp hạng sát thương. Đọc điều kiện và chọn theo đội hình, số Myrk và cách đánh.'));
 root.append(rotationNode('h4','Mảnh Ký Ức cùng Aspect'));
 for(const {item,label,reason} of review.memories){
  const box=rotationNode('div');box.className='suggestion';box.append(rotationNode('strong',item.name),rotationNode('small',label),rotationNode('p',reason));
  const source=rotationNode('details');source.append(rotationNode('summary','Nội tại đầy đủ'),rotationNode('p',item.text.join('\n')));box.append(source);
  box.append(rotationButton('Trang bị Mảnh Ký Ức',()=>{state.memory=item.name;state.refine=1;changed();}));root.append(box);
 }
 root.append(rotationNode('h4','Phương án Thần Vật'));
 for(const {pieces,reason} of review.sets){
  const box=rotationNode('div');box.className='suggestion';
  box.append(rotationNode('strong',pieces.map(p=>`${p.count} × ${p.item.name}`).join(' + ')),rotationNode('p',reason));
  const source=rotationNode('details');source.append(rotationNode('summary','Các mốc nội tại'));
  for(const {item,count} of pieces){source.append(rotationNode('strong',item.name));for(const [threshold,bonus] of Object.entries(item.bonuses||{}))if(Number(threshold)<=count)source.append(rotationNode('p',bonus.text));}
  box.append(source,rotationButton(pieces.length===1?'Áp dụng bộ cho 6 món':'Áp dụng phối bộ '+pieces.map(p=>p.count).join('+'),()=>{let slot=0;for(const p of pieces)for(let i=0;i<p.count;i++)state.artifacts[slot++].set=p.item.name;changed();}));root.append(box);
 }
 if(review.sets.length)root.append(rotationNode('small','Áp dụng chỉ đổi tên bộ, giữ cấp, chỉ số chính và dòng phụ hiện có. Bộ 6 món chỉ kích hoạt đến mốc 5; không có thêm nội tại mốc 6.'));
 return root;
}
function setupCycleExperience(){
 const toolbar=document.querySelector('.toolbar'),panel=rotationNode('section');panel.id='cycleRunner';panel.className='panel cycle-runner';
 panel.append(rotationNode('h2','03 / Chạy sát thương theo cycle'),rotationNode('p','Cycle đầu dài 150 AV; mỗi cycle tiếp theo dài 100 AV. Veyr hành động theo Tốc Độ, kỹ năng và người nhận buff bạn chọn.'));
 const controls=rotationNode('div');controls.className='cycle-controls';controls.append(document.querySelector('#cycles').parentElement);
 const run=rotationButton('Chạy & tính sát thương',()=>{if(!document.querySelector('.action-row'))seedCycleActions();document.querySelector('#timelineMode').value='dynamic';simulate();},'simulate');run.className='primary';controls.append(run);panel.append(controls);
 const settings=rotationNode('details');settings.className='battle-settings';settings.append(rotationNode('summary','Thiết lập mô phỏng nâng cao'));
 const settingsGrid=rotationNode('div');settingsGrid.className='battle-settings-grid';for(const id of ['critMode','hitEnergy','seed','allyReduction','allyRes','timelineMode'])settingsGrid.append(document.getElementById(id).closest('label'));settings.append(settingsGrid);
 panel.append(settings);const output=rotationNode('div');output.id='cycleResults';panel.append(output);
 document.querySelector('.workspace').before(panel);
 const planner=document.getElementById('rotationPlanner'),advanced=rotationNode('details');advanced.className='panel turn-editor';advanced.append(rotationNode('summary','Chỉnh kỹ năng & người nhận buff theo từng lượt'));planner.before(advanced);advanced.append(planner);
 planner.querySelector('h2').textContent='Quyết định trong từng cycle';
 document.querySelector('#prepareRotation').textContent='Tạo lịch lượt từ số cycle';
 document.querySelector('#rotationName').placeholder='Tên chiến thuật';
 document.querySelector('#rotationName').setAttribute('aria-label','Tên chiến thuật');
 document.querySelector('#saveRotation').textContent='Lưu chiến thuật';
 const nav=rotationNode('nav');nav.className='lab-nav';for(const [href,label] of [['#myrkSetup','01 Myrk'],['#team','02 Đội hình'],['#cycleRunner','03 Cycle'],['#combatReport','04 Báo cáo'],['#teamComparison','05 So sánh'],['#optimizer','06 Tối ưu']]){const a=rotationNode('a',label);a.href=href;nav.append(a);}document.querySelector('header').after(nav);toolbar.id='myrkSetup';
 seedCycleActions();
}
function seedCycleActions(){
 rotationUI.busy=true;
 try{document.querySelector('#rotation').replaceChildren();team.forEach((id,i)=>{for(const action of ['Skill','Basic'])addAction({actor:id,kitAction:action,source:action==='Skill'?'Chiến Kỹ':'Tấn Công Thường',recipient:'-1',fallbackBasic:'1',realTurn:'1'});});}finally{rotationUI.busy=false;}
}
function renderCycleResults(result,config){
 const host=document.getElementById('cycleResults');if(!host)return;host.replaceChildren();if(!result?.complete){host.append(rotationNode('p',result?.error||'Kiểm tra thiết lập để chạy mô phỏng.'));return;}
 const table=rotationNode('table');table.append(rotationTableHead(['Cycle','Khoảng AV','Sát thương','Lũy kế']));const body=rotationNode('tbody');let cumulative=0;
 for(let i=0;i<config.cycles;i++){const start=i===0?0:150+(i-1)*100,end=150+i*100;const damage=result.damageEvents.filter(e=>e.av<=end&&(i===0?e.av>=0:e.av>start)).reduce((sum,e)=>sum+e.actual,0);cumulative+=damage;const row=rotationNode('tr');for(const value of [String(i+1),`${start}–${end}`,fmt(damage),fmt(cumulative)])row.append(rotationNode('td',value));body.append(row);}table.append(body);host.append(table);
 let audit=document.getElementById('supportActionSummary');if(!audit){audit=rotationNode('div');audit.id='supportActionSummary';host.after(audit);}audit.replaceChildren(rotationNode('h3','Hành động và người nhận buff'));
 audit.append(rotationNode('p','Chọn Xu hướng hành động tại mỗi thẻ Veyr để đổi chuỗi BA/Skill. Thiếu Planck sẽ chuyển sang BA; các lượt chỉnh riêng bên dưới được ưu tiên.'));
 for(const u of result.units){const actions=result.executions.filter(a=>a.actor===u.index),receivers=[...new Set(actions.filter(a=>a.supportTarget).map(a=>result.units[a.recipient]?.name).filter(Boolean))];const row=rotationNode('p',`${u.name}: ${actions.filter(a=>a.ability==='Basic').length} Tấn Công Thường · ${actions.filter(a=>a.ability==='Skill').length} Chiến Kĩ · ${actions.filter(a=>a.ability==='Ult').length} Tuyệt Kĩ${receivers.length?' · Hỗ trợ: '+receivers.join(', '):''}`);row.dataset.actor=u.index;audit.append(row);}
}
