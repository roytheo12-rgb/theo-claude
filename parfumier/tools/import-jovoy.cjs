// data/web-raw/jovoy.jsonl -> data/fiches-6.txt (pyramide, famille, genre, sillage) + data/profils-jovoy.json (profil à 18 axes calculé sur les vraies notes, saisons / moment lus sur la fiche)
const fs = require('fs'), path = require('path');
const { E, ctx } = require('./eval-pool.cjs');
const root = path.join(__dirname, '..');
const rows = fs.readdirSync(path.join(root, 'data/web-raw')).filter((f) => /^jovoy.*\.jsonl$/.test(f)).flatMap((f) => fs.readFileSync(path.join(root, 'data/web-raw', f), 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean));
const N = E.norm, HA = ctx.HOUSE_ALIAS || {};
const houses = [...new Set(ctx.INDEX.map(([h]) => h).concat(ctx.CATALOG.map((c) => c.house)))];
const slugHouse = (slug) => { const t = N(slug.replace(/-/g, ' ')); const toks = t.split(' ').filter((x) => x.length > 1); let best = null; for (const h of houses) { const nh = N(h); if (nh === t || toks.every((w) => nh.split(' ').includes(w)) || N(h.replace(/^maison /i, '')) === t) { if (!best || nh.length < N(best).length) best = h; } } return best; };
const STRIP = /\b(eau de parfum|eau de toilette|extrait de parfum|extrait|parfum|edp|edt|elixir|cologne|pour homme|intense|absolu)\b/g;
const key = (n) => N(n).replace(/^replica /, '').replace(STRIP, '').replace(/\s+/g, ' ').trim();
const byHouse = {}; ctx.INDEX.forEach(([h, a]) => a.forEach(([n]) => { (byHouse[N(h)] = byHouse[N(h)] || {})[key(n)] = n; })); ctx.CATALOG.forEach((c) => { (byHouse[N(c.house)] = byHouse[N(c.house)] || {})[key(c.name)] = c.name; });
const title = (s) => s.toLowerCase().replace(/(^|[\s'’-])([a-zà-ÿ])/g, (m, a, b) => a + b.toUpperCase()).replace(/\bDe\b/g, 'de').replace(/\bDu\b/g, 'du').replace(/\bLa\b(?!\s*$)/g, 'La');
const FAMU = { 'parfums-fleuris': 'floral', 'parfums-boises': 'boisé', 'parfums-ambres': 'ambré', 'parfums-aromatiques': 'aromatique', 'parfums-gourmands': 'gourmand', 'parfums-hesperides': 'agrumes', 'parfums-cuires': 'cuir', 'parfums-epices': 'épicé', 'parfums-frais': 'aquatique', 'parfums-musques': 'musqué', 'parfums-orientaux': 'ambré', 'parfums-verts': 'vert', 'parfums-aquatiques': 'aquatique', 'parfums-fruites': 'fruité', 'parfums-oud': 'oud' };
const SILL = [[/intime|discret/i, 2], [/l[ée]ger|subtil/i, 2], [/mod[ée]r[ée]|moyen/i, 3], [/puissant|fort|intense/i, 4], [/extravagant|[ée]norme|monstre/i, 5]];
const lc = (a) => a.map((x) => x.toLowerCase().replace(/\s+/g, ' ').trim()).filter((x) => x && x.length <= 32 && !/[«».:]|jovoy|parfumeur|^(notes?|tête|coeur|fond|intensité)$/.test(x) && x.split(' ').length <= 4).slice(0, 9);
// Les pages de marque affichent aussi des produits d'autres marques (nouveautés, meilleures ventes) : un produit vu sous plusieurs marques
// n'est gardé que pour la marque dont la base connaît déjà ce nom ; sinon il est ignoré.
const byUrl = {}; rows.forEach((r) => { (byUrl[r.url] = byUrl[r.url] || []).push(r); });
const rows2 = [];
for (const g of Object.values(byUrl)) {
  if (g.length === 1) { rows2.push(g[0]); continue; }
  const owner = g.find((r) => { const h = slugHouse(r.marque); return h && (byHouse[N(h)] || {})[key(r.name)]; });
  if (owner) rows2.push(owner);
}
const out = [], prof = {}, seen = new Set(), report = { match: 0, nouveau: 0, sansmaison: new Set() };
for (const r of rows2) {
  const h = slugHouse(r.marque); if (!h) { report.sansmaison.add(r.marque); continue; }
  const t = lc(r.tete), c = lc(r.coeur), f = lc(r.fond), all = [...t, ...c, ...f];
  if (all.length < 3 || /coffret|set |discovery|d[ée]couverte|miniature|bougie|candle|savon|soap|body|corps|cr[eè]me|lotion/i.test(r.name)) continue;
  const names = byHouse[N(h)] || {}, kk = key(r.name);
  let name = names[kk], hit = !!name; if (!name) name = title(r.name);
  const k = N(HA[N(h)] || h) + '|' + N(name); if (seen.has(k)) continue; seen.add(k);
  hit ? report.match++ : report.nouveau++;
  const cat = (r.url.match(/\/fr\/([a-z-]+)\//) || [])[1], pf = r.profil.join(' ');
  const o = E.olfactive({ notes: all });
  const fam = FAMU[cat] || o.fam || 'boisé';
  let g = /unisexe/i.test(pf) ? 'u' : /masculin|homme/i.test(pf) ? 'm' : /f[ée]minin|femme/i.test(pf) ? 'f' : (ctx.genderOf ? ctx.genderOf(name, h) : 'u') || 'u';
  const sill = (SILL.find(([re]) => re.test(pf)) || [0, 0])[1], d = E.derive({ name, house: h, notes: all, family: fam });
  const proj = sill || d.projection, tenue = Math.min(5, Math.max(2, Math.round(d.longevity + (sill >= 4 ? .5 : 0))));
  out.push([h, name, fam, g, t.join(';'), c.join(';'), f.join(';'), proj, tenue, d.weight, 0].join('|'));
  const q = E.deriveProfile({ name, house: h, notes: all, weight: d.weight });
  if (q) {
    const S = /toutes saisons/i.test(pf) ? [4, 4, 4, 4] : null; if (S) q.s = S; else { const m = []; if (/printemps/i.test(pf)) m[0] = 4; if (/[ée]t[ée]/i.test(pf)) m[1] = 4; if (/automne/i.test(pf)) m[2] = 4; if (/hiver/i.test(pf)) m[3] = 4; if (m.length) q.s = q.s.map((v, i) => (m[i] ? Math.max(v, 4) : Math.min(v, 3))); }
    if (/jour\s*&\s*nuit/i.test(pf)) q.m = [4, 4]; else if (/jour/i.test(pf)) q.m = [5, 2]; else if (/nuit|soir/i.test(pf)) q.m = [2, 5];
    q.derived = true; q.src = 'jovoy'; prof[k] = q;
  }
}
fs.writeFileSync(path.join(root, 'data/fiches-6.txt'), '# Généré par tools/import-jovoy.cjs : pyramides lues sur les fiches produit publiques de Jovoy (faits structurés uniquement)\n' + out.join('\n') + '\n');
fs.writeFileSync(path.join(root, 'data/profils-jovoy.json'), JSON.stringify(prof));
console.log(out.length, 'fiches ;', report.match, 'rapprochées de la base,', report.nouveau, 'nouvelles ; marques non reconnues :', [...report.sansmaison].join(', '));
