"""Descriptions rédigées (data/bios-extra.txt) + appartenance aux playlists -> descintel.js (window.DESCINTEL).
Chaque description devient des données exploitables par le moteur : saisons, usages, moment, axes de profil (18), mots-clés de besoin, statut (culte / sous-coté / surcoté),
« pour qui » / « pas pour qui ». engine.js les fusionne au profil (profOf) : conseils, recherche par besoin, matching et comparaisons en profitent.
Usage : python3 tools/build-intel.py"""
import json, re, pathlib, subprocess, unicodedata
root = pathlib.Path(__file__).resolve().parent.parent
def norm(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(s or '').lower()) if not unicodedata.combining(c)))).strip()
idx = json.loads(subprocess.check_output(['node', '-e', "global.window={};require('./index.js');console.log(JSON.stringify(window.HOUSE_ALIAS||{}))"], cwd=root))
canon = lambda h: idx.get(norm(h), h)
NEG = re.compile(r"trop (lourd|riche|opulent|puissant|sucr|typ)|lourd|sature|saturant|étouff|écœur|écrase|difficile à porter|interdit|pas pour|pas adapt|peu adapt|à éviter|déconseill|exigu|espaces? clos|pas au bureau|ni la canicule")
HEAT = re.compile(r"canicule|chaleur|\bété\b|estival|estivant|solaire|plage|vacances|climat chaud|temps chaud|riviera|soleil")
COLD = re.compile(r"hiver|froid|automne|temps frais|saisons? fraîches?|manteau|cheminée|plaid")
SPRING = re.compile(r"printemps|printanier|intersaison|demi-saison|beaux jours")
USES = {'bureau': r"bureau|professionnel|costume|réunion|formel|business", 'quotidien': r"tous les jours|quotidien|polyvalent|facile à porter|passe-partout",
        'rdv': r"rendez-vous|séduc|séduis|séduct", 'soiree': r"soirée|nuit|noctambule|nocturne|clubbing|festif|fête", 'ceremonie': r"grands? événements?|cérémonie|habillée?s?|occasions? formelles?|mariage|gala",
        'sport': r"sportif|sport", 'detente': r"cocon|réconfort|douillet|plaid|apaisan", 'voyage': r"voyage|baroudeur|nomade"}
AX = [(0, r"frais|fraîcheur|agrume|désaltérant|givré|glacé|pétillant|hespérid|cologne|aquatique|marin"), (1, r"gourmand|sucré|vanille|miel|caramel|praline|doux|douceur|lacté"),
      (2, r"floral|fleur|rose|jasmin|tubéreuse|lys|pivoine|muguet|magnolia|osmanthus"), (3, r"boisé|bois|cèdre|santal|vétiver|oud|patchouli"), (4, r"épic|cannelle|safran|poivre|cumin|girofle|cardamome|muscade"),
      (5, r"résin|encens|ambre|benjoin|myrrhe|labdanum"), (6, r"fumé|fumée|tabac|bouleau|cuir|goudron"), (7, r"poudré|poudre|violette|iris|aldéhyd"), (8, r"\bvert|herb|galbanum|menthe|végétal"),
      (9, r"fruit|framboise|pêche|poire|litchi|cassis|prune|pomme|mangue|ananas|mandarine"), (10, r"musc|seconde peau"), (11, r"crémeux|lacté|velout|enveloppant"),
      (12, r"opulent|dense|puissant|monstrueux|stratosphérique|titanesque|massif|xxl|intense|riche"), (13, r"original|audac|unique|ovni|singulier|insolite|inattendu|décalé|avant-gardiste|conceptuel|curiosité"),
      (14, r"clivant|polaris|divis|déroute|dérouter|déstabilis|on aime ou on déteste|rebut"), (15, r"bureau|costume|formel|élégan|chic|habillé|aristocrat|sophistiqu|quiet luxury|distingu"),
      (16, r"sensuel|charnel|séduc|érot|animal|torride|sulfureux|provocant"), (17, r"complexe|complexité|évolu")]
