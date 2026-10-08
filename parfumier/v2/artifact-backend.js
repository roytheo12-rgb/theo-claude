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
        authors.forEach((a) => (a.data.pub || []).forEach((x) => { if (cnt(reps, x.id) < 3) out.push({ id: x.id, title: x.title, desc: x.desc, items: x.items, video: x.video || '', ad: !!x.ad, avatar: a.data.avatar || '', links: a.data.links || [], by: a.id, pseudo: a.data.pseudo || 'Anonyme', ts: x.ts || 0, likes: cnt(likes, x.id), mine: a.id === uid, by: a.id }); }));
        out.sort((x, y) => y.ts - x.ts); return { items: out.slice(0, 200) };
      },
      publish: async (rec) => {
        await need(); const cur = await myDoc(); if (!cur.pseudo) throw { code: 'pseudo' };
        const title = clean(rec.title, 60), its = items(rec.items, 30, true); if (title.length < 3 || its.length < 2) throw { code: 'content' };
        if (BAD.test(title + ' ' + (rec.desc || ''))) throw { code: 'rules' };
        cur.pub = Array.isArray(cur.pub) ? cur.pub : []; const id = rec.id && cur.pub.some((x) => x.id === rec.id) ? rec.id : Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
        if (!cur.pub.some((x) => x.id === id) && cur.pub.length >= 10) throw { code: 'limit' };
        const row = { id, title, desc: clean(rec.desc, 240), items: its, video: url(rec.video), ad: !!rec.ad, ts: Date.now() }; const i = cur.pub.findIndex((x) => x.id === id); if (i >= 0) cur.pub[i] = row; else cur.pub.push(row);
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
  window.SillageBackend = { plan, plans: () => {}, account: { loggedIn: () => true, email: () => '' } };
})();
