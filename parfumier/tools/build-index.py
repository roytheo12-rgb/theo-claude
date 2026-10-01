"""Construit index.js (grand index des parfums, sans doublons) à partir de data/raw/*.txt.
Chaque ligne brute : « Maison — Nom — Concentration ». Usage : python3 tools/build-index.py"""
import re, json, unicodedata, pathlib, subprocess, collections
root = pathlib.Path(__file__).parent.parent
def norm(s):
    s = unicodedata.normalize('NFD', str(s)).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()

# Maisons : variantes d'écriture et sous-collections ramenées à une seule maison
HOUSE = {
 'by kilian': 'Kilian', 'kilian paris': 'Kilian', 'kilian': 'Kilian',
 'frederic malle': 'Frédéric Malle', 'roja': 'Roja Parfums', 'roja parfums': 'Roja Parfums',
 'parfums de nicolai': 'Nicolaï', 'nicolai parfumeur createur': 'Nicolaï', 'tauer perfumes': 'Andy Tauer',
 'houbigant paris': 'Houbigant', 'initio parfums prives': 'Initio',
 'maison margiela replica': 'Maison Margiela', 'dior la collection privee': 'Dior', 'chanel les exclusifs': 'Chanel',
 'guerlain l art la matiere': 'Guerlain', 'bvlgari le gemme': 'Bvlgari', 'hermes hermessence': 'Hermès',
 'ysl le vestiaire des parfums': 'Yves Saint Laurent', 'van cleef arpels collection extraordinaire': 'Van Cleef & Arpels',
 'dolce gabbana velvet collection': 'Dolce & Gabbana', 'gucci the alchemist s garden': 'Gucci', 'tom ford private blend': 'Tom Ford',
 'cartier les heures de parfum': 'Cartier', 'cartier collection': 'Cartier', 'prada olfactories': 'Prada', 'fendi private': 'Fendi',
 'givenchy la collection particuliere': 'Givenchy', 'givenchy l atelier de givenchy': 'Givenchy', 'mfk': 'Maison Francis Kurkdjian',
 'emporio armani': 'Armani', 'sospiro perfumes': 'Sospiro', 'd orsay': "D'Orsay", 'dorsay': "D'Orsay", 'omanluxury': 'Oman Luxury', 'oman luxury': 'Oman Luxury', 'ysl': 'Yves Saint Laurent', 'yves saint laurent beaute': 'Yves Saint Laurent',
 'giorgio armani': 'Armani', 'thierry mugler': 'Mugler', 'christian dior': 'Dior', 'annick goutal': 'Maison Goutal', 'mdci parfums': 'MDCI', 'frederic malle': 'Frédéric Malle', 'jo malone london': 'Jo Malone', 'ella k parfums': 'Ella K', 'jo malone': 'Jo Malone', 'gucci': 'Gucci', 'jovoy paris': 'Jovoy', 'jovoy': 'Jovoy', 'rabanne': 'Rabanne', 'paco rabanne': 'Rabanne',
 'maison martin margiela': 'Maison Margiela', 'margiela': 'Maison Margiela', 'bulgari': 'Bvlgari', 'diptyque paris': 'Diptyque', 'byredo parfums': 'Byredo', 'le labo fragrances': 'Le Labo', 'bdk': 'BDK Parfums', 'bdk parfums': 'BDK Parfums',
 'les bains guerbois': 'Les Bains Guerbois', 'memo': 'Memo Paris', 'memo paris': 'Memo Paris', 'maison crivelli': 'Maison Crivelli', 'loewe paula s ibiza': 'Loewe', 'loewe botanical rainbow': 'Loewe',
}
# Lignes « collection privée » des grandes maisons (repérées dans l'écriture brute de la maison) : étiquette P
CP_KEYS = ('armani prive', 'collection privee', 'les exclusifs', 'l art la matiere', 'le gemme', 'hermessence', 'le vestiaire', 'collection extraordinaire', 'velvet collection', 'private blend', 'olfactories', 'l atelier de givenchy', 'cartier collection', 'les heures')
PREFIX = re.compile(r'^(replica|les exclusifs|le gemme|olfactories|collection extraordinaire|eau triple)\s+', re.I)
CONC = {'eau de parfum': 'EDP', 'eau de toilette': 'EDT', 'extrait': 'EXT', 'extrait de parfum': 'EXT', 'extreme': 'EXT', 'esprit de parfum': 'EXT',
        'parfum': 'PAR', 'parfum cologne': 'COL', 'eau de cologne': 'COL', 'eau de cologne forte': 'COL', 'cologne': 'COL', 'cologne intense': 'COL',
        'cologne absolue': 'COL', 'eau de parfum extreme': 'EXT', 'eau de parfum intense': 'EDP', 'elixir precieux': 'EXT', 'collection': 'EDP', 'eau triple': 'COL', 'hair mist': None}
