// Only one natural turn per actor is scheduled at a time.
export class Timeline {
  constructor(){this.events=[];this.serial=0;this.readySerial=0;this.time=0;}
  add(event){const e={...event,serial:this.serial++};if(e.at<=this.time)e.readyOrder=this.readySerial++;this.events.push(e);return e;}
  remove(predicate){this.events=this.events.filter(e=>!predicate(e));}
  retime(side,index,oldSpeed,newSpeed){
    for(const e of this.events)if(e.side===side&&e.index===index&&e.natural)
      e.at=this.time+Math.max(0,e.at-this.time)*oldSpeed/newSpeed;
  }
  advance(side,index,base,amount){
    for(const e of this.events)if(e.side===side&&e.index===index&&e.natural){
      e.at=Math.max(this.time,e.at-base*amount);
      if(e.at<=this.time&&e.readyOrder===undefined)e.readyOrder=this.readySerial++;
      if(e.at>this.time)delete e.readyOrder;
    }
  }
  peek(speed){
    // True simultaneous natural arrivals: allies, SPD, formation. Explicit inserts retain FIFO.
    return [...this.events].sort((a,b)=>a.at-b.at||
      ((a.readyOrder??Infinity)-(b.readyOrder??Infinity)||0)||
      this.simultaneous(a,b,speed))[0];
  }
  simultaneous(a,b,speed){
    if(a.side!==b.side)return a.side==='ally'?-1:1;
    if(!a.natural&&!b.natural)return a.serial-b.serial;
    if(a.natural!==b.natural)return a.natural?1:-1;
    return speed(b)-speed(a)||a.index-b.index;
  }
  take(speed){const e=this.peek(speed);if(e){
    this.time=e.at;
    const simultaneous=this.events.filter(x=>x.at===e.at&&x.readyOrder===undefined);
    simultaneous.sort((a,b)=>this.simultaneous(a,b,speed));
    for(const next of simultaneous)next.readyOrder=this.readySerial++;
    this.events.splice(this.events.indexOf(e),1);
  }return e;}
}
