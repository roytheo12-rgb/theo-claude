(function () {
  'use strict';
  const E = window.Engine, CAT = window.CATALOG, Art = window.Art, FX = window.FX;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'sillage.v3';
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
  const SEED = [['Jazz Club', 4], ['Naxos', 5], ['Bois Impérial', 4], ['Myrrh & Tonka', 4], ['Sydney', 4]];
  const SEED13 = [['Shalimar', 4], ['J\'adore', 4], ['Dior Homme Intense', 4], ['Stronger With You Intensely', 4], ['Pure Musc Blanc', 4]];
  const SEED12 = [['Aqua Allegoria Rosa Verde', 4], ['Scandal By Night', 4], ['Paradoxe Intense', 4], ['Miss Dior Essence', 4], ['La Vie est Belle', 4]];
  const SEED11 = [['Boss Bottled', 4], ['Bleu de Chanel EDT', 4], ['Pour un Homme de Caron', 4], ['Terre d\'Hermès', 4], ['Flacon ailé', 4]];
  const SEED10 = [['Vétiver Extraordinaire', 4], ['De Los Santos', 4], ['Étoile Filante', 4], ['Lazy Sunday Morning', 4], ['Sauvage EDT', 4]];
  const SEED9 = [['Acne Studios', 4], ['Purpose', 4], ['Ambert Sunset', 4], ['Ambre Papier', 4], ['Ganymede', 4]];
  const SEED8 = [['Rouge Trafalgar', 4], ['L\'Eau Pâle', 4], ['Imagination', 4], ['Néroli Amara', 4], ['Ombre Nomade', 4]];
  const SEED7 = [['Stellar Times', 4], ['Radical Rose', 4]];
  const SEED6 = [['Musc Ravageur', 4], ['Portrait of a Lady', 4], ['Jasmin Rouge', 4], ['Tobacco Vanille', 5]];
  const SEED5 = [['Guidance 46', 4], ['Tuxedo', 4], ['Ambre Russe', 4], ['Tam Dao Eau de Parfum', 4], ['Fève Nectar', 4]];
  const SEED4 = [['Mojave Ghost Absolu', 4], ['Buongiorno Dolce Far Niente', 4], ['Straight to Heaven', 4], ['Nasaj', 4], ['Néroli Hasbaya', 4]];
  const SEED3 = [['Bianco Latte', 4], ['Fleur Narcotique', 4], ['Baccarat Rouge 540', 5], ['Gris Charnel Extrait', 4], ['Orphéon', 4]];
  const SEED2 = [['Black Afgano', 4], ['724', 4], ['The Musc', 4], ['Thé Noir 29', 4], ['Ella K', 4]];
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
    'Acne Studios': { s: 'img/acne.webp', nz: 3 }, 'Purpose': { s: 'img/purpose.webp', nz: 3 }, 'Ambert Sunset': { s: 'img/ambert.webp', nz: 3 }, 'Ambre Papier': { s: 'img/ambrepapier.webp', nz: 6 }, 'Ganymede': { s: 'img/ganymede.webp', nz: 3 },
    'Vétiver Extraordinaire': { s: 'img/vetiver.webp', nz: 26 }, 'De Los Santos': { s: 'img/delossantos.webp', nz: 3 }, 'Étoile Filante': { s: 'img/etoile.webp', nz: 3 }, 'Lazy Sunday Morning': { s: 'img/lazy.webp', nz: 2 }, 'Sauvage EDT': { s: 'img/sauvage.webp', nz: 3 },
    'Boss Bottled': { s: 'img/boss.webp', nz: 3 }, 'Bleu de Chanel EDT': { s: 'img/bleu.webp', nz: 3 }, 'Pour un Homme de Caron': { s: 'img/caron.webp', nz: 2 }, 'Terre d\'Hermès': { s: 'img/terre.webp', nz: 3 }, 'Flacon ailé': { s: 'img/ailes.webp', nz: 10 },
    'Aqua Allegoria Rosa Verde': { s: 'img/rosaverde.webp', nz: 8 }, 'Scandal By Night': { s: 'img/scandal.webp', nz: 6 }, 'Paradoxe Intense': { s: 'img/paradoxe.webp', nz: 12 }, 'Miss Dior Essence': { s: 'img/missessence.webp', nz: 10 }, 'La Vie est Belle': { s: 'img/lavie.webp', nz: 12 },
    'Shalimar': { s: 'img/shalimar.webp', nz: 4 }, 'J\'adore': { s: 'img/jadore.webp', nz: 3 }, 'Dior Homme Intense': { s: 'img/dhi.webp', nz: 6 }, 'Stronger With You Intensely': { s: 'img/swyi.webp', nz: 4 }, 'Pure Musc Blanc': { s: 'img/muscblanc.webp', nz: 5 },
  };
  const fromCat = (c, rating) => ({ id: uid(), name: c.name, house: c.house, family: c.family, notes: [...c.notes], projection: c.projection, longevity: c.longevity, weight: c.weight, price: c.price, rating: rating || 4, occ: [], src: (IMG[c.name] || {}).s, nz: (IMG[c.name] || {}).nz, incomplete: !c.notes.length || undefined });
  const seedList = (l) => l.map(([n, r]) => fromCat(CAT.find((c) => c.name === n), r));
  const DEF = () => ({ v: 3, seedV: 13, collection: seedList(SEED).concat(seedList(SEED2), seedList(SEED3), seedList(SEED4), seedList(SEED5), seedList(SEED6), seedList(SEED7), seedList(SEED8), seedList(SEED9), seedList(SEED10), seedList(SEED11), seedList(SEED12), seedList(SEED13)), wishlist: [], walks: [], log: [], settings: { budget: 220, liked: [], avoid: [] }, today: null });
  const wishFromName = (n) => { const c = CAT.find((x) => x.name === n); return c ? { name: c.name, house: c.house, family: c.family, notes: [...c.notes], price: c.price } : { name: n, house: '', family: '', notes: [], price: 0 }; };
  function migrate() {
    S.walks = S.walks || [];
    S.wishlist = (S.wishlist || []).map((w) => (typeof w === 'string' ? wishFromName(w) : w));
    S.collection.forEach((p) => { if (!p.src && IMG[p.name]) { p.src = IMG[p.name].s; p.nz = IMG[p.name].nz; } });
    if ((S.seedV || 1) < 2) { seedList(SEED2).forEach((p) => { if (!S.collection.some((x) => E.norm(x.name) === E.norm(p.name))) S.collection.push(p); }); S.seedV = 2; }
    if ((S.seedV || 1) < 3) { seedList(SEED3).forEach((p) => { if (!S.collection.some((x) => E.norm(x.name) === E.norm(p.name))) S.collection.push(p); }); S.seedV = 3; }
    if ((S.seedV || 1) < 4) { seedList(SEED4).forEach((p) => { if (!S.collection.some((x) => E.norm(x.name) === E.norm(p.name))) S.collection.push(p); }); S.seedV = 4; }
    if ((S.seedV || 1) < 5) { seedList(SEED5).forEach((p) => { if (!S.collection.some((x) => E.norm(x.name) === E.norm(p.name))) S.collection.push(p); }); S.seedV = 5; }
    if ((S.seedV || 1) < 6) { seedList(SEED6).forEach((p) => { if (!S.collection.some((x) => E.norm(x.name) === E.norm(p.name))) S.collection.push(p); }); S.seedV = 6; }
    if ((S.seedV || 1) < 7) { seedList(SEED7).forEach((p) => { if (!S.collection.some((x) => E.norm(x.name) === E.norm(p.name))) S.collection.push(p); }); S.seedV = 7; }
    if ((S.seedV || 1) < 8) { seedList(SEED8).forEach((p) => { if (!S.collection.some((x) => E.norm(x.name) === E.norm(p.name))) S.collection.push(p); }); S.seedV = 8; }
    if ((S.seedV || 1) < 9) { seedList(SEED9).forEach((p) => { if (!S.collection.some((x) => E.norm(x.name) === E.norm(p.name))) S.collection.push(p); }); S.seedV = 9; }
    if ((S.seedV || 1) < 10) { seedList(SEED10).forEach((p) => { if (!S.collection.some((x) => E.norm(x.name) === E.norm(p.name))) S.collection.push(p); }); S.seedV = 10; }
    if ((S.seedV || 1) < 11) { seedList(SEED11).forEach((p) => { if (!S.collection.some((x) => E.norm(x.name) === E.norm(p.name))) S.collection.push(p); }); S.seedV = 11; }
    if ((S.seedV || 1) < 12) { seedList(SEED12).forEach((p) => { if (!S.collection.some((x) => E.norm(x.name) === E.norm(p.name))) S.collection.push(p); }); S.seedV = 12; }
    if ((S.seedV || 1) < 13) { seedList(SEED13).forEach((p) => { if (!S.collection.some((x) => E.norm(x.name) === E.norm(p.name))) S.collection.push(p); }); S.seedV = 13; }
  }
  let S;
  try { S = Object.assign(DEF(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = DEF(); }
  S.settings = Object.assign(DEF().settings, S.settings);
  let dbDoc = null, saveT;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* stockage indisponible */ }
    clearTimeout(saveT);
    saveT = setTimeout(() => { if (dbDoc) dbDoc.set(JSON.parse(JSON.stringify(S))).catch(() => {}); }, 700);
  }
  async function initStore() {
    try {
      const c = window.claude; if (!c || !c.use) return;
      const [db, user] = await Promise.all([c.use('db'), c.use('user')]);
      if (!db || !user) return;
      const id = await user.id(); if (!id) return;
      dbDoc = db.doc('data/users/' + id + '/state');
      const snap = await dbDoc.get();
      if (snap.exists && snap.data() && snap.data().collection && snap.data().v === 3) {
        S = Object.assign(DEF(), JSON.parse(JSON.stringify(snap.data()))); S.settings = Object.assign(DEF().settings, S.settings); migrate(); save();
        try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ok */ }
        if (!$('#story') || $('#story').hidden) render(true);
      } else save();
    } catch (e) { /* on reste en local */ }
  }

  migrate();

  // ---------- Utilitaires métier ----------
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
    const im = p.src ? { s: p.src, nz: p.nz || 6 } : IMG[p.name];
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
  const addWish = (o) => { if (!hasWish(o.name)) { S.wishlist.push({ name: o.name, house: o.house || '', family: o.family || '', notes: o.notes || [], price: o.price || 0 }); save(); } };
  const rmWish = (name) => { S.wishlist = S.wishlist.filter((w) => E.norm(w.name) !== E.norm(name)); save(); };
  const wishToOwned = (w) => { const c = CAT.find((x) => E.norm(x.name) === E.norm(w.name)); if (c) return fromCat(c, 4); return { id: uid(), name: w.name, house: w.house, family: w.family || 'boisé', notes: [...(w.notes || [])], projection: 3, longevity: 3, weight: 3, price: w.price || 0, rating: 4, occ: [] }; };
  const buyLinks = (name, house) => { const q = encodeURIComponent(name + ' ' + house); return `<div class="buy"><a class="linkbtn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${q}+parfum+acheter">Où l'acheter</a><a class="linkbtn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${q}+site%3Afragrantica.com">Fragrantica</a></div>`; };
  const wears = (id) => S.log.filter((l) => l.id === id).length;
  const words = (t, base) => String(t || '').split(/\s+/).filter(Boolean).map((w, i) => `<span class="w" style="--i:${i};--d:${base || 0}">${esc(w)}</span>`).join(' ');
  const dots = (n) => '<span class="dots">' + [1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'f' : ''}"></i>`).join('') + '</span>';
  const colLines = () => S.collection.map((p) => `${p.id} | ${p.name} | ${p.house} | ${p.family} | ${(p.notes || []).join(', ')} | proj ${p.projection}/5 | tenue ${p.longevity}/5 | poids ${p.weight}/5 (1 léger, 5 dense) | ma note ${p.rating}/5 | ${ago(daysSince(p.id))}`).join('\n');

  // ---------- IA (sample) ----------
  let CAN_IMG = false, HAS_ASSETS = false, IMG_MAX = 4;
  async function getSample() { const c = window.claude; return c && c.use ? c.use('sample') : null; }
  async function aiJson(prompt, opts) {
    const sample = await getSample();
    if (!sample) throw { code: 'unavailable' };
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 100000);
    try { return await sample.json(prompt, Object.assign({ cache: false, signal: ctl.signal }, opts || {})); } finally { clearTimeout(to); }
  }
  async function initAI() {
    try { const c = window.claude; const a = c && c.use ? await c.use('assets') : null; HAS_ASSETS = !!a; } catch (e) { /* pas d'assets */ }
    try { const s = await getSample(); if (!s) return; const l = await s.limits(); CAN_IMG = !!(l && l.images); IMG_MAX = (l && l.images && l.images.maxCount) || 4; const b = $('#photoBtn'); if (b) b.hidden = !CAN_IMG; } catch (e) { /* pas d'images */ }
    if ($('#story').hidden && $('#sheet').hidden && tab !== 'today') render(true);
  }

  // ---------- État de session ----------
  let tab = 'today', WX = null, PHOTO = null, SAY = '';
  const WXS = { chaud: { l: 'Chaud', t: 29 }, doux: { l: 'Doux', t: 20 }, pluie: { l: 'Pluie', t: 13, rain: true }, froid: { l: 'Froid', t: 4 } };
  const SUGG = ['Dîner en terrasse, 24°, chemise en lin', 'Rendez-vous client, costume bleu marine', 'Brunch entre amis, il pleut, pull en maille', 'Vernissage ce soir, perfecto noir', 'Télétravail, jean et t-shirt, grand froid'];

  // ---------- Vues ----------
  function render(keepScroll) {
    $$('#dock button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    $('#dock .ind').style.transform = `translateX(${['today', 'shelf', 'discover', 'walk', 'wish'].indexOf(tab) * 100}%)`;
    ({ today: viewToday, shelf: viewShelf, discover: viewDiscover, walk: viewWalk, wish: viewWish })[tab]();
    if (!keepScroll) window.scrollTo(0, 0);
  }

  function viewToday() {
    const worn = S.today && S.today.date === today() ? find(S.today.pickId) : null;
    const seen = [], recent = [];
    for (const l of [...S.log].reverse()) { if (!seen.includes(l.id) && find(l.id)) { seen.push(l.id); recent.push(find(l.id)); } if (recent.length >= 8) break; }
    const dt = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const hr = new Date().getHours(), hello = hr >= 5 && hr < 12 ? 'Bonjour.' : hr >= 12 && hr < 18 ? 'Bon après-midi.' : 'Bonsoir.';
    const je = worn ? todayEntry(worn.id) : null;
    $('#view').innerHTML = `
      <section class="hero">
        <p class="mono">${esc(dt)}${AUTOW ? ' · ' + esc(AUTOW) : ''}</p>
        <h1>${hello}</h1>
        <p class="q">Qu'est-ce qui t'attend aujourd'hui&nbsp;?</p>
        <div class="say-wrap">
          <label class="fieldlab" for="say"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4L17 4l3 3L8 19z"/><path d="M14 7l3 3"/></svg>Écris ici ta journée</label>
          <textarea id="say" rows="3" placeholder="Ex : dîner en terrasse avec des amis, chemise en lin blanche…" aria-label="Ta journée">${esc(SAY)}</textarea>
          <div class="row">
            ${Object.entries(WXS).map(([k, v]) => `<button class="chip ${WX && WX.k === k ? 'on' : ''}" data-wx="${k}">${v.l}</button>`).join('')}
            <button class="chip photo-btn" id="photoBtn" ${CAN_IMG ? '' : 'hidden'}>${PHOTO ? `<img alt="" src="${URL.createObjectURL(PHOTO)}">` : IC.cam}<span>${PHOTO ? 'Tenue ajoutée' : 'Ma tenue en photo'}</span></button>
            <input type="file" id="photoIn" accept="image/*" hidden>
          </div>
          <button class="cta full" id="go"><span>Trouver mon parfum</span></button>
        </div>
      </section>
      <div class="chips" style="margin-top:18px" id="sugg">${SUGG.slice(0, 3).map((s) => `<button class="chip" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>
      ${worn ? `<section class="sec"><div class="card today-card">${bt(worn, { h: 116 })}<div><p class="mono">porté aujourd'hui</p><h2 style="font-size:24px;margin-top:4px">${esc(worn.name)}</h2><p style="color:var(--muted);font-size:14px">${esc(worn.house)}</p><button class="ghost" id="replay" style="margin-top:10px">Revoir l'histoire</button></div></div></section>
      <section class="sec"><header><h2>Journal olfactif</h2></header><div class="card jr">
        <p class="mono">Compliments</p><div class="chips" id="jc">${['0', '1', '2+'].map((v) => `<button class="chip ${je.compl === v ? 'on' : ''}" data-v="${v}">${v}</button>`).join('')}</div>
        <p class="mono">Tenue sur la peau</p><div class="chips" id="jd">${['moins de 4 h', '4 à 8 h', 'plus de 8 h'].map((v) => `<button class="chip ${je.dur === v ? 'on' : ''}" data-v="${v}">${v}</button>`).join('')}</div>
        <textarea id="jn" rows="2" placeholder="Comment il évolue sur la peau, ce qu'on t'a dit…">${esc(je.note || '')}</textarea></div></section>` : ''}
      <section class="sec"><header><h2>Ta collection</h2><span class="mono">${S.collection.length} flacons</span></header>
        <div class="vit">${S.collection.map((p) => `<button data-open="${p.id}">${fxCanvas(`data-p="${p.id}"`, .45)}${bt(p, {})}<b>${esc(p.name)}</b><small>${esc(p.house)}</small></button>`).join('')}</div></section>
      <section class="sec"><div class="row"><button class="ghost" id="weekBtn">Ma semaine</button><button class="ghost" id="travelBtn">Mode voyage</button></div></section>
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
    $('#photoBtn').onclick = () => $('#photoIn').click();
    $('#photoIn').onchange = (e) => { PHOTO = e.target.files[0] || null; viewToday(); };
    $$('[data-wx]').forEach((b) => (b.onclick = () => { const k = b.dataset.wx; WX = WX && WX.k === k ? null : Object.assign({ k }, WXS[k]); viewToday(); }));
    $$('[data-s]').forEach((b) => (b.onclick = () => { SAY = b.dataset.s; viewToday(); }));
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
      ${P.length ? shelfStats(P) : ''}
      <section class="sec"><div class="row"><button class="ghost" id="labBtn">Labo d'accords</button>${HAS_ASSETS ? `<button class="ghost" id="photosBtn">Ajouter mes photos (IA)</button>` : ''}</div></section>
      <section class="sec"><div class="shelf">
        ${P.map((p, i) => `<button class="pcard" data-open="${p.id}" style="--tint:${tint(p)};--i:${i}">${fxCanvas(`data-p="${p.id}"`, .5)}${bt(p, { level: 0.45 + ((Art.hash(p.name) % 40) / 100) })}<b>${esc(p.name)}</b><span>${esc(p.house)}</span></button>`).join('')}
        <button class="add-tile" id="addBtn"><b>+</b><span>Ajouter avec l'IA</span><small class="mono">texte ou photo</small></button>
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

  function viewDiscover() {
    const s = S.settings;
    RECS = E.recommend(CAT.filter((c) => c.notes.length), S.collection, S.wishlist.map((w) => w.name), s).filter((r) => !s.budget || r.c.price <= s.budget).sort((a, b) => b.total - a.total).slice(0, 8);
    $('#view').innerHTML = `
      <section class="sec"><header><h2>Découvrir</h2></header>
        <div class="card" style="display:grid;gap:8px"><div class="row" style="justify-content:space-between"><b>Budget par flacon</b><b id="bval" style="font-family:var(--f-display);font-size:20px">${s.budget ? s.budget + ' €' : 'sans limite'}</b></div>
          <input type="range" id="budget" min="0" max="500" step="10" value="${s.budget || 0}" aria-label="Budget par flacon"><p class="mono">prix indicatifs · à vérifier chez le vendeur</p></div>
        <div class="card ask-card"><p class="mono">${IC.spark} demande à l'IA</p>
          <textarea id="askq" rows="2" placeholder="Un niche qui sent le thé fumé et le bois, max 200 €…" aria-label="Ce que tu cherches"></textarea>
          <div class="chips" id="askchips">${['un frais niche pour le bureau', 'quelque chose de très enveloppant pour l\'hiver', 'un layering pour Baccarat Rouge'].map((t) => `<button class="chip" data-q="${esc(t)}">${esc(t)}</button>`).join('')}</div>
          <button class="cta" id="askgo">${IC.spark}<span>Me conseiller</span></button><div id="askres" class="aires"></div></div>
      </section>
      <section class="sec"><header><h2>Choisis pour toi</h2><span class="mono">goûts × manques × budget</span></header>
        ${RECS.length ? `<div class="snap">${RECS.map((r, i) => recCard(r, i)).join('')}</div>` : '<div class="empty">Rien dans ce budget. Augmente-le un peu.</div>'}
      </section>
      `;
    const bud = $('#budget');
    bud.addEventListener('input', () => { S.settings.budget = +bud.value; $('#bval').textContent = bud.value > 0 ? bud.value + ' €' : 'sans limite'; });
    bud.addEventListener('change', () => { save(); viewDiscover(); });
    $$('[data-q]').forEach((b) => (b.onclick = () => { $('#askq').value = b.dataset.q; }));
    $('#askgo').onclick = runAsk;
    $$('[data-rw]').forEach((b) => (b.onclick = () => { const n = b.dataset.rw; if (hasWish(n)) rmWish(n); else addWish(wishFromName(n)); viewDiscover(); }));
    $$('[data-own]').forEach((b) => (b.onclick = () => { const c = CAT.find((x) => x.name === b.dataset.own); if (c) { S.collection.push(fromCat(c, 4)); rmWish(c.name); save(); viewDiscover(); } }));
    $$('[data-why]').forEach((b) => (b.onclick = () => explain(b)));
    mountFx($('#view'));
  }
  function recCard(r, i) {
    const c = r.c, reasons = [];
    if (r.hits.length) reasons.push('Tu aimes déjà : ' + r.hits.join(', '));
    if (r.gapLabel) reasons.push('Comble : ' + r.gapLabel);
    if (r.mates.length) reasons.push('Se marie avec ' + r.mates.map((m) => m.name).join(', '));
    return `<article class="rec" style="--tint:${tint(c)}">${fxCanvas(`data-r="${i}"`, .6)}<span class="pct">${r.pct}%</span>${bt(c, { still: false })}
      <div><h3>${esc(c.name)}</h3><p style="color:var(--muted);font-size:14px">${esc(c.house)} · ${esc(famLabel(c.family))} · ≈ ${c.price} €</p></div>
      <p class="mono" style="text-transform:none;letter-spacing:0;font-size:12px">${esc(c.notes.slice(0, 5).join(' · '))}</p>
      <ul style="margin:0;padding-left:18px;font-size:14px">${reasons.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
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
    const prompt = `Tu es un nez de parfumerie très pointu (niche et designer). Réponds UNIQUEMENT par un JSON.\nMa collection :\n${colLines()}\nBudget max par flacon : ${s.budget || 'aucun'} €. Notes aimées : ${(s.liked || []).join(', ') || '—'}. Notes à éviter : ${(s.avoid || []).join(', ') || '—'}.\nMa demande : "${q}"\n\nPropose 3 parfums qui existent vraiment et que je ne possède pas déjà, adaptés à ma demande, à mes goûts déduits de ma collection et à mon budget. Format : {"items":[{"name":"nom officiel","house":"maison","family":"${FAMS}","notes":["5 notes en français"],"price":nombre en euros (indicatif),"why":"2 phrases, tutoiement, concrètes","adds":"ce que ça apporte à ma collection, 8 mots max","layer_with":"id d'un parfum de ma collection ou null"}]}`;
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
      <div class="chips">${(p.notes || []).map((n) => `<span class="chip">${esc(n)}</span>`).join('')}</div>
      <div class="card" style="display:grid;gap:8px"><div class="meter"><span>Projection</span>${dots(p.projection)}</div><div class="meter"><span>Tenue</span>${dots(p.longevity)}</div><div class="meter"><span>Poids</span>${dots(p.weight)}</div></div>
      <div><p class="mono">ma note</p><div class="stars" id="stars">${[1, 2, 3, 4, 5].map((i) => `<button data-r="${i}" aria-label="${i} sur 5">${i <= p.rating ? '★' : '☆'}</button>`).join('')}</div></div>
      <p style="color:var(--muted)">${esc(ago(daysSince(p.id)))} · ${wears(p.id)} port${wears(p.id) > 1 ? 's' : ''}${p.price ? ' · ≈ ' + p.price + ' €' : ''}${p.price && wears(p.id) ? ' · ≈ ' + (p.price / wears(p.id)).toFixed(1).replace('.', ',') + ' € / port' : ''}</p>
      <p class="mono" style="text-transform:none;letter-spacing:0">${IC.spark} Ambiance : ${esc(FX.motifsOf(p).label)}${FX.motifsOf(p).notes.length ? ' · inspirée de ' + esc(FX.motifsOf(p).notes.join(', ')) : ''}</p>
      <div class="row" style="gap:14px">${buyLinks(p.name, p.house)}${HAS_ASSETS ? `<button class="ghost" id="phBtn">${p.img ? 'Changer la photo' : 'Ajouter cette photo'}</button>${p.img ? '<button class="ghost" id="phDel">Retirer la photo</button>' : ''}<input type="file" id="phIn" accept="image/*" hidden>` : ''}</div>
      ${(() => { const notes = S.log.filter((l) => l.id === p.id && (l.note || l.compl || l.dur)).slice(-3).reverse(); return notes.length ? `<div><p class="mono">Journal</p>${notes.map((l) => `<p style="font-size:14px;color:var(--muted);margin-top:6px">${esc(new Date(l.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }))} · ${esc([l.compl ? l.compl + ' compliment(s)' : '', l.dur || '', l.note || ''].filter(Boolean).join(' · '))}</p>`).join('')}</div>` : ''; })()}
      ${p.incomplete ? `<div class="card" style="display:grid;gap:10px"><p class="mono">Fiche à compléter</p><p style="font-size:14px;color:var(--muted)">Je ne connais que la marque. Donne-moi le nom exact et l'IA remplit les notes.</p><input type="text" id="fixin" placeholder="Nom exact du parfum"><button class="cta" id="fixgo"><span>Compléter avec l'IA</span></button><p class="mono" id="fixmsg" style="text-transform:none"></p></div>` : ''}
      <p class="mono" id="phMsg" style="text-transform:none"></p>
      <div class="row"><button class="ghost" id="sx">Fermer</button><button class="ghost danger" id="sdel">Retirer</button></div>`);
    mountFx(pn);
    if ($('#fixgo', pn)) $('#fixgo', pn).onclick = async () => {
      const nm = $('#fixin', pn).value.trim(); if (!nm) { $('#fixin', pn).focus(); return; }
      $('#fixmsg', pn).textContent = 'Je cherche…'; $('#fixgo', pn).disabled = true;
      try {
        const j = await aiJson(`Identifie ce parfum${p.house ? ' de la maison "' + p.house + '"' : ''} : "${nm}". Réponds UNIQUEMENT par un JSON : {"name":"nom officiel","house":"maison","family":"${FAMS}","notes":["6 à 10 notes en français, de l'ouverture au fond"],"projection":1-5,"longevity":1-5,"weight":1-5,"price":nombre en euros indicatif}`, { modelTier: 'default' });
        p.name = String(j.name || nm); p.house = String(j.house || p.house); p.family = E.FAMILIES[j.family] ? j.family : p.family; p.notes = (j.notes || []).map(String).slice(0, 10);
        p.projection = clamp(Math.round(+j.projection || 3), 1, 5); p.longevity = clamp(Math.round(+j.longevity || 3), 1, 5); p.weight = clamp(Math.round(+j.weight || 3), 1, 5); p.price = Math.round(+j.price) || 0; delete p.incomplete; delete p._tags;
        save(); openDetail(id); render(true);
      } catch (e) { $('#fixmsg', pn).textContent = 'L\'IA n\'est pas disponible ici. Réessaie plus tard.'; $('#fixgo', pn).disabled = false; }
    };
    if ($('#phBtn', pn)) {
      $('#phBtn', pn).onclick = () => $('#phIn', pn).click();
      $('#phIn', pn).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; $('#phMsg', pn).textContent = 'Envoi de la photo…'; try { p.img = await putPhoto(f); save(); openDetail(id); render(true); } catch (er) { $('#phMsg', pn).textContent = 'Photo impossible à enregistrer ici.'; } };
      if ($('#phDel', pn)) $('#phDel', pn).onclick = () => { delete p.img; save(); openDetail(id); render(true); };
    }
    $('#sx', pn).onclick = closeSheet;
    $$('#stars button', pn).forEach((b) => (b.onclick = () => { p.rating = +b.dataset.r; save(); $$('#stars button', pn).forEach((x) => { x.textContent = +x.dataset.r <= p.rating ? '★' : '☆'; }); }));
    $('#sdel', pn).onclick = (e) => { if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = 'Confirmer'; return; } S.collection = S.collection.filter((x) => x.id !== id); save(); closeSheet(); render(true); };
  }

  let PRE = [], SHELF_FILES = [];
  function openAdd() {
    PRE = []; SHELF_FILES = [];
    const pn = openSheet(`<div><h2>Ajoute sans taper</h2><p style="color:var(--muted);margin-top:6px">Colle tes parfums en vrac, ou prends ton étagère en photo. L'IA retrouve la maison, les notes et la puissance.</p></div>
      <textarea id="addtxt" rows="4" placeholder="br540, santal 33 le labo, un diptyque au figuier, ombre leather…"></textarea>
      <div class="row"><button class="chip photo-btn" id="addph" ${CAN_IMG ? '' : 'hidden'}>${IC.cam}<span id="addphl">Photo(s) de l'étagère</span></button><input type="file" id="addin" accept="image/*" multiple hidden></div>
      <button class="cta full" id="addgo">${IC.spark}<span>Analyser</span></button><div id="addres" style="display:grid;gap:10px"></div>`);
    $('#addph', pn).onclick = () => $('#addin', pn).click();
    $('#addin', pn).onchange = (e) => { SHELF_FILES = [...e.target.files].slice(0, 4); $('#addphl', pn).textContent = SHELF_FILES.length + ' photo(s) ✓'; };
    $('#addgo', pn).onclick = () => analyzeAdd(pn);
  }
  async function analyzeAdd(pn) {
    const txt = $('#addtxt', pn).value.trim(), out = $('#addres', pn);
    if (!txt && !SHELF_FILES.length) { $('#addtxt', pn).focus(); return; }
    out.innerHTML = '<div class="shim"></div><div class="shim" style="width:80%"></div><div class="shim" style="width:60%"></div>'; $('#addgo', pn).disabled = true;
    let items = null;
    try {
      const prompt = `Tu es un expert en parfumerie (niche et designer). L'utilisateur ajoute des parfums à sa collection, en vrac${SHELF_FILES.length ? ' et via photo(s) de flacons ou d\'étagère' : ''}. Texte saisi : """${txt || '(aucun)'}"""\nIdentifie chaque parfum (corrige les fautes, complète la maison). Réponds UNIQUEMENT par un JSON : {"items":[{"name":"nom officiel","house":"maison","family":"${FAMS}","notes":["5 notes en français, de l'ouverture au fond"],"projection":1-5,"longevity":1-5,"weight":1-5 (1 frais et léger, 5 chaud et dense),"price":nombre en euros indicatif,"confidence":0 à 1}]}. Si tu ne reconnais pas un parfum, mets confidence sous 0.4 et ta meilleure estimation.`;
      const j = await aiJson(prompt, { modelTier: 'default', images: SHELF_FILES.length && CAN_IMG ? SHELF_FILES : undefined });
      items = (j.items || []).map((it) => ({ id: uid(), name: String(it.name || '').trim(), house: String(it.house || '').trim(), family: E.FAMILIES[it.family] ? it.family : 'boisé', notes: (it.notes || []).map(String).slice(0, 6), projection: clamp(Math.round(+it.projection || 3), 1, 5), longevity: clamp(Math.round(+it.longevity || 3), 1, 5), weight: clamp(Math.round(+it.weight || 3), 1, 5), price: Math.round(+it.price) || 0, rating: 4, occ: [], conf: +it.confidence || 0.7 })).filter((it) => it.name);
    } catch (e) {
      const lines = txt.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
      items = lines.map((l) => {
        const n = E.norm(l); const c = CAT.find((x) => E.norm(x.name) === n) || CAT.find((x) => n.length >= 4 && (E.norm(x.name).includes(n) || n.includes(E.norm(x.name))));
        return c ? Object.assign(fromCat(c, 4), { conf: 0.9 }) : null;
      }).filter(Boolean);
      out.insertAdjacentHTML('beforebegin', '<p class="mono" style="text-transform:none">L\'IA n\'est pas disponible ici : seuls les parfums du catalogue sont reconnus.</p>');
    }
    items = items.filter((it) => !S.collection.some((p) => E.norm(p.name) === E.norm(it.name)));
    PRE = items;
    out.innerHTML = items.length ? items.map((it, i) => `<div class="pre" style="--i:${i}">${bt(it, { still: true })}<div><b>${esc(it.name)}</b><small>${esc(it.house)} · ${esc(famLabel(it.family))}${it.conf < 0.4 ? ' · à vérifier' : ''}</small></div><button class="ghost" data-rm="${i}" aria-label="Retirer">✕</button></div>`).join('') + `<button class="cta full" id="addok"><span>Ajouter ${items.length} parfum${items.length > 1 ? 's' : ''}</span></button>` : '<div class="empty">Rien de nouveau reconnu. Essaie avec le nom et la maison.</div>';
    $$('[data-rm]', out).forEach((b) => (b.onclick = () => { PRE[+b.dataset.rm] = null; b.closest('.pre').remove(); }));
    if ($('#addok', out)) $('#addok', out).onclick = () => { PRE.filter(Boolean).forEach((it) => { delete it.conf; S.collection.push(it); }); save(); closeSheet(); tab = 'shelf'; render(); };
    $('#addgo', pn).disabled = false;
  }

  function openProfile() {
    const s = S.settings;
    const pn = openSheet(`<div><h2>Profil</h2></div>
      <div class="card" style="display:grid;gap:8px"><b>Notes que j'adore</b><input type="text" id="liked" value="${esc(s.liked.join(', '))}" placeholder="vanille, oud, bergamote"><b style="margin-top:6px">Notes que je fuis</b><input type="text" id="avoid" value="${esc(s.avoid.join(', '))}" placeholder="patchouli, aldéhydes"><button class="ghost" id="savepref" style="justify-self:start">Enregistrer</button></div>
      <div class="card" style="display:grid;gap:10px"><b>Sauvegarde</b><div class="row"><button class="ghost" id="exp">Exporter en texte</button><button class="ghost" id="imp">Importer</button></div><textarea id="io" rows="3" placeholder="Le texte de sauvegarde apparaît ici, ou colle-le pour importer"></textarea><p class="mono" id="iomsg" style="text-transform:none"></p></div>
      <div class="row"><button class="ghost" id="niche">Recharger la collection niche</button><button class="ghost danger" id="reset">Tout vider</button></div>`);
    $('#savepref', pn).onclick = (e) => { const sp = (v) => v.split(',').map((x) => x.trim()).filter(Boolean); S.settings.liked = sp($('#liked', pn).value); S.settings.avoid = sp($('#avoid', pn).value); save(); e.target.textContent = 'Enregistré ✓'; };
    $('#exp', pn).onclick = () => { const t = $('#io', pn); t.value = JSON.stringify(S); t.select(); try { navigator.clipboard.writeText(t.value).then(() => { $('#iomsg', pn).textContent = 'Copié. Garde ce texte dans tes notes.'; }, () => { $('#iomsg', pn).textContent = 'Sélectionné : copie-le à la main.'; }); } catch (e) { $('#iomsg', pn).textContent = 'Sélectionné : copie-le à la main.'; } };
    $('#imp', pn).onclick = () => { try { const d = JSON.parse($('#io', pn).value); if (!Array.isArray(d.collection)) throw 0; S = Object.assign(DEF(), d); save(); closeSheet(); render(); } catch (e) { $('#iomsg', pn).textContent = 'Sauvegarde invalide.'; } };
    $('#niche', pn).onclick = (e) => { if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = 'Confirmer : remplacer'; return; } S.collection = seed(); S.log = []; S.today = null; save(); closeSheet(); render(); };
    $('#reset', pn).onclick = (e) => { if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = 'Confirmer : tout vider'; return; } S = DEF(); S.collection = []; save(); closeSheet(); render(); };
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

  // ---------- Météo automatique (fonctionne hors claude.ai, sinon repli sur les boutons) ----------
  async function autoWeather() {
    try {
      if (!navigator.geolocation) return;
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 6000 }));
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=apparent_temperature,weather_code&timezone=auto`);
      const c = (await r.json()).current, t = Math.round(c.apparent_temperature);
      WX = { k: 'auto', l: 'Météo actuelle', t, rain: (c.weather_code >= 51 && c.weather_code <= 67) || (c.weather_code >= 80 && c.weather_code <= 99) };
      AUTOW = t + '° · ' + (WX.rain ? 'pluie' : 'sec');
      if (tab === 'today' && $('#story').hidden && $('#sheet').hidden) viewToday();
    } catch (e) { /* bloqué ou refusé : les boutons de météo restent */ }
  }

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
    return { ctx: pickKey(c.ctx, E.CONTEXTS, 'perso'), with: pickKey(c.with, E.WITHS, 'seul'), moment: pickKey(c.moment, E.MOMENTS, 'jour'), mood: pickKey(c.mood, E.MOODS, 'confiant'), style: pickKey(c.style, E.STYLES, 'smart'), color: pickKey(c.color, E.COLORS, 'neutre'), fabric: pickKey(c.fabric, E.FABRICS, ''), temp: typeof c.temp === 'number' ? c.temp : wx ? wx.t : 18, rain: !!(wx && wx.rain) || !!c.rain, hum: 50 };
  }
  function keywordCond(text, wx) {
    const t = E.norm(text), c = { temp: wx ? wx.t : 18 };
    const m = text.match(/(-?\d{1,2})\s*°/); if (m) c.temp = +m[1];
    if (/pro|reunion|bureau|client|travail|entretien|teletravail/.test(t)) c.ctx = 'pro';
    if (/date|rencard|resto|diner|amoureu|copine|copain|chéri|cheri/.test(t)) c.ctx = 'date';
    if (/famille|parents|mamie|papa|maman/.test(t)) c.ctx = 'famille';
    if (/ami|pote|bar|apero|brunch|terrasse/.test(t)) c.ctx = 'amis';
    if (/mariage|vernissage|gala|soiree|evenement|concert/.test(t)) c.ctx = 'event';
    if (/soir|diner|vernissage|nuit/.test(t)) c.moment = 'soir';
    if (/costume|blazer/.test(t)) c.style = 'costume'; else if (/sport|running|salle/.test(t)) c.style = 'sport'; else if (/jean|t shirt|tee/.test(t)) c.style = 'casual';
    if (/cuir|perfecto/.test(t)) c.fabric = 'cuir'; else if (/lin/.test(t)) c.fabric = 'lin'; else if (/pull|maille|laine/.test(t)) c.fabric = 'laine';
    if (/pluie|pleut/.test(t)) c.rain = true;
    if (/froid/.test(t) && !m) c.temp = 4; if (/chaud|canicule/.test(t) && !m) c.temp = 29;
    return normCond(c, wx);
  }
  const layerObjs = (p, cond, n) => E.layering(p, S.collection, cond, { daysSince }, n || 2).map((l) => ({ p: l.b, effect: l.what, how: [l.how, l.tip].filter(Boolean).join(' '), score: clamp(Math.round(l.total + 1.5), 2, 5) }));
  function localDay(text, wx) {
    const cond = keywordCond(text, wx);
    const rk = E.rank(S.collection, cond, { daysSince });
    const top = rk[0];
    return { cond, read: text ? text : 'Journée ' + E.CONTEXTS[cond.ctx].toLowerCase() + ', ' + Math.round(cond.temp) + '°', pick: top.p, vibe: [famLabel(top.p.family), E.MOODS[cond.mood], (E.MOMENTS[cond.moment] || '').toLowerCase()].filter(Boolean).slice(0, 3),
      story: (top.reasons.slice(0, 3).join('. ') || 'Le meilleur compromis de ton étagère aujourd\'hui') + '.', alts: rk.slice(1, 4).map((r) => ({ p: r.p, line: r.reasons[0] || 'Une belle alternative' })), layers: layerObjs(top.p, cond, 2), avoid: '', ai: false };
  }
  async function aiDay(text, wx) {
    const prompt = `Tu es un nez de parfumerie qui compose avec goût. Ton chaleureux, tutoiement, image sensorielle, jamais de jargon creux. Réponds UNIQUEMENT par un JSON.\n\nMa collection (id | nom | maison | famille | notes | projection | tenue | poids | ma note | dernier port) :\n${colLines()}\n\nMa journée : """${text || '(non précisée)'}"""${wx ? `\nMétéo indiquée : ${wx.l}, environ ${wx.t}°C${wx.rain ? ', pluie' : ''}.` : ''}${PHOTO && CAN_IMG ? '\nUne photo de ma tenue est jointe : lis-y les couleurs, matières et le style.' : ''}\nDate : ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}.\n\nFormat : {"cond":{"temp":nombre ou null,"ctx":"pro|perso|date|event|famille|amis","with":"seul|partenaire|premier|collegues|boss|famille|amis|inconnus","moment":"jour|soir|nuit","mood":"confiant|calme|energique|romantique|mysterieux|joyeux|fatigue|creatif","style":"costume|smart|casual|sport|soiree|street","color":"sombre|neutre|clair|colore","fabric":"coton|lin|laine|cuir|denim|soie|technique|"},"read":"ma journée reformulée, 12 mots max","pick":"id du parfum","vibe":["3 mots courts"],"story":"2 phrases : pourquoi celui-là aujourd'hui (météo, tenue, moment, personnes)","alts":[{"id":"","line":"8 mots max"},{"id":"","line":""}],"layers":[{"id":"","effect":"ce que l'accord change, 1 phrase","how":"ordre, dosage en sprays, où vaporiser selon la tenue, 2 phrases","score":1-5},{"id":"","effect":"","how":"","score":1-5}],"avoid":"vide, ou 1 phrase si un parfum est à éviter aujourd'hui"}\nRègles : n'utilise que les id fournis. Évite ce qui a été porté hier ou aujourd'hui sauf raison forte. Les 2 accords de layering doivent être différents de "pick" et cohérents avec la chaleur et la tenue.`;
    const j = await aiJson(prompt, { modelTier: 'default', images: PHOTO && CAN_IMG ? [PHOTO] : undefined });
    const p = find(j.pick); if (!p) throw { code: 'bad_pick' };
    const cond = normCond(j.cond, wx);
    let layers = (j.layers || []).map((l) => ({ p: find(l.id), effect: String(l.effect || ''), how: String(l.how || ''), score: clamp(Math.round(+l.score || 4), 1, 5) })).filter((l) => l.p && l.p.id !== p.id).slice(0, 2);
    if (!layers.length) layers = layerObjs(p, cond, 2);
    let alts = (j.alts || []).map((a) => ({ p: find(a.id), line: String(a.line || '') })).filter((a) => a.p && a.p.id !== p.id).slice(0, 3);
    if (!alts.length) alts = E.rank(S.collection, cond, { daysSince }).filter((r) => r.p.id !== p.id).slice(0, 3).map((r) => ({ p: r.p, line: r.reasons[0] || '' }));
    return { cond, read: String(j.read || text || 'Ta journée'), pick: p, vibe: (j.vibe || []).map(String).slice(0, 3), story: String(j.story || ''), alts, layers, avoid: String(j.avoid || ''), ai: true };
  }

  let LAST = null;
  async function runDay(replayFor) {
    if (!S.collection.length) { tab = 'shelf'; render(); return; }
    openStory(); showLoading();
    let R = null;
    const t0 = Date.now();
    try { R = await aiDay(SAY.trim(), WX); } catch (e) { R = null; }
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
  const condChips = (c) => [E.CONTEXTS[c.ctx], E.WITHS[c.with], E.MOMENTS[c.moment], Math.round(c.temp) + '°', E.MOODS[c.mood], E.STYLES[c.style] + (c.fabric ? ' · ' + E.FABRICS[c.fabric].toLowerCase() : '')];
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
  function viewWish() {
    const W = S.wishlist, total = W.reduce((a, w) => a + (w.price || 0), 0);
    $('#view').innerHTML = `
      <section class="sec"><header><h2>Wishlist</h2><span class="mono">${W.length} parfum${W.length > 1 ? 's' : ''}${total ? ' · ≈ ' + total + ' €' : ''}</span></header>
        <div class="card ask-card"><p class="mono">Ajouter à la wishlist</p><input type="text" id="wlin" placeholder="Nom du parfum, l'IA complète la fiche"><button class="cta" id="wlgo"><span>Ajouter</span></button><p class="mono" id="wlmsg" style="text-transform:none"></p></div></section>
      <section class="sec">${W.length ? W.map((w, i) => `<article class="wl" style="--i:${i}">${bt(w, { still: true })}<div class="wlb"><b>${esc(w.name)}</b><small>${esc(w.house)}${w.family ? ' · ' + esc(famLabel(w.family)) : ''}${w.price ? ' · ≈ ' + w.price + ' €' : ''}</small>${(w.notes || []).length ? `<small>${esc(w.notes.slice(0, 6).join(' · '))}</small>` : ''}<div class="row" style="margin-top:8px"><button class="ghost" data-wown="${esc(w.name)}">Je l'ai</button><button class="ghost" data-wrm="${esc(w.name)}">Retirer</button></div>${buyLinks(w.name, w.house)}</div></article>`).join('') : '<div class="empty">Ta wishlist est vide. Ajoute un parfum ici, depuis Découvrir ou depuis une balade olfactive.</div>'}</section>`;
    $$('[data-wrm]').forEach((b) => (b.onclick = () => { rmWish(b.dataset.wrm); viewWish(); }));
    $$('[data-wown]').forEach((b) => (b.onclick = () => { const w = S.wishlist.find((x) => x.name === b.dataset.wown); if (w) { S.collection.push(wishToOwned(w)); rmWish(w.name); viewWish(); } }));
    $('#wlgo').onclick = async () => {
      const v = $('#wlin').value.trim(), msg = $('#wlmsg'); if (!v) { $('#wlin').focus(); return; }
      msg.textContent = 'Je complète la fiche…'; $('#wlgo').disabled = true;
      const c = CAT.find((x) => E.norm(x.name) === E.norm(v));
      if (c) { addWish(wishFromName(c.name)); return viewWish(); }
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
        const pn = openSheet(`<div><h2>Nouvelle balade</h2><p style="color:var(--muted);margin-top:6px">Où testes-tu aujourd'hui ?</p></div><input type="text" id="wplace" placeholder="Jovoy, Nose, Sephora… (facultatif)"><button class="cta full" id="wgo2"><span>C'est parti</span></button>`);
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

  // ---------- Démarrage ----------
  $('#dock').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { tab = b.dataset.tab; render(); } });
  $('#profileBtn').onclick = openProfile;
  render();
  initStore();
  initAI();
  autoWeather();
  const sp = $('#splash');
  if (sp) { const kill = () => sp.remove(); sp.addEventListener('click', kill); setTimeout(kill, REDUCED ? 500 : 3000); }
})();
