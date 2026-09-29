(function () {
  const E = window.Engine, CAT = window.CATALOG;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const KEY = 'parfumerie.v1';

  // ---------- Stockage ----------
  const DEFAULT = {
    collection: [], wishlist: [], log: [],
    settings: { budget: 150, liked: [], avoid: [], city: '', lat: null, lon: null },
    ctx: { ctx: 'perso', with: 'seul', moment: 'jour', mood: 'confiant', style: 'smart', color: 'neutre', fabric: '' },
  };
  let S;
  try { S = Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = JSON.parse(JSON.stringify(DEFAULT)); }
  S.settings = Object.assign({}, DEFAULT.settings, S.settings);
  S.ctx = Object.assign({}, DEFAULT.ctx, S.ctx);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* stockage indisponible */ } $('#count').textContent = S.collection.length + ' parfum' + (S.collection.length > 1 ? 's' : ''); };

  let tab = 'today';
  let W = { temp: 18, hum: 50, rain: false, label: '', place: '', manual: true, loading: false };
  let mainOverride = null; // id d'un parfum choisi à la main pour le layering
  let discoverMode = 'top';

  const daysSince = (id) => {
    const d = S.log.filter((l) => l.id === id).map((l) => l.date).sort().pop();
    if (!d) return null;
    return Math.round((new Date(new Date().toDateString()) - new Date(d + 'T00:00:00')) / 864e5);
  };
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const stars = (n) => '<span class="stars" aria-label="' + n + ' sur 5">' + '★'.repeat(n) + '☆'.repeat(5 - n) + '</span>';
  const cond = () => Object.assign({}, S.ctx, { temp: W.temp, hum: W.hum, rain: W.rain });

  // ---------- Météo (Open-Meteo, sans clé) ----------
  const WMO = (c) => (c === 0 ? ['☀️', 'Dégagé'] : c <= 3 ? ['⛅', 'Nuageux'] : c <= 48 ? ['🌫️', 'Brouillard'] : c <= 57 ? ['🌦️', 'Bruine'] : c <= 67 ? ['🌧️', 'Pluie'] : c <= 77 ? ['❄️', 'Neige'] : c <= 82 ? ['🌧️', 'Averses'] : c <= 86 ? ['❄️', 'Neige'] : ['⛈️', 'Orage']);
  async function fetchWeather(lat, lon, place) {
    W.loading = true; renderWeather();
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code&timezone=auto`);
      const j = (await r.json()).current;
      const [emoji, txt] = WMO(j.weather_code);
      W = { temp: Math.round(j.apparent_temperature), hum: j.relative_humidity_2m, rain: (j.weather_code >= 51 && j.weather_code <= 67) || (j.weather_code >= 80 && j.weather_code <= 99), label: emoji + ' ' + txt, place: place || '', manual: false, loading: false };
    } catch (e) { W.loading = false; W.error = 'Météo indisponible : règle la température à la main.'; }
    renderWeather(); renderResults();
  }
  async function locate() {
    const s = S.settings;
    if (s.lat != null) return fetchWeather(s.lat, s.lon, s.city);
    if (s.city) return geocode(s.city);
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) => fetchWeather(p.coords.latitude, p.coords.longitude, 'Ma position'), () => { W.error = 'Localisation refusée : indique une ville dans Réglages ou règle la température.'; renderWeather(); }, { timeout: 8000 });
  }
  async function geocode(city) {
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr`);
      const g = ((await r.json()).results || [])[0];
      if (!g) { W.error = 'Ville introuvable.'; return renderWeather(); }
      S.settings.lat = g.latitude; S.settings.lon = g.longitude; S.settings.city = g.name; save();
      fetchWeather(g.latitude, g.longitude, g.name);
    } catch (e) { W.error = 'Météo indisponible : règle la température à la main.'; renderWeather(); }
  }

  // ---------- Helpers UI ----------
  function chipGroup(label, key, opts, allowNone) {
    const cur = S.ctx[key];
    return `<div class="group"><label>${label}</label><div class="chips" data-key="${key}">` +
      (allowNone ? `<button class="chip ${cur === '' ? 'on' : ''}" data-v="">—</button>` : '') +
      Object.entries(opts).map(([k, v]) => `<button class="chip ${cur === k ? 'on' : ''}" data-v="${k}">${esc(v)}</button>`).join('') + '</div></div>';
  }
  const famLabel = (f) => (E.FAMILIES[f] ? E.FAMILIES[f].label : 'À compléter');

  // ---------- Onglet Aujourd'hui ----------
  function viewToday() {
    $('#view').innerHTML = `
      <div class="card" id="wx"></div>
      ${chipGroup('Type de journée', 'ctx', E.CONTEXTS)}
      ${chipGroup('Avec qui', 'with', E.WITHS)}
      ${chipGroup('Moment', 'moment', E.MOMENTS)}
      ${chipGroup('Mood', 'mood', E.MOODS)}
      ${chipGroup('Tenue — style', 'style', E.STYLES)}
      ${chipGroup('Tenue — couleur', 'color', E.COLORS)}
      ${chipGroup('Tenue — matière (optionnel)', 'fabric', E.FABRICS, true)}
      <div id="results"></div>`;
    renderWeather(); renderResults();
  }

  function renderWeather() {
    const el = $('#wx'); if (!el) return;
    el.innerHTML = `
      <div class="wx">
        <div class="t">${Math.round(W.temp)}°</div>
        <div class="grow"><div>${esc(W.label || (W.manual ? 'Réglage manuel' : ''))}${W.place ? ' · ' + esc(W.place) : ''}</div>
        <div class="muted small">${esc(E.weatherLabel(W))}${W.hum ? ' · humidité ' + W.hum + '%' : ''}${W.rain ? ' · pluie' : ''}</div></div>
        <button class="btn ghost sm" data-act="locate">${W.loading ? '…' : '📍 Actualiser'}</button>
      </div>
      <input type="range" id="tempr" min="-5" max="42" value="${Math.round(W.temp)}" aria-label="Température ressentie" style="margin-top:10px;padding:0">
      ${W.error ? `<div class="muted small" style="margin-top:6px">${esc(W.error)}</div>` : ''}`;
  }

  function renderResults() {
    const el = $('#results'); if (!el) return;
    if (!S.collection.length) {
      el.innerHTML = `<div class="card empty">Ta collection est vide.<br><br><button class="btn" data-act="goto" data-to="collection">Ajouter mes parfums</button></div>`;
      return;
    }
    const st = { daysSince };
    const ranked = E.rank(S.collection, cond(), st);
    const chosen = mainOverride && ranked.find((r) => r.p.id === mainOverride);
    const top = chosen || ranked[0];
    const alts = ranked.filter((r) => r !== top).slice(0, 3);
    const p = top.p;
    const lay = S.collection.length > 1 ? E.layering(p, S.collection, cond(), st, 3) : [];
    const worn = daysSince(p.id) === 0;
    el.innerHTML = `
      <div class="card hero">
        <div class="muted small">${chosen ? 'Ton choix' : 'Mon conseil du jour'}</div>
        <div class="name">${esc(p.name)}</div>
        <div class="house">${esc(p.house || '')} · ${esc(famLabel(p.family))} ${stars(p.rating || 3)}</div>
        <div class="notes">${esc((p.notes || []).join(' · '))}</div>
        <ul class="why">${top.reasons.map((r) => `<li>${esc(r)}</li>`).join('') || '<li>Le meilleur compromis dans ta collection aujourd\'hui</li>'}</ul>
        <div class="row" style="margin-top:12px"><button class="btn" data-act="wear" data-id="${p.id}" ${worn ? 'disabled' : ''}>${worn ? '✓ Porté aujourd\'hui' : 'Je le porte'}</button>
        ${chosen ? '<button class="btn ghost" data-act="unpick">Revenir au conseil</button>' : ''}</div>
      </div>
      <h2>Layering</h2>
      ${lay.length ? lay.map((l) => `
        <div class="card layer">
          <div class="row sp"><div class="name" style="font-size:18px">${esc(p.name)} + ${esc(l.b.name)}</div><span class="tag gold">${esc(l.level)}</span></div>
          <div class="house">${esc(l.b.house || '')} · ${esc(famLabel(l.b.family))}</div>
          <p style="margin:8px 0 4px">${esc(l.what)}</p>
          <div class="muted small">${esc(l.how)}</div>
          ${l.tip ? `<div class="small" style="color:var(--warn);margin-top:4px">👕 ${esc(l.tip)}</div>` : ''}
        </div>`).join('') : '<div class="card muted">Ajoute au moins 2 parfums pour obtenir des idées de layering.</div>'}
      ${alts.length ? `<h2 style="margin-top:22px">Autres options</h2>` + alts.map((r) => `
        <div class="card alt" data-act="pick" data-id="${r.p.id}">
          <div class="row sp"><div><b>${esc(r.p.name)}</b> <span class="house">${esc(r.p.house || '')}</span></div><span class="tag">${esc(famLabel(r.p.family))}</span></div>
          <div class="bar" style="margin-top:8px"><i style="width:${Math.max(8, Math.min(100, (r.total / top.total) * 100))}%"></i></div>
          <div class="muted small" style="margin-top:6px">${esc(r.reasons[0] || '')} · touche pour voir son layering</div>
        </div>`).join('') : ''}`;
  }

  // ---------- Onglet Collection ----------
  function viewCollection() {
    const list = [...S.collection].sort((a, b) => a.name.localeCompare(b.name));
    $('#view').innerHTML = `
      <div class="row sp" style="margin:8px 0"><h2 style="margin:0">Ma collection</h2>
        <div class="row"><button class="btn ghost sm" data-act="bulk">Ajout rapide</button><button class="btn sm" data-act="add">+ Ajouter</button></div></div>
      ${list.length ? list.map((p) => `
        <div class="card">
          <div class="row sp"><div class="grow"><div class="name" style="font-size:19px">${esc(p.name)}</div>
            <div class="house">${esc(p.house || '')} · ${esc(famLabel(p.family))} ${stars(p.rating || 3)}</div></div>
            <div class="row"><button class="btn ghost sm" data-act="edit" data-id="${p.id}">Modifier</button></div></div>
          <div class="notes">${esc((p.notes || []).join(' · '))}</div>
          <div class="row wrap" style="margin-top:8px">
            ${!p.family ? '<span class="tag warn">à compléter</span>' : ''}
            ${p.size ? `<span class="tag">${p.size} ml</span>` : ''}
            <span class="tag">projection ${p.projection || 3}/5</span><span class="tag">tenue ${p.longevity || 3}/5</span>
            ${daysSince(p.id) != null ? `<span class="tag">porté il y a ${daysSince(p.id)} j</span>` : ''}
          </div>
        </div>`).join('') : `<div class="card empty">Rien ici pour l'instant.<br>Utilise <b>Ajout rapide</b> pour coller toute ta liste d'un coup.</div>`}`;
  }

  const OCC = ['pro', 'perso', 'date', 'event', 'famille', 'amis'];
  function openForm(p) {
    const isNew = !p;
    p = p || { name: '', house: '', family: '', notes: [], projection: 3, longevity: 3, weight: 3, rating: 4, size: '', occ: [] };
    const dl = $('#dlg');
    const num = (k, lo, hi, v) => `<select id="f-${k}">${Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((n) => `<option ${n === v ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
    dl.innerHTML = `<form method="dialog" id="pf">
      <h2>${isNew ? 'Ajouter un parfum' : 'Modifier'}</h2>
      <label class="f">Nom (les suggestions remplissent la fiche)</label>
      <input id="f-name" list="catlist" value="${esc(p.name)}" required autocomplete="off">
      <datalist id="catlist">${CAT.map((c) => `<option value="${esc(c.name)}">${esc(c.house)}</option>`).join('')}</datalist>
      <div class="grid2"><div><label class="f">Maison</label><input id="f-house" value="${esc(p.house || '')}"></div>
      <div><label class="f">Famille</label><select id="f-family"><option value="">— choisir —</option>${Object.entries(E.FAMILIES).map(([k, v]) => `<option value="${k}" ${p.family === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div></div>
      <label class="f">Notes (séparées par des virgules)</label><input id="f-notes" value="${esc((p.notes || []).join(', '))}">
      <div class="grid2"><div><label class="f">Projection (1 discret – 5 puissant)</label>${num('projection', 1, 5, p.projection || 3)}</div>
      <div><label class="f">Tenue (1 – 5)</label>${num('longevity', 1, 5, p.longevity || 3)}</div>
      <div><label class="f">Poids (1 frais/léger – 5 chaud/dense)</label>${num('weight', 1, 5, p.weight || 3)}</div>
      <div><label class="f">Ma note (1 – 5)</label>${num('rating', 1, 5, p.rating || 4)}</div></div>
      <label class="f">Taille du flacon (ml, optionnel)</label><input id="f-size" type="number" min="1" value="${esc(p.size || '')}">
      <label class="f">Je le porte pour (optionnel, il sera favorisé)</label>
      <div class="chips" id="f-occ">${OCC.map((o) => `<button type="button" class="chip ${(p.occ || []).includes(o) ? 'on' : ''}" data-o="${o}">${E.CONTEXTS[o]}</button>`).join('')}</div>
      <div class="row sp" style="margin-top:18px">
        ${isNew ? '<span></span>' : '<button type="button" class="btn ghost danger" id="f-del">Supprimer</button>'}
        <div class="row"><button type="button" class="btn ghost" id="f-cancel">Annuler</button><button class="btn" value="ok">Enregistrer</button></div></div>
    </form>`;
    dl.showModal();
    $('#f-name').addEventListener('change', () => {
      const c = CAT.find((x) => E.norm(x.name) === E.norm($('#f-name').value));
      if (!c) return;
      $('#f-house').value = c.house; $('#f-family').value = c.family; $('#f-notes').value = c.notes.join(', ');
      $('#f-projection').value = c.projection; $('#f-longevity').value = c.longevity; $('#f-weight').value = c.weight;
    });
    $('#f-occ').addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) b.classList.toggle('on'); });
    $('#f-cancel').onclick = () => dl.close();
    if (!isNew) $('#f-del').onclick = () => { if (confirm('Supprimer ' + p.name + ' ?')) { S.collection = S.collection.filter((x) => x.id !== p.id); save(); dl.close(); render(); } };
    $('#pf').onsubmit = () => {
      const np = {
        id: p.id || uid(), name: $('#f-name').value.trim(), house: $('#f-house').value.trim(), family: $('#f-family').value,
        notes: $('#f-notes').value.split(',').map((s) => s.trim()).filter(Boolean),
        projection: +$('#f-projection').value, longevity: +$('#f-longevity').value, weight: +$('#f-weight').value, rating: +$('#f-rating').value,
        size: +$('#f-size').value || '', occ: [...document.querySelectorAll('#f-occ .chip.on')].map((b) => b.dataset.o),
      };
      if (!np.name) return;
      const i = S.collection.findIndex((x) => x.id === np.id);
      if (i >= 0) S.collection[i] = np; else S.collection.push(np);
      save(); render();
    };
  }

  function openBulk() {
    const dl = $('#dlg');
    dl.innerHTML = `<form method="dialog" id="bf"><h2>Ajout rapide</h2>
      <p class="muted small">Un parfum par ligne : <b>Nom - Maison</b> (la maison est facultative). Ceux qui sont dans le catalogue sont remplis automatiquement (famille, notes, puissance). Les autres sont marqués « à compléter ».</p>
      <textarea id="bulk" placeholder="Sauvage - Dior&#10;Santal 33&#10;Un parfum inconnu - Maison X"></textarea>
      <div class="row sp" style="margin-top:14px"><button type="button" class="btn ghost" id="b-cancel">Annuler</button><button class="btn">Ajouter</button></div></form>`;
    dl.showModal();
    $('#b-cancel').onclick = () => dl.close();
    $('#bf').onsubmit = () => {
      let added = 0;
      for (const line of $('#bulk').value.split('\n')) {
        const [nameRaw, houseRaw] = line.split(/\s[-–—]\s|,/).map((s) => (s || '').trim());
        if (!nameRaw) continue;
        const n = E.norm(nameRaw);
        const c = CAT.find((x) => E.norm(x.name) === n) || CAT.find((x) => n.length >= 4 && (E.norm(x.name).includes(n) || n.includes(E.norm(x.name))) && (!houseRaw || E.norm(x.house).includes(E.norm(houseRaw)) || E.norm(houseRaw).includes(E.norm(x.house))));
        if (S.collection.some((p) => E.norm(p.name) === E.norm(c ? c.name : nameRaw))) continue;
        S.collection.push(c ? { id: uid(), name: c.name, house: c.house, family: c.family, notes: [...c.notes], projection: c.projection, longevity: c.longevity, weight: c.weight, rating: 4, size: '', occ: [] }
          : { id: uid(), name: nameRaw, house: houseRaw || '', family: '', notes: [], projection: 3, longevity: 3, weight: 3, rating: 3, size: '', occ: [] });
        added++;
      }
      if (added) tab = 'collection';
      save(); render();
    };
  }

  // ---------- Onglet Découvrir ----------
  function viewDiscover() {
    const s = S.settings;
    const recs = E.recommend(CAT, S.collection, S.wishlist, s);
    const inB = recs.filter((r) => !r.overBudget);
    const sorters = { top: (a, b) => b.total - a.total, taste: (a, b) => b.taste - a.taste, gap: (a, b) => b.gap - a.gap };
    const list = inB.sort(sorters[discoverMode]).slice(0, 8);
    const prof = E.tasteProfile(S.collection, s);
    const favs = Object.entries(prof.fam).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const cov = E.coverage(S.collection).filter((c) => c.best < 9).slice(0, 3);
    $('#view').innerHTML = `
      <h2>Découvrir</h2>
      <div class="card">
        <div class="row sp"><b>Budget par flacon</b><b id="bval">${s.budget ? s.budget + ' €' : 'illimité'}</b></div>
        <input type="range" id="budget" min="0" max="400" step="10" value="${s.budget || 0}" style="padding:0;margin-top:8px" aria-label="Budget par flacon">
        <div class="muted small">0 = pas de limite. Prix indicatifs (flacon standard), à vérifier chez le vendeur.</div>
        ${favs.length ? `<div class="group"><label>Ton profil olfactif</label>${favs.map(([f, v]) => `<div class="row small" style="margin:4px 0"><span style="width:90px">${esc(famLabel(f))}</span><div class="bar grow"><i style="width:${Math.round(v * 100)}%"></i></div></div>`).join('')}</div>` : '<div class="muted small" style="margin-top:8px">Ajoute des parfums et note-les : c\'est ce qui affine tes recommandations.</div>'}
        ${cov.length ? `<div class="muted small" style="margin-top:8px">Trous dans ta collection : ${cov.map((c) => esc(c.sc.label)).join(', ')}.</div>` : ''}
      </div>
      <div class="seg" id="seg">
        <button data-m="top" class="${discoverMode === 'top' ? 'on' : ''}">Meilleurs achats</button>
        <button data-m="taste" class="${discoverMode === 'taste' ? 'on' : ''}">Selon mes goûts</button>
        <button data-m="gap" class="${discoverMode === 'gap' ? 'on' : ''}">Combler un manque</button></div>
      ${list.length ? list.map((r) => `
        <div class="card">
          <div class="row sp"><div class="grow"><div class="name" style="font-size:19px">${esc(r.c.name)}</div><div class="house">${esc(r.c.house)} · ${esc(famLabel(r.c.family))}</div></div>
            <div style="text-align:right"><b>≈ ${r.c.price} €</b><div class="muted small">${r.pct}% affinité</div></div></div>
          <div class="notes">${esc(r.c.notes.join(' · '))}</div>
          <ul class="why">
            ${r.hits.length ? `<li>Tu aimes déjà : ${esc(r.hits.join(', '))}</li>` : ''}
            ${r.gapLabel ? `<li>Comble un manque : ${esc(r.gapLabel)}</li>` : ''}
            ${r.mates.length ? `<li>Se marie en layering avec ${esc(r.mates.map((m) => m.name).join(', '))}</li>` : ''}
          </ul>
          <div class="row" style="margin-top:10px"><button class="btn ${r.wished ? '' : 'ghost'} sm" data-act="wish" data-name="${esc(r.c.name)}">${r.wished ? '♥ Dans ma wishlist' : '♡ Wishlist'}</button>
            <button class="btn ghost sm" data-act="own" data-name="${esc(r.c.name)}">Je l'ai déjà</button></div>
        </div>`).join('') : '<div class="card empty">Rien dans ce budget. Augmente-le un peu.</div>'}
      ${S.wishlist.length ? `<h2 style="margin-top:22px">Ma wishlist</h2><div class="card">${S.wishlist.map((n) => { const c = CAT.find((x) => x.name === n); return `<div class="row sp" style="margin:6px 0"><span>${esc(n)} <span class="muted small">${c ? '≈ ' + c.price + ' €' : ''}</span></span><button class="btn ghost sm" data-act="wish" data-name="${esc(n)}">Retirer</button></div>`; }).join('')}</div>` : ''}`;
  }

  // ---------- Onglet Réglages ----------
  function viewSettings() {
    const s = S.settings;
    $('#view').innerHTML = `
      <h2>Réglages</h2>
      <div class="card">
        <label class="f" style="margin-top:0">Ville pour la météo (sinon, ta position)</label>
        <div class="row"><input id="city" value="${esc(s.city)}" placeholder="Paris"><button class="btn sm" data-act="setcity">OK</button></div>
        <label class="f">Notes que j'adore (virgules)</label><input id="liked" value="${esc(s.liked.join(', '))}" placeholder="vanille, oud, bergamote">
        <label class="f">Notes que je ne supporte pas (virgules)</label><input id="avoid" value="${esc(s.avoid.join(', '))}" placeholder="patchouli, aldéhydes">
        <div style="margin-top:12px"><button class="btn" data-act="savepref">Enregistrer</button></div>
      </div>
      <div class="card"><b>Sauvegarde</b><div class="muted small">Tout est stocké sur cet appareil. Exporte de temps en temps.</div>
        <div class="row wrap" style="margin-top:10px"><button class="btn ghost sm" data-act="export">Exporter (JSON)</button>
        <label class="btn ghost sm" style="cursor:pointer">Importer<input type="file" id="imp" accept="application/json" hidden></label>
        <button class="btn ghost sm danger" data-act="reset">Tout effacer</button></div></div>`;
    $('#imp').onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then((t) => { try { const d = JSON.parse(t); if (!Array.isArray(d.collection)) throw 0; S = Object.assign({}, DEFAULT, d); S.settings = Object.assign({}, DEFAULT.settings, d.settings); S.ctx = Object.assign({}, DEFAULT.ctx, d.ctx); save(); render(); } catch (err) { alert('Fichier invalide.'); } });
    };
  }

  // ---------- Événements ----------
  document.addEventListener('click', (e) => {
    const t = e.target;
    const tabBtn = t.closest('#tabs button');
    if (tabBtn) { tab = tabBtn.dataset.tab; return render(); }
    const chip = t.closest('.chips[data-key] .chip');
    if (chip) {
      const g = chip.parentElement;
      S.ctx[g.dataset.key] = chip.dataset.v; save();
      g.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c === chip));
      mainOverride = null; return renderResults();
    }
    const seg = t.closest('#seg button');
    if (seg) { discoverMode = seg.dataset.m; return viewDiscover(); }
    const a = t.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act, id = a.dataset.id, name = a.dataset.name;
    if (act === 'locate') { S.settings.lat = null; W.error = ''; locate(); }
    else if (act === 'goto') { tab = a.dataset.to; render(); }
    else if (act === 'wear') { S.log.push({ id, date: today() }); save(); renderResults(); }
    else if (act === 'pick') { mainOverride = id; renderResults(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (act === 'unpick') { mainOverride = null; renderResults(); }
    else if (act === 'add') openForm();
    else if (act === 'bulk') openBulk();
    else if (act === 'edit') openForm(S.collection.find((p) => p.id === id));
    else if (act === 'wish') { S.wishlist = S.wishlist.includes(name) ? S.wishlist.filter((n) => n !== name) : [...S.wishlist, name]; save(); viewDiscover(); }
    else if (act === 'own') {
      const c = CAT.find((x) => x.name === name);
      if (c && !S.collection.some((p) => E.norm(p.name) === E.norm(name))) S.collection.push({ id: uid(), ...c, notes: [...c.notes], rating: 4, size: '', occ: [] });
      S.wishlist = S.wishlist.filter((n) => n !== name); save(); viewDiscover();
    }
    else if (act === 'setcity') { const v = $('#city').value.trim(); S.settings.lat = null; S.settings.city = v; save(); if (v) geocode(v); }
    else if (act === 'savepref') {
      const split = (v) => v.split(',').map((x) => x.trim()).filter(Boolean);
      S.settings.liked = split($('#liked').value); S.settings.avoid = split($('#avoid').value); save(); a.textContent = 'Enregistré ✓';
    }
    else if (act === 'export') {
      const url = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
      const l = document.createElement('a'); l.href = url; l.download = 'ma-parfumerie.json'; l.click(); URL.revokeObjectURL(url);
    }
    else if (act === 'reset') { if (confirm('Effacer toute ta collection et tes réglages ?')) { S = JSON.parse(JSON.stringify(DEFAULT)); save(); render(); } }
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'tempr') { W.temp = +e.target.value; W.manual = true; W.label = ''; W.place = ''; W.error = ''; const t = $('#wx .t'); if (t) t.textContent = W.temp + '°'; renderResultsSoon(); }
    else if (e.target.id === 'budget') { S.settings.budget = +e.target.value; $('#bval').textContent = S.settings.budget ? S.settings.budget + ' €' : 'illimité'; renderDiscoverSoon(); }
  });
  let tmr1, tmr2;
  const renderResultsSoon = () => { clearTimeout(tmr1); tmr1 = setTimeout(() => { renderWeather(); renderResults(); }, 150); };
  const renderDiscoverSoon = () => { clearTimeout(tmr2); tmr2 = setTimeout(() => { save(); viewDiscover(); const b = $('#budget'); if (b) b.focus(); }, 250); };

  function render() {
    const dl = $('#dlg'); if (dl.open) dl.close();
    document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    ({ today: viewToday, collection: viewCollection, discover: viewDiscover, settings: viewSettings })[tab]();
    save(); window.scrollTo(0, 0);
  }

  render();
  locate();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
