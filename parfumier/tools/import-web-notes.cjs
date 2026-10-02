// data/web-notes/*.txt (lignes « Maison|Parfum|genre m/f/u|tête;..|cœur;..|fond;.. ») lues sur les pages officielles et revendeurs via la recherche web
// -> data/fiches-7.txt (format historique) + data/profils-web.json (profil à 18 axes calculé sur les notes). Famille, projection, tenue, poids sont CALCULÉS à partir des notes.
const fs = require('fs'), path = require('path');
const { E, ctx } = require('./eval-pool.cjs');
const root = path.join(__dirname, '..'), N = E.norm;
const houses = [...new Set(ctx.INDEX.map(([h]) => h).concat(ctx.CATALOG.map((c) => c.house)))];
const STRIP = /\b(eau de parfum|eau de toilette|extrait de parfum|extrait|parfum|edp|edt|elixir|cologne|pour homme|intense|absolu)\b/g;
const key = (n) => N(n).replace(/^replica /, '').replace(STRIP, '').replace(/\s+/g, ' ').trim();
const byHouse = {}; ctx.INDEX.forEach(([h, a]) => a.forEach(([n]) => { (byHouse[N(h)] = byHouse[N(h)] || {})[key(n)] = n; })); ctx.CATALOG.forEach((c) => { (byHouse[N(c.house)] = byHouse[N(c.house)] || {})[key(c.name)] = c.name; });
const out = [], prof = {}, seen = new Set(); let match = 0, nouv = 0, bad = 0;
const lc = (s) => (s || '').split(';').map((x) => x.toLowerCase().replace(/\s+/g, ' ').trim()).filter((x) => x && x !== '-' && x.length <= 36).slice(0, 10);
for (const f of fs.readdirSync(path.join(root, 'data/web-notes')).filter((x) => x.endsWith('.txt')).sort()) {
  for (const line of fs.readFileSync(path.join(root, 'data/web-notes', f), 'utf8').split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const p = line.split('|').map((x) => x.trim()); if (p.length < 6) { bad++; continue; }
    let [h0, name, g, t, c, b] = p; const h = houses.find((x) => N(x) === N(h0)) || h0;
    const T = lc(t), C = lc(c), B = lc(b), all = [...T, ...C, ...B]; if (all.length < 3) { bad++; continue; }
    const names = byHouse[N(h)] || {}, hit = names[key(name)]; if (hit) { name = hit; match++; } else nouv++;
    const k = N(h) + '|' + N(name); if (seen.has(k)) continue; seen.add(k);
    const o = E.olfactive({ notes: all }), d = E.derive({ name, house: h, notes: all, family: o.fam });
    out.push([h, name, o.fam || 'boisé', 'mfu'.includes(g) && g ? g : 'u', T.join(';'), C.join(';'), B.join(';'), d.projection, d.longevity, d.weight, 0].join('|'));
    const q = E.deriveProfile({ name, house: h, notes: all, weight: d.weight }); if (q) { q.src = 'web'; prof[k] = q; }
  }
}
fs.writeFileSync(path.join(root, 'data/fiches-7.txt'), '# Généré par tools/import-web-notes.cjs : pyramides lues sur des pages officielles et revendeurs (recherche web) ; famille, projection, tenue, poids calculés\n' + out.join('\n') + '\n');
fs.writeFileSync(path.join(root, 'data/profils-web.json'), JSON.stringify(prof));
console.log(out.length, 'fiches (', match, 'rapprochées,', nouv, 'nouvelles,', bad, 'rejetées )');
