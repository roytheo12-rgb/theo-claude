"""Annuaire des parfumeries de France pour la carte « Où acheter » : lit le registre Sirene (APE 47.75Z) fourni en JSON, garde les enseignes
et les commerces qui portent un nom de parfumerie (jamais un simple nom de personne), les classe (niche, premium, mainstream, indépendante,
grand magasin, cosmétiques) et écrit shops.js sous forme compacte. Usage : python3 tools/build-shops.py registre.json"""
import json, re, sys, pathlib, unicodedata
root = pathlib.Path(__file__).resolve().parent.parent
src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else root / 'data' / 'parfumeries_france_registry.json')
d = json.loads(src.read_text(encoding='utf-8'))
def up(s): return unicodedata.normalize('NFD', s or '').encode('ascii', 'ignore').decode().upper()
CHAIN = re.compile(r'SEPHORA|NOCIBE|MARIONNAUD|DOUGLAS|ADOPT|BEAUTY SUCCESS|FRAGONARD|YVES ROCHER|RITUALS')
PREM = re.compile(r'SEPHORA|NOCIBE|MARIONNAUD|DOUGLAS')
MAIN = re.compile(r'ADOPT|BEAUTY SUCCESS|YVES ROCHER|RITUALS|FRAGONARD')
GM = re.compile(r'PRINTEMPS|LAFAYETTE|BON MARCHE|\bBHV\b')
NICHE = re.compile(r'BULY|JOVOY|\bNOSE\b|PARFUMERIE GENERALE|LIQUIDES IMAGINAIRES|AUPARFUM')
PERF = re.compile(r'PARFUM|FRAGRANCE|OLFACT|BULY|JOVOY|\bNOSE\b')
COS = re.compile(r'BEAUTE|BEAUTY|COSMET')
SKIP = re.compile(r'DISTRIBUTION|DIFFUSION|INTERNATIONAL|LOGISTIC|IMPORT|EXPORT|GERMANY|USA|LUXEMBOURG|HOLDING|GROUPE')
out, city = [], {}
for x in d:
    try: float(x['latitude']); float(x['longitude'])
    except (TypeError, ValueError): continue
    if 'NON-DIFFUSIBLE' in (x['name'] or '') + (x['address'] or ''): continue
    n = up(x['name'])
    seg = 'gm' if GM.search(n) else 'niche' if NICHE.search(n) else 'prem' if PREM.search(n) else 'main' if MAIN.search(n) else 'ind' if PERF.search(n) else 'cos' if COS.search(n) else ''
    if not seg or (SKIP.search(n) and seg in ('ind', 'cos')): continue
    m = re.findall(r'\(([^)]{3,})\)', x['name'])
    chain = re.search(r'SEPHORA|NOCIBE|MARIONNAUD|DOUGLAS|ADOPT|BEAUTY SUCCESS|FRAGONARD|YVES ROCHER|RITUALS|PRINTEMPS|LAFAYETTE|BON MARCHE|BHV|BULY|JOVOY', n)
    LAB = {'NOCIBE': 'Nocibé', 'BON MARCHE': 'Le Bon Marché', 'LAFAYETTE': 'Galeries Lafayette', 'BULY': 'Officine Universelle Buly', 'ADOPT': 'Adopt\'', 'YVES ROCHER': 'Yves Rocher', 'BEAUTY SUCCESS': 'Beauty Success', 'BHV': 'BHV'}
    nm = (LAB.get(chain.group(0)) or chain.group(0).title()) if chain and seg in ('prem', 'main', 'gm', 'niche') and chain.group(0) != 'JOVOY' else None
    nm = nm if nm else None
    if nm is None:
      nm = m[-1] if m and not re.search(r'^\(?\s*\d', m[-1]) and seg in ('ind', 'cos') else re.sub(r'\s*\(.*$', '', x['name'])
    nm = ' '.join(w.capitalize() if len(w) > 3 else w for w in nm.title().split())
    a = x['address'] or ''; a = re.sub(r'\s*' + re.escape(x['postal_code'] or '') + r'\s+' + re.escape(x['city'] or '') + r'$', '', a) if x['postal_code'] else a
    out.append([nm.strip(), a.title().strip(), x['postal_code'] or '', (x['city'] or '').title(), round(float(x['latitude']), 4), round(float(x['longitude']), 4), seg])
seen, res = set(), []
for r in out:
    k = (r[0].lower(), r[4], r[5])
    if k in seen: continue
    seen.add(k); res.append(r)
cities = {}
for r in res: cities.setdefault(r[3], []).append((r[4], r[5]))
CT = sorted([[c, round(sum(p[0] for p in v) / len(v), 3), round(sum(p[1] for p in v) / len(v), 3)] for c, v in cities.items() if c])
(root / 'shops.js').write_text('// Généré par tools/build-shops.py : parfumeries de France (registre Sirene APE 47.75Z, adresses des sièges). Champs : nom, adresse, code postal, ville, lat, lon, segment.\nwindow.SHOPS = ' + json.dumps(res, ensure_ascii=False, separators=(',', ':')) + ';\nwindow.SHOP_CITIES = ' + json.dumps(CT, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
import collections
print(len(res), 'adresses', len(CT), 'villes', collections.Counter(r[6] for r in res))
