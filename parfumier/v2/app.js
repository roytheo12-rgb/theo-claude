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
  const imgNew = (p) => { const N = window.IMGNEW || {}, HA = window.HOUSE_ALIAS || {}, h = E.norm(p.house || ''), f = N[h + '|' + E.norm(p.name)] || (HA[h] && N[E.norm(HA[h]) + '|' + E.norm(p.name)]); return f ? { s: f, nz: 6 } : null; };
  const imgOf = (p) => { const nw = imgNew(p); if (nw) return nw; if (IMG[p.name]) { const ch = CAT.find((c) => c.name === p.name), HA = window.HOUSE_ALIAS || {}, cn = (h) => E.norm(HA[E.norm(h)] || h); if (ch && (!p.house || cn(p.house) === cn(ch.house))) return IMG[p.name]; }      // une photo à la main n'est valable que pour la maison de la fiche, pas pour un parfum de même nom ailleurs
    const D = window.IMGDB || {}, W = window.IMGWEB || {}, HA2 = window.HOUSE_ALIAS || {}, h0 = E.norm(p.house || ''), k = h0 + '|' + E.norm(p.name), k2 = E.norm(HA2[h0] || p.house || '') + '|' + E.norm(p.name), f = D[k] || W[k] || D[k2] || W[k2]; return f ? { s: f, nz: 6 } : null; };
  const fromCat = (c, rating) => ({ id: uid(), name: c.name, house: c.house, family: c.family, notes: [...c.notes], projection: c.projection, longevity: c.longevity, weight: c.weight, price: c.price, rating: rating || 4, occ: [], src: (IMG[c.name] || {}).s, nz: (IMG[c.name] || {}).nz, incomplete: !c.notes.length || undefined });
  const seedOwned = () => window.OWNED.map(([n, r, occ, stk]) => Object.assign(fromCat(CAT.find((c) => c.name === n), r), { occ: [...occ] }, stk || {}));
  const wishFromName = (n) => { const c = CAT.find((x) => x.name === n); return c ? { name: c.name, house: c.house, family: c.family, notes: [...c.notes], price: c.price } : { name: n, house: '', family: '', notes: [], price: 0 }; };
  const seedWish = () => window.WISH.map(wishFromName);
  const DEMO = /[?&]seed=demo/.test(location.search); // outillage (vidéos, tests) : charge une collection d'exemple
  const DEMO_V = 18;
  const DEF = () => ({ v: 3, seedV: DEMO_V, collection: DEMO ? seedOwned() : [], wishlist: DEMO ? seedWish() : [], walks: [], profile: null, log: [], settings: { budget: 220, liked: [], avoid: [] }, today: null });
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
  const stx = () => ({ daysSince, liked: S.settings.liked || [], avoid: S.settings.avoid || [], gender: S.profile && S.profile.gender });
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
      const p = cv.dataset.p ? find(cv.dataset.p) : (RECS[+cv.dataset.r] || {}).c;
      if (p) FX.attach(cv, p, { dark: false, density: +cv.dataset.d || .5 });
    });
  }
  const todayEntry = (id) => { let e = [...S.log].reverse().find((l) => l.id === id && l.date === today()); if (!e) { e = { id, date: today() }; S.log.push(e); } return e; };
  let AUTOW = '';
  const hasWish = (name) => S.wishlist.some((w) => E.norm(w.name) === E.norm(name));
  const addWish = (o) => { if (!hasWish(o.name)) { S.wishlist.push({ st: o.st || 'smell',  name: o.name, house: o.house || '', family: o.family || '', notes: o.notes || [], price: o.price || 0 }); save(); } };
  const rmWish = (name) => { S.wishlist = S.wishlist.filter((w) => E.norm(w.name) !== E.norm(name)); save(); };
  const wishToOwned = (w) => { const c = CAT.find((x) => E.norm(x.name) === E.norm(w.name)); if (c) return fromCat(c, 4); return { id: uid(), name: w.name, house: w.house, family: w.family || 'boisé', notes: [...(w.notes || [])], projection: 3, longevity: 3, weight: 3, price: w.price || 0, rating: 4, occ: [] }; };
  const buyLinks = (name, house) => { const q = encodeURIComponent(name + ' ' + house); return `<div class="buy"><a class="linkbtn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${q}+parfum+acheter">Où l'acheter</a><a class="linkbtn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${q}+site%3Afragrantica.com">Fragrantica</a></div>`; };
  const wears = (id) => S.log.filter((l) => l.id === id).length;
  const words = (t, base) => String(t || '').split(/\s+/).filter(Boolean).map((w, i) => `<span class="w" style="--i:${i};--d:${base || 0}">${esc(w)}</span>`).join(' ');
  const dots = (n) => '<span class="dots">' + [1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'f' : ''}"></i>`).join('') + '</span>';
  const colLines = () => S.collection.map((p) => `${p.id} | ${p.name} | ${p.house} | ${p.family} | ${(p.notes || []).join(', ')} | proj ${p.projection}/5 | tenue ${p.longevity}/5 | poids ${p.weight}/5 (1 léger, 5 dense) | ma note ${p.rating}/5 | ${ago(daysSince(p.id))} | stock : ${E.stockOf(p).ml} ml sur ${E.stockOf(p).size} ml, usage ${E.STOCK_USES[E.stockOf(p).use].toLowerCase()}`).join('\n');

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
    ({ today: viewToday, shelf: viewShelf, search: viewSearch, tips: viewTips, play: viewPlay, walk: viewWalk, wish: viewWish })[tab]();
    if (!keepScroll) window.scrollTo(0, 0);
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
        ${window.SillageDemo && !PRESENT ? `<button class="demo-pill" data-sell>Démo · ${window.SillageDemo.left()} essai${window.SillageDemo.left() > 1 ? 's' : ''}</button>` : ''}
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
    const pool = needPool().filter((c) => !((g0 === 'm' && gd(c) === 'f') || (g0 === 'f' && gd(c) === 'm')) && !owned.has(E.norm(c.name)) && !(c.notes || []).some((n) => avoid.some((a) => a && E.norm(n).includes(a))) && (!budget || !c.price || c.price <= budget) && !(c.entry && c.entry.ed));
    const cov = E.coverage(P), pct = (v) => Math.max(0, Math.min(1, (v - 2) / 12));
    const base = cov.map((x) => x.best), avg = (a) => Math.round(100 * a.reduce((t, v) => t + pct(v), 0) / a.length);
    const rows = pool.map((c) => ({ c, v: cov.map((x) => E.score(c, x.sc.c).total) }));
    const pref = E.axisPref(P), famOwn = new Set(P.map((p) => p.family));
    const fk = (c) => { const w = E.norm(c.name).split(' ').filter((x) => !['le', 'la', 'les', 'l', 'the', 'un', 'une', 'eau', 'de', 'du', 'd'].includes(x)); return E.norm(c.house) + '|' + (w[0] || E.norm(c.name)); };
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
        const cand = rows.filter((r) => keep(r) && !fams.has(fk(r.c)) && !houses.has(E.norm(r.c.house)) && !items.some((i) => i.r === r)).map((r) => ({ r, sc: f(r, cur) - (usedG.has(r.c.name) ? 4 : 0) })).sort((a, b) => b.sc - a.sc)[0];
        if (!cand || cand.sc <= 0) break;
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
    return (withHead ? `<p style="font-size:14px;color:var(--muted)">Tes ${plan.n} parfums couvrent moins bien : ${plan.weak.map(esc).join(' et ')}. Voici ce que donnerait ta collection avec quelques ajouts, selon la stratégie.</p>` : '') + plan.strategies.map((s) => `<article class="card plan" style="display:grid;gap:10px">
        <div><p class="mono">Stratégie</p><h3 style="margin-top:4px">${esc(s.label)}</h3><p style="color:var(--muted);font-size:14px;margin-top:4px">${esc(s.sub)}</p></div>
        <div class="planbar" role="img" aria-label="Couverture de ta collection : ${s.before} % puis ${s.after} %"><span style="width:${s.before}%"></span><i style="width:${Math.max(0, s.after - s.before)}%"></i></div>
        <p class="mono" style="text-transform:none;letter-spacing:0">Moments couverts : ${s.before} % aujourd'hui, ${s.after} % avec ${s.items.length} ajout${s.items.length > 1 ? 's' : ''}. Ta collection + ${names(s.items)}.</p>
        <div style="display:grid;gap:8px">${s.items.map((i) => `<div class="row" style="justify-content:space-between;gap:10px;align-items:flex-start"><div><button type="button" class="lnk" data-plan-open="${esc(entryKey(i.r.c.entry || { house: i.c.house, name: i.c.name }))}"><b>${esc(i.c.name)}</b></button><small style="display:block;color:var(--muted)">${esc(i.c.house)}${i.c.price ? ' · ≈ ' + i.c.price + ' €' : ''}${i.ups.length ? ' · couvre : ' + i.ups.map(esc).join(', ') : ''}</small></div><button type="button" class="ghost" data-plan-wish="${esc(i.c.name)}">${hasWish(i.c.name) ? 'Dans ma wishlist' : 'Wishlist'}</button></div>`).join('')}</div>
      </article>`).join('');
  }
  function bindPlan(root) {
    const look = {}; dbList().forEach((e) => { look[entryKey(e)] = e; });
    $$('[data-plan-open]', root).forEach((b) => (b.onclick = () => { const e = look[b.dataset.planOpen]; if (e) openEntry(e); }));
    $$('[data-plan-wish]', root).forEach((b) => (b.onclick = () => { const n = b.dataset.planWish; if (hasWish(n)) rmWish(n); else addWish(wishFromName(n)); b.textContent = hasWish(n) ? 'Dans ma wishlist' : 'Wishlist'; save(); }));
    if ($('#planAdd', root)) $('#planAdd', root).onclick = openAdd;
  }
  function tipsData() {
    const P = S.collection, st = S.settings, cat = needPool(), avoid = (st.avoid || []).map(E.norm), owned = new Set(P.map((p) => E.norm(p.name)));
    const gd = (c) => (window.genderOf ? window.genderOf(c.name, c.house) : 'u'), wrong = (c) => { const g = S.profile && S.profile.gender; return (g === 'm' && gd(c) === 'f') || (g === 'f' && gd(c) === 'm'); };
    const ok = (c) => !wrong(c) && !owned.has(E.norm(c.name)) && !(c.notes || []).some((n) => avoid.some((a) => a && E.norm(n).includes(a))) && (!st.budget || !c.price || c.price <= st.budget);
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
    const all = E.recommend(cat, P, S.wishlist, Object.assign({}, st, { gender: S.profile && S.profile.gender, age: S.profile && S.profile.age, seed })).sort((x, y) => hasImg(y.c) - hasImg(x.c) || y.total - x.total);
    const byHouse = {};
    out.recs = all.filter((r) => (!st.budget || r.c.price <= st.budget) && fresh(r.c)).filter((r) => { const h = E.norm(r.c.house); byHouse[h] = (byHouse[h] || 0) + 1; return byHouse[h] <= 2; }).slice(0, 8);
    const tg = window.tagsOf || (() => []);
    // « Par envie » : jamais un parfum déjà montré plus haut, ni une autre version du même parfum.
    [['niche', 'Un niche pour toi'], ['abordable', 'Un abordable qui te va'], ['luxe', 'Un coup de luxe'], ['prive', 'Une collection privée']].forEach(([t, label]) => { const r = all.find((x) => tg(x.c.name, x.c.house, x.c.price, '').includes(t) && !out.recs.some((y) => y.c === x.c) && fresh(x.c)); if (r) out.tags.push({ label, r }); });
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
  function viewTips() {
    const s = S.settings, T = tipsData(); RECS = T.recs;
    const dsc = (c) => (window.DESC && window.DESC[c.name] ? window.DESC[c.name][1] : (c.notes || []).slice(0, 4).join(', '));
    $('#view').innerHTML = `
      <section class="sec"><header><h2>Conseils</h2><span class="mono">pour toi</span></header>
        ${S.collection.length ? '' : `<div class="card emptycard"><p class="mono">Pour commencer</p><h2>Ajoute tes parfums</h2><p>Mes conseils partent de ce que tu as déjà : ce qui te manque, ce qui te plaît.</p><button class="cta full" id="tipAdd"><span>Ajouter mes parfums</span></button></div>`}
        ${S.collection.length ? `<p class="mono">Stratégies de collection</p><div id="planbox">${planHtml(collectionPlan(), true)}</div>` : ''}
        ${T.gaps.length ? `<p class="mono">Pour compléter ta collection</p>${T.gaps.map((g) => tipCard(g.c, g.sc.label, `Pour <b>${esc(g.sc.label)}</b>, rien de vraiment adapté chez toi (ton meilleur : ${esc(g.bestP.name)}). ${esc(dsc(g.c))}`)).join('')}` : ''}
        ${T.tips.length && S.collection.length ? `<div class="card"><p class="mono">Ta collection en bref</p><ul class="tiplist">${T.tips.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
      </section>
      <section class="sec"><header><h2>Des flacons pour toi</h2><span class="mono">tes goûts</span></header>
        <div class="card" style="display:grid;gap:8px"><p class="rd" style="margin:0">Le pourcentage dit à quel point un flacon colle à tes goûts, à ta saison et à ton budget. Il ne juge pas sa qualité. Précision actuelle <b>${profPrecision().l}</b>${profPrecision().v < 1 ? ', elle monte quand tu précises ton profil.' : '.'}</p><button class="ghost" id="tipProf" style="justify-self:start">Affiner mon profil</button></div>
        ${T.recs.length ? `<div class="snap">${T.recs.slice(0, 6).map((r, i) => recCard(r, i)).join('')}</div>` : '<div class="empty">Rien dans ce budget. Augmente-le un peu.</div>'}
      </section>
      ${T.tags.length ? `<section class="sec"><header><h2>Par envie</h2><span class="mono">niche, luxe, abordable…</span></header>${T.tags.map((t) => tipCard(t.r.c, t.label, esc(dsc(t.r.c)) + (t.r.hits.length ? ' Tu aimes déjà : ' + esc(t.r.hits.join(', ')) + '.' : ''))).join('')}</section>` : ''}
      <section class="sec">
        <div class="card" style="display:grid;gap:8px"><b>Où l'acheter</b><p class="rd" style="margin:0">Une carte des parfumeries et des enseignes beauté autour de toi.</p><button class="ghost" id="tipMap" style="justify-self:start">Ouvrir la carte</button></div>
        <div class="card" style="display:grid;gap:8px"><div class="row" style="justify-content:space-between"><b>Budget par flacon</b><b id="bval" style="font-family:var(--f-display);font-size:20px">${s.budget ? s.budget + ' €' : 'sans limite'}</b></div>
          <input type="range" id="budget" min="0" max="500" step="10" value="${s.budget || 0}" aria-label="Budget par flacon"><p class="mono">prix indicatifs · à vérifier chez le vendeur</p></div>
        <div class="card ask-card"><p class="mono">${IC.spark} demande à l'IA</p>
          <textarea id="askq" rows="2" placeholder="Un niche qui sent le thé fumé et le bois, max 200 €…" aria-label="Ce que tu cherches"></textarea>
          <div class="chips" id="askchips">${['un frais niche pour le bureau', 'quelque chose de très enveloppant pour l\'hiver', 'un layering pour Baccarat Rouge'].map((t) => `<button class="chip" data-q="${esc(t)}">${esc(t)}</button>`).join('')}</div>
          <button class="cta" id="askgo">${IC.spark}<span>Me conseiller</span></button><div id="askres" class="aires"></div></div>
      </section>
      `;
    if ($('#tipAdd')) $('#tipAdd').onclick = openAdd;
    if ($('#tipMap')) $('#tipMap').onclick = openShopMap;
    if ($('#tipProf')) $('#tipProf').onclick = () => { openProfile(); };
    if ($('#planbox')) bindPlan($('#planbox'));
    const bud = $('#budget');
    bud.addEventListener('input', () => { S.settings.budget = +bud.value; $('#bval').textContent = bud.value > 0 ? bud.value + ' €' : 'sans limite'; });
    bud.addEventListener('change', () => { save(); viewTips(); });
    $$('[data-q]').forEach((b) => (b.onclick = () => { $('#askq').value = b.dataset.q; }));
    $('#askgo').onclick = runAsk;
    $$('[data-rw]').forEach((b) => (b.onclick = () => { const n = b.dataset.rw; if (hasWish(n)) rmWish(n); else addWish(wishFromName(n)); viewTips(); }));
    $$('[data-own]').forEach((b) => (b.onclick = () => { const c = CAT.find((x) => x.name === b.dataset.own); if (c) { S.collection.push(fromCat(c, 4)); rmWish(c.name); save(); viewTips(); } }));
    $$('[data-why]').forEach((b) => (b.onclick = () => explain(b)));
    mountFx($('#view'));
  }
  function recCard(r, i) {
    const c = r.c, reasons = [];
    if (r.axisWhy && r.axisWhy.length) reasons.push('Dans ta veine : ' + r.axisWhy.join(' et '));
    if (r.hits.length) reasons.push('Tu aimes déjà : ' + r.hits.join(', '));
    if (r.gapLabel) reasons.push('Comble : ' + r.gapLabel);
    if (r.inSeason) reasons.push('De saison en ce moment');
    if (r.inBudget) reasons.push('Dans ton budget');
    if (r.houseLoved) reasons.push('Une maison que tu aimes déjà');
    if (r.mates.length) reasons.push('Se marie avec ' + r.mates.map((m) => m.name).join(', '));
    return `<article class="rec" style="--tint:${tint(c)}">${fxCanvas(`data-r="${i}"`, .6)}<span class="pct" title="Compatibilité avec tes goûts">${r.pct}%<small>compatible</small></span>${bt(c, { still: false })}
      <div><h3>${esc(c.name)}</h3><p style="color:var(--muted);font-size:14px">${esc(c.house)} · ${esc(famLabel(c.family))} · ≈ ${c.price} €</p>${window.DESC && window.DESC[c.name] ? `<p class="rd">${esc(window.DESC[c.name][1])}</p>` : (r.pitch ? `<p class="rd">${tx(r.pitch)}${r.diff ? ' ' + tx(r.diff) + '.' : ''}</p>` : '')}</div>
      <div class="pts ok">${reasons.slice(0, 4).map((x) => `<span class="pt">${esc(x)}</span>`).join('')}</div>
      <p class="why" id="why${i}"></p>
      <div class="row"><button class="ghost" data-why="${i}">${IC.spark} Pourquoi lui ?</button><button class="ghost" data-rw="${esc(c.name)}">${r.wished ? 'Dans ma wishlist' : 'Wishlist'}</button><button class="ghost" data-own="${esc(c.name)}">Je l'ai</button></div>${buyLinks(c.name, c.house)}</article>`;
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
  async function runAsk() {
    const q = $('#askq').value.trim(), out = $('#askres'); if (!q) { $('#askq').focus(); return; }
    out.innerHTML = '<div class="shim"></div><div class="shim" style="width:70%"></div>'; $('#askgo').disabled = true;
    const s = S.settings;
    const prompt = `Tu es un nez de parfumerie très pointu (niche et designer). Réponds UNIQUEMENT par un JSON. Propose des parfums différents entre eux, jamais plusieurs versions du même (pas de flankers, rééditions, éditions limitées ni concentrations multiples).\nMa collection :\n${colLines()}\nBudget max par flacon : ${s.budget || 'aucun'} €. Notes aimées : ${(s.liked || []).join(', ') || '—'}. Notes à éviter : ${(s.avoid || []).join(', ') || '—'}.\nMa demande : "${q}"\n\nPropose 3 parfums qui existent vraiment et que je ne possède pas déjà, adaptés à ma demande, à mes goûts déduits de ma collection et à mon budget. Format : {"items":[{"name":"nom officiel","house":"maison","family":"${FAMS}","notes":["5 notes en français"],"price":nombre en euros (indicatif),"why":"2 phrases, tutoiement, concrètes","adds":"ce que ça apporte à ma collection, 8 mots max","layer_with":"id d'un parfum de ma collection ou null"}]}`;
    try {
      const j = await aiJson(prompt, { modelTier: 'default' });
      const items = (j.items || []).slice(0, 3); ASK = []; ASKI = 0;
      out.innerHTML = items.map((it) => {
        const c = { name: String(it.name || '?'), house: String(it.house || ''), family: E.FAMILIES[it.family] ? it.family : 'boisé', notes: (it.notes || []).map(String).slice(0, 5) };
        const mate = find(it.layer_with); ASK.push({ name: c.name, house: c.house, family: c.family, notes: c.notes, price: Math.round(+it.price) || 0 });
        return `<article class="rec" style="--tint:${tint(c)}">${bt(c, {})}<div><h3>${esc(c.name)}</h3><p style="color:var(--muted);font-size:14px">${esc(c.house)}${it.price ? ' · ≈ ' + Math.round(+it.price) + ' €' : ''}</p><p style="margin-top:6px;font-size:14px">${esc(it.why || '')}</p><p class="mono" style="margin-top:6px;text-transform:none">${esc(it.adds || '')}${mate ? ' · avec ' + esc(mate.name) : ''}</p><button class="ghost" style="margin-top:8px" data-ra="${ASKI++}">Wishlist</button></div>${buyLinks(c.name, c.house)}</article>`;
      }).join('') || '<div class="empty">Pas de résultat, reformule.</div>';
      $$('[data-ra]', out).forEach((b) => (b.onclick = () => { addWish(ASK[+b.dataset.ra]); b.textContent = 'Ajouté'; }));
    } catch (e) {
      out.innerHTML = `<div class="empty">${e && e.code === 'not_granted' ? 'Autorise l\'IA pour cette recherche.' : 'L\'IA n\'est pas disponible dans cette vue. La sélection ci-dessous reste calculée pour toi.'}</div>`;
    }
    $('#askgo').disabled = false;
  }

  // ---------- Feuilles ----------
  function openSheet(html) {
    const sh = $('#sheet'); sh.hidden = false;
    sh.innerHTML = `<div class="veil"></div><div class="panel" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
    $('.veil', sh).onclick = closeSheet;
    document.body.style.overflow = 'hidden';
    return $('.panel', sh);
  }
  function closeSheet() { const sh = $('#sheet'), wasProf = !!$('#tedit', sh); sh.hidden = true; sh.innerHTML = ''; if ($('#story').hidden) document.body.style.overflow = ''; if (wasProf && (tab === 'tips' || tab === 'today')) render(true); }

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
    $$('#stars button', pn).forEach((b) => (b.onclick = () => { p.rating = +b.dataset.r; save(); $$('#stars button', pn).forEach((x) => { x.textContent = +x.dataset.r <= p.rating ? '★' : '☆'; }); }));
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
      if (!e.price && x.p) { e.price = x.p; if (x.pe) e.pe = true; }
      if (x.y) e.year = x.y; if (x.c) e.coll = x.c; });
    (S.customDb || []).forEach((c) => { const k = E.norm(c.house + ' ' + c.name); if (seen.has(k)) return; seen.add(k); out.push({ g: gdOf(c.name, c.house), ed: false, name: c.name, house: c.house || 'Autre', conc: '', cat: null, family: c.family || null, notes: c.notes || [], price: c.price || 0, noses: [], guess: false, tags: [], custom: true }); });
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
    g = facet === 'brand' ? g.sort((a, b) => fr(a.label) - fr(b.label) || b.items.length - a.items.length || a.label.localeCompare(b.label, 'fr')) : facet === 'nose' ? g.sort((a, b) => a.label.localeCompare(b.label, 'fr')) : facet === 'tag' ? g.sort((a, b) => Object.keys(window.TAGS || {}).indexOf(a.key) - Object.keys(window.TAGS || {}).indexOf(b.key)) : facet === 'price' ? g.sort((a, b) => a.key.localeCompare(b.key)) : g.sort((a, b) => b.items.length - a.items.length);
    return g;
  }
  const entryKey = (e) => E.norm(e.house + ' ' + e.name);
  function entryToOwned(e) {
    if (e.cat) return Object.assign(fromCat(e.cat, 4), { size: 100, left: 100, use: 'free' });
    // Jamais de notes devinées : si la base n'a pas les vraies notes, la fiche reste vide et l'IA la remplit dès l'ajout.
    const base = { id: uid(), name: e.name, house: e.house, price: 0, rating: 4, occ: [], size: 100, left: 100, use: 'free' };
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
    const popular = () => { const by = new Map(dbList().map((e) => [E.norm(e.house) + '|' + E.norm(e.name), e])); return (window.INCONT || []).map((k) => by.get(k)).filter((e) => e && !e.ed); };
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
          const g = gs.find((x) => x.key === group); const items = g ? g.items.slice().sort((a, b) => (imgOf(b) ? 1 : 0) - (imgOf(a) ? 1 : 0) || (b.cat ? 1 : 0) - (a.cat ? 1 : 0) || a.name.localeCompare(b.name, 'fr')) : [];
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
    return r.sort((a, b) => rank(a) - rank(b) || (imgOf(b) ? 1 : 0) - (imgOf(a) ? 1 : 0) || (b.cat ? 1 : 0) - (a.cat ? 1 : 0) || a.name.localeCompare(b.name, 'fr'));
  }
  function rowCard(e) {
    const d = window.DESC && window.DESC[e.name], inCol = S.collection.some((p) => E.norm(p.name) === E.norm(e.name)), inW = hasWish(e.name);
    return `<button type="button" class="xc" data-ent="${esc(entryKey(e))}">${xThumb(e)}<span class="xt"><b>${esc(e.name)}</b><small>${esc([e.house, e.family ? (e.guess ? '≈ ' : '') + famLabel(e.family) : '', e.conc && e.conc !== 'EDP' ? e.conc.split(',').map((x) => CONC_L[x] || x).join('/') : '', e.price ? '≈ ' + e.price + ' €' : ''].filter(Boolean).join(' · '))}</small>${d && e.cat ? `<em>${tx(d[1])}</em>` : ''}${tagPills(e)}</span><i class="xm">${inCol ? '✓ chez toi' : inW ? '♡ wishlist' : '›'}</i></button>`;
  }
  function drawSearchResults() {
    const r = filterDb(), box = $('#sres'); if (!box) return;
    $('#scount').textContent = r.length + ' parfum' + (r.length > 1 ? 's' : '');
    box.innerHTML = r.length ? `<div class="xgrid">${r.slice(0, SRCH.limit).map(rowCard).join('')}</div>${r.length > SRCH.limit ? '<button type="button" class="ghost" id="smore">Voir plus</button>' : ''}` : '<div class="empty">Aucun parfum ne correspond. Enlève un filtre ou change les mots.</div>';
    const look = {}; dbList().forEach((e) => { look[entryKey(e)] = e; });
    $$('[data-ent]', box).forEach((b) => (b.onclick = () => { const e = look[b.dataset.ent]; if (e) openEntry(e); }));
    if ($('#smore', box)) $('#smore', box).onclick = () => { SRCH.limit += 40; drawSearchResults(); };
  }

  // « un parfum comme Aventus mais moins cher » : on retrouve le parfum cité et on classe la base par proximité de profil.
  function simSearch(q, need) {
    const m = q.match(/(?:comme|similaire (?:a|à)|proche (?:de|du)|dans le style (?:de|du)|dupe (?:de|du)|alternative (?:a|à)|ressemble (?:a|à)|genre|type)\s+(.+)/i); if (!m) return null;
    const tail = ' ' + E.norm(m[1]) + ' '; let ref = null;
    dbList().forEach((e) => { const n = E.norm(e.name); if (n.length >= 4 && tail.includes(' ' + n + ' ') && (!ref || n.length > E.norm(ref.name).length)) ref = e; });
    if (!ref) return null;
    const rq = E.profOf({ name: ref.name, house: ref.house, notes: ref.notes || [], family: ref.family }); if (!rq) return null;
    const cheaper = /moins cher|pas cher|abordable|economique|petit budget/.test(E.norm(q)), cen = (v) => v.map((x) => x - 2.5);
    const a = cen(rq.p), na = Math.sqrt(a.reduce((t, x) => t + x * x, 0)) || 1;
    const rn = new Set((ref.notes || []).map(E.norm).filter(Boolean)), nmin = (a, b) => Math.max(3, Math.min(a, b));
    const res = needPool().filter((c) => E.norm(c.name) !== E.norm(ref.name) && !(c.entry && c.entry.ed) && E.norm(c.house + c.name) !== E.norm(ref.house + ref.name)).map((c) => {
      const pq = E.profOf(c); if (!pq) return null; const b = cen(pq.p), nb = Math.sqrt(b.reduce((t, x) => t + x * x, 0)) || 1;
      const cs = a.reduce((t, x, i) => t + x * b[i], 0) / (na * nb), cn = new Set((c.notes || []).map(E.norm).filter(Boolean));
      let sh = 0; rn.forEach((n) => { if (cn.has(n) || [...cn].some((m) => m.includes(n) || n.includes(m))) sh++; });
      const ns = rn.size && cn.size ? sh / nmin(rn.size, cn.size) : 0, fm = c.family && c.family === ref.family ? 1 : 0;
      return { c, sim: Math.min(0.99, 0.45 * cs + 0.4 * Math.min(1, ns) + 0.15 * fm), shared: sh };
    }).filter((r) => r && r.sim > 0.42 && (!need.maxPrice || !r.c.price || r.c.price <= need.maxPrice) && (!cheaper || !ref.price || (r.c.price > 0 && r.c.price < ref.price * 0.8))).sort((x, y) => y.sim - x.sim);
    return { ref, cheaper, res };
  }
  const NEED = { q: '', n: 8 };
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
    const g = S.profile && S.profile.gender, res = E.searchNeed(needPool(), need, Object.assign({}, S.settings, { gender: g }), NEED.n);
    const lookup = {}; dbList().forEach((e) => { lookup[entryKey(e)] = e; });
    box.innerHTML = `<p class="mono" style="text-transform:none;letter-spacing:0">${esc(E.needLabel(need) || 'Besoin compris')} · ${res.length} résultat${res.length > 1 ? 's' : ''}</p>` + (res.length ? `<div class="xgrid">${res.map((r) => { const e = r.c.entry || lookup[E.norm(r.c.house + ' ' + r.c.name)] || { name: r.c.name, house: r.c.house, family: r.c.family, notes: r.c.notes, price: r.c.price, tags: [], cat: r.c }; return `<button type="button" class="xc" data-ent="${esc(entryKey(e))}">${xThumb(e)}<span class="xt"><b>${esc(e.name)}</b><small>${esc([e.house, e.family ? famLabel(e.family) : '', e.price ? '≈ ' + e.price + ' €' : ''].filter(Boolean).join(' · '))}</small><em>${esc(r.m.why.join(' · '))}</em>${r.m.pitch ? `<em>${tx(r.m.pitch)}</em>` : ''}</span><i class="xm">${r.m.pct} %</i></button>`; }).join('')}</div>${NEED.n <= res.length ? '<button type="button" class="ghost" id="nmore">Voir plus</button>' : ''}` : '<div class="empty">Rien ne correspond vraiment. Enlève une contrainte (budget, note fuie) ou élargis le besoin.</div>');
    box.insertAdjacentHTML('beforeend', `<div style="display:grid;gap:12px;margin-top:14px"><button type="button" class="cta" id="needai"><span>Affiner avec l'IA</span></button><p class="mono" id="needaimsg" style="text-transform:none;letter-spacing:0">L'IA compare les meilleurs candidats, tranche pour toi et explique pourquoi.</p><div id="needaires" style="display:grid;gap:12px"></div></div>`);
    $('#needai', box).onclick = () => aiNeed(res, need);
    $$('[data-ent]', box).forEach((b) => (b.onclick = () => { const e = lookup[b.dataset.ent]; if (e) openEntry(e); }));
    if ($('#nmore', box)) $('#nmore', box).onclick = () => { NEED.n += 8; drawNeed(); };
  }
  // Conseil sur mesure : l'IA tranche parmi les candidats vérifiés par le moteur (tout est calculé sur de vraies notes).
  const ROLE_L = { choix: 'Le choix', sur: 'Le sûr', audace: 'La petite audace' };
  async function aiNeed(res, need) {
    const msg = $('#needaimsg'), out = $('#needaires'), btn = $('#needai'); if (!msg) return;
    msg.textContent = 'Je compare…'; btn.disabled = true; out.innerHTML = '';
    const short = res.slice(0, 25).map((r) => [r.c.house, r.c.name, famLabel(r.c.family), (r.c.notes || []).slice(0, 8).join(', '), r.m.diff || r.m.pitch || '', r.m.pct + ' %'].join(' | ')).join('\n');
    const col = S.collection.slice(0, 25).map((p) => `${p.name} (${p.house}) : ${p.rating}/5 : ${(p.notes || []).slice(0, 5).join(', ')}`).join('\n');
    const args = { need: NEED.q, shortlist: short, collection: col, profile: S.profile ? { gender: S.profile.gender, age: S.profile.age } : null };
    try {
      const j = window.SillageDemo ? await window.SillageDemo.need(args) : await aiJson(window.SillagePrompts.need(args), { modelTier: 'default' });
      const picks = (j.picks || []).slice(0, 3);
      out.innerHTML = (j.compris ? `<p class="rd">${esc(j.compris)}</p>` : '') + picks.map((k) => `<article class="card" style="display:grid;gap:8px"><p class="mono">${esc(ROLE_L[k.role] || 'Conseil')} · ${clamp(Math.round(+k.pct || 0), 0, 99)} %${k.hors_liste ? ' · hors de ma liste vérifiée' : ''}</p><b style="font-size:18px">${esc(k.name)}</b><small style="color:var(--muted)">${esc(k.house || '')}</small><p style="font-size:14.5px">${esc(k.pourquoi || '')}</p>${k.tete ? `<p style="font-size:13.5px;color:var(--muted)">Au début : ${esc(k.tete)}</p>` : ''}${k.peau ? `<p style="font-size:13.5px;color:var(--muted)">Sur ta peau, après 3 h : ${esc(k.peau)}</p>` : ''}${k.attention ? `<p style="font-size:13.5px">⚠ ${esc(k.attention)}</p>` : ''}</article>`).join('') + (j.eviter && j.eviter.name ? `<p style="font-size:14px"><b>À éviter pour toi : ${esc(j.eviter.name)}</b>${j.eviter.raison ? ' : ' + esc(j.eviter.raison) : ''}</p>` : '') + (j.test ? `<p class="mono" style="text-transform:none;letter-spacing:0">${esc(j.test)}</p>` : '');
      msg.textContent = picks.length ? '' : 'L\'IA n\'a rien trouvé de mieux.'; btn.disabled = false;
    } catch (e) { msg.textContent = e && e.code === 'rate_limited' ? 'Plus d\'essais pour aujourd\'hui.' : 'L\'IA n\'est pas disponible ici. Les résultats ci-dessus restent valables.'; btn.disabled = false; }
  }
  function viewSearch() {
    const db = dbList(), houses = [...new Set(db.map((e) => e.house))].sort((a, b) => a.localeCompare(b, 'fr')), noses = [...new Set(db.flatMap((e) => e.noses || []))].sort((a, b) => a.localeCompare(b, 'fr'));
    const sel = (id, label, opts, val) => `<label class="sel"><span class="mono">${label}</span><select id="${id}"><option value="">Tous</option>${opts.map((o) => `<option value="${esc(o)}" ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
    const nF = SRCH.tags.length + (SRCH.style ? 1 : 0) + (SRCH.price ? 1 : 0) + (SRCH.house ? 1 : 0) + (SRCH.note ? 1 : 0) + (SRCH.nose ? 1 : 0) + (SRCH.conc ? 1 : 0) + (SRCH.gen ? 1 : 0) + (SRCH.photo ? 1 : 0);
    $('#view').innerHTML = `
      <section class="sec srch"><header><h2>Recherche</h2><span class="mono" id="scount"></span></header>
        <div class="card needbox"><p class="mono">Je cherche…</p><div class="row"><input type="search" id="need" placeholder="Ex. frais pour le bureau cet été, sans vanille" value="${esc(NEED.q)}" autocomplete="off" aria-label="Décris ce que tu cherches"><button class="cta" id="needgo"><span>Trouver</span></button></div><div class="chips">${NEED_EX.map((x) => `<button type="button" class="chip" data-nex="${esc(x)}">${esc(x)}</button>`).join('')}</div><div id="nres"></div></div>
        <input type="search" id="sq" placeholder="Un parfum, une maison…" value="${esc(SRCH.q)}" autocomplete="off" aria-label="Rechercher un parfum">
        ${SRCH.nose ? noseCard(SRCH.nose) : `<details class="nosefold"><summary class="mono">Parcourir par parfumeur</summary>${noseRow('data-sn', (window.NOSE_TOP || []).slice(0, 14))}</details>`}
        <div class="chips actf">${[...SRCH.tags.map((t) => ['t:' + t, (window.TAGS || {})[t]]), SRCH.style ? ['style', famLabel(SRCH.style)] : null, SRCH.price ? ['price', (PRICE_TIERS.find((x) => x[0] === SRCH.price) || [])[1]] : null, SRCH.house ? ['house', SRCH.house] : null, SRCH.note ? ['note', 'Note : ' + SRCH.note] : null, SRCH.nose ? ['nose', SRCH.nose] : null, SRCH.conc ? ['conc', SRCH.conc] : null, SRCH.gen ? ['gen', ({ f: 'Féminin', m: 'Masculin', u: 'Mixte' })[SRCH.gen]] : null, SRCH.photo ? ['photo', 'Avec photo'] : null].filter(Boolean).map(([k, l]) => `<button class="chip on" data-xa="${esc(k)}">${esc(l)} ✕</button>`).join('')}</div>
        <details class="filters" ${SRCH.open ? 'open' : ''}><summary class="mono">Filtres${nF ? ' · ' + nF : ''}</summary>
          <p class="mono">Tags</p><div class="chips">${Object.entries(window.TAGS || {}).map(([k, v]) => `<button class="chip ${SRCH.tags.includes(k) ? 'on' : ''}" data-st="${k}">${esc(v)}</button>`).join('')}</div>
          <p class="mono">Style</p><div class="chips">${Object.keys(E.FAMILIES).map((k) => `<button class="chip ${SRCH.style === k ? 'on' : ''}" data-ss="${k}">${esc(famLabel(k))}</button>`).join('')}</div>
          <p class="mono">Prix</p><div class="chips">${PRICE_TIERS.map(([k, l]) => `<button class="chip ${SRCH.price === k ? 'on' : ''}" data-sp="${k}">${l}</button>`).join('')}</div>
          <p class="mono">Pour qui</p><div class="chips">${[['f', 'Féminin'], ['m', 'Masculin'], ['u', 'Mixte']].map(([k, l]) => `<button class="chip ${SRCH.gen === k ? 'on' : ''}" data-sgen="${k}">${l}</button>`).join('')}</div>
          <p class="mono">Concentration</p><div class="chips">${[['EDT', 'Eau de toilette'], ['EDP', 'Eau de parfum'], ['EXT', 'Extrait'], ['PAR', 'Parfum'], ['COL', 'Cologne']].map(([k, l]) => `<button class="chip ${SRCH.conc === k ? 'on' : ''}" data-sc2="${k}">${l}</button>`).join('')}<button class="chip ${SRCH.photo ? 'on' : ''}" data-sph="1">Avec photo</button></div>
          <div class="selrow">${sel('sh', 'Maison', houses, SRCH.house)}${sel('sn', 'Note', FACET_NOTES.slice().sort((a, b) => a.localeCompare(b, 'fr')), SRCH.note)}${sel('sno', 'Parfumeur', noses, SRCH.nose)}</div>
          ${nF ? '<button class="ghost" id="sreset">Tout effacer</button>' : ''}
        </details>
        <div id="sres"></div></section>`;
    const re = () => { SRCH.limit = 40; viewSearch(); };
    $$('[data-sn]').forEach((b) => (b.onclick = () => { SRCH.nose = b.dataset.sn; re(); }));
    $('.filters').addEventListener('toggle', (e) => { SRCH.open = e.target.open; });
    $$('[data-xa]').forEach((b) => (b.onclick = () => { const k = b.dataset.xa; if (k.startsWith('t:')) SRCH.tags = SRCH.tags.filter((x) => x !== k.slice(2)); else if (k === 'photo') SRCH.photo = false; else SRCH[k] = ''; re(); }));
    const goNeed = () => { NEED.q = $('#need').value; NEED.n = 8; drawNeed(); };
    $('#needgo').onclick = goNeed; $('#need').addEventListener('keydown', (e) => { if (e.key === 'Enter') goNeed(); });
    $$('[data-nex]').forEach((b) => (b.onclick = () => { $('#need').value = b.dataset.nex; goNeed(); }));
    drawNeed();
    $('#sq').addEventListener('input', (e) => { SRCH.q = e.target.value; SRCH.limit = 40; drawSearchResults(); });
    $$('[data-st]').forEach((b) => (b.onclick = () => { const k = b.dataset.st, i = SRCH.tags.indexOf(k); if (i >= 0) SRCH.tags.splice(i, 1); else SRCH.tags.push(k); re(); }));
    $$('[data-ss]').forEach((b) => (b.onclick = () => { SRCH.style = SRCH.style === b.dataset.ss ? '' : b.dataset.ss; re(); }));
    $$('[data-sp]').forEach((b) => (b.onclick = () => { SRCH.price = SRCH.price === b.dataset.sp ? '' : b.dataset.sp; re(); }));
    $$('[data-sgen]').forEach((b) => (b.onclick = () => { SRCH.gen = SRCH.gen === b.dataset.sgen ? '' : b.dataset.sgen; re(); }));
    $$('[data-sc2]').forEach((b) => (b.onclick = () => { SRCH.conc = SRCH.conc === b.dataset.sc2 ? '' : b.dataset.sc2; re(); }));
    if ($('[data-sph]')) $('[data-sph]').onclick = () => { SRCH.photo = !SRCH.photo; re(); };
    $('#sh').onchange = (e) => { SRCH.house = e.target.value; re(); }; $('#sn').onchange = (e) => { SRCH.note = e.target.value; re(); }; $('#sno').onchange = (e) => { SRCH.nose = e.target.value; re(); };
    if ($('#sreset')) $('#sreset').onclick = () => { Object.assign(SRCH, { tags: [], style: '', price: '', house: '', note: '', nose: '', conc: '', gen: '', photo: false, limit: 40 }); viewSearch(); };
    { const nf = $('.nosefold'); if (nf) nf.addEventListener('toggle', () => { if (nf.open) initFolds(nf); }); initFolds($('#view')); }
    drawSearchResults();
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
    if ($('#eown', pn)) $('#eown', pn).onclick = () => { addEntriesToCollection([e]); closeSheet(); render(true); };
    if ($('#ewish', pn)) $('#ewish', pn).onclick = () => { addWish({ name: e.name, house: e.house, family: e.family || '', notes: e.notes || [], price: e.price || 0, st: 'smell' }); save(); closeSheet(); render(true); };
  }
  function addEntriesToCollection(list) { list.forEach((e) => { if (!S.collection.some((p) => E.norm(p.name) === E.norm(e.name) && E.norm(p.house) === E.norm(e.house))) S.collection.push(entryToOwned(e)); }); save(); autoFill(); }
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
    txt0.split(txt0.includes('\n') ? /\n/ : /,/).map((x) => x.trim()).filter(Boolean).forEach((l) => { const nm = l.includes(' — ') ? l.split(' — ').slice(1).join(' ') : l; const c = CAT.find((x) => E.norm(x.name) === E.norm(nm)); if (c) localHits.push(Object.assign(fromCat(c, 4), { conf: 0.95 })); else restLines.push(l); });
    const txt = restLines.join('\n');
    out.innerHTML = '<div class="shim"></div><div class="shim" style="width:80%"></div><div class="shim" style="width:60%"></div>'; $('#addgo', pn).disabled = true;
    let items = null;
    try {
      if (!txt && !SHELF_FILES.length && !imgUrl) throw { code: 'local_only' };
      const prompt = `Tu es un expert en parfumerie (niche et designer). L'utilisateur ajoute des parfums à sa collection, en vrac${SHELF_FILES.length ? ' et via photo(s) de flacons ou d\'étagère' : ''}. Texte saisi : """${txt || '(aucun)'}"""\nIdentifie chaque parfum (corrige les fautes, complète la maison). Réponds UNIQUEMENT par un JSON : {"items":[{"name":"nom officiel","house":"maison","family":"${FAMS}","notes":["5 notes en français, de l'ouverture au fond"],"projection":1-5,"longevity":1-5,"weight":1-5 (1 frais et léger, 5 chaud et dense),"price":nombre en euros indicatif,"confidence":0 à 1}]}. Si tu ne reconnais pas un parfum, mets confidence sous 0.4 et ta meilleure estimation.`;
      const j = demo ? await demo.identify({ text: txt, url: imgUrl, file: SHELF_FILES[0] }) : await aiJson(prompt, { modelTier: 'quick', images: SHELF_FILES.length && CAN_IMG ? SHELF_FILES : undefined });
      items = (j.items || []).map((it) => ({ ai: true, id: uid(), name: String(it.name || '').trim(), house: String(it.house || '').trim(), family: E.FAMILIES[it.family] ? it.family : 'boisé', notes: (it.notes || []).map(String).slice(0, 6), projection: clamp(Math.round(+it.projection || 3), 1, 5), longevity: clamp(Math.round(+it.longevity || 3), 1, 5), weight: clamp(Math.round(+it.weight || 3), 1, 5), price: Math.round(+it.price) || 0, rating: 4, occ: [], conf: +it.confidence || 0.7 })).filter((it) => it.name);
      items = localHits.concat(items);
      if (items.length && items.filter((it) => it.ai).length === 1 && (SHELF_FILES[0] || imgUrl)) { try { const th = await cutout(SHELF_FILES[0] || imgUrl); if (th) items.find((it) => it.ai).src = th; } catch (er) { /* image protégée : flacon dessiné */ } }
    } catch (e) {
      items = restLines.map((l) => {
        const n = E.norm(l); const c = CAT.find((x) => n.length >= 4 && (E.norm(x.name).includes(n) || n.includes(E.norm(x.name))));
        return c ? Object.assign(fromCat(c, 4), { conf: 0.9 }) : null;
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
      ${window.SillageDemo ? (window.SillageDemo.account.loggedIn() ? `<div class="card" style="display:grid;gap:10px"><b>Mon compte</b><p class="mono" style="text-transform:none;letter-spacing:0">Connecté : ${esc(window.SillageDemo.account.email())}. Ton profil est sauvegardé automatiquement.</p><div class="row"><button class="ghost" id="alogout">Me déconnecter</button><button class="ghost danger" id="adel">Supprimer mon compte</button></div></div>` : `<div class="card" style="display:grid;gap:10px"><b>Mon compte</b><p class="mono" style="text-transform:none;letter-spacing:0">Crée un compte pour garder ton profil, ta collection et ta wishlist sur tous tes appareils.</p><button class="cta" id="acreate"><span>Créer un compte ou me connecter</span></button></div>`) : ''}
      <div id="tedit" class="tprof"></div>
      <div class="card" style="display:grid;gap:10px"><b>Sauvegarde</b><div class="row"><button class="ghost" id="exp">Exporter en texte</button><button class="ghost" id="imp">Importer</button></div><textarea id="io" rows="3" placeholder="Le texte de sauvegarde apparaît ici, ou colle-le pour importer"></textarea><p class="mono" id="iomsg" style="text-transform:none"></p></div>
      <div class="row"><button class="ghost danger" id="reset">Tout vider</button></div>`);
    const pmsg = () => { $('#pmsg', pn).textContent = 'Enregistré ✓'; };
    $$('[data-pg]', pn).forEach((b) => (b.onclick = () => { setProfile({ gender: b.dataset.pg }); $$('[data-pg]', pn).forEach((x) => x.classList.toggle('on', x === b)); pmsg(); }));
    $('#page', pn).onchange = () => { setProfile({ age: cleanAge($('#page', pn).value) }); pmsg(); };
    $('#pname', pn).onchange = () => { setProfile({ name: $('#pname', pn).value.trim().slice(0, 24) }); pmsg(); };
    if ($('#acreate', pn)) $('#acreate', pn).onclick = () => { closeSheet(); showAccount('profile'); };
    if ($('#alogout', pn)) $('#alogout', pn).onclick = async () => { await window.SillageDemo.account.logout(); if (needAcct()) afterLeave(); else { closeSheet(); render(true); } };
    if ($('#adel', pn)) $('#adel', pn).onclick = async (e) => { if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = 'Confirmer la suppression'; return; } try { await window.SillageDemo.account.remove(); } catch (er) { /* déjà supprimé */ } if (needAcct()) afterLeave(); else { closeSheet(); render(true); } };
    mountTaste($('#tedit', pn), ['notes', 'vibes', 'occ']);
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
  let LEAF = null;
  const loadLeaflet = () => LEAF || (LEAF = new Promise((ok, ko) => {
    if (window.L && window.L.map) return ok(window.L);
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'; document.head.appendChild(css);
    const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'; sc.onload = () => (window.L ? ok(window.L) : ko()); sc.onerror = () => { LEAF = null; ko(); }; document.head.appendChild(sc);
  }));
  const kmBetween = (a, b, c, d) => { const r = Math.PI / 180, x = (c - a) * r, y = (d - b) * r * Math.cos(((a + c) / 2) * r); return 6371 * Math.sqrt(x * x + y * y); };
  async function fetchShops(lat, lon, rad) {
    const q = `[out:json][timeout:20];(nwr["shop"="perfumery"](around:${rad},${lat},${lon});nwr["shop"="cosmetics"]["name"~"Sephora|Nocib|Marionnaud|Douglas|Yves Rocher",i](around:${rad},${lat},${lon});nwr["shop"="department_store"]["name"~"Galeries Lafayette|Printemps|Bon March|Harrods|Selfridges|El Corte|La Rinascente|KaDeWe",i](around:${rad},${lat},${lon}););out center 80;`;
    const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    if (!r.ok) throw new Error('http');
    const seen = new Set();
    return ((await r.json()).elements || []).map((el) => { const t = el.tags || {}, la = el.lat != null ? el.lat : el.center && el.center.lat, lo = el.lon != null ? el.lon : el.center && el.center.lon; if (la == null || !t.name) return null;
      const kind = t.shop === 'perfumery' ? 'Parfumerie' : t.shop === 'department_store' ? 'Grand magasin' : 'Enseigne beauté', addr = [[t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' '), t['addr:city']].filter(Boolean).join(', ');
      return { name: t.name, kind, addr, lat: la, lon: lo, site: t.website || t['contact:website'] || '', hours: t.opening_hours || '', km: kmBetween(lat, lon, la, lo) }; })
      .filter((x) => x && !seen.has(x.name + x.lat.toFixed(4)) && seen.add(x.name + x.lat.toFixed(4))).sort((a, b) => a.km - b.km);
  }
  function openShopMap() {
    let pos = S.settings.geo && S.settings.geo.lat != null ? { lat: S.settings.geo.lat, lon: S.settings.geo.lon, place: S.settings.geo.place || '' } : null, rad = 3000, map = null;
    const pn = openSheet(`<div><h2>Où acheter près de moi</h2><p style="color:var(--muted);margin-top:6px">Les parfumeries, les enseignes beauté et les grands magasins autour de toi, sur une carte.</p></div>
      <div class="row"><button class="cta" id="smGeo"><span>Autour de moi</span></button></div>
      <div class="acwrap"><input type="text" id="smCity" placeholder="Ou une ville, un quartier (Lyon, Marais…)" autocomplete="off" aria-label="Ville"></div>
      <div class="chips" id="smRad">${[[1000, '1 km'], [3000, '3 km'], [10000, '10 km'], [25000, '25 km']].map(([v, l]) => `<button type="button" class="chip ${v === rad ? 'on' : ''}" data-rad="${v}">${l}</button>`).join('')}</div>
      <p class="mono" id="smMsg" style="text-transform:none;letter-spacing:0"></p>
      <div id="smMap" class="smmap" hidden></div><div id="smList" style="display:grid;gap:10px"></div><div id="smLinks"></div>`);
    const msg = (t) => { $('#smMsg', pn).textContent = t; };
    const links = () => { if (!pos) { $('#smLinks', pn).innerHTML = ''; return; } const at = `@${pos.lat.toFixed(4)},${pos.lon.toFixed(4)},14z`; $('#smLinks', pn).innerHTML = `<p class="mono">Chercher aussi</p><div class="chips">${[['Parfumerie niche', 'parfumerie+niche'], ['Sephora', 'Sephora'], ['Nocibé', 'Nocib%C3%A9'], ['Marionnaud', 'Marionnaud'], ['Parfumerie', 'parfumerie']].map(([l, q]) => `<a class="chip" target="_blank" rel="noopener" href="https://www.google.com/maps/search/${q}/${at}">${l}</a>`).join('')}</div>`; };
    async function go() {
      if (!pos) return; links(); msg('Je cherche les boutiques autour de toi…'); $('#smList', pn).innerHTML = '<div class="shim"></div><div class="shim" style="width:70%"></div>';
      let shops = [], failed = false;
      try { shops = await fetchShops(pos.lat, pos.lon, rad); } catch (e) { failed = true; }
      if (!$('#smList', pn)) return;
      msg(failed ? 'La liste n\'a pas pu se charger. Utilise la carte et les recherches ci-dessous.' : shops.length ? `${shops.length} adresse${shops.length > 1 ? 's' : ''} trouvée${shops.length > 1 ? 's' : ''}${pos.place ? ' près de ' + pos.place : ''}. Vérifie les horaires avant de te déplacer.` : 'Rien trouvé dans ce rayon. Élargis-le ou lance une recherche ci-dessous.');
      const mb = $('#smMap', pn); mb.hidden = false;
      const dlat = rad / 111000 * 1.1, dlon = dlat / Math.max(.2, Math.cos(pos.lat * Math.PI / 180));
      const iframe = () => { mb.innerHTML = `<iframe title="Carte" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=${pos.lon - dlon},${pos.lat - dlat},${pos.lon + dlon},${pos.lat + dlat}&layer=mapnik&marker=${pos.lat},${pos.lon}"></iframe>`; };
      try {
        const L = await loadLeaflet(); mb.innerHTML = ''; if (map) { map.remove(); map = null; }
        map = L.map(mb, { zoomControl: true, attributionControl: true }).setView([pos.lat, pos.lon], rad <= 1000 ? 16 : rad <= 3000 ? 14 : rad <= 10000 ? 12 : 10);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
        L.circleMarker([pos.lat, pos.lon], { radius: 8, color: '#fff', weight: 2, fillColor: '#4a8cff', fillOpacity: 1 }).addTo(map).bindPopup('Toi');
        shops.forEach((x, i) => { x.m = L.circleMarker([x.lat, x.lon], { radius: 8, color: '#fff', weight: 1.5, fillColor: '#b4394a', fillOpacity: 1 }).addTo(map).bindPopup(x.name); });
        setTimeout(() => map && map.invalidateSize(), 250);
      } catch (e) { iframe(); }
      $('#smList', pn).innerHTML = shops.slice(0, 25).map((x, i) => `<article class="card" style="display:grid;gap:6px"><div class="row" style="justify-content:space-between;gap:8px"><b>${esc(x.name)}</b><span class="tag">${x.km < 1 ? Math.round(x.km * 1000) + ' m' : x.km.toFixed(1) + ' km'}</span></div><small style="color:var(--muted)">${esc(x.kind)}${x.addr ? ' · ' + esc(x.addr) : ''}</small>${x.hours ? `<small style="color:var(--muted)">Horaires ${esc(String(x.hours).slice(0, 80))}</small>` : ''}<div class="row"><a class="linkbtn" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${x.lat},${x.lon}">Itinéraire</a>${map ? `<button type="button" class="linkbtn" data-sf="${i}" style="background:none">Sur la carte</button>` : ''}${x.site && /^https?:\/\//.test(x.site) ? `<a class="linkbtn" target="_blank" rel="noopener" href="${esc(x.site)}">Site</a>` : ''}</div></article>`).join('');
      $$('[data-sf]', pn).forEach((b) => (b.onclick = () => { const x = shops[+b.dataset.sf]; if (map && x && x.m) { map.setView([x.lat, x.lon], 17); x.m.openPopup(); $('#smMap', pn).scrollIntoView({ block: 'center', behavior: 'smooth' }); } }));
    }
    const setPos = (lat, lon, place) => { pos = { lat, lon, place: place || '' }; S.settings.geo = Object.assign({}, S.settings.geo, { lat, lon, place: place || (S.settings.geo && S.settings.geo.place) || '', ts: Date.now() }); save(); go(); };
    $('#smGeo', pn).onclick = () => { if (!navigator.geolocation) { msg('Ton appareil ne donne pas sa position. Tape une ville.'); return; } msg('Je cherche ta position…'); navigator.geolocation.getCurrentPosition((p) => setPos(p.coords.latitude, p.coords.longitude, ''), () => msg('Position refusée. Tape une ville ou un quartier juste en dessous.'), { timeout: 10000, maximumAge: 300000 }); };
    const city = async () => { const v = $('#smCity', pn).value.trim(); if (!v) return; msg('Je cherche ' + v + '…'); try { const g = await geocodeCity(v); setPos(g.lat, g.lon, g.place); } catch (e) { msg('Ville introuvable, ou pas de connexion.'); } };
    $('#smCity', pn).addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); city(); } });
    $('#smCity', pn).addEventListener('change', city);
    $$('[data-rad]', pn).forEach((b) => (b.onclick = () => { rad = +b.dataset.rad; $$('[data-rad]', pn).forEach((x) => x.classList.toggle('on', x === b)); go(); }));
    if (pos) go(); else msg('Touche « Autour de moi » ou tape ta ville.');
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
    const args = { collection: colLines(), text, explicit: explicitLine(), wx: wx ? { l: wx.l, t: wx.t, rain: !!wx.rain } : null, hasPhoto: !!(PHOTO && CAN_IMG), profile: S.profile && !S.profile.skipped ? { gender: S.profile.gender, age: S.profile.age } : null, date: new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) };
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
    sc.push({ label: 'c\'est parti', dur: 0, hue: p, html: () => `<div class="center" style="display:grid;gap:16px;justify-items:center"><div class="hero-bottle" style="height:200px"><i class="aura"></i>${bt(p, { spray: true, h: 200 })}</div><h2 class="rise">${wornNow ? 'C\'est noté.' : 'On y va&nbsp;?'}</h2><button class="st-btn rise" style="--d:300" id="wear">${wornNow ? 'Porté aujourd\'hui ✓' : 'Je le porte aujourd\'hui'}</button><button class="st-btn line rise" style="--d:450" id="stclose">Fermer</button></div>` });
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
  const PLS = window.PLAYLISTS || [], PL = { id: 0, sec: '' };
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
  function viewPlay() { PL.id ? viewPlaylist(PLS.find((x) => x.id === PL.id)) : viewPlayLib(); }
  function viewPlayLib() {
    const secs = (window.PL_SECTIONS || []).filter((s) => !PL.sec || s === PL.sec), day = plDay();
    $('#view').innerHTML = `
      <section class="sec"><header><h2>Inspirations</h2><span class="mono">${PLS.length} univers</span></header>
        <p class="plintro">Un personnage, une ville, un instant, une envie. Chaque liste a son décor, sa culture et ses accords.</p>
        <button type="button" class="plhero" data-pl="${day.id}">${plCover(day, true)}<span class="plhi"><span class="mono">Liste du jour</span><b>${esc(day.t)}</b><em>${esc(plDesc(day))}</em></span></button>
        <div class="chips plsecs"><button class="chip ${PL.sec ? '' : 'on'}" data-psec="">Tout</button>${(window.PL_SECTIONS || []).map((s) => `<button class="chip ${PL.sec === s ? 'on' : ''}" data-psec="${esc(s)}">${esc(s)}</button>`).join('')}</div>
      </section>
      ${secs.map((s) => { const L = PLS.filter((p) => p.secs.includes(s)); return `<section class="sec plsec"><header><h2>${esc(s)}</h2><span class="mono">${L.length}</span></header><div class="${PL.sec ? 'plgrid' : 'plrow'}">${L.map((p) => `<button type="button" class="plcard" data-pl="${p.id}">${plCover(p)}<span class="plsub">${p.ps.length} parfums</span></button>`).join('')}</div></section>`; }).join('')}`;
    $$('[data-pl]').forEach((b) => (b.onclick = () => { PL.id = +b.dataset.pl; render(); }));
    $$('[data-psec]').forEach((b) => (b.onclick = () => { PL.sec = b.dataset.psec; viewPlayLib(); }));
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
        ${p.d ? `<p class="pld">${esc(p.d)}</p>` : ''}
        <p class="mono plmeta">${p.ps.length} parfums · ${st.n} dans la base${st.mine ? ' · ' + st.mine + ' chez toi' : ''}</p>
        ${accords.length || notes.length ? `<div><p class="mono">L'ADN olfactif</p><div class="chips" style="margin-top:8px">${accords.map((a) => `<button type="button" class="chip on" data-adn="a:${esc(a)}">${esc(a)}</button>`).join('')}${notes.map((n) => `<button type="button" class="chip" data-adn="n:${esc(n)}">${esc(n)}</button>`).join('')}</div></div>` : ''}
        <div class="row"><button class="cta" id="plshuf"><span>Un au hasard</span></button><button class="ghost" id="plwish">Tout en wishlist</button></div>
        ${(p.doc || []).map((d) => `<div class="pldoc"><p>${esc(d.t)}</p>${d.u ? `<a href="${esc(d.u)}" target="_blank" rel="noopener noreferrer">Source : ${esc(d.s)}</a>` : ''}</div>`).join('')}
        <div class="plist">${p.ps.map((x, i) => (p.grp && plGrpAt(p, i) >= 0 ? `<div class="plgrp"><p class="mono">${esc(p.grp[plGrpAt(p, i)].t)}</p>${p.grp[plGrpAt(p, i)].d ? `<p class="pld">${esc(p.grp[plGrpAt(p, i)].d)}</p>` : ''}</div>` : '') + row(x, i)).join('')}</div>
        ${combos.length ? `<div><p class="mono">Combinaisons à essayer</p><div class="plcombos">${combos.map((c) => `<div class="plcombo">${sm(c[0])}<i>+</i>${sm(c[1])}</div>`).join('')}</div></div>` : ''}
      </section>`;
    $$('[data-adn]').forEach((b) => (b.onclick = () => { const v = b.dataset.adn.slice(2); if (b.dataset.adn.startsWith('n:')) { SRCH.note = v; SRCH.limit = 40; tab = 'search'; render(); } else goNeedText(v); }));
    $('#plback').onclick = () => { PL.id = 0; render(); };
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
    const st2 = Object.assign({}, S.settings, { gender: S.profile && S.profile.gender, age: S.profile && S.profile.age, seed: PROFILES.active, liked: [...new Set([...liked, ...lovedN.map((o) => o.n)])] });
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
    $$('[data-ko]', out).forEach((b) => (b.onclick = () => { const e = w.entries.find((x) => x.id === b.dataset.ko), f = ficheOf(e); if (S.collection.some((p) => E.norm(p.name) === E.norm(e.name))) { b.textContent = 'Déjà chez toi'; return; } const c = CAT.find((x) => E.norm(x.name) === E.norm(e.name)); S.collection.push(c ? fromCat(c, 4) : fromCat({ name: f.name, house: f.house, family: f.family || 'boisé', notes: f.notes || [], projection: f.projection || 3, longevity: f.longevity || 3, weight: f.weight || 3, price: f.price || 0 }, 4)); rmWish(e.name); save(); b.textContent = 'Ajouté à ma collection ✓'; }));
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
  window.addEventListener('sillage:expired', () => { if (needAcct()) afterLeave(); });
  // Compte : créer (puis les questions d'inscription) ou se connecter (le profil complet revient), ou continuer sans compte.
  function showAccount(from) {
    const A = window.SillageDemo.account;
    const el = document.createElement('div'); el.id = 'acct'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Compte');
    let mode = 'signup';
    const MSG = { email: 'Cet email semble incomplet.', password: 'Choisis un mot de passe de 8 caractères minimum.', exists: 'Un compte existe déjà avec cet email : connecte-toi.', credentials: 'Email ou mot de passe incorrect.', rate: 'Trop d\'essais pour l\'instant. Réessaie un peu plus tard.', network: 'Pas de connexion. Réessaie dans un instant.', server: 'Un souci de notre côté. Réessaie dans un instant.' };
    const draw = () => {
      el.innerHTML = `<div class="prof-in"><p class="mono">Ton compte</p><h2>${mode === 'signup' ? 'Garde ton profil' : 'Content de te revoir'}</h2>
        <p class="soft">${mode === 'signup' ? 'Un compte sauvegarde tout : tes parfums, ta wishlist, tes goûts. Tu les retrouves sur tous tes appareils.' : 'Connecte-toi pour retrouver ton profil, ta collection et ta wishlist.'}</p>
        <div class="chips acct-tabs"><button class="chip ${mode === 'signup' ? 'on' : ''}" data-m="signup">Créer un compte</button><button class="chip ${mode === 'login' ? 'on' : ''}" data-m="login">J'ai déjà un compte</button></div>
        <form id="acf" class="acf" novalidate><input type="email" id="aem" autocomplete="email" inputmode="email" placeholder="Ton email" aria-label="Ton email"><input type="password" id="apw" autocomplete="${mode === 'signup' ? 'new-password' : 'current-password'}" placeholder="${mode === 'signup' ? 'Mot de passe (8 caractères minimum)' : 'Mot de passe'}" aria-label="Mot de passe">
          <p class="mono" id="amsg" role="alert" style="text-transform:none;letter-spacing:0;min-height:18px"></p>
          <button class="cta full" id="ago"><span>${mode === 'signup' ? 'Créer mon compte' : 'Me connecter'}</span></button></form>
        <p class="soft small">Ton email sert uniquement à te reconnecter. Tu peux supprimer ton compte à tout moment dans Profil.</p>
        ${from === 'profile' ? '<button class="ghost" id="askip">Fermer</button>' : ''}</div>`;
      $$('[data-m]', el).forEach((b) => (b.onclick = () => { mode = b.dataset.m; draw(); }));
      if ($('#askip', el)) $('#askip', el).onclick = close;
      $('#acf', el).onsubmit = async (ev) => {
        ev.preventDefault(); const em = $('#aem', el).value.trim(), pw = $('#apw', el).value, msg = $('#amsg', el);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { msg.textContent = MSG.email; return; }
        if (mode === 'signup' && pw.length < 8) { msg.textContent = MSG.password; return; }
        $('#ago', el).disabled = true; msg.textContent = '…';
        try {
          if (mode === 'signup') { await A.signup(em, pw); close(); if (hasProfile() || from === 'profile') { save(); if (from === 'profile') render(true); } else showProfile(); }
          else {
            const j = await A.login(em, pw); PULLING = true;
            if (j.data) { S = Object.assign(DEF(), j.data); S.settings = Object.assign(DEF().settings, S.settings); migrate(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e2) { /* ok */ } }
            PULLING = false; close();
            if (!hasProfile()) showProfile(); else { tab = 'today'; render(); }
          }
        } catch (e) { PULLING = false; msg.textContent = MSG[e.code] || MSG.server; $('#ago', el).disabled = false; }
      };
    };
    const close = () => { el.remove(); document.body.style.overflow = ''; };
    document.body.appendChild(el); document.body.style.overflow = 'hidden'; draw();
  }

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
    if (parts.includes('notes')) h += `<div class="tpart"><p class="mono">Les notes</p><p class="soft">Touche une note une fois pour dire que tu l'adores, deux fois pour dire que tu la fuis, trois fois pour l'effacer.</p>
      ${NOTE_GROUPS.map((g) => `<p class="mono tg">${esc(g[0])}</p><div class="chips">${g[2].map(chip).join('')}</div>`).join('')}
      <p class="mono tg">Une autre note</p><div class="acwrap"><input type="text" id="tnadd" placeholder="figue, thé, rhum, iris…" autocomplete="off" aria-label="Ajouter une note"><div class="aclist" id="tnac" hidden></div></div><div class="chips" data-tcust>${cust.map(chip).join('')}</div></div>`;
    if (parts.includes('vibes')) h += `<div class="tpart"><p class="mono">Ton ambiance</p><p class="soft">Choisis tout ce qui te ressemble.</p>${pillSet('vibes', VIBE_L, true, 'data-vb')}<p class="mono tg">Sa présence</p>${pillSet('power', POWER_L, false, 'data-pw')}</div>`;
    if (parts.includes('occ')) h += `<div class="tpart"><p class="mono">Quand tu le portes</p>${pillSet('occ', OCC_L, true, 'data-oc')}<p class="mono tg">Budget par flacon <b data-bval>${s.budget ? s.budget + ' €' : 'sans limite'}</b></p><input type="range" id="tbud" min="0" max="500" step="10" value="${s.budget || 0}" aria-label="Budget par flacon"></div>`;
    return h;
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
    const bud = $('#tbud', root); if (bud) { bud.addEventListener('input', () => { S.settings.budget = +bud.value; $('[data-bval]', root).textContent = bud.value > 0 ? bud.value + ' €' : 'sans limite'; upd(); }); bud.addEventListener('change', save); }
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
  function showProfile() {
    const d = Object.assign({ gender: '', age: null, name: '' }, hasProfile() ? S.profile : {}), N = 7;
    const el = document.createElement('div'); el.id = 'prof'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Faisons connaissance');
    let step = 1;
    const read = () => { if ($('#pName', el)) d.name = $('#pName', el).value.trim().slice(0, 24); if ($('#pAge', el)) d.age = cleanAge($('#pAge', el).value); };
    const draw = () => {
      const head = `<p class="mono">Faisons connaissance · ${step} / ${N}</p>`, back = step > 1 ? '<button class="ghost" id="pBack">Retour</button>' : '';
      if (step === 7) {
        el.innerHTML = '<div class="prof-in wide"><div id="pExp"></div></div>';
        mountExplorer($('#pExp', el), { mode: 'collection', title: d.name ? 'Tes parfums, ' + d.name : 'Tes parfums', sub: 'Choisis ceux que tu as déjà : par maison, style, notes… Tu pourras en ajouter d\'autres à tout moment.', cta: (n) => 'Ajouter ' + n + ' et commencer', skip: 'Je n\'en ai pas encore', onSkip: () => end(false), onSubmit: (list) => { addEntriesToCollection(list); end(false); } });
        return;
      }
      el.innerHTML = step === 1
        ? `<div class="prof-in">${head}<h2>Enchanté. Comment tu t'appelles&nbsp;?</h2><p class="soft">Juste ton prénom : je m'en sers pour te dire bonjour. Ça reste sur ton appareil.</p>
          <input type="text" id="pName" maxlength="24" value="${esc(d.name || '')}" placeholder="Ton prénom" aria-label="Ton prénom" autocomplete="given-name" class="agein">
          <button class="cta full" id="pNext"><span>Continuer</span></button><button class="ghost" id="pSkip">Plus tard</button></div>`
        : step === 2
          ? `<div class="prof-in">${head}<h2>Tu es…</h2><p class="soft">Pour choisir un parfum qui te va, pas pour t'enfermer dans une case.</p>
            <div class="gen">${GEN.map(([k, l]) => `<button class="chip ${d.gender === k ? 'on' : ''}" data-g="${k}">${l}</button>`).join('')}</div>
            <button class="cta full" id="pNext"><span>Continuer</span></button>${back}</div>`
          : step === 3
            ? `<div class="prof-in">${head}<h2>Quel âge as-tu&nbsp;?</h2><p class="soft">Les goûts et les occasions changent avec l'âge.</p>
              <input type="text" id="pAge" inputmode="numeric" maxlength="2" value="${d.age || ''}" placeholder="Ton âge" aria-label="Ton âge" class="agein">
              <button class="cta full" id="pNext"><span>Continuer</span></button>${back}</div>`
            : step === 4
              ? `<div class="prof-in wide">${head}<h2>Quelles notes aimes-tu&nbsp;?</h2><p class="soft">Une touche pour adorer, deux pour fuir. Ne cherche pas à tout remplir : trois ou quatre notes suffisent pour commencer.</p><div id="pTaste" class="tprof"></div>
                <button class="cta full" id="pNext"><span>Continuer</span></button>${back}</div>`
              : step === 5
                ? `<div class="prof-in wide">${head}<h2>Quel genre de parfum te ressemble&nbsp;?</h2><p class="soft">Ton ambiance et la présence que tu veux. Tu peux changer d'avis à tout moment.</p><div id="pTaste" class="tprof"></div>
                  <button class="cta full" id="pNext"><span>Continuer</span></button>${back}</div>`
                : `<div class="prof-in wide">${head}<h2>Quand le portes-tu, et pour combien&nbsp;?</h2><p class="soft">Voilà ton profil, tel que je le comprends. Je m'en sers pour tous mes conseils.</p><div id="pTaste" class="tprof"></div>
                  <button class="cta full" id="pNext"><span>Choisir mes parfums</span></button>${back}</div>`;
      if ($('#pTaste', el)) mountTaste($('#pTaste', el), step === 4 ? ['notes'] : step === 5 ? ['vibes'] : ['occ']);
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
    const pick = (n) => { const c = CAT.find((x) => x.name === n); return c ? fromCat(c, 4) : null; };
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
  window.SillageHooks = { openSheet, closeSheet, rerender: () => { if (tab === 'today' && $('#story').hidden && $('#sheet').hidden && !$('#onb')) viewToday(); } };

  // ---------- Démarrage ----------
  $('#dock').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { if (b.dataset.tab === 'play' && tab === 'play') PL.id = 0; tab = b.dataset.tab; render(); } });
  $('#profileBtn').onclick = openProfile;
  render();
  initStore();
  initAI();
  if (S.settings.weatherOn) autoWeather(false);
  mergeCommunity();
  setTimeout(showOnboarding, $('#splash') ? 2700 : 200);
  const sp = $('#splash');
  if (sp) { const kill = () => sp.remove(); sp.addEventListener('click', kill); setTimeout(kill, REDUCED ? 500 : 3000); }
})();
