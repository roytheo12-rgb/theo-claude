// Ambiances animées : chaque parfum reçoit un mouvement tiré de ses notes (fumée pour le tabac,
// pétales pour la rose, braises pour les épices…). Un seul moteur canvas pilote toutes les zones.
(function (root) {
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const rnd = (a, b) => a + Math.random() * (b - a);
  const REDUCED = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const KW = {
    petals: ['rose', 'jasmin', 'pivoine', 'tubereuse', 'magnolia', 'fleur', 'muguet', 'freesia', 'violette', 'ylang', 'neroli', 'orchidee', 'heliotrope', 'cyclamen', 'iris'],
    citrus: ['citron', 'bergamote', 'pamplemousse', 'mandarine', 'orange', 'petit grain', 'yuzu'],
    smoke: ['tabac', 'encens', 'oud', 'fumee', 'resine', 'cannabis', 'myrrhe', 'bouleau', 'gaiac', 'marron chaud'],
    embers: ['cannelle', 'cardamome', 'poivre', 'safran', 'clou de girofle', 'muscade', 'gingembre', 'cumin', 'coriandre', 'rhum'],
    bubbles: ['marin', 'sel', 'algue', 'lotus'],
    gold: ['ambre', 'vanille', 'benjoin', 'miel', 'tonka', 'caramel', 'praline', 'cacao', 'datte', 'cafe', 'opoponax'],
    leaves: ['vetiver', 'figuier', 'figue', 'the', 'sauge', 'pin', 'cedre', 'cypres', 'basilic', 'feuille', 'mousse', 'lavande', 'romarin', 'genievre', 'thym', 'ciste', 'santal'],
    musk: ['musc', 'ambrette', 'iso e super', 'linge propre', 'ambroxan'],
    stitch: ['cuir', 'daim'],
    drops: ['pomme', 'poire', 'framboise', 'fraise', 'litchi', 'mure', 'cassis', 'coing', 'ananas', 'noix de coco', 'rhubarbe'],
  };
  const FAM = { floral: 'petals', agrumes: 'citrus', oud: 'smoke', épicé: 'embers', aquatique: 'bubbles', ambré: 'gold', gourmand: 'gold', vert: 'leaves', aromatique: 'leaves', boisé: 'leaves', musqué: 'musk', cuir: 'stitch', fruité: 'drops' };
  const LABEL = { petals: 'pétales', citrus: 'agrumes', smoke: 'fumée', embers: 'braises', bubbles: 'bulles marines', gold: 'poussière dorée', leaves: 'feuilles', musk: 'peau tiède', stitch: 'coutures de cuir', drops: 'gouttes de fruit' };

  // Retourne les 2 ambiances dominantes et les notes qui les inspirent.
  function motifsOf(p) {
    const notes = (p.notes || []).map(norm), sc = {}, why = {};
    for (const [m, list] of Object.entries(KW)) {
      notes.forEach((n, i) => { if (list.some((k) => n === k || n.includes(k))) { sc[m] = (sc[m] || 0) + (2.2 - i * 0.25); (why[m] = why[m] || []).push(p.notes[i]); } });
    }
    const f = FAM[p.family]; if (f) sc[f] = (sc[f] || 0) + 2.4;
    const top = Object.entries(sc).sort((a, b) => b[1] - a[1]).map((e) => e[0]).slice(0, 2);
    if (!top.length) top.push('gold');
    return { types: top, label: top.map((m) => LABEL[m]).join(' et '), notes: [...new Set(top.flatMap((m) => why[m] || []))].slice(0, 3) };
  }

  // ---------- Particules ----------
  const T = {
    petals: { n: 14, sp(P, w, h, i) { P.x = rnd(0, w); P.y = i ? rnd(-20, h) : -24; P.s = rnd(7, 15); P.vy = rnd(22, 44); P.vx = rnd(-8, 8); P.r = rnd(0, 6.3); P.vr = rnd(-1.3, 1.3); P.ph = rnd(0, 6.3); P.a = rnd(.55, .9); },
      up(P, d, t) { P.y += P.vy * d; P.x += P.vx * d + Math.sin(t * 1.3 + P.ph) * 20 * d; P.r += P.vr * d; }, out: (P, w, h) => P.y > h + 30,
      dr(c, P, k) { c.save(); c.translate(P.x, P.y); c.rotate(P.r); c.globalAlpha = P.a; c.fillStyle = k.f1; const s = P.s; c.beginPath(); c.moveTo(0, -s); c.bezierCurveTo(s * .9, -s * .6, s * .7, s * .7, 0, s); c.bezierCurveTo(-s * .7, s * .7, -s * .9, -s * .6, 0, -s); c.fill(); c.globalAlpha = P.a * .5; c.strokeStyle = k.f2; c.lineWidth = .8; c.beginPath(); c.moveTo(0, -s * .8); c.lineTo(0, s * .8); c.stroke(); c.restore(); } },
    leaves: { n: 14, sp(P, w, h, i) { P.x = rnd(0, w); P.y = i ? rnd(-20, h) : -24; P.s = rnd(8, 16); P.vy = rnd(26, 50); P.vx = rnd(-14, 14); P.r = rnd(0, 6.3); P.vr = rnd(-1.8, 1.8); P.ph = rnd(0, 6.3); P.a = rnd(.5, .85); },
      up(P, d, t) { P.y += P.vy * d; P.x += P.vx * d + Math.sin(t * 1.6 + P.ph) * 26 * d; P.r += P.vr * d; }, out: (P, w, h) => P.y > h + 30,
      dr(c, P, k) { c.save(); c.translate(P.x, P.y); c.rotate(P.r); c.globalAlpha = P.a; c.fillStyle = k.f2; const s = P.s; c.beginPath(); c.moveTo(0, -s); c.quadraticCurveTo(s * .8, 0, 0, s); c.quadraticCurveTo(-s * .8, 0, 0, -s); c.fill(); c.strokeStyle = k.line; c.globalAlpha = P.a * .7; c.lineWidth = .9; c.beginPath(); c.moveTo(0, -s); c.lineTo(0, s * 1.15); c.stroke(); c.restore(); } },
    citrus: { n: 8, sp(P, w, h, i) { P.x = rnd(0, w); P.y = i ? rnd(0, h) : h + 30; P.s = rnd(12, 24); P.vy = -rnd(14, 30); P.vx = rnd(-6, 6); P.r = rnd(0, 6.3); P.vr = rnd(-.5, .5); P.ph = rnd(0, 6.3); P.a = rnd(.6, .9); },
      up(P, d, t) { P.y += P.vy * d; P.x += P.vx * d + Math.sin(t + P.ph) * 10 * d; P.r += P.vr * d; }, out: (P) => P.y < -40,
      dr(c, P, k) { c.save(); c.translate(P.x, P.y); c.rotate(P.r); c.globalAlpha = P.a; c.fillStyle = k.f1; c.beginPath(); c.arc(0, 0, P.s, 0, 6.29); c.fill(); c.strokeStyle = k.f2; c.lineWidth = P.s * .16; c.stroke(); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1; for (let i = 0; i < 8; i++) { const a = i * .785; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * P.s * .82, Math.sin(a) * P.s * .82); c.stroke(); } c.restore(); } },
    smoke: { n: 14, sp(P, w, h, i) { P.x = w * rnd(.2, .8); P.y = i ? rnd(0, h) : h + 40; P.s = rnd(30, 60); P.vy = -rnd(18, 36); P.vx = rnd(-8, 8); P.ph = rnd(0, 6.3); P.age = i ? rnd(0, 1) : 0; P.life = rnd(7, 12); },
      up(P, d, t, w, h) { P.y += P.vy * d; P.x += P.vx * d + Math.sin(t * .8 + P.ph) * 16 * d; P.age += d / P.life; }, out: (P) => P.age >= 1,
      dr(c, P, k) { const r = P.s * (1 + P.age * 1.6), a = Math.sin(Math.min(1, P.age) * Math.PI) * k.smokeA; const g = c.createRadialGradient(P.x, P.y, 0, P.x, P.y, r); g.addColorStop(0, `rgba(${k.smoke},${a})`); g.addColorStop(1, `rgba(${k.smoke},0)`); c.fillStyle = g; c.beginPath(); c.arc(P.x, P.y, r, 0, 6.29); c.fill(); } },
    embers: { n: 34, sp(P, w, h, i) { P.x = rnd(0, w); P.y = i ? rnd(0, h) : h + 10; P.s = rnd(1.2, 3.4); P.vy = -rnd(30, 80); P.vx = rnd(-14, 14); P.ph = rnd(0, 6.3); P.fl = rnd(4, 12); },
      up(P, d, t) { P.y += P.vy * d; P.x += P.vx * d + Math.sin(t * 2 + P.ph) * 14 * d; }, out: (P) => P.y < -10,
      dr(c, P, k, t) { const a = .45 + .55 * Math.abs(Math.sin(t * P.fl * .3 + P.ph)); const g = c.createRadialGradient(P.x, P.y, 0, P.x, P.y, P.s * 4); g.addColorStop(0, `rgba(255,236,190,${a})`); g.addColorStop(.35, `rgba(${k.ember},${a * .8})`); g.addColorStop(1, `rgba(${k.ember},0)`); c.fillStyle = g; c.beginPath(); c.arc(P.x, P.y, P.s * 4, 0, 6.29); c.fill(); } },
    bubbles: { n: 22, sp(P, w, h, i) { P.x = rnd(0, w); P.y = i ? rnd(0, h) : h + 20; P.s = rnd(3, 13); P.vy = -rnd(20, 56); P.ph = rnd(0, 6.3); },
      up(P, d, t) { P.y += P.vy * d; P.x += Math.sin(t * 2 + P.ph) * 12 * d; }, out: (P) => P.y < -20,
      dr(c, P, k) { c.strokeStyle = k.line; c.globalAlpha = .75; c.lineWidth = 1.2; c.fillStyle = k.f1; c.beginPath(); c.arc(P.x, P.y, P.s, 0, 6.29); c.globalAlpha = .12; c.fill(); c.globalAlpha = .7; c.stroke(); c.beginPath(); c.arc(P.x - P.s * .3, P.y - P.s * .3, P.s * .35, 3.4, 4.6); c.stroke(); c.globalAlpha = 1; } },
    gold: { n: 40, sp(P, w, h, i) { P.x = rnd(0, w); P.y = i ? rnd(0, h) : h + 8; P.s = rnd(1.5, 4.5); P.vy = -rnd(6, 18); P.vx = rnd(-4, 4); P.ph = rnd(0, 6.3); P.sp = rnd(1, 3); },
      up(P, d, t) { P.y += P.vy * d; P.x += P.vx * d + Math.sin(t + P.ph) * 6 * d; }, out: (P) => P.y < -10,
      dr(c, P, k, t) { const a = Math.abs(Math.sin(t * P.sp + P.ph)); c.save(); c.translate(P.x, P.y); c.globalAlpha = a * .95; c.fillStyle = k.gold; const s = P.s * 2.2; c.beginPath(); c.moveTo(0, -s); c.quadraticCurveTo(0, 0, s, 0); c.quadraticCurveTo(0, 0, 0, s); c.quadraticCurveTo(0, 0, -s, 0); c.quadraticCurveTo(0, 0, 0, -s); c.fill(); c.restore(); } },
    musk: { n: 6, sp(P, w, h, i) { P.x = w * rnd(.15, .85); P.y = h * rnd(.3, .9); P.age = i ? rnd(0, 1) : 0; P.life = rnd(4, 7); P.s = rnd(60, 140); },
      up(P, d) { P.age += d / P.life; }, out: (P) => P.age >= 1,
      dr(c, P, k) { const r = P.s * P.age; c.strokeStyle = k.f1; c.globalAlpha = (1 - P.age) * .5; c.lineWidth = 2 + (1 - P.age) * 8; c.beginPath(); c.arc(P.x, P.y, r, 0, 6.29); c.stroke(); c.globalAlpha = 1; } },
    stitch: { n: 9, sp(P, w, h, i) { P.y = (h / 10) * ((P.idx % 10) + .5) + rnd(-6, 6); P.x = 0; P.s = rnd(4, 9); P.sp = rnd(10, 28) * (P.idx % 2 ? 1 : -1); P.a = rnd(.25, .55); },
      up(P, d) { P.off = (P.off || 0) + P.sp * d; }, out: () => false,
      dr(c, P, k, t, w) { c.save(); c.strokeStyle = k.f1; c.globalAlpha = P.a; c.lineWidth = 1.6; c.lineCap = 'round'; c.setLineDash([P.s, P.s * .7]); c.lineDashOffset = -(P.off || 0); c.beginPath(); c.moveTo(0, P.y); c.bezierCurveTo(w * .3, P.y - 10, w * .6, P.y + 10, w, P.y); c.stroke(); c.restore(); } },
    drops: { n: 14, sp(P, w, h, i) { P.x = rnd(0, w); P.y = i ? rnd(-20, h) : -20; P.s = rnd(4, 9); P.vy = rnd(20, 60); P.ac = rnd(40, 120); P.a = rnd(.6, .9); },
      up(P, d) { P.vy += P.ac * d; P.y += P.vy * d; }, out: (P, w, h) => P.y > h + 20,
      dr(c, P, k) { c.save(); c.translate(P.x, P.y); c.globalAlpha = P.a; c.fillStyle = k.f1; const s = P.s; c.beginPath(); c.moveTo(0, -s * 1.8); c.bezierCurveTo(s * 1.1, -s * .2, s, s, 0, s); c.bezierCurveTo(-s, s, -s * 1.1, -s * .2, 0, -s * 1.8); c.fill(); c.globalAlpha = P.a * .8; c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(-s * .3, 0, s * .25, 0, 6.29); c.fill(); c.restore(); } },
  };

  // ---------- Moteur ----------
  const active = new Set(); let raf = 0, last = 0;
  function colors(P, dark) {
    return dark
      ? { f1: P.a, f2: P.b, line: 'rgba(255,255,255,.75)', smoke: '255,255,255', smokeA: .12, ember: '255,140,60', gold: '#f4efe6' }
      : { f1: P.b, f2: P.c, line: P.c, smoke: '90,70,120', smokeA: .1, ember: '255,120,60', gold: P.c };
  }
  function seed(inst) {
    inst.parts = [];
    const scale = Math.max(.35, Math.min(1.4, (inst.w * inst.h) / (400 * 800))) * inst.density;
    inst.types.forEach((type, k) => {
      const def = T[type], cnt = Math.max(3, Math.round(def.n * scale * (k ? .6 : 1)));
      for (let i = 0; i < cnt; i++) { const P = { type, idx: i }; def.sp(P, inst.w, inst.h, true); inst.parts.push(P); }
    });
  }
  function measure(inst) {
    const c = inst.c, w = c.clientWidth, h = c.clientHeight, dpr = Math.min(2, root.devicePixelRatio || 1);
    if (!w || !h) return false;
    if (w !== inst.w || h !== inst.h) { inst.w = w; inst.h = h; c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); inst.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); seed(inst); }
    return true;
  }
  function frame(now) {
    const dt = Math.max(0, Math.min(.05, (now - last) / 1000)) || .016; last = now;
    for (const inst of [...active]) {
      if (!inst.c.isConnected) { active.delete(inst); continue; }
      if (!measure(inst)) continue;
      inst.t += dt; const { ctx, w, h } = inst; ctx.clearRect(0, 0, w, h);
      for (const P of inst.parts) {
        try {
          const def = T[P.type]; def.up(P, dt, inst.t, w, h);
          if (def.out(P, w, h)) def.sp(P, w, h, false);
          def.dr(ctx, P, inst.k[P.type] || inst.k.all, inst.t, w, h);
        } catch (e) { /* une particule invalide ne doit jamais figer les animations */ }
      }
    }
    raf = active.size && !document.hidden ? requestAnimationFrame(frame) : 0;
  }
  function start() { if (!raf && !REDUCED) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });

  // perfumes : un parfum, ou deux (layering : la 2e ambiance vient du 2e parfum)
  function attach(canvas, perfumes, opts) {
    opts = opts || {};
    const list = [].concat(perfumes).filter(Boolean);
    for (const i of [...active]) if (i.c === canvas) active.delete(i);
    const types = [], k = {};
    list.forEach((p, i) => { const m = motifsOf(p); const P = root.Art.pal(p); const kk = colors(P, opts.dark !== false); (i ? m.types.slice(0, 1) : m.types).forEach((t) => { if (!types.includes(t)) { types.push(t); k[t] = kk; } }); });
    k.all = colors(root.Art.pal(list[0]), opts.dark !== false);
    const inst = { c: canvas, ctx: canvas.getContext('2d'), types, k, t: 0, w: 0, h: 0, density: opts.density || 1, parts: [] };
    if (REDUCED) { active.add(inst); measure(inst); frame(performance.now()); active.delete(inst); return inst; }
    active.add(inst); start(); return inst;
  }
  function clear(canvas) { for (const i of [...active]) if (i.c === canvas) active.delete(i); }

  root.FX = { attach, clear, motifsOf };
})(window);
