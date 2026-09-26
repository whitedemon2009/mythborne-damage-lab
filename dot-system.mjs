export const dotStacks=dot=>dot.stackDurations?.length??dot.stacks??1;

export function addDot(target,incoming){
 const match=dot=>dot.name===incoming.name&&(!incoming.separateByOwner||dot.owner===incoming.owner);
 const old=target.dots.find(match);
 if(incoming.independentDurations){
  const durations=[...(old?.stackDurations||[]),incoming.duration].slice(-(incoming.maxStacks||Infinity));
  const next={...old,...incoming,stacks:durations.length,stackDurations:durations,duration:Math.max(...durations)};
  target.dots=target.dots.filter(dot=>!match(dot));target.dots.push(next);return next;
 }
 const stacks=incoming.maxStacks?Math.min(incoming.maxStacks,(old?.stacks||0)+(incoming.stacks||1)):1;
 const next={...old,...incoming,stacks,duration:incoming.duration};
 target.dots=target.dots.filter(dot=>!match(dot));target.dots.push(next);return next;
}

export function elapseDot(dot){
 if(dot.stackDurations){
  dot.stackDurations=dot.stackDurations.map(n=>n-1).filter(n=>n>0);
  dot.stacks=dot.stackDurations.length;dot.duration=dot.stackDurations.length?Math.max(...dot.stackDurations):0;
 }else dot.duration--;
 return dot.duration>0&&dotStacks(dot)>0;
}