SUFFIX = re.compile(r'(?<!\bde)(?<!\ble)\s+(extrait de parfum|extrait|parfum|eau de parfum|eau de toilette|eau de cologne)$', re.I)

NAME_ALIAS = {('burberry', 'her'): 'Burberry Her', ('santa maria novella', 'potpourri'): 'Pot Pourri', ('acqua di parma', 'colonia c l u b'): 'Colonia Club', ('ella k', 'musk k'): 'Musc K', ('hermes', 'un jardin de monsieur li'): 'Le Jardin de Monsieur Li', ('penhaligon s', 'the blazing mister sam'): 'The Blazing Mr Sam', ('xerjoff', 'torino 21'): 'Torino21', ('dior', 'homme'): 'Dior Homme', ('dior', 'homme intense'): 'Dior Homme Intense', ('maison francis kurkdjian', 'le beau'): 'Le Beau Parfum', ('', 'le beau parfum'): 'Le Beau Parfum', ('jean paul gaultier', 'santal paname'): 'Santal de Paname', ('frederic malle', 'un fleur de cassie'): 'Une Fleur de Cassie'}  # coquilles de la liste
raw = []
for f in sorted((root / 'data/raw').glob('*.txt')):
    raw += [l.strip() for l in f.read_text(encoding='utf-8').splitlines() if l.strip()]

# catalogue existant : pas de doublon avec lui
cat = json.loads(subprocess.check_output(['node', '-e', "const d=require('./data.js');console.log(JSON.stringify(d.CATALOG.map(c=>[c.house,c.name])))"], cwd=root))
BASES = sorted({v for v in HOUSE.values()} | {h for h, _ in cat}, key=lambda b: -len(norm(b)))
def canon_house(h):
    n = norm(h)
    if n in HOUSE: return HOUSE[n]
    for b in BASES:                       # « Jo Malone London » -> « Jo Malone », « Prada Olfactories » -> « Prada »
        nb = norm(b)
        if n == nb: return b
        if n.startswith(nb + ' ') and nb not in ('maison', 'les', 'la', 'le'): return b
    return h.strip()
SOSPIRO = {'erba pura', 'vibrato', 'il padrino', 'dolce melodia'}      # Sospiro est une maison à part entière (pas une ligne Xerjoff)
_canon = canon_house
def canon_house_n(h, name=''):
    c = _canon(h)
    return 'Sospiro' if norm(c) in ('xerjoff', 'sospiro') and norm(name) in SOSPIRO else c
existing = {(norm(canon_house(h)), norm(PREFIX.sub('', n))) for h, n in cat}
existing |= {(norm(canon_house(h)), re.sub(r' (edp|edt)$', '', norm(n))) for h, n in cat}

seen = {}; dup = skipped_cat = skipped_other = 0
order = []
for line in raw:
    parts = [p.strip() for p in line.split(' — ')]
    if len(parts) < 2: skipped_other += 1; continue
    if len(parts) == 2:                   # « Maison — Nom Eau de Toilette » : la concentration est au bout du nom
        house, name = parts[0], parts[1]; m = SUFFIX.search(name); conc = CONC.get(norm(m.group(1)), 'EDP') if m else 'EDP'
    else:
        house, conc_raw = parts[0], parts[-1]
        if norm(conc_raw) in CONC: name = ' — '.join(parts[1:-1]).replace(' — ', ' '); conc = CONC[norm(conc_raw)]
        else: name = ' — '.join(parts[1:]).replace(' — ', ' '); conc = 'EDP'   # le dernier morceau est un nom (ex. Gucci — The Alchemist's Garden — A Gloaming Night)
    name = re.sub(r"^the alchemist.s garden\s+", '', name, flags=re.I)
    if conc is None: skipped_other += 1; continue          # brumes pour cheveux : pas des parfums
    cp = any(k in norm(house) for k in CP_KEYS) or bool(re.search(r"alchemist.s garden", line, re.I))
    house = canon_house_n(house, name)
    name = re.sub(r'\?$', '', name).strip()
    name = PREFIX.sub('', name)
    name = SUFFIX.sub('', name).strip() or name
    if not name: skipped_other += 1; continue
    name = NAME_ALIAS.get((norm(house), norm(name)), name)
    key = (norm(house), norm(name))
    if key in existing: skipped_cat += 1; continue
    if key not in seen:
        seen[key] = {'house': house, 'name': name, 'conc': [], 'p': False}; order.append(key)
    else:
        dup += 1
    if conc not in seen[key]['conc']: seen[key]['conc'].append(conc)
    if cp: seen[key]['p'] = True


