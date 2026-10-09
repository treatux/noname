"""One-off /proc sampling for cloud hosting experiments; CPU=one core percent."""
import os,time,json,sys
from pathlib import Path
output=Path(sys.argv[1]);seconds=int(sys.argv[2]) if len(sys.argv)>2 else 300
hz=os.sysconf('SC_CLK_TCK');page=os.sysconf('SC_PAGE_SIZE');previous={};start=time.monotonic()
with output.open('w') as f:
 while time.monotonic()-start<seconds:
  now=time.monotonic();rows=[]
  for p in Path('/proc').iterdir():
   if not p.name.isdigit():continue
   try:
    cmd=(p/'cmdline').read_bytes().replace(b'\0',b' ').decode(errors='replace')
    if not ('playwright_chromiumdev_profile' in cmd or '/root/noname-cloud/' in cmd):continue
    if 'measure-processes.py' in cmd:continue
    raw=(p/'stat').read_text();fields=raw[raw.rindex(')')+2:].split();ticks=int(fields[11])+int(fields[12]);rss=int(fields[21])*page
    old=previous.get(p.name);cpu=(ticks-old[0])/hz/(now-old[1])*100 if old else None;previous[p.name]=(ticks,now)
    rows.append({'pid':int(p.name),'parent':int(fields[1]),'cpu_core_percent':cpu,'rss_bytes':rss,'kind':'chromium' if 'playwright_chromiumdev_profile' in cmd else 'project','command':cmd[:180]})
   except (OSError,ValueError,IndexError):pass
  f.write(json.dumps({'elapsed':now-start,'processes':rows,'load':os.getloadavg()})+'\n');f.flush();time.sleep(5)
