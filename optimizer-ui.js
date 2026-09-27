const optimizerUI={running:false,cancelled:false,results:[],evaluations:0,baseline:0};
const optimizerClone=value=>JSON.parse(JSON.stringify(value));
const optimizerKeyName=name=>name==='Hou Yi'?'HouYi':name;
const optimizerDisplayName=name=>name==='HouYi'?'Hou Yi':name;
const optimizerYield=()=>new Promise(resolve=>setTimeout(resolve,0));

function optimizerField(id,label,options,value){const node=rotationSelect(label,options,value,()=>{}),select=node.querySelector('select');select.id=id;select.onchange=null;return node;}
function setupOptimizerUI(){
 const panel=rotationNode('section');panel.id='optimizer';panel.className='panel rotation-planner optimizer-panel';
 panel.append(rotationNode('h2','Tự động tìm đội hình & rotation'),rotationNode('p','Tìm phương án có sát thương tốt nhất trên chính Myrk, số cycle, seed và chế độ Chí Mạng đang chọn. Tìm rotation giữ nguyên trang bị hiện tại; tìm toàn roster dùng trang bị chuẩn hóa từ đề cử đã đối chiếu.'));
 const controls=rotationNode('div');controls.className='optimizer-controls';
 controls.append(optimizerField('optimizerBudget','Độ sâu tìm kiếm',[[12,'Kiểm tra nhanh · 12 mô phỏng'],[40,'Thử nhanh · khoảng 40 mô phỏng'],[80,'Nhanh · khoảng 80 mô phỏng'],[220,'Cân bằng · khoảng 220 mô phỏng'],[600,'Sâu · khoảng 600 mô phỏng']],220),optimizerField('optimizerFate','VM chuẩn hóa khi tìm toàn roster',[[0,'VM0'],[1,'VM1'],[2,'VM2'],[4,'VM4'],[6,'VM6']],6),optimizerField('optimizerRefine','Tinh luyện đề cử',[[1,'TL1'],[5,'TL5']],5),optimizerField('optimizerSustain','Ràng buộc sustain',[['atLeastOne','Ít nhất 1 Aegis/Caduceus'],['exactlyOne','Đúng 1 Aegis/Caduceus'],['free','Tự do']], 'atLeastOne'));
 const locked=optimizerField('optimizerLocked','Veyr bắt buộc',[['','Không khóa Veyr']],''),lockedSelect=locked.querySelector('select');lockedSelect.dataset.pending='1';controls.append(locked);
 panel.append(controls);
 const buttons=rotationNode('div');buttons.className='rotation-controls';buttons.append(rotationButton('Tối ưu rotation đội hiện tại',optimizeCurrentRotation,'optimizeRotation'),rotationButton('Tìm đội hình từ toàn roster',optimizeFullRoster,'optimizeTeam'),rotationButton('Dừng tìm kiếm',()=>{optimizerUI.cancelled=true;optimizerMessage('Đang dừng sau mô phỏng hiện tại…');},'cancelOptimizer'));panel.append(buttons);
 const note=rotationNode('p','Kết quả là phương án tốt nhất tìm thấy trong ngân sách, không phải chứng minh tối ưu tuyệt đối. Với HP hữu hạn, đội dọn xong được ưu tiên trước rồi mới xét AV kết thúc; với HP vô cực, xếp theo tổng sát thương. Tìm toàn roster luôn dùng Chí Mạng theo seed hiện tại để các nội tại cần Chí Mạng thực tế hoạt động.');note.className='status-note';panel.append(note);
 const progress=rotationNode('progress');progress.id='optimizerProgress';progress.max=1;progress.value=0;panel.append(progress);const message=rotationNode('p');message.id='optimizerMessage';message.setAttribute('role','status');panel.append(message);const results=rotationNode('div');results.id='optimizerResults';panel.append(results);
 document.querySelector('#teamComparison').after(panel);document.addEventListener('mythborne-builder-ready',populateOptimizerRoster);
}
function optimizerMessage(text){document.querySelector('#optimizerMessage').textContent=text;}
function optimizerContext(){const detail={};document.dispatchEvent(new CustomEvent('mythborne-optimizer-context',{detail}));if(!detail.context)throw Error('Bộ chọn nhân vật chưa sẵn sàng.');return detail.context;}
function populateOptimizerRoster(){
 const select=document.querySelector('#optimizerLocked');if(!select||!select.dataset.pending)return;const {catalog}=optimizerContext();for(const character of catalog.characters)select.add(new Option(character.name,optimizerKeyName(character.name)));delete select.dataset.pending;
}
function optimizerConfig(){
 if(!rotationUI.input?.config||!rotationUI.result?.complete)throw Error('Hãy chạy một mô phỏng hợp lệ trước khi tối ưu.');const config=optimizerClone(rotationUI.input.config);return {...config,dynamic:true,rotation:null,report:false,maxSteps:Math.min(5000,Math.max(500,Number(config.cycles||1)*250))};
}
function optimizerActions(names){return names.flatMap((name,actor)=>['Skill','Basic'].map(kitAction=>({actor,kitAction,source:kitAction,realTurn:true,recipient:-1,fallbackBasic:true})));}
function optimizerSeeds(names){return names.flatMap(name=>['Skill','Basic'].map(kitAction=>({actor:name,kitAction,source:kitAction==='Skill'?'Chiến Kỹ':'Tấn Công Thường',recipient:'-1',fallbackBasic:'1',realTurn:'1'})));}
function optimizerStamps(state,catalog){const stamps={};const memory=catalog.memories.find(item=>item.name===state.memory);if(memory)stamps[memory.id]=memory.contentHash;for(const piece of state.artifacts){const set=catalog.artifacts.find(item=>item.name===piece.set);if(set)stamps[set.id]=set.contentHash;}return stamps;}
function standardOptimizerCandidate(names,context,settings){
 const states=[],roster=[],stamps={};for(const name of names){const record=context.catalog.characters.find(item=>optimizerKeyName(item.name)===name),base=optimizerClone(context.bases[name]);if(!record||!base)throw Error('Thiếu dữ liệu chuẩn hóa cho '+optimizerDisplayName(name));
  const state={kitPattern:'skill-basic',kitRecipient:-1,memory:'',refine:settings.refine,kitEnabled:true,kitAscensions:true,kitMinor:true,kitFate:settings.fate,kitDivinityTriumph:true,kitAutoUlt:name==='Astraeus'?'full':'ready',artifacts:Array.from({length:6},(_,slot)=>newPiece(slot))};
  const review=reviewedGearSuggestions(record,context.catalog,state);if(review.memories[0])state.memory=review.memories[0].item.name;if(review.sets[0]){let slot=0;for(const part of review.sets[0].pieces)for(let i=0;i<part.count&&slot<6;i++)state.artifacts[slot++].set=part.item.name;}
  Object.assign(stamps,optimizerStamps(state,context.catalog));const unit={...composeGear(base,state,context.catalog),...Object.fromEntries(['kitPattern','kitRecipient','kitEnabled','kitAscensions','kitMinor','kitFate','kitDivinityTriumph','kitAutoUlt'].map(key=>[key,state[key]])),name:optimizerDisplayName(name)};roster.push(unit);states.push(state);
 }
 return {kind:'team',names:[...names],roster,actions:optimizerActions(names),seeds:optimizerSeeds(names),build:{team:[...names],states,stamps,bases:Object.fromEntries(names.map(name=>[name,optimizerClone(context.bases[name])]))},standardized:true};
}
function optimizerApplySettings(candidate,settings){
 const next={...candidate,roster:optimizerClone(candidate.roster),build:optimizerClone(candidate.build),settings:optimizerClone(settings)};next.roster.forEach((unit,index)=>Object.assign(unit,settings[index]));next.build.states.forEach((state,index)=>Object.assign(state,settings[index]));return next;
}
function settingsFromCandidate(candidate){return candidate.roster.map(unit=>({kitPattern:unit.kitPattern||'inherit',kitRecipient:Number.isInteger(unit.kitRecipient)?unit.kitRecipient:-1,kitAutoUlt:unit.kitAutoUlt??'ready'}));}
function runOptimizerCandidate(candidate,config){const result=runCombat(config,optimizerClone(candidate.roster),optimizerClone(candidate.actions));if(!result.complete)throw Error(result.error);return {...candidate,result,metrics:optimizerMetrics(result,config),key:optimizerTeamKey(candidate.names)+'|'+candidate.roster.map(unit=>`${unit.kitPattern}:${unit.kitRecipient}:${unit.kitAutoUlt}`).join('|')};}
async function optimizerEvaluate(candidate,config,total){
 if(optimizerUI.cancelled)throw Error('Đã dừng tìm kiếm.');let evaluated,failure;try{evaluated=runOptimizerCandidate(candidate,config);}catch(error){failure=error;}optimizerUI.evaluations++;const progress=document.querySelector('#optimizerProgress');progress.max=total;progress.value=Math.min(total,optimizerUI.evaluations);if(optimizerUI.evaluations%3===0||failure){optimizerMessage(`Đã thử ${optimizerUI.evaluations}/${total} phương án${failure?' · loại một phương án không hoàn tất':''}…`);await optimizerYield();}if(failure)throw failure;return evaluated;
}
async function optimizeCandidateSettings(candidate,config,total,maxEvaluations){
 let settings=settingsFromCandidate(candidate),best=await optimizerEvaluate(optimizerApplySettings(candidate,settings),config,total),used=1;const supportAspects=new Set(['Keraunos','Aegis','Caduceus','Pandora']);
 for(let pass=0;pass<2&&used<maxEvaluations;pass++)for(let actor=0;actor<5&&used<maxEvaluations;actor++){
  const groups=[optimizerPatternIds.map(value=>({kitPattern:value})),['ready','manual',...(candidate.names[actor]==='Astraeus'?['full']:[])].map(value=>({kitAutoUlt:value}))];if(supportAspects.has(candidate.roster[actor].aspect))groups.push([-1,...Array.from({length:5},(_,i)=>i).filter(i=>i!==actor)].map(value=>({kitRecipient:value})));
  for(const group of groups){let local=best,localSettings=settings;for(const change of group){if(used>=maxEvaluations)break;const trial=optimizerClone(settings);Object.assign(trial[actor],change);const evaluated=await optimizerEvaluate(optimizerApplySettings(candidate,trial),config,total);used++;if(compareOptimizerResults(evaluated,local)<0){local=evaluated;localSettings=trial;}}best=local;settings=localSettings;}
 }
 return best;
}
function optimizerProfiles(context){return Object.fromEntries(context.catalog.characters.filter(record=>characterRegistry[record.id]?.hash===record.contentHash).map(record=>[optimizerKeyName(record.name),{aspect:record.aspect,element:record.element,name:record.name}]));}
function optimizerOptions(){return {locked:document.querySelector('#optimizerLocked').value,sustain:document.querySelector('#optimizerSustain').value};}
function normalizedOptimizerSeed(team,profiles,options){const names=team.map(optimizerKeyName);return optimizerTeamValid(names,profiles,options)?names:null;}
function optimizerInitialTeams(pool,profiles,options,random){
 const seen=new Set(),teams=[],add=team=>{if(team&&optimizerTeamValid(team,profiles,options)&&!seen.has(optimizerTeamKey(team))){seen.add(optimizerTeamKey(team));teams.push(team);}};add(normalizedOptimizerSeed(rotationUI.input.roster.map(unit=>unit.name),profiles,options));for(const team of Object.values(presets))add(normalizedOptimizerSeed(team,profiles,options));while(teams.length<30){const team=randomOptimizerTeam(pool,profiles,options,random);if(!team)break;add(team);}return teams;
}
function renderOptimizerResults(){
 const host=document.querySelector('#optimizerResults');host.replaceChildren();if(!optimizerUI.results.length)return;host.append(rotationNode('h3','Các phương án tốt nhất tìm thấy'));
 const rows=optimizerUI.results.slice(0,10).map((item,index)=>{const load=rotationButton('Nạp phương án',()=>loadOptimizerResult(item));const gain=optimizerUI.baseline?((item.metrics.damage/optimizerUI.baseline-1)*100):0;return [index+1,item.names.map(optimizerDisplayName).join(' · '),item.roster.map(unit=>actionPatterns.find(pattern=>pattern.id===unit.kitPattern)?.label||unit.kitPattern).join(' · '),reportFmt(item.metrics.damage),`${gain>=0?'+':''}${gain.toFixed(2)}%`,item.metrics.cleared?`Dọn xong tại AV ${item.metrics.elapsedAV.toFixed(2)}`:`${item.metrics.survivors}/5 sống`,load];});
 host.append(reportTable(['#','Đội hình','Xu hướng hành động','Tổng ST','So với cấu hình trước tìm kiếm','Kết quả','Thao tác'],rows));if(optimizerUI.results[0]?.standardized)host.append(rotationNode('p','Các đội toàn roster dùng VM/TL đã chọn, Mảnh Ký Ức và bộ Thần Vật đầu tiên trong đề cử đã đối chiếu; chỉ số chính/phụ dùng cấu hình mặc định đồng nhất. Hãy nạp phương án rồi tinh chỉnh trang bị để kiểm tra trần thực tế.'));
}
async function beginOptimizer(total,work){
 if(optimizerUI.running)return;optimizerUI.running=true;optimizerUI.cancelled=false;optimizerUI.evaluations=0;optimizerUI.results=[];document.querySelector('#optimizerProgress').max=total;document.querySelector('#optimizerProgress').value=0;document.querySelectorAll('#optimizeRotation,#optimizeTeam').forEach(button=>button.disabled=true);optimizerMessage('Đang chuẩn bị không gian tìm kiếm…');
 try{await optimizerYield();await work();if(!optimizerUI.cancelled)optimizerMessage(`Hoàn tất ${optimizerUI.evaluations} mô phỏng. Có thể nạp một phương án để xem báo cáo từng hit.`);}catch(error){optimizerMessage(error.message);}finally{optimizerUI.running=false;document.querySelectorAll('#optimizeRotation,#optimizeTeam').forEach(button=>button.disabled=false);renderOptimizerResults();}
}
function currentOptimizerCandidate(){const detail={};document.dispatchEvent(new CustomEvent('mythborne-build-snapshot',{detail}));if(!detail.build)throw Error('Chưa lấy được trang bị hiện tại.');return {kind:'rotation',names:detail.build.team,roster:optimizerClone(rotationUI.input.roster),actions:optimizerClone(rotationUI.input.actions),seeds:reportActionSeeds(),build:detail.build,standardized:false};}
async function optimizeCurrentRotation(){
 let config,candidate;try{config=optimizerConfig();candidate=currentOptimizerCandidate();}catch(error){optimizerMessage(error.message);return;}const total=Number(document.querySelector('#optimizerBudget').value);optimizerUI.baseline=optimizerMetrics(rotationUI.result,config).damage;
 await beginOptimizer(total,async()=>{const best=await optimizeCandidateSettings(candidate,config,total,total);optimizerUI.results=[best];});
}
async function optimizeFullRoster(){
 let config,context;try{config={...optimizerConfig(),critMode:'sampled'};context=optimizerContext();}catch(error){optimizerMessage(error.message);return;}const total=Number(document.querySelector('#optimizerBudget').value),settings={fate:Number(document.querySelector('#optimizerFate').value),refine:Number(document.querySelector('#optimizerRefine').value)},profiles=optimizerProfiles(context),pool=Object.keys(profiles),options=optimizerOptions(),random=optimizerRandom(config.seed||1),baseline=runCombat(config,optimizerClone(rotationUI.input.roster),optimizerClone(rotationUI.input.actions));optimizerUI.baseline=baseline.complete?optimizerMetrics(baseline,config).damage:optimizerMetrics(rotationUI.result,config).damage;
 if(options.locked&&!profiles[options.locked]){optimizerMessage('Veyr bị khóa chưa có runtime hiện hành.');return;}
 await beginOptimizer(total,async()=>{
  const cache=new Map(),archive=[];let lastFailure='',frontier=optimizerInitialTeams(pool,profiles,options,random),teamBudget=Math.max(6,Math.floor(total*.65)),previewConfig={...config,searchApproximate:true,supportPreview:true};
  while(optimizerUI.evaluations<teamBudget&&frontier.length&&!optimizerUI.cancelled){
   for(const names of frontier){if(optimizerUI.evaluations>=teamBudget)break;const key=optimizerTeamKey(names);if(cache.has(key))continue;try{const result=await optimizerEvaluate(standardOptimizerCandidate(names,context,settings),previewConfig,total);cache.set(key,result);archive.push(result);}catch(error){if(error.message==='Đã dừng tìm kiếm.')throw error;lastFailure=error.message;cache.set(key,null);}}
   archive.sort(compareOptimizerResults);const elites=archive.slice(0,12),next=[];for(const elite of elites)for(let i=0;i<4;i++)next.push(mutateOptimizerTeam(elite.names,pool,profiles,options,random));while(next.length<54){const team=randomOptimizerTeam(pool,profiles,options,random);if(team)next.push(team);else break;}frontier=next;
  }
  archive.sort(compareOptimizerResults);if(!archive.length)throw Error('Không tìm được đội hợp lệ với các ràng buộc hiện tại'+(lastFailure?': '+lastFailure:'')+'.');const exact=[];for(const candidate of archive){if(exact.length>=3||optimizerUI.evaluations>=total)break;try{exact.push(await optimizerEvaluate(candidate,config,total));}catch(error){if(error.message==='Đã dừng tìm kiếm.')throw error;lastFailure=error.message;}}exact.sort(compareOptimizerResults);if(!exact.length)throw Error('Các đội rút gọn đều không hoàn tất: '+lastFailure);let previewBest=exact[0],remaining=total-optimizerUI.evaluations;if(remaining>1&&!optimizerUI.cancelled)previewBest=await optimizeCandidateSettings(previewBest,previewConfig,total,remaining-1);let best=exact[0];if(optimizerUI.evaluations<total)try{best=await optimizerEvaluate(previewBest,config,total);}catch(error){if(error.message==='Đã dừng tìm kiếm.')throw error;}optimizerUI.results=[best,...exact.filter(item=>optimizerTeamKey(item.names)!==optimizerTeamKey(best.names))].sort(compareOptimizerResults);
 });
}
function loadOptimizerResult(result){
 if(optimizerUI.running)return;rotationUI.busy=true;try{document.dispatchEvent(new CustomEvent('mythborne-build-restore',{detail:{build:optimizerClone(result.build)}}));rotationUI.plan=null;document.querySelector('#timelineMode').value='dynamic';document.querySelector('#rotation').replaceChildren();for(const seed of result.seeds)addAction(seed);}finally{rotationUI.busy=false;}simulate();optimizerMessage('Đã nạp phương án vào đội hình hiện tại. Báo cáo, cycle và bản nháp đã được tính lại.');document.querySelector('#team').scrollIntoView({behavior:'smooth'});
}