def clean_name(name):
    name = re.sub(r'\?$', '', name).strip()
    name = PREFIX.sub('', name)
    name = SUFFIX.sub('', name).strip() or name
    return NAME_ALIAS.get(('', norm(name)), name)

# ---- Nez : « Parfumeur|Maison|Parfum;Parfum… » -> chaque parfum est rattaché à son nez (et ajouté à l'index s'il manque)
nose_by = collections.OrderedDict(); nose_names = collections.OrderedDict()
for line in (root / 'data/noses.txt').read_text(encoding='utf-8').splitlines():
    line = line.strip()
    if not line or line.startswith('#'): continue
    nose, h_raw, names = [x.strip() for x in line.split('|', 2)]
    for nm in [x.strip() for x in names.split(';') if x.strip()]:
        house = canon_house(h_raw)
        name = NAME_ALIAS.get((norm(house), norm(clean_name(nm))), clean_name(nm))
        if not name: continue
        house = canon_house_n(h_raw, name)
        key = (norm(house), norm(name)); k2 = key[0] + ' ' + key[1]
        if key not in existing and key not in seen:
            seen[key] = {'house': house, 'name': name, 'conc': ['EDP'], 'p': False}; order.append(key)
        lst = nose_by.setdefault(k2, [])
        if nose not in lst: lst.append(nose)
        nose_names[nose] = nose_names.get(nose, 0) + 1

# ---- Photos (data/imgmap2.txt : N|Maison|Parfum|Concentration) : chaque photo est rattachée à UN parfum.
# Variantes (Extrait, Absolu, Esprit de Parfum, Parfum, Intense, Elixir, EDT quand l'EDP a aussi sa photo) : une fiche à part
# « Nom Variante » seulement si la version de base existe aussi ; sinon la photo va sur la fiche existante (pas de doublon).
VAR = {'extrait': ('Extrait', 'EXT'), 'extrait de parfum': ('Extrait', 'EXT'), 'absolu': ('Absolu', 'EXT'), 'absolu de parfum': ('Absolu', 'EXT'),
       'esprit de parfum': ('Esprit de Parfum', 'EXT'), 'parfum': ('Parfum', 'PAR'), 'intense': ('Intense', 'EDP'), 'elixir': ('Elixir', 'EXT')}
ALT = {'Extrait': ['Extrait', 'Extrait de Parfum', "L'Extrait"], 'Absolu': ['Absolu', 'Absolu de Parfum'], 'Esprit de Parfum': ['Esprit de Parfum', 'Esprit'], 'Parfum': ['Parfum'], 'Intense': ['Intense'], 'Elixir': ['Elixir']}
cat_exact = {}
for h, n in cat:
    cat_exact[(norm(canon_house(h)), norm(PREFIX.sub('', n)))] = (h, n)
rows = []
for line in (root / 'data/imgmap2.txt').read_text(encoding='utf-8').splitlines():
    line = line.strip()
    if not line or line.startswith('#'): continue
    n, h_raw, nm, conc = [x.strip() for x in (line.split('|') + [''])[:4]]
    rows.append({'n': int(n), 'raw_house': h_raw, 'raw_name': nm, 'conc': conc})
groups = collections.defaultdict(set)
for r in rows:
    if r['raw_house'] == 'NEZ': continue
    r['house'] = canon_house_n(r['raw_house'], r['raw_name']); r['base'] = NAME_ALIAS.get((norm(r['house']), norm(r['raw_name'])), r['raw_name'])
    groups[(norm(r['house']), norm(r['base']))].add(norm(r['conc']))
def find(house, name):
    k = (norm(house), norm(name))
    if k in cat_exact: return ('cat', cat_exact[k][0], cat_exact[k][1], k)
    if k in seen: return ('idx', seen[k]['house'], seen[k]['name'], k)
    return None
