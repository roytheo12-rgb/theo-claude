#!/usr/bin/env python3
"""Photos des fiches Jovoy (balise og:image) pour les parfums sans photo -> data/web-raw/images-extra-jovoy.jsonl (1 requête / 1,2 s)."""
import json, re, glob, time, pathlib, unicodedata, urllib.request
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower().replace('’', "'")) if not unicodedata.combining(c)))).strip()
missing = json.load(open(root / 'data/web-raw/missing-img.json', encoding='utf-8'))
MAR = {'amouage': 'Amouage', 'xerjoff': 'Xerjoff', 'clive-christian': 'Clive Christian', 'atelier-des-ors': 'Atelier des Ors', 'bdk-parfums': 'BDK Parfums', 'une-nuit-nomade': 'Une Nuit Nomade', 'oman-luxury': 'Oman Luxury', 'giardini-di-toscana': 'Giardini di Toscana', 'nasomatto': 'Nasomatto'}
CONC = re.compile(r'\b(eau de parfum|eau de toilette|extrait de parfum|extrait|parfum|edp|edt|elixir|cologne|intense|absolu)\b')
want = {}
for h, names in missing.items():
    for n in names: want[(h, CONC.sub('', norm(n)).strip())] = n
byurl = {}
for f in glob.glob(str(root / 'data/web-raw/jovoy*.jsonl')):
    for l in open(f, encoding='utf-8'):
        try: r = json.loads(l)
        except Exception: continue
        byurl.setdefault(r['url'], []).append(r)
todo = []
for u, g in byurl.items():
    for r in g:
        h = MAR.get(r['marque'])
        if h and (h, CONC.sub('', norm(r['name'])).strip()) in want and len(g) == 1:
            todo.append((u, h, want[(h, CONC.sub('', norm(r['name'])).strip())]))
UA = {'User-Agent': 'Mozilla/5.0 (compatible; SillageBot/1.0)'}
out = root / 'data/web-raw/images-extra-jovoy.jsonl'; seen = set()
if out.exists():
    for l in out.open(encoding='utf-8'):
        try: seen.add(json.loads(l)['url'])
        except Exception: pass
n = 0
with out.open('a', encoding='utf-8') as fo:
    for u, h, name in todo:
        if u in seen: continue
        try: page = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read().decode('utf-8', 'replace')
        except Exception: continue
        time.sleep(1.2)
        m = re.search(r'property="og:image"\s+content="([^"]+)"', page) or re.search(r'content="([^"]+)"\s+property="og:image"', page)
        if m: fo.write(json.dumps({'house': h, 'name': name, 'image': m.group(1), 'url': u}, ensure_ascii=False) + '\n'); fo.flush(); n += 1
print(len(todo), 'à lire,', n, 'images')
