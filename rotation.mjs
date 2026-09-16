// Rotation choices change player decisions only; character rules stay in their runtimes.
export const rotationKey=(actor,turn)=>`${actor}:${turn}`;
export const rotationTeam=roster=>roster.map(u=>u.characterId||u.name).join('|');
export function validateRotation(plan,roster){
 if(!plan?.enabled)return;
 if(plan.team!==rotationTeam(roster))throw Error('Rotation thuộc đội hình khác. Hãy tạo lịch cho đội hiện tại.');
 for(const [key,choice] of Object.entries(plan.turns||{})){
  if(!/^\d+:\d+$/.test(key)||!['Basic','Skill','Wait'].includes(choice.kitAction))throw Error('Lựa chọn lượt không hợp lệ.');
  if(!Number.isInteger(choice.target)||choice.target<0||choice.target>4||!Number.isInteger(choice.recipient)||choice.recipient< -1||choice.recipient>=roster.length)throw Error('Mục tiêu trong rotation không hợp lệ.');
 }
}
export function rotationAction(plan,u,input){
 const choice=plan?.enabled&&plan.turns?.[rotationKey(u.index,u.turn)];if(!choice)return input;
 if(choice.kitAction==='Wait')return {actor:u.index,source:'Wait',realTurn:true,cost:0,refund:0,energy:0,row:input.row,preserveDurations:input.preserveDurations};
 return {actor:u.index,kitAction:choice.kitAction,realTurn:true,row:input.row,target:choice.target,recipient:choice.recipient,kitVariant:choice.kitVariant||0,fallbackBasic:choice.fallbackBasic!==false,athenaExtra:input.athenaExtra,preserveDurations:input.preserveDurations};
}
export function allowsUltimate(policy,{u,action,moment,units,enhanced}){
 if(!policy)return true;
 if(policy.mode==='manual')return false;
 if(policy.mode==='full'&&action.variant===1)return false;
 if(policy.mode==='reserve'&&u.currentEnergy-action.energyCost<Number(policy.reserve||0))return false;
 if(policy.mode==='effect'){
  const target=units[policy.who??u.index];
  if(!policy.effect?.trim()||!target?.effects.some(e=>(e.characterKey||e.gearKey||e.name)===policy.effect.trim()))return false;
 }
 if(policy.mode==='enhanced'&&!enhanced())return false;
 if(policy.mode==='beforeAlly'||policy.mode==='afterAlly'){
  if(moment?.phase!==(policy.mode==='beforeAlly'?'beforeTurn':'afterTurn')||moment.actor!==Number(policy.who)||moment.turn<Number(policy.turn||1))return false;
  if(u.lastPolicyMoment===moment.key)return false;
 }
 return true;
}
export function rotationMetrics(result){
 return {total:Object.values(result.totals||{}).reduce((a,b)=>a+b,0),perVeyr:{...result.totals},planck:result.planck,energy:result.units.map(u=>u.currentEnergy),toughness:result.enemies.map(t=>t.toughness),turns:result.units.map(u=>u.turn),breaks:result.log.filter(e=>e.type==='break').length};
}
