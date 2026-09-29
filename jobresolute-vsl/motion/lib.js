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
