"""Détoure les photos de incoming/ et les rattache aux parfums de la base.
Entrée : data/imgmap.txt (via resolve-img.js). Sortie : v2/img/db/*.webp et imgdb.js (window.IMGDB : "maison|nom" normalisés -> fichier)."""
import json, re, subprocess, pathlib, unicodedata, sys, os
import numpy as np
from scipy import ndimage
from PIL import Image, ImageFilter
root = pathlib.Path(__file__).resolve().parent.parent
res = json.loads(subprocess.check_output(['node', str(root/'tools/resolve-img.js')]))
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower()) if not unicodedata.combining(c)))).strip()  # identique à Engine.norm
app = (root/'v2/app.js').read_text()
have = {norm(k) for k in re.findall(r"'((?:[^'\\]|\\.)+)':\s*\{\s*s:\s*'img/", app)}  # déjà détourées à la main
out_dir = root/'v2/img/db'; out_dir.mkdir(parents=True, exist_ok=True)
for f in out_dir.glob('*.webp'): f.unlink()  # reconstruction complète
skip = {l.strip() for l in (root/'data/imgskip.txt').read_text().splitlines() if l.strip() and not l.startswith('#')}
db, done, skipped = {}, set(), []
TOL = int(os.environ.get('TOL', 38))
def cut(src):
    im = Image.open(src).convert('RGB'); im.thumbnail((900, 900)); a = np.asarray(im).astype(np.int16); h, w, _ = a.shape
    corners = np.array([a[2, 2], a[2, w-3], a[h-3, 2], a[h-3, w-3]]); bg = np.median(corners, axis=0)
    if corners.max(axis=0).sum() - corners.min(axis=0).sum() > 40: return None, 'fond non uni'
    near = (np.abs(a - bg).sum(axis=2) < TOL)
    # on ne retire que le fond relié aux bords (l'intérieur d'un flacon clair reste)
    lab, n = ndimage.label(near); edge = set(lab[0]) | set(lab[-1]) | set(lab[:, 0]) | set(lab[:, -1]); edge.discard(0)
    seen = np.isin(lab, list(edge))
    keep = ~seen
    # 2e passe : photo carrée sur fond gris posée sur un fond blanc (on retire aussi ce carré)
    ys, xs = np.where(keep)
    if len(ys):
        y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
        cs = [(y0+2, x0+2), (y0+2, x1-2), (y1-2, x0+2), (y1-2, x1-2)]; cc = np.array([a[c] for c in cs])
        if cc.max(axis=0).sum() - cc.min(axis=0).sum() < 60 and np.abs(cc.mean(axis=0) - bg).sum() > 12:
            bg2 = np.median(cc, axis=0); near2 = (np.abs(a - bg2).sum(axis=2) < 60) & keep
            lab2, _ = ndimage.label(near2); ids = {lab2[c] for c in cs}; ids.discard(0)
            if ids: keep = keep & ~np.isin(lab2, list(ids))
    keep = ndimage.binary_fill_holes(ndimage.binary_closing(keep, iterations=5))
    lab3, n3 = ndimage.label(keep)
    if n3 > 1:  # on garde le flacon (et ses grosses pièces), pas les débris d'ombre
        sizes = ndimage.sum(keep, lab3, range(1, n3+1)); keep = np.isin(lab3, [i+1 for i, z in enumerate(sizes) if z >= 0.08*sizes.max()])
    frac = keep.mean()
    if frac < 0.04 or frac > 0.8: return None, f'détourage douteux ({frac:.0%})'
    m = Image.fromarray((keep*255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
    rgba = im.copy(); rgba.putalpha(m); bb = rgba.getbbox()
    if not bb: return None, 'vide'
    pad = 4; bb = (max(0, bb[0]-pad), max(0, bb[1]-pad), min(w, bb[2]+pad), min(h, bb[3]+pad)); rgba = rgba.crop(bb)
    al = np.asarray(rgba.split()[3]); ch, cw = al.shape; k = max(3, min(ch, cw)//30)
    if sum(al[y:y+k, x:x+k].mean() > 200 for y in (0, ch-k) for x in (0, cw-k)) >= 3: return None, 'photo carrée (fond non retiré)'
    rgba.thumbnail((420, 560)); return rgba, None
for r in res:
    if r['status'] != 'ok': skipped.append((r['file'], 'absent de la base')); continue
    key = norm(r['house'])+'|'+norm(r['name'])
    if key in db or norm(r['name']) in have: continue
    print(r['file'], flush=True); img, err = cut(root/'incoming'/r['file'])
    if img is None: skipped.append((r['file'], err)); continue
    slug = re.sub(r'[^a-z0-9]+', '-', norm(r['house']+' '+r['name'])).strip('-')[:60]
    if slug in skip: skipped.append((r['file'], 'détourage à refaire (imgskip.txt)')); continue
    img.save(out_dir/f'{slug}.webp', 'WEBP', quality=84, method=6); db[key] = f'img/db/{slug}.webp'
(root/'imgdb.js').write_text('window.IMGDB = ' + json.dumps(db, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(db), 'images rattachées;', len(skipped), 'ignorées'); [print('  -', *s) for s in skipped]
print('poids img/db :', sum(f.stat().st_size for f in out_dir.glob('*.webp'))//1024, 'Ko')
