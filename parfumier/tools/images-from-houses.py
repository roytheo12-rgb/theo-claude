"""Photos produit lues chez les maisons elles-mêmes : Hermès (pages catégorie), Bon Parfumeur, Atelier des Ors et D'Orsay (boutiques Shopify).
Seuls les parfums de notre base sont retenus (nom normalisé identique). Sortie : data/web-raw/images-extra-houses.jsonl, lu ensuite par build-web.py.
Usage : python3 tools/images-from-houses.py"""
import json, re, html, subprocess, pathlib, unicodedata, urllib.request, time
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower()) if not unicodedata.combining(c)))).strip()
idx = json.loads(subprocess.check_output(['node', '-e', "global.window=global;require('./data.js');require('./index.js');console.log(JSON.stringify(window.INDEX))"], cwd=root))
names = {}
for h, arr in idx:
    for n, *_ in arr: names.setdefault(norm(h), {})[norm(n)] = (h, n)
def get(u, binary=False):
    return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 SillageBot/1.0 (contact roytheo12@gmail.com)'}), timeout=40).read()
rows = []
def add(house, cand, image, url):
    tbl = names.get(norm(house), {})
    for c in cand:
        k = norm(c)
        if k in tbl:
            h, n = tbl[k]
            if not any(r['house'] == h and r['name'] == n for r in rows): rows.append({'house': h, 'name': n, 'image': image, 'url': url})
# ---- Hermès : pages catégorie servies sans blocage (femme, homme, Hermessence, parfums)
CONC = r'\s+(eau de parfum intense|eau de parfum|eau de toilette|eau de cologne|soie de parfum|parfum|eau fraîche|extrait)\s*$'
seen = set()
for page in ('', 'femme/', 'homme/', 'collection-hermessence/'):
    try: h = get('https://www.hermes.com/fr/fr/category/parfums/' + page).decode('utf-8', 'ignore')
    except Exception as e: print('hermes', page, e); continue
    imgs = {}
    for u in re.findall(r'//assets\.hermes\.com/is/image/hermesproduct/[^"\s<>]+', h):
        u = html.unescape(u); imgs.setdefault(u.split('?')[0].split('/')[-1].split('_')[0], []).append(u.split('?')[0])
    for m in re.finditer(r'class="product-item-name"[^>]*href="(/fr/fr/product/[^"]+)" title="([^"]+)"', h):
        path, t = m.group(1), html.unescape(m.group(2)).replace('’', "'")
        if path in seen: continue
        seen.add(path)
        code = path.rstrip('/').split('-')[-1][1:]; c = imgs.get(code) or imgs.get(re.sub(r'V0$', '', code))
        if not c: continue
        # on préfère le flacon seul (front) à la photo portée / en groupe
        img = 'https:' + sorted(c, key=lambda x: 0 if 'front' in x else 1)[0] + '?wid=900&hei=900'
        base = re.sub(CONC, '', t, flags=re.I).strip()
        base = re.sub(r'\s+(eau de parfum|eau de toilette)\s*$', '', base, flags=re.I)
        cand = [base, 'Hermessence ' + base, base.replace(',', '')]
        if 'hermessence' in page: cand = ['Hermessence ' + base, base]
        add('Hermès', cand, img, 'https://www.hermes.com' + path)
    time.sleep(1)
print('hermes', len(rows))
# ---- Boutiques Shopify
def shop(house, domain, titlefn, imgrank, skip=lambda p: False):
    n0 = len(rows); page = 1
    while page <= 4:
        try: j = json.loads(get(f'https://{domain}/products.json?limit=250&page={page}'))['products']
        except Exception as e: print(domain, e); break
        if not j: break
        for p in j:
            if skip(p) or not p['images']: continue
            cand = titlefn(p['title'])
            if not cand: continue
            ims = sorted(p['images'], key=lambda i: imgrank(i['src']))
            if imgrank(ims[0]['src']) >= 9: continue
            add(house, cand, ims[0]['src'].split('?')[0], f'https://{domain}/products/{p["handle"]}')
        page += 1; time.sleep(1)
    print(house, len(rows) - n0)
# Bon Parfumeur : numéro du parfum ; flacon 100 ml en premier, sinon boîte + spray. Jamais coffrets, échantillons GWP, cartes.
def bp_title(t):
    m = re.match(r'^(\d{3})\b', t.strip())
    return [m.group(1)] if m else None
def bp_rank(u):
    f = u.split('/')[-1]
    if re.search(r'GWP|coffret|Coffret|Gift|Box|MS_|2\.5|2ml|7\.5|15ml|B2B|Bundle|TBYB|Produit_', f): return 9
    if 'Packshot_Flacon' in f and '100ml' in f: return 0
    if f.startswith('Spray_') or 'Packshot' in f: return 1
    return 2
shop('Bon Parfumeur', 'www.bonparfumeur.com', bp_title, bp_rank, skip=lambda p: p.get('product_type') in ('GWP', 'Box set', 'OZ Bundle') or 'Gift' in p['title'])
# Atelier des Ors : flacons seuls (EDP / extrait), pas les échantillons ni les coffrets
def ado_title(t):
    t = re.sub(r'\b(2\.5ml|15ml|Extrait|Édition Limitée.*|Travel .*|- .*)$', '', t, flags=re.I).strip()
    return [t, t.replace('Omeyyade', 'Omeyyad'), t.replace('Choeur', 'Chœur')]
shop("Atelier des Ors", 'atelierdesors.com', ado_title, lambda u: 0, skip=lambda p: p.get('product_type') not in ('Eau de Parfum', '', None) or 'Candle' in p['title'] or 'Carte' in p['title'] or '15ml' in p['title'])
# D'Orsay : on relie le code d'initiales (E.Q., C.G., J.R., G.A., P.S.…) au nom de la base
def dor_title(t):
    t = re.sub(r'\s+-\s+(Extrait de Parfum|Eau de Parfum|Eau de Toilette).*$', '', t, flags=re.I).strip()
    m = re.search(r'\b([A-Z]\.[A-Z]\.)', t)
    out = [re.sub(r'\.$', '', t)]
    if m:
        ini = m.group(1); tbl = names.get(norm("D'Orsay"), {})
        out += [n for k, (h, n) in tbl.items() if k.startswith(norm(ini))]
        out.append(re.sub(r'^.*?\.\s*', '', t))
    return out
shop("D'Orsay", 'dorsay.com', dor_title, lambda u: 0, skip=lambda p: p.get('product_type') != 'Parfums')
out = root / 'data/web-raw/images-extra-houses.jsonl'
out.write_text('\n'.join(json.dumps(r, ensure_ascii=False) for r in rows) + '\n', encoding='utf-8')
print(len(rows), 'lignes ->', out)
