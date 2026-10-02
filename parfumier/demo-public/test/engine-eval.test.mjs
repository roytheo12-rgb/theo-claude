// Évaluation du moteur de correspondance sur la base réelle : chaque besoin a des critères vérifiables
// sur les notes (indépendants du calcul du moteur) ; on exige une précision minimale sur les 10 premiers.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { E, ctx, pool } = createRequire(import.meta.url)('../../tools/eval-pool.cjs');
const P = pool(); const nrm = E.norm;
const has = (c, ...ks) => (c.notes || []).some((n) => ks.some((k) => nrm(n).includes(nrm(k))));
const FRESH = ['citron', 'bergamote', 'pamplemousse', 'mandarine', 'orange', 'lavande', 'menthe', 'marin', 'thé', 'vert', 'romarin', 'yuzu', 'cédrat', 'néroli', 'sauge', 'basilic', 'lime', 'agrume', 'gingembre', 'eucalyptus', 'concombre', 'sel', 'galbanum', 'fougère', 'muguet', 'feuille', 'herbe', 'cologne'];
const HEAVY = ['oud', 'cuir', 'tabac', 'caramel', 'praliné', 'goudron', 'fumée', 'myrrhe', 'miel', 'cacao', 'chocolat'];
const SW = ['vanille', 'caramel', 'praliné', 'miel', 'cacao', 'chocolat', 'sucre', 'tonka', 'barbe à papa', 'guimauve'];
// [besoin, minPrecision, prédicat sur la fiche]
const CASES = [
  ['frais pour le bureau en été', .9, (c) => has(c, ...FRESH) && !has(c, ...HEAVY)],
  ['vanille gourmand pour l\'hiver sans patchouli', 1, (c) => has(c, 'vanille') && !has(c, 'patchouli')],
  ['cuir fumé pour homme', .9, (c) => has(c, 'cuir', 'daim', 'suède') && ctx.genderOf(c.name, c.house) !== 'f'],
  ['oud', 1, (c) => has(c, 'oud', 'agar')],
  ['rose poudrée féminin', .9, (c) => has(c, 'rose') && ctx.genderOf(c.name, c.house) !== 'm'],
  ['agrumes léger pour le sport sans musc', .9, (c) => has(c, 'citron', 'bergamote', 'pamplemousse', 'mandarine', 'orange', 'yuzu', 'cédrat', 'lime', 'marin') && !has(c, 'musc')],
  ['premier rendez-vous, pas trop sucré', .9, (c) => !has(c, ...SW)],
  ['lavande aromatique pour homme', .9, (c) => has(c, 'lavande', 'romarin', 'sauge', 'basilic', 'menthe', 'thym', 'fougère') && ctx.genderOf(c.name, c.house) !== 'f'],
  ['gourmand soirée sans vanille', 1, (c) => !has(c, 'vanille')],
  ['encens et myrrhe pour l\'hiver', .9, (c) => has(c, 'encens', 'myrrhe', 'oliban', 'résine')],
  ['jasmin pour femme moins de 150€', .9, (c) => has(c, 'jasmin') && (!c.price || c.price <= 150) && ctx.genderOf(c.name, c.house) !== 'm'],
  ['tubéreuse sans rose', 1, (c) => has(c, 'tubéreuse') && !has(c, 'rose')],
  ['figue verte été', .8, (c) => has(c, 'figue', 'figuier')],
  ['santal crémeux calme', .9, (c) => has(c, 'santal')],
];
let ok = 0, fail = 0;
for (const [q, min, pred] of CASES) {
  const need = E.parseNeed(q), res = E.searchNeed(P, need, {}, 10), good = res.filter((r) => pred(r.c)).length, prec = res.length ? good / res.length : 0;
  const bad = res.filter((r) => !pred(r.c)).map((r) => r.c.house + ' - ' + r.c.name).slice(0, 3);
  if (res.length >= 8 && prec >= min) { ok++; console.log('ok', q, '→', good + '/' + res.length); }
  else { fail++; console.log('KO', q, '→', good + '/' + res.length, 'hors critère :', bad.join(' ; ')); }
}
// Pas de devinette : une fiche sans notes réelles n'est jamais proposée
assert.equal(E.matchNeed({ name: 'Inconnu', house: 'X', notes: [] }, E.parseNeed('boisé')), null);
// Exclusions dures : budget, note fuie, genre
assert.ok(E.searchNeed(P, E.parseNeed('boisé moins de 100€'), {}, 20).every((r) => !r.c.price || r.c.price <= 100));
assert.ok(E.searchNeed(P, E.parseNeed('floral'), { avoid: ['rose'] }, 20).every((r) => !has(r.c, 'rose')));
assert.ok(E.searchNeed(P, E.parseNeed('boisé'), { gender: 'm' }, 30).every((r) => ctx.genderOf(r.c.name, r.c.house) !== 'f'));
// Une seule version par famille de parfum
{ const r = E.searchNeed(P, E.parseNeed('vanille'), {}, 20), k = r.map((x) => nrm(x.c.house) + '|' + nrm(x.c.name).split(' ')[0]); assert.equal(new Set(k).size, k.length); }
// Le profil olfactif vient des notes : un agrume est frais et léger, un oud lourd
{ const a = E.derive({ name: 'a', house: 'h', notes: ['citron', 'bergamote', 'néroli', 'cèdre', 'musc'] }), b = E.derive({ name: 'b', house: 'h', notes: ['safran', 'oud', 'rose', 'ambre', 'patchouli', 'vanille'] });
  assert.ok(a.weight <= 2, 'agrume léger ' + a.weight); assert.ok(b.weight >= 4, 'oud lourd ' + b.weight); assert.equal(b.family, 'oud'); }
console.log(`\n${ok}/${ok + fail} besoins au niveau, pool ${P.length}`);
assert.equal(fail, 0, fail + ' besoin(s) en dessous du seuil');
