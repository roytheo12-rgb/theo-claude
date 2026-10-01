// Moteur de recommandation : scoring du jour, layering, profil de goûts, achats.
(function (root) {
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

  // ---------- Vocabulaire ----------
  const FAMILIES = {
    agrumes: { label: 'Agrumes', tags: ['frais', 'léger', 'propre', 'énergique', 'diurne', 'joyeux'] },
    aquatique: { label: 'Aquatique', tags: ['frais', 'léger', 'propre', 'sportif', 'calme', 'diurne'] },
    aromatique: { label: 'Aromatique', tags: ['frais', 'naturel', 'élégant', 'propre', 'diurne', 'confiant'] },
    vert: { label: 'Vert', tags: ['frais', 'naturel', 'calme', 'créatif', 'diurne'] },
    floral: { label: 'Floral', tags: ['élégant', 'romantique', 'joyeux', 'doux'] },
    fruité: { label: 'Fruité', tags: ['joyeux', 'énergique', 'doux', 'léger'] },
    gourmand: { label: 'Gourmand', tags: ['doux', 'sensuel', 'confortable', 'chaud', 'nocturne', 'dense'] },
    ambré: { label: 'Ambré', tags: ['chaud', 'sensuel', 'dense', 'nocturne', 'mystérieux', 'confortable'] },
    boisé: { label: 'Boisé', tags: ['élégant', 'confiant', 'naturel', 'calme', 'polyvalent'] },
    épicé: { label: 'Épicé', tags: ['chaud', 'audacieux', 'sensuel', 'énergique'] },
    cuir: { label: 'Cuir', tags: ['audacieux', 'mystérieux', 'élégant', 'nocturne', 'chaud'] },
    musqué: { label: 'Musqué', tags: ['doux', 'confortable', 'propre'] },
    oud: { label: 'Oud', tags: ['dense', 'mystérieux', 'audacieux', 'nocturne', 'chaud', 'statement'] },
  };

  const CONTEXTS = { pro: 'Pro', perso: 'Perso', date: 'Date', event: 'Événement', famille: 'Famille', amis: 'Amis' };
  const WITHS = { seul: 'Seul(e)', partenaire: 'Partenaire', premier: 'Premier rendez-vous', collegues: 'Collègues / clients', boss: 'Patron / entretien', famille: 'Famille', amis: 'Amis', inconnus: 'Beaucoup d\'inconnus' };
  const MOMENTS = { jour: 'Journée', soir: 'Soirée', nuit: 'Nuit' };
  const MOODS = { confiant: 'Confiant', calme: 'Calme', energique: 'Énergique', romantique: 'Romantique', mysterieux: 'Mystérieux', joyeux: 'Joyeux', fatigue: 'Besoin de réconfort', creatif: 'Créatif' };
  const STYLES = { costume: 'Costume / formel', smart: 'Smart casual', casual: 'Casual', sport: 'Sport', soiree: 'Tenue de soirée', street: 'Streetwear' };
  const COLORS = { sombre: 'Sombre', neutre: 'Neutre', clair: 'Clair', colore: 'Coloré' };
  const FABRICS = { coton: 'Coton', lin: 'Lin', laine: 'Laine / maille', cuir: 'Cuir', denim: 'Denim', soie: 'Soie / satin', technique: 'Technique' };

  const PLACES = { interieur: 'Bureau / intérieur', exterieur: 'Extérieur', transport: 'Transports', foule: 'Lieu bondé' };
  const DURS = { courte: 'Quelques heures', longue: 'Journée entière' };
  const PLACE = {
    interieur: { w: { discret: 1, propre: .8, dense: -1, statement: -.5 }, proj: [1, 3] },
    exterieur: { w: { naturel: .6, frais: .3 }, proj: [3, 5] },
    transport: { w: { discret: 1.5, léger: 1, propre: .8, dense: -1.5, statement: -1 }, proj: [1, 3] },
    foule: { w: { statement: 1, audacieux: .5 }, proj: [3, 5] },
  };
  const CTX = {
    pro: { w: { discret: 2, propre: 2, élégant: 1.5, confiant: 1, frais: 0.5, audacieux: -1.5, dense: -1.5, gourmand: -1.5, sensuel: -1, statement: -1.5, nocturne: -1.5 }, proj: [2, 3] },
    perso: { w: { polyvalent: 1, confortable: 1.5, naturel: 1 }, proj: [2, 4] },
    date: { w: { sensuel: 2.5, élégant: 1, doux: 1, mystérieux: 1, romantique: 1, propre: 0.5, sportif: -2 }, proj: [3, 4] },
    event: { w: { statement: 2, audacieux: 1.5, élégant: 1.5, mystérieux: 1, nocturne: 1, sportif: -1.5 }, proj: [4, 5] },
    famille: { w: { doux: 2, confortable: 2, propre: 1.5, discret: 1.5, joyeux: 0.5, dense: -1.5, audacieux: -1.5, sensuel: -1.5 }, proj: [2, 3] },
    amis: { w: { joyeux: 2, énergique: 1, frais: 0.5, gourmand: 0.5, audacieux: 0.5, discret: -0.5 }, proj: [3, 5] },
  };
  const WITH = {
    seul: { w: { confortable: 1, naturel: 0.5 } },
    partenaire: { w: { sensuel: 1.5, doux: 1, confortable: 1, romantique: 0.5 } },
    premier: { w: { élégant: 1, propre: 1.5, doux: 0.5, sensuel: 1, dense: -1, statement: -0.5 }, proj: [2, 4] },
    collegues: { w: { discret: 1.5, propre: 1.5, frais: 0.5, statement: -1 }, proj: [1, 3] },
    boss: { w: { élégant: 2, propre: 1.5, confiant: 1, discret: 1, audacieux: -1, dense: -1, gourmand: -1 }, proj: [1, 3] },
    famille: { w: { doux: 1.5, confortable: 1.5, discret: 1 }, proj: [1, 3] },
    amis: { w: { joyeux: 1, énergique: 0.5 } },
    inconnus: { w: { statement: 1, élégant: 1, audacieux: 0.5 }, proj: [3, 5] },
  };
  const MOMENT = {
    jour: { diurne: 1, nocturne: -1 },
    soir: { nocturne: 1, diurne: -0.5, sensuel: 0.3 },
    nuit: { nocturne: 1.5, diurne: -1, dense: 0.5 },
  };
  const MOOD = {
    confiant: { confiant: 2, audacieux: 1, élégant: 1, statement: 0.5 },
    calme: { calme: 2, doux: 1, naturel: 1, confortable: 1, statement: -1 },
    energique: { énergique: 2, frais: 1, joyeux: 1, sportif: 0.5 },
    romantique: { romantique: 2, sensuel: 1, doux: 1 },
    mysterieux: { mystérieux: 2, nocturne: 1, dense: 0.5, audacieux: 0.5 },
    joyeux: { joyeux: 2, fruité: 1, énergique: 0.5, agrumes: 0.5 },
    fatigue: { confortable: 2, doux: 1.5, gourmand: 1, musqué: 1, statement: -1 },
    creatif: { créatif: 2, vert: 1, naturel: 1, aromatique: 0.5 },
  };
  const STYLE = {
    costume: { élégant: 2, discret: 1, boisé: 0.5, statement: -0.5, sportif: -2 },
    smart: { polyvalent: 1, élégant: 1, propre: 0.5 },
    casual: { naturel: 1, joyeux: 1, frais: 0.5, confortable: 0.5 },
    sport: { sportif: 2, frais: 1.5, léger: 1.5, dense: -1.5 },
    soiree: { nocturne: 1.5, sensuel: 1, statement: 1, élégant: 0.5 },
    street: { audacieux: 1.5, statement: 1, énergique: 0.5 },
  };
  const COLOR = {
    sombre: { mystérieux: 0.8, dense: 0.5, nocturne: 0.5, boisé: 0.3 },
    neutre: { polyvalent: 0.5, élégant: 0.5, discret: 0.3 },
    clair: { frais: 0.8, léger: 0.8, propre: 0.5, floral: 0.3 },
    colore: { joyeux: 0.8, fruité: 0.6, énergique: 0.5 },
  };
  const FABRIC = {
    coton: { propre: 0.5, frais: 0.3 },
    lin: { frais: 1, naturel: 1, léger: 0.5 },
    laine: { chaud: 0.8, confortable: 0.8, ambré: 0.5, boisé: 0.4 },
    cuir: { cuir: 2, boisé: 0.8, épicé: 0.5, mystérieux: 0.5 },
    denim: { polyvalent: 0.5, naturel: 0.5, boisé: 0.4 },
    soie: { élégant: 1, floral: 0.8, musqué: 0.6, doux: 0.5 },
    technique: { sportif: 1, frais: 0.8, aquatique: 0.6 },
  };

  const NOTE_TAGS = {
    gourmand: ['vanille', 'tonka', 'caramel', 'praliné', 'miel', 'cacao', 'café', 'datte', 'châtaigne', 'marron'],
    frais: ['citron', 'bergamote', 'pamplemousse', 'mandarine', 'orange', 'marin', 'menthe', 'sel', 'linge propre'],
    doux: ['iris', 'benjoin'],
  };

  function perfumeTags(p) {
    if (p._tags) return p._tags;
    const t = new Set(FAMILIES[p.family] ? FAMILIES[p.family].tags : []);
    if (p.family) t.add(p.family);
    const w = p.weight || 3;
    if (w <= 1) { t.add('frais'); t.add('léger'); }
    else if (w === 2) t.add('léger');
    else if (w === 3) t.add('polyvalent');
    else if (w === 4) t.add('chaud');
    else { t.add('dense'); t.add('chaud'); }
    if (w >= 4) { t.delete('léger'); t.delete('frais'); }
    if (w <= 2) { t.delete('dense'); }
    if ((p.projection || 3) >= 4) t.add('statement');
    if ((p.projection || 3) <= 2) t.add('discret');
    const notes = (p.notes || []).map(norm);
    for (const [tag, list] of Object.entries(NOTE_TAGS)) {
      if (notes.some((n) => list.some((k) => n.includes(norm(k))))) t.add(tag);
    }
    Object.defineProperty(p, '_tags', { value: [...t], enumerable: false, configurable: true });
    return p._tags;
  }

  // ---------- Météo ----------
  function weatherWant(w) {
    const t = w.temp == null ? 18 : w.temp;
    const heat = clamp((t - 16) / 8, -2, 2);
    const m = { frais: heat * 1.2, léger: heat, chaud: -heat * 1.2, dense: -heat * 1.2, polyvalent: (1 - Math.min(1, Math.abs(heat))) * 0.6 };
    if (w.rain) { m.naturel = 0.5; m.confortable = 0.5; m.sportif = -0.5; }
    if ((w.hum || 0) > 75 && t > 22) m.dense -= 1;
    if ((w.hum || 0) > 75) { m.propre = (m.propre || 0) + .3; m.dense -= .5; }
    return m;
  }
  function weatherLabel(w) {
    const t = w.temp;
    if (t == null) return '';
    if (t >= 28) return 'grosse chaleur : frais et léger';
    if (t >= 21) return 'douceur : plutôt léger';
    if (t >= 13) return 'tempéré : tout passe';
    if (t >= 6) return 'frais : place aux notes chaudes';
    return 'froid : dense et enveloppant';
  }

  // ---------- Scoring du jour ----------
  function projPenalty(range, proj) {
    if (!range) return 0;
    const [lo, hi] = range;
    const d = proj < lo ? lo - proj : proj > hi ? proj - hi : 0;
    return -1.2 * d;
  }

  // Stock : taille du flacon, ce qu'il en reste, et l'usage voulu (au quotidien, grandes occasions, peu importe).
  const STOCK_USES = { daily: 'Au quotidien', special: 'Grandes occasions', free: 'Peu importe' };
  const STOCK_LEFT = { 100: 'Plein', 75: 'Beaucoup', 50: 'La moitié', 25: 'Il en reste peu', 10: 'Presque fini' };
  function stockOf(p) {
    const size = +p.size > 0 ? +p.size : 100, left = p.left == null ? 100 : Math.max(0, Math.min(100, +p.left));
    return { size, left, ml: Math.round(size * left) / 100, use: STOCK_USES[p.use] ? p.use : 'free' };
  }
  const isBig = (cond) => cond.ctx === 'event' || cond.ctx === 'date';
  // Un échantillon ou un flacon presque fini ne part pas en usage quotidien ; un parfum « grandes occasions » attend son moment.
  function stockEffect(p, cond) {
    const k = stockOf(p), big = isBig(cond); let v = 0;
    if (k.use === 'special') v += big ? 1 : -3.5;
    if (k.ml <= 4) v += big ? (k.use === 'special' ? 0 : -0.5) : -3; else if (k.ml <= 10) v += big ? 0 : -1.5;
    if (k.use === 'daily' && k.ml >= 30) v += 0.5;
    return v;
  }
  function score(p, cond, st) {
    st = st || {};
    const tags = perfumeTags(p);
    const k = 6 / Math.max(tags.length, 4);
    const sum = (map) => tags.reduce((a, t) => a + (map[t] || 0), 0) * k;
    const proj = p.projection || 3;
    const parts = { weather: 0, ctx: 0, mood: 0, outfit: 0, perso: 0 };
    parts.weather = 1.5 * sum(weatherWant(cond));
    parts.ctx = sum((CTX[cond.ctx] || {}).w || {}) + sum((WITH[cond.with] || {}).w || {}) + sum(MOMENT[cond.moment] || {})
      + 0.8 * (projPenalty((CTX[cond.ctx] || {}).proj, proj) + projPenalty((WITH[cond.with] || {}).proj, proj));
    if ((p.occ || []).includes(cond.ctx)) parts.ctx += 2;
    parts.mood = 1.5 * sum(MOOD[cond.mood] || {});
    const pl = PLACE[cond.place];
    if (pl) parts.ctx += sum(pl.w) + 0.8 * projPenalty(pl.proj, proj);
    if (cond.dur === 'longue') parts.ctx += 0.8 * ((p.longevity || 3) - 3) + ((p.weight || 3) === 3 ? .3 : 0);
    parts.outfit = 0.8 * (sum(STYLE[cond.style] || {}) + sum(COLOR[cond.color] || {}) + sum(FABRIC[cond.fabric] || {}));
    parts.perso = ((p.rating || 3) - 3) * 0.8;
    const days = st.daysSince ? st.daysSince(p.id) : null;
    if (days != null) parts.perso += days === 0 ? -3 : days === 1 ? -1.5 : days === 2 ? -0.7 : days >= 14 ? 0.5 : 0;
    if (st.daysSince) parts.stock = stockEffect(p, cond); // pas dans le calcul des manques de collection
    const total = Object.values(parts).reduce((a, b) => a + b, 0);
    return { total, parts };
  }

  function reasons(p, cond, parts) {
    const r = [];
    if (parts.weather >= 1) r.push(`Météo : ${weatherLabel(cond)}`);
    if (parts.ctx >= 1.5) r.push(`Colle à ta journée (${CONTEXTS[cond.ctx].toLowerCase()} · ${WITHS[cond.with].toLowerCase()})`);
    if (parts.mood >= 1) r.push(`Épouse ton mood (${MOODS[cond.mood].toLowerCase()})`);
    if (cond.place && parts.ctx >= 1) r.push(`Adapté au lieu (${PLACES[cond.place].toLowerCase()})`);
    if (cond.dur === 'longue' && (p.longevity || 3) >= 4) r.push('Tient toute la journée');
    if (parts.outfit >= 1) r.push(`Va avec ta tenue (${STYLES[cond.style].toLowerCase()}${cond.fabric ? ', ' + FABRICS[cond.fabric].toLowerCase() : ''})`);
    if ((p.rating || 3) >= 4) r.push('Un de tes chouchous');
    if (parts.perso >= 0.4 && (p.rating || 3) < 4) r.push('Pas porté depuis un moment');
    if (parts.perso <= -1.4) r.push('⚠ Déjà porté très récemment');
    if (parts.stock >= 1) r.push('Gardé pour les grandes occasions : c\'est le moment');
    if (parts.stock <= -1.4) r.push(stockOf(p).use === 'special' && stockOf(p).ml > 10 ? '⚠ Réservé aux grandes occasions' : '⚠ Stock limité : à ménager');
    return r;
  }

  function rank(collection, cond, st) {
    return collection
      .map((p) => { const s = score(p, cond, st); return { p, total: s.total, parts: s.parts, reasons: reasons(p, cond, s.parts) }; })
      .sort((a, b) => b.total - a.total);
  }

  // ---------- Layering ----------
  const PAIR = {
    'agrumes|boisé': 2.5, 'agrumes|ambré': 2, 'agrumes|musqué': 2, 'agrumes|cuir': 2, 'agrumes|vert': 1.5, 'agrumes|épicé': 1.5, 'agrumes|gourmand': 1, 'agrumes|floral': 1.5, 'agrumes|oud': 1.5,
    'aquatique|boisé': 2, 'aquatique|musqué': 2, 'aquatique|aromatique': 1.5, 'aquatique|agrumes': 1, 'aquatique|vert': 1.5, 'aquatique|gourmand': -1.5, 'aquatique|oud': -1.5, 'aquatique|ambré': -0.5,
    'aromatique|boisé': 2.5, 'aromatique|ambré': 2, 'aromatique|cuir': 2, 'aromatique|épicé': 1.5, 'aromatique|gourmand': 1.5, 'aromatique|musqué': 1.5,
    'vert|boisé': 2, 'vert|musqué': 1.5, 'vert|floral': 1.5,
    'floral|boisé': 2, 'floral|musqué': 2.5, 'floral|ambré': 2, 'floral|gourmand': 1.5, 'floral|oud': 2.5, 'floral|fruité': 1.5, 'floral|cuir': 1.5,
    'fruité|musqué': 2, 'fruité|boisé': 1.5, 'fruité|gourmand': 1.5,
    'gourmand|boisé': 2.5, 'gourmand|musqué': 2, 'gourmand|ambré': 1.5, 'gourmand|épicé': 2, 'gourmand|cuir': 2, 'gourmand|oud': 1,
    'ambré|boisé': 2.5, 'ambré|musqué': 2, 'ambré|épicé': 1.5, 'ambré|cuir': 2, 'ambré|oud': 1,
    'boisé|musqué': 2, 'boisé|épicé': 2, 'boisé|cuir': 2.5, 'boisé|oud': 2,
    'épicé|cuir': 2, 'épicé|musqué': 1.5, 'cuir|oud': 1.5, 'cuir|musqué': 1.5, 'oud|musqué': 1.5,
  };
  const EFFECT = {
    agrumes: 'un coup de fraîcheur pétillante', aquatique: 'de la transparence et de l\'air', aromatique: 'une fraîcheur naturelle, herbacée',
    vert: 'une touche verte et végétale', floral: 'de la rondeur florale', fruité: 'un côté juteux et joyeux', gourmand: 'de la douceur et du confort',
    ambré: 'de la chaleur et du sillage', boisé: 'de la profondeur et de l\'élégance', épicé: 'du relief et du caractère', cuir: 'une pointe de caractère et de mystère',
    musqué: 'un effet « seconde peau », doux et propre', oud: 'du mystère et de la densité',
  };

  function pairScore(a, b, heat) {
    const key = [a.family, b.family].sort().join('|');
    let s = a.family === b.family ? 0.3 : (PAIR[key] != null ? PAIR[key] : 0.5);
    const na = (a.notes || []).map(norm), nb = new Set((b.notes || []).map(norm));
    const shared = na.filter((n) => nb.has(n)).length;
    s += Math.min(2, shared) * 0.8;
    if (Math.abs((a.weight || 3) - (b.weight || 3)) >= 2) s += 0.7;
    if (heat && (a.weight || 3) >= 4 && (b.weight || 3) >= 4) s -= 1.5;
    if ((a.projection || 3) >= 4 && (b.projection || 3) >= 4) s -= 0.5;
    return { s, shared: na.filter((n) => nb.has(n)) };
  }

  function outfitTip(cond) {
    if (cond.fabric === 'laine') return 'Sur la maille, un spray tient très longtemps : vaporise-le sur le pull, l\'autre sur la peau.';
    if (cond.fabric === 'cuir') return 'Évite de vaporiser directement sur le cuir : peau uniquement (poignets, cou).';
    if (cond.fabric === 'soie') return 'Pas de spray sur la soie ou le satin (risque de taches) : peau seulement.';
    if (cond.fabric === 'lin') return 'Le lin boit le parfum : reste léger, 1 spray de chaque suffit.';
    if ((cond.temp || 18) >= 27) return 'Chaleur : 1 spray de chaque, pas plus, sinon ça sature vite.';
    return null;
  }

  function layering(main, collection, cond, st, n) {
    const heat = (cond.temp == null ? 18 : cond.temp) >= 26;
    const opts = collection.filter((b) => b.id !== main.id).map((b) => {
      const ps = pairScore(main, b, heat);
      const ctxScore = score(b, cond, st).total;
      return { b, ps, total: ps.s + 0.25 * ctxScore };
    }).sort((x, y) => y.total - x.total).slice(0, n || 3);
    return opts.map(({ b, ps, total }) => {
      const mainBase = (main.weight || 3) >= (b.weight || 3);
      const base = mainBase ? main : b, top = mainBase ? b : main;
      const lvl = total >= 3.5 ? 'Accord très réussi' : total >= 2 ? 'Bon accord' : 'Accord original';
      const what = `${b.name} apporte ${EFFECT[b.family] || 'une autre facette'} à ${main.name}.`;
      const bridge = ps.shared.length ? ` Pont olfactif : ${ps.shared.join(', ')}.` : '';
      const ratio = heat ? '1 spray + 1 spray' : ((main.projection || 3) >= 4 || (b.projection || 3) >= 4) ? '2 sprays du plus léger + 1 du plus puissant' : '2 sprays + 1 spray';
      return {
        b, total, level: lvl, what: what + bridge,
        how: `Applique d'abord ${base.name} (base), puis ${top.name} par-dessus, au même endroit. Dosage : ${ratio}.`,
        tip: outfitTip(cond),
      };
    });
  }

  // ---------- Profil de goûts / achats ----------
  function tasteProfile(collection, settings) {
    const fam = {}, note = {};
    for (const p of collection) {
      const w = (p.rating || 3) - 2.5;
      if (p.family) fam[p.family] = (fam[p.family] || 0) + w;
      for (const n of p.notes || []) note[norm(n)] = (note[norm(n)] || 0) + w;
    }
    for (const n of settings.liked || []) note[norm(n)] = (note[norm(n)] || 0) + 2;
    for (const n of settings.avoid || []) note[norm(n)] = (note[norm(n)] || 0) - 3;
    const mx = (o) => Math.max(1, ...Object.values(o).map(Math.abs));
    const mf = mx(fam), mn = mx(note);
    for (const k in fam) fam[k] /= mf;
    for (const k in note) note[k] /= mn;
    return { fam, note };
  }

  function taste(c, prof) {
    let s = 4 * (prof.fam[c.family] || 0);
    const hits = [];
    for (const n of c.notes || []) {
      const v = prof.note[norm(n)] || 0;
      s += 1.2 * v;
      if (v > 0.25) hits.push(n);
    }
    return { s: clamp(s, -4, 7), hits: hits.slice(0, 3) };
  }

  const SCENARIOS = [
    { id: 's1', label: 'journée pro en été', c: { temp: 28, ctx: 'pro', with: 'collegues', moment: 'jour', mood: 'confiant', style: 'smart', color: 'clair', fabric: 'coton' } },
    { id: 's2', label: 'soirée date en hiver', c: { temp: 4, ctx: 'date', with: 'partenaire', moment: 'soir', mood: 'romantique', style: 'soiree', color: 'sombre', fabric: 'laine' } },
    { id: 's3', label: 'événement / soirée statement', c: { temp: 15, ctx: 'event', with: 'inconnus', moment: 'soir', mood: 'confiant', style: 'soiree', color: 'sombre', fabric: 'soie' } },
    { id: 's4', label: 'sortie entre amis à la mi-saison', c: { temp: 16, ctx: 'amis', with: 'amis', moment: 'jour', mood: 'joyeux', style: 'casual', color: 'colore', fabric: 'denim' } },
    { id: 's5', label: 'bureau en hiver', c: { temp: 5, ctx: 'pro', with: 'collegues', moment: 'jour', mood: 'calme', style: 'costume', color: 'neutre', fabric: 'laine' } },
    { id: 's6', label: 'sport / grosse chaleur', c: { temp: 31, ctx: 'perso', with: 'seul', moment: 'jour', mood: 'energique', style: 'sport', color: 'clair', fabric: 'technique' } },
    { id: 's7', label: 'date d\'été', c: { temp: 26, ctx: 'date', with: 'premier', moment: 'soir', mood: 'romantique', style: 'smart', color: 'clair', fabric: 'lin' } },
    { id: 's8', label: 'moment famille cocooning', c: { temp: 11, ctx: 'famille', with: 'famille', moment: 'jour', mood: 'fatigue', style: 'casual', color: 'neutre', fabric: 'laine' } },
  ];

  function coverage(collection) {
    return SCENARIOS.map((sc) => {
      let best = -Infinity, bestP = null;
      for (const p of collection) { const s = score(p, sc.c).total; if (s > best) { best = s; bestP = p; } }
      return { sc, best: bestP ? best : -3, bestP };
    });
  }

  function recommend(catalog, collection, wishlist, settings) {
    const prof = tasteProfile(collection, settings);
    const cov = coverage(collection);
    const owned = new Set(collection.map((p) => norm(p.name)));
    const avoid = (settings.avoid || []).map(norm);
    const budget = settings.budget || 0;
    const out = [];
    for (const c of catalog) {
      if (owned.has(norm(c.name))) continue;
      if ((c.notes || []).some((n) => avoid.some((a) => a && norm(n).includes(a)))) continue;
      const t = taste(c, prof);
      let gap = 0, gapLabel = null, gapMax = 0;
      for (const { sc, best } of cov) {
        const d = Math.max(0, score(c, sc.c).total - best);
        gap += d / cov.length;
        if (d > gapMax) { gapMax = d; gapLabel = sc.label; }
      }
      const mates = collection.filter((p) => pairScore(c, p, false).s >= 2.5);
      const total = t.s + 1.2 * gap + Math.min(3, mates.length) * 0.4;
      out.push({
        c, taste: t.s, hits: t.hits, gap, gapLabel: gapMax >= 1.5 ? gapLabel : null, mates: mates.slice(0, 3),
        total, pct: clamp(Math.round(50 + t.s * 7), 5, 99), overBudget: budget > 0 && c.price > budget,
        wished: wishlist.some((w) => norm(w) === norm(c.name)),
      });
    }
    return out;
  }

  const api = { STOCK_USES, STOCK_LEFT, stockOf, stockEffect, norm, FAMILIES, CONTEXTS, WITHS, MOMENTS, MOODS, PLACES, DURS, STYLES, COLORS, FABRICS, SCENARIOS, perfumeTags, score, rank, layering, pairScore, tasteProfile, coverage, recommend, weatherLabel };
  if (typeof module !== 'undefined') module.exports = api;
  else root.Engine = api;
})(typeof window !== 'undefined' ? window : globalThis);
