// Bio de chaque parfum = fusion des phrases écrites pour lui dans les playlists (Inspirations) -> bios.js
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const w = {}; w.window = w; vm.createContext(w);
vm.runInContext(fs.readFileSync(path.join(root, 'playlists.js'), 'utf8'), w);
const GENERIC = /^Choix d'experts|^Maison abordable|^Qualité niche à prix|^Le costume bien coupé : choix/i;
const clean = (s) => { s = String(s || '').trim().replace(/\s+/g, ' '); if (!s) return ''; return /[.!?…»]$/.test(s) ? s : s + '.'; };
const by = new Map();
(w.PLAYLISTS || []).forEach((p) => (p.ps || []).forEach((x) => {
  if (!x.h || !x.w || GENERIC.test(x.w) || x.w.length < 18) return;
  const k = x.h + '|' + x.n; const o = by.get(k) || { w: [], pl: [] };
  const t = clean(x.w); if (!o.w.some((y) => y.toLowerCase() === t.toLowerCase())) o.w.push(t);
  if (!o.pl.includes(p.t)) o.pl.push(p.t);
  by.set(k, o);
}));
const out = {};
for (const [k, o] of by) {
  const parts = []; let len = 0;
  for (const t of o.w) { if (parts.length >= 4 || len + t.length > 460) break; parts.push(t); len += t.length + 1; }
  if (parts.length) out[k] = [parts.join(' '), o.pl.slice(0, 6)];
}
fs.writeFileSync(path.join(root, 'bios.js'), 'window.BIOS = ' + JSON.stringify(out) + ';\n');
console.log('bios.js', Object.keys(out).length, 'parfums');
