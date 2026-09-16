const rotationUI={plan:null,input:null,result:null,busy:false,saved:[],filter:'all'};
function rotationNode(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
function rotationButton(text,fn,id){const n=rotationNode('button',text);n.type='button';n.className='ghost';if(id)n.id=id;n.onclick=fn;return n;}
function rotationSelect(label,options,value,change){const l=rotationNode('label',label),s=document.createElement('select');s.setAttribute('aria-label',label);for(const [v,t] of options)s.add(new Option(t,String(v)));s.value=String(value);s.onchange=()=>change(s.value);l.append(s);return l;}
function rotationNumber(label,value,min,max,change){const l=rotationNode('label',label),n=document.createElement('input');Object.assign(n,{type:'number',value,min,max,step:1});n.setAttribute('aria-label',label);n.onchange=()=>{if(n.value!==''&&n.checkValidity())change(Number(n.value));};l.append(n);return l;}
function rotationMessage(text){document.querySelector('#rotationMessage').textContent=text;}
function setupRotationUI(){
 const panel=rotationNode('section');panel.id='rotationPlanner';panel.className='panel rotation-planner';
 panel.append(rotationNode('h2','Lập kế hoạch từng lượt'),rotationNode('p','Tính lịch từ đội hình, trang bị và Myrk hiện tại. Sửa từng lượt của Veyr để chọn kỹ năng, mục tiêu và người nhận buff. Lịch tự cập nhật khi Tốc Độ hoặc đẩy lượt thay đổi.'));
 const controls=rotationNode('div');controls.className='rotation-controls';
 controls.append(rotationButton('Tính lịch & chỉnh từng lượt',()=>{
  if(!rotationUI.input)return;
  if(rotationUI.input.roster.some(u=>!u.kitEnabled)){document.querySelector('#generateKit').click();if(rotationUI.input.roster.some(u=>!u.kitEnabled))return;}
  document.querySelector('#timelineMode').value='dynamic';
  rotationUI.plan={enabled:true,team:rotationTeam(rotationUI.input.roster),turns:{},ultimates:{}};simulate();
 },'prepareRotation'));
 controls.append(rotationButton('Dùng lại chuỗi lặp',()=>{rotationUI.plan=null;simulate();},'disableRotation'));
 const name=rotationNode('input');name.id='rotationName';name.placeholder='Tên rotation, ví dụ: Dồn sát thương lượt 2';name.setAttribute('aria-label','Tên rotation');controls.append(name);
 controls.append(rotationButton('Lưu rotation',saveRotation,'saveRotation'),rotationButton('So sánh các bản đã lưu',compareRotations,'compareRotations'));panel.append(controls);
 const message=rotationNode('p');message.id='rotationMessage';message.setAttribute('role','status');panel.append(message);
 for(const id of ['rotationPolicies','rotationSummary','rotationTurns','rotationTimeline','rotationSaved','rotationComparison']){const n=rotationNode('div');n.id=id;panel.append(n);}
 document.querySelector('.workspace').after(panel);
 try{const stored=JSON.parse(localStorage.getItem('mythborne-rotations-v1')||'[]');rotationUI.saved=Array.isArray(stored)?stored.filter(s=>s&&typeof s.name==='string'&&s.plan&&Array.isArray(s.actions)&&Array.isArray(s.seeds)).slice(0,20):[];}catch{rotationMessage('Không đọc được các rotation đã lưu trên trình duyệt này.');}
}
function rotationConfiguration(roster){
 if(rotationUI.plan&&rotationUI.plan.team!==rotationTeam(roster)){rotationUI.plan=null;rotationMessage('Đội hình đã đổi. Tính lại lịch để chỉnh từng lượt cho đội mới.');}
 return rotationUI.plan;
}
function rotationUpdated(input,result){
 rotationUI.input=input;rotationUI.result=result;
 if(rotationUI.busy)return;
 document.querySelector('#rotationComparison').replaceChildren();
 renderRotationSaved();
 if(!rotationUI.plan?.enabled){for(const id of ['rotationPolicies','rotationSummary','rotationTurns','rotationTimeline'])document.getElementById(id).replaceChildren();return;}
 if(!result?.complete){document.querySelector('#rotationTurns').replaceChildren();document.querySelector('#rotationTimeline').replaceChildren();rotationMessage(result?.error||'Kiểm tra cấu hình trước khi lập lịch.');return;}
 rotationMessage('Lịch dự kiến dùng cùng bộ mô phỏng và seed với kết quả. Các ô sửa gắn với số lượt của Veyr; đổi quyết định có thể làm xuất hiện hoặc mất lượt.');
 renderRotationPolicies();renderRotationTurns();renderRotationTimeline();
}
function rotationChanged(){simulate();}
function renderRotationPolicies(){
 const host=document.querySelector('#rotationPolicies');host.replaceChildren(rotationNode('h3','Điều kiện dùng Tuyệt Kĩ'));
 const names=rotationUI.input.roster.map((u,i)=>[i,u.name]);const grid=rotationNode('div');grid.className='rotation-policy-grid';
 rotationUI.input.roster.forEach((u,i)=>{
  const p={mode:'inherit',who:i,turn:1,target:0,recipient:u.kitRecipient??0,reserve:0,effect:'',...rotationUI.plan.ultimates[i]};
  const set=(k,v)=>{rotationUI.plan.ultimates[i]={...p,[k]:v};rotationChanged();};
  const card=rotationNode('div');card.className='rotation-policy';card.append(rotationNode('strong',u.name));
  card.append(rotationSelect('Tuyệt Kĩ · '+u.name,[['inherit','Theo lựa chọn ở thẻ nhân vật'],['ready','Ngay khi đủ Năng Lượng'],['manual','Giữ lại — chỉ dùng theo hàng đã đặt'],['full','Chờ dạng Tuyệt Kĩ đầy đủ'],['enhanced','Chờ BA / Chiến Kĩ cường hóa sẵn sàng'],['effect','Chờ một hiệu ứng đang tồn tại'],['beforeAlly','Ngay trước lượt của một Veyr'],['afterAlly','Ngay sau lượt của một Veyr'],['reserve','Giữ lại một lượng Năng Lượng sau khi dùng']],p.mode,v=>set('mode',v)));
  if(['beforeAlly','afterAlly','effect'].includes(p.mode))card.append(rotationSelect('Veyr cần chờ · '+u.name,names,p.who,v=>set('who',Number(v))));
  if(['beforeAlly','afterAlly'].includes(p.mode))card.append(rotationNumber('Từ lượt số · '+u.name,p.turn,1,999,v=>set('turn',v)),rotationNode('small','Tối đa một lần tại mỗi mốc trước/sau lượt, nếu đủ Năng Lượng.'));
  if(p.mode==='reserve')card.append(rotationNumber('NL giữ lại · '+u.name,p.reserve,0,10000,v=>set('reserve',v)));
  if(p.mode==='effect'){
   const l=rotationNode('label','Tên hiệu ứng cần chờ · '+u.name),n=rotationNode('input');n.value=p.effect;n.setAttribute('aria-label',l.textContent);n.placeholder='Nhập đúng tên hiệu ứng, không thêm dấu ngoặc';n.onchange=()=>set('effect',n.value.trim());
   const list=rotationNode('datalist');list.id='rotationEffects'+i;const all=new Set(rotationUI.result.turnRecords.flatMap(t=>[...(t.before.effects[p.who]||[]),...(t.after.effects[p.who]||[])]));for(const name of all)list.append(new Option(name,name));n.setAttribute('list',list.id);l.append(n,list);card.append(l);
  }
  if(!['inherit','manual'].includes(p.mode)){
   card.append(rotationSelect('Mục tiêu Tuyệt Kĩ · '+u.name,Array.from({length:rotationUI.input.config.count},(_,j)=>[j,'Myrk '+(j+1)]),p.target,v=>set('target',Number(v))));
   if(characterRegistry[u.characterId]?.ultimateRecipient)card.append(rotationSelect('Người nhận Tuyệt Kĩ · '+u.name,[[-1,'Tự động / theo chủ lực đã chọn'],...names.filter(([j])=>j!==i)],p.recipient,v=>set('recipient',Number(v))));
  }
  grid.append(card);
 });host.append(grid);
}
function renderRotationTurns(){
 const {result,input,plan}=rotationUI,summary=document.querySelector('#rotationSummary');summary.replaceChildren(rotationNode('h3','Lượt dự kiến'));
 summary.append(rotationNode('p',input.roster.map((u,i)=>`${u.name}: ${result.turnRecords.filter(t=>t.actor===i).length} lượt`).join(' · ')));
 summary.append(rotationSelect('Lọc lượt Veyr',[['all','Tất cả'],...input.roster.map((u,i)=>[i,u.name])],rotationUI.filter,v=>{rotationUI.filter=v;renderRotationTurns();}));
 const host=document.querySelector('#rotationTurns');host.replaceChildren();const table=rotationNode('table');table.append(rotationTableHead(['AV / lượt','Veyr','Quyết định','Người nhận / Myrk','Trước → sau hành động']));
 const body=rotationNode('tbody');
 for(const t of result.turnRecords){if(rotationUI.filter!=='all'&&Number(rotationUI.filter)!==t.actor)continue;const u=input.roster[t.actor],key=rotationKey(t.actor,t.turn),choice=plan.turns[key]||t.choice;
  const set=(k,v)=>{plan.turns[key]={...choice,[k]:v};rotationChanged();};const row=rotationNode('tr');row.dataset.turnKey=key;
  row.append(rotationNode('td',`${t.av.toFixed(2)} · Lượt ${t.turn}${t.extra?' (thêm)':''}`),rotationNode('td',u.name));
  const decision=rotationNode('td');decision.append(rotationSelect('Kỹ năng · '+u.name+' · lượt '+t.turn,[['Basic','Tấn Công Thường'],['Skill','Chiến Kĩ'],['Wait','Chờ']],choice.kitAction,v=>set('kitAction',v)));
  if(choice.kitAction==='Skill'){decision.append(rotationSelect('Thiếu Planck · '+u.name+' · lượt '+t.turn,[[true,'Đổi sang Tấn Công Thường'],[false,'Bỏ hành động']],choice.fallbackBasic,v=>set('fallbackBasic',v==='true')));if(u.characterId==='veyr:ares')decision.append(rotationSelect('Cấp Chiến Kĩ · '+u.name+' · lượt '+t.turn,[[0,'Tự chọn I/II'],[1,'I'],[2,'II'],[3,'III']],choice.kitVariant,v=>set('kitVariant',Number(v))));}
  decision.append(rotationNode('small',t.performed?t.name:'Không thi triển — xem nhật ký'));row.append(decision);
  const target=rotationNode('td');target.append(rotationSelect('Đồng minh · '+u.name+' · lượt '+t.turn,[[-1,'Tự động / theo chủ lực đã chọn'],...input.roster.map((v,j)=>[j,v.name])],choice.recipient,v=>set('recipient',Number(v))),rotationSelect('Myrk · '+u.name+' · lượt '+t.turn,Array.from({length:input.config.count},(_,j)=>[j,'Myrk '+(j+1)]),choice.target,v=>set('target',Number(v))));row.append(target);
  row.append(rotationNode('td',`Planck ${t.before.planck} → ${t.after.planck} · NL ${t.before.energy[t.actor].toFixed(2)} → ${t.after.energy[t.actor].toFixed(2)} · Tốc Độ ${t.before.speed[t.actor]}`));body.append(row);
 }table.append(body);host.append(table);
 const visibleKeys=new Set(result.turnRecords.map(t=>rotationKey(t.actor,t.turn))),dormant=Object.keys(plan.turns).filter(k=>!visibleKeys.has(k));if(dormant.length)host.append(rotationNode('p',`${dormant.length} lựa chọn thuộc lượt không xuất hiện trong lịch hiện tại; được giữ lại nếu lượt đó xuất hiện khi tính lại.`));
}
function rotationTableHead(labels){const head=rotationNode('thead'),row=rotationNode('tr');for(const label of labels)row.append(rotationNode('th',label));head.append(row);return head;}
function renderRotationTimeline(){
 const host=document.querySelector('#rotationTimeline');host.replaceChildren();const details=rotationNode('details');details.append(rotationNode('summary','Xem toàn bộ timeline: Veyr, Myrk, Tuyệt Kĩ và đòn tự kích hoạt'));
 const table=rotationNode('table');table.append(rotationTableHead(['AV','Hành động','Loại','Planck / Năng Lượng sau đòn']));const body=rotationNode('tbody');
 const events=[...rotationUI.result.executions,...rotationUI.result.enemyRecords.map(e=>({...e,enemy:true}))].sort((a,b)=>a.av-b.av||a.order-b.order);
 for(const e of events){const row=rotationNode('tr');row.append(rotationNode('td',e.av.toFixed(2)),rotationNode('td',e.enemy?`Myrk ${e.index+1} · lượt ${e.turn}`:`${rotationUI.input.roster[e.actor].name} · ${e.name||e.source}`),rotationNode('td',e.enemy?'Lượt Myrk':e.realTurn?'Lượt thực tế':e.source),rotationNode('td',e.after?`${e.after.planck} Planck · ${e.after.energy[e.actor].toFixed(1)} NL`:'—'));body.append(row);}table.append(body);details.append(table);host.append(details);
}
function saveRotation(){
 if(!rotationUI.plan?.enabled||!rotationUI.result?.complete){rotationMessage('Tính lịch hợp lệ trước khi lưu rotation.');return;}
 const name=document.querySelector('#rotationName').value.trim();if(!name){rotationMessage('Nhập tên để phân biệt các rotation.');return;}
 if(rotationUI.saved.length>=20){rotationMessage('Đã lưu 20 rotation. Xóa một bản cũ trước khi lưu thêm.');return;}
 const seeds=[...document.querySelectorAll('.action-row')].map(row=>Object.fromEntries([...row.querySelectorAll('input,select')].map(e=>[e.className,e.value])));
 const plan=JSON.parse(JSON.stringify(rotationUI.plan));rotationUI.input.roster.forEach((u,i)=>{if(!plan.ultimates[i]||plan.ultimates[i].mode==='inherit')plan.ultimates[i]={mode:u.kitAutoUlt==='full'?'full':u.kitAutoUlt?'ready':'manual',target:0,recipient:u.kitRecipient??0};});
 rotationUI.saved.push(JSON.parse(JSON.stringify({id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),name,plan,actions:rotationUI.input.actions,seeds})));
 const persisted=persistRotations();renderRotationSaved();if(persisted)rotationMessage('Đã lưu rotation “'+name+'”. So sánh sẽ chạy lại các bản với cùng đội hình, chỉ số, Myrk và seed hiện tại.');
}
function persistRotations(){try{localStorage.setItem('mythborne-rotations-v1',JSON.stringify(rotationUI.saved));return true;}catch{rotationMessage('Trình duyệt không cho lưu lâu dài; các bản hiện chỉ được giữ trong phiên này.');return false;}}
function renderRotationSaved(){const host=document.querySelector('#rotationSaved');host.replaceChildren(rotationNode('h3','Rotation đã lưu'));for(const saved of rotationUI.saved){const line=rotationNode('div');line.className='rotation-controls';line.append(rotationNode('span',saved.name));const compatible=saved.plan.team===rotationTeam(rotationUI.input.roster);
 const load=rotationButton('Nạp '+saved.name,()=>{rotationUI.busy=true;try{document.dispatchEvent(new Event('mythborne-kit-enable'));rotationUI.plan=JSON.parse(JSON.stringify(saved.plan));document.querySelector('#timelineMode').value='dynamic';document.querySelector('#rotation').replaceChildren();for(const seed of saved.seeds)addAction(seed);}finally{rotationUI.busy=false;}simulate();});load.disabled=!compatible;line.append(load,rotationButton('Xóa '+saved.name,()=>{rotationUI.saved=rotationUI.saved.filter(s=>s.id!==saved.id);persistRotations();renderRotationSaved();document.querySelector('#rotationComparison').replaceChildren();}));if(!compatible)line.append(rotationNode('small','Thuộc đội hình khác'));host.append(line);}}
