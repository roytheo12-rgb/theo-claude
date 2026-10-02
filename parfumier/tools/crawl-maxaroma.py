#!/usr/bin/env python3
"""Photos produit (fond blanc) pour les parfums qui n'en ont pas : MaxAroma (robots.txt : pages produit autorisées, sitemap public).
Les URL produit contiennent maison et nom : on rapproche d'abord sur l'URL (aucune requête), puis on ne lit que les pages rapprochées (1 requête / 1,2 s).
Entrée : data/web-raw/missing-img.json {maison: [noms]}. Sortie : data/web-raw/images-extra.jsonl {house, name, image, url} (reprise automatique)."""
import json, re, sys, time, pathlib, urllib.request, unicodedata
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower().replace('’', "'")) if not unicodedata.combining(c)))).strip()
UA = {'User-Agent': 'Mozilla/5.0 (compatible; SillageBot/1.0)'}
def get(u):
    for i in range(3):
        try: return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read().decode('utf-8', 'replace')
        except Exception: time.sleep(2 + 3 * i)
    return ''
missing = json.load(open(root / 'data/web-raw/missing-img.json', encoding='utf-8'))
part, parts = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (0, 1)
out = root / f'data/web-raw/images-extra-{part}.jsonl'
done = set()
if out.exists():
    for l in out.open(encoding='utf-8'):
        try: j = json.loads(l); done.add(norm(j['house']) + '|' + norm(j['name']))
        except Exception: pass
sm = (root / 'data/web-raw/maxaroma-sitemap.xml')
if not sm.exists(): sm.write_text(get('https://www.maxaroma.com/sitemap.xml'), encoding='utf-8')
urls = re.findall(r'<loc>(https://www\.maxaroma\.com/fragrance/[^<]*?/pid/[^<]*)</loc>', sm.read_text(encoding='utf-8'))
ALLOW = set('eau de parfum toilette edp edt extrait spray for men women woman man unisex pour homme femme by the parfums perfume cologne'.split())
slugs = []
for u in urls:
    m = re.match(r'https://www\.maxaroma\.com/fragrance/[a-z0-9-]+/([^/]+)/pid', u)
    if m: slugs.append((m.group(1), u))
HOUSE_SLUG = {'Dior': 'dior christian dior', 'Yves Saint Laurent': 'yves saint laurent ysl', 'Jean Paul Gaultier': 'jean paul gaultier', 'Rabanne': 'paco rabanne rabanne', 'Armani': 'giorgio armani armani', 'Maison Margiela': 'maison margiela', 'Maison Francis Kurkdjian': 'maison francis kurkdjian', 'BDK Parfums': 'bdk parfums', "Penhaligon's": 'penhaligon s penhaligons', 'Narciso Rodriguez': 'narciso rodriguez', 'Jo Malone': 'jo malone london jo malone', 'Acqua di Parma': 'acqua di parma', 'Bvlgari': 'bvlgari bulgari'}
def prefixes(h):
    return [norm(x) for x in (HOUSE_SLUG.get(h, h).split(' ') and [HOUSE_SLUG.get(h, h)] ) ][0].split() if False else None
def hprefs(h):
    # plusieurs graphies possibles : on teste chaque variante séparée par deux espaces ou le nom complet
    base = norm(h).replace(' ', '-')
    alts = {base}
    for k, v in HOUSE_SLUG.items():
        if k == h:
            for name in {'dior', 'christian-dior'} if h == 'Dior' else {'yves-saint-laurent', 'ysl'} if h == 'Yves Saint Laurent' else {'paco-rabanne', 'rabanne'} if h == 'Rabanne' else {'giorgio-armani', 'armani'} if h == 'Armani' else {'bulgari', 'bvlgari'} if h == 'Bvlgari' else {'jo-malone-london', 'jo-malone'} if h == 'Jo Malone' else {'penhaligon-s', 'penhaligons'} if h == "Penhaligon's" else {base}: alts.add(name)
    return alts
todo = [(h, n) for h, names in missing.items() for n in names]
todo = [t for i, t in enumerate(todo) if i % parts == part]
found = 0
with out.open('a', encoding='utf-8') as fo:
    for h, n in todo:
        k = norm(h) + '|' + norm(n)
        if k in done: continue
        nt = norm(n).split()
        if not nt: continue
        best = None
        for slug, u in slugs:
            for hp in hprefs(h):
                if slug.startswith(hp + '-'):
                    rest = slug[len(hp) + 1:].split('-')
                    # le nom est une sous-suite contiguë du reste, le surplus ne contient que des mots de concentration / genre
                    for i in range(len(rest) - len(nt) + 1):
                        if rest[i:i + len(nt)] == nt:
                            extra = [w for w in rest[:i] + rest[i + len(nt):] if w not in ALLOW]
                            score = len(extra)
                            if score == 0 and (best is None or len(rest) < best[0]): best = (len(rest), u)
                            break
        if not best: continue
        page = get(best[1]); time.sleep(1.2)
        m = re.search(r'"image":\s*"(https://www\.maxaroma\.com/productimages/large/[^"]+)"', page)
        if m:
            fo.write(json.dumps({'house': h, 'name': n, 'image': m.group(1), 'url': best[1]}, ensure_ascii=False) + '\n'); fo.flush(); found += 1
print('images trouvées', found)
