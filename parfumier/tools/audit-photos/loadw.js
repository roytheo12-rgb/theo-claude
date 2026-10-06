const vm=require('vm'),fs=require('fs');
process.chdir('/home/user/theo-claude/parfumier');
const w={console};w.window=w;w.self=w;vm.createContext(w);
for(const f of ['data','index','fiches','enrich','facts','profils','descintel','editorial','expert','bios','playlists','desc','tips','engine'])try{vm.runInContext(fs.readFileSync(f+'.js','utf8'),w)}catch(e){console.error(f,e.message.slice(0,100))}
module.exports=w;
