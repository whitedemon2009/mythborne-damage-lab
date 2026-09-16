const characters={
  Apollo:{aspect:'Mjolnir',element:'Quang',role:'DPS',atk:1450,crit:.7,critDmg:1.5},Agni:{aspect:'Mjolnir',element:'Hỏa',role:'Sub DPS',atk:1320,crit:.65,critDmg:1.4},Astraeus:{aspect:'Mjolnir',element:'Lôi',role:'Sub DPS',atk:1380,crit:.65,critDmg:1.4},Nemesis:{aspect:'Mjolnir',element:'Nham',role:'Sub DPS',atk:1400,crit:.65,critDmg:1.4},Durga:{aspect:'Aegis',element:'Phong',role:'Sustain',atk:1050,crit:.3,critDmg:.8},
  Hades:{aspect:'Pandora',element:'Ám',role:'DPS',atk:1420,crit:.55,critDmg:1.3},Prometheus:{aspect:'Pandora',element:'Hỏa',role:'Sub DPS',atk:1350,crit:.55,critDmg:1.2},Anubis:{aspect:'Pandora',element:'Lôi',role:'Support',atk:1260,crit:.5,critDmg:1.1},Hephaestus:{aspect:'Keraunos',element:'Hỏa',role:'Support',atk:1120,crit:.3,critDmg:.8},Hestia:{aspect:'Caduceus',element:'Hỏa',role:'Sustain',atk:980,crit:.2,critDmg:.7},
  Surtr:{aspect:'Vajra',element:'Hỏa Ngục',role:'DPS',atk:1480,crit:.65,critDmg:1.5},Nike:{aspect:'Keraunos',element:'Hỏa',role:'Support',atk:1080,crit:.3,critDmg:.8},Janus:{aspect:'Pandora',element:'Hỏa',role:'Support',atk:1150,crit:.35,critDmg:.9},
  Poseidon:{aspect:'Trishula',element:'Thủy Triều',role:'DPS',atk:1460,crit:.7,critDmg:1.5},Amphitrite:{aspect:'Keraunos',element:'Thủy',role:'Support',atk:1130,crit:.35,critDmg:.9},Hermes:{aspect:'Keraunos',element:'Phong',role:'Support',atk:1080,crit:.3,critDmg:.8},Hera:{aspect:'Aegis',element:'Thủy',role:'Sustain',atk:1020,crit:.25,critDmg:.8},
  Lugh:{aspect:'Fragarach',element:'Băng',role:'DPS',atk:1430,crit:.7,critDmg:1.5},Nemty:{aspect:'Keraunos',element:'Phong',role:'Support',atk:1100,crit:.3,critDmg:.8},Eris:{aspect:'Pandora',element:'Phong',role:'Support',atk:1160,crit:.35,critDmg:.9},
  Artemis:{aspect:'Gungnir',element:'Thủy',role:'DPS',atk:1450,crit:.75,critDmg:1.55},Máni:{aspect:'Keraunos',element:'Quang',role:'Support',atk:1100,crit:.3,critDmg:.8},Asclepius:{aspect:'Caduceus',element:'Quang',role:'Sustain',atk:1040,crit:.25,critDmg:.8},
  Thanatos:{aspect:'Gungnir',element:'Ám',role:'DPS',atk:1460,crit:.72,critDmg:1.5},HouYi:{aspect:'Gungnir',element:'Quang',role:'DPS',atk:1470,crit:.72,critDmg:1.55},Athena:{aspect:'Gungnir',element:'Phong',role:'DPS',atk:1440,crit:.7,critDmg:1.5},Sekhmet:{aspect:'Pandora',element:'Nham',role:'Specialist',atk:1180,crit:.4,critDmg:1},Thor:{aspect:'Vajra',element:'Lôi',role:'DPS',atk:1450,crit:.65,critDmg:1.45},Heracles:{aspect:'Vajra',element:'Phong',role:'DPS',atk:1460,crit:.68,critDmg:1.45},Ares:{aspect:'Trishula',element:'Hỏa',role:'DPS',atk:1440,crit:.68,critDmg:1.45}
};

