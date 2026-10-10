// One-off Linux /proc measurement for isolated Chromium process trees.
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const [label,...runs]=process.argv.slice(2);
if(!label||!runs.length)throw new Error('Usage: perf-sample.mjs <label> <runName>...');
const dir='/root/noname-cloud/evidence';
const hz=Number(execFileSync('getconf',['CLK_TCK'],{encoding:'utf8'}));
const pageSize=Number(execFileSync('getconf',['PAGESIZE'],{encoding:'utf8'}));
const duration=Number(process.env.PERF_SECONDS||180);
const waitEnd=Date.now()+180000;
while(true){let ready=true;for(const run of runs){try{await fs.access(`${dir}/${run}-ready.json`);}catch{ready=false;}}if(ready)break;if(Date.now()>waitEnd)throw new Error('Room readiness timeout');await new Promise(r=>setTimeout(r,1000));}
const roots={};for(const run of runs){const p=JSON.parse(await fs.readFile(`${dir}/${run}-processes.json`,'utf8'));roots[run]={host:p.host.find(x=>x.type==='browser').id,client:p.client.find(x=>x.type==='browser').id};}
const out=await fs.open(`${dir}/${label}-processes.jsonl`,'w');
const start=performance.now(),previous=new Map();
await fs.writeFile(`${dir}/${label}-boundary.json`,JSON.stringify({runs,roots,hz,pageSize,duration,started:new Date().toISOString(),cpuBasis:'100%=one logical core',rssBoundary:'sum per-process RSS; shared pages double counted',networkBoundary:'game WebSocket logical UTF-8 payload bytes in per-room metrics; not NIC/IP/TLS wire traffic'},null,2));
while(performance.now()-start<duration*1000){
 const time=performance.now();const table=new Map();
 for(const pid of await fs.readdir('/proc')){if(!/^\d+$/.test(pid))continue;try{const raw=await fs.readFile(`/proc/${pid}/stat`,'utf8');const f=raw.slice(raw.lastIndexOf(')')+2).split(' ');const ticks=Number(f[11])+Number(f[12]);const prior=previous.get(pid);const cpu=prior?(ticks-prior.ticks)/hz/((time-prior.time)/1000)*100:null;previous.set(pid,{ticks,time});table.set(Number(pid),{pid:Number(pid),parent:Number(f[1]),cpu,rssBytes:Number(f[21])*pageSize});}catch{}}
 const trees={};for(const [run,p]of Object.entries(roots)){trees[run]={};for(const [kind,root]of Object.entries(p)){const ids=new Set([root]);let changed=true;while(changed){changed=false;for(const row of table.values())if(ids.has(row.parent)&&!ids.has(row.pid)){ids.add(row.pid);changed=true;}}
 const rows=[...ids].map(id=>table.get(id)).filter(Boolean);trees[run][kind]={root,processCount:rows.length,cpuCorePercent:rows.every(p=>p.cpu===null)?null:rows.reduce((n,p)=>n+(p.cpu||0),0),rssBytes:rows.reduce((n,p)=>n+p.rssBytes,0),processes:rows};}}
 const load=await fs.readFile('/proc/loadavg','utf8');await out.write(JSON.stringify({elapsedMs:time-start,trees,load:load.trim()})+'\n');await new Promise(r=>setTimeout(r,2000));
}
await out.close();console.log('Saved',label);
