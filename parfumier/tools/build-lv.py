"""Intègre les captures Louis Vuitton déposées dans incoming/ (flacon sur fond dégradé gris) : recadrage, détourage tolérant, webp, enregistrement dans imgweb.js.
Les noms sont ceux écrits sur chaque capture (ordre alphabétique des fichiers). Usage : python3 tools/build-lv.py"""
import json, re, glob, pathlib, unicodedata
import numpy as np
from scipy import ndimage
from PIL import Image
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower()) if not unicodedata.combining(c)))).strip()
NAMES = ["Imagination","L'Immensité","Ombre Nomade","Attrape-Rêves","Tea Storm","Ink Mark","Moon Tale","Ambre Levant","Ombre Nomade","Fleur du Désert","Les Sables Roses","Pur Santal","Pur Santal","Pur Oud","Pur Ambre","Nuit de Feu","Afternoon Swim","Pacific Chill","Sun Song","California Dream","City of Stars","On the Beach","eLVes","Spell on You","Attrape-Rêves","Heures d'Absence","Le Jour Se Lève","Rose des Vents","Cœur Battant","Étoile Filante","Apogée","Matière Noire","Imagination","L'Immensité","LV Lovers","Météore","Orage","Nouveau Monde","Sur La Route","Fantasmagory","Symphony","Stellar Times","Dancing Blossom","Myriad","Cosmic Cloud","Rhapsody"]
files = sorted(glob.glob(str(root / 'incoming/Capture*')))[:46]    # les 46 premières captures (16 h 11 à 16 h 17)
assert len(files) == len(NAMES), (len(files), len(NAMES))
def cut(im):
    im = im.convert('RGB').crop((70, 75, 560, 610))
    a = np.asarray(im).astype(np.float32); h, w, _ = a.shape
    g = ndimage.gaussian_filter(a, (1.2, 1.2, 0))
    # fond = zone connexe reliée au bord où le dégradé varie lentement (pas de contour net)
    gy = np.abs(np.diff(g, axis=0, prepend=g[:1])).sum(2); gx = np.abs(np.diff(g, axis=1, prepend=g[:, :1])).sum(2)
    smooth = (gx < 3.2) & (gy < 3.2)
    lum = g.mean(2); ref = np.median(np.concatenate([lum[:6].ravel(), lum[:, :6].ravel(), lum[:, -6:].ravel()]))
    cand = smooth & (np.abs(g - np.median(g[:6].reshape(-1, 3), 0)).sum(2) < 120)
    lab, n = ndimage.label(cand); edge = set(lab[0]) | set(lab[:, 0]) | set(lab[:, -1]); edge.discard(0)
    bg = np.isin(lab, list(edge))
    keep = ~bg
    keep = ndimage.binary_opening(keep, structure=np.ones((5, 5)))
    lab2, n2 = ndimage.label(keep)
    if n2 > 1:
        sizes = ndimage.sum(keep, lab2, range(1, n2 + 1)); keep = lab2 == (1 + int(np.argmax(sizes)))
    keep = ndimage.binary_fill_holes(ndimage.binary_closing(keep, structure=np.ones((7, 7))))
    alpha = ndimage.gaussian_filter(keep.astype(np.float32), 1.0)
    ys, xs = np.where(keep)
    out = Image.fromarray(np.dstack([a.astype(np.uint8), (alpha * 255).astype(np.uint8)]))
    return out.crop((max(0, xs.min() - 4), max(0, ys.min() - 4), min(w, xs.max() + 5), min(h, ys.max() + 5)))
(root / 'v2/img/p').mkdir(parents=True, exist_ok=True)
shots_p = root / 'data/imgshots.json'
shots = json.loads(shots_p.read_text(encoding='utf-8')) if shots_p.exists() else {}
ALIAS = {'Cœur Battant': ['Coeur Battant'], 'Météore': ['Meteore'], 'Sur La Route': ['Sur la Route']}
seen = set()
for f, nm in zip(files, NAMES):
    if nm in seen: continue
    seen.add(nm)
    c = cut(Image.open(f)); c.thumbnail((480, 600))
    fn = 'img/p/louis-vuitton-' + norm(nm).replace(' ', '-') + '.webp'
    c.save(root / 'v2' / fn, 'WEBP', quality=80, method=5)
    for n in [nm] + ALIAS.get(nm, []): shots['louis vuitton|' + norm(n)] = fn
shots_p.write_text(json.dumps(shots, ensure_ascii=False, indent=0), encoding='utf-8')
print(len(seen), 'LV')
