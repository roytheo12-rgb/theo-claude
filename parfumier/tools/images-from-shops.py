#!/usr/bin/env python3
"""Rapproche les parfums sans photo des catalogues de boutiques (data/web-raw/shops/*.json) -> data/web-raw/images-extra-shops.jsonl
Usage : python3 tools/images-from-shops.py [missing-img.json ...]"""
import json, re, sys, glob, pathlib, unicodedata, collections
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower().replace('’', "'").replace('&', ' and ')) if not unicodedata.combining(c)))).strip()
BAD = re.compile(r'sample|decant|échantillon|echantillon|\bset\b|coffret|bundle|candle|bougie|soap|savon|body|lotion|shower|cream|crème|hair|refill|recharge|travel|discovery|gift|trunk|engrav|hand|gel\b|atomi|mist|deodorant|\boil\b|case|box|miniature|lamp|diffuser|\b\d+\s*x\s*\d+|2ml|3ml|5ml|10ml|1ml|vial|tester|pack\b|kit\b|collection set|scented|room spray|ambient|diffuseur', re.I)
CONC = re.compile(r'\b(eau de parfum|eau de toilette|extrait de parfum|extrait|parfum|edp|edt|elixir|cologne|intense|absolu|for men|for women|pour homme|pour femme|unisex|spray|by)\b')
SIZE = re.compile(r'\b\d+(?:\.\d+)?\s*(?:ml|oz|fl)\b')
files = sys.argv[1:] or ['missing-img.json', 'missing-img2.json']
missing = {}
for f in files:
    for h, ns in json.load(open(root / 'data/web-raw' / f, encoding='utf-8')).items(): missing.setdefault(h, set()).update(ns)
shops = []
ORDER = ['aedes', 'lessenteurs', 'premiereavenue', 'lamaisonduparfum', 'amyris', 'zgo', 'parisgallery', 'parfumexquis', 'olfactif', 'soavantgarde', 'escentual', 'saison', 'perfumedefrance', 'thescentcity', 'fragrancelord', 'fragrancesline']
for sname in ORDER:
    p = root / f'data/web-raw/shops/{sname}.json'
    if p.exists(): shops.append((sname, json.load(open(p, encoding='utf-8'))))
# index : (vendor normalisé) -> [(titre normalisé, image, shop)]
idx = collections.defaultdict(list)
for sname, prods in shops:
    for pr in prods:
        kk = (pr['k'] or '').lower()
        if not pr['i'] or BAD.search(pr['t']) or BAD.search(kk) or re.search(r'\b(lait|soin|soins|main|mains|corps|brume|huile|gel|savon|hair|body|bougie|candle)\b', pr['t'].lower() + ' ' + kk): continue
        if kk and not re.search(r'parfum|fragrance|perfume|eau|cologne|extrait|niche|colog|scent|unisex|men|women|homme|femme', kk): continue
        idx[norm(pr['v'])].append((SIZE.sub('', norm(pr['t'])).strip(), pr['i'], sname))
ALIAS = {'maison francis kurkdjian': ['maison francis kurkdjian', 'francis kurkdjian'], 'editions de parfums frederic malle': ['frederic malle', 'editions de parfums frederic malle', 'les editions de parfums frederic malle'], 'frederic malle': ['frederic malle', 'editions de parfums frederic malle', 'les editions de parfums frederic malle'], 'yves saint laurent': ['yves saint laurent', 'ysl'], 'rabanne': ['rabanne', 'paco rabanne'], 'armani': ['armani', 'giorgio armani'], 'dior': ['dior', 'christian dior'], 'bvlgari': ['bvlgari', 'bulgari'], 'mugler': ['mugler', 'thierry mugler'], 'maison margiela': ['maison margiela', 'margiela'], "l'artisan parfumeur": ['l artisan parfumeur', 'artisan parfumeur'], 'comme des garcons': ['comme des garcons'], 'atelier cologne': ['atelier cologne']}
out = []; seen = set()
for h, names in missing.items():
    nh = norm(h); vendors = [v for al in ALIAS.get(nh, [nh]) for v in idx if v == al or v.startswith(al + ' ') or al.startswith(v + ' ') and len(v) > 4]
    for n in sorted(names):
        nn = norm(n); nk = CONC.sub('', nn).strip()
        best = None
        for v in vendors:
            for t, img, sh in idx[v]:
                t2 = t
                for al in ALIAS.get(nh, [nh]): t2 = re.sub(r'^' + re.escape(al) + r'\s*', '', t2)
                t2 = re.sub(r'^(le|la|les|the)\s+', '', CONC.sub('', t2).strip()).strip(); n2 = re.sub(r'^(le|la|les|the)\s+', '', nk).strip()
                if t2 == n2 or t2 == nk or CONC.sub('', t).strip() == nk:
                    r = ORDER.index(sh)
                    if best is None or r < best[0]: best = (r, img, sh)
        if best and (h, n) not in seen: seen.add((h, n)); out.append({'house': h, 'name': n, 'image': best[1].split('?')[0], 'url': 'shop:' + best[2]})
open(root / 'data/web-raw/images-extra-shops.jsonl', 'w', encoding='utf-8').write('\n'.join(json.dumps(x, ensure_ascii=False) for x in out) + '\n')
print(len(out), 'photos trouvées sur', sum(len(v) for v in missing.values()), 'manquantes')
cnt = collections.Counter(o['house'] for o in out); print(dict(cnt.most_common(15)))