LOW = re.compile(r"discret|intime|léger|évanescent|transparent|skin scent|peu de (sillage|projection)|tenue (courte|faible)|fugace|s'évapore|fantôme")
BIG = re.compile(r"opulent|dense|puissant|monstrueux|stratosphérique|titanesque|massif|xxl")
KW = [(r"quiet luxury", 'quiet luxury'), (r"gourmand", 'gourmand'), (r"propre|clean|linge|chemise blanche", 'sent propre'), (r"solaire", 'solaire'), (r"animal", 'animal'), (r"cuir", 'cuir'), (r"\boud\b", 'oud'),
      (r"vanille", 'vanille'), (r"tabac", 'tabac'), (r"encens", 'encens'), (r"poudré", 'poudré'), (r"musc|seconde peau", 'musqué seconde peau'), (r"compliment", 'compliments'), (r"signature", 'parfum signature'),
      (r"rétro|vintage", 'rétro'), (r"cocon|réconfort|douillet", 'cocooning'), (r"séduc|sensuel|charnel", 'séducteur'), (r"opulent|luxueux", 'opulent'), (r"discret|intime", 'discret'),
      (r"puissant|monstrueux|stratosphérique|titanesque|sillage (magnétique|remarquable)", 'sillage puissant'), (r"tenue (remarquable|impressionnante|excellente|de champion|éternelle)|24 heures|tient des jours", 'longue tenue'),
      (r"tenue (courte|faible)|fugace|s'évapore", 'tenue courte'), (r"nouveauté|trop récent|sortie très récente", 'nouveauté'), (r"édition limitée|introuvable|rare", 'rare'),
      (r"(?<!poivre )rose", 'rose'), (r"iris", 'iris'), (r"vétiver", 'vétiver'), (r"santal", 'santal'), (r"\bambre", 'ambré'), (r"marin|iodé|salin|aquatique", 'marin'), (r"agrume|hespérid", 'agrumes'), (r"fruité|fruit", 'fruité'),
      (r"floral|fleur", 'floral'), (r"boisé|bois", 'boisé'), (r"épic", 'épicé'), (r"cologne", 'cologne'), (r"rendez-vous", 'rendez-vous'), (r"bureau|costume", 'bureau'), (r"soirée", 'soirée'), (r"original|ovni|audac", 'original')]
def clamp(x, a, b): return max(a, min(b, x))
def analyse(text):
    t = text.lower(); sents = re.split(r'(?<=[.!?])\s+', t)
    s = [0, 0, 0, 0]; use = set(); pas = []; pour = ''; ax = {}; kw = []; m = [0, 0]
    if re.search(r"toute(s)? saisons?|toutes les saisons", t): s = [4, 4, 4, 4]
    for sent in sents:
        neg = bool(NEG.search(sent)); heat = bool(HEAT.search(sent)); cold = bool(COLD.search(sent)); spr = bool(SPRING.search(sent))
        if heat:
            if neg: s[1] = -1
            else: s[1] = max(s[1], 5); s[0] = max(s[0], 3)
        if cold and not neg: s[3] = max(s[3], 5); s[2] = max(s[2], 5)
        if spr: s[0] = max(s[0], 5)
        for u, rx in USES.items():
            if re.search(rx, sent):
                if neg and u in ('bureau', 'quotidien'): pas.append(u)
                elif not neg: use.add(u)
        if neg and len(pas) < 3 and len(sent) < 220 and re.search(r"lourd|sature|interdit|difficile|trop|pas ", sent) and not sent.startswith(('pour ', 'à ')): pas.append(sent.strip().rstrip('.'))
        if sent.startswith('pour ') and not pour: pour = sent.strip().rstrip('.')
        if not neg:
            for i, rx in AX:
                if re.search(rx, sent): ax[i] = ax.get(i, 0) + 1
    pr = {}
    for i, n in ax.items(): pr[i] = clamp(3 + n, 3, 5) if i not in (13, 14, 15, 16, 17) else clamp(2 + n, 2, 4)
    if LOW.search(t) and not BIG.search(t): pr[12] = 1
    if re.search(r"soirée|nuit|noctambule|nocturne|ténébreux|sombre", t): m[1] = 5
    if re.search(r"bureau|quotidien|tous les jours|matin|frais|polyvalent", t): m[0] = 4
    pos = ' '.join(x for x in sents if not NEG.search(x))
    for rx, w in KW:
        if re.search(rx, pos) and w not in kw: kw.append(w)
    st = ''
    if re.search(r"culte|légende|phénomène|best-seller|chef-d'œuvre", t): st = 'culte'
    elif re.search(r"sous-coté|sous-estimé|injustement", t): st = 'sous'
    elif re.search(r"surcoté|sur-coté", t): st = 'sur'
    elif re.search(r"juste valeur|juste milieu|correctement coté|à sa juste|\bjuste\.", t): st = 'juste'
    if st == 'sous': kw.append('sous-coté')
    if st == 'culte': kw.append('culte')
    return {'s': s if any(s) else None, 'u': sorted(use), 'pas': pas[:2], 'pour': pour[:170], 'p': pr, 'kw': kw[:14], 'st': st, 'm': m if any(m) else None}
