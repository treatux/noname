import fs from 'node:fs/promises';
const root='/root/noname-cloud/evidence';
const percentile=(values,p)=>{const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);if(!sorted.length)return null;const i=(sorted.length-1)*p;return sorted[Math.floor(i)]+(sorted[Math.ceil(i)]-sorted[Math.floor(i)])*(i%1);};
const stats=values=>({samples:values.filter(Number.isFinite).length,p50:percentile(values,.5),p95:percentile(values,.95),p99:percentile(values,.99),max:values.length?Math.max(...values.filter(Number.isFinite)):null});
const output={created:new Date().toISOString(),experiments:{}};
for(const label of ['perf-one','perf-three']){
 const boundary=JSON.parse(await fs.readFile(`${root}/${label}-boundary.json`,'utf8'));
 const rows=(await fs.readFile(`${root}/${label}-processes.jsonl`,'utf8')).trim().split('\n').map(x=>JSON.parse(x));
 const experiment={boundary,elapsedSeconds:rows.at(-1).elapsedMs/1000,processSamples:rows.length,aggregate:{},rooms:{}};
 for(const kind of ['host','client'])experiment.aggregate[kind]={cpuCorePercent:stats(rows.map(row=>Object.values(row.trees).reduce((n,t)=>n+(t[kind].cpuCorePercent??0),0)).slice(1)),rssMiB:stats(rows.map(row=>Object.values(row.trees).reduce((n,t)=>n+t[kind].rssBytes,0)/1048576))};
 for(const run of boundary.runs){
  const data=JSON.parse(await fs.readFile(`${root}/${run}-metrics.json`,'utf8'));
  const samples=JSON.parse(await fs.readFile(`${root}/${run}-samples.json`,'utf8'));
  const network=samples.length>1?{elapsedSeconds:(samples.at(-1).elapsed-samples[0].elapsed)/1000,sentBytes:samples.at(-1).network.sent-samples[0].network.sent,receivedBytes:samples.at(-1).network.received-samples[0].network.received}:null;
  if(network)network.logicalBytesPerSecond=(network.sentBytes+network.receivedBytes)/network.elapsedSeconds;
  experiment.rooms[run]={aiDecisionMs:stats(data.host.metrics.ai.map(x=>x.ms)),aiByMethod:Object.fromEntries(['chooseButton','chooseCard','chooseTarget'].map(name=>[name,stats(data.host.metrics.ai.filter(x=>x.name===name).map(x=>x.ms))])),animationWaitMs:stats(data.host.metrics.animation.map(x=>x.ms)),animationRequestedMs:stats(data.host.metrics.animation.map(x=>x.requestedMs)),eventWallMs:Object.fromEntries(['phase','useCard','damage','chooseToUse'].map(name=>[name,stats(data.host.metrics.events.filter(x=>x.name===name).map(x=>x.ms))])),applicationRttMs:stats(data.client.metrics.rtt.map(x=>x.ms)),unansweredRtt:Object.keys(data.client.metrics.pending).length,network,round:data.host.round,over:data.host.over};
 }
 output.experiments[label]=experiment;
}
await fs.writeFile(`${root}/performance-summary.json`,JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2));
