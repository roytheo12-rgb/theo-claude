#!/usr/bin/env python3
"""Fabrique site-export/sillage-vitrine-fichier-unique.html : site/index.html avec ses images intégrées (data URI)."""
import base64, pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
site = root / 'site'
html = (site / 'index.html').read_text()
def inline(m):
    p = site / m.group(2)
    if not p.exists():
        return m.group(0)
    mime = {'.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml'}[p.suffix]
    return m.group(1) + 'data:' + mime + ';base64,' + base64.b64encode(p.read_bytes()).decode() + m.group(3)
html = re.sub(r'(src=")(img/[^"]+)(")', inline, html)
html = re.sub(r"(url\(['\"]?)(img/[^)'\"]+)(['\"]?\))", inline, html)
out = root / 'site-export' / 'sillage-vitrine-fichier-unique.html'
out.write_text(html)
print(out, len(html) // 1024, 'Ko')
