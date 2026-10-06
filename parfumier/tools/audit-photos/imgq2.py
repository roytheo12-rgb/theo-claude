import json,os,numpy as np,collections
from PIL import Image
from scipy import ndimage
D=json.load(open('/tmp/imgq.json'));stats=D['stats']
for f,s in stats.items():
    if 'err' in s: continue
    a=np.asarray(Image.open('v2/'+f).convert('RGBA')); al=a[...,3]; rgb=a[...,:3].astype(int)
    solid=al>200; empty=al<20
    # bord du sujet : pixels opaques voisins de transparents
    er=ndimage.binary_erosion(solid,iterations=2); rim=solid&~er&ndimage.binary_dilation(empty,iterations=3)
    if rim.sum()>30:
        br=rgb[rim].min(axis=1)  # tous canaux >235 => blanc
        s['halo']=round(float((br>228).mean()),2)
    else: s['halo']=0
    s['ratio']=round(s['w']/s['h'],2)
json.dump(D,open('/tmp/imgq.json','w'))
c=collections.Counter()
for f,s in stats.items():
    if 'err' in s: c['absent']+=1;continue
    if s['trans']<0.03: c['non detoure']+=1
    if s['h']<300: c['petite']+=1
    if s['ratio']>1.0: c['large']+=1
    if s['halo']>0.25: c['halo']+=1
    if s['lap']<4: c['flou']+=1
print(c, len(stats))
