// Outils d'animation partagés — voir MOTION.md
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, start, dur) => clamp((t - start) / dur);
const easeOut = x => 1 - Math.pow(1 - x, 5);                 // ≈ cubic-bezier(0.22,1,0.36,1)
const spring = (x, w = 9) => { const s = x * 1.0; return 1 - (1 + w * s) * Math.exp(-w * s); } // amorti, sans rebond
const lerp = (a, b, p) => a + (b - a) * p;
// Découpe un texte en mots animables. Les mots entre *étoiles* passent en laiton clair.
function words(el) {
  el.innerHTML = el.textContent.trim().split(/\s+/).map(w => {
    const hl = /^\*.*\*[.,]?$/.test(w);
    const txt = w.replace(/\*/g, '');
    return `<span class="w"${hl ? ' style="color:var(--laiton2)"' : ''}>${txt}</span>`;
  }).join(' ');
  return [...el.querySelectorAll('.w')];
}
// Apparition mot à mot : opacité, flou 12px, +16px → 0, en 0,45 s, 0,08 s de décalage.
function revealWords(ws, t, start, stagger = 0.08, dur = 0.45) {
  ws.forEach((w, i) => {
    const p = easeOut(prog(t, start + i * stagger, dur));
    w.style.opacity = p; w.style.filter = `blur(${(1 - p) * 12}px)`; w.style.transform = `translateY(${(1 - p) * 16}px)`;
  });
}
// Le grain bouge à chaque image, comme de la pellicule.
function grain(t, fps = 25) { const g = document.querySelector('.grain'); if (!g) return; const f = Math.floor(t * fps); g.style.transform = `translate(${(f * 37) % 50 - 25}px,${(f * 53) % 50 - 25}px)`; }

// Effets communs à chaque plan : travelling de caméra, fondu flou d'entrée et de sortie, grain.
// opts : push (avance caméra), blurIn, blurOut (durées en s, 0 = coupe franche)
function fx(t, D, opts = {}) {
  const { push = 0.03, blurIn = 0.2, blurOut = 0.25 } = opts;
  const st = document.getElementById('stage');
  if (st) st.style.transform = `scale(${lerp(1, 1 + push, t / D)})`;
  const i = blurIn ? 1 - prog(t, 0, blurIn) : 0;
  const o = blurOut ? prog(t, D - blurOut, blurOut) : 0;
  const b = Math.max(i, o);
  document.body.style.filter = b > 0 ? `blur(${b * 14}px)` : '';
  document.body.style.opacity = 1 - b * 0.6;
  grain(t);
}
// Entrée d'un élément 3D : montée + rotation qui se stabilise (ressort amorti).
function enter3d(el, t, start, { dy = 40, ry0, ry1, rx = 5, dur = 0.9, maxOp = 1 } = {}) {
  const p = spring(prog(t, start, dur));
  el.style.opacity = clamp(p * 1.4) * maxOp;
  el.style.transform = `translateY(${(1 - p) * dy}px) rotateY(${lerp(ry0, ry1, p)}deg) rotateX(${rx}deg)`;
  return p;
}
const fadeUp = (el, t, start, dur = 0.5, dy = 12) => { const p = easeOut(prog(t, start, dur)); el.style.opacity = p; el.style.transform = `translateY(${(1 - p) * dy}px)`; return p; };
const CURSOR = '<svg viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill="#f4efe6" stroke="#1a1411" stroke-width="1.4" stroke-linejoin="round"/></svg>';
