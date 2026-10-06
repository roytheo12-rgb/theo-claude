import json,numpy as np
from PIL import Image
from scipy import ndimage
D=json.load(open('/tmp/imgq.json'));st=D['stats']
for f,s in st.items():
    if 'err' in s: continue
    a=np.asarray(Image.open('v2/'+f).convert('RGBA')); al=a[...,3]; rgb=a[...,:3].astype(int)
    solid=al>128
    mn=rgb.min(axis=2)
    white=(mn>225)&solid
    e2=ndimage.binary_erosion(solid,iterations=2); e6=ndimage.binary_erosion(solid,iterations=6); e14=ndimage.binary_erosion(solid,iterations=14)
    rim=solid&~e2; inner=e6&~e14
    rw=white[rim].mean() if rim.sum()>20 else 0; iw=white[inner].mean() if inner.sum()>20 else rw
    s['halo2']=round(float(rw-iw),2)
    area=solid.sum()
    cl=ndimage.binary_closing(solid,iterations=3).sum(); op=ndimage.binary_opening(solid,iterations=3).sum()
    s['rag']=round(float((cl-op)/max(area,1)),3)
json.dump(D,open('/tmp/imgq.json','w'))
import collections
v=sorted(s['halo2'] for s in st.values() if 'halo2' in s); print('halo2 quantiles',[v[int(len(v)*q)] for q in (.5,.75,.9,.95)])
v=sorted(s['rag'] for s in st.values() if 'rag' in s); print('rag quantiles',[v[int(len(v)*q)] for q in (.5,.75,.9,.95)])