def create(house, name, code, flag=False):
    k = (norm(house), norm(name)); seen[k] = {'house': house, 'name': name, 'conc': [code], 'p': flag}; order.append(k)
    return ('new', house, name, k)
old_keys = set(re.findall(r'"([a-z0-9 ]+\|[a-z0-9 ]+)"', (root / 'imgdb.js').read_text(encoding='utf-8'))) if (root / 'imgdb.js').exists() else set()
hand = {norm(k) for k in re.findall(r"'((?:[^'\\]|\\.)+)':\s*\{\s*s:\s*'img/", (root / 'v2/app.js').read_text(encoding='utf-8'))}
def has_old_photo(house, name): return (norm(house) + '|' + norm(name)) in old_keys or norm(name) in hand
created, resolved, variant_of = [], {}, {}
for r in rows:
    if r['raw_house'] == 'NEZ': continue
    house, base, c = r['house'], r['base'], norm(r['conc']); g = groups[(norm(house), norm(base))]
    bf = find(house, base + ' Eau de Parfum') or find(house, base + ' EDP') or find(house, base)
    explicit_edp = bool(bf) and norm(bf[2]) != norm(base)      # ex. catalogue : « Tam Dao » = l'EDT, « Tam Dao Eau de Parfum » = l'EDP
    has_base_photo = bool(g & {'', 'edp', 'eau de parfum'})
    has_any_base = bool(g & {'', 'edp', 'eau de parfum', 'edt', 'eau de toilette'})
    if c in ('', 'edp', 'eau de parfum'):
        hit = bf
        if not hit: hit = create(house, base, 'EDP'); created.append((r['n'], house, base, 'nouveau'))
    elif c in ('edt', 'eau de toilette'):
        if has_base_photo:      # l'EDP a aussi sa photo : l'EDT devient sa propre fiche
            hit = find(house, base + ' EDT') or find(house, base + ' Eau de Toilette') or (find(house, base) if explicit_edp else None)
            if not hit:
                hit = create(house, base + ' EDT', 'EDT'); created.append((r['n'], house, base + ' EDT', 'variante'))
                if bf and bf[0] == 'idx' and 'EDT' in seen[bf[3]]['conc'] and len(seen[bf[3]]['conc']) > 1: seen[bf[3]]['conc'].remove('EDT')
                if bf: variant_of[hit[3]] = bf[3]
        else:
            hit = bf
            if not hit: hit = create(house, base, 'EDT'); created.append((r['n'], house, base, 'nouveau'))
    else:
        label, code = VAR[c]
        hit = None
        for alt in ALT[label]:
            hit = find(house, base + ' ' + alt)
            if hit: break
        if not hit:
            base_is_this = bool(bf) and label != 'Intense' and len(g) == 1 and (seen.get(bf[3], {}).get('conc') == [code] or not (has_any_base or has_old_photo(bf[1], bf[2])))
            if base_is_this or not (bf or has_any_base):     # la version de base n'existe nulle part : la fiche existante / à créer EST cette version
                hit = bf or create(house, base, code)
                if not bf: created.append((r['n'], house, base, 'nouveau (version ' + label + ' seule)'))
            else:
                hit = create(house, base + ' ' + label, code); created.append((r['n'], house, base + ' ' + label, 'variante'))
                if bf and bf[0] == 'idx' and code in seen[bf[3]]['conc'] and len(seen[bf[3]]['conc']) > 1: seen[bf[3]]['conc'].remove(code)
                if bf and bf[0] == 'idx' and seen[bf[3]]['p']: seen[hit[3]]['p'] = True
                if bf: variant_of[hit[3]] = bf[3]
    r['final'] = (hit[1], hit[2]); resolved.setdefault(hit[3], []).append(r['n'])
# plus de doublons de concentration : si « X Extrait / Absolu / Esprit… / Parfum / EDT » existe comme fiche, la fiche « X » ne se déclare plus en EXT / PAR / EDT
for k, e in seen.items():
    for suf, code in (('extrait', 'EXT'), ('absolu', 'EXT'), ('esprit de parfum', 'EXT'), ('parfum', 'PAR'), ('edt', 'EDT'), ('eau de toilette', 'EDT')):
        k2 = (k[0], k[1] + ' ' + suf)
        if (k2 in seen or k2 in cat_exact) and code in e['conc'] and len(e['conc']) > 1: e['conc'].remove(code)
