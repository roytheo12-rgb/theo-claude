// Démo publique : remplace l'IA de claude.ai par un petit serveur (Worker) qui limite chaque visiteur à 2 essais.
(function () {
  'use strict';
  const MAX = 2;
  let left = MAX, identLeft = 6, vid;
  try { vid = localStorage.getItem('sillage.vid'); if (!vid) { vid = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2) + Date.now().toString(16) + 'abcdef0123'); localStorage.setItem('sillage.vid', vid); } } catch (e) { vid = 'anon-' + Math.random().toString(16).slice(2) + Date.now().toString(16) + '0000'; }
  const headers = () => ({ 'content-type': 'application/json', 'x-visitor': vid });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  async function refresh() {
    if (token) { try { await loadMe(); if (ME) { left = Math.max(0, ME.limits.adv - ME.usage.adv); identLeft = Math.max(0, ME.limits.ident - ME.usage.ident); return; } } catch (e) { /* hors ligne */ } }
    try { const r = await fetch('/api/quota', { headers: headers() }); const j = await r.json(); if (typeof j.left === 'number') left = j.left; if (typeof j.identLeft === 'number') identLeft = j.identLeft; } catch (e) { /* hors ligne */ }
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 900 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); resolve({ media_type: 'image/jpeg', data: c.toDataURL('image/jpeg', .82).split(',')[1] });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img')); };
      img.src = url;
    });
  }

  async function day(args, photo) {
    const body = Object.assign({}, args);
    if (photo) { try { body.image = await toBase64(photo); } catch (e) { /* sans photo */ } }
    let r;
    try { r = await fetch('/api/day', { method: 'POST', headers: headers(), body: JSON.stringify(body) }); } catch (e) { throw { code: 'network' }; }
    const j = await r.json().catch(() => ({}));
    if (r.status === 429) { left = 0; upsell(j.code === 'busy' ? 'busy' : j.code === 'verify' ? 'verify' : 'quota'); throw { code: 'rate_limited' }; }
    if (!r.ok) throw { code: 'server' };
    if (typeof j.left === 'number') left = j.left;
    return j.data;
  }

  // Conseil sur mesure à partir d'un besoin libre (même quota que le conseil du jour).
  async function need(args) {
    let r; try { r = await fetch('/api/need', { method: 'POST', headers: headers(), body: JSON.stringify(args) }); } catch (e) { throw { code: 'network' }; }
    const j = await r.json().catch(() => ({}));
    if (r.status === 429) { left = 0; upsell(j.code === 'busy' ? 'busy' : j.code === 'verify' ? 'verify' : 'quota'); throw { code: 'rate_limited' }; }
    if (!r.ok) throw { code: 'server' };
    if (typeof j.left === 'number') left = j.left;
    return j.data;
  }

  // Identification d'un parfum (nom, image ou lien) par une IA légère : quota à part, quasi gratuit.
  async function identify({ text, url, file }) {
    const body = { text: text || '' };
    if (url) body.url = url;
    if (file) { try { body.image = await toBase64(file); } catch (e) { /* sans image */ } }
    let r; try { r = await fetch('/api/identify', { method: 'POST', headers: headers(), body: JSON.stringify(body) }); } catch (e) { throw { code: 'network' }; }
    const j = await r.json().catch(() => ({}));
    if (r.status === 429) { identLeft = 0; throw { code: 'rate_limited' }; }
    if (!r.ok) throw { code: 'server' };
    if (typeof j.identLeft === 'number') identLeft = j.identLeft;
    return j.data;
  }
  const confirm = (names) => { if (names && names.length) fetch('/api/catalog/confirm', { method: 'POST', headers: headers(), body: JSON.stringify({ names }) }).catch(() => {}); };
  const catalog = async () => { try { const r = await fetch('/api/catalog'); const j = await r.json(); return j.items || []; } catch (e) { return []; } };


  // ---- Compte : email + mot de passe, profil complet sauvegardé côté serveur
  let token = null, acctEmail = '';
  try { token = localStorage.getItem('sillage.tok') || null; acctEmail = localStorage.getItem('sillage.email') || ''; } catch (e) { /* ok */ }
  const setSession = (t, email) => { token = t; acctEmail = email || ''; try { if (t) { localStorage.setItem('sillage.tok', t); localStorage.setItem('sillage.email', acctEmail); localStorage.setItem('sillage.acct', 'done'); } else { localStorage.removeItem('sillage.tok'); localStorage.removeItem('sillage.email'); } } catch (e) { /* ok */ } };
  async function call(sub, method, body) {
    let r; try { r = await fetch('/api/account/' + sub, { method, headers: Object.assign({ 'content-type': 'application/json' }, token ? { authorization: 'Bearer ' + token } : {}), body: body ? JSON.stringify(body) : undefined }); } catch (e) { throw { code: 'network' }; }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { if (r.status === 401 && token && sub !== 'login') { setSession(null); try { window.dispatchEvent(new Event('sillage:expired')); } catch (e) { /* ok */ } } throw { code: j.code || 'server', status: r.status }; }
    return j;
  }
  // On n'envoie pas les grosses images intégrées (la limite est de 900 Ko) : les photos de la base, elles, sont rechargées par leur nom.
  const lite = (S) => JSON.parse(JSON.stringify(S, (k, v) => (typeof v === 'string' && v.startsWith('data:') && v.length > 40000 ? undefined : v)));
  const account = {
    loggedIn: () => !!token, email: () => acctEmail,
    signup: async (email, password) => { const j = await call('signup', 'POST', { email, password }); setSession(j.token, email.trim().toLowerCase()); refresh(); return j; },
    login: async (email, password) => { const j = await call('login', 'POST', { email, password }); setSession(j.token, email.trim().toLowerCase()); refresh(); return j; },
    push: (S) => call('data', 'PUT', { data: lite(S) }),
    pull: () => call('data', 'GET'),
    forgot: (email) => call('forgot', 'POST', { email }),
    reset: async (tk, password) => { const j = await call('reset', 'POST', { token: tk, password }); setSession(j.token, j.email); refresh(); return j; },
    logout: async () => { try { await call('logout', 'POST', {}); } catch (e) { /* session déjà expirée */ } setSession(null); },
    remove: async () => { await call('delete', 'POST', {}); setSession(null); },
  };

  // ---- Offre, profil, communauté, éditeur
  let ME = null;
  const CFG = window.SILLAGE_CFG || {};
  const authH = () => Object.assign({ 'content-type': 'application/json' }, token ? { authorization: 'Bearer ' + token } : {});
  async function loadMe() { if (!token) { ME = null; return null; } ME = await call('me', 'GET'); try { window.dispatchEvent(new Event('sillage:me')); } catch (e) { /* ok */ } return ME; }
  async function api(path, method, body) {
    let r; try { r = await fetch(path, { method: method || 'GET', headers: authH(), body: body ? JSON.stringify(body) : undefined }); } catch (e) { throw { code: 'network' }; }
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 && token) { setSession(null); try { window.dispatchEvent(new Event('sillage:expired')); } catch (e) { /* ok */ } }
    if (!r.ok) throw { code: j.code || 'server', status: r.status };
    return j;
  }
  function squareJpeg(file, size) {
    return new Promise((resolve, reject) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => { const c = document.createElement('canvas'); c.width = c.height = size; const k = Math.max(size / img.width, size / img.height), w = img.width * k, h = img.height * k; c.getContext('2d').drawImage(img, (size - w) / 2, (size - h) / 2, w, h); URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', .8)); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img')); };
      img.src = url;
    });
  }
  const sub = {
    me: () => ME, load: loadMe, cfg: CFG, isAdmin: () => !!(ME && ME.admin),
    activate: async (license) => { const j = await call('activate', 'POST', { license }); ME = j.me; try { window.dispatchEvent(new Event('sillage:me')); } catch (e) { /* ok */ } await refresh(); return j; },
    saveProfile: async (p) => { const j = await call('profile', 'PUT', p); ME = j.me; return j; },
    avatar: (file) => squareJpeg(file, 160),
    community: { creator: (by) => fetch('/api/share/u/' + by).then((r) => { if (!r.ok) throw { code: 'server' }; return r.json(); }), list: () => api('/api/community'), publish: (rec) => api('/api/community', 'POST', rec), remove: (id) => api('/api/community/' + id, 'DELETE'), like: (id) => api('/api/community/' + id + '/like', 'POST', {}), report: (id) => api('/api/community/' + id + '/report', 'POST', {}) },
    admin: { edit: (op) => api('/api/admin/content', 'PUT', op), stats: () => api('/api/admin/stats'), support: () => api('/api/admin/support'), supportDone: (id) => api('/api/admin/support/' + id, 'DELETE'), moderation: () => api('/api/admin/moderation'), moderate: (id, action) => api('/api/admin/moderation/' + id, 'POST', { action }),
      backup: async () => { const r = await fetch('/api/admin/backup', { headers: authH() }); if (!r.ok) throw { code: 'server' }; return r.text(); } },
    social: {
      caps: { brand: true, stats: true },
      follow: (by, on) => api('/api/follow', 'POST', { by, on }), following: () => api('/api/following'),
      feed: (scope, before) => api('/api/feed?scope=' + (scope === 'follow' ? 'follow' : 'all') + (before ? '&before=' + before : '')),
      post: (b) => api('/api/post', 'POST', b), delPost: (id) => api('/api/post/' + id, 'DELETE'), reportPost: (id) => api('/api/post/' + id + '/report', 'POST', {}),
      profile: (by) => api('/api/u/' + by),
      rate: (b) => api('/api/rating', 'PUT', b), unrate: (h, n) => api('/api/rating?h=' + encodeURIComponent(h) + '&n=' + encodeURIComponent(n), 'DELETE'),
      ratings: (h, n) => api('/api/ratings?h=' + encodeURIComponent(h) + '&n=' + encodeURIComponent(n)),
      wishlist: (pub, items) => api('/api/wishlist', 'PUT', { pub, items }), wishlistPub: () => api('/api/wishlist'),
      view: (b) => { try { fetch('/api/view', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }).catch(() => {}); } catch (e) { /* mesure facultative */ } },
      myStats: () => api('/api/my/stats'), brandMe: () => api('/api/brand/me'), brandApply: (b) => api('/api/brand/apply', 'POST', b),
      adminBrands: () => api('/api/admin/brands'), brandAct: (by, action) => api('/api/admin/brands/' + by, 'POST', { action }),
      adminPosts: () => api('/api/admin/posts'), postAct: (id, action) => api('/api/admin/posts/' + id, 'POST', { action }),
    },
    verified: () => !ME || ME.verified !== false, resend: () => call('resend', 'POST', {}),
    support: (message, email, kind) => api('/api/support', 'POST', { message, email, kind }),
    track: (e) => { if (token) fetch('/api/track', { method: 'POST', headers: authH(), body: JSON.stringify({ e }) }).catch(() => {}); },
    content: () => Promise.race([fetch('/api/content', { cache: 'no-store' }).then((r) => r.json()), new Promise((res) => setTimeout(() => res(null), 2500))]).catch(() => null),
  };
  Object.assign(account, { me: () => ME });

  const TEXT = {
    quota: ['Tes 2 essais sont utilisés', 'Tu as vu ce que fait Sillage. Laisse ton email : je t\'envoie l\'accès complet, et je peux préparer une version sur mesure pour ta collection ou ton activité.'],
    locked: ['Réservé à la version complète', 'Cette fonction (ajout par IA, labo d\'accords, semaine, voyage…) est dans la version complète. Laisse ton email pour l\'obtenir.'],
    cta: ['Ton Sillage, sur mesure', 'Laisse ton email : je te recontacte pour construire la version qui contient ta vraie collection, tes habitudes et l\'IA sans limite d\'essais.'],
    busy: ['La démo fait une pause', 'Elle est très demandée aujourd\'hui et reprend demain. Laisse ton email, je te préviens.'],
  };
  // ---- Les offres : ce qu'on a, ce qu'on peut avoir, et où entrer sa clé Whop
  const OFFERS = [
    ['free', 'Gratuit', '0 €', ['3 conseils IA par mois', '20 échanges avec le parfumier', 'Collection jusqu\'à 12 parfums', '2 inspirations privées']],
    ['premium', 'Premium', '5,99 € TTC par mois', ['Ou 49 € TTC par an', '40 conseils IA par mois', '200 échanges avec le parfumier', 'Collection illimitée', 'Inspirations privées et publiques']],
    ['founder', 'Membre fondateur', '99 € TTC à vie', ['Un seul paiement, pour toujours', 'Tout le Premium, sans abonnement', 'Limité aux 50 premiers membres']],
  ];
  function plans(reason) {
    const H = window.SillageHooks; if (!H) return;
    const m = ME || { plan: 'free', label: 'Gratuit', usage: { adv: 0, chat: 0 }, limits: { adv: 3, chat: 20 } };
    const why = { quota: 'Tu as utilisé tous tes conseils IA du mois.', busy: 'La démo fait une pause aujourd\'hui.', locked: 'Cette fonction est réservée à une offre payante.', plan: 'Cette fonction est réservée à une offre payante.' }[reason] || '';
    const link = (k) => (k === 'premium' ? CFG.whopPremium : k === 'founder' ? CFG.whopFounder : '');
    const pn = H.openSheet(`<div><h2>Ton offre</h2><p style="color:var(--muted);margin-top:8px">${esc(why)} Tu es en <b>${esc(m.label || m.plan)}</b> : ${m.usage.adv} conseil${m.usage.adv > 1 ? 's' : ''} IA utilisé${m.usage.adv > 1 ? 's' : ''} sur ${m.limits.adv} ce mois-ci.</p></div>
      <div style="display:grid;gap:12px">${OFFERS.map(([k, t, price, li]) => `<div class="card" style="display:grid;gap:8px${m.plan === k ? ';border-color:var(--wine)' : ''}"><div style="display:flex;justify-content:space-between;align-items:baseline"><b>${esc(t)}</b><span class="mono" style="text-transform:none;letter-spacing:0">${esc(price)}</span></div><ul style="margin:0;padding-left:18px;color:var(--muted);font-size:14px;line-height:1.6">${li.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>${k === 'free' ? '' : m.plan === k ? '<p class="mono" style="text-transform:none;letter-spacing:0">Ton offre actuelle</p>' : link(k) ? `<a class="cta full" style="text-align:center" href="${esc(link(k))}" target="_blank" rel="noopener noreferrer"><span>Choisir sur Whop</span></a>` : '<p class="mono" style="text-transform:none;letter-spacing:0">Bientôt disponible</p>'}</div>`).join('')}</div>
      <form id="lic" class="card" style="display:grid;gap:10px" novalidate><b>J'ai déjà acheté</b><p style="color:var(--muted);font-size:14px;margin:0">Après ton paiement, Whop t'envoie une clé d'accès. Colle-la ici, ton offre s'active tout de suite.</p><input type="text" id="lic-k" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Ta clé d'accès Whop" aria-label="Clé d'accès Whop"><button class="cta full" id="lic-go"><span>Activer mon offre</span></button><p class="mono" id="lic-msg" style="text-transform:none;letter-spacing:0"></p></form>`);
    pn.querySelector('#lic').onsubmit = async (e) => {
      e.preventDefault(); const msg = pn.querySelector('#lic-msg'), k = pn.querySelector('#lic-k').value.trim();
      if (k.length < 8) { msg.textContent = 'Colle la clé complète reçue de Whop.'; return; }
      pn.querySelector('#lic-go').disabled = true; msg.textContent = 'Vérification chez Whop…';
      try { const j = await sub.activate(k); msg.textContent = 'C\'est activé : bienvenue en ' + j.me.label + '.'; setTimeout(() => { H.closeSheet(); if (H.refresh) H.refresh(); }, 1400); }
      catch (er) { pn.querySelector('#lic-go').disabled = false; msg.textContent = { license: 'Cette clé n\'existe pas. Vérifie-la.', inactive: 'Cet abonnement n\'est plus actif.', product: 'Cette clé ne correspond à aucune offre Sillage.', taken: 'Cette clé est déjà utilisée par un autre compte.', rate: 'Trop d\'essais, réessaie dans une heure.', whop_net: 'Whop ne répond pas, réessaie dans un instant.', whop_off: 'L\'activation n\'est pas encore ouverte.' }[er.code] || 'Activation impossible pour l\'instant.'; }
    };
  }
  // Adresse non confirmée : les conseils IA attendent le clic sur le lien reçu par courriel.
  function verifySheet() {
    const H = window.SillageHooks; if (!H) return;
    const pn = H.openSheet(`<div><h2>Confirme ton adresse</h2><p style="color:var(--muted);margin-top:8px">Pour activer les conseils IA, ouvre le lien que je t'ai envoyé par courriel${acctEmail ? ' à ' + esc(acctEmail) : ''}. Pense à regarder tes courriers indésirables. Le reste de l'appli reste utilisable.</p></div>
      <div class="row"><button class="cta" id="vf-re"><span>Renvoyer le lien</span></button><button class="ghost" id="vf-ok">J'ai confirmé</button></div><p class="mono" id="vf-msg" style="text-transform:none;letter-spacing:0;min-height:16px"></p>`);
    const msg = pn.querySelector('#vf-msg');
    pn.querySelector('#vf-re').onclick = async () => { msg.textContent = '…'; try { const j = await call('resend', 'POST', {}); msg.textContent = j.verified ? 'Ton adresse est déjà confirmée.' : j.sent ? 'Le lien est reparti. Il peut mettre une minute.' : 'L\'envoi de courriel n\'est pas encore actif. Écris-moi depuis ton profil, je le fais à la main.'; } catch (e) { msg.textContent = e.code === 'rate' ? 'Trop d\'envois, réessaie dans une heure.' : 'Échec, réessaie.'; } };
    pn.querySelector('#vf-ok').onclick = async () => { msg.textContent = '…'; try { await loadMe(); } catch (e) { /* hors ligne */ } if (ME && ME.verified !== false) { await refresh(); H.closeSheet(); if (H.refresh) H.refresh(); } else msg.textContent = 'Pas encore confirmé. Ouvre le lien du courriel, puis reviens.'; };
  }
  // Lien reçu par courriel : /?verify=… confirme l'adresse puis nettoie l'adresse de la page.
  async function checkVerifyLink() {
    let tk = null; try { tk = new URLSearchParams(location.search).get('verify'); } catch (e) { /* ok */ }
    if (!tk || !/^[a-f0-9]{64}$/.test(tk)) return;
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* ok */ }
    let ok = false; try { const r = await fetch('/api/account/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: tk }) }); ok = r.ok; } catch (e) { /* hors ligne */ }
    setTimeout(() => { const H = window.SillageHooks; if (!H) return; if (ok && token) refresh(); const pn = H.openSheet(`<div><h2>${ok ? 'Adresse confirmée' : 'Lien invalide'}</h2><p style="color:var(--muted);margin-top:8px">${ok ? 'Tes conseils IA sont activés.' : 'Ce lien a déjà servi ou a expiré. Connecte-toi, puis demande un nouveau lien depuis ton profil.'}</p></div><div class="row"><button class="cta" id="vl-ok"><span>Continuer</span></button></div>`); pn.querySelector('#vl-ok').onclick = H.closeSheet; }, 1500);
  }
  function upsell(reason) {
    const H = window.SillageHooks; if (!H) return;
    if (reason === 'verify') return verifySheet();
    if (token && ['quota', 'locked', 'busy', 'plan', 'cta'].includes(reason)) return plans(reason);
    const [title, text] = TEXT[reason] || TEXT.quota;
    const pn = H.openSheet(`<div><h2>${esc(title)}</h2><p style="color:var(--muted);margin-top:8px">${esc(text)}</p></div>
      <form id="su" style="display:grid;gap:12px" novalidate>
        <input type="text" id="su-mail" inputmode="email" autocomplete="email" placeholder="ton@email.com" aria-label="Ton email">
        <div class="chips" id="su-int"><button type="button" class="chip ${reason === 'cta' ? '' : 'on'}" data-v="test">Tester la version complète</button><button type="button" class="chip ${reason === 'cta' ? 'on' : ''}" data-v="custom">Une version sur mesure</button><button type="button" class="chip" data-v="guide">Le guide</button></div>
        <label style="display:flex;gap:10px;align-items:flex-start;font-size:13px;color:var(--muted)"><input type="checkbox" id="su-ok" style="width:auto;margin-top:3px"><span>J'accepte de recevoir des nouvelles de Sillage par email. Je peux me désinscrire à tout moment. Mon email ne sert qu'à ça.</span></label>
        <input type="text" id="su-web" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;opacity:0" aria-hidden="true">
        <button class="cta full" id="su-go"><span>Recevoir l'accès</span></button><p class="mono" id="su-msg" style="text-transform:none;letter-spacing:0"></p>
      </form>`);
    let interest = reason === 'cta' ? 'custom' : 'test';
    pn.querySelectorAll('#su-int .chip').forEach((b) => (b.onclick = () => { interest = b.dataset.v; pn.querySelectorAll('#su-int .chip').forEach((x) => x.classList.toggle('on', x === b)); }));
    pn.querySelector('#su').onsubmit = async (e) => {
      e.preventDefault();
      const msg = pn.querySelector('#su-msg'), mail = pn.querySelector('#su-mail').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) { msg.textContent = 'Cet email semble incomplet.'; return; }
      if (!pn.querySelector('#su-ok').checked) { msg.textContent = 'Coche la case pour continuer.'; return; }
      pn.querySelector('#su-go').disabled = true; msg.textContent = 'Envoi…';
      try {
        const r = await fetch('/api/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: mail, consent: true, interest, website: pn.querySelector('#su-web').value, source: 'demo-' + reason }) });
        if (!r.ok) throw new Error('x');
        pn.innerHTML = '<div style="padding:24px 4px;text-align:center"><h2>C\'est noté.</h2><p style="color:var(--muted);margin-top:10px">Je reviens vers toi très vite.</p></div>';
      } catch (er) { msg.textContent = 'Envoi impossible pour l\'instant, réessaie dans un instant.'; pn.querySelector('#su-go').disabled = false; }
    };
  }

  // Les autres fonctions IA de l'appli passent par « sample » : ici elles mènent à l'inscription.
  const locked = Object.assign(async () => { upsell('locked'); throw { code: 'locked' }; }, {
    json: async () => { upsell('locked'); throw { code: 'locked' }; },
    limits: async () => ({ maxPromptBytes: 100000, images: { maxCount: 1, maxInputBytes: 8000000, mediaTypes: ['image/jpeg', 'image/png', 'image/webp'] } }),
  });
  locked.isLocked = true;
  // Une fois connecté, le parfumier utilise l'IA légère du serveur ; son quota est celui de l'offre.
  const chatSample = Object.assign(async () => { throw { code: 'unsupported' }; }, {
    json: async (prompt) => {
      let r; try { r = await fetch('/api/chat', { method: 'POST', headers: authH(), body: JSON.stringify({ prompt: String(prompt).slice(0, 12000) }) }); } catch (e) { throw { code: 'network' }; }
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) { setSession(null); try { window.dispatchEvent(new Event('sillage:expired')); } catch (e) { /* ok */ } throw { code: 'auth' }; }
      if (r.status === 429) { if (j.code !== 'verify' && ME) ME.usage.chat = ME.limits.chat; upsell(j.code === 'verify' ? 'verify' : 'quota'); throw { code: 'rate_limited' }; }
      if (!r.ok) throw { code: 'server' };
      if (ME) ME.usage.chat += 1;
      return j.data;
    },
    limits: async () => ({ maxPromptBytes: 12000, images: { maxCount: 0, maxInputBytes: 0, mediaTypes: [] } }),
  });
  window.claude = { use: async (name) => (name === 'sample' ? (token ? chatSample : locked) : null) };
  window.SillageDemo = { plan: sub, plans, account, day, need, left: () => left, identLeft: () => identLeft, identify, confirm, catalog, refresh, upsell };
  refresh().then(() => { if (window.SillageHooks) window.SillageHooks.rerender(); });
  checkVerifyLink();
})();
