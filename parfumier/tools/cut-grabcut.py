"""Détourage GrabCut pour les visuels studio à fond dégradé (rectangle approximatif du flacon dans la vignette 300 px).
Usage : python3 tools/cut-grabcut.py   (écrase v2/img/p/<maison>-<parfum>.webp)"""
import cv2, numpy as np, pathlib, re, unicodedata
from PIL import Image
from scipy import ndimage
root = pathlib.Path(__file__).resolve().parent.parent
def slug(s): return re.sub(r'[^a-z0-9]+', '-', ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if not unicodedata.combining(c))).strip('-')
JOBS = {'Yatagan.jpg': ('Caron', 'Yatagan', (100, 55, 200, 215)), 'Fleurs de Rocaille.jpg': ('Caron', 'Fleurs de Rocaille', (108, 62, 197, 227)),
        'Nirmal.jpg': ('Laboratorio Olfattivo', 'Nirmal', (78, 60, 187, 264)), 'Vanagloria.jpg': ('Laboratorio Olfattivo', 'Vanagloria', (72, 54, 190, 268)),
        'Rose Struck.jpg': ('Liis', 'Rose Struck', (33, 38, 167, 268)),
        'Fleur Diamantine Maison Crivelli.jpg': ('Maison Crivelli', 'Fleur Diamantine', (52, 2, 186, 294)),
        'giardini_giglio_di_firenze.jpg': ('Giardini di Toscana', 'Giglio di Firenze', (55, 0, 250, 298)),
        "MICA D'ORO I.webp": ('Storie Veneziane', "Mica d'Oro I", (54, 9, 252, 282))}
import sys
for f, (h, n, (x0, y0, x1, y1)) in JOBS.items():
    if sys.argv[1:] and not any(a in f for a in sys.argv[1:]): continue
    im = Image.open(root / 'incoming' / f).convert('RGB'); W, H = im.size; k = max(W, H) / 300
    im.thumbnail((1200, 1200)); a = np.asarray(im)[:, :, ::-1].copy(); s = a.shape[1] / (W / k * 1.0) if False else a.shape[1] / W * W / (W / k) if False else 1
    sc = max(a.shape[:2]) / 300.0
    rect = (int(x0 * sc), int(y0 * sc), int((x1 - x0) * sc), int((y1 - y0) * sc))
    mask = np.zeros(a.shape[:2], np.uint8); bg = np.zeros((1, 65)); fg = np.zeros((1, 65))
    cv2.grabCut(a, mask, rect, bg, fg, 8, cv2.GC_INIT_WITH_RECT)
    m = ((mask == 1) | (mask == 3))
    lab, nn = ndimage.label(m)
    if nn > 1: m = lab == (1 + int(np.argmax(ndimage.sum(m, lab, range(1, nn + 1)))))
    m = ndimage.binary_fill_holes(ndimage.binary_closing(m, iterations=3))
    out = np.dstack([a[:, :, ::-1], (m * 255).astype(np.uint8)]); c = Image.fromarray(out, 'RGBA'); c = c.crop(c.getbbox()); c.thumbnail((760, 760), Image.LANCZOS)
    c.save(root / 'v2' / f'img/p/{slug(h)}-{slug(n)}.webp', 'WEBP', quality=86, method=6); print(f, c.size)
