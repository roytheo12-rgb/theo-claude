# Actes I et III — chaque plan, calé sur la voix off

La voix off est indiquée **pour repère seulement** : elle ne va jamais dans les prompts. Chaque image correspond à ce que l'on entend au même moment.
Temps : **relatifs au début de chaque acte**. Acte I = 0:00 à 0:41 du film. Acte III = juste après l'acte II (62 s), soit ≈ 1:43 à 2:02.

Légende : 🎬 **Seedance** (vidéo générée, payante) · 🖼️ **Image fixe** animée dans CapCut (0 crédit) · ✏️ **Codé par Claude** (0 crédit)

## Budget
- 500 crédits ≈ 33 à 40 s de génération en Seedance 2.0 720p.
- **4 plans Seedance obligatoires** (P04, P05, P09, P11) ≈ 300 crédits. Il reste ≈ 200 crédits pour les essais ratés.
- S'il reste des crédits à la fin : P12 en Seedance (option, détaillée plus bas).

## Réglages Seedance (identiques partout)
Image vers vidéo · **Seedance 2.0** · **720p** · **16:9** · **5 s**. Regarde le coût affiché avant chaque génération.

**Préfixe Seedance, à coller au début de chaque prompt :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Restrained, natural acting. Keep the face, hair, clothes, setting, colors and lighting identical to the reference image. Keep the main subject inside the central area of the frame. No text, no logos, no subtitles, no music, no dialogue, no readable screen content.
```

**Préfixe Nano Banana « chez Nadia »** (K04, K09) :
```
Cinematic film still, 16:9, 35mm lens, eye-level. Small Parisian studio apartment at night. Cold sickly green-cyan color grade, desaturated, lifted blacks, flickering fluorescent tube, rain on the window. Precarious but dignified. 35mm film grain. Keep all important elements inside the central area. No text, no logos, no readable screen content.
```
**Préfixe Nano Banana « hôtel »** (K05, K06, K07, K10, K11, K12) :
```
Cinematic film still, 16:9, symmetrical centered composition, one-point perspective. Grand old-world European palace hotel. Dark walnut paneling, black and white checkerboard marble floor, warm amber light from pleated lampshades and brass sconces, deep burgundy and brass accents, crisp white linen. Warm amber grade, rich shadows, subtle 35mm film grain. Keep all important elements inside the central area. No text, no logos, no readable signage.
```

---

# ACTE I — SÉPARÉS (format 1.37:1)

### P01 · 0:00–0:04 · Noir · ✏️
🎙️ *« Dis-moi, Nadia… combien de candidatures as-tu envoyées ces trois derniers mois ? »* (la phrase continue sur P02)
Écran noir, seulement le son de la pluie. Rien à générer.

### P02 · 0:04–0:09 · Le studio vide · 🖼️ (déjà fait)
🎙️ *(fin de V1)*
Image : `references/personnages/studio_nadia.jpg`. Dans CapCut : travelling latéral lent du tailleur vers la fenêtre, étalonnage vert, format 1.37 (voir l'aperçu P02 déjà envoyé). On voit son monde avant de la voir, elle.

### P03 · 0:09–0:11 · Le tailleur qui attend · 🖼️
🎙️ *(silence, pluie)*
Recadrage du tailleur bleu marine et des escarpins **dans la même image**, avec un zoom lent. Sa tenue d'entretien, prête, qui attend.

### P04 · 0:11–0:16 · Le téléphone retourné · 🎬
🎙️ *« Et combien sont restées sans réponse ? »* (commence vers 0,5 s)
**Image de départ : K04** (Nano Banana, préfixe « chez Nadia ». Joins la pièce de Nadia en `[SETTING] keep room identical` et la fiche de Nadia en `[CHARACTER]`) :
```
Same room as Image 1, same color grade. Medium shot waist-up, eye-level, 35mm. Nadia [Image 2] sitting on the sofa, slightly left of center, three-quarter, looking toward the right side of the frame at a laptop on the coffee table; her face lit by the cold laptop glow from the right; her phone face up next to the mug; a few printed CVs on the table. Rain on the window.
```
Vérifie K04 avec `references/grille_capcut.png` (yeux à 40 %, Nadia sur l'axe vert).
**Prompt Seedance :**
```
Night, small Parisian studio apartment, cold green-tinted light. The camera slowly pushes in, very slightly. The young woman sits on the sofa, looking at her laptop, tired. At 1 second her phone vibrates on the coffee table and its screen lights up. She glances at it for a moment, her shoulders drop slightly, and without reading it she slowly turns it face down. End: she looks back toward the right side of the frame and stays still, eyes tired. Rain runs down the window. The fluorescent kitchen light flickers once.
```
✅ La vibration tombe sur « sans réponse ». Elle finit en regardant **vers la droite**.

### P05 · 0:16–0:21 · Julien écarte un CV · 🎬
🎙️ *« Et toi, Julien… as-tu enfin trouvé la perle rare ? »* (la vibration de P04 continue 1 s sur ce plan, au montage)
**Image de départ : K05** (préfixe « hôtel », fiche de Julien en `[CHARACTER]`) :
```
Medium shot waist-up, eye-level, 35mm, mirror of the previous shot. Symmetrical 1930s-style hotel HR office at dawn: dark walnut paneling, black lacquered desk with a thin brass edge. Julien [Image 1] seated behind the desk, slightly right of center, three-quarter, looking toward the left side of the frame. Key light: a pleated amber lampshade on the left of the desk. In front of him: a tall stack of printed pages and, to his left, a smaller separate pile. All pages blank and unreadable.
```
Vérifie avec la grille : **même hauteur des yeux que K04**, Julien sur l'axe ambre.
**Prompt Seedance :**
```
Early morning, symmetrical 1930s-style hotel HR office, warm amber light from a pleated lampshade on the left. The camera slowly pushes in, very slightly. The man in a charcoal three-piece suit and thin steel glasses takes the top page from the tall stack, reads it for one second, and without conviction places it on the smaller pile to his left. End: he lifts his eyes toward the left side of the frame and stays still, tired, searching. The lamp light stays steady. All pages are blank and unreadable.
```
✅ Le geste « mettre de côté » tombe sur « la perle rare ». Il finit en regardant **vers la gauche** : il fait face à Nadia à travers la coupe.

### P06 · 0:21–0:27 · Ce que coûte un mauvais recrutement · 🖼️ ×3 (2 s chacun)
🎙️ *(pas de voix : la musique s'arrête à chaque image)*
Trois images Nano Banana (préfixe « hôtel »), chacune animée par un zoom lent, reliées par des panoramiques fouettés dans CapCut :
```
K06a — Reception desk centered: a young receptionist seen from behind, frozen in front of a screen; an elegant guest waiting, fingers tapping the walnut desk impatiently.
K06b — Dining room in full rush, centered: a waiter seen from behind holding the wrong plate; the maître d' looking away; a guest unimpressed.
K06c — Narrow staff corridor behind the scenes, single warm bulb: one metal locker open and empty, a burgundy uniform on a hanger, a blank brass name badge left on the shelf.
```

### P07 · 0:27–0:31 · Le CV de Nadia sur la pile des refus · 🖼️
🎙️ *« Ce serait dommage de passer à côté d'une belle rencontre… »*
Image Nano Banana **K07** (préfixe « hôtel », fiche de Nadia en `[CHARACTER] face only, for the small ID photo`) :
```
Top-down overhead shot on a walnut desk, amber light. A printed CV with a small ID photo of Nadia [Image 1] in the top corner, the photo in cold green tones, lies on top of a small pile of other set-aside CVs. A man's hand in a charcoal suit sleeve is just letting go of it. Text on the pages blank and unreadable.
```
Dans CapCut : zoom lent vers la photo de Nadia. **La photo verte au milieu de l'ambre de Julien : leur seul lien, un papier.**

### P08 · 0:31–0:37 · Le problème · ✏️ (je le code)
🎙️ *« Le problème n'est pas le nombre de CV. C'est ce qu'on est capable d'observer. »*
Texte animé sur noir. Je te le livre en MP4.

### P09 · 0:37–0:41 · Le téléphone s'illumine · 🎬
🎙️ *(silence, un « clic » sonore)* → on enchaîne sur « Voici JobResolute » (acte II)
**Image de départ : K09** (joins K04 en `[SETTING + CHARACTER] keep everything identical`) :
```
Same image as Image 1, same framing, same green color grade. The phone lying face down on the coffee table glows warmly from underneath. Nadia turns her head toward it. No text, no logos.
```
**Prompt Seedance :**
```
Night, same studio apartment, cold green light. The phone lying face down on the coffee table glows with a warm amber light. The young woman turns it over, picks it up and looks at the screen; a first hint of warm amber light touches her face and she straightens slightly, hopeful. The camera slowly pushes in toward the phone screen until the screen fills most of the frame. End: the phone screen is centered, large and glowing, its content soft and unreadable.
```
✅ C'est le même téléphone qu'elle avait retourné dans P04 : cette fois, elle le retourne pour regarder. Le plan finit sur l'écran **centré et grand**.
➜ **Envoie-moi la dernière image** : j'y cale l'entrée dans l'écran de M01. Garde 4 s (coupe la fin dans CapCut).

---

# ACTE III — RÉUNIS (format 2.39:1)

### P10 · 0:00–0:04 · Julien se lève · 🖼️
🎙️ *(silence)* — enchaîne directement sur M12 (on recule hors de l'ordinateur)
Image **K10** (préfixe « hôtel », fiche de Julien) :
```
Julien [Image 1] standing up behind his black lacquered desk in the symmetrical HR office, his laptop open in the foreground, the screen glowing ivory, content blank and unreadable. He looks toward the office door on the left with a slight, decided expression. Warm amber lamp light.
```
Dans CapCut : zoom arrière lent depuis l'écran de l'ordinateur (raccord avec M12, où l'on recule hors de l'écran).

### P11 · 0:04–0:10 · La rencontre · 🎬
🎙️ *« La décision finale sera la tienne, Julien. »* (commence vers 1,5 s, la poignée de main tombe sur « la tienne »)
**Image de départ : K11** (fiches de Nadia et de Julien, image de lobby Pinterest en `[STYLE]`) :
```
Perfectly symmetrical grand hotel lobby in daytime, brass revolving door at the exact center, pleated amber lamps, warm amber light. Nadia [Image 1], wearing the navy blue suit and black heels from her apartment, has just stepped through the revolving door, calm and confident, warm light on her face. Julien [Image 2] walks toward her from the right side.
```
**Prompt Seedance :**
```
Daytime, perfectly symmetrical grand hotel lobby, black and white checkerboard marble floor, dark walnut paneling, brass revolving door at the center, warm amber light. The camera is static, centered and symmetrical. The young woman in a navy suit walks in through the revolving door, calm and confident, into the warm light. The man in the charcoal three-piece suit and glasses walks toward her from the right. At 3 seconds they meet at the exact center of the frame and shake hands with a small, warm smile. End: symmetrical two-shot, both still, holding the handshake.
```
✅ Elle porte **le tailleur qui attendait sur sa porte**. Elle est dans l'ambre : son vert a disparu. Premier plan où ils sont ensemble.
Le plan fait 5 s : ralentis-le à 85 % dans CapCut pour atteindre 6 s.

### P12 · 0:10–0:19 · La maison qui tourne · 🖼️ (ou 🎬 s'il reste des crédits)
🎙️ *« Et toi, Nadia, quelle que soit la décision, on reste à tes côtés. »*
Il faut d'abord une **fiche « Nadia en uniforme »** (même visage, uniforme de service noir, pin en laiton).
Image **K12** (préfixe « hôtel », format **très large 21:9**, fiche Nadia en uniforme + fiche Julien) :
```
Ultra-wide cross-section view of the hotel like a dollhouse, several rooms side by side seen through open doorways, all in warm amber light: the lobby, the dining room, a corridor. In the dining room, Nadia [Image 1] in a black service uniform with a brass pin serves a table calmly and gracefully; her colleagues move in sync around her. In the lobby doorway, Julien [Image 2] watches with a quiet nod.
```
Dans CapCut : travelling latéral lent de gauche à droite sur toute l'image, jusqu'à s'arrêter sur Nadia.
**Option Seedance, s'il reste au moins 75 crédits :**
```
Slow continuous lateral tracking shot from left to right along the cross-section of the hotel, passing room after room through the doorways. In the dining room the young woman in the black service uniform serves a table calmly and gracefully while her colleagues move in sync. The camera never stops. Warm amber light.
```

---

## Ordre de production
1. **K04 + K05** → vérification avec la grille → **envoie-les-moi**
2. **Seedance P04 + P05** → **envoie-les-moi** (test du miroir)
3. K09 → **Seedance P09** → envoie-moi la dernière image
4. K11 → **Seedance P11**
5. Images fixes : K06a/b/c, K07, K10, fiche Nadia en uniforme, K12
6. Option : P12 en Seedance s'il reste des crédits
