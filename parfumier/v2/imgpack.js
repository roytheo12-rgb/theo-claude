// Artifact : les photos de base (img/db, img/w) sont regroupées en quelques paquets (pk/N.wasm) pour tenir dans la limite de fichiers.
// Un paquet est téléchargé la première fois qu'une de ses photos s'affiche ; chaque <img src="img/…"> est ensuite remplacé par l'adresse locale de l'image.
(function () {
  const IDX = window.IMGPACK || {}, urls = {}, loading = {}, byPack = {};
  Object.keys(IDX).forEach((p) => { (byPack[IDX[p][0]] = byPack[IDX[p][0]] || []).push(p); });
  function load(k) {
    if (!loading[k]) loading[k] = fetch('pk/' + k + '.wasm').then((r) => r.arrayBuffer()).then((buf) => { (byPack[k] || []).forEach((p) => { urls[p] = URL.createObjectURL(new Blob([buf.slice(IDX[p][1], IDX[p][1] + IDX[p][2])], { type: 'image/webp' })); }); }).catch(() => { delete loading[k]; });
    return loading[k];
  }
  function fix(img) {
    const s = img.getAttribute && img.getAttribute('src'); if (!s || !IDX[s]) return;
    img.dataset.pk = s;
    if (urls[s]) { img.src = urls[s]; return; }
    img.removeAttribute('src');
    load(IDX[s][0]).then(() => { if (img.dataset.pk === s && urls[s]) img.src = urls[s]; });
  }
  function scan(n) { if (n.nodeType !== 1) return; if (n.tagName === 'IMG') fix(n); else if (n.querySelectorAll) n.querySelectorAll('img[src^="img/"]').forEach(fix); }
  new MutationObserver((ms) => { for (const m of ms) { if (m.type === 'attributes') fix(m.target); else m.addedNodes.forEach(scan); } }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
})();
