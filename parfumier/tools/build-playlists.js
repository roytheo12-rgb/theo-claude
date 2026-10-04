// Lit data/playlists-source.txt (catalogue éditorial de Théo) et produit playlists.js :
// chaque parfum est relié à la base (INDEX / CATALOG) quand il existe, sinon marqué hors base.
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const w = { }; w.window = w; vm.createContext(w);
for (const f of ['data', 'desc', 'index', 'facts']) vm.runInContext(fs.readFileSync(path.join(root, f + '.js'), 'utf8'), w);
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/n°|no\.|№/g, 'n ').replace(/&/g, ' and ').replace(/['’`.,–—-]/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const HA = w.HOUSE_ALIAS || {};
const HOUSE_SYN = { goutal: 'maison goutal', 'goutal paris': 'maison goutal', 'yves rocher': 'yves rocher', ysl: 'yves saint laurent', memo: 'memo paris', replica: 'maison margiela', mfk: 'maison francis kurkdjian', 'by kilian': 'kilian', bdk: 'bdk parfums', 'frederic malle': 'frederic malle', 'armani prive': 'armani', roja: 'roja parfums', margiela: 'maison margiela', 'maison crivelli': 'maison crivelli', 'maison mataha': 'maison mataha', 'jo malone': 'jo malone', 'cdg': 'comme des garcons', 'bleu de chanel': 'chanel bleu de chanel', 'tom ford': 'tom ford' };
// parfums cités sans maison dans le catalogue
const BARE = { 'boss bottled parfum': 'Hugo Boss Boss Bottled Parfum', 'hermes eau de merveilles bleue': 'Hermès Eau des Merveilles Bleue', 'comme des garcons kyoto': 'Comme des Garçons Series 3 Incense: Kyoto', 'chloe eau de parfum': 'Chloé Chloé', 'fracas robert piguet': 'Robert Piguet Fracas', 'terre d hermes': 'Hermès Terre d\'Hermès', 'chanel platinum egoiste': 'Chanel Egoiste Platinum', 'xerjoff erba pura': 'Sospiro Erba Pura', 'grey vetiver tom ford': 'Tom Ford Grey Vetiver', 'maison margiela replica by the fireplace': 'Maison Margiela By the Fireplace', 'guerlain eau de cologne imperiale': 'Guerlain Eau de Cologne Impériale Edition 160 Anniversaire', 'fracas': 'Robert Piguet Fracas', 'diorissimo': 'Dior Diorissimo', 'bleu de chanel parfum': 'Chanel Bleu de Chanel Parfum', 'chanel n5 marilyn monroe': 'Chanel N°5', 'chanel no 5': 'Chanel N°5' };
const entries = [];
(w.CATALOG || []).forEach((c) => c.name && c.house && entries.push({ h: c.house, n: c.name }));
(w.INDEX || []).forEach(([h, arr]) => arr.forEach(([n]) => entries.push({ h, n })));
const housesN = new Set();
const byKey = new Map();
entries.forEach((e) => { const hn = norm(HA[norm(e.h)] || e.h), full = hn + ' ' + norm(e.n); housesN.add(hn); if (!byKey.has(full)) byKey.set(full, e); const raw = norm(e.h) + ' ' + norm(e.n); if (!byKey.has(raw)) byKey.set(raw, e); const nn = norm(e.n); if (nn.startsWith(hn + ' ') && !byKey.has(nn)) byKey.set(nn, e); const rp = nn.replace(/^replica /, ''); if (rp !== nn && !byKey.has(hn + ' ' + rp)) byKey.set(hn + ' ' + rp, e); });
const NAME_FIX = { 'n 5': 'n 5', 'n5': 'n 5' };
function resolve(line) {
  line = line.replace(/\s*\([^)]*\)/g, '');
  let s = norm(line.replace(/\s+[—-]\s+(?=[A-ZÉ])/g, ' ')); // « House — Name »
  s = s.replace(' replica ', ' ');
  if (BARE[s]) s = norm(BARE[s]);
  const tries = [s];
  Object.keys(HOUSE_SYN).forEach((k) => { if (s === k || s.startsWith(k + ' ')) tries.push(HOUSE_SYN[k] + s.slice(k.length)); });
  tries.push(s.replace(/\bpour\b/g, 'pour'), s.replace(/ extrait$/, ' extrait de parfum'), s.replace(/^(\S+ )(n 5)$/, '$1n 5'));
  for (const t of tries) if (byKey.has(t)) return byKey.get(t);
  const nc = s.replace(/ (edt|edp)$/, ''); if (nc !== s) { const r = resolve(line.replace(/\s+(EDT|EDP)$/, '')); if (r) return r; }
  // maison + reste : tolérance (concentration, suffixe)
  for (const t of tries) {
    const c = [...byKey.keys()].filter((k) => k.startsWith(t + ' ') && /^( (edp|edt|parfum|extrait|de|eau|cologne|pure|n|5|edition|160|anniversaire))+$/.test(k.slice(t.length)));
    if (c.length) { c.sort((a, b) => a.length - b.length); return byKey.get(c[0]); }
  }
  return null;
}
const raw = fs.readFileSync(path.join(root, 'data', 'playlists-source.txt'), 'utf8').split('\n');
const SECS = [], PLS = [];
let sec = '', cur = null, pend = [];
const flush = () => { if (cur) { PLS.push(cur); cur = null; } };
const SECMAP = { 'PERSONNAGES ICONIQUES': 'Personnages', 'THE GENTLEMEN': 'Personnages', 'DRAKE & CULTURE MUSICALE': 'Icônes', 'ICÔNES CULTURELLES': 'Icônes', 'CULTURE / INTERNET': 'Culture', 'VILLES / DESTINATIONS': 'Destinations', 'SAISONS / ATMOSPHÈRES': 'Atmosphères', 'LIFESTYLE': 'Moments', 'UNIVERS OLFACTIFS': 'Effets', 'LE WOLF OF WALL STREET / MONDE FINANCIER': 'Cinéma, séries & livres', 'ART / ÉLÉGANCE / IMAGINAIRE': 'Atmosphères', 'HISTORICAL SCENTS': 'Atmosphères', "L'UNIQUE PLAYLIST ODEURS BIZARRES": 'Spécial', 'LAYERING': 'Spécial' };
for (let i = 0; i < raw.length; i++) {
  const l = raw[i].trim(); if (!l) continue;
  if (/^Les univers qui restent/.test(l)) break;
  let m;
  if ((m = l.match(/^\d\d — (.+)$/))) { flush(); sec = SECMAP[m[1].trim()] || m[1]; continue; }
  if ((m = l.match(/^(\d{2,3})\. (.+)$/)) && (!cur || cur.ps.length >= 10)) { flush(); cur = { id: +m[1], sec, t: m[2].replace(/ — .*$/, ''), d: '', ps: [], note: [] }; continue; }
  if (!cur) continue;
  if ((m = l.match(/^(\d+)\. (.+)$/))) { const hist = cur.id === 79; const q = hist ? m[2].replace(/\s+—\s+.*$/, '') : m[2].replace(/\s+—\s+/, ' '); const hit = resolve(q); cur.ps.push({ q: q.replace(/\s*\([^)]*\)/g, ''), h: hit ? hit.h : '', n: hit ? hit.n : '' }); continue; }
  if (!cur.d && !cur.ps.length) { cur.d = l; continue; }
  if (/^\*|^Exemples de combinaisons/.test(l)) { cur.note.push(l); continue; }
  cur.note.push(l);
}
flush();
const PAL = {
1:'0e1a2b,27405f,c9b27a,rays',2:'1b9aaa,ef476f,fff1d6,stripes',3:'1a0f0a,4a2c1a,b08a5a,grain',4:'e9e9ec,b9bcc4,1c1c22,grid',5:'1e2326,4a5258,a8784a,rain',6:'3a3a3a,6d5a45,d8c7a5,stripes',7:'f0e0b8,7aa6a1,c85a3c,arches',8:'050505,1a1a1d,d9b44a,grid',9:'2a2a2a,8c3b2a,e8e0c8,grain',10:'2b0d14,5a1a26,c8b79a,arches',
11:'0b2a2a,c9a64b,f5eccf,rays',12:'c8102e,ffc72c,fff6e0,stripes',13:'1f3a2a,55704a,d4c19a,grid',14:'181818,5a4630,c7a24a,stripes',15:'4a1e2e,8a3b4c,e5c79a,dots',16:'23162b,6a2f4a,e4b5a0,arches',17:'101426,3b2b5a,f2c14e,rays',18:'5a0f2a,d2386c,ffd5e0,dots',19:'3d0707,c4181f,f6c453,rays',20:'2a1a2e,a0526b,e8cfc4,dots',
21:'0d4d46,f2a900,ff6f61,waves',22:'10253a,4c7a9a,e8ddc7,waves',23:'f6d7c3,e58a74,fff5e8,dots',24:'efe8dc,9c8f78,2d3a4a,stripes',25:'f1e6e0,2a2a2a,b9a98f,arches',26:'f5e3e3,d9a5a8,ffffff,rays',27:'eef3f4,cfe1e6,5d8fa0,waves',28:'dfeacb,9bbd85,ffffff,waves',29:'f6ead2,e0c796,a8825a,dots',30:'14060d,5b0d2a,c1113f,arches',
31:'fbe3ea,f0a9bd,ffffff,dots',32:'1a0d0d,5b2a1c,d4a15a,rays',33:'e9e3d8,c7bca8,4a4337,grid',34:'14264a,7c1d28,efe6d2,stripes',35:'0a1f33,16558f,d7e3ef,grid',36:'e6e8ea,9ba3ab,1d1f22,grid',37:'d8d2c8,8c8579,111111,stripes',38:'3b4252,8e99ab,e8d9c0,arches',39:'121212,f2b705,6d6d6d,grid',40:'2a2f3a,7a1f2b,c8ccd2,rain',
41:'cfc6b8,7f1d1d,1c1c1c,arches',42:'d98a4a,a8452c,f4dfb8,arches',43:'1d7fb0,7dd1d9,fff4d6,waves',44:'f26b21,2d9cdb,fff1d0,stripes',45:'b0121f,f4f1ea,101820,grid',46:'234e52,6fa8a0,e9dfc8,waves',47:'7a5a1f,d9b14a,14100a,rays',48:'0d0d1f,e0245e,4de1ff,grid',49:'22344f,8aa4c2,f2f5f8,dots',50:'ff9a3c,ffd166,1b9aaa,rays',
51:'5a2e12,b5622a,f0c987,rain',52:'c8683a,f0a766,ffffff,stripes',53:'213a57,7aa5d2,ffffff,dots',54:'0f5a2a,e8f0e8,111111,stripes',55:'111111,e10600,f2f2f2,stripes',56:'5b1b3a,d56a8a,f8dfd0,dots',57:'12202e,3a5a78,d0d6dc,grid',58:'2a1a4a,f26ca7,ffd166,dots',59:'e7dfd2,b8a98f,222222,stripes',60:'1d6f42,e9f0d8,f4a261,stripes',
61:'f4efe6,d9cdb8,8f7f66,waves',62:'f3d9a4,e08e4e,fff4e0,dots',63:'2b2216,8a6a3a,e8d8b0,arches',64:'ff2e63,08090a,f9f871,rays',65:'10100f,6e5a2a,e5d6a8,grid',66:'f4fbfc,bfe3ea,ffffff,waves',67:'2a0610,9c1537,f0a58f,waves',68:'0a0a1e,2a2a5c,8e8ec8,grain',69:'080808,6a0d0d,e5391a,rays',70:'fff0c9,ffb347,d65a31,dots',
71:'0e3b2d,c9a227,f0e6c8,stripes',72:'4b0f3a,c43a8b,f5d0e6,rays',73:'0a2a3a,1d6f8c,e8d9a8,waves',74:'e9efe1,4f7a46,7a1f2b,stripes',75:'3a0b18,9c1b30,e7c67a,arches',76:'0f2a1d,a41e22,e8c872,dots',77:'3c0a14,9b2335,d9b26f,arches',78:'6e3a1b,c98a4a,f7e3c0,waves',79:'3a2c1a,a88b5a,efe3c8,grain',80:'202020,6e7f4a,b0b0a0,grain',81:'2c2c54,706fd3,f7f1e3,rings',140:'111111,ff5a36,f4f1ea,rays',142:'d8d2c8,8c8579,111111,stripes',101:'e9eef2,7ea1b8,b5323a,dots',102:'1c1c24,4a1f2e,c9b9a0,rain',103:'0f0f0f,c9a227,e8e0c8,stripes',104:'2f6b4f,c8553d,f5e6c8,dots',105:'101722,6b6f78,e8e4da,grid',106:'3d0a24,e0408a,ffd8ec,rays',107:'f7d9e3,e59ab5,fff4f8,dots',108:'23303d,5b7389,e5e8ec,grid',109:'7fb0d6,dfe9f1,2c3e50,dots',110:'0e0e12,8b1e2d,e6d5b8,arches',111:'e7e2da,a8362e,1b1b1b,stripes',112:'1c1020,6e3a80,e9d9a6,arches',113:'060912,1f2a44,c7b26b,rays',120:'e9e1d3,c0392b,1d3557,stripes',122:'121212,e63946,f1f1f1,grid',124:'0b0b16,3a1c71,d76d77,rings',126:'12181f,3b4a5a,c9b27a,grid',129:'dfeaf2,2f6f9f,f4e8d0,waves',130:'f2f0e6,3a7d44,d99a2b,dots',132:'ecebe6,b9b5aa,2b2b2b,grid',133:'f1e0c5,c9792b,5a3a1a,dots',134:'1b3a4b,d99a2b,f1e8d4,waves',135:'f6e4e0,d9a5b3,7a5a5a,arches',136:'dff0e6,2e8b57,1a2a22,stripes',137:'efe9de,a3b18a,5a6a4a,rings',138:'3a2a1c,8a6a3f,e8d9b8,arches',82:'1f2a3a,8aa6c1,f4efe6,dots',83:'f28c38,7b2d8e,ffe6b0,waves',84:'f4f7fa,1e78c2,ffffff,waves',85:'7a2e12,d9822b,f6d9a0,arches',86:'0b7a3e,f2c500,1b6ac9,rays',87:'e8eddc,b7a3c9,6b4f2a,dots',88:'e6e9ee,5a6b82,1b2432,grid',89:'fbfaf6,3fb1c9,f0c27b,stripes',90:'fafcff,0e4a7b,d9b26f,waves',91:'09090f,6a1bb0,ff3d9a,rays',92:'fbeaf2,c7b6e6,a0d2c0,dots',93:'1a1a1a,f2e63d,e5e5e5,grain',94:'ff9f1c,ffd166,fffbe6,rays',95:'2b0a3d,c0398a,ffd9ef,rings',96:'101010,3a3a3a,c9a64b,arches',97:'0a0a14,5b1d8f,f0d78a,rays' };
const HIST = { 'chanel n 5': ['Porté par', 'Marilyn Monroe'], 'givenchy l interdit': ['Créé pour', 'Audrey Hepburn'], 'miller harris l air de rien': ['Créé avec', 'Jane Birkin'], 'dior eau sauvage': ['Associé à', 'Alain Delon'], 'jean patou joy': ['Inspiré d\'une époque', 'Grandes figures féminines'], 'guerlain eau de cologne imperiale': ['Maison liée à', 'l\'Impératrice Eugénie'], 'atkinsons 24 old bond street': ['Maison liée à', 'Mayfair, 24 Old Bond Street'], '4711 original eau de cologne': ['Maison liée à', 'Cologne'], 'floris n 89': ['Maison liée à', 'Jermyn Street, Londres'], 'guerlain shalimar': ['Inspiré d\'une époque', 'Les Années folles'] };
const DEL = new Set([65, 68, 34, 128, 129, 30, 133, 63, 137, 29, 25, 92, 52, 101, 102, 108, 111, 112]);          // Audrey Hepburn, Soft Girl : retirées
const MERGE = { 44: [50], 70: [95], 96: [97], 51: [78], 67: [69] };      // 78 Cinnamon Rolls rejoint Automne Cozy   // doublons fusionnés : tous les parfums sont gardés, sans répétition
const PAIRS = [[120, 121, 'Les Artsy'], [122, 123, 'Les fashions du Marais'], [124, 125, 'Les DJ'], [126, 127, 'Corporate Weapons'], [142, 37, 'Model Off-Duty'], [132, 143, 'Les Fans de design'], [134, 144, 'Les Globe-trotters'], [130, 131, 'Les Petits budgets'], [136, 60, 'Les Sportifs stylés']];   // [homme, femme, titre] : 10 hommes puis 10 femmes
PLS.find((p) => p.id === 60).d = "Elle court le matin, fait du pilates l'après-midi, mange bien, s'habille en sportwear premium et son parfum est frais sans être banal.";
PAIRS.forEach(([h, f, title]) => { const a = PLS.find((p) => p.id === h), b = PLS.find((p) => p.id === f); a.grp = [{ t: 'Homme', d: a.d }, { t: 'Femme', d: b.d }]; a.ps = a.ps.concat(b.ps); a.t = title; a.d = ''; DEL.add(f);
  const COMMON = { 132: 'Ils ont un Eames dans leur salon, connaissent Noguchi, achètent des livres Phaidon et leur parfum est aussi épuré que leur intérieur.', 134: 'Ils rentrent du Pérou, repartent au Japon, ont un sac cabine parfait et une montre achetée à Bangkok.' };
  if (COMMON[h]) { a.grp = [{ t: 'Homme', d: '' }, { t: 'Femme', d: '' }]; a.d = COMMON[h]; } });
{ const a = PLS.find((p) => p.id === 109), b = PLS.find((p) => p.id === 110); a.grp = [{ t: 'Avant la transformation', d: a.d }, { t: 'Après la transformation', d: b.d }]; a.ps = a.ps.concat(b.ps); a.t = 'Andy Sachs'; a.d = ''; DEL.add(110); }
const EXTRA = { 27: ['Ex Nihilo Fleur Narcotique', 'Ex Nihilo Fleur Narcotique Musc', 'Ex Nihilo Iris Porcelana'], 28: ['Ex Nihilo Fleur Narcotique', 'Ex Nihilo Fleur Narcotique Blossom', 'Ex Nihilo Iris Porcelana'] };      // la maison Ex Nihilo dans Clean Girl et Pilates Matcha Girl
for (const [id, l] of Object.entries(EXTRA)) { const p = PLS.find((x) => x.id === +id); l.forEach((q) => { const hit = resolve(q); const k = norm(hit ? hit.h + ' ' + hit.n : q); if (!p.ps.some((x) => norm(x.h ? x.h + ' ' + x.n : x.q) === k)) p.ps.push({ q, h: hit ? hit.h : '', n: hit ? hit.n : '' }); }); }
const TITLE = { 96: 'La vie de Ronnie' };
for (const [k, others] of Object.entries(MERGE)) {
  const a = PLS.find((p) => p.id === +k), seen = new Set(a.ps.map((x) => norm(x.h ? x.h + ' ' + x.n : x.q)));
  others.forEach((o) => { const b = PLS.find((p) => p.id === o); b.ps.forEach((x) => { const kk = norm(x.h ? x.h + ' ' + x.n : x.q); if (!seen.has(kk)) { seen.add(kk); a.ps.push(x); } }); b.note.forEach((n) => { if (!a.note.includes(n)) a.note.push(n); }); DEL.add(o); });
  if (TITLE[k]) a.t = TITLE[k];
}
const RENAME = { 32: ['Fur Coat Energy', null], 67: ['Je veux être envoûtant', 'Peau chaude, lumière basse, distance beaucoup trop courte. Rien d\'agressif : simplement impossible à quitter.'], 90: ['Boat Day', null], 73: ['Mayfair', null], 58: ['Funky Chic', "Un tailleur ou un costume impeccable, mais une couleur de trop, un accessoire inattendu et l'envie de danser jusqu'à la fermeture. Vous êtes soigné, jamais sage."], 34: ['Traditions', "Domaine de famille, polo blanc, cuir patiné et lumière dorée de fin d'après-midi. L'élégance de ceux qui n'ont plus rien à prouver."], 74: ['Garden Party', "Courses hippiques, mariage au château, cocktail sous les tilleuls : tous les événements où l'on s'habille avec soin, entre tailoring, champagne et gestes parfaitement maîtrisés."], 75: ["Soirée à l'opéra", null], 77: ['Chic Winter', null], 59: ['Effortless Chic', "Un jean, une chemise blanche, une veste jetée sur les épaules : rien n'est étudié, tout est juste. Le chic de ceux qui n'ont jamais l'air d'essayer."] };
PLS.forEach((p) => { const r = RENAME[p.id]; if (r) { p.t = r[0]; if (r[1]) p.d = r[1]; } });
for (let i = PLS.length - 1; i >= 0; i--) if (DEL.has(PLS[i].id)) PLS.splice(i, 1);

