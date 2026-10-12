# Seedance — les 4 plans, étape par étape

Budget : 500 crédits CapCut. 4 plans de 5 s ≈ 20 s ≈ 300 crédits (à ~15 crédits/s). Il reste ~200 crédits pour les essais ratés.
Tous les autres plans des actes I et III sont des **images fixes animées dans CapCut** (0 crédit) : P02, P03, P06, P07, P10, P12.

## Réglages pour les 4 plans
- Mode : **image vers vidéo** (une seule image de départ)
- Modèle : **Seedance 2.0** (pas 2.5)
- Qualité : **720p** (upscale dans CapCut ensuite)
- Format : **16:9**
- Durée : **5 s** (on coupe au montage si besoin)
- **Avant chaque génération, regarde le coût affiché.** S'il dépasse 15 crédits/s, arrête-toi et préviens-moi.

## Préfixe à coller au début de CHAQUE prompt
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Restrained, natural acting. Keep the face, hair, clothes, setting, colors and lighting identical to the reference image. No text, no logos, no subtitles, no music, no dialogue, no readable screen content.
```

---

## Étape 1 — P04 · Nadia retourne son téléphone (acte I)
**Image à importer :** K04 (Nadia sur le canapé, à gauche, regarde vers la droite, studio vert). Vérifiée avec `references/grille_capcut.png`.
```
Night, small Parisian studio apartment, cold green-tinted light. The camera slowly pushes in, very slightly. The young woman sits on the sofa, looking at her laptop on the coffee table, tired. At 2 seconds her phone vibrates on the table and lights up. She glances at it, does not read it, and slowly turns it face down. She exhales quietly. End: she looks back toward the right side of the frame and stays still. Rain runs down the window. The fluorescent kitchen light flickers once.
```
**À vérifier :** son visage ne change pas, le téléphone est bien retourné, elle finit en regardant **vers la droite**.

## Étape 2 — P05 · Julien repose le CV (acte I)
**Image à importer :** K05 (Julien à droite, regarde vers la gauche, bureau ambré). Vérifiée avec la grille : même hauteur des yeux que K04.
```
Early morning, symmetrical 1930s-style hotel HR office, warm amber light from a pleated lampshade on the left. The camera slowly pushes in, very slightly. The man in a charcoal three-piece suit and thin steel glasses takes one printed page from the tall pile of papers, looks at it for one second, and sets it back down on the pile without interest. End: he lifts his eyes toward the left side of the frame and stays still, tired. The lamp light stays steady. All papers are blank and unreadable.
```
**À vérifier :** il finit en regardant **vers la gauche**. Les papiers ne montrent aucun texte lisible.

**➜ STOP : envoie-moi P04 et P05 avant de continuer.** C'est le test du miroir. S'il marche, on lance la suite.

## Étape 3 — P09 · Le téléphone s'illumine (fin de l'acte I)
**Image à importer :** K09 (même cadrage que K04, le téléphone posé sur la table commence à s'allumer d'une lumière chaude).
```
Night, same studio apartment, cold green light. The phone lying on the coffee table lights up with a warm amber glow. The young woman picks it up and looks at the screen; a first hint of warm light touches her face. The camera slowly pushes in toward the phone screen until the screen fills most of the frame. End: the phone screen is centered, large and glowing, its content soft and unreadable.
```
**À vérifier :** le plan finit sur l'écran du téléphone **bien centré et grand**.
**➜ Envoie-moi la dernière image de P09** : je cale l'entrée dans l'écran de M01 dessus, au pixel près.

## Étape 4 — P11 · La rencontre (acte III)
**Image à importer :** K11 (le lobby symétrique, Nadia en tailleur bleu marine passe la porte tournante, Julien s'avance depuis la droite).
```
Daytime, perfectly symmetrical grand hotel lobby, black and white checkerboard marble floor, dark walnut paneling, brass revolving door at the center, warm amber light. The camera is static, centered and symmetrical. The young woman in a navy suit walks in through the revolving door, calm and confident, into the warm light. The man in the charcoal three-piece suit and glasses walks toward her from the right. They meet at the exact center of the frame and shake hands with a small, warm smile. End: symmetrical two-shot, both still, holding the handshake.
```
**À vérifier :** les deux visages restent identiques à leurs fiches, la poignée de main se fait **au centre exact du cadre**, et Nadia est **dans l'ambre** (plus de vert).

---

## Les images Nano Banana à préparer avant Seedance

**K04 et K05** : prompts dans `PLAN.md`, section 4. Joins la pièce de Nadia avec le rôle `[SETTING]` pour K04.

**K09** (joins K04 avec le rôle `[SETTING + CHARACTER] keep everything identical`) :
```
Same image as Image 1, same framing, same green color grade. The phone lying on the coffee table has just lit up with a warm amber glow, casting a soft warm light on the table. Nadia turns her head toward it. Screen content blurred and unreadable. No text, no logos.
```

**K11** (joins la fiche de Nadia, la fiche de Julien et une image Pinterest de lobby avec le rôle `[STYLE]`) :
```
Cinematic film still, 16:9, perfectly symmetrical centered composition, one-point perspective. Grand old-world European palace hotel lobby in daytime: black and white checkerboard marble floor, dark walnut paneling, brass revolving door at the exact center, pleated amber lamps, warm amber light. Nadia [Image 1], wearing a navy blue suit and black heels, has just stepped through the revolving door, calm and confident, warm light on her face. Julien [Image 2] walks toward her from the right side. Subtle 35mm film grain. No text, no logos, no readable signage.
```
Le tailleur bleu marine est celui qui attendait sur la porte de son studio : **elle le porte enfin pour la rencontre**. L'arc continue jusqu'à P12, où elle porte l'uniforme de l'hôtel.

## Les plans en images fixes (0 crédit Seedance)
| Plan | Image | Dans CapCut |
|---|---|---|
| P02 | Studio de Nadia (déjà fait) | Travelling latéral, étalonnage vert, format 1.37 |
| P03 | Recadrage du tailleur dans la même image | Zoom lent |
| P06 | K06a/b/c : réception, salle, casier vide | Zooms + panoramiques fouettés |
| P07 | K07 : le CV de Nadia sur la pile (plongée) | CV détouré en calque qui glisse |
| P10 | K10 : Julien dans son bureau, cadré sur son écran | Zoom arrière lent (raccord avec M12) |
| P12 | K12 : l'hôtel en coupe « maison de poupée », Nadia en uniforme | Travelling latéral sur une image panoramique |
