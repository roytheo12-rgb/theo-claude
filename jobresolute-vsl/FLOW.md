# Google Flow (Veo 3.1) — tous les plans filmés, prompts complets, calés sur la voix off

**Version 3.2.** Ouverture « toits → fenêtre → intérieur » chez Nadia, et la même construction en miroir chez Julien (l'hôtel à l'aube → la fenêtre de son bureau → l'intérieur).

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
- **Personne dans P01, P01b, P02, P03, P05a** : Nadia n'apparaît qu'en P04, Julien qu'en P05b.
- **Le miroir** : Nadia à gauche du cadre, elle regarde à droite ; Julien à droite, il regarde à gauche ; yeux à 40 % de la hauteur (`references/grille_capcut.png`).
- **Chez Nadia : nuit, pluie, vert.** **Chez Julien : aube, pluie finie, ambre.** Même ville, même nuit, deux lumières.
- **Aucun monument** (ni tour Eiffel, ni Sacré-Cœur) : la tour Eiffel illuminée la nuit pose un problème de droits, et ça fait carte postale. Les toits en zinc suffisent à dire Paris.
- **Aucun texte lisible, aucun logo, aucune enseigne.** Le nom de l'hôtel n'apparaît jamais.

---

# ACTE I — SÉPARÉS (0:00 → 0:45) · 1.37:1

## La construction : un seul mouvement de caméra, des toits jusqu'au tailleur

```
P01 toits ──► K01b ──► P01b façade ──► FENÊTRE ──► P02 la vitre ──► STUDIO ──► P03 ──► K03 tailleur
           (même image)              (ton image 4)                (ton image 5)
```
Quatre clips, mais **chaque fin de clip est exactement le début du suivant** : à l'écran, c'est un seul plan-séquence qui descend des toits, s'approche de sa fenêtre, traverse la vitre et finit sur le tailleur.
Julien a la même construction, plus courte (P05a → P05b), en ambre.

---

## P01 · 0:00–0:04 · Les toits de Paris sous la pluie
🎙️ **V1** *« Dis-moi, Nadia… combien de candidatures as-tu envoyées ces trois derniers mois ? »* (commence vers 0,5 s, continue sur P01b et P02)
**But :** Paris, la nuit, la pluie, des milliers de fenêtres éteintes. Une seule est allumée, en vert : la sienne.

**Image de départ K01** · joindre **Fenêtre** en `[STYLE] palette, light and facade style only`
```
Cinematic film still, 16:9, 35mm anamorphic look. High wide establishing shot over the zinc rooftops of Paris at night under heavy rain, seen from slightly above roof level. A sea of grey-blue zinc mansard roofs, rows of terracotta chimney pots, small dormer windows, wet roofs reflecting the faint city glow. Every window is dark except one: in the center of the frame, in the top floors of a Haussmann building in the middle distance, a single tall French window glows with a cold sickly green fluorescent light. Visible rain streaks, mist, low clouds. Cold desaturated blue-green color grade, lifted blacks, deep shadows, subtle 35mm film grain. No people, no landmarks, no Eiffel Tower, no text, no logos, no signage.
```

**Image d'arrivée K01b** · joindre **Fenêtre** en `[SETTING] keep facade and window identical`
```
Cinematic film still, 16:9, 35mm lens. Night, heavy rain. The same Haussmann building as Image 1, seen from across the narrow street at the height of its top floors, frontal and centered: carved pale stone facade darkened by rain, wrought-iron balconies, a zinc mansard roof with chimney pots at the top of the frame. In the exact center, the same tall French window as Image 1, lit from inside with a cold green fluorescent light, the interior soft and indistinct at this distance. All the other windows of the facade are dark. Rain streaks across the frame, water dripping from the balcony rails. Cold desaturated blue-green grade, lifted blacks, subtle film grain. No people, no text, no logos.
```

**Réglages :** départ **K01** · arrivée **K01b** · Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm anamorphic look, stabilized camera, precise and deliberate movement, never handheld. Keep the setting, colors and lighting identical to the reference frames. No people, no text, no logos, no landmarks.

Scene: night over the zinc rooftops of Paris under heavy rain. Thousands of dark windows; only one window glows, with a cold green fluorescent light, in the top floors of a Haussmann building in the middle distance.

Camera: one slow, continuous, elegant crane-down and push-in, like a drone gliding between the chimney pots. It starts high above the roofs, descends gently past the wet chimneys and glides across the narrow street toward the lit window, ending frontal and centered on the facade at the height of the top floors. Constant speed, no shake, no cuts.

Action and atmosphere: steady heavy rain, water running along the zinc gutters and dripping from the chimney pots, a thin mist between the roofs. At 5 seconds the green light in the window flickers once, like a tired fluorescent tube. The light in the window stays cold green; everything else stays dark blue-green.

Light and grade: cold desaturated blue-green, lifted blacks, deep shadows, subtle 35mm film grain, rain catching the light.

End frame: the lit green window in the exact center of the frame, the camera settling still.

Audio: heavy rain on zinc roofs, water gurgling in the gutters, a distant city hum, a far-away car on wet asphalt. No music, no speech.
```
**On garde :** les **4 dernières secondes** (de 4 à 8 s), pour finir exactement sur K01b.
**Synchro :** la voix commence 0,5 s après le début du plan.
**Vérifier :** aucune silhouette, une seule fenêtre allumée, pas de monument, la fenêtre bien au centre (elle doit survivre au recadrage 1.37).
**CapCut :** 0,5 s de noir avec la pluie qui monte avant l'image, puis fondu d'ouverture de 12 images. Recadrage 1.37.

---

## P01b · 0:04–0:07 · Sa fenêtre, vue de dehors
🎙️ *(suite de V1 : « …combien de candidatures as-tu envoyées… »)*
**But :** on s'approche. Derrière la vitre embuée : sa vie, et le tailleur qui attend, déjà, à gauche.

**Image de départ :** **K01b** · **Image d'arrivée :** **Fenêtre** (`fenetre_nadia.jpg`)
**Réglages :** Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Keep the facade, window, interior, colors and lighting identical to the reference frames. No people, no text, no logos.

Scene: night, heavy rain, the pale stone facade of a Haussmann building with a wrought-iron balcony. A tall French window lit from inside with a cold green fluorescent light; through the fogged, rain-streaked glass we glimpse a small studio apartment: a navy blue suit hanging on a door on the left, a tiny kitchen, bookshelves, a string of small warm lights, a grey sofa with blankets, a candle on a coffee table.

Camera: one slow continuous push-in across the street toward the window, perfectly frontal and centered, ending close to the glass with the wrought-iron balcony rail crossing the lower part of the frame. Constant slow speed, no shake.

Action and atmosphere: raindrops hit the glass and run down it in thin streams; condensation on the inside of the panes; water drips from the balcony rail; the fluorescent tube inside flickers very slightly once. Nobody is in the room.

Light and grade: cold sickly green-cyan interior light against the dark wet stone, lifted blacks, desaturated, subtle 35mm film grain, rain glistening on the iron.

End frame: the window exactly as in the last reference frame, frontal and centered, still.

Audio: rain on the stone and on the iron balcony, water dripping from the rail, the faint buzz of a fluorescent tube behind the glass. No music, no speech.
```
**On garde :** les 8 s, **accélérées en ×2,7** (≈ 3 s) avec une courbe de vitesse douce (voir CapCut).
**Vérifier :** on reconnaît bien ton image 4 à la fin, le tailleur est visible à gauche derrière la vitre, personne dans la pièce.
**CapCut :** **extraire l'audio** avant d'accélérer (sinon la pluie sonne aigu), puis Vitesse → Courbe → Personnalisée : rapide au début, ralentie sur les 0,5 dernières secondes. Recadrage 1.37.

---

## P02 · 0:07–0:09 · On traverse la vitre
🎙️ *(fin de V1 : « …ces trois derniers mois ? »)*
**But :** le moment le plus cinématique de l'ouverture : la caméra passe à travers la vitre mouillée et se retrouve à l'intérieur… dans le même vert.

**Image de départ :** **Fenêtre** (`fenetre_nadia.jpg`) · **Image d'arrivée :** **Studio** (`studio_nadia_16x9.jpg`)
**Réglages :** Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Keep the window, the room, the objects, the colors and the lighting identical to the reference frames. No people, no text, no logos.

Scene: night, heavy rain. We start outside a tall French window of a Haussmann building, lit from inside with a cold green fluorescent light, and end inside the small Parisian studio apartment behind it.

Camera: one slow, continuous, seamless push forward that passes straight through the rain-streaked window glass. Between 2 and 4 seconds the raindrops and streams on the glass fill the frame, go soft and out of focus, and slide past the lens; the camera emerges inside the room and keeps gliding forward, then settles on the wide view of the studio: the navy suit on the door on the left, the small kitchen with the fluorescent tube in the center, the grey sofa with blankets, the coffee table with a mug and a candle, the tall window streaked with rain on the right. One unbroken move, constant speed, no cut, no morphing of the room.

Action and atmosphere: rain runs down the glass; once inside, the rain becomes muffled; the fluorescent tube flickers once; the candle flame trembles slightly. Nobody is in the room.

Light and grade: cold sickly green-cyan, desaturated, lifted blacks, the small warm points of the string lights and the candle kept very discreet, subtle 35mm film grain.

End frame: the wide view of the empty studio exactly as in the last reference frame, still.

Audio: loud rain outside that becomes suddenly muffled as we pass through the glass, then the quiet room: rain against the window, the faint buzz of the fluorescent tube. No music, no speech.
```
**On garde :** les 8 s **en rampe de vitesse** (≈ 2 s à l'écran) : rapide jusqu'à la vitre, **ralenti au moment où les gouttes passent devant l'objectif**, de nouveau rapide, puis posé sur le studio.
**Vérifier :** pas de déformation de la pièce, pas de silhouette qui apparaît dans un reflet.
**Plan B si Veo déforme la pièce :** garde la fin de P01b collée à la vitre et coupe sur le studio avec un **fondu enchaîné de 10 images** posé sur les gouttes floues. Ça marche très bien aussi.
**CapCut :** audio extrait et gardé à vitesse normale (le passage du son « dehors → dedans » est le meilleur effet du plan). Recadrage 1.37.

---

## P03 · 0:09–0:12 · Le tailleur qui attend
🎙️ *(silence : la pluie seule)*
**But :** sa tenue d'entretien, prête depuis longtemps, qui attend un rendez-vous. Elle n'est pas là. C'est le début de l'arc du vêtement : ce tailleur, elle le portera dans P11.

**Image de départ :** **Studio** (`studio_nadia_16x9.jpg`)
**Image d'arrivée K03** · joindre **Studio** en `[SETTING] keep room identical`
```
Cinematic film still, 16:9, 50mm lens, shallow depth of field. Night, the same small Parisian studio apartment as Image 1, same cold sickly green-cyan fluorescent light. Close medium shot of the navy blue suit jacket and matching skirt on a wooden hanger hanging on the white panelled apartment door, carefully pressed, a pair of black heels on the old wooden floor below, placed side by side. The suit sits slightly left of center. In the soft background on the right, out of focus: the rain-streaked window and the faint string lights. Desaturated, lifted blacks, subtle 35mm film grain. Nobody in frame. No text, no logos.
```
**Réglages :** départ **Studio** · arrivée **K03** · Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Keep the room, the suit, the colors and the lighting identical to the reference frames. No people, no text, no logos.

Scene: night, the small Parisian studio apartment, empty, cold green fluorescent light, rain on the window.

Camera: a slow, smooth lateral track from right to left combined with a gentle push-in, from the wide view of the room toward the white door on the left, ending in a close medium shot of the navy suit hanging on the door above a pair of black heels. The focus pulls slowly from the room onto the suit. Calm, constant speed, settling at the end.

Action and atmosphere: nobody in the room. Rain runs down the window. The fluorescent kitchen light flickers once. The candle flame on the coffee table trembles. The suit hangs perfectly still: pressed, ready, waiting.

Light and grade: cold sickly green-cyan, desaturated, lifted blacks, the navy of the suit kept deep and clean, subtle 35mm film grain.

End frame: close medium shot of the navy suit and the heels, still, exactly as in the last reference frame.

Audio: rain against the window, the faint buzz of the fluorescent tube, a distant car passing on a wet street. No music, no speech.
```
**On garde :** 3 s : les 8 s avec une courbe de vitesse (rapide au début, **lente et posée sur le tailleur pendant la dernière seconde et demie**).
**Vérifier :** le tailleur reste **bleu marine** (pas noir, pas gris), personne dans la pièce.
**CapCut :** étalonnage vert renforcé (TSL : orange et jaune à saturation −50, pour éteindre la guirlande et la bougie). Recadrage 1.37.

---

## P04 · 0:12–0:17 · Le téléphone retourné
🎙️ **V2** *« Et combien sont restées sans réponse ? »* (commence vers 0,5 s)
**But :** encore une candidature sans réponse. Elle ne lit même plus.

**Image de départ K04** · joindre **Studio** en `[SETTING] keep room identical` et **Fiche Nadia** en `[CHARACTER] keep face, curly bun, gold hoop earrings and gold necklace identical`
```
Cinematic film still, 16:9, 35mm lens, eye-level. Night, the same small Parisian studio apartment as Image 1, same cold sickly green-cyan fluorescent light, rain on the window. Medium shot, waist-up. Nadia, the same young woman as Image 2, identical face, curly hair in a bun, gold hoop earrings, gold necklace, wearing a soft grey knit sweater, sits on the grey sofa slightly left of center, three-quarter view, looking toward the right side of the frame at an open laptop on the coffee table; her face lit by the cold glow of the laptop from the right; her phone face up on the table next to the mug; a few printed pages on the table, blank and unreadable. Tired but dignified. Desaturated, lifted blacks, subtle 35mm film grain. Her eyes at 40% of the frame height from the top. No text, no logos, no readable screen.
```
**Vérifier K04 avec `references/grille_capcut.png`** : yeux à 40 % de la hauteur, Nadia sur l'axe vert (43 %).
**Réglages :** départ **K04** · Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Restrained, natural acting. Keep her face, hair, earrings, necklace, clothes, the room, the colors and the lighting identical to the reference frame. Keep her inside the central area of the frame. No text, no logos, no readable screen content.

Scene: night, the small Parisian studio apartment, cold green fluorescent light, rain on the window. The young woman sits on the sofa in front of her laptop, tired.

Action, second by second: 0 to 1 s, she looks at the laptop screen, still. At 1 s her phone vibrates on the wooden coffee table and its screen lights up. 1.5 to 3 s, she glances at it for a moment; her shoulders drop very slightly; without reading it, she slowly turns the phone face down on the table. 3 to 8 s, she looks back toward the right side of the frame and stays still, eyes tired, a slow breath out. No smile, no tears: restrained.

Camera: a very slow, barely perceptible push-in. Eye-level, steady.

Light and grade: cold sickly green-cyan, desaturated, lifted blacks, the laptop glow on her face from the right, subtle 35mm film grain.

End frame: she looks toward the right side of the frame, still.

Audio: rain on the window, a phone vibrating on a wooden table, a quiet exhale. No music, no speech.
```
**On garde :** 5 s (de 0 à 5 s) · **Synchro :** la vibration (1 s) tombe sur « sans réponse ».
**État final :** elle regarde **vers la droite**, immobile (raccord regard avec Julien).
**Vérifier :** visage identique à la fiche, créoles et collier, téléphone bien retourné, aucun texte lisible.
**CapCut :** recadrage 1.37. **Le son de la vibration déborde de 1 s sur P05a.**

---

## P05a · 0:17–0:20 · L'hôtel à l'aube
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

## P05b · 0:20–0:25 · On traverse sa fenêtre · Julien met un CV de côté
🎙️ *« …as-tu enfin trouvé la perle rare ? »*
**But :** le miroir de P02 : on traverse sa vitre comme on a traversé celle de Nadia. Il cherche, et le papier ne lui dit rien.

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

## P06 · 0:25–0:31 · Ce que coûte une mauvaise embauche · 3 plans de 2 s
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

## P07 · 0:31–0:35 · Le CV de Nadia sur la pile des refus
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

## P08 · 0:35–0:41 · Le problème · ✏️ codé par moi
🎙️ **V5** *« Le problème n'est pas le nombre de CV. C'est ce qu'on est capable d'observer. »*
Texte animé sur noir, 0 crédit. Je te le livre en MP4.

---

## P09 · 0:41–0:45 · La fin de la scène chez elle : le téléphone s'illumine
🎙️ *(silence, un « clic »)* → enchaîne sur **V6** « Voici JobResolute. » (début de l'acte II)
**But :** le même téléphone qu'elle avait retourné dans P04. Cette fois il s'allume par en dessous, en **ambre** : la première touche de chaud dans son monde vert. Elle le retourne, elle regarde, et on entre dans l'écran.

**Image de départ K09** · joindre **Studio** en `[SETTING] keep room identical`, **Fiche Nadia** en `[CHARACTER]` et **K04** en `[REFERENCE] same framing and outfit`
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

**Image de départ K10** · joindre **K05c** en `[SETTING] keep office identical` et **Fiche Julien** en `[CHARACTER]`
```
Cinematic film still, 16:9, 35mm lens. Daytime, the same symmetrical walnut-paneled hotel HR office as Image 1, warm amber light. Close shot framed on an open laptop on the black lacquered desk, its screen glowing ivory, content blank and unreadable, filling most of the frame and perfectly centered. Behind it, slightly out of focus, Julien, the same man as Image 2, seated, thin steel glasses, charcoal three-piece suit. Warm amber grade, subtle 35mm film grain. No text, no logos.
```
**Image d'arrivée K10b** · mêmes références
```
Cinematic film still, 16:9, perfectly symmetrical medium wide shot of the same walnut-paneled HR office as Image 1, daytime, warm amber light. Julien, the same man as Image 2, standing behind his desk, jacket buttoned, the laptop half-closed in front of him, looking toward the office door on the left with a calm, decided expression. His head in the middle band of the frame. Warm amber grade, subtle 35mm film grain. No text, no logos.
```
**Réglages :** départ **K10** · arrivée **K10b** · Quality · 8 s
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Restrained, natural acting. Keep his face, glasses, suit, the office, the colors and the lighting identical to the reference frames. Perfectly symmetrical. No text, no logos, no readable screen content.

Scene: daytime, a symmetrical walnut-paneled hotel HR office, warm amber light, a black lacquered desk with an open laptop glowing ivory.

Camera and action, second by second: 0 to 3 s, the camera pulls back slowly and smoothly from the glowing laptop screen, revealing the office and the man behind it. 3 to 4.5 s, he gently half-closes the laptop. 4.5 to 6.5 s, he stands up and buttons his jacket. 6.5 to 8 s, he looks toward the office door on the left, calm and decided. The camera ends perfectly centered and still.

Light and grade: warm amber and honey, soft daylight through the tall window, rich shadows, subtle 35mm film grain.

End frame: he stands still behind the desk, looking toward the door on the left.

Audio: a laptop lid closing softly, a chair sliding back on a wooden floor, fabric rustle, quiet room tone. No music, no speech.
```
**On garde :** 4 s (les 8 s en ×2, ou de 2,5 à 6,5 s) · **Raccord :** M12 finit sur l'écran de l'ordinateur, P10 commence dessus.

---

## P11 · 0:04–0:10 · La rencontre
🎙️ **V17** *« La décision finale sera la tienne, Julien. »* (commence vers 1,5 s)
**But :** leur premier plan ensemble. Nadia porte **le tailleur qui attendait sur sa porte**, et elle entre **dans l'ambre** : son vert a disparu.

**Image de départ K11** · joindre **Fiche Nadia**, **Fiche Julien**, **K03** en `[REFERENCE] same navy suit and heels` et **Style hôtel** en `[STYLE]`
```
Cinematic film still, 16:9, perfectly symmetrical one-point perspective. Daytime, a grand old-world palace hotel lobby: black and white checkerboard marble floor, dark walnut paneling, pleated amber lampshades, brass revolving door at the exact center of the background, deep burgundy armchairs. Nadia, the same young woman as Image 1, identical face, curly bun, gold hoop earrings, wearing the navy blue suit and black heels from Image 3, has just stepped through the revolving door, calm and confident, warm light on her face. Julien, the same man as Image 2, walks toward her from the right side. Both heads in the middle band of the frame. Warm amber grade, rich shadows, subtle 35mm film grain. No text, no logos, no signage.
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

## P12 · 0:10–0:19 · La maison de poupée
🎙️ **V18** *« Et toi, Nadia, quelle que soit la décision, on reste à tes côtés. »*
**But :** la bonne combinaison : tout s'enchaîne, la caméra ne s'arrête jamais. Nadia est **en uniforme** : la fin de l'arc du vêtement (le tailleur qui attend → le tailleur porté → l'uniforme).

**D'abord, la fiche « Nadia en uniforme »** · joindre **Fiche Nadia**
```
Character sheet, front view and three-quarter view side by side, plain warm neutral background, soft even light. The same young woman as Image 1, identical face, curly hair in a low bun, gold hoop earrings and gold necklace, wearing a fitted black hotel dining-room service uniform with a discreet brass pin and a white shirt collar. Photorealistic, 35mm film grain. No text, no logos.
```
**Image de départ K12** · joindre **Fiche Nadia en uniforme**, **Fiche Julien** et **Style hôtel** en `[STYLE]`
```
Cinematic film still, 16:9, wide frontal cross-section view of a grand old-world palace hotel like a dollhouse, several rooms side by side seen through open doorways in the dividing walls, all in warm amber light, perfectly level camera: on the left the lobby with its checkerboard floor and brass revolving door, in the center the dining room with white tablecloths and brass sconces, on the right a service corridor. In the dining room, Nadia, the same young woman as Image 1 in her black service uniform with a brass pin, serves a table calmly and gracefully; her colleagues in matching uniforms move in sync around her. In the lobby doorway, Julien, the same man as Image 2, watches. All heads in the middle band of the frame. Warm amber grade, Wes Anderson symmetry, subtle 35mm film grain. No text, no logos.
```
**Réglages :** départ **K12** · Quality · 8 s, puis **« Extend »** dans Flow pour prolonger le travelling (≈ +7 s)
**Prompt vidéo :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera on a dolly, precise and deliberate movement, never handheld. Restrained, natural acting. Keep both faces, her black service uniform with the brass pin, his three-piece suit and glasses, the hotel, the colors and the lighting identical to the reference frame. Keep all heads in the middle band of the frame. No text, no logos.

Scene: a wide cross-section of a grand palace hotel like a dollhouse, rooms side by side seen through open doorways, all in warm amber light.

Camera: one slow, continuous, perfectly level lateral tracking shot from left to right, passing room after room through the doorways. The camera never stops and never changes speed.

Action, second by second: 0 to 2 s, in the lobby doorway, the man in the three-piece suit gives a quiet, approving nod. 2 to 6 s, in the dining room, the young woman in the black service uniform serves a table calmly and gracefully; a guest thanks her with a smile; her colleagues move in sync around her, like a well-rehearsed choreography. 6 to 8 s, the camera continues toward the service corridor where a colleague hands her a tray with a friendly look.

Light and grade: warm amber and honey everywhere, rich shadows, subtle 35mm film grain, Wes Anderson symmetry.

Audio: soft cutlery, a quiet laugh, glasses clinking gently, warm room tone. No music, no speech.
```
**Prompt pour « Extend »** (à la suite du clip) :
```
The camera keeps tracking slowly from left to right at the same speed, without stopping: past the service corridor into the next room, a small staff room where the team shares a short, warm moment; the young woman in the black uniform is among them, at ease, smiling. Same warm amber light, same faces, same uniforms. No text, no logos. Audio: soft murmurs without words, warm room tone. No music, no speech.
```
**On garde :** 9 s (clip + extension) · **Synchro :** on arrive sur Nadia au moment de « on reste à tes côtés ».
**Vérifier :** visage de Nadia identique, la caméra ne s'arrête jamais, aucun saut au raccord de l'extension.

---

## Ordre de production
1. Recadrages ✅ (`studio_nadia_16x9.jpg`, `fenetre_nadia.jpg`, dans le dépôt)
2. **K04 + K05a + K05b + K05c** → grille → **envoie-les-moi**
3. **P04 + P05a + P05b** → **envoie-les-moi** (test du miroir)
4. **K01 + K01b → P01**, **P01b**, **P02**, **K03 → P03** (l'ouverture complète)
5. **P06a/b/c**, **K07 → P07**
6. **K09 + K09b → P09** → envoie-moi la dernière image
7. **K10 + K10b → P10** · **K11 + K11b → P11**
8. Fiche Nadia en uniforme → **K12 → P12** + Extend

## Montage CapCut (rappel)
- Pose **la voix off d'abord** et cale les plans dessus (les synchros sont données plan par plan).
- **Acte I en 1.37:1, acte III en 2.39:1** (masques).
- Pour P01 → P03 et P05a → P05b : **extrais l'audio avant d'accélérer**, et garde l'ambiance à vitesse normale.
- Ambiance de Veo **sous** la voix off (≈ −18 dB). Musique : pizzicato et célesta.
- Vert chez Nadia, ambre chez Julien, et **Nadia dans l'ambre à partir de P11**.
- L'acte I dure maintenant **45 s** : l'acte II commence à **0:45**.
