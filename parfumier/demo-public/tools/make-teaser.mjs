// Fabrique le teaser MP4 4K vertical (2160×3840, 30 im/s), image par image (fonction seek(t) : rendu exact, sans capture en temps réel).
// Lance : node tools/make-teaser.mjs            (résultat normal)   |   VARIANT=amara node tools/make-teaser.mjs   (Néroli Amara)
// Pour un aperçu rapide : PREVIEW=1 (trois images PNG dans /tmp)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { execFileSync, spawn } from 'node:child_process'; import { createRequire } from 'node:module';
const here = path.dirname(fileURLToPath(import.meta.url)), OUT = path.join(here, '../media');
const { chromium } = createRequire(execFileSync('npm', ['root', '-g']).toString().trim() + '/')('playwright');
const AMARA = process.env.VARIANT === 'amara', NAME = AMARA ? 'sillage-story-neroli' : 'sillage-story', FPS = 30;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
const pg = await browser.newPage({ viewport: { width: 540, height: 960 } }); pg.on('pageerror', (e) => console.log('ERREUR JS', e.message));
await pg.goto('file://' + path.join(here, 'teaser.html') + (AMARA ? '?v=amara' : '')); await pg.evaluate(() => window.ready);
const DUR = await pg.evaluate(() => window.DURATION), N = Math.round(DUR * FPS);
const shot = (t) => pg.evaluate((t) => { window.seek(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }, t);
if (process.env.PREVIEW) { for (const t of (process.env.PREVIEW === '1' ? [1.5, 4.8, 9, 13.8, 18.5, 22.8, 26, 30.5] : process.env.PREVIEW.split(',').map(Number))) fs.writeFileSync(`/tmp/teaser_${AMARA ? 'a' : 'n'}_${t}.jpg`, Buffer.from(await shot(t), 'base64')); await browser.close(); process.exit(0); }
const ff = execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const out = path.join(OUT, NAME + '-4k.mp4');
const enc = spawn(ff, ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out], { stdio: ['pipe', 'ignore', 'ignore'] });
for (let i = 0; i < N; i++) { const buf = Buffer.from(await shot(i / FPS), 'base64'); if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once('drain', r)); if (i % 90 === 0) console.log('image', i, '/', N); }
enc.stdin.end(); await new Promise((r) => enc.on('close', r)); await browser.close();
console.log(out, (fs.statSync(out).size / 1e6).toFixed(1), 'Mo,', N, 'images,', DUR, 's');
