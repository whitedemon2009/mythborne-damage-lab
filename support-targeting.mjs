const carryAspects=new Set(['Gungnir','Mjolnir','Trishula','Fragarach','Vajra','Pandora']);

// -1 means follow the character's preference, or choose automatically when
// that preference is also -1. Explicit per-turn targets always win.
export function supportRecipient(actor,units,requested,scores){
 const preference=requested===-1||requested===undefined?actor.kitRecipient:requested;
 if(preference!==undefined&&preference!==-1)return preference;
 const alive=units.filter(u=>u.index!==actor.index&&u.currentHP>0);
 const carries=alive.filter(u=>carryAspects.has(u.aspect));
 const candidates=carries.length?carries:alive;
 return [...candidates].sort((a,b)=>(scores?.[b.index]||0)-(scores?.[a.index]||0)||a.index-b.index)[0]?.index??actor.index;
}

export function needsSupportPreview(roster,actions,rotation){
 return roster.some(u=>u.kitRecipient===-1)||actions.some(a=>a.recipient===-1)||Object.values(rotation?.turns||{}).some(a=>a.recipient===-1)||Object.values(rotation?.ultimates||{}).some(a=>a.recipient===-1);
}
