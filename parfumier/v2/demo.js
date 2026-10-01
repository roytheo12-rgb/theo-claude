// Démo publique : remplace l'IA de claude.ai par un petit serveur (Worker) qui limite chaque visiteur à 2 essais.
(function () {
  'use strict';
  const MAX = 2;
  let left = MAX, identLeft = 6, vid;
  try { vid = localStorage.getItem('sillage.vid'); if (!vid) { vid = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2) + Date.now().toString(16) + 'abcdef0123'); localStorage.setItem('sillage.vid', vid); } } catch (e) { vid = 'anon-' + Math.random().toString(16).slice(2) + Date.now().toString(16) + '0000'; }
  const headers = () => ({ 'content-type': 'application/json', 'x-visitor': vid });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  async function refresh() { try { const r = await fetch('/api/quota', { headers: headers() }); const j = await r.json(); if (typeof j.left === 'number') left = j.left; if (typeof j.identLeft === 'number') identLeft = j.identLeft; } catch (e) { /* hors ligne : on garde la valeur */ } }

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
    if (r.status === 429) { left = 0; upsell(j.code === 'busy' ? 'busy' : 'quota'); throw { code: 'rate_limited' }; }
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

  const TEXT = {
    quota: ['Tes 2 essais sont utilisés', 'Tu as vu ce que fait Sillage. Laisse ton email : je t\'envoie l\'accès complet, et je peux préparer une version sur mesure pour ta collection ou ton activité.'],
    locked: ['Réservé à la version complète', 'Cette fonction (ajout par IA, labo d\'accords, semaine, voyage…) est dans la version complète. Laisse ton email pour l\'obtenir.'],
    cta: ['Ton Sillage, sur mesure', 'Laisse ton email : je te recontacte pour construire la version qui contient ta vraie collection, tes habitudes et l\'IA sans limite d\'essais.'],
    busy: ['La démo fait une pause', 'Elle est très demandée aujourd\'hui et reprend demain. Laisse ton email, je te préviens.'],
  };
  function upsell(reason) {
    const H = window.SillageHooks; if (!H) return;
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
  window.claude = { use: async (name) => (name === 'sample' ? locked : null) };
  window.SillageDemo = { day, left: () => left, identLeft: () => identLeft, identify, confirm, catalog, refresh, upsell };
  refresh().then(() => { if (window.SillageHooks) window.SillageHooks.rerender(); });
})();
