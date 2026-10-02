"""Faits vérifiés depuis les sites des marques (flux produits publics, data/brand-raw/*.json) -> facts.js.
Ne garde que des champs structurés (genre, notes listées en étiquettes) pour les parfums déjà présents dans la base ; aucun texte marketing recopié.
Usage : python3 tools/build-facts.py"""
import json, re, subprocess, pathlib, unicodedata
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower().replace('’', "'")) if not unicodedata.combining(c)))).strip()
ours = json.loads(subprocess.check_output(['node', '-e', "global.window=global;const D=require('./data.js');require('./index.js');const a=[];const HA=window.HOUSE_ALIAS||{};const norm=s=>String(s).normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();D.CATALOG.forEach(c=>a.push([HA[norm(c.house)]||c.house,c.name]));window.INDEX.forEach(([h,l])=>l.forEach(x=>a.push([h,x[0]])));console.log(JSON.stringify(a))"], cwd=root))
by_house = {}
for h, n in ours: by_house.setdefault(norm(h), {})[norm(n)] = (h, n)
HOUSES = {'parfums-de-marly': 'parfums de marly', 'creed': 'creed', 'diptyque': 'diptyque', 'tom-ford': 'tom ford', 'nasomatto': 'nasomatto', 'matiere-premiere': 'matiere premiere', 'amouage': 'amouage', 'xerjoff': 'xerjoff', 'bdk': 'bdk parfums', 'memo': 'memo paris', 'initio': 'initio', 'serge-lutens': 'serge lutens'}
BAD = re.compile(r'sample|échantillon|echantillon|\bset\b|coffret|bundle|candle|bougie|soap|savon|body|lotion|shower|cream|crème|hair|refill|recharge|travel|discovery|gift|trunk|engrav|lessive|hand|gel\b|decanter|atomi[sz]er|miniature|\bmini\b|duo|trio|ritual|diffuser|room|home|case|box|pouch|ml\b.*x|gwp|complimentary', re.I)
CONC = re.compile(r'\b(eau de parfum|eau de toilette|extrait de parfum|extrait|parfum|edp|edt|elixir)\b$', re.I)
NOTE_FR = [('orange blossom', "fleur d'oranger"), ('lily of the valley', 'muguet'), ('bergamot', 'bergamote'), ('rose', 'rose'), ('jasmine', 'jasmin'), ('vanilla', 'vanille'), ('musk', 'musc'), ('amber', 'ambre'), ('sandalwood', 'santal'), ('cedar', 'cèdre'), ('patchouli', 'patchouli'), ('lavender', 'lavande'), ('lemon', 'citron'), ('mandarin', 'mandarine'), ('pepper', 'poivre'), ('cinnamon', 'cannelle'), ('leather', 'cuir'), ('incense', 'encens'), ('saffron', 'safran'), ('tonka', 'tonka'), ('vetiver', 'vétiver'), ('cardamom', 'cardamome'), ('orange', 'orange'), ('caramel', 'caramel'), ('labdanum', 'labdanum'), ('neroli', 'néroli'), ('oud', 'oud'), ('violet', 'violette'), ('ylang', 'ylang-ylang'), ('nutmeg', 'muscade'), ('tuberose', 'tubéreuse'), ('ginger', 'gingembre'), ('benzoin', 'benjoin'), ('iris', 'iris'), ('tobacco', 'tabac'), ('coriander', 'coriandre'), ('apple', 'pomme'), ('plum', 'prune'), ('grapefruit', 'pamplemousse'), ('clove', 'girofle'), ('oakmoss', 'mousse de chêne'), ('mint', 'menthe'), ('basil', 'basilic'), ('rosemary', 'romarin'), ('blackcurrant', 'cassis'), ('honey', 'miel'), ('coffee', 'café'), ('cocoa', 'cacao'), ('chocolate', 'chocolat'), ('almond', 'amande'), ('peach', 'pêche'), ('pear', 'poire'), ('fig', 'figue'), ('lime', 'citron vert'), ('myrrh', 'myrrhe'), ('geranium', 'géranium'), ('cypress', 'cyprès'), ('juniper', 'genévrier'), ('sage', 'sauge'), ('thyme', 'thym'), ('pine', 'pin'), ('birch', 'bouleau'), ('guaiac', 'gaïac'), ('cashmere', 'cashmeran'), ('rum', 'rhum'), ('whisky', 'whisky'), ('coconut', 'noix de coco'), ('pineapple', 'ananas'), ('raspberry', 'framboise'), ('cherry', 'cerise'), ('lychee', 'litchi'), ('peony', 'pivoine'), ('magnolia', 'magnolia'), ('freesia', 'freesia'), ('narcissus', 'narcisse'), ('heliotrope', 'héliotrope'), ('mimosa', 'mimosa'), ('osmanthus', 'osmanthus'), ('gardenia', 'gardénia'), ('carnation', 'œillet'), ('cumin', 'cumin'), ('saffron', 'safran'), ('opoponax', 'opoponax'), ('elemi', 'élémi'), ('ambergris', 'ambre gris'), ('civet', 'civette'), ('castoreum', 'castoréum')]
NOT_NOTE = re.compile(r'sample|travel|attar|candle|summer|icons|hidden|beauty|gift|new|best|^xj|vegan|limited|exclusive|collection|set|wood$', re.I)
def notes_from_tags(tags):
    out = []
    for t in tags:
        tl = t.lower()
        if NOT_NOTE.search(tl) and not any(k in tl for k, _ in NOTE_FR): continue
        for k, v in NOTE_FR:
            if k in tl:
                if v not in out: out.append(v)
                break
    return out