const presets={
  'Apollo Mjolnir':['Apollo','Agni','Astraeus','Nemesis','Durga'],
  'Hades DoT':['Hades','Prometheus','Anubis','Hephaestus','Hestia'],
  'Surtr Break':['Surtr','Nike','Hephaestus','Janus','Hestia'],
  'Poseidon Thủy':['Poseidon','Amphitrite','Hermes','Hephaestus','Hera'],
  'Lugh Phản Kích':['Lugh','Nemty','Hermes','Eris','Durga'],
  'Artemis Gungnir':['Artemis','Máni','Hermes','Eris','Asclepius'],
  'Thanatos Gungnir':['Thanatos','Máni','Hermes','Hephaestus','Asclepius'],
  'Hou Yi Vạch Nhật':['HouYi','Máni','Hermes','Eris','Asclepius'],
  'Athena + Sekhmet':['Athena','Sekhmet','Hermes','Nemty','Asclepius'],
  'Thor Break AoE':['Thor','Nike','Janus','Hephaestus','Hestia'],
  'Heracles Break':['Heracles','Nike','Janus','Hermes','Hestia'],
  'Ares Planck':['Ares','Hephaestus','Hermes','Eris','Hestia']
};

const colors={Gungnir:'#78dcff',Trishula:'#be8cff',Mjolnir:'#ffbf69',Pandora:'#db6f96',Keraunos:'#75e6ad',Aegis:'#7899ff',Caduceus:'#83e1ce',Vajra:'#ff786d',Fragarach:'#a5c6ff'};
const $=s=>document.querySelector(s), fmt=n=>Math.round(n).toLocaleString('vi-VN');
let team=[];

function renderTeam(){
  $('#team').innerHTML=team.map((name,i)=>{const c=characters[name];return `<article class="member" style="--accent:${colors[c.aspect]}"><small>0${i+1} · ${c.role}</small><h3>${name==='HouYi'?'Hou Yi':name}</h3><div>${c.aspect} · ${c.element}</div><div class="stats"><span>ATK ${c.atk}</span><span>CR ${Math.round(c.crit*100)}%</span></div></article>`}).join('');
  document.querySelectorAll('.recipient').forEach(select=>{const old=select.value;select.replaceChildren(new Option('Tự động / theo chủ lực đã chọn','-1'),...team.map((n,i)=>new Option(n,String(i))));select.value=old;});
  document.querySelectorAll('.actor').forEach(select=>{const old=select.selectedIndex;select.innerHTML=team.map(n=>`<option >${n}</option>`).join('');select.selectedIndex=Math.max(0,old)});
  $('#teamRule').textContent='Đội hình tùy chọn';
}

function addAction(seed={}){
  const node=$('#actionTemplate').content.firstElementChild.cloneNode(true);$('#rotation').append(node);extendAction(node,seed);
  node.querySelector('.actor').innerHTML=team.map(n=>`<option>${n}</option>`).join('');
  for(const [key,value] of Object.entries(seed)){const el=node.querySelector('.'+key);if(el)el.value=value}
  node.querySelector('.remove').onclick=()=>{node.remove();renumber();simulate()};node.querySelectorAll('input,select').forEach(el=>el.oninput=simulate);renumber();refreshCharacterRows();simulate();
}
function renumber(){document.querySelectorAll('.action-row').forEach((row,i)=>row.querySelector('.step').textContent=String(i+1).padStart(2,'0'))}
function defenseFactor(defense,ignore){const effective=Math.max(0,defense*(1-ignore));return 1000/(1000+effective)}
function critFactor(c,mode){c={crit:c.crit||0,critDmg:c.critDmg||0};return mode==='crit'?1+c.critDmg:mode==='normal'?1:1+c.crit*c.critDmg}
function simulate(){calculateCombat();}

function loadPreset(name){team=[...presets[name]];renderTeam();$('#rotation').innerHTML='';const dps=team.find(n=>characters[n].role==='DPS')||team[0];addAction({actor:dps,source:'Chiến Kỹ',multiplier:220,targets:characters[dps].aspect==='Gungnir'?1:3,damageBonus:40,defIgnore:10,vulnerability:12});addAction({actor:dps,source:'Tuyệt Kỹ',multiplier:420,targets:['Mjolnir','Vajra'].includes(characters[dps].aspect)?5:characters[dps].aspect==='Trishula'?3:1,damageBonus:60,defIgnore:15,vulnerability:12});simulate()}

setupCombatUI();
$('#addAction').onclick=()=>addAction();document.querySelectorAll('.toolbar input,.toolbar select').forEach(el=>el.addEventListener('input',simulate));team=['Apollo','Agni','Astraeus','Nemesis','Durga'];renderTeam();

await import("./builder.js").then(m=>m.mountBuilder({characters,presets,getTeam:()=>team,renderTeam,simulate}));
