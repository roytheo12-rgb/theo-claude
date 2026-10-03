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
  const imgOf = (p) => { const nw = imgNew(p); if (nw) return nw; if (IMG[p.name]) return IMG[p.name]; const D = window.IMGDB || {}, W = window.IMGWEB || {}, k = E.norm(p.house || '') + '|' + E.norm(p.name), f = D[k] || W[k]; return f ? { s: f, nz: 6 } : null; };
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
    $('#dock .ind').style.transform = `translateX(${['today', 'shelf', 'search', 'tips', 'walk', 'wish'].indexOf(tab) * 100}%)`;
    ({ today: viewToday, shelf: viewShelf, search: viewSearch, tips: viewTips, walk: viewWalk, wish: viewWish })[tab]();
    if (!keepScroll) { window.scrollTo(0, 0); TIPDECK = null; }
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
  function tipsData() {
    const P = S.collection, st = S.settings, cat = needPool(), avoid = (st.avoid || []).map(E.norm), owned = new Set(P.map((p) => E.norm(p.name)));
    const gd = (c) => (window.genderOf ? window.genderOf(c.name, c.house) : 'u'), wrong = (c) => { const g = S.profile && S.profile.gender; return (g === 'm' && gd(c) === 'f') || (g === 'f' && gd(c) === 'm'); };
    const ok = (c) => !wrong(c) && !owned.has(E.norm(c.name)) && !(c.notes || []).some((n) => avoid.some((a) => a && E.norm(n).includes(a))) && (!st.budget || !c.price || c.price <= st.budget);
    const out = { gaps: [], recs: [], tags: [], tips: [] };
    // Pas 15 versions du même parfum : une seule fiche par famille (maison + premier mot du nom : Sauvage, Sauvage Elixir, Sauvage EDT…).
    const famKey = (c) => { const w = E.norm(c.name).split(' ').filter((x) => !['le', 'la', 'les', 'l', 'the', 'un', 'une', 'eau', 'de', 'du', 'd'].includes(x)); return E.norm(c.house) + '|' + (w[0] || E.norm(c.name)); };
    const fams = new Set(), fresh = (c) => { const k = famKey(c); if (fams.has(k)) return false; fams.add(k); return true; };
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
  // ---------- « À découvrir » : cartes mélangées à chaque visite, jamais la même en premier ----------
  let TIPDECK = null, TIPF = 'all';
  function tipDeck() {
    if (TIPDECK && TIPDECK.f === TIPF) return TIPDECK.a;
    const a = (window.TIPS || []).filter((t) => TIPF === 'all' || t.c === TIPF);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    let last = null; try { last = localStorage.getItem('sillage.tipfirst'); } catch (e) { /* ok */ }
    if (a.length > 1 && String(a[0].id) === last) { const k = 1 + Math.floor(Math.random() * (a.length - 1)); [a[0], a[k]] = [a[k], a[0]]; }
    if (TIPF === 'all' && a.length) { try { localStorage.setItem('sillage.tipfirst', String(a[0].id)); } catch (e) { /* ok */ } }
    TIPDECK = { f: TIPF, a }; return a;
  }
  function discoverHtml() {
    const cats = window.TIPS_CATS || {}, deck = tipDeck();
    if (!deck.length) return '';
    return `<section class="sec disc"><header><h2>À découvrir</h2><span class="mono">${deck.length} cartes · fais défiler</span></header>
      <div class="chips discf">${[['all', 'Tout'], ...Object.entries(cats)].map(([k, v]) => `<button class="chip ${TIPF === k ? 'on' : ''}" data-tf="${k}">${esc(v)}</button>`).join('')}<button class="chip" data-tshuf="1">Mélanger</button></div>
      <div class="snap tipk-row">${deck.map((t) => `<article class="tipk" data-k="${esc(t.c)}"><p class="mono">${esc(cats[t.c] || '')}</p><h3>${esc(t.t)}</h3><p>${esc(t.x)}</p></article>`).join('')}</div></section>`;
  }
  function viewTips() {
    const s = S.settings, T = tipsData(); RECS = T.recs;
    const dsc = (c) => (window.DESC && window.DESC[c.name] ? window.DESC[c.name][1] : (c.notes || []).slice(0, 4).join(', '));
    $('#view').innerHTML = `
      ${discoverHtml()}
      <section class="sec"><header><h2>Conseils</h2><span class="mono">pour toi</span></header>
        ${S.collection.length ? '' : `<div class="card emptycard"><p class="mono">Pour commencer</p><h2>Ajoute tes parfums</h2><p>Mes conseils partent de ce que tu as déjà : ce qui te manque, ce qui te plaît.</p><button class="cta full" id="tipAdd"><span>Ajouter mes parfums</span></button></div>`}
        ${T.gaps.length ? `<p class="mono">Pour compléter ta collection</p>${T.gaps.map((g) => tipCard(g.c, g.sc.label, `Pour <b>${esc(g.sc.label)}</b>, rien de vraiment adapté chez toi (ton meilleur : ${esc(g.bestP.name)}). ${esc(dsc(g.c))}`)).join('')}` : ''}
        ${T.tips.length && S.collection.length ? `<div class="card"><p class="mono">Ta collection en bref</p><ul class="tiplist">${T.tips.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
      </section>
      <section class="sec"><header><h2>Des flacons pour toi</h2><span class="mono">tes goûts</span></header>
        ${T.recs.length ? `<div class="snap">${T.recs.slice(0, 6).map((r, i) => recCard(r, i)).join('')}</div>` : '<div class="empty">Rien dans ce budget. Augmente-le un peu.</div>'}
      </section>
      ${T.tags.length ? `<section class="sec"><header><h2>Par envie</h2><span class="mono">niche, luxe, abordable…</span></header>${T.tags.map((t) => tipCard(t.r.c, t.label, esc(dsc(t.r.c)) + (t.r.hits.length ? ' Tu aimes déjà : ' + esc(t.r.hits.join(', ')) + '.' : ''))).join('')}</section>` : ''}
      <section class="sec">
        <div class="card" style="display:grid;gap:8px"><div class="row" style="justify-content:space-between"><b>Budget par flacon</b><b id="bval" style="font-family:var(--f-display);font-size:20px">${s.budget ? s.budget + ' €' : 'sans limite'}</b></div>
          <input type="range" id="budget" min="0" max="500" step="10" value="${s.budget || 0}" aria-label="Budget par flacon"><p class="mono">prix indicatifs · à vérifier chez le vendeur</p></div>
        <div class="card ask-card"><p class="mono">${IC.spark} demande à l'IA</p>
          <textarea id="askq" rows="2" placeholder="Un niche qui sent le thé fumé et le bois, max 200 €…" aria-label="Ce que tu cherches"></textarea>
          <div class="chips" id="askchips">${['un frais niche pour le bureau', 'quelque chose de très enveloppant pour l\'hiver', 'un layering pour Baccarat Rouge'].map((t) => `<button class="chip" data-q="${esc(t)}">${esc(t)}</button>`).join('')}</div>
          <button class="cta" id="askgo">${IC.spark}<span>Me conseiller</span></button><div id="askres" class="aires"></div></div>
      </section>
      ${lexCard()}`;
    bindLex();
    $$('[data-tf]').forEach((b) => (b.onclick = () => { TIPF = b.dataset.tf; TIPDECK = null; viewTips(); }));
    if ($('[data-tshuf]')) $('[data-tshuf]').onclick = () => { TIPDECK = null; viewTips(); };
    if ($('#tipAdd')) $('#tipAdd').onclick = openAdd;
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
    if (r.mates.length) reasons.push('Se marie avec ' + r.mates.map((m) => m.name).join(', '));
    return `<article class="rec" style="--tint:${tint(c)}">${fxCanvas(`data-r="${i}"`, .6)}<span class="pct">${r.pct}%</span>${bt(c, { still: false })}
      <div><h3>${esc(c.name)}</h3><p style="color:var(--muted);font-size:14px">${esc(c.house)} · ${esc(famLabel(c.family))} · ≈ ${c.price} €</p>${window.DESC && window.DESC[c.name] ? `<p class="rd">${esc(window.DESC[c.name][1])}</p>` : (r.pitch ? `<p class="rd">${esc(r.pitch)}${r.diff ? ' ' + esc(r.diff) + '.' : ''}</p>` : '')}</div>
      <ul style="margin:0;padding-left:18px;font-size:14px">${reasons.slice(0, 2).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
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
  function closeSheet() { const sh = $('#sheet'); sh.hidden = true; sh.innerHTML = ''; if ($('#story').hidden) document.body.style.overflow = ''; }

  function openDetail(id) {
    const p = find(id); if (!p) return;
    const pn = openSheet(`
      <div class="big-bottle"><i class="aura" style="background:${tint(p)}"></i>${fxCanvas(`data-p="${p.id}"`, 1)}${bt(p, { spray: true })}</div>
      <div><h2>${esc(p.name)}</h2><p class="mono" style="margin-top:6px">${esc(p.house)} · ${esc(famLabel(p.family))}</p></div>
      ${(() => { const d = window.DESC && window.DESC[p.name], n = noseOf(p.name, p.house).slice(0, 3).join(', '); return d || n ? `<p class="rd">${d ? esc(d[1]) : ''}${n ? ` <span class="mono" style="text-transform:none;letter-spacing:0">Créé par ${esc(n)}.</span>` : ''}</p>` : ''; })()}
      <div class="chips">${(p.notes || []).map((n) => `<span class="chip">${esc(n)}</span>`).join('')}</div>
      <div class="card" style="display:grid;gap:8px"><div class="meter"><span>Projection</span>${dots(p.projection)}</div><div class="meter"><span>Tenue</span>${dots(p.longevity)}</div><div class="meter"><span>Poids</span>${dots(p.weight)}</div></div>
      <div><p class="mono">ma note</p><div class="stars" id="stars">${[1, 2, 3, 4, 5].map((i) => `<button data-r="${i}" aria-label="${i} sur 5">${i <= p.rating ? '★' : '☆'}</button>`).join('')}</div></div>
      <p style="color:var(--muted)">${esc(ago(daysSince(p.id)))} · ${wears(p.id)} port${wears(p.id) > 1 ? 's' : ''}${p.price ? ' · ≈ ' + p.price + ' €' : ''}${p.price && wears(p.id) ? ' · ≈ ' + (p.price / wears(p.id)).toFixed(1).replace('.', ',') + ' € / port' : ''}</p>
      <p class="mono" style="text-transform:none;letter-spacing:0">${IC.spark} Ambiance : ${esc(FX.motifsOf(p).label)}${FX.motifsOf(p).notes.length ? ' · inspirée de ' + esc(FX.motifsOf(p).notes.join(', ')) : ''}</p>
      <div class="row" style="gap:14px">${buyLinks(p.name, p.house)}${HAS_ASSETS ? `<button class="ghost" id="phBtn">${p.img ? 'Changer la photo' : 'Ajouter cette photo'}</button>${p.img ? '<button class="ghost" id="phDel">Retirer la photo</button>' : ''}<input type="file" id="phIn" accept="image/*" hidden>` : ''}</div>
      ${(() => { const notes = S.log.filter((l) => l.id === p.id && (l.note || l.compl || l.dur)).slice(-3).reverse(); return notes.length ? `<div><p class="mono">Journal</p>${notes.map((l) => `<p style="font-size:14px;color:var(--muted);margin-top:6px">${esc(new Date(l.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }))} · ${esc([l.compl ? l.compl + ' compliment(s)' : '', l.dur || '', l.note || ''].filter(Boolean).join(' · '))}</p>`).join('')}</div>` : ''; })()}
      ${p.incomplete ? `<div class="card" style="display:grid;gap:10px"><p class="mono">Fiche à compléter</p><p style="font-size:14px;color:var(--muted)">Les notes ne sont jamais devinées : tant que la fiche est vide, je ne peux pas l\'utiliser dans mes conseils. Donne-moi le nom exact et l\'IA remplit les vraies notes.</p><input type="text" id="fixin" value="${esc(p.name || '')}" placeholder="Nom exact du parfum"><button class="cta" id="fixgo"><span>Compléter avec l'IA</span></button><p class="mono" id="fixmsg" style="text-transform:none"></p></div>` : ''}
      <div class="card" style="display:grid;gap:10px"><b>Mon flacon</b>${stockHtml(p, 0)}<p class="mono" id="stkmsg" style="text-transform:none;letter-spacing:0">Je tiens compte de ton stock : un échantillon ou un flacon presque fini ne part pas en usage quotidien.</p></div>
      <p class="mono" id="phMsg" style="text-transform:none"></p>
      <div class="row"><button class="ghost" id="sx">Fermer</button><button class="ghost danger" id="sdel">Retirer</button></div>`);
    mountFx(pn);
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
      <button class="opt" data-add="base"><b>Choisir dans la base</b><span>Plus de 2 800 parfums, par maison, style, notes ou prix. Avec photos.</span></button>
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
  const noseRow = (attr, list) => `<div class="xpop noserow">${list.map((n) => `<button type="button" class="xp nz" ${attr}="${esc(n)}">${noseAv(n)}<b>${esc(n)}</b><small>${noseCount(n)}+ parfums</small></button>`).join('')}</div>`;
  let DBL = null;
  const EDS = new Set(window.EDITIONS || []), gdOf = (n, h) => (window.genderOf ? window.genderOf(n, h) : 'u');
  const GEN_L = [['', 'Tous'], ['f', 'Féminin'], ['m', 'Masculin'], ['u', 'Mixte']];
  function dbList() {
    if (DBL && DBL.n === CAT.length) return DBL.l;
    const out = [], seen = new Set(), HA = window.HOUSE_ALIAS || {}, ch = (h) => (h && HA[E.norm(h)]) || h, tg = window.tagsOf || (() => []), noses = noseOf;
    CAT.forEach((c) => { if (!c.name || !c.house) return; const h = ch(c.house); seen.add(E.norm(h + ' ' + c.name)); out.push({ g: gdOf(c.name, h), ed: false, name: c.name, house: h, conc: '', cat: c, family: c.family, notes: c.notes || [], price: c.price || 0, noses: noses(c.name, h), guess: false, tags: tg(c.name, h, c.price || 0, '') }); });
    (window.INDEX || []).forEach(([h, arr]) => arr.forEach(([n, conc, fl]) => { const k = E.norm(h + ' ' + n); if (seen.has(k)) return; seen.add(k); const fk = (window.FACTS || {})[E.norm(h) + '|' + E.norm(n)], fn = fk && fk.n && fk.n.length >= 3 ? fk.n : null, dv = fn ? E.derive({ name: n, house: h, notes: fn }) : null; out.push({ g: gdOf(n, h), ed: EDS.has(E.norm(h) + '|' + E.norm(n)), name: n, house: h, conc, cat: null, family: dv ? dv.family : null, notes: fn || [], weight: dv ? dv.weight : 0, projection: dv ? dv.projection : 0, longevity: dv ? dv.longevity : 0, price: 0, noses: noses(n, h), guess: false, real: !!fn, tags: tg(n, h, 0, fl) }); }));
    DBL = { n: CAT.length, l: out }; return out;
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
  // mountExplorer : le même explorateur sert à l'ajout en collection, à la wishlist et à l'inscription.
  function mountExplorer(host, o) {
    const sel = new Map(); let facet = 'brand', group = null, q = '', limit = 60, gen = '';
    // Les rééditions (collector, limited, millésimes…) restent dans la fiche d'un nez, mais ne polluent pas les listes ; le filtre féminin / masculin / mixte s'applique partout.
    const view = (L, withEd) => L.filter((e) => (withEd || !e.ed) && (!gen || e.g === gen));
    const haveIt = (e) => (o.mode === 'wish' ? S.wishlist : S.collection).some((p) => E.norm(p.name) === E.norm(e.name));
    const sub = (e) => [e.house, e.family ? (e.guess ? '≈ ' : '') + famLabel(e.family) : '', e.conc && e.conc !== 'EDP' ? e.conc.split(',').map((x) => CONC_L[x] || x).join('/') : '', e.price ? '≈ ' + e.price + ' €' : ''].filter(Boolean).join(' · ');
    const card = (e, i) => { const k = entryKey(e), have = haveIt(e), on = sel.has(k), d = window.DESC && window.DESC[e.name];
      return `<button type="button" class="xc ${on ? 'on' : ''}" data-xk="${esc(k)}" ${have ? 'disabled' : ''}>${xThumb(e)}<span class="xt"><b>${esc(e.name)}</b><small>${esc(sub(e))}</small>${d && e.cat ? `<em>${esc(d[1])}</em>` : ''}${tagPills(e)}</span><i class="xm">${have ? '✓ ' + (o.mode === 'wish' ? 'dans ta wishlist' : 'chez toi') : on ? '✓' : '+'}</i></button>`; };
    const popular = () => { const names = Object.keys(window.DESC || {}), L = dbList(), by = new Map(L.filter((e) => e.cat).map((e) => [e.name, e])); return names.map((n) => by.get(n)).filter(Boolean).sort((a, b) => (imgOf(b) ? 1 : 0) - (imgOf(a) ? 1 : 0)).slice(0, 24); };
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
          if (facet === 'brand') inner += `<p class="mono">Les incontournables</p><div class="xpop">${popular().map((e) => { const k = entryKey(e), on = sel.has(k); return `<button type="button" class="xp ${on ? 'on' : ''}" data-xk="${esc(k)}" ${haveIt(e) ? 'disabled' : ''}>${xThumb(e)}<b>${esc(e.name)}</b><small>${esc(e.house)}</small></button>`; }).join('')}</div><p class="mono">Toutes les maisons · ${gs.length}</p>`;
          else if (facet === 'style' || facet === 'note') inner += `<p class="mono" style="text-transform:none;letter-spacing:0">${facet === 'style' ? 'Pour les parfums sans fiche détaillée, le style est déduit du nom (≈).' : 'Notes des fiches détaillées, ou lues dans le nom du parfum.'}</p>`;
          else if (facet === 'tag') inner += '<p class="mono" style="text-transform:none;letter-spacing:0">Abordable, niche, designer, luxe, collection privée… pour trier d\'un coup d\'œil.</p>';
          else if (facet === 'price') inner += '<p class="mono" style="text-transform:none;letter-spacing:0">Prix indicatifs d\'un flacon standard, pour les parfums avec fiche détaillée.</p>';
          else inner += `<p class="mono">Les nez les plus connus</p>${noseRow('data-xn', (window.NOSE_TOP || []).filter((n) => gs.some((g) => g.label === n)))}<p class="mono">Tous les parfumeurs · ${gs.length}</p>`;
          inner += `<div class="chips xg">${gs.map((g) => `<button type="button" class="chip" data-xg="${esc(g.key)}">${esc(g.label)} <small style="color:var(--muted)">${g.items.length}</small></button>`).join('') || '<span class="mono">Rien ici pour l\'instant</span>'}</div>`;
        } else {
          const g = gs.find((x) => x.key === group); const items = g ? g.items.slice().sort((a, b) => (imgOf(b) ? 1 : 0) - (imgOf(a) ? 1 : 0) || (b.cat ? 1 : 0) - (a.cat ? 1 : 0) || a.name.localeCompare(b.name, 'fr')) : [];
          inner += `<div class="row xback"><button type="button" class="ghost" id="xback">← ${tabs.find((t) => t[0] === facet)[1]}</button><b>${esc(g ? g.label : '')}</b><span class="mono">${items.length}</span></div>${facet === 'nose' && g ? noseCard(g.label) : ''}<div class="xgrid">${items.slice(0, limit).map(card).join('')}</div>${items.length > limit ? '<button type="button" class="ghost" id="xmore">Voir plus</button>' : ''}`;
        }
      }
      host.innerHTML = `<div class="exp"><div><h2>${esc(o.title)}</h2><p style="color:var(--muted);margin-top:6px">${esc(o.sub)}</p></div><input type="search" id="xq" placeholder="Rechercher un parfum ou une maison" value="${esc(q)}" autocomplete="off" aria-label="Rechercher"><div class="chips xgen" role="group" aria-label="Pour qui">${GEN_L.map(([k, l]) => `<button type="button" class="chip ${gen === k ? 'on' : ''}" data-xgen="${k}">${l}</button>`).join('')}</div><div id="xbody">${inner}</div>${o.free ? `<button type="button" class="linkbtn" id="xfree">${esc(o.free)}</button>` : ''}${o.skip ? `<button type="button" class="ghost" id="xskip">${esc(o.skip)}</button>` : ''}${foot()}</div>`;
      bind();
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
    return `<button type="button" class="xc" data-ent="${esc(entryKey(e))}">${xThumb(e)}<span class="xt"><b>${esc(e.name)}</b><small>${esc([e.house, e.family ? (e.guess ? '≈ ' : '') + famLabel(e.family) : '', e.conc && e.conc !== 'EDP' ? e.conc.split(',').map((x) => CONC_L[x] || x).join('/') : '', e.price ? '≈ ' + e.price + ' €' : ''].filter(Boolean).join(' · '))}</small>${d && e.cat ? `<em>${esc(d[1])}</em>` : ''}${tagPills(e)}</span><i class="xm">${inCol ? '✓ chez toi' : inW ? '♡ wishlist' : '›'}</i></button>`;
  }
  function drawSearchResults() {
    const r = filterDb(), box = $('#sres'); if (!box) return;
    $('#scount').textContent = r.length + ' parfum' + (r.length > 1 ? 's' : '');
    box.innerHTML = r.length ? `<div class="xgrid">${r.slice(0, SRCH.limit).map(rowCard).join('')}</div>${r.length > SRCH.limit ? '<button type="button" class="ghost" id="smore">Voir plus</button>' : ''}` : '<div class="empty">Aucun parfum ne correspond. Enlève un filtre ou change les mots.</div>';
    const look = {}; dbList().forEach((e) => { look[entryKey(e)] = e; });
    $$('[data-ent]', box).forEach((b) => (b.onclick = () => { const e = look[b.dataset.ent]; if (e) openEntry(e); }));
    if ($('#smore', box)) $('#smore', box).onclick = () => { SRCH.limit += 40; drawSearchResults(); };
  }
  const NEED = { q: '', n: 8 };
  const NEED_EX = ['frais pour le bureau en été', 'vanille sans patchouli pour l\'hiver', 'cuir fumé pour homme', 'rose poudrée', 'premier rendez-vous, pas trop sucré', 'boisé discret moins de 100 €'];
  function drawNeed() {
    const box = $('#nres'); if (!box) return;
    const need = E.parseNeed(NEED.q);
    if (!NEED.q.trim()) { box.innerHTML = '<p style="font-size:14px;color:var(--muted)">Décris l\'occasion, la saison, les notes que tu veux ou fuis, le budget : je cherche dans toute la base, sur de vraies notes, et je te dis pourquoi.</p>'; return; }
    if (need.empty) { box.innerHTML = '<p style="font-size:14px;color:var(--muted)">Je n\'ai pas compris le besoin. Essaie avec une occasion (bureau, date), une saison, une note (vanille, rose) ou une famille (boisé, frais).</p>'; return; }
    const g = S.profile && S.profile.gender, res = E.searchNeed(needPool(), need, Object.assign({}, S.settings, { gender: g }), NEED.n);
    const lookup = {}; dbList().forEach((e) => { lookup[entryKey(e)] = e; });
    box.innerHTML = `<p class="mono" style="text-transform:none;letter-spacing:0">${esc(E.needLabel(need) || 'Besoin compris')} · ${res.length} résultat${res.length > 1 ? 's' : ''}</p>` + (res.length ? `<div class="xgrid">${res.map((r) => { const e = r.c.entry || lookup[E.norm(r.c.house + ' ' + r.c.name)] || { name: r.c.name, house: r.c.house, family: r.c.family, notes: r.c.notes, price: r.c.price, tags: [], cat: r.c }; return `<button type="button" class="xc" data-ent="${esc(entryKey(e))}">${xThumb(e)}<span class="xt"><b>${esc(e.name)}</b><small>${esc([e.house, e.family ? famLabel(e.family) : '', e.price ? '≈ ' + e.price + ' €' : ''].filter(Boolean).join(' · '))}</small><em>${esc(r.m.why.join(' · '))}</em>${r.m.pitch ? `<em>${esc(r.m.pitch)}</em>` : ''}</span><i class="xm">${r.m.pct} %</i></button>`; }).join('')}</div>${NEED.n <= res.length ? '<button type="button" class="ghost" id="nmore">Voir plus</button>' : ''}` : '<div class="empty">Rien ne correspond vraiment. Enlève une contrainte (budget, note fuie) ou élargis le besoin.</div>');
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
    drawSearchResults();
  }
  // Fiche d'un parfum de la base : description, tags, notes, et les actions (collection, wishlist)
  // Pyramide olfactive (tête, cœur, fond) quand la fiche est détaillée.
  const pyramidOf = (e) => { const y = (window.PYRAMID || {})[E.norm(e.house) + '|' + E.norm(e.name)]; if (!y) return ''; const col = (l, a) => (a && a.length ? `<div><p class="mono">${l}</p><p class="pyn">${a.map(esc).join(' · ')}</p></div>` : ''); return `<div class="pyr3">${col('Tête', y.t)}${col('Cœur', y.h)}${col('Fond', y.b)}</div>`; };
  function openEntry(e) {
    const inCol = S.collection.some((p) => E.norm(p.name) === E.norm(e.name)), inW = hasWish(e.name), d = window.DESC && window.DESC[e.name];
    const pn = openSheet(`
      <div class="big-bottle">${bt({ name: e.name, house: e.house, family: e.family || 'boisé', id: 'e' + E.norm(e.name).length }, { spray: true })}</div>
      <div><h2>${esc(e.name)}</h2><p class="mono" style="margin-top:6px">${esc(e.house)}${e.family ? ' · ' + (e.guess ? '≈ ' : '') + esc(famLabel(e.family)) : ''}${e.conc ? ' · ' + esc(e.conc.split(',').map((x) => CONC_L[x] || x).join(' / ')) : ''}</p></div>
      ${(e.tags || []).length ? `<div class="chips">${e.tags.map((t) => `<span class="chip">${esc((window.TAGS || {})[t] || t)}</span>`).join('')}</div>` : ''}
      ${d ? `<p class="rd">${esc(d[1])}</p>` : ''}
      ${pyramidOf(e)}
      ${(e.notes || []).length && !pyramidOf(e) ? `<div class="chips">${e.notes.map((n) => `<span class="chip">${esc(n)}</span>`).join('')}</div>` : ''}
      <p style="color:var(--muted);font-size:14px">${[e.price ? '≈ ' + e.price + ' € le flacon' : '', e.guess ? 'Fiche estimée d\'après le nom du parfum.' : ''].filter(Boolean).join(' · ')}</p>
      ${(e.noses || []).length ? `<div><p class="mono">Créé par</p><div class="chips" style="margin-top:8px">${e.noses.slice(0, 4).map((n) => `<button class="chip" data-nz="${esc(n)}">${esc(n)}</button>`).join('')}</div>${e.noses.length >= 3 ? '<p class="mono" style="text-transform:none;letter-spacing:0;margin-top:8px">Plusieurs nez sont cités pour ce parfum : les sources divergent.</p>' : ''}</div>` : ''}
      <div class="row">${inCol ? '<span class="mono">Dans ta collection ✓</span>' : '<button class="cta" id="eown"><span>Je l\'ai</span></button>'}${inW ? '<span class="mono">Dans ta wishlist ♡</span>' : '<button class="ghost" id="ewish">À sentir</button>'}<button class="ghost" id="ex">Fermer</button></div>
      ${buyLinks(e.name, e.house)}`);
    $('#ex', pn).onclick = closeSheet;
    $$('[data-nz]', pn).forEach((b) => (b.onclick = () => { SRCH.nose = b.dataset.nz; closeSheet(); tab = 'search'; render(); }));
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
    const pn = openSheet(`<div><h2>Profil</h2></div>
      <div class="card" style="display:grid;gap:10px"><b>Moi</b><div class="chips" id="pgen">${GEN.map(([k, l]) => `<button class="chip ${pf.gender === k ? 'on' : ''}" data-pg="${k}">${l}</button>`).join('')}</div>
        <input type="text" id="pname" maxlength="24" value="${esc(pf.name || '')}" placeholder="Mon prénom" aria-label="Mon prénom">
        <input type="text" id="page" inputmode="numeric" maxlength="2" value="${pf.age || ''}" placeholder="Mon âge" aria-label="Mon âge"><p class="mono" id="pmsg" style="text-transform:none;letter-spacing:0">Enregistré automatiquement, utilisé chaque jour. Ta tenue, je te la demande quand tu cherches ton parfum.</p></div>
      ${window.SillageDemo ? (window.SillageDemo.account.loggedIn() ? `<div class="card" style="display:grid;gap:10px"><b>Mon compte</b><p class="mono" style="text-transform:none;letter-spacing:0">Connecté : ${esc(window.SillageDemo.account.email())}. Ton profil est sauvegardé automatiquement.</p><div class="row"><button class="ghost" id="alogout">Me déconnecter</button><button class="ghost danger" id="adel">Supprimer mon compte</button></div></div>` : `<div class="card" style="display:grid;gap:10px"><b>Mon compte</b><p class="mono" style="text-transform:none;letter-spacing:0">Crée un compte pour garder ton profil, ta collection et ta wishlist sur tous tes appareils.</p><button class="cta" id="acreate"><span>Créer un compte ou me connecter</span></button></div>`) : ''}
      <div class="card" style="display:grid;gap:8px"><b>Notes que j'adore</b><input type="text" id="liked" value="${esc(s.liked.join(', '))}" placeholder="vanille, oud, bergamote"><b style="margin-top:6px">Notes que je fuis</b><input type="text" id="avoid" value="${esc(s.avoid.join(', '))}" placeholder="patchouli, aldéhydes"><button class="ghost" id="savepref" style="justify-self:start">Enregistrer</button></div>
      <div class="card" style="display:grid;gap:10px"><b>Sauvegarde</b><div class="row"><button class="ghost" id="exp">Exporter en texte</button><button class="ghost" id="imp">Importer</button></div><textarea id="io" rows="3" placeholder="Le texte de sauvegarde apparaît ici, ou colle-le pour importer"></textarea><p class="mono" id="iomsg" style="text-transform:none"></p></div>
      <div class="row"><button class="ghost danger" id="reset">Tout vider</button></div>`);
    const pmsg = () => { $('#pmsg', pn).textContent = 'Enregistré ✓'; };
    $$('[data-pg]', pn).forEach((b) => (b.onclick = () => { setProfile({ gender: b.dataset.pg }); $$('[data-pg]', pn).forEach((x) => x.classList.toggle('on', x === b)); pmsg(); }));
    $('#page', pn).onchange = () => { setProfile({ age: cleanAge($('#page', pn).value) }); pmsg(); };
    $('#pname', pn).onchange = () => { setProfile({ name: $('#pname', pn).value.trim().slice(0, 24) }); pmsg(); };
    if ($('#acreate', pn)) $('#acreate', pn).onclick = () => { closeSheet(); showAccount('profile'); };
    if ($('#alogout', pn)) $('#alogout', pn).onclick = async () => { await window.SillageDemo.account.logout(); if (needAcct()) afterLeave(); else { closeSheet(); render(true); } };
    if ($('#adel', pn)) $('#adel', pn).onclick = async (e) => { if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = 'Confirmer la suppression'; return; } try { await window.SillageDemo.account.remove(); } catch (er) { /* déjà supprimé */ } if (needAcct()) afterLeave(); else { closeSheet(); render(true); } };
    $('#savepref', pn).onclick = (e) => { const sp = (v) => v.split(',').map((x) => x.trim()).filter(Boolean); S.settings.liked = sp($('#liked', pn).value); S.settings.avoid = sp($('#avoid', pn).value); save(); e.target.textContent = 'Enregistré ✓'; };
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
    if (/compliment/.test(t)) c.want = 'compliments'; else if (/plaire.*fille|seduire.*fille/.test(t)) c.want = 'plaire_f'; else if (/plaire.*garcon|seduire.*garcon/.test(t)) c.want = 'plaire_g'; else if (/discret/.test(t)) c.want = 'discret';
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
  function viewWish() {
    S.wishlist.forEach((w) => { if (!w.st) w.st = 'smell'; });
    const all = S.wishlist, L = all.filter((w) => w.st === WTAB), nS = all.filter((w) => w.st === 'smell').length, nD = all.length - nS, total = all.filter((w) => w.st === 'smell').reduce((a, w) => a + (w.price || 0), 0);
    const line = (w) => { const d = window.DESC && window.DESC[w.name]; return d ? `<em class="wd">${esc(d[1])}</em>` : ''; };
    $('#view').innerHTML = `
      <section class="sec"><header><h2>Wishlist</h2><span class="mono">${all.length} parfum${all.length > 1 ? 's' : ''}${total ? ' · ≈ ' + total + ' €' : ''}</span></header>
        <div class="chips wtabs"><button class="chip ${WTAB === 'smell' ? 'on' : ''}" data-wt="smell">À sentir · ${nS}</button><button class="chip ${WTAB === 'smelled' ? 'on' : ''}" data-wt="smelled">Senti · ${nD}</button></div>
        <button class="cta full" id="wexp"><span>Explorer la base</span></button>
        <details class="wname"><summary class="mono">Ou ajouter par son nom</summary><div class="card ask-card"><input type="text" id="wlin" placeholder="Nom du parfum, l'IA complète la fiche"><button class="cta" id="wlgo"><span>Ajouter</span></button><p class="mono" id="wlmsg" style="text-transform:none"></p></div></details></section>
      <section class="sec">${L.length ? L.map((w, i) => `<article class="wl" style="--i:${i}">${bt(w, { still: true })}<div class="wlb"><b>${esc(w.name)}</b><small>${esc(w.house)}${w.family ? ' · ' + esc(famLabel(w.family)) : ''}${w.price ? ' · ≈ ' + w.price + ' €' : ''}</small>${line(w)}
        ${WTAB === 'smell' ? `<div class="row" style="margin-top:10px"><button class="ghost" data-wsm="${esc(w.name)}">Je l'ai senti</button><button class="ghost" data-wown="${esc(w.name)}">Je l'ai</button><button class="ghost" data-wrm="${esc(w.name)}">Retirer</button></div>${buyLinks(w.name, w.house)}`
          : `<div class="chips" style="margin-top:10px">${Object.entries(VERDICT).map(([k, v]) => `<button class="chip ${w.verdict === k ? 'on' : ''}" data-wv="${k}" data-n="${esc(w.name)}">${v}</button>`).join('')}</div><div class="row" style="margin-top:10px"><button class="ghost" data-wown="${esc(w.name)}">Je l'ai pris</button><button class="ghost" data-wre="${esc(w.name)}">À re-sentir</button><button class="ghost" data-wrm="${esc(w.name)}">Retirer</button></div>${w.verdict === 'love' ? buyLinks(w.name, w.house) : ''}`}</div></article>`).join('') : `<div class="empty">${WTAB === 'smell' ? 'Rien à sentir pour l\'instant. Explore la base, ou ajoute un parfum que tu veux essayer.' : 'Tu n\'as encore rien senti. Quand tu passes devant un parfum, note ce que tu en as pensé ici.'}</div>`}</section>
      ${wishTaste()}${lexCard()}`;
    const byName = (n) => S.wishlist.find((x) => x.name === n);
    $$('[data-wt]').forEach((b) => (b.onclick = () => { WTAB = b.dataset.wt; viewWish(); }));
    $('#wexp').onclick = () => openExplore('wish');
    $$('[data-wrm]').forEach((b) => (b.onclick = () => { rmWish(b.dataset.wrm); viewWish(); }));
    $$('[data-wsm]').forEach((b) => (b.onclick = () => { const w = byName(b.dataset.wsm); if (w) { w.st = 'smelled'; save(); WTAB = 'smelled'; viewWish(); } }));
    $$('[data-wre]').forEach((b) => (b.onclick = () => { const w = byName(b.dataset.wre); if (w) { w.st = 'smell'; delete w.verdict; save(); WTAB = 'smell'; viewWish(); } }));
    $$('[data-wv]').forEach((b) => (b.onclick = () => { const w = byName(b.dataset.n); if (w) { w.verdict = w.verdict === b.dataset.wv ? '' : b.dataset.wv; save(); viewWish(); } }));
    $$('[data-wown]').forEach((b) => (b.onclick = () => { const w = byName(b.dataset.wown); if (w) { S.collection.push(wishToOwned(w)); rmWish(w.name); viewWish(); } }));
    bindLex();
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
  // Un mot, une astuce ou un peu d'histoire : une carte par jour, sans en faire trop.
  let LEXI = null;
  function lexCard() {
    const L = window.LEX || []; if (!L.length) return '';
    if (LEXI == null) LEXI = Math.floor(Date.now() / 864e5) % L.length;
    const [k, t, x] = L[LEXI % L.length];
    return `<section class="sec"><div class="card lex"><p class="mono">${k === 'Mot' ? 'Un mot de parfumeur' : k === 'Astuce' ? 'Une astuce' : 'Un peu d\'histoire'}</p><h3>${esc(t)}</h3><p>${esc(x)}</p><button class="linkbtn" data-lex>Un autre</button></div></section>`;
  }
  function bindLex() { $$('[data-lex]').forEach((b) => (b.onclick = () => { LEXI = (LEXI + 1) % (window.LEX || [1]).length; if (tab === 'wish') viewWish(); else viewTips(); })); }

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
  let WALK = null, WSEG = 'list', WPEND = null, WRATE = 'ok', WFIND = null;
  const walkDate = (w) => new Date(w.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const nextSym = (w) => { const used = new Set(w.entries.map((e) => e.sym)); for (let i = 0; i < SYMS.length; i++) if (!used.has(i)) return i; return w.entries.length % SYMS.length; };

  function viewWalk() {
    const w = S.walks.find((x) => x.id === WALK);
    if (!w) {
      $('#view').innerHTML = `
        <section class="sec"><header><h2>Balade olfactive</h2></header>
          <p style="color:var(--muted)">Tu testes des parfums en boutique ? Photographie ou note chaque touche : je te donne un symbole à dessiner dessus pour savoir, plus tard, quelle touche est quel parfum.</p>
          <button class="cta full" id="wNew"><span>Commencer une balade</span></button></section>
        ${S.walks.length ? `<section class="sec"><header><h2 style="font-size:20px">Tes balades</h2></header>${[...S.walks].reverse().map((x) => `<button class="wcard" data-w="${x.id}"><span><b>${esc(x.place || 'Balade')}</b><small>${esc(walkDate(x))} · ${x.entries.length} touche${x.entries.length > 1 ? 's' : ''}</small></span><span class="symrow">${x.entries.slice(0, 7).map((e) => symSvg(e.sym, 22)).join('')}</span></button>`).join('')}</section>` : ''}`;
      $('#wNew').onclick = () => {
        const pn = openSheet(`<div><h2>Nouvelle balade</h2><p style="color:var(--muted);margin-top:6px">Où testes-tu aujourd'hui ?</p></div><input type="text" id="wplace" placeholder="Rue Saint-Honoré, Marais… (facultatif)"><button class="cta full" id="wgo2"><span>C'est parti</span></button>`);
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
        <input type="text" id="wname" placeholder="Nom du parfum, ou prends-le en photo">
        <textarea id="wnote" rows="2" placeholder="Ce que tu sens : ouverture, cœur, ce que ça évoque…"></textarea>
        <div class="chips" id="wrate">${Object.entries(RATE).map(([k, v]) => `<button class="chip ${WRATE === k ? 'on' : ''}" data-r="${k}">${v}</button>`).join('')}</div>
        <div class="row"><button class="chip photo-btn" id="wph">${WPEND && WPEND.file ? `<img alt="" src="${URL.createObjectURL(WPEND.file)}">` : IC.cam}<span>${WPEND && WPEND.file ? 'Photo ajoutée' : 'Photographier le flacon'}</span></button><input type="file" id="wphin" accept="image/*" capture="environment" hidden></div>
        <p class="mono" id="wai" style="text-transform:none;letter-spacing:0"></p>
        <button class="cta full" id="wAdd"><span>Enregistrer la touche</span></button></div></section>
      ${n ? `<div class="seg" id="wseg"><button data-s="list" class="${WSEG === 'list' ? 'on' : ''}">Mes touches</button><button data-s="find" class="${WSEG === 'find' ? 'on' : ''}">Retrouver une touche</button></div>` : ''}
      <section class="sec" style="margin-top:14px" id="wbody">${WSEG === 'find' && n ? walkFind(w) : [...w.entries].reverse().map((e) => walkEntry(e)).join('')}</section>
      ${n ? `<section class="sec"><button class="ghost" id="wSum" style="justify-self:start">Faire le bilan de la balade</button><div id="wsumres" style="display:grid;gap:12px"></div></section>` : ''}`;
    $('#wBack').onclick = () => { WALK = null; WPEND = null; viewWalk(); };
    $$('#wrate .chip').forEach((c) => (c.onclick = () => { WRATE = c.dataset.r; $$('#wrate .chip').forEach((x) => x.classList.toggle('on', x === c)); }));
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
      const name = $('#wname').value.trim(), note = $('#wnote').value.trim(), info = (WPEND && WPEND.info) || {};
      if (!name && !note && !(WPEND && WPEND.file)) { $('#wname').focus(); return; }
      const nm = name || info.name || 'Sans nom', c = CAT.find((x) => E.norm(x.name) === E.norm(nm));
      const e = { id: uid(), sym: nextSym(w), name: nm, house: (c && c.house) || info.house || '', family: (c && c.family) || info.family || '', notes: (c && [...c.notes]) || (info.notes || []).map(String), note, rating: WRATE, date: today() };
      $('#wAdd').disabled = true;
      if (WPEND && WPEND.file && HAS_ASSETS) { try { e.photo = await putPhoto(WPEND.file); } catch (er) { /* sans photo */ } }
      w.entries.push(e); save(); WPEND = null; WRATE = 'ok'; WSEG = 'list'; viewWalk();
    };
    if ($('#wseg')) $$('#wseg button').forEach((b) => (b.onclick = () => { WSEG = b.dataset.s; WFIND = null; viewWalk(); }));
    if ($('#wSum')) $('#wSum').onclick = () => walkSummary(w);
    walkBind(w);
  }
  function walkEntry(e) {
    return `<article class="wentry"><div class="wsym">${symSvg(e.sym, 40)}</div><div class="wbody"><div class="row" style="justify-content:space-between;gap:8px"><b>${esc(e.name)}</b><span class="tag">${esc(RATE[e.rating] || '')}</span></div>${e.house ? `<small>${esc(e.house)}${e.family ? ' · ' + esc(famLabel(e.family)) : ''}</small>` : ''}${e.notes && e.notes.length ? `<small>${esc(e.notes.slice(0, 6).join(' · '))}</small>` : ''}${e.note ? `<p>${esc(e.note)}</p>` : ''}
      <div class="row" style="margin-top:8px"><button class="ghost" data-wl="${e.id}">${hasWish(e.name) ? 'Dans la wishlist' : 'Wishlist'}</button><button class="ghost" data-we="${e.id}">Modifier</button></div></div>${e.photo ? `<img class="wthumb" alt="" src="/_blob/${esc(e.photo)}">` : ''}</article>`;
  }
  function walkFind(w) {
    const sel = w.entries.find((e) => e.id === WFIND);
    return `<p class="mono">Touche à la main ? Choisis le symbole que tu as dessiné.</p><div class="symgrid">${w.entries.map((e) => `<button class="symtile ${WFIND === e.id ? 'on' : ''}" data-f="${e.id}">${symSvg(e.sym, 44)}<small>${esc(SYMS[e.sym][0])}</small></button>`).join('')}</div>${sel ? walkEntry(sel) : ''}`;
  }
  function walkBind(w) {
    $$('[data-f]').forEach((b) => (b.onclick = () => { WFIND = b.dataset.f; viewWalk(); }));
    $$('[data-wl]').forEach((b) => (b.onclick = () => { const e = w.entries.find((x) => x.id === b.dataset.wl); if (!e) return; if (hasWish(e.name)) rmWish(e.name); else addWish(CAT.find((c) => E.norm(c.name) === E.norm(e.name)) ? wishFromName(CAT.find((c) => E.norm(c.name) === E.norm(e.name)).name) : e); viewWalk(); }));
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
  async function walkSummary(w) {
    const out = $('#wsumres'); out.innerHTML = '<div class="shim"></div><div class="shim" style="width:70%"></div>'; $('#wSum').disabled = true;
    const lines = w.entries.map((e) => `${e.name} | ${e.house} | ${e.notes.join(', ')} | ${RATE[e.rating]} | ${e.note || ''}`).join('\n');
    try {
      const j = await aiJson(`Tu es un nez de parfumerie. Voici les parfums que j'ai sentis pendant une balade en boutique (nom | maison | notes | mon avis | ma remarque) :\n${lines}\n\nMa collection actuelle :\n${colLines()}\n\nRéponds UNIQUEMENT par un JSON : {"taste":"ce que mes avis révèlent de mes goûts, 2 phrases, tutoiement","keep":[{"name":"nom exact d'une touche à retenir","why":"pourquoi, 10 mots max"}],"skip":"ce que je peux oublier, 1 phrase"}`, { modelTier: 'default' });
      const keep = (j.keep || []).map((k) => ({ k, e: w.entries.find((e) => E.norm(e.name) === E.norm(k.name)) })).filter((x) => x.e);
      out.innerHTML = `<p style="font-size:17px;font-weight:300">${esc(j.taste || '')}</p>${keep.map((x) => `<div class="wentry"><div class="wsym">${symSvg(x.e.sym, 32)}</div><div class="wbody"><b>${esc(x.e.name)}</b><small>${esc(x.k.why || '')}</small><div class="row" style="margin-top:8px"><button class="ghost" data-kw="${x.e.id}">${hasWish(x.e.name) ? 'Dans la wishlist' : 'Wishlist'}</button></div></div></div>`).join('')}${j.skip ? `<p class="mono" style="text-transform:none;letter-spacing:0">${esc(j.skip)}</p>` : ''}`;
      $$('[data-kw]', out).forEach((b) => (b.onclick = () => { const e = w.entries.find((x) => x.id === b.dataset.kw); addWish(CAT.find((c) => E.norm(c.name) === E.norm(e.name)) ? wishFromName(CAT.find((c) => E.norm(c.name) === E.norm(e.name)).name) : e); b.textContent = 'Dans la wishlist'; }));
    } catch (er) {
      const loved = w.entries.filter((e) => e.rating === 'love');
      out.innerHTML = `<p style="color:var(--muted)">${loved.length ? 'Tes coups de cœur : ' + esc(loved.map((e) => e.name).join(', ')) + '.' : 'Aucun coup de cœur noté pour l\'instant.'}</p>`;
    }
    $('#wSum').disabled = false;
  }


  // ---------- Profil : genre et façon de s'habiller (sauvegardé, réutilisé chaque jour) ----------
  const GEN = [['m', 'Un garçon'], ['f', 'Une fille'], ['x', 'Je préfère ne pas dire']];
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
  const TASTES = [['Frais, citronné', ['bergamote', 'citron', 'néroli']], ['Floral', ['rose', 'jasmin', 'iris']], ['Boisé', ['cèdre', 'santal', 'vétiver']], ['Vanillé, gourmand', ['vanille', 'tonka', 'caramel']], ['Épicé, ambré', ['poivre', 'cannelle', 'ambre']], ['Cuir, fumé', ['cuir', 'encens', 'tabac']], ['Musc, peau propre', ['musc']]];
  // Inscription en 5 temps : prénom, genre, âge, goûts, puis la collection choisie dans la base.
  function showProfile() {
    const d = Object.assign({ gender: '', age: null, name: '' }, hasProfile() ? S.profile : {}), taste = new Set(), N = 5;
    const el = document.createElement('div'); el.id = 'prof'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Faisons connaissance');
    let step = 1;
    const read = () => { if ($('#pName', el)) d.name = $('#pName', el).value.trim().slice(0, 24); if ($('#pAge', el)) d.age = cleanAge($('#pAge', el).value); };
    const draw = () => {
      const head = `<p class="mono">Faisons connaissance · ${step} / ${N}</p>`, back = step > 1 ? '<button class="ghost" id="pBack">Retour</button>' : '';
      if (step === 5) {
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
            : `<div class="prof-in">${head}<h2>Qu'est-ce qui te plaît&nbsp;?</h2><p class="soft">Choisis ce que tu aimes sentir, autant que tu veux. Je m'en servirai pour choisir.</p>
              <div class="chips">${TASTES.map(([l], i) => `<button class="chip ${taste.has(i) ? 'on' : ''}" data-t="${i}">${esc(l)}</button>`).join('')}</div>
              <button class="cta full" id="pNext"><span>Continuer</span></button>${back}</div>`;
      $$('[data-g]', el).forEach((b) => (b.onclick = () => { d.gender = b.dataset.g; $$('[data-g]', el).forEach((x) => x.classList.toggle('on', x === b)); }));
      $$('[data-t]', el).forEach((b) => (b.onclick = () => { const i = +b.dataset.t; if (taste.has(i)) taste.delete(i); else taste.add(i); b.classList.toggle('on', taste.has(i)); }));
      if ($('#pNext', el)) $('#pNext', el).onclick = () => { read(); step++; draw(); };
      if ($('#pBack', el)) $('#pBack', el).onclick = () => { read(); step--; draw(); };
      if ($('#pSkip', el)) $('#pSkip', el).onclick = () => end(true);
      if ($('#pName', el)) $('#pName', el).addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#pNext', el).click(); });
    };
    const end = (skip) => {
      read();
      if (skip) { S.profile = { skipped: true, ts: Date.now() }; save(); }
      else { setProfile(d); if (taste.size) { const add = [...taste].flatMap((i) => TASTES[i][1]); S.settings.liked = [...new Set([...(S.settings.liked || []), ...add])]; save(); } }
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
  $('#dock').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { tab = b.dataset.tab; render(); } });
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
