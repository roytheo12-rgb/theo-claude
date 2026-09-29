// Capture une image par séquence (à 70 % de sa durée, ou à l'instant donné) pour vérification.
// Usage : node tools/check.js dossier_sortie M01 M02 ...   (M01@1.5 pour un instant précis)
const path = require('path');
const puppeteer = require('puppeteer-core');
const chrome = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const [out, ...ids] = process.argv.slice(2);
(async () => {
  const b = await puppeteer.launch({ executablePath: chrome, args: ['--no-sandbox', '--disable-gpu'] });
  const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 });
  for (const spec of ids) {
    const [id, at] = spec.split('@');
    await p.goto('file://' + path.resolve('motion', id + '.html'), { waitUntil: 'networkidle0' });
    await p.evaluate(() => document.fonts.ready);
    const t = at ? Number(at) : await p.evaluate(() => window.DURATION * 0.7);
    await p.evaluate(t => window.seek(t), t);
    await p.screenshot({ path: path.join(out, `${id}_${t.toFixed(2)}.png`) });
  }
  await b.close(); console.log('ok');
})();
