# Actes I et III — tous les plans en vidéo, calés sur la voix off

La voix off (🎙️) est indiquée **pour repère seulement** : elle ne va jamais dans les prompts. Chaque vidéo montre ce que l'on entend au même moment.
Temps relatifs au début de chaque acte. Acte I = 0:00–0:41. Acte III = juste après l'acte II.

## Budget : tout en vidéo dépasse 500 crédits
13 plans × 5 s = 65 s ≈ **975 crédits** (à ~15 crédits/s), et environ **1 250** en comptant les essais ratés.

| Priorité | Plans | Pourquoi | Coût estimé |
|---|---|---|---|
| **1 · Indispensables** | P04, P05, P09, P11 | Les personnages jouent : impossible en image fixe | ≈ 300 |
| **2 · Ambiance** | P01, P02, P07, P10, P12 | Beaucoup plus vivants en vidéo, mais une image fixe animée tient | ≈ 375 |
| **3 · Optionnels** | P03, P06a, P06b, P06c | Plans de 2 s : une image fixe avec zoom suffit largement | ≈ 300 |

**Recommandation avec 500 crédits :** priorité 1 + P02 (≈ 375 crédits), et le reste en images fixes pour la V0. Si la V0 convainc Henry, une recharge permettra de passer les plans de priorité 2 en vidéo pour la V1.
**Ordre de génération :** P04 → P05 (test du miroir) → P09 → P11 → P02 → puis le reste selon les crédits.

## Réglages Seedance (identiques partout)
Image vers vidéo · **Seedance 2.0** · **720p** · **16:9** · **5 s**. Regarde le coût affiché avant chaque génération.

**Préfixe Seedance, à coller au début de chaque prompt :**
```
Cinematic film shot, photorealistic, 35mm lens, stabilized camera, precise and deliberate movement, never handheld. Restrained, natural acting. Keep the face, hair, clothes, setting, colors and lighting identical to the reference image. Keep the main subject inside the central area of the frame. No text, no logos, no subtitles, no music, no dialogue, no readable screen content.
```
**Préfixe Nano Banana « chez Nadia »** (K01, K03, K04, K09) :
```
Cinematic film still, 16:9, 35mm lens. Paris at night. Cold sickly green-cyan color grade, desaturated, lifted blacks, rain. Precarious but dignified. 35mm film grain. Keep all important elements inside the central area. No text, no logos, no readable screen content.
```
**Préfixe Nano Banana « hôtel »** (K05, K06, K07, K10, K11, K12) :
```
Cinematic film still, 16:9, symmetrical centered composition, one-point perspective. Grand old-world European palace hotel. Dark walnut paneling, black and white checkerboard marble floor, warm amber light from pleated lampshades and brass sconces, deep burgundy and brass accents, crisp white linen. Warm amber grade, rich shadows, subtle 35mm film grain. Keep all important elements inside the central area. No text, no logos, no readable signage.
```

---

# ACTE I — SÉPARÉS (format 1.37:1)

## P01 · 0:00–0:04 · Paris, la nuit, une fenêtre allumée · priorité 2
🎙️ *« Dis-moi, Nadia… combien de candidatures as-tu envoyées ces trois derniers mois ? »* (début)
**Image K01 :**
```
Wide exterior shot at night in heavy rain: a narrow Haussmann-style Parisian apartment building seen from the wet street, zinc rooftops, most windows dark. One small window under the roof is lit with a cold green fluorescent light. Wet cobblestones reflecting street lamps. Symmetrical, the lit window near the center.
```
**Prompt Seedance :**
```
Night, heavy rain on a Parisian street. The camera slowly tilts up and pushes in toward the single lit window under the roof, glowing cold green. Raindrops streak through the frame, the street lamps flicker on the wet cobblestones. End: the lit window is centered in the frame, still.
```

## P02 · 0:04–0:09 · Le studio vide · priorité 2
🎙️ *(fin de la phrase : « …ces trois derniers mois ? »)*
**Image de départ :** `references/personnages/studio_nadia.jpg` (déjà générée)
**Prompt Seedance :**
```
Night, small Parisian studio apartment, cold green-tinted light, nobody in the room. The camera glides slowly sideways from left to right, from the navy suit hanging on the door, past the sofa and the coffee table where a laptop screen glows, toward the rain-streaked window. The fluorescent kitchen light flickers once. Rain runs down the glass. End: the window and the wet rooftops outside, still.
```
On voit son monde avant de la voir, elle.

## P03 · 0:09–0:11 · Le tailleur qui attend · priorité 3
🎙️ *(silence, la pluie)*
**Image K03** (joins la pièce en `[SETTING]`) :
```
Same room as Image 1, same green color grade. Close shot of the navy blue suit carefully hung on the door, black heels neatly placed below it on the wooden floor. Shallow depth of field.
```
**Prompt Seedance :**
```
Very slow push-in toward the navy suit hanging on the door and the black heels below it. A faint reflection of rain moves across the fabric. Nothing else moves. End: the suit fills the frame, still.
```
Image fixe possible : zoom lent dans CapCut. On ne garde que 2 s.

