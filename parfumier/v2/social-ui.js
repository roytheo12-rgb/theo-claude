// Réseau de Sillage : fil de la communauté, publications, abonnements, avis par parfum, profils de membres et de marques, chiffres.
// Chargé après product.js, qui lui prête ses outils (SillageProduct.util).
(function () {
  'use strict';
  const SP = window.SillageProduct; if (!SP || !SP.util) return;
  const { esc, $, $$, I, D, P, ART, safeUrl, hostOf, REL, itemRows, bindRows, videoLink, adNote, shareOut, shareUrl, fitJpeg, showComm, entryOf, pk, mine, BOX } = SP.util;
  const N = P.social; if (!N) return;
  const E = I.E;
  const logged = () => (ART ? true : D.account.loggedIn());
  const when = (ts) => { const m = Math.round((Date.now() - ts) / 60000); if (m < 1) return 'à l\'instant'; if (m < 60) return 'il y a ' + m + ' min'; const h = Math.round(m / 60); if (h < 24) return 'il y a ' + h + ' h'; const d = Math.round(h / 24); return d < 30 ? 'il y a ' + d + ' j' : new Date(ts).toLocaleDateString('fr-FR'); };
  const ERR = { plan: 'Publier est réservé à Premium.', pseudo: 'Choisis d\'abord un pseudo dans ton profil.', verify: 'Confirme d\'abord ton adresse courriel.', rules: 'Ni lien, ni adresse, ni insulte dans le texte.', image: 'Cette image est trop lourde ou illisible.', content: 'Écris au moins une phrase, ou ajoute une photo ou un lien.', rate: 'Trop d\'actions, réessaie plus tard.', network: 'Pas de connexion.', auth: 'Connecte-toi d\'abord.', social_off: 'Cette partie n\'est pas encore activée.', self: 'Tu ne peux pas te suivre toi-même.', limit: 'Limite atteinte.' };
  const errT = (e) => ERR[e && e.code] || 'Échec, réessaie.';
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
  const avatar = (a, cls) => (a.avatar ? `<img class="hav ${cls || ''}" src="${esc(a.avatar)}" alt="">` : `<span class="hav ph ${cls || ''}">${esc((a.pseudo || '?').charAt(0).toUpperCase())}</span>`);
  const nameOf = (a) => `${esc(a.pseudo || 'Anonyme')}${a.brand ? ' <span class="vbadge" title="Marque vérifiée">✓ Marque vérifiée</span>' : ''}`;
  const head = (a, ts) => `<button type="button" class="fhead" data-mb="${esc(a.by)}">${avatar(a)}<span><b>${nameOf(a)}</b>${ts ? `<small>${when(ts)}</small>` : ''}</span></button>`;
  const perfumeTag = (x) => { const e = x.pn ? entryOf(x.ph, x.pn) : null; return x.pn ? (e ? `<button type="button" class="ptag" data-pt="${esc(pk(e.house, e.name))}">${esc(e.name)} · ${esc(e.house)} ›</button>` : `<span class="ptag off">${esc(x.pn)}${x.ph ? ' · ' + esc(x.ph) : ''}</span>`) : ''; };
  const labels = (x) => (x.brand ? '<p class="flab">Contenu de marque · Les conseils de l\'IA ne sont jamais influencés par les marques</p>' : x.ad ? '<p class="flab">Partenariat ou publicité</p>' : '');
  const linkOut = (u, txt) => (safeUrl(u) || String(u).startsWith('/api/go/') ? `<a class="ghost vlink" href="${esc(u)}" target="_blank" rel="${REL}">${txt}</a>` : '');
  const bindCard = (root) => {
    $$('[data-mb]', root).forEach((b) => (b.onclick = () => member(b.dataset.mb)));
    $$('[data-cm]', root).forEach((b) => (b.onclick = () => toggleComments(root, b)));
    $$('[data-pt]', root).forEach((b) => (b.onclick = () => { const e = I.dbList().find((x) => !x.ed && pk(x.house, x.name) === b.dataset.pt); if (e) I.openEntry(e); }));
  };

  // ---------- Commentaires sous une publication ----------
  function toggleComments(root, btn) {
    const id = btn.dataset.cm, box = $('[data-cmb="' + id + '"]', root); if (!box) return;
    if (!box.hidden) { box.hidden = true; return; }
    box.hidden = false; box.innerHTML = '<p class="soft small">…</p>';
    const m = P.me(), draw = async () => {
      let j; try { j = await N.comments(id); } catch (e) { box.innerHTML = `<p class="soft small">${esc(errT(e))}</p>`; return; }
      const mineBy = m && m.profile ? m.profile.by : '', postMine = mineBy && btn.dataset.pa === mineBy;
      box.innerHTML = (j.items.length ? j.items.map((c) => `<div class="cmt">${head(c.author, c.ts)}<p class="ftxt">${esc(c.txt)}</p>${(c.author.by === mineBy || postMine || P.isAdmin()) ? `<button type="button" class="linkbtn danger" data-cd="${esc(c.id)}">Supprimer</button>` : ''}</div>`).join('') : '<p class="soft small">Aucun commentaire.</p>')
        + (logged() ? `<div class="cmform"><input type="text" maxlength="300" placeholder="Ajouter un commentaire" aria-label="Commentaire" data-ci><button type="button" class="ghost" data-cs>Envoyer</button></div><p class="mono" data-cmsg style="${BOX}"></p>` : '<p class="soft small">Connecte-toi pour commenter.</p>');
      bindCard(box);
      const msg = $('[data-cmsg]', box);
      $$('[data-cd]', box).forEach((d) => (d.onclick = async () => { try { await N.delComment(d.dataset.cd, id); draw(); } catch (e) { if (msg) msg.textContent = errT(e); } }));
      if ($('[data-cs]', box)) $('[data-cs]', box).onclick = async () => { const t0 = $('[data-ci]', box).value.trim(); if (t0.length < 2) { msg.textContent = 'Écris au moins un mot.'; return; } msg.textContent = '…'; try { await N.comment(id, t0); btn.textContent = 'Commentaires (' + ((parseInt((btn.textContent.match(/\((\d+)\)/) || [0, 0])[1], 10) || 0) + 1) + ')'; draw(); } catch (e) { msg.textContent = errT(e); } };
    };
    draw();
  }

  function card(x) {
    if (x.t === 'post') {
      return `<article class="fcard" data-fid="${esc(x.id)}">${head(x.author, x.ts)}${x.txt ? `<p class="ftxt">${esc(x.txt)}</p>` : ''}${x.img ? `<img class="fimg" src="${esc(x.img)}" alt="" loading="lazy">` : ''}${perfumeTag(x)}${x.video ? `<div class="row">${linkOut(x.video, '▶ Voir la vidéo ou le lien ↗')}</div>` : ''}${labels(x)}
        <div class="fact"><button type="button" class="linkbtn" data-cm="${esc(x.id)}" data-pa="${esc(x.author.by)}">Commentaires${x.cc ? ' (' + x.cc + ')' : ''}</button><button type="button" class="linkbtn" data-pr="${esc(x.id)}">Signaler</button><button type="button" class="linkbtn danger" data-pd="${esc(x.id)}" hidden>Supprimer</button></div><div class="cmbox" data-cmb="${esc(x.id)}" hidden></div></article>`;
    }
    if (x.t === 'list') {
      return `<article class="fcard">${head(x.author, x.ts)}<button type="button" class="myc ${x.cover ? 'hascov' : ''}" data-fl="${esc(x.id)}" ${x.cover ? `style="background-image:linear-gradient(90deg,rgba(8,8,10,.92) 35%,rgba(8,8,10,.3)),url('${esc(x.cover)}')"` : ''}><b>${esc(x.title)}</b><small>${x.items.length} parfums${x.video ? ' · vidéo' : ''}${x.ad ? ' · partenariat' : ''}</small>${x.desc ? `<em>${esc(x.desc)}</em>` : ''}</button></article>`;
    }
    return `<article class="fcard">${head(x.author, x.ts)}<p class="ftxt"><span class="stars">${stars(x.stars)}</span> ${esc(x.n)}${x.h ? ' · ' + esc(x.h) : ''}</p><p class="ftxt">${esc(x.txt)}</p><button type="button" class="ptag" data-pt="${esc(pk(x.h, x.n))}">Voir la fiche ›</button></article>`;
  }

  // ---------- Pour toi : l'activité des gens que tu suis ----------
  const needAccount = (body, why) => {
    body.innerHTML = `<div class="empty"><b>${esc(why)}</b><p class="soft">Crée un compte gratuit pour suivre des gens, publier et noter les parfums.</p><button class="cta" id="na-go"><span>Créer un compte</span></button></div>`;
    $('#na-go', body).onclick = () => I.showAccount('force');
  };
  function pourToi() {
    $('#view').innerHTML = '<section class="sec"><header><h2>Pour toi</h2><span class="mono">l\'activité de tes abonnements</span></header><div id="pt"></div></section>';
    const body = $('#pt'); if (!logged()) return needAccount(body, 'Le fil de tes amis');
    feed(body);
  }
  async function feed(body) {
    let scope = 'follow', items = [], next = 0, busy = false;
    const m = P.me();
    body.innerHTML = '<div class="chips" id="fs"><button type="button" class="chip on" data-sc="follow">Mes abonnements</button><button type="button" class="chip" data-sc="all">Découvrir</button></div><div class="row"><button class="cta" id="fp"><span>Publier</span></button></div><div id="fl" class="flist"></div><div class="row"><button class="ghost" id="fm" hidden>Voir plus</button></div><p class="mono" id="fmsg" style="' + BOX + '"></p>';
    const list = $('#fl', body), msg = $('#fmsg', body), more = $('#fm', body);
    const paint = (fresh) => {
      list.innerHTML = items.length ? items.map(card).join('') : (scope === 'follow' ? '<div class="empty"><b>Rien pour l\'instant</b><p class="soft">Dès que les gens que tu suis publient, partagent une playlist ou notent un parfum, ça arrive ici.</p><button class="ghost" id="fd-go" type="button">Trouver des gens à suivre</button></div>' : '<div class="empty"><b>Rien pour l\'instant</b><p class="soft">Sois le premier à publier.</p></div>');
      if ($('#fd-go', list)) $('#fd-go', list).onclick = () => $('[data-sc="all"]', body).click();
      bindCard(list);
      $$('[data-fl]', list).forEach((b) => (b.onclick = () => { const x = items.find((i) => i.t === 'list' && i.id === b.dataset.fl); if (x) showComm(Object.assign({ pseudo: x.author.pseudo, by: x.author.by }, x), { ro: !logged() }); }));
      $$('[data-pr]', list).forEach((b) => (b.onclick = async () => { try { await N.reportPost(b.dataset.pr); b.textContent = 'Signalé, merci'; b.disabled = true; } catch (e) { msg.textContent = errT(e); } }));
      $$('[data-pd]', list).forEach((b) => { const x = items.find((i) => i.id === b.dataset.pd); if (P.isAdmin() || (m && x && m.profile && x.author.by === m.profile.by)) b.hidden = false; b.onclick = async () => { try { await N.delPost(b.dataset.pd); items = items.filter((i) => i.id !== b.dataset.pd); paint(); } catch (e) { msg.textContent = errT(e); } }; });
      if (fresh !== false) { const ids = items.filter((i) => i.t === 'post').map((i) => i.id); if (ids.length && N.view) N.view({ posts: ids.slice(0, 30) }); }
      more.hidden = !next;
    };
    const load = async (reset) => {
      if (busy) return; busy = true; msg.textContent = '…';
      try { const j = await N.feed(scope, reset ? 0 : next); items = reset ? j.items : items.concat(j.items); next = j.next; msg.textContent = ''; paint(); }
      catch (e) { msg.textContent = e.code === 'unavailable' ? 'Le fil a besoin de la base de l\'artefact.' : (e.code === 'auth' ? 'Connecte-toi pour voir le fil.' : errT(e)); }
      busy = false;
    };
    $$('[data-sc]', body).forEach((b) => (b.onclick = () => { scope = b.dataset.sc; $$('[data-sc]', body).forEach((x) => x.classList.toggle('on', x === b)); load(true); }));
    more.onclick = () => load(false);
    $('#fp', body).onclick = () => postSheet(() => load(true));
    load(true);
  }

  // ---------- Inspirations > Communauté : les playlists des membres, par catégorie ----------
  async function community(body) {
    const cats = SP.util.getCats();
    body.innerHTML = '<p class="plintro">Les playlists des membres, rangées par catégorie. Elles viennent après celles de Sillage.</p><span class="shim" style="display:block;height:120px"></span>';
    let j; try { j = await P.community.list(); } catch (e) { body.innerHTML = '<p class="soft">Impossible de charger pour l\'instant. Réessaie dans un instant.</p>'; return; }
    const all = j.items || []; let cur = '';
    const draw = () => {
      const groups = [...cats, ''].map((c) => [c, all.filter((x) => (cats.includes(x.cat) ? x.cat : '') === c)]).filter(([c, l]) => l.length && (!cur || cur === c));
      body.innerHTML = `<p class="plintro">Les playlists des membres, rangées par catégorie. Elles viennent après celles de Sillage.</p>
        ${all.length ? `<div class="chips plsecs"><button class="chip ${cur ? '' : 'on'}" data-cc="">Tout</button>${cats.filter((c) => all.some((x) => x.cat === c)).map((c) => `<button class="chip ${cur === c ? 'on' : ''}" data-cc="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}
        ${groups.length ? groups.map(([c, l]) => `<section class="cgroup"><header><h3>${esc(c || 'Autres')}</h3><span class="mono">${l.length}</span></header><div class="cgrid">${l.map((x) => `<button type="button" class="ccard ${x.cover ? 'hascov' : ''}" data-fl="${esc(x.id)}" ${x.cover ? `style="background-image:linear-gradient(180deg,rgba(8,8,10,.15) 20%,rgba(8,8,10,.92)),url('${esc(x.cover)}')"` : ''}><b>${esc(x.title)}</b><small>par ${esc(x.pseudo)} · ${x.items.length} parfums${x.likes ? ' · ♥ ' + x.likes : ''}</small></button>`).join('')}</div></section>`).join('') : '<div class="empty"><b>Aucune playlist pour l\'instant</b><p class="soft">Publie la tienne depuis ton profil, onglet Playlists.</p></div>'}`;
      $$('[data-cc]', body).forEach((b) => (b.onclick = () => { cur = b.dataset.cc; draw(); }));
      $$('[data-fl]', body).forEach((b) => (b.onclick = () => { const x = all.find((i) => i.id === b.dataset.fl); if (x) showComm(x, { ro: !logged() }); }));
    };
    draw();
  }

  // ---------- Profil : mes publications, mes playlists, mes abonnés, ma wishlist ----------
  async function me(sub, wishFn) {
    const v = $('#view'), m = P.me(), SUBS = [['lists', 'Playlists'], ['posts', 'Publications'], ['people', 'Abonnés'], ['wish', 'Wishlist']];
    let j = null;
    if (logged() && m && m.profile && m.profile.by) { try { j = await N.profile(m.profile.by); } catch (e) { j = null; } }
    const pf = m && m.profile ? m.profile : { pseudo: '', avatar: '', bio: '', by: '' };
    const hdr = `<section class="sec mepro"><header><h2>Profil</h2><span class="mono">${logged() ? 'ton espace' : 'sur cet appareil'}</span></header>
      <div class="mecard">${avatar(pf, 'big')}<div class="meinfo"><b>${esc(pf.pseudo || 'Sans pseudo')}</b>${pf.bio ? `<span class="soft">${esc(pf.bio)}</span>` : ''}</div></div>
      ${j ? `<div class="mestats"><button type="button" data-ms="posts"><b>${j.posts.length}</b><span>publication${j.posts.length > 1 ? 's' : ''}</span></button><button type="button" data-ms="people"><b>${j.followers}</b><span>abonné${j.followers > 1 ? 's' : ''}</span></button><button type="button" data-ms="people2"><b>${j.following}</b><span>abonnement${j.following > 1 ? 's' : ''}</span></button></div>` : ''}
      <div class="row3"><button class="ghost" id="me-ed" type="button">Modifier</button>${logged() && pf.by ? '<button class="ghost" id="me-pv" type="button">Aperçu public</button><button class="ghost" id="me-sh" type="button">Partager</button>' : ''}</div>
      <div class="plsubtabs">${SUBS.map(([k, l]) => `<button type="button" class="${sub === k ? 'on' : ''}" data-msub="${k}">${l}</button>`).join('')}</div>
      <div id="mebody"></div></section>`;
    const bindHdr = () => {
      $$('[data-msub]', v).forEach((b) => (b.onclick = () => { I.NAV.me = b.dataset.msub; I.render(true); }));
      $$('[data-ms]', v).forEach((b) => (b.onclick = () => { I.NAV.me = b.dataset.ms === 'posts' ? 'posts' : 'people'; I.NAV.people = b.dataset.ms === 'people2' ? 'following' : 'followers'; I.render(true); }));
      $('#me-ed', v).onclick = () => $('#profileBtn').click();
      if ($('#me-pv', v)) $('#me-pv', v).onclick = () => SP.util.previewMine();
      if ($('#me-sh', v)) $('#me-sh', v).onclick = async () => { const t0 = (pf.pseudo || 'Un membre') + ' sur Sillage'; const r = await shareOut(t0, t0, shareUrl('u', pf.by)); if (r) { const mm = $('#mebody', v); if (mm) mm.insertAdjacentHTML('afterbegin', `<p class="mono" style="${BOX}">${esc(r)}</p>`); } };
    };
    if (sub === 'wish') { wishFn(); v.insertAdjacentHTML('afterbegin', hdr.replace('<div id="mebody"></div></section>', '</section>')); bindHdr(); return; }
    v.innerHTML = hdr; bindHdr(); const body = $('#mebody', v);
    if (sub === 'lists') return SP.util.viewMine(body);
    if (!logged()) return needAccount(body, sub === 'posts' ? 'Tes publications' : 'Tes abonnés et abonnements');
    if (sub === 'posts') {
      body.innerHTML = `<div class="row"><button class="cta" id="mp-new"><span>Publier</span></button></div><div class="flist" id="mp-l"></div>`;
      const posts = j ? j.posts : [];
      $('#mp-l', body).innerHTML = posts.length ? posts.map(card).join('') : '<div class="empty"><b>Aucune publication</b><p class="soft">Un avis, une photo, une vidéo : ce que tu publies apparaît dans le fil de tes abonnés.</p></div>';
      bindCard(body); $$('[data-pd]', body).forEach((b) => { b.hidden = false; b.onclick = async () => { try { await N.delPost(b.dataset.pd); I.render(true); } catch (e) { /* ok */ } }; }); $$('[data-pr]', body).forEach((b) => b.remove());
      $('#mp-new', body).onclick = () => postSheet(() => I.render(true));
      return;
    }
    // abonnés / abonnements
    const which = I.NAV.people || 'followers';
    body.innerHTML = `<div class="chips"><button type="button" class="chip ${which === 'followers' ? 'on' : ''}" data-pw="followers">Abonnés</button><button type="button" class="chip ${which === 'following' ? 'on' : ''}" data-pw="following">Abonnements</button></div><div id="pp-l" class="peoplelist">…</div>`;
    $$('[data-pw]', body).forEach((b) => (b.onclick = () => { I.NAV.people = b.dataset.pw; I.render(true); }));
    try { const r = which === 'following' ? await N.following() : await N.followers(); $('#pp-l', body).innerHTML = r.items.length ? r.items.map((x) => head(x)).join('') : `<div class="empty"><b>${which === 'following' ? 'Tu ne suis personne' : 'Pas encore d\'abonnés'}</b><p class="soft">${which === 'following' ? 'Ouvre un profil depuis « Découvrir » dans Pour toi.' : 'Partage ton profil pour que les gens te suivent.'}</p></div>`; bindCard($('#pp-l', body)); }
    catch (e) { $('#pp-l', body).textContent = errT(e); }
  }

  // ---------- Notifications ----------
  const NTXT = { follow: (n) => `<b>${esc(n.author ? n.author.pseudo : 'Quelqu\'un')}</b> te suit`, comment: (n) => `<b>${esc(n.author ? n.author.pseudo : 'Quelqu\'un')}</b> a commenté ta publication : « ${esc(n.txt)} »`, sale: (n) => `Une vente est passée par ton lien : <b>${esc(n.txt)}</b>`, brand: (n) => esc(n.txt) };
  async function openNotifs() {
    const pn = I.openSheet('<div><h2>Notifications</h2></div><div id="nt-l" class="flist">…</div>');
    try {
      const j = await N.notifs();
      $('#nt-l', pn).innerHTML = j.items.length ? j.items.map((n) => `<button type="button" class="notif ${n.seen ? '' : 'new'}" data-nk="${esc(n.kind)}" data-nb="${esc(n.author ? n.author.by : '')}">${n.author ? avatar(n.author) : '<span class="hav ph">✓</span>'}<span>${(NTXT[n.kind] || (() => 'Nouvelle activité'))(n)}<small>${when(n.ts)}</small></span></button>`).join('') : '<div class="empty"><b>Rien de nouveau</b><p class="soft">Tu seras prévenu ici d\'un nouvel abonné, d\'un commentaire ou d\'une vente.</p></div>';
      $$('[data-nk]', pn).forEach((b) => (b.onclick = () => { const k = b.dataset.nk, by = b.dataset.nb; I.closeSheet(); if (k === 'follow' && by) member(by); else if (k === 'comment') { I.NAV.me = 'posts'; I.goTab('wish'); } else if (k === 'sale') { I.NAV.me = 'lists'; I.goTab('wish'); } }));
      if (j.unread) { await N.notifsRead(); const bn = $('#bellN'); if (bn) bn.hidden = true; }
    } catch (e) { $('#nt-l', pn).textContent = errT(e); }
  }
  function initBell() {
    const b = $('#bellBtn'), n = $('#bellN'); if (!b || b.dataset.on) return; b.dataset.on = '1'; b.onclick = openNotifs;
    const poll = async () => { if (!logged()) { b.hidden = true; return; } try { const r = await N.notifCount(); b.hidden = false; n.textContent = r.unread > 9 ? '9+' : r.unread; n.hidden = !r.unread; } catch (e) { /* pas de réseau ou pas de base */ } };
    poll(); setInterval(poll, 60000); window.addEventListener('sillage:me', poll);
  }

  // ---------- Publier ----------
  function postSheet(done) {
    const d = { img: '', h: '', n: '' };
    const pn = I.openSheet(`<div><h2>Nouvelle publication</h2><p style="color:var(--muted);margin-top:6px">Un avis, une trouvaille, une vidéo. Pas de lien ni d'adresse dans le texte, les liens vont dans le champ prévu.</p></div>
      <textarea id="po-t" rows="4" maxlength="600" placeholder="Qu'as-tu à dire sur un parfum ?" aria-label="Texte"></textarea>
      <div class="covrow"><button type="button" class="cover-btn" id="po-ib"><span>＋ Photo</span></button><input type="file" id="po-if" accept="image/*" hidden></div>
      <input type="url" id="po-v" maxlength="300" placeholder="Lien d'une vidéo ou d'une boutique (https://…), facultatif" aria-label="Lien">
      <input type="search" id="po-q" placeholder="Lier un parfum de la base, facultatif" autocomplete="off" aria-label="Parfum"><div id="po-r" class="vrres"></div><p class="soft small" id="po-tag" style="margin:0"></p>
      <label class="chk"><input type="checkbox" id="po-ad"><span>C'est un partenariat ou une publicité</span></label>
      <div class="row"><button class="cta" id="po-go"><span>Publier</span></button><button class="ghost" id="po-x">Annuler</button></div><p class="mono" id="po-m" style="${BOX}"></p>`);
    const msg = $('#po-m', pn);
    $('#po-ib', pn).onclick = () => $('#po-if', pn).click();
    $('#po-if', pn).onchange = async () => { const f = $('#po-if', pn).files[0]; if (!f) return; try { d.img = await fitJpeg(f, 720, 720, 44000); $('#po-ib', pn).innerHTML = `<img src="${esc(d.img)}" alt="">`; } catch (e) { msg.textContent = 'Cette photo ne passe pas.'; } };
    $('#po-q', pn).oninput = (ev) => { const t = E.norm(ev.target.value), box = $('#po-r', pn); if (t.length < 2) { box.innerHTML = ''; return; } const hits = I.dbList().filter((e) => !e.ed && E.norm(e.house + ' ' + e.name).includes(t)).slice(0, 6); box.innerHTML = hits.map((e, i) => `<button type="button" class="vrh" data-rh="${i}"><b>${esc(e.name)}</b><small>${esc(e.house)}</small></button>`).join(''); $$('[data-rh]', box).forEach((b) => (b.onclick = () => { const e = hits[+b.dataset.rh]; d.h = e.house; d.n = e.name; $('#po-tag', pn).textContent = 'Parfum lié : ' + e.name + ' · ' + e.house; box.innerHTML = ''; ev.target.value = ''; })); };
    $('#po-x', pn).onclick = I.closeSheet;
    $('#po-go', pn).onclick = async () => {
      const v = $('#po-v', pn).value.trim(); if (v && !safeUrl(v)) { msg.textContent = 'Le lien doit commencer par https://'; return; }
      msg.textContent = '…'; $('#po-go', pn).disabled = true;
      try { await N.post({ txt: $('#po-t', pn).value.trim(), img: d.img, video: v, h: d.h, n: d.n, ad: $('#po-ad', pn).checked }); I.closeSheet(); if (done) done(); }
      catch (e) { $('#po-go', pn).disabled = false; if (e.code === 'plan') { I.closeSheet(); if (D.plans) D.plans('plan'); return; } msg.textContent = errT(e); }
    };
  }

  // ---------- Profil d'un membre ou d'une marque ----------
  async function member(by) {
    let j; try { j = await N.profile(by); } catch (e) { const pn = I.openSheet('<div><h2>Profil introuvable</h2><p style="color:var(--muted)">Ce profil n\'existe plus ou n\'est pas public.</p></div>'); return pn; }
    const pf = j.profile, lk = (pf.links || []).filter(safeUrl).map((u) => `<a class="ghost vlink" href="${esc(u)}" target="_blank" rel="${REL}">${esc(hostOf(u))} ↗</a>`).join('');
    const pn = I.openSheet(`<div class="crhead">${avatar(pf, 'big')}<div><h2>${nameOf(pf)}</h2>${pf.bio ? `<p class="soft" style="margin:4px 0 0">${esc(pf.bio)}</p>` : ''}<p class="soft small" style="margin:6px 0 0"><b id="mb-fl">${j.followers}</b> abonné${j.followers > 1 ? 's' : ''} · ${j.following} abonnement${j.following > 1 ? 's' : ''}</p></div></div>
      ${lk ? `<div class="row">${lk}</div>` : ''}
      <div class="row">${j.mine ? '' : `<button class="cta" id="mb-fo"><span>${j.iFollow ? 'Abonné ✓' : 'Suivre'}</span></button>`}<button class="ghost" id="mb-sh">Partager</button></div><p class="mono" id="mb-m" style="${BOX}"></p>
      ${j.posts.length ? `<p class="mono">Publications</p><div class="flist">${j.posts.map(card).join('')}</div>` : ''}
      ${j.lists.length ? `<p class="mono">Listes</p><div class="mylist">${j.lists.map((x, i) => `<button type="button" class="myc ${x.cover ? 'hascov' : ''}" data-ml="${i}" ${x.cover ? `style="background-image:linear-gradient(90deg,rgba(8,8,10,.92) 35%,rgba(8,8,10,.3)),url('${esc(x.cover)}')"` : ''}><b>${esc(x.title)}</b><small>${x.items.length} parfums${x.video ? ' · vidéo' : ''}</small></button>`).join('')}</div>` : ''}
      ${j.loves.length ? `<p class="mono">Avis et coups de cœur</p><div class="xlist">${j.loves.map((r, i) => `<button type="button" class="xc" data-lv="${i}"><span class="xt"><b>${esc(r.n)}</b><small>${esc(r.h || '')} · <span class="stars">${stars(r.stars)}</span></small>${r.txt ? `<small>${esc(r.txt)}</small>` : ''}</span><i class="xm">›</i></button>`).join('')}</div>` : ''}
      ${j.wishlist && j.wishlist.length ? `<p class="mono">Wishlist</p><div class="xlist">${itemRows(j.wishlist)}</div>` : ''}
      ${!j.posts.length && !j.lists.length && !j.loves.length ? '<p class="soft">Rien de public pour l\'instant.</p>' : ''}`);
    bindCard(pn); const msg = $('#mb-m', pn);
    if (j.wishlist) bindRows(pn, j.wishlist);
    $$('[data-ml]', pn).forEach((b) => (b.onclick = () => { const x = j.lists[+b.dataset.ml]; showComm(Object.assign({ pseudo: pf.pseudo, by: '' }, x), { ro: !logged() }); }));
    $$('[data-lv]', pn).forEach((b) => (b.onclick = () => { const r = j.loves[+b.dataset.lv], e = entryOf(r.h, r.n); if (e) I.openEntry(e); }));
    $$('[data-pr]', pn).forEach((b) => (b.onclick = async () => { try { await N.reportPost(b.dataset.pr); b.textContent = 'Signalé, merci'; } catch (e) { msg.textContent = errT(e); } }));
    if ($('#mb-fo', pn)) $('#mb-fo', pn).onclick = async () => {
      if (!logged()) { msg.textContent = 'Connecte-toi pour suivre ce profil.'; return; }
      try { const r = await N.follow(by, !j.iFollow); j.iFollow = r.following; $('#mb-fo', pn).firstChild.textContent = r.following ? 'Abonné ✓' : 'Suivre'; $('#mb-fl', pn).textContent = r.followers; } catch (e) { msg.textContent = errT(e); }
    };
    $('#mb-sh', pn).onclick = async () => { const t0 = (pf.pseudo || 'Un membre') + ' sur Sillage'; msg.textContent = (await shareOut(t0, t0, shareUrl('u', by))) || ''; };
    if (N.view && pf.brand) N.view({ posts: j.posts.map((p) => p.id) });
    return pn;
  }

  // ---------- Avis par parfum, sur chaque fiche ----------
  async function rating(pn, e) {
    if (N.view && !ART) N.view({ h: e.house, n: e.name });
    if (!logged()) return;
    const box = document.createElement('div'); box.className = 'card'; box.style.cssText = 'display:grid;gap:10px'; pn.appendChild(box);
    let j = null; try { j = await N.ratings(e.house, e.name); } catch (er) { box.remove(); return; }
    let val = j.mine ? j.mine.stars : 0;
    const draw = () => {
      box.innerHTML = `<b>Mon avis</b><div class="starpick" role="radiogroup" aria-label="Ma note">${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="star ${n <= val ? 'on' : ''}" data-st="${n}" aria-label="${n} sur 5">★</button>`).join('')}</div>
        <textarea id="rv-t" rows="2" maxlength="400" placeholder="Un mot sur ce parfum, facultatif" aria-label="Mon commentaire">${esc(j.mine ? j.mine.txt : '')}</textarea>
        <div class="row"><button class="ghost" id="rv-go" type="button">Enregistrer mon avis</button>${j.mine ? '<button class="ghost danger" id="rv-rm" type="button">Retirer</button>' : ''}</div><p class="mono" id="rv-m" style="${BOX}"></p>
        ${j.count ? `<p class="soft small" style="margin:0">${j.count} avis · moyenne ${j.avg} sur 5</p>` : '<p class="soft small" style="margin:0">Aucun avis pour l\'instant.</p>'}
        ${j.friends.length ? `<p class="mono">Chez tes abonnements</p>${j.friends.map((f) => `<div class="rvrow">${head(f.author, f.ts)}<p class="ftxt"><span class="stars">${stars(f.stars)}</span>${f.txt ? ' ' + esc(f.txt) : ''}</p></div>`).join('')}` : ''}`;
      bindCard(box);
      $$('[data-st]', box).forEach((b) => (b.onclick = () => { val = +b.dataset.st; $$('[data-st]', box).forEach((x) => x.classList.toggle('on', +x.dataset.st <= val)); }));
      const m = $('#rv-m', box);
      $('#rv-go', box).onclick = async () => { if (!val) { m.textContent = 'Choisis une note de 1 à 5.'; return; } m.textContent = '…'; try { await N.rate({ h: e.house, n: e.name, stars: val, txt: $('#rv-t', box).value.trim() }); j = await N.ratings(e.house, e.name); draw(); $('#rv-m', box).textContent = 'Avis enregistré ✓'; } catch (er) { m.textContent = errT(er); } };
      if ($('#rv-rm', box)) $('#rv-rm', box).onclick = async () => { try { await N.unrate(e.house, e.name); val = 0; j = await N.ratings(e.house, e.name); draw(); } catch (er) { m.textContent = errT(er); } };
    };
    draw();
  }

  // ---------- Dans le profil : wishlist publique, chiffres, espace marque, éditeur ----------
  function profileCards(wrap, m) {
    const net = document.createElement('div'); net.className = 'card'; net.style.cssText = 'display:grid;gap:10px'; wrap.insertBefore(net, wrap.firstChild);
    net.innerHTML = `<b>Mon réseau</b><label class="chk"><input type="checkbox" id="nw-pub"><span>Ma wishlist est publique (les autres la voient sur mon profil)</span></label><div class="row"><button class="ghost" id="nw-st" type="button">${ART ? 'Mes abonnés' : 'Mes chiffres'}</button><button class="ghost" id="nw-fo" type="button">Mes abonnements</button></div><div id="nw-out" style="display:grid;gap:8px"></div><p class="mono" id="nw-m" style="${BOX}"></p>`;
    const out = $('#nw-out', net), msg = $('#nw-m', net), items = () => (I.S().wishlist || []).map((w) => ({ n: w.name, h: w.house }));
    N.wishlistPub().then((r) => { $('#nw-pub', net).checked = !!r.pub; }).catch(() => {});
    $('#nw-pub', net).onchange = async (ev) => { try { await N.wishlist(ev.target.checked, items()); msg.textContent = ev.target.checked ? 'Wishlist publique ✓ (mise à jour à chaque changement de ce réglage)' : 'Wishlist privée ✓'; } catch (e) { ev.target.checked = !ev.target.checked; msg.textContent = errT(e); } };
    $('#nw-st', net).onclick = async () => { out.textContent = '…'; try { const s = await N.myStats(); out.innerHTML = `<p class="ftxt" style="white-space:pre-line">${s.followers} abonné${s.followers > 1 ? 's' : ''}${ART ? '' : `\n${s.postViews} vues de tes publications (30 jours)`}${s.sales ? `\nGains : ${s.sales.earned.toFixed(2).replace('.', ',')} € (${s.sales.due.toFixed(2).replace('.', ',')} € à recevoir) pour ${s.sales.n} vente${s.sales.n > 1 ? 's' : ''}, ta part est de ${s.sales.share} % de la commission` : ''}</p>${(s.links || []).length ? `<p class="mono">Clics sur tes liens (30 jours)</p>${s.links.map((l) => `<div class="eir"><span><b>${esc(hostOf(l.url))}</b><small>${esc(l.url.slice(0, 60))}</small></span><span class="eib"><b>${l.n}</b></span></div>`).join('')}` : ''}`; } catch (e) { out.textContent = errT(e); } };
    $('#nw-fo', net).onclick = async () => { out.textContent = '…'; try { const j = await N.following(); out.innerHTML = j.items.length ? j.items.map((a) => head(a)).join('') : '<p class="soft small">Tu ne suis personne pour l\'instant.</p>'; $$('[data-mb]', out).forEach((b) => (b.onclick = () => { I.closeSheet(); member(b.dataset.mb); })); } catch (e) { out.textContent = errT(e); } };
    if (N.caps.brand) brandCard(wrap, m);
    if (m.admin) catsCard(wrap);
    if (m.admin && N.caps.brand) editorCards(wrap);
  }
  function brandCard(wrap, m) {
    const c = document.createElement('div'); c.className = 'card'; c.style.cssText = 'display:grid;gap:10px'; wrap.appendChild(c);
    c.innerHTML = '<b>Espace marque</b><p class="soft small" style="margin:0">Marques et maisons : un profil vérifié, des publications étiquetées, des chiffres. Les conseils de l\'IA ne sont jamais influencés par ce contenu.</p><div id="br-in">…</div>';
    const box = $('#br-in', c);
    const form = (b) => {
      box.innerHTML = `<input type="text" id="br-n" maxlength="60" placeholder="Nom de la marque" value="${esc(b ? b.name : '')}" aria-label="Nom"><input type="url" id="br-s" maxlength="300" placeholder="Site officiel (https://…)" value="${esc(b ? b.site : '')}" aria-label="Site"><input type="text" id="br-h" maxlength="200" placeholder="Maisons ou marques, séparées par une virgule" value="${esc(b ? (b.houses || []).join(', ') : '')}" aria-label="Maisons"><textarea id="br-b" rows="2" maxlength="240" placeholder="Une phrase de présentation" aria-label="Présentation">${esc(b ? b.bio : '')}</textarea>
        <div class="row"><button class="ghost" id="br-go" type="button">${b ? 'Mettre à jour la demande' : 'Demander un profil vérifié'}</button></div><p class="mono" id="br-m" style="${BOX}"></p>`;
      $('#br-go', box).onclick = async () => { const mm = $('#br-m', box), s = $('#br-s', box).value.trim(); if (!safeUrl(s)) { mm.textContent = 'Le site doit commencer par https://'; return; } mm.textContent = '…'; try { await N.brandApply({ name: $('#br-n', box).value.trim(), site: s, houses: $('#br-h', box).value.split(','), bio: $('#br-b', box).value.trim(), logo: m.profile.avatar && m.profile.avatar.length < 58000 ? m.profile.avatar : '' }); mm.textContent = 'Demande envoyée. Je la valide à la main, tu seras prévenu par le badge sur ton profil.'; } catch (e) { mm.textContent = e.code === 'content' ? 'Nom et site officiel obligatoires.' : errT(e); } };
    };
    N.brandMe().then((r) => {
      const b = r.brand; if (!b) return form(null);
      if (b.status === 'refused') { box.innerHTML = '<p class="soft small">Ta demande n\'a pas été retenue. Tu peux la mettre à jour.</p>'; return form(b); }
      if (b.status === 'pending') { box.innerHTML = `<p class="soft small" style="margin:0"><b>${esc(b.name)}</b> : demande en cours de vérification.</p>`; return; }
      if (!b.badge) { box.innerHTML = `<p class="soft small" style="margin:0"><b>${esc(b.name)}</b> est vérifiée. Il reste à activer l'abonnement marque (clé reçue de Whop) pour afficher le badge et publier.</p><div class="row"><button class="ghost" id="br-pl" type="button">Entrer ma clé</button></div>`; $('#br-pl', box).onclick = () => { I.closeSheet(); D.plans(''); }; return; }
      const s = r.stats || { posts: [], links: [], perfumeViews: 0, topPerfumes: [] };
      box.innerHTML = `<p class="ftxt"><span class="vbadge">✓ Marque vérifiée</span> ${esc(b.name)}</p><p class="soft small" style="margin:0">Publie depuis l'onglet Inspirations, Communauté : tes publications sont étiquetées « Contenu de marque ».</p>
        <p class="mono">30 derniers jours</p><p class="ftxt" style="white-space:pre-line">${s.perfumeViews} vues de fiches de tes parfums\n${s.links.reduce((t, l) => t + l.n, 0)} clics sur tes liens</p>
        ${s.topPerfumes.length ? `<p class="mono">Fiches les plus vues</p>${s.topPerfumes.map((t) => `<div class="eir"><span><b>${esc(t.k.split('|').reverse().join(' · '))}</b></span><span class="eib"><b>${t.n}</b></span></div>`).join('')}` : ''}
        ${s.posts.length ? `<p class="mono">Tes publications</p>${s.posts.map((p) => `<div class="eir"><span><b>${esc(p.txt || '(image)')}</b><small>${when(p.ts)}</small></span><span class="eib"><b>${p.views}</b> vues</span></div>`).join('')}` : ''}
        <p class="soft small" style="margin:0">Les chiffres sont des compteurs, sans aucune donnée sur les personnes.</p>`;
    }).catch(() => { box.textContent = 'Indisponible pour l\'instant.'; });
  }
  function catsCard(wrap) {
    const c = document.createElement('div'); c.className = 'card'; c.style.cssText = 'display:grid;gap:10px;border-color:var(--wine)'; wrap.appendChild(c);
    c.innerHTML = `<b>Éditeur : catégories de playlists</b><p class="soft small" style="margin:0">Une catégorie par ligne (12 au plus). Les membres en choisissent une en publiant, la communauté est rangée avec.</p><textarea id="ct-t" rows="6" maxlength="400" aria-label="Catégories">${esc(SP.util.getCats().join('\n'))}</textarea><div class="row"><button class="ghost" id="ct-go" type="button">Enregistrer</button></div><p class="mono" id="ct-m" style="${BOX}"></p>`;
    $('#ct-go', c).onclick = async () => { const list = $('#ct-t', c).value.split('\n').map((x) => x.trim()).filter(Boolean), mm = $('#ct-m', c); if (!list.length) { mm.textContent = 'Garde au moins une catégorie.'; return; } mm.textContent = '…'; try { await P.admin.edit({ op: 'cats', list }); const ct = await P.content(); if (SP.applyContent) SP.applyContent(ct); mm.textContent = 'Enregistré ✓'; } catch (e) { mm.textContent = errT(e); } };
  }
  function editorCards(wrap) {
    const c = document.createElement('div'); c.className = 'card'; c.style.cssText = 'display:grid;gap:10px;border-color:var(--wine)'; wrap.appendChild(c);
    c.innerHTML = '<b>Éditeur : marques et publications</b><div class="row"><button class="ghost" id="eb-s" type="button">Commissions</button><button class="ghost" id="eb-b" type="button">Marques à valider</button><button class="ghost" id="eb-p" type="button">Publications signalées</button></div><div id="eb-o" style="display:grid;gap:8px"></div>';
    const out = $('#eb-o', c), fail = (e) => { out.textContent = errT(e); };
    $('#eb-s', c).onclick = async () => { out.textContent = '…'; try { const j = await N.adminSales(); const eur = (x) => x.toFixed(2).replace('.', ',') + ' €'; out.innerHTML = `<p class="ftxt" style="white-space:pre-line">${j.sales} vente${j.sales > 1 ? 's' : ''} pour ${eur(j.amount)}\nCommission reçue : ${eur(j.commission)}\nPart de Sillage (${j.cut} %) : ${eur(j.platform)}\nPart des créateurs : ${eur(j.creators)}</p>${j.due.length ? '<p class="mono">À reverser</p>' + j.due.map((d) => `<div class="eir"><span><b>${esc(d.author.pseudo)}</b></span><span class="eib"><b>${eur(d.due)}</b><button type="button" class="ghost" data-pay="${esc(d.author.by)}">Payé</button></span></div>`).join('') : '<p class="soft small">Rien à reverser.</p>'}`; $$('[data-pay]', out).forEach((b) => (b.onclick = async () => { try { await N.paySales(b.dataset.pay); b.closest('.eir').remove(); } catch (e) { fail(e); } })); } catch (e) { fail(e); } };
    $('#eb-b', c).onclick = async () => { out.textContent = '…'; try { const j = await N.adminBrands(); out.innerHTML = j.items.length ? j.items.map((b) => `<div class="card" style="display:grid;gap:6px"><b>${esc(b.name)}</b><small class="mono" style="text-transform:none;letter-spacing:0">${esc(b.status)} · ${esc(b.site)}</small><span>${esc((b.houses || []).join(', '))}</span>${b.bio ? `<span>${esc(b.bio)}</span>` : ''}<div class="row"><a class="ghost vlink" href="${esc(b.site)}" target="_blank" rel="noopener noreferrer">Voir le site ↗</a><button class="ghost" data-bv="${esc(b.by)}" type="button">Valider</button><button class="ghost danger" data-br="${esc(b.by)}" type="button">${b.status === 'verified' ? 'Retirer' : 'Refuser'}</button></div></div>`).join('') : '<p class="soft small">Aucune demande.</p>'; const act = (a, v) => $$('[' + a + ']', out).forEach((b) => (b.onclick = async () => { try { await N.brandAct(b.getAttribute(a), v); b.closest('.card').remove(); } catch (e) { fail(e); } })); act('data-bv', 'verify'); act('data-br', 'revoke'); } catch (e) { fail(e); } };
    $('#eb-p', c).onclick = async () => { out.textContent = '…'; try { const j = await N.adminPosts(); out.innerHTML = j.items.length ? j.items.map((p) => `<div class="card" style="display:grid;gap:6px"><b>${esc(p.author.pseudo)}</b><small class="mono" style="text-transform:none;letter-spacing:0">${p.reports} signalement${p.reports > 1 ? 's' : ''}${p.hidden ? ' · masquée' : ''}</small><span>${esc(p.txt)}</span><div class="row"><button class="ghost" data-pa="${esc(p.id)}" type="button">Rétablir</button><button class="ghost danger" data-pz="${esc(p.id)}" type="button">Supprimer</button></div></div>`).join('') : '<p class="soft small">Aucune publication signalée.</p>'; const act = (a, v) => $$('[' + a + ']', out).forEach((b) => (b.onclick = async () => { try { await N.postAct(b.getAttribute(a), v); b.closest('.card').remove(); } catch (e) { fail(e); } })); act('data-pa', 'restore'); act('data-pz', 'delete'); } catch (e) { fail(e); } };
  }

  SP.social = { feed, pourToi, community, member, rating, profileCards, postSheet };
  SP.me = me;
  initBell();
})();
