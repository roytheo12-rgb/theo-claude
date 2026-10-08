// Lit data/house-order.txt et écrit houseorder.js : pour chaque maison, la liste des noms EXACTS de la base, dans l'ordre voulu.
// Les parfums cités mais absents de la base sont listés dans la sortie (jamais inventés).
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..'), ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['data.js', 'index.js', 'playlists.js']) { try { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx); } catch (e) { /* ok */ } }
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/n°|no\./g, 'n ').replace(/[^a-z0-9]+/g, ' ').trim();
const cand = {}; const add = (h, n) => { if (!h || !n) return; (cand[norm(h)] = cand[norm(h)] || new Set()).add(n); };
(ctx.INDEX || []).forEach(([h, a]) => a.forEach(([n]) => add(h, n))); (ctx.CATALOG || []).forEach((c) => add(c.house, c.name)); (ctx.PLAYLISTS || []).forEach((p) => p.ps.forEach((x) => add(x.h, x.n)));
const out = {}, miss = []; let house = null;
fs.readFileSync(path.join(root, 'data', 'house-order.txt'), 'utf8').split('\n').forEach((l) => {
  if (!l.trim() || l.startsWith('#') && !l.startsWith('## ')) return;
  if (l.startsWith('## ')) { house = l.slice(3).trim(); out[norm(house)] = []; return; }
  const lw = l.includes('=>') ? l.split('=>')[1] : l; const want = norm(lw).replace(/ (eau de parfum|eau de toilette|edp|edt)$/, '') || norm(lw), set = [...(cand[norm(house)] || [])]; let hit = set.find((x) => norm(x) === want);
  if (!hit && want.length >= 6) { const st = set.filter((x) => norm(x).startsWith(want)); hit = st.sort((a, b) => a.length - b.length)[0]; }
  if (!hit && want.length >= 6) { const ws = want.split(' '), ct = set.filter((x) => ws.every((w) => norm(x).split(' ').includes(w))); hit = ct.sort((a, b) => a.length - b.length)[0]; }
  if (hit && !out[norm(house)].includes(hit)) out[norm(house)].push(hit); else if (!hit) miss.push(house + ' : ' + l.split('=>')[0].trim());
});
// incontournables : parfums de la base à placer en tête, dans l'ordre
const inc = [], incMiss = [];
fs.readFileSync(path.join(root, 'data', 'incontournables-top.txt'), 'utf8').split('\n').forEach((l) => {
  if (!l.includes('|') || l.startsWith('#')) return; const [h, n] = l.split('|').map((x) => x.trim()), want = norm(n), set = [...(cand[norm(h)] || [])];
  let hit = set.find((x) => norm(x) === want); if (!hit && want.length >= 6) hit = set.filter((x) => norm(x).startsWith(want)).sort((a, b) => a.length - b.length)[0];
  if (hit) inc.push([set.length ? (ctx.INDEX.find(([hh]) => norm(hh) === norm(h)) || [h])[0] : h, hit]); else incMiss.push(h + ' : ' + n);
});
// alternatives citées par les passionnés (data/alternatives.txt)
const ALTS = []; try { fs.readFileSync(path.join(root, 'data', 'alternatives.txt'), 'utf8').split('\n').forEach((l) => { if (l.startsWith('#') || !l.includes('|')) return; const [a, b] = l.split('|'); ALTS.push([norm(a), norm(b)]); }); } catch (e) { /* aucune */ }
fs.writeFileSync(path.join(root, 'houseorder.js'), '// Généré par tools/build-houseorder.cjs depuis data/house-order.txt : ordre d\'affichage des parfums par maison.\nwindow.HOUSE_ORDER = ' + JSON.stringify(out) + ';\nwindow.INC_TOP = ' + JSON.stringify(inc) + ';\nwindow.ALTS = ' + JSON.stringify(ALTS) + ';\n');
console.log(Object.keys(out).length + ' maisons, ' + Object.values(out).reduce((a, b) => a + b.length, 0) + ' parfums trouvés.');
console.log(inc.length + ' incontournables en tête ; absents : ' + incMiss.join(' ; '));
console.log('Absents de la base (' + miss.length + ') :\n' + miss.join('\n'));
