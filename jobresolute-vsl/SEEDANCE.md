# Actes I et III — tous les plans en vidéo, calés sur la voix off

Chaque plan : **ce qu'on entend** (repère, jamais dans le prompt) · **le but** · **l'image de départ** (Nano Banana) avec les **éléments à joindre** · **le prompt Seedance** · **tous les paramètres** · **la synchro avec la voix** · **l'état final** (pour le raccord) · **ce qu'il faut vérifier** · **ce qu'on fait ensuite dans CapCut**.

---

## 0. Avant de commencer

### Budget : lis ceci d'abord
| | Secondes générées | Crédits (≈ 15/s) |
|---|---|---|
| Tous les plans en vidéo, sans essai raté | ≈ 70 s | ≈ 1 050 |
| Avec 1 essai raté sur 2 | ≈ 100 s | ≈ 1 500 |
| **Ton solde** | | **500** |

**Règle :** génère **dans l'ordre de priorité ci-dessous**. Quand les crédits sont épuisés, les plans restants passent en **image fixe animée dans CapCut** (même image de départ, zoom ou travelling). Rien n'est perdu.
Pour finir tout en vidéo, il faudra environ 1 000 crédits de plus : soit tes crédits se rechargent le mois prochain, soit c'est le moment de demander une petite recharge à Henry. Tu pourras lui montrer les premiers plans pour justifier la demande.

| Priorité | Plans | Pourquoi |
|---|---|---|
| **A, indispensable** | P04 · P05 · P09 · P11 | Des personnages qui jouent une action : impossible en image fixe |
| **B, très utile** | P02 · P01 · P10 · P07 | L'immersion (l'appartement vivant, la pluie) et les raccords |
| **C, si crédits** | P06a · P06b · P06c · P03 · P12 | Ça marche très bien en image fixe animée |

### Paramètres Seedance (tous les plans, sauf mention)
| Paramètre | Valeur | Pourquoi |
|---|---|---|
| Mode | **Image vers vidéo** (une image de départ) | Garde les visages, le décor et la lumière identiques d'un plan à l'autre |
| Modèle | **Seedance 2.0** | 2.5 coûte plus cher pour un gain faible en image vers vidéo. Pour les plans **sans personnage** (P01, P02, P03, P07), teste la version la moins chère proposée par CapCut si elle existe (Lite/Mini) |
| Résolution | **720p** | Upscale dans CapCut ensuite |
| Format | **16:9** | On recadre en 1.37 (acte I) ou en 2.39 (acte III) dans CapCut |
| Durée | **5 s** (10 s pour P12) | On coupe ou on ralentit au montage pour coller à la voix |
| Son | **Désactivé, ou ignoré** | On refait tout le son dans CapCut (pluie, vibration, porte…) |
| Cadrage | **Sujet dans la zone centrale** | Acte I : les bandes gauche et droite seront coupées. Acte III : les bandes haute et basse seront coupées |

