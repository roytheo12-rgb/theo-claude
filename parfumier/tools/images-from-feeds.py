#!/usr/bin/env python3
"""Photos des flux produits publics des maisons (data/brand-notes/*.json, champ img) pour les parfums sans photo -> data/web-raw/images-extra-feeds.jsonl"""
import json, re, pathlib, unicodedata
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower().replace('’', "'")) if not unicodedata.combining(c)))).strip()
missing = json.load(open(root / 'data/web-raw/missing-img.json', encoding='utf-8'))
FEEDS = {'tom-ford': 'Tom Ford', 'creed': 'Creed', 'parfums-de-marly': 'Parfums de Marly', 'xerjoff': 'Xerjoff', 'amouage': 'Amouage', 'initio': 'Initio', 'atelier-des-ors': 'Atelier des Ors', 'histoires-de-parfums': 'Histoires de Parfums', 'bdk': 'BDK Parfums', 'memo': 'Memo Paris', 'nasomatto': 'Nasomatto', 'houbigant': 'Houbigant', 'essential-parfums': 'Essential Parfums', 'clive-christian': 'Clive Christian', 'bon-parfumeur': 'Bon Parfumeur'}
BAD = re.compile(r'sample|échantillon|echantillon|\bset\b|coffret|bundle|candle|bougie|soap|savon|body|lotion|shower|cream|crème|hair|refill|recharge|travel|discovery|gift|trunk|engrav|lessive|hand|gel\b|decanter|atomi|mist|deodorant|oil|case|box|miniature|vaporisateur|lamp|diffuser', re.I)
CONC = re.compile(r'\b(eau de parfum|eau de toilette|extrait de parfum|extrait|parfum|edp|edt|elixir|cologne|intense|absolu)\b', re.I)
out = []; seen = set()
for f, house in FEEDS.items():
    p = root / f'data/brand-notes/{f}.json'
    if not p.exists(): continue
    names = {norm(n): n for n in missing.get(house, [])}
    for pr in json.load(open(p, encoding='utf-8')):
        if not pr.get('img') or BAD.search(pr['title']) or BAD.search(pr.get('type') or ''): continue
        t = re.sub(r'\s*[-–|]?\s*\d+\s*ml\b', '', pr['title'], flags=re.I).strip()
        for c in (norm(t), norm(CONC.sub('', t).strip()), norm(re.sub(r'^.*? - ', '', t))):
            if c in names and (house, names[c]) not in seen:
                seen.add((house, names[c])); out.append({'house': house, 'name': names[c], 'image': pr['img'], 'url': 'feed:' + f}); break
open(root / 'data/web-raw/images-extra-feeds.jsonl', 'w', encoding='utf-8').write('\n'.join(json.dumps(x, ensure_ascii=False) for x in out) + '\n')
print(len(out), 'photos depuis les flux')