## P04 · 0:11–0:16 · Le téléphone retourné · priorité 1
🎙️ *« Et combien sont restées sans réponse ? »* (commence vers 0,5 s)
**Image K04** (joins la pièce en `[SETTING] keep room identical` et la fiche de Nadia en `[CHARACTER]`). Vérifie-la avec la grille :
```
Same room as Image 1, same color grade. Medium shot waist-up, eye-level, 35mm. Nadia [Image 2] sitting on the sofa, slightly left of center, three-quarter, looking toward the right side of the frame at a laptop on the coffee table; her face lit by the cold laptop glow from the right; her phone face up next to the mug; a few printed CVs on the table. Rain on the window.
```
**Prompt Seedance :**
```
Night, small Parisian studio apartment, cold green-tinted light. The camera slowly pushes in, very slightly. The young woman sits on the sofa, looking at her laptop, tired. At 1 second her phone vibrates on the coffee table and its screen lights up. She glances at it for a moment, her shoulders drop slightly, and without reading it she slowly turns it face down. End: she looks back toward the right side of the frame and stays still, eyes tired. Rain runs down the window. The fluorescent kitchen light flickers once.
```
✅ La vibration tombe sur « sans réponse ». Elle finit en regardant **vers la droite**.

## P05 · 0:16–0:21 · Julien écarte un CV · priorité 1
🎙️ *« Et toi, Julien… as-tu enfin trouvé la perle rare ? »* (la vibration de P04 continue 1 s ici, au montage)
**Image K05** (fiche de Julien en `[CHARACTER]`). Vérifie-la avec la grille, avec la **même hauteur des yeux que K04** :
```
Medium shot waist-up, eye-level, 35mm, mirror of the previous shot. Symmetrical 1930s-style hotel HR office at dawn: dark walnut paneling, black lacquered desk with a thin brass edge. Julien [Image 1] seated behind the desk, slightly right of center, three-quarter, looking toward the left side of the frame. Key light: a pleated amber lampshade on the left of the desk. In front of him: a tall stack of printed pages and, to his left, a smaller separate pile. All pages blank and unreadable.
```
**Prompt Seedance :**
```
Early morning, symmetrical 1930s-style hotel HR office, warm amber light from a pleated lampshade on the left. The camera slowly pushes in, very slightly. The man in a charcoal three-piece suit and thin steel glasses takes the top page from the tall stack, reads it for one second, and without conviction places it on the smaller pile to his left. End: he lifts his eyes toward the left side of the frame and stays still, tired, searching. The lamp light stays steady. All pages are blank and unreadable.
```
✅ Il met le CV de côté sur « la perle rare ». Il finit en regardant **vers la gauche**.
**➜ Envoie-moi P04 et P05 avant de continuer** (test du miroir).

## P06 · 0:21–0:27 · Ce que coûte un mauvais recrutement · 3 plans de 2 s · priorité 3
🎙️ *(pas de voix : la musique coupe à chaque plan)*. Les plans sont reliés par des panoramiques fouettés dans CapCut.
**P06a, la réception**
Image : `Reception desk centered: a young receptionist seen from behind, frozen in front of a screen; an elegant guest waiting, fingers tapping the walnut desk impatiently.`
```
Static symmetrical shot. The receptionist, seen from behind, hesitates in front of the screen and does not move forward. The elegant guest taps her fingers on the walnut desk, impatient, and glances at her watch. End: the camera whips fast to the right.
```
**P06b, la salle**
Image : `Dining room in full rush, centered: a waiter seen from behind holding the wrong plate; the maître d' looking away; a guest unimpressed.`
```
Static symmetrical shot of a busy dining room. The waiter, seen from behind, hesitates with a plate in his hand, unsure where to go. The maître d' turns away, tense. A seated guest pushes his plate slightly away. End: the camera whips fast to the right.
```
**P06c, le casier**
Image : `Narrow staff corridor behind the scenes, single warm bulb: one metal locker open and empty, a burgundy uniform on a hanger, a blank brass name badge left on the shelf.`
```
Slow push-in toward the open, empty metal locker. The single bulb above flickers once. The empty uniform on its hanger sways slightly. Nobody in the corridor. End: the blank brass name badge on the shelf, still.
```

## P07 · 0:27–0:31 · Le CV de Nadia sur la pile des refus · priorité 2
🎙️ *« Ce serait dommage de passer à côté d'une belle rencontre… »*
**Image K07** (fiche de Nadia en `[CHARACTER] face only, for the small ID photo`) :
```
Top-down overhead shot on a walnut desk, amber light. A man's hand in a charcoal suit sleeve holds a printed CV just above a small pile of set-aside CVs. In the top corner of the CV, a small ID photo of Nadia [Image 1] in cold green tones. Text on the pages blank and unreadable.
```
**Prompt Seedance :**
```
Static top-down shot on a walnut desk, warm amber light. The man's hand lets go of the printed page; it falls softly and settles on the small pile of set-aside pages. The hand withdraws out of frame. The camera then slowly pushes in toward the small green-toned ID photo in the corner of the page. End: the photo is centered, still.
```
✅ Sa photo verte au milieu de l'ambre de Julien : leur seul lien, un papier.

