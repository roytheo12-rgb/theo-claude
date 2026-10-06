"""Photos déposées dans incoming/ sous la forme Maison_Nom_du_parfum.ext (fond uni) : détourage, rattachement à la fiche, v2/img/p/<maison>-<nom>.webp et data/imgshots.json.
Le nom de fichier perd les accents (GitHub) : la comparaison se fait sur les lettres ASCII seules. Cible : les parfums des listes Inspirations (data/parfums-sans-image.md) et toute fiche de la base.
Usage : python3 tools/build-incoming-named.py"""
import json, re, pathlib, subprocess, unicodedata, sys
import numpy as np
from scipy import ndimage
from PIL import Image
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower()) if not unicodedata.combining(c)))).strip()
def slug(s): return re.sub(r'[^a-z0-9]+', '-', ''.join(c for c in unicodedata.normalize('NFD', str(s).lower()) if not unicodedata.combining(c))).strip('-')
def asc(s): return re.sub(r'[^a-z0-9]', '', ''.join(c for c in unicodedata.normalize('NFD', str(s).lower()) if not unicodedata.combining(c)))
idx = json.loads(subprocess.check_output(['node', '-e', "global.window={};require('./index.js');console.log(JSON.stringify(window.INDEX))"], cwd=root))
targets = {}
for h, arr in idx:
    for x in arr: targets.setdefault(asc(h + ' ' + x[0]), (h, x[0]))
# parfums présents dans les playlists mais pas dans l'index : cibles supplémentaires
for _p in json.loads(subprocess.check_output(['node', '-e', "global.window={};require('./playlists.js');console.log(JSON.stringify(window.PLAYLISTS.map(p=>p.ps.map(x=>[x.h,x.n])).flat()))"], cwd=root)):
    if _p[0] and _p[1]: targets.setdefault(asc(_p[0] + ' ' + _p[1]), (_p[0], _p[1]))
TOL = 38
MAP = {}      # fichiers sans maison (visuels officiels) : data/incoming-maison.txt
_mp = root / 'data/incoming-maison.txt'
if _mp.exists():
    for _l in _mp.read_text(encoding='utf-8').splitlines():
        if _l.strip() and not _l.startswith('#'):
            _s, _h, _n = _l.split('|'); MAP[_s] = (_h, _n)
# retouches par fichier : recadrage (x0,y0,x1,y1), tolérance du fond, écart de coins admis
OVR = {'Nirmal': {'tol': 60, 'corner': 250}, 'Vanagloria': {'tol': 60, 'corner': 250}, 'Yatagan': {'tol': 60, 'corner': 250}, 'Fleurs de Rocaille': {'tol': 60, 'corner': 250}, 'Maison_Margiela_Coffee_Break': {'crop': (1180, 150, 1760, 1930)}, 'Maison_Matah_Escapade_Gourmande': {'crop': (0, 100, 430, 780)},
       'Issey_Miyake_L_Eau_d_Issey_Pour_Homme_Intense': {'tol': 70, 'corner': 150}, 'Caron_Fleurs_de_Rocaille': {'tol': 60, 'corner': 150}, 'Caron_Yatagan': {'tol': 60, 'corner': 150}, 'Creed_Fleurissimo': {'tol': 60, 'corner': 150}}
SKIP = {'Chanel_31_Rue_Cambon', 'Initio_Oud_for_Greatness', 'Maison_Margiela_On_a_Date', 'Mancera_French_Riviera', 'Memo_Paris_Corfu', 'Memo_Paris_Flam', 'Memo_Paris_Ilha_do_Mel', 'Oman_Luxury_Dejan', 'Guerlain_Neroli_Outrenoir', 'Guerlain_Peche_Mirage', 'Tom_Ford_Ombre_Leather_Parfum', 'Atelier_Materi_Bois_d_Ambrette', 'Maison_Margiela_Bubble_Bath', 'Mancera_Lemon_Line', 'Tom_Ford_Black_Lacquer', 'Oman_Luxury_Angham', 'Liis_Rose_Struck', 'Issey_Miyake_L_Eau_d_Issey_Pour_Homme_Intense', 'Maison_Matah_Escapade_Gourmande', 'Caron_Fleurs_de_Rocaille', 'Caron_Yatagan', 'DS_Durga_Debaser', 'DS_Durga_I_Don_t_Know_What', 'Fenty_Eau_de_Parfum', 'Maison_Margiela_Coffee_Break'}      # flacon blanc sur fond blanc : détourage impossible
def grab(im):
    """Fond non uni (dégradé, décor) : détourage GrabCut à partir d'un cadre posé autour du flacon, composante principale conservée."""
    import cv2
    a = np.asarray(im.convert('RGB')); h, w, _ = a.shape
    m = np.zeros((h, w), np.uint8); r = (int(w * .04), int(h * .03), int(w * .92), int(h * .94))
    bgd, fgd = np.zeros((1, 65)), np.zeros((1, 65))
    try: cv2.grabCut(cv2.cvtColor(a, cv2.COLOR_RGB2BGR), m, r, bgd, fgd, 6, cv2.GC_INIT_WITH_RECT)
    except Exception: return None
    keep = (m == 1) | (m == 3)
    keep = ndimage.binary_opening(keep, iterations=2)
    lab, n = ndimage.label(keep)
    if n == 0: return None
    sizes = ndimage.sum(keep, lab, range(1, n + 1)); keep = lab == (1 + int(np.argmax(sizes)))
    keep = ndimage.binary_fill_holes(keep)
    if keep.mean() < .04 or keep.mean() > .85: return None
    return Image.fromarray(np.dstack([a, (keep * 255).astype(np.uint8)]), 'RGBA')