function compareRotations(){
 const input=rotationUI.input;if(!input||!rotationUI.result?.complete){rotationMessage('Sửa cấu hình hiện tại để chạy được mô phỏng trước khi so sánh.');return;}const saved=rotationUI.saved.filter(s=>s.plan.team===rotationTeam(input.roster)),host=document.querySelector('#rotationComparison');host.replaceChildren();
 if(!saved.length){rotationMessage('Lưu ít nhất một rotation của đội hiện tại để so sánh.');return;}
 const table=rotationNode('table');table.append(rotationTableHead(['Rotation','Tổng ST','ST từng Veyr','Planck cuối','NL cuối / số lượt','Sức Bền cuối / số lần phá']));const body=rotationNode('tbody');
 for(const s of saved){const row=rotationNode('tr');row.append(rotationNode('td',s.name));try{const r=runCombat({...input.config,dynamic:true,rotation:s.plan},input.roster,s.actions);if(!r.complete)throw Error(r.error);const m=rotationMetrics(r);row.append(rotationNode('td',fmt(m.total)),rotationNode('td',input.roster.map(u=>u.name+': '+fmt(m.perVeyr[u.name]||0)).join(' · ')),rotationNode('td',String(m.planck)),rotationNode('td',input.roster.map((u,i)=>`${u.name}: ${m.energy[i].toFixed(1)} NL / ${m.turns[i]} lượt`).join(' · ')),rotationNode('td',m.toughness.map(n=>n.toFixed(1)).join(' / ')+` · ${m.breaks} lần phá`));}catch(error){const cell=rotationNode('td','Không so sánh: '+error.message);cell.colSpan=5;row.append(cell);}body.append(row);}table.append(body);host.append(rotationNode('p','Cùng đội hình, trang bị, Vận Mệnh, Myrk, thời lượng và seed hiện tại. Thay đổi cấu hình sẽ xóa bảng này; bấm so sánh lại để tính mới.'),table);
}
