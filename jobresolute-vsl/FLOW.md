# Google Flow (Veo 3.1) — tous les plans filmés, prompts complets, calés sur la voix off

**Version 3.3.** Ouverture « toits → fenêtre → on traverse la vitre → **directement sur Nadia** » (plus de plan de pièce vide), la même construction en miroir chez Julien (l'hôtel à l'aube → la fenêtre de son bureau → l'intérieur), et un plan de **Nadia devant l'hôtel** à l'acte III (P10b).

Chaque plan donne : 🎙️ **ce qu'on entend** (repère, **jamais** dans le prompt) · **le but** · **les images** à créer (prompt complet) et **ce qu'il faut joindre** · **les réglages Flow** · **le prompt vidéo complet**, à copier-coller tel quel · **ce qu'on garde** · **la synchro** · **ce qu'il faut vérifier** · **CapCut**.

Tous les prompts sont **complets** : le préfixe de style est déjà dedans. Tu copies le bloc entier, rien d'autre.

---

## 0. Avant de commencer

### Méthode
1. **D'abord les images** (les « K ») dans Flow, avec le générateur d'images (Nano Banana), en joignant les références indiquées.
2. **Ensuite les vidéos en « Frames to Video »** : image de départ, et image d'arrivée quand c'est indiqué. C'est ce qui garde les visages et le décor identiques et qui **soude les plans entre eux** : l'image d'arrivée d'un plan est l'image de départ du suivant.
3. Tu télécharges en **1080p** (upscale), tu montes dans CapCut.

### Réglages Flow (tous les plans, sauf mention)
| Réglage | Valeur |
|---|---|
| Mode | **Frames to Video** |
| Modèle | **Veo 3.1 Quality** partout (tu as les crédits : la qualité du mouvement de caméra compte autant que les visages) |
| Format | **16:9 paysage**, recadré ensuite en 1.37 (acte I) ou 2.39 (acte III) dans CapCut |
| Durée | **8 s** |
| Résultats | **2 par génération**, tu gardes le meilleur |
| Export | **1080p** |
| Son | **Garder l'ambiance générée** (pluie, pas, papier). Jamais de musique ni de voix dans le clip |

### Les références (dans `references/personnages/`)
| Nom | Fichier | Rôle à écrire quand tu la joins |
|---|---|---|
| **Fiche Nadia** | `nadia_fiche.jpg` | `[CHARACTER] keep face, curly bun, gold hoop earrings and gold necklace identical` |
| **Fiche Julien** | `julien_fiche.jpg` | `[CHARACTER] keep face, thin steel glasses and charcoal three-piece suit identical` |
| **Studio** | `studio_nadia_16x9.jpg` (ton image 5, **recadrée en 16:9 sans les bandes noires**) | `[SETTING] keep room identical` |
| **Fenêtre** | `fenetre_nadia.jpg` (ton image 4, **recadrée en 16:9 sans les bandes noires**) | `[SETTING] keep facade and window identical` |
| **Fiche Nadia en uniforme** | à créer à l'étape P12 | `[CHARACTER]` |
| **Style hôtel** | ta meilleure image Pinterest de lobby | `[STYLE] palette and light only`. **Jamais** en image de départ (logos) |

⚠️ Utilise **les versions recadrées** (`studio_nadia_16x9.jpg`, `fenetre_nadia.jpg`) : avec les bandes noires, Veo garde les bandes dans la vidéo.

### Les règles qui valent pour tous les plans
- **Personne à l'image dans P01 et P05a.** Nadia apparaît derrière sa vitre dès la fin de P01b ; Julien derrière la sienne à la fin de P05a.
- **Le miroir** : Nadia à gauche du cadre, elle regarde à droite ; Julien à droite, il regarde à gauche ; yeux à 40 % de la hauteur (`references/grille_capcut.png`).
- **Chez Nadia : nuit, pluie, vert.** **Chez Julien : aube, pluie finie, ambre.** Même ville, même nuit, deux lumières.
- **Aucun monument** (ni tour Eiffel, ni Sacré-Cœur) : la tour Eiffel illuminée la nuit pose un problème de droits, et ça fait carte postale. Les toits en zinc suffisent à dire Paris.
- **Aucun texte lisible, aucun logo, aucune enseigne.** Le nom de l'hôtel n'apparaît jamais.

---

# ACTE I — SÉPARÉS (0:00 → 0:43) · 1.37:1

## La construction : un seul mouvement de caméra, des toits jusqu'à Nadia

```
P01 toits ──► K01b ──► P01b façade ──► K01c ──► P02 la vitre ──► K04 ──► P04 le téléphone
           (même image)          (ton image 4 + Nadia        (Nadia sur le canapé,
                                  sur le canapé)              le tailleur derrière elle)
```
Trois clips soudés (chaque fin de clip est exactement le début du suivant), puis P04 qui part de la même image : à l'écran, c'est **un seul plan-séquence** qui descend des toits, s'approche de sa fenêtre, où on la devine déjà sur son canapé, traverse la vitre et **arrive directement sur elle**. Pas de plan de pièce vide.
Le tailleur reste dans l'histoire : on le voit derrière la vitre, puis **pendu à la porte derrière elle** dans chaque plan de la scène.
Julien a la même construction, plus courte (P05a → P05b), en ambre.

---

## P01 · 0:00–0:04 · Les toits de Paris sous la pluie
🎙️ **V1** *« Dis-moi, Nadia… combien de candidatures as-tu envoyées ces trois derniers mois ? »* (commence vers 0,5 s, continue sur P01b et P02)
**But :** Paris, la nuit, la pluie, des milliers de fenêtres éteintes. Une seule est allumée, en vert : la sienne.

**Image de départ K01 : ✅ tu l'as générée** (l'image du toit vers la fenêtre).
- Si la fenêtre y est **petite, au loin** : c'est K01, tu génères K01b ci-dessous comme image d'arrivée.
- Si la fenêtre y est **déjà grande, vue de face** : ton image **est** K01b. Saute P01, et commence directement par P01b avec ton image en départ (on gagne 4 s, je recale la voix).
- **Envoie-la-moi** pour que je vérifie le cadrage (la fenêtre doit tenir dans le recadrage 1.37, entre 12 % et 88 % de la largeur).

Pour mémoire, le prompt de K01 si tu dois la refaire · joindre **Fenêtre** en `[STYLE] palette, light and facade style only`
```
Cinematic film still, 16:9, 35mm anamorphic look. High wide establishing shot over the zinc rooftops of Paris at night under heavy rain, seen from slightly above roof level. A sea of grey-blue zinc mansard roofs, rows of terracotta chimney pots, small dormer windows, wet roofs reflecting the faint city glow. Every window is dark except one: in the center of the frame, in the top floors of a Haussmann building in the middle distance, a single tall French window glows with a cold sickly green fluorescent light. Visible rain streaks, mist, low clouds. Cold desaturated blue-green color grade, lifted blacks, deep shadows, subtle 35mm film grain. No people, no landmarks, no Eiffel Tower, no text, no logos, no signage.
```

