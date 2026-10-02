"""Photos des parfums qui n'en ont pas encore, lues sur Luckyscent (images produit à fond blanc) pour les maisons les plus connues.
Entrée : data/web-resolved.json (écrit par build-index.py). Sortie : v2/img/w/*.webp et imgweb.js (window.IMGWEB, utilisé en dernier recours).
Usage : python3 tools/build-web.py [nombre_max_de_maisons]"""
import json, re, sys, io, pathlib, unicodedata, subprocess, urllib.request, time
import numpy as np
from scipy import ndimage
from PIL import Image
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower()) if not unicodedata.combining(c)))).strip()
def slug(s): return norm(s).replace(' ', '-')
top_n = int(sys.argv[1]) if len(sys.argv) > 1 else 120
info = json.loads(subprocess.check_output(['node', '-e', "global.window=global;require('./desc.js');require('./index.js');require('./imgdb.js');require('./imgnew.js');console.log(JSON.stringify({fame:window.HOUSE_FAME,db:Object.keys(window.IMGDB),nw:Object.keys(window.IMGNEW)}))"], cwd=root))
fame = {norm(h): i for i, h in enumerate(info['fame'])}
app = (root / 'v2/app.js').read_text(encoding='utf-8')
hand = {norm(k) for k in re.findall(r"'((?:[^'\\]|\\.)+)':\s*\{\s*s:\s*'img/", app)}
have = set(info['db']) | set(info['nw'])
rows = [r for r in json.loads((root / 'data/web-resolved.json').read_text(encoding='utf-8')) if r.get('image')]
import glob
for pth in glob.glob(str(root / 'data/web-raw/images-extra-*.jsonl')):
    for l in open(pth, encoding='utf-8'):
        try: j = json.loads(l)
        except Exception: continue
        # photos d'ambiance ou flacons-échantillons (flux Amouage, Jovoy-Amouage, Bon Parfumeur) : détourage médiocre, on les écarte
        if ('extra-feeds' in pth or 'extra-jovoy' in pth) and j['house'] in ('Amouage', 'Bon Parfumeur'): continue
        if j.get('image'): rows.append({'house': j['house'], 'name': j['name'], 'image': j['image'], 'extra': True})
def key(r): return norm(r['house']) + '|' + norm(r['name'])
# maisons retenues : les mieux classées d'abord (HOUSE_FAME), puis celles qui ont le plus de parfums chez Luckyscent
cnt = {}
for r in rows: cnt[norm(r['house'])] = cnt.get(norm(r['house']), 0) + 1
houses = sorted(cnt, key=lambda h: (fame.get(h, 1e6), -cnt[h]))[:top_n]
todo, _seen = [], set()
for r in rows:
    if (norm(r['house']) in houses or r.get('extra')) and key(r) not in have and norm(r['name']) not in hand and key(r) not in _seen: _seen.add(key(r)); todo.append(r)
out = root / 'v2/img/w'; out.mkdir(parents=True, exist_ok=True)
def cut(im):
    if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
        rgba = im.convert('RGBA'); al = np.asarray(rgba)[:, :, 3]
        if (al < 250).mean() > 0.05:
            ys, xs = np.where(al > 20)
            if len(ys): return rgba.crop((max(0, xs.min() - 4), max(0, ys.min() - 4), xs.max() + 5, ys.max() + 5))
        bgc = Image.new('RGB', rgba.size, (255, 255, 255)); bgc.paste(rgba, mask=rgba.split()[3]); im = bgc
    im = im.convert('RGB'); a = np.asarray(im).astype(np.int16); h, w, _ = a.shape
    bg = np.median(np.array([a[2, 2], a[2, w - 3], a[h - 3, 2], a[h - 3, w - 3]]), axis=0)
    near = np.abs(a - bg).sum(axis=2) < 18
    lab, n = ndimage.label(near); edge = set(lab[0]) | set(lab[-1]) | set(lab[:, 0]) | set(lab[:, -1]); edge.discard(0)
    keep = ~np.isin(lab, list(edge))
    keep = ndimage.binary_fill_holes(ndimage.binary_closing(keep, structure=np.ones((9, 9))))     # les étiquettes blanches ne doivent pas être mangées
    keep = ndimage.binary_opening(keep, structure=np.ones((3, 3)))
    ys, xs = np.where(keep)
    if not len(ys): return None
    rgba = np.dstack([a.astype(np.uint8), (keep * 255).astype(np.uint8)])
    return Image.fromarray(rgba).crop((max(0, xs.min() - 4), max(0, ys.min() - 4), min(w, xs.max() + 5), min(h, ys.max() + 5)))
imgweb = {}
old = root / 'imgweb.js'
if old.exists():
    m = re.search(r'IMGWEB = (\{.*?\});', old.read_text(encoding='utf-8'), re.S)
    if m: imgweb = json.loads(m.group(1))
    _deny = set()
    for _f in ('feeds', 'jovoy'):
        _p = root / f'data/web-raw/images-extra-{_f}.jsonl'
        if _p.exists():
            for _l in _p.open(encoding='utf-8'):
                try: _j = json.loads(_l)
                except Exception: continue
                if _j['house'] in ('Amouage', 'Bon Parfumeur'): _deny.add(norm(_j['house']) + '|' + norm(_j['name']))
    for _k in _deny: imgweb.pop(_k, None)
ok = fail = 0
for r in todo:
    k = key(r); fn = f'img/w/{slug(r["house"])}-{slug(r["name"])}.webp'
    if k in imgweb and (root / 'v2' / fn).exists(): continue
    try:
        b = urllib.request.urlopen(urllib.request.Request(r['image'].split('?')[0], headers={'User-Agent': 'Mozilla/5.0 SillageBot/1.0 (contact roytheo12@gmail.com)'}), timeout=30).read()
        c = cut(Image.open(io.BytesIO(b)))
        if c is None: fail += 1; continue
        c.thumbnail((480, 600)); c.save(root / 'v2' / fn, 'WEBP', quality=76, method=5); imgweb[k] = fn; ok += 1
    except Exception as e:
        fail += 1
    time.sleep(0.4)
for f in out.glob('*.webp'):
    if f'img/w/{f.name}' not in set(imgweb.values()): f.unlink()
old.write_text('// Généré par tools/build-web.py : photos produit (dernier recours, après les photos fournies).\nwindow.IMGWEB = ' + json.dumps(imgweb, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
print(f'{ok} images ajoutées, {fail} échecs, {len(imgweb)} au total ({len(todo)} à faire pour {len(houses)} maisons)')
