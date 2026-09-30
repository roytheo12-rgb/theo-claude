// Fabrique la story en vidéo MP4 4K verticale (2160×3840, 30 im/s). Lance : VARIANT=amara node tools/make-video.mjs  (sans VARIANT : version normale)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { execFileSync } from 'node:child_process';
import { chromium, PORT, close } from './serve.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)), OUT = path.join(here, '../media'); fs.mkdirSync(OUT, { recursive: true });
const AMARA = process.env.VARIANT === 'amara', NAME = AMARA ? 'sillage-story-neroli' : 'sillage-story';
const W = 405, H = 720, DPR = 2160 / W;               // 405×720 en CSS px × 5,333 = 2160×3840 px réels
const dir = path.join(OUT, 'frames4k'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR });
await ctx.addInitScript(() => { try { localStorage.setItem('sillage.onb', '1'); } catch (e) { /* ok */ } });
const pg = await ctx.newPage(); const cdp = await ctx.newCDPSession(pg); const ts = []; let pending = Promise.resolve();
cdp.on('Page.screencastFrame', (f) => {
  const i = ts.length; ts.push(f.metadata.timestamp);
  pending = pending.then(() => fs.promises.writeFile(path.join(dir, String(i).padStart(5, '0') + '.jpg'), Buffer.from(f.data, 'base64')));
  cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
});
await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(3300);
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 2160, maxHeight: 3840, everyNthFrame: 1 });
const wait = (ms) => pg.waitForTimeout(ms);
await wait(500);
const steps = AMARA ? ['[data-cat=sorties]', '[data-sc=brunch]', '[data-mood=joyeux]', '[data-wx=chaud]'] : ['[data-cat=sorties]', '[data-sc=apero]', '[data-mood=joyeux]', '[data-wx=doux]'];
for (const sel of steps) { await pg.click(sel); await wait(400); }
await wait(300);
await pg.click('#go'); await pg.waitForSelector('#story:not([hidden]) .hero-bottle, #story:not([hidden]) .lead', { timeout: 30000 });
await wait(1500);
const tap = () => pg.mouse.click(300, 360);
await tap(); await wait(3300); await tap(); await wait(2500); await tap(); await wait(3300); await tap(); await wait(4200); await wait(600);
await cdp.send('Page.stopScreencast'); await pending; await pg.close(); await ctx.close(); await browser.close(); close();
console.log('frames', ts.length, 'durée', (ts.at(-1) - ts[0]).toFixed(1), 's', '→ ' + (ts.length / (ts.at(-1) - ts[0])).toFixed(1) + ' im/s en moyenne');

// Liste de concaténation ffmpeg : chaque image dure exactement le temps réel qu'elle est restée à l'écran, puis 30 im/s constant.
const lines = ts.map((t, i) => `file '${path.join(dir, String(i).padStart(5, '0') + '.jpg')}'\nduration ${((ts[i + 1] ?? t + 1.4) - t).toFixed(4)}`);
lines.push(`file '${path.join(dir, String(ts.length - 1).padStart(5, '0') + '.jpg')}'`);
const list = path.join(OUT, NAME + '.txt'); fs.writeFileSync(list, lines.join('\n'));
const ff = execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const out = path.join(OUT, NAME + '-4k.mp4');
execFileSync(ff, ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-vf', 'fps=30,scale=2160:3840:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-movflags', '+faststart', '-an', out], { stdio: 'inherit' });
fs.rmSync(dir, { recursive: true, force: true }); fs.rmSync(list);
console.log(out, (fs.statSync(out).size / 1e6).toFixed(1), 'Mo');
