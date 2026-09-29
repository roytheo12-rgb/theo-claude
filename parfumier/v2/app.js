(function () {
  'use strict';
  const E = window.Engine, CAT = window.CATALOG, Art = window.Art;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'sillage.v2';
  const famLabel = (f) => (E.FAMILIES[f] ? E.FAMILIES[f].label : 'Sans famille');
  const FAMS = Object.keys(E.FAMILIES).join('|');

  const IC = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg>',
    bottle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="7" y="10" width="10" height="11" rx="2.5"/><path d="M10 10V7.5h4V10M9.5 3.5h5v4h-5z"/></svg>',
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.8 8.2l-2 5.6-5.6 2 2-5.6z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7"/></svg>',
    spark: '<svg class="spark" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9zM19 15l.9 2.6L22.5 18.5l-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z"/></svg>',
    cam: '<svg class="spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 8.5A2.5 2.5 0 015.5 6H8l1.4-2h5.2L16 6h2.5A2.5 2.5 0 0121 8.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5z"/><circle cx="12" cy="13" r="3.6"/></svg>',
  };

  // ---------- Données ----------
  const SEED = [['Santal 33', 4], ['Another 13', 5], ['Baccarat Rouge 540', 5], ['Gypsy Water', 4], ['Mojave Ghost', 4], ['Philosykos', 5], ['Tam Dao', 3], ['Portrait of a Lady', 3], ['Black Afgano', 3], ['Tobacco Vanille', 5], ['Lazy Sunday Morning', 4], ['Molecule 01', 3]];
  const fromCat = (c, rating) => ({ id: uid(), name: c.name, house: c.house, family: c.family, notes: [...c.notes], projection: c.projection, longevity: c.longevity, weight: c.weight, price: c.price, rating: rating || 4, occ: [] });
  const seed = () => SEED.map(([n, r]) => fromCat(CAT.find((c) => c.name === n), r));
  const DEF = () => ({ v: 2, collection: seed(), wishlist: [], log: [], settings: { budget: 220, liked: [], avoid: [] }, today: null });
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
      if (snap.exists && snap.data() && snap.data().collection) {
        S = Object.assign(DEF(), JSON.parse(JSON.stringify(snap.data()))); S.settings = Object.assign(DEF().settings, S.settings);
        try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ok */ }
        if (!$('#story') || $('#story').hidden) render(true);
      } else save();
    } catch (e) { /* on reste en local */ }
  }

  // ---------- Utilitaires métier ----------
  const find = (id) => S.collection.find((p) => p.id === id);
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const daysSince = (id) => {
    const d = S.log.filter((l) => l.id === id).map((l) => l.date).sort().pop();
    return d ? Math.round((new Date(today() + 'T00:00:00') - new Date(d + 'T00:00:00')) / 864e5) : null;
  };
  const ago = (d) => (d == null ? 'jamais porté' : d === 0 ? 'porté aujourd\'hui' : d === 1 ? 'porté hier' : 'porté il y a ' + d + ' j');
  const tint = (p) => { const P = Art.pal(p); return `hsl(${P.h} ${P.s}% 76% / .75)`; };
  const bt = (p, o) => { o = o || {}; return `<div class="bwrap ${o.still ? '' : 'bob'}" ${o.h ? `style="height:${o.h}px"` : ''}>${Art.bottle(p, o)}</div>`; };
  const words = (t, base) => String(t || '').split(/\s+/).filter(Boolean).map((w, i) => `<span class="w" style="--i:${i};--d:${base || 0}">${esc(w)}</span>`).join(' ');
  const dots = (n) => '<span class="dots">' + [1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'f' : ''}"></i>`).join('') + '</span>';
  const colLines = () => S.collection.map((p) => `${p.id} | ${p.name} | ${p.house} | ${p.family} | ${(p.notes || []).join(', ')} | proj ${p.projection}/5 | tenue ${p.longevity}/5 | poids ${p.weight}/5 (1 léger, 5 dense) | ma note ${p.rating}/5 | ${ago(daysSince(p.id))}`).join('\n');

  // ---------- IA (sample) ----------
  let CAN_IMG = false;
  async function getSample() { const c = window.claude; return c && c.use ? c.use('sample') : null; }
  async function aiJson(prompt, opts) {
    const sample = await getSample();
    if (!sample) throw { code: 'unavailable' };
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 100000);
    try { return await sample.json(prompt, Object.assign({ cache: false, signal: ctl.signal }, opts || {})); } finally { clearTimeout(to); }
  }
  async function initAI() {
    try { const s = await getSample(); if (!s) return; const l = await s.limits(); CAN_IMG = !!(l && l.images); const b = $('#photoBtn'); if (b) b.hidden = !CAN_IMG; } catch (e) { /* pas d'images */ }
  }

  // ---------- État de session ----------
  let tab = 'today', WX = null, PHOTO = null, SAY = '';
  const WXS = { chaud: { l: 'Chaud', t: 29 }, doux: { l: 'Doux', t: 20 }, pluie: { l: 'Pluie', t: 13, rain: true }, froid: { l: 'Froid', t: 4 } };
  const SUGG = ['Dîner en terrasse, 24°, chemise en lin', 'Rendez-vous client, costume bleu marine', 'Brunch entre amis, il pleut, pull en maille', 'Vernissage ce soir, perfecto noir', 'Télétravail, jean et t-shirt, grand froid'];

  // ---------- Vues ----------
  function render(keepScroll) {
    $$('#dock button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    $('#dock .ind').style.transform = `translateX(${['today', 'shelf', 'discover'].indexOf(tab) * 100}%)`;
    ({ today: viewToday, shelf: viewShelf, discover: viewDiscover })[tab]();
    if (!keepScroll) window.scrollTo(0, 0);
  }

  function viewToday() {
    const worn = S.today && S.today.date === today() ? find(S.today.pickId) : null;
    const seen = [], recent = [];
    for (const l of [...S.log].reverse()) { if (!seen.includes(l.id) && find(l.id)) { seen.push(l.id); recent.push(find(l.id)); } if (recent.length >= 8) break; }
    const dt = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    $('#view').innerHTML = `
      <section class="hero">
        <i class="blob b1"></i><i class="blob b2"></i><i class="blob b3"></i><i class="blob b4"></i>
        <p class="mono">${esc(dt)}</p>
        <h1>Qu'est-ce qui t'attend <em>aujourd'hui</em>&nbsp;?</h1>
        <div class="say-wrap">
          <textarea id="say" rows="3" placeholder="Raconte en une phrase : ce que tu fais, avec qui, ce que tu portes…" aria-label="Ta journée">${esc(SAY)}</textarea>
          <div class="row">
            ${Object.entries(WXS).map(([k, v]) => `<button class="chip ${WX && WX.k === k ? 'on' : ''}" data-wx="${k}">${v.l}</button>`).join('')}
            <button class="chip photo-btn" id="photoBtn" ${CAN_IMG ? '' : 'hidden'}>${PHOTO ? `<img alt="" src="${URL.createObjectURL(PHOTO)}">` : IC.cam}<span>${PHOTO ? 'Ma tenue ✓' : 'Ma tenue en photo'}</span></button>
            <input type="file" id="photoIn" accept="image/*" hidden>
          </div>
          <button class="cta full" id="go">${IC.spark}<span>Trouve mon parfum</span></button>
        </div>
      </section>
      <div class="chips" style="margin-top:14px" id="sugg">${SUGG.slice(0, 3).map((s) => `<button class="chip" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>
      ${worn ? `<section class="sec"><div class="card today-card">${bt(worn, { h: 108 })}<div><p class="mono">aujourd'hui</p><h2 style="font-size:22px">${esc(worn.name)}</h2><p style="color:var(--muted);font-size:14px">${esc(worn.house)}</p><button class="ghost" id="replay" style="margin-top:8px">Revoir l'histoire</button></div></div></section>` : ''}
      ${recent.length ? `<section class="sec"><header><h2>Ton sillage récent</h2></header><div class="strip">${recent.map((p) => `<button class="mini" data-open="${p.id}" style="border:0;background:none;padding:0">${bt(p, { still: true })}<b>${esc(p.name)}</b>${ago(daysSince(p.id)).replace('porté ', '')}</button>`).join('')}</div></section>` : ''}
      <section class="sec"><p class="mono" style="text-align:center">${S.collection.length} parfums sur ton étagère · l'IA lit ta collection à chaque demande</p></section>`;
    const ta = $('#say'); ta.addEventListener('input', () => { SAY = ta.value; });
    $('#go').onclick = () => runDay();
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
      <section class="sec"><div class="shelf">
        ${P.map((p, i) => `<button class="pcard" data-open="${p.id}" style="--tint:${tint(p)};--i:${i}">${bt(p, { level: 0.45 + ((Art.hash(p.name) % 40) / 100) })}<b>${esc(p.name)}</b><span>${esc(p.house)}</span></button>`).join('')}
        <button class="add-tile" id="addBtn">${IC.spark.replace('class="spark"', 'style="width:30px;height:30px"')}<span>Ajouter avec l'IA</span><small class="mono">texte ou photo</small></button>
      </div></section>`;
    $$('[data-open]').forEach((b) => (b.onclick = () => openDetail(b.dataset.open)));
    $('#addBtn').onclick = openAdd;
  }

  let RECS = [];
  function viewDiscover() {
    const s = S.settings;
    RECS = E.recommend(CAT, S.collection, S.wishlist, s).filter((r) => !s.budget || r.c.price <= s.budget).sort((a, b) => b.total - a.total).slice(0, 8);
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
      ${S.wishlist.length ? `<section class="sec"><header><h2>Ta wishlist</h2></header><div class="chips">${S.wishlist.map((n) => `<button class="chip on" data-wish="${esc(n)}">${esc(n)} ✕</button>`).join('')}</div></section>` : ''}`;
    const bud = $('#budget');
    bud.addEventListener('input', () => { S.settings.budget = +bud.value; $('#bval').textContent = bud.value > 0 ? bud.value + ' €' : 'sans limite'; });
    bud.addEventListener('change', () => { save(); viewDiscover(); });
    $$('[data-q]').forEach((b) => (b.onclick = () => { $('#askq').value = b.dataset.q; }));
    $('#askgo').onclick = runAsk;
    $$('[data-wish]').forEach((b) => (b.onclick = () => { S.wishlist = S.wishlist.filter((n) => n !== b.dataset.wish); save(); viewDiscover(); }));
    $$('[data-rw]').forEach((b) => (b.onclick = () => { const n = b.dataset.rw; S.wishlist = S.wishlist.includes(n) ? S.wishlist.filter((x) => x !== n) : [...S.wishlist, n]; save(); viewDiscover(); }));
    $$('[data-own]').forEach((b) => (b.onclick = () => { const c = CAT.find((x) => x.name === b.dataset.own); if (c) { S.collection.push(fromCat(c, 4)); S.wishlist = S.wishlist.filter((n) => n !== c.name); save(); viewDiscover(); } }));
    $$('[data-why]').forEach((b) => (b.onclick = () => explain(b)));
  }
  function recCard(r, i) {
    const c = r.c, reasons = [];
    if (r.hits.length) reasons.push('Tu aimes déjà : ' + r.hits.join(', '));
    if (r.gapLabel) reasons.push('Comble : ' + r.gapLabel);
    if (r.mates.length) reasons.push('Se marie avec ' + r.mates.map((m) => m.name).join(', '));
    return `<article class="rec" style="--tint:${tint(c)}"><span class="pct">${r.pct}%</span>${bt(c, { still: false })}
      <div><h3>${esc(c.name)}</h3><p style="color:var(--muted);font-size:14px">${esc(c.house)} · ${esc(famLabel(c.family))} · ≈ ${c.price} €</p></div>
      <p class="mono" style="text-transform:none;letter-spacing:0;font-size:12px">${esc(c.notes.slice(0, 5).join(' · '))}</p>
      <ul style="margin:0;padding-left:18px;font-size:14px">${reasons.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="why" id="why${i}"></p>
      <div class="row"><button class="ghost" data-why="${i}">${IC.spark} Pourquoi lui ?</button><button class="ghost" data-rw="${esc(c.name)}">${r.wished ? '♥' : '♡'}</button><button class="ghost" data-own="${esc(c.name)}">Je l'ai</button></div></article>`;
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
      const items = (j.items || []).slice(0, 3);
      out.innerHTML = items.map((it) => {
        const c = { name: String(it.name || '?'), house: String(it.house || ''), family: E.FAMILIES[it.family] ? it.family : 'boisé', notes: (it.notes || []).map(String).slice(0, 5) };
        const mate = find(it.layer_with);
        return `<article class="rec" style="--tint:${tint(c)}">${bt(c, {})}<div><h3>${esc(c.name)}</h3><p style="color:var(--muted);font-size:14px">${esc(c.house)}${it.price ? ' · ≈ ' + Math.round(+it.price) + ' €' : ''}</p><p style="margin-top:6px;font-size:14px">${esc(it.why || '')}</p><p class="mono" style="margin-top:6px;text-transform:none">${esc(it.adds || '')}${mate ? ' · avec ' + esc(mate.name) : ''}</p><button class="ghost" style="margin-top:8px" data-rw="${esc(c.name)}">♡ Wishlist</button></div></article>`;
      }).join('') || '<div class="empty">Pas de résultat, reformule.</div>';
      $$('[data-rw]', out).forEach((b) => (b.onclick = () => { const n = b.dataset.rw; if (!S.wishlist.includes(n)) S.wishlist.push(n); save(); b.textContent = '♥ Ajouté'; }));
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
      <div class="big-bottle"><i class="aura" style="background:${tint(p)}"></i>${bt(p, { spray: true })}</div>
      <div><h2>${esc(p.name)}</h2><p class="mono" style="margin-top:6px">${esc(p.house)} · ${esc(famLabel(p.family))}</p></div>
      <div class="chips">${(p.notes || []).map((n) => `<span class="chip">${esc(n)}</span>`).join('')}</div>
      <div class="card" style="display:grid;gap:8px"><div class="meter"><span>Projection</span>${dots(p.projection)}</div><div class="meter"><span>Tenue</span>${dots(p.longevity)}</div><div class="meter"><span>Poids</span>${dots(p.weight)}</div></div>
      <div><p class="mono">ma note</p><div class="stars" id="stars">${[1, 2, 3, 4, 5].map((i) => `<button data-r="${i}" aria-label="${i} sur 5">${i <= p.rating ? '★' : '☆'}</button>`).join('')}</div></div>
      <p style="color:var(--muted)">${esc(ago(daysSince(p.id)))}${p.price ? ' · ≈ ' + p.price + ' €' : ''}</p>
      <div class="row"><button class="ghost" id="sx">Fermer</button><button class="ghost danger" id="sdel">Retirer</button></div>`);
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
    el.innerHTML = `<i class="sb sb1"></i><i class="sb sb2"></i><div class="prog" id="prog"></div><div class="st-top"><span class="mono" id="stlabel">sillage</span><button class="st-x" id="stx" aria-label="Fermer">✕</button></div><div id="stage"></div>`;
    $('#stx').onclick = (e) => { e.stopPropagation(); closeStory(); };
    ST = { scenes: [], i: 0, R: null };
  }
  function closeStory() { $('#story').hidden = true; $('#story').innerHTML = ''; ST = null; document.body.style.overflow = ''; render(true); }
  function setHue(p) { $('#story').style.setProperty('--h', Art.pal(p).h); }
  function showLoading() {
    const ps = [...S.collection].sort(() => Math.random() - 0.5).slice(0, 3);
    setHue(ps[0]);
    $('#stage').innerHTML = `<div class="load-orbit center">${ps.map((p, i) => `<div class="bwrap" style="animation-delay:${-i * 1.83}s">${Art.bottle(p, {})}</div>`).join('')}</div>
      <div class="msgs center">${['Je lis ta journée…', 'Je sens ton étagère…', 'Je compose l\'accord…'].map((m, i) => `<span style="animation-delay:${i * 2.1}s">${m}</span>`).join('')}</div>`;
    $('#prog').innerHTML = '';
  }
  const condChips = (c) => [E.CONTEXTS[c.ctx], E.WITHS[c.with], E.MOMENTS[c.moment], Math.round(c.temp) + '°', E.MOODS[c.mood], E.STYLES[c.style] + (c.fabric ? ' · ' + E.FABRICS[c.fabric].toLowerCase() : '')];
  function buildScenes(R) {
    const p = R.pick, sc = [];
    const nW = (t) => String(t || '').split(/\s+/).filter(Boolean).length;
    sc.push({ label: R.ai ? 'ton nez ia' : 'sillage', dur: 6500, html: () => `<p class="mono rise">si je comprends bien</p><p class="lead">${words(R.read, 200)}</p><div class="chips" style="margin-top:6px">${condChips(R.cond).map((c, i) => `<span class="chip pop" style="--d:${900 + i * 130}">${esc(c)}</span>`).join('')}</div>` });
    sc.push({ label: 'ton parfum', dur: 7500, hue: p, html: () => `<div class="center" style="display:grid;gap:14px;justify-items:center"><p class="mono rise">ton parfum du jour</p><div class="hero-bottle"><i class="aura"></i>${bt(p, { spray: true, h: 300 })}</div><h2 class="rise" style="--d:500">${words(p.name, 400)}</h2><p class="soft rise" style="--d:1100">${esc(p.house)} · ${esc(famLabel(p.family))}</p><div class="vibes">${R.vibe.map((v, i) => `<span class="pop" style="--d:${1400 + i * 180}">${esc(v)}</span>`).join('')}</div></div>` });
    const n = p.notes || [], a = Math.ceil(n.length / 3);
    const lv = [['ouverture', n.slice(0, a)], ['cœur', n.slice(a, a * 2)], ['fond', n.slice(a * 2)]].filter((x) => x[1].length);
    sc.push({ label: 'ce que tu sentiras', dur: 7000, hue: p, html: () => `<p class="mono rise">ce que tu sentiras</p><div class="pyr">${lv.map(([l, arr], i) => `<div class="lv rise" style="--d:${300 + i * 450}"><span class="mono">${l}</span><b>${esc(arr.join(', '))}</b></div>`).join('')}</div><div class="meter-s rise" style="--d:1800"><span class="soft" style="width:92px">projection</span>${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= p.projection ? 'f' : ''}"></i>`).join('')}</div><div class="meter-s rise" style="--d:1950"><span class="soft" style="width:92px">tenue</span>${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= p.longevity ? 'f' : ''}"></i>`).join('')}</div>` });
    sc.push({ label: 'pourquoi lui', dur: clamp(3800 + nW(R.story) * 280, 6500, 15000), hue: p, html: () => `<p class="mono rise">pourquoi lui</p><p class="lead">${words(R.story, 250)}</p>${R.avoid ? `<p class="soft rise" style="--d:2600">À éviter aujourd'hui : ${esc(R.avoid)}</p>` : ''}` });
    R.layers.forEach((l) => sc.push({ label: 'layering', dur: 10000, hue: p, html: () => {
      const steps = String(l.how).split(/(?<=[.!])\s+/).filter(Boolean).slice(0, 3);
      return `<p class="mono rise">accord · ${'●'.repeat(l.score)}${'○'.repeat(5 - l.score)}</p><div class="merge"><i class="orb" style="background:linear-gradient(135deg,${Art.pal(p).b},${Art.pal(l.p).b})"></i><div class="bwrap la">${Art.bottle(p, { level: .6 })}</div><div class="bwrap lb">${Art.bottle(l.p, { level: .6 })}</div><span class="plus">+</span></div><h2 class="rise" style="--d:1500;font-size:clamp(26px,8vw,40px)">${esc(p.name)} <span style="opacity:.6">+</span> ${esc(l.p.name)}</h2><p class="lead rise" style="--d:1900;font-size:19px">${esc(l.effect)}</p><div class="steps">${steps.map((s, i) => `<div class="rise" style="--d:${2500 + i * 350}"><b>${i + 1}</b><span>${esc(s)}</span></div>`).join('')}</div>`;
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
    if (!(S.today && S.today.date === today() && S.today.pickId === p.id)) { S.log.push({ id: p.id, date: today() }); S.log = S.log.slice(-90); S.today = { date: today(), pickId: p.id }; save(); }
    btn.textContent = 'Porté aujourd\'hui ✓'; petals(p);
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

  // ---------- Démarrage ----------
  $('#dock').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { tab = b.dataset.tab; render(); } });
  $('#profileBtn').onclick = openProfile;
  render();
  initStore();
  initAI();
})();
