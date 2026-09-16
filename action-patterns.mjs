export const actionPatterns=[
 {id:'inherit',label:'Theo chuỗi đã thiết lập',sequence:null},
 {id:'basic-skill',label:'BA → Skill',sequence:['Basic','Skill']},
 {id:'skill-basic',label:'Skill → BA',sequence:['Skill','Basic']},
 {id:'skill',label:'Luôn Skill',sequence:['Skill']},
 {id:'skill-basic-basic',label:'Skill → BA → BA',sequence:['Skill','Basic','Basic']},
 {id:'skill-skill-basic',label:'Skill → Skill → BA',sequence:['Skill','Skill','Basic']},
 {id:'basic',label:'Luôn BA — tạo Planck',sequence:['Basic']},
];

export function patternedAction(unit,input,dynamic){
 if(!dynamic||!unit.kitEnabled||!unit.kitPattern||unit.kitPattern==='inherit')return input;
 const pattern=actionPatterns.find(p=>p.id===unit.kitPattern);
 if(!pattern)throw Error(`${unit.name}: xu hướng hành động không hợp lệ.`);
 const kitAction=pattern.sequence[(unit.turn-1)%pattern.sequence.length];
 return {actor:unit.index,kitAction,source:kitAction,realTurn:true,row:input.row,target:input.target??0,recipient:input.recipient??-1,kitVariant:input.kitVariant??0,fallbackBasic:true,athenaExtra:input.athenaExtra,preserveDurations:input.preserveDurations};
}