out = {}
for l in (root / 'data/bios-extra.txt').read_text(encoding='utf-8').splitlines():
    if not l.strip() or l.startswith('#') or l.count('|') < 2: continue
    h, n, t = l.split('|', 2)
    out[norm(canon(h)) + '|' + norm(n)] = analyse(t)
PLAYTAGS = [(r"job interview|corporate weapons|finance bro|the founder|patrick bateman", {'u': ['bureau'], 'kw': ['bureau', 'costume']}),
            (r"quiet luxury|don draper|mayfair|bookworm", {'kw': ['costume']}),
            (r"first date", {'u': ['rdv'], 'kw': ['rendez-vous']}), (r"night out|je veux qu'on me remarque|l'ivresse|christmas eve|soirée à l'opéra|wedding guest", {'u': ['soiree'], 'kw': ['soirée']}),
            (r"wedding guest|soirée à l'opéra|christmas eve", {'u': ['ceremonie'], 'kw': []}), (r"daily|sunday morning|clean girl|je veux sentir propre", {'u': ['quotidien'], 'kw': ['sent propre']}),
            (r"sous la chaleur|beach club|boat day|ibiza|mykonos|saint-tropez|côte d'azur|rio|seul face à l'océan|monaco", {'s': [2, 5, 1, 0], 'kw': ['solaire', 'été']}),
            (r"automne cozy|chic winter|hiver à new york|ski weekend|courchevel|christmas eve", {'s': [1, 0, 5, 5], 'kw': ['automne hiver', 'cocooning']}),
            (r"dubai|le qatari|marrakech|je veux sentir opulent", {'u': ['soiree'], 'kw': ['opulent', 'oriental']}), (r"aimant à compliments", {'kw': ['compliments']}),
            (r"niche à petit prix|les petits budgets", {'kw': ['abordable', 'niche petit prix']})]
pls = json.loads(subprocess.check_output(['node', '-e', "const vm=require('vm'),fs=require('fs');const w={};w.window=w;vm.createContext(w);vm.runInContext(fs.readFileSync('playlists.js','utf8'),w);console.log(JSON.stringify(w.PLAYLISTS.map(p=>({t:p.t,ps:p.ps.filter(x=>x.h).map(x=>[x.h,x.n])}))))"], cwd=root))
for p in pls:
    tl = p['t'].lower()
    for rx, tag in PLAYTAGS:
        if not re.search(rx, tl): continue
        for h, n in p['ps']:
            e = out.setdefault(norm(canon(h)) + '|' + norm(n), {'s': None, 'u': [], 'pas': [], 'pour': '', 'p': {}, 'kw': [], 'st': '', 'm': None})
            e['u'] = sorted(set(e['u']) | set(tag.get('u', [])))
            e['kw'] = list(dict.fromkeys(e['kw'] + tag.get('kw', [])))[:16]
            if tag.get('s'): e['s'] = [max(a, b) for a, b in zip(e['s'] or [0, 0, 0, 0], tag['s'])]
(root / 'descintel.js').write_text("// Généré par tools/build-intel.py : intelligence tirée des descriptions (bios-extra.txt) et des playlists, fusionnée aux profils par engine.js.\nwindow.DESCINTEL = " + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ";\n", encoding='utf-8')
print(len(out), 'parfums -> descintel.js')
