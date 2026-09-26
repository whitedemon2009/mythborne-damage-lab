import {normalizeElement} from './formulas.mjs';

export const isIceLightningTeam=units=>units.every(unit=>['Băng','Lôi'].includes(normalizeElement(unit.element)));

export function superconductAction(action,bonus=0){
 return {...action,elementName:'Siêu Dẫn',damageElements:['Băng','Lôi'],bonus:(action.bonus||0)+bonus};
}
