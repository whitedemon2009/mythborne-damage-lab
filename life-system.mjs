import {clamp} from './formulas.mjs';

export function spendHP(unit,value,floor=1){
 const lost=Math.min(Math.max(0,unit.currentHP-floor),Math.max(0,value));
 unit.currentHP-=lost;return lost;
}

export function reviveState(unit,{hpFraction=.5,energy=0}={}){
 if(unit.currentHP>0)return false;
 unit.currentHP=Math.max(1,unit.hp*hpFraction);
 unit.currentEnergy=clamp(energy,0,unit.energyCap);
 unit.effects=[];unit.shields=[];unit.shieldDurations=[];unit.shieldLayers=[];
 return true;
}