**Image d'arrivée K01b** · joindre **ton image K01** en `[SETTING] same building and window` et **Fenêtre** en `[SETTING] keep facade and window identical`
```
Cinematic film still, 16:9, 35mm lens. Night, heavy rain. The same Haussmann building and the same lit window as Image 1, seen from across the narrow street at the height of its top floors, frontal and centered: carved pale stone facade darkened by rain, wrought-iron balconies, a zinc mansard roof with chimney pots at the top of the frame. In the exact center, the tall French window from Image 2, lit from inside with a cold green fluorescent light, the interior soft and indistinct at this distance. All the other windows of the facade are dark. Rain streaks across the frame, water dripping from the balcony rails. Cold desaturated blue-green grade, lifted blacks, subtle film grain. No people visible, no text, no logos.
```

**Réglages :** départ **K01** (ton image) · arrivée **K01b** · Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm anamorphic look, stabilized camera, precise and deliberate movement, never handheld. Keep the setting, colors and lighting identical to the reference frames. No people, no text, no logos, no landmarks.

Scene: night over the zinc rooftops of Paris under heavy rain. Thousands of dark windows; only one window glows, with a cold green fluorescent light, in the top floors of a Haussmann building.

Camera: one slow, continuous, elegant crane-down and push-in, like a drone gliding between the chimney pots. It starts above the roofs, descends gently past the wet chimneys and glides across the narrow street toward the lit window, ending frontal and centered on the facade at the height of the top floors. Constant speed, no shake, no cuts.

Action and atmosphere: steady heavy rain, water running along the zinc gutters and dripping from the chimney pots, a thin mist between the roofs. At 5 seconds the green light in the window flickers once, like a tired fluorescent tube. The light in the window stays cold green; everything else stays dark blue-green.

Light and grade: cold desaturated blue-green, lifted blacks, deep shadows, subtle 35mm film grain, rain catching the light.

End frame: the lit green window in the exact center of the frame, the camera settling still.

Audio: heavy rain on zinc roofs, water gurgling in the gutters, a distant city hum, a far-away car on wet asphalt. No music, no speech.
```
**On garde :** les **4 dernières secondes** (de 4 à 8 s), pour finir exactement sur K01b.
**Synchro :** la voix commence 0,5 s après le début du plan.
**Vérifier :** une seule fenêtre allumée, pas de monument, la fenêtre bien au centre.
**CapCut :** 0,5 s de noir avec la pluie qui monte avant l'image, puis fondu d'ouverture de 12 images. Recadrage 1.37.

---

## P01b · 0:04–0:07 · Sa fenêtre, vue de dehors : elle est là
🎙️ *(suite de V1 : « …combien de candidatures as-tu envoyées… »)*
**But :** on s'approche, et derrière la vitre embuée on la découvre : Nadia, seule sur son canapé, la lueur de l'ordinateur sur le visage. Le tailleur attend sur la porte, à gauche.

**Image d'arrivée K01c** (ton image 4 avec Nadia dedans) · joindre **Fenêtre** en `[SETTING] keep this exact image` et **Fiche Nadia** en `[CHARACTER] keep face, curly bun, gold hoop earrings and gold necklace identical`
```
Same image as Image 1, identical framing, facade, balcony, rain, window and interior, same cold green color grade. Only change: Nadia, the same young woman as Image 2, now sits on the grey sofa inside, seen through the fogged, rain-streaked glass, on the left part of the sofa, in a soft grey knit sweater, turned three-quarter toward the right where an open laptop sits on the coffee table, the cold glow of the laptop on her face. She is small in the frame, slightly blurred by the glass and the rain, but recognizable. The navy suit still hangs on the door on the left. No text, no logos.
```
**Image de départ :** **K01b** · **Image d'arrivée :** **K01c**
**Réglages :** Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Keep the facade, the window, the interior, the woman, the colors and the lighting identical to the reference frames. No text, no logos.

Scene: night, heavy rain, the pale stone facade of a Haussmann building with a wrought-iron balcony. A tall French window lit from inside with a cold green fluorescent light. Through the fogged, rain-streaked glass, a small studio apartment: a navy blue suit hanging on a door on the left, a tiny kitchen, bookshelves, a grey sofa with blankets; on the sofa, a young woman alone, in front of her laptop, its cold glow on her face.

Camera: one slow continuous push-in across the street toward the window, perfectly frontal and centered, ending close to the glass with the wrought-iron balcony rail crossing the lower part of the frame. Constant slow speed, no shake.

Action and atmosphere: raindrops hit the glass and run down it in thin streams; condensation on the inside of the panes; water drips from the balcony rail. Inside, the young woman barely moves: she looks at her laptop, tired, motionless. The fluorescent tube flickers very slightly once.

Light and grade: cold sickly green-cyan interior light against the dark wet stone, lifted blacks, desaturated, subtle 35mm film grain, rain glistening on the iron.

End frame: the window exactly as in the last reference frame, frontal and centered, the woman visible on the sofa through the glass, still.

Audio: rain on the stone and on the iron balcony, water dripping from the rail, the faint buzz of a fluorescent tube behind the glass. No music, no speech.
```
**On garde :** les 8 s, **accélérées en ×2,7** (≈ 3 s) avec une courbe de vitesse douce.
**Vérifier :** on reconnaît bien ton image 4, Nadia est sur le canapé (même pull que dans P04), le tailleur est à gauche.
**CapCut :** **extraire l'audio** avant d'accélérer (sinon la pluie sonne aigu), puis Vitesse → Courbe → Personnalisée : rapide au début, ralentie sur les 0,5 dernières secondes. Recadrage 1.37.

---

## P02 · 0:07–0:10 · On traverse la vitre, et on arrive sur elle
🎙️ *(fin de V1 : « …ces trois derniers mois ? »)*
**But :** le moment le plus cinématique de l'ouverture : la caméra passe à travers la vitre mouillée et avance jusqu'à Nadia. On ne quitte plus la scène : P04 commence sur la dernière image de ce plan.

**Image de départ :** **K01c** · **Image d'arrivée :** **K04** (voir P04 : elle se crée **avant** ce plan)
**Réglages :** Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Restrained, natural acting. Keep the window, the room, the objects, the woman's face, hair, earrings, necklace and sweater, the colors and the lighting identical to the reference frames. No text, no logos, no readable screen content.

Scene: night, heavy rain. We start outside a tall French window of a Haussmann building, lit from inside with a cold green fluorescent light, a young woman visible on the sofa behind the glass; we end inside the small Parisian studio apartment, close to her.

Camera: one slow, continuous, seamless push forward that passes straight through the rain-streaked window glass. Between 1.5 and 3.5 seconds the raindrops and streams on the glass fill the frame, go soft and out of focus, and slide past the lens; the camera emerges inside the room and keeps gliding forward toward the woman on the sofa, then settles into a waist-up medium shot of her, eye-level, slightly left of center, with the navy suit hanging on the door softly out of focus in the background on the left. One unbroken move, constant speed, no cut, no morphing of the room or of her face.

