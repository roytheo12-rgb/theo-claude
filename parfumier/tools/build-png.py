"""Photos déjà détourées (incoming/N.png, légende écrite sous le flacon) -> v2/img/p/*.webp + imgnew.js.
Lit data/imgmap2.resolved.json (écrit par build-index.py). La légende est retirée de l'image : on ne garde que le flacon.
Quand un parfum a plusieurs photos, la plus récente (numéro le plus élevé) gagne ; une photo défectueuse est écartée (voir REJETS).
Usage : python3 tools/build-png.py"""
import json, re, pathlib, unicodedata
import numpy as np
from scipy import ndimage
from PIL import Image

root = pathlib.Path(__file__).resolve().parent.parent
rows = json.loads((root / 'data/imgmap2.resolved.json').read_text(encoding='utf-8'))
# Photos défectueuses (fond blanc non détouré, flacon coupé, image vide, légende qui ne correspond pas à la photo) : écartées, voir PHOTOS-A-REFAIRE.md
REJETS = {
    # (418 à 421 : photos officielles Guerlain, gardées telles quelles)
}
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower()) if not unicodedata.combining(c)))).strip()
def slug(s): return norm(s).replace(' ', '-')

def trim_caption(a):
    """Retire les lignes de légende collées sous le flacon : bandes fines, séparées du flacon par au moins 2 rangées vides."""
    h = a.shape[0]
    for _ in range(3):
        rows = np.where(a.any(axis=1))[0]
        if len(rows) < 2: break
        cuts = np.where(np.diff(rows) > 2)[0]
        if not len(cuts): break
        top = rows[cuts[-1] + 1]; bottom = rows[-1]
        if (bottom - top + 1) <= 0.06 * h and (rows[cuts[-1]] - rows[0]) >= 0.15 * h:
            a = a.copy(); a[top:] = False
        else: break
    return a

# Photos livrées avec un fond clair non détouré : on retire le fond relié aux bords (+ ombre pour les Serge Lutens, dont l'étiquette noire sert de repère)
RECT_BG = {59: 0.30, 60: 0.13, 118: None}
def cut_rect_bg(im, margin):
    from PIL import ImageFilter
    arr0 = np.asarray(im).copy(); a = trim_caption(arr0[:, :, 3] > 40)
    ys, xs = np.where(a); sub = arr0[ys.min():ys.max() + 1, xs.min():xs.max() + 1].astype(np.int16)
    border = np.concatenate([sub[0], sub[-1], sub[:, 0], sub[:, -1]])[:, :3]; bg = np.median(border, axis=0)
    near = np.abs(sub[:, :, :3] - bg).sum(axis=2) < 24
    lab, k = ndimage.label(near); edge = set(lab[0]) | set(lab[-1]) | set(lab[:, 0]) | set(lab[:, -1]); edge.discard(0)
    arr = sub.astype(np.uint8); arr[np.isin(lab, list(edge)), 3] = 0
    soft = np.asarray(Image.fromarray(arr[:, :, 3]).filter(ImageFilter.GaussianBlur(1.2))); arr[:, :, 3] = np.minimum(arr[:, :, 3], soft)
    if margin is not None:
        dark = (arr[:, :, :3].astype(int).sum(axis=2) < 180) & (arr[:, :, 3] > 0)
        yy, xx = np.where(dark); x0, x1, y0, y1 = xx.min(), xx.max(), yy.min(), yy.max(); m = int(margin * (x1 - x0))
        arr[:, :max(0, x0 - m)] = 0; arr[:, x1 + m:] = 0; arr[y1 + int(0.075 * (y1 - y0)):] = 0
        al = ndimage.binary_opening(arr[:, :, 3] > 0, structure=np.ones((5, 5)))
        lab, k = ndimage.label(al); al = lab == (int(np.argmax(ndimage.sum(al, lab, range(1, k + 1)))) + 1)
        arr[~ndimage.binary_fill_holes(al), 3] = 0
    yy, xx = np.where(arr[:, :, 3] > 0)
    return Image.fromarray(arr[yy.min():yy.max() + 1, xx.min():xx.max() + 1])

