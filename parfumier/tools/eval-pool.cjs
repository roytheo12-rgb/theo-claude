// Charge la base réelle (catalogue + fiches + notes de la base) dans Node, comme le fait l'appli.
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { console }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['data.js', 'desc.js', 'index.js', 'facts.js', 'fiches.js', 'engine.js']) { try { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); } catch (e) { console.error(f, e.message); } }
const E = ctx.Engine || ctx.window.Engine;
// Pool = catalogue détaillé + toutes les entrées de la base dont les notes sont réelles (FACTS).
function pool() {
  const out = [], seen = new Set(), ED = new Set(ctx.EDITIONS || []);
  (ctx.CATALOG || []).forEach((c) => { if (c.notes && c.notes.length >= 3) { seen.add(E.norm(c.house + ' ' + c.name)); c.curated = true; out.push(c); } });
  (ctx.INDEX || []).forEach(([h, arr]) => arr.forEach(([n]) => {
    const k = E.norm(h + ' ' + n); if (seen.has(k)) return;
    const f = (ctx.FACTS || {})[E.norm(h) + '|' + E.norm(n)]; if (!f || !f.n || f.n.length < 3) return;
    if (ED.has(E.norm(h) + '|' + E.norm(n))) return; seen.add(k);
    out.push({ name: n, house: h, notes: f.n, price: 0 });
  }));
  return out;
}
module.exports = { E, ctx, pool };