Action: the young woman sits on the sofa, looking at the laptop on the coffee table on the right side of the frame, tired, almost motionless; one slow blink, a small breath. She does not look at the camera.

Light and grade: cold sickly green-cyan, desaturated, lifted blacks, the laptop glow on her face from the right, subtle 35mm film grain.

End frame: waist-up medium shot of her looking toward the right side of the frame, exactly as in the last reference frame, still.

Audio: loud rain outside that becomes suddenly muffled as we pass through the glass, then the quiet room: rain against the window, the faint buzz of the fluorescent tube, the soft hum of a laptop. No music, no speech.
```
**On garde :** 3 s, en **rampe de vitesse** : rapide jusqu'à la vitre, **ralenti au moment où les gouttes passent devant l'objectif**, puis une avancée douce et posée sur elle.
**Vérifier :** pas de déformation de la pièce ni de son visage pendant le passage, elle ne regarde pas la caméra, la dernière image est bien K04.
**Plan B si Veo déforme la pièce :** garde la fin de P01b collée à la vitre et coupe sur K04 avec un **fondu enchaîné de 10 images** posé sur les gouttes floues.
**CapCut :** audio extrait et gardé à vitesse normale (le passage du son « dehors → dedans » est le meilleur effet du plan). Recadrage 1.37.

---

## P04 · 0:10–0:15 · Le téléphone retourné
🎙️ **V2** *« Et combien sont restées sans réponse ? »* (commence vers 0,5 s)
**But :** encore une candidature sans réponse. Elle ne lit même plus. Le tailleur, derrière elle, attend toujours.

**Image K04** (fin de P02, départ de P04) · joindre **Studio** en `[SETTING] keep room identical` et **Fiche Nadia** en `[CHARACTER] keep face, curly bun, gold hoop earrings and gold necklace identical`
```
Cinematic film still, 16:9, 35mm lens, eye-level, camera placed on the window side of the room looking in. Night, the same small Parisian studio apartment as Image 1, same cold sickly green-cyan fluorescent light. Medium shot, waist-up. Nadia, the same young woman as Image 2, identical face, curly hair in a bun, gold hoop earrings, gold necklace, wearing a soft grey knit sweater, sits on the left part of the grey sofa, slightly left of center, three-quarter view, looking toward the right side of the frame at an open laptop on the coffee table; her face lit by the cold glow of the laptop from the right; her phone face up on the table next to the mug; a few printed pages, blank and unreadable. In the soft out-of-focus background on the left, the navy blue suit hanging on the white door. Tired but dignified. Desaturated, lifted blacks, subtle 35mm film grain. Her eyes at 40% of the frame height from the top. No text, no logos, no readable screen.
```
**Vérifier K04 avec `references/grille_capcut.png`** : yeux à 40 % de la hauteur, Nadia sur l'axe vert (43 %), le tailleur visible dans le flou à gauche (au-delà de 12 % de la largeur, sinon le recadrage 1.37 le coupe).
**Réglages :** départ **K04** · Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Restrained, natural acting. Keep her face, hair, earrings, necklace, clothes, the room, the colors and the lighting identical to the reference frame. Keep her inside the central area of the frame. No text, no logos, no readable screen content.

Scene: night, the small Parisian studio apartment, cold green fluorescent light, rain on the window. The young woman sits on the sofa in front of her laptop, tired. Behind her, out of focus, a navy suit hangs on the door.

Action, second by second: 0 to 1 s, she looks at the laptop screen, still. At 1 s her phone vibrates on the wooden coffee table and its screen lights up. 1.5 to 3 s, she glances at it for a moment; her shoulders drop very slightly; without reading it, she slowly turns the phone face down on the table. 3 to 8 s, she looks back toward the right side of the frame and stays still, eyes tired, a slow breath out. No smile, no tears: restrained.

Camera: a very slow, barely perceptible push-in, continuing the movement of the previous shot. Eye-level, steady.

Light and grade: cold sickly green-cyan, desaturated, lifted blacks, the laptop glow on her face from the right, subtle 35mm film grain.

End frame: she looks toward the right side of the frame, still.

Audio: rain on the window, a phone vibrating on a wooden table, a quiet exhale. No music, no speech.
```
**On garde :** 5 s (de 0 à 5 s) · **Synchro :** la vibration (1 s) tombe sur « sans réponse ».
**État final :** elle regarde **vers la droite**, immobile (raccord regard avec Julien).
**Vérifier :** visage identique à la fiche, créoles et collier, téléphone bien retourné, aucun texte lisible.
**CapCut :** **pas de coupe visible entre P02 et P04** : c'est la même image, la caméra continue d'avancer. Recadrage 1.37. **Le son de la vibration déborde de 1 s sur P05a.**

---

## P05a · 0:15–0:18 · L'hôtel à l'aube
🎙️ **V3** commence : *« Et toi, Julien… »*
**But :** le miroir de P01. Même ville, la nuit qui s'achève, mais l'autre monde : la pluie s'est arrêtée, les pavés brillent, l'hôtel est symétrique et ambré. Une seule fenêtre allumée au centre : son bureau.

**Image de départ K05a** · joindre **Style hôtel** en `[STYLE] palette and light only`
```
Cinematic film still, 16:9, perfectly symmetrical centered composition, one-point perspective. Paris at dawn, just after the rain. The grand old-world palace hotel facade seen from across a small cobbled square, frontal and perfectly centered: ornate pale stone, tall arched windows, wrought-iron balconies with brass details, deep burgundy awnings, a grand entrance with a brass revolving door at the bottom center, two brass lanterns still lit. The wet cobblestones reflect the warm light like a mirror. The sky is a pale blue-pink dawn with a few last clouds. Most windows are dark; one tall window on the first floor, in the exact center of the facade, glows with a warm amber lamp light. Warm amber grade, rich shadows, subtle 35mm film grain, Wes Anderson symmetry. No people, no text, no hotel name, no logos, no signage.
```
**Image d'arrivée K05b** · joindre **Fenêtre** en `[COMPOSITION] same framing only, not the colors`, **Fiche Julien** en `[CHARACTER] keep face, thin steel glasses and charcoal three-piece suit identical` et **Style hôtel** en `[STYLE]`
```
Cinematic film still, 16:9, 35mm lens. Dawn, just after the rain. The tall window of the hotel HR office seen from outside, frontal and centered, with exactly the same framing as Image 1 but in warm colors: ornate pale stone around the window, a wrought-iron balcony rail with brass details crossing the lower part of the frame, a few last raindrops on the clean glass. Inside, warm amber light from a pleated lampshade: a symmetrical walnut-paneled office, a black lacquered desk with a thin brass edge, and Julien, the same man as Image 2, identical face, thin steel glasses, charcoal three-piece suit, seated behind the desk slightly right of center, reading a printed page, a tall stack of pages in front of him. All pages blank and unreadable. Warm amber grade, rich shadows, subtle 35mm film grain. No text, no logos.
```
**Réglages :** départ **K05a** · arrivée **K05b** · Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Keep the facade, the window, the man, the colors and the lighting identical to the reference frames. Keep the composition perfectly symmetrical. No text, no hotel name, no logos, no signage.

