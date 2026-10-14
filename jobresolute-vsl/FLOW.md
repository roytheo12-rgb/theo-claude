# Google Flow (Veo 3.1) — actes I et III, tous les plans en vidéo, calés sur la voix off

Pour chaque plan : **ce qu'on entend** (repère, jamais dans le prompt) · **le but** · **les images à créer** et les **éléments à joindre** · **le mode Flow** · **le prompt vidéo** · **les paramètres** · **la synchro avec la voix** · **ce qu'il faut vérifier** · **ce qu'on fait ensuite dans CapCut**.

---

## 0. Avant de commencer

### Comment on travaille dans Flow
1. **On crée d'abord les images clés** (les « K ») avec le générateur d'images de Flow (Nano Banana), ou dans Gemini, en joignant les références.
2. **On anime ces images avec « Frames to Video »** : une **image de départ**, et pour certains plans une **image d'arrivée**. C'est ce qui garde les visages, le décor et la lumière identiques, et qui verrouille les raccords.
3. On télécharge chaque clip en **1080p** (upscale de Flow), puis on monte dans CapCut.

### Paramètres Flow (tous les plans, sauf mention)
| Paramètre | Valeur | Pourquoi |
|---|---|---|
| Mode | **Frames to Video** (image de départ, plus image d'arrivée si indiquée) | Cohérence des visages et raccords exacts |
| Modèle | **Veo 3.1 Quality** pour les plans avec personnages · **Veo 3.1 Fast** pour les plans sans personnage (P01, P02-03, P06c, P07) | La qualité des visages et des mains compte. Les décors passent très bien en Fast |
| Format | **16:9 (paysage)** | Recadré ensuite en 1.37 (acte I) ou en 2.39 (acte III) dans CapCut |
| Durée | **8 s** (durée native de Veo) | On ne garde que la partie qui colle à la voix (indiquée pour chaque plan) |
| Nombre de résultats | **2 par génération** | Tu gardes le meilleur |
| Export | **1080p** (upscale) | Pour la netteté au montage |
| Son | **Garder l'ambiance générée** (pluie, pas, porte) | Sous la voix off, à −18 dB environ. Jamais de musique ni de voix dans le clip |
| Cadrage | **Sujet dans la zone centrale** | Acte I : les côtés seront coupés. Acte III : le haut et le bas seront coupés (têtes dans la bande centrale) |

**Si un visage dérive** malgré l'image de départ : refais le plan en **« Ingredients to Video »** en joignant la fiche du personnage, le décor et l'image clé comme ingrédients, avec le même prompt.

### Préfixe à coller au début de CHAQUE prompt vidéo
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Restrained, natural acting. Keep the faces, hair, clothes, setting, colors and lighting identical to the reference frames. Keep the main subject inside the central area of the frame. No text, no logos, no subtitles, no readable screen content. Audio: ambient sound only, no music, no speech, no dialogue.
```

### Préfixes des images clés
**« Chez Nadia »** :
```
Cinematic film still, 16:9, 35mm lens, eye-level. Small Parisian studio apartment at night. Cold sickly green-cyan color grade, desaturated, lifted blacks, flickering fluorescent tube, rain on the window. Precarious but dignified. 35mm film grain. Keep all important elements inside the central area. No text, no logos, no readable screen content.
```
**« Hôtel »** :
```
Cinematic film still, 16:9, symmetrical centered composition, one-point perspective. Grand old-world European palace hotel. Dark walnut paneling, black and white checkerboard marble floor, warm amber light from pleated lampshades and brass sconces, deep burgundy and brass accents, crisp white linen. Warm amber grade, rich shadows, subtle 35mm film grain. Keep all important elements inside the central area. No text, no logos, no readable signage.
```

### Les références à joindre (préparées une fois)
| Nom | Fichier | Rôle à indiquer |
|---|---|---|
| **Fiche Nadia** | `references/personnages/nadia_fiche.jpg` | `[CHARACTER] keep face, curly bun, gold hoop earrings and gold necklace identical` |
| **Fiche Julien** | `references/personnages/julien_fiche.jpg` | `[CHARACTER] keep face, thin steel glasses and charcoal three-piece suit identical` |
| **Studio** | `references/personnages/studio_nadia.jpg` | `[SETTING] keep room identical` |
| **Fiche Nadia en uniforme** | à créer à l'étape P12 | `[CHARACTER]` |
| **Style hôtel** | ta meilleure image Pinterest de lobby | `[STYLE] palette and light only`. Jamais en image de départ : ces images ont des logos |

---

# ACTE I — SÉPARÉS (0:00 → 0:41) · recadré en 1.37:1 · **vert** chez Nadia, **ambre** chez Julien

## P01 · 0:00–0:04 · Les toits de Paris sous la pluie
🎙️ *« Dis-moi, Nadia… combien de candidatures as-tu envoyées ces trois derniers mois ? »* (commence vers 0,5 s, continue sur P02)
**But :** situer la galère avant de voir Nadia. Une seule fenêtre éclairée : la sienne.
**Image de départ K01** (préfixe « chez Nadia », **Studio** en `[STYLE] palette and light only`) :
```
Exterior night shot of Parisian zinc rooftops under heavy rain, chimneys, wet reflections. In the center of the frame, one small attic window lit from inside with a cold greenish fluorescent light. Everything else dark blue-green. No people visible.
```
**Mode :** Frames to Video (départ : K01) · **Modèle :** Fast
**Prompt :**
```
Night exterior, Parisian zinc rooftops under heavy rain. Rain falls steadily, water runs along the gutters and drips from the chimneys. The camera slowly and smoothly pushes in toward the single lit attic window in the center of the frame. Inside the window, the cold fluorescent light flickers once. End: the lit window is centered and closer, still. Audio: heavy rain on zinc roofs, distant city hum.
```
**Garder :** 4 s (de 0 à 4 s) · **Synchro :** la voix commence pendant l'avancée.
**Vérifier :** pas de personnage, la fenêtre reste au centre.
**CapCut :** commence sur 0,5 s de noir avec le son de pluie, étalonnage vert, format 1.37.

## P02 + P03 · 0:04–0:11 · Le studio vide, puis le tailleur qui attend (un seul plan continu)
🎙️ *(fin de V1)*, puis silence et pluie
**But :** entrer chez elle. Le lieu est habité, mais elle n'est pas là. La caméra finit sur sa tenue d'entretien, prête, qui attend.
**Image de départ :** le **Studio** tel quel (`studio_nadia.jpg`).
**Image d'arrivée K03** (préfixe « chez Nadia », **Studio** en `[SETTING]`) :
```
Close-up of the navy blue suit jacket and skirt on a wooden hanger hanging on the white apartment door, a pair of black heels on the wooden floor below, carefully placed. Cold green fluorescent light, shallow depth of field. Nobody in frame.
```
**Mode :** Frames to Video (départ : Studio · arrivée : K03) · **Modèle :** Fast
**Prompt :**
```
Night, small Parisian studio apartment, cold green-tinted light, nobody in the room. The camera slowly tracks sideways from the rain-streaked window on the right toward the door on the left, then gently pushes in on the navy suit hanging on the door above a pair of black heels. Rain runs down the window. The fluorescent kitchen light flickers once. A candle flame on the coffee table trembles slightly. End: close-up of the navy suit, still. Audio: rain against the window, faint fluorescent buzz, a distant car passing.
```
**Garder :** 7 s · **Synchro :** la fin de la phrase « …ces trois derniers mois ? » tombe pendant le travelling. Le tailleur arrive dans le silence.
**Vérifier :** **personne** dans la pièce, le tailleur reste bleu marine.
**CapCut :** étalonnage vert renforcé (TSL orange et jaune, saturation −50, pour éteindre la guirlande et la bougie), format 1.37.

## P04 · 0:11–0:16 · Le téléphone retourné
🎙️ *« Et combien sont restées sans réponse ? »* (commence vers 0,5 s)
**But :** encore une candidature sans réponse. Elle ne lit même plus.
**Image de départ K04** (préfixe « chez Nadia », **Studio** en `[SETTING]`, **Fiche Nadia** en `[CHARACTER]`) :
```
Same room as Image 1, same color grade. Medium shot waist-up, eye-level, 35mm. Nadia [Image 2] sitting on the sofa, slightly left of center, three-quarter, looking toward the right side of the frame at a laptop on the coffee table; her face lit by the cold laptop glow from the right; her phone face up next to the mug; a few printed CVs on the table. Rain on the window.
```
**Vérifier K04 avec `references/grille_capcut.png`** : yeux à 40 % de la hauteur, Nadia sur l'axe vert.
**Mode :** Frames to Video (départ : K04) · **Modèle :** Quality
**Prompt :**
```
Night, small Parisian studio apartment, cold green-tinted light. The camera slowly pushes in, very slightly. The young woman sits on the sofa, looking at her laptop, tired. At 1 second her phone vibrates on the coffee table and its screen lights up. She glances at it for a moment, her shoulders drop slightly, and without reading it she slowly turns it face down. Then she looks back toward the right side of the frame and stays still, eyes tired, until the end. Rain runs down the window. The fluorescent kitchen light flickers once. Audio: rain on the window, a phone vibrating on a wooden table, a quiet exhale.
```
**Garder :** 5 s (de 0 à 5 s) · **Synchro :** la vibration (1 s) tombe sur « sans réponse ».
**État final :** elle regarde **vers la droite**, immobile (raccord regard avec P05).
**Vérifier :** visage identique à la fiche, créoles et collier présents, téléphone bien retourné.

## P05 · 0:16–0:21 · Julien met un CV de côté
🎙️ *« Et toi, Julien… as-tu enfin trouvé la perle rare ? »*
**But :** l'autre côté du problème : il cherche, et le papier ne lui dit rien.
**Image de départ K05** (préfixe « hôtel », **Fiche Julien** en `[CHARACTER]`, **Style hôtel** en `[STYLE]`) :
```
Medium shot waist-up, eye-level, 35mm, mirror of the previous shot. Symmetrical 1930s-style hotel HR office at dawn: dark walnut paneling, black lacquered desk with a thin brass edge. Julien [Image 1] seated behind the desk, slightly right of center, three-quarter, looking toward the left side of the frame. Key light: a pleated amber lampshade on the left of the desk. In front of him: a tall stack of printed pages and, to his left, a smaller separate pile. All pages blank and unreadable.
```
**Vérifier K05 avec la grille** : **même hauteur des yeux que K04**, Julien sur l'axe ambre.
**Mode :** Frames to Video (départ : K05) · **Modèle :** Quality
**Prompt :**
```
Early morning, symmetrical 1930s-style hotel HR office, warm amber light from a pleated lampshade on the left. The camera slowly pushes in, very slightly. The man in a charcoal three-piece suit and thin steel glasses takes the top page from the tall stack, reads it for one second, and without conviction places it on the smaller pile to his left. Then he lifts his eyes toward the left side of the frame and stays still, tired, searching, until the end. The lamp light stays steady. All pages are blank and unreadable. Audio: quiet office room tone, paper rustling, a clock ticking softly.
```
**Garder :** 5 s · **Synchro :** le geste « mettre de côté » tombe sur « la perle rare ».
**État final :** il regarde **vers la gauche** (il fait face à Nadia à travers la coupe).
**CapCut :** **la vibration de P04 continue 1 s** sur ce plan. Étalonnage ambre, format 1.37.
**➜ STOP : envoie-moi P04 et P05** (le test du miroir) avant de continuer.

## P06 · 0:21–0:27 · Ce que coûte un mauvais recrutement · 3 plans de 2 s
🎙️ *(pas de voix : la musique coupe net à chaque plan)*
**But :** les conséquences dans l'hôtel, pièce par pièce. Les personnes mal recrutées sont toujours **de dos ou floues**.
**Images de départ** (préfixe « hôtel », **Style hôtel** en `[STYLE]`) :
```
K06a — Reception desk centered: a young receptionist seen from behind, frozen in front of a screen; an elegant guest waiting, fingers on the walnut desk.
K06b — Dining room in full service, centered: a waiter seen from behind holding a plate; the maître d' nearby; a seated guest.
K06c — Narrow staff corridor behind the scenes, single warm bulb: one metal locker open and empty, a burgundy uniform on a hanger, a blank brass name badge left on the shelf.
```
**Mode :** Frames to Video (départ : K06a / b / c) · **Modèle :** Quality pour a et b, Fast pour c
**Prompts :**
```
P06a — Static symmetrical shot of the hotel reception. The guest taps her fingers on the desk, impatient, and glances at her watch; the receptionist seen from behind does not move, hesitating over the screen. At 6 seconds, a fast whip pan to the right. Audio: fingers tapping on wood, hushed lobby.
P06b — Static symmetrical shot of the dining room. The waiter seen from behind sets a plate in front of the guest; the guest looks at it and pushes it slightly away; the maître d' turns his head away. At 6 seconds, a fast whip pan to the right. Audio: murmured dining room, a fork set down on a plate.
P06c — Slow push-in toward the open, empty locker in the staff corridor. The bulb flickers once. Nobody in frame. At 6 seconds, a fast whip pan to the right. Audio: fluorescent hum, a metal locker door creaking.
```
**Garder :** environ 2 s par plan, en finissant **au milieu du panoramique fouetté**.
**CapCut :** coupe dans le flou du panoramique, avec un flou de mouvement. Format 1.37.

## P07 · 0:27–0:31 · Le CV de Nadia sur la pile des refus
🎙️ *« Ce serait dommage de passer à côté d'une belle rencontre… »*
**But :** le seul lien entre leurs deux mondes, c'est un papier écarté.
**Image de départ K07** (préfixe « hôtel », **Fiche Nadia** en `[CHARACTER] face only, for the small ID photo`) :
```
Top-down overhead shot on a walnut desk, amber light. A printed CV with a small ID photo of Nadia [Image 1] in the top corner, the photo in cold green tones, held just above a small pile of other set-aside CVs by a man's hand in a charcoal suit sleeve. Text on the pages blank and unreadable.
```
**Mode :** Frames to Video (départ : K07) · **Modèle :** Fast
**Prompt :**
```
Static top-down shot on a walnut desk. The hand slowly lets go of the page; it drops softly onto the small pile and settles. The hand withdraws out of frame. The camera very slowly pushes in toward the small green-toned ID photo in the corner of the page. End: still, the photo near the center of the frame. Audio: a sheet of paper landing softly on paper, quiet room tone.
```
**Garder :** 4 s · **Synchro :** le CV se pose sur « passer à côté ».
**Vérifier :** le visage sur la photo est bien Nadia, et aucun texte n'est lisible.

## P08 · 0:31–0:37 · Le problème · ✏️ (je le code)
🎙️ *« Le problème n'est pas le nombre de CV. C'est ce qu'on est capable d'observer. »*
Texte animé sur noir, 0 crédit. Je te le livre en MP4.

## P09 · 0:37–0:41 · Le téléphone s'illumine → entrée dans l'écran
🎙️ *(silence, un « clic »)* → enchaîne sur « Voici JobResolute » (début de l'acte II)
**But :** l'espoir. C'est le même téléphone qu'elle avait retourné dans P04, et cette fois elle le retourne pour regarder.
**Image de départ K09** (joins **K04** en `[SETTING + CHARACTER] keep everything identical`) :
```
Same image as Image 1, same framing, same green color grade. The phone lying face down on the coffee table glows warmly from underneath. Nadia turns her head toward it. No text, no logos.
```
**Image d'arrivée K09b** (joins **K04** et la **Fiche Nadia**) :
```
Close-up of a smartphone held upright in a young woman's hands, the phone screen perfectly centered in the frame, vertical, filling about 60% of the frame height, glowing with a warm amber light, screen content soft and unreadable. Background: the green-tinted studio apartment, out of focus. A touch of warm light on her fingers.
```
**Mode :** Frames to Video (départ : K09 · arrivée : K09b) · **Modèle :** Quality
**Prompt :**
```
Night, same studio apartment, cold green light. The phone lying face down on the coffee table glows with a warm amber light. The young woman turns it over, picks it up and looks at the screen; a first hint of warm amber light touches her face and she straightens slightly, hopeful. The camera smoothly pushes in toward the phone screen until the screen is centered and fills most of the frame height. End: the glowing phone screen perfectly centered, still. Audio: rain, a soft notification chime, then near silence.
```
**Garder :** 4 s (les 4 dernières secondes) · **État final :** l'écran **centré**, sur environ 60 % de la hauteur.
**➜ Envoie-moi la dernière image** : j'y cale l'entrée dans l'écran de M01, au pixel près.

---

# ACTE III — RÉUNIS (juste après la présentation produit) · recadré en 2.39:1 · tout est **ambre**

## P10 · 0:00–0:04 · Julien se lève
🎙️ *(silence)* — enchaîne sur M12 (on recule hors de l'ordinateur du recruteur)
**But :** la décision humaine est prise, Julien va à la rencontre.
**Image de départ K10** (préfixe « hôtel », **Fiche Julien** en `[CHARACTER]`) :
```
Close shot framed on an open laptop on a black lacquered desk, its screen glowing ivory, content blank and unreadable, filling most of the frame. Behind it, slightly out of focus, Julien [Image 1] seated in the symmetrical walnut HR office, amber lamp light.
```
**Image d'arrivée K10b** (même référence) :
```
Medium wide symmetrical shot of the walnut HR office: Julien [Image 1] standing behind his desk, jacket buttoned, the laptop half-closed in front of him, looking toward the office door on the left with a calm, decided expression. Amber lamp light.
```
**Mode :** Frames to Video (départ : K10 · arrivée : K10b) · **Modèle :** Quality
**Prompt :**
```
The camera slowly pulls back from the glowing laptop screen, revealing the symmetrical walnut office. The man in the charcoal three-piece suit half-closes the laptop, stands up, buttons his jacket and looks toward the office door on the left with a calm, decided expression. End: he is standing, still, looking toward the door. Audio: a laptop lid closing softly, a chair sliding back, quiet room tone.
```
**Garder :** 4 s · **Raccord :** M12 finit sur l'écran de l'ordinateur, P10 commence dessus.

## P11 · 0:04–0:10 · La rencontre
🎙️ *« La décision finale sera la tienne, Julien. »* (commence vers 1,5 s)
**But :** leur premier plan ensemble. Nadia porte **le tailleur qui attendait sur sa porte**, et elle entre **dans l'ambre** : son vert a disparu.
**Image de départ K11** (préfixe « hôtel », **Fiche Nadia**, **Fiche Julien**, **Style hôtel**) :
```
Perfectly symmetrical grand hotel lobby in daytime, brass revolving door at the exact center, pleated amber lamps, warm amber light. Nadia [Image 1], wearing the navy blue suit and black heels from her apartment, has just stepped through the revolving door, calm and confident, warm light on her face. Julien [Image 2] walks toward her from the right side.
```
**Image d'arrivée K11b** (mêmes références) :
```
Perfectly symmetrical two-shot in the same grand hotel lobby, the revolving door behind them at the exact center: Nadia [Image 1] in her navy suit and Julien [Image 2] in his charcoal three-piece suit shake hands at the exact center of the frame, both with a small, warm smile. Warm amber light. Both heads in the middle band of the frame.
```
**Mode :** Frames to Video (départ : K11 · arrivée : K11b) · **Modèle :** Quality
**Prompt :**
```
Daytime, perfectly symmetrical grand hotel lobby, black and white checkerboard marble floor, dark walnut paneling, brass revolving door at the center, warm amber light. The camera is static, centered and symmetrical. The young woman in a navy suit walks in through the revolving door, calm and confident, into the warm light. The man in the charcoal three-piece suit and glasses walks toward her from the right. At 4 seconds they meet at the exact center of the frame and shake hands with a small, warm smile. They hold the handshake until the end. Audio: revolving door turning, footsteps on marble, hushed lobby.
```
**Garder :** 6 s (de 1 à 7 s) · **Synchro :** la poignée de main tombe sur « sera la tienne ».
**Vérifier :** visages identiques aux fiches, poignée de main au **centre exact**, têtes dans la bande centrale (le format 2.39 coupe le haut et le bas).

## P12 · 0:10–0:19 · La maison qui tourne
🎙️ *« Et toi, Nadia, quelle que soit la décision, on reste à tes côtés. »*
**But :** la bonne combinaison : tout s'enchaîne, la caméra ne s'arrête jamais.
**D'abord, la fiche « Nadia en uniforme »** (joins la **Fiche Nadia**) :
```
Character sheet, front and three-quarter view, plain neutral background, soft light. The same woman as Image 1, identical face, hair in a low curly bun, gold hoop earrings and gold necklace, wearing a fitted black hotel service uniform with a discreet brass pin.
```
**Image de départ K12** (préfixe « hôtel », fiche **Nadia en uniforme**, **Fiche Julien**) :
```
Wide cross-section view of the hotel like a dollhouse, several rooms side by side seen through open doorways, all in warm amber light: on the left the lobby, in the center the dining room, on the right a corridor. In the dining room, Nadia [Image 1] in a black service uniform with a brass pin serves a table calmly and gracefully; her colleagues move in sync around her. In the lobby doorway, Julien [Image 2] watches.
```
**Mode :** Frames to Video (départ : K12) · **Modèle :** Quality · **Plan à faire deux fois** et à enchaîner : le premier clip (8 s), puis **« Extend »** dans Flow pour prolonger le travelling si besoin.
**Prompt :**
```
Slow continuous lateral tracking shot from left to right along the cross-section of the hotel, passing room after room through the doorways. In the lobby doorway the man in the three-piece suit gives a quiet nod. In the dining room the young woman in the black service uniform serves a table calmly and gracefully while her colleagues move in sync around her. The camera never stops. Warm amber light. Audio: soft cutlery, a quiet laugh, gentle room tone.
```
**Garder :** 9 s (clip + extension) · **Synchro :** on arrive sur Nadia au moment de « on reste à tes côtés ».

---

## Ordre de production
1. Fiches : **Nadia** ✅ · **Julien** ✅
2. **K04 + K05** → grille → **envoie-les-moi**
3. **P04 + P05** → **envoie-les-moi** (test du miroir)
4. **P01**, **P02+P03**, **P06a/b/c**, **P07**
5. **K09 + K09b → P09** → envoie-moi la dernière image
6. **K10 + K10b → P10** · **K11 + K11b → P11**
7. Fiche Nadia en uniforme → **K12 → P12**

## Montage CapCut (rappel)
- Pose la **voix off d'abord** et cale les plans dessus (les synchros sont indiquées pour chaque plan).
- **Acte I en 1.37:1, acte III en 2.39:1** (masques).
- Garde l'ambiance de Veo **sous** la voix off (≈ −18 dB). Ajoute la musique (pizzicato et célesta).
- Vert chez Nadia, ambre à l'hôtel, et **Nadia dans l'ambre à partir de P11**.
