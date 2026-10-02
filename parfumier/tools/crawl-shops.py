#!/usr/bin/env python3
"""Catalogues publics (Shopify /products.json) de boutiques de parfumerie : vendor, titre, type, première image -> data/web-raw/shops/<boutique>.json
1 requête / 1,5 s, pages de 250 produits, aucun contournement. Usage : python3 tools/crawl-shops.py [boutique ...]"""
import json, sys, time, pathlib, urllib.request
root = pathlib.Path(__file__).resolve().parent.parent
SHOPS = {'aedes': 'www.aedes.com', 'lessenteurs': 'www.lessenteurs.com', 'zgo': 'zgoperfumery.com', 'fragrancesline': 'www.fragrancesline.com', 'parfumexquis': 'www.parfumexquis.us', 'lamaisonduparfum': 'www.lamaisonduparfum.com', 'olfactif': 'www.olfactif.com', 'amyris': 'www.amyrisessenze.com', 'parisgallery': 'parisgallery.ae', 'soavantgarde': 'www.so-avant-garde.com', 'premiereavenue': 'premiereavenue.fr', 'fragrancelord': 'fragrancelord.com', 'thescentcity': 'www.thescentcity.com', 'saison': 'www.saison.com.au', 'escentual': 'www.escentual.com', 'perfumedefrance': 'perfumedefrance.com'}
for k in (sys.argv[1:] or list(SHOPS)):
    out = []
    for page in range(1, 80):
        try: d = json.load(urllib.request.urlopen(urllib.request.Request(f'https://{SHOPS[k]}/products.json?limit=250&page={page}', headers={'User-Agent': 'Mozilla/5.0 (compatible; SillageBot/1.0)'}), timeout=40))
        except Exception as e: print(k, page, 'stop', str(e)[:60]); break
        ps = d.get('products', [])
        if not ps: break
        for p in ps: out.append({'v': p.get('vendor', ''), 't': p['title'], 'k': p.get('product_type', ''), 'i': ((p.get('images') or [{}])[0].get('src') or ''), 'h': p.get('handle', '')})
        time.sleep(1.5)
    json.dump(out, open(root / f'data/web-raw/shops/{k}.json', 'w', encoding='utf-8'), ensure_ascii=False)
    print(k, len(out), flush=True)
