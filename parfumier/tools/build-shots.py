"""Intègre les captures de pages produit Frédéric Malle et Hermès déposées dans incoming/ (captures de 16 h 58 à 17 h 13) :
recadrage sur la photo, détourage du fond de studio, webp dans v2/img/p, clés dans data/imgshots.json (lu par build-png.py, prioritaire dans l'app).
Les noms sont ceux écrits sous chaque capture (ordre alphabétique des fichiers). Usage : python3 tools/build-shots.py"""
import json, re, glob, pathlib, unicodedata, sys
import numpy as np
from scipy import ndimage
from PIL import Image
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower()) if not unicodedata.combining(c)))).strip()
_src = (root / 'tools/build-web.py').read_text(encoding='utf-8')
exec(_src[_src.index('def cut_hard'):_src.index('def cut_soft')] + _src[_src.index('def cut_studio'):_src.index('imgweb = {}')])
MALLE = ["Northern Love","Contre-Jour","Portrait of a Lady","Carnal Flower","Cologne Bigarade","Bigarade Concentrée","Angéliques sous la Pluie","Vétiver Extraordinaire","Dans Tes Bras","Dawn","Eau de Magnolia","En Passant","Iris Poudre","Hope","Heaven Can Wait","French Lover","L'Eau d'Hiver","Lipstick Rose","Lys Méditerranée","Monsieur.","Rose Tonnerre","Rose & Cuir","Outrageous!","Music for a While","Synthetic Nature","The Moon","The Night","Uncut Gem","Noir Epices","Le Parfum de Thérèse","Géranium pour Monsieur","Cologne Indélébile","Sale Gosse","Une Fleur de Cassie"]
HERMES = ["Ginseng Biloba","Musc Pallida","Oud Alezan","Barénia Pleine Fleur","Terre d'Hermès","Terre d'Hermès Eau Intense Vétiver","Un Jardin à Cythère","Twilly d'Hermès Eau Poivrée","Twilly d'Hermès Eau Ginger","Tutti Twilly d'Hermès","H24","H24 Herbes Vives","Eau d'Orange Verte","Eau de Rhubarbe Écarlate","Concentré d'Orange Verte","Eau des Merveilles","Elixir des Merveilles","L'Ombre des Merveilles","24 Faubourg","L'Ambre des Merveilles","Eau des Merveilles Bleue","24 Faubourg ","24 Faubourg Eau Délicate","Kelly Calèche","Kelly Calèche ","Jour d'Hermès","Jour d'Hermès Absolu","Calèche Soie de Parfum","Rouge Hermès","Calèche","Amazone","Equipage","Bel Ami Vétiver","Rocabar","Hiris","Eau d'Hermès","Bel Ami","Agar Ébène","Ambre Narguilé","Cuir d'Ange","Cèdre Sambac","Épice Marine","Iris Ukiyoé","Myrrhe Églantine","Osmanthe Yunnan","Poivre Samarcande","Rose Ikebana","Santal Massoïa","Vétiver Tonka","Violette Volynka","Eau de Néroli Doré","Eau de Pamplemousse Rose","Eau de Mandarine Ambrée","Concentré de Pamplemousse Rose","Eau de Gentiane Blanche","Eau de Basilic Pourpre"]
HERMESSENCE = {"Agar Ébène","Ambre Narguilé","Cuir d'Ange","Cèdre Sambac","Épice Marine","Iris Ukiyoé","Myrrhe Églantine","Osmanthe Yunnan","Poivre Samarcande","Rose Ikebana","Santal Massoïa","Vétiver Tonka","Violette Volynka","Musc Pallida","Oud Alezan","Ginseng Biloba"}
files = sorted(f for f in glob.glob(str(root / 'incoming/Capture*')) if re.search(r'(16\.5\d|17\.\d\d)\.\d\d\.png$', f))
assert len(files) == len(MALLE) + len(HERMES), (len(files), len(MALLE) + len(HERMES))
def photo_step(im):
    """Hermès : la légende est sur un fond plus clair que la photo ; on coupe au saut de luminosité dans la marge gauche."""
    a = np.asarray(im.convert('RGB')).astype(np.float32); h = a.shape[0]
    lum = a[:, :max(6, int(a.shape[1] * .08))].mean(axis=(1, 2))
    for y in range(int(h * .4), h - 8):
        if lum[y + 3:y + 8].mean() - lum[max(0, y - 8):y - 3].mean() > 5: return im.convert('RGB').crop((0, 0, im.size[0], y))
    return photo(im)
