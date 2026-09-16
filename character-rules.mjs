// Explicit user clarifications. A value written in a kit always wins, including zero.
export function actionToughness(source, aspect, explicit) {
 if (explicit !== undefined && explicit !== null) return explicit;
 if (source === 'Basic') return 30;
 if (source === 'Skill') return 60;
 if (source === 'Ult') return ['Vajra', 'Gungnir'].includes(aspect) ? 120 : 90;
 if (source === 'FUA') return 20;
 return 0;
}

// Snapshot once at entry. Later Energy changes must not recalculate this bonus.
export function apolloEntryCrit(currentEnergy) {
 return Math.min(.2, Math.max(0, currentEnergy - 150) / 5 * .01);
}
