# CLAUDE.md

## Projet en cours : VSL JobResolute (`jobresolute-vsl/`)

Avant de concevoir, générer ou animer quoi que ce soit pour JobResolute :

1. Lire `jobresolute-vsl/MOTION.md` en entier. Chaque couleur, police, durée et mouvement vient de ce fichier.
2. Lire `jobresolute-vsl/FACTS.md`. Aucun mot, chiffre ou libellé à l'écran qui n'y figure pas.
3. Suivre `jobresolute-vsl/PLAN.md` : le plan est verrouillé, on ne le modifie pas sans l'accord de Théo.

Règles :

- `MOTION.md` fixe le style, pas l'ambition. Quand Théo dit « vas-y à fond », on y va à fond.
- Si une demande n'est pas couverte par `MOTION.md` ou `FACTS.md`, demander à Théo au lieu de choisir soi-même.
- **La démo JobResolute sert de donneur de structure.** Pour les écrans produit, reprendre la structure réelle de la démo (sections, libellés, ordre), puis traduire chaque couleur, bordure, ombre, police et durée vers `MOTION.md`. Même règle pour tout composant tiers collé par Théo : on garde la mécanique, on remplace le texte de démonstration par le vrai texte, et on applique le style de `MOTION.md`.
- Toute animation est un fichier HTML autonome avec `window.seek(t)`, qui dessine l'image exacte à l'instant t. Rendu en 1920×1080, 25 im/s, avec `jobresolute-vsl/tools/render.js`.
- Avant de montrer un résultat : capturer une image par plan, la comparer aux images de style de `jobresolute-vsl/references/style-frames/` et à `MOTION.md`, corriger ce qui ne va pas, puis seulement ensuite la montrer.
- Répondre à Théo en français.
