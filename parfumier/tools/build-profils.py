#!/usr/bin/env python3
"""data/profils-ia.json -> profils.js (window.PROFILS) : profils comparables à 18 axes pour le moteur."""
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
d = json.load(open(root / 'data/profils-ia.json', encoding='utf-8'))
(root / 'profils.js').write_text('// Généré par tools/build-profils.py : profils comparables (18 axes, saisons, usages, textes) des fiches data/fiches-ia.\nwindow.PROFILS = ' + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
print(len(d), 'profils ->', 'profils.js')
