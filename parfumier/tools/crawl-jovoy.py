#!/usr/bin/env python3
"""Lit les fiches produit publiques de Jovoy (robots.txt : pages produit autorisées ; 1 requête / 1,5 s) pour les faits structurés :
maison, nom, notes de tête / cœur / fond (en français), famille, genre, sillage, saisons, jour/nuit, prix. Aucun texte rédactionnel recopié.
Écrit data/web-raw/jovoy.jsonl (reprise automatique). Usage : python3 tools/crawl-jovoy.py [--maisons liste,separee,par,virgules]"""
import re, json, html, sys, time, pathlib, urllib.request, unicodedata
root = pathlib.Path(__file__).resolve().parent.parent
OUT = root / 'data/web-raw/jovoy.jsonl'; OUT.parent.mkdir(parents=True, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (compatible; SillageBot/1.0)'}
def get(u):
    for i in range(3):
        try: return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read().decode('utf-8', 'replace')
        except Exception as e: time.sleep(2 + 3 * i)
    return ''
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s).lower()) if not unicodedata.combining(c)))).strip()
done = set()
if OUT.exists():
    for l in OUT.open(encoding='utf-8'):
        try: done.add(json.loads(l)['url'])
        except Exception: pass
brands = sorted(set(re.findall(r'href="(https://www\.jovoyparis\.com/fr/marques/(\d+)-([^"]+))"', get('https://www.jovoyparis.com/fr/marques'))), key=lambda x: int(x[1]))
only = None
if '--maisons' in sys.argv: only = {norm(x) for x in sys.argv[sys.argv.index('--maisons') + 1].split(',')}
print(len(brands), 'marques')
def text(s): return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', s))).strip()
def parse(u, s):
    t = re.sub(r'<script.*?</script>|<style.*?</style>', '', s, flags=re.S)
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', t, re.S)
    if not h1: return None
    name = text(h1.group(1))
    lines = [x for x in (text(l) for l in re.sub(r'<[^>]+>', '\n', t).split('\n')) if x]
    def sect(label, stops):
        if label not in lines: return []
        i = lines.index(label) + 1; out = []
        while i < len(lines) and lines[i] not in stops: out.append(lines[i]); i += 1
        return out
    # le bloc détaillé « Notes olfactives » (après le premier)
    try: k = [i for i, l in enumerate(lines) if l == 'Notes olfactives'][-1]
    except IndexError: return None
    seg = lines[k:k + 80]
    def part(a, b):
        if a not in seg: return []
        i = seg.index(a) + 1; o = []
        while i < len(seg) and seg[i] not in b and not seg[i].startswith('Profil'): o.append(seg[i]); i += 1
        return o
    tete, coeur, fond = part('Notes de Tête', ['Notes de Coeur', 'Notes de Fond']), part('Notes de Coeur', ['Notes de Fond']), part('Notes de Fond', [])
    prof = []
    if 'Profil olfactif' in seg[1:]:
        i = seg.index('Profil olfactif', 1) + 1
        while i < len(seg) and seg[i] not in ('Description', 'Afficher les ingrédients'): prof.append(seg[i]); i += 1
    i = lines.index(name) if name in lines else 0
    brand = next((lines[j] for j in range(i + 1, min(i + 4, len(lines))) if lines[j].isupper()), '')
    price = re.search(r'(\d[\d\s]*,\d\d) €', ' '.join(lines[i:i + 12])); fam = ''
    for j in range(i, min(i + 14, len(lines))):
        if re.match(r'^(Boisé|Fleuri|Ambré|Aromatique|Gourmand|Hespéridé|Cuiré|Épicé|Frais|Musqué|Oriental|Vert|Aquatique|Fruité)', lines[j]): fam = lines[j]; break
    return {'url': u, 'brand': brand, 'name': name, 'tete': tete[:12], 'coeur': coeur[:12], 'fond': fond[:12], 'profil': prof[:8], 'famille': fam, 'prix': price.group(1) if price else ''}
n = 0
with OUT.open('a', encoding='utf-8') as out:
    for u, bid, slug in brands:
        if only and not any(o in norm(slug.replace('-', ' ')) for o in only): continue
        links, page = [], 1
        while page < 15:
            s = get(f'{u}?page={page}'); time.sleep(1.5)
            ls = [x for x in re.findall(r'href="(https://www\.jovoyparis\.com/fr/[a-z-]+/\d+-[^"#?]+\.html)"', s) if '/coffrets/' not in x]
            new = [x for x in dict.fromkeys(ls) if x not in links]
            if not new: break
            links += new; page += 1
        print(slug, len(links), flush=True)
        for l in links:
            if l in done: continue
            r = parse(l, get(l)); time.sleep(1.5)
            if r: r['marque'] = slug
            if r: out.write(json.dumps(r, ensure_ascii=False) + '\n'); out.flush(); n += 1
print('fiches lues', n)
