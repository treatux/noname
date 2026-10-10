// Measurement-only wrappers: preserve rules, arguments and return values.
export async function installMetrics() {
 const {game,ai,lib,_status}=await import('/noname.js');
 const metrics=window.roomMetrics={started:performance.now(),ai:[],animation:[],events:[],rtt:[],pending:{},sequence:0};
 const push=(list,row)=>{if(list.length<100000)list.push(row);};
 for(const name of ['chooseButton','chooseCard','chooseTarget']) {
  const original=ai.basic[name];
  ai.basic[name]=function(...args){const start=performance.now();try{return original.apply(this,args);}finally{push(metrics.ai,{name,ms:performance.now()-start,event:_status.event?.name});}};
 }
 const originalDelay=game.delay;
 game.delay=function(...args){const start=performance.now();const result=originalDelay.apply(this,args);const requested=(args[0]??1)*lib.config.duration+(args[1]??0);if(result?.then)result.then(()=>push(metrics.animation,{ms:performance.now()-start,requestedMs:lib.config.game_speed==='vvfast'?requested/3:requested}));return result;};
 // Event.loop wall time includes nested child events, network and animation waits.
 // It must not be interpreted as exclusive AI CPU time or summed across nesting.
 const proto=lib.element.GameEvent?.prototype;
 if(proto?.loop){const original=proto.loop;proto.loop=async function(...args){const start=performance.now();try{return await original.apply(this,args);}finally{if(['phase','useCard','damage','chooseToUse'].includes(this.name))push(metrics.events,{name:this.name,ms:performance.now()-start,player:this.player?.name});}};}
 lib.message.server.cloudMeasure=function(sequence){this.send(function(sequence){const m=window.roomMetrics;const start=m?.pending[sequence];if(start!==undefined){m.rtt.push({ms:performance.now()-start,sequence});delete m.pending[sequence];}},sequence);};
}
export async function installClientMetrics() {
 window.roomMetrics={rtt:[],pending:{},sequence:0};
 const {game}=await import('/noname.js');
 window.roomMetricTimer=setInterval(()=>{if(!game.onlineID||!game.ws||game.ws.readyState!==1)return;const m=window.roomMetrics;const id=++m.sequence;m.pending[id]=performance.now();game.send('cloudMeasure',id);},2000);
}
export async function collectMetrics(){const {game,_status}=await import('/noname.js');return {metrics:window.roomMetrics,network:window.cloudNet,round:game.roundNumber,event:_status.event?.name,over:!!_status.over};}