Scene: Paris at dawn, just after the rain. A grand old-world palace hotel facade across a small wet cobbled square, perfectly symmetrical, one tall window glowing amber in the exact center of the first floor.

Camera: one slow, continuous, perfectly centered crane-up and push-in, rising gently from the cobblestones toward the lit window, staying exactly on the center axis the whole time, ending frontal and close to the window glass with the balcony rail across the lower part of the frame. Constant speed, symmetrical, no shake.

Action and atmosphere: the last drops fall from the awnings; a thin morning mist lifts from the wet cobblestones; the two brass lanterns at the entrance switch off one after the other at 3 seconds; the dawn sky slowly brightens. Through the window, at the end, the man in a charcoal three-piece suit sits at his desk, reading a page under the amber lamp.

Light and grade: warm amber and honey tones, pale pink dawn sky, rich shadows, wet reflections, subtle 35mm film grain.

End frame: the office window, frontal and centered, the man visible inside at his desk, still.

Audio: last drops falling from the awnings, a few early birds, a distant street sweeper, the city slowly waking up. No music, no speech.
```
**On garde :** les **3 dernières secondes**, pour finir exactement sur K05b. Si la montée paraît trop lente, les 8 s en ×2,7.
**Synchro :** « Et toi, Julien… » tombe sur la façade.
**Vérifier :** la symétrie parfaite, **aucune enseigne**, aucun nom d'hôtel, la fenêtre bien centrée.
**CapCut :** la vibration de P04 continue sur la première seconde, puis s'éteint sous les oiseaux. Étalonnage ambre. Recadrage 1.37.

---

## P05b · 0:18–0:23 · On traverse sa fenêtre · Julien met un CV de côté
🎙️ *« …as-tu enfin trouvé la perle rare ? »*
**But :** le miroir de P02 : on traverse sa vitre comme on a traversé celle de Nadia, et on arrive directement sur lui. Il cherche, et le papier ne lui dit rien.

**Image de départ :** **K05b**
**Image d'arrivée K05c** · joindre **K05b** en `[SETTING] keep office identical` et **Fiche Julien** en `[CHARACTER] keep face, thin steel glasses and charcoal three-piece suit identical`
```
Cinematic film still, 16:9, 35mm lens, eye-level, mirror of a shot of a woman on her sofa looking right. The same symmetrical 1930s-style walnut-paneled hotel HR office as Image 1, at dawn. Medium shot, waist-up. Julien, the same man as Image 2, identical face, thin steel glasses, charcoal three-piece suit, seated behind the black lacquered desk with a thin brass edge, slightly right of center, three-quarter view, looking toward the left side of the frame, tired, searching. Key light: a pleated amber lampshade on the left of the desk. In front of him: a tall stack of printed pages and, to his left, a smaller separate pile. All pages blank and unreadable. Warm amber grade, rich shadows, subtle 35mm film grain. His eyes at 40% of the frame height from the top. No text, no logos.
```
**Vérifier K05c avec la grille** : **même hauteur des yeux que K04**, Julien sur l'axe ambre (57 %).
**Réglages :** départ **K05b** · arrivée **K05c** · Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Restrained, natural acting. Keep his face, glasses, suit, the office, the colors and the lighting identical to the reference frames. Keep him inside the central area of the frame. No text, no logos, all pages blank and unreadable.

Scene: dawn, a symmetrical 1930s-style hotel HR office with dark walnut paneling, a black lacquered desk with a thin brass edge, warm amber light from a pleated lampshade on the left. A man in a charcoal three-piece suit and thin steel glasses sits behind the desk.

Camera and action, second by second: 0 to 3 s, the camera pushes slowly and seamlessly forward through the window glass from outside: the last raindrops on the glass go soft and slide past the lens, and the camera emerges inside the office, settling into a waist-up medium shot of the man, slightly right of center. 3 to 4.5 s, he takes the top page from the tall stack, reads it for one second, and without conviction places it on the smaller pile to his left. 4.5 to 8 s, he lifts his eyes toward the left side of the frame and stays still, tired, searching. One unbroken move, no cut, no morphing.

Light and grade: warm amber and honey, rich shadows, steady lamp light, subtle 35mm film grain.

End frame: waist-up, he looks toward the left side of the frame, still, exactly as in the last reference frame.

Audio: the faint sound of the city outside that becomes muffled as we pass the glass, then quiet office room tone, paper rustling, a clock ticking softly. No music, no speech.
```
**On garde :** 5 s : les 3 premières secondes en **×2** (le passage de la vitre, 1,5 s), puis de 3 à 6,5 s à vitesse normale.
**Synchro :** le geste « mettre de côté » tombe sur « la perle rare ».
**État final :** il regarde **vers la gauche** : il fait face à Nadia à travers la coupe.
**Vérifier :** visage identique à la fiche, lunettes fines, gilet visible, pages illisibles.
**CapCut :** étalonnage ambre, recadrage 1.37.
**➜ STOP : envoie-moi P04, P05a et P05b** (le test du miroir) avant de continuer.

---

## P06 · 0:23–0:29 · Ce que coûte une mauvaise embauche · 3 plans de 2 s
🎙️ *(pas de voix : la musique coupe net à chaque plan)*
**But :** les conséquences dans l'hôtel, pièce par pièce. Les personnes mal recrutées sont toujours **de dos ou floues**, jamais humiliées.

