// Relie chaque parfum à son nez, à sa famille et à un prix : fiches éditoriales + fiches détaillées + catalogue.
// Un parfum sans prix reçoit le prix médian des autres parfums de sa collection (ou de sa maison), signalé « estimé ».
// Sortie : enrich.js (window.ENRICH, clé « maison|nom » normalisée).
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const w = {}; w.window = w; w.self = w; vm.createContext(w);
for (const f of ['data', 'index', 'fiches', 'facts', 'editorial']) vm.runInContext(fs.readFileSync(path.join(root, f + '.js'), 'utf8'), w);
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const HA = w.HOUSE_ALIAS || {}, ch = (h) => HA[norm(h)] || h;
const FAM_KW = [['oud', 'oud'], ['aoud', 'oud'], ['cuir', 'cuir'], ['leather', 'cuir'], ['ambré', 'ambré'], ['ambre', 'ambré'], ['gourmand', 'gourmand'], ['vanill', 'gourmand'], ['praliné', 'gourmand'], ['caramel', 'gourmand'], ['chocolat', 'gourmand'], ['cacao', 'gourmand'], ['boisé', 'boisé'], ['bois', 'boisé'], ['aquatique', 'aquatique'], ['marin', 'aquatique'], ['iodé', 'aquatique'], ['agrume', 'agrumes'], ['hespér', 'agrumes'], ['cologne', 'agrumes'], ['citron', 'agrumes'], ['bergamote', 'agrumes'], ['vert', 'vert'], ['herb', 'vert'], ['aromatique', 'aromatique'], ['fougère', 'aromatique'], ['lavande', 'aromatique'], ['épicé', 'épicé'], ['poivre', 'épicé'], ['safran', 'épicé'], ['musc', 'musqué'], ['floral', 'floral'], ['rose', 'floral'], ['jasmin', 'floral'], ['tubéreuse', 'floral'], ['iris', 'floral'], ['fleur', 'floral'], ['fruité', 'fruité'], ['fruit', 'fruité']];
function famOf(desc) {
  const t = String(desc || '').toLowerCase().replace(/^notes\s*:.*?\.\s/, '').slice(0, 110); let best = null, at = 1e9;
  for (const [k, f] of FAM_KW) { const i = t.indexOf(k); if (i >= 0 && i < at) { at = i; best = f; } }
  return best;
}
const E = {}, get = (h, n) => E[norm(ch(h)) + '|' + norm(n)] || (E[norm(ch(h)) + '|' + norm(n)] = {});
const NB = w.NOSE_BY || {};
// 1) fiches éditoriales
Object.values(w.EDITORIAL || {}).forEach((e) => {
  const o = get(e.h, e.n);
  if (e.nez) o.n = e.nez.split(/\s*(?:,|\bet\b|&|\/)\s*/).map((x) => x.trim()).filter((x) => x.length > 2);
  if (e.prix) o.p = e.prix;
  if (e.an) o.y = +e.an || undefined;
  if (e.coll) o.c = e.coll;
  const f = famOf(e.desc); if (f) o.f = f;
});
// 2) catalogue détaillé et fiches (famille, prix)
(w.CATALOG || []).forEach((c) => { if (!c.name || !c.house) return; const o = get(c.house, c.name); if (c.family && !o.f) o.f = c.family; if (c.price && !o.p) o.p = c.price; });
// 2b) nez cités dans les descriptions rédigées (« signé Quentin Bisch », « créé par Olivia Giacobetti »)
const NOSE_RX = /(?:sign[ée]e?s?|cr[ée]{2}e?s?|compos[ée]e?s?|imagin[ée]e?s?|con[çc]ue?s?|orchestr[ée]e?s?|r[ée]alis[ée]e?s?)\s+par\s+([A-ZÉÈ][\p{L}'’.\-]+(?:\s+(?:de|du|von|van|di|da)?\s*[A-ZÉÈ][\p{L}'’.\-]+){0,2})|la patte (?:de|du)\s+([A-ZÉÈ][\p{L}'’.\-]+(?:\s+[A-ZÉÈ][\p{L}'’.\-]+){0,2})|sign[ée]e? ([A-ZÉÈ][\p{L}'’.\-]+\s+[A-ZÉÈ][\p{L}'’.\-]+)/u;
const BAD = /^(La|Le|Les|Un|Une|Cette|Cet|Ce|Ses|Son|Sa|Louis|Parfums|Maison|Roja|Dior|Chanel|Guerlain|Hermès|Creed|Kilian|Initio|Armani|Nishane|Memo|Floris|Penhaligon|Serge|Jean|Atelier|Houbigant|Byredo|Diptyque)\b/;
const bioFile = path.join(root, 'data', 'bios-extra.txt');
let bioLines = []; try { bioLines = fs.readFileSync(bioFile, 'utf8').split('\n'); } catch (e) { /* pas de bios */ }
let mined = 0;
const mine = (k, txt) => { const o = E[k]; if (!o || (o.n && o.n.length)) return; const m = String(txt || '').match(NOSE_RX); const n = m && (m[1] || m[2] || m[3]); if (n && !BAD.test(n.trim()) && n.trim().length > 4) { o.n = [n.trim()]; mined++; } };
Object.values(w.EDITORIAL || {}).forEach((e) => mine(norm(ch(e.h)) + '|' + norm(e.n), e.desc));
bioLines.forEach((l) => { const p = l.split('|'); if (p.length >= 3) mine(norm(ch(p[0])) + '|' + norm(p[1]), p.slice(2).join('|')); });
// 3) nez connus par ailleurs (noses.txt)
Object.keys(E).forEach((k) => { if (NB[k] && NB[k].length && !(E[k].n && E[k].n.length)) E[k].n = NB[k].slice(); });
// 3b) famille : à défaut, lue dans la description rédigée
bioLines.forEach((l) => { const p = l.split('|'); if (p.length < 3) return; const k = norm(ch(p[0])) + '|' + norm(p[1]); const o = E[k] || (E[k] = {}); if (!o.f) { const f = famOf(p.slice(2).join('|')); if (f) o.f = f; } });
// 3c) prix relevés (data/prix-connus.txt) : ils remplacent toute estimation
fs.readFileSync(path.join(root, 'data', 'prix-connus.txt'), 'utf8').split('\n').forEach((l) => { const t = l.split('|').map((x) => x.trim()); if (t.length < 3 || l.startsWith('#')) return; const o = get(t[0], t[1]); o.p = +t[2]; delete o.pe; });
// 3d) barème officiel par maison et concentration (tools/prix-officiels.cjs), sauf parfum au prix déjà relevé
const KN = new Set(); fs.readFileSync(path.join(root, 'data', 'prix-connus.txt'), 'utf8').split('\n').forEach((l) => { const t = l.split('|').map((x) => x.trim()); if (t.length >= 3 && !l.startsWith('#')) KN.add(norm(ch(t[0])) + '|' + norm(t[1])); });
const official = require('./prix-officiels.cjs'); let offN = 0;
const allNames = []; (w.INDEX || []).forEach(([h, arr]) => arr.forEach(([n]) => allNames.push([h, n]))); (w.CATALOG || []).forEach((c) => c.name && c.house && allNames.push([c.house, c.name]));
allNames.forEach(([h, n]) => { const hn = norm(ch(h)), k = hn + '|' + norm(n); if (KN.has(k)) return; const o = get(h, n), r = official(hn, norm(n), o.c); if (r) { o.p = r.p; delete o.pe; offN++; } });
console.log(offN, 'prix du barème officiel appliqués');
// 4) prix estimés : médiane de la collection (si connue) puis de la maison
const all = [];
(w.INDEX || []).forEach(([h, arr]) => arr.forEach(([n]) => all.push([h, n])));
(w.CATALOG || []).forEach((c) => c.name && c.house && all.push([c.house, c.name]));
const byHouse = {}, byColl = {};
Object.keys(E).forEach((k) => { const o = E[k]; if (!o.p) return; const h = k.split('|')[0]; (byHouse[h] = byHouse[h] || []).push(o.p); if (o.c) (byColl[h + '|' + o.c] = byColl[h + '|' + o.c] || []).push(o.p); });
const STOPN = new Set(['di', 'de', 'du', 'des', 'la', 'le', 'les', 'l', 'd', 'eau', 'the', 'and', 'et', 'by', 'pour']);
const lineKey = (hn, name) => { const t = norm(name).split(' ').filter((x) => x && !STOPN.has(x)); return t.length >= 2 ? hn + '|' + t[0] + ' ' + t[1] : null; };
const byLine = {};
Object.keys(E).forEach((k) => { const o = E[k]; if (!o.p) return; const i = k.indexOf('|'), lk = lineKey(k.slice(0, i), k.slice(i + 1)); if (lk) (byLine[lk] = byLine[lk] || []).push(o.p); });
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const round5 = (x) => Math.round(x / 5) * 5;
let est = 0, cnt = 0;
// Prix indicatifs par maison quand rien d'autre n'est connu (data/prix-maisons.txt)
const HP = {}; fs.readFileSync(path.join(root, 'data', 'prix-maisons.txt'), 'utf8').split('\n').forEach((l) => { if (!l.includes('|') || l.startsWith('#')) return; const [h, p] = l.split('|'); HP[norm(ch(h.trim()))] = +p; });
all.forEach(([h, n]) => {
  const k = norm(ch(h)) + '|' + norm(n), o = E[k] || (E[k] = {});
  if (!o.p) {
    const hn = norm(ch(h)), lk = lineKey(hn, n), LL = lk && byLine[lk] && byLine[lk].length >= 2 ? byLine[lk] : null, L = (o.c && byColl[hn + '|' + o.c]) || LL || byHouse[hn];
    if (L && L.length) { o.p = round5(med(L)); o.pe = 1; est++; }
    else if (HP[hn]) { const nn = norm(n), f = /extrait|elixir|absolu|parfum$|intense/.test(nn) && HP[hn] >= 100 ? 1.25 : /cologne|edt|eau fraiche/.test(nn) ? .8 : 1; o.p = round5(HP[hn] * f); o.pe = 1; est++; }
  }
  cnt++;
});
Object.keys(E).forEach((k) => { const o = E[k]; if (!o.n && !o.f && !o.p && !o.y && !o.c) delete E[k]; });
// Les incontournables : très grands succès de la parfumerie (data/incontournables.txt), ramenés à la base
const have = new Set(all.map(([h, n]) => norm(ch(h)) + '|' + norm(n))), INC = [];
fs.readFileSync(path.join(root, 'data', 'incontournables.txt'), 'utf8').split('\n').forEach((l) => { if (!l.includes('|') || l.startsWith('#')) return; const [h, n] = l.split('|'); const k = norm(ch(h)) + '|' + norm(n); if (have.has(k) && !INC.includes(k)) INC.push(k); });
fs.writeFileSync(path.join(root, 'enrich.js'), '// Généré par tools/build-enrich.js : nez, famille, année, collection et prix (estimé si inconnu) de chaque parfum.\nwindow.ENRICH = ' + JSON.stringify(E) + ';\nwindow.INCONT = ' + JSON.stringify(INC) + ';\n');
console.log(INC.length, 'incontournables retrouvés dans la base');
console.log(mined, 'nez lus dans les descriptions;', Object.keys(E).length, 'fiches enrichies,', est, 'prix estimés sur', cnt);
