#!/usr/bin/env python3
"""Rend les séquences et les assemble avec des transitions à la Apple (fondus enchaînés, glissés doux, zooms).

Chaque plan est rendu avec une marge (« tail ») égale à la durée de sa transition de sortie :
la transition se joue dans cette marge, donc aucun plan n'est raccourci.

Usage : python3 tools/build.py acte2 | acte4 | tout
Variables : FFMPEG_PATH, CHROME_PATH.
"""
import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = os.environ.get('FFMPEG_PATH', 'ffmpeg')
CUT = ('fade', 0.04)  # coupe franche (une image)

# (séquence, transition vers la suivante)
# V6 : trois familles de transitions seulement (MOTION.md §8) :
#   poussée vers l'avant (zoomin) · glissé latéral candidat ↔ recruteur (smoothleft/smoothright) · coupe franche (cartons)
#   + raccords d'objet en fondu court là où le même objet reste à l'écran.
PUSH = ('zoomin', 0.5)
ACTES = {
    'acte2': [
        ('M01', PUSH),                 # le logo cède la place aux promesses en avançant
        ('M02', CUT),
        ('C1', CUT),
        ('M03a', ('smoothleft', 0.6)), # du recruteur au candidat : glissé
        ('M03', PUSH),
        ('M04', ('smoothright', 0.6)), # du candidat au recruteur : glissé en miroir
        ('M05', CUT),
        ('C2', CUT),
        ('M06', PUSH),
        ('M07', CUT),
        ('C3', CUT),
        ('M08', ('fade', 0.35)),       # même téléphone, même place : raccord d'objet
        ('M09', PUSH),
        ('M10', ('fade', 0.35)),       # même cercle : raccord d'objet
        ('M10b', PUSH),
        ('M11', PUSH),
        ('M12', None),
    ],
    'acte4': [('M13', PUSH), ('M14', PUSH), ('M15', None)],
}
SORTIE = {'acte2': 'ACTE2.mp4', 'acte4': 'ACTE4.mp4'}


def duration(seq):
    html = open(os.path.join(ROOT, 'motion', seq + '.html')).read()
    return float(re.search(r'window\.DURATION\s*=\s*([\d.]+)', html).group(1))


def render(seq, tail):
    out = os.path.join(ROOT, 'rendus', f'{seq}_t{tail}.mp4')
    src = os.path.join(ROOT, 'motion', seq + '.html')
    deps = [src] + [os.path.join(ROOT, 'motion', f) for f in ('lib.js', 'base.css')]
    if os.path.exists(out) and all(os.path.getmtime(out) > os.path.getmtime(d) for d in deps):
        return out
    env = dict(os.environ, NODE_PATH=os.path.join(ROOT, 'tools', 'node_modules'))
    subprocess.run(['node', os.path.join(ROOT, 'tools', 'render.js'), src, out, '--tail', str(tail)], check=True, env=env)
    return out


def build(acte):
    seqs = ACTES[acte]
    clips = []
    for seq, tr in seqs:
        tail = tr[1] if tr else 0
        clips.append((render(seq, tail), duration(seq) + tail, tr))
    # Chaîne de xfade : le décalage de chaque transition = longueur cumulée - durée de la transition
    inputs, parts, acc, prev = [], [], 0.0, '[0:v]'
    for i, (path, length, tr) in enumerate(clips):
        inputs += ['-i', path]
        if i == 0:
            acc = length
            continue
        kind, d = clips[i - 1][2]
        label = f'[x{i}]'
        parts.append(f'{prev}[{i}:v]xfade=transition={kind}:duration={d}:offset={acc - d:.3f}{label}')
        acc += length - d
        prev = label
    out = os.path.join(ROOT, 'rendus', SORTIE[acte])
    cmd = [FF, '-y', '-v', 'error', *inputs, '-filter_complex', ';'.join(parts), '-map', prev,
           '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '25', out]
    subprocess.run(cmd, check=True)
    print(f'{out} : {acc:.2f} s')


if __name__ == '__main__':
    todo = list(ACTES) if sys.argv[1:] == ['tout'] else sys.argv[1:]
    os.makedirs(os.path.join(ROOT, 'rendus'), exist_ok=True)
    for a in todo:
        build(a)