## P08 · 0:31–0:37 · Le problème · ✏️ Claude
🎙️ *« Le problème n'est pas le nombre de CV. C'est ce qu'on est capable d'observer. »*
Texte animé sur noir : c'est moi qui le code et te le livre en MP4.

## P09 · 0:37–0:41 · Le téléphone s'illumine · priorité 1
🎙️ *(silence, un « clic »)* → on enchaîne sur « Voici JobResolute »
**Image K09** (joins K04 en `[SETTING + CHARACTER] keep everything identical`) :
```
Same image as Image 1, same framing, same green color grade. The phone lying face down on the coffee table glows warmly from underneath. Nadia turns her head toward it. No text, no logos.
```
**Prompt Seedance :**
```
Night, same studio apartment, cold green light. The phone lying face down on the coffee table glows with a warm amber light. The young woman turns it over, picks it up and looks at the screen; a first hint of warm amber light touches her face and she straightens slightly, hopeful. The camera slowly pushes in toward the phone screen until the screen fills most of the frame. End: the phone screen is centered, large and glowing, its content soft and unreadable.
```
✅ C'est le même téléphone que dans P04 : cette fois, elle le retourne pour regarder.
➜ **Envoie-moi la dernière image** (je cale l'entrée dans l'écran de M01 dessus). Garde 4 s.

---

# ACTE III — RÉUNIS (format 2.39:1)

## P10 · 0:00–0:04 · Julien se lève · priorité 2
🎙️ *(silence)* — enchaîne sur M12, où l'on recule hors de son ordinateur
**Image K10** (fiche de Julien) :
```
Symmetrical HR office, warm amber lamp light. Tight shot on an open laptop on the black lacquered desk, the screen glowing ivory, content blank and unreadable; behind it, slightly out of focus, Julien [Image 1] seated, looking at the screen.
```
**Prompt Seedance :**
```
The camera starts tight on the glowing laptop screen and slowly pulls back. Behind it, the man in the charcoal three-piece suit closes the laptop halfway, stands up from his desk and looks toward the office door on the left with a calm, decided expression. Warm amber lamp light. End: he stands still, looking at the door.
```

## P11 · 0:04–0:10 · La rencontre · priorité 1
🎙️ *« La décision finale sera la tienne, Julien. »* (vers 1,5 s ; la poignée de main tombe sur « la tienne »)
**Image K11** (fiches de Nadia et de Julien, image de lobby Pinterest en `[STYLE]`) :
```
Perfectly symmetrical grand hotel lobby in daytime, brass revolving door at the exact center, pleated amber lamps, warm amber light. Nadia [Image 1], wearing the navy blue suit and black heels from her apartment, has just stepped through the revolving door, calm and confident, warm light on her face. Julien [Image 2] walks toward her from the right side.
```
**Prompt Seedance :**
```
Daytime, perfectly symmetrical grand hotel lobby, black and white checkerboard marble floor, dark walnut paneling, brass revolving door at the center, warm amber light. The camera is static, centered and symmetrical. The young woman in a navy suit walks in through the revolving door, calm and confident, into the warm light. The man in the charcoal three-piece suit and glasses walks toward her from the right. At 3 seconds they meet at the exact center of the frame and shake hands with a small, warm smile. End: symmetrical two-shot, both still, holding the handshake.
```
✅ Elle porte **le tailleur qui attendait sur sa porte**, et elle est dans l'ambre. Ralentis le plan à 85 % dans CapCut pour atteindre 6 s.

## P12 · 0:10–0:19 · La maison qui tourne · priorité 2
🎙️ *« Et toi, Nadia, quelle que soit la décision, on reste à tes côtés. »*
D'abord, une **fiche « Nadia en uniforme »** : même visage, uniforme de service noir, pin en laiton.
**Image K12** (fiche Nadia en uniforme + fiche Julien) :
```
Wide cross-section view of the hotel like a dollhouse, several rooms side by side seen through open doorways, all in warm amber light: the lobby on the left, a corridor, the dining room on the right. In the dining room, Nadia [Image 1] in a black service uniform with a brass pin serves a table calmly and gracefully; her colleagues move in sync around her. In the lobby doorway, Julien [Image 2] watches with a quiet nod.
```
**Prompt Seedance :**
```
Slow continuous lateral tracking shot from left to right along the cross-section of the hotel, passing room after room through the open doorways, everyone working in calm harmony. The camera ends on the dining room, where the young woman in the black service uniform serves a table calmly and gracefully while her colleagues move in sync around her. Warm amber light. The camera never stops until the end.
```
Plan de 9 s : génère 10 s si l'option existe, sinon ralentis à 55 % dans CapCut.
