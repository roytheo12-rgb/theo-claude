#!/usr/bin/env python3
"""Fusionne les profils comparables -> profils.js (window.PROFILS).
Priorité (du plus fiable au moins fiable) : profils-web (notes lues sur pages officielles) > profils-jovoy > profils-ia (écrits de mémoire par le modèle).
Les parfums sans entrée ici reçoivent un profil calculé à la volée par le moteur à partir de leurs notes réelles."""
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
d = {}
for name in ('profils-ia', 'profils-jovoy', 'profils-web'):
    p = root / f'data/{name}.json'
    if p.exists(): d.update(json.load(open(p, encoding='utf-8')))
(root / 'profils.js').write_text('// Généré par tools/build-profils.py : profils comparables (18 axes, saisons, usages, textes).\nwindow.PROFILS = ' + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
print(len(d), 'profils -> profils.js')
