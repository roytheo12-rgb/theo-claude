// Version claude.ai : profil, communauté et éditeur sans serveur, avec la base de l'artefact (claude.use('db') et 'user').
// Même interface que le serveur de la version publique, pour que product.js serve les deux. Pas d'offres, de licence ni d'installation ici.
(function () {
  'use strict';
  if (window.SillageDemo) return;            // version publique : c'est le serveur qui répond
  const clean = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);
  const BAD = /(https?:|www\.|@|\.(com|fr|net|org|io|ru)\b|connard|salope|\bpute\b|enculé|encule|nazi|\bfdp\b|\bntm\b|\bpd\b|nègre|negre)/i;
  const url = (u) => { u = String(u == null ? '' : u).trim(); return u.length <= 300 && /^https:\/\/[^\s<>"'\\@\/]+\.[^\s<>"'\\@\/]+(\/[^\s<>"'\\]*)?$/.test(u) ? u : ''; };
  const items = (a, max, urls) => (Array.isArray(a) ? a : []).slice(0, max).map((x) => { const o = { n: clean(x && x.n, 80), h: clean(x && x.h, 60) }; if (urls) { const u = url(x && x.u); if (u) o.u = u; } return o; }).filter((x) => x.n.length >= 2);
  let db = null, uid = '', owner = false, ME = null, ready = null;
  const ev = () => { try { window.dispatchEvent(new Event('sillage:me')); } catch (e) { /* ok */ } };

  function init() {
    if (ready) return ready;
    ready = (async () => {
      const c = window.claude; if (!c || !c.use) throw { code: 'unavailable' };
      const [d, u] = await Promise.all([c.use('db'), c.use('user')]);
      if (!d || !u) throw { code: 'unavailable' };
      db = d; uid = String(await u.id()); owner = !!(await u.isOwner());
      if (!uid || uid === 'null') throw { code: 'unavailable' };
      const snap = await db.doc('community/' + uid).get(); const s = snap.exists ? snap.data() : {};
      ME = { plan: 'artifact', label: 'Version claude.ai', admin: owner, usage: { adv: 0, chat: 0, ident: 0 }, limits: { adv: 99999, chat: 99999, ident: 99999, col: 99999, insp: 30, publish: true }, profile: { pseudo: s.pseudo || '', avatar: s.avatar || '', bio: s.bio || '', links: s.links || [], by: uid } };
      ev(); return ME;
    })();
    ready.catch(() => { ready = null; });
    return ready;
  }
  const myDoc = async () => { const s = await db.doc('community/' + uid).get(); return s.exists ? JSON.parse(JSON.stringify(s.data())) : {}; };
  const need = async () => { try { await init(); } catch (e) { throw { code: 'unavailable' }; } };
  const readAll = async (col) => { const q = await db.collection(col).get(); return q.docs.filter((d) => d.exists).map((d) => ({ id: d.id, data: d.data() })); };

  function squareJpeg(file, size) {
    return new Promise((resolve, reject) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => { const c = document.createElement('canvas'); c.width = c.height = size; const k = Math.max(size / img.width, size / img.height), w = img.width * k, h = img.height * k; c.getContext('2d').drawImage(img, (size - w) / 2, (size - h) / 2, w, h); URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', .8)); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img')); };
      img.src = url;
    });
  }

  const plan = {
    artifact: true, cfg: {}, me: () => ME, isAdmin: () => !!(ME && ME.admin),
    load: async () => { await need(); return ME; },
    avatar: (file) => squareJpeg(file, 120),
    saveProfile: async (p) => {
      await need(); const cur = await myDoc();
      if (p.pseudo !== undefined) { const ps = clean(p.pseudo, 24); if (ps && (ps.length < 2 || BAD.test(ps))) throw { code: 'pseudo' }; cur.pseudo = ps; }
      if (p.bio !== undefined) cur.bio = clean(p.bio, 160);
      if (p.links !== undefined) cur.links = (Array.isArray(p.links) ? p.links : []).slice(0, 3).map(url).filter(Boolean);
      if (p.avatar !== undefined) { if (p.avatar && !/^data:image\/(jpeg|png|webp);base64,/.test(p.avatar)) throw { code: 'avatar' }; if (p.avatar && p.avatar.length > 40000) throw { code: 'avatar' }; cur.avatar = p.avatar; }
      if (!Array.isArray(cur.pub)) cur.pub = [];
      await db.doc('community/' + uid).set(cur);
      ME.profile = { pseudo: cur.pseudo || '', avatar: cur.avatar || '', bio: cur.bio || '', links: cur.links || [], by: uid }; ev(); return { me: ME };
    },
    community: {
      creator: async (by) => { const j = await plan.community.list(); const items = j.items.filter((x) => x.by === by); const first = items[0]; const doc = await db.doc('community/' + by).get(); const d0 = doc.exists ? doc.data() : {}; return { profile: { pseudo: d0.pseudo || (first && first.pseudo) || '', avatar: d0.avatar || '', bio: d0.bio || '', links: d0.links || [], by }, items }; },
      list: async () => {
        await need();
        const [authors, likes, reps] = await Promise.all([readAll('community'), readAll('likes'), readAll('reports')]);
        const cnt = (docs, id) => docs.filter((d) => (d.data.ids || []).includes(id)).length;
        const out = [];
        authors.forEach((a) => (a.data.pub || []).forEach((x) => { if (cnt(reps, x.id) < 3) out.push({ id: x.id, title: x.title, desc: x.desc, items: x.items, video: x.video || '', ad: !!x.ad, cover: x.cover || '', avatar: a.data.avatar || '', links: a.data.links || [], by: a.id, pseudo: a.data.pseudo || 'Anonyme', ts: x.ts || 0, likes: cnt(likes, x.id), mine: a.id === uid, by: a.id }); }));
        out.sort((x, y) => y.ts - x.ts); return { items: out.slice(0, 200) };
      },
      publish: async (rec) => {
        await need(); const cur = await myDoc(); if (!cur.pseudo) throw { code: 'pseudo' };
        const title = clean(rec.title, 60), its = items(rec.items, 30, true); if (title.length < 3 || its.length < 2) throw { code: 'content' };
        if (BAD.test(title + ' ' + (rec.desc || ''))) throw { code: 'rules' };
        cur.pub = Array.isArray(cur.pub) ? cur.pub : []; const id = rec.id && cur.pub.some((x) => x.id === rec.id) ? rec.id : Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
        if (!cur.pub.some((x) => x.id === id) && cur.pub.length >= 10) throw { code: 'limit' };
        const cover = typeof rec.cover === 'string' && rec.cover.length <= 40000 && /^data:image\/(jpeg|webp);base64,/.test(rec.cover) ? rec.cover : '';
        const row = { id, title, desc: clean(rec.desc, 240), items: its, video: url(rec.video), ad: !!rec.ad, cover, ts: Date.now() }; const i = cur.pub.findIndex((x) => x.id === id); if (i >= 0) cur.pub[i] = row; else cur.pub.push(row);
        await db.doc('community/' + uid).set(cur); return { id };
      },
      remove: async (id) => {
        await need(); const authors = await readAll('community'); const a = authors.find((x) => (x.data.pub || []).some((p) => p.id === id)); if (!a) return { ok: true };
        if (a.id !== uid && !owner) throw { code: 'forbidden' };
        const d = JSON.parse(JSON.stringify(a.data)); d.pub = d.pub.filter((p) => p.id !== id); await db.doc('community/' + a.id).set(d); return { ok: true };
      },
      like: async (id) => {
        await need(); const s = await db.doc('likes/' + uid).get(); const ids = new Set(s.exists ? s.data().ids || [] : []); ids.add(id); await db.doc('likes/' + uid).set({ ids: [...ids] });
        const all = await readAll('likes'); return { likes: all.filter((d) => (d.data.ids || []).includes(id)).length };
      },
      report: async (id) => { await need(); const s = await db.doc('reports/' + uid).get(); const ids = new Set(s.exists ? s.data().ids || [] : []); ids.add(id); await db.doc('reports/' + uid).set({ ids: [...ids] }); return { ok: true }; },
    },
    support: async (message, email, kind) => {
      await need(); const msg = clean(message, 1200); if (msg.length < 5) throw { code: 'message' };
      const s = await db.doc('feedback/' + uid).get(); const d = s.exists ? JSON.parse(JSON.stringify(s.data())) : { items: [] }; d.items = (d.items || []).slice(-19);
      d.items.push({ id: Math.random().toString(36).slice(2, 10), message: msg, kind: clean(kind, 20) || 'question', ts: Date.now() }); await db.doc('feedback/' + uid).set(d); return { ok: true };
    },
    admin: {
      support: async () => { await need(); if (!owner) throw { code: 'forbidden' }; const all = await readAll('feedback'); const items = []; all.forEach((d) => (d.data.items || []).forEach((x) => items.push(Object.assign({}, x, { email: (d.id === uid ? 'moi' : 'membre ' + d.id.slice(-4)), doc: d.id })))); items.sort((x, y) => y.ts - x.ts); return { items: items.slice(0, 60) }; },
      supportDone: async (id) => { await need(); if (!owner) throw { code: 'forbidden' }; const all = await readAll('feedback'); for (const d of all) { if ((d.data.items || []).some((x) => x.id === id)) { const n = JSON.parse(JSON.stringify(d.data)); n.items = n.items.filter((x) => x.id !== id); await db.doc('feedback/' + d.id).set(n); } } return { ok: true }; },
      edit: async (b) => {
        await need(); if (!owner) throw { code: 'forbidden' };
        const s = await db.doc('content/main').get(); const c = s.exists ? JSON.parse(JSON.stringify(s.data())) : {};
        c.price = c.price || {}; c.hide = c.hide || []; c.desc = c.desc || {}; c.plAdd = c.plAdd || {}; c.plDel = c.plDel || {}; c.plPos = c.plPos || {};
        const key = clean(b.key, 160).toLowerCase(), title = clean(b.title, 80), it = items([{ n: b.n, h: b.h }], 1)[0], same = (x) => x.n === it.n && x.h === it.h;
        switch (b.op) {
          case 'price': { const p = Math.round(Number(b.p)); if (!key || !(p >= 0 && p <= 20000)) throw { code: 'bad_op' }; if (p === 0) delete c.price[key]; else c.price[key] = p; break; }
          case 'hide': { if (!key) throw { code: 'bad_op' }; c.hide = c.hide.filter((x) => x !== key); if (b.hide) c.hide.push(key); break; }
          case 'desc': { if (!key) throw { code: 'bad_op' }; const t = clean(b.text, 700); if (t) c.desc[key] = t; else delete c.desc[key]; break; }
          case 'plAdd': { if (!title || !it) throw { code: 'bad_op' }; c.plAdd[title] = (c.plAdd[title] || []).filter((x) => !same(x)); c.plAdd[title].push(it); c.plDel[title] = (c.plDel[title] || []).filter((x) => !same(x)); break; }
          case 'plDel': { if (!title || !it) throw { code: 'bad_op' }; c.plAdd[title] = (c.plAdd[title] || []).filter((x) => !same(x)); c.plDel[title] = (c.plDel[title] || []).filter((x) => !same(x)); c.plDel[title].push(it); break; }
          case 'plPos': { const pos = Math.round(Number(b.pos)); if (!title || !it || !(pos >= 1 && pos <= 500)) throw { code: 'bad_op' }; c.plPos[title] = (c.plPos[title] || []).filter((x) => !same(x)); c.plPos[title].push({ n: it.n, h: it.h, pos }); break; }
          default: throw { code: 'bad_op' };
        }
        c.v = (c.v || 0) + 1; c.ts = Date.now(); if (JSON.stringify(c).length > 400000) throw { code: 'too_big' };
        await db.doc('content/main').set(c); return { ok: true };
      },
      stats: async () => {
        await need(); const [a, l] = await Promise.all([readAll('community'), readAll('likes')]);
        const pub = a.reduce((n, x) => n + (x.data.pub || []).length, 0);
        return { text: `${a.filter((x) => x.data.pseudo).length} profils\n${pub} inspirations publiques\n${l.length} personnes ont aimé au moins une inspiration` };
      },
    },
    content: async () => { try { await need(); const s = await db.doc('content/main').get(); return s.exists ? s.data() : null; } catch (e) { return null; } },
  };

  // ---- Réseau (version claude.ai) : abonnements, publications, avis et fil, avec la base de l'artefact. Pas de marques ni de liens suivis ici.
  const nrm = (v) => String(v == null ? '' : v).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const pkey = (h, n) => nrm(h) + '|' + nrm(n);
  const IMG = /^data:image\/(jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
  const asAuthor = (by, com) => { const d = (com[by] || {}); return { by, pseudo: d.pseudo || 'Anonyme', avatar: d.avatar || '', brand: false }; };
  const comMap = async () => { const m = {}; (await readAll('community')).forEach((d) => { m[d.id] = d.data; }); return m; };
  const repCount = (reps, id) => reps.filter((d) => (d.data.ids || []).includes('p:' + id)).length;
  plan.social = {
    caps: { brand: false, stats: false },
    follow: async (by, on) => {
      await need(); if (by === uid) throw { code: 'self' };
      const s0 = await db.doc('follows/' + uid).get(); const ids = new Set(s0.exists ? s0.data().ids || [] : []); if (on === false) ids.delete(by); else ids.add(by); await db.doc('follows/' + uid).set({ ids: [...ids] });
      const all = await readAll('follows'); return { ok: true, following: on !== false, followers: all.filter((d) => (d.data.ids || []).includes(by)).length };
    },
    following: async () => { await need(); const s0 = await db.doc('follows/' + uid).get(); const com = await comMap(); return { items: (s0.exists ? s0.data().ids || [] : []).map((b) => asAuthor(b, com)) }; },
    post: async (b) => {
      await need(); const cur = await myDoc(); if (!cur.pseudo) throw { code: 'pseudo' };
      const txt = clean(b.txt, 600), video = url(b.video); if (txt.length < 3 && !b.img && !video) throw { code: 'content' };
      if (BAD.test(txt)) throw { code: 'rules' }; if (b.img && !(b.img.length <= 45000 && IMG.test(b.img))) throw { code: 'image' };
      const s0 = await db.doc('posts/' + uid).get(); const d = s0.exists ? JSON.parse(JSON.stringify(s0.data())) : { items: [] };
      const id = Math.random().toString(16).slice(2, 10) + Date.now().toString(16).slice(-8);
      d.items = [{ id, txt, img: b.img || '', video, ad: !!b.ad, ph: clean(b.h, 60), pn: clean(b.n, 80), ts: Date.now() }].concat(d.items || []).slice(0, 10); await db.doc('posts/' + uid).set(d); return { ok: true, id };
    },
    delPost: async (id) => { await need(); const all = await readAll('posts'); for (const d of all) if ((d.data.items || []).some((x) => x.id === id)) { if (d.id !== uid && !owner) throw { code: 'forbidden' }; const n = JSON.parse(JSON.stringify(d.data)); n.items = n.items.filter((x) => x.id !== id); await db.doc('posts/' + d.id).set(n); } return { ok: true }; },
    reportPost: async (id) => { await need(); const s0 = await db.doc('reports/' + uid).get(); const ids = new Set(s0.exists ? s0.data().ids || [] : []); ids.add('p:' + id); await db.doc('reports/' + uid).set({ ids: [...ids] }); return { ok: true }; },
    feed: async (scope, before) => {
      await need(); before = before || Date.now() + 1;
      const [posts, com, reps, fol, lists, rat] = await Promise.all([readAll('posts'), comMap(), readAll('reports'), db.doc('follows/' + uid).get(), plan.community.list(), readAll('ratings')]);
      const set = new Set(fol.exists ? fol.data().ids || [] : []); set.add(uid); const only = scope === 'follow', items = [];
      posts.forEach((d) => (d.data.items || []).forEach((x) => { if (x.ts < before && (!only || set.has(d.id)) && repCount(reps, x.id) < 3) items.push({ t: 'post', id: x.id, ts: x.ts, author: asAuthor(d.id, com), txt: x.txt, img: x.img || '', video: x.video || '', ad: !!x.ad, brand: false, ph: x.ph || '', pn: x.pn || '' }); }));
      lists.items.forEach((r) => { if (r.ts < before && (!only || set.has(r.by))) items.push(Object.assign({ t: 'list', author: asAuthor(r.by, com) }, r)); });
      if (only) rat.forEach((d) => { if (!set.has(d.id)) return; Object.values(d.data.m || {}).forEach((r) => { if (r.txt && r.ts < before) items.push({ t: 'rating', id: d.id + r.n, ts: r.ts, author: asAuthor(d.id, com), n: r.n, h: r.h, stars: r.stars, txt: r.txt }); }); });
      items.sort((x, y) => y.ts - x.ts); const page = items.slice(0, 30); return { items: page, next: page.length === 30 ? page[29].ts : 0 };
    },
    profile: async (by) => {
      await need(); const [com, posts, rat, fol, lists] = await Promise.all([comMap(), db.doc('posts/' + by).get(), db.doc('ratings/' + by).get(), readAll('follows'), plan.community.list()]);
      const d0 = com[by]; if (!d0) throw { code: 'not_found' };
      const mineF = fol.find((d) => d.id === uid); const loves = Object.values((rat.exists ? rat.data().m : {}) || {}).sort((x, y) => y.stars - x.stars || y.ts - x.ts).slice(0, 12);
      return { profile: { by, pseudo: d0.pseudo || 'Anonyme', avatar: d0.avatar || '', bio: d0.bio || '', links: d0.links || [], brand: false }, followers: fol.filter((d) => (d.data.ids || []).includes(by)).length, following: ((fol.find((d) => d.id === by) || { data: {} }).data.ids || []).length, iFollow: !!(mineF && (mineF.data.ids || []).includes(by)), mine: by === uid, lists: lists.items.filter((r) => r.by === by), loves, posts: (posts.exists ? posts.data().items || [] : []).map((x) => ({ t: 'post', id: x.id, ts: x.ts, author: asAuthor(by, com), txt: x.txt, img: x.img || '', video: x.video || '', ad: !!x.ad, brand: false, ph: x.ph || '', pn: x.pn || '' })), wishlist: d0.wishPub ? d0.wish || [] : null };
    },
    rate: async (b) => {
      await need(); const cur = await myDoc(); if (!cur.pseudo) throw { code: 'pseudo' };
      const n = clean(b.n, 80), h = clean(b.h, 60), stars = Math.round(Number(b.stars)), txt = clean(b.txt, 400); if (n.length < 2 || !(stars >= 1 && stars <= 5)) throw { code: 'content' }; if (txt && BAD.test(txt)) throw { code: 'rules' };
      const s0 = await db.doc('ratings/' + uid).get(); const d = s0.exists ? JSON.parse(JSON.stringify(s0.data())) : { m: {} }; d.m = d.m || {}; d.m[pkey(h, n)] = { n, h, stars, txt, ts: Date.now() }; await db.doc('ratings/' + uid).set(d); return { ok: true };
    },
    unrate: async (h, n) => { await need(); const s0 = await db.doc('ratings/' + uid).get(); if (!s0.exists) return { ok: true }; const d = JSON.parse(JSON.stringify(s0.data())); delete (d.m || {})[pkey(h, n)]; await db.doc('ratings/' + uid).set(d); return { ok: true }; },
    ratings: async (h, n) => {
      await need(); const k = pkey(h, n), [all, fol, com] = await Promise.all([readAll('ratings'), db.doc('follows/' + uid).get(), comMap()]); const set = new Set(fol.exists ? fol.data().ids || [] : []);
      const rows = []; all.forEach((d) => { const r = (d.data.m || {})[k]; if (r) rows.push(Object.assign({ u: d.id }, r)); });
      const my = rows.find((r) => r.u === uid), avg = rows.length ? rows.reduce((t0, r) => t0 + r.stars, 0) / rows.length : 0;
      return { mine: my ? { stars: my.stars, txt: my.txt } : null, friends: rows.filter((r) => set.has(r.u)).sort((x, y) => y.ts - x.ts).slice(0, 20).map((r) => ({ author: asAuthor(r.u, com), stars: r.stars, txt: r.txt, ts: r.ts })), count: rows.length, avg: Math.round(avg * 10) / 10 };
    },
    wishlist: async (pub, items) => { await need(); const cur = await myDoc(); cur.wishPub = !!pub; cur.wish = (Array.isArray(items) ? items : []).slice(0, 200).map((x) => ({ n: clean(x && x.n, 80), h: clean(x && x.h, 60) })).filter((x) => x.n.length >= 2); if (!Array.isArray(cur.pub)) cur.pub = []; await db.doc('community/' + uid).set(cur); return { ok: true, pub: !!pub }; },
    wishlistPub: async () => { await need(); const cur = await myDoc(); return { pub: !!cur.wishPub }; },
    view: () => {}, myStats: async () => ({ days: 30, links: [], postViews: 0, followers: (await readAll('follows')).filter((d) => (d.data.ids || []).includes(uid)).length }),
    brandMe: async () => ({ brand: null }),
  };
  window.SillageBackend = { plan, plans: () => {}, account: { loggedIn: () => true, email: () => '' } };
})();
