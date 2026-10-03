"""Couvertures des playlists : transforme les images déposées dans incoming/playlists/ (JPG, PNG, WEBP, n'importe quelle taille)
en v2/img/pl/<slug>.webp (900 px max). Le fichier porte le slug de la playlist (ex. james-bond.jpg) ou son numéro (ex. 1.jpg). Les images listées dans data/covers-map.txt sont recadrées : fond uni et légende retirés.
Usage : python3 tools/build-covers.py"""
import json, re, pathlib, unicodedata
from PIL import Image
import sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from cover_crop import split
root = pathlib.Path(__file__).resolve().parent.parent
def slug(s):
    s = unicodedata.normalize('NFD', str(s)).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')
src = (root / 'playlists.js').read_text(encoding='utf-8')
P = json.loads(re.search(r'window\.PLAYLISTS = (\[.*\]);', src, re.S).group(1))
by_slug = {p['s']: p for p in P}; by_id = {str(p['id']): p for p in P}
inbox = root / 'incoming' / 'playlists'; out = root / 'v2' / 'img' / 'pl'; out.mkdir(parents=True, exist_ok=True)
MAP = {}
for l in (root / 'data' / 'covers-map.txt').read_text(encoding='utf-8').splitlines():
    if '|' in l and not l.startswith('#'):
        a, t = l.split('|', 1); MAP.update({a.strip() + e: t.strip() for e in ('.png', '.jpg', '.jpeg', '.webp')})
done, lost = 0, []
for f in sorted(inbox.glob('*')) if inbox.exists() else []:
    if f.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.webp'): continue
    mp = MAP.get(f.name)
    if mp == '-': continue
    k = slug(mp) if mp else slug(f.stem); p = by_slug.get(k) or by_id.get(f.stem.strip()) or by_slug.get(re.sub(r'^\d+-', '', k))
    if not p: lost.append(f.name); continue
    im = split(f)[0] if f.name in MAP else Image.open(f).convert('RGB'); im.thumbnail((900, 900)); im.save(out / (p['s'] + '.webp'), 'WEBP', quality=78, method=6); done += 1
print('couvertures :', done, '| fichiers sans playlist :', lost)
