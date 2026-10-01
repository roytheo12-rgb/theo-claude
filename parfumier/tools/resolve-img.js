// Rattache chaque photo de incoming/ à un parfum de la base (catalogue détaillé + grand index).
// Entrée : data/imgmap.txt (fichier|maison|nom). Sortie : JSON {file, house, name, status, ...} sur stdout.
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const win = {}; vm.createContext(win); win.window = win;
for (const f of ['data.js', 'index.js', 'engine.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), win);
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
const all = [];
(win.CATALOG || vm.runInContext('typeof CATALOG!=="undefined"?CATALOG:[]', win)).forEach((c) => all.push({ house: c.house, name: c.name, cat: true }));
(win.INDEX || []).forEach(([h, arr]) => arr.forEach(([n]) => all.push({ house: h, name: n })));
const same = (a, b) => { a = norm(a); b = norm(b); return a === b || a.includes(b) || b.includes(a); };
const out = [];
for (const line of fs.readFileSync(path.join(root, 'data/imgmap.txt'), 'utf8').split('\n').filter(Boolean)) {
  let [f, house, name] = line.split('|'); const file = f.startsWith('f:') ? f.slice(2) : f + '.jpg';
  const nn = norm(name);
  let c = all.filter((x) => norm(x.name) === nn);
  let hit = c.find((x) => same(x.house, house)) || (c.length === 1 ? c[0] : null);
  out.push(hit ? { file, status: 'ok', house: hit.house, name: hit.name, cat: !!hit.cat } : { file, status: 'absent', house, name });
}
console.log(JSON.stringify(out));