# variantes : même nez que la version de base (si elle en a un)
for vk, bk in variant_of.items():
    if ' '.join(bk) in nose_by and ' '.join(vk) not in nose_by: nose_by[' '.join(vk)] = list(nose_by[' '.join(bk)])

# ---- Un seul nez par parfum : choix explicites (data/noses-choix.txt), sinon le nez le plus présent pour cette maison
choix = {}
for line in (root / 'data/noses-choix.txt').read_text(encoding='utf-8').splitlines():
    line = line.strip()
    if not line or line.startswith('#'): continue
    h_raw, nm, nose = [x.strip() for x in line.split('|', 2)]
    house = canon_house_n(h_raw, nm); name = NAME_ALIAS.get((norm(house), norm(clean_name(nm))), clean_name(nm))
    choix[norm(house) + ' ' + norm(name)] = nose
for k2, n in choix.items(): nose_by[k2] = [n]      # un choix explicite vaut aussi pour un parfum encore sans nez
per_house = collections.Counter()
for k2, lst in nose_by.items():
    for n in lst:
        per_house[(n, next((h for h in {kk[0] for kk in seen} if k2.startswith(h + ' ')), ''))] += 1
multi_count = 0
for k2, lst in list(nose_by.items()):
    if k2 in choix: nose_by[k2] = [choix[k2]]
    elif len(lst) > 1:
        multi_count += 1
        h = next((h for h in sorted({kk[0] for kk in seen}, key=len, reverse=True) if k2.startswith(h + ' ')), '')
        nose_by[k2] = [max(lst, key=lambda n: (per_house[(n, h)], -lst.index(n)))]
nose_names = collections.OrderedDict()
for lst in nose_by.values():
    for n in lst: nose_names[n] = nose_names.get(n, 0) + 1
print(f'nez choisis par défaut (sans choix explicite) : {multi_count}')

by = collections.OrderedDict()
for k in order:
    e = seen[k]; by.setdefault(e['house'], []).append([e['name'], ','.join(sorted(e['conc'], key=['EDP', 'EDT', 'EXT', 'PAR', 'COL'].index))] + (['P'] if e['p'] else []))
idx = sorted(by.items(), key=lambda kv: norm(kv[0]))
for h, arr in idx: arr.sort(key=lambda r: norm(r[0]))
out = '// Généré par tools/build-index.py : index des parfums (maison, [[nom, concentrations]]). Les fiches (notes, famille) sont complétées à l\'ajout.\nwindow.INDEX = ' + json.dumps(idx, ensure_ascii=False, separators=(',', ':')) + ';\n// Variantes d\'écriture des maisons (Jo Malone London -> Jo Malone) : appliquées aux collections existantes.\nwindow.HOUSE_ALIAS = ' + json.dumps(HOUSE, ensure_ascii=False, separators=(',', ':')) + ';\n// Parfumeurs : clé « maison nom » (normalisée) -> liste de nez, d\'après data/noses.txt.\nwindow.NOSE_BY = ' + json.dumps(nose_by, ensure_ascii=False, separators=(',', ':')) + ';\n'
(root / 'index.js').write_text(out, encoding='utf-8')
total = sum(len(a) for _, a in idx)
print(f'nez : {len(nose_names)}, parfums rattachés : {len(nose_by)} | ', end='')
print(f'lignes lues : {len(raw)} | parfums uniques ajoutés : {total} | maisons : {len(idx)} | doublons retirés : {dup} | déjà au catalogue : {skipped_cat} | ignorées : {skipped_other} | taille : {len(out)//1024} Ko')

# photos : la plus récente (numéro le plus élevé) gagne quand un parfum en a plusieurs ; fichier lu par tools/build-png.py
import json as _j
out_rows = []
for r in rows:
    if r['raw_house'] == 'NEZ': out_rows.append({'n': r['n'], 'nose': r['raw_name']}); continue
    out_rows.append({'n': r['n'], 'house': canon_house(r['final'][0]), 'name': r['final'][1]})
(root / 'data/imgmap2.resolved.json').write_text(_j.dumps(out_rows, ensure_ascii=False, indent=0), encoding='utf-8')
print('photos : %d lignes, %d fiches créées' % (len(rows), len(created)))
for c in created: print('  +', c)
for k, v in {k: v for k, v in resolved.items() if len(v) > 1}.items(): print('  plusieurs photos pour', k, v, '-> la plus récente :', max(v))
