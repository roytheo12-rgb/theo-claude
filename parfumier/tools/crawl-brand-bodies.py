#!/usr/bin/env python3
"""Télécharge les flux produits publics Shopify (/products.json) des maisons, avec la description (body_html) : data/brand-notes/<maison>.json.
Respecte le site : une requête toutes les 1,5 s, pages de 250 produits, pas de contournement."""
import json, sys, time, urllib.request, pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
SITES = {'tom-ford': 'www.tomfordbeauty.com', 'creed': 'www.creedboutique.com', 'parfums-de-marly': 'www.parfums-de-marly.com', 'xerjoff': 'www.xerjoff.com', 'amouage': 'www.amouage.com', 'initio': 'www.initioparfums.com', 'penhaligons': 'www.penhaligons.com', 'atelier-des-ors': 'www.atelierdesors.com', 'histoires-de-parfums': 'www.histoiresdeparfums.com', 'bdk': 'www.bdkparfums.com', 'memo': 'www.memoparis.com', 'nasomatto': 'www.nasomatto.com', 'houbigant': 'www.houbigant-parfum.com', 'essential-parfums': 'www.essentialparfums.com', 'santa-maria-novella': 'www.smnovella.com', 'clive-christian': 'www.clivechristian.com', 'bon-parfumeur': 'www.bonparfumeur.com'}
only = sys.argv[1:] or list(SITES)
for k in only:
    host = SITES[k]; out = []
    for page in range(1, 12):
        try:
            req = urllib.request.Request(f'https://{host}/products.json?limit=250&page={page}', headers={'User-Agent': 'Mozilla/5.0 (compatible; SillageBot/1.0)'})
            d = json.load(urllib.request.urlopen(req, timeout=25))
        except Exception as e:
            print(k, 'page', page, 'erreur', e); break
        ps = d.get('products', [])
        if not ps: break
        for p in ps: out.append({'title': p['title'], 'type': p.get('product_type', ''), 'tags': p.get('tags', []), 'body': p.get('body_html') or '', 'handle': p.get('handle')})
        time.sleep(1.5)
    json.dump(out, open(root / f'data/brand-notes/{k}.json', 'w', encoding='utf-8'), ensure_ascii=False)
    print(k, len(out))
