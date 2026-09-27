function refreshCharacterRows(){
 for(const row of document.querySelectorAll('.action-row')){
  const select=row.querySelector('.kitAction'),actor=row.querySelector('.actor').value,entry=characterRegistry[characters[actor]?.characterId];if(!select)continue;
  const variant=row.querySelector('.kitVariant');if(variant)variant.parentElement.hidden=actor!=='Ares'||select.value!=='Skill';
  for(const option of select.options)if(option.value!=='manual'){option.textContent=entry?.actionLabels?.[option.value]||({Basic:'Tấn Công Thường',Skill:'Chiến Kĩ',Ult:'Tuyệt Kĩ'})[option.value]+' — chưa có kit';}
 }
}
function setupCombatUI(){
 const toolbar=document.querySelector('.toolbar');document.querySelector('#critMode').add(new Option('Chí mạng theo seed (có kích hoạt nội tại)','sampled'));
 const add=(id,title,value,min=0,max=1000000)=>{const l=document.createElement('label');l.textContent=title;const n=document.createElement('input');Object.assign(n,{id,type:'number',value,min,max,step:'any'});n.oninput=simulate;l.append(n);toolbar.append(l);};
 document.querySelector('#enemyDefense').parentElement.remove();
 add('enemyLevel','Cấp Myrk',60,1,100);add('enemyHP','HP mỗi Myrk / HP tham chiếu khi vô cực',100000,1,Number.MAX_SAFE_INTEGER);
 const hpModeLabel=document.createElement('label');hpModeLabel.textContent='Chế độ HP Myrk';const hpMode=document.createElement('select');hpMode.id='enemyHPMode';hpMode.add(new Option('HP hữu hạn','finite'));hpMode.add(new Option('HP vô cực — không mất HP, không chết','infinite'));hpMode.onchange=simulate;hpModeLabel.append(hpMode);toolbar.append(hpModeLabel);
 const hpNote=document.createElement('small');hpNote.textContent='Vô cực: ghi đủ sát thương theo cycle, Myrk luôn đầy HP. HP tham chiếu dùng cho cơ chế theo HP; không kích hoạt hạ địch hoặc giảm HP.';hpModeLabel.append(hpNote);
 add('enemyMaxToughness','Sức Bền tối đa',720,1);add('enemyToughness','Sức Bền ban đầu',720);
 add('enemySpeed','Tốc Độ Myrk',100,1,1000);add('enemyAttack','Sát thương gốc đòn Myrk',500);
 add('hitEnergy','NL Veyr nhận khi bị đánh',10);add('cycles','Số cycle',2,1,20);add('seed','Seed chọn mục tiêu',1,1);
 add('enemyReduction','Giảm ST Myrk %',0,0,90);add('allyReduction','Giảm ST Veyr %',0,0,90);add('allyRes','Kháng của Veyr %',0,-100,100);
 add('effectRes','Kháng Hiệu Ứng Myrk % (nhập theo Myrk)',0,0,100);add('enemyHits','Số hit mỗi hành động Myrk',1,1,20);add('enemyTargets','Số Veyr Myrk chọn mỗi hành động',1,1,5);
 const modeLabel=document.createElement('label');modeLabel.textContent='Cách chạy rotation';const mode=document.createElement('select');mode.id='timelineMode';mode.add(new Option('Tự sinh lượt, lặp chuỗi kỹ năng mỗi Veyr','dynamic'));mode.add(new Option('Chạy một lần theo AV nhập tay','manual'));mode.onchange=simulate;modeLabel.append(mode);toolbar.append(modeLabel);
 const group=document.createElement('fieldset');const legend=document.createElement('legend');legend.textContent='Điểm Yếu Myrk';group.append(legend);
 elements.forEach(e=>{const l=document.createElement('label'),n=document.createElement('input');n.type='checkbox';n.value=e;n.className='weakness';n.checked=['Hỏa','Quang','Lôi'].includes(e);n.onchange=simulate;l.append(n,e);group.append(l);});toolbar.append(group);
 const generator=document.createElement('button');generator.type='button';generator.textContent='Tạo chuỗi cho 5 Veyr';generator.className='ghost';
 generator.onclick=()=>{if(document.querySelectorAll('.action-row').length&&!confirm('Thay rotation hiện tại bằng một Tấn Công Thường mẫu cho mỗi Veyr? Bạn cần nhập hệ số theo kit.'))return;document.querySelector('#rotation').replaceChildren();mode.value='dynamic';team.forEach(id=>addAction({actor:id,source:'Tấn Công Thường',multiplier:100}));simulate();};
 document.querySelector('#addAction').before(generator);
 const kitGenerator=document.createElement('button');kitGenerator.id='generateKit';kitGenerator.type='button';kitGenerator.textContent='Tạo rotation từ kit';
 kitGenerator.onclick=()=>{
  const unsupported=team.filter(n=>!characterRegistry[characters[n].characterId]);if(unsupported.length){failCombat('Chưa có kit tự động: '+unsupported.join(', '));return;}
  if(document.querySelectorAll('.action-row').length&&!confirm('Thay rotation hiện tại bằng kỹ năng từ kit, bật Đột Phá/Mốc phụ và tự dùng Tuyệt Kĩ? Khi thiếu Planck, các hàng Chiến Kĩ mẫu sẽ dùng Tấn Công Thường.'))return;
  document.dispatchEvent(new Event('mythborne-kit-team'));document.querySelector('#rotation').replaceChildren();mode.value='dynamic';
  team.forEach((id,i)=>{const sequence=id==='Agni'?['Skill','Basic','Basic']:id==='Apollo'?['Skill','Skill']:['Skill','Basic'];sequence.forEach(k=>addAction({actor:id,source:k==='Skill'?'Chiến Kỹ':'Tấn Công Thường',kitAction:k,recipient:'-1',fallbackBasic:'1',realTurn:'1'}));});simulate();
 };document.querySelector('#addAction').before(kitGenerator);
 const box=document.createElement('section');box.className='panel formula-note';box.innerHTML='<h2>Nhật ký chiến đấu</h2><p>Chế độ tự sinh: các hàng lượt thật của mỗi Veyr được thực hiện lần lượt rồi lặp lại; không có hàng thì chờ. Tốc Độ và đẩy lượt tự đổi lịch. Hàng chen ngang dùng AV nhập tay; FUA chọn điều kiện sẽ tự kích hoạt. Chọn “Kỹ năng từ kit” để tự xử lý kỹ năng của Veyr đã bật kit; các hàng thủ công dùng thông số nhập tay.</p><pre id="combatLog"></pre>';document.querySelector('main').append(box);
 setupRotationUI();
 setupReportUI();
 setupOptimizerUI();
}
function extendAction(node,seed){
 const source=node.querySelector('.source');
 source.replaceChildren(...['Tấn Công Thường','Chiến Kỹ','Tuyệt Kỹ','Đòn Đánh Theo Sau','Phản Kích','Sát Thương Duy Trì','Diệt Kích','Buff','Debuff','Heal','Shield'].map(s=>new Option(s,s)));
 const add=(cls,title,value,min=0,max=1000000)=>{const l=document.createElement('label');l.textContent=title;const n=document.createElement('input');Object.assign(n,{className:cls,type:'number',value,min,max,step:'any'});l.append(n);node.append(l);};
 const select=(cls,title,opts)=>{const l=document.createElement('label');l.textContent=title;const n=document.createElement('select');n.className=cls;opts.forEach(([v,t])=>n.add(new Option(t,v)));l.append(n);node.append(l);};
 select('toughnessMode','Bào Sức Bền',[['default','Theo mặc định Aspect / loại đòn'],['explicit','Nhập riêng theo kit']]);
 select('kitAction','Kỹ năng từ kit',[['manual','Nhập hệ số thủ công'],['Basic','Tấn Công Thường — theo kit'],['Skill','Chiến Kĩ — tự chọn dạng cường hóa'],['Ult','Tuyệt Kĩ — theo trạng thái hiện tại']]);
 select('kitVariant','Cấp Chiến Kĩ Ares',[['0','Tự chọn I/II theo Planck'],['1','Cấp I · 1 Planck'],['2','Cấp II · 2 Planck'],['3','Cấp III · 2 Planck + 50% HP hiện tại']]);
 select('fallbackBasic','Nếu thiếu Planck khi dùng Chiến Kĩ',[['0','Bỏ hành động và ghi nhật ký'],['1','Dùng Tấn Công Thường theo kit']]);
 add('av','Thời điểm AV',seed.av??100);add('level','Cấp Veyr',60,1,100);add('hits','Số hit',1,1,100);add('toughness','Bào Sức Bền gốc / hành động',30);add('efficiency','Hiệu Suất Phá Vỡ %',0);add('breakBonus','Diệt Phá thêm %',0);
 add('defReduction','Giảm Phòng Thủ %',0,0,100);add('resPen','Xuyên Kháng %',0);add('flat','Sát thương / hồi phục flat',0);
 add('target','Myrk đầu tiên (1–5)',1,1,5);
 select('scaling','Chỉ số nhân hệ số',[['atk','Tấn Công'],['hp','HP'],['def','Phòng Thủ'],['speed','Tốc Độ']]);
 select('recipient','Đồng minh nhận hiệu ứng',[['-1','Tự động / theo chủ lực đã chọn'],...team.map((n,i)=>[String(i),n])]);
 select('buffType','Loại hiệu ứng',[['damage','Sát thương chung %'],['atk','Tấn Công %'],['speed','Tốc Độ flat'],['speedPct','Tốc Độ %'],['advance','Đẩy lượt %'],['delay','Trì hoãn Myrk %'],['defReduction','Giảm Phòng Thủ %'],['resReduction','Giảm Kháng nguyên tố %'],['vulnerability','Sát thương phải nhận %'],['resist','Kháng Hiệu Ứng %'],['reduction','Giảm sát thương %'],['control','Khống chế'],['weakness','Gắn Điểm Yếu']]);
 add('buffValue','Giá trị hiệu ứng (âm = giảm)',20,-100000);add('duration','Thời hạn theo lượt người nhận',2,1,99);add('outgoing','Tăng hồi phục %',0);add('received','Tăng hồi phục nhận %',0);
 for(const [cls,title] of [['fuaId','ID FUA (nếu có)'],['parent','ID FUA trực tiếp kích hoạt']]){const l=document.createElement('label');l.textContent=title;const n=document.createElement('input');n.className=cls;l.append(n);node.append(l);}
 const nameLabel=document.createElement('label');nameLabel.textContent='Tên hiệu ứng / DoT';const name=document.createElement('input');name.className='effectName';name.value='Hiệu ứng thủ công';nameLabel.append(name);node.append(nameLabel);
 select('annihilate','Kỹ năng có tạo Diệt Kích?',[['0','Không'],['1','Có (1 lần/mục tiêu/hành động)']]);
 select('implant','Bỏ điều kiện Điểm Yếu?',[['0','Không'],['1','Có — giữ nguyên Kháng']]);
 select('realTurn','Loại lượt',[['1','Lượt thật'],['0','Hành động chen ngang']]);
 add('cost','Planck tiêu hao',0,0,8);add('refund','Planck hồi sau hành động',1,0,8);add('energy','Năng Lượng nhận cơ bản',20);
 select('trigger','Kích hoạt',[['manual','Theo rotation / AV'],['afterAttack','Sau đồng minh khác tấn công'],['enemyHit','Sau Myrk đánh trúng bản thân'],['break','Sau phe ta phá Sức Bền']]);
 add('maxPerTurn','Giới hạn trigger giữa hai lượt bản thân',1,1,100);add('maxStacks','Tối đa tầng (1 = không cộng dồn)',1,1,100);
 add('baseChance','Tỷ lệ cơ bản áp dụng debuff %',100,0,1000);
 select('guaranteed','Cách áp dụng debuff',[['1','Chắc chắn (trừ miễn nhiễm tuyệt đối)'],['0','Kiểm tra Chính Xác / Kháng Hiệu Ứng']]);
 select('skipRecovery','Khống chế cấm hồi Sức Bền?',[['0','Không'],['1','Có']]);
 select('implantElement','Điểm Yếu gắn',elements.map(e=>[e,e]));
 select('bounce','Cách chọn mục tiêu mỗi hit',[['0','Mục tiêu đã chọn; chuyển khi chết'],['1','Ngẫu nhiên mục tiêu sống (bounce)']]);
 select('trueDamage','Sát Thương Chuẩn',[['0','Không'],['1','Có — dùng giá trị gốc, bỏ qua giảm trừ']]);
 select('ultCostMode','Chi phí Tuyệt Kĩ',[['cap','Tiêu bằng giới hạn NL (thử thủ công)'],['explicit','Nhập riêng theo biến thể']]);add('energyCost','NL tiêu hao riêng',100);
 select('ability','Loại kỹ năng gốc (cho buff/hồi máu/khiên)',[['auto','Theo nguồn sát thương'],['Basic','Tấn Công Thường'],['Skill','Chiến Kĩ'],['Ult','Tuyệt Kĩ']]);
 for(const [cls,title] of [['enhanced','Kỹ năng này được cường hóa?'],['enhancesBasic','Chiến Kĩ này cường hóa Tấn Công Thường?'],['consumedStacks','Có tiêu hao/xóa/chuyển hóa tầng của bản thân?'],['storedDamage','Sát thương từ giá trị đã ghi nhận?'],['delayedHeal','Hồi máu theo điều kiện đã thiết lập?'],['cleanse','Giải hiệu ứng xấu cho mục tiêu?'],['triggerDoT','Kích hoạt DoT ngoài lượt Myrk?']])select(cls,title,[['0','Không'],['1','Có']]);
 add('selfHPCost','HP tự tiêu hao (% HP tối đa)',0,0,99);add('dotMultiplier','Hệ số kích hoạt DoT %',100,0,1000);
 const defaults=()=>{const s=source.value;node.querySelector('.ability').value=['Buff','Debuff','Heal','Shield'].includes(s)?'Skill':'auto';node.querySelector('.cost').value=['Chiến Kỹ','Buff','Debuff','Heal','Shield'].includes(s)?1:0;node.querySelector('.refund').value=s==='Tấn Công Thường'?1:0;node.querySelector('.energy').value=['Đòn Đánh Theo Sau','Phản Kích'].includes(s)?10:s==='Tấn Công Thường'?20:['Chiến Kỹ','Buff','Debuff','Heal','Shield'].includes(s)?30:0;node.querySelector('.realTurn').value=['Đòn Đánh Theo Sau','Phản Kích','Tuyệt Kỹ'].includes(s)?'0':'1';};
 const advanced=document.createElement('details');advanced.className='action-advanced';const summary=document.createElement('summary');summary.textContent='Công thức, tài nguyên & hiệu ứng';advanced.append(summary);const primary=new Set(['av','recipient','buffType','buffValue','kitAction','kitVariant','fallbackBasic']);for(const l of [...node.children])if(l.tagName==='LABEL'&&l.querySelector('input,select')&&!primary.has(l.querySelector('input,select').className))advanced.append(l);node.append(advanced);
 node.querySelector('.ability').addEventListener('change',()=>{const kind=node.querySelector('.ability').value;if(kind!=='auto'){node.querySelector('.cost').value=kind==='Skill'?1:0;node.querySelector('.refund').value=kind==='Basic'?1:0;node.querySelector('.energy').value=kind==='Skill'?30:kind==='Basic'?20:0;node.querySelector('.realTurn').value=kind==='Ult'?'0':'1';}simulate();});
 node.querySelector('.toughnessMode').value=seed.toughness!==undefined?'explicit':'default';
 node.querySelector('.kitAction').value=seed.kitAction||'manual';
 node.querySelector('.kitVariant').value=String(seed.kitVariant??0);
 const kitMode=()=>{const k=node.querySelector('.kitAction').value;for(const input of node.querySelectorAll('.action-advanced input,.action-advanced select'))input.disabled=k!=='manual'&&!['actor','target','realTurn'].includes(input.className);if(k==='Ult')node.querySelector('.realTurn').value='0';};
 node.querySelector('.kitAction').addEventListener('change',()=>{const k=node.querySelector('.kitAction').value;if(k!=='manual')node.querySelector('.realTurn').value=k==='Ult'?'0':'1';kitMode();refreshCharacterRows();simulate();});
 node.querySelector('.actor').addEventListener('change',refreshCharacterRows);
 source.value=seed.source||'Tấn Công Thường';defaults();kitMode();source.addEventListener('change',()=>{defaults();simulate();});
}
function failCombat(message){
 document.querySelector('#supportActionSummary')?.replaceChildren();
 document.querySelector('#cycleResults')?.replaceChildren();
 clearCombatReport(message);
 rotationUI.result=null;
 if(document.querySelector('#rotationTurns')){document.querySelector('#rotationTurns').replaceChildren();document.querySelector('#rotationTimeline').replaceChildren();document.querySelector('#rotationComparison').replaceChildren();}
 document.querySelector('#combatLog').textContent=message;for(const id of ['totalDamage','singleDamage','damagePerAction'])document.querySelector('#'+id).textContent='—';document.querySelector('#breakdown').replaceChildren();document.querySelectorAll('.actionDamage').forEach(e=>e.value='—');
}
function calculateCombat(){
 if(rotationUI.busy)return;
 if(!document.querySelector('#cycles'))return;
 const n=id=>Number(document.querySelector('#'+id).value), config={count:n('enemyCount'),level:n('enemyLevel'),hp:n('enemyHP'),maxToughness:n('enemyMaxToughness'),toughness:n('enemyToughness'),speed:n('enemySpeed'),attack:n('enemyAttack'),hitEnergy:n('hitEnergy'),cycles:n('cycles'),seed:n('seed'),res:n('enemyResistance')/100,reduction:n('enemyReduction')/100,allyReduction:n('allyReduction')/100,allyRes:n('allyRes')/100,critMode:document.querySelector('#critMode').value,weaknesses:[...document.querySelectorAll('.weakness:checked')].map(e=>e.value)};
 config.dynamic=document.querySelector('#timelineMode').value==='dynamic';config.effectRes=n('effectRes')/100;config.enemyHits=n('enemyHits');config.enemyTargets=n('enemyTargets');
 config.infiniteHP=document.querySelector('#enemyHPMode').value==='infinite';
 const invalid=[...document.querySelectorAll('input[type=number]')].find(e=>!e.disabled&&(!e.checkValidity()||e.value===''));
 if(invalid){failCombat(`Kiểm tra ${invalid.getAttribute('aria-label')||invalid.closest('label')?.textContent||invalid.id}: nhập số từ ${invalid.min||'không giới hạn'} đến ${invalid.max||'không giới hạn'}.`);return;}
 if(config.toughness>config.maxToughness){failCombat('Sức Bền hiện tại không được vượt Sức Bền tối đa.');return;}
 const sources={'Tấn Công Thường':'Basic','Chiến Kỹ':'Skill','Tuyệt Kỹ':'Ult','Đòn Đánh Theo Sau':'FUA','Phản Kích':'Counter','Sát Thương Duy Trì':'DoT'};
 const nodes=[...document.querySelectorAll('.action-row')];
 const actions=nodes.map(row=>{const get=cls=>row.querySelector('.'+cls).value,num=cls=>Number(get(cls));return {kitVariant:num('kitVariant'),kitAction:get('kitAction')==='manual'?undefined:get('kitAction'),fallbackBasic:get('fallbackBasic')==='1',ability:get('ability')==='auto'?undefined:get('ability'),enhanced:get('enhanced')==='1',enhancesBasic:get('enhancesBasic')==='1',consumedStacks:get('consumedStacks')==='1',storedDamage:get('storedDamage')==='1',delayedHeal:get('delayedHeal')==='1',cleanse:get('cleanse')==='1',triggerDoT:get('triggerDoT')==='1',selfHPCost:num('selfHPCost')/100,dotMultiplier:num('dotMultiplier')/100,trigger:get('kitAction')==='manual'?get('trigger'):'manual',maxPerTurn:num('maxPerTurn'),maxStacks:num('maxStacks'),baseChance:num('baseChance')/100,guaranteed:get('guaranteed')==='1',skipRecovery:get('skipRecovery')==='1',implantElement:get('implantElement'),bounce:get('bounce')==='1',trueDamage:get('trueDamage')==='1',energyCost:get('ultCostMode')==='explicit'?num('energyCost'):undefined,actor:team.indexOf(get('actor')),fuaId:get('fuaId'),parent:get('parent'),source:get('kitAction')==='manual'?(sources[get('source')]||get('source')):get('kitAction'),av:num('av'),level:num('level'),ratio:num('multiplier')/100,targets:num('targets'),target:num('target')-1,hits:num('hits'),bonus:num('damageBonus')/100,pen:num('defIgnore')/100,defReduction:num('defReduction')/100,resPen:num('resPen')/100,vulnerability:num('vulnerability')/100,flat:num('flat'),scaling:get('scaling'),toughness:get('toughnessMode')==='explicit'?num('toughness'):undefined,efficiency:num('efficiency')/100,breakBonus:num('breakBonus')/100,recipient:num('recipient'),buffType:get('buffType'),buffValue:num('buffValue')/(get('buffType')==='speed'?1:100),duration:num('duration'),effectName:get('effectName'),outgoing:num('outgoing')/100,received:num('received')/100,annihilate:get('annihilate')==='1',implant:get('implant')==='1',realTurn:get('realTurn')==='1',cost:num('cost'),refund:num('refund'),energy:num('energy')};});
 if(actions.some(a=>['FUA','Counter'].includes(a.source)&&a.parent&&!a.fuaId)){failCombat('Nhập ID FUA khi chọn FUA kích hoạt trước đó.');return;}
 const critUsers=criticalTriggerUsers(team.map(name=>({...characters[name],name})));
 let critNotice=document.querySelector('#criticalModeNotice');if(!critNotice){critNotice=rotationNode('p');critNotice.id='criticalModeNotice';critNotice.setAttribute('role','status');(document.querySelector('#cycleRunner')||document.querySelector('.toolbar')).append(critNotice);}
 if(critUsers.length&&config.critMode==='expected'){config.critMode='sampled';document.querySelector('#critMode').value='sampled';}
 critNotice.textContent=critUsers.length&&config.critMode==='sampled'?`Đang dùng Chí Mạng theo seed vì ${critUsers.join(', ')} có kit hoặc trang bị cần đếm Chí Mạng thực tế. Cùng thiết lập và seed sẽ cho cùng kết quả.`:'';
 const roster=team.map(name=>({...characters[name],name}));if(!config.dynamic)rotationUI.plan=null;config.rotation=rotationConfiguration(roster);config.report=true;
 let result;try{result=runCombat(config,roster,actions);}catch(error){result={complete:false,error:error.message};}
 rotationUpdated({config,roster,actions},result);
 reportUpdated({config,roster,actions},result);
 if(typeof renderCycleResults==='function')renderCycleResults(result,config);
 if(!result.complete){failCombat(result.error);return;}
 let notice=document.querySelector('#gearCoverage');if(!notice){notice=document.createElement('p');notice.id='gearCoverage';document.querySelector('#totalDamage').parentElement.append(notice);}const missing=team.flatMap(name=>characters[name].gear?.warnings||[]);notice.textContent=missing.length?'Kết quả tạm tính: '+missing.length+' nội tại trang bị chưa mô phỏng đầy đủ. Xem nhật ký.':`Trang bị đã áp dụng · ${team.filter(n=>characters[n].kitEnabled).length}/5 Veyr bật kit tự động. Hàng thủ công vẫn dùng hệ số bạn nhập. VM3/VM5 chưa tăng cấp kỹ năng.`;
 nodes.forEach((row,i)=>row.querySelector('.actionDamage').value=fmt(result.rows[i]||0));
 const total=Object.values(result.totals).reduce((s,v)=>s+v,0);document.querySelector('#totalDamage').textContent=fmt(total);document.querySelector('#singleDamage').textContent=fmt(result.enemies[0].damageTaken||0);document.querySelector('#damagePerAction').textContent=fmt(result.executions.filter(e=>e.source!=='Wait').length?total/result.executions.filter(e=>e.source!=='Wait').length:0);
 document.querySelector('#breakdown').replaceChildren(...Object.entries(result.totals).map(([name,v])=>{const p=document.createElement('p');p.textContent=`${name}: ${fmt(v)}`;return p;}));
 document.querySelector('#combatLog').textContent=team.flatMap(name=>(characters[name].gear?.warnings||[]).map(w=>'CHƯA ĐẦY ĐỦ · '+name+': '+w)).join('\n')+'\n'+result.log.map(r=>`AV ${r.av.toFixed(2)} · ${r.message}`).join('\n')+'\n\nTrạng thái cuối mô phỏng\n'+result.units.map(u=>`${u.name}: HP ${u.currentHP.toFixed(2)} · NL ${u.currentEnergy.toFixed(2)}/${u.energyCap} · Khiên ${Math.max(0,...u.shields).toFixed(2)}${u.characterState?' · '+Object.entries(u.characterState).filter(([k,v])=>['seeds','flame','tiger','balance','axis','zenith','afterglow'].includes(k)).map(([k,v])=>`${({seeds:'Hỏa Chủng',flame:'Thần Hỏa',tiger:'Hổ Thế',balance:'Quy Cân',axis:'Quang Trục',zenith:'Thiên Đỉnh',afterglow:'Dư Nhật'})[k]} ${typeof v==='boolean'?(v?1:0):v}`).join(' · '):''}`).join('\n')+'\n\n'+result.enemies.map(e=>`Myrk ${e.index+1}: HP ${config.infiniteHP?'∞':e.hp.toFixed(2)} · Sức Bền ${e.toughness}/${e.maxToughness}`).join('\n');
}
