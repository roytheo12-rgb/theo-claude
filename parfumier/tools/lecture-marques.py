#!/usr/bin/env python3
"""Prépare à la lecture (data/brand-notes/lecture-<maison>.txt) les descriptions officielles des parfums de la base qui n'ont pas encore de notes réelles :
une ligne par parfum : « Maison | Parfum || description officielle nettoyée ». Les notes sont ensuite extraites À LA LECTURE du texte de la marque (jamais devinées)."""
import json, re, glob, html, subprocess, pathlib, unicodedata
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower().replace('’', "'")) if not unicodedata.combining(c)))).strip()
ours = json.loads(subprocess.check_output(['node', '-e', "const {E,ctx}=require('./tools/eval-pool.cjs');const a=[];const ED=new Set(ctx.EDITIONS);const HA=ctx.HOUSE_ALIAS||{};ctx.INDEX.forEach(([h,l])=>l.forEach(([n])=>{const k=E.norm(h)+'|'+E.norm(n);if(ED.has(k))return;const f=ctx.FACTS[k];a.push([h,n,f&&f.n&&f.n.length>=3?1:0])}));ctx.CATALOG.forEach(c=>a.push([c.house,c.name,c.notes&&c.notes.length>=3?1:0]));console.log(JSON.stringify(a))"], cwd=root).decode().strip().splitlines()[-1])
H = {'tom-ford': 'tom ford', 'creed': 'creed', 'parfums-de-marly': 'parfums de marly', 'xerjoff': 'xerjoff', 'amouage': 'amouage', 'initio': 'initio', 'atelier-des-ors': 'atelier des ors', 'histoires-de-parfums': 'histoires de parfums', 'bdk': 'bdk parfums', 'memo': 'memo paris', 'nasomatto': 'nasomatto', 'houbigant': 'houbigant', 'essential-parfums': 'essential parfums', 'clive-christian': 'clive christian', 'bon-parfumeur': 'bon parfumeur'}
BAD = re.compile(r'sample|échantillon|echantillon|\bset\b|coffret|bundle|candle|bougie|soap|savon|body|lotion|shower|cream|crème|hair|refill|recharge|travel|discovery|gift|trunk|engrav|lessive|hand|gel\b|decanter|atomi|mist|deodorant|oil|case|box|miniature|vaporisateur|lamp|diffuser', re.I)
CONC = re.compile(r'\b(eau de parfum|eau de toilette|extrait de parfum|extrait|parfum|edp|edt|elixir|cologne|intense|absolu)\b', re.I)
tot = 0
for k, hk in H.items():
    mine = {norm(n): (h, n, has) for h, n, has in ours if norm(h) == hk or norm(h).replace(' parfums', '') == hk}
    seen = set(); lines = []
    for p in json.load(open(root / f'data/brand-notes/{k}.json', encoding='utf-8')):
        t = re.sub(r'\s*[-–|]?\s*\d+\s*ml\b', '', p['title'], flags=re.I).strip()
        if BAD.search(p['title']) or BAD.search(p.get('type') or ''): continue
        cands = [norm(t), norm(CONC.sub('', t).strip()), norm(re.sub(r'^.*? - ', '', t))]
        hit = next((mine[c] for c in cands if c in mine), None)
        if not hit or hit[2] or (hit[0], hit[1]) in seen: continue
        b = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html.unescape(p['body'] or ''))).strip()
        if len(b) < 60: continue
        seen.add((hit[0], hit[1])); lines.append(f'{hit[0]} | {hit[1]} || {b[:480]}')
    (root / f'data/brand-notes/lecture-{k}.txt').write_text('\n'.join(lines) + '\n', encoding='utf-8'); tot += len(lines); print(k, len(lines))
print('total', tot)