def cut(im, tol=TOL, corner=60):
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA'); a = np.asarray(im)
        if (a[:, :, 3] < 250).mean() > 0.05: return im
    im = im.convert('RGB'); im.thumbnail((1200, 1200)); a = np.asarray(im).astype(np.int16); h, w, _ = a.shape
    corners = np.array([a[2, 2], a[2, w-3], a[h-3, 2], a[h-3, w-3]]); bg = np.median(corners, axis=0)
    if corners.max(axis=0).sum() - corners.min(axis=0).sum() > corner: return grab(im)
    near = (np.abs(a - bg).sum(axis=2) < tol)
    lab, n = ndimage.label(near); edge = set(lab[0]) | set(lab[-1]) | set(lab[:, 0]) | set(lab[:, -1]); edge.discard(0)
    bgm = np.isin(lab, list(edge)); keep = ~bgm
    keep = ndimage.binary_opening(keep, iterations=1)
    lab2, n2 = ndimage.label(keep)
    if n2 > 1:
        sizes = ndimage.sum(keep, lab2, range(1, n2 + 1)); keep = lab2 == (1 + int(np.argmax(sizes)))
    keep = ndimage.binary_fill_holes(keep)
    out = np.dstack([a.astype(np.uint8), (keep * 255).astype(np.uint8)])
    return Image.fromarray(out, 'RGBA')
sh = root / 'data/imgshots.json'; shots = json.loads(sh.read_text(encoding='utf-8')) if sh.exists() else {}
done, lost, bad = [], [], []
for f in sorted(x for x in (root / 'incoming').rglob('*') if x.is_file() and 'playlists' not in x.parts):      # sous-dossiers admis (lot-02/...)
    if f.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.webp', '.avif') or re.match(r'^\d+\.', f.name) or f.name.startswith('Capture'): continue
    if sys.argv[1:] and not any(a in f.stem for a in sys.argv[1:]): continue      # lancement partiel : python3 tools/build-incoming-named.py 062_ ella-k
    st = re.sub(r'^\d+[-_]', '', f.stem)      # lots numérotés 001-maison-nom.png
    t = targets.get(asc(MAP[f.stem][0] + ' ' + MAP[f.stem][1])) if f.stem in MAP else (targets.get(asc(st)) or targets.get(asc(st.replace('-et-', '-'))) or targets.get(asc(st.replace('mfk', 'maison francis kurkdjian'))))
    if not t: lost.append(f.name); continue
    if st in SKIP: bad.append(f.name + ' (blanc sur blanc)'); continue
    try: im = Image.open(f)
    except Exception: bad.append(f.name); continue
    o = OVR.get(f.stem, {})
    if 'crop' in o: im = im.convert('RGB').crop(o['crop'])
    c = cut(im, o.get('tol', TOL), o.get('corner', 60))
    if c is None: bad.append(f.name + ' (fond non uni)'); continue
    bb = c.getbbox()
    if not bb: bad.append(f.name + ' (vide)'); continue
    c = c.crop(bb); c.thumbnail((760, 760), Image.LANCZOS)
    fn = f'img/p/{slug(t[0])}-{slug(t[1])}.webp'; c.save(root / 'v2' / fn, 'WEBP', quality=86, method=6)
    shots[norm(t[0]) + '|' + norm(t[1])] = fn; done.append(f.name)
sh.write_text(json.dumps(shots, ensure_ascii=False, indent=0), encoding='utf-8')
print(len(done), 'photos ;', 'sans fiche :', lost, '; refusées :', bad)
