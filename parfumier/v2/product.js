// Sillage en ligne : offre et profil, inspirations privées et communauté, installation sur l'écran d'accueil, éditeur public.
// Chargé après l'appli, seulement dans la version connectée au serveur (jamais dans la version claude.ai).
(function () {
  'use strict';
  const D = window.SillageDemo, I = window.SillageInternals;
  if (!D || !I) return;
  const { esc, $, $$, E } = I, P = D.plan, S = () => I.S();
  const pk = (h, n) => E.norm(h) + '|' + E.norm(n);
  const list3 = (a) => (a.length > 1 ? a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1] : a[0] || '');
  const entryOf = (h, n) => I.dbList().find((e) => !e.ed && E.norm(e.name) === E.norm(n) && (!h || E.norm(e.house) === E.norm(h))) || null;

  // ---------- Contenu public modifié par l'éditeur ----------
  let CONTENT = {};
  const same = (x, it) => (x.h && x.n ? E.norm(x.h) === E.norm(it.h) && E.norm(x.n) === E.norm(it.n) : E.norm(x.q) === E.norm(it.h + ' ' + it.n));
  const grpAdjust = (p, idx, delta) => { if (!p.grp) return; let a = 0; for (const g of p.grp) { if (idx < a + g.n || g === p.grp[p.grp.length - 1]) { g.n += delta; return; } a += g.n; } };
  function applyContent(c) {
    if (!c || typeof c !== 'object') return;
    CONTENT = c;
    const EN = (window.ENRICH = window.ENRICH || {});
    Object.keys(c.price || {}).forEach((k) => { const o = EN[k] || (EN[k] = {}); o.p = c.price[k]; delete o.pe; });
    window.SILLAGE_HIDE = new Set(c.hide || []);
    I.bust();
    const db = I.dbList();
    Object.keys(c.desc || {}).forEach((k) => { const e = db.find((x) => pk(x.house, x.name) === k); if (e) { window.BIOS = window.BIOS || {}; window.BIOS[e.house + '|' + e.name] = [c.desc[k]]; } });
    const PL = window.PLAYLISTS || [];
    Object.keys(c.plDel || {}).forEach((t) => { const p = PL.find((x) => x.t === t); if (p) c.plDel[t].forEach((it) => { const i = p.ps.findIndex((x) => same(x, it)); if (i >= 0) { p.ps.splice(i, 1); grpAdjust(p, i, -1); } }); });
    Object.keys(c.plAdd || {}).forEach((t) => { const p = PL.find((x) => x.t === t); if (p) c.plAdd[t].forEach((it) => { if (!p.ps.some((x) => same(x, it))) { p.ps.push({ q: it.h + ' ' + it.n, w: '', h: it.h, n: it.n }); grpAdjust(p, p.ps.length - 1, 1); } }); });
    Object.keys(c.plPos || {}).forEach((t) => { const p = PL.find((x) => x.t === t); if (p) c.plPos[t].forEach((it) => { const i = p.ps.findIndex((x) => same(x, it)); if (i >= 0 && !p.grp) { const [x] = p.ps.splice(i, 1); p.ps.splice(Math.min(Math.max(0, it.pos - 1), p.ps.length), 0, x); } }); });
    window.PLAYLISTS = PL.slice();      // nouvelle liste : le moteur reconstruit ses univers
    I.bust(); I.render(true);
  }
  const adminEdit = async (op, msgEl, okTxt) => {
    try { await P.admin.edit(op); const c = await P.content(); applyContent(c); if (msgEl) msgEl.textContent = okTxt || 'C\'est publié pour tout le monde ✓'; return true; }
    catch (e) { if (msgEl) msgEl.textContent = { forbidden: 'Réservé à l\'éditeur.', too_big: 'Trop de modifications : fais le ménage.', bad_op: 'Modification invalide.', network: 'Pas de connexion.' }[e.code] || 'Échec, réessaie.'; return false; }
  };

  // ---------- Installer sur l'écran d'accueil ----------
  let deferred = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
  const standalone = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } };
  const platform = () => { const ua = navigator.userAgent || ''; if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios'; if (/android/i.test(ua)) return 'android'; return 'desktop'; };
  function installTip(force) {
    if (!force && (standalone() || localStorage.getItem('sillage.install'))) return;
    const pf = platform();
    const steps = { ios: ['Touche le bouton Partager (le carré avec une flèche vers le haut) en bas de Safari.', 'Fais défiler et touche « Sur l\'écran d\'accueil ».', 'Touche « Ajouter » : Sillage apparaît comme une vraie appli.'], android: ['Touche le menu ⋮ en haut à droite de Chrome.', 'Touche « Installer l\'application » (ou « Ajouter à l\'écran d\'accueil »).', 'Confirme : Sillage apparaît avec les autres applis.'], desktop: ['Dans la barre d\'adresse, clique sur l\'icône d\'installation (un écran avec une flèche).', 'Ou ouvre le menu du navigateur puis « Installer Sillage ».', 'Sillage s\'ouvre alors dans sa propre fenêtre.'] }[pf];
    const pn = I.openSheet(`<div><p class="mono">Sillage sur ton téléphone</p><h2>Ajoute-moi à ton écran d'accueil</h2><p style="color:var(--muted);margin-top:8px">Un seul toucher pour m'ouvrir, en plein écran, comme une appli. Tu restes connecté.</p></div>
      <ol class="inst">${steps.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
      ${pf === 'ios' ? '<p class="soft small">Tu ne vois pas « Sur l\'écran d\'accueil » ? Ouvre ce site dans Safari.</p>' : ''}
      ${deferred ? '<button class="cta full" id="inst-go"><span>Installer maintenant</span></button>' : ''}
      <button class="ghost" id="inst-ok">${force ? 'Fermer' : 'J\'ai compris'}</button>${force ? '' : '<button class="ghost" id="inst-later">Me le redire plus tard</button>'}`);
    const done = (never) => { if (never) try { localStorage.setItem('sillage.install', '1'); } catch (e) { /* ok */ } I.closeSheet(); };
    $('#inst-ok', pn).onclick = () => done(true);
    if ($('#inst-later', pn)) $('#inst-later', pn).onclick = () => done(false);
    if ($('#inst-go', pn)) $('#inst-go', pn).onclick = async () => { try { deferred.prompt(); await deferred.userChoice; } catch (e) { /* ok */ } deferred = null; done(true); };
  }

  // ---------- Avatar dans l'en-tête ----------
  function paintAvatar() {
    const b = $('#profileBtn'); if (!b) return; const m = P.me();
    if (m && m.profile && m.profile.avatar) { if (!b.dataset.svg) b.dataset.svg = b.innerHTML; b.innerHTML = `<img class="hav" src="${esc(m.profile.avatar)}" alt="">`; }
    else if (b.dataset.svg) { b.innerHTML = b.dataset.svg; delete b.dataset.svg; }
  }
  window.addEventListener('sillage:me', paintAvatar);

  // ---------- Profil : photo, pseudo, offre, usage ----------
  function bar(label, used, max) { const pct = Math.min(100, Math.round(100 * used / Math.max(1, max))); return `<div class="use"><div class="usel"><span>${esc(label)}</span><b>${used} / ${max > 9999 ? '∞' : max}</b></div><div class="usebar"><i style="width:${pct}%"></i></div></div>`; }
  function profile(pn) {
    const anchor = $('#tedit', pn); if (!anchor) return;
    const card = document.createElement('div');
    const draw = () => {
      const m = P.me();
      if (!m) { card.innerHTML = '<div class="card"><b>Mon profil public</b><p class="mono" style="text-transform:none;letter-spacing:0">Chargement…</p></div>'; return; }
      const paid = m.plan === 'premium' || m.plan === 'founder';
      card.innerHTML = `<div class="card pcard2" style="display:grid;gap:14px"><b>Mon profil Sillage</b>
        <div class="avrow"><button type="button" class="avbtn" id="pf-av" aria-label="Changer ma photo">${m.profile.avatar ? `<img src="${esc(m.profile.avatar)}" alt="">` : '<span>＋</span>'}</button><div style="display:grid;gap:8px;flex:1"><input type="text" id="pf-ps" maxlength="24" placeholder="Mon pseudo (visible dans la communauté)" value="${esc(m.profile.pseudo)}" aria-label="Mon pseudo"><input type="text" id="pf-bio" maxlength="140" placeholder="Une phrase sur ton goût" value="${esc(m.profile.bio)}" aria-label="Ma phrase"></div></div>
        <input type="file" id="pf-file" accept="image/*" hidden>
        <div class="row"><button class="cta" id="pf-save"><span>Enregistrer</span></button>${m.profile.avatar ? '<button class="ghost" id="pf-rm">Retirer la photo</button>' : ''}</div><p class="mono" id="pf-msg" style="text-transform:none;letter-spacing:0;min-height:16px"></p></div>
        <div class="card" style="display:grid;gap:12px"><div style="display:flex;justify-content:space-between;align-items:baseline"><b>Mon offre</b><span class="mono" style="text-transform:none;letter-spacing:0">${esc(m.label)}${m.expired ? ' · expirée' : ''}</span></div>
          ${bar('Conseils IA ce mois-ci', m.usage.adv, m.limits.adv)}${bar('Échanges avec le parfumier', m.usage.chat, m.limits.chat)}
          <div class="row"><button class="ghost" id="pf-plans">${paid || m.admin ? 'Voir les offres' : 'Passer à Premium'}</button>${paid && P.cfg.whopHub ? `<a class="ghost" style="display:inline-grid;place-items:center" href="${esc(P.cfg.whopHub)}" target="_blank" rel="noopener noreferrer">Gérer mon abonnement</a>` : ''}</div>
          <button class="ghost" id="pf-inst" type="button">Installer sur mon écran d'accueil</button></div>
        ${m.admin ? '<div class="card" style="display:grid;gap:8px;border-color:var(--wine)"><b>Mode éditeur</b><p class="soft small" style="margin:0">Tu es seul à voir ceci. Dans chaque fiche parfum et chaque inspiration, des outils te laissent modifier prix, textes, masquage et classements : le changement est public tout de suite.</p><button class="ghost" id="pf-stats" type="button">Voir les chiffres</button><p class="mono" id="pf-st" style="text-transform:none;letter-spacing:0;white-space:pre-line"></p></div>' : ''}`;
      const msg = $('#pf-msg', card), fileIn = $('#pf-file', card);
      $('#pf-av', card).onclick = () => fileIn.click();
      fileIn.onchange = async () => { const f = fileIn.files && fileIn.files[0]; if (!f) return; msg.textContent = '…'; try { const url = await P.avatar(f); await P.saveProfile({ avatar: url }); paintAvatar(); draw(); } catch (e) { msg.textContent = 'Cette photo ne passe pas. Essaie-en une autre.'; } };
      if ($('#pf-rm', card)) $('#pf-rm', card).onclick = async () => { try { await P.saveProfile({ avatar: '' }); paintAvatar(); draw(); } catch (e) { msg.textContent = 'Échec, réessaie.'; } };
      $('#pf-save', card).onclick = async () => { msg.textContent = '…'; try { await P.saveProfile({ pseudo: $('#pf-ps', card).value.trim(), bio: $('#pf-bio', card).value.trim() }); msg.textContent = 'Enregistré ✓'; } catch (e) { msg.textContent = e.code === 'pseudo' ? 'Pseudo : 2 à 24 lettres, chiffres, espaces ou . _ -' : 'Échec, réessaie.'; } };
      $('#pf-plans', card).onclick = () => { I.closeSheet(); D.plans(''); };
      $('#pf-inst', card).onclick = () => { I.closeSheet(); installTip(true); };
      if ($('#pf-stats', card)) $('#pf-stats', card).onclick = async () => { const el = $('#pf-st', card); el.textContent = '…'; try { const s = await P.admin.stats(); el.textContent = `${s.accounts} comptes\nOffres : ${Object.entries(s.plans).map(([k, v]) => k + ' ' + v).join(', ') || 'aucune'}\nCe mois-ci : ${s.usage.adv} conseils IA, ${s.usage.chat} échanges, ${s.usage.ident} analyses`; } catch (e) { el.textContent = 'Indisponible.'; } };
    };
    anchor.parentNode.insertBefore(card, anchor); draw();
    P.load().then(draw).catch(() => draw());
  }

  // ---------- Inspirations : les miennes (privées par défaut) et celles de la communauté ----------
  const mine = () => { const s = S(); if (!Array.isArray(s.myInsp)) s.myInsp = []; return s.myInsp; };
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  function subtabs(view) {
    const head = $('header', view); if (!head) return; const bar = document.createElement('div'); bar.className = 'plsubtabs';
    bar.innerHTML = [['', 'Univers Sillage'], ['mine', 'Mes inspirations'], ['comm', 'Communauté']].map(([k, l]) => `<button type="button" class="${(I.PL.sub || '') === k ? 'on' : ''}" data-sub="${k}">${l}</button>`).join('');
    head.parentNode.insertBefore(bar, head.nextSibling);
    $$('[data-sub]', bar).forEach((b) => (b.onclick = () => { I.PL.sub = b.dataset.sub; I.PL.id = 0; I.render(); }));
  }
  const itemRows = (items) => items.map((x, i) => { const e = entryOf(x.h, x.n); return e ? `<button type="button" class="xc" data-ie="${i}">${I.xThumb(e)}<span class="xt"><b>${esc(e.name)}</b><small>${esc(e.house)}</small></span><i class="xm">›</i></button>` : `<div class="xc off"><span class="xth ph">?</span><span class="xt"><b>${esc(x.n)}</b><small>${esc(x.h || 'Pas dans la base')}</small></span></div>`; }).join('');
  const bindRows = (pn, items) => $$('[data-ie]', pn).forEach((b) => (b.onclick = () => { const x = items[+b.dataset.ie], e = entryOf(x.h, x.n); if (e) I.openEntry(e); }));
  function playSub(sub) {
    $('#view').innerHTML = `<section class="sec"><header><h2>Inspirations</h2><span class="mono">${sub === 'mine' ? 'les tiennes' : 'la communauté'}</span></header><div id="subbody"></div></section>`;
    subtabs($('#view')); const body = $('#subbody');
    if (sub === 'mine') return viewMine(body); return viewComm(body);
  }
  function viewMine(body) {
    const L = mine(), m = P.me(), max = m ? m.limits.insp : 2;
    body.innerHTML = `<p class="plintro">Crée tes propres listes : un personnage, une saison, une humeur. Elles restent privées tant que tu ne les publies pas.</p>
      <button class="cta" id="mi-new"><span>Créer une inspiration</span></button>
      ${L.length ? `<div class="mylist">${L.map((x) => `<button type="button" class="myc" data-mi="${esc(x.id)}"><b>${esc(x.title)}</b><small>${x.items.length} parfum${x.items.length > 1 ? 's' : ''} · ${x.cid ? 'Publique' : 'Privée'}</small>${x.desc ? `<em>${esc(x.desc)}</em>` : ''}</button>`).join('')}</div>` : '<p class="soft">Tu n\'as pas encore d\'inspiration. Commence par la première.</p>'}
      <p class="soft small">${L.length} sur ${max > 9999 ? '∞' : max} inspirations</p>`;
    $('#mi-new', body).onclick = () => { if (L.length >= max) return D.plans('plan'); editInsp(null); };
    $$('[data-mi]', body).forEach((b) => (b.onclick = () => showInsp(L.find((x) => x.id === b.dataset.mi))));
  }
  function showInsp(ins) {
    if (!ins) return;
    const pn = I.openSheet(`<div><p class="mono">${ins.cid ? 'Publique dans la communauté' : 'Privée, toi seul la vois'}</p><h2>${esc(ins.title)}</h2>${ins.desc ? `<p style="color:var(--muted);margin-top:8px">${esc(ins.desc)}</p>` : ''}</div>
      <div class="xlist">${itemRows(ins.items)}</div>
      <div class="row"><button class="ghost" id="si-edit">Modifier</button><button class="ghost" id="si-pub">${ins.cid ? 'Retirer de la communauté' : 'Rendre publique'}</button><button class="ghost danger" id="si-del">Supprimer</button></div><p class="mono" id="si-msg" style="text-transform:none;letter-spacing:0;min-height:16px"></p>`);
    bindRows(pn, ins.items);
    const msg = $('#si-msg', pn);
    $('#si-edit', pn).onclick = () => { I.closeSheet(); editInsp(ins); };
    $('#si-pub', pn).onclick = async () => {
      const m = P.me();
      try {
        if (ins.cid) { await P.community.remove(ins.cid); ins.cid = ''; I.save(); showAfter(); return; }
        if (!m || !m.limits.publish) return D.plans('plan');
        if (!m.profile.pseudo) { msg.textContent = 'Choisis d\'abord un pseudo dans ton profil, il sera affiché avec ta liste.'; return; }
        msg.textContent = '…'; const j = await P.community.publish({ id: '', title: ins.title, desc: ins.desc, items: ins.items }); ins.cid = j.id; I.save(); showAfter();
      } catch (e) { msg.textContent = { plan: 'La publication est réservée à Premium.', pseudo: 'Choisis d\'abord un pseudo dans ton profil.', limit: 'Tu as déjà 10 inspirations publiques.', rate: 'Trop de publications, réessaie plus tard.', network: 'Pas de connexion.' }[e.code] || 'Échec, réessaie.'; }
    };
    const showAfter = () => { I.closeSheet(); if (I.PL.sub === 'mine') I.render(true); showInsp(ins); };
    $('#si-del', pn).onclick = async (ev) => { if (!ev.target.dataset.sure) { ev.target.dataset.sure = 1; ev.target.textContent = 'Confirmer la suppression'; return; } if (ins.cid) { try { await P.community.remove(ins.cid); } catch (e) { /* déjà retirée */ } } const L = mine(); L.splice(L.indexOf(ins), 1); I.save(); I.closeSheet(); I.render(true); };
  }
  function editInsp(ins) {
    const d = ins ? { id: ins.id, title: ins.title, desc: ins.desc, items: ins.items.map((x) => ({ n: x.n, h: x.h })) } : { id: uid(), title: '', desc: '', items: [] };
    const pn = I.openSheet(`<div><h2>${ins ? 'Modifier' : 'Nouvelle'} inspiration</h2></div>
      <input type="text" id="ei-t" maxlength="60" placeholder="Son titre (ex. Cuirs de minuit)" value="${esc(d.title)}" aria-label="Titre"><textarea id="ei-d" rows="2" maxlength="240" placeholder="Une phrase pour la décrire" aria-label="Description">${esc(d.desc)}</textarea>
      <div><p class="mono">Ses parfums</p><div id="ei-list" class="xlist"></div></div>
      <input type="search" id="ei-q" placeholder="Chercher un parfum à ajouter…" autocomplete="off" aria-label="Chercher un parfum"><div id="ei-res" class="vrres"></div>
      <div class="row"><button class="cta" id="ei-save"><span>Enregistrer</span></button><button class="ghost" id="ei-x">Annuler</button></div><p class="mono" id="ei-msg" style="text-transform:none;letter-spacing:0;min-height:16px"></p>`);
    const drawList = () => { $('#ei-list', pn).innerHTML = d.items.length ? d.items.map((x, i) => `<div class="eir"><span><b>${esc(x.n)}</b><small>${esc(x.h)}</small></span><span class="eib"><button type="button" data-up="${i}" aria-label="Monter">↑</button><button type="button" data-dn="${i}" aria-label="Descendre">↓</button><button type="button" data-rm="${i}" aria-label="Retirer">✕</button></span></div>`).join('') : '<p class="soft small">Ajoute au moins 2 parfums.</p>';
      $$('[data-up]', pn).forEach((b) => (b.onclick = () => { const i = +b.dataset.up; if (i > 0) { [d.items[i - 1], d.items[i]] = [d.items[i], d.items[i - 1]]; drawList(); } }));
      $$('[data-dn]', pn).forEach((b) => (b.onclick = () => { const i = +b.dataset.dn; if (i < d.items.length - 1) { [d.items[i + 1], d.items[i]] = [d.items[i], d.items[i + 1]]; drawList(); } }));
      $$('[data-rm]', pn).forEach((b) => (b.onclick = () => { d.items.splice(+b.dataset.rm, 1); drawList(); })); };
    drawList();
    $('#ei-q', pn).oninput = (ev) => { const t = E.norm(ev.target.value), box = $('#ei-res', pn); if (t.length < 2) { box.innerHTML = ''; return; } const hits = I.dbList().filter((e) => !e.ed && E.norm(e.house + ' ' + e.name).includes(t)).slice(0, 8); box.innerHTML = hits.map((e, i) => `<button type="button" class="vrh" data-rh="${i}"><b>${esc(e.name)}</b><small>${esc(e.house)}</small></button>`).join(''); $$('[data-rh]', box).forEach((b) => (b.onclick = () => { const e = hits[+b.dataset.rh]; if (d.items.length < 30 && !d.items.some((x) => E.norm(x.n) === E.norm(e.name) && E.norm(x.h) === E.norm(e.house))) d.items.push({ n: e.name, h: e.house }); ev.target.value = ''; box.innerHTML = ''; drawList(); })); };
    $('#ei-x', pn).onclick = I.closeSheet;
    $('#ei-save', pn).onclick = async () => {
      const msg = $('#ei-msg', pn); d.title = $('#ei-t', pn).value.trim(); d.desc = $('#ei-d', pn).value.trim();
      if (d.title.length < 3) { msg.textContent = 'Donne-lui un titre (3 lettres au moins).'; return; } if (d.items.length < 2) { msg.textContent = 'Ajoute au moins 2 parfums.'; return; }
      const L = mine(); let rec = ins; if (!rec) { rec = { id: d.id, cid: '' }; L.push(rec); } Object.assign(rec, { title: d.title, desc: d.desc, items: d.items });
      I.save();
      if (rec.cid) { try { await P.community.publish({ id: rec.cid, title: rec.title, desc: rec.desc, items: rec.items }); } catch (e) { /* la copie publique se mettra à jour à la prochaine publication */ } }
      I.closeSheet(); I.PL.sub = 'mine'; I.goTab('play'); showInsp(rec);
    };
  }
  async function viewComm(body) {
    body.innerHTML = '<p class="plintro">Les listes que des membres ont choisi de partager. Elles viennent après celles de Sillage : à toi de voir ce qui t\'inspire.</p><span class="shim" style="display:block;height:120px"></span>';
    let j; try { j = await P.community.list(); } catch (e) { body.innerHTML = '<p class="soft">Impossible de charger pour l\'instant. Réessaie dans un instant.</p>'; return; }
    const L = j.items || [];
    body.innerHTML = `<p class="plintro">Les listes que des membres ont choisi de partager. Elles viennent après celles de Sillage : à toi de voir ce qui t'inspire.</p>${L.length ? `<div class="mylist">${L.map((x) => `<button type="button" class="myc" data-ci="${esc(x.id)}"><b>${esc(x.title)}</b><small>par ${esc(x.pseudo)} · ${x.items.length} parfums${x.likes ? ' · ♥ ' + x.likes : ''}</small>${x.desc ? `<em>${esc(x.desc)}</em>` : ''}</button>`).join('')}</div>` : '<p class="soft">Rien de partagé pour le moment. Sois le premier : crée une inspiration et rends-la publique.</p>'}`;
    $$('[data-ci]', body).forEach((b) => (b.onclick = () => showComm(L.find((x) => x.id === b.dataset.ci))));
  }
  function showComm(x) {
    if (!x) return; const adm = P.isAdmin();
    const pn = I.openSheet(`<div><p class="mono">Inspiration de ${esc(x.pseudo)}</p><h2>${esc(x.title)}</h2>${x.desc ? `<p style="color:var(--muted);margin-top:8px">${esc(x.desc)}</p>` : ''}</div>
      <div class="xlist">${itemRows(x.items)}</div>
      <div class="row"><button class="ghost" id="sc-like">♥ J'aime${x.likes ? ' (' + x.likes + ')' : ''}</button>${x.mine ? '' : '<button class="ghost" id="sc-rep">Signaler</button>'}${x.mine || adm ? '<button class="ghost danger" id="sc-del">Supprimer</button>' : ''}</div><p class="mono" id="sc-msg" style="text-transform:none;letter-spacing:0;min-height:16px"></p>`);
    bindRows(pn, x.items); const msg = $('#sc-msg', pn);
    $('#sc-like', pn).onclick = async () => { try { const j = await P.community.like(x.id); x.likes = j.likes; $('#sc-like', pn).textContent = '♥ J\'aime (' + j.likes + ')'; } catch (e) { msg.textContent = 'Échec, réessaie.'; } };
    if ($('#sc-rep', pn)) $('#sc-rep', pn).onclick = async () => { try { await P.community.report(x.id); msg.textContent = 'Merci, c\'est signalé.'; } catch (e) { msg.textContent = 'Échec, réessaie.'; } };
    if ($('#sc-del', pn)) $('#sc-del', pn).onclick = async () => { try { await P.community.remove(x.id); I.closeSheet(); I.render(true); } catch (e) { msg.textContent = 'Échec, réessaie.'; } };
  }

  // ---------- Éditeur : fiche parfum ----------
  function entry(pn, e) {
    if (!P.isAdmin()) return;
    const key = pk(e.house, e.name), hidden = (CONTENT.hide || []).includes(key), card = document.createElement('div');
    card.className = 'card'; card.style.cssText = 'display:grid;gap:10px;border-color:var(--wine)';
    card.innerHTML = `<b>Éditeur</b><p class="soft small" style="margin:0">Visible par toi seul. Ce que tu changes ici change l'appli pour tout le monde.</p>
      <div class="row"><input type="text" id="ed-p" inputmode="numeric" placeholder="Prix en €" value="${e.price || ''}" aria-label="Prix en euros" style="max-width:120px"><button class="ghost" id="ed-ps">Enregistrer le prix</button><button class="ghost" id="ed-pr">Revenir au prix d'origine</button></div>
      <textarea id="ed-d" rows="3" maxlength="700" placeholder="Texte de présentation du parfum" aria-label="Texte du parfum"></textarea><div class="row"><button class="ghost" id="ed-ds">Enregistrer le texte</button><button class="ghost" id="ed-dr">Revenir au texte d'origine</button></div>
      <button class="ghost ${hidden ? '' : 'danger'}" id="ed-h">${hidden ? 'Réafficher ce parfum' : 'Masquer ce parfum partout'}</button><p class="mono" id="ed-msg" style="text-transform:none;letter-spacing:0;min-height:16px"></p>`;
    pn.appendChild(card);
    const bio = (window.BIOS || {})[e.house + '|' + e.name]; $('#ed-d', card).value = (CONTENT.desc || {})[key] || (bio && bio[0]) || '';
    const msg = $('#ed-msg', card);
    $('#ed-ps', card).onclick = async () => { const p = Math.round(Number($('#ed-p', card).value)); if (!(p > 0)) { msg.textContent = 'Écris un prix en euros.'; return; } await adminEdit({ op: 'price', key, p }, msg); };
    $('#ed-pr', card).onclick = () => adminEdit({ op: 'price', key, p: 0 }, msg, 'Prix d\'origine rétabli au prochain chargement ✓');
    $('#ed-ds', card).onclick = () => adminEdit({ op: 'desc', key, text: $('#ed-d', card).value }, msg);
    $('#ed-dr', card).onclick = () => adminEdit({ op: 'desc', key, text: '' }, msg, 'Texte d\'origine rétabli au prochain chargement ✓');
    $('#ed-h', card).onclick = async () => { if (await adminEdit({ op: 'hide', key, hide: !hidden }, msg)) I.closeSheet(); };
  }
  // ---------- Éditeur : playlist ----------
  function playlist(p) {
    if (!P.isAdmin()) return; const host = $('.pldet', $('#view')); if (!host) return;
    const card = document.createElement('div'); card.className = 'card'; card.style.cssText = 'display:grid;gap:10px;border-color:var(--wine)';
    card.innerHTML = `<b>Éditeur de cette inspiration</b><p class="soft small" style="margin:0">Ajoute, retire ou déplace un parfum : tout le monde le voit tout de suite.</p>
      <select id="pe-sel" aria-label="Parfum de la liste">${p.ps.map((x, i) => `<option value="${i}">${i + 1}. ${esc(x.q)}</option>`).join('')}</select>
      <div class="row"><input type="text" id="pe-pos" inputmode="numeric" placeholder="Nouvelle place" style="max-width:130px" aria-label="Nouvelle place"><button class="ghost" id="pe-mv">Déplacer</button><button class="ghost danger" id="pe-rm">Retirer de la liste</button></div>
      <input type="search" id="pe-q" placeholder="Ajouter un parfum de la base…" autocomplete="off" aria-label="Ajouter un parfum"><div id="pe-res" class="vrres"></div><p class="mono" id="pe-msg" style="text-transform:none;letter-spacing:0;min-height:16px"></p>`;
    host.appendChild(card); const msg = $('#pe-msg', card), cur = () => p.ps[+$('#pe-sel', card).value];
    const ident = (x) => ({ h: x.h || '', n: x.n || x.q });
    $('#pe-mv', card).onclick = async () => { const pos = Math.round(Number($('#pe-pos', card).value)), x = cur(); if (!x || !(pos >= 1)) { msg.textContent = 'Écris la nouvelle place (1 = tout en haut).'; return; } if (p.grp) { msg.textContent = 'Cette liste est découpée en groupes : le déplacement n\'est pas possible.'; return; } const it = ident(x); await adminEdit({ op: 'plPos', title: p.t, n: it.n, h: it.h, pos }, msg); };
    $('#pe-rm', card).onclick = async () => { const x = cur(); if (!x) return; const it = ident(x); await adminEdit({ op: 'plDel', title: p.t, n: it.n, h: it.h }, msg); };
    $('#pe-q', card).oninput = (ev) => { const t = E.norm(ev.target.value), box = $('#pe-res', card); if (t.length < 2) { box.innerHTML = ''; return; } const hits = I.dbList().filter((e) => !e.ed && E.norm(e.house + ' ' + e.name).includes(t)).slice(0, 8); box.innerHTML = hits.map((e, i) => `<button type="button" class="vrh" data-rh="${i}"><b>${esc(e.name)}</b><small>${esc(e.house)}</small></button>`).join(''); $$('[data-rh]', box).forEach((b) => (b.onclick = async () => { const e = hits[+b.dataset.rh]; await adminEdit({ op: 'plAdd', title: p.t, n: e.name, h: e.house }, msg); })); };
  }

  // ---------- Limite de collection selon l'offre ----------
  function limitAdd(list) {
    const m = P.me(); if (!m || m.admin) return list;
    const room = m.limits.col - S().collection.length; if (list.length <= room) return list;
    setTimeout(() => D.plans('plan'), 60);
    return list.slice(0, Math.max(0, room));
  }

  // ---------- Démarrage ----------
  // Le tuto d'installation n'interrompt jamais une question : il attend l'accueil, sans feuille ouverte.
  let instT = null;
  function scheduleInstall() {
    if (instT || standalone() || localStorage.getItem('sillage.install')) return; let n = 0;
    instT = setInterval(() => { n++; if (n > 40) { clearInterval(instT); instT = null; return; } if (!D.account.loggedIn() || $('#prof') || $('#onb') || $('#acct') || ($('#story') && !$('#story').hidden) || ($('#sheet') && !$('#sheet').hidden)) return; clearInterval(instT); instT = null; installTip(false); }, 4000);
  }
  function onLogin() { paintAvatar(); scheduleInstall(); }
  window.SillageProduct = { subtabs, playSub, profile, entry, playlist, limitAdd, onLogin, installTip, applyContent };
  try { if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('/sw.js').catch(() => {}); } catch (e) { /* ok */ }
  P.content().then(applyContent).catch(() => {});
  if (D.account.loggedIn()) { P.load().then(() => { paintAvatar(); }).catch(() => {}); scheduleInstall(); }
  try { const tk = new URLSearchParams(location.search).get('reset'); if (tk && /^[a-f0-9]{64}$/.test(tk) && !D.account.loggedIn()) setTimeout(() => { if (!$('#acct')) I.showAccount('force', { reset: tk }); }, 1200); } catch (e) { /* ok */ }
})();
