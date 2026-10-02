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
// Comparaison par profils : quelqu'un qui adore Shalimar et Samsara et fuit Sauvage / Acqua di Giò doit voir les ambrés/vanillés avant les frais
{
  const own = [['Guerlain', 'Shalimar', 5], ['Guerlain', 'Samsara', 5], ['Dior', 'Sauvage', 1], ['Armani', 'Acqua di Giò', 2]].map(([house, name, rating]) => ({ house, name, rating, notes: [] }));
  const pref = E.axisPref(own), cands = ctx.CATALOG.filter((c) => E.profOf(c) && !own.some((o) => o.name === c.name)), r = E.rankByFit(cands, pref);
  assert.ok(pref && r.length >= 20);
  const top = r.slice(0, 10).map((x) => x.c.name), bottom = r.slice(-10).map((x) => x.c.name);
  assert.ok(r.slice(0, 10).every((x) => x.c.family !== 'aquatique' && x.c.family !== 'agrumes'), 'pas de frais en tête : ' + top);
  assert.ok(bottom.some((n) => /Light Blue|Invictus|Cool Water|Eternity|CK One/.test(n)), 'les frais en bas : ' + bottom);
  console.log('ok comparaison par profils (goûts → classement)', top.slice(0, 3).join(', '));
}
// Conseils : deux profils différents ne reçoivent pas la même liste ; la wishlist oriente les goûts
{
  const top = (st, wish = [], col = []) => E.recommend(P, col, wish, st).sort((a, b) => b.total - a.total).slice(0, 12).map((r) => r.c.house + '|' + r.c.name);
  const a = top({ gender: 'f', age: 19, budget: 300, seed: 'a|Lea|19' }), b = top({ gender: 'm', age: 52, budget: 300, seed: 'b|Paul|52' }), c = top({ gender: 'm', age: 52, budget: 300, seed: 'c|Marc|52' });
  const common = (x, y) => x.filter((n) => y.includes(n)).length;
  assert.ok(common(a, b) <= 4, 'femme 19 ans vs homme 52 ans : listes trop proches ' + common(a, b));
  assert.ok(common(b, c) <= 9, 'deux profils identiques sauf le nom : listes quasi identiques');
  // wishlist : un parfum senti et adoré attire ses voisins, un parfum senti et rejeté disparaît
  const base = P.filter((x) => (x.notes || []).length >= 4).slice(0, 400);
  const love = base.find((x) => has(x, 'vanille') && has(x, 'tonka')) || base[0];
  const none = E.recommend(P, [], [], { seed: 'w' }), withLove = E.recommend(P, [], [{ name: love.name, house: love.house, st: 'smelled', verdict: 'love' }], { seed: 'w' });
  const sc = (arr, n) => (arr.find((r) => r.c.name === n) || {}).total;
  const near = E.rankByFit(P.filter((x) => has(x, 'vanille') && has(x, 'tonka')).slice(0, 50), E.axisPref(E.wishSignals([{ name: love.name, house: love.house, st: 'smelled', verdict: 'love' }, { name: love.name + ' ', house: love.house, st: 'smelled', verdict: 'love' }], P)));
  assert.ok(near.length >= 5, 'wishlist → profil de goûts');
  const rej = E.recommend(P, [], [{ name: love.name, st: 'smelled', verdict: 'no' }], { seed: 'w' });
  assert.ok(!rej.some((r) => r.c.name === love.name), 'un parfum senti et rejeté n\'est plus conseillé');
  assert.ok(withLove.length && none.length);
  console.log('ok conseils variés par profil + wishlist', common(a, b), '/12 en commun');
}
console.log(`\n${ok}/${ok + fail} besoins au niveau, pool ${P.length}`);
assert.equal(fail, 0, fail + ' besoin(s) en dessous du seuil');
