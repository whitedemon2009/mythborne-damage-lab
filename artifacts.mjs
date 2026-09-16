export const substats={crit:[2.5,2.8,3.2],critDmg:[5.5,5.8,6.5],speed:[2.2,2.5,2.8],break:[5.1,5.5,6.5],hit:[3.9,4.2,5],resist:[3.9,4.2,5],atkPct:[3.9,4.2,5],hpPct:[3.9,4.2,5],defPct:[3.9,4.2,5],atkFlat:[17,19,21],hpFlat:[33,38,42],defFlat:[17,19,21]};
export const names={crit:'Chí Mạng %',critDmg:'ST Chí Mạng %',speed:'Tốc Độ',break:'Diệt Phá %',hit:'Chính Xác Hiệu Ứng %',resist:'Kháng Hiệu Ứng %',atkPct:'Tấn Công %',hpPct:'HP %',defPct:'Phòng Thủ %',atkFlat:'Tấn Công flat',hpFlat:'HP flat',defFlat:'Phòng Thủ flat',atkBase:'Tấn Công cơ bản',hpBase:'HP cơ bản',defBase:'Phòng Thủ cơ bản',energy:'Hồi Năng Lượng %',pierce:'Xuyên Giáp %',element:'Sát Thương Nguyên Tố %'};
Object.assign(names,{atk:'Tấn Công',hp:'HP',def:'Phòng Thủ',speedPct:'Tốc Độ %',outgoing:'Lượng Trị Liệu %',shieldBonus:'Giá trị Khiên %',efficiency:'Hiệu Suất Phá Vỡ %',SkillDamage:'ST Chiến Kĩ %',UltDamage:'ST Tuyệt Kĩ %',CounterDamage:'ST Phản Kích %',FUADamage:'ST Đòn Đánh Theo Sau %',DoTDamage:'ST Duy Trì %',waterDamage:'ST Thủy %'});
export const mains=[{hpBase:707},{defBase:590},{atkBase:350},{atkPct:43.2,hpPct:43.2,defPct:54,speed:25,break:64.8},{crit:32.4,critDmg:64.8,atkPct:43.2,hpPct:43.2,defPct:54,break:32.8,hit:43.2,resist:43.2},{energy:19.2,pierce:32.8,element:38.9,atkPct:43.2,hpPct:43.2,defPct:54}];
export const mainSubKey=k=>({hpBase:'hpFlat',atkBase:'atkFlat',defBase:'defFlat'}[k]||k);
export function newPiece(slot){return {set:'',slot,level:15,main:Object.keys(mains[slot])[0],initial:4,subs:Object.keys(substats).filter(k=>k!==mainSubKey(Object.keys(mains[slot])[0])).slice(0,4).map(stat=>({stat,tier:1})),rolls:Array(5).fill(null)};}
export function rollSlots(p){return Array.from({length:Math.floor(p.level/3)},(_,i)=>i).filter(i=>p.initial!==3||i!==0);}
export function addPieceRoll(p,line,tier){const slot=rollSlots(p).find(i=>!p.rolls[i]);if(slot===undefined)return false;if(!Number.isInteger(line)||line<0||line>3||![0,1,2].includes(tier))return false;p.rolls[slot]={line,tier};return true;}
export function pieceStats(p){
 if(!Number.isInteger(p.level)||p.level<1||p.level>15||![3,4].includes(p.initial)||!(p.main in mains[p.slot]))throw Error('Cấu hình Thần Vật không hợp lệ');
 const total={[p.main]:mains[p.slot][p.main]*p.level/15};
 const count=p.initial===3&&p.level<3?3:4;
 if(new Set(p.subs.slice(0,count).map(s=>s.stat)).size!==count)throw Error('Dòng phụ không được trùng nhau');
 if(p.subs.slice(0,count).some(s=>s.stat===mainSubKey(p.main)))throw Error('Dòng phụ trùng chỉ số chính');
 const add=(s)=>{if(!substats[s.stat]||![0,1,2].includes(s.tier))throw Error('Dòng phụ không hợp lệ');total[s.stat]=(total[s.stat]||0)+substats[s.stat][s.tier];};
 p.subs.slice(0,count).forEach(add);
 for(let i=0;i<Math.floor(p.level/3);i++){
   if(p.initial===3&&i===0)continue;
   const r=p.rolls[i];if(!r)continue;if(!Number.isInteger(r.line)||r.line<0||r.line>3)throw Error('Dòng được tăng không hợp lệ');
   add({stat:p.subs[r.line].stat,tier:r.tier});
 }
 return total;
}
export function aggregate(base,pieces,bonuses={}){
 const sum={...bonuses};for(const p of pieces.filter(p=>p.set))for(const [k,v] of Object.entries(pieceStats(p)))sum[k]=(sum[k]||0)+v;
 const out={...base};for(const k of ['atk','hp','def'])out[k]=((base[k]||0)+(sum[k+'Base']||0))*(1+(sum[k+'Pct']||0)/100)+(sum[k+'Flat']||0);
 for(const k of ['atk','hp','def'])out[k+'BaseTotal']=(base[k]||0)+(sum[k+'Base']||0);out.speedBaseTotal=base.speed;
 out.crit=Math.min(1,(base.crit||0)+(sum.crit||0)/100);out.critDmg=(base.critDmg||0)+(sum.critDmg||0)/100;
 out.speedRaw=(base.speed||0)*(1+(sum.speedPct||0)/100)+(sum.speed||0);out.speed=Math.round(out.speedRaw);
 for(const k of ['break','hit','resist','energy','pierce'])out[k]=(base[k]||0)+(sum[k]||0)/100;
 out.elementDamage=(base.elementDamage||0)+(sum.element||0)/100;
 for(const k of ['outgoing','shieldBonus','efficiency','SkillDamage','UltDamage','CounterDamage','FUADamage','DoTDamage','waterDamage'])out[k]=(base[k]||0)+(sum[k]||0)/100;
 return out;
}
export function pieceEditor(p,catalog,changed){
 const root=document.createElement('details');root.className='piece-editor';
 const summary=document.createElement('summary');summary.textContent=`Món ${p.slot+1} · Cấp ${p.level}${p.set?'':' · Chưa trang bị'}`;root.append(summary);
 const pick=(title,opts,value,fn)=>{const l=document.createElement('label');l.textContent=title;const s=document.createElement('select');s.setAttribute('aria-label',title);for(const [v,t] of opts)s.add(new Option(t,String(v)));s.value=String(value);s.onchange=()=>{fn(s.value);changed();};l.append(s);root.append(l);};
 pick('Bộ Thần Vật',[['','Chưa trang bị'],...catalog.map(r=>[r.name,r.name])],p.set,v=>p.set=v);
 pick('Cấp',Array.from({length:15},(_,i)=>[i+1,i+1]),p.level,v=>{p.level=Number(v);p.rolls=p.rolls.map((r,i)=>rollSlots(p).includes(i)?r:null);});
 pick('Chỉ số chính',Object.entries(mains[p.slot]).map(([k,v])=>[k,`${names[k]}: ${Number((v*p.level/15).toFixed(4))}`]),p.main,v=>{p.main=v;for(const s of p.subs)if(s.stat===mainSubKey(v))s.stat=Object.keys(substats).find(k=>k!==mainSubKey(v)&&!p.subs.some(x=>x.stat===k));});
 pick('Số dòng ban đầu',[[3,'3 dòng'],[4,'4 dòng']],p.initial,v=>{p.initial=Number(v);if(p.initial===3)p.rolls[0]=null;});
 const tiers=(stat)=>substats[stat].map((v,i)=>[i,`${['Thấp','Trung bình','Cao'][i]}: ${v}`]);
 p.subs.forEach((s,i)=>{
   if(i===3&&p.initial===3&&p.level<3)return;
   const line=document.createElement('div');line.className='substat-line';
   pick(`Dòng ${i+1}${i===3&&p.initial===3?' (mở ở cấp 3)':''}`,Object.keys(substats).filter(k=>k!==mainSubKey(p.main)&&(k===s.stat||!p.subs.some((x,j)=>j!==i&&x.stat===k))).map(k=>[k,names[k]]),s.stat,v=>s.stat=v);
   line.append(root.lastElementChild);
   pick(`Giá trị đầu dòng ${i+1}`,tiers(s.stat),s.tier,v=>s.tier=Number(v));
   line.append(root.lastElementChild);
   const plus=document.createElement('button');plus.type='button';plus.className='roll-plus';plus.textContent='+';plus.setAttribute('aria-label',`Nảy dòng ${i+1}`);plus.disabled=!rollSlots(p).some(j=>!p.rolls[j]);
   const menu=document.createElement('div');menu.className='roll-menu';menu.hidden=true;
   substats[s.stat].forEach((v,tier)=>{const b=document.createElement('button');b.type='button';b.textContent=`${['Min','Mid','Max'][tier]} +${v}`;b.onclick=()=>{addPieceRoll(p,i,tier);changed();};menu.append(b);});
   plus.onclick=()=>{menu.hidden=!menu.hidden;plus.setAttribute('aria-expanded',String(!menu.hidden));};line.append(plus,menu);root.append(line);
 });
 const progress=document.createElement('p');progress.className='roll-progress';progress.textContent=`Đã nảy ${rollSlots(p).filter(i=>p.rolls[i]).length}/${rollSlots(p).length} lần${p.initial===3?' · Cấp 3 dành để mở dòng thứ 4':''}`;root.append(progress);
 for(const i of rollSlots(p)){const r=p.rolls[i];if(!r)continue;const b=document.createElement('button');b.type='button';b.className='roll-chip';b.textContent=`${names[p.subs[r.line].stat]} +${substats[p.subs[r.line].stat][r.tier]} ×`;b.setAttribute('aria-label',`Hoàn tác nảy cấp ${(i+1)*3}`);b.onclick=()=>{p.rolls[i]=null;changed();};root.append(b);}
 const values=document.createElement('p');values.textContent=Object.entries(pieceStats(p)).map(([k,v])=>`${names[k]}: ${Number(v.toFixed(4))}`).join(' · ');root.append(values);return root;
}