### Préfixe Seedance : au début de CHAQUE prompt
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Restrained, natural acting. Keep the face, hair, clothes, setting, colors and lighting identical to the reference image. Keep the main subject inside the central area of the frame. No text, no logos, no subtitles, no music, no dialogue, no readable screen content.
```

### Préfixes Nano Banana (images de départ)
**« Chez Nadia »** :
```
Cinematic film still, 16:9, 35mm lens, eye-level. Small Parisian studio apartment at night. Cold sickly green-cyan color grade, desaturated, lifted blacks, flickering fluorescent tube, rain on the window. Precarious but dignified. 35mm film grain. Keep all important elements inside the central area. No text, no logos, no readable screen content.
```
**« Hôtel »** :
```
Cinematic film still, 16:9, symmetrical centered composition, one-point perspective. Grand old-world European palace hotel. Dark walnut paneling, black and white checkerboard marble floor, warm amber light from pleated lampshades and brass sconces, deep burgundy and brass accents, crisp white linen. Warm amber grade, rich shadows, subtle 35mm film grain. Keep all important elements inside the central area. No text, no logos, no readable signage.
```

### Les références à joindre (à préparer une fois)
| Nom | Fichier | Rôle à indiquer dans Nano Banana |
|---|---|---|
| **Fiche Nadia** | `references/personnages/nadia_fiche.jpg` | `[CHARACTER] keep face, hair and gold hoop earrings identical` |
| **Fiche Julien** | `references/personnages/julien_fiche.jpg` | `[CHARACTER] keep face, glasses and suit identical` |
| **Studio** | `references/personnages/studio_nadia.jpg` | `[SETTING] keep room identical` |
| **Fiche Nadia en uniforme** | à créer (même visage, uniforme de service noir, pin en laiton) | `[CHARACTER]` |
| **Style hôtel** | ta meilleure image Pinterest de lobby | `[STYLE] palette and light only` (jamais en première image : elles ont des logos) |

---

# ACTE I — SÉPARÉS (0:00 → 0:41) · recadré en 1.37:1 · lumière **verte** chez Nadia, **ambre** chez Julien

## P01 · 0:00–0:04 · Les toits de Paris sous la pluie · priorité B
🎙️ *« Dis-moi, Nadia… combien de candidatures as-tu envoyées ces trois derniers mois ? »* (commence vers 0,5 s et continue sur P02)
**But :** situer la galère avant de voir Nadia. Une seule fenêtre éclairée, la sienne.
**Image de départ K01** (préfixe « chez Nadia ». Joins le **Studio** en `[STYLE] palette and light only`) :
```
Exterior night shot of Parisian zinc rooftops under heavy rain, chimneys, wet reflections. In the center of the frame, one small attic window lit from inside with a cold greenish fluorescent light. Everything else dark blue-green. No people visible.
```
**Prompt Seedance :**
```
Night, Parisian zinc rooftops under heavy rain. Rain falls steadily, water runs along the gutters. The camera slowly and smoothly pushes in toward the single lit attic window in the center of the frame. Inside the window the cold fluorescent light flickers once. End: the lit window is centered and closer, still.
```
**Durée :** 5 s générées → **4 s** gardées · **Synchro :** la voix commence à 0,5 s, pendant l'avancée.
**État final :** la fenêtre centrée (raccord avec l'intérieur, P02).
**Vérifier :** pas de personnage, pas de texte, la fenêtre reste au centre.
**CapCut :** étalonnage vert, format 1.37, son de pluie qui démarre sur le noir avant l'image.

## P02 · 0:04–0:09 · Le studio vide · priorité B
🎙️ *(fin de V1)*
**But :** entrer chez elle. Le lieu est habité, mais elle n'est pas là.
**Image de départ :** **le Studio tel quel** (`studio_nadia.jpg`, déjà validé).
**Prompt Seedance :**
```
Night, small Parisian studio apartment, cold green-tinted light, nobody in the room. The camera slowly tracks sideways from right to left, from the rain-streaked window toward the door where a navy suit hangs on a hanger above a pair of black heels. Rain runs down the window. The fluorescent kitchen light flickers once. A candle flame on the coffee table trembles slightly. End: the navy suit on the door is near the center of the frame, still.
```
**Durée :** 5 s · **Synchro :** la fin de la phrase « …ces trois derniers mois ? » tombe pendant le travelling.
**État final :** le tailleur au centre (raccord avec P03).
**Vérifier :** **personne** dans la pièce, le tailleur reste bleu marine, la caméra ne tremble pas.
**CapCut :** étalonnage vert renforcé (couper le chaud de la guirlande et de la bougie : TSL orange et jaune, saturation −50), format 1.37.

## P03 · 0:09–0:11 · Le tailleur qui attend · priorité C
🎙️ *(silence, pluie)*
**But :** sa tenue d'entretien, prête, qui attend.
**Image de départ K03** (préfixe « chez Nadia ». Joins le **Studio** en `[SETTING]`) :
```
Close-up of the navy blue suit jacket and skirt on a wooden hanger hanging on the white apartment door, a pair of black heels on the wooden floor below, carefully placed. Cold green fluorescent light, shallow depth of field. Nobody in frame.
```
**Prompt Seedance :**
```
Close-up, static camera with a barely perceptible push-in. A navy suit hangs on the door, perfectly still. The cold fluorescent light flickers once across the fabric. End: still frame on the suit.
```
**Durée :** 5 s → **2 s** gardées.
**CapCut :** si tu n'as plus de crédits, prends l'image fixe avec un zoom lent : le résultat est quasi identique.

## P04 · 0:11–0:16 · Le téléphone retourné · priorité A
🎙️ *« Et combien sont restées sans réponse ? »* (commence vers 0,5 s)
**But :** encore une candidature sans réponse. Elle ne lit même plus.
**Image de départ K04** (préfixe « chez Nadia ». Joins le **Studio** en `[SETTING]` et la **Fiche Nadia** en `[CHARACTER]`) :
```
Same room as Image 1, same color grade. Medium shot waist-up, eye-level, 35mm. Nadia [Image 2] sitting on the sofa, slightly left of center, three-quarter, looking toward the right side of the frame at a laptop on the coffee table; her face lit by the cold laptop glow from the right; her phone face up next to the mug; a few printed CVs on the table. Rain on the window.
```
**Vérifier K04 avec `references/grille_capcut.png`** : yeux à 40 % de la hauteur, Nadia sur l'axe vert.
**Prompt Seedance :**
```
Night, small Parisian studio apartment, cold green-tinted light. The camera slowly pushes in, very slightly. The young woman sits on the sofa, looking at her laptop, tired. At 1 second her phone vibrates on the coffee table and its screen lights up. She glances at it for a moment, her shoulders drop slightly, and without reading it she slowly turns it face down. End: she looks back toward the right side of the frame and stays still, eyes tired. Rain runs down the window. The fluorescent kitchen light flickers once.
```
**Durée :** 5 s · **Synchro :** la vibration (1 s) tombe sur « sans réponse ».
**État final :** elle regarde **vers la droite**, immobile (raccord regard avec P05).
**Vérifier :** visage identique à la fiche, créoles présentes, téléphone bien retourné.
**CapCut :** son de vibration, étalonnage vert, format 1.37.

## P05 · 0:16–0:21 · Julien met un CV de côté · priorité A
🎙️ *« Et toi, Julien… as-tu enfin trouvé la perle rare ? »*
**But :** l'autre côté du problème : il cherche, et le papier ne lui dit rien.
**Image de départ K05** (préfixe « hôtel ». Joins la **Fiche Julien** en `[CHARACTER]` et le **Style hôtel** en `[STYLE]`) :
```
Medium shot waist-up, eye-level, 35mm, mirror of the previous shot. Symmetrical 1930s-style hotel HR office at dawn: dark walnut paneling, black lacquered desk with a thin brass edge. Julien [Image 1] seated behind the desk, slightly right of center, three-quarter, looking toward the left side of the frame. Key light: a pleated amber lampshade on the left of the desk. In front of him: a tall stack of printed pages and, to his left, a smaller separate pile. All pages blank and unreadable.
```
**Vérifier K05 avec la grille** : **même hauteur des yeux que K04**, Julien sur l'axe ambre.
**Prompt Seedance :**
```
Early morning, symmetrical 1930s-style hotel HR office, warm amber light from a pleated lampshade on the left. The camera slowly pushes in, very slightly. The man in a charcoal three-piece suit and thin steel glasses takes the top page from the tall stack, reads it for one second, and without conviction places it on the smaller pile to his left. End: he lifts his eyes toward the left side of the frame and stays still, tired, searching. The lamp light stays steady. All pages are blank and unreadable.
```
**Durée :** 5 s · **Synchro :** le geste « mettre de côté » tombe sur « la perle rare ».
**État final :** il regarde **vers la gauche** (il fait face à Nadia à travers la coupe).
**CapCut :** **la vibration de P04 continue 1 s** sur ce plan. Étalonnage ambre, format 1.37.
**➜ STOP : envoie-moi P04 et P05** (le test du miroir) avant de continuer.

## P06 · 0:21–0:27 · Ce que coûte un mauvais recrutement · 3 plans de 2 s · priorité C
🎙️ *(pas de voix : la musique coupe net à chaque plan)*
**But :** les conséquences dans l'hôtel, pièce par pièce. Les personnes mal recrutées sont toujours **de dos ou floues**.
**Images de départ** (préfixe « hôtel », **Style hôtel** en `[STYLE]`) :
```
K06a — Reception desk centered: a young receptionist seen from behind, frozen in front of a screen; an elegant guest waiting, fingers tapping the walnut desk impatiently.
K06b — Dining room in full service, centered: a waiter seen from behind holding a plate; the maître d' looking away; a seated guest unimpressed.
K06c — Narrow staff corridor behind the scenes, single warm bulb: one metal locker open and empty, a burgundy uniform on a hanger, a blank brass name badge left on the shelf.
```
**Prompts Seedance** (un par image, 5 s → 2 s gardées) :
```
P06a — Static symmetrical shot. The guest at the reception taps her fingers on the desk, impatient; the receptionist seen from behind does not move, hesitating over the screen. At the end, a fast whip pan to the right.
P06b — Static symmetrical shot. The guest looks at the plate in front of him and pushes it slightly away; the maître d' turns his head away. At the end, a fast whip pan to the right.
P06c — Slow push-in toward the open, empty locker. The bulb flickers once. Nobody in frame. At the end, a fast whip pan to the right.
```
**CapCut :** coupe au milieu de chaque panoramique fouetté, avec flou de mouvement. Sons : doigts sur le bois, fourchette posée, porte de casier.

## P07 · 0:27–0:31 · Le CV de Nadia sur la pile des refus · priorité B
🎙️ *« Ce serait dommage de passer à côté d'une belle rencontre… »*
**But :** le lien entre les deux mondes, c'est un papier écarté.
**Image de départ K07** (préfixe « hôtel ». Joins la **Fiche Nadia** en `[CHARACTER] face only, for the small ID photo`) :
```
Top-down overhead shot on a walnut desk, amber light. A printed CV with a small ID photo of Nadia [Image 1] in the top corner, the photo in cold green tones, held just above a small pile of other set-aside CVs by a man's hand in a charcoal suit sleeve. Text on the pages blank and unreadable.
```
**Prompt Seedance :**
```
Static top-down shot. The hand slowly lets go of the page; it drops softly onto the small pile and settles. The hand withdraws out of frame. The camera very slowly pushes in toward the small green-toned ID photo. End: still, the photo near the center of the frame.
```
**Durée :** 5 s → **4 s** · **Synchro :** le CV se pose sur « passer à côté ».
**Vérifier :** le visage sur la photo est bien celui de Nadia, et aucun texte n'est lisible.

## P08 · 0:31–0:37 · Le problème · ✏️ (je le code, 0 crédit)
🎙️ *« Le problème n'est pas le nombre de CV. C'est ce qu'on est capable d'observer. »*

## P09 · 0:37–0:41 · Le téléphone s'illumine · priorité A
🎙️ *(silence, un « clic »)* → enchaîne sur « Voici JobResolute »
**But :** l'espoir. C'est le même téléphone qu'elle avait retourné dans P04, et cette fois elle le retourne pour regarder.
**Image de départ K09** (joins **K04** en `[SETTING + CHARACTER] keep everything identical`) :
```
Same image as Image 1, same framing, same green color grade. The phone lying face down on the coffee table glows warmly from underneath. Nadia turns her head toward it. No text, no logos.
```
**Prompt Seedance :**
```
Night, same studio apartment, cold green light. The phone lying face down on the coffee table glows with a warm amber light. The young woman turns it over, picks it up and looks at the screen; a first hint of warm amber light touches her face and she straightens slightly, hopeful. The camera slowly pushes in toward the phone screen until the screen fills most of the frame. End: the phone screen is centered, large and glowing, its content soft and unreadable.
```
**Durée :** 5 s → **4 s**.
**État final :** l'écran du téléphone **centré et grand**.
**➜ Envoie-moi la dernière image** : j'y cale l'entrée dans l'écran de M01, au pixel près.

---

# ACTE III — RÉUNIS (juste après la présentation produit) · recadré en 2.39:1 · tout est **ambre**

## P10 · 0:00–0:04 · Julien se lève · priorité B
🎙️ *(silence)* — enchaîne sur M12 (on recule hors de l'ordinateur du recruteur)
**But :** la décision humaine est prise, Julien va à la rencontre.
**Image de départ K10** (préfixe « hôtel ». Joins la **Fiche Julien** en `[CHARACTER]`) :
```
Close shot framed on an open laptop on a black lacquered desk, its screen glowing ivory, content blank and unreadable, filling most of the frame. Behind it, slightly out of focus, Julien [Image 1] seated in the symmetrical walnut HR office, amber lamp light.
```
**Prompt Seedance :**
```
The camera slowly pulls back from the glowing laptop screen, revealing the symmetrical walnut office. The man in the charcoal three-piece suit closes the laptop halfway, stands up, buttons his jacket and looks toward the office door on the left with a calm, decided expression. End: he is standing, still, looking toward the door.
```
**Durée :** 5 s → **4 s** · **Raccord :** M12 finit sur l'ordinateur. P10 commence cadré sur l'écran.

## P11 · 0:04–0:10 · La rencontre · priorité A
🎙️ *« La décision finale sera la tienne, Julien. »* (commence vers 1,5 s)
**But :** leur premier plan ensemble. Nadia porte **le tailleur qui attendait sur sa porte** et elle entre **dans l'ambre** : son vert a disparu.
**Image de départ K11** (préfixe « hôtel ». Joins la **Fiche Nadia**, la **Fiche Julien** et le **Style hôtel**) :
```
Perfectly symmetrical grand hotel lobby in daytime, brass revolving door at the exact center, pleated amber lamps, warm amber light. Nadia [Image 1], wearing the navy blue suit and black heels from her apartment, has just stepped through the revolving door, calm and confident, warm light on her face. Julien [Image 2] walks toward her from the right side.
```
**Prompt Seedance :**
```
Daytime, perfectly symmetrical grand hotel lobby, black and white checkerboard marble floor, dark walnut paneling, brass revolving door at the center, warm amber light. The camera is static, centered and symmetrical. The young woman in a navy suit walks in through the revolving door, calm and confident, into the warm light. The man in the charcoal three-piece suit and glasses walks toward her from the right. At 3 seconds they meet at the exact center of the frame and shake hands with a small, warm smile. End: symmetrical two-shot, both still, holding the handshake.
```
**Durée :** 5 s, **ralentie à 85 %** dans CapCut → 6 s · **Synchro :** la poignée de main tombe sur « sera la tienne ».
**Vérifier :** les deux visages identiques aux fiches, la poignée de main au **centre exact** (le recadrage 2.39 coupe le haut et le bas : les têtes doivent rester dans la bande centrale).

## P12 · 0:10–0:19 · La maison qui tourne · priorité C
🎙️ *« Et toi, Nadia, quelle que soit la décision, on reste à tes côtés. »*
**But :** la bonne combinaison : tout s'enchaîne, la caméra ne s'arrête jamais.
**À créer d'abord : la fiche « Nadia en uniforme »** (joins la **Fiche Nadia**) :
```
Character sheet, front and three-quarter view, plain neutral background, soft light. The same woman as Image 1, identical face, hair in a low curly bun, gold hoop earrings, wearing a fitted black hotel service uniform with a discreet brass pin.
```
**Image de départ K12** (préfixe « hôtel », **format très large 21:9**. Joins la fiche **Nadia en uniforme** et la **Fiche Julien**) :
```
Ultra-wide cross-section view of the hotel like a dollhouse, several rooms side by side seen through open doorways, all in warm amber light: the lobby, the dining room, a corridor. In the dining room, Nadia [Image 1] in a black service uniform with a brass pin serves a table calmly and gracefully; her colleagues move in sync around her. In the lobby doorway, Julien [Image 2] watches with a quiet nod.
```
**Prompt Seedance (10 s) :**
```
Slow continuous lateral tracking shot from left to right along the cross-section of the hotel, passing room after room through the doorways. In the dining room the young woman in the black service uniform serves a table calmly and gracefully while her colleagues move in sync. In the lobby doorway the man in the three-piece suit gives a quiet nod. The camera never stops. Warm amber light.
```
**Durée :** **10 s** → 9 s gardées · **Synchro :** on arrive sur Nadia au moment de « on reste à tes côtés ».
**Sans crédits :** travelling latéral sur l'image K12 dans CapCut, avec un rendu très proche.

---

## Ordre de production
1. Fiches : **Nadia** ✅ · **Julien** ✅ · Nadia en uniforme (plus tard)
2. **K04 + K05** → grille → **envoie-les-moi**
3. **P04 + P05** (priorité A) → **envoie-les-moi**
4. K09 → **P09** → envoie-moi la dernière image · K11 → **P11**
5. Priorité B tant qu'il reste des crédits : **P02** (image déjà prête), **P01**, **P10**, **P07**
6. Le reste (priorité C) en image fixe, ou en vidéo après recharge
