
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
