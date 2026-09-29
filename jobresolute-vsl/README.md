# JobResolute — VSL « Deux vies, une rencontre »

| Fichier | Rôle |
|---|---|
| `PLAN.md` | Le film plan par plan, la voix off, les prompts, le montage, le planning (verrouillé) |
| `MOTION.md` | Le design system motion : couleurs, typo, rythme, mouvement, texture, interdits |
| `FACTS.md` | Tout ce que le film a le droit d'afficher, et rien d'autre |
| `motion/` | Les séquences codées (HTML + `window.seek(t)`) · `base.css` et `lib.js` partagés |
| `tools/render.js` | Rend une séquence en MP4 1920×1080, 25 im/s |
| `rendus/` | Les MP4 prêts pour CapCut |
| `references/` | Images de style, guide de cadrage, grille CapCut, fiches personnages |

## Rendre une séquence

```bash
cd jobresolute-vsl/tools && npm install && cd ..
python3 tools/build.py tout   # rend et assemble ACTE2 et ACTE4
```
Il faut Chromium (`CHROME_PATH`) et ffmpeg (`FFMPEG_PATH`).

Avec Claude Code en local, ajouter aussi le rendu HyperFrames et les règles Apple :
```bash
npx skills add heygen-com/hyperframes
npx skills add emilkowalski/skills --skill apple-design
```

## Avancement
- [x] Plan, design system, liste des faits
- [x] Fiches Nadia et Julien, studio de Nadia, P02
- [x] M06 (acte II)
- [ ] Voix off ElevenLabs V01–V19 → durées à transmettre pour caler l'acte II
- [ ] K04 / K05 → test du miroir → Seedance P04 + P05
- [x] Acte II complet V2 (`rendus/ACTE2.mp4`, 62 s) avec transitions : à recaler sur la voix off
- [x] Acte IV : `rendus/ACTE4.mp4`, une seule fin pour tous les publics