def crop_bottle(im):
    """Garde le flacon (plus grosse composante) et ce qui l'entoure ; retire la légende, située plus bas."""
    a = np.asarray(im)[:, :, 3] > 40
    h, w = a.shape
    a = trim_caption(a)
    r = max(3, int(h * 0.016))
    dil = ndimage.maximum_filter(a.astype(np.uint8), size=2 * r + 1) > 0
    lab, n = ndimage.label(dil)
    if n == 0: return None
    mass = ndimage.sum(a, lab, range(1, n + 1))
    main = int(np.argmax(mass)) + 1
    ys, xs = np.where(lab == main)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    pad = int(0.03 * (y1 - y0))
    keep = np.zeros_like(a)
    for i in range(1, n + 1):
        if i == main: continue
        yy, xx = np.where(lab == i)
        cy, cx = (yy.min() + yy.max()) / 2, (xx.min() + xx.max()) / 2
        if y0 - pad <= cy <= y1 and x0 - pad <= cx <= x1 + pad: keep |= (lab == i)   # pièce détachée à l'intérieur de l'emprise du flacon
    keep |= (lab == main)
    keep = keep & a | (ndimage.binary_dilation(keep & a, iterations=2) & a)
    arr = np.asarray(im).copy(); arr[~keep] = 0
    ys, xs = np.where(keep)
    box = (max(0, xs.min() - 6), max(0, ys.min() - 6), min(w, xs.max() + 7), min(h, ys.max() + 7))
    return Image.fromarray(arr).crop(box)

def save(im, path, maxh):
    im = im.copy(); im.thumbnail((maxh, maxh), Image.LANCZOS)
    im.save(path, 'WEBP', quality=86, method=6)

(root / 'v2/img/p').mkdir(parents=True, exist_ok=True)
(root / 'v2/img/nose').mkdir(parents=True, exist_ok=True)
force = bool(__import__('os').environ.get('FORCE'))   # sans FORCE=1, une photo déjà découpée n'est pas refaite
best = {}      # "maison|nom" -> numéro
for r in rows:
    if 'house' not in r or r['n'] in REJETS: continue
    k = norm(r['house']) + '|' + norm(r['name'])
    if k not in best or r['n'] > best[k][0]: best[k] = (r['n'], r)
imgnew, noses, rejected = {}, {}, []
for k, (n, r) in sorted(best.items(), key=lambda kv: kv[1][0]):
    fn = f'img/p/{slug(r["house"])}-{slug(r["name"])}.webp'
    if not force and (root / 'v2' / fn).exists() and (root / 'v2' / fn).stat().st_mtime > (root / f'incoming/{n}.png').stat().st_mtime: imgnew[k] = fn; continue
    im = Image.open(root / f'incoming/{n}.png').convert('RGBA')
    c = cut_rect_bg(im, RECT_BG[n]) if n in RECT_BG else crop_bottle(im)
    if c is None: rejected.append((n, 'vide')); continue
    fn = f'img/p/{slug(r["house"])}-{slug(r["name"])}.webp'
    save(c, root / 'v2' / fn, 760); imgnew[k] = fn
for r in rows:
    if 'nose' not in r: continue
    if r['n'] in REJETS: continue
    im = Image.open(root / f'incoming/{r["n"]}.png').convert('RGBA')
    a = np.asarray(im)[:, :, 3] > 40; h, w = a.shape
    rows_on = np.where(a.any(axis=1))[0]
    # la photo est un rectangle opaque ; la légende est une zone séparée en dessous (rangées vides entre les deux)
    gaps = np.where(np.diff(rows_on) > 6)[0]
    y1 = rows_on[gaps[0]] if len(gaps) else rows_on[-1]
    sub = a[rows_on[0]:y1 + 1]; cols = np.where(sub.any(axis=0))[0]
    bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[3])
    ph = bg.crop((cols[0], rows_on[0], cols[-1] + 1, y1 + 1))
    if r.get('crop'): ph = bg.crop(tuple(int(v) for v in r['crop'].split(',')))      # recadrage manuel autour du visage (x0,y0,x1,y1)
    fn = f'img/nose/{slug(r["nose"])}.webp'
    save(ph, root / 'v2' / fn, 420); noses[r['nose']] = fn
_sh = root / 'data/imgshots.json'      # captures de sites (Louis Vuitton, Frédéric Malle, Hermès) : tools/build-lv.py et tools/build-shots.py
if _sh.exists(): imgnew.update(json.loads(_sh.read_text(encoding='utf-8')))
for d, keep in (('p', set(imgnew.values())), ('nose', set(noses.values()))):
    for f in (root / 'v2/img' / d).glob('*.webp'):
        if f'img/{d}/{f.name}' not in keep: f.unlink()
(root / 'imgnew.js').write_text(
    '// Généré par tools/build-png.py : photos de flacons (la plus récente gagne) et portraits de nez.\n'
    'window.IMGNEW = ' + json.dumps(imgnew, ensure_ascii=False, separators=(',', ':')) + ';\n'
    'window.NOSE_IMG = ' + json.dumps(noses, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
print(f'{len(imgnew)} flacons, {len(noses)} portraits, écartés : {sorted(REJETS)} {rejected}')
