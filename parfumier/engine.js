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
  const MOODS = { confiant: 'Confiant', calme: 'Calme', energique: 'Énergique', romantique: 'Romantique', mysterieux: 'Mystérieux', joyeux: 'Joyeux', fatigue: 'Besoin de réconfort', creatif: 'Créatif', stresse: 'Stressé(e)', blues: 'Pas au top', focus: 'Dans la zone (focus)', match: 'Jour de match' };
  // Ce qu'on veut que les autres perçoivent : le sillage et la discrétion se règlent, ils ne se devinent pas.
  const WANTS = { sent: 'Qu\'on me sente de loin', compliments: 'Des compliments', discret: 'Rester discret(e)', plaire_f: 'Plaire aux femmes', plaire_g: 'Plaire aux hommes' };
  const STYLES = { costume: 'Costume / formel', smart: 'Smart casual', casual: 'Casual', sport: 'Sport', soiree: 'Tenue de soirée', street: 'Streetwear' };
  const COLORS = { sombre: 'Sombre', neutre: 'Neutre', clair: 'Clair', colore: 'Coloré' };
  const FABRICS = { coton: 'Coton', lin: 'Lin', laine: 'Laine / maille', cuir: 'Cuir', denim: 'Denim', soie: 'Soie / satin', technique: 'Technique' };

  const PLACES = { interieur: 'Bureau / intérieur', exterieur: 'Extérieur', transport: 'Transports', foule: 'Lieu bondé' };
  const VENUES = { resto: 'Restaurant', bar: 'Bar', boite: 'Boîte de nuit', musee: 'Musée / expo', concert: 'Concert', theatre: 'Théâtre / cinéma', bureau: 'Bureau', maison: 'Chez moi', dehors: 'Dehors' };
  // Le lieu change ce qui passe : à table ou au théâtre on reste discret, en boîte on s'affirme.
  const VENUE = {
    resto: { w: { discret: .6, propre: .6, élégant: .8, dense: -.6, statement: -.4 }, proj: [2, 4] },
    bar: { w: { sensuel: .8, nocturne: .8, chaud: .5, audacieux: .4 }, proj: [3, 4] },
    boite: { w: { statement: 1.5, nocturne: 1, énergique: .6, audacieux: .8, discret: -1 }, proj: [4, 5] },
    musee: { w: { discret: 1, propre: .8, élégant: 1, naturel: .5, dense: -1, statement: -.8 }, proj: [1, 3] },
    concert: { w: { frais: .6, énergique: .6, statement: .4, dense: -.5 }, proj: [2, 4] },
    theatre: { w: { discret: 1.5, propre: 1, élégant: .6, dense: -1.5, statement: -1.5, gourmand: -.5 }, proj: [1, 2] },
    bureau: { w: { discret: 1.5, propre: 1.2, élégant: .8, statement: -1, dense: -1 }, proj: [1, 3] },
    maison: { w: { confortable: 1.5, doux: 1, naturel: .5, statement: -.3 }, proj: [1, 4] },
    dehors: { w: { naturel: .6, frais: .3, énergique: .3 }, proj: [3, 5] },
  };
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
    stresse: { calme: 2, doux: 1, naturel: 1, confortable: 1.2, aromatique: 0.8, vert: 0.5, statement: -1, dense: -0.5 },
    blues: { confortable: 2, doux: 1.5, gourmand: 1.2, joyeux: 1, musqué: 0.8, statement: -0.5 },
    focus: { focus: 2.5, calme: 1, boisé: 0.8, discret: 1, propre: 0.5, résineux: 1, gourmand: -1, fruité: -0.8, statement: -1.2 },
    match: { énergique: 2, sportif: 1.5, frais: 1.2, confiant: 1, léger: 0.5, dense: -1.5, gourmand: -1 },
  };
  const WANT = {
    sent: { w: { statement: 2, audacieux: 0.5, dense: 0.3, discret: -2 }, proj: [4, 5] },
    compliments: { w: { doux: 1, propre: 1, gourmand: 0.8, sensuel: 0.8, élégant: 0.8, polyvalent: 0.5, frais: 0.3, audacieux: -0.3 }, proj: [3, 4] },
    discret: { w: { discret: 2, propre: 1, léger: 0.8, statement: -2, dense: -1 }, proj: [1, 2] },
    plaire_f: { w: { doux: 1, gourmand: 1, sensuel: 1.2, propre: 0.8, boisé: 0.5, frais: 0.3 }, proj: [3, 4] },
    plaire_g: { w: { boisé: 1, frais: 1, sensuel: 1, élégant: 0.7, épicé: 0.5, ambré: 0.5 }, proj: [3, 4] },
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
    focus: ['encens', 'oliban', 'myrrhe', 'vétiver', 'vetiver', 'cèdre', 'cedre', 'papyrus', 'thé', 'genévrier', 'cyprès', 'santal'],
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
    if (notes.length >= 3) {
      const o = olfactive(p);
      if (o.fresh >= .35) t.add('frais'); else if (o.fresh < .12 && w >= 3) t.delete('frais');
      if (o.sweet >= .25) { t.add('doux'); t.add('gourmand'); }
      if (o.powder >= .25) t.add('doux');
      if (o.smoke >= .3) t.add('mystérieux');
      if (o.fresh >= .3 && w <= 2) t.add('propre');
    }
    Object.defineProperty(p, '_tags', { value: [...t], enumerable: false, configurable: true });
    return p._tags;
  }


  // ---------- Profil olfactif calculé à partir des VRAIES notes ----------
  // Chaque note pèse dans un ou plusieurs accords ; le fond (fin de liste) pèse plus car il reste sur la peau.
  const ACCORDS = {
    agrumes: ['citron', 'bergamote', 'pamplemousse', 'mandarine', 'orange', 'yuzu', 'cédrat', 'citron vert', 'lime', 'clémentine', 'kumquat', 'agrume', 'bigarade', 'combava'],
    aquatique: ['marin', 'aquatique', 'algue', 'sel', 'ozone', 'embrun', 'eau', 'iode', 'concombre', 'pluie', 'melon d\'eau'],
    aromatique: ['lavande', 'romarin', 'sauge', 'basilic', 'thym', 'menthe', 'armoise', 'fougère', 'estragon', 'origan', 'aneth', 'herbes', 'laurier', 'eucalyptus', 'géranium'],
    vert: ['vert', 'feuille', 'herbe', 'thé', 'galbanum', 'fleur de figuier', 'figuier', 'bambou', 'mousse', 'feuilles', 'tomate', 'tige', 'bourgeon de cassis', 'rhubarbe'],
    floral: ['rose', 'jasmin', 'tubéreuse', 'iris', 'ylang', 'fleur d\'oranger', 'néroli', 'pivoine', 'freesia', 'muguet', 'violette', 'magnolia', 'gardénia', 'lys', 'œillet', 'heliotrope', 'héliotrope', 'mimosa', 'lilas', 'osmanthus', 'fleur', 'camélia', 'géranium', 'orchidée', 'cyclamen', 'lotus', 'narcisse', 'jonquille', 'champaca', 'frangipanier', 'tiaré', 'hibiscus', 'cassie', 'sureau', 'glycine', 'acacia'],
    fruité: ['pomme', 'poire', 'pêche', 'abricot', 'cassis', 'framboise', 'fraise', 'cerise', 'mûre', 'figue', 'ananas', 'mangue', 'litchi', 'prune', 'melon', 'banane', 'noix de coco', 'coco', 'fruit', 'baie', 'groseille', 'myrtille', 'grenade', 'raisin', 'datte', 'passion', 'goyave', 'papaye', 'nectarine', 'rhum'],
    gourmand: ['vanille', 'tonka', 'caramel', 'praliné', 'miel', 'cacao', 'chocolat', 'café', 'amande', 'noisette', 'châtaigne', 'marron', 'sucre', 'guimauve', 'crème', 'lait', 'cannelle', 'pain d\'épices', 'biscuit', 'gâteau', 'barbe à papa', 'réglisse', 'noix', 'pistache', 'cookie', 'rhum', 'whisky', 'cognac', 'liqueur', 'maïs', 'riz', 'meringue'],
    ambré: ['ambre', 'ambroxan', 'ambrox', 'benjoin', 'labdanum', 'résine', 'encens', 'myrrhe', 'oliban', 'opoponax', 'baume', 'styrax', 'copal', 'élémi', 'cistus', 'ciste', 'ambré', 'castoréum'],
    boisé: ['bois', 'cèdre', 'santal', 'vétiver', 'patchouli', 'sapin', 'cyprès', 'pin', 'gaïac', 'ébène', 'palissandre', 'teck', 'genévrier', 'mousse de chêne', 'chêne', 'bouleau', 'cashmeran', 'iso e super', 'noyer', 'acajou', 'cade', 'tabac', 'bois de rose', 'bois de oud'],
    épicé: ['poivre', 'cannelle', 'clou de girofle', 'girofle', 'cardamome', 'gingembre', 'safran', 'muscade', 'piment', 'curcuma', 'coriandre', 'cumin', 'baie rose', 'anis', 'badiane', 'fenouil', 'carvi', 'épices', 'épice', 'zeste de poivre', 'macis'],
    cuir: ['cuir', 'suède', 'daim', 'bouleau', 'goudron', 'fumée', 'animal', 'castoréum', 'civette'],
    musqué: ['musc', 'muscs', 'ambrette', 'peau', 'linge', 'coton', 'savon', 'talc', 'cashmeran'],
    oud: ['oud', 'agar', 'agarwood', 'oudh', 'aoud'],
  };
  const WEIGHT_NOTE = { // pousse vers le lourd (+) ou le léger (-)
    vanille: 1, tonka: .8, ambre: 1, ambroxan: .6, benjoin: .9, labdanum: 1, oud: 1.4, cuir: .8, patchouli: .8, encens: .7, myrrhe: .8, miel: .8, caramel: .8, praliné: .8, cacao: .7, tabac: .8, rhum: .6, santal: .5, musc: .4, café: .5, cannelle: .4, safran: .4, 'clou de girofle': .4, résine: .8, castoréum: .8, chocolat: .7, opoponax: .9, styrax: .8,
    citron: -1, bergamote: -.8, pamplemousse: -1, mandarine: -.9, orange: -.6, yuzu: -1, 'citron vert': -1, cédrat: -1, menthe: -.9, marin: -1.2, aquatique: -1.2, sel: -.8, concombre: -1, thé: -.8, lavande: -.3, romarin: -.5, 'feuille': -.6, ozone: -1, eau: -.6, néroli: -.5, 'fleur d\'oranger': -.2, muguet: -.6, pivoine: -.4, freesia: -.5, melon: -.7, gingembre: -.4, galbanum: -.4,
  };
  const SWEET_NOTE = ['vanille', 'tonka', 'caramel', 'praliné', 'miel', 'cacao', 'chocolat', 'sucre', 'guimauve', 'crème', 'lait', 'barbe à papa', 'cookie', 'meringue', 'pain d\'épices', 'gâteau', 'biscuit', 'liqueur'];
  const POWDER_NOTE = ['iris', 'poudre', 'poudré', 'talc', 'violette', 'héliotrope', 'ambrette', 'aldéhyde', 'aldéhydes', 'mimosa', 'cassie', 'savon'];
  const SMOKE_NOTE = ['fumée', 'goudron', 'encens', 'cade', 'tabac', 'bouleau', 'cuir', 'oud', 'bois brûlé', 'café'];
  const hasKw = (n, k) => { const a = ' ' + n + ' ', b = ' ' + norm(k) + ' '; return a.includes(b) || (k.length >= 5 && n.startsWith(norm(k))); };
  const noteHits = (n) => { const out = []; for (const [acc, list] of Object.entries(ACCORDS)) { if (list.some((k) => hasKw(n, k))) out.push(acc); } return out; };

  // Retourne { acc: poids par accord, fam, weight, proj, sweet, powder, smoke, fresh, n } ; n = nombre de notes réellement connues.
  function olfactive(p) {
    if (p._ol) return p._ol;
    const notes = (p.notes || []).map(norm).filter(Boolean), L = notes.length, acc = {};
    let wt = 0, sweet = 0, powder = 0, smoke = 0, fresh = 0;
    notes.forEach((n, i) => {
      const pos = L < 2 ? 1 : i / (L - 1), mult = pos < .34 ? 1 : pos < .67 ? 1.1 : 1.25;
      const hs = noteHits(n); const share = hs.length ? 1 / Math.sqrt(hs.length) : 0;
      hs.forEach((a) => { acc[a] = (acc[a] || 0) + mult * share; });
      for (const [k, v] of Object.entries(WEIGHT_NOTE)) if (hasKw(n, k)) { wt += v * mult; break; }
      if (SWEET_NOTE.some((k) => hasKw(n, k))) sweet += mult;
      if (POWDER_NOTE.some((k) => hasKw(n, k))) powder += mult;
      if (SMOKE_NOTE.some((k) => hasKw(n, k))) smoke += mult;
      if (hs.some((a) => ['agrumes', 'aquatique', 'aromatique', 'vert'].includes(a))) fresh += (pos < .5 ? 1.2 : .6);
    });
    const tot = Object.values(acc).reduce((a, b) => a + b, 0) || 1;
    const sorted = Object.entries(acc).sort((a, b) => b[1] - a[1]);
    // la famille se lit sur ce qui domine ; l'ambré/le musqué ne gagnent que si rien d'autre n'écrase
    const adj = Object.entries(acc).map(([a, v]) => [a, v * (a === 'musqué' || a === 'ambré' ? .72 : 1)]).sort((a, b) => b[1] - a[1]);
    let fam = adj.length ? adj[0][0] : null;
    if (acc.oud && acc.oud >= 1) fam = 'oud';
    else if (acc.cuir >= 1.6 && acc.cuir >= (acc[fam] || 0) * .8) fam = 'cuir';
    else if (acc.gourmand >= 2.4 && acc.gourmand >= (acc[fam] || 0) * .8) fam = 'gourmand';
    const wn = L ? wt / Math.sqrt(L) : 0;
    const weight = clamp(Math.round(3 + wn * 1.15 + (acc.gourmand || 0) / tot * 1.2 + (acc.ambré || 0) / tot * 1.2 - fresh / Math.max(L, 3) * 1.8), 1, 5);
    const proj = clamp(Math.round(3 + (weight - 3) * .55 + (acc.épicé || 0) / tot * 1.2 + (acc.oud || 0) / tot - (acc.aquatique || 0) / tot - (acc.agrumes || 0) / tot * 1.5), 1, 5);
    const o = { acc, tot, top: sorted.slice(0, 3).map((x) => x[0]), fam, weight, proj, sweet: sweet / Math.max(L, 3), powder: powder / Math.max(L, 3), smoke: smoke / Math.max(L, 3), fresh: fresh / Math.max(L, 3), n: L };
    Object.defineProperty(p, '_ol', { value: o, enumerable: false, configurable: true });
    return o;
  }
  // Entrée de la base (nom, maison, notes réelles) → fiche complète pour le moteur. Famille/poids/projection viennent des notes.
  function derive(e) {
    const o = olfactive(e), fam = e.family || o.fam, c = Object.assign({}, e);
    c.family = fam; c.weight = e.weight || o.weight; c.projection = e.projection || o.proj; c.longevity = e.longevity || clamp(Math.round(2.4 + (c.weight - 3) * .5 + .6), 2, 5);
    c.derived = !(e.family && e.weight);
    return c;
  }

  // ---------- Besoin en langage naturel ----------
  const norm2 = (s) => ' ' + norm(s) + ' ';
  const NEED_LEX = [
    // [regex sur texte normalisé, effet]
    [/\b(frais|fraiche|fraicheur|fraichement|rafraichissant|pétillant|petillant)\b/, { tags: ['frais'] }],
    [/\b(leger|legere|discret|discrete|subtil|subtile|aerien|aerienne)\b/, { tags: ['léger', 'discret'], proj: [1, 3] }],
    [/\b(puissant|sillage|projection|se remarque|remarqu|qui tient|tenue|longue tenue|performant|bombe)\b/, { tags: ['statement'], proj: [4, 5], dur: true }],
    [/\b(bureau|travail|pro|professionnel|reunion|entretien|boulot)\b/, { ctx: 'pro' }],
    [/\b(premier rendez vous|premier date|premiere fois|premier rdv|1er rendez vous)\b/, { ctx: 'date', with: 'premier' }],
    [/\b(patron|entretien|embauche|client|clients|boss)\b/, { ctx: 'pro', with: 'boss' }],
    [/\b(confiant|confiance|charisme|autorite|leader)\b/, { mood: 'confiant' }],
    [/\b(calme|zen|serein|apaisant|detente|relax)\b/, { mood: 'calme' }],
    [/\b(energique|dynamique|tonique|reveil|motivant)\b/, { mood: 'energique' }],
    [/\b(joyeux|gai|joie|bonne humeur|solaire|lumineux)\b/, { mood: 'joyeux' }],
    [/\b(creatif|inspirant|inspiration)\b/, { mood: 'creatif' }],
    [/\b(stresse|stress|anxieux|anxieuse|angoisse|nerveux|nerveuse|tendu|tendue)\b/, { mood: 'stresse' }],
    [/\b(pas bien|deprime|deprimee|triste|blues|coup de mou|moral bas|pas au top|reconfort)\b/, { mood: 'blues' }],
    [/\b(concentration|concentre|concentree|focus|dans la zone|reviser|revisions|examen|travailler sans)\b/, { mood: 'focus' }],
    [/\b(jour de match|match|competition|tournoi|compet)\b/, { mood: 'match', style: 'sport' }],
    [/\b(compliments?|complimenter)\b/, { want: 'compliments' }],
    [/\b(plaire aux filles|plaire aux femmes|plaire a une fille|plaire a une femme|seduire une fille|seduire une femme|seduire des filles|seduire des femmes)\b/, { want: 'plaire_f' }],
    [/\b(plaire aux garcons|plaire aux hommes|plaire a un garcon|plaire a un homme|seduire un garcon|seduire un homme|seduire des garcons|seduire des hommes)\b/, { want: 'plaire_g' }],
    [/\b(qu on me sente|que tout le monde me sente|sente de loin)\b/, { want: 'sent' }],
    [/\b(date|rendez vous|rdv|amoureux|romantique|seduire|seduction|sensuel|sexy|charme)\b/, { ctx: 'date', tags: ['sensuel'] }],
    [/\b(soiree|boite|clubbing|sortir|fete|festif|nuit)\b/, { ctx: 'event', moment: 'soir' }],
    [/\b(mariage|ceremonie|gala|evenement|event)\b/, { ctx: 'event' }],
    [/\b(famille|cocooning|reconfort|cosy|confortable|doudou|enveloppant)\b/, { ctx: 'famille', tags: ['confortable', 'doux'] }],
    [/\b(amis|copains|decontracte|casual|quotidien|tous les jours|polyvalent|signature)\b/, { ctx: 'amis', tags: ['polyvalent'] }],
    [/\b(ete|estival|chaud|chaleur|plage|vacances|canicule|soleil|piscine)\b/, { temp: 29 }],
    [/\b(hiver|froid|neige|glacial|noel|ski)\b/, { temp: 3 }],
    [/\b(automne|printemps|mi saison|pluie)\b/, { temp: 14 }],
    [/\b(sport|sportif|salle|running|gym)\b/, { ctx: 'perso', style: 'sport', tags: ['frais', 'léger'] }],
    [/\b(marin|aquatique|oceanique|iode|embrun|mer)\b/, { fam: 'aquatique', tags: ['frais'] }],
    [/\b(jour|matin|journee|diurne)\b/, { moment: 'jour' }],
    [/\b(sombre|mysterieux|mystere|envoutant|hypnotique|addictif|magnetique)\b/, { tags: ['mystérieux', 'nocturne'] }],
    [/\b(gourmand|sucre|sucree|dessert|croquer|friandise|delicieux)\b/, { fam: 'gourmand', tags: ['gourmand'] }],
    [/\b(boise|bois|sylvestre|foret)\b/, { fam: 'boisé' }],
    [/\b(floral|fleuri|fleurs|bouquet)\b/, { fam: 'floral' }],
    [/\b(ambre|oriental|orientale|resine|resineux)\b/, { fam: 'ambré' }],
    [/\b(epice|epices|epicee|epicé)\b/, { fam: 'épicé' }],
    [/\b(cuir|cuiré|cuire)\b/, { fam: 'cuir' }],
    [/\b(musque|muscs|peau propre|seconde peau|savon|linge propre|propre)\b/, { fam: 'musqué', tags: ['propre'] }],
    [/\b(agrume|agrumes|citron|citronne|hesperide|cologne)\b/, { fam: 'agrumes' }],
    [/\b(vert|herbe|herbace|vegetal|foin|jardin)\b/, { fam: 'vert' }],
    [/\b(aromatique|fougere|lavande|barbier)\b/, { fam: 'aromatique' }],
    [/\b(fruite|fruit|fruits|juteux)\b/, { fam: 'fruité' }],
    [/\b(oud|oudh|aoud)\b/, { fam: 'oud' }],
    [/\b(poudre|poudree|poudreux|poudr[ée])\b/, { powder: true }],
    [/\b(fume|fumee|fumé|tabac|brule|brulé)\b/, { smoke: true }],
    [/\b(niche|rare|original|originale|unique|different|differente)\b/, { niche: true }],
    [/\b(pas cher|abordable|petit prix|budget)\b/, { cheap: true }],
  ];
  const NOTE_WORDS = {
    vanille: 'vanille', tonka: 'tonka', rose: 'rose', santal: 'santal', cuir: 'cuir', musc: 'musc', oud: 'oud', iris: 'iris', jasmin: 'jasmin', tubereuse: 'tubéreuse', ambre: 'ambre', encens: 'encens', vetiver: 'vétiver', patchouli: 'patchouli', bergamote: 'bergamote', citron: 'citron', orange: 'orange', neroli: 'néroli', tabac: 'tabac', cannelle: 'cannelle', safran: 'safran', poivre: 'poivre', cafe: 'café', miel: 'miel', figue: 'figue', menthe: 'menthe', lavande: 'lavande', cedre: 'cèdre', pivoine: 'pivoine', cacao: 'cacao', chocolat: 'chocolat', praline: 'praliné', coco: 'coco', cerise: 'cerise', pomme: 'pomme', poire: 'poire', gingembre: 'gingembre', cardamome: 'cardamome', myrrhe: 'myrrhe', benjoin: 'benjoin', pamplemousse: 'pamplemousse', violette: 'violette', magnolia: 'magnolia', ylang: 'ylang', caramel: 'caramel', amande: 'amande', framboise: 'framboise', cassis: 'cassis', peche: 'pêche', mangue: 'mangue', ananas: 'ananas', litchi: 'litchi', muguet: 'muguet', geranium: 'géranium', sauge: 'sauge', basilic: 'basilic', mandarine: 'mandarine', yuzu: 'yuzu', labdanum: 'labdanum', gaiac: 'gaïac', cypres: 'cyprès', sapin: 'sapin', mousse: 'mousse de chêne', poudre: 'poudre', thé: 'thé', the: 'thé', reglisse: 'réglisse', rhum: 'rhum', whisky: 'whisky', cognac: 'cognac', pistache: 'pistache', noisette: 'noisette', coriandre: 'coriandre', cumin: 'cumin', galbanum: 'galbanum', ambroxan: 'ambroxan', benzoin: 'benjoin',
  };
  function parseNeed(text) {
    const t = norm(text), need = { text: String(text || ''), tags: [], fams: [], like: [], not: [], cond: {}, proj: null, gender: null, maxPrice: 0, minPrice: 0, flags: {} };
    if (!t) return need;
    // négations : « sans vanille », « pas de cuir », « pas trop sucré », « je déteste le patchouli »
    let rest = ' ' + t + ' ';
    const neg = /\b(?:sans|pas de|pas d|ni|aucun|aucune|eviter|evite|deteste|hais|fuis|supporte pas|aime pas|pas trop)\s+(?:la |le |les |l |du |de la |des |d |de |trop |ni )?([a-z]+(?: [a-z]+)?)/g;
    let m; const negSeen = [];
    while ((m = neg.exec(' ' + t + ' '))) { negSeen.push(m[1]); }
    for (const w of negSeen) {
      const first = w.split(' ')[0], k = NOTE_WORDS[first] || NOTE_WORDS[w];
      if (k) need.not.push(k);
      else if (/^(sucre|sucree|gourmand|doux|lourd|lourde|fort|forte|puissant|cher|musque)/.test(first)) need.flags[/^(sucre|sucree|gourmand|doux)/.test(first) ? 'nosweet' : /^(lourd|lourde|fort|forte|puissant)/.test(first) ? 'nolourd' : first.startsWith('musque') ? 'nomusk' : 'x'] = true;
    }
    // retire les segments négatifs pour ne pas les compter comme envies
    rest = rest.replace(neg, ' ');
    const wantTxt = ' ' + rest.trim() + ' ';
    for (const [re, fx] of NEED_LEX) {
      if (!re.test(wantTxt)) continue;
      if (fx.tags) fx.tags.forEach((x) => !need.tags.includes(x) && need.tags.push(x));
      if (fx.fam && !need.fams.includes(fx.fam)) need.fams.push(fx.fam);
      for (const k of ['ctx', 'moment', 'temp', 'style', 'with', 'mood', 'want']) if (fx[k] != null && need.cond[k] == null) need.cond[k] = fx[k];
      if (fx.proj) need.proj = fx.proj;
      for (const k of ['powder', 'smoke', 'niche', 'cheap', 'dur']) if (fx[k]) need.flags[k] = true;
    }
    wantTxt.split(' ').forEach((w) => { const k = NOTE_WORDS[w]; if (k && !need.like.includes(k) && !need.not.includes(k)) need.like.push(k); });
    if (/\b(homme|masculin|monsieur|mec|lui|pour un homme)\b/.test(wantTxt)) need.gender = 'm';
    else if (/\b(femme|feminin|madame|elle|pour une femme)\b/.test(wantTxt)) need.gender = 'f';
    const pm = wantTxt.match(/\b(?:moins de|max|maximum|jusqu a|sous|budget de?|<)\s*(\d{2,4})/);
    if (pm) need.maxPrice = +pm[1];
    const pa = wantTxt.match(/\b(?:plus de|au moins|a partir de|>)\s*(\d{2,4})\s*(?:e|eur|euros)\b/);
    if (pa) need.minPrice = +pa[1];
    if (/\b(facile a trouver|grand public|mainstream|partout|sephora|best seller|en parfumerie)\b/.test(wantTxt)) need.flags.mainstream = true;
    if (need.flags.cheap && !need.maxPrice) need.maxPrice = 100;
    need.themes = themesFor(wantTxt, need.cond, need.tags, need.flags);
    need.empty = !(need.tags.length || need.fams.length || need.like.length || need.not.length || Object.keys(need.cond).length || need.proj || need.gender || need.maxPrice || Object.keys(need.flags).length || need.themes.length);
    return need;
  }
  const needLabel = (need) => {
    const bits = [];
    if (need.like.length) bits.push('notes : ' + need.like.join(', '));
    if (need.fams.length) bits.push(need.fams.map((f) => FAMILIES[f].label.toLowerCase()).join(' / '));
    if (need.cond.ctx) bits.push(CONTEXTS[need.cond.ctx].toLowerCase());
    if (need.cond.temp != null) bits.push(need.cond.temp >= 24 ? 'chaleur' : need.cond.temp <= 8 ? 'froid' : 'mi-saison');
    if (need.not.length) bits.push('sans ' + need.not.join(', '));
    if (need.gender) bits.push(need.gender === 'm' ? 'masculin' : 'féminin');
    if (need.maxPrice) bits.push('≤ ' + need.maxPrice + ' €');
    return bits.join(' · ');
  };

  function profStrength(pf, d, t) {
    const g = (a) => pf.p[AXN.indexOf(a)] / 5, pr = d.projection || 3;
    switch (t) {
      case 'frais': return clamp(g('fraicheur') * 1.1 - g('densite') * .3, 0, 1);
      case 'léger': return clamp(1 - g('densite') * 1.1, 0, 1);
      case 'discret': return clamp((5 - pr) / 3.2, 0, 1);
      case 'statement': return clamp((pr - 2) / 3, 0, 1);
      case 'gourmand': case 'doux': return g('douceur');
      case 'propre': return clamp(g('musque') + g('fraicheur') * .5 - g('fume') - g('douceur') * .4, 0, 1);
      case 'polyvalent': return clamp(1 - g('clivage') * .6 - g('originalite') * .3 - Math.abs(g('densite') - .5) * .5, 0, 1);
      case 'mystérieux': case 'nocturne': return clamp((g('fume') + g('resine') + g('densite')) / 2.2 + (pf.m[1] - pf.m[0]) / 20, 0, 1);
      case 'confortable': return clamp(g('cremeux') * .6 + g('douceur') * .5 + g('musque') * .4, 0, 1);
      case 'sensuel': return g('sensualite');
      case 'élégant': return clamp(g('formalite') * .7 + (1 - g('douceur')) * .2, 0, 1);
      default: return null;
    }
  }
  function tagStrength(d, o, tags, t) {
    const w = d.weight || 3, pr = d.projection || 3;
    switch (t) {
      case 'frais': return clamp(o.fresh * 1.7 + (w <= 2 ? .25 : 0) - (w >= 4 ? .5 : 0) - o.sweet * .6, 0, 1);
      case 'léger': return clamp((5 - w) / 3.2, 0, 1);
      case 'discret': return clamp((5 - pr) / 3.2, 0, 1);
      case 'statement': return clamp((pr - 2) / 3, 0, 1);
      case 'gourmand': case 'doux': return clamp(o.sweet * 2.2 + (tags.includes(t) ? .2 : 0), 0, 1);
      case 'propre': return clamp(((o.acc.musqué || 0) + (o.acc.aquatique || 0) + (o.acc.agrumes || 0) * .6) / o.tot * 1.8 - o.sweet - o.smoke, 0, 1);
      case 'polyvalent': return clamp(1 - Math.abs(w - 3) / 2 - Math.abs(pr - 3) / 4, 0, 1);
      case 'mystérieux': case 'nocturne': return clamp(o.smoke * 1.6 + (w >= 4 ? .4 : 0) + ((o.acc.oud || 0) + (o.acc.ambré || 0) + (o.acc.cuir || 0)) / o.tot, 0, 1);
      case 'confortable': return clamp(o.sweet * 1.2 + ((o.acc.musqué || 0) + (o.acc.ambré || 0)) / o.tot + (w >= 3 ? .1 : 0), 0, 1);
      case 'sensuel': return clamp(((o.acc.ambré || 0) + (o.acc.gourmand || 0) * .8 + (o.acc.musqué || 0) * .6 + (o.acc.oud || 0) + (o.acc.floral || 0) * .35) / o.tot * 1.1 + (w >= 3 ? .15 : 0) - o.fresh * .8, 0, 1);
      default: return tags.includes(t) ? 1 : 0;
    }
  }
  // Notoriété : on préfère un parfum qu'on trouve et qu'on connaît à un flacon introuvable, à correspondance égale.
  let FAME = null;
  function fameOf(c) {
    if (!FAME) { FAME = {}; (root.HOUSE_FAME || []).forEach((h, i) => { FAME[norm(h)] = i; }); }
    const r = FAME[norm(c.house)]; let f = r == null ? 0.08 : clamp(1 - r / 90, 0.1, 1);
    if (c.price) f += .2; if (c.curated) f += .25;
    return clamp(f, 0, 1);
  }
  // Score de correspondance d'un parfum à un besoin. Retourne null si exclu (note évitée, mauvais genre, hors budget).
  // Les parfums sans notes réelles ne sont jamais proposés : on ne devine pas.
  function matchNeed(c, need, st) {
    st = st || {};
    if (!c.notes || c.notes.length < 3) return null;
    const nt = c.notes.map(norm);
    for (const a of need.not) if (nt.some((n) => hasKw(n, a) || n.includes(norm(a)))) return null;
    if (need.gender && root.genderOf) { const g = root.genderOf(c.name, c.house); if ((need.gender === 'm' && g === 'f') || (need.gender === 'f' && g === 'm')) return null; }
    if (st.gender && root.genderOf) { const g = root.genderOf(c.name, c.house); if ((st.gender === 'm' && g === 'f') || (st.gender === 'f' && g === 'm')) return null; }
    if (need.maxPrice && c.price && c.price > need.maxPrice) return null;
    if (need.minPrice && c.price && c.price < need.minPrice) return null;
    if (!c._dv) Object.defineProperty(c, '_dv', { value: derive(c), enumerable: false, configurable: true });
    const d = c._dv, o = olfactive(d), tags = perfumeTags(d), L = nt.length, pf = profOf(c);
    let s = 0, max = 0; const why = [];
    // 1) notes demandées : poids fort ; une note du fond/cœur compte plus qu'une note de tête passagère
    for (const k of need.like) {
      max += 4;
      const i = nt.findIndex((n) => hasKw(n, k) || n.includes(norm(k)));
      if (i >= 0) { const pos = L < 2 ? 1 : i / (L - 1); s += 3 + (pos > .33 ? 1 : .4) + (i === 0 ? .3 : 0); why.push('contient ' + k); }
      else { const cl = noteHits(norm(k)); if (cl.length && cl.some((a) => (o.acc[a] || 0) / o.tot >= .3)) { s += 1.2; why.push('dans l\'esprit ' + k); } }
    }
    // 2) famille(s) demandée(s)
    for (const f of need.fams) { max += 4; const share = (o.acc[f] || 0) / o.tot; if (d.family === f) { s += 3.4; why.push(FAMILIES[f].label.toLowerCase()); } else if (share >= .22) { s += 1.8 * Math.min(1, share / .35); why.push('touche de ' + FAMILIES[f].label.toLowerCase()); } else s -= 1.5; }
    // 3) caractère demandé : intensité continue (un parfum très frais vaut mieux qu'un parfum à peine frais)
    for (const t of need.tags) { max += 2; const ps = pf ? profStrength(pf, d, t) : null, v = ps != null ? ps : tagStrength(d, o, tags, t); s += 2 * v - (v < .2 ? .5 : 0); }
    if (need.tags.includes('frais') && o.fresh >= .3) why.push('frais');
    // 4) flags
    if (need.flags.nosweet) { if (nt.some((n) => SWEET_NOTE.some((k) => hasKw(n, k))) || o.sweet > .2) return null; max += 1; s += 1; }
    if (need.flags.nolourd) { max += 2; s += d.weight <= 3 ? 1.5 : -3; }
    if (need.flags.nomusk && nt.some((n) => n.includes('musc'))) s -= 1.5;
    if (need.flags.powder) { max += 2; if (o.powder > .2) { s += 2; why.push('poudré'); } else s -= .8; }
    if (need.flags.smoke) { max += 2; if (o.smoke > .2) { s += 2; why.push('fumé'); } else s -= .8; }
    if (need.flags.dur) { max += 1.5; s += ((d.longevity || 3) - 3) * .6; if ((d.longevity || 3) >= 4) why.push('tient longtemps'); }
    if (need.flags.niche && root.tagsOf) { max += 1; if (root.tagsOf(c.name, c.house, c.price || 0, '').includes('niche')) { s += 1; why.push('niche'); } }
    // 5) projection
    if (need.proj) { max += 1.5; s += projPenalty(need.proj, d.projection || 3) * .9 + 1.5; }
    // 6) contexte, météo, moment par le moteur du jour
    const cond = Object.assign({ moment: null, mood: null, with: null }, need.cond);
    if (need.cond.ctx && !need.cond.with) cond.with = { pro: 'collegues', date: 'partenaire', famille: 'famille', amis: 'amis' }[need.cond.ctx] || null;
    if (Object.keys(need.cond).length) {
      const cs = score(d, cond, { gender: null }).parts; const v = cs.weather + cs.ctx + cs.outfit;
      max += 3; s += clamp(v * .35, -2.5, 3);
      if (need.cond.ctx && cs.ctx >= 1.5) why.push('colle au contexte ' + CONTEXTS[need.cond.ctx].toLowerCase());
      if (need.cond.temp != null && cs.weather >= 1) why.push(need.cond.temp >= 24 ? 'tient bien la chaleur' : need.cond.temp <= 8 ? 'chaud pour le froid' : 'de saison');
    }
    // 6b) fiche détaillée : saisons, moments, usages, mots-clés, ressemblances
    if (pf) {
      const C = need.cond;
      if (C.temp != null) { max += 1.5; const sv = C.temp >= 24 ? pf.s[1] : C.temp <= 8 ? pf.s[3] : (pf.s[0] + pf.s[2]) / 2; s += 1.5 * (sv / 5) - (sv <= 1 ? 1 : 0); if (sv >= 4) why.push(C.temp >= 24 ? 'idéal en été' : C.temp <= 8 ? 'idéal en hiver' : 'idéal en mi-saison'); }
      if (C.moment) { max += 1; const mv = pf.m[C.moment === 'jour' ? 0 : 1]; s += mv / 5 - (mv <= 1 ? .8 : 0); }
      const U = pf.derived ? null : { pro: 'bureau', date: 'rdv', event: 'soiree', famille: 'quotidien', amis: 'quotidien' }[C.ctx];
      if (U) { max += 1.5; if (pf.u.includes(U) || (C.ctx === 'event' && pf.u.includes('ceremonie'))) { s += 1.5; why.push('fait pour ' + ({ bureau: 'le bureau', rdv: 'un rendez-vous', soiree: 'une soirée', quotidien: 'le quotidien' }[U])); } else s -= .6; }
      if (C.style === 'sport') { max += 1; if (pf.u.includes('sport')) s += 1; }
      if (pf.expert) {      // choix d'experts : bonus quand le besoin correspond au thème
        const T = pf.expert, hot = C.temp != null && C.temp >= 27, cold = C.temp != null && C.temp <= 10;
        const hit = (hot && T.includes('chaleur')) || (cold && T.includes('automne-hiver')) || (C.ctx === 'date' && T.includes('date')) || (C.ctx === 'event' && (T.includes('occasion') || T.includes('opulent')));
        max += 1.5; if (hit) { s += 1.5; why.push('choix d\'experts pour ' + (hot ? 'une grosse chaleur' : cold ? 'le froid' : C.ctx === 'date' ? 'un rendez-vous' : 'une grande occasion')); }
      }
      const words = pf.derived ? [] : norm(need.text).split(' ').filter((w) => w.length >= 4), blob = norm([pf.pitch, pf.dom, pf.diff, ...pf.kw].join(' '));
      const hit = words.filter((w) => blob.includes(w)).length; if (words.length) { max += 1; s += Math.min(1, hit / Math.max(2, words.length * .6)); }
      if (!pf.derived && pf.c <= 1) s -= .4;
    }
    // 7) goûts de la personne (sans jamais écraser le besoin exprimé)
    if (st.liked && st.liked.length) { const h = st.liked.filter((l) => l && nt.some((n) => n.includes(norm(l)))).length; s += Math.min(1.2, h * .6); if (h) why.push('une note que tu aimes'); }
    if (st.avoid && st.avoid.length && st.avoid.some((a) => a && nt.some((n) => n.includes(norm(a))))) return null;
    if (need.cheap || need.flags.cheap) { max += 1; if (c.price && c.price <= 100) s += 1; }
    // 6c) fiche éditoriale : situations, mood et faiblesses cités par sa propre fiche
    const ff = ficheFit(c, Object.assign({}, cond, { tags: need.tags, want: need.cond.want }), need.text, st);
    if (ff) { max += 2; s += ff.v; ff.why.slice(0, 1).forEach((w2) => why.unshift(w2)); ff.warn.slice(0, 1).forEach((w2) => why.push('⚠ ' + w2)); }
    // 6d) ce qu'on sait de la personne : goûts calculés sur sa collection, maisons aimées, budget, saison
    const U = userCtx(st);
    if (U) {
      const dmp = U.posN ? 1 : .3, tt = taste(c, U.prof); if (U.posN) max += 1.5; s += clamp(tt.s * .3, -1.2 * dmp, 1.5);
      if (tt.hits.length) why.unshift('tu aimes déjà ' + tt.hits.slice(0, 2).join(' et '));
      const af = axisFit(c, U.pref);
      if (af != null) { if (U.posN) max += 1.8; s += 1.8 * clamp(af, -dmp, 1); if (af > .35) { const aw = axisWhy(c, U.pref); if (aw.length) why.push('dans ton goût ' + aw[0]); } }
      const hf = U.houseAff[norm(c.house)] || 0; if (hf) { s += .5 * hf; if (hf > 0) why.push('une maison que tu aimes'); }
      let best = null, bs = 0; for (const lv of U.loved) { let sh = 0; nt.forEach((n) => { if (lv.notes.some((m) => m === n || m.includes(n) || n.includes(m))) sh++; }); if (sh >= 2 && sh > bs) { bs = sh; best = lv; } }
      if (best) { s += .4; why.push('proche de ' + best.name + ', que tu aimes'); }
      if (U.owned.has(norm(c.name))) { s -= 1.8; why.unshift('tu l\'as déjà dans ta collection'); }
      if (st.budget > 0 && c.price > st.budget * 1.2 && !need.maxPrice) s -= 1;
      if (pf && pf.s && !pf.derived && need.cond.temp == null) { const mo = st.month != null ? st.month : new Date().getMonth(), si = mo >= 2 && mo <= 4 ? 0 : mo >= 5 && mo <= 7 ? 1 : mo >= 8 && mo <= 10 ? 2 : 3; max += .8; s += clamp((pf.s[si] - 3) * .3, -.8, .8); }
    }
    // 6e) thèmes des playlists : les playlists qui répondent à la demande nourrissent le classement (les premiers sont les plus emblématiques)
    if (need.themes && need.themes.length) { const tb = themeBonus(c, need.themes, 2.4); max += 2.6; s += tb.v; if (tb.why) why.unshift(tb.why); }
    if (U && U.themeAff) { const ab = themeAffBonus(c, U.themeAff); max += 1; s += ab.v * .8; if (ab.why && !why.some((x) => /univers/.test(x))) why.push(ab.why); }
    if (max <= 0) { max = 4; s += clamp(Object.values(o.acc).length, 0, 3); }
    max += 1.2; s += 1.2 * fameOf(c);
    { const pv = provenOf(c); if (pv.v) { max += 0.8; s += 0.8 * pv.v; if (pv.n >= 4 && !why.some((x) => /univers|tout en haut/.test(x))) why.push('cité dans ' + pv.n + ' playlists d\'inspiration'); } }
    const asked = new Set([...need.fams, ...need.like.flatMap((k) => noteHits(norm(k)))]);
    if (asked.size) { max += 2; const sh = [...asked].reduce((a, f) => a + (o.acc[f] || 0), 0) / o.tot; s += 2 * clamp(sh / Math.min(.7, .35 * asked.size + .15), 0, 1); }
    const ratio = clamp(s / max, 0, 1);
    return { s, max, pct: clamp(Math.round(100 * Math.pow(ratio, 1.15) * .97), 1, 99), why: why.slice(0, 4), d, pitch: pf ? pf.pitch : '', diff: pf ? pf.diff : '' };
  }

  // Recherche par besoin sur toute la base ; une seule fiche par famille de parfum (pas 15 flankers).
  function searchNeed(pool, need, st, n) {
    const res = [];
    for (const c of pool) { const m = matchNeed(c, need, st); if (m && m.pct >= 35) res.push({ c, m }); }
    // Les parfums en tête d'une playlist qui correspond clairement à la demande, même sans liste de notes vérifiée : ils sont dans la base, ils doivent ressortir, dans l'ordre de la playlist.
    const free = !(need.tags || []).length && !(need.fams || []).length && !(need.like || []).length && !(need.not || []).length && !need.maxPrice && !need.minPrice && !Object.keys(need.flags || {}).length && !need.gender && !need.proj;
    const T = need.themes && need.themes.length ? themeIdx() : null;
    if (T) {
      const have = new Map(res.map((r) => [thKey(r.c), r])), HA = root.HOUSE_ALIAS || {}, pk = new Map(pool.map((c) => [thKey(c), c]));
      need.themes.filter((th) => th.m >= .9).forEach((th) => {
        const L = T.lex[th.pi]; if (!L) return; let pos = -1;
        for (const x of L.p.ps) { if (!x || !x.h) continue; if (++pos >= 12) break;
          const c = { name: x.n, house: HA[norm(x.h)] || x.h, notes: [], price: 0, themeOnly: true }, key = thKey(c), top = pos < 5 ? 74 - 5 * pos : Math.max(38, 52 - 2 * (pos - 5)), ex = have.get(key);
          if (ex) { if (ex.m.pct < top) ex.m.pct = top; continue; }
          if (!free) continue;
          const r = { c: pk.get(key) || c, m: { pct: top, s: 0, why: ['tout en haut de « ' + L.p.t + ' »'], pitch: '', diff: '' } }; res.push(r); have.set(key, r);
        }
      });
    }
    res.sort((a, b) => b.m.pct - a.m.pct || b.m.s - a.m.s);
    const seen = new Set(), out = [];
    const fk = (c) => { const w = norm(c.name).split(' ').filter((x) => !['le', 'la', 'les', 'l', 'the', 'un', 'une', 'eau', 'de', 'du', 'd'].includes(x)); return norm(c.house) + '|' + (w[0] || norm(c.name)); };
    for (const r of res) { const k = fk(r.c); if (seen.has(k)) continue; seen.add(k); out.push(r); if (out.length >= (n || 12)) break; }
    return out;
  }


  // ---------- Profils comparables (18 axes, fiches data/fiches-ia) ----------
  const AXN = ['fraicheur', 'douceur', 'floral', 'boise', 'epice', 'resine', 'fume', 'poudre', 'vert', 'fruite', 'musque', 'cremeux', 'densite', 'originalite', 'clivage', 'formalite', 'sensualite', 'evolution'];
  const AXL = { fraicheur: 'frais', douceur: 'sucré', floral: 'floral', boise: 'boisé', epice: 'épicé', resine: 'résineux', fume: 'fumé', poudre: 'poudré', vert: 'vert', fruite: 'fruité', musque: 'musqué', cremeux: 'crémeux', densite: 'dense', originalite: 'original', clivage: 'clivant', formalite: 'habillé', sensualite: 'sensuel', evolution: 'évolutif' };
  // Profil calculé à partir des VRAIES notes quand il n'y a pas de fiche détaillée : mêmes 18 axes, personnalité neutre, marqué derived.
  function deriveProfile(p) {
    if (!p || (p.notes || []).length < 3) return null;
    const o = olfactive(p), w = p.weight || o.weight, sh = (a) => (o.acc[a] || 0) / o.tot, sc = (x, k) => clamp(Math.round(x * k), 0, 5);
    const nt = (p.notes || []).map(norm), cre = nt.some((n) => /santal|lait|creme|coco|amande|riz|tonka|vanille|iris|benjoin/.test(n)) ? 1.5 : 0;
    const fra = clamp(sc(o.fresh, 6.5) - (w >= 4 ? 1 : 0), 0, 5), dou = sc(o.sweet, 6), res = sc(sh('ambré'), 10), sen = clamp(Math.round(sh('ambré') * 4 + sh('gourmand') * 3 + sh('musqué') * 2 + sh('oud') * 3 + (w >= 4 ? 1 : 0)), 0, 5);
    const pr = [fra, dou, sc(sh('floral'), 9), sc(sh('boisé'), 9), sc(sh('épicé'), 10), res, sc(o.smoke, 6), sc(o.powder, 7), sc(sh('vert') + sh('aromatique') * .6, 9), sc(sh('fruité'), 9), sc(sh('musqué'), 9), clamp(Math.round(o.sweet * 3 + sh('musqué') * 3 + cre), 0, 5), w, 2, clamp(Math.round(o.smoke * 4 + sh('oud') * 6 + 1), 0, 5), 2, sen, 2];
    const summer = clamp(Math.round(5.5 - w + fra * .4), 0, 5), winter = clamp(Math.round(w - .5 + res * .2 + dou * .1), 0, 5);
    return { p: pr, s: [clamp(Math.round((summer + 3) / 2), 0, 5), summer, clamp(Math.round((winter + 3) / 2), 0, 5), winter], m: [clamp(5 - (w >= 4 ? 2 : 0) - (w === 5 ? 1 : 0), 1, 5), clamp(2 + (w >= 4 ? 3 : w === 3 ? 1 : 0), 1, 5)], u: [], dom: '', diff: '', pitch: '', sim: [], alt: [], pour: '', pas: '', kw: [], pub: [], c: 0, derived: true };
  }
  const profOf = (p) => {
    if (!p || !p.name) return null;
    if (p._pf !== undefined) return p._pf;
    const P = root.PROFILS || {}, HA = root.HOUSE_ALIAS || {}, h = HA[norm(p.house)] || p.house;
    const key = norm(h) + '|' + norm(p.name), X = (root.EXPERT || {})[key];
    let q = P[key] || deriveProfile(p);
    const DI = (root.DESCINTEL || {})[key];
    if (DI) {      // descriptions rédigées (bios-extra.txt) et playlists : saisons, usages, axes, mots-clés, statut
      const b = q || { p: new Array(18).fill(2), s: [2, 2, 2, 2], m: [3, 3], u: [], dom: '', diff: '', pitch: '', sim: [], alt: [], pour: '', pas: '', kw: [], pub: [], c: 2 };
      const pp = b.p.slice(); Object.keys(DI.p || {}).forEach((i) => { pp[+i] = Math.max(0, Math.min(5, Math.round((pp[+i] + 2 * DI.p[i]) / 3))); });
      const ss = DI.s ? b.s.map((v, i) => (DI.s[i] > 0 ? Math.max(v, DI.s[i]) : DI.s[i] < 0 ? Math.min(v, 1) : v)) : b.s;
      const mm = DI.m ? [Math.max(b.m[0], DI.m[0]), Math.max(b.m[1], DI.m[1])] : b.m;
      q = Object.assign({}, b, { derived: false, p: pp, s: ss, m: mm, u: [...new Set([...(b.u || []), ...(DI.u || [])])], kw: [...new Set([...(b.kw || []), ...(DI.kw || [])])], st: DI.st || '', tier: DI.tier || '', pour: b.pour || DI.pour || '', pas: b.pas || (DI.pas || []).join(' ; ') });
    }
    if (X) {      // sélection d'experts : les tags posés à la main passent avant les profils déduits des notes
      const b = q || { p: new Array(18).fill(2), s: [2, 2, 2, 2], m: [3, 3], u: [], dom: '', diff: '', pitch: '', sim: [], alt: [], pour: '', pas: '', kw: [], pub: [], c: 2 };
      q = Object.assign({}, b, { derived: false, expert: X.t, u: [...new Set([...(b.u || []), ...X.u])], kw: [...new Set([...(b.kw || []), ...X.kw])], s: X.s ? b.s.map((v, i) => Math.max(v, X.s[i])) : b.s });
    }
    Object.defineProperty(p, '_pf', { value: q, enumerable: false, configurable: true });
    return q;
  };
  const axv = (q, a) => q.p[AXN.indexOf(a)];
  // Ce que la personne aime : moyenne des profils de ses parfums pondérée par la note (>3 attire, <3 repousse). Retourne null s'il y a moins de 2 profils connus.
  function axisPref(collection) {
    const v = new Array(18).fill(0); let sw = 0, n = 0;
    for (const p of collection) {
      const q = profOf(p); if (!q) continue;
      const w = (p.rating || 3) - 3; if (!w) continue;
      n++; sw += Math.abs(w);
      q.p.forEach((x, i) => { v[i] += w * (x - 2.5); });
    }
    if (n < 2 || !sw) return null;
    return v.map((x) => x / sw);
  }
  // Adéquation d'un parfum au vecteur de goûts : -1 à 1 (cosinus). Les axes de personnalité (originalité, clivage, formalité) pèsent moins.
  const AXW = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.1, 1, .6, .6, .5, .8, .4];
  function axisFit(c, pref) {
    const q = profOf(c); if (!q || !pref) return null;
    let dot = 0, na = 0, nb = 0;
    q.p.forEach((x, i) => { const a = pref[i] * AXW[i], b = (x - 2.5) * AXW[i]; dot += a * b; na += a * a; nb += b * b; });
    return na && nb ? dot / Math.sqrt(na * nb) : 0;
  }
  // Pourquoi ce parfum colle (ou pas) aux goûts : les axes qui comptent le plus.
  function axisWhy(c, pref) {
    const q = profOf(c); if (!q || !pref) return [];
    return q.p.map((x, i) => ({ a: AXN[i], v: pref[i] * (x - 2.5), hi: x >= 3.5 && pref[i] > 0.25 })).filter((o) => o.v > 1.1 && o.hi).sort((a, b) => b.v - a.v).slice(0, 2).map((o) => AXL[o.a]);
  }
  // Compare des parfums du même accord entre eux pour une personne : classement + ce qui les départage.
  function rankByFit(list, pref) {
    const rows = list.map((c) => ({ c, fit: axisFit(c, pref), q: profOf(c) })).filter((r) => r.q && r.fit != null).sort((a, b) => b.fit - a.fit);
    return rows.map((r, i) => {
      const next = rows[i + 1], diffs = next ? r.q.p.map((x, k) => ({ a: AXN[k], d: x - next.q.p[k] })).filter((o) => Math.abs(o.d) >= 2 && !['originalite', 'clivage', 'formalite', 'evolution'].includes(o.a)).sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 2).map((o) => (o.d > 0 ? 'plus ' : 'moins ') + AXL[o.a]) : [];
      return { c: r.c, fit: r.fit, pct: clamp(Math.round(50 + r.fit * 50), 1, 99), vsNext: diffs, diff: r.q.diff || '', pitch: r.q.pitch || '' };
    });
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

  // ---------- Fiche éditoriale : ce que la fiche dit du moment, du caractère et des faiblesses ----------
  const edOf = (c) => { const ED = root.EDITORIAL; if (!ED || !c) return null; const HA = root.HOUSE_ALIAS || {}, h = norm(c.house), n = norm(c.name); return ED[norm(HA[h] || c.house) + '|' + n] || ED[h + '|' + n] || null; };
  const CTXSYN = { pro: ['bureau', 'travail', 'reunion', 'professionnel', 'entretien', 'collegues'], perso: ['quotidien', 'tous les jours', 'ville', 'balade'], date: ['rendez', 'diner', 'amoureux', 'romantique', 'seduction', 'date', 'premier verre'], event: ['mariage', 'ceremonie', 'gala', 'fete', 'evenement', 'reception', 'occasion'], famille: ['famille', 'dimanche', 'dejeuner', 'repas'], amis: ['amis', 'sortie', 'bar', 'apero', 'concert', 'fete'] };
  const MOMSYN = { jour: ['matin', 'journee', 'apres midi', 'dejeuner', 'soleil'], soir: ['soir', 'diner', 'soiree'], nuit: ['nuit', 'boite', 'after', 'minuit', 'club'] };
  const VENSYN = { resto: ['restaurant', 'diner', 'table', 'repas'], bar: ['bar', 'cocktail', 'apero'], boite: ['boite', 'club', 'nuit', 'danse'], musee: ['musee', 'expo', 'galerie'], concert: ['concert', 'festival', 'musique'], theatre: ['theatre', 'opera', 'spectacle'], bureau: ['bureau', 'travail'], maison: ['cocooning', 'canape', 'lecture', 'maison'], dehors: ['balade', 'plein air', 'nature', 'marche'] };
  const MOODSYN = { confiant: ['confiance', 'assure', 'charisme'], calme: ['calme', 'serein', 'apaisant', 'zen'], energique: ['energie', 'tonique', 'dynamique', 'vif', 'sport'], romantique: ['romantique', 'amoureux', 'tendre', 'sensuel'], mysterieux: ['mystere', 'sombre', 'nocturne', 'envoutant'], joyeux: ['joyeux', 'solaire', 'lumineux', 'festif'], fatigue: ['reconfort', 'cocon', 'rassurant'], creatif: ['creatif', 'original', 'artistique'] };
  const STOPW = new Set(['pour', 'avec', 'sans', 'dans', 'trop', 'plus', 'moins', 'parfum', 'comme', 'tres', 'etre', 'veux', 'quelque', 'chose', 'cette', 'mon', 'mes', 'une', 'des', 'les', 'qui', 'que', 'pas', 'tout', 'fait', 'faire']);
  function condWords(cond, text) {
    const w = new Set(), add = (a) => (a || []).forEach((x) => w.add(x));
    cond = cond || {};
    add(CTXSYN[cond.ctx]); add(MOMSYN[cond.moment]); add(VENSYN[cond.venue]); add(MOODSYN[cond.mood]);
    if (cond.temp != null) add(cond.temp >= 24 ? ['ete', 'plage', 'vacances', 'chaleur', 'terrasse', 'piscine', 'farniente'] : cond.temp <= 8 ? ['hiver', 'neige', 'froid', 'cheminee', 'cocooning', 'manteau', 'ski'] : ['printemps', 'automne', 'mi saison']);
    norm(text || '').split(' ').filter((x) => x.length >= 4 && !STOPW.has(x)).forEach((x) => w.add(x));
    return [...w];
  }
  const blobHas = (blob, t) => t.length >= 5 ? blob.includes(t) : (' ' + blob + ' ').includes(' ' + t + ' ');
  // Retourne { v, why[], warn[] } : bonus quand la fiche cite la situation, le mood ou la force demandés ; malus quand une faiblesse décrite contredit la demande.
  function ficheFit(c, cond, text, st) {
    const ed = edOf(c); if (!ed) return null;
    cond = cond || {}; st = st || {};
    const words = condWords(cond, text), out = { v: 0, why: [], warn: [], ed };
    const strong = condWords({ ctx: cond.ctx, venue: cond.venue }, text), weakOnly = (t) => !strong.includes(t);
    const sits = (ed.sit || []).map((s) => ({ s, b: norm(s) }));
    const hitsS = sits.filter((x) => strong.some((t) => blobHas(x.b, t))), hitsW = sits.filter((x) => !hitsS.includes(x) && words.filter(weakOnly).some((t) => blobHas(x.b, t)));
    const hits = hitsS.concat(hitsW);
    if (hitsS.length) { out.v += 1.6 + (hits.length > 1 ? 0.4 : 0); out.why.push('sa fiche cite : ' + hitsS[0].s.replace(/^./, (m) => m.toLowerCase()).slice(0, 70)); }
    else if (hitsW.length) { out.v += 0.6; if (cond.ctx == null && cond.venue == null) out.why.push('sa fiche cite : ' + hitsW[0].s.replace(/^./, (m) => m.toLowerCase()).slice(0, 70)); }
    if (ed.mood) { const mb = norm(ed.mood); if (words.some((t) => blobHas(mb, t))) { out.v += 0.7; if (!out.why.length) out.why.push('son mood : ' + String(ed.mood).toLowerCase().slice(0, 50)); } }
    const fb = (ed.forts || []).map(norm).join(' ');
    if (fb && words.filter((t) => t.length >= 5 && !CTXSYN[t]).some((t) => fb.includes(t))) out.v += 0.5;
    const fa = (ed.faibles || []).map(norm).join(' ');
    const warn = (re, msg, pen) => { if (re.test(fa)) { out.v -= pen; out.warn.push(msg); } };
    const quiet = cond.ctx === 'pro' || ['collegues', 'boss'].includes(cond.with) || ['resto', 'theatre', 'musee', 'bureau'].includes(cond.venue) || (cond.want === 'discret') || (cond.tags || []).includes('discret');
    if (quiet) warn(/(sillage|projection)[^.]{0,30}(enorme|puissant|important|massif|envahissant|tres present|monstre)|ecrasant|envahissant|tres clivant|polarisant/, 'sa fiche prévient : un sillage qui peut peser dans ce cadre', 1.3);
    if (cond.temp != null && cond.temp >= 26) warn(/lourd|capiteux|etouffant|ecoeurant|sirupeux/, 'sa fiche prévient : plutôt lourd quand il fait chaud', 1.2);
    if (cond.temp != null && cond.temp <= 6) warn(/evanescent|fugace|trop leger|s'estompe vite|disparait vite/, 'sa fiche prévient : un peu léger pour le froid', 0.8);
    if (cond.dur === 'longue') warn(/(tenue|longevite)[^.]{0,20}(courte|moyenne|faible|limitee)|disparait|s'estompe|part vite/, 'sa fiche prévient : une tenue qui ne couvre pas toute la journée', 1.0);
    if (['statement', 'sent'].includes(cond.want) || (cond.tags || []).includes('statement')) warn(/(sillage|projection)[^.]{0,20}(discret|faible|intime|leger)|passe inaperçu/, 'sa fiche prévient : un sillage discret', 0.9);
    const age = +st.age || 0, pm = ed.pour ? String(ed.pour).match(/(\d{2})\s*[-–à]\s*(\d{2})/) : null;
    if (age && pm) { const lo = +pm[1], hi = +pm[2]; if (age >= lo - 2 && age <= hi + 2) { out.v += 0.4; } else if (age < lo - 10 || age > hi + 12) { out.v -= 0.5; out.warn.push('sa fiche vise plutôt ' + lo + ' à ' + hi + ' ans'); } }
    out.v = clamp(out.v, -2.4, 2.8);
    return out;
  }

  // ---------- Thèmes des playlists : chaque playlist est une intention, ses membres sont classés du plus au moins emblématique ----------
  const TSYN = {
    'daily': ['quotidien', 'tous les jours', 'chaque jour', 'polyvalent', 'facile a porter'],
    'parfums de date': ['date', 'rendez vous', 'rdv', 'premier verre', 'diner a deux', 'amoureux', 'seduire', 'seduction', 'romantique', 'premier rendez vous'],
    'night out': ['sortie', 'boite', 'club', 'after', 'danser', 'bar', 'nuit blanche', 'fete'],
    'occasion speciale': ['occasion speciale', 'mariage', 'ceremonie', 'gala', 'invite', 'reception', 'grande occasion', 'bapteme', 'anniversaire'],
    'soiree chic': ['soiree chic', 'diner chic', 'cocktail', 'smoking', 'habille', 'cigare', 'toscane'],
    'job interview': ['entretien', 'embauche', 'recrutement', 'reunion', 'premier jour'],
    'sunday morning': ['dimanche', 'brunch', 'grasse matinee', 'paresseux'],
    'en famille': ['famille', 'repas de famille', 'enfants', 'grand mere', 'dimanche midi'],
    'sous la chaleur': ['chaleur', 'canicule', 'ete', 'tropical', 'estival', 'torride'],
    'beach club': ['plage', 'beach', 'piscine', 'vacances', 'rooftop', 'bord de mer'],
    'boat day': ['bateau', 'yacht', 'voilier', 'croisiere', 'sortie en mer'],
    'seul face a l ocean': ['ocean', 'nager', 'nuit', 'solitaire', 'mer'],
    'ski weekend': ['ski', 'montagne', 'chalet', 'neige', 'apres ski'],
    'gameday': ['match', 'foot', 'stade', 'sport', 'supporter', 'avant match'],
    'f1': ['formule 1', 'course', 'circuit', 'paddock', 'voiture'],
    'aimant a compliments': ['compliment', 'compliments', 'remarque', 'remarquer', 'arrete dans la rue', 'on me demande', 'quel parfum'],
    'je veux qu on me remarque': ['remarque', 'remarquer', 'presence', 'impact', 'marquer', 'sillage fort', 'se faire remarquer'],
    'je veux etre envoutant': ['envoutant', 'sensuel', 'magnetique', 'mysterieux', 'charnel', 'sexy', 'seduire'],
    'je veux sentir propre': ['propre', 'linge', 'savon', 'coton', 'douche', 'clean', 'chemise repassee', 'net'],
    'je veux sentir opulent': ['opulent', 'riche', 'luxueux', 'luxe', 'somptueux', 'majestueux', 'ample'],
    'je veux sentir unique': ['unique', 'original', 'different', 'rare', 'singulier', 'atypique', 'personne d autre'],
    'clean girl': ['clean girl', 'pilates', 'minimaliste', 'matcha'], 'quiet luxury': ['quiet luxury', 'luxe discret', 'cachemire', 'sobre', 'discret'],
    'it girl': ['it girl', 'tendance', 'a la mode', 'instagram'], 'it boy': ['it boy', 'tendance', 'a la mode', 'streetwear', 'createur'],
    'finance bro': ['finance', 'trader', 'banque', 'banquier', 'business', 'costume'], 'tech bro': ['tech', 'startup', 'developpeur', 'geek', 'ingenieur'],
    'fur coat energy': ['fourrure', 'russe', 'baddie', 'femme fatale', 'glamour'], 'funky chic': ['funky', 'decale', 'danser'], 'effortless chic': ['effortless', 'sans effort', 'parisien', 'parisienne', 'naturel'],
    'les branches': ['branche', 'tendance', 'marais', 'pop up'], 'les artsy': ['artiste', 'artsy', 'galerie', 'atelier', 'peintre'], 'les dj': ['dj', 'club', 'techno', 'musique electronique'],
    'corporate weapons': ['corporate', 'bureau', 'open space', 'costume', 'pouvoir', 'direction'], 'les fans de design': ['design', 'architecte', 'minimaliste'], 'les sportifs styles': ['sportif', 'running', 'footing', 'salle de sport', 'sport'],
    'bookworm': ['livre', 'lecture', 'bibliotheque', 'litterature', 'romantique'], 'mayfair': ['londres', 'mayfair', 'britannique', 'gentleman'], 'le qatari': ['qatar', 'golfe', 'oriental luxe', 'palace', 'arabe'],
    'le footeux': ['footballeur', 'foot', 'joueur', 'premier league'], 'l aventurier': ['aventure', 'canyon', 'escalade', 'nature sauvage'], 'l elegant': ['elegant', 'classique', 'vieux', 'tres chic', 'distingue'],
    'le collectionneur': ['collectionneur', 'rare', 'musee', 'art'], 'la vie de ronnie': ['ronnie', 'paris nuit', 'veste vuitton'],
    'tony montana': ['mafia', 'mafieux', 'gangster', 'scarface', 'truand', 'baron de la drogue'], 'michael corleone': ['mafia', 'mafieux', 'gangster', 'parrain', 'truand'], 'vito corleone': ['mafia', 'mafieux', 'parrain', 'gangster', 'truand'], 'les affranchis': ['mafia', 'mafieux', 'gangster', 'truand', 'goodfellas'],
    'thomas shelby': ['peaky blinders', 'gangster', 'charisme', 'birmingham'], 'don draper': ['mad men', 'charisme', 'publicitaire', 'whisky', 'classe'], 'james bond': ['espion', 'agent secret', '007', 'elegant'], 'jordan belfort': ['wolf of wall street', 'argent', 'exces', 'fete'],
    'patrick bateman': ['american psycho', 'costume', 'psychopathe', 'froid'], 'tyler durden': ['fight club', 'rebelle', 'brut'], 'hannibal lecter': ['hannibal', 'raffine', 'dangereux'], 'jay gatsby': ['gatsby', 'fete', 'annees folles', 'riche'], 'logan roy': ['succession', 'patron', 'pouvoir'], 'kendall roy': ['succession', 'heritier', 'pouvoir'],
    'automne cozy': ['automne', 'cozy', 'cocooning', 'pull', 'pluie', 'cinnamon'], 'chic winter': ['hiver', 'noel', 'reveillon', 'manteau', 'reception'], 'hiver a new york': ['hiver', 'neige', 'new york', 'lounge', 'froid'], 'christmas eve': ['noel', 'reveillon', 'eglise', 'sapin'],
    'garden party': ['printemps', 'jardin', 'champetre', 'mariage', 'courses', 'cocktail en plein air'], 'soiree a l opera': ['opera', 'theatre', 'velours', 'spectacle'], 'l ivresse': ['champagne', 'ivresse', 'fete', 'cocktail'], 'jazz': ['jazz', 'club de jazz', 'whisky'], 'l or': ['or', 'dore', 'precieux'], 'la cathedrale': ['encens', 'eglise', 'cathedrale', 'sacre', 'spirituel'],
    'niche a petit prix': ['pas cher', 'petit prix', 'abordable', 'budget', 'niche accessible', 'economique'], 'les valeurs sures': ['mainstream', 'facile a trouver', 'grand public', 'best seller', 'partout', 'sephora', 'grande distribution', 'classique'],
    'layering': ['layering', 'superposer', 'melanger', 'combiner'], 'historical scents': ['histoire', 'historique', 'epoque', 'antique'], 'strange smells': ['bizarre', 'etrange', 'atypique', 'metal', 'asphalte'],
  };
  const THSTOP = new Set(['dans', 'avec', 'pour', 'leurs', 'cette', 'cest', 'toute', 'tout', 'tous', 'entre', 'comme', 'plus', 'tres', 'sans', 'parfum', 'parfums', 'quand', 'toujours', 'jamais', 'celui', 'celle', 'qu on', 'veux', 'être', 'chaque', 'aussi', 'elle', 'elles', 'leur', 'ainsi', 'fait', 'avant', 'apres']);
  const COND_TH = {
    'parfums de date': (c) => (c.ctx === 'date' || c.with === 'partenaire' || c.with === 'premier' ? 1 : 0), 'night out': (c) => (c.venue === 'boite' || c.venue === 'bar' || (c.ctx === 'amis' && c.moment !== 'jour') ? 1 : c.moment === 'nuit' ? .6 : 0),
    'occasion speciale': (c) => (c.ctx === 'event' ? 1 : 0), 'soiree chic': (c) => (c.ctx === 'event' && c.moment !== 'jour' ? .8 : 0), 'job interview': (c) => (c.ctx === 'pro' ? .7 : 0), 'corporate weapons': (c) => (c.ctx === 'pro' ? .5 : 0),
    'daily': (c) => (c.ctx === 'perso' || c.ctx === 'pro' ? .45 : 0), 'en famille': (c) => (c.ctx === 'famille' || c.with === 'famille' ? 1 : 0), 'sunday morning': (c) => (c.mood === 'calme' && c.moment === 'jour' ? .5 : 0),
    'sous la chaleur': (c) => (c.temp != null && c.temp >= 26 ? 1 : 0), 'beach club': (c) => (c.temp != null && c.temp >= 26 && c.moment === 'jour' ? .6 : 0), 'boat day': (c) => (c.temp != null && c.temp >= 24 ? .4 : 0),
    'chic winter': (c) => (c.temp != null && c.temp <= 8 ? .8 : 0), 'hiver a new york': (c) => (c.temp != null && c.temp <= 5 ? .8 : 0), 'automne cozy': (c) => (c.temp != null && c.temp <= 15 && c.temp > 3 ? .7 : 0), 'ski weekend': (c) => (c.temp != null && c.temp <= 2 ? .5 : 0),
    'aimant a compliments': (c) => (c.want === 'compliments' ? 1 : 0), 'je veux qu on me remarque': (c) => (c.want === 'sent' || (c.tags || []).includes('statement') ? 1 : 0), 'je veux etre envoutant': (c) => (c.mood === 'mysterieux' || c.mood === 'romantique' || (c.tags || []).includes('sensuel') ? .8 : 0),
    'je veux sentir propre': (c) => ((c.tags || []).includes('propre') ? 1 : 0), 'je veux sentir opulent': (c) => ((c.tags || []).includes('opulent') ? 1 : 0), 'je veux sentir unique': (c) => ((c.tags || []).includes('original') ? 1 : 0),
    'niche a petit prix': (c) => (c.flags && c.flags.cheap ? 1 : 0), 'les valeurs sures': (c) => (c.flags && c.flags.mainstream ? 1 : 0),
  };
  let TH = null;
  const thTitle = (p) => norm(p.t).replace(/ /g, ' ');
  function themeIdx() {
    const PL = root.PLAYLISTS; if (!PL) return null;
    if (TH && TH.src === PL) return TH;
    const HA = root.HOUSE_ALIAS || {}, idx = new Map(), lex = [];
    PL.forEach((p, pi) => {
      const tn = thTitle(p), syn = TSYN[tn] || [];
      const title = tn.split(' ').filter((w) => w.length >= 4 && !THSTOP.has(w));
      const desc = norm((p.d || '') + ' ' + (p.grp || []).map((g) => g.d || '').join(' ')).split(' ').filter((w) => w.length >= 6 && !THSTOP.has(w));
      lex.push({ pi, p, tn, syn, title, desc: [...new Set(desc)] });
      let a = 0; const groups = p.grp ? p.grp.map((g) => g.n) : [p.ps.length];
      groups.forEach((n) => {
        for (let i = 0; i < n; i++) {
          const x = p.ps[a + i]; if (!x || !x.h) continue;
          const k = norm(HA[norm(x.h)] || x.h) + '|' + norm(x.n), wt = clamp(1.15 - 0.85 * (i / Math.max(1, n - 1)) + (i < 3 ? .15 : 0), .3, 1.3);
          const L = idx.get(k) || []; if (!L.some((m) => m.pi === pi)) L.push({ pi, pos: i, wt }); idx.set(k, L);
        }
        a += n;
      });
    });
    TH = { src: PL, idx, lex };
    return TH;
  }
  const thKey = (c) => { const HA = root.HOUSE_ALIAS || {}; return norm(HA[norm(c.house)] || c.house) + '|' + norm(c.name); };
  // Playlists qui correspondent à une demande libre et/ou à des conditions : [{ pi, m }]
  function themesFor(text, cond, tags, flags) {
    const T = themeIdx(); if (!T) return [];
    const t = ' ' + norm(text || '') + ' ', cd = Object.assign({}, cond || {}, { tags: tags || [], flags: flags || {} }), out = [];
    for (const L of T.lex) {
      let m = 0;
      const sh = L.syn.filter((s) => t.includes(' ' + s + ' ') || (s.length >= 6 && t.includes(' ' + s)));
      const th = L.title.filter((w) => t.includes(' ' + w) || (w.length >= 6 && t.includes(w.slice(0, 5))));
      if (sh.length || (th.length && th.length >= Math.min(2, L.title.length))) m = Math.min(1, .6 + .2 * (sh.length + th.length - 1));
      else { const dh = L.desc.filter((w) => t.includes(' ' + w.slice(0, Math.max(5, w.length - 2)))); if (dh.length >= 2) m = Math.min(.45, .2 * dh.length); }
      const f = COND_TH[L.tn]; if (f) { const v = f(cd) || 0; if (v > m) m = v; }
      if (m >= .3) out.push({ pi: L.pi, m, t: L.p.t });
    }
    return out;
  }
  // Bonus d'un parfum selon sa place dans les playlists retenues (premiers = plus emblématiques) : { v, why }
  function themeBonus(c, ths, scale) {
    const T = themeIdx(); if (!T || !ths || !ths.length) return { v: 0, why: '' };
    const mem = T.idx.get(thKey(c)); if (!mem) return { v: 0, why: '' };
    const hits = []; for (const th of ths) { const mm = mem.find((x) => x.pi === th.pi); if (mm) hits.push({ v: th.m * mm.wt, t: th.t, pos: mm.pos }); }
    if (!hits.length) return { v: 0, why: '' };
    hits.sort((a, b) => b.v - a.v);
    const head = hits[0].v >= .9 && hits[0].pos < 5 ? [1.1, .95, .7, .45, .25][hits[0].pos] : 0;
    const v = clamp((hits[0].v + .4 * (hits[1] ? hits[1].v : 0) + .2 * (hits[2] ? hits[2].v : 0)) * (scale || 2.2) + head, 0, 3.6);
    return { v, why: hits[0].pos <= 2 ? 'tout en haut de « ' + hits[0].t + ' »' : 'dans l\'univers « ' + hits[0].t + ' »', top: hits[0] };
  }
  // Les univers qu'une personne aime, déduits de ses parfums notés (et de ses retours) : { pi: affinité }
  // Les playlists où figure un parfum, les plus fortes d'abord (pour l'afficher, le chercher et le raconter).
  function themesOf(c, n) {
    const T = themeIdx(); if (!T) return []; const mem = T.idx.get(thKey(c)); if (!mem) return [];
    return mem.slice().sort((a, b) => b.wt - a.wt).slice(0, n || 5).map((m) => ({ id: T.lex[m.pi].p.id, t: T.lex[m.pi].p.t, sec: (T.lex[m.pi].p.secs || [])[0] || '', pos: m.pos }));
  }
  // Un parfum cité dans plusieurs playlists d'inspiration, surtout en tête, a fait ses preuves : { v: 0..1, n: nombre de playlists }
  function provenOf(c) {
    const T = themeIdx(); if (!T) return { v: 0, n: 0 }; const mem = T.idx.get(thKey(c)); if (!mem || !mem.length) return { v: 0, n: 0 };
    const sum = mem.reduce((a, m) => a + m.wt, 0); return { v: clamp(Math.log2(1 + sum) / 2.6, 0, 1), n: mem.length };
  }
  function themeAffinity(col) {
    const T = themeIdx(); if (!T) return null; const aff = {}; let any = false;
    for (const p of col) { const w = (p.rating || 3) - 3; if (!w) continue; const mem = T.idx.get(thKey(p)); if (!mem) continue; mem.forEach((m) => { aff[m.pi] = (aff[m.pi] || 0) + w * m.wt; any = true; }); }
    if (!any) return null; const mx = Math.max(1, ...Object.values(aff).map(Math.abs)); for (const k in aff) aff[k] /= mx; return aff;
  }
  function themeAffBonus(c, aff) {
    const T = themeIdx(); if (!T || !aff) return { v: 0, why: '' };
    const mem = T.idx.get(thKey(c)); if (!mem) return { v: 0, why: '' };
    let v = 0, best = null; for (const m of mem) { const a = aff[m.pi] || 0; v += a * m.wt * .5; if (a > .3 && (!best || a * m.wt > best.s)) best = { s: a * m.wt, t: T.lex[m.pi].p.t }; }
    return { v: clamp(v, -1, 1.4), why: best ? 'dans l\'univers « ' + best.t + ' » que tu aimes' : '' };
  }


  // ---------- Retours « ce conseil t'a plu ? » : ils comptent comme des notes et ajustent les goûts (densité, douceur, originalité) ----------
  function fbItems(st) {
    return ((st && st.fb) || []).filter((f) => f && f.verdict && (f.notes || []).length >= 3).map((f) => ({ id: 'fb:' + norm(f.name), name: f.name, house: f.house, notes: f.notes, family: f.family, rating: f.verdict > 0 ? 4.5 : 1.5, virtual: true }));
  }
  function fbAdjust(pref, st) {
    const fb = (st && st.fb) || []; if (!fb.some((f) => f && f.verdict < 0 && f.reason)) return pref;
    const v = (pref || new Array(18).fill(0)).slice(), add = (a, x) => { v[AXN.indexOf(a)] += x; };
    fb.forEach((f) => { if (!f || f.verdict >= 0) return; if (f.reason === 'lourd') { add('densite', -.35); add('fraicheur', .15); } else if (f.reason === 'sucre') { add('douceur', -.4); add('cremeux', -.15); } else if (f.reason === 'vu') { add('originalite', .3); } });
    return v;
  }

  // Contexte personnel mémorisé : goûts calculés sur la collection (notes, familles, axes), maisons aimées, budget, saison.
  let UCACHE = { k: '', v: null };
  function userCtx(st) {
    const own = (st && st.collection) || [], col = own.concat(fbItems(st));
    if (!col.length && !(st && ((st.liked || []).length || (st.avoid || []).length || st.vibes && st.vibes.length))) return null;
    const k = col.map((p) => (p.id || p.name) + ':' + (p.rating || 3)).join(',') + ((st.fb || []).map((f) => f.reason || '').join('')) + '|' + (st.liked || []).join(',') + '|' + (st.avoid || []).join(',') + '|' + (st.vibes || []).join(',') + (st.power || '') + (st.occ || []).join(',') + (st.age || '') + (st.gender || '');
    if (UCACHE.k === k && UCACHE.v) return UCACHE.v;
    const prof = tasteProfile(col, st || {}); let pref = axisPref(col);
    const prior = priorVec(st || {}); if (prior) pref = pref ? pref.map((x, i) => x + 0.35 * prior[i]) : prior.map((x) => x * 0.8);
    const vv = vibeVec(st || {}); if (vv) pref = pref ? pref.map((x, i) => x + 0.7 * vv[i]) : vv.map((x) => x * 0.9);
    pref = fbAdjust(pref, st);
    const houseAff = {}, hn = {}; col.forEach((p) => { const h = norm(p.house); (hn[h] = hn[h] || []).push(p.rating || 3); });
    Object.keys(hn).forEach((h) => { const a = hn[h].reduce((x, y) => x + y, 0) / hn[h].length; houseAff[h] = a >= 4 ? 1 : a <= 2.5 ? -1 : 0; });
    const loved = col.filter((p) => (p.rating || 3) >= 4 && (p.notes || []).length >= 3).map((p) => ({ name: p.name, notes: p.notes.map(norm), r: p.rating }));
    const v = { prof, pref, houseAff, loved, owned: new Set(own.map((p) => norm(p.name))), n: col.length, posN: col.filter((p) => (p.rating || 3) >= 3.5).length, themeAff: themeAffinity(col) };
    UCACHE = { k, v }; return v;
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
    const wn = WANT[cond.want];
    parts.want = wn ? sum(wn.w) + 0.8 * projPenalty(wn.proj, proj) : 0;
    const pl = PLACE[cond.place];
    if (pl) parts.ctx += sum(pl.w) + 0.8 * projPenalty(pl.proj, proj);
    const vn = VENUE[cond.venue];
    if (vn) parts.ctx += sum(vn.w) + 0.8 * projPenalty(vn.proj, proj);
    // Moment idéal connu (jour / soir / nuit) pour les parfums du catalogue
    const mo = p.m || (root.DESC && root.DESC[p.name] && root.DESC[p.name][0]);
    if (mo && mo !== 'tous' && cond.moment) {
      const M = { jour: { jour: 1.2, soir: -.4, nuit: -1.6 }, soir: { jour: -.8, soir: 1.2, nuit: .8 }, nuit: { jour: -1.8, soir: .6, nuit: 1.4 } };
      parts.ctx += (M[mo] || {})[cond.moment] || 0;
    }
    // Notes que la personne adore ou fuit
    const nt = (p.notes || []).map(norm);
    // Pas de parfum nettement « pour elle » à un homme, ni l'inverse (les mixtes passent)
    const gd = st.gender && root.genderOf ? root.genderOf(p.name, p.house) : 'u';
    parts.gender = (st.gender === 'm' && gd === 'f') || (st.gender === 'f' && gd === 'm') ? -3 : 0;
    parts.liked = 0;
    if (st.liked && st.liked.length) parts.liked += Math.min(2, st.liked.filter((l) => l && nt.some((n) => n.includes(norm(l)))).length) * 0.9;
    if (st.avoid && st.avoid.length) parts.liked -= Math.min(3, st.avoid.filter((a) => a && nt.some((n) => n.includes(norm(a)))).length * 1.5);
    if (cond.dur === 'longue') parts.ctx += 0.8 * ((p.longevity || 3) - 3) + ((p.weight || 3) === 3 ? .3 : 0);
    parts.outfit = 0.8 * (sum(STYLE[cond.style] || {}) + sum(COLOR[cond.color] || {}) + sum(FABRIC[cond.fabric] || {}));
    parts.perso = ((p.rating || 3) - 3) * 0.8;
    if (st.fbMap && st.fbMap[p.id]) parts.perso += clamp(st.fbMap[p.id] * 0.7, -2, 2);
    if (!(p.notes || []).length && !p.family) parts.perso -= 2; // fiche vide : on ne peut pas l'évaluer
    const days = st.daysSince ? st.daysSince(p.id) : null;
    if (days != null) parts.perso += days === 0 ? -3 : days === 1 ? -1.5 : days === 2 ? -0.7 : days >= 14 ? 0.5 : 0;
    if (st.daysSince) parts.stock = stockEffect(p, cond); // pas dans le calcul des manques de collection
    const ff = st.noFiche ? null : ficheFit(p, cond, '', st);
    parts.fiche = ff ? ff.v : 0;
    let tbd = null;
    if (!st.noTheme) { const ck = JSON.stringify(cond); if (!score._tc || score._tc.k !== ck) score._tc = { k: ck, v: themesFor('', cond, [], {}) }; tbd = themeBonus(p, score._tc.v, 1.6); parts.theme = tbd.v; }
    const total = Object.values(parts).reduce((a, b) => a + b, 0);
    return { total, parts, fiche: ff, theme: tbd };
  }

  function reasons(p, cond, parts, fiche, theme) {
    const r = [];
    if (theme && theme.why && theme.v >= .5) r.push(theme.why.charAt(0).toUpperCase() + theme.why.slice(1));
    if (fiche) { fiche.why.slice(0, 1).forEach((x) => r.push(x.charAt(0).toUpperCase() + x.slice(1))); fiche.warn.slice(0, 1).forEach((x) => r.push('⚠ ' + x.charAt(0).toUpperCase() + x.slice(1))); }
    if (parts.weather >= 1) r.push(`Météo : ${weatherLabel(cond)}`);
    if (parts.ctx >= 1.5) r.push(`Colle à ta journée (${CONTEXTS[cond.ctx].toLowerCase()} · ${WITHS[cond.with].toLowerCase()})`);
    if (parts.mood >= 1) r.push(`Épouse ton mood (${MOODS[cond.mood].toLowerCase()})`);
    if (cond.want && WANTS[cond.want] && parts.want >= 1) r.push(`Pour ton envie : ${WANTS[cond.want].toLowerCase()}`);
    if (cond.place && parts.ctx >= 1) r.push(`Adapté au lieu (${PLACES[cond.place].toLowerCase()})`);
    if (cond.venue && VENUES[cond.venue] && parts.ctx >= 1) r.push(`Fait pour ${VENUES[cond.venue].toLowerCase()}`);
    const mo = p.m || (root.DESC && root.DESC[p.name] && root.DESC[p.name][0]);
    if (mo && mo !== 'tous' && mo === cond.moment) r.push(cond.moment === 'jour' ? 'Un parfum de journée' : cond.moment === 'soir' ? 'Un parfum de soirée' : 'Un parfum de nuit');
    if (parts.liked >= 0.9) r.push('Des notes que tu adores');
    if (parts.liked <= -1.4) r.push('⚠ Contient une note que tu fuis');
    if (cond.dur === 'longue' && (p.longevity || 3) >= 4) r.push('Tient toute la journée');
    if (parts.outfit >= 1) r.push(`Va avec ta tenue (${STYLES[cond.style].toLowerCase()}${cond.fabric ? ', ' + FABRICS[cond.fabric].toLowerCase() : ''})`);
    if ((p.rating || 3) >= 4) r.push('Un de tes chouchous');
    if (parts.perso >= 0.4 && (p.rating || 3) < 4) r.push('Pas porté depuis un moment');
    if (parts.perso <= -1.4) r.push('⚠ Déjà porté très récemment');
    if (!(p.notes || []).length && !p.family) r.push('⚠ Fiche à compléter : je ne peux pas l\'évaluer');
    if (parts.stock >= 1) r.push('Gardé pour les grandes occasions : c\'est le moment');
    if (parts.stock <= -1.4) r.push(stockOf(p).use === 'special' && stockOf(p).ml > 10 ? '⚠ Réservé aux grandes occasions' : '⚠ Stock limité : à ménager');
    return r;
  }

  function rank(collection, cond, st) {
    return collection
      .map((p) => { const s = score(p, cond, st); return { p, total: s.total, parts: s.parts, reasons: reasons(p, cond, s.parts, s.fiche, s.theme) }; })
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
    for (const n of settings.avoid || []) note[norm(n)] = (note[norm(n)] || 0) - 3;
    const mx = (o) => Math.max(1, ...Object.values(o).map(Math.abs));
    const mf = mx(fam), mn = mx(note);
    for (const k in fam) fam[k] /= mf;
    for (const k in note) note[k] /= mn;
    return { fam, note, liked: (settings.liked || []).map(norm).filter(Boolean) };
  }

  function taste(c, prof) {
    let s = 4 * (prof.fam[c.family] || 0);
    const hits = [];
    const lk = prof.liked || [];
    for (const n of c.notes || []) {
      const nn = norm(n), v = prof.note[nn] || 0;
      s += 1.2 * v;
      // une note adorée compte aussi dans ses variantes (poivre dans poivre rose, jasmin dans jasmin sambac)
      const loved = lk.some((l) => nn === l || nn.startsWith(l + ' ') || nn.endsWith(' ' + l));
      if (loved) s += 1.5;
      if (v > 0.25 || loved) hits.push(n);
    }
    return { s: clamp(s, -4, 8), hits: [...new Set(hits)].slice(0, 3) };
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

  // La wishlist nourrit les goûts : ce qu'on a senti et aimé attire, ce qu'on a senti sans aimer repousse, ce qu'on veut sentir compte un peu.
  // Chaque entrée devient un pseudo-parfum noté (même échelle que la collection) dont les notes viennent de la base si la wishlist ne les a pas.
  const WISH_RATING = { love: 5, ok: 3.7, no: 1 };
  function wishSignals(wishlist, catalog) {
    const idx = new Map(); for (const c of catalog || []) { const k = norm(c.name); if (!idx.has(k)) idx.set(k, c); }
    const out = [];
    for (const w0 of wishlist || []) {
      const w = typeof w0 === 'string' ? { name: w0 } : w0; if (!w || !w.name) continue;
      const base = idx.get(norm(w.name)) || {};
      const smelled = w.st === 'smelled', r = smelled ? (w.verdict ? WISH_RATING[w.verdict] : 3.3) : 3.5;
      out.push({ name: w.name, house: w.house || base.house || '', family: w.family || base.family || '', notes: (w.notes && w.notes.length ? w.notes : base.notes) || [], weight: base.weight, rating: r, fromWish: true, smelled, verdict: smelled ? w.verdict || '' : '' });
    }
    return out;
  }
  // Ce que l'âge et le genre suggèrent quand on ne sait encore rien d'autre : un point de départ qui change d'une personne à l'autre, vite dépassé par ses vrais goûts.
  function priorVec(settings) {
    const v = new Array(18).fill(0), add = (a, x) => { v[AXN.indexOf(a)] += x; };
    const age = +settings.age || 0, g = settings.gender;
    if (age && age <= 22) { add('fraicheur', 1); add('douceur', 1.2); add('fruite', 1); add('musque', .5); add('densite', -.5); add('formalite', -.8); }
    else if (age && age <= 35) { add('sensualite', .5); add('boise', .3); add('douceur', .3); }
    else if (age && age <= 50) { add('boise', .8); add('epice', .4); add('poudre', .4); add('formalite', .6); }
    else if (age) { add('floral', .7); add('poudre', .9); add('resine', .5); add('vert', .3); add('formalite', .8); }
    if (g === 'f') { add('floral', .8); add('douceur', .5); add('poudre', .3); }
    else if (g === 'm') { add('boise', .6); add('vert', .4); add('fraicheur', .4); add('epice', .3); }
    return v.some((x) => x) ? v : null;
  }
  // Ce que la personne dit elle-même (ambiances, intensité, occasions) pèse plus que l'âge et le genre.
  const VIBES = {
    frais: { fraicheur: 1.4, vert: .5, densite: -.5, douceur: -.3 },
    sucre: { douceur: 1.5, cremeux: .6, fruite: .4, fraicheur: -.4 },
    sensuel: { sensualite: 1.4, resine: .5, densite: .6, musque: .4 },
    elegant: { poudre: 1, formalite: 1.2, floral: .5, originalite: -.2 },
    naturel: { vert: 1, boise: .8, fume: .3, evolution: .4 },
    original: { originalite: 1.5, clivage: .6, evolution: .6, formalite: -.3 },
    classique: { formalite: .8, originalite: -.9, clivage: -.8, boise: .3 },
  };
  const POWER = { discret: { densite: -1.2, musque: .7, fraicheur: .5 }, present: {}, fort: { densite: 1.3, epice: .4, resine: .4, sensualite: .3 } };
  const OCCS = {
    bureau: { formalite: .8, fraicheur: .6, densite: -.6 }, soiree: { sensualite: .8, densite: .8, originalite: .3 }, rdv: { sensualite: .9, douceur: .5 },
    quotidien: {}, ete: { fraicheur: 1, densite: -.6 }, hiver: { densite: .9, epice: .5, resine: .4 },
  };
  function vibeVec(settings) {
    const v = new Array(18).fill(0), put = (o, k) => { for (const a in o) v[AXN.indexOf(a)] += o[a] * k; };
    (settings.vibes || []).forEach((k) => VIBES[k] && put(VIBES[k], 1));
    if (settings.power && POWER[settings.power]) put(POWER[settings.power], 1);
    (settings.occ || []).forEach((k) => OCCS[k] && put(OCCS[k], .6));
    return v.some((x) => x) ? v : null;
  }
  const hash01 = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10007) / 10007; };

  // Compatibilité réaliste : on part de ce que la personne aime vraiment (affinité des goûts, notes adorées), on retire quand c'est hors saison ou hors budget.
  function matchPct(af, ts, gapMax, sFit, over, inBud, hf, wished) {
    const fitA = af != null ? clamp((af + 0.1) / 0.8, 0, 1) : 0.4, fitT = clamp((ts + 1) / 7, 0, 1);
    let p = 34 + 38 * fitA + 20 * fitT + Math.min(4, gapMax * 1.2) + (sFit >= 0.7 ? 3 : sFit <= -0.7 ? -6 : 0) + (inBud ? 2 : 0) - (over ? 12 : 0) + (hf > 0.3 ? 3 : hf < -0.3 ? -5 : 0) + (wished ? 2 : 0);
    return clamp(Math.round(p), 4, 96);
  }
  // Étale les pourcentages sur la liste et tient compte de la confiance : peu d'infos sur la personne = jamais de 95 %.
  function calibrate(list, settings, collection) {
    if (!list.length) return list;
    const signals = (collection || []).length * 1.5 + (settings.liked || []).length + (settings.avoid || []).length + (settings.vibes || []).length * 2 + ((settings.power ? 1 : 0) + (settings.occ || []).length);
    const cap = signals < 3 ? 68 : signals < 7 ? 79 : signals < 12 ? 87 : 93, conf = signals < 3 ? 'faible' : signals < 7 ? 'moyenne' : 'bonne';
    const sorted = list.slice().sort((a, b) => b.total - a.total), n = sorted.length;
    let prev = 100;
    sorted.forEach((r, i) => {
      const rk = i / Math.max(1, n - 1), blend = 0.7 * r.pct + 0.3 * (95 - 55 * Math.pow(rk, 0.6));
      let v = 30 + (blend - 30) * (cap - 30) / (96 - 30);
      v = Math.min(v, prev - (i < 14 ? 0.7 : 0.02)); prev = v;
      r.pct = clamp(Math.round(v), 4, cap); r.conf = conf;
    });
    return list;
  }

  function recommend(catalog, collection, wishlist, settings) {
    const sig = wishSignals(wishlist, catalog), col = collection.concat(sig, fbItems(settings));
    const prof = tasteProfile(col, settings);
    let pref = axisPref(col); const prior = priorVec(settings);
    if (prior) pref = pref ? pref.map((x, i) => x + 0.35 * prior[i]) : prior.map((x) => x * 0.8);
    const vv = vibeVec(settings);
    if (vv) pref = pref ? pref.map((x, i) => x + 0.7 * vv[i]) : vv.map((x) => x * 0.9);
    pref = fbAdjust(pref, settings);
    const cov = coverage(collection);
    const owned = new Set(collection.map((p) => norm(p.name)));
    const rejected = new Set(sig.filter((x) => x.verdict === 'no').map((x) => norm(x.name)));
    const wishedSet = new Set(sig.map((x) => norm(x.name)));
    const avoid = (settings.avoid || []).map(norm);
    const budget = settings.budget || 0, seed = String(settings.seed || '');
    const THAFF = themeAffinity(col), OCCTH = [].concat(...(settings.occ || []).map((o) => themesFor('', { quotidien: { ctx: 'perso' }, bureau: { ctx: 'pro' }, soiree: { ctx: 'event', moment: 'soir' }, rdv: { ctx: 'date' }, ete: { temp: 28 }, hiver: { temp: 4 } }[o] || {}, [], {})));
    const out = [], houseAff = {}, hn = {};
    collection.forEach((p) => { const h = norm(p.house); (hn[h] = hn[h] || []).push(p.rating || 3); });
    Object.keys(hn).forEach((h) => { const a = hn[h].reduce((x, y) => x + y, 0) / hn[h].length; houseAff[h] = a >= 4 ? 0.5 : a <= 2.5 ? -0.5 : 0; });
    for (let c of catalog) {
      if (owned.has(norm(c.name)) || rejected.has(norm(c.name))) continue;
      if (c.notes && c.notes.length >= 3 && !(c.family && c.weight)) c = derive(c);
      if (settings.gender && root.genderOf) { const g = root.genderOf(c.name, c.house); if ((settings.gender === 'm' && g === 'f') || (settings.gender === 'f' && g === 'm')) continue; }
      if ((c.notes || []).some((n) => avoid.some((a) => a && norm(n).includes(a)))) continue;
      const t = taste(c, prof);
      let gap = 0, gapLabel = null, gapMax = 0;
      for (const { sc, best } of cov) {
        const d = Math.max(0, score(c, sc.c).total - best);
        gap += d / cov.length;
        if (d > gapMax) { gapMax = d; gapLabel = sc.label; }
      }
      const mates = collection.filter((p) => pairScore(c, p, false).s >= 2.5);
      const af = axisFit(c, pref), why = af != null ? axisWhy(c, pref) : [];
      // La notoriété ne fait plus la loi : elle départage à goûts égaux. Une petite variation propre à chaque profil évite que tout le monde reçoive la même liste.
      const jit = seed ? (hash01(seed + '|' + norm(c.name)) - 0.5) * 1.8 : 0;
      // Le moment, le budget et les maisons que la personne aime déjà : un bon conseil est aussi de saison, à son prix, dans ses habitudes.
      const pf = profOf(c), month = settings.month != null ? settings.month : new Date().getMonth(), si = month >= 2 && month <= 4 ? 0 : month >= 5 && month <= 7 ? 1 : month >= 8 && month <= 10 ? 2 : 3;
      const sFit = pf && pf.s && !pf.derived ? (pf.s[si] - 3) * 0.4 : 0;
      const budFit = budget > 0 && c.price > 0 ? (c.price <= budget ? (c.price >= 0.3 * budget ? 0.5 : 0.2) : -2.5) : 0;
      const tierFit = pf && pf.tier === 'S' ? 0.7 : pf && pf.tier === 'A' ? 0.35 : 0;
      const hf = houseAff[norm(c.house)] || 0;
      // La fiche du parfum : occasions que la personne a cochées (bureau, rendez-vous, soirée, été, hiver) et sillage voulu.
      let fv = 0, fwhy = '';
      const OCC_C = { bureau: { ctx: 'pro' }, soiree: { ctx: 'event', moment: 'soir' }, rdv: { ctx: 'date' }, quotidien: { ctx: 'perso' }, ete: { temp: 28 }, hiver: { temp: 4 } };
      for (const o of settings.occ || []) { const cd = OCC_C[o]; if (!cd) continue; const f = ficheFit(c, Object.assign({}, cd, settings.power === 'discret' ? { want: 'discret' } : {}), '', settings); if (f && f.v > fv) { fv = f.v; fwhy = f.why[0] || ''; } }
      if (settings.power === 'discret' || settings.power === 'fort') { const f = ficheFit(c, { want: settings.power === 'discret' ? 'discret' : 'statement' }, '', settings); if (f && f.warn.length) fv -= 1; }
      fv = clamp(fv, -1.5, 2) * 0.6;
      const tA = themeAffBonus(c, THAFF), tO = themeBonus(c, OCCTH, 1.2); fv += tA.v * .8 + tO.v * .5;
      if (!fwhy) fwhy = tA.why || (tO.v >= .4 ? tO.why : '');
      const pvn = provenOf(c);
      const total = t.s + 1.2 * gap + Math.min(3, mates.length) * 0.4 + 0.9 * fameOf(c) + 0.6 * pvn.v + (af != null ? 4.5 * af : 0) + jit + (wishedSet.has(norm(c.name)) ? 0.3 : 0) + sFit + budFit + tierFit + hf + fv;
      out.push({
        c, proven: pvn.n, taste: t.s, hits: t.hits, gap, gapLabel: gapMax >= 1.5 ? gapLabel : null, mates: mates.slice(0, 3),
        total, axisFit: af, axisWhy: why, pitch: (profOf(c) || {}).pitch || '', diff: (profOf(c) || {}).diff || '', pct: matchPct(af, t.s, gapMax, sFit, budget > 0 && c.price > budget, budget > 0 && c.price > 0 && c.price <= budget, hf, wishedSet.has(norm(c.name))), overBudget: budget > 0 && c.price > budget,
        ficheWhy: fv > .4 ? fwhy : '', wished: wishedSet.has(norm(c.name)), inSeason: sFit >= 0.7, inBudget: budget > 0 && c.price > 0 && c.price <= budget, houseLoved: hf > 0.3,
      });
    }
    return calibrate(out, settings, collection);
  }

  const api = { provenOf, themesOf, themesFor, themeBonus, themeAffinity, edOf, ficheFit, userCtx, wishSignals, priorVec, vibeVec, VIBES, POWER, OCCS, deriveProfile, axisPref, axisFit, axisWhy, rankByFit, profOf, AXN, AXL, olfactive, derive, parseNeed, needLabel, matchNeed, searchNeed, VENUES, STOCK_USES, STOCK_LEFT, stockOf, stockEffect, norm, FAMILIES, CONTEXTS, WANTS, WITHS, MOMENTS, MOODS, PLACES, DURS, STYLES, COLORS, FABRICS, SCENARIOS, perfumeTags, score, rank, layering, pairScore, tasteProfile, coverage, recommend, weatherLabel };
  if (typeof module !== 'undefined') module.exports = api;
  else root.Engine = api;
})(typeof window !== 'undefined' ? window : globalThis);
