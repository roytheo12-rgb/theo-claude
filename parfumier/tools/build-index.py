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
 'omanluxury': 'Oman Luxury', 'oman luxury': 'Oman Luxury', 'ysl': 'Yves Saint Laurent', 'yves saint laurent beaute': 'Yves Saint Laurent',
 'jo malone london': 'Jo Malone', 'ella k parfums': 'Ella K', 'jo malone': 'Jo Malone', 'gucci': 'Gucci', 'jovoy paris': 'Jovoy', 'jovoy': 'Jovoy', 'rabanne': 'Rabanne', 'paco rabanne': 'Rabanne',
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

NAME_ALIAS = {('jean paul gaultier', 'santal paname'): 'Santal de Paname', ('frederic malle', 'un fleur de cassie'): 'Une Fleur de Cassie'}  # coquilles de la liste
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
existing = {(norm(canon_house(h)), norm(PREFIX.sub('', n))) for h, n in cat}

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
    house = canon_house(house)
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

by = collections.OrderedDict()
for k in order:
    e = seen[k]; by.setdefault(e['house'], []).append([e['name'], ','.join(sorted(e['conc'], key=['EDP', 'EDT', 'EXT', 'PAR', 'COL'].index))] + (['P'] if e['p'] else []))
idx = sorted(by.items(), key=lambda kv: norm(kv[0]))
for h, arr in idx: arr.sort(key=lambda r: norm(r[0]))
out = '// Généré par tools/build-index.py : index des parfums (maison, [[nom, concentrations]]). Les fiches (notes, famille) sont complétées à l\'ajout.\nwindow.INDEX = ' + json.dumps(idx, ensure_ascii=False, separators=(',', ':')) + ';\n// Variantes d\'écriture des maisons (Jo Malone London -> Jo Malone) : appliquées aux collections existantes.\nwindow.HOUSE_ALIAS = ' + json.dumps(HOUSE, ensure_ascii=False, separators=(',', ':')) + ';\n'
(root / 'index.js').write_text(out, encoding='utf-8')
total = sum(len(a) for _, a in idx)
print(f'lignes lues : {len(raw)} | parfums uniques ajoutés : {total} | maisons : {len(idx)} | doublons retirés : {dup} | déjà au catalogue : {skipped_cat} | ignorées : {skipped_other} | taille : {len(out)//1024} Ko')