**Images de départ** · joindre **Style hôtel** en `[STYLE] palette and light only` pour chacune
```
K06a — Cinematic film still, 16:9, perfectly symmetrical centered composition, one-point perspective. The reception desk of a grand old-world palace hotel in the morning: dark walnut desk with brass edges, brass key rack behind, black and white checkerboard marble floor, pleated amber lampshades. A young receptionist in a burgundy uniform seen from behind, frozen in front of a computer screen (screen content unreadable). Facing her across the desk, an elegant guest in a camel coat, her fingers resting on the walnut, waiting. Warm amber grade, rich shadows, subtle 35mm film grain. No text, no logos, no signage.
```
```
K06b — Cinematic film still, 16:9, perfectly symmetrical centered composition. The dining room of a grand old-world palace hotel during a busy service: white tablecloths, crystal glasses, brass sconces, dark walnut paneling, deep burgundy banquettes. In the center, a waiter in a white jacket seen from behind, holding a plate; to his side a maître d' in black tie; a seated guest in front. Warm amber grade, subtle 35mm film grain. No text, no logos.
```
```
K06c — Cinematic film still, 16:9, symmetrical one-point perspective. A narrow staff corridor behind the scenes of a palace hotel, lit by a single warm bulb: a row of grey metal lockers; in the center, one locker door open and the locker empty, a burgundy uniform left on a hanger, a blank brass name badge left on the shelf. Nobody. Warm but tired amber light, rich shadows, subtle 35mm film grain. No text, no logos.
```
**Réglages :** départ **K06a / K06b / K06c** · Quality · 8 s
**Prompts vidéo :**
```
P06a — Cinematic film shot, photorealistic, 35mm lens, stabilized camera, never handheld. Keep the setting, colors and lighting identical to the reference frame. Perfectly symmetrical. No text, no logos, no readable screen.
Static symmetrical shot of the palace hotel reception desk in the morning. 0 to 5 s: the elegant guest taps her fingers on the walnut desk, impatient, and glances at her watch; the receptionist, seen from behind, does not move, hesitating over the screen. At 5.5 s, a very fast whip pan to the right, with strong motion blur.
Warm amber grade, rich shadows, subtle 35mm film grain.
Audio: fingers tapping on wood, a hushed lobby, a distant elevator bell. No music, no speech.
```
```
P06b — Cinematic film shot, photorealistic, 35mm lens, stabilized camera, never handheld. Keep the setting, colors and lighting identical to the reference frame. Perfectly symmetrical. No text, no logos.
Static symmetrical shot of the palace hotel dining room during a busy service. 0 to 5 s: the waiter, seen from behind, sets the plate in front of the guest; the guest looks at it, frowns slightly and pushes it a little away; the maître d' turns his head away, embarrassed. At 5.5 s, a very fast whip pan to the right, with strong motion blur.
Warm amber grade, subtle 35mm film grain.
Audio: murmured dining room, cutlery, a fork set down on a plate. No music, no speech.
```
```
P06c — Cinematic film shot, photorealistic, 35mm lens, stabilized camera, never handheld. Keep the setting, colors and lighting identical to the reference frame. No people, no text, no logos.
A slow push-in along the narrow staff corridor toward the open, empty locker. The bulb flickers once at 2 s. The empty hanger swings very slightly. At 5.5 s, a very fast whip pan to the right, with strong motion blur.
Warm, tired amber light, rich shadows, subtle 35mm film grain.
Audio: a buzzing bulb, a metal locker door creaking, distant kitchen noise. No music, no speech.
```
**On garde :** environ 2 s par plan, **en finissant au milieu du panoramique fouetté** (de 3,8 à 5,8 s environ).
**Vérifier :** personne de face parmi les personnes mal recrutées, pas d'écran lisible, pas d'enseigne.
**CapCut :** coupe dans le flou de chaque panoramique, avec un flou de mouvement. Recadrage 1.37.

---

## P07 · 0:29–0:33 · Le CV de Nadia sur la pile des refus
🎙️ **V4** *« Ce serait dommage de passer à côté d'une belle rencontre… »*
**But :** le seul lien entre leurs deux mondes, c'est un papier qu'on écarte. Sa photo est **dans son vert**, sur le bureau **ambré** de Julien.

**Image de départ K07** · joindre **Fiche Nadia** en `[CHARACTER] face only, for the small ID photo` et **K05c** en `[SETTING] keep desk and light identical`
```
Cinematic film still, 16:9, top-down overhead shot, 50mm lens. The black lacquered desk with a thin brass edge from Image 2, warm amber lamp light. A printed CV held just above a small pile of other set-aside CVs by a man's hand in a charcoal suit sleeve. In the top corner of the page, a small ID photo of the same young woman as Image 1, identical face, the photo in cold green tones, clearly contrasting with the warm amber desk. All text on the pages blank and unreadable, just soft grey lines. Rich shadows, subtle 35mm film grain. No logos.
```
**Réglages :** départ **K07** · Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, top-down overhead shot, 50mm lens, stabilized camera, never handheld. Keep the desk, the hand, the photo, the colors and the lighting identical to the reference frame. All pages blank and unreadable. No logos.

Scene: a black lacquered desk with a thin brass edge, warm amber lamp light, a small pile of set-aside CVs.

Action, second by second: 0 to 1.5 s, the hand holds the page just above the pile. At 1.5 s the hand lets go; the page drops softly, slides a little and settles on top of the pile, slightly askew. At 2.5 s, the hand withdraws out of frame. 3 to 8 s, stillness.

Camera: static at first, then from 3 s a very slow push-in toward the small green-toned ID photo in the corner of the page.

Light and grade: warm amber desk, the small photo in cold green tones, rich shadows, subtle 35mm film grain.

End frame: still, the green ID photo near the center of the frame.

Audio: a sheet of paper landing softly on paper, quiet office room tone, a clock ticking. No music, no speech.
```
**On garde :** 4 s (de 0,5 à 4,5 s) · **Synchro :** le CV se pose sur « passer à côté ».
**Vérifier :** c'est bien le visage de Nadia sur la photo, et aucun texte n'est lisible.
**CapCut :** recadrage 1.37.

---

## P08 · 0:33–0:39 · Le problème · ✏️ codé par moi
🎙️ **V5** *« Le problème n'est pas le nombre de CV. C'est ce qu'on est capable d'observer. »*
Texte animé sur noir, 0 crédit. Je te le livre en MP4.

---

## P09 · 0:39–0:43 · La fin de la scène chez elle : le téléphone s'illumine
🎙️ *(silence, un « clic »)* → enchaîne sur **V6** « Voici JobResolute. » (début de l'acte II)
**But :** le même téléphone qu'elle avait retourné dans P04. Cette fois il s'allume par en dessous, en **ambre** : la première touche de chaud dans son monde vert. Elle le retourne, elle regarde, et on entre dans l'écran.

**Image de départ K09** · joindre **Studio** en `[SETTING] keep room identical`, **Fiche Nadia** en `[CHARACTER]` et **K04** en `[REFERENCE] same outfit, same sofa`
```
Cinematic film still, 16:9, 35mm lens, slightly wider than Image 3, eye-level. Late night, the same small Parisian studio apartment as Image 1, almost dark: the fluorescent tube is off, only the cold blue-green glow of the rainy window and the dim laptop light. Nadia, the same young woman as Image 2, identical face, curly bun, gold hoop earrings, gold necklace, grey knit sweater, sits on the grey sofa slightly left of center, her laptop half-closed. On the coffee table, her phone lies face down and glows warmly from underneath, a thin halo of amber light spilling onto the wood. She turns her head toward it. Cold desaturated blue-green grade except for that small amber glow, subtle 35mm film grain. No text, no logos.
```
**Image d'arrivée K09b** · joindre **K09** en `[SETTING]` et **Fiche Nadia** en `[CHARACTER]`
```
Cinematic film still, 16:9, 50mm lens, shallow depth of field. Close-up of a smartphone held upright in a young woman's hands, the phone screen perfectly centered in the frame, vertical, filling about 60% of the frame height, glowing with a warm amber light, the screen content soft, blurred and unreadable. Background: the dark green-tinted studio apartment, completely out of focus, a few soft bokeh points. Warm amber light touching her fingers. No text, no logos.
```
**Réglages :** départ **K09** · arrivée **K09b** · Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Restrained, natural acting. Keep her face, hair, earrings, necklace, clothes, the room, the colors and the lighting identical to the reference frames. No text, no logos, no readable screen content.

Scene: late night, the same small Parisian studio apartment, almost dark, cold blue-green light from the rainy window. The young woman sits on the sofa. On the coffee table her phone lies face down and glows warmly from underneath.

Action, second by second: 0 to 1.5 s, she looks at the glowing phone, hesitant. 1.5 to 3 s, she reaches out, turns it over and picks it up; warm amber light from the screen rises onto her face, the first warm light in her cold green world. 3 to 4 s, she straightens slightly, attentive, a hint of hope, no big smile.

Camera: from 3 s, a smooth and steady push-in over her shoulder toward the phone screen, until the screen is perfectly centered, vertical, and fills about 60% of the frame height; the background falls completely out of focus.

Light and grade: cold desaturated blue-green everywhere except the warm amber light of the phone screen on her face and fingers, subtle 35mm film grain.

End frame: the glowing amber phone screen perfectly centered in the frame, unreadable, still.

Audio: soft rain on the window, a short phone vibration, a soft notification chime, then near silence. No music, no speech.
```
**On garde :** les **4 dernières secondes** · **État final :** l'écran **centré**, sur environ 60 % de la hauteur.
**Vérifier :** l'écran est illisible, c'est le même pull et la même pièce que dans P04.
**➜ Envoie-moi la dernière image** : j'y cale l'entrée dans l'écran de M01, au pixel près.