def photo(im):
    a = np.asarray(im.convert('RGB')).astype(np.int16); h = a.shape[0]
    white = (a.min(axis=2) >= 247).mean(axis=1)
    end = next((y for y in range(int(h * .25), h) if white[y] > .85), h)       # sous la photo : fond blanc ou crème de la fiche
    return im.convert('RGB').crop((0, 0, im.size[0], end))
def tile(im):
    """Hermès : les verres pâles sur fond beige ne se détourent pas proprement ; on garde la photo de studio, recadrée en vignette 4:5 centrée sur le flacon."""
    w, h = im.size; tw = min(w, int(h * .8)); x0 = max(0, (w - tw) // 2)
    return im.crop((x0, 0, x0 + tw, h)).convert('RGB')
def cut_row(im):
    """Fond de studio avec dégradé vertical et ombre du sol : le fond de chaque ligne est lu dans les marges gauche et droite (le flacon est au centre), puis interpolé.
    La transparence suit l'écart au fond : le verre pâle reste translucide au lieu d'être mangé."""
    a = np.asarray(im.convert('RGB')).astype(np.float32); h, w, _ = a.shape; m = max(6, int(w * .05))
    L = ndimage.median_filter(np.median(a[:, :m], axis=1), size=(15, 1)); R = ndimage.median_filter(np.median(a[:, -m:], axis=1), size=(15, 1))
    t = np.linspace(0, 1, w)[None, :, None]; bg = L[:, None, :] * (1 - t) + R[:, None, :] * t
    d = ndimage.gaussian_filter(np.abs(a - bg).sum(axis=2), 0.8)
    al = np.clip((d - 7) / 20, 0, 1)
    solid = ndimage.binary_closing(al > .5, structure=np.ones((5, 5)))
    lab, n = ndimage.label(ndimage.binary_dilation(solid, iterations=4))
    if n == 0: return None
    sz = ndimage.sum(solid, lab, range(1, n + 1)); keep = lab == (1 + int(np.argmax(sz)))
    keep = ndimage.binary_dilation(keep, iterations=2)
    al = al * keep
    ys, xs = np.where(al > .5)
    if not len(ys): return None
    out = np.dstack([a.astype(np.uint8), (al * 255).astype(np.uint8)])
    return Image.fromarray(out).crop((max(0, xs.min() - 4), max(0, ys.min() - 4), min(w, xs.max() + 5), min(h, ys.max() + 5)))
(root / 'v2/img/p').mkdir(parents=True, exist_ok=True)
shots_p = root / 'data/imgshots.json'
shots = json.loads(shots_p.read_text(encoding='utf-8')) if shots_p.exists() else {}
seen = set(); n = 0
for f, nm in zip(files, MALLE + HERMES):
    house = 'Frédéric Malle' if nm in MALLE and files.index(f) < len(MALLE) else 'Hermès'
    nm = nm.strip(); k = house + '|' + nm
    if k in seen: continue
    seen.add(k)
    c = cut_studio(photo(Image.open(f)), 1) if house == 'Frédéric Malle' else tile(photo_step(Image.open(f)))
    if c is None: print('échec', nm); continue
    c.thumbnail((480, 600))
    fn = 'img/p/' + norm(house).replace(' ', '-') + '-' + norm(nm).replace(' ', '-') + '.webp'
    c.save(root / 'v2' / fn, 'WEBP', quality=80, method=5)
    names = [nm]
    if house == 'Hermès' and nm in HERMESSENCE: names.append('Hermessence ' + nm)
    if nm == "Monsieur.": names.append('Monsieur')
    if house == 'Hermès' and nm in ('Cèdre Sambac', 'Ginseng Biloba'): names = ['Hermessence ' + nm]      # la base ne connaît que le nom Hermessence
    for x in names: shots[norm(house) + '|' + norm(x)] = fn
    n += 1
shots_p.write_text(json.dumps(shots, ensure_ascii=False, indent=0), encoding='utf-8')
print(n, 'captures')
