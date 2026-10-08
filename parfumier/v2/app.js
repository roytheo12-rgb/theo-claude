(function () {
  'use strict';
  const E = window.Engine, CAT = window.CATALOG, Art = window.Art, FX = window.FX;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Un profil = une collection, une wishlist, un journal : chaque personne a le sien (jamais mélangé), même sur un appareil partagé.
  const PROF_KEY = 'sillage.profiles';
  const loadProfiles = () => { try { const p = JSON.parse(localStorage.getItem(PROF_KEY) || 'null'); if (p && Array.isArray(p.list) && p.list.length && p.list.some((x) => x.id === p.active)) return p; } catch (e) { /* stockage indisponible */ } return { active: 'main', list: [{ id: 'main', name: '' }] }; };
  const PROFILES = loadProfiles();
  const saveProfiles = () => { try { localStorage.setItem(PROF_KEY, JSON.stringify(PROFILES)); } catch (e) { /* ok */ } };
  const KEY = PROFILES.active === 'main' ? 'sillage.v3' : 'sillage.v3.' + PROFILES.active;
  const famLabel = (f) => (E.FAMILIES[f] ? E.FAMILIES[f].label : 'Sans famille');
  const FAMS = Object.keys(E.FAMILIES).join('|');

  const IC = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg>',
    bottle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="7" y="10" width="10" height="11" rx="2.5"/><path d="M10 10V7.5h4V10M9.5 3.5h5v4h-5z"/></svg>',
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.8 8.2l-2 5.6-5.6 2 2-5.6z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7"/></svg>',
    spark: '',
    cam: '<svg class="spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 8.5A2.5 2.5 0 015.5 6H8l1.4-2h5.2L16 6h2.5A2.5 2.5 0 0121 8.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5z"/><circle cx="12" cy="13" r="3.6"/></svg>',
  };

  // ---------- Données ----------
  // Photos fournies par Théo (détourées). nz = hauteur du vaporisateur en % pour le nuage de spray.
  const IMG = {
    'Jazz Club': { s: 'img/jazz.webp', nz: 2 }, 'Naxos': { s: 'img/naxos.webp', nz: 1 }, 'Bois Impérial': { s: 'img/bois.webp', nz: 6 }, 'Myrrh & Tonka': { s: 'img/myrrh.webp', nz: 4 }, 'Sydney': { s: 'img/sydney.webp', nz: 7 },
    'Black Afgano': { s: 'img/afgano.webp', nz: 2 }, '724': { s: 'img/mfk724.webp', nz: 7 }, 'The Musc': { s: 'img/musc.webp', nz: 6 }, 'Thé Noir 29': { s: 'img/thenoir.webp', nz: 5 }, 'Ella K': { s: 'img/ellak.webp', nz: 4 },
    'Bianco Latte': { s: 'img/bianco.webp', nz: 8 }, 'Fleur Narcotique': { s: 'img/fleur.webp', nz: 4 }, 'Baccarat Rouge 540': { s: 'img/br540.webp', nz: 7 }, 'Gris Charnel Extrait': { s: 'img/gris.webp', nz: 6 }, 'Orphéon': { s: 'img/orpheon.webp', nz: 8 },
    'Mojave Ghost Absolu': { s: 'img/mojave.webp', nz: 8 }, 'Buongiorno Dolce Far Niente': { s: 'img/buongiorno.webp', nz: 4 }, 'Straight to Heaven': { s: 'img/kilian.webp', nz: 3 }, 'Nasaj': { s: 'img/nasaj.webp', nz: 3 }, 'Néroli Hasbaya': { s: 'img/hasbaya.webp', nz: 6 },
    'Guidance 46': { s: 'img/guidance.webp', nz: 3 }, 'Tuxedo': { s: 'img/tuxedo.webp', nz: 2 }, 'Ambre Russe': { s: 'img/ambrerusse.webp', nz: 1 }, 'Tam Dao Eau de Parfum': { s: 'img/tamdao.webp', nz: 8 }, 'Fève Nectar': { s: 'img/feve.webp', nz: 2 },
    'Musc Ravageur': { s: 'img/muscrav.webp', nz: 10 }, 'Portrait of a Lady': { s: 'img/portrait.webp', nz: 10 }, 'Jasmin Rouge': { s: 'img/jasmin.webp', nz: 3 }, 'Tobacco Vanille': { s: 'img/tobacco.webp', nz: 3 },
    'Stellar Times': { s: 'img/stellar.webp', nz: 36 }, 'Radical Rose': { s: 'img/radical.webp', nz: 3 },
    'Rouge Trafalgar': { s: 'img/trafalgar.webp', nz: 3 }, 'L\'Eau Pâle': { s: 'img/leaupale.webp', nz: 1 }, 'Imagination': { s: 'img/imagination.webp', nz: 4 }, 'Néroli Amara': { s: 'img/neroliamara.webp', nz: 3 }, 'Ombre Nomade': { s: 'img/ombrenomade.webp', nz: 4 },
    'Acne Studios': { s: 'img/acne.webp', nz: 3 }, 'Purpose': { s: 'img/purpose.webp', nz: 3 }, 'Ambre Papier': { s: 'img/ambrepapier.webp', nz: 6 }, 'Ganymede': { s: 'img/ganymede.webp', nz: 3 },
    'Vétiver Extraordinaire': { s: 'img/vetiver.webp', nz: 26 }, 'De Los Santos': { s: 'img/delossantos.webp', nz: 3 }, 'Étoile Filante': { s: 'img/etoile.webp', nz: 3 }, 'Lazy Sunday Morning': { s: 'img/lazy.webp', nz: 2 }, 'Sauvage EDT': { s: 'img/sauvage.webp', nz: 3 },
    'Boss Bottled': { s: 'img/boss.webp', nz: 3 }, 'Bleu de Chanel EDT': { s: 'img/bleu.webp', nz: 3 }, 'Pour un Homme de Caron': { s: 'img/caron.webp', nz: 2 }, 'Terre d\'Hermès': { s: 'img/terre.webp', nz: 3 }, 'Flacon ailé': { s: 'img/ailes.webp', nz: 10 },
    'Aqua Allegoria Rosa Verde': { s: 'img/rosaverde.webp', nz: 8 }, 'Scandal By Night': { s: 'img/scandal.webp', nz: 6 }, 'Paradoxe Intense': { s: 'img/paradoxe.webp', nz: 12 }, 'Miss Dior Essence': { s: 'img/missessence.webp', nz: 10 }, 'La Vie est Belle': { s: 'img/lavie.webp', nz: 12 },
    'Shalimar': { s: 'img/shalimar.webp', nz: 4 }, 'J\'adore': { s: 'img/jadore.webp', nz: 3 }, 'Dior Homme Intense': { s: 'img/dhi.webp', nz: 6 }, 'Stronger With You Intensely': { s: 'img/swyi.webp', nz: 4 }, 'Pure Musc Blanc': { s: 'img/muscblanc.webp', nz: 5 },
    'Libre Le Parfum': { s: 'img/libre.webp', nz: 3 }, 'Le Male': { s: 'img/lemale.webp', nz: 3 }, 'L\'Interdit Rouge': { s: 'img/interdit.webp', nz: 5 }, 'Power of You': { s: 'img/powerofyou.webp', nz: 6 },
  };
  // Photos de la base (images/db, rattachées par maison + nom) : utilisées quand le parfum n'a pas de photo détourée à la main.
  // Les photos du lot « PNG » (IMGNEW) sont les plus récentes : elles passent avant les anciennes photos.
  let IMGNEW_C = null;      // clés des photos ramenées à la maison canonique (« ds durga » et « d s and durga » sont la même maison)
  const imgNew = (p) => { const N = window.IMGNEW || {}, HA = window.HOUSE_ALIAS || {}, h = E.norm(p.house || ''), nm = E.norm(p.name), f = N[h + '|' + nm] || (HA[h] && N[E.norm(HA[h]) + '|' + nm]) || (() => { if (!IMGNEW_C) { IMGNEW_C = {}; for (const k in N) { const i = k.indexOf('|'), kh = k.slice(0, i); IMGNEW_C[E.norm(HA[kh] || kh) + k.slice(i)] = N[k]; } } return IMGNEW_C[E.norm(HA[h] || h) + '|' + nm]; })(); return f ? { s: f, nz: 6 } : null; };
  // Photos retrouvées malgré les variantes de nom (« Gentleman Eau de Parfum Réserve Privée » = « Gentleman Réserve Privée », « XJ 1861 Naxos » = « 1861 Naxos »).
  const IMG_STOP = new Set(['eau', 'de', 'du', 'des', 'la', 'le', 'les', 'l', 'd', 'parfum', 'parfums', 'edp', 'edt', 'xj', 'the', 'pour', 'homme', 'femme', 'intense', 'extrait', 'cologne']);
  const imgLoose = (nm) => E.norm(nm).split(' ').filter((t) => t && !IMG_STOP.has(t)).sort().join(' ');
  let IMGL = null;
  const imgLooseMap = () => { if (IMGL) return IMGL; IMGL = {}; for (const src of [window.IMGDB || {}, window.IMGWEB || {}]) for (const k in src) { const i = k.indexOf('|'), lk = k.slice(0, i) + '|' + imgLoose(k.slice(i + 1)); if (!(lk in IMGL)) IMGL[lk] = src[k]; } return IMGL; };
  const imgOf = (p) => { const nw = imgNew(p); if (nw) return nw; if (IMG[p.name]) { const ch = CAT.find((c) => c.name === p.name), HA = window.HOUSE_ALIAS || {}, cn = (h) => E.norm(HA[E.norm(h)] || h); if (ch && (!p.house || cn(p.house) === cn(ch.house))) return IMG[p.name]; }      // une photo à la main n'est valable que pour la maison de la fiche, pas pour un parfum de même nom ailleurs
    const D = window.IMGDB || {}, W = window.IMGWEB || {}, HA2 = window.HOUSE_ALIAS || {}, h0 = E.norm(p.house || ''), k = h0 + '|' + E.norm(p.name), k2 = E.norm(HA2[h0] || p.house || '') + '|' + E.norm(p.name), f0 = D[k] || W[k] || D[k2] || W[k2]; let f = f0; if (!f) { const L = imgLooseMap(); f = L[h0 + '|' + imgLoose(p.name)] || L[E.norm(HA2[h0] || p.house || '') + '|' + imgLoose(p.name)]; } return f ? { s: f, nz: 6 } : null; };
  const fromCat = (c, rating) => ({ id: uid(), name: c.name, house: c.house, family: c.family, notes: [...c.notes], projection: c.projection, longevity: c.longevity, weight: c.weight, price: c.price, rating: rating || 0, rated: rating ? true : undefined, occ: [], src: (IMG[c.name] || {}).s, nz: (IMG[c.name] || {}).nz, incomplete: !c.notes.length || undefined });
  const seedOwned = () => window.OWNED.map(([n, r, occ, stk]) => Object.assign(fromCat(CAT.find((c) => c.name === n), r), { rated: true, occ: [...occ] }, stk || {}));
  const wishFromName = (n) => { const c = CAT.find((x) => x.name === n); return c ? { name: c.name, house: c.house, family: c.family, notes: [...c.notes], price: c.price } : { name: n, house: '', family: '', notes: [], price: 0 }; };
  const seedWish = () => window.WISH.map(wishFromName);
  const DEMO = /[?&]seed=demo/.test(location.search); // outillage (vidéos, tests) : charge une collection d'exemple
  const DEMO_V = 18;
  const DEF = () => ({ v: 3, seedV: DEMO_V, collection: DEMO ? seedOwned() : [], wishlist: DEMO ? seedWish() : [], walks: [], profile: null, log: [], feedback: [], settings: { budget: 220, liked: [], avoid: [] }, today: null });
  function migrate() {
    // La balade d'exemple (« Rue Saint-Honoré ») s'affichait chez tout le monde : elle est retirée de tous les comptes.
    S.walks = (S.walks || []).filter((x) => !x.seed && x.id !== 'w-honore');
    if ((S.seedV || 1) < DEMO_V) {
      if (DEMO) { const d = DEF(); S.collection = d.collection; S.wishlist = d.wishlist; S.log = []; S.today = null; }
      else {
        // Ménage unique : l'ancienne collection d'exemple (jamais touchée) disparaît. Une collection réelle n'est jamais effacée.
        const oldOwned = new Set(window.OWNED.map((o) => o[0])), oldWish = new Set(window.WISH);
        if (S.collection.length >= 30 && S.collection.every((p) => oldOwned.has(p.name))) { S.collection = []; S.log = []; S.today = null; }
        if ((S.wishlist || []).length >= 20 && S.wishlist.every((w) => oldWish.has(typeof w === 'string' ? w : w.name))) S.wishlist = [];
      }
      S.seedV = DEMO_V;
    }
    S.wishlist = (S.wishlist || []).map((w) => (typeof w === 'string' ? wishFromName(w) : w));
    // Une seule écriture par maison (« Jo Malone London » et « Jo Malone » ne font qu'une)
    const HA = window.HOUSE_ALIAS || {}, canonHouse = (h) => (h && HA[E.norm(h)]) || h;
    // Une note n'est jamais attribuée d'office : tout parfum dont la note n'a pas été choisie par la personne repart à zéro et sera demandé.
    S.collection.forEach((p) => { if (p.rated === undefined) { p.rated = false; p.rating = 0; } else if (p.rated && !(p.rating > 0)) p.rated = false; });
    S.collection.forEach((p) => { p.house = canonHouse(p.house); }); S.wishlist.forEach((w) => { w.house = canonHouse(w.house); });
    S.collection.forEach((p) => { if (!p.src && IMG[p.name]) { p.src = IMG[p.name].s; p.nz = IMG[p.name].nz; } });
    // Stock : les flacons de démo déjà présents reçoivent leur taille et leur usage, sans toucher à ceux que la personne a réglés.
    S.collection.forEach((p) => { if (DEMO && p.size == null && p.use == null) { const o = window.OWNED.find((x) => x[0] === p.name); if (o && o[3]) Object.assign(p, o[3]); } });
  }
  let S;
  try { S = Object.assign(DEF(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = DEF(); }
  S.settings = Object.assign(DEF().settings, S.settings);
  let dbDoc = null, saveT;
  function save() {
    try { S.settings.last = { cat: CHOICE.cat, dress: CHOICE.dress }; } catch (e) { /* CHOICE pas encore prêt */ }
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* stockage indisponible */ }
    clearTimeout(saveT);
    saveT = setTimeout(() => { if (dbDoc) dbDoc.set(JSON.parse(JSON.stringify(S))).catch(() => {}); }, 700);
    const A = window.SillageDemo && window.SillageDemo.account;
    if (A && A.loggedIn() && !PULLING) { clearTimeout(pushT); pushT = setTimeout(() => { A.push(S).then(() => { SYNC = 'ok'; }).catch(() => { SYNC = 'err'; }); }, 1200); }
  }
  let PULLING = false, pushT, SYNC = '';
  async function initStore() {
    try {
      const c = window.claude; if (!c || !c.use) return;
      const [db, user] = await Promise.all([c.use('db'), c.use('user')]);
      if (!db || !user) return;
      const id = await user.id(); if (!id) return;
      if (PROFILES.active !== 'main') return; // la base de claude.ai ne suit que le profil principal
      dbDoc = db.doc('data/users/' + id + '/state');
      const snap = await dbDoc.get();
      if (snap.exists && snap.data() && snap.data().collection && snap.data().v === 3) {
        S = Object.assign(DEF(), JSON.parse(JSON.stringify(snap.data()))); S.settings = Object.assign(DEF().settings, S.settings); migrate(); save();
        try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ok */ }
        if (!$('#story') || $('#story').hidden) render(true);
      } else save();
    } catch (e) { /* on reste en local */ }
  }

  migrate(); save();

  // ---------- Utilitaires métier ----------
  const fbMap = () => { const m = {}; (S.feedback || []).forEach((f) => { if (f.kind === 'day' && f.id) m[f.id] = (m[f.id] || 0) + f.verdict; }); return m; };
  const stx = () => ({ daysSince, liked: S.settings.liked || [], avoid: S.settings.avoid || [], gender: S.profile && S.profile.gender, age: S.profile && S.profile.age, fbMap: fbMap(), fb: S.feedback || [] });
  const find = (id) => S.collection.find((p) => p.id === id);
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const daysSince = (id) => {
    const d = S.log.filter((l) => l.id === id).map((l) => l.date).sort().pop();
    return d ? Math.round((new Date(today() + 'T00:00:00') - new Date(d + 'T00:00:00')) / 864e5) : null;
  };
  const ago = (d) => (d == null ? 'jamais porté' : d === 0 ? 'porté aujourd\'hui' : d === 1 ? 'porté hier' : 'porté il y a ' + d + ' j');
  const tint = (p) => { const P = Art.pal(p); return `hsl(${P.h} ${P.s}% 76% / .75)`; };
  const bt = (p, o) => {
    o = o || {};
    const st = (o.h || o.style) ? `style="${o.h ? 'height:' + o.h + 'px;' : ''}${o.style || ''}"` : '', cx = o.cls ? ' ' + o.cls : '';
    const im = imgNew(p) || (p.src ? { s: p.src, nz: p.nz || 6 } : imgOf(p));
    if (im && !p.img) {
      let mp = '';
      if (o.spray) { for (let k = 0; k < 10; k++) mp += `<i style="width:${3 + (k % 3)}px;height:${3 + (k % 3)}px;--dx:${8 + (k * 7) % 42}px;--dy:${-16 - (k * 9) % 36}px;animation-delay:${(k * 0.22).toFixed(2)}s"></i>`; mp = `<span class="mp" style="top:${im.nz}%">${mp}</span>`; }
      return `<div class="bwrap photo${cx} ${o.still ? '' : 'bob'}" ${st}><img alt="${esc(p.name)}" src="${im.s}">${mp}</div>`;
    }
    if (p.img) return `<div class="bwrap photo${cx} ${o.still ? '' : 'bob'}" ${st}><img alt="${esc(p.name)}" src="/_blob/${esc(p.img)}"></div>`;
    return `<div class="bwrap${cx} ${o.still ? '' : 'bob'}" ${st}>${Art.bottle(p, o)}</div>`;
  };
  const fxCanvas = (attr, d) => `<canvas class="fx" ${attr} data-d="${d || .5}" aria-hidden="true"></canvas>`;
  let RECS = [], ASK = [], ASKI = 0;
  function mountFx(root) {
    $$('canvas.fx[data-p], canvas.fx[data-r]', root).forEach((cv) => {
      { const it = cv.closest('.car-item'); if (it && !it.dataset.fx) return; }
      const p = cv.dataset.p ? find(cv.dataset.p) : (RECS[+cv.dataset.r] || {}).c;
      if (p) FX.attach(cv, p, { dark: false, density: +cv.dataset.d || .5 });
    });
  }
  const todayEntry = (id) => { let e = [...S.log].reverse().find((l) => l.id === id && l.date === today()); if (!e) { e = { id, date: today() }; S.log.push(e); } return e; };
  let AUTOW = '';
  const hasWish = (name) => S.wishlist.some((w) => E.norm(w.name) === E.norm(name));
  const addWish = (o) => { if (!hasWish(o.name)) { S.wishlist.push({ st: o.st || 'smell',  name: o.name, house: o.house || '', family: o.family || '', notes: o.notes || [], price: o.price || 0 }); save(); } };
  const rmWish = (name) => { S.wishlist = S.wishlist.filter((w) => E.norm(w.name) !== E.norm(name)); save(); };
  const wishToOwned = (w) => { const c = CAT.find((x) => E.norm(x.name) === E.norm(w.name)); if (c) return fromCat(c); return { id: uid(), name: w.name, house: w.house, family: w.family || 'boisé', notes: [...(w.notes || [])], projection: 3, longevity: 3, weight: 3, price: w.price || 0, rating: 0, occ: [] }; };
  const buyLinks = (name, house) => { const q = encodeURIComponent(name + ' ' + house); return `<div class="buy"><a class="linkbtn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${q}+parfum+acheter">Où l'acheter</a><a class="linkbtn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${q}+site%3Afragrantica.com">Fragrantica</a></div>`; };
  const wears = (id) => S.log.filter((l) => l.id === id).length;
  const words = (t, base) => String(t || '').split(/\s+/).filter(Boolean).map((w, i) => `<span class="w" style="--i:${i};--d:${base || 0}">${esc(w)}</span>`).join(' ');
  const dots = (n) => '<span class="dots">' + [1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'f' : ''}"></i>`).join('') + '</span>';
  // Ce que dit la fiche éditoriale d'un parfum, en une ligne pour l'IA : force, réserve, public, situations, mood.
  const cutTx = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
  const ficheBits = (c) => { const d = edOf(c); if (!d) return ''; return [(d.forts || [])[0] ? 'force ' + cutTx(d.forts[0], 80) : '', (d.faibles || [])[0] ? 'réserve ' + cutTx(d.faibles[0], 80) : '', d.pour ? 'pour ' + cutTx(String(d.pour).replace(/\(.*?\)/g, ''), 90) : '', (d.sit || []).length ? 'situations ' + d.sit.slice(0, 3).map((x) => cutTx(x, 40)).join(' / ') : '', d.mood ? 'mood ' + cutTx(d.mood, 40) : ''].filter(Boolean).join(' ; '); };
  // Résumé de la personne pour l'IA : goûts déclarés, parfums adorés ou refusés, maisons, habitudes de port, budget, saison, wishlist.
  const VIBE_TX = { frais: 'frais', sucre: 'sucré', sensuel: 'sensuel', elegant: 'élégant', naturel: 'naturel', original: 'original', classique: 'classique' }, POW_TX = { discret: 'discrète', present: 'présente', fort: 'forte' };
  const tasteLine = () => {
    const st = S.settings || {}, col = S.collection || [], bits = [];
    if ((st.liked || []).length) bits.push('Notes que j\'adore : ' + st.liked.join(', ') + '.');
    if ((st.avoid || []).length) bits.push('Notes que je fuis : ' + st.avoid.join(', ') + '.');
    if ((st.vibes || []).length) bits.push('Ambiances que je cherche : ' + st.vibes.map((k) => VIBE_TX[k] || k).join(', ') + '.');
    if (st.power) bits.push('Sillage voulu : ' + (POW_TX[st.power] || st.power) + '.');
    if ((st.occ || []).length) bits.push('Occasions qui comptent : ' + st.occ.join(', ') + '.');
    if (st.budget) bits.push('Budget habituel : ' + st.budget + ' €.');
    const top = col.filter((p) => (p.rating || 3) >= 4).sort((x, y) => (y.rating || 3) - (x.rating || 3)).slice(0, 6), low = col.filter((p) => (p.rating || 3) <= 2).slice(0, 4);
    if (top.length) bits.push('Mes préférés : ' + top.map((p) => `${p.name} (${p.house}, ${p.rating}/5, ${(p.notes || []).slice(0, 4).join(', ')})`).join(' ; ') + '.');
    if (low.length) bits.push('Ceux que j\'aime moins : ' + low.map((p) => `${p.name} (${p.rating}/5, ${(p.notes || []).slice(0, 3).join(', ')})`).join(' ; ') + '.');
    const hs = {}; col.forEach((p) => { (hs[p.house] = hs[p.house] || []).push(p.rating || 3); });
    const liked = Object.keys(hs).filter((h) => hs[h].length >= 2 && hs[h].reduce((x, y) => x + y, 0) / hs[h].length >= 4);
    if (liked.length) bits.push('Maisons que j\'aime : ' + liked.slice(0, 5).join(', ') + '.');
    const cnt = {}; S.log.forEach((l) => { cnt[l.id] = (cnt[l.id] || 0) + 1; });
    const worn = Object.keys(cnt).sort((x, y) => cnt[y] - cnt[x]).slice(0, 3).map((id) => find(id)).filter(Boolean);
    if (worn.length) bits.push('Ceux que je porte le plus : ' + worn.map((p) => p.name).join(', ') + '.');
    const wl = (S.wishlist || []).slice(0, 6).map((w) => w.name).filter(Boolean); if (wl.length) bits.push('Sur ma liste d\'envies : ' + wl.join(', ') + '.');
    { const aff = E.themeAffinity ? E.themeAffinity(col) : null, PL = window.PLAYLISTS || []; if (aff) { const u = Object.keys(aff).filter((k) => aff[k] > 0.3).sort((x, y) => aff[y] - aff[x]).slice(0, 4).map((k) => PL[k] && PL[k].t).filter(Boolean); if (u.length) bits.push('Univers qui me parlent (d\'après ma collection) : ' + u.join(', ') + '.'); } }
    { const fb = (S.feedback || []).slice(-30), no = fb.filter((f) => f.verdict < 0), yes = fb.filter((f) => f.verdict > 0); if (yes.length) bits.push('Conseils qui m\'ont plu : ' + [...new Set(yes.map((f) => f.name))].slice(-5).join(', ') + '.'); if (no.length) bits.push('Conseils qui ne m\'ont pas plu : ' + [...new Set(no.map((f) => f.name + (f.reason ? ' (' + f.reason + ')' : '')))].slice(-5).join(', ') + '.'); }
    { const th = sitThemes(5); if (th.length) bits.push('Les ambiances qui me ressemblent (choisies à l\'inscription) : ' + th.map(({ p }) => p.t).join(', ') + '.'); const sl = (st.sit || []).slice(0, 8).map((i) => SITS[i] && SITS[i][1]).filter(Boolean); if (sl.length) bits.push('Mes situations de vie : ' + sl.join(' ; ') + '.'); }
    if (st.tier === 'luxe') bits.push('Je cherche du haut de gamme et du luxe : ne me propose jamais un parfum bon marché ou de grande distribution.'); else if (st.tier === 'malin') bits.push('Je préfère les prix malins : ne me propose pas de parfum hors de prix, cherche le meilleur rapport qualité prix.');
    const m = new Date().getMonth(); bits.push('Saison : ' + (m >= 2 && m <= 4 ? 'printemps' : m >= 5 && m <= 7 ? 'été' : m >= 8 && m <= 10 ? 'automne' : 'hiver') + '.');
    return bits.join('\n');
  };
  const colLines = () => S.collection.map((p) => `${p.id} | ${p.name} | ${p.house} | ${p.family} | ${(p.notes || []).join(', ')} | proj ${p.projection}/5 | tenue ${p.longevity}/5 | poids ${p.weight}/5 (1 léger, 5 dense) | ma note ${p.rating > 0 ? p.rating + '/5' : 'pas notée'} | ${ago(daysSince(p.id))} | porté ${wears(p.id)} fois | stock : ${E.stockOf(p).ml} ml sur ${E.stockOf(p).size} ml, usage ${E.STOCK_USES[E.stockOf(p).use].toLowerCase()}${ficheBits(p) ? ' | fiche : ' + ficheBits(p) : ''}`).join('\n');

  // ---------- IA (sample) ----------
  let CAN_IMG = false, HAS_ASSETS = false, IMG_MAX = 4;
  async function getSample() { const c = window.claude; return c && c.use ? c.use('sample') : null; }
  async function aiJson(prompt, opts) {
    const sample = await getSample();
    if (!sample) throw { code: 'unavailable' };
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 100000);
    try { return await sample.json(prompt, Object.assign({ cache: false, signal: ctl.signal }, opts || {})); } finally { clearTimeout(to); }
  }
  // Remplit une fiche vide avec les vraies notes (IA). Si l'IA ne connaît pas le parfum, on n'invente rien.
  const FAM_L = () => Object.keys(E.FAMILIES).join('|');
  async function aiFill(p, nm) {
    const j = await aiJson(`Identifie ce parfum${p.house ? ' de la maison "' + p.house + '"' : ''} : "${nm}". Si tu ne le connais pas avec certitude, réponds {"unknown":true} : n'invente jamais de notes. Sinon réponds UNIQUEMENT par un JSON : {"name":"nom officiel","house":"maison","family":"${FAM_L()}","notes":["6 à 10 notes réelles en français, de l'ouverture au fond"],"projection":1-5,"longevity":1-5,"weight":1-5,"price":nombre en euros indicatif}`, { modelTier: 'default' });
    if (!j || j.unknown || !Array.isArray(j.notes) || j.notes.length < 3) throw { code: 'unknown' };
    p.name = String(j.name || nm); p.house = String(j.house || p.house); p.notes = j.notes.map(String).slice(0, 10);
    const d = E.derive({ name: p.name, house: p.house, notes: p.notes });
    p.family = E.FAMILIES[j.family] ? j.family : d.family;
    p.projection = clamp(Math.round(+j.projection || d.projection), 1, 5); p.longevity = clamp(Math.round(+j.longevity || d.longevity), 1, 5); p.weight = clamp(Math.round(+j.weight || d.weight), 1, 5); p.price = Math.round(+j.price) || 0;
    delete p.incomplete; delete p.guessed; delete p._tags; delete p._ol;
  }
  // Dès qu'on ajoute un parfum dont la base n'a pas les notes, on les récupère (une seule tentative par session et par parfum).
  const FILLED = new Set(); let FILLING = false;
  async function autoFill() {
    if (FILLING) return; FILLING = true; let any = false;
    try {
      for (const p of S.collection.filter((x) => x.incomplete && !FILLED.has(x.id)).slice(0, 8)) {
        FILLED.add(p.id);
        try { await aiFill(p, p.name); any = true; save(); } catch (e) { if (e && e.code === 'unavailable') break; }
      }
    } finally { FILLING = false; if (any) render(true); }
  }
  async function initAI() {
    try { const c = window.claude; const a = c && c.use ? await c.use('assets') : null; HAS_ASSETS = !!a; } catch (e) { /* pas d'assets */ }
    try { const s = await getSample(); if (!s) return; const l = await s.limits(); CAN_IMG = !!(l && l.images); IMG_MAX = (l && l.images && l.images.maxCount) || 4; const b = $('#photoBtn'); if (b) b.hidden = !CAN_IMG; } catch (e) { /* pas d'images */ }
    if ($('#story').hidden && $('#sheet').hidden && tab !== 'today') render(true);
    autoFill();
  }

  // ---------- État de session ----------
  let REFINE = false;
  const TESTMODE = DEMO || /[?&]test=1/.test(location.search); // seul usage sans compte : les tests et l'outillage de Théo
  const PRESENT = /[?&]present=1/.test(location.search); // mode présentation : sans bandeau de démo ni carte de vente
  let tab = 'today', WX = null, PHOTO = null, SAY = '';
  const WXS = { canicule: { l: 'Canicule', t: 34 }, chaud: { l: 'Chaud', t: 29 }, doux: { l: 'Doux', t: 20 }, pluie: { l: 'Pluie', t: 13, rain: true }, froid: { l: 'Froid', t: 4 }, neige: { l: 'Neige', t: -1, rain: true } };
  const clockMoment = () => { const h = new Date().getHours(); return h >= 6 && h < 18 ? 'jour' : h >= 18 && h < 22 ? 'soir' : 'nuit'; };
  const CHOICE = { cat: 'travail', sc: null, mood: null, place: null, dur: null, hum: false, dress: null, when: clockMoment(), venue: null, want: null };
  if (S.settings.last && S.settings.last.cat) CHOICE.cat = S.settings.last.cat;
  if (S.settings.last && S.settings.last.dress) CHOICE.dress = S.settings.last.dress;
  const CATS = { travail: 'Travail', amour: 'Romantique', sorties: 'Sorties', famille: 'Famille', mouvement: 'Sport & voyage' };
  // [clé, libellé, réglages]
  const SCEN = {
    travail: [
      ['entretien', 'Entretien d\'embauche', { ctx: 'pro', with: 'boss', moment: 'jour', style: 'costume', mood: 'confiant', place: 'interieur' }],
      ['client', 'Réunion client', { ctx: 'pro', with: 'boss', moment: 'jour', style: 'smart', place: 'interieur' }],
      ['bureau', 'Journée de bureau', { ctx: 'pro', with: 'collegues', moment: 'jour', style: 'smart', place: 'interieur', dur: 'longue' }],
      ['revisions', 'Révisions / examen', { ctx: 'perso', with: 'seul', moment: 'jour', style: 'casual', place: 'interieur', dur: 'longue', mood: 'focus' }],
      ['teletravail', 'Télétravail', { ctx: 'perso', with: 'seul', moment: 'jour', style: 'casual', place: 'interieur', dur: 'longue', mood: 'creatif' }],
      ['presentation', 'Présentation / conférence', { ctx: 'pro', with: 'inconnus', moment: 'jour', style: 'costume', mood: 'confiant' }],
      ['afterwork', 'Afterwork', { ctx: 'amis', with: 'collegues', moment: 'soir', style: 'smart' }],
      ['networking', 'Salon / networking', { ctx: 'pro', with: 'inconnus', moment: 'jour', style: 'smart', place: 'foule', dur: 'longue' }],
      ['cocktail', 'Cocktail d\'entreprise', { ctx: 'event', with: 'collegues', moment: 'soir', style: 'smart', place: 'foule' }],
    ],
    amour: [
      ['premier', 'Premier rendez-vous', { ctx: 'date', with: 'premier', moment: 'soir', style: 'smart', mood: 'confiant' }],
      ['diner2', 'Dîner romantique', { ctx: 'date', with: 'partenaire', moment: 'soir', style: 'soiree', mood: 'romantique' }],
      ['weekend2', 'Week-end à deux', { ctx: 'date', with: 'partenaire', moment: 'jour', style: 'casual', dur: 'longue', mood: 'calme' }],
      ['anniv2', 'Anniversaire de couple', { ctx: 'date', with: 'partenaire', moment: 'soir', style: 'soiree', mood: 'romantique' }],
      ['beauxparents', 'Rencontre avec les beaux-parents', { ctx: 'famille', with: 'famille', moment: 'jour', style: 'smart', mood: 'calme' }],
      ['retrouvailles', 'Retrouvailles', { ctx: 'date', with: 'partenaire', moment: 'soir', style: 'smart', mood: 'joyeux' }],
    ],
    sorties: [
      ['apero', 'Apéro entre amis', { ctx: 'amis', with: 'amis', moment: 'soir', style: 'casual', mood: 'joyeux' }],
      ['brunch', 'Brunch', { ctx: 'amis', with: 'amis', moment: 'jour', style: 'casual', mood: 'joyeux' }],
      ['resto', 'Dîner au restaurant', { ctx: 'amis', with: 'amis', moment: 'soir', style: 'smart' }],
      ['club', 'Boîte de nuit', { ctx: 'event', with: 'amis', moment: 'nuit', style: 'street', place: 'foule', mood: 'energique' }],
      ['concert', 'Concert', { ctx: 'event', with: 'amis', moment: 'soir', style: 'street', place: 'foule' }],
      ['vernissage', 'Vernissage / expo', { ctx: 'event', with: 'inconnus', moment: 'soir', style: 'smart', mood: 'creatif' }],
      ['mariage', 'Mariage (invité)', { ctx: 'event', with: 'inconnus', moment: 'soir', style: 'costume', dur: 'longue' }],
      ['gala', 'Gala / soirée chic', { ctx: 'event', with: 'inconnus', moment: 'nuit', style: 'soiree', mood: 'confiant' }],
      ['cinema', 'Cinéma / théâtre', { ctx: 'perso', with: 'seul', moment: 'soir', style: 'casual', place: 'interieur' }],
    ],
    famille: [
      ['repas', 'Repas de famille', { ctx: 'famille', with: 'famille', moment: 'jour', style: 'casual', mood: 'calme' }],
      ['fetes', 'Fêtes de fin d\'année', { ctx: 'famille', with: 'famille', moment: 'soir', style: 'smart', mood: 'joyeux' }],
      ['enfants', 'Journée avec les enfants', { ctx: 'famille', with: 'famille', moment: 'jour', style: 'casual', place: 'exterieur', dur: 'longue' }],
      ['grandsparents', 'Chez les grands-parents', { ctx: 'famille', with: 'famille', moment: 'jour', style: 'smart', mood: 'calme' }],
    ],
    mouvement: [
      ['match', 'Jour de match', { ctx: 'perso', with: 'amis', moment: 'jour', style: 'sport', mood: 'match', place: 'exterieur' }],
      ['zone', 'Dans la zone (focus)', { ctx: 'perso', with: 'seul', moment: 'jour', style: 'casual', place: 'interieur', dur: 'longue', mood: 'focus' }],
      ['compet', 'Compétition, grand oral', { ctx: 'pro', with: 'inconnus', moment: 'jour', style: 'sport', mood: 'focus' }],
      ['sport', 'Sport / salle', { ctx: 'perso', with: 'seul', moment: 'jour', style: 'sport', mood: 'energique' }],
      ['rando', 'Randonnée', { ctx: 'perso', with: 'seul', moment: 'jour', style: 'casual', place: 'exterieur', dur: 'longue' }],
      ['voyage', 'Journée de voyage', { ctx: 'perso', with: 'seul', moment: 'jour', style: 'casual', place: 'transport', dur: 'longue', mood: 'calme' }],
      ['plage', 'Plage / vacances', { ctx: 'perso', with: 'amis', moment: 'jour', style: 'casual', place: 'exterieur', dur: 'longue', mood: 'joyeux' }],
      ['ville', 'Balade en ville / shopping', { ctx: 'perso', with: 'seul', moment: 'jour', style: 'casual', place: 'exterieur', mood: 'creatif' }],
      ['festival', 'Festival', { ctx: 'amis', with: 'amis', moment: 'jour', style: 'street', place: 'foule', dur: 'longue', mood: 'energique' }],
    ],
  };
  const scenByKey = (k) => { for (const list of Object.values(SCEN)) { const f = list.find((x) => x[0] === k); if (f) return f; } return null; };
  const explicitPreset = () => {
    const sc = CHOICE.sc && scenByKey(CHOICE.sc), o = Object.assign({}, sc ? sc[2] : {});
    if (CHOICE.mood) o.mood = CHOICE.mood;
    if (CHOICE.dress) o.style = CHOICE.dress;
    if (CHOICE.when) o.moment = CHOICE.when;
    if (CHOICE.venue) o.venue = CHOICE.venue;
    if (CHOICE.want) o.want = CHOICE.want;
    if (CHOICE.place) o.place = CHOICE.place;
    if (CHOICE.dur) o.dur = CHOICE.dur;
    if (WX && WX.hum > 75) o.hum = WX.hum;
    if (CHOICE.hum) o.hum = 85;
    return o;
  };
  const SUGG = ['Dîner en terrasse, 24°, chemise en lin', 'Rendez-vous client, costume bleu marine', 'Brunch entre amis, il pleut, pull en maille', 'Vernissage ce soir, perfecto noir', 'Télétravail, jean et t-shirt, grand froid'];

  // ---------- Vues ----------
  function render(keepScroll) {
    $$('#dock button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    $('#dock .ind').style.transform = `translateX(${['today', 'shelf', 'search', 'tips', 'play', 'walk', 'wish'].indexOf(tab) * 100}%)`;
    $('#view').dataset.v = tab;
    ({ today: viewToday, shelf: viewShelf, search: viewSearch, tips: viewTips, play: viewPlay, walk: viewWalk, wish: viewWish })[tab]();
    if (!keepScroll) window.scrollTo(0, 0);
    setTimeout(ensureRatings, 0); pfSchedule();
  }

  const keepText0 = () => { const t = $('#say'); if (t) SAY = t.value; };
  function viewToday() {
    const worn = S.today && S.today.date === today() ? find(S.today.pickId) : null;
    const seen = [], recent = [];
    for (const l of [...S.log].reverse()) { if (!seen.includes(l.id) && find(l.id)) { seen.push(l.id); recent.push(find(l.id)); } if (recent.length >= 8) break; }
    const dt = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const hr = new Date().getHours(), hello = (hr >= 5 && hr < 12 ? 'Bonjour' : hr >= 12 && hr < 18 ? 'Bon après-midi' : 'Bonsoir') + (hasProfile() && S.profile.name ? ', ' + esc(S.profile.name) : '') + '.';
    const je = worn ? todayEntry(worn.id) : null;
    const refine = REFINE || !!(CHOICE.mood || WX || CHOICE.place || CHOICE.dur || CHOICE.hum || PHOTO);
    $('#view').innerHTML = `
      <section class="hero">
        <p class="mono">${esc(dt)}${AUTOW ? ' · ' + esc(AUTOW) : ''}</p>
        ${window.SillageDemo && !PRESENT ? (window.SillageDemo.plan.me() ? `<button class="demo-pill" data-sell>${esc(window.SillageDemo.plan.me().label)} · ${window.SillageDemo.left() > 9999 ? 'conseils IA illimités' : window.SillageDemo.left() + ' conseil' + (window.SillageDemo.left() > 1 ? 's' : '') + ' IA'}</button>` : `<button class="demo-pill" data-sell>Démo · ${window.SillageDemo.left()} essai${window.SillageDemo.left() > 1 ? 's' : ''}</button>`) : ''}
        <h1>${hello}</h1>
        <p class="q">Où te mène ta journée&nbsp;?</p>
        ${S.collection.length ? '' : `<div class="card emptycard"><p class="mono">Première étape</p><h2>Ajoute tes parfums</h2><p>Je choisis toujours dans ta collection. Choisis tes parfums dans la base (par maison, style, notes…), écris-les, ou prends-les en photo.</p><button class="cta full" id="emptyAdd"><span>Ajouter mes parfums</span></button></div>`}
        <div class="say-wrap">
          <p class="mono">Ta journée</p>
          <div class="cats" id="cats">${Object.entries(CATS).map(([k, v]) => `<button class="${CHOICE.cat === k ? 'on' : ''}" data-cat="${k}">${v}</button>`).join('')}</div>
          <div class="chips">${SCEN[CHOICE.cat].map(([k, l]) => `<button class="chip ${CHOICE.sc === k ? 'on' : ''}" data-sc="${k}">${esc(l)}</button>`).join('')}</div>
          <p class="mono">Quand</p>
          <div class="chips" id="whens">${Object.entries(E.MOMENTS).map(([k, v]) => `<button class="chip ${CHOICE.when === k ? 'on' : ''}" data-when="${k}">${esc(v)}</button>`).join('')}</div>
          <p class="mono">Où</p>
          <div class="chips" id="venues">${Object.entries(E.VENUES).map(([k, v]) => `<button class="chip ${CHOICE.venue === k ? 'on' : ''}" data-venue="${k}">${esc(v)}</button>`).join('')}</div>
          <p class="mono">Effet recherché</p>
          <div class="chips" id="wants">${Object.entries(E.WANTS).map(([k, v]) => `<button class="chip ${CHOICE.want === k ? 'on' : ''}" data-want="${k}">${esc(v)}</button>`).join('')}</div>
          <label class="fieldlab" for="say"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4L17 4l3 3L8 19z"/><path d="M14 7l3 3"/></svg>Ou écris-la avec tes mots</label>
          <textarea id="say" rows="2" placeholder="Ex : dîner en terrasse avec des amis, chemise en lin blanche…" aria-label="Ta journée">${esc(SAY)}</textarea>
          <p class="mono">Ta tenue</p>
          <div class="dresses" id="dresses">${DRESS.map(([k, l]) => `<button class="dchip ${CHOICE.dress === k ? 'on' : ''}" data-dress="${k}" aria-pressed="${CHOICE.dress === k}">${dressIcon(k, 26)}<span>${l}</span></button>`).join('')}</div>
          <button class="more" data-refine aria-expanded="${refine}"><span>Affiner : mood, météo, lieu</span><i>${refine ? '−' : '+'}</i></button>
          ${refine ? `<div class="refine">
          <p class="mono">Ton mood</p>
          <div class="chips">${Object.entries(E.MOODS).map(([k, v]) => `<button class="chip ${CHOICE.mood === k ? 'on' : ''}" data-mood="${k}">${esc(v)}</button>`).join('')}</div>
          <p class="mono">Les conditions</p>
          <div class="chips">${wxButtonHtml()}</div>
          <div class="chips">${Object.entries(WXS).map(([k, v]) => `<button class="chip ${WX && WX.k === k ? 'on' : ''}" data-wx="${k}">${v.l}</button>`).join('')}<button class="chip ${CHOICE.hum ? 'on' : ''}" data-hum="1">Humide</button></div>
          <div class="chips">${Object.entries(E.PLACES).map(([k, v]) => `<button class="chip ${CHOICE.place === k ? 'on' : ''}" data-place="${k}">${esc(v)}</button>`).join('')}${Object.entries(E.DURS).map(([k, v]) => `<button class="chip ${CHOICE.dur === k ? 'on' : ''}" data-dur="${k}">${esc(v)}</button>`).join('')}</div>
          <div class="row">
            <button class="chip photo-btn" id="photoBtn" ${CAN_IMG ? '' : 'hidden'}>${PHOTO ? `<img alt="" src="${URL.createObjectURL(PHOTO)}">` : IC.cam}<span>${PHOTO ? 'Tenue ajoutée' : 'Ma tenue en photo'}</span></button>
            <input type="file" id="photoIn" accept="image/*" hidden>
          </div>
          </div>` : ''}
          <button class="cta full" id="go"><span>Trouver mon parfum</span></button>
        </div>
      </section>
      ${worn ? `<section class="sec"><div class="card today-card">${bt(worn, { h: 116 })}<div><p class="mono">porté aujourd'hui</p><h2 style="font-size:24px;margin-top:4px">${esc(worn.name)}</h2><p style="color:var(--muted);font-size:14px">${esc(worn.house)}</p><button class="ghost" id="replay" style="margin-top:10px">Revoir l'histoire</button></div></div></section>
      <section class="sec"><header><h2>Journal olfactif</h2></header><div class="card jr">
        <p class="mono">Compliments</p><div class="chips" id="jc">${['0', '1', '2+'].map((v) => `<button class="chip ${je.compl === v ? 'on' : ''}" data-v="${v}">${v}</button>`).join('')}</div>
        <p class="mono">Tenue sur la peau</p><div class="chips" id="jd">${['moins de 4 h', '4 à 8 h', 'plus de 8 h'].map((v) => `<button class="chip ${je.dur === v ? 'on' : ''}" data-v="${v}">${v}</button>`).join('')}</div>
        <textarea id="jn" rows="2" placeholder="Comment il évolue sur la peau, ce qu'on t'a dit…">${esc(je.note || '')}</textarea></div></section>` : ''}
      <section class="sec"><header><h2>Ta collection</h2><span class="mono">${S.collection.length} flacons</span></header>
        <div class="vit">${S.collection.map((p) => `<button data-open="${p.id}">${fxCanvas(`data-p="${p.id}"`, .45)}${bt(p, {})}<b>${esc(p.name)}</b><small>${esc(p.house)}</small></button>`).join('')}</div></section>
      <section class="sec"><div class="row"><button class="ghost" id="weekBtn">Ma semaine</button><button class="ghost" id="travelBtn">Mode voyage</button></div></section>
      ${sellCard()}
      ${recent.length ? `<section class="sec"><header><h2>Sillage récent</h2></header><div class="strip">${recent.map((p) => `<button class="mini" data-open="${p.id}" style="border:0;background:none;padding:0">${bt(p, { still: true })}<b>${esc(p.name)}</b>${ago(daysSince(p.id)).replace('porté ', '')}</button>`).join('')}</div></section>` : ''}`;
    const ta = $('#say'); ta.addEventListener('input', () => { SAY = ta.value; });
    $('#go').onclick = () => runDay();
    $('#weekBtn').onclick = openWeek; $('#travelBtn').onclick = openTravel;
    if (worn) {
      const pick = (id, key) => $$('#' + id + ' .chip').forEach((c) => (c.onclick = () => { je[key] = je[key] === c.dataset.v ? '' : c.dataset.v; save(); $$('#' + id + ' .chip').forEach((x) => x.classList.toggle('on', je[key] === x.dataset.v)); }));
      pick('jc', 'compl'); pick('jd', 'dur');
      let jt; $('#jn').addEventListener('input', (e) => { je.note = e.target.value; clearTimeout(jt); jt = setTimeout(save, 600); });
    }
    mountFx($('#view'));
    if ($('#photoBtn')) $('#photoBtn').onclick = () => $('#photoIn').click();
    if ($('#photoIn')) $('#photoIn').onchange = (e) => { PHOTO = e.target.files[0] || null; viewToday(); };
    $$('[data-wx]').forEach((b) => (b.onclick = () => { keepText0(); const k = b.dataset.wx; WX = WX && WX.k === k ? null : Object.assign({ k }, WXS[k]); if (WX) AUTOW = ''; viewToday(); }));
    if ($('#wxAuto')) $('#wxAuto').onclick = () => { keepText0(); autoWeather(true); };
    if ($('#wxCity')) $('#wxCity').onclick = () => { keepText0(); openCity(); };
    const keepText = () => { const t = $('#say'); if (t) SAY = t.value; };
    $$('[data-refine]').forEach((b) => (b.onclick = () => { keepText(); REFINE = !refine; if (!REFINE) { CHOICE.mood = null; WX = null; CHOICE.place = null; CHOICE.dur = null; CHOICE.hum = false; PHOTO = null; } viewToday(); }));
    if ($('#emptyAdd')) $('#emptyAdd').onclick = openAdd;
    $$('[data-dress]').forEach((b) => (b.onclick = () => { keepText(); CHOICE.dress = CHOICE.dress === b.dataset.dress ? null : b.dataset.dress; save(); viewToday(); }));
    $$('[data-cat]').forEach((b) => (b.onclick = () => { keepText(); CHOICE.cat = b.dataset.cat; save(); viewToday(); }));
    $$('[data-sc]').forEach((b) => (b.onclick = () => { const k = b.dataset.sc; CHOICE.sc = CHOICE.sc === k ? null : k; SAY = CHOICE.sc ? scenByKey(k)[1] : ''; if (CHOICE.sc && scenByKey(k)[2].moment) CHOICE.when = scenByKey(k)[2].moment; viewToday(); }));
    $$('[data-when]').forEach((b) => (b.onclick = () => { keepText(); CHOICE.when = b.dataset.when; viewToday(); }));
    $$('[data-venue]').forEach((b) => (b.onclick = () => { keepText(); CHOICE.venue = CHOICE.venue === b.dataset.venue ? null : b.dataset.venue; viewToday(); }));
    $$('[data-want]').forEach((b) => (b.onclick = () => { keepText(); CHOICE.want = CHOICE.want === b.dataset.want ? null : b.dataset.want; viewToday(); }));
    $$('[data-mood]').forEach((b) => (b.onclick = () => { keepText(); CHOICE.mood = CHOICE.mood === b.dataset.mood ? null : b.dataset.mood; viewToday(); }));
    $$('[data-place]').forEach((b) => (b.onclick = () => { keepText(); CHOICE.place = CHOICE.place === b.dataset.place ? null : b.dataset.place; viewToday(); }));
    $$('[data-dur]').forEach((b) => (b.onclick = () => { keepText(); CHOICE.dur = CHOICE.dur === b.dataset.dur ? null : b.dataset.dur; viewToday(); }));
    $$('[data-hum]').forEach((b) => (b.onclick = () => { keepText(); CHOICE.hum = !CHOICE.hum; viewToday(); }));
    $$('[data-open]').forEach((b) => (b.onclick = () => openDetail(b.dataset.open)));
    if ($('#replay')) $('#replay').onclick = () => { if (LAST && LAST.pick.id === worn.id) showStory(LAST, true); else { SAY = SAY || ''; runDay(worn); } };
  }

  function viewShelf() {
    const P = S.collection;
    const fam = {}; P.forEach((p) => { fam[p.family] = (fam[p.family] || 0) + 1; });
    const top = Object.entries(fam).sort((a, b) => b[1] - a[1]);
    const prof = E.tasteProfile(P, S.settings);
    const fav = Object.entries(prof.fam).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([f]) => famLabel(f).toLowerCase());
    $('#view').innerHTML = `
      <section class="sec"><header><h2>Ton étagère</h2><span class="mono">${P.length} flacons</span></header>
        ${P.length ? `<div class="card" style="display:grid;gap:12px"><div class="ribbon">${top.map(([f, n]) => `<i title="${esc(famLabel(f))}" style="flex:${n};background:${Art.famColor(f)}"></i>`).join('')}</div>
          <p style="font-size:15px">${fav.length ? `Ton nez penche vers le <b>${esc(fav.join(' et le '))}</b>.` : ''} ${top.slice(0, 4).map(([f, n]) => `<span class="tag">${esc(famLabel(f))} ${n}</span>`).join(' ')}</p></div>` : ''}
      </section>
      ${P.length ? shelfStats(P) : '<section class="sec"><div class="card emptycard"><p style="color:var(--muted)">Ton étagère est vide. Ajoute les parfums que tu possèdes : en vrac, par leur nom, ou en photo.</p></div></section>'}
      <section class="sec"><div class="row"><button class="ghost" id="labBtn">Labo d'accords</button>${HAS_ASSETS ? `<button class="ghost" id="photosBtn">Ajouter mes photos (IA)</button>` : ''}</div></section>
      <section class="sec"><div class="shelf">
        ${P.map((p, i) => `<button class="pcard" data-open="${p.id}" style="--tint:${tint(p)};--i:${i}">${fxCanvas(`data-p="${p.id}"`, .5)}${stockBadge(p)}${bt(p, { level: 0.45 + ((Art.hash(p.name) % 40) / 100) })}<b>${esc(p.name)}</b><span>${esc(p.house)}</span></button>`).join('')}
        <button class="add-tile" id="addBtn"><b>+</b><span>Ajouter mes parfums</span><small class="mono">base, texte ou photo</small></button>
      </div></section>`;
    $$('[data-open]').forEach((b) => (b.onclick = () => openDetail(b.dataset.open)));
    $('#addBtn').onclick = openAdd;
    $('#labBtn').onclick = openLab;
    if ($('#photosBtn')) $('#photosBtn').onclick = openPhotos;
    mountFx($('#view'));
  }
  function shelfStats(P) {
    const value = P.reduce((a, p) => a + (p.price || 0), 0);
    const month = S.log.filter((l) => (new Date(today()) - new Date(l.date)) / 864e5 <= 30).length;
    const most = [...P].sort((a, b) => wears(b.id) - wears(a.id))[0];
    const idle = P.filter((p) => { const d = daysSince(p.id); return d == null || d >= 21; }).slice(0, 8);
    return `<section class="sec"><div class="stats">
      <div class="stat"><b>${value ? '≈ ' + value.toLocaleString('fr-FR') + ' €' : '—'}</b><span>valeur</span></div>
      <div class="stat"><b>${month}</b><span>ports · 30 j</span></div>
      <div class="stat"><b style="font-size:${wears(most.id) ? 17 : 22}px">${wears(most.id) ? esc(most.name) : '—'}</b><span>le plus porté</span></div></div>
      ${idle.length ? `<header style="margin-top:6px"><h2 style="font-size:19px">À ressortir</h2><span class="mono">pas portés depuis 3 sem.</span></header><div class="strip">${idle.map((p) => `<button class="mini" data-open="${p.id}" style="border:0;background:none;padding:0">${bt(p, { still: true })}<b>${esc(p.name)}</b></button>`).join('')}</div>` : ''}</section>`;
  }

  // ---------- Conseils : compléter ta collection, ce qui t'irait, par envie ----------

  // ---------- Stratégies de collection : la collection actuelle, plus 1 à 3 flacons choisis pour combler ses trous ----------
  const PLAN_RX = /compl[eè]t|combler|comble|qui manque|ce qui manque|diversif|agrandi|enrichi|prochain(?:e)? (?:flacon|achat|parfum|achats)|quoi acheter|que (?:m')?acheter|quel parfum acheter|ma collection/i;
  function collectionPlan(maxPrice) {
    const P = S.collection; if (!P.length) return null;
    const st = S.settings, avoid = (st.avoid || []).map(E.norm), owned = new Set(P.map((p) => E.norm(p.name)));
    const gd = (c) => (window.genderOf ? window.genderOf(c.name, c.house) : 'u'), g0 = S.profile && S.profile.gender;
    const budget = maxPrice || st.budget || 0;
    const pool = needPool().filter((c) => !((g0 === 'm' && gd(c) === 'f') || (g0 === 'f' && gd(c) === 'm')) && !owned.has(E.norm(c.name)) && !(c.notes || []).some((n) => avoid.some((a) => a && E.norm(n).includes(a))) && (!budget || (estPrice(c) > 0 && estPrice(c) <= budget)) && !(S.settings.tier && E.tierAdj(c, S.settings.tier, estPrice(c)).drop) && !(c.entry && c.entry.ed));
    const cov = E.coverage(P), pct = (v) => Math.max(0, Math.min(1, (v - 2) / 12));
    const base = cov.map((x) => x.best), avg = (a) => Math.round(100 * a.reduce((t, v) => t + pct(v), 0) / a.length);
    const rows = pool.filter((c) => !E.usHype(c)).map((c) => ({ c, v: cov.map((x) => E.score(c, x.sc.c).total) }));
    const pref = E.axisPref(P), famOwn = new Set(P.map((p) => p.family));
    const fk = (c) => { const w = E.norm(c.name).split(' ').filter((x) => !['le', 'la', 'les', 'l', 'the', 'un', 'une', 'eau', 'de', 'du', 'd'].includes(x)); return E.norm(c.house) + '|' + (w[0] || E.norm(c.name)); };
    // Les icônes des playlists d'inspiration et les grandes maisons d'abord, les marques surtout populaires aux États-Unis en retrait.
    const houseWeight = (c) => 5 * E.provenOf(c).v + (E.nicheTop(c) ? 2.5 : 0) - (E.usHype(c) ? 6 : 0);
    const gain = (r, cur) => r.v.reduce((t, v, i) => t + Math.max(0, pct(v) - pct(cur[i])), 0) * 10;
    const fit = (c) => { const f = pref ? E.axisFit(c, pref) : 0; return f == null ? 0 : f; };
    const STRATS = [
      ['trous', 'Combler les trous', 'Chaque ajout couvre un moment où ta collection est la plus faible.', (r, cur) => gain(r, cur), () => true],
      ['style', 'Rester dans ton style', 'Des parfums dans ta veine, qui complètent ce que tu aimes déjà.', (r, cur) => gain(r, cur) * 0.5 + 12 * fit(r.c), () => true],
      ['explorer', 'Sortir de ta zone', 'Une autre famille, un autre caractère, pour élargir tes choix.', (r, cur) => gain(r, cur) * 0.6 + (famOwn.has(r.c.family) ? -5 : 7) - 8 * fit(r.c), () => true],
      ['petit', 'Petit budget malin', 'Les meilleurs ajouts à moins de ' + Math.min(budget || 120, 120) + ' €.', (r, cur) => gain(r, cur), (r) => r.c.price > 0 && r.c.price <= Math.min(budget || 120, 120)],
    ];
    const usedG = new Set(), out = [];
    for (const [id, label, sub, f, keep] of STRATS) {
      const cur = base.slice(), fams = new Set(), houses = new Set(), items = [];
      for (let k = 0; k < 3; k++) {
        const cand = rows.filter((r) => keep(r) && !fams.has(fk(r.c)) && !houses.has(E.norm(r.c.house)) && !items.some((i) => i.r === r)).map((r) => ({ r, raw: f(r, cur), sc: f(r, cur) + houseWeight(r.c) - (usedG.has(r.c.name) ? 4 : 0) })).filter((x) => x.raw > 0).sort((a, b) => b.sc - a.sc)[0];
        if (!cand) break;
        const r = cand.r, ups = r.v.map((v, i) => ({ i, d: pct(v) - pct(cur[i]) })).filter((o) => o.d > 0.04).sort((a, b) => b.d - a.d).slice(0, 2).map((o) => cov[o.i].sc.label);
        r.v.forEach((v, i) => { cur[i] = Math.max(cur[i], v); });
        fams.add(fk(r.c)); houses.add(E.norm(r.c.house)); usedG.add(r.c.name);
        items.push({ r, c: r.c, ups, fitPct: Math.round(50 + 50 * fit(r.c)) });
      }
      if (items.length) out.push({ id, label, sub, items, before: avg(base), after: avg(cur) });
    }
    return { strategies: out, weak: cov.slice().sort((a, b) => a.best - b.best).slice(0, 2).map((x) => x.sc.label), n: P.length };
  }
  function planHtml(plan, withHead) {
    if (!plan) return '<div class="card emptycard"><p class="mono">Pour commencer</p><h2>Ajoute tes parfums</h2><p>Je construis des stratégies de collection à partir de ce que tu as déjà.</p><button class="cta full" id="planAdd"><span>Ajouter mes parfums</span></button></div>';
    if (!plan.strategies.length) return '<div class="empty">Ta collection couvre déjà bien tous les moments. Élargis le budget ou retire une note fuie pour voir d\'autres pistes.</div>';
    const names = (it) => it.map((i) => esc(i.c.name)).join(' + ');
    return (withHead ? `<p style="font-size:14px;color:var(--muted)">Tes ${plan.n} parfums couvrent moins bien : ${plan.weak.map(esc).join(' et ')}. Voici ce que donnerait ta collection avec quelques ajouts, selon la stratégie.</p>` : '') + planCards(plan).join('');
  }
  function planCards(plan) {
    const names = (it) => it.map((i) => esc(i.c.name)).join(' + ');
    return plan.strategies.map((s) => `<article class="card plan" style="display:grid;gap:10px">
        <div><p class="mono">Stratégie</p><h3 style="margin-top:4px">${esc(s.label)}</h3><p style="color:var(--muted);font-size:14px;margin-top:4px">${esc(s.sub)}</p></div>
        <div class="planbar" role="img" aria-label="Couverture de ta collection : ${s.before} % puis ${s.after} %"><span style="width:${s.before}%"></span><i style="width:${Math.max(0, s.after - s.before)}%"></i></div>
        <p class="mono" style="text-transform:none;letter-spacing:0">Moments couverts : ${s.before} % aujourd'hui, ${s.after} % avec ${s.items.length} ajout${s.items.length > 1 ? 's' : ''}. Ta collection + ${names(s.items)}.</p>
        <div style="display:grid;gap:8px">${s.items.map((i) => `<div class="row" style="justify-content:space-between;gap:10px;align-items:flex-start"><div><button type="button" class="lnk" data-plan-open="${esc(entryKey(i.r.c.entry || { house: i.c.house, name: i.c.name }))}"><b>${esc(i.c.name)}</b></button><small style="display:block;color:var(--muted)">${esc(i.c.house)}${i.c.price ? ' · ≈ ' + i.c.price + ' €' : ''}${i.ups.length ? ' · couvre : ' + i.ups.map(esc).join(', ') : ''}</small></div><button type="button" class="ghost" data-plan-wish="${esc(i.c.name)}">${hasWish(i.c.name) ? 'Dans ma wishlist' : 'Wishlist'}</button></div>`).join('')}</div>
      </article>`);
  }
  function bindPlan(root) {
    const look = {}; dbList().forEach((e) => { look[entryKey(e)] = e; });
    $$('[data-plan-open]', root).forEach((b) => (b.onclick = () => { const e = look[b.dataset.planOpen]; if (e) openEntry(e); }));
    $$('[data-plan-wish]', root).forEach((b) => (b.onclick = () => { const n = b.dataset.planWish; if (hasWish(n)) rmWish(n); else addWish(wishFromName(n)); b.textContent = hasWish(n) ? 'Dans ma wishlist' : 'Wishlist'; save(); }));
    if ($('#planAdd', root)) $('#planAdd', root).onclick = openAdd;
  }
  // Curseur de prix sans plafond : précis en bas, large en haut (jusqu'à 2 000 €), et tout à droite « sans limite ».
  const CAPS = [...Array(26).keys()].map((i) => 50 + i * 10).concat([350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1500, 2000, 0]);
  const capIdx = (b) => { if (!b) return CAPS.length - 1; let k = 0; CAPS.forEach((v, i) => { if (v && v <= b) k = i; }); return k; };
  const capLabel = (v) => (v ? v.toLocaleString('fr-FR') + ' €' : 'sans limite');
  // Prix d'un parfum pour le plafond : son prix indicatif, sinon la médiane de sa maison dans la base (0 si on ne peut rien en dire).
  let HMED = null;
  let ENTP = null;
  function estPrice(c) {
    if (c.price) return c.price;
    if (!ENTP) { ENTP = {}; dbList().forEach((e) => { if (e.price) ENTP[entryKey(e)] = e.price; }); }
    const ep = ENTP[E.norm(c.house + ' ' + c.name)]; if (ep) return ep;
    if (!HMED) { const by = {}; needPool().forEach((x) => { if (x.price) (by[E.norm(x.house)] = by[E.norm(x.house)] || []).push(x.price); }); HMED = {}; Object.keys(by).forEach((h) => { const l = by[h].sort((x, y) => x - y); HMED[h] = l[l.length >> 1]; }); }
    return HMED[E.norm(c.house)] || 0;
  }
  const underCap = (c) => { const cap = S.settings.budget || 0, t = S.settings.tier, p = estPrice(c); if (t && E.tierAdj(c, t, p).drop) return false; if (!cap) return true; return p > 0 && p <= cap; };
  function tipsData() {
    const P = S.collection, st = S.settings, cat = needPool(), avoid = (st.avoid || []).map(E.norm), owned = new Set(P.map((p) => E.norm(p.name)));
    const gd = (c) => (window.genderOf ? window.genderOf(c.name, c.house) : 'u'), wrong = (c) => { const g = S.profile && S.profile.gender; return (g === 'm' && gd(c) === 'f') || (g === 'f' && gd(c) === 'm'); };
    const ok = (c) => !wrong(c) && !owned.has(E.norm(c.name)) && !(c.notes || []).some((n) => avoid.some((a) => a && E.norm(n).includes(a))) && underCap(c) && !E.usHype(c);
    const out = { gaps: [], recs: [], tags: [], tips: [] };
    // Pas 15 versions du même parfum : une seule fiche par famille (maison + premier mot du nom : Sauvage, Sauvage Elixir, Sauvage EDT…).
    const famKey = (c) => { const w = E.norm(c.name).split(' ').filter((x) => !['le', 'la', 'les', 'l', 'the', 'un', 'une', 'eau', 'de', 'du', 'd'].includes(x)); return E.norm(c.house) + '|' + (w[0] || E.norm(c.name)); };
    const fams = new Set(), ownedFam = new Set(P.map(famKey)), fresh = (c) => { const k = famKey(c); if (fams.has(k) || ownedFam.has(k)) return false; fams.add(k); return true; };
    if (P.length) {
      const cov = E.coverage(P).sort((x, y) => x.best - y.best), used = new Set();
      for (const { sc, best, bestP } of cov) {
        if (out.gaps.length >= 3) break;
        const cand = cat.filter((c) => ok(c) && !used.has(c.name)).map((c) => ({ c, v: E.score(c, sc.c).total })).sort((x, y) => y.v - x.v)[0];
        if (!cand || cand.v - best < 1) continue;
        if (!fresh(cand.c)) { used.add(cand.c.name); continue; }
        used.add(cand.c.name); out.gaps.push({ sc, bestP, c: cand.c });
      }
    }
    const seed = PROFILES.active + '|' + ((S.profile && S.profile.name) || '') + '|' + ((S.profile && S.profile.age) || '');
    // Les photos d'abord (classement stable : à goûts égaux, la fiche illustrée passe devant), puis le score propre à ce profil.
    const hasImg = (c) => (imgOf(c) ? 1 : 0);
    const all = E.recommend(cat, P, S.wishlist, Object.assign({}, st, { gender: S.profile && S.profile.gender, age: S.profile && S.profile.age, seed, fb: S.feedback || [], looseColl: true, prestige: true })).sort((x, y) => (y.total + .4 * hasImg(y.c)) - (x.total + .4 * hasImg(x.c)));
    const byHouse = {};
    out.recs = all.filter((r) => underCap(r.c) && fresh(r.c)).filter((r) => { const h = E.norm(r.c.house); byHouse[h] = (byHouse[h] || 0) + 1; return byHouse[h] <= 2; }).slice(0, 14);
    const tg = window.tagsOf || (() => []);
    // « Par envie » : jamais un parfum déjà montré plus haut, ni une autre version du même parfum.
    [['niche', 'Un niche pour toi'], ['abordable', 'Un abordable qui te va'], ['luxe', 'Un coup de luxe'], ['prive', 'Une collection privée']].forEach(([t, label]) => { const r = all.find((x) => underCap(x.c) && tg(x.c.name, x.c.house, x.c.price, '').includes(t) && !out.recs.some((y) => y.c === x.c) && fresh(x.c)); if (r) out.tags.push({ label, r }); });
    if (P.length >= 3) {
      const fam = {}; P.forEach((p) => { fam[p.family] = (fam[p.family] || 0) + 1; });
      const top = Object.entries(fam).sort((x, y) => y[1] - x[1])[0];
      if (P.length >= 5 && top[1] / P.length >= 0.4) out.tips.push(`Tu as surtout du ${famLabel(top[0]).toLowerCase()} (${top[1]} sur ${P.length}). Un parfum d'une autre famille te donnerait plus de choix.`);
      if (!P.some((p) => ['agrumes', 'aquatique', 'aromatique', 'vert'].includes(p.family))) out.tips.push('Rien de vraiment frais dans ta collection : un agrume ou un aquatique sauverait les grosses chaleurs.');
      if (P.every((p) => (p.weight || 3) <= 3)) out.tips.push('Rien d\'enveloppant pour l\'hiver : un ambré, un gourmand ou un oud ferait du bien.');
      if (P.every((p) => (p.projection || 3) >= 4)) out.tips.push('Que des parfums puissants : prends-en un discret pour le bureau et les ascenseurs.');
      const old = P.map((p) => ({ p, d: daysSince(p.id) })).filter((x) => x.d != null && x.d >= 30).sort((x, y) => y.d - x.d)[0];
      if (old) out.tips.push(`${old.p.name} dort depuis ${old.d} jours : ressors-le avant d'en racheter un autre.`);
      if (P.filter((p) => E.stockOf(p).ml <= 10).length >= 2) out.tips.push('Tu as plusieurs échantillons : si l\'un d\'eux te plaît vraiment, pense au flacon complet.');
    }
    out.tips = out.tips.slice(0, 4); out.tips.push('Avant d\'acheter à l\'aveugle, teste sur ta peau 20 à 30 minutes : un parfum change beaucoup entre la mouillette et la peau.');
    return out;
  }
  function tipCard(c, lead, body, extra) {
    return `<article class="card tipc"><div class="tiph">${bt(c, { still: true, h: 72 })}<div><p class="mono">${esc(lead)}</p><b>${esc(c.name)}</b><small>${esc(c.house)}${c.family ? ' · ' + esc(famLabel(c.family)) : ''}${c.price ? ' · ≈ ' + c.price + ' €' : ''}</small></div></div><p class="rd">${body}</p>${extra || ''}<div class="row"><button class="ghost" data-rw="${esc(c.name)}">${hasWish(c.name) ? 'Dans ma wishlist' : 'À sentir'}</button><button class="ghost" data-own="${esc(c.name)}">Je l'ai</button></div></article>`;
  }
  // ---------- Carte du moment : les cartes de conseils défilent au hasard, une seule à la fois, sur chaque page ----------
  let TT = null; const TT_MS = 14000;
  function ttNext() {
    if (!TT || TT.i >= TT.a.length - 1) {
      const a = (window.TIPS || []).slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      let last = TT ? TT.a[TT.a.length - 1].id : null; if (last == null) { try { last = localStorage.getItem('sillage.tipfirst'); } catch (e) { /* ok */ } }
      if (a.length > 1 && String(a[0].id) === String(last)) { const k = 1 + Math.floor(Math.random() * (a.length - 1)); [a[0], a[k]] = [a[k], a[0]]; }
      TT = { a, i: 0 }; if (a.length) { try { localStorage.setItem('sillage.tipfirst', String(a[0].id)); } catch (e) { /* ok */ } }
    } else TT.i++;
    return TT.a[TT.i];
  }
  const ttInner = (t) => `<p class="mono">${esc((window.TIPS_CATS || {})[t.c] || '')}</p><h3>${esc(t.t)}</h3><p>${esc(t.x)}</p><button class="linkbtn" data-ttn>Une autre</button>`;
  function ttAdvance(el) {
    el.classList.add('out');
    setTimeout(() => { el.innerHTML = ttInner(ttNext()); el.classList.remove('out'); const b = $('[data-ttn]', el); if (b) b.onclick = () => ttAdvance(el); }, 380);
  }
  function ttMount() {
    const v = $('#view'); if (!v || $('#tt', v) || !(window.TIPS || []).length) return;
    if (!TT) ttNext();
    v.insertAdjacentHTML('beforeend', `<section class="sec" id="tt"><div class="card lex tt">${ttInner(TT.a[TT.i])}</div></section>`);
    const el = $('#tt .tt'); $('[data-ttn]', el).onclick = () => ttAdvance(el);
  }
  new MutationObserver(ttMount).observe($('#view'), { childList: true });
  setInterval(() => { const el = $('#tt .tt'); if (el && !document.hidden) ttAdvance(el); }, TT_MS);
  const BESOINS = [['Au bureau', 'pour le bureau'], ['Entretien d\'embauche', 'entretien d\'embauche'], ['Premier rendez-vous', 'premier rendez-vous'], ['Séduire', 'séduire sensuel'], ['Soirée', 'soirée'], ['Boîte de nuit', 'boîte de nuit'], ['Cérémonie', 'mariage cérémonie'], ['Tous les jours', 'tous les jours, discret'], ['Élégance', 'élégant raffiné classe'], ['Frais et propre', 'sentir propre, frais'], ['Grosse chaleur', 'forte chaleur été'], ['Voyage et vacances', 'vacances voyage'], ['Grand froid', 'hiver froid'], ['Gourmand', 'gourmand vanille'], ['Mystérieux', 'mystérieux fumé'], ['Compliments', 'compliments'], ['Signature', 'parfum signature, se démarquer'], ['Luxe et opulence', 'luxe opulent'], ['Sport', 'sport']];
  // ---------- Carrousel : on glisse vers la droite, la carte suivante dépasse toujours un peu ----------
  const carousel = (items, label) => `<div class="car" role="region" aria-roledescription="carrousel" aria-label="${esc(label)}"><div class="car-track" tabindex="0">${items.map((h, i) => `<div class="car-item${i === 0 ? ' on' : ''}" data-ci="${i}" role="group" aria-label="${i + 1} sur ${items.length}">${h}</div>`).join('')}</div>
    <div class="car-bar"><button type="button" class="car-btn" data-cd="-1" aria-label="Précédent" disabled>←</button><span class="car-count"><b>1</b> / ${items.length}</span><span class="car-hint">glisse pour voir la suite</span><button type="button" class="car-btn next" data-cd="1" aria-label="Suivant">→</button></div></div>`;
  function bindCarousel(root) {
    $$('.car', root).forEach((car) => {
      const tr = $('.car-track', car), its = $$('.car-item', car), cnt = $('.car-count b', car), hint = $('.car-hint', car); let raf = 0;
      const cur = () => { const c = tr.scrollLeft + tr.clientWidth / 2; let bi = 0, bd = 1e9; its.forEach((el, i) => { const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - c); if (d < bd) { bd = d; bi = i; } }); return bi; };
      const go = (i) => { i = Math.max(0, Math.min(its.length - 1, i)); tr.scrollTo({ left: its[i].offsetLeft - (tr.clientWidth - its[i].offsetWidth) / 2, behavior: 'smooth' }); };
      const upd = () => {
        const i = cur(); its.forEach((el, k) => { el.classList.toggle('on', k === i); if (Math.abs(k - i) <= 1 && !el.dataset.fx) { el.dataset.fx = '1'; mountFx(el); } });
        cnt.textContent = i + 1; $$('[data-cd]', car).forEach((b) => { b.disabled = (+b.dataset.cd < 0 && i === 0) || (+b.dataset.cd > 0 && i === its.length - 1); });
        car.classList.toggle('end', i === its.length - 1); if (i > 0 && hint) car.classList.add('moved');
      };
      tr.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(upd); }, { passive: true });
      tr.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(cur() + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur() - 1); } });
      $$('[data-cd]', car).forEach((b) => (b.onclick = () => go(cur() + +b.dataset.cd)));
      upd();
    });
  }
  // ---------- Pour toi : prix, parfumier privé (chat), trois conseils pour toi, un besoin à la fois, le reste replié ----------
  const CHAT = { msgs: [], busy: false };
  // Cadeau : la personne à qui l'on offre n'est pas celle qui écrit, ses goûts à elle ne comptent pas.
  const GIFT_WHO = [[/\b(ma|ta|sa) (mere|maman|mama|grand mere|mamie|belle mere)\b/, 'f', 58], [/\b(mon|ton|son) (pere|papa|grand pere|papi|beau pere)\b/, 'm', 58], [/\b(ma|ta|sa) (copine|compagne|femme|fiancee|amoureuse|petite amie|epouse)\b/, 'f', 30], [/\b(mon|ton|son) (copain|compagnon|mari|fiance|homme|petit ami|epoux)\b/, 'm', 32], [/\b(ma|ta|sa) (soeur|fille|cousine|meilleure amie|amie|collegue|patronne|prof)\b/, 'f', 30], [/\b(mon|ton|son) (frere|fils|cousin|meilleur ami|ami|collegue|patron|prof)\b/, 'm', 30]];
  function giftScan(q) {
    const qn = E.norm(q); if (/pour moi( meme)?\b|c est pour moi|finalement pour moi/.test(qn)) { CHAT.gift = null; return; }
    if (!/offr|cadeau|pour (ma|mon|ta|ton)\b|a (ma|mon)\b/.test(qn)) return;
    for (const [rx, g, age] of GIFT_WHO) { const m = qn.match(rx); if (m) { CHAT.gift = { who: m[0], g, age }; return; } }
  }
  const tasteFor = () => (CHAT.gift ? `C'est un cadeau pour ${CHAT.gift.who}, ${CHAT.gift.g === 'f' ? 'une femme' : 'un homme'} d'environ ${CHAT.gift.age} ans. Ce n'est PAS pour moi : ne tiens aucun compte de mes goûts, de mes notes aimées ou fuies, ni de ma collection. Appuie-toi sur ce que j'ai dit d'elle ou de lui et sur les parfums qu'elle ou il aime déjà.` : tasteLine());
  const colFor = () => (CHAT.gift ? '' : colShort());
  const profFor = () => (CHAT.gift ? { gender: CHAT.gift.g, age: CHAT.gift.age } : S.profile ? { gender: S.profile.gender, age: S.profile.age } : null);
  const CHAT_CHIPS = ['Un parfum pour un premier rendez-vous', 'Quelque chose de frais pour le bureau', 'Un niche qui se remarque', 'Moins cher que Baccarat Rouge 540'];
  const BSEL = { i: 0 };
  const chatState = () => {
    if (CHAT.gift) return Object.assign({}, S.settings, { gender: CHAT.gift.g, age: CHAT.gift.age, collection: [], ownedNames: [], fb: [], liked: [], avoid: [], vibes: [], power: '', occ: [], month: new Date().getMonth(), prestige: true });
    const g = S.profile && S.profile.gender, rated = S.collection.filter((p) => (p.rating || 3) >= 4 || (p.rating || 3) <= 2);
    return Object.assign({}, S.settings, { gender: g, age: S.profile && S.profile.age, collection: rated, ownedNames: S.collection.map((p) => p.name), fb: S.feedback || [], month: new Date().getMonth(), prestige: true });
  };
  const chatPool = () => { const owned = new Set((CHAT.gift ? [] : S.collection).map((p) => E.norm(p.name))); return needPool().filter((c) => underCap(c) && !owned.has(E.norm(c.name))); };
  const bubHtml = (m) => m.r === 'u' ? `<div class="cb cu">${esc(m.t)}</div>` : `<div class="crow"><img class="cav" src="${PF_AV}" alt=""><div class="cb ca">${m.t ? `<p>${esc(m.t)}</p>` : ''}${(m.picks || []).map((k) => `<div class="cpk">${k.e ? `<button type="button" class="pc cpc" data-ent="${esc(entryKey(k.e))}">${xThumb(k.e)}<b>${esc(k.name)}</b><small>${esc(k.house)}</small>${k.e.price ? `<em>≈ ${k.e.price} €</em>` : ''}</button>` : `<div class="cpc"><b>${esc(k.name)}</b><small>${esc(k.house)}</small></div>`}<p>${esc(k.line || '')}</p></div>`).join('')}${m.note ? `<p class="cn">${esc(m.note)}</p>` : ''}${m.fb ? fbHtml('chat', m.fb) : ''}</div></div>`;
  function chatGreeting() { const n = S.profile && S.profile.name; return `${n ? 'Salut ' + n + ', ' : 'Salut, '}ravi de te voir. Dis-moi ce que tu cherches ou ce que tu as de prévu, une soirée, un cadeau, un parfum que tu aimes déjà, et je te propose quelques idées.`; }
  function drawChat() {
    const box = $('#cmsgs'); if (!box) return;
    box.innerHTML = `<div class="crow"><img class="cav" src="${PF_AV}" alt=""><div class="cb ca"><p>${esc(chatGreeting())}</p></div></div>` + CHAT.msgs.map(bubHtml).join('') + (CHAT.busy ? `<div class="crow"><img class="cav" src="${PF_AV}" alt=""><div class="cb ca"><span class="typing"><i></i><i></i><i></i></span></div></div>` : '');
    const lk = {}; dbList().forEach((e) => { lk[entryKey(e)] = e; });
    $$('[data-ent]', box).forEach((b) => (b.onclick = () => { const e = lk[b.dataset.ent]; if (e) openEntry(e); }));
    fbBind(box); box.scrollTop = box.scrollHeight; chatChips();
  }
  // Phrases du parfumier quand l'IA n'est pas là : une vraie petite recommandation écrite avec la fiche, les notes, le profil et le prix.
  const hz = (s, n) => { s = String(s || '').replace(/[:;—–]/g, ',').replace(/\s+/g, ' ').replace(/[ ,.]+$/, '').trim(); return (n && s.length > n ? s.slice(0, n).replace(/\s\S*$/, '') : s).replace(/[ ,.;:]+$/, ''); };
  const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const list3 = (a) => (a.length > 1 ? a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1] : a[0] || '');
  const pickH = (arr, seed) => arr[Math.abs([...String(seed)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)) % arr.length];
  function humanLine(r, rank, e, q) {
    const c = r.c, notes = (c.notes || (e && e.notes) || []).map((n) => n.toLowerCase()), why = r.m.why || [], ed = edOf({ name: c.name, house: c.house }) || {}, bits = [], seed = q + c.name;
    bits.push(pickH([
      [`Je commencerais par ${c.name.replace(/\.$/, '')}.`, `Pour toi, je sortirais ${c.name} en premier.`, `${c.name}, sans hésiter.`],
      [`Juste derrière, ${c.name}.`, `Si tu veux changer de ton, ${c.name} fait très bien l'affaire.`, `Ensuite, regarde ${c.name}.`],
      [`Et pour sortir du cadre, essaie ${c.name}.`, `Un pas de côté avec ${c.name}, tu pourrais être surpris.`, `Garde ${c.name} pour le jour où tu veux t'amuser.`],
    ][Math.min(rank, 2)], seed));
    // la pyramide, racontée : tête, cœur, fond
    if (notes.length >= 4) { const t = notes.slice(0, 2), h = notes.slice(2, Math.max(3, notes.length - 1)).slice(0, 2), f = notes[notes.length - 1]; bits.push(pickH([`En tête, ${list3(t)}. Le cœur s'ouvre sur ${list3(h)}, puis ça se pose sur ${f} au bout d'une heure.`, `À l'ouverture, ${list3(t)}. Au cœur, ${list3(h)}. Et dans le fond, ${f} qui reste sur la peau.`, `Sur mouillette, ${list3(t)} d'abord. Sur peau, le cœur tourne vers ${list3(h)} et le fond s'installe sur ${f}.`], seed + 'p')); }
    else if (notes.length >= 2) bits.push(pickH(['On y sent surtout ', 'Le jus joue sur ', 'Au nez, ce sont '], seed) + list3(notes.slice(0, 3)) + '.');
    if (r.m.diff || r.m.pitch) bits.push(cap1(hz(r.m.diff || r.m.pitch, 140)) + '.');
    const hit = why.find((w) => /tu aimes déjà/.test(w)), near = why.find((w) => /proche de/.test(w)), taste = why.find((w) => /dans ton goût/.test(w)), top = why.find((w) => /tout en haut de/.test(w)), uni = why.find((w) => /dans l'univers/.test(w)), fiche = why.find((w) => /colle au contexte/.test(w));
    if (hit) bits.push('Il parle à ce que tu aimes déjà, ' + hz(hit.replace(/tu aimes déjà/, '')) + ', et ça se sent dans l\'accord.');
    else if (near) bits.push(cap1(hz(near)) + ', avec une autre façon de raconter.');
    else if (taste) bits.push('Il est ' + hz(taste) + ', exactement là où tes goûts t\'emmènent.');
    if (top || uni) { const t = (top || uni).match(/« (.+?) »/); if (t) bits.push(pickH([`Imagine l'univers « ${t[1]} ». Le sillage arrive une seconde avant toi, et on se demande qui passe.`, `Il vit dans l'univers « ${t[1]} », celui des gens qui laissent une trace sans rien dire.`, `C'est un habitué de l'univers « ${t[1]} », là où l'on retient un sillage plus qu'un visage.`], seed + 's')); }
    const long = (x) => (x && String(x).length >= 22 ? x : ''), f1 = long((ed.forts || [])[0]), w1 = long((ed.faibles || [])[0]), sit = (ed.sit || [])[0];
    if (f1) bits.push(pickH(['Ce qu\'on lui reconnaît, ', 'Sa signature, ', 'Sa marque de fabrique, '], seed + 'f') + hz(f1.charAt(0).toLowerCase() + f1.slice(1), 110) + '.');
    if (w1) bits.push(pickH(['Un point à savoir, ', 'Petite réserve de parfumier, ', 'Ce qui peut gêner, '], seed + 'w') + hz(w1.charAt(0).toLowerCase() + w1.slice(1), 110) + '.');
    else if (sit && !f1) bits.push('On le sort volontiers ' + hz(sit.charAt(0).toLowerCase() + sit.slice(1), 70) + '.');
    if (!hit && !near && !taste && fiche && !top && !uni) bits.push('Il colle bien à ce que tu me racontes.');
    const p = estPrice(c); if (p) bits.push('Compte environ ' + p + ' € le flacon' + ((S.settings.budget || 0) && p <= S.settings.budget ? ', dans ton plafond' : '') + '.');
    return bits.join(' ');
  }
  // ---------- Le parfumier privé : présent sur toutes les pages, en bas à droite, avec des bulles qui proposent des conseils ----------
  const PF_AV = 'data:image/webp;base64,UklGRkwhAABXRUJQVlA4WAoAAAAQAAAAvwAAvwAAQUxQSJ0HAAABDk/TtimSXGtbhmealVhq7moVaTH9gBLjrKeyajGzZr2mPRKMChaU6QcsysU8FjNMF/NaBQuamTLDLNwzKjMi/F681nXH7X5HRDiQJDVu2CWLEJJz+9ILUBUk3O7AwdjEtXfuXei+9N7K6rHUQbOq9Uvdhb3x2okxOOi0mUEJBvs2zT6y+OOfHDydDo3mYAyLj8xuGuyiIqMGgEzPLb7y137qgHvnFcw8aMzOMxl8Vn99JcxNO0+243+CowDYsnv+raOpxflz9u0ZAQwNKhbxrfndjU34PVwigPH7umtphl7IxhYERoBkWNM43gLaxtt6Bjbt+dZ++07k9hXYxSKyP+7Z5LwEH39tAK5fXrHfVe1LSWBVEVlZvh5Ax7OAI3D5/S/2RXqDmfISEOHQXN5CTPyKrtz3axE515cKgIOIoIk28Cf6yOf2p6I9qQygIvub4EngRIc2qq9KOZzAg2jn8zlRBYNmZ8WDxKDz9O8Ho2oGzdMKk1Q5e9vbqZx3oooGKhLryiaNYOpLg1G1g1jDSDWzD/0x7UEqD0DqUMFkEjHzfREVL6AicaZqf+EGmPvTBqMqPyigBVOpsouXc7LeJJdrxAr5Z97dcE4vpuTPVIWJwd0H0nPiHYJEVGMXJMAzuWWeVTFgKlB2WXeIrXm0sW6DWLpPvZNX5mNVU5fMDj79S+s+M6KlpfoNK9b9pjYlUnHz4Wx+z6FSB3TK9J54Dzgs1algiU42Fdc7Tga1cBp8as06HWRtmYJ94tfZhgiBCiYKZSKXvZ3tb0hBkNgYLvIk75vWqeE3EQtjxDPW6SEjFuZ3WKeIdxREg0/W/R5FBq5DIRMkctH7aeYkUcJFRUwQ8UK2QaKgwogF+O2ifaqMVcLITHhyfbCIppr1yYRH1R+6ObpSGFEiHrBOGzESDe8ayJGW2pWYUfRLVqmTOIJE3NzLnDwiDE02Yx+kPfoMomOGh9Wn3Bx9KUYccsy2FTuGQGHdNtyQiOet0igN4lA6c6TPNBpziMNIG0tWqZQlxGG0tkql1JkMqXSL4fGDVumUZnwjidhnlVJpNhDGpb+THqUGiZe2OM86eMA6rXygpfmHXK/2z9Nqyq+aJLf/ml4/JRaMa/K6I5blHLUWRBFzqjetCr0P0oTB4og73Gpqi+8YFIPvuNXUFqNlBto7D9g2vc0It9nB/ZIpwSINOm77G+5oegczjDt63bYpbq47g9vYbZ1mRjtYsWDbNDdrKJCYt20lzYXRMATTx+luHJ+G6WAu7QnRgMy1VLFoe6juWIQm/DLlDy8ztzb/zfZQ3VErMMuUG0fgUXdWqidlYMlW0l2owI9pfwi44Ce2h+6OeMHEQdqt0WvP0G5n6jv6mRNOvuOztpLyQixSb6FLvXVfkh7lBtH3qLd6RWgfJrpKvTXHqLdG/uMH9E9E/36T/uMW+o8b6T9up/+8if7zVvqvG9B/3Yb+62b0X7ek/7ox+dft6b9vQv99q78D9w3pv29L/31z+tct0L9uhP51O+Svm6J/3Rr96wbpX7dJ/rpZ+tct079u/O/Dun20cQfFu37IHXY04AxepbfJ0tjRg7JM7+AgmmmOXdOj9wHX5BkS8yq1xcqvmgQ51sED1BZDHmhpnjEu/R2thMRLneq87n1CalOlQUSuGR4/2Cd0CHMznhhgA1miVFSWrG4kM4fpFOY6Wh1GiNUh5AiVwhwcHUKep1JUGqvDyLaVPon7HrBuszqUPEWjqPBwCiRm7IOUQIHomOEWhpSbewSKIlgdml+iL6USR3AY3rVO3RDw+i47ZgR5gDpRgdWR+EPaqIIRHcyTWYq03GTCLYwot6dK1uELqwSrI/MFulIqXIAjMRe9T9XeExIuMjy6QfDJmqYacB1aBkUg4g6arqIF90JlQXyGIgbhwhxJxDfpYZBvIjIKo7nsbWoYJDamOAcEE7+mZXsqmLAzFMpPrVGyPQhrwQ50cH1NByG1tjpA4bw5IxkerJdESrw00uGl0f/t6ICXxhtWfN//BNHGeon89C/9ZpCIUh1oY+odnxmkqRGBknlZ19sTQVbpNqU7YIBnUj+nVxEGDMpHIrj7gI9VQSJahlEJtPGZd9OeZ3sgQPgzTllVePGyZ1UqslznexWmmPuTRxtjlYAN5qjCFBEz3/cmqSJxBm1GxRCBh/7oxZSA1KGFiOrBCKa+lFZ+EKtIrGEGyiqYvO1tG1Q7ivUI2WrsgjpP/z7bJ1Q04CDSPK05O5vKJnc+f8gG1YzQ7BzIVjz4yOecoIJR8xEPIgCJE+xP5XyF/gOhIvudiAF4Ely579epLa9KvaCJg5E/weX3v5hFPS05wQoRDs3lTuQVuAPg+uUVybZUXoJVRWRl+XoAHSfyLIgMbNrzrf3Od69XeBfD+c7vj3s2uS/BT5gIYPy+7prz4y+wixEgGdY0jreAtoHHSJwXvWX3/FtH3WO+oKMNZWhQsYhvze9unLc+ge/gjgCQ6bnFV/7az3l7FMyc83YxQ3PeUP7rK2Fu2nmynQQ0gKPCYtPsI4s//snB08NrczCGxUdmN8FCs/GUgAe7MDZx7Z17F7ovvbeyesy1ZlXrl7oLe+O1E2MY7KtMBgBWUDggiBkAAHBpAJ0BKsAAwAA+VSSORSOiIRTKDsQ4BUS0gGxmJB/038SfcD5F/hvyI85fIL7o/gP3J9i3JH2Galny38Cfvv7/7WP6fwl+SP+f6in5d/T/97wF4B/1P+5f9PxLf9z0v+xnsDfzr+w/8r18/53lP/h/+p7CX6P/6P3gfLT9YflH7zvqr/1e4T/Nv7N/yP8P2qP3X9jP9Z0woX3VNAJfgfUJZKGbW6iAy/0e9UsXkii8W+C90XX0maPkaPL7zzhAu2EsLCKqAr6rF9iABj7duiIaOk+L0fwX9N0Vy+R9fKEfxf9p7q8Z6W37xI/OhwwbI6IvWH4S27i0/CKe9iiTZ8CGRQPHQdSP7yWN9LuYyQlwAul6SGMcBR3ai4m9T0ND536pjvc+QANE0m8oW1DNCsAUZwb6LdeDgqRQbPyJlbIkNNClb7ph+3UutDvjwUOo9NmMnnOaHaQB+GcbqYVFzubT05vOGIdJc0EflBKjuK6J46xJIZ1g18WOuOn0hWrsTOq6EywFDsTTrtd3j4TiGGVoNo20KNu9vvWhdnCjtZR1GIMXN1L+4cc5QIY3nlLg6kltfkgiYqQ1QV7HFLh3XuGN2S6bCHohIRpgLAL/Wyn/B9QzVdUEZGsHanBWHtQ8dm0Uwr5VWqgVpUIljmetekrHXnHMvi0vIbXsYnmniNdqJSxYvowOORu4NhwOSfFgsszGhe5LY51LBTq1MMuT6QBQg2DKbKApTP+avP6CTlMP0xSsqYK1dq9NRhWiMzFkmsHV1a0+8sERycKiF8H+x2S8SmNS3OE7ssto8oHfngx8VQ5dX3jjKtT5nLzb/cP+d4h7G3ez2jN7TnP6TPCxYnveWy/miewLqwIHgcaHYN3DWPIq3wY6X238XBe7xSAZD8wN5EaR1Vu7cc/Yk+xLHb/p8TvSAujAAeJ2X5FrYqclmVYQwXojypTeg5q2kjcHUfhg8cDi18TAMCPUvaZIB6NV3CS8/775mhd0Gzs7b1GiuecJL2a7pJgeJ+We+pB9XkXbY9TAhZKjVyCtwWrTHaI4m67CqPPajyLjCcz73Igwr+zqI80+0RqwXzXique41v3s2PKkAyycu1XwpgF98t6IA1rzmlCEl6rLg97C3EDBhEX1gAD+/gbWBvYQ4ZS7Y2rIOCv0vT5jx8yKbwXkJgLtzYTszvls+L3OodXwaq9xijrrddHfm4X8ozOMONssEA5FljdjvOXXYncpjuss2/OUDvvGmL2kCQyDrAGvWQEtbN/xRGXjnXFRiYzSHRh64S3QCW1FJYxem7Lds3VRKoimguSoMDtFSOuUigU07J7HmIgTrRuQOZ2t+kSEkZCZ4v6tfe8N7TC68euqtHvwkFeAjUHDxZc+J2/K9zsROiUIvYHyONsjOgwHPyyt1mr0ygRyos1E/6UXo7q6LCCWFQFRu1lJWCf5oaY0MuNWzESsIVsOHvDYwbOWASdyEaae9qLYS7bhvI5Dr5xGpo7+jQnlZ8WcpVcMMnGQ6yObU6/qwjyJP+XIJhN0YQC8N4HaP+YZn9uo4AOTgPY9E/wDCZ3tW4tg+4f2CAuhdLyFw+KixvN8T4UNXD+/AQTPt3tGJjH3kQBbQyhm9M4sZuCxKGgSGPpF3bK4MvMs8eTOBz2yzbnrtrA4kFQc0hFxYon0WYjeBLU86S+QRLuUrXSnM//YdulnZMecshn4JLDdES96Xw8pGYLaDtjDMPYcbM03AtBhIeHVNknNu39OID0qNl3lzG9TKykHGoFzjuX/vbXIEboHZqIWqx5Dfla2WZV2YR0c1inu7QNGP3WOxMTY/igfstHJ+NoBIZqa71Lj7n9ejdQBgmY19DXhiHEwEvvPNjib28E1U5aqtwB4dIO36GAiwrv5Uxtm4C71HgaNF50xAfB+3STXYvj/t93vrzL8AwIzryjysOeBQnSpcKuJKtaOXrCWJ9f7BD9vBDfsHSlaVp7ZMzZ7acmXTIeYxaMj2hh9XTb/x3uVj8lLDrEB7dyld3kprP1U/KTaiFDMAH7mDgqcfAzIlYUwtu8WT6rLfQsvU96pjjzq264n2+cRdSDn91Xa6GsAsuAJm/5JwN09XcYzR8POd3PsCTrR3Hz0R0Hx8jrVd7aahBpGb3yQaA3NCDWfiTfSxUQ/MVi6olAN4uVCDxuXcy/pehzNctUxINirAiM7KjNFZFX2lIeru/AnEaKV/vkcvPORec1ExVkI5KyTjjmGWL+K1aL4NmktxoXseko9P+9jIA4qRF0R0kpSNpmzVCu6BbZ6/Z3bVvWvDICPpvPb6YS7wS/iStf/pPpNmh+RLEgPH4VYnFH5+5EcaebF74RLEmkDk/KLgSMC7Fn1A+quJ+ZmLQ1P0riisuE1/urMI5g/y/53iu1KV5yZici+biX5wND6uiPMmChtVQHgdXSs4yq3M7gvS1Wmh/U+UaJKgy1JAqDXlAOva+cTxHRbxXl/dsEJ4bGRY80muLtgxG36OLROtURX/ckyTxJ94MMSjkU30GH0Wg2cNRyUBuVNrbITCj5Mtgg920aXp3V4h9EDDU8WaEOfSpfOdhPPWTEvs38udU56R/U/148pWyuVjYd0Q1VYd/DF7B6EHffbA8YaCAlCW9p9G3I/NxlsK4L2RFOAms3rLeQUOKzA/ZV6CIT1jArPG2iLVtUPGwe8D/xzUCqLuEeWyctAy9my2l6HrxDi3vhJZlTVxziCCu0+oItXSkW2eSe9hj7cPYWZEsbVC1XQWl90rB8V09k1mocpRcErTXa/6Z1GacPsUlwyt2uixULEitXr3GhIOXct8DXK9HD0r3jD59NqJ66lGLh520QWJE+57kydp5AOhUBUkUY04WshGVen4bUZu/pdvPM6chubxyMLa9ZAoo10lMRtiwdUpybn7eCT0ld6J7Lhov6XlN6Pcg2kKFyJGitnrWtfEim0/rm/5nd1fr2z/DZ6ilYzVI1A8Xywj9dkrk8kOFgUoZwdT3WuyttkynyazCoH+bePjuj14BHc9OhBEo8QoiCWpcLNglv/pz5lPcZQA4zcu34xKyXkVOIVUPLb7dhf3GeAnS29P1HgQOvf4TXarwYnt6Xc36oFKB5A4FEPHiNoi+GSppS8f3SIY06OVO+Cr+giAwChlazbin2ZixMsCFGf4WSmlzYwDH6mfS6ubsDWTwt7zvQ8tI3Bx4l9S8Np/w4Yk+kHhKkXEyNvtevuqBuq+27fjK1JCC9tx9N1z1UJwEAhxF1yaOcgJKVIRFACBahLqOpkXTaRjTA2F6VWMi4mtRHdJDoMqJg7RFm1n9yrvzRFMUMcWHpHn7Cxnrsxv/AvcAeqaVhlOII3VCM7olqNeZ0FTRrZGMzb36O/wnAeq68cqQ/Ajet0pmgog5GLxvCd85HmbERup5XkTddpmaVbo0TRrwKUB7PoFQ2g1/K9EWxDUM8LYVBHpPAPEWgpylWo93BbI4O69U/6mdsrv5LvXZdRZP+KlQMSpnSLdnUPwEuveKm4EBT8czpRV81l0eLcjpOs+zq64Vki2//T66olC+XRg5fb7y3h+/RGvP8bqsDPZGfAUwr9+9ITddrDUC4WiGj6GR7BkqlRL5CWnh5ErjkBwUg5ZB6XyeKRiJVqeiVuHDD7TL+GxuLEG4bvQRaAtVts3kMR6CQiepjD8NmINSCJuQEYBushQHG4wuP0FtwmDJ7lv9w2Pnwr/ZtD5938t/e/UKMUyphvB611Un5PS+fGMsTXRYJk2YR93UCcBkCh53Ij03qbJdqm4honsqxSX3AhCGEXoGGwAo93clF9aeZ4NadH6f+Fztoa67ZLzAwi6XD1dBbeyCE9jDEE0hDgvxFWqkAprlhMfdbwzl37fX9A6IDkH0YD0G3svQ3F1akJMWqmUIhfDdxsYRA9aBoghnpvBcSWGdPEqzZ7FUGa5Y2Gx3ggQV3ZeytzgQPPd3JLw/zbLOV5uz8AqfaY7lIeJcBjujKZBMYmGZutmjbtqEy0YWr3S70yoF9E8Iz1mknzetaccfBfMu2OYHXdGF0frLQaSHVWYelDDm5vxBnDRxvuFFNSFEmOLbi//EsooCtzTgCK4CzBzTrsB4+1FkQLyKuob2q+p96jGWuPBca8AX5Lc/gTvh76154ZQuipTiqK4puaJWVDlF2nZyrndk3ghUO8c2rXkUX9KigCEsz55bTjynX9IQ4UI7rOY4vd4A2QtWaz07FWj2d+QWn3hqCQJXNvNdiPi+Xm5EfbApV2gfVp1Xys5xnfVcAERQLrwb+lSFQqkw0ZWLq3lyf0n2XlG3EEquxPEbTTnCz78aGjjTcsXQGEDp2VGcTyDeeC4etKduVCz3IfAQf8TSSu8E66OqjZY/CsRIBCRWxHnwnHjydaWJFi/pArvJHdvhlIQAU5xnSrAzCnvBLs3Vba07oYPxDsafB3pg2mP+tT9zfJIJm9uPU30MCrGTOO1EuIYfKzu3UYkrQKPhCWJrw+OHIvK4pvfI2f+1rqj2MXqAIiXOnhnZ4iM2WyxvnryZCuASCFiGx+iEAt1lkD3FSvxt0vjnaoZnMkrqMAOjUCNXjn9Eh5GqQYKX+C2O43ZyBDNPLRsYSEPjvkrsBZkMvaHggiZx0lUlSU8Xl5RlLRkeCBWyvvTNVMBAiEG5dk8+ejV25uTM5f8htffjn+0h2Zx6VEbbeStTuOhTj5H3/F9vfuuSUAvor6ahE03kXzxIYPZmxlIAGf/zMUGqNlU1q6FrDBdIQA8sUfPdZ55AM9f4ZYvsItxT1dZ3kA9Ki1aGXIygWuOeENjqf38cLXhOTTq5uCrA9sZOhzkhPzOM7nbkXEZ2oGK3kmQbvC/wPB5Bwu+1lQ+M5oBv/gO63vD1am16YbdlFAFa2SXtPJ5florB2gQyzsVj2KZNibao//dcY20OPYld9RcyztCjdsFbE4jtkZMYNWX0GGmoQg0GaTI7bGoeTSgrhFFQ/btVr61o1vsXBT1/h24avVM6uZjpnDsCisWSyrlS0XAxKcPASmrF/oR2lB6xiWYc08xSZ9mhLhyu5x6ddhkU5ZWcbghJakgj3c0yWtEn3yLwR9wKuMsrq+Xemi75urG4/KiFLWV08kx7ceDEaLEtJJBLgbv+zowN+HD/fKbYVS0sLvNJ9nDozh7McbD4JdDMMqOQPgPwTNUibLxOHd7tp5yMs01z2wpm4y5h3I+/BS01KJnf0eiSfRuNe132CuIcPWNfze8r/AGVjqBHm6ddRj7Vv7bKq77C8X2/eQ535D3uS7fC5Nvb6OQ593HtvTf71YgXd8qqUihbj3jWhu5kG5IM7mhgpJ6uHfs3eFVEFqZbH6U0ui+5bAV7j4a60+6MX8QDcHAoGM683D7MoSH4JKFHLt5XiPsmFF/q+VJeJoUiP898mQ3Nk7xL8osC7kmkySMEa/OXJ3HfCqPiuez8G70iSaB03SHQhWOCAHvEb+RbUSgc1wEWZEcDlMUPnYZ+2vxIWUDrN/58/v1I1TcMJkHk4hB/QrG5fLQGZwfMVbijQV9c/Xdeyl4/8NVhPEzNo1PpBTxLNCN8OpfgP8sHD4EL6akluBtxnuQ4Dm18am0SvIfo9hMDIdtzyEB+ytuaiuuOfo1sfArlxtSjDSs4HuUwd2orHgaptbllnZOxltxtWoynTbRtU4t6nTpiDZagF529lMOqNL0kyu+qwKQmAQ6oSNZmlfSKiT1dATcmZB5B2J/HZzvEiLvJuGJQ+nd3rKEtPhwECSg6OYMo6vQgp4FVmtpGfMRgxjmh0NoApndkuvLCxj/XVab+tPGvwZapTlEwJUeZC88tGpc3x4/9UhCOaZysILEfK4IsqjwdEaLW3DFq9KtuE1nf3SZRL074PUoPlqg6u8Qby50gv0UTx708VUyXH4mSTb0O1hg99NDMNAah0yxGVzBy1PZW0umw70D5z/pKf4oPPW5n1Y2+bPoU7iEF8HJfs9Wez4T+//6UvO0oNhHDadY72U8yc45aG4DXYrj64xJH/pg8tYwrhn8npz3T+t9TPPJtBKjzQ0vXWbCsDmSeuzTc6AgpTrYKUjzjHIOGM+QIHBbo7fKQksWPz0OKhc9CDWtejQnBKwBljBhtzqREfOjDFZDikukJS+MVuIsYx42ET6NK3+4T6piCxrdLZ7aAltnd7SQFwkP9QvognPmv8c2BQFZ5ydzGEPs8yNK8veYdUtUrGSu9PfhU2EmLY343zQvOfvk/USNNWwDOLHSWzcgA3soV6zN3z8ty4+lYLZX6lPTtqVA4pcbg3G4T/ReTMZ6osB2zu1c8NcW1dENwQ8+4Pw8BVj+fjCgO4EYH6yrlxGQ2DS8tp2o3/nBX9oHC4YxJwAHQZ/jvgfYjgS7wVsrIai5FkUTltszXKUmfS4C+Tq+tJv+9D9r/Kil0vYeXfT07dKjA03eb+WNB1JJ/7vHzzVY+39K5/50wwKP9GeAHIZLbNzoItOciMMUXE5RwGsXUzAIsgBw4Bc1g1Qg/u8Ydxdv9hmgZoroMocxK32503quCCsJAY98l/+9oJUYkMP4byEjFx5vjILkA9o5LeEHPpbJ+Y71u0V/xiJrsVWNjKnCe149a/qmH6nDG6Ux4yf6njrmefXDDiHJeXJaXnqFN7sQ3bVty97OBJgE1VaCIBR5QKwCeQdTeBbZOVqTtQ4POPz1K5/lwV/MPFSVwbcT2uCzHfa9KxYts9l37SgtYyGn3ZyZgvPTXff5YgAzzxf9VAofPDgGalZ7KIA/5jaUp8bxbaMllHnys3QJ3I54EOr0H+dMwszc2g+s/IBFUd8JUImT6q2XG5j0AGrZUy6lWt97uw4ZZ4MKZph9RL38hNlHXMNqd1G9JOamujkTjGgtfNkkHtiH5y2Iv4uDO5oJxIYpUCb8LlkLVI+NfwVlgWQlTZhK3vu2TG92w//LTX4fdr1nNX1MXMTNqsE8yj6f1Qedk7AW+oNCNio42X1yVmet50P/bPzKBEs0zJwIC7B7lcwzcWAaQAdOh5oFO4GEbafWr7b/tJWtnElTfVUWweXhX6udc8VlVkF3/0MtVJgdt3/+ztEuwXYKC1osoVPvBTZ4KIfs4VFQ1QckeSeRLGYmSIQCYz/0Voyr/UtTjtw9Ua1WiZT2cM1BctJSEYfGO8BZ2c/XIxN6/oHQ+m94S5O62O8we1fbk82p8F8FznZxvbJCC6DJV24kMuCSNdG26EL+AN06tcrEhdShz8vfPm0dSFIsaGtR36VCdxcRkO8qJWrJKlVFd3b8DIKoACna9ug7B0mGAoDteSHS6I5vjg5aDnz38T9fkiHDXwoAiji4MjSzoZYqpLA4SvX3/pMCWLuI+yYh5SdR/g0lpkyBE8ywxwexlHbsrsrSFS6p785QL8S8xMfeJt9H5ok4wHZ2ni1A6nRmczZrOAC90dRkob2zsnLb36EBYu9KKoyIsNPzkZgQHnuvq6WD9BB1mCPKfY9P9J7bLzbugxFhQChScEOa6MyIGrXctWEzYjvBOQJrbWMaVEuS1+0MqglaCbo4Gb6HO7veFS0+AaEpIczQEP8Jlv9vAk2aseFyrfzit+Okxq8PloQR5ovN+KPduj8iA/ynkfh/Vb3L9pa3HCijg0tJAe9PDj8X17++qtqU8BXvMPjppww4lJ7LaVb8S+SFKy/cwRNfeDCAVUQcmuMqfwibByZIJE17LHnhh2BUb44rXcvXfT0yYIS2B5AjmXu8Xrb8S66m5Xd2wdgG215oSbT+K28imPx/v9eEeXy08c6HKHT7HpZsnHzqth60nd/b26A3nDQj8sGm7vGjDYNJL3Phbi1HfLNd0pU39a17tVS8H3cUMlROBWi/6UhBrwzcWZPWQg6TgGXDXTOtVtHPKv2oXbhfZph0EXzUNUzQmo9ZGayfAmkJ6vScKq8/z1+usjjm0LTXAKVJkb8r4ZRIg2I9GbUkxbezION6ltHI9GR49SN1KJkpNkILgiC1RrOoFPg+nXdgN+KtntCDXjSaPJV/41/8vtJFY76F+U3K1QjTn2yIQuv1Txi0X3u/C0jVQkWicbDtMjZbSasVnprNdBk+8z1lPlOEQOQYzvgW/lOVzEZeBO3qKoE1YrXe5opQ7NMybypldk3wPFFcrYuZE4OhoAiAUAxj0kXUo0TANvK5UsMwD8xpIdLbPzNzberNy0ccK6empTJygovevX7RgP/5a26xvPmK4oGAxlpCQfSwiBhgOHx64hjB3Dk/ril0TYDSKfEEv7QAr8PtIEVNFhMGvoACS+4WFO2CAUAYclu5J7exkWTxaD/UUYFfFpMmfmxMjzXORQ6KRiKY2WkVhX4HSgQJGNnxTtiDgm8nBUGQvEpQ7g5PXm8cCQCDFSwU86+kvQ+dV++mJ56avKVVkRNjVD4NJD5aMEdybV1qh+66h1+0OFgXICcAKaq0Kg7t3XGGD4eG0yqpBKvSkaCsq8ceu/MheC1qEl06P8Oohh26I9R/XkYuX1MHzNb+m9/Hy+EoYOIkOOz7OZUFgAAUGUc61cYsdhKI2ZepLAw88wuB2MnPHGBfQENwiRq8irCD+PVXEO3+zu5VXRl1LXnuiGuSdMjOdXbTMLeNPjQDMu3TKTxIJ+ux9sV7QsYpUw2XcOW1FUXGIZjRN0k7fO/NV5eiSKPO018Tf/II9xKCb5W37xqU0iOuT9UTAljvrjldNR4CwioemDhKKbpzF1ccUQ4a0MiMkQtwC4gRc+ZmqSOkR/E6pSjqmifNjJQAAAA';
  const PF = { open: false, shown: 0, last: 0, t: 0, hide: 0, kind: 0, scroll: 0 };
  addEventListener('scroll', () => { PF.scroll = Date.now(); }, { passive: true });
  const PF_HINT = {
    today: ['Lequel porter aujourd\'hui ?', 'Une idée pour ta journée ?'],
    shelf: ['Que manque-t-il à ta collection ?', 'Un parfum à ajouter ?'],
    search: ['Tu ne trouves pas ? Décris-moi.', 'Dis-moi une occasion ou une note'],
    tips: ['Je compare deux parfums pour toi ?', 'Ton budget ? Je choisis'],
    play: ['Cette ambiance te parle ?', 'Par où commencer ?'],
    walk: ['Senti en boutique ? Raconte', 'Tu hésites ? Mon avis'],
    wish: ['Lequel acheter en premier ?', 'Je classe ta wishlist ?'],
  };
  const PF_CHIPS = {
    today: ['Lequel porter aujourd\'hui ?', 'Un parfum pour ce soir', 'Quelque chose de discret'],
    shelf: ['Que me manque-t-il ?', 'Un parfum pour l\'hiver', 'Un coup de cœur à ajouter'],
    search: ['Frais pour le bureau', 'Premier rendez-vous', 'Un niche qui se remarque'],
    tips: ['Un parfum pour un premier rendez-vous', 'Quelque chose de frais pour le bureau', 'Un niche qui se remarque'],
    play: ['Trois parfums de cette ambiance', 'Le plus sûr pour commencer'],
    walk: ['Je l\'ai senti, il m\'a plu', 'Aide-moi à choisir'],
    wish: ['Lequel acheter en premier ?', 'Moins cher que Baccarat Rouge 540'],
  };
  function mountParfumier() {
    if ($('#pfab')) return;
    document.body.insertAdjacentHTML('beforeend', `<button id="pfab" class="pfab" type="button" aria-label="Ouvrir ton parfumier privé, en ligne"><img class="pfimg" src="${PF_AV}" alt=""><i class="pfon" aria-hidden="true"></i></button>
      <div id="pbub" class="pbub" role="status" hidden><img class="pbav" src="${PF_AV}" alt=""><button type="button" class="pbgo" id="pbgo"><span id="pbt"></span></button><button type="button" class="pbx" aria-label="Fermer">×</button></div>
      <aside id="ppanel" class="ppanel" role="dialog" aria-label="Ton parfumier privé" hidden><header><span class="avw"><img class="pfimg sm" src="${PF_AV}" alt=""><i class="pfon" aria-hidden="true"></i></span><div><b>Ton parfumier privé</b><small>En ligne</small></div><button type="button" id="ppx" aria-label="Fermer">×</button></header>
        <div id="cmsgs" class="cmsgs" aria-live="polite"></div><div class="chips" id="cchips"></div>
        <form id="cform" class="cform"><input type="text" id="cin" autocomplete="off" placeholder="Écris ton message…" aria-label="Ton message au parfumier privé" maxlength="300"><button class="cta" type="submit" aria-label="Envoyer"><span>→</span></button></form></aside>`);
    $('#pfab').onclick = () => (PF.open ? pfClose() : pfOpen());
    $('#ppx').onclick = pfClose;
    $('.pbx', $('#pbub')).onclick = () => { pfHide(); PF.shown += 1; };
    $('#cform').onsubmit = (e) => { e.preventDefault(); const v = $('#cin').value; $('#cin').value = ''; chatSend(v); };
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && PF.open) pfClose(); });
  }
  function pfChips() {
    const ch = $('#cchips'); if (!ch) return;
    ch.innerHTML = CHAT.msgs.length ? '' : (PF_CHIPS[tab] || CHAT_CHIPS).map((t) => `<button type="button" class="chip" data-q="${esc(t)}">${esc(t)}</button>`).join('');
    $$('[data-q]', ch).forEach((b) => (b.onclick = () => chatSend(b.dataset.q)));
  }
  function pfOpen(msg, said) {
    mountParfumier(); pfHide(); PF.open = true;
    if (said && !CHAT.msgs.some((m) => m.t === said)) CHAT.msgs.push({ r: 'a', t: said });
    $('#ppanel').hidden = false; $('#pfab').classList.add('on');
    drawChat(); pfChips();
    if (msg) chatSend(msg); else if (!matchMedia('(pointer: coarse)').matches) setTimeout(() => $('#cin') && $('#cin').focus(), 50);
  }
  function pfClose() { PF.open = false; const p = $('#ppanel'); if (p) p.hidden = true; const f = $('#pfab'); if (f) f.classList.remove('on'); }
  function pfHide() { clearTimeout(PF.hide); const b = $('#pbub'); if (b) b.hidden = true; }
  // Bulle proactive : un conseil de la page, puis une vraie recommandation tirée du profil. Jamais plus de quatre par visite, jamais quand une feuille est ouverte.
  function pfTick() {
    mountParfumier();
    if (PF.open || document.hidden || !$('#sheet').hidden || !$('#story').hidden || PF.shown >= 4 || Date.now() - PF.last < 20000) return;
    if (Date.now() - PF.scroll < 2500) { PF.t = setTimeout(pfTick, 4000); return; }
    let m = null;
    if (PF.kind % 2 === 1 && (S.collection.length || (S.settings.liked || []).length)) {
      try { const r = tipsData().recs[0]; if (r) m = { t: `${r.c.name} t'irait bien, ${r.pct} % compatible`, q: 'Pourquoi ' + r.c.name + ' pour moi ?' }; } catch (e) { /* on retombe sur le conseil de la page */ }
    }
    if (!m) { const h = PF_HINT[tab] || PF_HINT.tips; m = { t: h[PF.shown % h.length], q: '' }; }
    PF.kind += 1; PF.shown += 1; PF.last = Date.now();
    $('#pbt').innerHTML = '<span class="typing"><i></i><i></i><i></i></span>'; $('#pbub').hidden = false;
    $('#pbgo').onclick = () => pfOpen(m.q || undefined, m.q ? '' : m.t);
    setTimeout(() => { if (!$('#pbub').hidden) $('#pbt').textContent = m.t; }, 1100);
    PF.hide = setTimeout(pfHide, 9500);
  }
  function pfSchedule() { mountParfumier(); clearTimeout(PF.t); pfHide(); PF.t = setTimeout(pfTick, PF.shown ? 9000 : 6500); }
  // ---------- Le parfumier répond à tout : sa collection, un parfum, une comparaison, le vocabulaire du métier ----------
  const PF_KB = [
    [/concentration|eau de parfum|eau de toilette|extrait|\bedp\b|\bedt\b|difference entre.*(parfum|toilette|cologne)/, 'Une histoire de dosage du jus. L\'eau de cologne tourne autour de 3 à 5 % d\'huiles parfumées, l\'eau de toilette autour de 8 %, l\'eau de parfum de 12 à 18 %, l\'extrait au delà de 20 %. Plus le jus est concentré, plus la tenue et le fond s\'installent, mais ce n\'est pas toujours plus fort au départ. Une eau de toilette bien faite peut être lumineuse là où un extrait sera plus dense et plus intime. Si tu hésites, prends l\'eau de parfum, c\'est le bon compromis, et garde l\'extrait pour les soirées ou l\'hiver.'],
    [/tient pas|tenue|disparait|dure pas|s en va|fixer|plus longtemps|longevite/, 'Un parfum qui s\'évapore vite, c\'est presque toujours une affaire de peau et de geste. Hydrate la peau avant (une crème neutre ou une noisette de vaseline), vaporise sur les points de chaleur, les poignets, le creux du cou, derrière les oreilles, et ne frotte jamais les poignets, ça casse la tête. Un peu de jus sur les vêtements tient bien plus longtemps. Et si le parfum file quand même, c\'est que les fonds de bois, d\'ambre ou de musc te conviendront mieux que les agrumes, qui s\'envolent par nature.'],
    [/combien de spray|combien de vaporis|comment (mettre|appliquer|vaporiser|porter)|ou (mettre|vaporiser|appliquer)/, 'Deux à trois sprays pour le quotidien, quatre à cinq pour une soirée ou un parfum doux. Vaporise à une quinzaine de centimètres sur la peau propre et un peu hydratée, au cou, au creux de la poitrine, aux poignets si tu veux. Sur un parfum très concentré, un ou deux sprays suffisent, le sillage fait le reste. En été, on réduit, et on ne vaporise jamais à la dernière minute dans l\'ascenseur.'],
    [/conserv|ranger|stocker|perime|date limite|garder (mes|mon|un)/, 'Un parfum déteste trois choses, la lumière, la chaleur et les écarts de température. Garde le flacon dans sa boîte, dans un tiroir ou un placard, pas dans la salle de bain ni sur le rebord d\'une fenêtre. Bien rangé, un jus tient facilement trois à cinq ans, parfois bien plus pour les fonds boisés ou ambrés. Les agrumes sont les premiers à tourner, le jus fonce et la tête devient aigre, c\'est le signe.'],
    [/notes? de (tete|coeur|fond)|pyramide|sillage|facette|\baccord\b|mouillette|\bjus\b|vocabulaire|ca veut dire|c est quoi (un|une|le|la) (sillage|accord|facette)/, 'Un petit lexique de parfumier. La tête, ce sont les premières notes, légères, qu\'on sent dans les dix premières minutes, agrumes, aromatiques. Le cœur arrive ensuite et dure plusieurs heures, c\'est le visage du parfum, fleurs, épices. Le fond s\'installe et reste sur la peau, bois, ambre, musc, vanille. Le sillage, c\'est la trace qu\'on laisse derrière soi. Un accord, c\'est le mariage de plusieurs matières qui fabriquent une impression nouvelle, comme le cuir ou le chypré. Le jus, c\'est simplement le parfum lui même, et la mouillette ce petit bout de papier pour le sentir, avant de le confirmer sur la peau.'],
    [/peau (seche|grasse|sensible)|transpir|je transpire/, 'La peau change tout. Une peau sèche boit le parfum, il faut l\'hydrater avant et viser des fonds riches, vanille, ambre, bois, pour que le jus s\'accroche. Une peau grasse le garde mieux et le fait chanter plus fort, on peut alléger. Quand on transpire, mieux vaut un jus frais et propre (agrumes, vétiver, musc blanc) qu\'un oriental lourd qui tourne.'],
    [/tester|echantillon|decouverte|samples?|acheter a l aveugle|avant d acheter/, 'Le bon réflexe d\'un parfumier. Sens d\'abord sur mouillette pour écarter ce qui ne te dit rien, puis un seul parfum sur la peau, et vis avec une demi journée. La tête ment toujours un peu, c\'est le cœur à une heure et le fond à quatre heures qui disent la vérité. Les petits formats de découverte et les échantillons en boutique sont faits pour ça, et je préfère cent fois qu\'on teste que qu\'on achète sur un coup de tête.'],
    [/cadeau|offrir|offert pour|anniversaire de/, 'Pour offrir un parfum, je pose toujours les mêmes questions. Pour qui, un homme ou une femme, quel âge, quel budget, et surtout ce qu\'il ou elle porte déjà, parce qu\'on offre rarement un parfum très différent de celui qu\'on aime. Dis-moi par exemple « un cadeau pour ma mère, moins de 120 €, elle aime les fleurs » et je te sors trois idées. Si tu hésites, un parfum frais et propre ou une vanille douce font rarement d\'erreur.'],
    [/tu es (une|un) (ia|robot|humain|vrai|personne)|es tu (une|un) (ia|robot|humain|vrai)|qui es tu|tu es qui|t es qui|t es reel/, 'Je suis l\'assistant virtuel de l\'application, pas une vraie personne. Je me suis construit comme un parfumier de poche, avec toute la base de parfums, les playlists d\'inspiration, tes goûts et ta collection sous les yeux. Je ne vends rien et je dis quand je ne sais pas.'],
    [/que sais tu faire|que peux tu faire|a quoi tu sers|tu peux m aider|comment (ca marche|tu marches|fonctionne)|aide moi|^aide$/, 'Je peux faire plusieurs choses. Te dire ce qui manque à ta collection, te proposer trois parfums pour une occasion ou une humeur, te raconter un parfum en détail, comparer deux flacons, te dire lequel porter aujourd\'hui, classer ta wishlist, ou t\'expliquer le vocabulaire du métier. Pose ta question comme tu la dirais à un vendeur, je comprends les phrases normales.'],
    [/^(bonjour|salut|coucou|hello|bonsoir|hey)\b/, null],
    [/^(merci|super merci|top merci|parfait merci|genial)/, 'Avec plaisir. Et si tu veux creuser un parfum ou en comparer deux, je suis là.'],
    [/(budget|prix max|plafond|trop cher|moins cher)\b.*(regle|changer|modifier|fixer|ou)|comment (regler|changer|fixer) (le )?(budget|prix)/, 'Le curseur « Prix maximum par flacon » est tout en haut de la page Pour toi. Il va de 50 € jusqu\'à 2 000 €, et tout à droite c\'est sans limite. Aucun conseil de l\'application ne dépasse ce prix.'],
  ];
  const nameIn = (qn, e) => { const n = E.norm(e.name); return n.length >= 4 && (' ' + qn + ' ').includes(' ' + n + ' '); };
  function findPerfumes(q) {
    const qn = E.norm(q).replace(/ (eau de parfum|extrait|edp|edt)( |$)/g, ' '), out = [];
    dbList().filter((e) => !e.ed && nameIn(qn, e)).sort((x, y) => E.norm(y.name).length - E.norm(x.name).length).forEach((e) => { if (out.length < 2 && !out.some((o) => E.norm(o.name).includes(E.norm(e.name)) || E.norm(e.name).includes(E.norm(o.name)))) out.push(e); });
    return out;
  }
  function describePerfume(e) {
    const c = { name: e.name, house: e.house, notes: e.notes || [], family: e.family }, ed = edOf(e) || {}, notes = (e.notes || []).map((n) => n.toLowerCase()), bits = [];
    bits.push(`${e.name}, c'est ${e.house}${e.family ? ', dans la famille ' + famLabel(e.family).toLowerCase() : ''}.`);
    if (notes.length >= 4) bits.push(`En tête, ${list3(notes.slice(0, 2))}. Le cœur tourne autour de ${list3(notes.slice(2, Math.max(3, notes.length - 1)).slice(0, 2))}, et ça se pose sur ${notes[notes.length - 1]}.`);
    else if (notes.length) bits.push(`Dans le jus, on retrouve ${list3(notes)}.`);
    else bits.push('Je n\'ai pas de liste de notes vérifiée pour celui-ci, donc je préfère ne pas te la raconter.');
    const pf = E.profOf(c); if (pf && pf.pitch) bits.push(cap1(hz(pf.pitch, 150)) + '.');
    const f1 = (ed.forts || [])[0], w1 = (ed.faibles || [])[0], pour = ed.pour;
    if (f1) bits.push('Ce qu\'on lui reconnaît, ' + hz(f1.charAt(0).toLowerCase() + f1.slice(1), 120) + '.');
    if (w1) bits.push('Petite réserve de parfumier, ' + hz(w1.charAt(0).toLowerCase() + w1.slice(1), 120) + '.');
    if (pour) bits.push('Il va bien à ' + hz(String(pour).replace(/\(.*?\)/g, '').toLowerCase(), 100) + '.');
    const th = E.themesOf(c, 3).map((x) => x.t); if (th.length) bits.push(`On le croise dans les univers « ${th.join(' », « ')} ».`);
    const p = estPrice(c) || e.price; if (p) bits.push(`Compte environ ${p} € le flacon, un prix indicatif à vérifier chez le vendeur.`);
    return bits.join(' ');
  }
  // Alternatives à un parfum : le moteur présélectionne (notes, profil, playlists en commun, preuves), l'IA tranche et raconte.
  async function altAnswer(q, sim, pref) {
    const ref = sim.ref, top = sim.res.slice(0, 3);
    const lkP = (c) => c.entry || dbList().find((x) => E.norm(x.name) === E.norm(c.name) && E.norm(x.house) === E.norm(c.house)) || null;
    const local = pref(`${CHAT.gift ? 'Pour ' + CHAT.gift.who + ', dans' : 'Dans'} la veine de ${ref.name}${sim.cheaper ? ', en moins cher' : ''}, voilà ce que je mettrais sur ${CHAT.gift ? 'sa' : 'ta'} peau.`, { picks: top.map((r) => ({ name: r.c.name, house: r.c.house, e: lkP(r.c), line: `${r.shared ? 'Il partage ' + r.shared + ' note' + (r.shared > 1 ? 's' : '') + ' avec ' + ref.name + '. ' : ''}${r.alt ? 'Les passionnés le citent comme l\'alternative accessible' : r.tc ? 'On le retrouve dans ' + r.tc + ' playlist' + (r.tc > 1 ? 's' : '') + ' avec lui' : 'Même famille, même esprit'}${r.c.price ? ', pour environ ' + r.c.price + ' €' : ''}.` })), note: 'Un conseil de parfumier, ce sont des cousins, pas des jumeaux. Teste sur peau avant de décider.', fb: { name: top[0].c.name, house: top[0].c.house } });
    if (!(window.SillageDemo || window.SillagePrompts)) return local;
    try {
      const rs = sim.res.slice(0, 16).map((r) => ({ c: r.c, m: { pct: Math.round(r.sim * 100), diff: '', why: [r.shared ? 'partage ' + r.shared + ' notes avec ' + ref.name : '', r.tc ? r.tc + ' playlists d\'inspiration en commun avec ' + ref.name : ''].filter(Boolean) } }));
      const refDesc = `${ref.name} (${ref.house}${ref.price ? ', environ ' + ref.price + ' €' : ''}${(ref.notes || []).length ? ', notes ' + ref.notes.slice(0, 7).join(', ') : ''})`;
      const need = `${CHAT.gift ? 'C\'est pour offrir à ' + CHAT.gift.who + '. ' : ''}${/extrait/.test(E.norm(q)) ? 'Elle ou il aime la version extrait : privilégie les extraits ou les jus très concentrés et tenaces. ' : ''}Je veux un parfum dans la veine de ${refDesc}${sim.cheaper ? ', mais moins cher, avec la même qualité de matières et la même tenue, surtout pas un parfum cheap ou un clone bas de gamme' : ''}. Propose les meilleurs équivalents connus des passionnés, y compris hors liste si tu les connais avec certitude. Ma demande : ${q}`;
      const args = { need: need.slice(0, 500), shortlist: shortOf(rs), collection: colFor(), taste: tasteFor(), profile: profFor() };
      const j = window.SillageDemo ? await window.SillageDemo.need(args) : await aiJson(window.SillagePrompts.need(args), { modelTier: 'default' });
      const picks = (j.picks || []).slice(0, 3);
      if (picks.length) return pref(j.compris || `Dans la veine de ${ref.name}, voilà mes choix.`, { picks: picks.map((k) => ({ name: k.name, house: k.house || '', e: dbList().find((x) => E.norm(x.name) === E.norm(k.name) && (!k.house || E.norm(x.house) === E.norm(k.house))) || null, line: [k.pourquoi, k.peau ? 'Après 3 h : ' + k.peau : '', k.attention ? 'Attention : ' + k.attention : ''].filter(Boolean).join(' ') })), note: [j.eviter && j.eviter.name ? 'À éviter pour toi : ' + j.eviter.name + (j.eviter.raison ? ', ' + j.eviter.raison : '') + '.' : '', j.test || 'Ce sont des cousins, pas des jumeaux : teste sur peau avant de décider.'].filter(Boolean).join(' '), fb: { name: picks[0].name, house: picks[0].house } });
    } catch (e) { /* IA indisponible : la sélection calculée */ }
    return local;
  }
  // Quand le parfumier pose une question, il propose aussi des réponses rapides.
  function chatChips() {
    const ch = $('#cchips'); if (!ch) return; const last = CHAT.msgs[CHAT.msgs.length - 1];
    if (last && last.r === 'a' && (last.chips || []).length && !CHAT.busy) { ch.innerHTML = last.chips.map((t) => `<button type="button" class="chip" data-q="${esc(t)}">${esc(t)}</button>`).join(''); $$('[data-q]', ch).forEach((b) => (b.onclick = () => chatSend(b.dataset.q))); }
    else if (CHAT.msgs.length) ch.innerHTML = '';
  }
  const noDash = (t) => String(t || '').replace(/\s*[—–]\s*/g, ', ').replace(/\s+/g, ' ').trim();
  const chatHist = () => CHAT.msgs.slice(-7, -1).map((m) => (m.r === 'u' ? 'Moi : ' : 'Toi : ') + String(m.t || '').slice(0, 260)).join('\n');
  // Le regard de l'IA sur une réponse calculée : plus humain, relié à la conversation, et une question quand il manque une information.
  async function aiPolish(q, ia) {
    if (ia.chips || ia.raw) return;
    try {
      const sample = await getSample(); if (!sample || sample.isLocked) return;
      const base = [ia.t, (ia.picks || []).map((k) => k.name + ' (' + k.house + ')' + (k.line ? ' : ' + k.line : '')).join('\n')].filter(Boolean).join('\n').slice(0, 2600);
      const prompt = `Tu es le parfumier privé d'une application de parfums. ${VOIX_TX} Réponds en français.\n${chatHist() ? 'Conversation récente :\n' + chatHist() + '\n' : ''}Question de la personne : """${q.slice(0, 400)}"""\nFaits vérifiés calculés par l'application (appuie-toi dessus, ne les contredis pas, n'invente ni parfum, ni note, ni prix) :\n"""${base}"""\n${tasteFor() ? 'Ses goûts : ' + tasteFor().slice(0, 700) + '\n' : ''}${colFor() ? 'Sa collection :\n' + colFor().slice(0, 1200) + '\n' : ''}Écris une réponse de 3 à 5 phrases, chaleureuse, précise et reliée à ce qu'elle a dit. Si tu manques d'une information essentielle pour bien la conseiller (occasion, saison, budget, notes aimées ou fuies, pour elle ou pour offrir), pose UNE seule question courte dans "ask" et donne 3 réponses rapides dans "chips" ; sinon laisse "ask" vide. Réponds UNIQUEMENT par un JSON : {"reply":"","ask":"","chips":[""]}`;
      const j = await aiJson(prompt, { modelTier: 'default' });
      if (j && j.reply) { ia.t = noDash(j.reply).slice(0, 1100); if (j.ask) { ia.t += ' ' + noDash(j.ask); ia.chips = (j.chips || []).map((x) => noDash(x).slice(0, 48)).filter(Boolean).slice(0, 4); } }
    } catch (e) { /* on garde la réponse calculée */ }
  }
  // Une demande trop vague : le parfumier pose la bonne question au lieu de deviner.
  function clarifyAsk(q, need) {
    const qn = E.norm(q), words = qn.split(' ').filter(Boolean).length;
    if (words > 7 || !/parfum|conseil|idee|cadeau|offrir|recommande|propose|aide|cherche|envie|quelque chose/.test(qn)) return null;
    if (!need.empty && (need.tags.length || need.fams.length || need.like.length || need.maxPrice)) return null;
    const prev = CHAT.msgs.filter((m) => m.r === 'u').length > 1; if (prev) return null;
    if (/cadeau|offrir/.test(qn)) return { t: 'Avec plaisir. Pour bien viser, c\'est pour qui, et tu veux mettre combien à peu près ?', chips: ['Pour ma compagne, vers 100 €', 'Pour mon père, vers 150 €', 'Pour un ami, moins de 80 €', 'Je veux vraiment me faire plaisir'] };
    return { t: 'Volontiers. Pour que je ne te dise pas n\'importe quoi, c\'est pour quelle occasion, et plutôt quelle ambiance ?', chips: ['Un premier rendez-vous', 'Tous les jours au bureau', 'Une soirée qui compte', 'Quelque chose de doux et réconfortant'] };
  }
  async function pfIntent(q) {
    const qn = E.norm(q), pref = (t, extra) => Object.assign({ t }, extra || {});
    { const cl = clarifyAsk(q, E.parseNeed(q)); if (cl) return pref(cl.t, { chips: cl.chips }); }
    const lkE = (e) => ({ name: e.name, house: e.house, e });
    // ce qui manque à la collection
    if (/manque|trou|completer ma collection|que (dois|devrais) (je )?(acheter|ajouter)|quoi (acheter|ajouter)/.test(qn) && !/pas de manque/.test(qn)) {
      if (!S.collection.length) return pref('Ton étagère est vide pour l\'instant, donc tout lui manque. Ajoute les parfums que tu as déjà, même trois ou quatre, et je te dis ce qui te manque vraiment. Tu peux aussi refaire le voyage depuis la page Pour toi, je m\'en servirai pour te guider.');
      let T = null; try { T = tipsData(); } catch (e) { T = null; }
      const cov = E.coverage(S.collection).sort((x, y) => x.best - y.best), q2 = (x) => '« ' + x.sc.label + ' »', weak = cov.slice(0, 2).map(q2), strong = cov.slice(-2).reverse().map(q2);
      const n = S.collection.length, gaps = T ? T.gaps : [];
      let t = `J'ai regardé ton étagère comme je regarderais celle d'un client. ${n} flacon${n > 1 ? 's' : ''}, et elle tient bien la route côté ${list3(strong)}. Là où elle est la plus fragile, c'est ${list3(weak)}.`;
      if (n < 4) t += ' Avec si peu de parfums, c\'est normal, on construit.';
      const picks = gaps.slice(0, 3).map((g) => ({ name: g.c.name, house: g.c.house, e: dbList().find((x) => E.norm(x.name) === E.norm(g.c.name) && E.norm(x.house) === E.norm(g.c.house)) || null, line: `Pour « ${g.sc.label} », ton meilleur est ${g.bestP.name} et il ne suffit pas. ${cap1(hz(dsc0(g.c), 140))}.` }));
      return pref(t, { picks, note: picks.length ? 'Teste-les sur peau avant d\'acheter, et dis-moi si tu préfères que je cherche dans un autre budget.' : 'Rien de convaincant sous ton plafond de prix pour l\'instant, monte-le un peu et je regarde à nouveau.', fb: picks[0] ? { name: picks[0].name, house: picks[0].house } : undefined });
    }
    // lequel porter
    if (/(lequel|que|quoi) (porter|mettre)|porter aujourd|mettre aujourd|mon parfum du jour|parfum (du jour|pour aujourd)/.test(qn)) {
      if (!S.collection.length) return pref('Je n\'ai encore aucun flacon à te proposer, ton étagère est vide. Ajoute ce que tu as et je te dirai chaque matin lequel porter, selon la météo, ta journée et ce que tu as mis ces derniers jours.');
      const cond = keywordCond(q, null), rk = E.rank(S.collection, cond, stx()).slice(0, 3);
      return pref(`Je te vois bien avec ${rk[0].p.name} aujourd'hui.${rk[1] ? ' Si tu veux changer, ' + rk[1].p.name + ' fait très bien l\'affaire.' : ''} Dis-moi ta journée en une phrase, un rendez-vous, du bureau, une soirée, et j'affine.`, { picks: rk.map((r, i) => ({ name: r.p.name, house: r.p.house, e: dbList().find((x) => E.norm(x.name) === E.norm(r.p.name) && E.norm(x.house) === E.norm(r.p.house)) || null, line: [(r.reasons || [])[0], (r.reasons || [])[1]].filter(Boolean).join('. ') + '.' })), fb: { name: rk[0].p.name, house: rk[0].p.house } });
    }
    // wishlist : par quoi commencer
    if (/(wishlist|liste d envies|mes envies)|(lequel|quoi) (acheter|prendre) en premier/.test(qn)) {
      const w = (S.wishlist || []).filter((x) => x && x.name); if (!w.length) return pref('Ta wishlist est vide pour le moment. Ajoute les parfums qui te font envie, avec le petit bouton Wishlist sur chaque fiche, et je te dirai par lequel commencer.');
      const pool = needPool(), cat = w.map((x) => pool.find((c) => E.norm(c.name) === E.norm(x.name))).filter(Boolean);
      let rec = []; try { rec = cat.length ? E.recommend(cat, S.collection.filter((p) => (p.rating || 3) >= 4 || (p.rating || 3) <= 2), [], Object.assign({}, chatState(), { budget: 0 })).sort((x, y) => y.total - x.total) : []; } catch (e) { rec = []; }
      if (!rec.length) return pref('Voilà ce que tu as mis de côté : ' + w.slice(0, 6).map((x) => x.name).join(', ') + '. Pour que je les classe, il me faut quelques notes sur ta collection, et si possible tes goûts dans le profil.');
      return pref(`Sur ta liste, je commencerais par ${rec[0].c.name}.${rec[1] ? ' Ensuite ' + rec[1].c.name + '.' : ''} Ce sont ceux qui collent le mieux à ce que tu aimes.`, { picks: rec.slice(0, 3).map((r) => ({ name: r.c.name, house: r.c.house, e: dbList().find((x) => E.norm(x.name) === E.norm(r.c.name) && E.norm(x.house) === E.norm(r.c.house)) || null, line: [r.hits && r.hits.length ? 'Il parle à ce que tu aimes déjà, ' + r.hits.slice(0, 2).join(' et ') : '', r.axisWhy && r.axisWhy.length ? 'dans ta veine ' + r.axisWhy[0] : ''].filter(Boolean).join(', ') + '.' })), fb: { name: rec[0].c.name, house: rec[0].c.house } });
    }
    // layering
    if (/layering|superpos|melanger|associer|marier|combiner/.test(qn)) {
      if (S.collection.length < 2) return pref('Le layering, c\'est superposer deux parfums pour fabriquer une signature. Il faut au moins deux flacons dans ta collection pour que je te propose un mariage. Ajoute-en un autre et reviens me voir.');
      const cond = keywordCond(q, null), top = E.rank(S.collection, cond, stx())[0].p, lay = layerObjs(top, cond, 2);
      return pref(`Le layering, c'est l'art de superposer deux parfums pour en faire un troisième. On commence par le plus dense sur la peau, on pose le plus léger par dessus, deux sprays chacun, pas plus. Avec ${top.name}, je te vois bien tenter ${lay.map((l) => l.p.name).join(' ou ')}.`, { picks: lay.map((l) => ({ name: l.p.name, house: l.p.house, e: dbList().find((x) => E.norm(x.name) === E.norm(l.p.name) && E.norm(x.house) === E.norm(l.p.house)) || null, line: [l.effect, l.how].filter(Boolean).join(' ') })), note: 'Le Labo d\'accords de l\'application te laisse tester ces mariages sur tes flacons.' });
    }
    // un parfum trop cher : on cherche des alternatives avant tout le reste
    if (/moins cher|trop cher|a la place|abordable|alternative|equivalent|dupe|plus accessible/.test(qn)) { try { const need = E.parseNeed(q), sim = simSearch(q, need); if (sim && sim.res.length) return await altAnswer(q, sim, pref); } catch (e) { /* on passe à la suite */ } }
    // comparer deux parfums
    const two = findPerfumes(q);
    if (two.length === 2 && /compar|difference|different|versus|\bvs\b|ou|entre|lequel|mieux/.test(qn)) {
      const [a, b] = two, ca = { name: a.name, house: a.house, notes: a.notes || [], family: a.family }, cb = { name: b.name, house: b.house, notes: b.notes || [], family: b.family };
      const pa = E.profOf(ca), pb = E.profOf(cb), ix = (n) => E.AXN.indexOf(n), fr = (p) => (p ? p.p[ix('fraicheur')] : 3), de = (p) => (p ? p.p[ix('densite')] : 3), nt = (e) => list3((e.notes || []).slice(0, 3).map((n) => n.toLowerCase()));
      const bits = [`${E.norm(a.name).includes(E.norm(a.house)) ? a.name : a.name + ' de ' + a.house} et ${E.norm(b.name).includes(E.norm(b.house)) ? b.name : b.name + ' de ' + b.house}, ce n'est pas la même histoire.`, `${a.name}${nt(a) ? ' joue sur ' + nt(a) : ''}.`, `${b.name}${nt(b) ? ' joue sur ' + nt(b) : ''}.`];
      if (pa && pb) { const lighter = fr(pa) >= fr(pb) ? a : b, denser = de(pa) >= de(pb) ? a : b; if (lighter !== denser) bits.push(`Le plus frais des deux, ${lighter.name}, celui que je sortirais le jour ou au bureau. Le plus dense, ${denser.name}, pour le soir ou le froid.`); else bits.push(`Ils ont un peu le même poids sur la peau, donc le choix se fera sur les notes que tu préfères.`); }
      const pa2 = estPrice(ca) || a.price, pb2 = estPrice(cb) || b.price; if (pa2 && pb2) bits.push(`Côté prix, environ ${pa2} € contre ${pb2} €.`);
      return pref(bits.join(' '), { picks: [lkE(a), lkE(b)].map((k) => Object.assign(k, { line: '' })), note: 'Dis-moi pour quelle occasion tu hésites et je te donne mon choix.' });
    }
    // parler d'un parfum
    if (two.length >= 1 && /parle|parler|raconte|dis moi|c est quoi|que penses|ton avis|avis sur|tout sur|connais tu|connais tu|decris|decrire|il sent|ca sent|sent comment|vaut|pour qui|a quoi (il )?ressemble|combien|prix|coute|\?/.test(qn) && qn.split(' ').length <= 14) {
      const e = two[0]; return pref(describePerfume(e), { picks: [Object.assign(lkE(e), { line: '' })], note: 'Dis-moi si tu veux le comparer à un autre ou savoir avec quoi le superposer.', fb: { name: e.name, house: e.house } });
    }
    const kbOk = !(two.length || /offr|cadeau|moins cher|trop cher|a la place|plutot|comme |pour (ma|mon|mes)\b|ma mere|mon pere/.test(qn)) || /^(c est quoi|qu est ce|quelle est la difference|difference entre)/.test(qn);
    if (kbOk)     for (const [rx, ans] of PF_KB) if (rx.test(qn)) {
      if (ans === null) return pref(chatGreeting());
      return pref(ans);
    }
    // « comme X mais moins cher » : la proximité calculée par l'application, puis le regard de l'IA quand elle est là
    try { const need = E.parseNeed(q), sim = simSearch(q, need); if (sim && sim.res.length) return await altAnswer(q, sim, pref); } catch (e) { /* on passe à la suite */ }
    return null;
  }
  const dsc0 = (c) => (window.DESC && window.DESC[c.name] ? window.DESC[c.name][1] : (c.notes || []).slice(0, 4).join(', '));
  // Une question qu'on ne sait pas ranger : l'IA si elle est là, sinon un aveu simple et des pistes.
  async function pfGeneral(q) {
    try {
      const sample = await getSample();
      if (sample) {
        const prompt = `Tu es le parfumier privé d'une application de parfums. ${VOIX_TX} Réponds en français, en 4 phrases maximum, à la question de la personne, en t'appuyant sur ses goûts et sa collection quand c'est utile. Si la question n'a rien à voir avec les parfums, dis-le gentiment et ramène la conversation vers les parfums. N'invente jamais de note, de prix ni de parfum.\nSes goûts :\n${tasteFor()}\nSa collection :\n${colFor() || '(vide)'}\nHistorique récent : ${CHAT.msgs.slice(-6).map((m) => (m.r === 'u' ? 'Elle ou lui : ' : 'Toi : ') + (m.t || '')).join(' | ')}\nQuestion : """${q}"""\nSi pour bien répondre il te manque une information (occasion, saison, budget, notes aimées ou fuies, pour qui), pose UNE question courte dans "ask" avec 3 réponses rapides dans "chips". Réponds UNIQUEMENT par un JSON {"reply":"...","ask":"","chips":[""]}.`;
        const j = await aiJson(prompt, { modelTier: 'default' }); if (j && j.reply) { const o = { t: noDash(j.reply).slice(0, 900) }; if (j.ask) { o.t += ' ' + noDash(j.ask); o.chips = (j.chips || []).map((x) => noDash(x).slice(0, 48)).filter(Boolean).slice(0, 4); } return o; }
      }
    } catch (e) { /* retombe sur la réponse locale */ }
    return { t: 'Sur celle-là, je préfère ne pas t\'inventer une réponse. Ce que je fais le mieux, c\'est te parler d\'un parfum précis, comparer deux flacons, regarder ce qui manque à ta collection, te dire lequel porter aujourd\'hui, ou te proposer trois idées pour une occasion. Dis-moi par où tu veux commencer.' };
  }
  const VOIX_TX = 'Ton chaleureux de parfumier de boutique, tutoiement, phrases courtes, un peu de vocabulaire du métier (tête, cœur, fond, sillage, accord, jus, peau) sans jamais noyer, sans tiret long ni deux-points dans les phrases.';
  async function chatSend(q) {
    q = (q || '').trim(); if (!q || CHAT.busy) return; giftScan(q);
    CHAT.msgs.push({ r: 'u', t: q }); CHAT.busy = true; drawChat();
    { const ex = q.match(/^Pourquoi (.+) pour moi \?$/); if (ex) { const rec = (() => { try { return tipsData().recs.find((x) => x.c.name === ex[1]); } catch (e) { return null; } })(); if (rec) { const why = [].concat(rec.hits.length ? ['tu aimes déjà ' + rec.hits.slice(0, 2).join(' et ')] : [], (rec.axisWhy || []).length ? ['dans ton goût ' + rec.axisWhy[0]] : [], rec.proven >= 4 ? ['dans l\'univers « ' + (E.themesOf(rec.c, 1)[0] || { t: 'des playlists' }).t + ' »'] : []); const r2 = { c: rec.c, m: { why, pct: rec.pct, diff: rec.diff, pitch: rec.pitch } }; CHAT.msgs.push({ r: 'a', t: 'Bonne question. Voilà pourquoi je te le propose.', picks: [{ name: rec.c.name, house: rec.c.house, e: dbList().find((x) => E.norm(x.name) === E.norm(rec.c.name) && E.norm(x.house) === E.norm(rec.c.house)) || null, line: humanLine(r2, 0, null, q) }], fb: { name: rec.c.name, house: rec.c.house } }); CHAT.busy = false; drawChat(); return; } } }
    { const ia = await pfIntent(q); if (ia) { await aiPolish(q, ia); CHAT.msgs.push(Object.assign({ r: 'a' }, ia)); CHAT.busy = false; drawChat(); return; } }
    const prev = CHAT.msgs.filter((m) => m.r === 'u').slice(-3, -1).map((m) => m.t);
    const text = (prev.length ? prev.join('. ') + '. Et maintenant : ' : '') + q;
    let need = E.parseNeed(text.slice(0, 480)); if (need.empty) need = E.parseNeed(q);
    const st = chatState(), lk = {}; dbList().forEach((e) => { lk[entryKey(e)] = e; });
    const perfumeish = /parfum|odeur|sent|note|flacon|fragrance|cologne|jus|sillage|soir|bureau|date|rendez|mariage|cadeau|ete|hiver|automne|printemps|frais|boise|vanille|rose|cuir|oud|ambre|musc|epice|floral|gourmand|fume|budget|prix|euro|tenue|porter|mettre|collection|recommand|conseil|envie|ambiance|style|journee/.test(E.norm(q));
    if (need.empty || (!perfumeish && /\?\s*$|^(quel|quelle|quels|qui|combien|pourquoi|comment|que|qu |est ce|c est)\b/.test(E.norm(q)) && !need.tags.length && !need.fams.length && !need.like.length)) { const g = await pfGeneral(q); CHAT.msgs.push(Object.assign({ r: 'a' }, g)); CHAT.busy = false; drawChat(); return; }
    const res = need.empty ? [] : E.searchNeed(chatPool(), need, st, 14);
    const entryOf = (name, house) => lk[E.norm(house + ' ' + name)] || dbList().find((e) => E.norm(e.name) === E.norm(name) && (!house || E.norm(e.house) === E.norm(house))) || null;
    const local = () => {
      if (!res.length) return { t: 'Là, je ne te suis pas tout à fait. Raconte-moi plutôt la scène : une occasion, une saison, une note que tu aimes, ou un parfum que tu portes déjà.', picks: [] };
      const top = res.slice(0, 3), lab0 = (E.needLabel(need) || '').toLowerCase(), lab = lab0.length > 5 && !/^(pro|perso|date|event)\b/.test(lab0) ? lab0 : '';
      const intro = pickH([lab ? `Ah, ${lab}. Je vois très bien ce qu'il te faut, voilà trois idées.` : 'Je vois très bien ce qu\'il te faut, laisse-moi te raconter trois flacons.', lab ? `Pour ${lab}, voilà ce que je sortirais de l'armoire.` : 'Voilà ce que je sortirais de l\'armoire.', 'Bonne demande. Je prends mes mouillettes et je te dis tout.'], q);
      const conf = top[0].m.pct >= 75 ? 'Le premier, je le mettrais sur ta peau les yeux fermés.' : top[0].m.pct >= 55 ? 'Ils tiennent la route tous les trois, le premier a juste un cran d\'avance.' : 'Ce n\'est pas une évidence, alors dis-moi en plus et je viserai plus juste.';
      return { t: intro + ' ' + conf, picks: top.map((r, i2) => ({ name: r.c.name, house: r.c.house, e: r.c.entry || entryOf(r.c.name, r.c.house), line: humanLine(r, i2, null, q) })), note: pickH(['Un conseil de parfumier, laisse-le vivre une heure sur la peau, la tête ment toujours un peu avant que le cœur parle. Dis-moi si tu les veux plus frais, plus doux ou moins chers.', 'Teste sur la peau, pas sur la mouillette, et attends que le fond arrive avant de te décider. Je peux aussi te proposer une version plus discrète ou moins sucrée.', 'Si l\'un d\'eux ne te parle pas, dis-le moi simplement. On cherchera dans une autre direction, c\'est comme ça qu\'on trouve son jus.'], q + 'n'), fb: { name: top[0].c.name, house: top[0].c.house }, chips: top[0].m.pct < 55 ? ['Plutôt frais', 'Plutôt doux et enveloppant', 'Pour le soir', 'Avec un budget plus serré'] : undefined };
    };
    let msg = local();
    if (res.length && (window.SillageDemo || window.SillagePrompts)) {
      try {
        const args = { need: text.slice(0, 480), shortlist: shortOf(res), collection: colFor(), taste: tasteFor(), profile: profFor() };
        const j = window.SillageDemo ? await window.SillageDemo.need(args) : await aiJson(window.SillagePrompts.need(args), { modelTier: 'default' });
        const picks = (j.picks || []).slice(0, 3);
        if (picks.length) msg = { t: j.compris || '', picks: picks.map((k) => ({ name: k.name, house: k.house || '', e: entryOf(k.name, k.house), line: [k.pourquoi, k.peau ? 'Après 3 h : ' + k.peau : '', k.attention ? 'Attention : ' + k.attention : ''].filter(Boolean).join(' ') })), note: [j.eviter && j.eviter.name ? 'À éviter pour toi : ' + j.eviter.name + (j.eviter.raison ? ', ' + j.eviter.raison : '') + '.' : '', j.test || ''].filter(Boolean).join(' '), fb: { name: picks[0].name, house: picks[0].house } };
      } catch (e) { if (e && e.code === 'rate_limited') msg.note = 'Plus d\'essais IA pour aujourd\'hui : voici la sélection calculée sur ton profil.'; }
    }
    CHAT.msgs.push(Object.assign({ r: 'a' }, msg)); CHAT.busy = false; drawChat();
  }
  // Trois conseils pour un besoin donné, calculés sur le profil d'abord (goûts, âge, genre, saison, retours) : la collection n'est qu'un indice.
  const BCACHE = {};
  function drawBesoin() {
    const box = $('#bsn'); if (!box) return;
    const [l, q] = BESOINS[BSEL.i], key = [BSEL.i, S.settings.budget || 0, S.collection.length, (S.feedback || []).length, S.collection.map((p) => p.rating).join('')].join('|');
    $$('#bsel .chip').forEach((b) => b.classList.toggle('on', +b.dataset.bi === BSEL.i));
    const paint = (html) => { box.innerHTML = html; const lk = {}; dbList().forEach((e) => { lk[entryKey(e)] = e; }); $$('[data-ent]', box).forEach((b) => (b.onclick = () => { const e = lk[b.dataset.ent]; if (e) openEntry(e); })); };
    if (BCACHE[key]) return paint(BCACHE[key]);
    box.innerHTML = '<span class="shim" style="display:block;height:150px"></span>';
    setTimeout(() => {
      if (!$('#bsn') || BSEL.i !== +key.split('|')[0]) return;
      const need = E.parseNeed(q), lk = {}; dbList().forEach((e) => { lk[entryKey(e)] = e; });
      const res = need.empty ? [] : E.searchNeed(chatPool(), need, chatState(), 20);
      const card = (r) => { const e = r.c.entry || lk[E.norm(r.c.house + ' ' + r.c.name)] || { name: r.c.name, house: r.c.house, notes: r.c.notes || [], price: r.c.price }; return pCard(e, r.m.pct + ' %'); };
      const html = res.length ? `<p class="mono" style="text-transform:none;letter-spacing:0;margin:0">${res.length} idées, de la plus juste à la plus audacieuse</p><div class="rail brail2">${res.map(card).join('')}</div><ul class="bwhy">${res.slice(0, 3).map((r) => `<li><b>${esc(r.c.name)}</b> ${esc((r.m.why || []).slice(0, 2).join(', ').toLowerCase())}</li>`).join('')}</ul>` : '<p class="soft2">Rien de convaincant sous ce prix pour ce besoin. Monte un peu le plafond.</p>';
      BCACHE[key] = html; paint(html);
    }, 20);
  }
  function viewTips() {
    const s = S.settings, T = tipsData(); RECS = T.recs;
    const dsc = (c) => (window.DESC && window.DESC[c.name] ? window.DESC[c.name][1] : (c.notes || []).slice(0, 4).join(', '));
    let PLN = null; try { const pl = S.collection.length ? collectionPlan() : null; PLN = pl && pl.strategies.length ? pl : null; } catch (e) { PLN = null; }
    const hasProfile = S.collection.length || (s.liked || []).length || (s.vibes || []).length;
    $('#view').innerHTML = `
      <section class="sec tp"><header><h2>Pour toi</h2><span class="mono">ton parfumier privé</span></header>
        <div class="card pricecard"><div class="row" style="justify-content:space-between;align-items:baseline"><b>Prix maximum par flacon</b><b id="bval" style="font-family:var(--f-display);font-size:20px">${capLabel(s.budget)}</b></div>
          <input type="range" id="budget" min="0" max="${CAPS.length - 1}" step="1" value="${capIdx(s.budget)}" aria-label="Prix maximum par flacon"><p class="mono" style="text-transform:none;letter-spacing:0;margin:0">${s.budget ? 'Aucun conseil ne dépasse ce prix' : 'Aucun plafond : tous les prix, jusqu\'aux plus grands flacons'}</p>
          <div class="tiersrow"><p class="mono" style="text-transform:none;letter-spacing:0;margin:0">${s.tier ? 'Ton style' : 'Choisis ton style pour des conseils plus justes'}</p><div class="chips" id="tiersel">${TIERS.map(([k, l]) => `<button type="button" class="chip ${s.tier === k ? 'on' : ''}" data-tier="${k}">${l}</button>`).join('')}</div></div></div>
        ${S.collection.length ? '' : `<div class="card emptycard"><p class="mono">Pour commencer</p><h2>Ajoute tes parfums</h2><p>Tes notes disent ce que tu aimes : mes conseils en deviennent bien plus justes.</p><button class="cta full" id="tipAdd"><span>Ajouter mes parfums</span></button></div>`}
      </section>
      ${(() => { const th = sitThemes(6); return th.length ? `<section class="sec"><header><h2>Tes univers</h2><button type="button" class="lnk" id="vRedo">Refaire mon voyage</button></header><div class="rail unirail">${th.map(({ p }) => `<button type="button" class="uni sm" data-gopl="${esc(p.t)}">${p.img ? `<i class="uni-bg" style="background-image:url('${esc(p.img)}')"></i>` : ''}<div><h3>${esc(p.t)}</h3><p class="uni-s">${esc(themeStars(p).slice(0, 2).join(' · '))}</p></div></button>`).join('')}</div></section>` : `<section class="sec"><div class="card pfcard"><p class="mono">Ton voyage</p><h2>100 situations, ton univers</h2><p>Touche ce qui te ressemble et je mets en avant les ambiances et les parfums qui te correspondent.</p><button class="cta full" id="vRedo"><span>Commencer mon voyage</span></button></div></section>`; })()}
      <section class="sec"><div class="card pfcard"><p class="mono">Ton parfumier privé</p><h2>Une question ? Demande-lui.</h2><p>Il connaît toute la base et ton profil. Il est aussi là, en bas à droite, sur chaque page.</p><button class="cta full" id="pfopen"><span>Discuter avec lui</span></button></div></section>
      <section class="sec"><header><h2>Tes parfums du moment</h2><span class="mono">${profPrecision().l}</span></header>
        ${T.recs.length ? carousel(T.recs.map((r, i) => recCard(r, i)), 'Parfums pour toi') : '<div class="empty">Rien sous ce prix. Monte un peu le plafond.</div>'}
        ${profPrecision().v < 1 ? `<button class="ghost" id="tipProf" style="justify-self:start">Affiner mon profil pour de meilleurs conseils</button>` : ''}
      </section>
      ${PLN ? (() => { const pl = PLN; return `<section class="sec" id="planbox"><header><h2>Stratégies pour ta collection</h2><span class="mono">${pl.strategies.length} pistes</span></header><p class="soft2" style="margin:0">Tes ${pl.n} parfums couvrent moins bien ${pl.weak.map(esc).join(' et ')}. Voilà ce que donneraient quelques ajouts.</p>${carousel(planCards(pl), 'Stratégies de collection')}</section>`; })() : ''}
      <section class="sec"><header><h2>Selon le besoin</h2><span class="mono">tout un choix pour chacun</span></header>
        ${hasProfile ? `<div class="rail brail" id="bsel" role="tablist">${BESOINS.map(([l], bi) => `<button type="button" class="chip ${bi === BSEL.i ? 'on' : ''}" role="tab" data-bi="${bi}">${esc(l)}</button>`).join('')}</div><div id="bsn" class="bsn"></div>` : '<p class="soft2">Renseigne tes goûts ou ajoute quelques parfums, et je te propose trois conseils pour chaque besoin.</p>'}
      </section>
      ${S.collection.length || T.tags.length ? `<section class="sec"><details class="more big"><summary>Ta collection et d'autres idées</summary><div class="stack">
        ${T.gaps.length ? `<div><p class="mono">Pour compléter ta collection</p>${T.gaps.map((g) => tipCard(g.c, g.sc.label, `Pour <b>${esc(g.sc.label)}</b>, rien de vraiment adapté chez toi (ton meilleur : ${esc(g.bestP.name)}). ${esc(dsc(g.c))}`)).join('')}</div>` : ''}
        ${T.tips.length && S.collection.length ? `<div class="card"><p class="mono">Ta collection en bref</p><ul class="tiplist">${T.tips.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
        ${T.tags.length ? `<div><p class="mono">Par envie</p>${T.tags.map((t) => tipCard(t.r.c, t.label, esc(dsc(t.r.c)) + (t.r.hits.length ? ' Tu aimes déjà : ' + esc(t.r.hits.join(', ')) + '.' : ''))).join('')}</div>` : ''}
      </div></details></section>` : ''}
      <section class="sec"><button class="ghost" id="tipMap" style="justify-self:start">Où l'acheter : la carte des parfumeries</button></section>
      `;
    drawBesoin();
    if ($('#tipAdd')) $('#tipAdd').onclick = openAdd;
    if ($('#tipMap')) $('#tipMap').onclick = openShopMap;
    if ($('#tipProf')) $('#tipProf').onclick = () => { openProfile(); };
    if ($('#planbox')) bindPlan($('#planbox'));
    bindCarousel($('#view')); if ($('#tiersel')) bindTier($('#tiersel'), () => viewTips());
    const bud = $('#budget');
    bud.addEventListener('input', () => { S.settings.budget = CAPS[+bud.value]; $('#bval').textContent = capLabel(S.settings.budget); });
    bud.addEventListener('change', () => { save(); viewTips(); });
    if ($('#pfopen')) $('#pfopen').onclick = () => pfOpen();
    if ($('#vRedo')) $('#vRedo').onclick = openVoyage;
    $$('#view [data-gopl]').forEach((b) => (b.onclick = () => goPlaylist(b.dataset.gopl)));
    $$('#bsel [data-bi]').forEach((b) => (b.onclick = () => { BSEL.i = +b.dataset.bi; drawBesoin(); }));
    $$('[data-rw]').forEach((b) => (b.onclick = () => { const n = b.dataset.rw; if (hasWish(n)) rmWish(n); else addWish(wishFromName(n)); viewTips(); }));
    $$('[data-own]').forEach((b) => (b.onclick = () => { const c = CAT.find((x) => x.name === b.dataset.own); if (c) { S.collection.push(fromCat(c)); rmWish(c.name); save(); viewTips(); setTimeout(ensureRatings, 0); } }));
    $$('[data-why]').forEach((b) => (b.onclick = () => explain(b))); fbBind($('#view'));
    mountFx($('#view'));
  }
  function recCard(r, i) {
    const c = r.c, reasons = [];
    if (r.axisWhy && r.axisWhy.length) reasons.push('Dans ta veine : ' + r.axisWhy.join(' et '));
    if (r.hits.length) reasons.push('Tu aimes déjà : ' + r.hits.join(', '));
    if (r.ficheWhy) reasons.push(r.ficheWhy.charAt(0).toUpperCase() + r.ficheWhy.slice(1));
    if (r.gapLabel) reasons.push('Comble : ' + r.gapLabel);
    if (r.proven >= 3) reasons.splice(Math.min(1, reasons.length), 0, 'A fait ses preuves : cité dans ' + r.proven + ' playlists d\'inspiration');
    if (r.inSeason) reasons.push('De saison en ce moment');
    if (r.inBudget) reasons.push('Dans ton budget');
    if (r.houseLoved) reasons.push('Une maison que tu aimes déjà');
    if (r.mates.length) reasons.push('Se marie avec ' + r.mates.map((m) => m.name).join(', '));
    return `<article class="rec" style="--tint:${tint(c)}">${fxCanvas(`data-r="${i}"`, .6)}<span class="pct" title="Compatibilité avec tes goûts">${r.pct}%<small>compatible</small></span>${bt(c, { still: false })}
      <div><h3>${esc(c.name)}</h3><p style="color:var(--muted);font-size:14px">${esc(c.house)} · ${esc(famLabel(c.family))} · ≈ ${c.price} €</p>${window.DESC && window.DESC[c.name] ? `<p class="rd">${esc(window.DESC[c.name][1])}</p>` : (r.pitch ? `<p class="rd">${tx(r.pitch)}${r.diff ? ' ' + tx(r.diff) + '.' : ''}</p>` : '')}</div>
      <div class="pts ok">${reasons.slice(0, 4).map((x) => `<span class="pt">${esc(x)}</span>`).join('')}</div>
      <p class="why" id="why${i}"></p>
      <div class="row"><button class="ghost" data-why="${i}">${IC.spark} Pourquoi lui ?</button><button class="ghost" data-rw="${esc(c.name)}">${r.wished ? 'Dans ma wishlist' : 'Wishlist'}</button><button class="ghost" data-own="${esc(c.name)}">Je l'ai</button></div>${fbHtml('rec', c)}${buyLinks(c.name, c.house)}</article>`;
  }
  async function explain(btn) {
    const r = RECS[+btn.dataset.why], out = $('#why' + btn.dataset.why);
    out.innerHTML = '<span class="shim" style="display:block"></span>'; btn.disabled = true;
    try {
      const sample = await getSample(); if (!sample) throw { code: 'unavailable' };
      const prompt = `Tu es un nez de parfumerie, ton chaleureux et précis, tutoiement, 3 phrases maximum, sans liste.\nMa collection :\n${colLines()}\n\nExplique-moi pourquoi ${r.c.name} (${r.c.house}; notes : ${r.c.notes.join(', ')}) me plairait ou non, ce qu'il apporte que je n'ai pas, et avec lequel de mes parfums le superposer. Budget indicatif ${r.c.price} €.`;
      await sample(prompt, { modelTier: 'quick', cache: false, onText: ({ text }) => { out.textContent = text; } });
    } catch (e) { out.textContent = e && e.code === 'not_granted' ? 'Autorise l\'IA pour obtenir cette explication.' : 'L\'IA n\'est pas disponible ici. Les raisons ci-dessus viennent du calcul local.'; }
    btn.disabled = false;
  }
  // ---------- Feuilles ----------
  // Chaque parfum de la collection doit avoir une note choisie par la personne : c'est ce qui permet de bien la conseiller. Rien n'est noté d'office.
  const RATE_L = ['', 'Bof', 'Moyen', 'J\'aime bien', 'J\'adore', 'Coup de cœur'];
  function ensureRatings() {
    const un = (S.collection || []).filter((p) => !(p.rating > 0));
    if (!un.length || !$('#sheet').hidden || !$('#story').hidden || $('#onb') || $('#prof') || $('#acct')) return;
    const total = S.collection.length;
    const pn = openSheet(`<div class="rate"><div><p class="mono">Une dernière chose</p><h2>Ta note pour chaque parfum</h2><p class="soft">C'est ce qui me permet de te conseiller juste. Choisis une note pour chacun, rien n'est noté à ta place.</p></div>
      <p class="mono" id="rprog" style="text-transform:none;letter-spacing:0"></p><div class="rlist" style="display:grid;gap:10px">${un.map((p) => `<div class="card" data-rp="${esc(p.id)}" style="display:grid;gap:8px"><div><b>${esc(p.name)}</b><br><small style="color:var(--muted)">${esc(p.house)}</small></div><div class="stars rst">${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-r="${i}" aria-label="${i} sur 5 : ${RATE_L[i]}">☆</button>`).join('')}</div><span class="mono rlab" style="text-transform:none;letter-spacing:0;min-height:1.2em"></span></div>`).join('')}</div>
      <button class="cta full" id="rdone" disabled><span>Terminer</span></button></div>`);
    $('.veil', $('#sheet')).onclick = null;
    const upd = () => { const left = S.collection.filter((p) => !(p.rating > 0)).length; $('#rprog', pn).textContent = (total - left) + ' notés sur ' + total; $('#rdone', pn).disabled = left > 0; };
    $$('[data-rp]', pn).forEach((row) => { const p = find(row.dataset.rp); $$('.rst button', row).forEach((b) => (b.onclick = () => { p.rating = +b.dataset.r; p.rated = true; save(); NPOOL = null; $$('.rst button', row).forEach((x) => { x.textContent = +x.dataset.r <= p.rating ? '★' : '☆'; }); $('.rlab', row).textContent = RATE_L[p.rating]; upd(); })); });
    upd();
    $('#rdone', pn).onclick = () => { closeSheet(); render(true); };
  }
  function openSheet(html) {
    const sh = $('#sheet'); sh.hidden = false;
    sh.innerHTML = `<div class="veil"></div><div class="panel" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
    $('.veil', sh).onclick = closeSheet;
    document.body.style.overflow = 'hidden';
    return $('.panel', sh);
  }
  function closeSheet() { const sh = $('#sheet'), wasProf = !!$('#tedit', sh); sh.hidden = true; sh.innerHTML = ''; if ($('#story').hidden) document.body.style.overflow = ''; if (wasProf && (tab === 'tips' || tab === 'today')) render(true);  setTimeout(ensureRatings, 0); }

  function openDetail(id) {
    const p = find(id); if (!p) return;
    const pn = openSheet(`
      <div class="big-bottle"><i class="aura" style="background:${tint(p)}"></i>${fxCanvas(`data-p="${p.id}"`, 1)}${bt(p, { spray: true })}</div>
      ${ficheCore(ficheOf(p))}
      <div><p class="mono">ma note</p><div class="stars" id="stars">${[1, 2, 3, 4, 5].map((i) => `<button data-r="${i}" aria-label="${i} sur 5">${i <= p.rating ? '★' : '☆'}</button>`).join('')}</div></div>
      <p style="color:var(--muted)">${esc(ago(daysSince(p.id)))} · ${wears(p.id)} port${wears(p.id) > 1 ? 's' : ''}${p.price && wears(p.id) ? ' · ≈ ' + (p.price / wears(p.id)).toFixed(1).replace('.', ',') + ' € / port' : ''}</p>
      <p class="mono" style="text-transform:none;letter-spacing:0">${IC.spark} Ambiance : ${esc(FX.motifsOf(p).label)}${FX.motifsOf(p).notes.length ? ' · inspirée de ' + esc(FX.motifsOf(p).notes.join(', ')) : ''}</p>
      <div class="row" style="gap:14px">${buyLinks(p.name, p.house)}${HAS_ASSETS ? `<button class="ghost" id="phBtn">${p.img ? 'Changer la photo' : 'Ajouter cette photo'}</button>${p.img ? '<button class="ghost" id="phDel">Retirer la photo</button>' : ''}<input type="file" id="phIn" accept="image/*" hidden>` : ''}</div>
      ${(() => { const notes = S.log.filter((l) => l.id === p.id && (l.note || l.compl || l.dur)).slice(-3).reverse(); return notes.length ? `<div><p class="mono">Journal</p>${notes.map((l) => `<p style="font-size:14px;color:var(--muted);margin-top:6px">${esc(new Date(l.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }))} · ${esc([l.compl ? l.compl + ' compliment(s)' : '', l.dur || '', l.note || ''].filter(Boolean).join(' · '))}</p>`).join('')}</div>` : ''; })()}
      ${p.incomplete ? `<div class="card" style="display:grid;gap:10px"><p class="mono">Fiche à compléter</p><p style="font-size:14px;color:var(--muted)">Les notes ne sont jamais devinées : tant que la fiche est vide, je ne peux pas l\'utiliser dans mes conseils. Donne-moi le nom exact et l\'IA remplit les vraies notes.</p><input type="text" id="fixin" value="${esc(p.name || '')}" placeholder="Nom exact du parfum"><button class="cta" id="fixgo"><span>Compléter avec l'IA</span></button><p class="mono" id="fixmsg" style="text-transform:none"></p></div>` : ''}
      <div class="card" style="display:grid;gap:10px"><b>Mon flacon</b>${stockHtml(p, 0)}<p class="mono" id="stkmsg" style="text-transform:none;letter-spacing:0">Je tiens compte de ton stock : un échantillon ou un flacon presque fini ne part pas en usage quotidien.</p></div>
      <p class="mono" id="phMsg" style="text-transform:none"></p>
      <div class="row"><button class="ghost" id="sx">Fermer</button><button class="ghost danger" id="sdel">Retirer</button></div>`);
    mountFx(pn); bindFiche(pn);
    if ($('#fixgo', pn)) $('#fixgo', pn).onclick = async () => {
      const nm = $('#fixin', pn).value.trim(); if (!nm) { $('#fixin', pn).focus(); return; }
      $('#fixmsg', pn).textContent = 'Je cherche…'; $('#fixgo', pn).disabled = true;
      try { await aiFill(p, nm); save(); openDetail(id); render(true); }
      catch (e) { $('#fixmsg', pn).textContent = e && e.code === 'unknown' ? 'Je ne connais pas ce parfum avec certitude. Vérifie le nom exact ou ajoute-le depuis la base.' : 'L\'IA n\'est pas disponible ici. Réessaie plus tard.'; $('#fixgo', pn).disabled = false; }
    };
    if ($('#phBtn', pn)) {
      $('#phBtn', pn).onclick = () => $('#phIn', pn).click();
      $('#phIn', pn).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; $('#phMsg', pn).textContent = 'Envoi de la photo…'; try { p.img = await putPhoto(f); save(); openDetail(id); render(true); } catch (er) { $('#phMsg', pn).textContent = 'Photo impossible à enregistrer ici.'; } };
      if ($('#phDel', pn)) $('#phDel', pn).onclick = () => { delete p.img; save(); openDetail(id); render(true); };
    }
    bindStock(pn, () => p, () => { save(); const m = $('#stkmsg', pn); if (m) m.textContent = 'Enregistré ✓'; });
    $('#sx', pn).onclick = closeSheet;
    $$('#stars button', pn).forEach((b) => (b.onclick = () => { p.rating = +b.dataset.r; p.rated = true; save(); $$('#stars button', pn).forEach((x) => { x.textContent = +x.dataset.r <= p.rating ? '★' : '☆'; }); }));
    $('#sdel', pn).onclick = (e) => { if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = 'Confirmer'; return; } S.collection = S.collection.filter((x) => x.id !== id); save(); closeSheet(); render(true); };
  }

  // Recherche dans le catalogue détaillé (notes, famille) puis dans le grand index (nom + maison, fiche complétée à l'ajout).
  const IDX = (() => { const o = []; (window.INDEX || []).forEach(([h, arr]) => arr.forEach(([n, c]) => o.push({ name: n, house: h, conc: c, nn: E.norm(n), nh: E.norm(h + ' ' + n) }))); return o; })();
  const CONC_L = { EDP: 'EDP', EDT: 'EDT', EXT: 'Extrait', PAR: 'Parfum', COL: 'Cologne' };
  function searchPerfumes(q, have) {
    const out = [], seen = new Set(); const push = (r) => { const k = E.norm(r.house + ' ' + r.name); if (!seen.has(k)) { seen.add(k); out.push(r); } };
    CAT.forEach((c) => { if (!have.has(E.norm(c.name)) && (E.norm(c.name).includes(q) || E.norm(c.house + ' ' + c.name).includes(q))) push({ name: c.name, house: c.house, cat: true, rank: E.norm(c.name).startsWith(q) ? 0 : 1 }); });
    IDX.forEach((r) => { if (!have.has(r.nn) && r.nh.includes(q)) push({ name: r.name, house: r.house, conc: r.conc, rank: r.nn.startsWith(q) ? 0 : r.nh.startsWith(q) ? 1 : 2 }); });
    return out.sort((a, b) => a.rank - b.rank).slice(0, 7);
  }
  let PRE = [], SHELF_FILES = [];
  // Ajouter mes parfums : trois façons, clairement séparées
  function openAdd() {
    const pn = openSheet(`<div class="hub"><div><h2>Ajouter mes parfums</h2><p class="soft">Choisis la façon la plus simple pour toi.</p></div>
      <button class="opt" data-add="base"><b>Choisir dans la base</b><span>Plus de ${(Math.floor(dbList().filter((e) => !e.ed).length / 100) * 100).toLocaleString('fr-FR')} parfums, par maison, style, notes, parfumeur ou prix. Avec photos.</span></button>
      <button class="opt" data-add="text"><b>Écrire ou coller ma liste</b><span>Je retrouve les noms, même mal écrits, et je complète les fiches.</span></button>
      <button class="opt" data-add="photo"><b>Prendre une photo</b><span>Un flacon ou toute ton étagère : je reconnais les parfums.</span></button>
      <button class="ghost" id="hubx">Fermer</button></div>`);
    $('#hubx', pn).onclick = closeSheet;
    $$('[data-add]', pn).forEach((b) => (b.onclick = () => { const k = b.dataset.add; if (k === 'base') openExplore('collection'); else { openAddFree(); if (k === 'photo' && $('#addph') && !$('#addph').hidden) $('#addph').click(); } }));
  }
  function openAddFree() {
    PRE = []; SHELF_FILES = [];
    const pn = openSheet(`<div><h2>Pas dans la base ?</h2><p style="color:var(--muted);margin-top:6px">Écris tes parfums en vrac, ou prends ton étagère en photo. L'IA retrouve la maison, les notes et la puissance.</p></div>
      <textarea id="addtxt" rows="4" placeholder="br540, santal 33 le labo, un diptyque au figuier, ombre leather…"></textarea>
      ${window.SillageDemo ? '<input type="text" id="addurl" inputmode="url" autocomplete="off" placeholder="Ou colle l\'adresse d\'une image trouvée sur internet (https://…)" aria-label="Adresse d\'une image de parfum">' : ''}
      <div class="row"><button class="chip photo-btn" id="addph" ${CAN_IMG ? '' : 'hidden'}>${IC.cam}<span id="addphl">${window.SillageDemo ? 'Photo ou image du flacon' : 'Photo(s) de l\'étagère'}</span></button><input type="file" id="addin" accept="image/*" ${window.SillageDemo ? '' : 'multiple'} hidden></div>
      ${window.SillageDemo ? `<p class="mono" style="text-transform:none;letter-spacing:0">Reconnaissance par une IA légère, quasi gratuite : ${window.SillageDemo.identLeft()} analyse${window.SillageDemo.identLeft() > 1 ? 's' : ''} restante${window.SillageDemo.identLeft() > 1 ? 's' : ''} dans la démo. Les parfums déjà connus ne comptent pas.</p>` : ''}
      <button class="cta full" id="addgo">${IC.spark}<span>Analyser</span></button><div id="addres" style="display:grid;gap:10px"></div>`);
    // Suggestions pendant la frappe : un parfum connu s'ajoute sans erreur, les fiches inconnues sont complétées par l'IA légère (et gardées en cache pour tous).
    const sug = document.createElement('div'); sug.className = 'chips'; sug.id = 'addsug'; $('#addtxt', pn).after(sug);
    $('#addtxt', pn).addEventListener('input', (e) => {
      const ta = e.target, multi = ta.value.includes('\n'), parts = ta.value.split(multi ? /\n/ : /,/), last = E.norm(parts[parts.length - 1].trim());
      const have = new Set(S.collection.map((p) => E.norm(p.name)));
      const hits = last.length < 2 ? [] : searchPerfumes(last, have);
      sug.innerHTML = hits.map((c, i) => `<button type="button" class="chip" data-sug="${i}">${esc(c.name)} <small style="color:var(--muted)">${esc(c.house)}${c.conc && c.conc !== 'EDP' ? ' · ' + esc(c.conc.split(',').map((x) => CONC_L[x] || x).join('/')) : ''}</small></button>`).join('');
      $$('[data-sug]', sug).forEach((b) => (b.onclick = () => { const c = hits[+b.dataset.sug]; parts[parts.length - 1] = c.cat ? c.name : c.house + ' — ' + c.name; ta.value = parts.map((x) => x.trim()).filter(Boolean).join('\n') + '\n'; sug.innerHTML = ''; ta.focus(); }));
    });
    $('#addph', pn).onclick = () => $('#addin', pn).click();
    $('#addin', pn).onchange = (e) => { SHELF_FILES = [...e.target.files].slice(0, window.SillageDemo ? 1 : 4); $('#addphl', pn).textContent = SHELF_FILES.length + ' photo(s) ✓'; };
    $('#addgo', pn).onclick = () => analyzeAdd(pn);
  }
  // ---------- Explorer la base : maisons, styles, notes, prix, parfumeurs ----------
  // Les ~2 800 parfums de la base n'ont pas tous une fiche détaillée : pour les autres, style et notes sont déduits du nom (marqués « ≈ »).
  const GUESS = [
    ['oud', 5, ['oud', 'agar']], ['cuir', 4, ['cuir', 'leather', 'suede', 'daim']],
    ['gourmand', 4, ['vanille', 'vanilla', 'tonka', 'feve', 'caramel', 'cacao', 'chocolat', 'cafe', 'coffee', 'latte', 'miel', 'honey', 'praline', 'sucre', 'candy']],
    ['ambré', 4, ['ambre', 'amber', 'ambra', 'encens', 'incenso', 'incense', 'myrrhe', 'oliban', 'benjoin', 'labdanum']],
    ['épicé', 4, ['epice', 'spice', 'poivre', 'pepper', 'cannelle', 'cinnamon', 'safran', 'saffron', 'gingembre', 'ginger', 'cardamome', 'tabac', 'tobacco', 'tabacco']],
    ['boisé', 3, ['bois', 'wood', 'santal', 'sandal', 'sandalo', 'cedre', 'cedro', 'cedar', 'vetiver', 'patchouli', 'sycomore', 'cypres', 'quercia', 'gaiac', 'papyrus', 'oak', 'chene']],
    ['musqué', 2, ['musc', 'musk', 'muschio']],
    ['floral', 3, ['rose', 'iris', 'jasmin', 'jasmine', 'gelsomino', 'tubereuse', 'fleur', 'flower', 'magnolia', 'pivoine', 'lys', 'lily', 'gardenia', 'orchid', 'violet', 'mimosa', 'muguet', 'osmanthus', 'narcisse', 'freesia', 'fresia', 'petale', 'bloom', 'fiore', 'cassie']],
    ['agrumes', 1, ['citron', 'lemon', 'bergamot', 'bergamotto', 'cedrat', 'pamplemousse', 'orange', 'arancia', 'mandarin', 'yuzu', 'neroli', 'limette', 'lime', 'agrume', 'cologne', 'bigarade', 'chinotto', 'citrus', 'pomelo']],
    ['vert', 2, ['vert', 'green', 'herbe', 'fougere', 'fern', 'menthe', 'mint', 'figuier', 'fico', 'fig', 'philosykos', 'tilleul', 'basilic']],
    ['fruité', 2, ['fruit', 'cerise', 'cherry', 'peche', 'peach', 'pomme', 'apple', 'poire', 'pear', 'framboise', 'berry', 'mure', 'litchi', 'mangue', 'ananas', 'coco']],
    ['aromatique', 2, ['lavande', 'lavender', 'sauge', 'sage', 'romarin', 'armoise', 'absinth', 'genievre']],
  ];
  const KW_NOTE = { vanille: 'vanille', vanilla: 'vanille', tonka: 'tonka', feve: 'fève tonka', rose: 'rose', santal: 'santal', sandal: 'santal', sandalo: 'santal', cuir: 'cuir', leather: 'cuir', musc: 'musc', musk: 'musc', muschio: 'musc', oud: 'oud', iris: 'iris', jasmin: 'jasmin', jasmine: 'jasmin', gelsomino: 'jasmin', tubereuse: 'tubéreuse', ambre: 'ambre', amber: 'ambre', ambra: 'ambre', encens: 'encens', incenso: 'encens', incense: 'encens', vetiver: 'vétiver', patchouli: 'patchouli', bergamot: 'bergamote', bergamotto: 'bergamote', citron: 'citron', lemon: 'citron', orange: 'orange', arancia: 'orange', neroli: 'néroli', tabac: 'tabac', tobacco: 'tabac', tabacco: 'tabac', cannelle: 'cannelle', safran: 'safran', saffron: 'safran', poivre: 'poivre', pepper: 'poivre', cafe: 'café', coffee: 'café', miel: 'miel', honey: 'miel', figuier: 'figue', fig: 'figue', fico: 'figue', menthe: 'menthe', mint: 'menthe', lavande: 'lavande', lavender: 'lavande', cedre: 'cèdre', cedro: 'cèdre', cedar: 'cèdre', pivoine: 'pivoine', magnolia: 'magnolia', gardenia: 'gardénia', violet: 'violette', mimosa: 'mimosa', muguet: 'muguet', osmanthus: 'osmanthe', cacao: 'cacao', chocolat: 'chocolat', caramel: 'caramel', praline: 'praliné', coco: 'coco', cerise: 'cerise', cherry: 'cerise', pomme: 'pomme', poire: 'poire', gingembre: 'gingembre', cardamome: 'cardamome', sauge: 'sauge', myrrhe: 'myrrhe', benjoin: 'benjoin', papyrus: 'papyrus', cypres: 'cyprès', pamplemousse: 'pamplemousse', yuzu: 'yuzu', mandarin: 'mandarine', lys: 'lys', lily: 'lys', bois: 'bois', wood: 'bois' };
  const FACET_NOTES = ['vanille', 'rose', 'santal', 'cuir', 'musc', 'oud', 'iris', 'jasmin', 'tubéreuse', 'ambre', 'encens', 'vétiver', 'patchouli', 'bergamote', 'citron', 'orange', 'néroli', 'tabac', 'cannelle', 'safran', 'poivre', 'café', 'miel', 'figue', 'menthe', 'lavande', 'cèdre', 'fleur d\'oranger', 'pivoine', 'cacao', 'praliné', 'coco', 'cerise', 'pomme', 'poire', 'gingembre', 'cardamome', 'myrrhe', 'benjoin', 'pamplemousse', 'violette', 'magnolia'];
  function guessInfo(name) {
    const toks = E.norm(name).split(' ').filter(Boolean), has = (k) => toks.some((t) => t === k || (k.length >= 5 && t.startsWith(k)));
    let fam = null, w = 3; for (const [f, wt, kws] of GUESS) { if (kws.some(has)) { fam = f; w = wt; break; } }
    const notes = []; toks.forEach((t) => { const k = KW_NOTE[t] || (t.length >= 5 ? KW_NOTE[Object.keys(KW_NOTE).find((x) => x.length >= 5 && t.startsWith(x))] : null); if (k && !notes.includes(k)) notes.push(k); });
    return { family: fam, weight: w, notes: notes.slice(0, 4) };
  }
  // Nez d'un parfum : d'après la liste de Théo (data/noses.txt), sinon la courte liste de repères
  function noseOf(n, h) {
    const NB = window.NOSE_BY || {}, k = E.norm(h + ' ' + n), l = NB[k] || NB[k.replace(/ (edp|edt)$/, '')];
    if (l) return l;
    const c = (window.NOSE && window.NOSE[n]) || (window.NOSE_HOUSE && window.NOSE_HOUSE[h]); return c ? c.split(/ et |, /) : [];
  }
  const initials = (n) => n.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase();
  const noseCount = (n) => dbList().filter((e) => (e.noses || []).includes(n)).length;
  const noseAv = (n) => { const f = (window.NOSE_IMG || {})[n]; return f ? `<img class="av ph" alt="${esc(n)}" loading="lazy" src="${esc(f)}">` : `<span class="av">${esc(initials(n))}</span>`; };
  const noseCard = (n) => { const b = (window.NOSE_BIO || {})[n]; return `<div class="card nosec"><div class="nh">${noseAv(n)}<div><b>${esc(n)}</b><small>${esc(b ? b[0] : 'Parfumeur')} · ${noseCount(n)}+ parfums dans la base</small></div></div>${b ? `<p>${esc(b[1])}</p>` : ''}</div>`; };
  const noseRow = (attr, list) => foldWrap(list.map((n) => `<button type="button" class="xp nz" ${attr}="${esc(n)}">${noseAv(n)}<b>${esc(n)}</b><small>${noseCount(n)}+ parfums</small></button>`).join(''), 'xpop noserow');
  let DBL = null;
  const EDS = new Set(window.EDITIONS || []), gdOf = (n, h) => (window.genderOf ? window.genderOf(n, h) : 'u');
  const GEN_L = [['', 'Tous'], ['f', 'Féminin'], ['m', 'Masculin'], ['u', 'Mixte']];
  function dbList() {
    const nCustom = (S.customDb || []).length;
    if (DBL && DBL.n === CAT.length + nCustom) return DBL.l;
    const out = [], seen = new Set(), HA = window.HOUSE_ALIAS || {}, ch = (h) => (h && HA[E.norm(h)]) || h, tg = window.tagsOf || (() => []), noses = noseOf;
    CAT.forEach((c) => { if (!c.name || !c.house) return; const h = ch(c.house); seen.add(E.norm(h + ' ' + c.name)); out.push({ g: gdOf(c.name, h), ed: false, name: c.name, house: h, conc: '', cat: c, family: c.family, notes: c.notes || [], projection: c.projection, longevity: c.longevity, weight: c.weight, price: c.price || 0, noses: noses(c.name, h), guess: false, tags: tg(c.name, h, c.price || 0, '') }); });
    (window.INDEX || []).forEach(([h, arr]) => arr.forEach(([n, conc, fl]) => { const k = E.norm(h + ' ' + n); if (seen.has(k)) return; seen.add(k); const fk = (window.FACTS || {})[E.norm(h) + '|' + E.norm(n)], fn = fk && fk.n && fk.n.length >= 3 ? fk.n : null, dv = fn ? E.derive({ name: n, house: h, notes: fn }) : null; out.push({ g: gdOf(n, h), ed: EDS.has(E.norm(h) + '|' + E.norm(n)), name: n, house: h, conc, cat: null, family: dv ? dv.family : null, notes: fn || [], weight: dv ? dv.weight : 0, projection: dv ? dv.projection : 0, longevity: dv ? dv.longevity : 0, price: 0, noses: noses(n, h), guess: false, real: !!fn, tags: tg(n, h, 0, fl) }); }));
    const EN = window.ENRICH || {};      // nez, famille, année, collection et prix (estimé si inconnu) reliés à chaque parfum
    out.forEach((e) => { const x = EN[E.norm(e.house) + '|' + E.norm(e.name)]; if (!x) return;
      if (x.n && x.n.length) { const have = new Set((e.noses || []).map(E.norm)); e.noses = (e.noses || []).concat(x.n.filter((n) => !have.has(E.norm(n)))); }
      if (!e.family && x.f) { e.family = x.f; e.guess = false; }
      if (x.p && (!e.price || !x.pe)) { e.price = x.p; if (x.pe) e.pe = true; else delete e.pe; if (e.cat) e.cat.price = x.p; }
      if (x.y) e.year = x.y; if (x.c) e.coll = x.c; });
    (S.customDb || []).forEach((c) => { const k = E.norm(c.house + ' ' + c.name); if (seen.has(k)) return; seen.add(k); out.push({ g: gdOf(c.name, c.house), ed: false, name: c.name, house: c.house || 'Autre', conc: '', cat: null, family: c.family || null, notes: c.notes || [], price: c.price || 0, noses: [], guess: false, tags: [], custom: true }); });
    const HIDE = window.SILLAGE_HIDE; if (HIDE && HIDE.size) for (let i = out.length - 1; i >= 0; i--) if (HIDE.has(E.norm(out[i].house) + '|' + E.norm(out[i].name))) out.splice(i, 1);     // parfums masqués par l'éditeur
    DBL = { n: CAT.length + nCustom, l: out }; return out;
  }
  // Pool des conseils et de la recherche par besoin : le catalogue détaillé + toute la base dont les notes sont réelles (jamais de devinette).
  let NPOOL = null;
  function needPool() {
    const L = dbList(); if (NPOOL && NPOOL.l === L) return NPOOL.p;
    const p = [], seen = new Set();
    L.forEach((e) => { if (e.ed || !(e.notes || []).length) return; const k = entryKey(e); if (seen.has(k)) return; seen.add(k); p.push(e.cat ? Object.assign({}, e.cat, { curated: true, entry: e }) : { name: e.name, house: e.house, notes: e.notes, family: e.family, weight: e.weight, projection: e.projection, longevity: e.longevity, price: e.price || 0, entry: e }); });
    NPOOL = { l: L, p }; return p;
  }
  const PRICE_TIERS = [['p1', 'Moins de 100 €', (p) => p > 0 && p < 100], ['p2', '100 à 200 €', (p) => p >= 100 && p < 200], ['p3', '200 à 300 €', (p) => p >= 200 && p < 300], ['p4', '300 € et plus', (p) => p >= 300]];
  // Ordre voulu des parfums d'une maison (data/house-order.txt) et des maisons mises en tête.
  const HORD = (() => { const m = {}; Object.keys(window.HOUSE_ORDER || {}).forEach((h, hi) => { const o = { hi, idx: {} }; window.HOUSE_ORDER[h].forEach((n, i) => { o.idx[E.norm(n)] = i; }); m[h] = o; }); return m; })();
  // Les incontournables : d'abord la sélection voulue (data/incontournables-top.txt), puis le reste de la liste habituelle.
  const incList = () => {
    const by = new Map(dbList().map((e) => [E.norm(e.house) + '|' + E.norm(e.name), e])), seen = new Set(), out = [];
    const take = (k) => { const e = by.get(k); if (e && !e.ed && !seen.has(k)) { seen.add(k); out.push(e); } };
    (window.INC_TOP || []).forEach(([h, n]) => take(E.norm(h) + '|' + E.norm(n)));
    (window.INCONT || []).forEach(take); return out;
  };
  const houseRank = (e) => { const o = HORD[E.norm(e.house)]; if (!o) return 1e6; const i = o.idx[E.norm(e.name)]; return i == null ? 1e5 : i; };
  function groupsOf(db, facet) {
    const m = new Map(), put = (k, label, e) => { if (!m.has(k)) m.set(k, { key: k, label, items: [] }); m.get(k).items.push(e); };
    if (facet === 'brand') db.forEach((e) => put(E.norm(e.house), e.house, e));
    else if (facet === 'style') db.forEach((e) => { if (e.family) put(e.family, famLabel(e.family), e); });
    else if (facet === 'note') db.forEach((e) => { const nn = (e.notes || []).map(E.norm); FACET_NOTES.forEach((f) => { const nf = E.norm(f); if (nn.some((x) => x.includes(nf))) put(nf, f, e); }); });
    else if (facet === 'price') db.forEach((e) => { const t = PRICE_TIERS.find((x) => x[2](e.price)); if (t) put(t[0], t[1], e); });
    else if (facet === 'tag') db.forEach((e) => (e.tags || []).forEach((t) => put(t, (window.TAGS || {})[t] || t, e)));
    else if (facet === 'nose') db.forEach((e) => (e.noses || []).forEach((n) => put(E.norm(n), n, e)));
    let g = [...m.values()];
    const FAME = {}; (window.HOUSE_FAME || []).forEach((h, i) => { FAME[E.norm(h)] = i; }); const fr = (l) => { const k = FAME[E.norm(l)]; return k == null ? 1e6 : k; };
    if (facet === 'brand') g.forEach((x) => { if (HORD[E.norm(x.label)]) x.items.sort((p, q) => houseRank(p) - houseRank(q)); });
    const hh = (l) => { const o = HORD[E.norm(l)]; return o ? o.hi : 1e6; };
    g = facet === 'brand' ? g.sort((a, b) => hh(a.label) - hh(b.label) || fr(a.label) - fr(b.label) || b.items.length - a.items.length || a.label.localeCompare(b.label, 'fr')) : facet === 'nose' ? g.sort((a, b) => a.label.localeCompare(b.label, 'fr')) : facet === 'tag' ? g.sort((a, b) => Object.keys(window.TAGS || {}).indexOf(a.key) - Object.keys(window.TAGS || {}).indexOf(b.key)) : facet === 'price' ? g.sort((a, b) => a.key.localeCompare(b.key)) : g.sort((a, b) => b.items.length - a.items.length);
    return g;
  }
  const entryKey = (e) => E.norm(e.house + ' ' + e.name);
  if (DEMO) window.__dbg = { imgOf, dbList: () => dbList() };      // outillage d'audit (?seed=demo)
  function entryToOwned(e) {
    if (e.cat) return Object.assign(fromCat(e.cat), { size: 100, left: 100, use: 'free' });
    // Jamais de notes devinées : si la base n'a pas les vraies notes, la fiche reste vide et l'IA la remplit dès l'ajout.
    const base = { id: uid(), name: e.name, house: e.house, price: 0, rating: 0, occ: [], size: 100, left: 100, use: 'free' };
    if (e.real && (e.notes || []).length >= 3) return Object.assign(base, { family: e.family, notes: e.notes.slice(), projection: e.projection || 3, longevity: e.longevity || 3, weight: e.weight || 3 });
    return Object.assign(base, { family: '', notes: [], projection: 3, longevity: 3, weight: 3, incomplete: true });
  }
  const tagPills = (e) => (e.tags && e.tags.length ? `<span class="xtg">${e.tags.slice(0, 3).map((t) => `<i>${esc((window.TAGS || {})[t] || t)}</i>`).join('')}</span>` : '');
  const xThumb = (e) => { const ph = imgOf(e); return ph ? `<img class="xth" alt="" loading="lazy" src="${esc(ph.s)}">` : `<span class="xth">${bt({ name: e.name, house: e.house, family: e.family || 'boisé', id: 'x' + E.norm(e.house + e.name).length }, { still: true, h: 64 })}</span>`; };
  // Listes longues : trois rangées visibles, puis « Voir plus ».
  const foldWrap = (inner, cls) => `<div class="foldbox"><div class="fold ${cls || ''}">${inner}</div><button type="button" class="ghost foldbtn" hidden>Voir plus</button></div>`;
  function initFolds(root) {
    $$('.foldbox', root).forEach((bx) => {
      const f = $('.fold', bx), btn = $('.foldbtn', bx); if (!f || !btn) return;
      f.style.maxHeight = ''; f.classList.remove('open');
      const kids = [...f.children], tops = [...new Set(kids.map((k) => k.offsetTop))].sort((a, b) => a - b);
      if (tops.length <= 3) { btn.hidden = true; return; }
      f.style.maxHeight = (tops[3] - tops[0] - 6) + 'px'; btn.hidden = false; btn.textContent = 'Voir plus (' + kids.length + ')';
      btn.onclick = () => { const open = f.classList.toggle('open'); f.style.maxHeight = open ? 'none' : (tops[3] - tops[0] - 6) + 'px'; btn.textContent = open ? 'Voir moins' : 'Voir plus (' + kids.length + ')'; };
    });
  }
  // mountExplorer : le même explorateur sert à l'ajout en collection, à la wishlist et à l'inscription.
  function mountExplorer(host, o) {
    const sel = new Map(); let facet = 'brand', group = null, q = '', limit = 60, gen = '';
    // Les rééditions (collector, limited, millésimes…) restent dans la fiche d'un nez, mais ne polluent pas les listes ; le filtre féminin / masculin / mixte s'applique partout.
    const view = (L, withEd) => L.filter((e) => (withEd || !e.ed) && (!gen || e.g === gen));
    const haveIt = (e) => (o.mode === 'wish' ? S.wishlist : S.collection).some((p) => E.norm(p.name) === E.norm(e.name));
    const sub = (e) => [e.house, e.family ? (e.guess ? '≈ ' : '') + famLabel(e.family) : '', e.conc && e.conc !== 'EDP' ? e.conc.split(',').map((x) => CONC_L[x] || x).join('/') : '', e.price ? '≈ ' + e.price + ' €' : ''].filter(Boolean).join(' · ');
    const card = (e, i) => { const k = entryKey(e), have = haveIt(e), on = sel.has(k), d = window.DESC && window.DESC[e.name];
      return `<button type="button" class="xc ${on ? 'on' : ''}" data-xk="${esc(k)}" ${have ? 'disabled' : ''}>${xThumb(e)}<span class="xt"><b>${esc(e.name)}</b><small>${esc(sub(e))}</small>${d && e.cat ? `<em>${tx(d[1])}</em>` : ''}${tagPills(e)}</span><i class="xm">${have ? '✓ ' + (o.mode === 'wish' ? 'dans ta wishlist' : 'chez toi') : on ? '✓' : '+'}</i></button>`; };
    const popular = () => incList();
    const search = (qq) => { const nq = E.norm(qq), L = view(dbList(), true); return L.map((e) => { const n = E.norm(e.name), h = E.norm(e.house), nh = h + ' ' + n; const r = n === nq ? 0 : n.startsWith(nq) ? 1 : nh.startsWith(nq) ? 2 : n.includes(nq) ? 3 : nh.includes(nq) ? 4 : nq.split(' ').every((w) => nh.includes(w)) ? 5 : 9; return { e, r }; }).filter((x) => x.r < 9).sort((a, b) => a.r - b.r || (imgOf(b.e) ? 1 : 0) - (imgOf(a.e) ? 1 : 0) || (b.e.cat ? 1 : 0) - (a.e.cat ? 1 : 0)).slice(0, 80).map((x) => x.e); };
    const foot = () => { const n = sel.size; return `<div class="exp-foot"><span class="mono">${n ? n + ' choisi' + (n > 1 ? 's' : '') : 'Touche un parfum pour le choisir'}</span><button class="cta" id="xgo" ${n ? '' : 'disabled'}><span>${esc(o.cta(n))}</span></button></div>`; };
    function body() {
      const db = view(dbList(), facet === 'nose' && !!group), tabs = [['brand', 'Maisons'], ['tag', 'Tags'], ['style', 'Styles'], ['note', 'Notes'], ['price', 'Prix'], ['nose', 'Parfumeurs']];
      let inner = '';
      if (q.trim().length >= 2) { const r = search(q); inner = r.length ? `<div class="xgrid">${r.map(card).join('')}</div>` : '<div class="empty">Rien trouvé. Essaie la maison, ou écris-le toi-même plus bas.</div>'; }
      else {
        const gs = groupsOf(db, facet);
        inner = `<div class="chips xtabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" class="chip ${facet === k ? 'on' : ''}" data-xf="${k}">${l}</button>`).join('')}</div>`;
        if (!group) {
          if (facet === 'brand') inner += `<p class="mono">Les incontournables</p>${foldWrap(`${popular().map((e) => { const k = entryKey(e), on = sel.has(k); return `<button type="button" class="xp ${on ? 'on' : ''}" data-xk="${esc(k)}" ${haveIt(e) ? 'disabled' : ''}>${xThumb(e)}<b>${esc(e.name)}</b><small>${esc(e.house)}</small></button>`; }).join('')}`, 'xpop')}<p class="mono">Toutes les maisons · ${gs.length}</p>`;
          else if (facet === 'style' || facet === 'note') inner += `<p class="mono" style="text-transform:none;letter-spacing:0">${facet === 'style' ? 'Pour les parfums sans fiche détaillée, le style est déduit du nom (≈).' : 'Notes des fiches détaillées, ou lues dans le nom du parfum.'}</p>`;
          else if (facet === 'tag') inner += '<p class="mono" style="text-transform:none;letter-spacing:0">Abordable, niche, designer, luxe, collection privée… pour trier d\'un coup d\'œil.</p>';
          else if (facet === 'price') inner += '<p class="mono" style="text-transform:none;letter-spacing:0">Prix indicatifs d\'un flacon standard, pour les parfums avec fiche détaillée.</p>';
          else inner += `<p class="mono">Les nez les plus connus</p>${noseRow('data-xn', (window.NOSE_TOP || []).filter((n) => gs.some((g) => g.label === n)))}<p class="mono">Tous les parfumeurs · ${gs.length}</p>`;
          inner += foldWrap(gs.map((g) => `<button type="button" class="chip" data-xg="${esc(g.key)}">${esc(g.label)} <small style="color:var(--muted)">${g.items.length}</small></button>`).join('') || '<span class="mono">Rien ici pour l\'instant</span>', 'chips xg');
        } else {
          const g = gs.find((x) => x.key === group); const items = g ? g.items.slice().sort((a, b) => (facet === 'brand' ? houseRank(a) - houseRank(b) : 0) || (imgOf(b) ? 1 : 0) - (imgOf(a) ? 1 : 0) || (b.cat ? 1 : 0) - (a.cat ? 1 : 0) || a.name.localeCompare(b.name, 'fr')) : [];
          inner += `<div class="row xback"><button type="button" class="ghost" id="xback">← ${tabs.find((t) => t[0] === facet)[1]}</button><b>${esc(g ? g.label : '')}</b><span class="mono">${items.length}</span></div>${facet === 'nose' && g ? noseCard(g.label) : ''}<div class="xgrid">${items.slice(0, limit).map(card).join('')}</div>${items.length > limit ? '<button type="button" class="ghost" id="xmore">Voir plus</button>' : ''}`;
        }
      }
      host.innerHTML = `<div class="exp"><div><h2>${esc(o.title)}</h2><p style="color:var(--muted);margin-top:6px">${esc(o.sub)}</p></div><input type="search" id="xq" placeholder="Rechercher un parfum ou une maison" value="${esc(q)}" autocomplete="off" aria-label="Rechercher"><div class="chips xgen" role="group" aria-label="Pour qui">${GEN_L.map(([k, l]) => `<button type="button" class="chip ${gen === k ? 'on' : ''}" data-xgen="${k}">${l}</button>`).join('')}</div><div id="xbody">${inner}</div>${o.free ? `<button type="button" class="linkbtn" id="xfree">${esc(o.free)}</button>` : ''}${o.skip ? `<button type="button" class="ghost" id="xskip">${esc(o.skip)}</button>` : ''}${foot()}</div>`;
      bind(); initFolds(host);
    }
    function bind() {
      const qi = $('#xq', host); qi.oninput = () => { q = qi.value; const pos = q.length; body(); const n = $('#xq', host); n.focus(); n.setSelectionRange(pos, pos); };
      $$('[data-xgen]', host).forEach((b) => (b.onclick = () => { gen = b.dataset.xgen; limit = 60; body(); }));
      $$('[data-xf]', host).forEach((b) => (b.onclick = () => { facet = b.dataset.xf; group = null; limit = 60; body(); }));
      $$('[data-xn]', host).forEach((b) => (b.onclick = () => { group = E.norm(b.dataset.xn); limit = 60; body(); }));
      $$('[data-xg]', host).forEach((b) => (b.onclick = () => { group = b.dataset.xg; limit = 60; body(); }));
      if ($('#xback', host)) $('#xback', host).onclick = () => { group = null; body(); };
      if ($('#xmore', host)) $('#xmore', host).onclick = () => { limit += 60; body(); };
      const lookup = {}; dbList().forEach((e) => { lookup[entryKey(e)] = e; });
      $$('[data-xk]', host).forEach((b) => (b.onclick = () => { const k = b.dataset.xk, e = lookup[k]; if (!e) return; if (sel.has(k)) sel.delete(k); else sel.set(k, e); b.classList.toggle('on', sel.has(k)); const m = $('.xm', b); if (m) m.textContent = sel.has(k) ? '✓' : '+'; const f = $('.exp-foot', host); f.outerHTML = foot(); bindGo(); }));
      bindGo();
      if ($('#xfree', host)) $('#xfree', host).onclick = o.onFree;
      if ($('#xskip', host)) $('#xskip', host).onclick = o.onSkip;
    }
    function bindGo() { const g = $('#xgo', host); if (g) g.onclick = () => o.onSubmit([...sel.values()]); }
    body();
  }
  // ---------- Recherche : un parfum en particulier, avec filtres ----------
  const SRCH = { open: false, q: '', tags: [], style: '', price: '', house: '', note: '', nose: '', conc: '', gen: '', photo: false, limit: 40 };
  function filterDb() {
    const db = dbList(), nq = E.norm(SRCH.q), tier = PRICE_TIERS.find((x) => x[0] === SRCH.price), nn = SRCH.note ? E.norm(SRCH.note) : '';
    const r = db.filter((e) => {
      if (SRCH.tags.length && !SRCH.tags.every((t) => (e.tags || []).includes(t))) return false;
      if (SRCH.style && e.family !== SRCH.style) return false;
      if (tier && !tier[2](e.price)) return false;
      if (SRCH.house && e.house !== SRCH.house) return false;
      if (nn && !(e.notes || []).some((x) => E.norm(x).includes(nn))) return false;
      if (SRCH.nose && !(e.noses || []).includes(SRCH.nose)) return false;
      if (SRCH.conc && !(e.conc || '').split(',').includes(SRCH.conc)) return false;
      if (SRCH.gen && e.g !== SRCH.gen) return false;
      if (e.ed && !SRCH.nose && !nq) return false;      // rééditions : seulement dans la fiche d'un nez ou quand on les cherche
      if (SRCH.photo && !imgOf(e)) return false;
      if (nq) { const nh = E.norm(e.house + ' ' + e.name); if (!nq.split(' ').every((w) => nh.includes(w))) return false; }
      return true;
    });
    const rank = (e) => { if (!nq) return 5; const n = E.norm(e.name); return n === nq ? 0 : n.startsWith(nq) ? 1 : E.norm(e.house + ' ' + e.name).startsWith(nq) ? 2 : n.includes(nq) ? 3 : 4; };
    const oneHouse = !!SRCH.house && !nq;
    return r.sort((a, b) => rank(a) - rank(b) || (oneHouse ? houseRank(a) - houseRank(b) : 0) || (imgOf(b) ? 1 : 0) - (imgOf(a) ? 1 : 0) || (b.cat ? 1 : 0) - (a.cat ? 1 : 0) || a.name.localeCompare(b.name, 'fr'));
  }
  function rowCard(e) {
    const d = window.DESC && window.DESC[e.name], inCol = S.collection.some((p) => E.norm(p.name) === E.norm(e.name)), inW = hasWish(e.name);
    return `<button type="button" class="xc" data-ent="${esc(entryKey(e))}">${xThumb(e)}<span class="xt"><b>${esc(e.name)}</b><small>${esc([e.house, e.family ? (e.guess ? '≈ ' : '') + famLabel(e.family) : '', e.conc && e.conc !== 'EDP' ? e.conc.split(',').map((x) => CONC_L[x] || x).join('/') : '', e.price ? '≈ ' + e.price + ' €' : ''].filter(Boolean).join(' · '))}</small>${d && e.cat ? `<em>${tx(d[1])}</em>` : ''}${tagPills(e)}</span><i class="xm">${inCol ? '✓ chez toi' : inW ? '♡ wishlist' : '›'}</i></button>`;
  }
  function drawSearchResults() {
    const r = filterDb(), box = $('#sbody'); if (!box) return;
    $('#scount').textContent = r.length + ' parfum' + (r.length > 1 ? 's' : '');
    box.innerHTML = (SRCH.nose ? noseCard(SRCH.nose) : '') + (r.length ? `<div class="pgrid">${r.slice(0, SRCH.limit).map((e) => pCard(e)).join('')}</div>${r.length > SRCH.limit ? '<button type="button" class="ghost" id="smore" style="justify-self:start">Voir plus</button>' : ''}` : '<div class="empty">Aucun parfum ne correspond. Retire un filtre en haut.</div>');
    bindEnt(box);
    if ($('#smore', box)) $('#smore', box).onclick = () => { SRCH.limit += 24; drawSearchResults(); };
  }

  // « un parfum comme Aventus mais moins cher » : on retrouve le parfum cité et on classe la base par proximité de profil.
  function simSearch(q, need) {
    const CH = /moins cher|pas cher|abordable|economique|petit budget|trop cher|a la place|plus accessible|moins onereux/;
    const m = q.match(/(?:comme|similaire (?:a|à)|proche (?:de|du)|dans le style (?:de|du)|dupe (?:de|du)|alternative (?:a|à)|ressemble (?:a|à)|genre|type)\s+(.+)/i) || (CH.test(E.norm(q)) ? [q, q] : null); if (!m) return null;
    const tail = ' ' + E.norm(m[1]) + ' '; let ref = null;
    dbList().forEach((e) => { const n = E.norm(e.name); if (n.length >= 4 && tail.includes(' ' + n + ' ') && (!ref || n.length > E.norm(ref.name).length)) ref = e; });
    if (!ref) return null;
    const rq = E.profOf({ name: ref.name, house: ref.house, notes: ref.notes || [], family: ref.family }); if (!rq) return null;
    const cheaper = CH.test(E.norm(q)), wantExt = /extrait|parfum concentre|tres concentre/.test(E.norm(q)), cen = (v) => v.map((x) => x - 2.5);
    const a = cen(rq.p), na = Math.sqrt(a.reduce((t, x) => t + x * x, 0)) || 1;
    let RT = new Set(); try { RT = new Set(E.themesOf(ref, 99).map((t) => t.id)); } catch (e) { /* sans playlists */ }
    const rn = new Set((ref.notes || []).map(E.norm).filter(Boolean)), nmin = (a, b) => Math.max(3, Math.min(a, b));
    const rk0 = E.norm(ref.house + ' ' + ref.name), pool0 = needPool().slice();
    (window.ALTS || []).filter((x) => x[0] === rk0).forEach((x) => { if (!pool0.some((c) => E.norm(c.house + ' ' + c.name) === x[1])) { const e = dbList().find((d) => E.norm(d.house + ' ' + d.name) === x[1]); if (e) pool0.push({ name: e.name, house: e.house, notes: e.notes || [], family: e.family, price: e.price || 0, entry: e }); } });
    const res = pool0.filter((c) => E.norm(c.name) !== E.norm(ref.name) && !(c.entry && c.entry.ed) && E.norm(c.house + c.name) !== E.norm(ref.house + ref.name)).map((c) => {
      const alt = (window.ALTS || []).some((x) => x[0] === E.norm(ref.house + ' ' + ref.name) && x[1] === E.norm(c.house + ' ' + c.name)) ? .9 : 0;
      const pq = E.profOf(c); if (!pq && !alt) return null; const b = pq ? cen(pq.p) : a.map(() => 0), nb = Math.sqrt(b.reduce((t, x) => t + x * x, 0)) || 1;
      const cs = pq ? a.reduce((t, x, i) => t + x * b[i], 0) / (na * nb) : 0.3, cn = new Set((c.notes || []).map(E.norm).filter(Boolean));
      let sh = 0; rn.forEach((n) => { if (cn.has(n) || [...cn].some((m) => m.includes(n) || n.includes(m))) sh++; });
      const ns = rn.size && cn.size ? sh / nmin(rn.size, cn.size) : 0, fm = c.family && c.family === ref.family ? 1 : 0;
      let tc = 0, pv = 0; try { const ct = new Set(E.themesOf(c, 99).map((t) => t.id)); ct.forEach((id) => { if (RT.has(id)) tc++; }); pv = E.provenOf(c).v; } catch (e) { /* sans playlists */ }
      const ql = alt + (wantExt && /extrait|elixir|absolu|esprit de parfum|\bparfum\b|intense/.test(E.norm(c.name)) ? .08 : 0) + (E.nicheTop(c) ? .06 : 0) + .06 * pv - (E.usHype(c) ? .03 : 0);
      return { c, sim: Math.min(0.99, 0.34 * cs + 0.3 * Math.min(1, ns) + 0.1 * fm + 0.2 * Math.min(1, tc / 3) + ql), shared: sh, tc, alt };
    }).filter((r) => r && (r.sim > 0.42 || r.alt) && (!need.maxPrice || !r.c.price || r.c.price <= need.maxPrice) && (!cheaper || !ref.price || (r.c.price > 0 && r.c.price < ref.price * 0.8 && r.c.price > ref.price * 0.25))).sort((x, y) => y.sim - x.sim);
    return { ref, cheaper, res };
  }
  // Univers (playlists) qui répondent à la demande : leurs premiers parfums, dans l'ordre voulu pour cette playlist (les plus emblématiques en tête).
  let TBK = new Set();
  function themeBlock(need) {
    TBK = new Set();
    const ths = (need.themes || []).filter((t) => t.m >= 0.6).sort((x, y) => y.m - x.m).slice(0, 2), PL = window.PLAYLISTS || [];
    if (!ths.length) return '';
    return ths.map((t) => {
      const p = PL[t.pi]; if (!p) return '';
      const es = p.ps.slice(0, 12).map(plEntry).filter(Boolean).filter((e) => !TBK.has(entryKey(e))).slice(0, 8); if (!es.length) return ''; es.forEach((e) => TBK.add(entryKey(e)));
      return `<section class="thblk" style="margin:12px 0 4px"><p class="mono" style="text-transform:none;letter-spacing:0">Dans l'univers « ${esc(p.t)} »</p><div class="pgrid">${es.map((e) => pCard(e)).join('')}</div><button type="button" class="ghost" data-gopl="${esc(p.t)}">Voir toute la playlist</button></section>`;
    }).join('');
  }
  // Univers dans lesquels figure un parfum (chips cliquables sur sa fiche).
  const themeChips = (e) => { const L = E.themesOf({ name: e.name, house: e.house }, 6); return L.length ? `<div><p class="mono">Univers</p><div class="chips" style="margin-top:8px">${L.map((x) => `<button type="button" class="chip" data-gopl="${esc(x.t)}">${esc(x.t)}</button>`).join('')}</div></div>` : ''; };
  // ---------- Retour sur un conseil : « ce conseil t'a plu ? » nourrit les goûts (notes, familles, univers, densité, douceur) ----------
  const FB_REASONS = [['lourd', 'Trop lourd'], ['sucre', 'Trop sucré'], ['style', 'Pas mon style'], ['vu', 'Trop vu']];
  const fbHtml = (kind, p) => `<div class="fbk rise" data-fbk="${esc(kind)}" data-fbn="${esc(p.name)}" data-fbh="${esc(p.house || '')}" data-fbi="${esc(p.id || '')}" style="display:grid;gap:8px;justify-items:center;margin-top:6px"><span class="mono" style="text-transform:none;letter-spacing:0">Ce conseil t'a plu ?</span><span class="fbb" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button type="button" class="chip" data-fbv="1">Oui</button><button type="button" class="chip" data-fbv="0">Bof</button><button type="button" class="chip" data-fbv="-1">Non</button></span><span class="fbm mono" style="text-transform:none;letter-spacing:0"></span></div>`;
  function fbRecord(box, v, reason) {
    const name = box.dataset.fbn, house = box.dataset.fbh, kind = box.dataset.fbk, id = box.dataset.fbi;
    const src = (id && find(id)) || dbList().find((e) => E.norm(e.name) === E.norm(name) && (!house || E.norm(e.house) === E.norm(house))) || {};
    S.feedback = S.feedback || [];
    const rec = { date: today(), kind, id, name, house, verdict: v, reason: reason || '', notes: (src.notes || []).slice(0, 8), family: src.family || '' };
    const i = S.feedback.findIndex((f) => f.kind === kind && f.name === name && f.date === rec.date);
    if (i >= 0) S.feedback[i] = rec; else S.feedback.push(rec);
    S.feedback = S.feedback.slice(-80); save(); NPOOL = null;
  }
  function fbBind(root) {
    $$('.fbk', root).forEach((box) => {
      const msg = $('.fbm', box), bar = $('.fbb', box);
      $$('[data-fbv]', box).forEach((b) => (b.onclick = (e) => {
        e.stopPropagation(); const v = +b.dataset.fbv; fbRecord(box, v, '');
        if (v < 0) { bar.innerHTML = FB_REASONS.map(([k, l]) => `<button type="button" class="chip" data-fbr="${k}">${l}</button>`).join(''); msg.textContent = 'Qu\'est-ce qui n\'allait pas ?'; $$('[data-fbr]', bar).forEach((c) => (c.onclick = (e2) => { e2.stopPropagation(); fbRecord(box, -1, c.dataset.fbr); bar.innerHTML = ''; msg.textContent = 'Merci, j\'en tiens compte pour les prochains conseils.'; })); }
        else { bar.innerHTML = ''; msg.textContent = v > 0 ? 'Merci, j\'en tiens compte : je te proposerai plus dans cette veine.' : 'Noté, je ferai évoluer mes conseils.'; }
      }));
    });
  }
  const NEED = { q: '', n: 6, mode: 'disc' };
  const NEED_EX = ['un parfum pour compléter ma collection', 'un parfum comme Aventus mais moins cher', 'frais pour le bureau en été', 'vanille sans patchouli pour l\'hiver', 'cuir fumé pour homme', 'rose poudrée', 'premier rendez-vous, pas trop sucré', 'boisé discret moins de 100 €'];
  function drawNeed() {
    const box = $('#nres'); if (!box) return;
    const need = E.parseNeed(NEED.q);
    const sim = simSearch(NEED.q, need);
    if (sim) {
      const lk = {}; dbList().forEach((e) => { lk[entryKey(e)] = e; });
      box.innerHTML = `<p class="mono" style="text-transform:none;letter-spacing:0">Dans la veine de ${esc(sim.ref.name)} (${esc(sim.ref.house)})${sim.cheaper ? ', en moins cher' : ''}${need.maxPrice ? ' jusqu\'à ' + need.maxPrice + ' €' : ''} · ${Math.min(sim.res.length, NEED.n)} résultat${sim.res.length > 1 ? 's' : ''}</p>` + (sim.res.length ? `<div class="xgrid">${sim.res.slice(0, NEED.n).map((r) => { const e = r.c.entry || lk[E.norm(r.c.house + ' ' + r.c.name)] || { name: r.c.name, house: r.c.house, family: r.c.family, notes: r.c.notes, price: r.c.price, tags: [], cat: r.c }; return `<button type="button" class="xc" data-ent="${esc(entryKey(e))}">${xThumb(e)}<span class="xt"><b>${esc(e.name)}</b><small>${esc([e.house, e.family ? famLabel(e.family) : '', e.price ? '≈ ' + e.price + ' €' : ''].filter(Boolean).join(' · '))}</small><em>${Math.round(r.sim * 100)} % de ressemblance avec ${esc(sim.ref.name)}</em></span><i class="xm">›</i></button>`; }).join('')}</div>${sim.res.length > NEED.n ? '<button type="button" class="ghost" id="nmore">Voir plus</button>' : ''}` : '<div class="empty">Rien d\'assez proche avec ces contraintes. Élargis le budget.</div>');
      $$('[data-ent]', box).forEach((b) => (b.onclick = () => { const e = lk[b.dataset.ent]; if (e) openEntry(e); }));
      if ($('#nmore', box)) $('#nmore', box).onclick = () => { NEED.n += 8; drawNeed(); };
      return;
    }
    if (PLAN_RX.test(NEED.q) && !/\bfrais|bureau|date|hiver|été|ete\b/i.test(NEED.q.replace(/ma collection|ma collec/gi, ''))) { box.innerHTML = `<p class="mono" style="text-transform:none;letter-spacing:0">Compléter ta collection${need.maxPrice ? ' · jusqu\'à ' + need.maxPrice + ' €' : ''}</p>${S.collection.length ? planHtml(collectionPlan(need.maxPrice), true) : planHtml(null)}`; bindPlan(box); return; }
    if (!NEED.q.trim()) { box.innerHTML = '<p style="font-size:14px;color:var(--muted)">Décris l\'occasion, la saison, les notes que tu veux ou fuis, le budget : je cherche dans toute la base, sur de vraies notes, et je te dis pourquoi.</p>'; return; }
    if (need.empty) { box.innerHTML = '<p style="font-size:14px;color:var(--muted)">Je n\'ai pas compris le besoin. Essaie avec une occasion (bureau, date), une saison, une note (vanille, rose) ou une famille (boisé, frais).</p>'; return; }
    const tbHtml = themeBlock(need), nTb = TBK.size;
    const g = S.profile && S.profile.gender, res = E.searchNeed(needPool(), need, Object.assign({}, S.settings, { gender: g, age: S.profile && S.profile.age, collection: S.collection, fb: S.feedback || [], month: new Date().getMonth() }), NEED.n + nTb).filter((r) => !TBK.has(entryKey(r.entry || r.c.entry || { house: r.c.house, name: r.c.name }))).slice(0, NEED.n);
    const lookup = {}; dbList().forEach((e) => { lookup[entryKey(e)] = e; });
    box.innerHTML = `<p class="mono" style="text-transform:none;letter-spacing:0">${esc(E.needLabel(need) || 'Besoin compris')} · ${res.length} résultat${res.length > 1 ? 's' : ''}</p>` + (res.length ? `<div class="xgrid">${res.map((r) => { const e = r.c.entry || lookup[E.norm(r.c.house + ' ' + r.c.name)] || { name: r.c.name, house: r.c.house, family: r.c.family, notes: r.c.notes, price: r.c.price, tags: [], cat: r.c }; return `<button type="button" class="xc" data-ent="${esc(entryKey(e))}">${xThumb(e)}<span class="xt"><b>${esc(e.name)}</b><small>${esc([e.house, e.family ? famLabel(e.family) : '', e.price ? '≈ ' + e.price + ' €' : ''].filter(Boolean).join(' · '))}</small><em>${esc(r.m.why.join(' · '))}</em>${r.m.pitch ? `<em>${tx(r.m.pitch)}</em>` : ''}</span><i class="xm">${r.m.pct} %</i></button>`; }).join('')}</div>${NEED.n <= res.length ? '<button type="button" class="ghost" id="nmore">Voir plus</button>' : ''}` : '<div class="empty">Rien ne correspond vraiment. Enlève une contrainte (budget, note fuie) ou élargis le besoin.</div>');
    { const tb = tbHtml; if (tb) box.insertAdjacentHTML('afterbegin', tb); $$('[data-gopl]', box).forEach((b) => (b.onclick = () => goPlaylist(b.dataset.gopl))); }
    box.insertAdjacentHTML('beforeend', `<div style="display:grid;gap:12px;margin-top:14px"><button type="button" class="cta" id="needai"><span>Affiner avec l'IA</span></button><p class="mono" id="needaimsg" style="text-transform:none;letter-spacing:0">L'IA compare les meilleurs candidats, tranche pour toi et explique pourquoi.</p><div id="needaires" style="display:grid;gap:12px"></div></div>`);
    $('#needai', box).onclick = () => aiNeed(res, need);
    $$('[data-ent]', box).forEach((b) => (b.onclick = () => { const e = lookup[b.dataset.ent]; if (e) openEntry(e); }));
    if ($('#nmore', box)) $('#nmore', box).onclick = () => { NEED.n += 8; drawNeed(); };
  }
  // Conseil sur mesure : l'IA tranche parmi les candidats vérifiés par le moteur (tout est calculé sur de vraies notes).
  const ROLE_L = { choix: 'Le choix', sur: 'Le sûr', audace: 'La petite audace' };
  const shortOf = (res) => res.slice(0, 25).map((r) => [r.c.house, r.c.name, famLabel(r.c.family), (r.c.notes || []).slice(0, 8).join(', '), r.m.diff || r.m.pitch || '', r.m.pct + ' %', r.c.price ? '≈ ' + r.c.price + ' €' : '', ficheBits(r.c) ? 'fiche : ' + ficheBits(r.c) : '', r.m.why && r.m.why.length ? 'calculé pour lui/elle : ' + r.m.why.join(', ') : '', (() => { const t = E.themesOf(r.c, 4).map((x) => x.t); return t.length ? 'univers : ' + t.join(', ') + ' (' + E.provenOf(r.c).n + ' playlists d\'inspiration)' : ''; })()].filter((x, i) => i < 6 || x).join(' | ')).join('\n');
  const colShort = () => S.collection.slice(0, 25).map((p) => `${p.name} (${p.house}) : ${p.rating > 0 ? p.rating + '/5' : 'pas notée'} : ${(p.notes || []).slice(0, 5).join(', ')} : porté ${wears(p.id)} fois`).join('\n');
  async function aiNeed(res, need) {
    const msg = $('#needaimsg'), out = $('#needaires'), btn = $('#needai'); if (!msg) return;
    msg.textContent = 'Je compare…'; btn.disabled = true; out.innerHTML = '';
    const short = shortOf(res);
    const col = colShort();
    const args = { need: NEED.q, shortlist: short, collection: col, taste: tasteLine(), profile: S.profile ? { gender: S.profile.gender, age: S.profile.age } : null };
    try {
      const j = window.SillageDemo ? await window.SillageDemo.need(args) : await aiJson(window.SillagePrompts.need(args), { modelTier: 'default' });
      const picks = (j.picks || []).slice(0, 3);
      out.innerHTML = (j.compris ? `<p class="rd">${esc(j.compris)}</p>` : '') + picks.map((k) => `<article class="card" style="display:grid;gap:8px"><p class="mono">${esc(ROLE_L[k.role] || 'Conseil')} · ${clamp(Math.round(+k.pct || 0), 0, 99)} %${k.hors_liste ? ' · hors de ma liste vérifiée' : ''}</p><b style="font-size:18px">${esc(k.name)}</b><small style="color:var(--muted)">${esc(k.house || '')}</small><p style="font-size:14.5px">${esc(k.pourquoi || '')}</p>${k.tete ? `<p style="font-size:13.5px;color:var(--muted)">Au début : ${esc(k.tete)}</p>` : ''}${k.peau ? `<p style="font-size:13.5px;color:var(--muted)">Sur ta peau, après 3 h : ${esc(k.peau)}</p>` : ''}${k.attention ? `<p style="font-size:13.5px">⚠ ${esc(k.attention)}</p>` : ''}</article>`).join('') + (j.eviter && j.eviter.name ? `<p style="font-size:14px"><b>À éviter pour toi : ${esc(j.eviter.name)}</b>${j.eviter.raison ? ' : ' + esc(j.eviter.raison) : ''}</p>` : '') + (j.test ? `<p class="mono" style="text-transform:none;letter-spacing:0">${esc(j.test)}</p>` : '');
      if (picks.length) { out.insertAdjacentHTML('beforeend', fbHtml('need', { name: picks[0].name, house: picks[0].house })); fbBind(out); }
      msg.textContent = picks.length ? '' : 'L\'IA n\'a rien trouvé de mieux.'; btn.disabled = false;
    } catch (e) { msg.textContent = e && e.code === 'rate_limited' ? 'Plus d\'essais pour aujourd\'hui.' : 'L\'IA n\'est pas disponible ici. Les résultats ci-dessus restent valables.'; btn.disabled = false; }
  }
  // ---------- Recherche : une seule barre qui cherche partout (parfums, maisons, nez, notes, envies), ou on se laisse guider ----------
  const SD = { facet: 'brand', all: false };
  const ENVIES = [['Frais pour le bureau', 'frais pour le bureau'], ['Une soirée qui marque', 'une soirée qui marque, sillage fort'], ['Premier rendez-vous', 'premier rendez-vous, pas trop sucré'], ['Cocooning d\'hiver', 'vanille pour l\'hiver'], ['Chaleur d\'été', 'frais pour l\'été'], ['Original, qui ose', 'un parfum original et clivant'], ['Doux et propre', 'musc propre et doux'], ['Compléter ma collection', 'un parfum pour compléter ma collection']];
  const pCard = (e, badge) => `<button type="button" class="pc" data-ent="${esc(entryKey(e))}">${badge ? `<i class="pcm">${badge}</i>` : ''}${xThumb(e)}<b>${esc(e.name)}</b><small>${esc(e.house)}</small>${e.price ? `<em>≈ ${e.price} €</em>` : ''}</button>`;
  const popularList = () => incList();
  const sFilters = () => SRCH.tags.length || SRCH.style || SRCH.price || SRCH.house || SRCH.note || SRCH.nose || SRCH.conc || SRCH.gen || SRCH.photo;
  function bindEnt(root) { const look = plLook(); $$('[data-ent]', root).forEach((b) => (b.onclick = () => { const e = look.get(b.dataset.ent); if (e) openEntry(e); })); }
  function viewSearch() {
    const act = [...SRCH.tags.map((t) => ['t:' + t, (window.TAGS || {})[t]]), SRCH.style ? ['style', famLabel(SRCH.style)] : null, SRCH.price ? ['price', (PRICE_TIERS.find((x) => x[0] === SRCH.price) || [])[1]] : null, SRCH.house ? ['house', SRCH.house] : null, SRCH.note ? ['note', 'Note ' + SRCH.note] : null, SRCH.nose ? ['nose', SRCH.nose] : null, SRCH.conc ? ['conc', SRCH.conc] : null, SRCH.gen ? ['gen', ({ f: 'Féminin', m: 'Masculin', u: 'Mixte' })[SRCH.gen]] : null, SRCH.photo ? ['photo', 'Avec photo'] : null].filter(Boolean);
    $('#view').innerHTML = `
      <section class="sec srch"><header><h2>Recherche</h2><span class="mono" id="scount"></span></header>
        <div class="sbar"><input type="search" id="need" placeholder="Parfum, maison, nez, note, envie…" value="${esc(NEED.q)}" autocomplete="off" aria-label="Chercher dans toute la base"><button class="cta" id="needgo"><span>Chercher</span></button></div>
        <div class="seg" id="smode"><button type="button" data-m="disc" class="${NEED.mode === 'disc' ? 'on' : ''}">Je découvre</button><button type="button" data-m="know" class="${NEED.mode === 'know' ? 'on' : ''}">Je sais ce que je cherche</button></div>
        ${act.length ? `<div class="chips actf">${act.map(([k, l]) => `<button class="chip on" data-xa="${esc(k)}">${esc(l)} ✕</button>`).join('')}</div>` : ''}
        <div id="sbody" class="sbody"></div></section>`;
    const re = () => { SRCH.limit = 24; viewSearch(); };
    $$('[data-xa]').forEach((b) => (b.onclick = () => { const k = b.dataset.xa; if (k.startsWith('t:')) SRCH.tags = SRCH.tags.filter((x) => x !== k.slice(2)); else if (k === 'photo') SRCH.photo = false; else SRCH[k] = ''; re(); }));
    const goNeed = () => { NEED.q = $('#need').value; NEED.n = 6; SD.all = false; drawBody(); };
    $('#needgo').onclick = goNeed;
    let tm = 0; $('#need').addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(goNeed, 260); });
    $('#need').addEventListener('keydown', (e) => { if (e.key === 'Enter') { clearTimeout(tm); goNeed(); } });
    $$('#smode button').forEach((b) => (b.onclick = () => { NEED.mode = b.dataset.m; $$('#smode button').forEach((x) => x.classList.toggle('on', x === b)); drawBody(); }));
    drawBody();
  }
  function drawBody() {
    const box = $('#sbody'); if (!box) return;
    const q = (NEED.q || '').trim();
    if (q) return drawUni(box, q);
    if (sFilters()) return drawSearchResults();
    $('#scount').textContent = '';
    if (NEED.mode === 'know') {
      box.innerHTML = `<p class="soft2">Tape un nom de parfum, une maison, un nez, une note, ou décris ce que tu veux. Je cherche dans toute la base de l'app.</p><div class="chips">${NEED_EX.slice(0, 6).map((x) => `<button type="button" class="chip" data-nex="${esc(x)}">${esc(x)}</button>`).join('')}</div>`;
      $$('[data-nex]', box).forEach((b) => (b.onclick = () => { $('#need').value = b.dataset.nex; NEED.q = b.dataset.nex; NEED.n = 6; drawBody(); }));
      return;
    }
    drawDisc(box);
  }
  function drawDisc(box) {
    const db = dbList(), recs = (() => { try { return tipsData().recs.slice(0, 8); } catch (e) { return []; } })(), pop = popularList().slice(0, 18);
    const FAC = [['brand', 'Maison'], ['nose', 'Parfumeur'], ['note', 'Note'], ['style', 'Style'], ['price', 'Prix']];
    const groups = groupsOf(db, SD.facet);
    const look = plLook();
    box.innerHTML = `
      <div class="dsec"><p class="mono">Une envie</p><div class="envies">${ENVIES.map(([l, q]) => `<button type="button" class="envie" data-env="${esc(q)}">${esc(l)}</button>`).join('')}</div></div>
      ${recs.length ? `<div class="dsec"><p class="mono">Pour toi</p><div class="rail">${recs.map((r) => { const e = look.get(entryKey(r.c)) || r.c; return pCard(e, r.pct + ' %'); }).join('')}</div></div>` : ''}
      ${pop.length ? `<div class="dsec"><p class="mono">Les incontournables</p><div class="rail">${pop.map((e) => pCard(e)).join('')}</div></div>` : ''}
      <div class="dsec"><p class="mono">Explorer par</p><div class="chips" id="dfac">${FAC.map(([k, l]) => `<button type="button" class="chip ${SD.facet === k ? 'on' : ''}" data-fac="${k}">${l}</button>`).join('')}</div>
        ${foldWrap(groups.map((g) => `<button type="button" class="chip" data-gk="${esc(g.key)}">${esc(g.label)} <small>${g.items.length}</small></button>`).join(''), 'xg')}</div>`;
    $$('[data-env]', box).forEach((b) => (b.onclick = () => { $('#need').value = b.dataset.env; NEED.q = b.dataset.env; NEED.n = 6; drawBody(); window.scrollTo(0, 0); }));
    $$('[data-fac]', box).forEach((b) => (b.onclick = () => { SD.facet = b.dataset.fac; drawDisc(box); }));
    $$('[data-gk]', box).forEach((b) => (b.onclick = () => { const g = groups.find((x) => x.key === b.dataset.gk); if (!g) return; const f = SD.facet; if (f === 'brand') SRCH.house = g.label; else if (f === 'nose') SRCH.nose = g.label; else if (f === 'note') SRCH.note = g.label; else if (f === 'style') SRCH.style = g.key; else if (f === 'price') SRCH.price = g.key; SRCH.limit = 24; viewSearch(); window.scrollTo(0, 0); }));
    bindEnt(box); initFolds(box);
  }
  // Recherche libre : tout ce qui correspond au texte, regroupé par type (parfums, maisons, nez, notes, styles), puis le besoin compris.
  function drawUni(box, q) {
    const nq = E.norm(q), words = nq.split(' ').filter(Boolean), db = dbList();
    SRCH.q = q; const ps = filterDb(); SRCH.q = '';
    const has = (s) => { const n = E.norm(s); return words.every((w) => n.includes(w)); };
    const cnt = (f) => db.filter((e) => !e.ed && f(e)).length;
    const houses = [...new Set(db.map((e) => e.house))].filter(has).slice(0, 6).map((h) => [h, cnt((e) => e.house === h)]);
    const noses = [...new Set(db.flatMap((e) => e.noses || []))].filter(has).slice(0, 6);
    const notes = nq.length >= 3 ? noteVocab().filter((o) => words.every((w) => o.k.includes(w))).slice(0, 5).map((o) => [o.n, cnt((e) => (e.notes || []).some((x) => E.norm(x).includes(o.k)))]).filter((x) => x[1] > 0) : [];
    const fams = Object.keys(E.FAMILIES).filter((k) => has(famLabel(k))).slice(0, 3);
    const tags = Object.entries(window.TAGS || {}).filter(([k, v]) => has(v)).slice(0, 4);
    const need = E.parseNeed(q), sim = simSearch(q, need), plan = PLAN_RX.test(q) && !/\bfrais|bureau|date|hiver|été|ete\b/i.test(q.replace(/ma collection|ma collec/gi, ''));
    const wantNeed = !!sim || plan || (!need.empty && (!ps.length || words.length >= 3));
    const lim = SD.all ? (SRCH.limit || 24) : 12;
    const chipRow = (title, items) => (items.length ? `<div class="dsec"><p class="mono">${title}</p><div class="chips">${items.join('')}</div></div>` : '');
    $('#scount').textContent = ps.length ? ps.length + ' parfum' + (ps.length > 1 ? 's' : '') : '';
    box.innerHTML = `
      ${ps.length ? `<div class="dsec"><p class="mono">Parfums</p>${SD.all ? `<div class="pgrid">${ps.slice(0, lim).map((e) => pCard(e)).join('')}</div>` : `<div class="rail">${ps.slice(0, 12).map((e) => pCard(e)).join('')}</div>`}${ps.length > lim ? `<button type="button" class="ghost" id="uall" style="justify-self:start">${SD.all ? 'Voir plus' : 'Voir les ' + ps.length}</button>` : ''}</div>` : ''}
      ${chipRow('Maisons', houses.map(([h, n]) => `<button type="button" class="chip" data-uh="${esc(h)}">${esc(h)} <small>${n}</small></button>`))}
      ${chipRow('Parfumeurs', noses.map((n) => `<button type="button" class="chip" data-un="${esc(n)}">${esc(n)}</button>`))}
      ${chipRow('Notes', notes.map(([n, c]) => `<button type="button" class="chip" data-uo="${esc(n)}">${esc(n)} <small>${c}</small></button>`))}
      ${chipRow('Styles', [...fams.map((k) => `<button type="button" class="chip" data-uf="${k}">${esc(famLabel(k))}</button>`), ...tags.map(([k, v]) => `<button type="button" class="chip" data-ut="${k}">${esc(v)}</button>`)])}
      ${wantNeed ? `<div class="dsec"><p class="mono">Selon ton envie</p><div id="nres"></div></div>` : ''}
      ${!ps.length && !houses.length && !noses.length && !notes.length && !fams.length && !tags.length && !wantNeed ? `<div class="empty">Rien dans la base pour « ${esc(q)} ». Essaie un autre mot, ou décris ce que tu veux (frais pour le bureau, vanille sans patchouli…).</div>` : ''}`;
    bindEnt(box);
    const go = (fn) => { SRCH.limit = 24; NEED.q = ''; fn(); viewSearch(); window.scrollTo(0, 0); };
    $$('[data-uh]', box).forEach((b) => (b.onclick = () => go(() => { SRCH.house = b.dataset.uh; })));
    $$('[data-un]', box).forEach((b) => (b.onclick = () => go(() => { SRCH.nose = b.dataset.un; })));
    $$('[data-uo]', box).forEach((b) => (b.onclick = () => go(() => { SRCH.note = b.dataset.uo; })));
    $$('[data-uf]', box).forEach((b) => (b.onclick = () => go(() => { SRCH.style = b.dataset.uf; })));
    $$('[data-ut]', box).forEach((b) => (b.onclick = () => go(() => { SRCH.tags = [b.dataset.ut]; })));
    if ($('#uall', box)) $('#uall', box).onclick = () => { if (SD.all) SRCH.limit = (SRCH.limit || 24) + 24; else { SD.all = true; SRCH.limit = 24; } drawUni(box, q); };
    if (wantNeed) drawNeed();
  }

  // Fiche d'un parfum de la base : description, tags, notes, et les actions (collection, wishlist)
  // Pyramide olfactive (tête, cœur, fond) quand la fiche est détaillée.
  const pyramidOf = (e) => { const y = (window.PYRAMID || {})[E.norm(e.house) + '|' + E.norm(e.name)]; if (!y) return ''; const col = (l, a) => (a && a.length ? `<div><p class="mono">${l}</p><p class="pyn">${a.map(esc).join(' · ')}</p></div>` : ''); return `<div class="pyr3">${col('Tête', y.t)}${col('Cœur', y.h)}${col('Fond', y.b)}</div>`; };
  // Texte descriptif sans tics d'écriture : pas de tirets longs, de deux-points, de flèches ni de point-virgule.
  const cleanTx = (s) => String(s == null ? '' : s)
    .replace(/Notes\s*:\s*Tête\s*:\s*([^;]*?)\s*;\s*C(?:œ|oe)ur\s*:\s*([^;]*?)\s*;\s*Fond\s*:\s*([^.]*)\./i, 'En tête, $1. Au cœur, $2. En fond, $3.')
    .replace(/Notes\s*:\s*/g, 'Avec ')
    .replace(/(\d)\s*[–—-]\s*(\d)/g, '$1 à $2')
    .replace(/\s*→\s*/g, ', puis ')
    .replace(/\s+[–—-]\s+/g, ', ')
    .replace(/[–—]/g, ', ')
    .replace(/\s*;\s*/g, ', ')
    .replace(/\s*:\s+/g, ', ')
    .replace(/,(\s*,)+/g, ',').replace(/,\s*\./g, '.').replace(/\s{2,}/g, ' ').trim();
  const tx = (s) => esc(cleanTx(s));
  const HOUSE_SITE = { 'dior': 'https://www.dior.com/fr_fr/beauty/parfums', 'yves saint laurent': 'https://www.yslbeauty.fr/parfums', 'guerlain': 'https://www.guerlain.com/fr/fr-fr/c/lart-et-la-matiere-collection.html', 'hermes': 'https://www.hermes.com/fr/fr/category/parfums/', 'tom ford': 'https://www.tomfordbeauty.com/collections/fragrance', 'chanel': 'https://www.chanel.com/fr/parfums/', 'parfums de marly': 'https://parfums-de-marly.com/fr/collections/fragrances', 'jo malone': 'https://www.jomalone.fr/products/colognes', 'mancera': 'https://www.manceraparfums.com/fr/', 'khadlaj': 'https://www.fragrantica.fr/designer/Khadlaj-Perfumes.html', 'oman luxury': 'https://odorare.fr/collections/oman-luxury', 'ella k': 'https://www.ellakparfums.com/', 'horace': 'https://www.horace.com/', 'ex nihilo': 'https://www.exnihilo-paris.com/', 'maison francis kurkdjian': 'https://www.franciskurkdjian.com/fr/', 'frederic malle': 'https://www.fredericmalle.com/', 'xerjoff': 'https://www.xerjoff.com/', 'maison crivelli': 'https://www.maisoncrivelli.com/', 'parfum d empire': 'https://www.parfumdempire.com/' };
  const siteOf = (e) => HOUSE_SITE[E.norm(e.house)] || null;
  const goPlaylist = (title) => { const p = (window.PLAYLISTS || []).find((x) => x.t === title); if (!p) return; closeSheet(); tab = 'play'; PL.id = p.id; render(); };
  const goNeedText = (t) => { closeSheet(); tab = 'search'; render(); setTimeout(() => { const n = $('#need'); if (n) { n.value = t; const g = $('#needgo'); if (g) g.click(); window.scrollTo(0, 0); } }, 60); };
  const edOf = (e) => { const ED = window.EDITORIAL || {}, HA = window.HOUSE_ALIAS || {}; return ED[E.norm((HA[E.norm(e.house)] || e.house)) + '|' + E.norm(e.name)] || ED[E.norm(e.house) + '|' + E.norm(e.name)] || null; };
  const edHtml = (e) => {
    const d = edOf(e); if (!d) return '';
    const L = (t, a, cls) => (a && a.length ? `<div><p class="mono">${t}</p><div class="pts ${cls}">${a.map((x) => `<span class="pt">${tx(x)}</span>`).join('')}</div></div>` : '');
    const TIER = { S: 'Incontournable', A: 'Excellent choix', B: 'Très bon' }, DISPO = { restreint: 'Distribution restreinte', secondaire: 'Plutôt marché secondaire', discontinue: 'Discontinué ou introuvable' };
    const facts = [d.an ? String(d.an) : '', d.coll || '', TIER[d.tier] || '', DISPO[d.dispo] || ''].filter(Boolean).join(' · ');
    const nez = d.nez ? `<button class="chip" data-nz="${esc(d.nez.split(',')[0].trim())}">Nez : ${esc(d.nez)}</button>` : '';
    const site = siteOf(e);
    const meta = [d.prix ? '≈ ' + d.prix + ' €' : '', d.achat ? 'Où l\'acheter : ' + d.achat : ''].filter(Boolean).join(' · ');
    return `<div class="edfiche">
      ${facts || nez ? `<div class="chips">${facts ? `<span class="mono">${esc(facts)}</span>` : ''}${nez}</div>` : ''}
      ${d.desc ? `<p class="rd">${tx(d.desc)}</p>` : ''}
      ${L('Ses forces', d.forts, 'ok')}${L('Ses limites', d.faibles, 'lim')}
      ${d.pour ? `<div><p class="mono">Pour qui</p><p class="rd" style="margin-top:6px">${tx(d.pour)}</p></div>` : ''}
      ${d.eviter ? `<div><p class="mono">À éviter</p><p class="rd" style="margin-top:6px">${tx(d.eviter)}</p></div>` : ''}
      ${(d.sit || []).length ? `<div><p class="mono">Situations : toucher pour chercher</p><div class="chips" style="margin-top:8px">${d.sit.map((t) => `<button class="chip" data-gosit="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>` : ''}
      ${d.tenue ? `<div><p class="mono">Tenue</p><p class="rd" style="margin-top:6px">${tx(d.tenue)}</p></div>` : ''}
      ${d.mood ? `<div><p class="mono">Mood</p><p class="rd" style="margin-top:6px">${tx(d.mood)}</p></div>` : ''}
      ${d.duree ? `<div><p class="mono">Tenue sur peau</p><p class="rd" style="margin-top:6px">${tx(d.duree)}</p></div>` : ''}
      ${d.stn ? `<div><p class="mono">Notre avis : sous-coté ou surcoté ?</p><p class="rd" style="margin-top:6px">${tx(d.stn)}</p></div>` : ''}
      ${d.flankers ? `<p style="color:var(--muted);font-size:14px">Variante hors catalogue : ${esc(d.flankers)}</p>` : ''}
      ${meta ? `<p style="color:var(--muted);font-size:14px">${esc(meta)}</p>` : ''}
      ${site ? `<div class="buy"><a class="linkbtn" target="_blank" rel="noopener" href="${site}">Site officiel</a></div>` : ''}
    </div>`;
  };
  let BIOM = null;
  const bioOf = (e) => { if (!BIOM) { BIOM = new Map(); Object.entries(window.BIOS || {}).forEach(([k, v]) => { const [h, n] = k.split('|'); BIOM.set(E.norm(h + ' ' + n), v); const HA = window.HOUSE_ALIAS || {}; BIOM.set(E.norm((HA[E.norm(h)] || h) + ' ' + n), v); }); } const HA = window.HOUSE_ALIAS || {}; return BIOM.get(E.norm(e.house + ' ' + e.name)) || BIOM.get(E.norm((HA[E.norm(e.house)] || e.house) + ' ' + e.name)) || null; };

  // ---------- Fiche standard : même contenu, même ordre, partout (collection, recherche, playlists, conseils, balade) ----------
  const STATUS_L = { culte: 'Culte', sous: 'Sous-coté', sur: 'Très hypé', juste: 'À sa juste valeur' };
  function ficheOf(p) {
    const L = dbList(), hit = L.find((e) => E.norm(e.name) === E.norm(p.name) && (!p.house || E.norm(e.house) === E.norm(p.house))) || L.find((e) => E.norm(e.name) === E.norm(p.name)) || {};
    return Object.assign({}, hit, { name: p.name, house: p.house || hit.house || '' }, p.family ? { family: p.family } : {}, (p.notes && p.notes.length) ? { notes: p.notes } : {}, p.projection ? { projection: p.projection, longevity: p.longevity, weight: p.weight } : {}, p.price ? { price: p.price, pe: false } : {});
  }
  function ficheCore(e) {
    const d = window.DESC && window.DESC[e.name], D = (n) => ({ projection: 'Projection', longevity: 'Tenue', weight: 'Poids' })[n];
    const q = E.profOf ? E.profOf({ name: e.name, house: e.house, notes: e.notes || [], family: e.family }) : null;
    const st = [q && q.st ? STATUS_L[q.st] : '', q && q.pas && !q.derived ? 'À éviter : ' + String(q.pas).slice(0, 90) : ''].filter(Boolean);
    const meters = ['projection', 'longevity', 'weight'].filter((k) => e[k]).map((k) => `<div class="meter"><span>${D(k)}</span>${dots(e[k])}</div>`).join('');
    const sub = [e.house ? `<button type="button" class="lnk" data-gohouse="${esc(e.house)}">${esc(e.house)}</button>` : '', e.family ? `<button type="button" class="lnk" data-gofam="${esc(e.family)}">${(e.guess ? '≈ ' : '') + esc(famLabel(e.family))}</button>` : '', e.conc ? esc(e.conc.split(',').map((x) => CONC_L[x] || x).join(' / ')) : '', e.year ? esc(String(e.year)) : '', e.coll ? esc(e.coll) : ''].filter(Boolean).join(' · ');
    return `<div><h2>${esc(e.name)}</h2><p class="mono" style="margin-top:6px">${sub}</p></div>
      ${(e.tags || []).length ? `<div class="chips">${e.tags.map((t) => `<button type="button" class="chip" data-gotag="${esc(t)}">${esc((window.TAGS || {})[t] || t)}</button>`).join('')}</div>` : ''}
      ${d ? `<p class="rd">${tx(d[1])}</p>` : ''}
      ${st.length ? `<p class="mono" style="text-transform:none">${st.map(tx).join(' · ')}</p>` : ''}
      ${edOf(e) ? edHtml(e) : ''}
      ${edOf(e) ? themeChips(e) : ''}
      ${!edOf(e) && bioOf(e) ? `<div><p class="mono">Son histoire dans les univers Sillage</p><p class="rd" style="margin-top:6px">${tx(bioOf(e)[0])}</p><div class="chips" style="margin-top:8px">${bioOf(e)[1].map((t) => `<button class="chip" data-gopl="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>` : ''}
      ${pyramidOf(e)}
      ${(e.notes || []).length && !pyramidOf(e) ? `<div class="chips">${e.notes.map((n) => `<button type="button" class="chip" data-gonote="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''}
      ${meters ? `<div class="card" style="display:grid;gap:8px">${meters}</div>` : ''}
      <p style="color:var(--muted);font-size:14px">${[e.price ? '≈ ' + e.price + ' € le flacon' + (e.pe ? ' (estimé d\'après sa collection)' : '') : 'Prix à vérifier chez le vendeur', e.guess ? 'Fiche estimée d\'après le nom du parfum.' : ''].filter(Boolean).join(' · ')}</p>
      ${(e.noses || []).length ? `<div><p class="mono">Créé par</p><div class="chips" style="margin-top:8px">${e.noses.slice(0, 4).map((n) => `<button class="chip" data-nz="${esc(n)}">${esc(n)}</button>`).join('')}</div>${e.noses.length >= 3 ? '<p class="mono" style="text-transform:none;letter-spacing:0;margin-top:8px">Plusieurs nez sont cités pour ce parfum : les sources divergent.</p>' : ''}</div>` : ''}`;
  }
  function bindFiche(pn) {
    $$('[data-nz]', pn).forEach((b) => (b.onclick = () => { SRCH.nose = b.dataset.nz; closeSheet(); tab = 'search'; render(); }));
    $$('[data-gopl]', pn).forEach((b) => (b.onclick = () => goPlaylist(b.dataset.gopl)));
    $$('[data-gosit]', pn).forEach((b) => (b.onclick = () => goNeedText(b.dataset.gosit)));
    $$('[data-gotag]', pn).forEach((b) => (b.onclick = () => { closeSheet(); SRCH.tags = [b.dataset.gotag]; SRCH.limit = 40; tab = 'search'; render(); }));
    $$('[data-gonote]', pn).forEach((b) => (b.onclick = () => { closeSheet(); SRCH.note = b.dataset.gonote; SRCH.limit = 40; tab = 'search'; render(); }));
    $$('[data-gohouse]', pn).forEach((b) => (b.onclick = () => { closeSheet(); SRCH.house = b.dataset.gohouse; SRCH.limit = 40; tab = 'search'; render(); }));
    $$('[data-gofam]', pn).forEach((b) => (b.onclick = () => { closeSheet(); SRCH.style = b.dataset.gofam; SRCH.limit = 40; tab = 'search'; render(); }));
    $$('[data-adn]', pn).forEach((b) => { if (!b.onclick) b.onclick = () => goNeedText(b.dataset.adn); });
  }
  function openEntry(e) {
    const inCol = S.collection.some((p) => E.norm(p.name) === E.norm(e.name)), inW = hasWish(e.name);
    const pn = openSheet(`
      <div class="big-bottle">${bt({ name: e.name, house: e.house, family: e.family || 'boisé', id: 'e' + E.norm(e.name).length }, { spray: true })}</div>
      ${ficheCore(e)}
      <div class="row">${inCol ? '<span class="mono">Dans ta collection ✓</span>' : '<button class="cta" id="eown"><span>Je l\'ai</span></button>'}${inW ? '<span class="mono">Dans ta wishlist ♡</span>' : '<button class="ghost" id="ewish">À sentir</button>'}<button class="ghost" id="ex">Fermer</button></div>
      ${buyLinks(e.name, e.house)}`);
    $('#ex', pn).onclick = closeSheet;
    bindFiche(pn);
    if (window.SillageProduct) window.SillageProduct.entry(pn, e);
    if ($('#eown', pn)) $('#eown', pn).onclick = () => { addEntriesToCollection([e]); closeSheet(); render(true); };
    if ($('#ewish', pn)) $('#ewish', pn).onclick = () => { addWish({ name: e.name, house: e.house, family: e.family || '', notes: e.notes || [], price: e.price || 0, st: 'smell' }); save(); closeSheet(); render(true); };
  }
  function addEntriesToCollection(list) { if (window.SillageProduct) list = window.SillageProduct.limitAdd(list); list.forEach((e) => { if (!S.collection.some((p) => E.norm(p.name) === E.norm(e.name) && E.norm(p.house) === E.norm(e.house))) S.collection.push(entryToOwned(e)); }); save(); autoFill(); }
  function openExplore(mode) {
    const pn = openSheet('<div id="exh"></div>');
    mountExplorer($('#exh', pn), mode === 'wish'
      ? { mode: 'wish', title: 'Explorer la base', sub: 'Par maison, style, notes, prix ou parfumeur. Chaque parfum se met en wishlist d\'un toucher.', cta: (n) => 'Mettre ' + n + ' en wishlist', onSubmit: (list) => { list.forEach((e) => addWish({ name: e.name, house: e.house, family: e.family || '', notes: e.notes || [], price: e.price || 0, st: 'smell' })); save(); closeSheet(); tab = 'wish'; render(); } }
      : { mode: 'collection', title: 'Ajoute tes parfums', sub: 'Choisis-les dans la base : par maison, style, notes, prix ou parfumeur.', cta: (n) => 'Ajouter ' + n + ' à ma collection', free: 'Il n\'est pas dans la base ? Écris-le ou prends-le en photo', onFree: () => openAddFree(), onSubmit: (list) => { addEntriesToCollection(list); closeSheet(); tab = 'shelf'; render(); } });
  }

  async function analyzeAdd(pn) {
    const txt0 = $('#addtxt', pn).value.trim(), out = $('#addres', pn), demo = window.SillageDemo, imgUrl = $('#addurl', pn) ? $('#addurl', pn).value.trim() : '';
    if (!txt0 && !SHELF_FILES.length && !imgUrl) { $('#addtxt', pn).focus(); return; }
    if (imgUrl && !/^https:\/\/\S{4,}$/i.test(imgUrl)) { out.innerHTML = '<div class="empty">L\'adresse de l\'image doit commencer par https://</div>'; return; }
    // Les parfums déjà connus (catalogue de l'app, enrichi par les ajouts confirmés) n'ont pas besoin d'IA : zéro coût, zéro erreur.
    const localHits = [], restLines = [];
    txt0.split(txt0.includes('\n') ? /\n/ : /,/).map((x) => x.trim()).filter(Boolean).forEach((l) => { const nm = l.includes(' — ') ? l.split(' — ').slice(1).join(' ') : l; const c = CAT.find((x) => E.norm(x.name) === E.norm(nm)); if (c) localHits.push(Object.assign(fromCat(c), { conf: 0.95 })); else restLines.push(l); });
    const txt = restLines.join('\n');
    out.innerHTML = '<div class="shim"></div><div class="shim" style="width:80%"></div><div class="shim" style="width:60%"></div>'; $('#addgo', pn).disabled = true;
    let items = null;
    try {
      if (!txt && !SHELF_FILES.length && !imgUrl) throw { code: 'local_only' };
      const prompt = `Tu es un expert en parfumerie (niche et designer). L'utilisateur ajoute des parfums à sa collection, en vrac${SHELF_FILES.length ? ' et via photo(s) de flacons ou d\'étagère' : ''}. Texte saisi : """${txt || '(aucun)'}"""\nIdentifie chaque parfum (corrige les fautes, complète la maison). Réponds UNIQUEMENT par un JSON : {"items":[{"name":"nom officiel","house":"maison","family":"${FAMS}","notes":["5 notes en français, de l'ouverture au fond"],"projection":1-5,"longevity":1-5,"weight":1-5 (1 frais et léger, 5 chaud et dense),"price":nombre en euros indicatif,"confidence":0 à 1}]}. Si tu ne reconnais pas un parfum, mets confidence sous 0.4 et ta meilleure estimation.`;
      const j = demo ? await demo.identify({ text: txt, url: imgUrl, file: SHELF_FILES[0] }) : await aiJson(prompt, { modelTier: 'quick', images: SHELF_FILES.length && CAN_IMG ? SHELF_FILES : undefined });
      items = (j.items || []).map((it) => ({ ai: true, id: uid(), name: String(it.name || '').trim(), house: String(it.house || '').trim(), family: E.FAMILIES[it.family] ? it.family : 'boisé', notes: (it.notes || []).map(String).slice(0, 6), projection: clamp(Math.round(+it.projection || 3), 1, 5), longevity: clamp(Math.round(+it.longevity || 3), 1, 5), weight: clamp(Math.round(+it.weight || 3), 1, 5), price: Math.round(+it.price) || 0, rating: 0, occ: [], conf: +it.confidence || 0.7 })).filter((it) => it.name);
      items = localHits.concat(items);
      if (items.length && items.filter((it) => it.ai).length === 1 && (SHELF_FILES[0] || imgUrl)) { try { const th = await cutout(SHELF_FILES[0] || imgUrl); if (th) items.find((it) => it.ai).src = th; } catch (er) { /* image protégée : flacon dessiné */ } }
    } catch (e) {
      items = restLines.map((l) => {
        const n = E.norm(l); const c = CAT.find((x) => n.length >= 4 && (E.norm(x.name).includes(n) || n.includes(E.norm(x.name))));
        return c ? Object.assign(fromCat(c), { conf: 0.9 }) : null;
      }).filter(Boolean);
      items = localHits.concat(items);
      if (e && e.code !== 'local_only') out.insertAdjacentHTML('beforebegin', e.code === 'rate_limited' ? '<p class="mono" style="text-transform:none">Les analyses de démo sont épuisées : seuls les parfums du catalogue sont reconnus. <button class="linkbtn" data-sell>Version complète</button></p>' : '<p class="mono" style="text-transform:none">L\'IA n\'est pas disponible pour l\'instant : seuls les parfums du catalogue sont reconnus.</p>');
    }
    items = items.filter((it) => !S.collection.some((p) => E.norm(p.name) === E.norm(it.name)));
    items.forEach((it) => { if (it.size == null) { it.size = 100; it.left = 100; it.use = 'free'; } });
    PRE = items;
    out.innerHTML = items.length ? items.map((it, i) => `<div class="prew"><div class="pre" style="--i:${i}">${bt(it, { still: true })}<div><b>${esc(it.name)}</b><small>${esc(it.house)} · ${esc(famLabel(it.family))}${it.conf < 0.4 ? ' · à vérifier' : ''}</small></div><button class="ghost" data-rm="${i}" aria-label="Retirer">✕</button></div>${stockHtml(it, i)}</div>`).join('') + `<button class="cta full" id="addok"><span>Ajouter ${items.length} parfum${items.length > 1 ? 's' : ''}</span></button>` : '<div class="empty">Rien de nouveau reconnu. Essaie avec le nom et la maison.</div>';
    $$('[data-rm]', out).forEach((b) => (b.onclick = () => { PRE[+b.dataset.rm] = null; b.closest('.prew').remove(); }));
    bindStock(out, (i) => PRE[i], () => {});
    if ($('#addok', out)) $('#addok', out).onclick = () => { const added = PRE.filter(Boolean); if (demo && demo.confirm) demo.confirm(added.filter((it) => it.ai).map((it) => it.name)); added.forEach((it) => { delete it.conf; delete it.ai; delete it.useSet; S.collection.push(it); }); save(); closeSheet(); tab = 'shelf'; render(); };
    $('#addgo', pn).disabled = false;
  }

  // Détourage léger d'une photo de flacon (fond uni → transparent), tout dans le navigateur. Échoue proprement si l'image est protégée.
  async function cutout(src) {
    const img = await new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = typeof src === 'string' ? src : URL.createObjectURL(src); });
    const k = Math.min(1, 360 / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, w, h);
    const im = g.getImageData(0, 0, w, h), d = im.data, px = (x, y) => (y * w + x) * 4;
    let r = 0, gg = 0, b = 0, n = 0; for (const [cx, cy] of [[1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2]]) { const o = px(cx, cy); r += d[o]; gg += d[o + 1]; b += d[o + 2]; n++; } r /= n; gg /= n; b /= n;
    const seen = new Uint8Array(w * h), stack = [], near = (o) => Math.abs(d[o] - r) + Math.abs(d[o + 1] - gg) + Math.abs(d[o + 2] - b) < 70;
    const push = (x, y) => { const i = y * w + x; if (!seen[i] && near(i * 4)) { seen[i] = 1; stack.push(i); } };
    for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); } for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
    while (stack.length) { const i = stack.pop(), x = i % w, y = (i - x) / w; if (x > 0) push(x - 1, y); if (x < w - 1) push(x + 1, y); if (y > 0) push(x, y - 1); if (y < h - 1) push(x, y + 1); }
    let x0 = w, y0 = h, x1 = 0, y1 = 0, kept = 0; for (let i = 0; i < w * h; i++) { if (seen[i]) d[i * 4 + 3] = 0; else { kept++; const x = i % w, y = (i - x) / w; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    if (kept < w * h * 0.06 || kept > w * h * 0.9) return null; // fond non uni : on garde le flacon dessiné
    g.putImageData(im, 0, 0); const m = 4, o2 = document.createElement('canvas'); o2.width = x1 - x0 + 1 + 2 * m; o2.height = y1 - y0 + 1 + 2 * m;
    o2.getContext('2d').drawImage(c, x0, y0, x1 - x0 + 1, y1 - y0 + 1, m, m, x1 - x0 + 1, y1 - y0 + 1); return o2.toDataURL('image/webp', 0.82);
  }
  // Catalogue partagé : les parfums confirmés par d'autres personnes rejoignent le catalogue (reconnus sans IA, sans erreur).
  function mergeCommunity() {
    const D = window.SillageDemo; if (!D || !D.catalog) return;
    D.catalog().then((items) => { let n = 0; (items || []).forEach((it) => { if (it && it.name && !CAT.some((c) => E.norm(c.name) === E.norm(it.name))) { CAT.push({ name: it.name, house: it.house || '', family: E.FAMILIES[it.family] ? it.family : 'boisé', notes: it.notes || [], projection: it.projection || 3, longevity: it.longevity || 3, weight: it.weight || 3, price: it.price || 0 }); n++; } }); }).catch(() => {});
  }

  function openProfile() {
    const s = S.settings;
    const pf = hasProfile() ? S.profile : { gender: '', age: null, name: '' };
    const pn = openSheet(`<div><h2>Profil</h2><p style="color:var(--muted);margin-top:6px">Plus ton profil est précis, plus mes conseils sont justes.</p></div>
      <div class="card" style="display:grid;gap:10px"><b>Moi</b><div class="chips" id="pgen">${GEN.map(([k, l]) => `<button class="chip ${pf.gender === k ? 'on' : ''}" data-pg="${k}">${l}</button>`).join('')}</div>
        <input type="text" id="pname" maxlength="24" value="${esc(pf.name || '')}" placeholder="Mon prénom" aria-label="Mon prénom">
        <input type="text" id="page" inputmode="numeric" maxlength="2" value="${pf.age || ''}" placeholder="Mon âge" aria-label="Mon âge"><p class="mono" id="pmsg" style="text-transform:none;letter-spacing:0">Enregistré automatiquement, utilisé chaque jour. Ta tenue, je te la demande quand tu cherches ton parfum.</p></div>
      <div class="card" style="display:grid;gap:14px"><b>Mon style d'achat</b>${tierPick()}</div>
      ${window.SillageDemo ? (window.SillageDemo.account.loggedIn() ? `<div class="card" style="display:grid;gap:10px"><b>Mon compte</b><p class="mono" style="text-transform:none;letter-spacing:0">Connecté : ${esc(window.SillageDemo.account.email())}. Ton profil est sauvegardé automatiquement.</p><div class="row"><button class="ghost" id="alogout">Me déconnecter</button><button class="ghost danger" id="adel">Supprimer mon compte</button></div></div>` : `<div class="card" style="display:grid;gap:10px"><b>Mon compte</b><p class="mono" style="text-transform:none;letter-spacing:0">Crée un compte pour garder ton profil, ta collection et ta wishlist sur tous tes appareils.</p><button class="cta" id="acreate"><span>Créer un compte ou me connecter</span></button></div>`) : ''}
      <div id="tedit" class="tprof"></div>
      <div class="card" style="display:grid;gap:10px"><b>Sauvegarde</b><div class="row"><button class="ghost" id="exp">Exporter en texte</button><button class="ghost" id="imp">Importer</button></div><textarea id="io" rows="3" placeholder="Le texte de sauvegarde apparaît ici, ou colle-le pour importer"></textarea><p class="mono" id="iomsg" style="text-transform:none"></p></div>
      <div class="row"><button class="ghost danger" id="reset">Tout vider</button></div>`);
    const pmsg = () => { $('#pmsg', pn).textContent = 'Enregistré ✓'; };
    $$('[data-pg]', pn).forEach((b) => (b.onclick = () => { setProfile({ gender: b.dataset.pg }); $$('[data-pg]', pn).forEach((x) => x.classList.toggle('on', x === b)); pmsg(); }));
    $('#page', pn).onchange = () => { setProfile({ age: cleanAge($('#page', pn).value) }); pmsg(); };
    $('#pname', pn).onchange = () => { setProfile({ name: $('#pname', pn).value.trim().slice(0, 24) }); pmsg(); };
    bindTier(pn, () => { const m = $('#pmsg', pn); if (m) m.textContent = 'Enregistré ✓'; });
    if ($('#acreate', pn)) $('#acreate', pn).onclick = () => { closeSheet(); showAccount('profile'); };
    if ($('#alogout', pn)) $('#alogout', pn).onclick = async () => { await window.SillageDemo.account.logout(); if (needAcct()) afterLeave(); else { closeSheet(); render(true); } };
    if ($('#adel', pn)) $('#adel', pn).onclick = async (e) => { if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = 'Confirmer la suppression'; return; } try { await window.SillageDemo.account.remove(); } catch (er) { /* déjà supprimé */ } if (needAcct()) afterLeave(); else { closeSheet(); render(true); } };
    if (window.SillageProduct) window.SillageProduct.profile(pn);
    mountTaste($('#tedit', pn), ['vibes', 'occ']);
    { const nc = document.createElement('div'); nc.className = 'card'; nc.style.cssText = 'display:grid;gap:10px'; const nl = [...(S.settings.liked || [])].length, na = [...(S.settings.avoid || [])].length; nc.innerHTML = `<b>Mes notes</b><p class="soft small" style="margin:0">${nl} aimée${nl > 1 ? 's' : ''}, ${na} fuie${na > 1 ? 's' : ''}. Elles sont rangées par famille.</p><button class="ghost" id="pnotes" type="button">Ouvrir mes notes</button>`; const ta = $('#tedit', pn); ta.parentNode.insertBefore(nc, ta); $('#pnotes', nc).onclick = openNotes; }
    $('#exp', pn).onclick = () => { const t = $('#io', pn); t.value = JSON.stringify(S); t.select(); try { navigator.clipboard.writeText(t.value).then(() => { $('#iomsg', pn).textContent = 'Copié. Garde ce texte dans tes notes.'; }, () => { $('#iomsg', pn).textContent = 'Sélectionné : copie-le à la main.'; }); } catch (e) { $('#iomsg', pn).textContent = 'Sélectionné : copie-le à la main.'; } };
    $('#imp', pn).onclick = () => { try { const d = JSON.parse($('#io', pn).value); if (!Array.isArray(d.collection)) throw 0; S = Object.assign(DEF(), d); save(); closeSheet(); render(); } catch (e) { $('#iomsg', pn).textContent = 'Sauvegarde invalide.'; } };
    $('#reset', pn).onclick = (e) => { if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = 'Confirmer : tout vider'; return; } S = DEF(); S.collection = []; S.wishlist = []; save(); closeSheet(); render(); };
  }


  // ---------- Photos réelles (assets) ----------
  async function shrink(file, max) {
    const bmp = await createImageBitmap(file), k = Math.min(1, (max || 900) / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return new Promise((r) => c.toBlob(r, 'image/jpeg', .86));
  }
  async function putPhoto(file) {
    const c = window.claude, A = c && c.use ? await c.use('assets') : null; if (!A) throw { code: 'unavailable' };
    const r = await A.upload(await shrink(file, 900)); return r.id;
  }
  function openPhotos() {
    const pn = openSheet(`<div><h2>Tes vraies photos</h2><p style="color:var(--muted);margin-top:6px">Choisis des photos de flacons (captures du site de la marque, photos perso). L'IA reconnaît chaque flacon et le range au bon parfum.</p></div>
      <input type="file" id="phs" accept="image/*" multiple hidden><button class="cta full" id="phpick">${IC.cam}<span>Choisir jusqu'à ${IMG_MAX} photos</span></button><div id="phres" style="display:grid;gap:10px"></div>`);
    $('#phpick', pn).onclick = () => $('#phs', pn).click();
    $('#phs', pn).onchange = async (e) => {
      const files = [...e.target.files].slice(0, IMG_MAX), out = $('#phres', pn); if (!files.length) return;
      out.innerHTML = '<div class="shim"></div><div class="shim" style="width:70%"></div>';
      try {
        const prompt = `Chaque image jointe montre un flacon de parfum (photo ou packshot), dans l'ordre 0, 1, 2… Ma collection (id | nom | maison) :\n${S.collection.map((p) => `${p.id} | ${p.name} | ${p.house}`).join('\n')}\n\nPour chaque image, donne l'id du parfum de ma collection qu'elle montre, ou null si tu n'en es pas sûr. Réponds UNIQUEMENT par un JSON : {"matches":[{"index":0,"id":"…","seen":"ce que tu lis sur le flacon"}]}`;
        const j = await aiJson(prompt, { modelTier: 'default', images: files });
        let ok = 0; const lines = [];
        for (const m of (j.matches || [])) { const p = find(m.id), f = files[m.index]; if (!p || !f) { lines.push(`Image ${m.index + 1} : non reconnue`); continue; } try { p.img = await putPhoto(f); ok++; lines.push(`${p.name} ✓`); } catch (er) { lines.push(`${p.name} : envoi impossible`); } }
        save(); out.innerHTML = `<div class="card"><b>${ok} photo${ok > 1 ? 's' : ''} associée${ok > 1 ? 's' : ''}</b><p style="color:var(--muted);margin-top:6px">${lines.map(esc).join('<br>')}</p></div>`; render(true);
      } catch (er) { out.innerHTML = `<div class="empty">${er && er.code === 'not_granted' ? 'Autorise l\'IA pour reconnaître les flacons.' : 'Reconnaissance impossible ici. Tu peux ajouter une photo à la main depuis la fiche de chaque parfum.'}</div>`; }
    };
  }

  // ---------- Labo d'accords ----------
  function openLab() {
    let A = null, B = null;
    const row = (k) => S.collection.map((p) => `<button class="pk" data-k="${k}" data-id="${p.id}">${bt(p, { still: true })}<span>${esc(p.name)}</span></button>`).join('');
    const pn = openSheet(`<div><h2>Labo d'accords</h2><p style="color:var(--muted);margin-top:6px">Choisis deux flacons de ta collection, je te dis ce que leur mélange donne.</p></div>
      <p class="mono">flacon A</p><div class="pickrow" id="rA">${row('A')}</div><p class="mono">flacon B</p><div class="pickrow" id="rB">${row('B')}</div>
      <div class="row"><button class="cta" id="mix"><span>Mélanger</span></button><button class="ghost" id="cmp">Comparer</button></div><div id="mixres" style="display:grid;gap:14px"></div>`);
    $('#cmp', pn).onclick = async () => {
      const out = $('#mixres', pn);
      if (!A || !B || A === B) { out.innerHTML = '<p class="mono">Choisis deux flacons différents.</p>'; return; }
      const a = find(A), b = find(B), card = (p) => `<div>${bt(p, { still: true })}<b>${esc(p.name)}</b><small>${esc(p.house)} · ${esc(famLabel(p.family))}</small><small>${esc((p.notes || []).join(', '))}</small><div class="meter"><span>Projection</span>${dots(p.projection)}</div><div class="meter"><span>Tenue</span>${dots(p.longevity)}</div><div class="meter"><span>Poids</span>${dots(p.weight)}</div><small>${p.price ? '≈ ' + p.price + ' €' : 'prix à vérifier'} · ${wears(p.id)} port(s)</small></div>`;
      out.innerHTML = `<div class="cmp">${card(a)}${card(b)}</div><div class="shim"></div><div class="shim" style="width:70%"></div>`;
      try {
        const r = await aiJson(`Compare ces deux parfums de ma collection pour m'aider à choisir, tutoiement, concret.\nA : ${a.name} (${a.house}) — ${a.family} — ${a.notes.join(', ')} — proj ${a.projection}/5, tenue ${a.longevity}/5\nB : ${b.name} (${b.house}) — ${b.family} — ${b.notes.join(', ')} — proj ${b.projection}/5, tenue ${b.longevity}/5\nRéponds UNIQUEMENT par un JSON : {"a":"quand choisir A, 14 mots max","b":"quand choisir B, 14 mots max","verdict":"1 phrase de conclusion"}`, { modelTier: 'default' });
        out.querySelectorAll('.shim').forEach((x) => x.remove());
        out.insertAdjacentHTML('beforeend', `<p><span class="mono">Choisis ${esc(a.name)}</span><br>${esc(r.a)}</p><p><span class="mono">Choisis ${esc(b.name)}</span><br>${esc(r.b)}</p><p style="color:var(--accent-deep)">${esc(r.verdict)}</p>`);
      } catch (e) { out.querySelectorAll('.shim').forEach((x) => x.remove()); }
    };
    $$('.pk', pn).forEach((b) => (b.onclick = () => { $$(`.pk[data-k="${b.dataset.k}"]`, pn).forEach((x) => x.classList.toggle('sel', x === b)); if (b.dataset.k === 'A') A = b.dataset.id; else B = b.dataset.id; }));
    $('#mix', pn).onclick = async () => {
      const out = $('#mixres', pn);
      if (!A || !B || A === B) { out.innerHTML = '<p class="mono" style="text-transform:none">Choisis deux flacons différents.</p>'; return; }
      const a = find(A), b = find(B), PA = Art.pal(a), PB = Art.pal(b);
      out.innerHTML = `<div class="mixstage"><i class="orb" style="background:linear-gradient(135deg,${PA.b},${PB.b})"></i>${bt(a, { still: true, cls: 'la' })}${bt(b, { still: true, cls: 'lb' })}</div><div class="shim"></div><div class="shim" style="width:60%"></div>`;
      $('#mix', pn).disabled = true;
      let r;
      try {
        r = await aiJson(`Tu es un nez de parfumerie. Évalue la superposition (layering) de ces deux parfums, tutoiement, concret.\nA : ${a.name} (${a.house}) — ${a.family} — ${a.notes.join(', ')}\nB : ${b.name} (${b.house}) — ${b.family} — ${b.notes.join(', ')}\nRéponds UNIQUEMENT par un JSON : {"score":1-5,"verdict":"4 mots max","effect":"ce que le mélange donne, 2 phrases","how":"ordre, dosage en sprays, où vaporiser, 2 phrases","warn":"vide, ou 1 phrase de mise en garde"}`, { modelTier: 'default' });
      } catch (e) {
        const ps = E.pairScore(a, b, false), sc = clamp(Math.round(ps.s + 1.5), 1, 5);
        r = { score: sc, verdict: sc >= 4 ? 'Accord réussi' : sc >= 3 ? 'Bon accord' : 'Accord risqué', effect: ps.shared.length ? `Ils partagent ${ps.shared.join(', ')} : le mélange se fond naturellement.` : 'Deux univers différents : le mélange crée un troisième parfum.', how: 'Applique le plus dense d\'abord, le plus léger par-dessus, 1 à 2 sprays de chaque.', warn: '' };
      }
      out.querySelectorAll('.shim').forEach((x) => x.remove());
      out.insertAdjacentHTML('beforeend', `<div class="row" style="justify-content:space-between;align-items:flex-end"><div><p class="mono">verdict</p><h2>${esc(r.verdict)}</h2></div><span class="score">${clamp(Math.round(+r.score || 3), 1, 5)}<small style="font-size:18px;color:var(--muted)">/5</small></span></div><p>${esc(r.effect)}</p><p style="color:var(--muted)">${esc(r.how)}</p>${r.warn ? `<p style="color:var(--accent)">${esc(r.warn)}</p>` : ''}`);
      $('#mix', pn).disabled = false;
    };
  }

  // ---------- Mode voyage ----------
  function openTravel() {
    const pn = openSheet(`<div><h2>Mode voyage</h2><p style="color:var(--muted);margin-top:6px">Dis-moi où tu vas et ce que tu y fais. Je choisis les 2 ou 3 flacons à emporter.</p></div>
      <textarea id="ttxt" rows="3" placeholder="5 jours à Londres en novembre, réunions le jour, dîners le soir…"></textarea>
      <button class="cta full" id="tgo"><span>Faire ma valise</span></button><div id="tres" style="display:grid;gap:12px"></div>`);
    $('#tgo', pn).onclick = async () => {
      const out = $('#tres', pn), txt = $('#ttxt', pn).value.trim(); if (!txt) { $('#ttxt', pn).focus(); return; }
      out.innerHTML = '<div class="shim"></div><div class="shim" style="width:70%"></div>'; $('#tgo', pn).disabled = true;
      try {
        const j = await aiJson(`Tu es un nez de parfumerie. Je voyage. Choisis 2 ou 3 parfums de ma collection à emporter (couvrir jour, soir, météo du lieu et de la saison), sans redondance.\nMa collection :\n${colLines()}\nVoyage : """${txt}"""\nRéponds UNIQUEMENT par un JSON : {"picks":[{"id":"","when":"quand le porter, 8 mots max","why":"pourquoi, 1 phrase"}],"tip":"conseil de bagage (format voyage, protection du flacon), 1 phrase"}. N'utilise que les id fournis.`, { modelTier: 'default' });
        const rows = (j.picks || []).map((x) => ({ p: find(x.id), when: x.when, why: x.why })).filter((r) => r.p).slice(0, 3);
        out.innerHTML = rows.map((r, i) => `<div class="wk" style="--i:${i}">${bt(r.p, { still: true })}<div><span class="d">${esc(r.when || '')}</span><br><b>${esc(r.p.name)}</b><p>${esc(r.why || '')}</p></div></div>`).join('') + (j.tip ? `<p class="mono" style="text-transform:none;letter-spacing:0;font-size:13px">${esc(j.tip)}</p>` : '');
      } catch (e) { out.innerHTML = `<div class="empty">${e && e.code === 'not_granted' ? 'Autorise l\'IA pour préparer ta valise.' : 'L\'IA n\'est pas disponible dans cette vue.'}</div>`; }
      $('#tgo', pn).disabled = false;
    };
  }

  // ---------- Météo automatique (Open-Meteo, sans clé) ----------
  // Fonctionne sur le site public. Dans claude.ai la page n'a pas accès au réseau : le bouton disparaît.
  const WMO = (c) => (c === 0 ? 'ciel dégagé' : c <= 3 ? 'nuageux' : c <= 48 ? 'brouillard' : c <= 57 ? 'bruine' : c <= 67 ? 'pluie' : c <= 77 ? 'neige' : c <= 82 ? 'averses' : c <= 86 ? 'neige' : 'orage');
  let WXSTATE = 'idle'; // idle | loading | ok | blocked
  async function fetchWeather(lat, lon, place) {
    WXSTATE = 'loading'; refreshWxLine();
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`);
      if (!r.ok) throw new Error('http');
      const c = (await r.json()).current, t = Math.round(c.apparent_temperature), code = c.weather_code;
      const rain = (code >= 51 && code <= 67) || (code >= 71 && code <= 99);
      WX = { k: 'auto', l: 'Météo actuelle', t, rain, hum: c.relative_humidity_2m };
      AUTOW = `${t}° · ${WMO(code)}${place ? ' · ' + place : ''}`;
      S.settings.weatherOn = true; S.settings.geo = { lat, lon, place: place || '', ts: Date.now() }; save();
      WXSTATE = 'ok';
    } catch (e) { WXSTATE = 'blocked'; }
    if (tab === 'today' && $('#story').hidden && $('#sheet').hidden) viewToday();
  }
  function refreshWxLine() { const b = $('#wxAuto'); if (b) b.textContent = 'Je regarde le ciel…'; }
  async function geocodeCity(name) {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=fr`);
    const g = ((await r.json()).results || [])[0]; if (!g) throw new Error('nf');
    return { lat: g.latitude, lon: g.longitude, place: g.name };
  }
  function autoWeather(interactive) {
    const g = S.settings.geo;
    if (g && Date.now() - g.ts < 30 * 60 * 1000 && !interactive) { return fetchWeather(g.lat, g.lon, g.place); }
    if (g && !interactive) return fetchWeather(g.lat, g.lon, g.place);
    if (!navigator.geolocation) return openCity();
    WXSTATE = 'loading'; refreshWxLine();
    navigator.geolocation.getCurrentPosition((p) => fetchWeather(p.coords.latitude, p.coords.longitude, ''), () => { WXSTATE = 'idle'; openCity(); }, { timeout: 9000, maximumAge: 600000 });
  }
  function openCity() {
    const pn = openSheet(`<div><h2>Ta ville</h2><p style="color:var(--muted);margin-top:6px">Je n'ai pas ta position. Donne-moi ta ville pour la météo du jour.</p></div><input type="text" id="cty" placeholder="Paris, Lyon, Marseille…" value="${esc((S.settings.geo && S.settings.geo.place) || '')}"><button class="cta full" id="ctyGo"><span>Valider</span></button><p class="mono" id="ctyMsg" style="text-transform:none"></p>`);
    $('#ctyGo', pn).onclick = async () => {
      const v = $('#cty', pn).value.trim(); if (!v) return;
      $('#ctyMsg', pn).textContent = 'Je cherche…';
      try { const g = await geocodeCity(v); closeSheet(); await fetchWeather(g.lat, g.lon, g.place); } catch (e) { $('#ctyMsg', pn).textContent = 'Ville introuvable, ou pas de connexion à la météo.'; }
    };
  }
  // ---------- Où acheter près de moi : carte OpenStreetMap + parfumeries autour de la position ----------
  const CITIES = 'Paris,48.857,2.352,France;Marseille,43.296,5.370,France;Lyon,45.764,4.836,France;Toulouse,43.605,1.444,France;Nice,43.710,7.262,France;Nantes,47.218,-1.554,France;Montpellier,43.611,3.877,France;Strasbourg,48.573,7.752,France;Bordeaux,44.838,-0.579,France;Lille,50.629,3.057,France;Rennes,48.117,-1.678,France;Reims,49.258,4.032,France;Le Havre,49.494,0.108,France;Saint-Étienne,45.440,4.387,France;Toulon,43.124,5.928,France;Grenoble,45.189,5.724,France;Dijon,47.322,5.041,France;Angers,47.478,-0.563,France;Nîmes,43.837,4.360,France;Clermont-Ferrand,45.777,3.087,France;Le Mans,48.006,0.199,France;Aix-en-Provence,43.530,5.447,France;Brest,48.390,-4.486,France;Tours,47.394,0.685,France;Amiens,49.894,2.296,France;Limoges,45.831,1.261,France;Metz,49.119,6.176,France;Perpignan,42.699,2.895,France;Besançon,47.238,6.024,France;Orléans,47.903,1.909,France;Rouen,49.443,1.099,France;Mulhouse,47.751,7.336,France;Caen,49.182,-0.371,France;Nancy,48.693,6.184,France;Avignon,43.949,4.806,France;Cannes,43.553,7.017,France;Antibes,43.581,7.125,France;Saint-Tropez,43.272,6.640,France;Monaco,43.738,7.425,Monaco;La Rochelle,46.160,-1.151,France;Biarritz,43.483,-1.559,France;Pau,43.295,-0.371,France;Poitiers,46.580,0.340,France;Annecy,45.899,6.129,France;Chambéry,45.565,5.921,France;Valence,44.933,4.892,France;Ajaccio,41.919,8.739,France;Bastia,42.697,9.450,France;Troyes,48.297,4.074,France;Lorient,47.748,-3.370,France;Vannes,47.658,-2.760,France;Quimper,47.996,-4.102,France;Saint-Malo,48.649,-2.026,France;Colmar,48.079,7.358,France;Versailles,48.805,2.130,France;Boulogne-Billancourt,48.835,2.240,France;Neuilly-sur-Seine,48.885,2.269,France;Saint-Denis,48.936,2.357,France;Montreuil,48.861,2.443,France;La Défense,48.892,2.236,France;Bruxelles,50.850,4.352,Belgique;Anvers,51.220,4.400,Belgique;Liège,50.633,5.567,Belgique;Genève,46.204,6.143,Suisse;Lausanne,46.520,6.633,Suisse;Zurich,47.377,8.541,Suisse;Berne,46.948,7.447,Suisse;Luxembourg,49.611,6.132,Luxembourg;Londres,51.507,-0.128,Royaume-Uni;London,51.507,-0.128,Royaume-Uni;Manchester,53.481,-2.243,Royaume-Uni;Édimbourg,55.953,-3.189,Royaume-Uni;Dublin,53.350,-6.260,Irlande;Madrid,40.417,-3.704,Espagne;Barcelone,41.385,2.173,Espagne;Valence (Espagne),39.470,-0.376,Espagne;Séville,37.389,-5.984,Espagne;Lisbonne,38.722,-9.139,Portugal;Porto,41.150,-8.611,Portugal;Rome,41.903,12.496,Italie;Milan,45.464,9.190,Italie;Florence,43.770,11.255,Italie;Venise,45.441,12.316,Italie;Naples,40.852,14.268,Italie;Turin,45.070,7.687,Italie;Berlin,52.520,13.405,Allemagne;Munich,48.137,11.575,Allemagne;Hambourg,53.551,9.994,Allemagne;Francfort,50.110,8.682,Allemagne;Cologne,50.938,6.960,Allemagne;Düsseldorf,51.227,6.774,Allemagne;Vienne,48.209,16.373,Autriche;Amsterdam,52.370,4.895,Pays-Bas;Copenhague,55.676,12.568,Danemark;Stockholm,59.329,18.069,Suède;Oslo,59.914,10.752,Norvège;Helsinki,60.170,24.938,Finlande;Varsovie,52.230,21.012,Pologne;Prague,50.075,14.438,Tchéquie;Budapest,47.498,19.040,Hongrie;Athènes,37.984,23.728,Grèce;Istanbul,41.008,28.978,Turquie;Dubaï,25.205,55.271,Émirats arabes unis;Dubai,25.205,55.271,Émirats arabes unis;Abou Dabi,24.454,54.377,Émirats arabes unis;Doha,25.285,51.531,Qatar;Riyad,24.714,46.675,Arabie saoudite;Casablanca,33.573,-7.590,Maroc;Marrakech,31.629,-7.981,Maroc;Tanger,35.759,-5.834,Maroc;Tunis,36.807,10.182,Tunisie;Alger,36.753,3.059,Algérie;Le Caire,30.044,31.236,Égypte;Dakar,14.693,-17.447,Sénégal;Abidjan,5.360,-4.008,Côte d\'Ivoire;New York,40.713,-74.006,États-Unis;Los Angeles,34.052,-118.244,États-Unis;Miami,25.762,-80.192,États-Unis;Chicago,41.878,-87.630,États-Unis;San Francisco,37.775,-122.419,États-Unis;Las Vegas,36.170,-115.140,États-Unis;Montréal,45.502,-73.567,Canada;Toronto,43.653,-79.383,Canada;Vancouver,49.283,-123.121,Canada;Québec,46.813,-71.208,Canada;Mexico,19.433,-99.133,Mexique;São Paulo,-23.551,-46.633,Brésil;Rio de Janeiro,-22.907,-43.173,Brésil;Buenos Aires,-34.604,-58.382,Argentine;Tokyo,35.690,139.692,Japon;Kyoto,35.012,135.768,Japon;Osaka,34.694,135.502,Japon;Séoul,37.567,126.978,Corée du Sud;Pékin,39.904,116.407,Chine;Shanghai,31.230,121.474,Chine;Hong Kong,22.320,114.169,Chine;Singapour,1.352,103.820,Singapour;Bangkok,13.756,100.502,Thaïlande;Mumbai,19.076,72.878,Inde;Delhi,28.614,77.209,Inde;Sydney,-33.869,151.209,Australie;Melbourne,-37.814,144.963,Australie;Saint-Pétersbourg,59.931,30.361,Russie;Moscou,55.756,37.617,Russie'.split(';').map((x) => { const a = x.split(','); return { place: a[0], lat: +a[1], lon: +a[2], sub: a[3] }; });
  const kmBetween = (a, b, c, d) => { const r = Math.PI / 180, x = (c - a) * r, y = (d - b) * r * Math.cos(((a + c) / 2) * r); return 6371 * Math.sqrt(x * x + y * y); };
  const SHOP_CHAINS = [['Sephora', 'Sephora'], ['Nocibé', 'Nocibé'], ['Marionnaud', 'Marionnaud'], ['Douglas', 'Douglas'], ['Grands magasins', 'grand magasin parfumerie'], ['Parfumerie de niche', 'parfumerie niche']];
  const PARIS_SHOPS = [['Jovoy Paris', '4 rue de Castiglione, 75001', 'Niche et luxe, un des meilleurs choix de la capitale.'], ['Nose', '20 rue Bachaumont, 75002', 'Concept store de la niche, avec des conseillers.'], ['Officine Universelle Buly', '6 rue de Bourbon-le-Château, 75006', 'Parfumerie et apothicaire à l\'ancienne.'], ['Frédéric Malle, Éditions de Parfums', '37 rue de Grenelle, 75007', 'La boutique de la maison.'], ['Maison Francis Kurkdjian', '5 rue d\'Alger, 75001', 'La boutique de la maison.'], ['Diptyque', '34 boulevard Saint-Germain, 75005', 'La boutique historique.'], ['Le Bon Marché Rive Gauche', '24 rue de Sèvres, 75007', 'Un grand rayon parfum, niche comprise.'], ['Sephora Champs-Élysées', '70 avenue des Champs-Élysées, 75008', 'Le grand magasin de la marque.']];
  const SHOP_SEG = { niche: 'Niche', prem: 'Premium', main: 'Mainstream', ind: 'Indépendante', gm: 'Grand magasin', cos: 'Cosmétiques et parfums' };
  const SHOP_FILTERS = [['all', 'Toutes les parfumeries'], ['niche', 'Niche, confidentiel'], ['prem', 'Premium'], ['main', 'Mainstream'], ['ind', 'Indépendantes'], ['chain', 'Grandes enseignes'], ['gm', 'Grands magasins'], ['cos', 'Cosmétiques avec parfums']];
  function openShopMap() {
    let pos = S.settings.geo && S.settings.geo.lat != null ? { lat: S.settings.geo.lat, lon: S.settings.geo.lon, place: S.settings.geo.place || '' } : null, flt = 'all', rad = 15, lim = 12;
    const pn = openSheet(`<div><h2>Où acheter près de moi</h2><p style="color:var(--muted);margin-top:6px">Choisis ta ville, je te liste les parfumeries autour de toi.</p></div>
      <div class="card" style="padding:16px 18px"><p class="rd" style="margin:0"><b>Ce n'est pas précis.</b> Les adresses viennent du répertoire officiel des entreprises, qui donne le siège de chaque société et pas toujours la boutique. Il en manque beaucoup, surtout pour la niche et les grandes enseignes. Vérifie toujours l'adresse et les horaires avant de te déplacer.</p></div>
      <div class="sbar"><div class="acwrap"><input type="text" id="smCity" placeholder="Ta ville (Tours, Lyon, Bordeaux…)" autocomplete="off" autocapitalize="words" enterkeyhint="search" aria-label="Ville"><div class="aclist" id="smAc" hidden></div></div><button type="button" class="cta" id="smCityGo"><span>Chercher</span></button></div>
      <div class="row"><button class="ghost" id="smGeo">Autour de moi</button></div>
      <div class="chips" id="smFlt">${SHOP_FILTERS.map(([k, l]) => `<button type="button" class="chip ${k === flt ? 'on' : ''}" data-f="${k}">${l}</button>`).join('')}</div>
      <div class="chips" id="smRad">${[[5, '5 km'], [15, '15 km'], [50, '50 km']].map(([v, l]) => `<button type="button" class="chip ${v === rad ? 'on' : ''}" data-rad="${v}">${l}</button>`).join('')}</div>
      <p class="mono" id="smMsg" style="text-transform:none;letter-spacing:0"></p><div id="smList" style="display:grid;gap:14px"></div>`);
    const msg = (t) => { $('#smMsg', pn).textContent = t; };
    const gm = (q) => `https://www.google.com/maps/search/${encodeURIComponent(q + (pos.place ? ' ' + pos.place : ''))}/@${pos.lat.toFixed(4)},${pos.lon.toFixed(4)},13z`;
    const card = (title, sub, extra, href, label, tag) => `<article class="card shopc"><div class="row" style="justify-content:space-between;gap:8px"><b>${esc(title)}</b>${tag ? `<span class="tag">${esc(tag)}</span>` : ''}</div>${extra ? `<small>${esc(extra)}</small>` : ''}${sub ? `<p class="rd" style="margin:0">${esc(sub)}</p>` : ''}<div class="row"><a class="linkbtn" target="_blank" rel="noopener" href="${href}">${label}</a></div></article>`;
    const keep = (r) => flt === 'all' ? r[6] !== 'cos' : flt === 'chain' ? ['prem', 'main'].includes(r[6]) : r[6] === flt;
    function go() {
      if (!pos) return; const where = pos.place ? ' à ' + pos.place : ' autour de toi', list = $('#smList', pn);
      const all = (window.SHOPS || []).map((r) => ({ r, km: kmBetween(pos.lat, pos.lon, r[4], r[5]) })).filter((o) => o.km <= rad && keep(o.r)).sort((a, b) => a.km - b.km);
      const paris = kmBetween(pos.lat, pos.lon, 48.857, 2.352) < 12 && ['all', 'niche', 'prem', 'gm'].includes(flt);
      msg(all.length ? `${all.length} adresse${all.length > 1 ? 's' : ''} à moins de ${rad} km${where}. Liste incomplète et approximative, à vérifier avant de te déplacer.` : `Aucune adresse enregistrée à moins de ${rad} km${where} pour ce filtre. Élargis le rayon ou cherche directement sur la carte ci-dessous.`);
      const houses = [...new Set(S.wishlist.concat(S.collection).map((x) => x.house).filter(Boolean))].slice(0, 3);
      list.innerHTML =
        (paris ? `<p class="mono">Les adresses à connaître à Paris</p>${PARIS_SHOPS.map(([n, a, d]) => card(n, d, a, `https://www.google.com/maps/search/${encodeURIComponent(n + ' Paris')}`, 'Voir sur la carte')).join('')}` : '') +
        (all.length ? `<p class="mono">Les plus proches</p>${all.slice(0, lim).map(({ r, km }) => card(r[0], '', (km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km') + ' · ' + [r[1], r[2], r[3]].filter(Boolean).join(' '), `https://www.google.com/maps/dir/?api=1&destination=${r[4]},${r[5]}`, 'Itinéraire', SHOP_SEG[r[6]])).join('')}${all.length > lim ? '<button type="button" class="ghost" id="smMore" style="justify-self:start">Voir plus</button>' : ''}` : '') +
        `<p class="mono">Chercher sur la carte${esc(where)}</p><div class="chips">${SHOP_CHAINS.map(([n, q]) => `<a class="chip" target="_blank" rel="noopener" href="${gm(q)}">${esc(n)}</a>`).join('')}${houses.map((h) => `<a class="chip" target="_blank" rel="noopener" href="${gm(h + ' boutique parfum')}">${esc(h)}</a>`).join('')}</div>`;
      if ($('#smMore', pn)) $('#smMore', pn).onclick = () => { lim += 12; go(); };
    }
    const setPos = (lat, lon, place) => { pos = { lat, lon, place: place || '' }; S.settings.geo = Object.assign({}, S.settings.geo, { lat, lon, place: place || '', ts: Date.now() }); save(); lim = 12; go(); };
    $$('[data-f]', pn).forEach((b) => (b.onclick = () => { flt = b.dataset.f; lim = 12; $$('[data-f]', pn).forEach((x) => x.classList.toggle('on', x === b)); go(); }));
    $$('[data-rad]', pn).forEach((b) => (b.onclick = () => { rad = +b.dataset.rad; lim = 12; $$('[data-rad]', pn).forEach((x) => x.classList.toggle('on', x === b)); go(); }));
    $('#smGeo', pn).onclick = () => { if (!navigator.geolocation) { msg('Ton appareil ne donne pas sa position. Tape ta ville.'); return; } msg('Je cherche ta position…'); navigator.geolocation.getCurrentPosition((p) => setPos(p.coords.latitude, p.coords.longitude, ''), () => msg('Position refusée. Tape ta ville juste au-dessus.'), { timeout: 10000, maximumAge: 300000 }); };
    const inp = $('#smCity', pn), ac = $('#smAc', pn);
    const find = (v) => { const q = E.norm(v); const base = (window.SHOP_CITIES || []).map((c) => ({ place: c[0], lat: c[1], lon: c[2], sub: 'France' })).concat(CITIES); const seen = new Set(); return base.filter((c) => { const k = E.norm(c.place); if (!k.includes(q) || seen.has(k)) return false; seen.add(k); return true; }).sort((x, y) => (E.norm(x.place).startsWith(q) ? 0 : 1) - (E.norm(y.place).startsWith(q) ? 0 : 1) || x.place.length - y.place.length).slice(0, 6); };
    const pick = (g) => { ac.hidden = true; inp.value = g.place; setPos(g.lat, g.lon, g.place); };
    const suggest = (auto) => {
      const v = inp.value.trim(); if (v.length < 2) { ac.hidden = true; return; }
      const r = find(v);
      if (!r.length) { ac.hidden = true; if (!auto) { msg('Cette ville n\'est pas dans ma liste. Ouvre-la sur la carte.'); $('#smList', pn).innerHTML = card('Parfumeries à ' + v, 'Ouvre la recherche sur Google Maps.', '', `https://www.google.com/maps/search/${encodeURIComponent('parfumerie ' + v)}`, 'Ouvrir'); } return; }
      if (!auto) { pick(r[0]); return; }
      ac.innerHTML = r.map((g, i) => `<button type="button" class="acitem" data-i="${i}"><b>${esc(g.place)}</b><small>${esc(g.sub)}</small></button>`).join(''); ac.hidden = false;
      $$('.acitem', ac).forEach((b) => (b.onpointerdown = (ev) => { ev.preventDefault(); pick(r[+b.dataset.i]); }));
    };
    inp.addEventListener('input', () => suggest(true));
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); suggest(false); } });
    inp.addEventListener('blur', () => setTimeout(() => { ac.hidden = true; }, 150));
    $('#smCityGo', pn).onclick = () => suggest(false);
    if (pos) { inp.value = pos.place; go(); } else msg('Tape ta ville, ou touche « Autour de moi ».');
  }
  const wxButtonHtml = () => (WXSTATE === 'blocked' ? '' : WX && WX.k === 'auto' ? `<button class="chip on" id="wxAuto">${esc(AUTOW)}</button><button class="chip" id="wxCity">Changer de ville</button>` : `<button class="chip" id="wxAuto">Météo automatique</button>`);

  // ---------- Planning de la semaine ----------
  function openWeek() {
    const pn = openSheet(`<div><h2>Ta semaine, parfumée</h2><p style="color:var(--muted);margin-top:6px">Décris ta semaine en vrac. Je répartis les parfums pour ne jamais répéter et toujours coller au jour.</p></div>
      <textarea id="wtxt" rows="4" placeholder="Lundi et mardi bureau, mercredi télétravail, jeudi dîner à deux, samedi mariage…"></textarea>
      <button class="cta full" id="wgo"><span>Planifier</span></button><div id="wres" style="display:grid;gap:10px"></div>`);
    $('#wgo', pn).onclick = async () => {
      const out = $('#wres', pn), txt = $('#wtxt', pn).value.trim();
      const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }); });
      out.innerHTML = '<div class="shim"></div><div class="shim" style="width:80%"></div><div class="shim" style="width:60%"></div>'; $('#wgo', pn).disabled = true;
      try {
        const j = await aiJson(`Tu es un nez de parfumerie. Répartis les parfums de ma collection sur 7 jours, sans répéter deux fois le même, en tenant compte de ce que je fais chaque jour.\nMa collection (id | nom | maison | famille | notes | projection | poids | ma note) :\n${S.collection.map((p) => `${p.id} | ${p.name} | ${p.house} | ${p.family} | ${p.notes.join(', ')} | proj ${p.projection} | poids ${p.weight} | ${p.rating}/5`).join('\n')}\nJours : ${days.join(' ; ')}\nMa semaine : """${txt || 'semaine ordinaire, un peu de bureau, un peu de sorties'}"""\nRéponds UNIQUEMENT par un JSON : {"days":[{"day":"nom du jour","pick":"id","why":"10 mots max"}]} (7 entrées, dans l'ordre). N'utilise que les id fournis.`, { modelTier: 'default' });
        const rows = (j.days || []).slice(0, 7).map((d, i) => ({ d: days[i] || d.day, p: find(d.pick), why: d.why })).filter((r) => r.p);
        out.innerHTML = rows.map((r, i) => `<div class="wk" style="--i:${i}">${bt(r.p, { still: true })}<div><span class="d">${esc(r.d)}</span><br><b>${esc(r.p.name)}</b><p>${esc(r.why || '')}</p></div></div>`).join('') || '<div class="empty">Pas de plan, reformule.</div>';
      } catch (e) {
        out.innerHTML = `<div class="empty">${e && e.code === 'not_granted' ? 'Autorise l\'IA pour planifier ta semaine.' : 'L\'IA n\'est pas disponible dans cette vue.'}</div>`;
      }
      $('#wgo', pn).disabled = false;
    };
  }

  // ---------- Journée : IA + repli local ----------
  const pickKey = (v, obj, d) => (typeof v === 'string' && v in obj ? v : d);
  function normCond(c, wx) {
    c = c || {};
    return { ctx: pickKey(c.ctx, E.CONTEXTS, 'perso'), with: pickKey(c.with, E.WITHS, 'seul'), moment: pickKey(c.moment, E.MOMENTS, 'jour'), mood: pickKey(c.mood, E.MOODS, 'confiant'), style: pickKey(c.style, E.STYLES, 'smart'), color: pickKey(c.color, E.COLORS, 'neutre'), fabric: pickKey(c.fabric, E.FABRICS, ''), temp: typeof c.temp === 'number' ? c.temp : wx ? wx.t : 18, rain: !!(wx && wx.rain) || !!c.rain, hum: typeof c.hum === 'number' ? c.hum : 50, place: pickKey(c.place, E.PLACES, ''), want: pickKey(c.want, E.WANTS, ''), venue: pickKey(c.venue, E.VENUES, ''), dur: pickKey(c.dur, E.DURS, '') };
  }
  function keywordCond(text, wx) {
    const t = E.norm(text), c = { temp: wx ? wx.t : 18 };
    const m = text.match(/(-?\d{1,2})\s*°/); if (m) c.temp = +m[1];
    if (/pro|reunion|bureau|client|travail|entretien|teletravail/.test(t)) c.ctx = 'pro';
    if (/date|rencard|resto|diner|amoureu|copine|copain|chéri|cheri/.test(t)) c.ctx = 'date';
    if (/famille|parents|mamie|papa|maman/.test(t)) c.ctx = 'famille';
    if (/stress|anxieu|angoiss|nerveu/.test(t)) c.mood = 'stresse'; else if (/pas bien|deprim|triste|blues|coup de mou/.test(t)) c.mood = 'blues'; else if (/concentr|focus|zone|revis|examen/.test(t)) c.mood = 'focus'; else if (/match|competition|tournoi/.test(t)) { c.mood = 'match'; c.style = 'sport'; }
    if (/compliment/.test(t)) c.want = 'compliments'; else if (/plaire.*(fille|femme)|seduire.*(fille|femme)/.test(t)) c.want = 'plaire_f'; else if (/plaire.*(garcon|homme)|seduire.*(garcon|homme)/.test(t)) c.want = 'plaire_g'; else if (/discret/.test(t)) c.want = 'discret';
    if (/ami|pote|bar|apero|brunch|terrasse/.test(t)) c.ctx = 'amis';
    if (/mariage|vernissage|gala|soiree|evenement|concert/.test(t)) c.ctx = 'event';
    if (/soir|diner|vernissage|nuit/.test(t)) c.moment = 'soir';
    if (/costume|blazer/.test(t)) c.style = 'costume'; else if (/sport|running|salle/.test(t)) c.style = 'sport'; else if (/jean|t shirt|tee/.test(t)) c.style = 'casual';
    if (/cuir|perfecto/.test(t)) c.fabric = 'cuir'; else if (/lin/.test(t)) c.fabric = 'lin'; else if (/pull|maille|laine/.test(t)) c.fabric = 'laine';
    if (/resto|restaurant|diner|brasserie/.test(t)) c.venue = 'resto'; else if (/bar |apero|cocktail|terrasse/.test(t + ' ')) c.venue = 'bar'; else if (/boite|club|discotheque/.test(t)) c.venue = 'boite'; else if (/musee|expo|vernissage|galerie/.test(t)) c.venue = 'musee'; else if (/concert|festival/.test(t)) c.venue = 'concert'; else if (/theatre|cinema|opera/.test(t)) c.venue = 'theatre'; else if (/bureau|reunion|client|entretien/.test(t)) c.venue = 'bureau'; else if (/chez moi|maison|canape|teletravail/.test(t)) c.venue = 'maison';
    if (/pluie|pleut/.test(t)) c.rain = true;
    if (/froid/.test(t) && !m) c.temp = 4; if (/chaud|canicule/.test(t) && !m) c.temp = 29;
    Object.assign(c, explicitPreset());
    return normCond(c, wx);
  }
  const layerObjs = (p, cond, n) => E.layering(p, S.collection, cond, stx(), n || 2).map((l) => ({ p: l.b, effect: l.what, how: [l.how, l.tip].filter(Boolean).join(' '), score: clamp(Math.round(l.total + 1.5), 2, 5) }));
  function localDay(text, wx) {
    const cond = keywordCond(text, wx);
    const rk = E.rank(S.collection, cond, stx());
    const top = rk[0];
    return { cond, read: text ? text : 'Journée ' + E.CONTEXTS[cond.ctx].toLowerCase() + ', ' + Math.round(cond.temp) + '°', pick: top.p, vibe: [famLabel(top.p.family), E.MOODS[cond.mood], (E.MOMENTS[cond.moment] || '').toLowerCase()].filter(Boolean).slice(0, 3),
      story: (top.reasons.slice(0, 3).join('. ') || 'Le meilleur compromis de ton étagère aujourd\'hui') + '.', alts: rk.slice(1, 4).map((r) => ({ p: r.p, line: r.reasons[0] || 'Une belle alternative' })), layers: layerObjs(top.p, cond, 2), avoid: '', ai: false };
  }
  const explicitLine = () => {
    const o = explicitPreset(), bits = [];
    if (o.mood) bits.push('mood : ' + E.MOODS[o.mood]);
    if (CHOICE.dress) { const dr = DRESS.find((x) => x[0] === CHOICE.dress); if (dr) bits.push('tenue : ' + dr[1].toLowerCase() + ' (' + dr[2] + ')'); }
    if (CHOICE.when) bits.push('moment : ' + E.MOMENTS[CHOICE.when].toLowerCase());
    if (o.venue) bits.push('endroit : ' + E.VENUES[o.venue].toLowerCase());
    if (o.want) bits.push('effet recherché : ' + E.WANTS[o.want].toLowerCase());
    if (o.place) bits.push('lieu : ' + E.PLACES[o.place]);
    if (o.dur) bits.push('durée : ' + E.DURS[o.dur]);
    if (CHOICE.hum) bits.push('air très humide');
    if (CHOICE.sc) bits.push('type de journée : ' + scenByKey(CHOICE.sc)[1]);
    return bits.length ? '\nChoix explicites de l\'utilisateur, à respecter : ' + bits.join(' ; ') + '.' : '';
  };
  async function aiDay(text, wx) {
    const args = { collection: colLines(), taste: tasteLine(), text, explicit: explicitLine(), wx: wx ? { l: wx.l, t: wx.t, rain: !!wx.rain } : null, hasPhoto: !!(PHOTO && CAN_IMG), profile: S.profile && !S.profile.skipped ? { gender: S.profile.gender, age: S.profile.age } : null, date: new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) };
    const j = window.SillageDemo ? await window.SillageDemo.day(args, PHOTO && CAN_IMG ? PHOTO : null) : await aiJson(window.SillagePrompts.day(args), { modelTier: 'default', images: PHOTO && CAN_IMG ? [PHOTO] : undefined });
    const p = find(j.pick); if (!p) throw { code: 'bad_pick' };
    const cond = normCond(Object.assign({}, j.cond, explicitPreset()), wx);
    let layers = (j.layers || []).map((l) => ({ p: find(l.id), effect: String(l.effect || ''), how: String(l.how || ''), score: clamp(Math.round(+l.score || 4), 1, 5) })).filter((l) => l.p && l.p.id !== p.id).slice(0, 2);
    if (!layers.length) layers = layerObjs(p, cond, 2);
    let alts = (j.alts || []).map((a) => ({ p: find(a.id), line: String(a.line || '') })).filter((a) => a.p && a.p.id !== p.id).slice(0, 3);
    if (!alts.length) alts = E.rank(S.collection, cond, stx()).filter((r) => r.p.id !== p.id).slice(0, 3).map((r) => ({ p: r.p, line: r.reasons[0] || '' }));
    return { cond, read: String(j.read || text || 'Ta journée'), pick: p, vibe: (j.vibe || []).map(String).slice(0, 3), story: String(j.story || ''), alts, layers, avoid: String(j.avoid || ''), ai: true };
  }

  let LAST = null;
  async function runDay(replayFor) {
    if (window.SillageDemo && window.SillageDemo.left() <= 0) { window.SillageDemo.upsell('quota'); return; }
    if (!S.collection.length) { openAdd(); return; }
    openStory(); showLoading();
    let R = null;
    const t0 = Date.now();
    try { R = await aiDay(SAY.trim(), WX); } catch (e) { R = null; if (e && (e.code === 'rate_limited' || e.code === 'locked')) { closeStory(); return; } }
    if (!R) R = localDay(SAY.trim(), WX);
    const wait = 1800 - (Date.now() - t0); if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    LAST = R; showStory(R);
  }

  // ---------- Story ----------
  let ST = null;
  function openStory() {
    const el = $('#story'); el.hidden = false; document.body.style.overflow = 'hidden'; el.classList.remove('paused');
    el.innerHTML = `<i class="sb sb1"></i><i class="sb sb2"></i><canvas class="fx" id="fx" aria-hidden="true"></canvas><div class="prog" id="prog"></div><div class="st-top"><span class="mono" id="stlabel">sillage</span><button class="st-x" id="stx" aria-label="Fermer">✕</button></div><div id="stage"></div>`;
    $('#stx').onclick = (e) => { e.stopPropagation(); closeStory(); };
    ST = { scenes: [], i: 0, R: null };
  }
  function closeStory() { $('#story').hidden = true; $('#story').innerHTML = ''; ST = null; document.body.style.overflow = ''; render(true); }
  function setHue(p) {
    const w = (x) => { x = Art.noGreen(x); return x > 14 && x < 64 ? 352 + (x - 14) * 0.2 : x; }, h = w(Art.pal(p).h), st = $('#story').style;
    st.setProperty('--h', h); st.setProperty('--hA', w(h + 34)); st.setProperty('--hB', w(h - 26)); st.setProperty('--h2', w(h + 70));
  }
  function showLoading() {
    const ps = [...S.collection].sort(() => Math.random() - 0.5).slice(0, 3);
    setHue(ps[0]); FX.attach($('#fx'), ps[0], { dark: true, density: .8 });
    $('#stage').innerHTML = `<div class="load-orbit center">${ps.map((p, i) => bt(p, { still: true, style: `animation-delay:${-i * 2.33}s` })).join('')}</div>
      <div class="msgs center">${['Je lis ta journée…', 'Je sens ton étagère…', 'Je compose l\'accord…'].map((m, i) => `<span style="animation-delay:${i * 2.1}s">${m}</span>`).join('')}</div>`;
    $('#prog').innerHTML = '';
  }
  const condChips = (c) => [E.CONTEXTS[c.ctx], E.WITHS[c.with], E.MOMENTS[c.moment], Math.round(c.temp) + '°' + (c.rain ? ' pluie' : ''), E.MOODS[c.mood], c.venue ? E.VENUES[c.venue] : (c.place ? E.PLACES[c.place] : null), c.want && E.WANTS[c.want] ? E.WANTS[c.want] : null, c.dur ? E.DURS[c.dur] : null, c.hum > 75 ? 'humide' : null, E.STYLES[c.style] + (c.fabric ? ' · ' + E.FABRICS[c.fabric].toLowerCase() : '')].filter(Boolean);
  function buildScenes(R) {
    const p = R.pick, sc = [];
    const nW = (t) => String(t || '').split(/\s+/).filter(Boolean).length;
    sc.push({ label: R.ai ? 'ton nez ia' : 'sillage', dur: 6500, html: () => `<p class="mono rise">si je comprends bien</p><p class="lead">${words(R.read, 200)}</p><div class="chips" style="margin-top:6px">${condChips(R.cond).map((c, i) => `<span class="chip pop" style="--d:${900 + i * 130}">${esc(c)}</span>`).join('')}</div>` });
    sc.push({ label: 'ton parfum', dur: 7500, hue: p, html: () => `<div class="center" style="display:grid;gap:14px;justify-items:center"><p class="mono rise">ton parfum du jour</p><div class="hero-bottle"><i class="aura"></i>${bt(p, { spray: true, h: 300 })}</div><h2 class="rise" style="--d:500">${words(p.name, 400)}</h2><p class="soft rise" style="--d:1100">${esc(p.house)} · ${esc(famLabel(p.family))}</p><p class="motif rise" style="--d:1300">${(() => { const m = FX.motifsOf(p); return m.notes.length ? 'ambiance inspirée de ' + esc(m.notes.join(' · ')) : 'ambiance : ' + esc(m.label); })()}</p><div class="vibes">${R.vibe.map((v, i) => `<span class="pop" style="--d:${1400 + i * 180}">${esc(v)}</span>`).join('')}</div></div>` });
    const n = p.notes || [], a = Math.ceil(n.length / 3);
    const lv = [['ouverture', n.slice(0, a)], ['cœur', n.slice(a, a * 2)], ['fond', n.slice(a * 2)]].filter((x) => x[1].length);
    if (lv.length) sc.push({ label: 'ce que tu sentiras', dur: 7000, hue: p, html: () => `<p class="mono rise">ce que tu sentiras</p><div class="pyr">${lv.map(([l, arr], i) => `<div class="lv rise" style="--d:${300 + i * 450}"><span class="mono">${l}</span><b>${esc(arr.join(', '))}</b></div>`).join('')}</div><div class="meter-s rise" style="--d:1800"><span class="soft" style="width:92px">projection</span>${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= p.projection ? 'f' : ''}"></i>`).join('')}</div><div class="meter-s rise" style="--d:1950"><span class="soft" style="width:92px">tenue</span>${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= p.longevity ? 'f' : ''}"></i>`).join('')}</div>` });
    sc.push({ label: 'pourquoi lui', dur: clamp(3800 + nW(R.story) * 280, 6500, 15000), hue: p, html: () => `<p class="mono rise">pourquoi lui</p><p class="lead">${words(R.story, 250)}</p>${R.avoid ? `<p class="soft rise" style="--d:2600">À éviter aujourd'hui : ${esc(R.avoid)}</p>` : ''}` });
    R.layers.forEach((l) => sc.push({ label: 'layering', dur: 10000, hue: p, fx: [p, l.p], html: () => {
      const steps = String(l.how).split(/(?<=[.!])\s+/).filter(Boolean).slice(0, 3);
      return `<p class="mono rise">accord · ${'●'.repeat(l.score)}${'○'.repeat(5 - l.score)}</p><div class="merge"><i class="orb" style="background:linear-gradient(135deg,${Art.pal(p).b},${Art.pal(l.p).b})"></i>${bt(p, { still: true, cls: 'la' })}${bt(l.p, { still: true, cls: 'lb' })}<span class="plus">+</span></div><h2 class="rise" style="--d:1500;font-size:clamp(26px,8vw,40px)">${esc(p.name)} <span style="opacity:.6">+</span> ${esc(l.p.name)}</h2><p class="lead rise" style="--d:1900;font-size:19px">${esc(l.effect)}</p><div class="steps">${steps.map((s, i) => `<div class="rise" style="--d:${2500 + i * 350}"><b>${i + 1}</b><span>${esc(s)}</span></div>`).join('')}</div>`;
    } }));
    if (R.alts.length) sc.push({ label: 'autres options', dur: 0, html: () => `<h2 class="rise">Ou plutôt…</h2><div style="display:grid;gap:10px">${R.alts.map((x, i) => `<button class="altrow rise" style="--d:${250 + i * 160}" data-alt="${x.p.id}">${bt(x.p, { still: true })}<span><b>${esc(x.p.name)}</b><small>${esc(x.line)}</small></span><span aria-hidden="true">→</span></button>`).join('')}</div>` });
    const wornNow = S.today && S.today.date === today() && S.today.pickId === p.id;
    sc.push({ label: 'c\'est parti', dur: 0, hue: p, html: () => `<div class="center" style="display:grid;gap:16px;justify-items:center"><div class="hero-bottle" style="height:200px"><i class="aura"></i>${bt(p, { spray: true, h: 200 })}</div><h2 class="rise">${wornNow ? 'C\'est noté.' : 'On y va&nbsp;?'}</h2><button class="st-btn rise" style="--d:300" id="wear">${wornNow ? 'Porté aujourd\'hui ✓' : 'Je le porte aujourd\'hui'}</button>${fbHtml('day', p)}<button class="st-btn line rise" style="--d:450" id="stclose">Fermer</button></div>` });
    return sc;
  }
  function showStory(R, replay) {
    if (!ST || $('#story').hidden) openStory();
    ST.R = R; ST.scenes = buildScenes(R);
    $('#prog').innerHTML = ST.scenes.map(() => '<b><i></i></b>').join('');
    go(0);
  }
  function go(i) {
    if (!ST) return;
    if (i < 0) i = 0;
    if (i >= ST.scenes.length) return closeStory();
    ST.i = i; const s = ST.scenes[i];
    if (s.hue) setHue(s.hue); else setHue(ST.R.pick);
    FX.attach($('#fx'), s.fx || [ST.R.pick], { dark: true, density: 1 });
    $$('#prog b').forEach((b, k) => {
      b.className = k < i ? 'done' : k === i ? 'act' + (s.dur && !REDUCED ? '' : ' hold') : '';
      if (k === i) b.style.setProperty('--dur', s.dur + 'ms');
      const it = $('i', b); it.style.animation = 'none'; void it.offsetWidth; it.style.animation = '';
    });
    $('#stlabel').textContent = s.label;
    const st = $('#stage'); st.innerHTML = s.html();
    $('#story').classList.remove('paused');
    $$('[data-alt]', st).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); chooseAlt(b.dataset.alt); }));
    const w = $('#wear', st); if (w) w.onclick = (e) => { e.stopPropagation(); wear(w); };
    const c = $('#stclose', st); if (c) c.onclick = (e) => { e.stopPropagation(); closeStory(); };
    fbBind(st);
  }
  function chooseAlt(id) {
    const R = ST.R, a = R.alts.find((x) => x.p.id === id); if (!a) return;
    const old = R.pick;
    R.pick = a.p; R.story = a.line ? `${a.line}. ${famLabel(a.p.family)} : ${(a.p.notes || []).slice(0, 3).join(', ')}.` : R.story;
    R.vibe = [famLabel(a.p.family), E.MOODS[R.cond.mood], E.MOMENTS[R.cond.moment].toLowerCase()];
    R.alts = [{ p: old, line: 'Ton premier choix' }, ...R.alts.filter((x) => x.p.id !== id)].slice(0, 3);
    R.layers = layerObjs(a.p, R.cond, 2); R.avoid = '';
    showStory(R); go(1);
  }
  function wear(btn) {
    const p = ST.R.pick;
    if (!(S.today && S.today.date === today() && S.today.pickId === p.id)) { todayEntry(p.id); S.log = S.log.slice(-90); S.today = { date: today(), pickId: p.id }; save(); }
    btn.textContent = 'Porté aujourd\'hui ✓'; petals(p); try { navigator.vibrate && navigator.vibrate([14, 40, 20]); } catch (e) { /* pas de vibration */ }
    setTimeout(() => { if (ST) closeStory(); }, REDUCED ? 600 : 2100);
  }
  function petals(p) {
    if (REDUCED) return;
    const P = Art.pal(p), cols = [P.a, P.b, '#fff', P.c], root = $('#story');
    for (let i = 0; i < 26; i++) {
      const s = document.createElement('i'); s.className = 'petal';
      s.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % 4]};--x:${(Math.random() - .5) * 160}px;--r:${Math.random() * 720 - 360}deg;animation-duration:${1.6 + Math.random() * 1.6}s;animation-delay:${Math.random() * .5}s`;
      root.appendChild(s); setTimeout(() => s.remove(), 4200);
    }
  }
  // Interactions : tap gauche/droite, appui long = pause
  (function bindStory() {
    const el = $('#story'); let t0 = 0, tx = 0, held = false;
    el.addEventListener('pointerdown', (e) => { if (e.target.closest('button,input,a')) return; t0 = Date.now(); tx = e.clientX; held = true; el.classList.add('paused'); });
    const up = (e) => { if (!held) return; held = false; el.classList.remove('paused'); if (e.type === 'pointerup' && Date.now() - t0 < 260 && ST) { go(tx < innerWidth * 0.33 ? ST.i - 1 : ST.i + 1); } };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('animationend', (e) => { if (ST && e.animationName === 'fillp' && e.target.parentElement.classList.contains('act')) go(ST.i + 1); });
    document.addEventListener('keydown', (e) => { if ($('#story').hidden || !ST) return; if (e.key === 'ArrowRight') go(ST.i + 1); else if (e.key === 'ArrowLeft') go(ST.i - 1); else if (e.key === 'Escape') closeStory(); });
  })();


  // ---------- Wishlist ----------
  let WTAB = 'smell';
  const VERDICT = { love: 'J\'adore', ok: 'Bien', no: 'Bof' };
  // Ce que la wishlist apprend de tes goûts : les parfums sentis (J'adore / Bien / Bof) et ceux que tu veux sentir orientent les conseils.
  function wishTaste() {
    const sig = E.wishSignals(S.wishlist, needPool()).filter((x) => (x.notes || []).length);
    const judged = sig.filter((x) => x.smelled && x.verdict).length;
    if (!sig.length) return '';
    const tp = E.tasteProfile(sig, { liked: [], avoid: [] }), ent = Object.entries(tp.note);
    const up = ent.filter((e) => e[1] > 0.25).sort((a, b) => b[1] - a[1]).slice(0, 5).map((e) => e[0]), down = ent.filter((e) => e[1] < -0.25).sort((a, b) => a[1] - b[1]).slice(0, 4).map((e) => e[0]);
    const lines = [up.length ? `<p class="rd">Tu es attiré par : <b>${up.map(esc).join(', ')}</b>.</p>` : '', down.length ? `<p class="rd">Tu aimes moins : <b>${down.map(esc).join(', ')}</b>.</p>` : ''].join('');
    return `<section class="sec"><article class="card" style="display:grid;gap:12px"><p class="mono">Ce que ta wishlist dit de toi</p>${lines || '<p class="rd">Dis ce que tu as pensé des parfums sentis : J\'adore, Bien ou Bof.</p>'}<p class="mono" style="text-transform:none;letter-spacing:0">${judged} parfum${judged > 1 ? 's' : ''} jugé${judged > 1 ? 's' : ''} sur ${S.wishlist.length}. Plus tu en juges, plus les conseils te ressemblent : ce que tu aimes attire, ce qui ne t'a pas plu est écarté.</p></article></section>`;
  }

  // ---------- Playlists : une bibliothèque d'univers ----------
  const PLS = window.PLAYLISTS || [], PL = { id: 0, sec: '', sub: '' };
  let PLK = null;
  const plLook = () => { const L = dbList(); if (PLK && PLK.l === L) return PLK.m; const m = new Map(); L.forEach((e) => { const k = entryKey(e); if (!m.has(k)) m.set(k, e); }); PLK = { l: L, m }; return m; };
  const plEntry = (x) => { if (!x.h) return null; const HA = window.HOUSE_ALIAS || {}; const L = plLook(); return L.get(E.norm((HA[E.norm(x.h)] || x.h) + ' ' + x.n)) || L.get(E.norm(x.h + ' ' + x.n)) || null; };
  const plLum = (hex) => { const n = parseInt(hex, 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
  function plMotif(m) {
    const o = [], f = (v) => Math.round(v * 10) / 10; let i;
    if (m === 'rays') for (i = 0; i < 13; i++) { const a = (Math.PI * (0.1 + 0.8 * i / 12)); o.push(`<path d="M50 108L${f(50 + 140 * Math.cos(a))} ${f(108 - 140 * Math.sin(a))}"/>`); }
    else if (m === 'stripes') for (i = 0; i < 16; i++) o.push(`<path d="M${-30 + i * 11} 100L${70 + i * 11} 0"/>`);
    else if (m === 'grid') for (i = 1; i < 8; i++) o.push(`<path d="M${i * 12.5} 0V100M0 ${i * 12.5}H100"/>`);
    else if (m === 'rain') for (i = 0; i < 26; i++) { const x = (i * 37) % 100, y = (i * 53) % 86; o.push(`<path d="M${x} ${y}l-2 12"/>`); }
    else if (m === 'arches') for (i = 1; i < 7; i++) { const r = i * 14; o.push(`<path d="M${50 - r} 100V${100 - r * 0.6}A${r} ${r} 0 0 1 ${50 + r} ${100 - r * 0.6}V100"/>`); }
    else if (m === 'dots') for (i = 0; i < 49; i++) { const r = Math.floor(i / 7), c = i % 7; o.push(`<circle cx="${8 + c * 14 + (r % 2) * 7}" cy="${8 + r * 14}" r="1.8" fill="currentColor" stroke="none"/>`); }
    else if (m === 'waves') for (i = 0; i < 8; i++) { const y = 14 + i * 12; o.push(`<path d="M-5 ${y}Q20 ${y - 9} 45 ${y}T95 ${y}T145 ${y}"/>`); }
    else if (m === 'rings') for (i = 1; i < 8; i++) o.push(`<circle cx="50" cy="50" r="${i * 9}"/>`);
    else { let sd = 7; for (i = 0; i < 90; i++) { sd = (sd * 9301 + 49297) % 233280; const x = sd / 233280 * 100; sd = (sd * 9301 + 49297) % 233280; const y = sd / 233280 * 100; o.push(`<rect x="${f(x)}" y="${f(y)}" width="1.3" height="1.3" fill="currentColor" stroke="none"/>`); } }
    return o.join('');
  }
  const plCover = (p, big) => { const [a, b, c] = p.c, light = !p.img && plLum(a) * 0.5 + plLum(b) * 0.5 > 0.62; return `<span class="plc${big ? ' big' : ''}${light ? ' lt' : ''}${p.img ? ' has' : ''}" style="--a:#${a};--b:#${b};--c:#${c}">${p.img ? `<img class="plimg" alt="" loading="lazy" src="${esc(p.img)}">` : ''}<svg class="plm" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="currentColor" stroke-width=".7">${plMotif(p.m)}</svg><b>${esc(p.t)}</b><small>${esc(p.secs[0])}</small></span>`; };
  const plStats = (p) => { const es = p.ps.map(plEntry), inb = es.filter(Boolean); return { es, n: inb.length, mine: inb.filter((e) => S.collection.some((c) => E.norm(c.name) === E.norm(e.name))).length }; };
  const plGrpAt = (p, i) => { let s = 0; for (let g = 0; g < p.grp.length; g++) { if (i === s) return g; s += p.grp[g].n || 10; } return -1; };
  const plNum = (p, i) => { if (!p.grp) return i + 1; let s = 0; for (const g of p.grp) { const n = g.n || 10; if (i < s + n) return i - s + 1; s += n; } return i + 1; };
  const plDesc = (p) => p.d || (p.grp ? p.grp.map((g) => g.d).join(' ') : '');
  const plDay = () => { const d = new Date(), k = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate(), L = PLS.filter((p) => p.img); return (L.length ? L : PLS)[k % (L.length || PLS.length)]; };      // jamais une liste sans photo
  function viewPlay() { if (PL.sub && window.SillageProduct) { PL.id = 0; return window.SillageProduct.playSub(PL.sub); } PL.id ? viewPlaylist(PLS.find((x) => x.id === PL.id)) : viewPlayLib(); }
  function viewPlayLib() {
    const secs = (window.PL_SECTIONS || []).filter((s) => !PL.sec || s === PL.sec), day = plDay();
    $('#view').innerHTML = `
      <section class="sec"><header><h2>Inspirations</h2><span class="mono">${PLS.length} univers</span></header>
        <p class="plintro">Un personnage, une ville, un instant, une envie. Chaque liste a son décor, sa culture et ses accords.</p>
        <button type="button" class="plhero" data-pl="${day.id}">${plCover(day, true)}<span class="plhi"><span class="mono">Liste du jour</span><b>${esc(day.t)}</b><em>${tx(plDesc(day))}</em></span></button>
        <div class="chips plsecs"><button class="chip ${PL.sec ? '' : 'on'}" data-psec="">Tout</button>${(window.PL_SECTIONS || []).map((s) => `<button class="chip ${PL.sec === s ? 'on' : ''}" data-psec="${esc(s)}">${esc(s)}</button>`).join('')}</div>
      </section>
      ${secs.map((s) => { const L = PLS.filter((p) => p.secs.includes(s)).sort((a, b) => (b.top ? 1 : 0) - (a.top ? 1 : 0)); return `<section class="sec plsec"><header><h2>${esc(s)}</h2><span class="mono">${L.length}</span></header><div class="${PL.sec ? 'plgrid' : 'plrow'}">${L.map((p) => `<button type="button" class="plcard" data-pl="${p.id}">${plCover(p)}<span class="plsub">${p.ps.length} parfums</span></button>`).join('')}</div></section>`; }).join('')}`;
    $$('[data-pl]').forEach((b) => (b.onclick = () => { PL.id = +b.dataset.pl; render(); }));
    $$('[data-psec]').forEach((b) => (b.onclick = () => { PL.sec = b.dataset.psec; viewPlayLib(); }));
    if (window.SillageProduct) window.SillageProduct.subtabs($('#view'));
  }
  function viewPlaylist(p) {
    if (!p) { PL.id = 0; return viewPlayLib(); }
    const st = plStats(p), ents = st.es.filter(Boolean);
    const fam = new Map(), nt = new Map();
    ents.forEach((e) => { if (e.family) fam.set(e.family, (fam.get(e.family) || 0) + 1); (e.notes || []).forEach((n) => nt.set(n, (nt.get(n) || 0) + 1)); });
    const top = (m, k) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, k);
    const accords = top(fam, 3).map(([f]) => famLabel(f)), notes = top(nt, 5).filter((x) => x[1] >= 2).map((x) => x[0]);
    const row = (x, i) => {
      const e = st.es[i], have = e && S.collection.some((c) => E.norm(c.name) === E.norm(e.name)), wished = hasWish(e ? e.name : x.q);
      const lab = (x.lab ? `<em class="pllab">${esc(x.lab[0])} ${esc(x.lab[1])}</em>` : '') + (x.w ? `<em class="plwhy">${tx(x.w)}</em>` : '');
      const mark = have ? '✓ chez toi' : wished ? '♡' : '';
      return e
        ? `<div class="plr"><i class="pln">${plNum(p, i)}</i><button type="button" class="xc" data-pe="${i}">${xThumb(e)}<span class="xt"><b>${esc(e.name)}</b><small>${esc([e.house, e.family ? famLabel(e.family) : ''].filter(Boolean).join(' · '))}</small>${lab}</span><i class="xm">${mark}</i></button></div>`
        : `<div class="plr"><i class="pln">${plNum(p, i)}</i><button type="button" class="xc off" data-pe="${i}"><span class="xth ph">?</span><span class="xt"><b>${esc(x.q)}</b><small>Pas encore dans la base</small>${lab}</span><i class="xm">${wished ? '♡' : ''}</i></button></div>`;
    };
    const find1 = (s) => { const k = E.norm(s); const i = p.ps.findIndex((x) => E.norm(x.q).includes(k)); return i < 0 ? null : i; };
    const combos = (p.combos || []).map((c) => c.map(find1)).filter((c) => c.every((i) => i != null));
    const sm = (i) => { const e = st.es[i]; return `<button type="button" class="plcb" data-pe="${i}">${e ? xThumb(e) : '<span class="xth ph">?</span>'}<b>${esc(e ? e.name : p.ps[i].q)}</b></button>`; };
    $('#view').innerHTML = `
      <section class="sec pldet">
        <button type="button" class="ghost plback" id="plback">← Inspirations</button>
        ${plCover(p, true)}
        <div><p class="mono">${esc(p.secs.join(' · '))}</p><h1 class="plh">${esc(p.t)}</h1></div>
        ${p.d ? `<p class="pld">${tx(p.d)}</p>` : ''}
        <p class="mono plmeta">${p.ps.length} parfums · ${st.n} dans la base${st.mine ? ' · ' + st.mine + ' chez toi' : ''}</p>
        ${accords.length || notes.length ? `<div><p class="mono">L'ADN olfactif</p><div class="chips" style="margin-top:8px">${accords.map((a) => `<button type="button" class="chip on" data-adn="a:${esc(a)}">${esc(a)}</button>`).join('')}${notes.map((n) => `<button type="button" class="chip" data-adn="n:${esc(n)}">${esc(n)}</button>`).join('')}</div></div>` : ''}
        <div class="row"><button class="cta" id="plshuf"><span>Un au hasard</span></button><button class="ghost" id="plwish">Tout en wishlist</button></div>
        ${(p.doc || []).map((d) => `<div class="pldoc"><p>${tx(d.t)}</p>${d.u ? `<a href="${esc(d.u)}" target="_blank" rel="noopener noreferrer">Source ${esc(d.s)}</a>` : ''}</div>`).join('')}
        <div class="plist">${p.ps.map((x, i) => (p.grp && plGrpAt(p, i) >= 0 ? `<div class="plgrp"><p class="mono">${esc(p.grp[plGrpAt(p, i)].t)}</p>${p.grp[plGrpAt(p, i)].d ? `<p class="pld">${tx(p.grp[plGrpAt(p, i)].d)}</p>` : ''}</div>` : '') + row(x, i)).join('')}</div>
        ${combos.length ? `<div><p class="mono">Combinaisons à essayer</p><div class="plcombos">${combos.map((c) => `<div class="plcombo">${sm(c[0])}<i>+</i>${sm(c[1])}</div>`).join('')}</div></div>` : ''}
      </section>`;
    $$('[data-adn]').forEach((b) => (b.onclick = () => { const v = b.dataset.adn.slice(2); if (b.dataset.adn.startsWith('n:')) { SRCH.note = v; SRCH.limit = 40; tab = 'search'; render(); } else goNeedText(v); }));
    $('#plback').onclick = () => { PL.id = 0; render(); };
    if (window.SillageProduct) window.SillageProduct.playlist(p, $('#view'));
    const open = (i) => { const e = st.es[i], x = p.ps[i]; if (e) return openEntry(e); const pn = openSheet(`<div><h2>${esc(x.q)}</h2><p class="mono" style="margin-top:6px">Pas encore dans la base de Sillage</p></div><p style="color:var(--muted);font-size:14px">Ce parfum fait partie de la liste « ${esc(p.t)} », mais je n'ai pas encore sa fiche. Tu peux le garder en wishlist pour le sentir.</p><div class="row">${hasWish(x.q) ? '<span class="mono">Dans ta wishlist ♡</span>' : '<button class="cta" id="plw"><span>À sentir</span></button>'}<button class="ghost" id="ex">Fermer</button></div>`); $('#ex', pn).onclick = closeSheet; if ($('#plw', pn)) $('#plw', pn).onclick = () => { addWish({ name: x.q, house: '', family: '', notes: [], price: 0, st: 'smell' }); save(); closeSheet(); viewPlaylist(p); }; };
    $$('[data-pe]').forEach((b) => (b.onclick = () => open(+b.dataset.pe)));
    $('#plshuf').onclick = () => { const L = p.ps.map((x, i) => i).filter((i) => st.es[i]); if (L.length) open(L[Math.floor(Math.random() * L.length)]); };
    $('#plwish').onclick = () => { let n = 0; ents.forEach((e) => { if (!hasWish(e.name) && !S.collection.some((c) => E.norm(c.name) === E.norm(e.name))) { addWish({ name: e.name, house: e.house, family: e.family || '', notes: e.notes || [], price: e.price || 0, st: 'smell' }); n++; } }); save(); $('#plwish').textContent = n ? n + ' ajouté' + (n > 1 ? 's' : '') + ' ♡' : 'Déjà tout là'; };
  }

  function viewWish() {
    S.wishlist.forEach((w) => { if (!w.st) w.st = 'smell'; });
    const all = S.wishlist, L = all.filter((w) => w.st === WTAB), nS = all.filter((w) => w.st === 'smell').length, nD = all.length - nS, total = all.filter((w) => w.st === 'smell').reduce((a, w) => a + (w.price || 0), 0);
    const line = (w) => { const d = window.DESC && window.DESC[w.name]; return d ? `<em class="wd">${tx(d[1])}</em>` : ''; };
    $('#view').innerHTML = `
      <section class="sec"><header><h2>Wishlist</h2><span class="mono">${all.length} parfum${all.length > 1 ? 's' : ''}${total ? ' · ≈ ' + total + ' €' : ''}</span></header>
        <div class="chips wtabs"><button class="chip ${WTAB === 'smell' ? 'on' : ''}" data-wt="smell">À sentir · ${nS}</button><button class="chip ${WTAB === 'smelled' ? 'on' : ''}" data-wt="smelled">Senti · ${nD}</button></div>
        <button class="cta full" id="wexp"><span>Explorer la base</span></button>
        <details class="wname"><summary class="mono">Ou ajouter par son nom</summary><div class="card ask-card"><input type="text" id="wlin" placeholder="Nom du parfum, l'IA complète la fiche"><button class="cta" id="wlgo"><span>Ajouter</span></button><p class="mono" id="wlmsg" style="text-transform:none"></p></div></details></section>
      <section class="sec">${L.length ? L.map((w, i) => `<article class="wl" style="--i:${i}">${bt(w, { still: true })}<div class="wlb"><b>${esc(w.name)}</b><small>${esc(w.house)}${w.family ? ' · ' + esc(famLabel(w.family)) : ''}${w.price ? ' · ≈ ' + w.price + ' €' : ''}</small>${line(w)}
        ${WTAB === 'smell' ? `<div class="row" style="margin-top:10px"><button class="ghost" data-wsm="${esc(w.name)}">Je l'ai senti</button><button class="ghost" data-wown="${esc(w.name)}">Je l'ai</button><button class="ghost" data-wrm="${esc(w.name)}">Retirer</button></div>${buyLinks(w.name, w.house)}`
          : `<div class="chips" style="margin-top:10px">${Object.entries(VERDICT).map(([k, v]) => `<button class="chip ${w.verdict === k ? 'on' : ''}" data-wv="${k}" data-n="${esc(w.name)}">${v}</button>`).join('')}</div><div class="row" style="margin-top:10px"><button class="ghost" data-wown="${esc(w.name)}">Je l'ai pris</button><button class="ghost" data-wre="${esc(w.name)}">À re-sentir</button><button class="ghost" data-wrm="${esc(w.name)}">Retirer</button></div>${w.verdict === 'love' ? buyLinks(w.name, w.house) : ''}`}</div></article>`).join('') : `<div class="empty">${WTAB === 'smell' ? 'Rien à sentir pour l\'instant. Explore la base, ou ajoute un parfum que tu veux essayer.' : 'Tu n\'as encore rien senti. Quand tu passes devant un parfum, note ce que tu en as pensé ici.'}</div>`}</section>
      ${wishTaste()}`;
    const byName = (n) => S.wishlist.find((x) => x.name === n);
    $$('[data-wt]').forEach((b) => (b.onclick = () => { WTAB = b.dataset.wt; viewWish(); }));
    $('#wexp').onclick = () => openExplore('wish');
    $$('[data-wrm]').forEach((b) => (b.onclick = () => { rmWish(b.dataset.wrm); viewWish(); }));
    $$('[data-wsm]').forEach((b) => (b.onclick = () => { const w = byName(b.dataset.wsm); if (w) { w.st = 'smelled'; save(); WTAB = 'smelled'; viewWish(); } }));
    $$('[data-wre]').forEach((b) => (b.onclick = () => { const w = byName(b.dataset.wre); if (w) { w.st = 'smell'; delete w.verdict; save(); WTAB = 'smell'; viewWish(); } }));
    $$('[data-wv]').forEach((b) => (b.onclick = () => { const w = byName(b.dataset.n); if (w) { w.verdict = w.verdict === b.dataset.wv ? '' : b.dataset.wv; save(); viewWish(); } }));
    $$('[data-wown]').forEach((b) => (b.onclick = () => { const w = byName(b.dataset.wown); if (w) { S.collection.push(wishToOwned(w)); rmWish(w.name); viewWish(); } }));
    $('#wlgo').onclick = async () => {
      const v = $('#wlin').value.trim(), msg = $('#wlmsg'); if (!v) { $('#wlin').focus(); return; }
      msg.textContent = 'Je complète la fiche…'; $('#wlgo').disabled = true;
      const c = CAT.find((x) => E.norm(x.name) === E.norm(v));
      if (c) { addWish(wishFromName(c.name)); return viewWish(); }
      const hit = dbList().find((e) => E.norm(e.name) === E.norm(v));
      if (hit) { addWish({ name: hit.name, house: hit.house, family: hit.family || '', notes: hit.notes || [], price: hit.price || 0 }); return viewWish(); }
      try {
        const j = await aiJson(`Identifie ce parfum : "${v}". Réponds UNIQUEMENT par un JSON : {"name":"nom officiel","house":"maison","family":"${FAMS}","notes":["6 à 10 notes en français"],"price":nombre en euros indicatif}`, { modelTier: 'quick' });
        addWish({ name: String(j.name || v), house: String(j.house || ''), family: E.FAMILIES[j.family] ? j.family : '', notes: (j.notes || []).map(String).slice(0, 10), price: Math.round(+j.price) || 0 });
      } catch (e) { addWish({ name: v }); }
      viewWish();
    };
  }

  // ---------- Balade olfactive ----------
  const SYMS = [
    ['un rond', '<circle cx="24" cy="24" r="13"/>'],
    ['une croix', '<path d="M13 13L35 35M35 13L13 35"/>'],
    ['un plus', '<path d="M24 9v30M9 24h30"/>'],
    ['un triangle', '<path d="M24 9L39 37H9z"/>'],
    ['un carré', '<rect x="11" y="11" width="26" height="26"/>'],
    ['un losange', '<path d="M24 7L41 24L24 41L7 24z"/>'],
    ['une vague', '<path d="M6 24q6.5-12 12.5 0t12.5 0t12 0"/>'],
    ['deux traits', '<path d="M10 17h28M10 31h28"/>'],
    ['un point', '<circle cx="24" cy="24" r="4" fill="currentColor"/>'],
    ['une étoile', '<path d="M24 8l4.7 10.6 11.5 1-8.7 7.6 2.6 11.3L24 32.6 13.9 38.5l2.6-11.3L7.8 19.6l11.5-1z"/>'],
    ['une flèche', '<path d="M8 24h30M28 13l11 11-11 11"/>'],
    ['un zigzag', '<path d="M7 31l8.5-14 8.5 14 8.5-14 8.5 14"/>'],
    ['trois points', '<circle cx="12" cy="24" r="3" fill="currentColor"/><circle cx="24" cy="24" r="3" fill="currentColor"/><circle cx="36" cy="24" r="3" fill="currentColor"/>'],
    ['un demi-cercle', '<path d="M9 31a15 15 0 0 1 30 0z"/>'],
    ['un rond barré', '<circle cx="24" cy="24" r="13"/><path d="M15 33L33 15"/>'],
    ['un L', '<path d="M15 9v30h20"/>'],
  ];
  const symSvg = (i, px, cls) => `<svg class="sym ${cls || ''}" width="${px}" height="${px}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${esc(SYMS[i][0])}">${SYMS[i][1]}</svg>`;
  const RATE = { love: 'J\'adore', ok: 'Bien', no: 'Bof' };
  let WALK = null, WSEG = 'list', WPEND = null, WRATE = 'ok', WFIND = null, WSEL = null; const WSENSE = new Set();
  // Lieux de balade et magasins courants : on les propose dès les premières lettres.
  const WALK_PLACES = ['Sephora Champs-Élysées, Paris', 'Nose Paris, Paris', 'Jovoy Paris, rue de Castiglione', 'Galeries Lafayette Haussmann, Paris', 'Printemps Haussmann, Beauté, Paris', 'Le Bon Marché, Rive Gauche, Paris', 'Officine Universelle Buly, Paris', 'Diptyque, Saint-Germain, Paris', 'Frédéric Malle, Paris', 'Serge Lutens, Palais Royal, Paris', 'Maison Francis Kurkdjian, rue Saint-Honoré', 'Le Labo, Marais, Paris', 'Guerlain, Champs-Élysées, Paris', 'Parfums de Marly, Paris', 'Roja Parfums, Londres', 'Harrods, Londres', 'Selfridges, Londres', 'Liberty, Londres', 'Penhaligon\'s, Londres', 'Floris, Jermyn Street, Londres', 'Bergdorf Goodman, New York', 'Saks Fifth Avenue, New York', 'Bloomingdale\'s, New York', 'Sephora, centre commercial', 'Douglas', 'Marionnaud', 'Nocibé', 'Dubai Mall, Dubai', 'Souk des parfums, Dubai', 'Rue Saint-Honoré, Paris', 'Le Marais, Paris', 'Saint-Germain-des-Prés, Paris', 'Palais Royal, Paris', 'Place Vendôme, Paris', 'Rue Saint-Dominique, Paris', 'Aéroport, duty free', 'Chez un ami', 'Salon de parfumerie', 'Parfumerie de niche près de chez moi'];
  const SENSE_NOTES = ['agrumes', 'frais', 'vert', 'aromatique', 'floral', 'rose', 'jasmin', 'fruité', 'gourmand', 'vanille', 'caramel', 'chocolat', 'café', 'épicé', 'poivre', 'boisé', 'santal', 'cèdre', 'oud', 'fumé', 'encens', 'cuir', 'tabac', 'ambré', 'résine', 'musqué', 'poudré', 'iris', 'marin', 'salé', 'terreux', 'animal'];
  const SENSE_FEEL = ['chaud', 'sucré', 'sec', 'propre', 'sensuel', 'puissant', 'discret', 'doux', 'original', 'élégant', 'lourd', 'léger', 'je le reconnais'];
  const walkDate = (w) => new Date(w.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const nextSym = (w) => { const used = new Set(w.entries.map((e) => e.sym)); for (let i = 0; i < SYMS.length; i++) if (!used.has(i)) return i; return w.entries.length % SYMS.length; };

  function viewWalk() {
    const w = S.walks.find((x) => x.id === WALK);
    if (!w) {
      $('#view').innerHTML = `
        <section class="sec"><header><h2>Balade olfactive</h2></header>
          <p style="color:var(--muted)">Tu testes des parfums en boutique ? Photographie ou note chaque touche : je te donne un symbole à dessiner dessus pour savoir, plus tard, quelle touche est quel parfum.</p>
          <button class="cta full" id="wNew"><span>Commencer une balade</span></button><button class="ghost" id="wMap" style="justify-self:start">Où acheter près de moi</button></section>
        ${S.walks.length ? `<section class="sec"><header><h2 style="font-size:20px">Tes balades</h2></header>${[...S.walks].reverse().map((x) => `<button class="wcard" data-w="${x.id}"><span><b>${esc(x.place || 'Balade')}</b><small>${esc(walkDate(x))} · ${x.entries.length} touche${x.entries.length > 1 ? 's' : ''}</small></span><span class="symrow">${x.entries.slice(0, 7).map((e) => symSvg(e.sym, 22)).join('')}</span></button>`).join('')}</section>` : ''}`;
      $('#wMap').onclick = openShopMap;
      $('#wNew').onclick = () => {
        const pn = openSheet(`<div><h2>Nouvelle balade</h2><p style="color:var(--muted);margin-top:6px">Où testes-tu aujourd'hui ?</p></div><div class="acwrap"><input type="text" id="wplace" placeholder="Rue Saint-Honoré, Sephora, Jovoy… (facultatif)" autocomplete="off"><div class="aclist" id="wplaceac" hidden></div></div><div class="chips">${['Sephora Champs-Élysées, Paris', 'Nose Paris, Paris', 'Jovoy Paris, rue de Castiglione', 'Le Bon Marché, Rive Gauche, Paris'].map((x) => `<button type="button" class="chip" data-wp="${esc(x)}">${esc(x.split(',')[0])}</button>`).join('')}</div><button class="cta full" id="wgo2"><span>C'est parti</span></button>`);
        const pin = $('#wplace', pn), pbox = $('#wplaceac', pn);
        const showP = () => { const q = E.norm(pin.value); const r = q.length < 1 ? [] : WALK_PLACES.filter((x) => E.norm(x).includes(q)).slice(0, 6); pbox.hidden = !r.length; pbox.innerHTML = r.map((x) => `<button type="button" class="acitem" data-p="${esc(x)}"><b>${esc(x)}</b></button>`).join(''); $$('[data-p]', pbox).forEach((b) => (b.onpointerdown = (ev) => { ev.preventDefault(); pin.value = b.dataset.p; pbox.hidden = true; })); };
        pin.oninput = showP; pin.onblur = () => setTimeout(() => { pbox.hidden = true; }, 120);
        $$('[data-wp]', pn).forEach((b) => (b.onclick = () => { pin.value = b.dataset.wp; pbox.hidden = true; }));
        $('#wgo2', pn).onclick = () => { const w2 = { id: uid(), date: today(), place: $('#wplace', pn).value.trim(), entries: [] }; S.walks.push(w2); save(); WALK = w2.id; WSEG = 'list'; closeSheet(); viewWalk(); };
      };
      $$('[data-w]').forEach((b) => (b.onclick = () => { WALK = b.dataset.w; WSEG = 'list'; WPEND = null; viewWalk(); }));
      return;
    }
    const n = w.entries.length, sym = nextSym(w);
    $('#view').innerHTML = `
      <section class="sec" style="margin-top:18px"><button class="ghost" id="wBack" style="justify-self:start">← Balades</button>
        <header><h2>${esc(w.place || 'Balade olfactive')}</h2><span class="mono">${esc(walkDate(w))} · ${n} touche${n > 1 ? 's' : ''}</span></header></section>
      <section class="sec" style="margin-top:14px"><div class="card wadd">
        <div class="symhint">${symSvg(sym, 64, 'big')}<div><p class="mono">Touche n° ${n + 1}</p><p style="font-size:17px;margin-top:4px">Dessine <b>${esc(SYMS[sym][0])}</b> au dos de la touche.</p></div></div>
        <div class="acwrap"><input type="text" id="wname" placeholder="Nom du parfum : choisis dans la liste, ou prends-le en photo" autocomplete="off"><div class="aclist" id="wnameac" hidden></div></div>
        <p class="mono" id="wsel" style="text-transform:none;letter-spacing:0">${WSEL ? 'Dans la base : ' + esc(WSEL.name) + ' · ' + esc(WSEL.house) : ''}</p>
        <details class="wsense" ${WSENSE.size ? 'open' : ''}><summary class="mono">Ce que tu sens (touche pour choisir)</summary>
          <p class="mono" style="text-transform:none;letter-spacing:0;margin-top:8px">Les notes que tu reconnais</p><div class="chips" id="wsn">${SENSE_NOTES.map((x) => `<button type="button" class="chip ${WSENSE.has(x) ? 'on' : ''}" data-sn2="${esc(x)}">${esc(x)}</button>`).join('')}</div>
          <p class="mono" style="text-transform:none;letter-spacing:0;margin-top:8px">Ton impression</p><div class="chips" id="wsf">${SENSE_FEEL.map((x) => `<button type="button" class="chip ${WSENSE.has(x) ? 'on' : ''}" data-sn2="${esc(x)}">${esc(x)}</button>`).join('')}</div></details>
        <textarea id="wnote" rows="2" placeholder="Autre chose à noter (facultatif) : ouverture, cœur, ce que ça évoque…"></textarea>
        <div class="chips" id="wrate">${Object.entries(RATE).map(([k, v]) => `<button class="chip ${WRATE === k ? 'on' : ''}" data-r="${k}">${v}</button>`).join('')}</div>
        <div class="row"><button class="chip photo-btn" id="wph">${WPEND && WPEND.file ? `<img alt="" src="${URL.createObjectURL(WPEND.file)}">` : IC.cam}<span>${WPEND && WPEND.file ? 'Photo ajoutée' : 'Photographier le flacon'}</span></button><input type="file" id="wphin" accept="image/*" capture="environment" hidden></div>
        <p class="mono" id="wai" style="text-transform:none;letter-spacing:0"></p>
        <button class="cta full" id="wAdd"><span>Enregistrer la touche</span></button></div></section>
      ${n ? `<div class="seg" id="wseg"><button data-s="list" class="${WSEG === 'list' ? 'on' : ''}">Mes touches</button><button data-s="find" class="${WSEG === 'find' ? 'on' : ''}">Retrouver une touche</button></div>` : ''}
      <section class="sec" style="margin-top:14px" id="wbody">${WSEG === 'find' && n ? walkFind(w) : [...w.entries].reverse().map((e) => walkEntry(e)).join('')}</section>
      ${n ? `<section class="sec"><button class="ghost" id="wSum" style="justify-self:start">Faire le bilan de la balade</button><div id="wsumres" style="display:grid;gap:12px"></div></section>` : ''}`;
    $('#wBack').onclick = () => { WALK = null; WPEND = null; viewWalk(); };
    $$('#wrate .chip').forEach((c) => (c.onclick = () => { WRATE = c.dataset.r; $$('#wrate .chip').forEach((x) => x.classList.toggle('on', x === c)); }));
    { const nin = $('#wname'), nbox = $('#wnameac');
      const showN = () => { const q = E.norm(nin.value); if (WSEL && E.norm(WSEL.name) !== q) { WSEL = null; $('#wsel').textContent = ''; }
        const r = q.length < 2 ? [] : filterDbQuick(q).slice(0, 7); nbox.hidden = !r.length;
        nbox.innerHTML = r.map((e, i) => `<button type="button" class="acitem" data-i="${i}"><b>${esc(e.name)}</b><small>${esc(e.house)}${e.family ? ' · ' + esc(famLabel(e.family)) : ''}</small></button>`).join('');
        $$('.acitem', nbox).forEach((b) => (b.onpointerdown = (ev) => { ev.preventDefault(); WSEL = r[+b.dataset.i]; nin.value = WSEL.name; nbox.hidden = true; $('#wsel').textContent = 'Dans la base : ' + WSEL.name + ' · ' + WSEL.house; })); };
      nin.oninput = showN; nin.onblur = () => setTimeout(() => { nbox.hidden = true; }, 120);
      $$('[data-sn2]').forEach((b) => (b.onclick = () => { const k = b.dataset.sn2; if (WSENSE.has(k)) WSENSE.delete(k); else WSENSE.add(k); b.classList.toggle('on', WSENSE.has(k)); })); }
    $('#wph').onclick = () => $('#wphin').click();
    $('#wphin').onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return; WPEND = { file: f };
      const keepName = $('#wname').value, keepNote = $('#wnote').value; viewWalk(); $('#wname').value = keepName; $('#wnote').value = keepNote;
      if (!CAN_IMG) return;
      const st = $('#wai'); st.textContent = 'Je lis le flacon…';
      try {
        const j = await aiJson(`Cette photo montre un flacon de parfum (ou son étiquette) que je viens de sentir en boutique. Identifie-le. Réponds UNIQUEMENT par un JSON : {"name":"nom officiel, vide si illisible","house":"maison","family":"${FAMS}","notes":["jusqu'à 8 notes en français"],"confidence":0 à 1}`, { modelTier: 'default', images: [f] });
        WPEND.info = j;
        if (j.name) { if (!$('#wname').value) $('#wname').value = j.name; st.textContent = 'Reconnu : ' + j.name + (j.house ? ' · ' + j.house : ''); } else st.textContent = 'Flacon non reconnu : note le nom.';
      } catch (er) { st.textContent = 'Reconnaissance indisponible : note le nom à la main.'; }
    };
    $('#wAdd').onclick = async () => {
      const name = $('#wname').value.trim(), info = (WPEND && WPEND.info) || {};
      const sensed = [...WSENSE], nSense = sensed.filter((x) => SENSE_NOTES.includes(x)), fSense = sensed.filter((x) => SENSE_FEEL.includes(x));
      const note = [nSense.length ? 'Je sens : ' + nSense.join(', ') + '.' : '', fSense.length ? 'Impression : ' + fSense.join(', ') + '.' : '', $('#wnote').value.trim()].filter(Boolean).join(' ');
      if (!name && !note && !(WPEND && WPEND.file)) { $('#wname').focus(); return; }
      const nm = name || info.name || 'Sans nom', c = CAT.find((x) => E.norm(x.name) === E.norm(nm));
      const sel = WSEL && E.norm(WSEL.name) === E.norm(nm) ? WSEL : dbList().find((x) => E.norm(x.name) === E.norm(nm) && !x.ed) || null;
      const e = { id: uid(), sym: nextSym(w), name: sel ? sel.name : nm, house: (sel && sel.house) || (c && c.house) || info.house || '', family: (sel && sel.family) || (c && c.family) || info.family || '', notes: (sel && (sel.notes || []).length ? [...sel.notes] : (c && [...c.notes])) || (info.notes || []).map(String), note, rating: WRATE, date: today(), inDb: !!sel };
      // un parfum inconnu de la base y est ajouté directement : il devient cherchable et ajoutable à la wishlist
      if (!sel && nm !== 'Sans nom') { S.customDb = S.customDb || []; if (!S.customDb.some((x) => E.norm(x.name) === E.norm(nm))) S.customDb.push({ name: nm, house: e.house, family: e.family, notes: e.notes }); e.inDb = true; }
      WSEL = null; WSENSE.clear();
      $('#wAdd').disabled = true;
      if (WPEND && WPEND.file && HAS_ASSETS) { try { e.photo = await putPhoto(WPEND.file); } catch (er) { /* sans photo */ } }
      w.entries.push(e); save(); WPEND = null; WRATE = 'ok'; WSEG = 'list'; viewWalk();
    };
    if ($('#wseg')) $$('#wseg button').forEach((b) => (b.onclick = () => { WSEG = b.dataset.s; WFIND = null; viewWalk(); }));
    if ($('#wSum')) $('#wSum').onclick = () => walkSummary(w);
    walkBind(w);
  }
  function filterDbQuick(q) {
    return dbList().filter((e) => !e.ed).map((e) => { const n = E.norm(e.name), nh = E.norm(e.house + ' ' + e.name); const r = n === q ? 0 : n.startsWith(q) ? 1 : nh.startsWith(q) ? 2 : n.includes(q) ? 3 : nh.includes(q) ? 4 : q.split(' ').every((w) => nh.includes(w)) ? 5 : 9; return { e, r }; }).filter((x) => x.r < 9).sort((a, b) => a.r - b.r || (imgOf(b.e) ? 1 : 0) - (imgOf(a.e) ? 1 : 0) || a.e.name.localeCompare(b.e.name, 'fr')).map((x) => x.e);
  }
  function walkEntry(e) {
    return `<article class="wentry"><div class="wsym">${symSvg(e.sym, 40)}</div><div class="wbody"><div class="row" style="justify-content:space-between;gap:8px"><button type="button" class="lnk" data-wo="${e.id}"><b>${esc(e.name)}</b></button><span class="tag">${esc(RATE[e.rating] || '')}</span></div>${e.house ? `<small>${esc(e.house)}${e.family ? ' · ' + esc(famLabel(e.family)) : ''}</small>` : ''}${e.notes && e.notes.length ? `<small>${esc(e.notes.slice(0, 6).join(' · '))}</small>` : ''}${e.note ? `<p>${esc(e.note)}</p>` : ''}
      <div class="row" style="margin-top:8px"><button class="ghost" data-wl="${e.id}">${hasWish(e.name) ? 'Dans la wishlist' : 'Wishlist'}</button><button class="ghost" data-we="${e.id}">Modifier</button></div></div>${e.photo ? `<img class="wthumb" alt="" src="/_blob/${esc(e.photo)}">` : ''}</article>`;
  }
  function walkFind(w) {
    const sel = w.entries.find((e) => e.id === WFIND);
    return `<p class="mono">Touche à la main ? Choisis le symbole que tu as dessiné.</p><div class="symgrid">${w.entries.map((e) => `<button class="symtile ${WFIND === e.id ? 'on' : ''}" data-f="${e.id}">${symSvg(e.sym, 44)}<small>${esc(SYMS[e.sym][0])}</small></button>`).join('')}</div>${sel ? walkEntry(sel) : ''}`;
  }
  function walkBind(w) {
    $$('[data-f]').forEach((b) => (b.onclick = () => { WFIND = b.dataset.f; viewWalk(); }));
    $$('[data-wo]').forEach((b) => (b.onclick = () => { const e = w.entries.find((x) => x.id === b.dataset.wo); if (e) openEntry(ficheOf(e)); }));
    $$('[data-wl]').forEach((b) => (b.onclick = () => { const e = w.entries.find((x) => x.id === b.dataset.wl); if (!e) return; if (hasWish(e.name)) rmWish(e.name); else { const f = ficheOf(e); addWish(CAT.find((c) => E.norm(c.name) === E.norm(e.name)) ? wishFromName(CAT.find((c) => E.norm(c.name) === E.norm(e.name)).name) : { name: f.name, house: f.house, family: f.family || '', notes: f.notes || [], price: f.price || 0 }); } save(); viewWalk(); }));
    $$('[data-we]').forEach((b) => (b.onclick = () => walkEdit(w, w.entries.find((x) => x.id === b.dataset.we))));
  }
  function walkEdit(w, e) {
    let rate = e.rating;
    const pn = openSheet(`<div><h2>Modifier la touche</h2><p class="mono" style="margin-top:6px">${symSvg(e.sym, 22)} ${esc(SYMS[e.sym][0])}</p></div><input type="text" id="en" value="${esc(e.name)}"><textarea id="eno" rows="3">${esc(e.note || '')}</textarea>
      <div class="chips" id="er">${Object.entries(RATE).map(([k, v]) => `<button class="chip ${rate === k ? 'on' : ''}" data-r="${k}">${v}</button>`).join('')}</div>
      <div class="row" style="justify-content:space-between"><button class="ghost danger" id="edel">Supprimer</button><button class="cta" id="esave"><span>Enregistrer</span></button></div>`);
    $$('#er .chip', pn).forEach((c) => (c.onclick = () => { rate = c.dataset.r; $$('#er .chip', pn).forEach((x) => x.classList.toggle('on', x === c)); }));
    $('#esave', pn).onclick = () => { e.name = $('#en', pn).value.trim() || e.name; e.note = $('#eno', pn).value.trim(); e.rating = rate; save(); closeSheet(); viewWalk(); };
    $('#edel', pn).onclick = (ev) => { if (!ev.target.dataset.sure) { ev.target.dataset.sure = 1; ev.target.textContent = 'Confirmer'; return; } w.entries = w.entries.filter((x) => x.id !== e.id); save(); closeSheet(); viewWalk(); };
  }
  // Bilan de balade calculé sur l'appareil : ce que les touches disent des goûts, ce qu'il faut retenir, et la suite.
  function walkAnalysis(w) {
    const WT = { love: 2.5, ok: 0.8, no: -2 }, nm = new Map(), fam = new Map(), fl = new Map();
    const grab = (e, re) => { const m = re.exec(e.note || ''); return m ? m[1].split(',').map((x) => x.trim()).filter(Boolean) : []; };
    const rows = w.entries.map((e) => { const f = ficheOf(e), notes = [...new Map([...(f.notes || e.notes || []), ...grab(e, /Je sens : ([^.]*)\./)].map((n) => [E.norm(n), n])).values()]; return { e, f, notes, feel: grab(e, /Impression : ([^.]*)\./), v: WT[e.rating] == null ? 0 : WT[e.rating] }; });
    const bump = (m, key, label, v) => { const o = m.get(key) || { n: label, v: 0, c: 0 }; o.v += v; o.c++; m.set(key, o); };
    rows.forEach((r) => { r.notes.forEach((n) => bump(nm, E.norm(n), n, r.v)); if (r.f.family) bump(fam, r.f.family, famLabel(r.f.family), r.v); r.feel.forEach((x) => bump(fl, x, x, r.v)); });
    const top = (m, sign, k) => [...m.values()].filter((o) => (sign > 0 ? o.v >= 2 : o.v <= -2)).sort((a, b) => sign * (b.v - a.v) || b.c - a.c).slice(0, k);
    const lovedN = top(nm, 1, 5), badN = top(nm, -1, 4), lovedF = top(fam, 1, 2), badF = top(fam, -1, 1), lovedFeel = top(fl, 1, 3);
    const loved = rows.filter((r) => r.e.rating === 'love'), ok = rows.filter((r) => r.e.rating === 'ok'), no = rows.filter((r) => r.e.rating === 'no');
    const liked = S.settings.liked || [], avoid = S.settings.avoid || [];
    const conflict = liked.filter((n) => { const o = nm.get(E.norm(n)); return o && o.v <= -2; });
    const newLiked = lovedN.filter((o) => noteSt(o.n) !== 1 && !conflict.some((c) => E.norm(c) === E.norm(o.n))).slice(0, 4), newAvoid = badN.filter((o) => noteSt(o.n) === 0).slice(0, 3);
    const names = new Set(rows.map((r) => E.norm(r.e.name))), famK = (c) => E.norm(c.house) + '|' + (E.norm(c.name).split(' ').filter((x) => !['le', 'la', 'les', 'l', 'the', 'eau', 'de', 'du', 'd'].includes(x))[0] || '');
    const touchedFam = new Set(rows.map((r) => famK(r.f)));
    const st2 = Object.assign({}, S.settings, { gender: S.profile && S.profile.gender, age: S.profile && S.profile.age, fb: S.feedback || [], seed: PROFILES.active, liked: [...new Set([...liked, ...lovedN.map((o) => o.n)])] });
    const sig = S.wishlist.concat(rows.map((r) => ({ name: r.e.name, house: r.f.house, family: r.f.family || '', notes: r.notes, st: 'smelled', verdict: r.e.rating })));
    let recs = []; try { const seen = new Set(); recs = E.recommend(needPool(), S.collection, sig, st2).filter((r) => !names.has(E.norm(r.c.name)) && !touchedFam.has(famK(r.c)) && r.pct >= 55).sort((a, b) => b.total - a.total).filter((r) => { const k = famK(r.c); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 4); } catch (er) { recs = []; }
    return { rows, loved, ok, no, lovedN, badN, lovedF, badF, lovedFeel, conflict, newLiked, newAvoid, recs };
  }
  function walkSummary(w) {
    const out = $('#wsumres'), A = walkAnalysis(w), n = A.rows.length, nn = (a) => a.map((o) => o.n);
    const say = [];
    say.push(A.loved.length ? `Sur ${n} touche${n > 1 ? 's' : ''}, ${A.loved.length === 1 ? 'un seul parfum t\'a vraiment séduit' : A.loved.length + ' t\'ont vraiment séduit'}${A.ok.length ? (A.ok.length === 1 ? ' et un autre t\'a plu sans plus' : ` et ${A.ok.length} t'ont plu sans plus`) : ''}.` : `Sur ${n} touche${n > 1 ? 's' : ''}, aucun coup de cœur pour l'instant${A.ok.length ? `, mais ${A.ok.length} parfum${A.ok.length > 1 ? 's' : ''} correct${A.ok.length > 1 ? 's' : ''}` : ''}.`);
    if (A.lovedN.length) say.push(`Ce que tu as aimé tourne autour ${A.lovedN.length > 1 ? 'de' : 'de la note'} ${listFr(nn(A.lovedN.slice(0, 4)))}${A.lovedF.length ? `, avec une préférence côté ${listFr(nn(A.lovedF).map((x) => x.toLowerCase()))}` : ''}.`);
    if (A.badN.length) say.push(`Ce qui t'a freiné ressemble à ${listFr(nn(A.badN.slice(0, 3)))}${A.badF.length ? `, et plutôt côté ${nn(A.badF)[0].toLowerCase()}` : ''}.`);
    if (A.lovedFeel.length) say.push(`Tu retiens des parfums ${listFr(nn(A.lovedFeel))}.`);
    if (A.conflict.length) say.push(`Tu dis aimer ${listFr(A.conflict.slice(0, 2))}, pourtant ${A.conflict.length > 1 ? 'ces notes t\'ont gêné' : 'cette note t\'a gêné'} dans cette balade. Ça dépend du parfum, pas seulement de la note.`);
    const keep = A.loved.concat(A.ok).slice(0, 5), price = (r) => (r.f.price ? ` Compte environ ${r.f.price} euros.` : '');
    const why = (r) => { const hit = r.notes.filter((x) => A.lovedN.some((o) => E.norm(o.n) === E.norm(x))).slice(0, 3); return (r.e.rating === 'love' ? 'Coup de cœur' : 'Plutôt bien') + (hit.length ? `, tu y retrouves ${listFr(hit)}.` : '.') + price(r); };
    const bad = (r) => { const hit = r.notes.filter((x) => A.badN.some((o) => E.norm(o.n) === E.norm(x))).slice(0, 2); return hit.length ? `À cause de ${listFr(hit)}.` : 'Il ne t\'a pas parlé.'; };
    const tip = [];
    if (A.loved.length >= 2) tip.push('Tu as plusieurs coups de cœur. Teste les deux sur ta peau le même jour, un sur chaque poignet, et garde celui qui tient le mieux.');
    if (A.loved.length === 1) tip.push(`Reviens avec un échantillon de ${A.loved[0].e.name} et porte-le une journée entière avant de l'acheter.`);
    if (!A.loved.length) tip.push('Aucun coup de cœur, ce n\'est pas grave. Reviens avec un style précis en tête, par exemple une note que tu adores, et demande-la au vendeur.');
    const cheap = A.loved.filter((r) => r.f.price).sort((a, b) => a.f.price - b.f.price)[0]; if (cheap && A.loved.length > 1) tip.push(`Le plus doux pour le budget est ${cheap.e.name}, autour de ${cheap.f.price} euros.`);
    out.innerHTML = `<div class="card tsum"><p class="mono">Ce que ta balade dit de toi</p><p class="rd">${say.map(esc).join(' ')}</p></div>
      ${A.newLiked.length || A.newAvoid.length ? `<div class="card" style="display:grid;gap:10px"><p class="mono">Mettre ton profil à jour</p><p class="soft" style="color:var(--muted);font-size:14px">Touche pour garder ou écarter, puis valide.</p>
        ${A.newLiked.length ? `<p class="mono tg">Nouvelles notes que tu aimes</p><div class="chips">${A.newLiked.map((o) => `<button type="button" class="chip nt on" data-wn="1" data-n="${esc(o.n)}">${esc(o.n)}</button>`).join('')}</div>` : ''}
        ${A.newAvoid.length ? `<p class="mono tg">Notes à fuir</p><div class="chips">${A.newAvoid.map((o) => `<button type="button" class="chip nt no" data-wn="-1" data-n="${esc(o.n)}">${esc(o.n)}</button>`).join('')}</div>` : ''}
        <button class="cta" id="wUpd" style="justify-self:start"><span>Mettre à jour mon profil</span></button></div>` : ''}
      ${keep.length ? `<p class="mono">À retenir</p>${keep.map((r) => `<div class="wentry"><div class="wsym">${symSvg(r.e.sym, 32)}</div><div class="wbody"><button type="button" class="lnk" data-wo="${r.e.id}"><b>${esc(r.e.name)}</b></button><small>${esc(why(r))}</small><div class="row" style="margin-top:8px"><button class="ghost" data-kw="${r.e.id}">${hasWish(r.e.name) ? 'Dans la wishlist' : 'Wishlist'}</button><button class="ghost" data-ko="${r.e.id}">Je l'ai</button></div></div></div>`).join('')}` : ''}
      ${A.no.length ? `<p class="mono">À oublier</p><div class="card" style="display:grid;gap:6px">${A.no.map((r) => `<p class="rd" style="margin:0"><b>${esc(r.e.name)}</b> ${esc(bad(r))}</p>`).join('')}</div>` : ''}
      ${A.recs.length ? `<p class="mono">Dans la même veine, à sentir ensuite</p>${A.recs.map((r) => `<div class="wentry"><div class="wbody"><button type="button" class="lnk" data-wr="${esc(r.c.name)}"><b>${esc(r.c.name)}</b></button><small>${esc(r.c.house)}${r.c.family ? ' · ' + esc(famLabel(r.c.family)) : ''}${r.c.price ? ' · ≈ ' + r.c.price + ' €' : ''} · ${r.pct} % compatible</small><small>${esc((r.hits.length ? 'Tu aimes ' + listFr(r.hits) + '.' : r.axisWhy.length ? 'Dans ta veine ' + listFr(r.axisWhy) + '.' : '') )}</small><div class="row" style="margin-top:8px"><button class="ghost" data-rw2="${esc(r.c.name)}">${hasWish(r.c.name) ? 'Dans la wishlist' : 'Wishlist'}</button></div></div></div>`).join('')}` : ''}
      ${tip.length ? `<div class="card" style="display:grid;gap:6px"><p class="mono">Pour la suite</p>${tip.map((t) => `<p class="rd" style="margin:0">${esc(t)}</p>`).join('')}</div>` : ''}
      <div class="row"><button class="ghost" id="wAi">${IC.spark} Avis du nez par l'IA</button><button class="ghost" id="wShops">Où acheter près de moi</button></div><div id="wsumai" style="display:grid;gap:12px"></div>`;
    $$('[data-wn]', out).forEach((b) => (b.onclick = () => { const on = b.classList.contains('on') || b.classList.contains('no'); b.dataset.off = on ? '1' : ''; b.classList.toggle('on', !on && b.dataset.wn === '1'); b.classList.toggle('no', !on && b.dataset.wn === '-1'); if (on) { b.classList.remove('on', 'no'); b.style.opacity = '.45'; } else b.style.opacity = ''; }));
    if ($('#wUpd', out)) $('#wUpd', out).onclick = (ev) => { $$('[data-wn]', out).forEach((b) => { if (b.dataset.off) return; setNote(b.dataset.n, +b.dataset.wn); }); ev.currentTarget.querySelector('span').textContent = 'Profil mis à jour ✓'; ev.currentTarget.disabled = true; };
    $$('[data-kw]', out).forEach((b) => (b.onclick = () => { const e = w.entries.find((x) => x.id === b.dataset.kw), f = ficheOf(e); const c = CAT.find((x) => E.norm(x.name) === E.norm(e.name)); addWish(c ? wishFromName(c.name) : { name: f.name, house: f.house, family: f.family || '', notes: f.notes || [], price: f.price || 0 }); b.textContent = 'Dans la wishlist'; }));
    $$('[data-ko]', out).forEach((b) => (b.onclick = () => { const e = w.entries.find((x) => x.id === b.dataset.ko), f = ficheOf(e); if (S.collection.some((p) => E.norm(p.name) === E.norm(e.name))) { b.textContent = 'Déjà chez toi'; return; } const c = CAT.find((x) => E.norm(x.name) === E.norm(e.name)); S.collection.push(c ? fromCat(c) : fromCat({ name: f.name, house: f.house, family: f.family || 'boisé', notes: f.notes || [], projection: f.projection || 3, longevity: f.longevity || 3, weight: f.weight || 3, price: f.price || 0 }, 4)); rmWish(e.name); save(); b.textContent = 'Ajouté à ma collection ✓'; }));
    $$('[data-wo]', out).forEach((b) => (b.onclick = () => { const e = w.entries.find((x) => x.id === b.dataset.wo); if (e) openEntry(ficheOf(e)); }));
    $$('[data-wr]', out).forEach((b) => (b.onclick = () => { const r = A.recs.find((x) => x.c.name === b.dataset.wr); if (r) openEntry(ficheOf(r.c)); }));
    $$('[data-rw2]', out).forEach((b) => (b.onclick = () => { const n = b.dataset.rw2; if (hasWish(n)) { rmWish(n); b.textContent = 'Wishlist'; } else { const r = A.recs.find((x) => x.c.name === n); addWish(CAT.find((c) => c.name === n) ? wishFromName(n) : { name: n, house: r.c.house, family: r.c.family || '', notes: r.c.notes || [], price: r.c.price || 0 }); b.textContent = 'Dans la wishlist'; } }));
    $('#wAi', out).onclick = () => walkSummaryAI(w);
    $('#wShops', out).onclick = () => openShopMap();
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const e0 = (er) => (er && er.code === 'not_granted' ? 'Autorise l\'IA pour obtenir cet avis.' : 'L\'IA n\'est pas disponible ici. Le bilan ci-dessus est calculé sur ton appareil.');
  async function walkSummaryAI(w) {
    const out = $('#wsumai'); out.innerHTML = '<div class="shim"></div><div class="shim" style="width:70%"></div>'; const gb = $('#wAi'); if (gb) gb.disabled = true;
    const lines = w.entries.map((e) => `${e.name} | ${e.house} | ${e.notes.join(', ')} | ${RATE[e.rating]} | ${e.note || ''}`).join('\n');
    try {
      const j = await aiJson(`Tu es un nez de parfumerie. Voici les parfums que j'ai sentis pendant une balade en boutique (nom | maison | notes | mon avis | ma remarque) :\n${lines}\n\nMa collection actuelle :\n${colLines()}\n\nRéponds UNIQUEMENT par un JSON : {"taste":"ce que mes avis révèlent de mes goûts, 2 phrases, tutoiement","keep":[{"name":"nom exact d'une touche à retenir","why":"pourquoi, 10 mots max"}],"skip":"ce que je peux oublier, 1 phrase"}`, { modelTier: 'default' });
      const keep = (j.keep || []).map((k) => ({ k, e: w.entries.find((e) => E.norm(e.name) === E.norm(k.name)) })).filter((x) => x.e);
      out.innerHTML = `<p style="font-size:17px;font-weight:300">${esc(j.taste || '')}</p>${keep.map((x) => `<div class="wentry"><div class="wsym">${symSvg(x.e.sym, 32)}</div><div class="wbody"><b>${esc(x.e.name)}</b><small>${esc(x.k.why || '')}</small><div class="row" style="margin-top:8px"><button class="ghost" data-kw="${x.e.id}">${hasWish(x.e.name) ? 'Dans la wishlist' : 'Wishlist'}</button></div></div></div>`).join('')}${j.skip ? `<p class="mono" style="text-transform:none;letter-spacing:0">${esc(j.skip)}</p>` : ''}`;
      $$('[data-kw]', out).forEach((b) => (b.onclick = () => { const e = w.entries.find((x) => x.id === b.dataset.kw); addWish(CAT.find((c) => E.norm(c.name) === E.norm(e.name)) ? wishFromName(CAT.find((c) => E.norm(c.name) === E.norm(e.name)).name) : e); b.textContent = 'Dans la wishlist'; }));
    } catch (er) {
      out.innerHTML = `<p style="color:var(--muted)">${e0(er)}</p>`;
    }
    if (gb) gb.disabled = false;
  }



  // ---------- Profil : genre et façon de s'habiller (sauvegardé, réutilisé chaque jour) ----------
  const GEN = [['m', 'Un homme'], ['f', 'Une femme'], ['x', 'Je préfère ne pas dire']];
  const DRESS = [['casual', 'Décontracté', 'jean, t-shirt, baskets'], ['smart', 'Smart casual', 'chemise, chino, blazer'], ['costume', 'Élégant', 'costume, tailleur'], ['street', 'Streetwear', 'hoodie, sneakers'], ['sport', 'Sportswear', 'tenue de sport'], ['soiree', 'Chic de soirée', 'robe, veste habillée']];
  const DRESS_SVG = {
    casual: '<path d="M16 10l-9 6 4 7 5-3v21h16V20l5 3 4-7-9-6c-1 3-4 5-8 5s-7-2-8-5z"/>',
    smart: '<path d="M17 8l7 9 7-9 10 6-3 10-5-3v19H15V21l-5 3-3-10z"/><path d="M24 17v25"/>',
    costume: '<path d="M14 8l10 9 10-9"/><path d="M21 17h6l-1.5 5 3.5 16-5 4-5-4 3.5-16z"/>',
    street: '<path d="M14 12c3-3 7-4 10-4s7 1 10 4l8 8-5 5-3-3v20H14V22l-3 3-5-5z"/><path d="M18 12c1 5 4 8 6 8s5-3 6-8"/>',
    sport: '<path d="M5 31c0-4 4-4 8-6l4-8 6 6c4 0 10 2 14 6 2 1 4 3 4 6H5z"/><path d="M5 38h38"/>',
    soiree: '<path d="M7 17l15 7-15 7z"/><path d="M41 17l-15 7 15 7z"/><rect x="21" y="19" width="6" height="10" rx="1"/>',
  };
  const dressIcon = (k, px) => `<svg viewBox="0 0 48 48" width="${px || 40}" height="${px || 40}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${DRESS_SVG[k] || ''}</svg>`;
  const hasProfile = () => !!(S.profile && !S.profile.skipped);
  const cleanAge = (v) => { const n = Math.round(+v); return n >= 10 && n <= 99 ? n : null; };
  const setProfile = (patch) => {
    S.profile = Object.assign({ gender: '', age: null, name: '' }, hasProfile() ? S.profile : {}, patch, { ts: Date.now() }); delete S.profile.skipped; delete S.profile.dress; delete S.profile.note; save();
    const me = PROFILES.list.find((x) => x.id === PROFILES.active); if (me && me.name !== (S.profile.name || '')) { me.name = S.profile.name || ''; saveProfiles(); }
  };
  // Sans compte, pas d'appli : on bloque tant qu'on n'est pas connecté (sauf test / présentation).
  const needAcct = () => !!(window.SillageDemo && !TESTMODE && !PRESENT && !window.SillageDemo.account.loggedIn());
  function gate() {
    if (!needAcct()) return false;
    if (!$('#acct')) { $$('#onb, #prof').forEach((x) => x.remove()); showAccount('force'); }
    return true;
  }
  function maybeProfile() {
    if (gate()) return;
    if (S.profile || PRESENT || $('#onb') || $('#prof') || $('#acct')) return;
    showProfile();
  }
  // Déconnexion ou suppression : on efface les données de cet appareil (téléphone partagé) et on redemande un compte.
  const afterLeave = () => { S = DEF(); S.collection = []; S.wishlist = []; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ok */ } closeSheet(); tab = 'today'; render(true); gate(); };
  // Session expirée : on ne vide rien, on propose de se reconnecter (les données de l'appareil sont gardées).
  window.addEventListener('sillage:expired', () => { if (needAcct() && !$('#acct')) { closeSheet(); $$('#onb, #prof').forEach((x) => x.remove()); showAccount('expired'); } });
  // Compte : créer (puis les questions d'inscription) ou se connecter (le profil complet revient), ou continuer sans compte.
  function showAccount(from, opt) {
    opt = opt || {};
    const A = window.SillageDemo.account;
    const el = document.createElement('div'); el.id = 'acct'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Compte');
    let mode = opt.reset ? 'reset' : from === 'expired' ? 'login' : 'signup', email0 = opt.email || '';
    const MSG = { email: 'Cet email semble incomplet.', password: 'Choisis un mot de passe de 8 caractères minimum.', exists: 'Un compte existe déjà avec cet email : connecte-toi.', credentials: 'Email ou mot de passe incorrect.', rate: 'Trop d\'essais pour l\'instant. Réessaie un peu plus tard.', network: 'Pas de connexion. Réessaie dans un instant.', server: 'Un souci de notre côté. Réessaie dans un instant.', token: 'Ce lien a expiré ou a déjà servi. Demande-en un nouveau.' };
    const draw = () => {
      const T2 = { signup: ['Garde ton profil', 'Un compte sauvegarde tout : tes parfums, ta wishlist, tes goûts. Tu les retrouves sur tous tes appareils.'], login: [from === 'expired' ? 'Reconnecte-toi' : 'Content de te revoir', from === 'expired' ? 'Ta session a expiré, ça arrive. Reconnecte-toi : tout ce que tu as sur cet appareil est gardé.' : 'Connecte-toi pour retrouver ton profil, ta collection et ta wishlist.'], forgot: ['Mot de passe oublié', 'Donne-moi ton email. Si un compte existe, je t\'envoie un lien pour choisir un nouveau mot de passe.'], reset: ['Nouveau mot de passe', 'Choisis-en un nouveau (8 caractères minimum). Ensuite tu es connecté.'] }[mode];
      const isPw = mode !== 'forgot', isEm = mode !== 'reset';
      el.innerHTML = `<div class="prof-in"><p class="mono">Ton compte</p><h2>${T2[0]}</h2>
        <p class="soft">${T2[1]}</p>
        ${mode === 'signup' || mode === 'login' ? `<div class="chips acct-tabs"><button class="chip ${mode === 'signup' ? 'on' : ''}" data-m="signup">Créer un compte</button><button class="chip ${mode === 'login' ? 'on' : ''}" data-m="login">J'ai déjà un compte</button></div>` : ''}
        <form id="acf" class="acf" novalidate>${isEm ? `<input type="email" id="aem" autocomplete="email" inputmode="email" placeholder="Ton email" aria-label="Ton email" value="${esc(email0)}">` : ''}${isPw ? `<input type="password" id="apw" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" placeholder="${mode === 'login' ? 'Mot de passe' : 'Mot de passe (8 caractères minimum)'}" aria-label="Mot de passe">` : ''}
          <p class="mono" id="amsg" role="alert" style="text-transform:none;letter-spacing:0;min-height:18px"></p>
          <button class="cta full" id="ago"><span>${{ signup: 'Créer mon compte', login: 'Me connecter', forgot: 'Recevoir le lien', reset: 'Enregistrer et entrer' }[mode]}</span></button></form>
        ${mode === 'login' ? '<button class="ghost" id="aforgot" type="button">Mot de passe oublié ?</button>' : ''}${mode === 'forgot' ? '<button class="ghost" id="aback" type="button">Retour</button>' : ''}
        <p class="soft small">Ton email sert uniquement à te reconnecter. Tu peux supprimer ton compte à tout moment dans Profil.</p>
        ${from === 'profile' ? '<button class="ghost" id="askip">Fermer</button>' : ''}</div>`;
      $$('[data-m]', el).forEach((b) => (b.onclick = () => { email0 = $('#aem', el) ? $('#aem', el).value : email0; mode = b.dataset.m; draw(); }));
      if ($('#aforgot', el)) $('#aforgot', el).onclick = () => { email0 = $('#aem', el).value; mode = 'forgot'; draw(); };
      if ($('#aback', el)) $('#aback', el).onclick = () => { mode = 'login'; draw(); };
      if ($('#askip', el)) $('#askip', el).onclick = close;
      $('#acf', el).onsubmit = async (ev) => {
        ev.preventDefault(); const em = $('#aem', el) ? $('#aem', el).value.trim() : '', pw = $('#apw', el) ? $('#apw', el).value : '', msg = $('#amsg', el);
        if (isEm && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { msg.textContent = MSG.email; return; }
        if (isPw && mode !== 'login' && pw.length < 8) { msg.textContent = MSG.password; return; }
        $('#ago', el).disabled = true; msg.textContent = '…';
        try {
          if (mode === 'forgot') { await A.forgot(em); msg.textContent = 'C\'est envoyé si un compte existe avec cet email. Regarde ta boîte de réception (et les indésirables).'; $('#ago', el).disabled = false; return; }
          if (mode === 'reset') { const j = await A.reset(opt.reset, pw); try { history.replaceState(null, '', location.pathname); } catch (e3) { /* ok */ } close(); PULLING = true; const d = await A.pull().catch(() => null); if (d && d.data) { S = Object.assign(DEF(), d.data); S.settings = Object.assign(DEF().settings, S.settings); migrate(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e2) { /* ok */ } } PULLING = false; tab = 'today'; render(); afterLogin(); return; }
          if (mode === 'signup') { await A.signup(em, pw); close(); if (hasProfile() || from === 'profile') { save(); if (from === 'profile') render(true); } else showProfile(); afterLogin(); }
          else {
            const j = await A.login(em, pw); PULLING = true;
            // session expirée : ce que l'appareil a de plus récent reste, on le renvoie au serveur ; sinon le profil du serveur revient
            if (from === 'expired' && hasProfile()) { PULLING = false; save(); }
            else if (j.data) { S = Object.assign(DEF(), j.data); S.settings = Object.assign(DEF().settings, S.settings); migrate(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e2) { /* ok */ } }
            PULLING = false; close();
            if (!hasProfile()) showProfile(); else { if (from !== 'expired') tab = 'today'; render(true); }
            afterLogin();
          }
        } catch (e) { PULLING = false; msg.textContent = MSG[e.code] || MSG.server; $('#ago', el).disabled = false; }
      };
    };
    const close = () => { el.remove(); document.body.style.overflow = ''; };
    document.body.appendChild(el); document.body.style.overflow = 'hidden'; draw();
  }
  // Après une connexion : on charge l'offre, et on propose une fois d'installer l'appli sur l'écran d'accueil.
  function afterLogin() { const D = window.SillageDemo; if (!D) return; D.plan.load().then(() => { if (window.SillageProduct) window.SillageProduct.onLogin(); }).catch(() => {}); }

  // ---------- Profil olfactif : notes adorées ou fuies, ambiance, intensité, occasions, budget (un seul éditeur, partout) ----------
  const NOTE_GROUPS = [
    ['Frais et agrumes', 'le frais', ['bergamote', 'citron', 'mandarine', 'pamplemousse', 'orange', 'néroli', 'menthe', 'gingembre']],
    ['Fleurs', 'les fleurs', ['rose', 'jasmin', 'iris', 'fleur d\'oranger', 'tubéreuse', 'violette', 'muguet', 'ylang-ylang', 'pivoine']],
    ['Bois et verdure', 'les bois', ['cèdre', 'santal', 'vétiver', 'gaïac', 'cyprès', 'mousse de chêne', 'lavande', 'romarin', 'sauge']],
    ['Gourmand et fruits', 'le gourmand', ['vanille', 'tonka', 'caramel', 'miel', 'cacao', 'café', 'praline', 'amande', 'rhum', 'noix de coco', 'pomme', 'poire', 'pêche', 'framboise', 'figue']],
    ['Épices et ambre', 'les épices et l\'ambre', ['poivre', 'poivre rose', 'cardamome', 'cannelle', 'safran', 'muscade', 'ambre', 'benjoin', 'labdanum']],
    ['Résines, cuir et fumé', 'le cuir et le fumé', ['encens', 'myrrhe', 'oud', 'cuir', 'tabac', 'patchouli', 'bouleau', 'daim']],
    ['Musc et peau', 'le musc', ['musc', 'ambrette', 'ambroxan', 'aldéhydes']],
  ];
  const VIBE_L = [['frais', 'Propre et frais'], ['sucre', 'Sucré, doudou'], ['sensuel', 'Sensuel et profond'], ['elegant', 'Élégant et poudré'], ['naturel', 'Naturel et vert'], ['original', 'Original, qui ose'], ['classique', 'Classique et sûr']];
  const VIBE_ADJ = { frais: 'le propre et frais', sucre: 'le sucré', sensuel: 'le sensuel', elegant: 'l\'élégant', naturel: 'le naturel', original: 'l\'original', classique: 'le classique' };
  const POWER_L = [['discret', 'Discret, près de la peau'], ['present', 'Présent sans en faire trop'], ['fort', 'Un vrai sillage']];
  const OCC_L = [['quotidien', 'Tous les jours'], ['bureau', 'Bureau'], ['soiree', 'Soirée'], ['rdv', 'Rendez-vous'], ['ete', 'Été'], ['hiver', 'Hiver']];
  const OCC_ADJ = { quotidien: 'tous les jours', bureau: 'le bureau', soiree: 'les soirées', rdv: 'les rendez-vous', ete: 'l\'été', hiver: 'l\'hiver' };
  const listFr = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1]);
  let NVOC = null;
  const noteVocab = () => {
    if (NVOC) return NVOC; const m = new Map();
    CAT.forEach((c) => (c.notes || []).forEach((n) => { const k = E.norm(n); if (!k || k.length > 24 || /livrer|afficher|description|ingredient/.test(k)) return; const o = m.get(k) || { n, c: 0 }; o.c++; m.set(k, o); }));
    NOTE_GROUPS.forEach((g) => g[2].forEach((n) => { const k = E.norm(n); const o = m.get(k) || { n, c: 0 }; o.n = n; o.c += 50; m.set(k, o); }));
    NVOC = [...m.entries()].map(([k, o]) => ({ k, n: o.n, c: o.c })).sort((a, b) => b.c - a.c); return NVOC;
  };
  const noteSt = (n) => { const k = E.norm(n); return (S.settings.liked || []).some((x) => E.norm(x) === k) ? 1 : (S.settings.avoid || []).some((x) => E.norm(x) === k) ? -1 : 0; };
  function setNote(n, st) {
    const k = E.norm(n), f = (a) => (a || []).filter((x) => E.norm(x) !== k);
    S.settings.liked = f(S.settings.liked); S.settings.avoid = f(S.settings.avoid);
    if (st > 0) S.settings.liked.push(n); else if (st < 0) S.settings.avoid.push(n);
    save();
  }
  function profPrecision() {
    const s = S.settings, n = (s.liked || []).length + (s.avoid || []).length + (s.vibes || []).length * 2 + (s.power ? 1 : 0) + (s.occ || []).length + S.collection.length * 1.5;
    return { v: Math.min(1, n / 14), l: n < 3 ? 'faible' : n < 7 ? 'moyenne' : n < 12 ? 'bonne' : 'très bonne' };
  }
  function olfSummary() {
    const s = S.settings, liked = s.liked || [], avoid = s.avoid || [], out = [];
    if (liked.length) {
      const gs = NOTE_GROUPS.map((g) => ({ g, hit: liked.filter((n) => g[2].some((x) => E.norm(x) === E.norm(n))) })).filter((o) => o.hit.length).sort((a, b) => b.hit.length - a.hit.length);
      const other = liked.filter((n) => !NOTE_GROUPS.some((g) => g[2].some((x) => E.norm(x) === E.norm(n))));
      let t = 'Tu aimes surtout ' + listFr(gs.slice(0, 3).map((o) => `${o.g[1]} (${o.hit.slice(0, 3).join(', ')})`));
      if (other.length) t += (gs.length ? ', et aussi ' : ' ') + other.slice(0, 3).join(', ');
      out.push(t + '.');
    }
    if (avoid.length) out.push('Tu fuis ' + listFr(avoid.slice(0, 5)) + '.');
    if ((s.vibes || []).length) out.push('Ton style va vers ' + listFr(s.vibes.slice(0, 3).map((k) => VIBE_ADJ[k]).filter(Boolean)) + '.');
    if (s.power) out.push(s.power === 'discret' ? 'Tu préfères rester discret.' : s.power === 'fort' ? 'Tu assumes un vrai sillage.' : 'Tu veux un parfum présent sans en faire trop.');
    if ((s.occ || []).length) out.push('Tu le portes surtout pour ' + listFr(s.occ.slice(0, 4).map((k) => OCC_ADJ[k]).filter(Boolean)) + '.');
    if (s.budget) out.push('Ton budget tourne autour de ' + s.budget + ' € par flacon.');
    if (S.collection.length >= 3) { const f = {}; S.collection.forEach((p) => { if (p.family) f[p.family] = (f[p.family] || 0) + 1; }); const top = Object.entries(f).sort((a, b) => b[1] - a[1])[0]; if (top) out.push('Ta collection penche vers le ' + famLabel(top[0]).toLowerCase() + '.'); }
    return out.length ? out.join(' ') : 'Ton profil est encore vide. Touche quelques notes ci-dessous, je m\'en sers tout de suite pour choisir.';
  }
  const pillSet = (key, list, multi, attr) => `<div class="chips">${list.map(([k, l]) => { const on = multi ? (S.settings[key] || []).includes(k) : S.settings[key] === k; return `<button type="button" class="chip ${on ? 'on' : ''}" ${attr}="${k}" aria-pressed="${on}">${esc(l)}</button>`; }).join('')}</div>`;
  function tasteHtml(parts) {
    const s = S.settings, cust = [...(s.liked || []), ...(s.avoid || [])].filter((n) => !NOTE_GROUPS.some((g) => g[2].some((x) => E.norm(x) === E.norm(n))));
    const chip = (n) => { const st = noteSt(n); return `<button type="button" class="chip nt ${st > 0 ? 'on' : st < 0 ? 'no' : ''}" data-nt="${esc(n)}" aria-pressed="${st !== 0}">${esc(n)}</button>`; };
    let h = `<div class="card tsum"><p class="mono">Ton profil olfactif</p><p class="rd" data-tsum>${esc(olfSummary())}</p><div class="tmeter"><i data-tmi></i></div><p class="mono" data-tml style="text-transform:none;letter-spacing:0"></p></div>`;
    const gp = parts.filter((x) => /^ng\d$/.test(x)).map((x) => NOTE_GROUPS[+x[2]]);
    if (gp.length) h += `<div class="tpart"><p class="mono">${esc(gp[0][0])}</p><p class="soft">Touche une note une fois pour dire que tu l'adores, deux fois pour dire que tu la fuis, trois fois pour l'effacer.</p><div class="chips">${gp[0][2].map(chip).join('')}</div></div>`;
    if (parts.includes('ngx')) h += `<div class="tpart"><p class="mono">Une autre note</p><p class="soft">Cherche une note qui n'est dans aucune famille, puis touche-la pour la fuir ou l'effacer.</p><div class="acwrap"><input type="text" id="tnadd" placeholder="figue, thé, rhum, iris…" autocomplete="off" aria-label="Ajouter une note"><div class="aclist" id="tnac" hidden></div></div><div class="chips" data-tcust>${cust.map(chip).join('')}</div></div>`;
    if (parts.includes('notes')) h += `<div class="tpart"><p class="mono">Les notes</p><p class="soft">Touche une note une fois pour dire que tu l'adores, deux fois pour dire que tu la fuis, trois fois pour l'effacer.</p>
      ${NOTE_GROUPS.map((g) => `<p class="mono tg">${esc(g[0])}</p><div class="chips">${g[2].map(chip).join('')}</div>`).join('')}
      <p class="mono tg">Une autre note</p><div class="acwrap"><input type="text" id="tnadd" placeholder="figue, thé, rhum, iris…" autocomplete="off" aria-label="Ajouter une note"><div class="aclist" id="tnac" hidden></div></div><div class="chips" data-tcust>${cust.map(chip).join('')}</div></div>`;
    if (parts.includes('vibes')) h += `<div class="tpart"><p class="mono">Ton ambiance</p><p class="soft">Choisis tout ce qui te ressemble.</p>${pillSet('vibes', VIBE_L, true, 'data-vb')}<p class="mono tg">Sa présence</p>${pillSet('power', POWER_L, false, 'data-pw')}</div>`;
    if (parts.includes('occ')) h += `<div class="tpart"><p class="mono">Quand tu le portes</p>${pillSet('occ', OCC_L, true, 'data-oc')}<p class="mono tg">Budget par flacon <b data-bval>${capLabel(s.budget)}</b></p><input type="range" id="tbud" min="0" max="${CAPS.length - 1}" step="1" value="${capIdx(s.budget)}" aria-label="Budget par flacon"></div>`;
    return h;
  }
  // Mes notes : une page par famille de notes, chacune s'ouvre depuis la liste.
  function openNotes() {
    const cnt = (g) => { const l = g[2].filter((n) => noteSt(n) > 0).length, a = g[2].filter((n) => noteSt(n) < 0).length; return (l || a) ? `${l} aimée${l > 1 ? 's' : ''}${a ? `, ${a} fuie${a > 1 ? 's' : ''}` : ''}` : 'Rien de choisi'; };
    const cust = [...(S.settings.liked || []), ...(S.settings.avoid || [])].filter((n) => !NOTE_GROUPS.some((g) => g[2].some((x) => E.norm(x) === E.norm(n)))).length;
    const pn = openSheet(`<div><h2>Mes notes</h2><p style="color:var(--muted);margin-top:6px">Choisis une famille. Dis ce que tu adores et ce que tu fuis, je m'en sers tout de suite.</p></div>
      <div class="mylist">${NOTE_GROUPS.map((g, i) => `<button type="button" class="myc" data-ng="${i}"><b>${esc(g[0])}</b><small>${cnt(g)}</small></button>`).join('')}<button type="button" class="myc" data-ng="x"><b>Une autre note</b><small>${cust ? cust + ' ajoutée' + (cust > 1 ? 's' : '') : 'Chercher une note précise'}</small></button></div>
      <div class="row"><button class="ghost" id="nclose">Fermer</button></div>`);
    $('#nclose', pn).onclick = closeSheet;
    $$('[data-ng]', pn).forEach((b) => (b.onclick = () => openNoteGroup(b.dataset.ng)));
  }
  function openNoteGroup(k) {
    const pn = openSheet(`<div class="row"><button class="ghost" id="nback">‹ Mes notes</button></div><div id="ntp" class="tprof"></div>`);
    mountTaste($('#ntp', pn), [k === 'x' ? 'ngx' : 'ng' + k]); $('#nback', pn).onclick = openNotes;
  }
  function mountTaste(root, parts) {
    root.innerHTML = tasteHtml(parts);
    const upd = () => { const el = $('[data-tsum]', root); if (el) el.textContent = olfSummary(); const pr = profPrecision(); const mi = $('[data-tmi]', root); if (mi) mi.style.width = Math.round(pr.v * 100) + '%'; const ml = $('[data-tml]', root); if (ml) ml.textContent = 'Précision de mes conseils : ' + pr.l + (pr.v < 1 ? '. Plus tu en dis, plus c\'est juste.' : '.'); };
    const cycle = (b) => { const n = b.dataset.nt, st = noteSt(n), nx = st === 0 ? 1 : st === 1 ? -1 : 0; setNote(n, nx); b.classList.toggle('on', nx > 0); b.classList.toggle('no', nx < 0); b.setAttribute('aria-pressed', nx !== 0); if (!NOTE_GROUPS.some((g) => g[2].some((x) => E.norm(x) === E.norm(n))) && nx === 0) b.remove(); upd(); };
    const bindChips = (r) => $$('[data-nt]', r).forEach((b) => (b.onclick = () => cycle(b)));
    bindChips(root);
    const multi = (attr, key, ds) => $$('[' + attr + ']', root).forEach((b) => (b.onclick = () => { const k = b.getAttribute(attr), a = S.settings[key] || []; S.settings[key] = a.includes(k) ? a.filter((x) => x !== k) : [...a, k]; save(); b.classList.toggle('on', S.settings[key].includes(k)); b.setAttribute('aria-pressed', S.settings[key].includes(k)); upd(); }));
    multi('data-vb', 'vibes'); multi('data-oc', 'occ');
    $$('[data-pw]', root).forEach((b) => (b.onclick = () => { const k = b.dataset.pw; S.settings.power = S.settings.power === k ? '' : k; save(); $$('[data-pw]', root).forEach((x) => { x.classList.toggle('on', x.dataset.pw === S.settings.power); x.setAttribute('aria-pressed', x.dataset.pw === S.settings.power); }); upd(); }));
    const bud = $('#tbud', root); if (bud) { bud.addEventListener('input', () => { S.settings.budget = CAPS[+bud.value]; $('[data-bval]', root).textContent = capLabel(S.settings.budget); upd(); }); bud.addEventListener('change', save); }
    const inp = $('#tnadd', root), box = $('#tnac', root);
    if (inp) {
      const add = (n) => { n = String(n).trim(); if (!n) return; const ex = [...$$('[data-nt]', root)].find((b) => E.norm(b.dataset.nt) === E.norm(n)); if (ex) { if (noteSt(n) !== 1) { setNote(ex.dataset.nt, 1); ex.classList.add('on'); ex.classList.remove('no'); } } else { setNote(n, 1); const cb = $('[data-tcust]', root); cb.insertAdjacentHTML('beforeend', `<button type="button" class="chip nt on" data-nt="${esc(n)}" aria-pressed="true">${esc(n)}</button>`); bindChips(cb); } inp.value = ''; box.hidden = true; upd(); };
      const show = () => { const q = E.norm(inp.value); const r = q.length < 2 ? [] : noteVocab().filter((o) => o.k.includes(q)).sort((a, b) => (a.k.startsWith(q) ? 0 : 1) - (b.k.startsWith(q) ? 0 : 1) || b.c - a.c).slice(0, 6); box.hidden = !r.length; box.innerHTML = r.map((o) => `<button type="button" class="acitem" data-n="${esc(o.n)}"><b>${esc(o.n)}</b></button>`).join(''); $$('[data-n]', box).forEach((b) => (b.onpointerdown = (ev) => { ev.preventDefault(); add(b.dataset.n); })); };
      inp.oninput = show; inp.onblur = () => setTimeout(() => { box.hidden = true; }, 120);
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); add(inp.value); } });
    }
    upd();
  }
  // Inscription en 5 temps : prénom, genre, âge, goûts, puis la collection choisie dans la base.
  // ---------- Le voyage : 50 situations de vie, rangées en 5 étapes, reliées aux playlists d'inspiration ----------
  const SITS = [[0,"Le réveil sonne et tu files sous la douche",["Je veux sentir propre","Clean Girl","Daily"],["frais","naturel"],["quotidien"]],[0,"Café noir debout dans la cuisine",["Daily","Tech Bro","Les Sportifs stylés"],["naturel","classique"],["quotidien"]],[0,"Tu choisis ta tenue devant le miroir",["Effortless Chic","It Boy","It Girl"],["elegant","original"],["quotidien"]],[0,"Tu déposes les enfants à l'école en retard",["En famille","Daily","Les valeurs sûres"],["frais","naturel"],["quotidien"]],[0,"Le métro, bondé, à huit heures",["Daily","Je veux sentir propre","Corporate Weapons"],["frais","classique"],["quotidien","bureau"]],[0,"Yoga ou pilates au lever du jour",["Clean Girl","Je veux sentir propre","Sunday Morning"],["frais","naturel"],["quotidien"]],[0,"Croissants chauds à la boulangerie du coin",["Sunday Morning","Paris","Amélie Poulain"],["sucre","naturel"],["quotidien"]],[0,"Tu pars en trottinette ou à vélo en ville",["Les Sportifs stylés","Les Branchés","Daily"],["frais","original"],["quotidien","ete"]],[0,"Brunch du dimanche entre amis",["Sunday Morning","Garden Party","Les Branchés"],["sucre","naturel"],["quotidien"]],[0,"Tu lis le journal en terrasse au soleil",["Bookworm","Mayfair","Sous la chaleur"],["classique","frais"],["quotidien","ete"]],[1,"Tu enchaînes les réunions en costume",["Corporate Weapons","Finance Bro","Job Interview"],["elegant","classique"],["bureau"]],[1,"Tu travailles depuis un café, l'ordi sur les genoux",["Tech Bro","Effortless Chic","Daily"],["frais","naturel"],["quotidien","bureau"]],[1,"Tu as un entretien décisif demain",["Job Interview","Corporate Weapons","Quiet Luxury"],["elegant","classique"],["bureau"]],[1,"Tu lances ta boîte, tout reste à construire",["The Founder","Tech Bro","Kendall Roy"],["original"],["bureau"]],[1,"Tu veux rester discret en open space",["Daily","Clean Girl","Je veux sentir propre"],["frais","naturel"],["bureau","quotidien"]],[1,"Dimanche matin, sans réveil",["Sunday Morning","Clean Girl","Daily"],["naturel","sucre"],["quotidien"]],[1,"Tu cours avant que le soleil se lève",["Les Sportifs stylés","Je veux sentir propre","Sous la chaleur"],["frais"],["quotidien","ete"]],[1,"Tu passes ton temps dans les musées et les librairies",["Bookworm","Les Artsy","Les Fans de design"],["original","elegant"],["quotidien"]],[1,"Déjeuner en famille chez les parents",["En famille","Daily","Garden Party"],["classique","naturel"],["quotidien"]],[1,"Tu travailles dans la mode ou la création",["Les Artsy","Funky Chic","Virgil Abloh"],["original"],["quotidien","soiree"]],[2,"Apéro sur une terrasse en fin de journée",["Les Branchés","Garden Party","Côte d'Azur"],["frais","sucre"],["soiree","ete"]],[2,"Salle de sport puis coup de fraîcheur",["Les Sportifs stylés","F1","Je veux sentir propre"],["frais"],["quotidien"]],[2,"Cinéma d'auteur, puis un verre dans un bar discret",["Les Artsy","Jazz","Intouchables"],["original","classique"],["soiree"]],[2,"Shopping et rues commerçantes du samedi",["Milan","Les Branchés","Effortless Chic"],["elegant","original"],["quotidien"]],[2,"Dîner au restaurant étoilé",["Soirée chic","L'Élégant","London"],["elegant","sensuel"],["soiree"]],[2,"Pizza et vin avec les amis d'enfance",["Rome","Intouchables","Eddie Horniman"],["naturel","sucre"],["quotidien","soiree"]],[2,"Tu rentres tard après un coup de stress",["Bruce Wayne","Léon","Travis Bickle"],["classique","sensuel"],["soiree"]],[2,"Séance de jeux vidéo ou de série en soirée",["Tech Bro","Vincent Vega","Daily"],["original","frais"],["quotidien"]],[2,"Bar à cocktails et mixologie",["L'Ivresse","Samantha Jones","Night Out"],["sensuel","original"],["soiree"]],[2,"Tu cuisines pour des invités",["En famille","Intouchables","Garden Party"],["naturel","sucre"],["quotidien","soiree"]],[3,"Premier rendez-vous ce soir",["Parfums de date","Je veux être envoûtant","Soirée chic"],["sensuel"],["rdv"]],[3,"Sortie en boîte jusqu'au bout de la nuit",["Night Out","Les DJ","Je veux qu'on me remarque"],["sensuel","original"],["soiree"]],[3,"Dîner aux chandelles",["Soirée chic","Parfums de date","L'Élégant"],["sensuel","elegant"],["rdv","soiree"]],[3,"Une occasion spéciale où tout doit être parfait",["Occasion spéciale","Soirée chic","Garden Party"],["elegant","classique"],["soiree"]],[3,"Soirée à l'opéra",["Soirée à l'opéra","L'Élégant","Mayfair"],["elegant","classique"],["soiree"]],[3,"Cocktail sur un rooftop",["Soirée chic","Night Out","Les Branchés"],["elegant","sensuel"],["soiree"]],[3,"Réveillon de Noël",["Christmas Eve","Chic Winter","Occasion spéciale"],["sucre","elegant"],["soiree","hiver"]],[3,"Concert de jazz dans un bar à l'ancienne",["Jazz","L'Ivresse","Don Draper"],["sensuel","classique"],["soiree"]],[3,"Soirée match entre potes",["Gameday","Le Footeux","Les Sportifs stylés"],["frais","original"],["soiree"]],[3,"Fête qui finit à l'aube",["L'Ivresse","Les DJ","Night Out"],["sensuel","original"],["soiree"]],[4,"Anniversaire surprise, la salle est pleine",["Occasion spéciale","Taylor Swift","Night Out"],["sucre","sensuel"],["soiree"]],[4,"Festival de musique sous les étoiles",["Les DJ","Bad Bunny","Ibiza"],["frais","original"],["soiree","ete"]],[4,"Barbecue et pétanque en été",["Sous la chaleur","Le Footeux","Boat Day"],["frais","naturel"],["ete"]],[4,"Grand dîner de famille, Noël ou Pâques",["En famille","Christmas Eve","Chic Winter"],["sucre","classique"],["soiree","hiver"]],[4,"Soirée casino, jetons et smokings",["James Bond","Howard Ratner","Jay-Z"],["elegant","sensuel"],["soiree"]],[4,"Gala de charité et robes longues",["Occasion spéciale","Marilyn Monroe","Soirée à l'opéra"],["elegant","sensuel"],["soiree"]],[4,"Course de Formule 1, paddock et champagne",["F1","Monaco","Paul Allen"],["elegant","frais"],["soiree"]],[4,"Défilé de mode, premier rang",["Naomi","Samantha Jones","Fur Coat Energy"],["original","sensuel"],["soiree"]],[4,"Vernissage d'une galerie en vogue",["Les Artsy","Pharrell Williams","Funky Chic"],["original","elegant"],["soiree"]],[4,"Mariage au bord d'un lac italien",["Lake Como","Rome","Garden Party"],["elegant","naturel"],["soiree","ete"]],[5,"Plage et bateau tout l'été",["Beach Club","Boat Day","Sous la chaleur"],["frais"],["ete"]],[5,"Week-end au ski",["Ski Weekend","Courchevel","Automne Cozy"],["sucre","naturel"],["hiver"]],[5,"Escapade à Paris",["Paris","Effortless Chic","Les Branchés"],["elegant","original"],["quotidien"]],[5,"New York, la ville qui ne dort jamais",["New York","Hiver à New York","Les DJ"],["original","sensuel"],["soiree","hiver"]],[5,"Côte d'Azur, terrasses et yachts",["Côte d'Azur","Saint-Tropez","Monaco"],["frais","elegant"],["ete"]],[5,"Dubaï, tout est grand et doré",["Dubai","Le Qatari","L'Or"],["sensuel","original"],["soiree"]],[5,"Ruelles et marchés de Marrakech",["Marrakech","Égypte","Thaïlande"],["sensuel","naturel"],["ete"]],[5,"Tokyo, néons et calme zen",["Tokyo","Chine ancienne","Les Fans de design"],["frais","original"],["quotidien"]],[5,"Safari ou randonnée en pleine nature",["Safari","L'Aventurier","Montagne arc-en-ciel"],["naturel"],["quotidien"]],[5,"Ibiza, Mykonos ou Rio, la fête au soleil",["Ibiza","Mykonos","Rio"],["frais","sucre"],["ete","soiree"]],[6,"Les premières feuilles mortes de l'automne",["Automne Cozy","La vie de Ronnie","Bookworm"],["naturel","sucre"],["hiver"]],[6,"Une pluie d'été sur le bitume chaud",["Sous la chaleur","Seul face à l'océan","Rio"],["frais","naturel"],["ete"]],[6,"Le premier jour de printemps, les fenêtres ouvertes",["Garden Party","Clean Girl","Amélie Poulain"],["frais","naturel"],["quotidien"]],[6,"Neige fraîche et chocolat chaud",["Ski Weekend","Courchevel","Chic Winter"],["sucre","naturel"],["hiver"]],[6,"Une nuit d'été, torride et sans fin",["Night Out","Mykonos","L'Ivresse"],["sensuel","frais"],["ete","soiree"]],[6,"Tempête en bord de mer, vent dans les cheveux",["Seul face à l'océan","L'Aventurier","Aurores boréales"],["frais","naturel"],["quotidien"]],[6,"Un feu de cheminée et un bon livre",["Bookworm","Automne Cozy","Don Draper"],["naturel","classique"],["hiver"]],[6,"Grand soleil de midi dans un jardin méditerranéen",["Côte d'Azur","Saint-Tropez","Sous la chaleur"],["frais","naturel"],["ete"]],[6,"Un matin glacé, le souffle qui fume",["Hiver à New York","Chic Winter","Courchevel"],["classique","elegant"],["hiver"]],[6,"La douceur d'un soir de septembre",["Automne Cozy","Garden Party","Les valeurs sûres"],["naturel","sucre"],["quotidien"]],[8,"Tu aimes l'élégance discrète, le luxe qui ne se voit pas",["Quiet Luxury","Mayfair","L'Élégant"],["elegant","classique"],["bureau"]],[8,"Tu aimes qu'on se retourne sur toi",["Je veux qu'on me remarque","Aimant à compliments","It Girl"],["sensuel","original"],["soiree"]],[8,"Tu as un côté mystérieux",["Je veux être envoûtant","Tom Ripley","John Wick"],["sensuel","original"],["soiree"]],[8,"Tu as les manières d'un gentleman, ou d'une lady",["James Bond","Don Draper","Jay Gatsby"],["elegant","classique"],["soiree"]],[8,"Tu assumes un côté charismatique et un peu dangereux",["Tony Montana","Michael Corleone","Vito Corleone"],["sensuel","original"],["soiree"]],[8,"Tu vis streetwear et culture urbaine",["Les Branchés","Virgil Abloh","Kanye West"],["original","frais"],["quotidien"]],[8,"Tu aimes sentir le linge propre et la peau fraîche",["Je veux sentir propre","Clean Girl","Daily"],["frais","naturel"],["quotidien"]],[8,"Tu aimes que tout sente riche et opulent",["Je veux sentir opulent","Le Qatari","L'Or"],["sensuel","sucre"],["soiree","hiver"]],[8,"Tu veux un parfum que personne d'autre n'a",["Je veux sentir unique","Strange Smells","Le Collectionneur"],["original"],["quotidien","soiree"]],[8,"Tu es romantique, tout est poésie",["Amélie Poulain","Charlotte York","Garden Party"],["sucre","naturel"],["rdv"]],[9,"Tu t'inspires du glamour de Beyoncé ou de Rihanna",["Rihanna","Beyoncé","It Girl"],["sensuel","sucre"],["soiree"]],[9,"Tu aimes l'esprit rock et la liberté",["Amy Winehouse","Jane Birkin","Rick Owens"],["original","sensuel"],["soiree"]],[9,"Art et excentricité, Basquiat ou Dalí",["Basquiat","Salvador Dalí","Les Artsy"],["original"],["quotidien"]],[9,"Le charme à la française",["Alain Delon","Brigitte Bardot","Paris"],["elegant","classique"],["rdv"]],[9,"Finance, ambition et réussite",["Jordan Belfort","Patrick Bateman","Logan Roy"],["elegant","original"],["bureau"]],[9,"L'histoire et les parfums d'autrefois te fascinent",["Historical Scents","La Cathédrale","Edmond Dantès"],["classique","original"],["soiree"]],[9,"Tu aimes les bois, l'encens et le silence des églises",["La Cathédrale","Seul face à l'océan","Aurores boréales"],["naturel","original"],["hiver"]],[9,"Tu aimes les odeurs étranges et audacieuses",["Strange Smells","Layering","Les Artsy"],["original"],["soiree"]],[9,"Plaid, cheminée et thé chaud",["Automne Cozy","Chic Winter","Sunday Morning"],["sucre","naturel"],["hiver"]],[9,"Tu veux sentir bon sans te poser de questions",["Daily","Les valeurs sûres","Niche à petit prix"],["classique","frais"],["quotidien"]],[10,"Tu collectionnes les flacons rares",["Le Collectionneur","Les Globe-trotters","Je veux sentir unique"],["original"],["quotidien"]],[10,"Tu rêves d'un parfum de légende, introuvable",["L'Or","Le train de minerai","Le Collectionneur"],["original","sensuel"],["soiree"]],[10,"Tu aimes les histoires de voleurs élégants",["Arsène Lupin","Tom Ripley","Edmond Dantès"],["elegant","sensuel"],["soiree"]],[10,"Les films noirs et les anti-héros te fascinent",["Hannibal Lecter","Arthur Fleck","Travis Bickle"],["original","sensuel"],["soiree"]],[10,"Tu as grandi avec les films de gangsters",["Les Affranchis","Vincent Vega","Thomas Shelby"],["sensuel","classique"],["soiree"]],[10,"Tu rêves de réussir comme les grands patrons",["Kendall Roy","Logan Roy","The Founder"],["elegant","classique"],["bureau"]],[10,"Tu aimes la rébellion et l'énergie brute",["Tyler Durden","Bad Bunny","Drake"],["original","sensuel"],["soiree"]],[10,"Tu as le goût du luxe discret des grandes dames",["Vivian Ward","Charlotte York","Denise Baudu"],["elegant","sucre"],["rdv"]],[10,"Tu rêves de pouvoir et de pouvoir de séduction",["Andy Sachs","Samantha Jones","Fur Coat Energy"],["elegant","sensuel"],["bureau","soiree"]],[10,"Tu aimes les belles histoires d'amitié et de famille",["Intouchables","Eddie Horniman","Freddy Horniman"],["naturel","classique"],["quotidien"]],[10,"Tu es un It Boy : la bonne tenue, au bon endroit",["It Boy","Les Branchés","Effortless Chic"],["original","elegant"],["soiree"]],[10,"Tu es une It Girl : on s'inspire de ton style",["It Girl","Les Branchés","Funky Chic"],["original","sucre"],["soiree"]],[10,"Tu vis pour la mode, les défilés et les tendances",["Naomi","Funky Chic","Les Artsy"],["original","elegant"],["soiree"]],[10,"Tu aimes le style propre, minimaliste, la peau qui brille",["Clean Girl","Je veux sentir propre","Effortless Chic"],["frais","naturel"],["quotidien"]],[10,"Tu as une présence de grand manteau de fourrure : opulente, sûre de toi",["Fur Coat Energy","Je veux sentir opulent","Mayfair"],["sensuel","elegant"],["soiree"]],[10,"Tu es ambitieux : costume, chiffres, réussite",["Finance Bro","Corporate Weapons","The Founder"],["classique","elegant"],["bureau"]],[10,"Tu travailles dans la tech, sneakers et sweat à capuche",["Tech Bro","Les Sportifs stylés","Daily"],["frais","naturel"],["quotidien"]],[10,"Tu es créatif : galeries, musées, idées neuves",["Les Artsy","Les Fans de design","Bookworm"],["original"],["quotidien"]],[10,"Tu aimes la nature, les grands espaces, l'aventure",["L'Aventurier","Safari","Montagne arc-en-ciel"],["naturel"],["quotidien"]],[10,"Tu aimes le sport, le terrain, l'énergie",["Le Footeux","Gameday","Les Sportifs stylés"],["frais"],["quotidien"]],[10,"Tu as l'élégance d'un autre temps",["L'Élégant","Mayfair","Historical Scents"],["elegant","classique"],["bureau"]],[10,"Tu aimes collectionner, connaître les raretés",["Le Collectionneur","L'Or","Strange Smells"],["original"],["quotidien"]],[10,"Tu vis la nuit : musique, afters, énergie",["Les DJ","Night Out","La vie de Ronnie"],["sensuel","original"],["soiree"]],[10,"Tu aimes le luxe oriental, les parfums riches et puissants",["Le Qatari","Je veux sentir opulent","Dubai"],["sensuel"],["soiree"]],[10,"Tu aimes les livres, le calme, les cafés tranquilles",["Bookworm","Automne Cozy","Sunday Morning"],["naturel"],["quotidien"]],[10,"Tu travailles en costume, entre réunions et déjeuners d'affaires",["Corporate Weapons","Finance Bro","L'Élégant"],["elegant","classique"],["bureau"]],[10,"Tu travailles en créatif ou en télétravail, un jour ici, un jour là",["Tech Bro","Les Artsy","Daily"],["naturel","original"],["quotidien"]],[10,"Tu es étudiant ou en début de carrière, tout reste à construire",["Daily","Les Branchés"],["frais","sucre"],["quotidien"]],[10,"Tu sors beaucoup : bars, restaurants, soirées",["Night Out","L'Ivresse","Les Branchés"],["sensuel"],["soiree"]],[10,"Tu es plutôt casanier : maison, cuisine, séries, amis proches",["Sunday Morning","Automne Cozy","En famille"],["naturel","sucre"],["quotidien"]],[10,"Tu es très sportif : salle, course, plein air",["Les Sportifs stylés","L'Aventurier","Sous la chaleur"],["frais"],["quotidien"]],[10,"Tu voyages souvent, la valise est toujours prête",["Les Globe-trotters","Paris","New York"],["original"],["quotidien"]],[10,"Tu es très entouré : famille, repas, week-ends",["En famille","Sunday Morning","Garden Party"],["naturel"],["quotidien"]],[10,"Tu vis la nuit : concerts, clubs, afters",["Les DJ","Night Out","La vie de Ronnie"],["sensuel","original"],["soiree"]],[10,"Tu aimes les soirées à deux, les rendez-vous, la séduction",["Parfums de date","Soirée chic","Je veux être envoûtant"],["sensuel"],["rdv"]],[10,"Tu as souvent des occasions spéciales : cérémonies, galas, grands dîners",["Occasion spéciale","Soirée chic","Soirée à l'opéra"],["elegant"],["soiree"]],[10,"Tu aimes les sorties culturelles : musées, concerts, théâtre",["Les Artsy","Bookworm","Jazz"],["elegant","naturel"],["quotidien"]]];
  // Calcule les univers (playlists) qui correspondent aux situations choisies, et les goûts qu'on en déduit.
  // ---------- Le voyage : des questions précises, une par une, qui s'adaptent à ce que tu aimes ----------
  // Chaque réponse pousse un vecteur de goûts sur les 18 axes du moteur (axisV) en plus des notes, ambiances et univers.
  const MATS = [["La rose",{"liked":["rose"],"vibes":["elegant"]},"rose"],["L'oud",{"liked":["oud"],"vibes":["original","sensuel"]},"oud"],["La vanille",{"liked":["vanille","tonka"],"vibes":["sucre"]},"vanille"],["Le cuir",{"liked":["cuir","daim"],"vibes":["sensuel","classique"]},"cuir"],["Le santal et les bois",{"liked":["santal","cèdre"],"vibes":["naturel"]},"bois"],["L'iris",{"liked":["iris"],"vibes":["elegant","classique"]},"iris"],["Les fleurs blanches",{"liked":["jasmin","tubéreuse","fleur d'oranger"],"vibes":["sensuel","sucre"]},"jasmin"],["L'encens",{"liked":["encens","myrrhe"],"vibes":["original"]},"encens"],["L'ambre",{"liked":["ambre","benjoin","labdanum"],"vibes":["sensuel","sucre"]},"ambre"],["Les agrumes",{"liked":["bergamote","citron","mandarine"],"vibes":["frais"]},"agrumes"],["Le tabac",{"liked":["tabac","rhum"],"vibes":["classique","sensuel"]},"tabac"],["Le musc",{"liked":["musc","ambrette"],"vibes":["naturel","frais"]},"musc"]];
  const SEASONS = [["Le printemps",{"liked":["rose","iris"],"vibes":["frais","naturel"]}],["L'été",{"liked":["bergamote","néroli"],"vibes":["frais"]}],["L'automne",{"liked":["cèdre","cannelle","patchouli"],"vibes":["naturel"]}],["L'hiver",{"liked":["vanille","encens","ambre"],"vibes":["sucre"]}]];
  // Les grandes familles d'odeurs : on demande à quel point tu les aimes, puis on creuse celles que tu adores.
  const VFAM = {
    frais: { q: 'Une odeur de propre : linge frais, savon, air du matin', l: 'le frais et le propre', ax: { fraicheur: 1, vert: .4, musque: .3 }, no: [], f: [['Les herbes et la menthe fraîche', ['menthe', 'basilic']], ['L\'air marin et salé', ['marin']], ['Le thé vert', ['thé']], ['La lavande', ['lavande']], ['L\'eau et le concombre', ['concombre']]] },
    sucre: { q: 'Une odeur gourmande : dessert, boulangerie, chocolat chaud', l: 'le sucré et le gourmand', ax: { douceur: 1, cremeux: .5 }, no: ['praline', 'caramel'], f: [['Le caramel et le praliné', ['caramel', 'praliné']], ['Le miel', ['miel']], ['Le chocolat et le café', ['cacao', 'café']], ['L\'amande et la tonka', ['tonka', 'amande']], ['Le lait et la crème', ['lait']], ['Les fruits confits', ['figue', 'abricot']]] },
    boise: { q: 'Une balade en forêt : sous-bois, bois coupé, terre humide', l: 'la nature et la forêt', ax: { boise: 1, vert: .3 }, no: [], f: [['Le cèdre, comme un crayon taillé', ['cèdre']], ['La terre humide et la mousse', ['vétiver', 'mousse de chêne']], ['Le patchouli', ['patchouli']], ['Le gaïac et les bois fumés', ['gaïac']], ['Les aiguilles de pin et le sapin', ['sapin']]] },
    floral: { q: 'Un jardin fleuri au printemps', l: 'les fleurs', ax: { floral: 1 }, no: ['tubéreuse', 'ylang'], f: [['La pivoine et les fleurs fraîches', ['pivoine']], ['La violette', ['violette']], ['Le lys', ['lys']], ['Le mimosa', ['mimosa']], ['Le muguet', ['muguet']], ['La tubéreuse', ['tubéreuse']]] },
    epice: { q: 'Une cuisine chaude qui sent les épices', l: 'les épices', ax: { epice: 1 }, no: [], f: [['Le poivre', ['poivre']], ['La cannelle', ['cannelle']], ['Le safran', ['safran']], ['La cardamome', ['cardamome']], ['Le gingembre', ['gingembre']], ['Le clou de girofle', ['girofle']]] },
    fume: { q: 'Un feu de cheminée, un vieux salon aux boiseries', l: 'le fumé', ax: { fume: .8, resine: .5 }, no: ['bouleau'], f: [['Le feu de bois', ['bouleau']], ['Le café torréfié', ['café']], ['La myrrhe', ['myrrhe']], ['Le goudron et la fumée', ['cade']], ['La cire et le vieux bois', ['cire']]] },
    poudre: { q: 'Une poudre douce : maquillage, vieux foulard, salle de bain d\'autrefois', l: 'le poudré', ax: { poudre: 1, formalite: .3 }, no: ['violette', 'aldéhydes'], f: [['La violette', ['violette']], ['Les aldéhydes (comme Chanel N°5)', ['aldéhydes']], ['L\'héliotrope, l\'amande douce', ['héliotrope']], ['Le rouge à lèvres', ['rouge à lèvres']], ['Le talc', ['talc']]] },
    fruite: { q: 'Des fruits croqués : pêche, poire, fruits rouges', l: 'les fruits', ax: { fruite: 1, douceur: .2 }, no: [], f: [['La pêche et l\'abricot', ['pêche', 'abricot']], ['La poire et la pomme', ['poire', 'pomme']], ['Les fruits rouges', ['framboise', 'cassis']], ['Les fruits exotiques (coco, ananas)', ['coco', 'ananas']], ['La figue', ['figue']]] },
  };
  const SCALES = [['frais', 'sucre', 'boise', 'floral']];
  const SC_L = ['Pas du tout', 'Un peu', 'J\'aime', 'J\'adore'], SC_W = [-1, .2, 1, 1.9];
  const TAPS = {
  };
  const RANKS = {
    vie: { t: "Ton style de vie", n: "Ta vie de tous les jours, c'est plutôt quoi ? Touche tout ce qui te correspond, dans l'ordre : le premier, c'est le plus toi.", items: [115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126] },
    escapades: { t: "Tes escapades", n: "Un billet, une valise, et la ville change. Chaque endroit a son odeur, et tu en rapportes un morceau. Dans l'ordre de ton envie.", items: [50, 52, 53, 55, 56, 57], hero: 'Les Globe-trotters' },
    style: { t: "Ton style", n: "Comment tu te présentes au monde ? Touche ce qui te ressemble, dans l'ordre.", items: [100, 101, 102, 103, 70, 110, 104], hero: 'It Girl' },
    caractere: { t: "Ton caractère", n: "Et au fond, qui es-tu ? Touche ce qui te ressemble, dans l'ordre.", items: [71, 72, 73, 105, 106, 107, 108, 109, 114] },
    monde: { t: "Ton monde", n: "Les visages et les univers qui te font rêver. Touche ce qui te ressemble, dans l'ordre.", items: [112, 113, 111, 80, 82, 81], hero: 'Basquiat' },
  };
  const OPTS = {
    trace: { t: "Ton image", n: "Un parfum, c'est aussi une première impression.".replace(/\.$/, '') + ". Quelle image veux-tu donner de toi ? Touche tout ce qui te correspond, dans l'ordre : le premier, c'est le plus toi.", o: [["Quelqu'un d'élégant, qui a du goût", { ax: { formalite: .8, poudre: .3 }, vibes: ['elegant'] }], ["Quelqu'un de mystérieux, qu'on a envie de découvrir", { ax: { fume: .5, resine: .5, originalite: .4, sensualite: .3 }, vibes: ['original', 'sensuel'] }], ["Quelqu'un de lumineux et de joyeux", { ax: { fraicheur: .8, fruite: .4, douceur: .3 }, vibes: ['frais'] }], ["Quelqu'un de doux et de rassurant", { ax: { douceur: .8, cremeux: .6, musque: .4 }, vibes: ['sucre', 'naturel'] }], ["Quelqu'un de séduisant, de magnétique", { ax: { sensualite: 1, densite: .5 }, vibes: ['sensuel'] }], ["Quelqu'un d'original, qui ne ressemble à personne", { ax: { originalite: 1.2, clivage: .5 }, vibes: ['original'] }]], w: 1 },
    power: { t: "Ta présence", n: "Un parfum a une voix, qui porte plus ou moins loin. À quelle distance veux-tu qu'on te sente ? Touche ce qui te convient, dans l'ordre.", o: [["À peine, tout contre la peau", { power: 'discret', ax: { densite: -1, musque: .5 } }], ["À bout de bras", { power: 'discret', ax: { densite: -.3 } }], ["Dans toute la pièce", { power: 'present', ax: { densite: .4 } }], ["Dans tout l'ascenseur, sans hésiter", { power: 'fort', ax: { densite: 1.2, epice: .3, resine: .3 } }]], w: 1 },
    seasons: { t: "Tes saisons", n: "La terre mouillée, les toits chauds, le bois qui crépite. Chaque saison a son accord. Classe-les de ta préférée à celle que tu aimes le moins.", o: SEASONS, w: .7 },
    mats: { t: "Tes matières", n: "Imagine la table d'un parfumier, des petits flacons alignés, la rose à côté de l'oud, la vanille près du cuir. Touche-les dans l'ordre, de celle qui t'attire le plus à celle qui t'attire le moins, et arrête-toi quand tu veux.", o: MATS, w: .9, mats: 1 },
    flee: { t: "Ce que tu fuis", n: "Un bon conseil, c'est aussi savoir ce qu'on ne te proposera jamais. Touche ce que tu supportes le moins.", o: [["Le sucré écœurant", { avoid: ['praline', 'caramel'] }], ["Le fumé qui brûle", { avoid: ['bouleau'] }], ["Le poudré à l'ancienne", { avoid: ['violette', 'aldéhydes'] }], ["Le floral capiteux", { avoid: ['tubéreuse', 'ylang'] }], ["Le cuir lourd et animal", { avoid: ['civette', 'cuir'] }], ["Le très frais, façon lessive", { avoid: ['lessive'], ax: { fraicheur: -.5 } }]], w: 1, plain: 1 },
  };
  const rkW = (r) => Math.max(.3, 1 - .1 * r), AXI = (a) => E.AXN.indexOf(a);
  // Les deux familles que tu aimes le plus : on creuse chacune avec une question dédiée.
  const topFams = (R) => Object.keys(R.scales).filter((k) => R.scales[k] >= 2).sort((a, b) => R.scales[b] - R.scales[a]).slice(0, 2);
  // Tout ce que le voyage apprend, calculé depuis les réponses : vecteur d'axes, notes, ambiances, univers, peau, références.
  function voyCompute(R) {
    const aff = {}, vib = {}, occ = {}, liked = {}, avoid = {}, ax = new Array(18).fill(0); let power = '', skin = '';
    const addAx = (m, w) => Object.keys(m || {}).forEach((a) => { const i = AXI(a); if (i >= 0) ax[i] += m[a] * w; });
    const eff = (fx, w) => { if (!fx) return; addAx(fx.ax, w); (fx.vibes || []).forEach((v) => { vib[v] = (vib[v] || 0) + 3 * w; }); (fx.liked || []).forEach((n) => { liked[n] = Math.max(liked[n] || 0, w); }); (fx.avoid || []).forEach((n) => { avoid[n] = 1; }); (fx.themes || []).forEach((t) => { const k = E.norm(t); aff[k] = (aff[k] || 0) + 1.6 * w; }); if (fx.power && !power) power = fx.power; if (fx.skin) skin = fx.skin; };
    Object.keys(R.scales).forEach((k) => { const v = R.scales[k], F = VFAM[k]; if (!F) return; addAx(F.ax, SC_W[v] * 1.1); if (v === 0) F.no.forEach((n) => { avoid[n] = 1; }); if (v === 3) vib[k === 'sucre' ? 'sucre' : k === 'frais' ? 'frais' : k === 'boise' ? 'naturel' : k === 'floral' ? 'elegant' : k === 'fume' ? 'sensuel' : 'classique'] = (vib[k === 'sucre' ? 'sucre' : k === 'frais' ? 'frais' : k === 'boise' ? 'naturel' : k === 'floral' ? 'elegant' : k === 'fume' ? 'sensuel' : 'classique'] || 0) + 1.2; });
    Object.keys(R.follow).forEach((k) => (R.follow[k] || []).forEach((i, r) => { const o = ((VFAM[k] || {}).f || [])[i]; if (!o) return; const w = rkW(r); o[1].forEach((n) => { liked[n] = Math.max(liked[n] || 0, w + .3); }); addAx(VFAM[k].ax, .35 * w); }));
    Object.keys(R.taps).forEach((k) => { const o = (TAPS[k] || {}).o, i = R.taps[k]; if (o && o[i]) eff(o[i][1], 1); });
    const ids = [];
    Object.keys(R.ranks).forEach((k) => (R.ranks[k] || []).forEach((i, r) => { const s = SITS[i]; if (!s) return; ids.push(i); const w = rkW(r); s[2].forEach((t, q) => { const key = E.norm(t); aff[key] = (aff[key] || 0) + w * (q === 0 ? 1 : q === 1 ? .75 : .5); }); s[3].forEach((v) => { vib[v] = (vib[v] || 0) + w; }); s[4].forEach((o) => { occ[o] = (occ[o] || 0) + w; }); }));
    Object.keys(OPTS).forEach((k) => (R.opts[k] || []).forEach((i, r) => { const o = OPTS[k].o[i]; if (o) eff(o[1], OPTS[k].plain ? 1 : rkW(r) * OPTS[k].w); }));
    (R.refs || []).forEach((rf) => { const e = dbList().find((x) => E.norm(x.name) === E.norm(rf.name) && E.norm(x.house) === E.norm(rf.house)); if (!e) return; const pr = E.profOf({ name: e.name, house: e.house, notes: e.notes || [], family: e.family }); if (pr) pr.p.forEach((x, i) => { ax[i] += (x - 2.5) * .55; }); (e.notes || []).slice(0, 5).forEach((n) => { liked[n.toLowerCase()] = .8; }); });
    const mx = Math.max(1, ...Object.values(aff)); Object.keys(aff).forEach((k) => { aff[k] = Math.round(100 * aff[k] / mx) / 100; });
    const top = (m, n, min) => Object.entries(m).sort((x, y) => y[1] - x[1]).filter((x) => x[1] >= min).slice(0, n).map((x) => x[0]);
    Object.keys(avoid).forEach((n) => { delete liked[n]; });
    return { ids, aff, vibes: top(vib, 3, 2.2), occ: top(occ, 3, 2), liked: Object.entries(liked).sort((x, y) => y[1] - x[1]).slice(0, 14).map((x) => x[0]), avoid: Object.keys(avoid), power, skin, axisV: ax.map((x) => Math.max(-2.6, Math.min(2.6, Math.round(x * 100) / 100))) };
  }
  function sitThemes(n) {
    const aff = S.settings.sitAff || {}, PL = window.PLAYLISTS || [];
    return PL.filter((p) => aff[E.norm(p.t)]).map((p) => ({ p, v: aff[E.norm(p.t)] })).sort((x, y) => y.v - x.v).slice(0, n || 4);
  }
  const themeStars = (p) => p.ps.filter((x) => x.h).slice(0, 3).map((x) => x.n);
  // Un nouveau voyage efface l'ancien : on retire d'abord tout ce que l'ancien avait ajouté aux goûts.
  function applyVoy(R) {
    const pr = voyCompute(R), st = S.settings, old = st.sitD || {}, minus = (a, b) => (a || []).filter((x) => !(b || []).includes(x)), u = (a, b) => [...new Set([...(a || []), ...b])];
    st.vibes = minus(st.vibes, old.vibes); st.occ = minus(st.occ, old.occ); st.liked = minus(st.liked, old.liked); st.avoid = minus(st.avoid, old.avoid); if (old.power && st.power === old.power) st.power = '';
    st.sit = pr.ids; st.sitAff = pr.aff; st.axisV = pr.axisV; st.skin = pr.skin; st.refs = R.refs || []; st.voy = R; st.sitD = { vibes: pr.vibes, occ: pr.occ, liked: pr.liked, avoid: pr.avoid, power: pr.power };
    st.vibes = u(st.vibes, pr.vibes); st.occ = u(st.occ, pr.occ); st.liked = u(st.liked, pr.liked); st.avoid = u(st.avoid, pr.avoid);
    if (pr.power && !st.power) st.power = pr.power;
    save(); NPOOL = null; Object.keys(BCACHE).forEach((k) => delete BCACHE[k]);
    return pr;
  }
  const plImg = (t) => { const p = (window.PLAYLISTS || []).find((x) => x.t === t); return p && p.img ? p.img : ''; };
  const VQ_NEXT = ['Continuer', 'Suivant', 'La suite', 'On avance'];
  // Le plan : on commence par ce que tu aimes (précis, en échelle), on creuse tes familles préférées, puis ton style, ta présence, tes moments et tes envies.
  const PLAN = ['intro', 'scales:0', 'follow:0', 'follow:1', 'opts:trace', 'opts:power', 'rank:vie', 'opts:seasons', 'rank:escapades', 'opts:mats', 'rank:style', 'rank:caractere', 'rank:monde', 'opts:flee', 'refs', 'end'];
  function mountVoyage(root, done, opts) {
    opts = opts || {};
    const R = { scales: {}, follow: {}, taps: {}, ranks: {}, opts: { trace: [], power: [], seasons: [], mats: [], flee: [] }, refs: [] }; let c = 0, dir = 1, busy = false;
    const NC = PLAN.length;
    const go = (d) => { dir = d; c = Math.max(0, Math.min(NC - 1, c + d)); draw(); };
    const shell = (inner, o) => `<div class="voy"><div class="vbar" aria-hidden="true"><i style="width:${Math.round(100 * c / (NC - 1))}%"></i></div>${inner}${(o && o.nonext) ? '' : `<button class="cta full" id="vNext"><span>${(o && o.next) || VQ_NEXT[c % VQ_NEXT.length]}</span></button>`}${c > 1 ? '<button class="ghost" id="vBack">Retour</button>' : ''}${opts.skip && c < NC - 1 ? '<button class="ghost" id="vSkip">Passer le voyage</button>' : ''}</div>`;
    const rk = (list, v) => { const r = list.indexOf(v); return r < 0 ? '' : r + 1; };
    const draw = () => {
      const sc = root.closest('.panel, #prof'); if (sc) sc.scrollTop = 0; window.scrollTo(0, 0); busy = false;
      const step = PLAN[c];
      if (step === 'end') { drawEnd(); return; }
      let html = '', after = null;
      if (step === 'intro') {
        html = `<div class="voy"><div class="vbar" aria-hidden="true"><i style="width:0"></i></div><p class="mono">Ton voyage</p><header class="vhero"><div><h2>Faisons connaissance</h2><p class="vscene">Je suis ton parfumier. Je vais te poser des questions simples, une par une, sur ce que tu aimes et ce que tu fuis, sur ta vie et tes envies. Il n'y a pas de bonne réponse. À la fin, je te montre ce que j'ai compris de toi et je choisis tes premiers parfums.</p></div></header><p class="soft">Environ deux minutes. Tu peux revenir en arrière à tout moment.</p><button class="cta full" id="vNext"><span>Commencer</span></button>${opts.skip ? '<button class="ghost" id="vSkip">Passer le voyage</button>' : ''}</div>`;
      } else if (step.startsWith('scales:')) {
        const g = SCALES[+step.slice(7)];
        html = shell(`<header class="vhero"><div><h2>${step === 'scales:0' ? 'Ce qui te parle' : ''}</h2><p class="vscene">${step === 'scales:0' ? 'Je commence par des odeurs de tous les jours, pas besoin de connaître le vocabulaire des parfumeurs. Pour chacune, dis-moi si tu aimes.' : 'Quatre autres odeurs, même principe.'}</p></div></header><div class="vscales">${g.map((k) => `<div class="vsc" data-fam="${k}"><p>${esc(VFAM[k].q)}</p><div class="vscb">${SC_L.map((l, v) => `<button type="button" class="vsb ${R.scales[k] === v ? 'on' : ''}" data-sv="${v}">${esc(l)}</button>`).join('')}</div></div>`).join('')}</div>`, { next: 'Continuer' });
        after = () => $$('.vsc', root).forEach((row) => $$('[data-sv]', row).forEach((b) => (b.onclick = () => { R.scales[row.dataset.fam] = +b.dataset.sv; $$('[data-sv]', row).forEach((x) => x.classList.toggle('on', x === b)); })));
      } else if (step.startsWith('follow:')) {
        const fam = topFams(R)[+step.slice(7)];
        if (!fam) { go(dir); return; }
        const F = VFAM[fam], cur = R.follow[fam] || [];
        html = shell(`<header class="vhero"><div><h2>${esc(cap1(F.l))}</h2><p class="vscene">Tu ${R.scales[fam] === 3 ? 'adores' : 'aimes'} ${esc(F.l)}. Dans cette famille, qu'est-ce qui te fait le plus envie ? Touche dans l'ordre, jusqu'à trois.</p></div></header><div class="vopts">${F.f.map(([l], i) => `<button type="button" class="vopt ${cur.includes(i) ? 'on' : ''}" data-fo="${i}"><span>${esc(l)}</span><i aria-hidden="true">${rk(cur, i)}</i></button>`).join('')}</div>`);
        after = () => $$('[data-fo]', root).forEach((b) => (b.onclick = () => { const i = +b.dataset.fo; let l = R.follow[fam] || []; if (l.includes(i)) l = l.filter((x) => x !== i); else if (l.length < 3) l = l.concat(i); else return; R.follow[fam] = l; $$('[data-fo]', root).forEach((x) => { const n = rk(l, +x.dataset.fo); x.classList.toggle('on', !!n); x.querySelector('i').textContent = n; }); }));
      } else if (step.startsWith('tap:')) {
        const k = step.slice(4), t = TAPS[k], cur = R.taps[k];
        html = shell(`<header class="vhero"><div><p class="vscene">${esc(t.n)}</p></div></header><div class="vq"><h3>${esc(t.h)}</h3><div class="vopts">${t.o.map(([l], i) => `<button type="button" class="vopt ${cur === i ? 'on' : ''}" data-to="${i}"><span>${esc(l)}</span></button>`).join('')}</div></div>`, { nonext: true });
        after = () => $$('[data-to]', root).forEach((b) => (b.onclick = () => { if (busy) return; busy = true; R.taps[k] = +b.dataset.to; $$('[data-to]', root).forEach((x) => x.classList.toggle('on', x === b)); setTimeout(() => go(1), 320); }));
      } else if (step.startsWith('rank:')) {
        const k = step.slice(5), r = RANKS[k], list = R.ranks[k] || [], hero = r.hero ? plImg(r.hero) : '';
        html = shell(`<header class="vhero ${hero ? 'img' : ''}">${hero ? `<i class="vhero-bg" style="background-image:url('${esc(hero)}')"></i>` : ''}<div><h2>${esc(r.t)}</h2><p class="vscene">${esc(r.n)}</p></div></header>${(r.groups || [['', r.items]]).map(([gt, its]) => `${gt ? `<p class="vgrp">${esc(gt)}</p>` : ''}<div class="sits">${its.map((i, q) => `<button type="button" class="sit ${list.includes(i) ? 'on' : ''}" data-si="${i}" aria-pressed="${list.includes(i)}"><span>${esc(SITS[i][1])}</span><i aria-hidden="true">${rk(list, i)}</i></button>`).join('')}</div>`).join('')}`);
        after = () => $$('[data-si]', root).forEach((b) => (b.onclick = () => { const i = +b.dataset.si; let l = R.ranks[k] || []; l = l.includes(i) ? l.filter((x) => x !== i) : l.concat(i); R.ranks[k] = l; $$('[data-si]', root).forEach((x) => { const n = rk(l, +x.dataset.si); x.classList.toggle('on', !!n); x.setAttribute('aria-pressed', !!n); x.querySelector('i').textContent = n; }); }));
      } else if (step.startsWith('opts:')) {
        const key = step.slice(5), O = OPTS[key], cur = R.opts[key];
        const inner = O.mats ? `<div class="mats">${O.o.map(([l, , slug], i) => `<button type="button" class="mat ${cur.includes(i) ? 'on' : ''}" data-mo="${i}" aria-pressed="${cur.includes(i)}"><span class="mat-img"><img src="img/matieres/${esc(slug)}.webp" alt="" loading="lazy"><b aria-hidden="true">${esc(l.replace(/^(La |Le |L'|Les )/, '').charAt(0).toUpperCase())}</b></span><em class="rk">${rk(cur, i)}</em><span class="mat-l">${esc(l)}</span></button>`).join('')}</div>` : `<div class="vopts">${O.o.map(([l], i) => `<button type="button" class="vopt ${cur.includes(i) ? 'on' : ''}" data-mo="${i}" aria-pressed="${cur.includes(i)}"><span>${esc(l)}</span><i aria-hidden="true">${O.plain ? '' : rk(cur, i)}</i></button>`).join('')}</div>`;
        html = shell(`<header class="vhero"><div><h2>${esc(O.t)}</h2><p class="vscene">${esc(O.n)}</p></div></header>${inner}`);
        after = () => { $$('.mat-img img', root).forEach((im) => { im.addEventListener('error', () => im.remove()); im.addEventListener('load', () => im.parentNode && im.parentNode.classList.add('has')); }); $$('[data-mo]', root).forEach((b) => (b.onclick = () => { const i = +b.dataset.mo; let l = R.opts[key]; l = l.includes(i) ? l.filter((x) => x !== i) : l.concat(i); R.opts[key] = l; $$('[data-mo]', root).forEach((x) => { const n = rk(l, +x.dataset.mo); x.classList.toggle('on', !!n); x.setAttribute('aria-pressed', !!n); const t = x.querySelector('i,.rk'); if (t) t.textContent = O.plain ? '' : n; }); })); };
      } else if (step === 'refs') {
        html = shell(`<header class="vhero"><div><h2>Ton parfum fétiche</h2><p class="vscene">Dernière question. Il y a peut-être un parfum que tu portes ou que tu envies depuis toujours. Cherche-le, c'est mon meilleur point de départ. Jusqu'à trois, ou aucun.</p></div></header><div class="vref"><input id="vrIn" type="search" placeholder="Un parfum que tu adores…" autocomplete="off" aria-label="Chercher un parfum"><div id="vrRes" class="vrres"></div><div id="vrSel" class="vrsel"></div></div>`, { next: 'Voir ce que j\'ai compris' });
        after = () => {
          const drawSel = () => { $('#vrSel', root).innerHTML = R.refs.map((x, i) => `<button type="button" class="chip on" data-rx="${i}">${esc(x.name)} · ${esc(x.house)} ✕</button>`).join(''); $$('[data-rx]', root).forEach((b) => (b.onclick = () => { R.refs.splice(+b.dataset.rx, 1); drawSel(); })); };
          drawSel();
          $('#vrIn', root).oninput = (ev) => { const t = E.norm(ev.target.value); const box = $('#vrRes', root); if (t.length < 2) { box.innerHTML = ''; return; } const hits = dbList().filter((e) => !e.ed && (E.norm(e.name).includes(t) || E.norm(e.house + ' ' + e.name).includes(t))).slice(0, 6); box.innerHTML = hits.map((e, i) => `<button type="button" class="vrh" data-rh="${i}"><b>${esc(e.name)}</b><small>${esc(e.house)}</small></button>`).join(''); $$('[data-rh]', box).forEach((b) => (b.onclick = () => { const e = hits[+b.dataset.rh]; if (R.refs.length < 3 && !R.refs.some((x) => E.norm(x.name) === E.norm(e.name))) R.refs.push({ name: e.name, house: e.house }); ev.target.value = ''; box.innerHTML = ''; drawSel(); })); };
        };
      }
      root.innerHTML = html;
      if (after) after();
      const nx = $('#vNext', root); if (nx) nx.onclick = () => go(1);
      if ($('#vBack', root)) $('#vBack', root).onclick = () => go(-1);
      if ($('#vSkip', root)) $('#vSkip', root).onclick = () => done(true);
    };
    const drawEnd = () => {
      const pr = applyVoy(R); try { const PD = window.SillageDemo; if (PD && PD.plan.track) PD.plan.track('voyage'); } catch (e) { /* mesure facultative */ } const th = sitThemes(4), ax = pr.axisV.map((v, i) => [E.AXN[i], v]).filter(([a]) => !['originalite', 'clivage', 'formalite', 'evolution', 'densite'].includes(a));
      const pos = ax.filter(([, v]) => v > .5).sort((x, y) => y[1] - x[1]).slice(0, 4).map(([a]) => E.AXL[a]), neg = ax.filter(([, v]) => v < -.5).sort((x, y) => x[1] - y[1]).slice(0, 3).map(([a]) => E.AXL[a]);
      const dn = pr.axisV[AXI('densite')], tone = dn > .7 ? 'des parfums qui se remarquent' : dn < -.5 ? 'des parfums discrets, près de la peau' : 'une présence mesurée';
      let recs = []; try { recs = tipsData().recs.slice(0, 3); } catch (e) { recs = []; }
      const lk = {}; dbList().forEach((e) => { lk[entryKey(e)] = e; });
      root.innerHTML = `<div class="voy"><div class="vbar" aria-hidden="true"><i style="width:100%"></i></div><p class="mono">Ton portrait olfactif</p><h2>Voilà ce que j'ai compris de toi</h2>
        <p class="soft">${pos.length ? 'Tu vas vers ' + list3(pos) + (neg.length ? ', et tu t\'éloignes du ' + list3(neg) : '') + '. ' : ''}Tu aimes ${tone}${pr.skin === 'seche' ? ', et comme ta peau boit le parfum, je viserai des jus tenaces' : ''}.${(pr.liked || []).length ? ' Tes notes de cœur : ' + list3(pr.liked.slice(0, 5)) + '.' : ''}${pr.avoid.length ? ' Je laisse de côté ' + list3(pr.avoid.slice(0, 4)) + '.' : ''}</p>
        ${th.length ? `<div class="univ">${th.map(({ p }, i) => `<article class="uni rise" style="--d:${i * 120}">${p.img ? `<i class="uni-bg" style="background-image:url('${esc(p.img)}')"></i>` : ''}<div><p class="mono">Univers ${i + 1}</p><h3>${esc(p.t)}</h3><p class="uni-s">${esc(themeStars(p).join(' · '))}</p></div></article>`).join('')}</div>` : ''}
        ${recs.length ? `<p class="mono" style="text-transform:none;letter-spacing:0;margin-top:20px">Mes trois premiers choix pour toi</p><div class="rail brail2">${recs.map((r) => pCard(r.c.entry || lk[E.norm(r.c.house + ' ' + r.c.name)] || { name: r.c.name, house: r.c.house, notes: r.c.notes || [], price: r.c.price }, r.pct + ' %')).join('')}</div>` : ''}
        <button class="cta full" id="vGo"><span>${opts.cta || 'Continuer'}</span></button><button class="ghost" id="vAgain">Refaire le voyage</button></div>`;
      $$('[data-ent]', root).forEach((b) => (b.onclick = () => { const e = lk[b.dataset.ent]; if (e) openEntry(e); }));
      $('#vGo', root).onclick = () => done(); $('#vAgain', root).onclick = () => { R.scales = {}; R.follow = {}; R.taps = {}; R.ranks = {}; R.opts = { trace: [], power: [], seasons: [], mats: [], flee: [] }; R.refs = []; c = 0; draw(); };
    };
    draw();
  }
  function openVoyage() { const pn = openSheet('<div id="voyroot"></div>'); mountVoyage($('#voyroot', pn), () => { closeSheet(); render(true); }); }
  // Luxe ou prix malins : la première chose à savoir pour ne jamais proposer un parfum qui ne ressemble pas à la personne.
  const TIERS = [['luxe', 'Haut de gamme et luxe', 'Niche, grandes maisons, des flacons qui se remarquent. La qualité passe avant le prix.'], ['malin', 'Prix malins', 'Les meilleurs rapports qualité prix, des parfums accessibles et sans regret.'], ['mix', 'Un peu des deux', 'Du luxe quand il le mérite, du malin le reste du temps.']];
  const tierPick = () => `<div class="tiers" role="radiogroup" aria-label="Luxe ou prix malins">${TIERS.map(([k, l, d]) => `<button type="button" class="tier ${S.settings.tier === k ? 'on' : ''}" role="radio" aria-checked="${S.settings.tier === k}" data-tier="${k}"><b>${l}</b><span>${d}</span></button>`).join('')}</div>`;
  function bindTier(root, cb) { $$('[data-tier]', root).forEach((b) => (b.onclick = () => { S.settings.tier = b.dataset.tier; save(); NPOOL = null; Object.keys(BCACHE).forEach((k) => delete BCACHE[k]); $$('[data-tier]', root).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); }); if (cb) cb(); })); }
  function showProfile() {
    const d = Object.assign({ gender: '', age: null, name: '' }, hasProfile() ? S.profile : {}), N = 9;
    const el = document.createElement('div'); el.id = 'prof'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Faisons connaissance');
    let step = 1;
    const read = () => { if ($('#pName', el)) d.name = $('#pName', el).value.trim().slice(0, 24); if ($('#pAge', el)) d.age = cleanAge($('#pAge', el).value); };
    const draw = () => {
      const head = `<p class="mono">Faisons connaissance · ${step} / ${N}</p>`, back = step > 1 ? '<button class="ghost" id="pBack">Retour</button>' : '';
      if (step === 9) {
        el.innerHTML = '<div class="prof-in wide"><div id="pExp"></div></div>';
        mountExplorer($('#pExp', el), { mode: 'collection', title: d.name ? 'Tes parfums, ' + d.name : 'Tes parfums', sub: 'Choisis ceux que tu as déjà : par maison, style, notes… Tu pourras en ajouter d\'autres à tout moment.', cta: (n) => 'Ajouter ' + n + ' et commencer', skip: 'Je n\'en ai pas encore', onSkip: () => end(false), onSubmit: (list) => { addEntriesToCollection(list); end(false); } });
        return;
      }
      const st2 = step > 5 ? step - 2 : step;
      if (step === 5) { el.innerHTML = '<div class="prof-in wide" id="pVoy"></div>'; mountVoyage($('#pVoy', el), () => { step++; draw(); }, { skip: true, cta: 'Continuer' }); return; }
      if (step === 4) {
        el.innerHTML = `<div class="prof-in">${head}<h2>Plutôt luxe ou prix malins&nbsp;?</h2><p class="soft">C'est ce qui compte le plus pour te conseiller juste : je ne te proposerai jamais un parfum qui ne te ressemble pas.</p>${tierPick()}<button class="cta full" id="pNext" ${S.settings.tier ? '' : 'disabled'}><span>Continuer</span></button>${back}</div>`;
        bindTier(el, () => { $('#pNext', el).disabled = false; });
        $('#pNext', el).onclick = () => { read(); step++; draw(); }; if ($('#pBack', el)) $('#pBack', el).onclick = () => { read(); step--; draw(); };
        return;
      }
      el.innerHTML = step === 1
        ? `<div class="prof-in">${head}<h2>Enchanté. Comment tu t'appelles&nbsp;?</h2><p class="soft">Juste ton prénom : je m'en sers pour te dire bonjour. Ça reste sur ton appareil.</p>
          <input type="text" id="pName" maxlength="24" value="${esc(d.name || '')}" placeholder="Ton prénom" aria-label="Ton prénom" autocomplete="given-name" class="agein">
          <button class="cta full" id="pNext"><span>Continuer</span></button><button class="ghost" id="pSkip">Plus tard</button></div>`
        : st2 === 2
          ? `<div class="prof-in">${head}<h2>Tu es…</h2><p class="soft">Pour choisir un parfum qui te va, pas pour t'enfermer dans une case.</p>
            <div class="gen">${GEN.map(([k, l]) => `<button class="chip ${d.gender === k ? 'on' : ''}" data-g="${k}">${l}</button>`).join('')}</div>
            <button class="cta full" id="pNext"><span>Continuer</span></button>${back}</div>`
          : st2 === 3
            ? `<div class="prof-in">${head}<h2>Quel âge as-tu&nbsp;?</h2><p class="soft">Les goûts et les occasions changent avec l'âge.</p>
              <input type="text" id="pAge" inputmode="numeric" maxlength="2" value="${d.age || ''}" placeholder="Ton âge" aria-label="Ton âge" class="agein">
              <button class="cta full" id="pNext"><span>Continuer</span></button>${back}</div>`
            : st2 === 4
              ? `<div class="prof-in wide">${head}<h2>Quelles notes aimes-tu&nbsp;?</h2><p class="soft">Une touche pour adorer, deux pour fuir. Ne cherche pas à tout remplir : trois ou quatre notes suffisent pour commencer.</p><div id="pTaste" class="tprof"></div>
                <button class="cta full" id="pNext"><span>Continuer</span></button>${back}</div>`
              : st2 === 5
                ? `<div class="prof-in wide">${head}<h2>Quel genre de parfum te ressemble&nbsp;?</h2><p class="soft">Ton ambiance et la présence que tu veux. Tu peux changer d'avis à tout moment.</p><div id="pTaste" class="tprof"></div>
                  <button class="cta full" id="pNext"><span>Continuer</span></button>${back}</div>`
                : `<div class="prof-in wide">${head}<h2>Quand le portes-tu, et pour combien&nbsp;?</h2><p class="soft">Voilà ton profil, tel que je le comprends. Je m'en sers pour tous mes conseils.</p><div id="pTaste" class="tprof"></div>
                  <button class="cta full" id="pNext"><span>Choisir mes parfums</span></button>${back}</div>`;
      if ($('#pTaste', el)) mountTaste($('#pTaste', el), st2 === 4 ? ['notes'] : st2 === 5 ? ['vibes'] : ['occ']);
      $$('[data-g]', el).forEach((b) => (b.onclick = () => { d.gender = b.dataset.g; $$('[data-g]', el).forEach((x) => x.classList.toggle('on', x === b)); }));
      if ($('#pNext', el)) $('#pNext', el).onclick = () => { read(); step++; draw(); };
      if ($('#pBack', el)) $('#pBack', el).onclick = () => { read(); step--; draw(); };
      if ($('#pSkip', el)) $('#pSkip', el).onclick = () => end(true);
      if ($('#pName', el)) $('#pName', el).addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#pNext', el).click(); });
    };
    const end = (skip) => {
      read();
      if (skip) { S.profile = { skipped: true, ts: Date.now() }; save(); }
      else setProfile(d);
      el.remove(); document.body.style.overflow = ''; tab = 'today'; render();
    };
    document.body.appendChild(el); document.body.style.overflow = 'hidden'; draw();
  }

  // ---------- Stock : taille, ce qu'il reste, usage (échantillon = pas au quotidien) ----------
  const SIZES = [[2, '2 ml · échantillon'], [5, '5 ml'], [10, '10 ml'], [30, '30 ml'], [50, '50 ml'], [75, '75 ml'], [100, '100 ml']];
  const LEFTS = [[100, 'Plein'], [75, 'Beaucoup'], [50, 'La moitié'], [25, 'Il en reste peu'], [10, 'Presque fini']];
  const USES = [['daily', 'Au quotidien'], ['special', 'Grandes occasions'], ['free', 'Peu importe']];
  const stockHtml = (it, i) => { const k = E.stockOf(it);
    return `<div class="stk-ed" data-i="${i}"><p class="mono">Taille du flacon</p><div class="chips">${SIZES.map(([v, l]) => `<button class="chip ${k.size === v ? 'on' : ''}" data-sz="${v}">${l}</button>`).join('')}</div>
      <p class="mono">Ce qu'il en reste</p><div class="chips">${LEFTS.map(([v, l]) => `<button class="chip ${k.left === v ? 'on' : ''}" data-lf="${v}">${l}</button>`).join('')}</div>
      <p class="mono">Je le porte</p><div class="chips">${USES.map(([v, l]) => `<button class="chip ${k.use === v ? 'on' : ''}" data-us="${v}">${l}</button>`).join('')}</div></div>`; };
  function bindStock(root, get, onChange) {
    $$('.stk-ed', root).forEach((ed) => {
      const it = () => get(+ed.dataset.i), mark = (attr, v) => $$('[' + attr + ']', ed).forEach((x) => x.classList.toggle('on', +x.getAttribute(attr) === +v || x.getAttribute(attr) === String(v)));
      $$('[data-sz]', ed).forEach((b) => (b.onclick = () => { const o = it(); if (!o) return; o.size = +b.dataset.sz; mark('data-sz', o.size); if (o.size <= 10 && !o.useSet && o.use !== 'special') { o.use = 'special'; mark('data-us', 'special'); } onChange(o); }));
      $$('[data-lf]', ed).forEach((b) => (b.onclick = () => { const o = it(); if (!o) return; o.left = +b.dataset.lf; mark('data-lf', o.left); onChange(o); }));
      $$('[data-us]', ed).forEach((b) => (b.onclick = () => { const o = it(); if (!o) return; o.use = b.dataset.us; o.useSet = true; mark('data-us', o.use); onChange(o); }));
    });
  }
  const stockBadge = (p) => { const k = E.stockOf(p); return k.use === 'special' ? '<i class="stk-b">Occasions</i>' : k.ml <= 10 ? '<i class="stk-b low">Peu</i>' : ''; };

  // ---------- Onboarding : 10 secondes pour donner envie ----------
  function showOnboarding() {
    try { if (localStorage.getItem('sillage.onb')) { maybeProfile(); return; } } catch (e) { /* on affiche quand même */ }
    if (S.log.length) { maybeProfile(); return; }
    const pick = (n) => { const c = CAT.find((x) => x.name === n); return c ? fromCat(c) : null; };
    const A = pick('Baccarat Rouge 540'), B = pick('Fève Nectar'), C = pick('Naxos'), D = pick('Tobacco Vanille');
    if (!A || !B || !C || !D) return;
    const TXT = 'Sortie entre amis en ville, 18°, chemise noire';
    const el = document.createElement('div'); el.id = 'onb'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Bienvenue');
    el.innerHTML = `<i class="sb sb1"></i><i class="sb sb2"></i><canvas class="fx" id="onbfx" aria-hidden="true"></canvas>
      <button class="onb-skip" id="onbSkip">Passer</button>
      <section class="onb-s on" id="os1"><div class="onb-row">${bt(D, { h: 150, still: false })}${bt(A, { h: 200, spray: true })}${bt(C, { h: 150, still: false })}</div><h2 class="rise" style="--d:300">Sillage</h2><p class="lead rise" style="--d:700">Le bon parfum pour ta journée, choisi dans ta propre collection.</p></section>
      <section class="onb-s" id="os2"><p class="mono rise">1 · dis ta journée</p><div class="onb-type"><span id="onbT"></span><i class="caret"></i></div><div class="chips onb-chips"><span class="chip on pop" style="--d:1700">Sorties</span><span class="chip pop" style="--d:1900">Joyeux</span><span class="chip pop" style="--d:2100">Ville</span></div></section>
      <section class="onb-s" id="os3"><p class="mono rise">exemple · ton parfum du jour</p><div class="onb-hero">${bt(A, { h: 230, spray: true })}</div><h2 class="rise" style="--d:300">${esc(A.name)}</h2><p class="soft rise" style="--d:600">${esc(A.house)}</p>
        <div class="onb-lay rise" style="--d:1300">${bt(B, { still: true, h: 54 })}<span><b>+ ${esc(B.name)}</b><small>l'accord qui allonge la tenue</small></span></div></section>
      <section class="onb-s" id="os4"><p class="lead rise">Sans te ruiner, sans y réfléchir : 10 secondes.</p><button class="st-btn rise" style="--d:300" id="onbGo">Trouver mon parfum</button></section>`;
    document.body.appendChild(el); document.body.style.overflow = 'hidden';
    const fx = $('#onbfx'); FX.attach(fx, [A, B], { dark: true, density: .9 });
    let done = false; const timers = [];
    const show = (id) => $$('.onb-s', el).forEach((x) => x.classList.toggle('on', x.id === id));
    const finish = (go) => {
      if (done) return; done = true; timers.forEach(clearTimeout);
      try { localStorage.setItem('sillage.onb', '1'); } catch (e) { /* ok */ }
      FX.clear(fx); el.remove(); document.body.style.overflow = ''; setTimeout(maybeProfile, 250);
      if (go) { CHOICE.cat = 'sorties'; CHOICE.sc = 'apero'; SAY = scenByKey('apero')[1]; tab = 'today'; render(); const g = $('#go'); if (g) g.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    };
    $('#onbSkip').onclick = () => finish(false); $('#onbGo').onclick = () => finish(true);
    if (REDUCED) { show('os4'); return; }
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    at(2900, () => { show('os2'); let i = 0; const t = $('#onbT'); const step = () => { if (done) return; t.textContent = TXT.slice(0, ++i); if (i < TXT.length) timers.push(setTimeout(step, 45)); }; step(); });
    at(5600, () => show('os3'));
    at(8600, () => show('os4'));
  }

  const sellCard = () => (window.SillageDemo && !PRESENT ? `<section class="sec"><div class="card sell"><p class="mono">Sillage sur mesure</p><h2>Cette appli, avec ta vraie collection.</h2><p>Tes flacons, tes habitudes, ton style. Je construis la tienne, avec l'IA, la semaine et le voyage.</p><button class="cta full" data-sell><span>Je veux la mienne</span></button></div></section>` : '');
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('[data-sell]') && window.SillageDemo) window.SillageDemo.upsell('cta'); });
  window.SillageHooks = { openSheet, closeSheet, rerender: () => { if (tab === 'today' && $('#story').hidden && $('#sheet').hidden && !$('#onb')) viewToday(); }, refresh: () => { try { render(true); } catch (e) { /* ok */ } } };
  // Ce que la couche produit (offres, profil, communauté, éditeur : product.js) a le droit de toucher dans l'appli.
  window.SillageInternals = {
    S: () => S, save, dbList: () => dbList(), entryKey, openEntry, openSheet, closeSheet, esc, $, $$, E, xThumb, pCard, famLabel, showAccount: (f, o) => showAccount(f, o), render: (k) => render(k), PLS: () => PLS, PL, tab: () => tab, goTab: (t) => { tab = t; render(); },
    bust: () => { DBL = null; NPOOL = null; BIOM = null; ENTP = null; HMED = null; Object.keys(BCACHE).forEach((k) => delete BCACHE[k]); },
  };

  // ---------- Démarrage ----------
  $('#dock').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { if (b.dataset.tab === 'play' && tab === 'play') { PL.id = 0; PL.sub = ''; } tab = b.dataset.tab; render(); } });
  $('#profileBtn').onclick = openProfile;
  mountParfumier();
  render();
  initStore();
  initAI();
  if (S.settings.weatherOn) autoWeather(false);
  mergeCommunity();
  setTimeout(showOnboarding, $('#splash') ? 2700 : 200);
  const sp = $('#splash');
  if (sp) { const kill = () => sp.remove(); sp.addEventListener('click', kill); setTimeout(kill, REDUCED ? 500 : 3000); }
})();