// ---- Mises à jour éditoriales : data/playlists-edit.txt ----
// ## Titre            → playlist existante ;  ## NEW Titre | Section → nouvelle playlist
// d: bio   ·   doc: texte [| source | url]   ·   pal: a,b,c,motif   ·   @ Groupe | texte   ·   - Parfum | pourquoi (remplace la liste)
// + Parfum | pourquoi (ajoute si absent)   ·   ~ Parfum | pourquoi (ajoute seulement le texte)   ·   x Parfum (retire)
const EDIT_MISS = [], INTROUV = [];
(function applyEdits() {
  const f = path.join(root, 'data', 'playlists-edit.txt'); if (!fs.existsSync(f)) return;
  const L = fs.readFileSync(f, 'utf8').split('\n'); let nid = 300, p = null, rep = null, grp = null;
  const split = (s) => { const i = s.indexOf(' | '); return i < 0 ? [s.trim(), ''] : [s.slice(0, i).trim(), s.slice(i + 3).trim()]; };
  const housesK = [...housesN];
  const mk = (q, w) => { const hit = resolve(q); if (!hit) { const s = norm(q.replace(/\s*\([^)]*\)/g, '')); if (housesK.some((h) => h && s.startsWith(h + ' '))) { INTROUV.push(q); return null; } } const o = { q: q.replace(/\s*\([^)]*\)/g, ''), h: hit ? hit.h : '', n: hit ? hit.n : '' }; if (w) o.w = w; return o; };
  const key = (x) => norm(x.h ? x.h + ' ' + x.n : x.q);
  const fin = () => {
    if (p && rep) { p.ps = rep; if (grp) p.grp = grp; else delete p.grp; }
    p = rep = grp = null;
  };
  for (const raw0 of L) {
    const l = raw0.replace(/\s+$/, ''); if (!l.trim() || l.startsWith('#!')) continue;
    let m;
    if ((m = l.match(/^## DEL (.+)$/))) { fin(); const q = PLS.find((x) => norm(x.t) === norm(m[1])); if (q) q.ghost = true; p = null; continue; }
    if ((m = l.match(/^## (NEW )?(.+)$/))) {
      fin();
      if (m[1]) { const [title, sect] = split(m[2].replace(/ \| /, ' | ')); const [tt, ss] = m[2].split(' | '); p = { id: nid++, secs: [(ss || 'Archétypes').trim()], t: tt.trim(), d: '', ps: [], note: [], isNew: true }; PLS.push(p); }
      else { p = PLS.find((x) => norm(x.t) === norm(m[2])); if (!p) { console.error('édition : playlist introuvable : ' + m[2]); p = { ps: [], note: [], d: '', ghost: true }; } }
      continue;
    }
    if (!p) continue;
    if ((m = l.match(/^t: (.*)$/))) { p.t = m[1].trim(); continue; }
    if ((m = l.match(/^secs: (.*)$/))) { p.secs = m[1].split(',').map((x) => x.trim()); continue; }
    if (/^first: /.test(l)) { p.first = +l.slice(7) || 1; continue; }
    if ((m = l.match(/^d: (.*)$/))) { p.d = m[1]; continue; }
    if ((m = l.match(/^doc: (.*)$/))) { const [a, b, c] = m[1].split(' | '); p.doc2 = (p.doc2 || []).concat([c ? { t: a, s: b, u: c } : { t: a }]); continue; }
    if ((m = l.match(/^pal: (.*)$/))) { p.pal = m[1].trim(); continue; }
    if ((m = l.match(/^@ (.*)$/))) { const [t0, d0] = split(m[1]); rep = rep || []; grp = grp || []; const old = p.grp && p.grp[grp.length]; grp.push({ t: t0, d: d0 || (old ? old.d : ''), n: 0 }); continue; }
    if ((m = l.match(/^- (.*)$/))) { const [q, w] = split(m[1]); const o = mk(q, w); if (!o) continue; rep = rep || []; rep.push(o); if (grp) grp[grp.length - 1].n++; continue; }
    if ((m = l.match(/^\+ (.*)$/))) { const [q, w] = split(m[1]); const o = mk(q, w); if (!o) continue; const ex = p.ps.find((x) => key(x) === key(o)); if (ex) { if (w) ex.w = w; } else p.ps.push(o); continue; }
    if ((m = l.match(/^~ (.*)$/))) { const [q, w] = split(m[1]); const o = mk(q, w); if (!o) continue; const ex = (rep || p.ps).find((x) => key(x) === key(o)); if (ex) ex.w = w; else EDIT_MISS.push(p.t + ' / ' + q); continue; }
    if ((m = l.match(/^x (.*)$/))) { const o = mk(m[1].trim(), ''); if (!o) continue; const ix = p.ps.findIndex((x) => key(x) === key(o)); if (ix >= 0 && p.grp && p.grp.every((g) => typeof g.n === 'number')) { let c = 0; for (const g of p.grp) { c += g.n; if (ix < c) { g.n--; break; } } } p.ps = p.ps.filter((x) => key(x) !== key(o)); continue; }
  }
  fin();
  fs.writeFileSync(path.join(root, 'data', 'playlists-introuvables.txt'), [...new Set(INTROUV)].sort().join('\n'));
  for (let i = PLS.length - 1; i >= 0; i--) if (PLS[i].ghost) PLS.splice(i, 1);
  PLS.sort((a, b) => (b.first || 0) - (a.first || 0));      // « first: » : en tête de sa section
})();
const miss = []; PLS.forEach((p) => p.ps.forEach((x) => { if (!x.h) miss.push(x.q); }));
fs.writeFileSync(path.join(root, 'data', 'playlists-hors-base.txt'), [...new Set(miss)].sort().join('\n'));
console.log(PLS.length, 'playlists', PLS.reduce((a, p) => a + p.ps.length, 0), 'parfums', 'hors base:', new Set(miss).size);
module.exports = { PLS };
const DROP = /Même logique|sort(?:i|ie)?\b|supprimé|définitivement|^Je garde|garderais|Une seule playlist|Celle-ci/;
const SECS_OF = (p) => { const i = p.id; const r = [];
  if (i <= 16 || [71, 72].includes(i)) r.push('Cinéma, séries & livres');      // tous les personnages, y compris Jordan et Naomi
  if (i >= 17 && i <= 26) r.push('Icônes');
  if ((i >= 38 && i <= 48) || (i >= 82 && i <= 86)) r.push('Destinations');
  if ([53, 54, 55, 56, 57, 61, 62, 63, 87, 88, 89, 90, 91].includes(i)) r.push('Moments');
  if ((i >= 49 && i <= 52) || (i >= 74 && i <= 78)) r.push('Atmosphères');
  if ((i >= 64 && i <= 70) || (i >= 93 && i <= 95)) r.push('Effets');
  if ([79, 80, 81].includes(i)) r.push('Spécial');
  if ((i >= 101 && i <= 113)) r.push('Cinéma, séries & livres');
  if (i >= 120 && i <= 144 || (i >= 27 && i <= 37) || [58, 59, 60, 73, 96, 97].includes(i)) r.push('Archétypes');      // la section Culture est fondue dans Archétypes
  if (!r.length) throw new Error('sans section ' + i);
  return r; };
const slug = (s) => norm(s).replace(/ /g, '-');
function out() {
  const res = PLS.map((p) => {
    const [a, b, c, m] = (p.pal || PAL[p.id] || '222222,555555,dddddd,grain').split(',');
    const doc = [];
    p.note.forEach((l) => {
      if (DROP.test(l) || /^\*|^Exemples/.test(l)) return;
      const ln = l.match(/\(\[([^\]]+)\]\(([^)?]+)[^)]*\)\)/);
      const txt = l.replace(/\s*\(\[[^\]]+\]\([^)]*\)\)/g, '').trim();
      if (txt) doc.push(ln ? { t: txt, s: ln[1], u: ln[2] } : { t: txt });
    });
    const sl = slug(p.t); if (p.grp) { p.grp.forEach((g, gi) => { if (!g.n) g.n = gi === p.grp.length - 1 ? p.ps.length - (gi * 10) : 10; }); }
    const o = { id: p.id, s: sl, grp: p.grp, secs: p.secs || SECS_OF(p), t: p.t, d: p.d, c: [a, b, c], m, ps: p.ps.map((x) => { const key = norm(x.h + ' ' + x.n); const hs = p.id === 79 ? HIST[norm(x.q)] : null; const r = { q: x.q }; if (x.w) r.w = x.w; if (x.h) { r.h = x.h; r.n = x.n; } if (hs) r.lab = hs; return r; }) };
    if (p.id === 79) { doc.length = 0; doc.push({ t: 'La maison Atkinsons et le 24 Old Bond Street sont historiquement documentés ; le flacon d\'aujourd\'hui est une réinterprétation moderne de cet héritage, pas un flacon inchangé depuis le XIXe siècle.', s: 'Atkinsons 1799', u: 'https://www.atkinsons1799.com/pages/history' }); }
    if (fs.existsSync(path.join(root, 'v2', 'img', 'pl', sl + '.webp'))) o.img = 'img/pl/' + sl + '.webp';
    if (p.doc2) p.doc2.forEach((d) => doc.push(d));
    if (doc.length) o.doc = doc;
    if (p.id === 81) o.combos = p.note.filter((l) => /^\* /.test(l)).map((l) => l.replace(/^\* /, '').split(' + '));
    return o;
  });
  fs.writeFileSync(path.join(root, 'playlists.js'), '// Généré par tools/build-playlists.js depuis data/playlists-source.txt\nwindow.PL_SECTIONS = ' + JSON.stringify(['Cinéma, séries & livres', 'Icônes', 'Archétypes', 'Destinations', 'Moments', 'Atmosphères', 'Effets', 'Spécial']) + ';\nwindow.PLAYLISTS = ' + JSON.stringify(res) + ';\n');
  console.log('playlists.js', res.length);
}
if (require.main === module) out();
