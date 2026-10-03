"""Isole la photo d'une couverture déposée : retire le fond uni et la légende. Renvoie (image photo, image légende)."""
import numpy as np
from PIL import Image
BOX = {'1.png': (429, 86, 1486, 1714)}      # cadre à la main quand le fond se confond avec la photo
def split(path):
    im = Image.open(path).convert('RGB'); a = np.asarray(im).astype(int)
    import os
    if os.path.basename(str(path)) in BOX: return im.crop(BOX[os.path.basename(str(path))]), im.crop((0, 1750, im.width, im.height))
    bg = np.median(np.concatenate([a[:5].reshape(-1, 3), a[-5:].reshape(-1, 3), a[:, :5].reshape(-1, 3), a[:, -5:].reshape(-1, 3)]), axis=0)
    m = (np.abs(a - bg).sum(axis=2) > 60)
    rows = m.mean(axis=1) > 0.18                      # lignes occupées sur au moins 18 % de la largeur : la photo (pas la légende)
    best, cur, bs = (0, 0), None, 0
    for y, v in enumerate(rows):
        if v and cur is None: cur = y
        if (not v or y == len(rows) - 1) and cur is not None:
            e = y if not v else y + 1
            if e - cur > bs: bs = e - cur; best = (cur, e)
            cur = None
    y0, y1 = best
    cols = m[y0:y1].mean(axis=0) > 0.5
    xs = np.where(cols)[0]; x0, x1 = (xs.min(), xs.max() + 1) if len(xs) else (0, im.width)
    photo = im.crop((x0, y0, x1, y1))
    cap = im.crop((0, y1, im.width, min(im.height, y1 + 330)))
    return photo, cap