---

# ACTE III — RÉUNIS (après la présentation produit) · 2.39:1 · tout est **ambre**

> Au format 2.39, le haut et le bas de l'image 16:9 sont coupés : **les têtes doivent rester dans la bande centrale** (entre 25 % et 75 % de la hauteur).

## P10 · 0:00–0:04 · Julien se lève
🎙️ *(silence)* : enchaîne sur M12 (on recule hors de l'ordinateur du recruteur)
**But :** la décision humaine est prise. Julien va à la rencontre.

> ⚠️ **Piège à éviter :** l'écran ne peut pas faire face à la caméra **et** à Julien en même temps. Si la caméra est en face de lui et voit l'écran, c'est que Julien regarde le dos de son ordinateur. On filme donc **par-dessus son épaule** : l'écran fait face à Julien **et** à la caméra. La caméra recule puis tourne autour du bureau pendant qu'il se lève.

**Image de départ K10** · joindre **K05c** en `[SETTING] keep office identical`, **Fiche Julien** en `[CHARACTER]` et **`references/raccords/mac_decision_JobResolute.png`** en `[SCREEN] display exactly this image on the laptop screen`
```
Cinematic film still, 16:9, 35mm lens. Daytime, the same walnut-paneled hotel HR office as Image 1, warm amber light. Over-the-shoulder shot from behind Julien, the same man as Image 2, seated at the black lacquered desk: his right shoulder in charcoal three-piece suit and the back of his head softly out of focus on the left edge of the frame. In front of him, facing him and facing the camera, an open silver laptop whose screen displays exactly Image 3 (a plain white screen with a short green line of text above a small black wordmark, in the center); the screen fills most of the frame and is perfectly centered, seen straight on. Beyond the laptop, out of focus, the walnut paneling and the office door. Warm amber grade, subtle 35mm film grain. No text, no logos.
```
**Image d'arrivée K10b** · joindre **K05c** en `[SETTING]` et **Fiche Julien** en `[CHARACTER]`
```
Cinematic film still, 16:9, 35mm lens, three-quarter front medium wide shot of the same walnut-paneled HR office as Image 1, daytime, warm amber light. Julien, the same man as Image 2, thin steel glasses, charcoal three-piece suit, standing behind his black lacquered desk, jacket buttoned, the laptop closed on the desk in front of him, turned toward the office door on the left of the frame with a calm, decided expression. His head in the middle band of the frame. Warm amber grade, subtle 35mm film grain. No text, no logos.
```
**Réglages :** départ **K10** · arrivée **K10b** · Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Restrained, natural acting. Keep his face, glasses, suit, the office, the colors and the lighting identical to the reference frames. No text, no logos, no readable screen content.

Scene: daytime, a walnut-paneled hotel HR office, warm amber light. A man in a charcoal three-piece suit sits at a black lacquered desk, looking at the open laptop in front of him; the laptop screen faces him.

Camera and action, second by second: 0 to 2.5 s, over his shoulder, the camera pulls back slowly from the glowing laptop screen, revealing his shoulder and the desk; he looks at the screen for a moment, then gives a small, satisfied nod. 2.5 to 4 s, he gently closes the laptop. 4 to 6 s, he stands up and buttons his jacket while the camera keeps pulling back and arcs smoothly around the desk to a three-quarter front view of him. 6 to 8 s, he turns toward the office door on the left, calm and decided. The camera settles, still.

Light and grade: warm amber and honey, soft daylight through the tall window, rich shadows, subtle 35mm film grain.

End frame: three-quarter front, he stands still behind the desk, the laptop closed, looking toward the door on the left.

Audio: a laptop lid closing softly, a chair sliding back on a wooden floor, fabric rustle, quiet room tone. No music, no speech.
```
**On garde :** 4 s (les 8 s en ×2, ou de 2,5 à 6,5 s) · **Raccord :** M12 finit sur l'écran de l'ordinateur, P10 commence dessus.
**L'écran du Mac :** `references/raccords/mac_decision_JobResolute.png` (2880 × 1800), « ✓ Décision validée » en vert et le logotype JobResolute en noir, sur blanc : exactement l'écran de la fin de M12. Veo déformera le texte pendant le recul : **dans CapCut, incruste l'image sur l'écran** avec le suivi de mouvement (sur les 2 premières secondes, l'écran reste de face : un suivi de position et d'échelle suffit ; ensuite il se ferme, l'incrustation peut s'effacer en fondu dès qu'il commence à rabattre l'écran). Dans le prompt vidéo, garde « no readable screen content » : c'est l'incrustation qui affiche le texte.

---

## P10b · 0:04–0:07 · Nadia devant l'hôtel
🎙️ *(pas de voix : la musique et la ville)*
**But :** le miroir de P05a. La même façade que Julien voyait à l'aube, mais en plein jour, après la pluie. Nadia traverse la place **en tailleur**, celui qui attendait sur sa porte. **Elle passe de l'ombre fraîche au soleil chaud** : c'est ici que son vert la quitte, juste avant d'entrer dans l'ambre du lobby.

**Image de départ K10c** · joindre **K05a** en `[SETTING] same hotel facade and square, now in daylight`, **Fiche Nadia** en `[CHARACTER] keep face, curly bun, gold hoop earrings and gold necklace identical` et **Studio** en `[REFERENCE] the navy suit and black heels hanging on the door`
```
Cinematic film still, 16:9, perfectly symmetrical centered composition, one-point perspective. Late morning in Paris, just after the rain, sunny. The same grand old-world palace hotel facade as Image 1, across the same small cobbled square, frontal and perfectly centered, now in warm golden daylight: ornate pale stone, burgundy awnings, brass revolving door at the bottom center, wet cobblestones glistening in the sun. In the foreground on the left, still in the cool blue shadow of a building, Nadia, the same young woman as Image 2, identical face, curly bun, gold hoop earrings, wearing the navy blue suit and black heels from Image 3, seen from three-quarter back, walking toward the hotel. The rest of the square is bathed in warm amber sunlight. Her head in the middle band of the frame. Warm amber grade with a cool shadow on the left, subtle 35mm film grain, Wes Anderson symmetry. No text, no hotel name, no logos, no signage.
```
**Image d'arrivée K10d** · mêmes références
```
Cinematic film still, 16:9, perfectly symmetrical centered composition. The same palace hotel entrance as Image 1, in warm golden daylight. Nadia, the same young woman as Image 2, in her navy blue suit and black heels, seen from behind, stands at the exact center of the frame in front of the brass revolving door, her hand resting on the brass push bar, about to go in, her head slightly raised. Warm sunlight on her shoulders and hair, no cold light left. Her head in the middle band of the frame. Warm amber grade, subtle 35mm film grain. No text, no hotel name, no logos, no signage.
```
**Réglages :** départ **K10c** · arrivée **K10d** · Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Restrained, natural acting. Keep her face, hair, earrings, navy suit and heels, the hotel facade, the colors and the lighting identical to the reference frames. Perfectly symmetrical. Keep her head in the middle band of the frame. No text, no hotel name, no logos, no signage.

Scene: late morning in Paris, just after the rain, sunny. A grand old-world palace hotel facade across a small wet cobbled square, perfectly symmetrical, brass revolving door at the center.

Action, second by second: 0 to 2 s, the young woman in the navy suit walks out of the cool blue shadow on the left of the square. At 2 s she steps into the warm golden sunlight: the light on her changes from cold to warm. 2 to 6 s, she crosses the square toward the revolving door with a calm, steady, confident walk, her heels clicking on the wet cobblestones. 6 to 8 s, she stops in front of the revolving door at the exact center of the frame, lifts her head slightly, takes a short breath, and rests her hand on the brass push bar.

Camera: a slow, smooth, centered follow from behind, gliding forward on the center axis of the facade, ending perfectly symmetrical behind her. Constant speed, no shake.

Light and grade: warm golden amber sunlight, wet cobblestones glistening, a cool blue shadow only on the left at the start, subtle 35mm film grain.

End frame: she stands at the exact center in front of the revolving door, seen from behind, her hand on the brass bar, still.

Audio: heels on wet cobblestones, a few pigeons taking off, a distant street, the revolving door starting to turn at the very end. No music, no speech.
```
**On garde :** 3 s : les 8 s en ×2,7 avec une courbe (rapide pendant la traversée, **normale sur les deux dernières secondes** : l'arrêt, le souffle, la main sur la barre).
**Raccord :** P11 commence quand elle sort de la porte tournante, à l'intérieur : coupe dans le mouvement.
**Vérifier :** **le même tailleur que sur sa porte**, le même visage, aucune enseigne, le passage ombre froide → soleil chaud bien visible.
**CapCut :** audio extrait et gardé à vitesse normale. Recadrage 2.39.

---

## P11 · 0:07–0:13 · La rencontre
🎙️ **V17** *« La décision finale sera la tienne, Julien. »* (commence vers 1,5 s)
**But :** leur premier plan ensemble. Nadia porte **le tailleur qui attendait sur sa porte**, et elle entre **dans l'ambre** : son vert a disparu.

**Image de départ K11** · joindre **Fiche Nadia**, **Fiche Julien**, **Studio** en `[REFERENCE] the navy suit and black heels hanging on the door` et **Style hôtel** en `[STYLE]`
```
Cinematic film still, 16:9, perfectly symmetrical one-point perspective. Daytime, a grand old-world palace hotel lobby: black and white checkerboard marble floor, dark walnut paneling, pleated amber lampshades, brass revolving door at the exact center of the background, deep burgundy armchairs. Nadia, the same young woman as Image 1, identical face, curly bun, gold hoop earrings, wearing the navy blue suit and black heels from Image 3, has just come out of the revolving door into the lobby, calm and confident, warm light on her face. Julien, the same man as Image 2, walks toward her from the right side. Both heads in the middle band of the frame. Warm amber grade, rich shadows, subtle 35mm film grain. No text, no logos, no signage.
```
**Image d'arrivée K11b** · mêmes références
```
Cinematic film still, 16:9, perfectly symmetrical two-shot in the same grand hotel lobby, the brass revolving door behind them at the exact center. Nadia, the same young woman as Image 1, in her navy suit, and Julien, the same man as Image 2, in his charcoal three-piece suit, shake hands at the exact center of the frame, both with a small, warm smile. Warm amber light on both faces. Both heads in the middle band of the frame. Warm amber grade, subtle 35mm film grain. No text, no logos.
```
**Réglages :** départ **K11** · arrivée **K11b** · Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Restrained, natural acting. Keep both faces, her navy suit, his three-piece suit and glasses, the lobby, the colors and the lighting identical to the reference frames. Perfectly symmetrical. Keep both heads in the middle band of the frame. No text, no logos, no signage.

Scene: daytime, a perfectly symmetrical grand palace hotel lobby, black and white checkerboard marble floor, dark walnut paneling, pleated amber lamps, a brass revolving door at the exact center.

Action, second by second: 0 to 2 s, the young woman in the navy suit comes out of the revolving door and walks forward into the warm light, calm and confident. 1 to 4 s, the man in the charcoal three-piece suit and glasses walks toward her from the right. At 4 s they meet at the exact center of the frame and shake hands, a small, warm smile on both faces, a short look of mutual recognition. 4 to 8 s, they hold the handshake, still.

Camera: static, centered, symmetrical; a very slow, almost imperceptible push-in.

Light and grade: warm amber everywhere, including on her, no green at all, rich shadows, subtle 35mm film grain.

End frame: the handshake at the exact center, both still.

Audio: the revolving door turning, heels and shoes on marble, a hushed lobby. No music, no speech.
```
**On garde :** 6 s (de 1 à 7 s) · **Synchro :** la poignée de main tombe sur « sera la tienne ».
**Vérifier :** visages identiques aux fiches, **le même tailleur que sur la porte**, poignée de main au **centre exact**, têtes dans la bande centrale.

---

## P12 · 0:13–0:22 · La maison de poupée : on suit Nadia de la salle à la salle des employés (version simple)
🎙️ **V18** *« Et toi, Nadia, quelle que soit la décision, on reste à tes côtés. »*
**But :** tout se passe bien. L'hôtel coupé en deux comme une maison de poupée ; Nadia, **en uniforme**, va du restaurant à la cuisine, puis à la salle des employés. La caméra la suit de gauche à droite.

> **Pourquoi ça a échoué :** « prominent people » veut dire que Veo a cru reconnaître une personne réelle connue. C'est presque toujours **un visage photo-réaliste joint en référence** (ici, sans doute celui de Julien) ou un visage trop détaillé dans l'image de départ. Et le prompt était trop chargé (4 actions, 3 pièces, 2 personnages, image d'arrivée).
> **La version simple :** une seule image de départ, **sans Julien** (il n'apporte rien dans ce plan, et c'est lui qui bloque), pas d'image d'arrivée, pas de référence de visage dans la vidéo, un prompt court avec **une seule action**.

### Étape 1 · L'image de départ K12 (image) — garde ta maison de poupée actuelle si Julien n'y est pas
Si ton image actuelle contient Julien, refais-la ainsi. Joindre : **Fiche Nadia en uniforme** uniquement.
```
Generate only an image, no video. Cinematic film still, 16:9, wide frontal cross-section of a grand old-world palace hotel like a dollhouse cut open: three rooms side by side with open doorways, perfectly level camera. Left: an elegant restaurant with white tablecloths, chandeliers and walnut paneling, a few guests seen from afar. Center: a kitchen with steel counters, copper pans and two cooks in white. Right: a staff room with lockers and a small wooden table where two colleagues in black uniforms chat. In the restaurant, near the kitchen doorway, the young waitress from Image 1 in her black waistcoat and white shirt, seen in profile, walking toward the right with an empty tray. Warm amber light, Wes Anderson symmetry, subtle 35mm film grain. All heads in the middle band of the frame. No text, no logos.
```

### Étape 2 · La vidéo (Frames to Video, **image de départ seulement**)
**Réglages :** départ **K12** · pas d'image d'arrivée · **Veo 3.1 Quality** · 8 s · **ne joins aucune autre image**
```
The camera slowly tracks from left to right on a dolly, at the same height, following the waitress in the black waistcoat as she walks calmly from the restaurant, through the kitchen, into the staff room, where her two colleagues greet her with a warm smile. Smooth, continuous, never stops. Warm amber light, cinematic, photorealistic, subtle film grain. No text. Ambient sound only: soft cutlery, kitchen bustle, a quiet laugh. No music, no speech.
```
**On garde :** les 8 s, ralenties à ×0,9 (≈ 9 s). **Synchro :** elle entre dans la salle des employés sur « on reste à tes côtés ».
**Vérifier :** son visage reste le même, la caméra ne s'arrête pas.

### Plan B si Veo n'y arrive toujours pas : deux clips de 4,5 s, raccordés dans le mur
1. **Clip A** (départ : K12) : `The camera slowly tracks from left to right, following the waitress in the black waistcoat as she walks from the restaurant toward the kitchen doorway. Warm amber light, cinematic. No text. Ambient sound only.`
2. **Clip B** (départ : une image de la salle des employés, générée avec la fiche en uniforme) : `The camera slowly tracks from left to right as the waitress in the black waistcoat walks into the staff room; her two colleagues greet her with a warm smile. Warm amber light, cinematic. No text. Ambient sound only.`
3. **Dans CapCut :** coupe au moment où le mur entre deux pièces passe devant la caméra (un « volet » naturel) : la coupe ne se voit pas.

---

## Ordre de production
1. Recadrages ✅ (`studio_nadia_16x9.jpg`, `fenetre_nadia.jpg`) · K01 ✅ (ton image des toits) → **envoie-la-moi**
2. **K04 + K05a + K05b + K05c** → grille → **envoie-les-moi**
3. **P04 + P05a + P05b** → **envoie-les-moi** (test du miroir)
4. **K01b + K01c** → **P01**, **P01b**, **P02** (l'ouverture complète, qui finit sur K04)
5. **P06a/b/c**, **K07 → P07**
6. **K09 + K09b → P09** → envoie-moi la dernière image
7. **K10 + K10b → P10** · **K10c + K10d → P10b** · **K11 + K11b → P11**
8. Fiche Nadia en uniforme → **K12 (sans Julien) → P12**, image de départ seule (une étape par message dans l'assistant de Flow)

## Montage CapCut (rappel)
- Pose **la voix off d'abord** et cale les plans dessus (les synchros sont données plan par plan).
- **Acte I en 1.37:1, acte III en 2.39:1** (masques).
- Pour P01b, P02, P05a, P05b et P10b : **extrais l'audio avant d'accélérer**, et garde l'ambiance à vitesse normale.
- Ambiance de Veo **sous** la voix off (≈ −18 dB). Musique : pizzicato et célesta.
- Vert chez Nadia, ambre chez Julien, et **Nadia passe dans l’ambre à P10b** (ombre froide → soleil), tout ambre à P11.
- L'acte I dure maintenant **43 s** (l'acte II commence à **0:43**), et l'acte III **22 s**.

---

## Raccords entre tes clips Flow et mes vidéos (CapCut)

| Après | Mettre | Transition | Réglages précis |
|---|---|---|---|
| **P07** (le CV tombe sur la pile) | **P08.mp4** | **Fondu au noir** | Transition « Fondu au noir » de **0,4 s**. Le bruit du papier qui se pose reste avant la coupe ; la voix V5 commence 0,3 s après le noir. |
| **P08.mp4** | **P09** | **Fondu depuis le noir** | Transition « Fondu » de **0,5 s**. P09 sort du noir sur la pluie : le premier son de P09 doit entrer avant l'image. |
| **P09** (le téléphone dans ses mains, écran iPhone incrusté) | **ACTE2.mp4** | **Fondu enchaîné (Mélanger)** | **0,5 s**. La première image d'ACTE2 est le même téléphone, de face, à la même place (centré, centre de l'écran à 46 % de la hauteur, écran sur 59 % de la hauteur) : les mains et la pièce disparaissent, le téléphone reste et se met à flotter sur fond noir. Vérifie en superposant les deux images : si l'écran de P09 n'est pas exactement au même endroit, ajuste P09 (position et échelle) sur ses dernières images pour qu'il tombe sur celui d'ACTE2. |
| **ACTE2.mp4** (finit sur l'écran blanc « ✓ Décision validée » en plein cadre) | **P10** | **Zoom arrière par images clés** + fondu de 4 images | Sur P10 : image clé au **début** : échelle **360 %**, position recentrée sur l'écran du Mac (l'écran doit remplir l'image) ; image clé à **0,8 s** : échelle **100 %**, position 0. Courbe « Lissage ». Ajoute un fondu enchaîné de **4 images** entre ACTE2 et P10. Résultat : on sort de l'écran et on découvre Julien de dos, dans son bureau. |
| **P12** (la maison de poupée) | **ACTE4.mp4** | **Fondu au noir** | **0,6 s**, sur la fin de la phrase V18. ACTE4 commence dans le noir. |

> Si tu m'envoies P07, P09, P10 et P12 (les fichiers Flow), je peux faire ces raccords moi-même, à l'image près, et te rendre des clips de transition prêts à poser.
