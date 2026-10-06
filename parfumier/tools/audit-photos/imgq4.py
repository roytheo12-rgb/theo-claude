import json,collections,csv,subprocess
D=json.load(open('/tmp/imgq.json'));rows=D['rows'];st=D['stats']
cats=json.loads(subprocess.check_output(['node','-e',"const w=require('/tmp/loadw.js');console.log(JSON.stringify(w.PLAYLISTS.map(p=>[p.id,p.t,p.secs[0]])))"],cwd='/home/user/theo-claude/parfumier'))
catof={c[0]:c[2] for c in cats}
def verdict(f):
    if not f: return ('sans photo','aucune photo dans la base')
    f=f.replace('IMGNAME:','')
    s=st.get(f)
    if not s or 'err' in s: return ('sans photo','fichier photo absent')
    hard=[];soft=[]
    if s['trans']<0.03: hard.append('fond non détouré')
    if s['h']<260: hard.append('résolution trop basse (%d px)'%s['h'])
    elif s['h']<340: soft.append('résolution moyenne (%d px)'%s['h'])
    if s['ratio']>0.9: hard.append('format large ou coffret, flacon pas isolé')
    if s['lap']<4: hard.append('image floue')
    if s['halo2']>=0.25: hard.append('bords blancs ou irréguliers très visibles')
    elif s['halo2']>=0.12: soft.append('léger liseré blanc sur les bords')
    if s['rag']>=0.01: hard.append('contour déchiqueté')
    elif s['rag']>=0.004: soft.append('contour légèrement irrégulier')
    if hard: return ('à refaire','; '.join(hard+soft))
    if soft: return ('à améliorer','; '.join(soft))
    return ('ok','')
byp=collections.OrderedDict()
uniq={}
for pid,pt,h,n,f in rows:
    v=verdict(f); uniq[(h,n)]=v
    if v[0]!='ok': byp.setdefault((pid,pt),[]).append((h,n,v))
c=collections.Counter(v[0] for v in uniq.values()); print(c, len(uniq))
order=['Cinéma, séries & livres','Icônes','Archétypes','Destinations','Moments','Atmosphères','Effets','Spécial']
pls=sorted(byp.items(), key=lambda kv:(order.index(catof[kv[0][0]]),kv[0][0]))
tot=collections.Counter()
with open('/home/user/theo-claude/parfumier/data/photos-a-faire.csv','w',newline='',encoding='utf-8') as fh:
    w=csv.writer(fh,delimiter=';'); w.writerow(['catégorie','playlist','maison','parfum','statut','détail'])
    for (pid,pt),L in pls:
        for h,n,(s,d) in L: w.writerow([catof[pid],pt,h,n,s,d])
out=['# Photos à fournir ou à refaire, playlist par playlist\n',
 'Généré en analysant la photo réellement utilisée par l\'app pour chaque parfum des 138 playlists.\n',
 '- **Sans photo** : aucune photo n\'existe pour ce parfum.',
 '- **À refaire** : défaut visible (fond non détouré, bords blancs ou déchiquetés, image floue, résolution trop basse, coffret ou plusieurs flacons).',
 '- **À améliorer** : défaut léger (fin liseré blanc, contour un peu irrégulier, résolution moyenne).\n',
 'Pour un détourage propre : un packshot du flacon seul, fond blanc ou uni, au moins 600 px de haut, déposé dans `parfumier/incoming/` sous la forme `Maison_Nom.jpg`.\n',
 '**Sur les %d parfums uniques des playlists : %d sans photo, %d à refaire, %d à améliorer, %d corrects.**\n'%(len(uniq),c['sans photo'],c['à refaire'],c['à améliorer'],c['ok'])]
cur=None
for (pid,pt),L in pls:
    ct=catof[pid]
    if ct!=cur: out.append('\n## %s\n'%ct); cur=ct
    nm=collections.Counter(s for _,_,(s,_) in L)
    out.append('\n### %s (%s)\n'%(pt,', '.join('%d %s'%(v,k) for k,v in nm.items())))
    for lab in ('sans photo','à refaire','à améliorer'):
        sel=[(h,n,d) for h,n,(s,d) in L if s==lab]
        if sel:
            out.append('**%s**'%lab.capitalize())
            for h,n,d in sel: out.append('- %s %s%s'%(h,n,(' (%s)'%d) if lab!='sans photo' else ''))
            out.append('')
open('/home/user/theo-claude/parfumier/data/photos-a-faire.md','w',encoding='utf-8').write('\n'.join(out))
# liste unique triée par visibilité
vis=collections.Counter((h,n) for _,_,h,n,_ in rows)
u=[(vis[k],k,v) for k,v in uniq.items() if v[0]!='ok']
u.sort(key=lambda x:(-x[0],x[1]))
json.dump([[a,b[0],b[1],c[0],c[1]] for a,b,c in u],open('/tmp/uniq_list.json','w'))
print(len(pls),'playlists concernées', sum(len(L) for _,L in pls),'lignes')
