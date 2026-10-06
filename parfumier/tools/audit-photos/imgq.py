import json,subprocess,os,sys,collections
import numpy as np
from PIL import Image
js=r"""
const w=require('/tmp/loadw.js');const fs=require('fs');
for(const f of ['imgnew','imgdb','imgweb']) try{require('vm').runInContext(fs.readFileSync(f+'.js','utf8'),w)}catch(e){}
const n=w.Engine.norm,HA=w.HOUSE_ALIAS||{};
const app=fs.readFileSync('v2/app.js','utf8');const m=app.match(/const IMG = \{([\s\S]*?)\n  \};/)[1];
const IMG={};for(const x of m.matchAll(/'((?:[^'\\]|\\.)+)': \{ s: '([^']+)'/g))IMG[n(x[1].replace(/\\'/g,"'"))]=x[2];
const STOP=new Set(['eau','de','du','des','la','le','les','l','d','parfum','parfums','edp','edt','xj','the','pour','homme','femme','intense','extrait','cologne']);
const loose=x=>n(x).split(' ').filter(t=>t&&!STOP.has(t)).sort().join(' ');
const L={};for(const src of [w.IMGDB,w.IMGWEB])for(const k in src){const i=k.indexOf('|');const lk=k.slice(0,i)+'|'+loose(k.slice(i+1));if(!(lk in L))L[lk]=src[k];}
const res={};
function find(h,nm){const hn=n(h),al=n(HA[hn]||h),nn=n(nm);
  return w.IMGNEW[hn+'|'+nn]||w.IMGNEW[al+'|'+nn]||(IMG[nn]&&'IMGNAME:'+IMG[nn])||w.IMGDB[hn+'|'+nn]||w.IMGWEB[hn+'|'+nn]||w.IMGDB[al+'|'+nn]||w.IMGWEB[al+'|'+nn]||L[hn+'|'+loose(nm)]||L[al+'|'+loose(nm)]||null;}
const rows=[];
w.PLAYLISTS.forEach(p=>p.ps.forEach(x=>{if(!x.h)return;rows.push([p.id,p.t,x.h,x.n,find(x.h,x.n)]);}));
console.log(JSON.stringify(rows));
"""
open('/tmp/imgq.js','w').write(js)
rows=json.loads(subprocess.check_output(['node','/tmp/imgq.js'],cwd='/home/user/theo-claude/parfumier'))
print(len(rows),'lignes',len({(r[2],r[3]) for r in rows}),'parfums uniques')
files={r[4].replace('IMGNAME:','') for r in rows if r[4]}
print(len(files),'fichiers distincts')
stats={}
for f in files:
    p='v2/'+f
    if not os.path.exists(p): stats[f]={'err':'fichier absent'};continue
    im=Image.open(p).convert('RGBA'); a=np.asarray(im); h,w=a.shape[:2]; al=a[...,3]
    opaque=(al>200).mean(); trans=(al<20).mean()
    ys,xs=np.where(al>40)
    bb=(xs.min(),ys.min(),xs.max(),ys.max()) if len(ys) else (0,0,0,0)
    fill=((bb[2]-bb[0])*(bb[3]-bb[1]))/(w*h) if len(ys) else 0
    edge=int(bb[1]<=1)+int(bb[3]>=h-2)+int(bb[0]<=1)+int(bb[2]>=w-2)
    # fond: pixels opaques proches du blanc ou grande zone uniforme aux bords
    rgb=a[...,:3].astype(int)
    border=np.concatenate([rgb[0],rgb[-1],rgb[:,0],rgb[:,-1]]); balpha=np.concatenate([al[0],al[-1],al[:,0],al[:,-1]])
    bordopaque=(balpha>200).mean()
    # halo clair : pixels semi-transparents ou bords blancs
    semi=((al>20)&(al<235)).mean()
    # netteté
    g=(rgb.mean(axis=2)*(al>40)); lap=np.abs(np.diff(g,axis=0)).mean()+np.abs(np.diff(g,axis=1)).mean()
    stats[f]={'w':w,'h':h,'opaque':round(opaque,3),'trans':round(trans,3),'fill':round(fill,2),'edge':edge,'bord':round(bordopaque,2),'semi':round(semi,3),'lap':round(float(lap),2)}
json.dump({'rows':rows,'stats':stats},open('/tmp/imgq.json','w'))
import statistics
for k in ['w','h','opaque','trans','fill','edge','bord','semi','lap']:
    v=[s[k] for s in stats.values() if k in s]; print(k, min(v), statistics.median(v), max(v))
print(collections.Counter(f.split('/')[1] if '/' in f else f for f in files))