def gender(brand, tags):
    T = {t.lower() for t in tags}
    if brand == 'creed': m, f = bool(T & {'men', 'gender:male'}), 'women' in T; u = 'universal' in T
    elif brand == 'memo': m, f, u = 'for him' in T, 'for her' in T, False
    elif brand == 'parfums-de-marly': m, f, u = 'men' in T, 'women' in T, False
    elif brand == 'tom-ford': m, f, u = bool(T & {'mens fragrance', 'mens cologne'}), bool(T & {'womens fragrance', 'womens perfume'}), False
    elif brand == 'serge-lutens': m, f, u = False, False, 'gender|mixte' in T
    else: return None
    if u or (m and f): return 'u'
    return 'm' if m else 'f' if f else None
facts, src = {}, {}
votes = {}
for brand, hkey in HOUSES.items():
    mine = by_house.get(hkey, {})
    for p in json.load(open(root / f'data/brand-raw/{brand}.json', encoding='utf-8')):
        t = p['title'].strip()
        # vote de genre : n'importe quel produit (coffret, soin…) dont le titre commence par le nom du parfum porte la même étiquette de genre
        gg = gender(brand, p['tags'])
        if gg:
            nt_ = norm(t); best = max((n for n in mine if len(n) >= 4 and (nt_ == n or nt_.startswith(n + ' '))), key=len, default=None)
            if best: votes.setdefault((hkey, best), set()).add(gg)
        if BAD.search(t) or BAD.search(p.get('product_type') or ''): continue
        t0 = re.sub(r'\s*[-–|]?\s*\d+\s*ml\b', '', t, flags=re.I).strip()
        cands = {norm(t0), norm(CONC.sub('', t0).strip())}
        hit = next((mine[c] for c in cands if c in mine), None)
        if not hit: continue
        g = gender(brand, p['tags']); nt = notes_from_tags(p['tags']) if brand == 'xerjoff' else []
        if not g and not nt: continue
        k = norm(hit[0]) + '|' + norm(hit[1]); e = facts.setdefault(k, {})
        if g: e['g'] = g
        if nt and 'n' not in e: e['n'] = nt[:10]
        src[k] = brand
# notes lues sur Luckyscent (data/web-resolved.json) : traduites avec la table ci-dessus ; une note inconnue est ignorée plutôt que devinée
wp = root / 'data/web-resolved.json'
if wp.exists():
    for r in json.loads(wp.read_text(encoding='utf-8')):
        nt = notes_from_tags(r.get('notes') or [])
        if len(nt) < 3: continue
        k = norm(r['house']) + '|' + norm(r['name']); e = facts.setdefault(k, {})
        if 'n' not in e: e['n'] = nt[:10]
        src.setdefault(k, 'luckyscent')
for (hkey, n), v in votes.items():
    if len(v) != 1: continue
    h = by_house[hkey][n]; k = norm(h[0]) + '|' + norm(h[1]); e = facts.setdefault(k, {})
    e.setdefault('g', next(iter(v))); src.setdefault(k, next(b for b, hk in HOUSES.items() if hk == hkey))
(root / 'facts.js').write_text('// Généré par tools/build-facts.py : faits vérifiés (genre, notes) tirés des sites des marques, pour des parfums de la base.\nwindow.FACTS = ' + json.dumps(facts, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
import collections
print(len(facts), 'parfums renseignés', dict(collections.Counter(src.values())), '| genre :', sum('g' in v for v in facts.values()), '| notes :', sum('n' in v for v in facts.values()))
