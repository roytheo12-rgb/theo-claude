# JobResolute — VSL « Deux vies, une rencontre » · Plan de production final

Durée : **≈ 1:58** · Langue : français · Voix off : Henry (ou ElevenLabs en secours)
Version 1 : DRH / programme pilote. Version 2 : BA (même film, fin différente).

> **Mise à jour V3.1** : le compte-rendu arrive **au même instant** chez le candidat et chez le recruteur. Plus de « en premier » nulle part (la démo le dit encore : à corriger).
>
> **Mises à jour V3 (elles priment sur tout le reste)**
> - **Une seule vidéo pour tous les publics** : entreprises clientes (y compris les partenaires qui investiraient) et business angels. **Une fin unique (M15)** : « Nous ne digitalisons pas le recrutement. Nous changeons ce que l'on mesure. », le logo, puis **deux boutons côte à côte** : « Établissements et groupes · Rejoindre le programme pilote fondateur » et « Investisseurs · Découvrir l'opportunité ». Les versions DRH et BA séparées sont supprimées.
> - **Présentation produit (acte II) sans prénoms** : on parle du produit au niveau de l'entreprise, façon VSL. « Vous » pour l'établissement, « le candidat » ou « la personne » pour les candidats. Nadia et Julien restent les personnages des actes I et III.
> - **Des écrans vivants** : après leur entrée, ils continuent de pivoter et de flotter doucement, le texte s'écrit (M03a), le pipeline défile (M05), les barres se remplissent (M08).
> - **Voix off de l'acte II réécrite** (section 2) : V7, V8a, V8, V9, V10, V12, V14, V18c.

> **Mises à jour V2 : acte II complété, acte IV construit (elles priment sur le reste du document)**
> - **Acte II, nouveaux plans :**
>   - **M03a**, Julien publie son offre : « Rien à installer. Personne à former. »
>   - **M10b**, Hidden Gems, avec un badge « Bientôt » visible.
> - **Acte II, plans corrigés :**
>   - **M03** : l'offre affiche salaire net, formation, évolution et contraintes à confirmer.
>   - **M04** : la situation « 20h15 » est présentée comme un *exemple illustratif*, à côté des **cinq dimensions évaluées**. On ne montre ni le nombre ni la forme des épreuves (non arrêtés).
>   - **M08** : boutons « Valider » et « Signaler une inexactitude ».
>   - **M09** : **chacun se prépare**. Nadia reçoit « Vos 3 questions pour l'entretien » (ce sont ses questions, comme dans la démo), Julien reçoit sa fiche « Observé / À approfondir ».
>   - **M10** : les non-retenus repartent vers « Autres offres compatibles ».
>   - **M11** : le parcours commence par « Offre publiée » et se termine par « Suivi J+7 · J+30 · J+90 » (« Et bien après »).
> - **Acte IV :**
>   - **M13** : 5 400 € (coût moyen d'un départ en période d'essai, Cornell 2025), puis 44 % (BMO 2026), puis 8 étapes · AI Act/RGPD · BIC Innov'Up, puis « Fondé par des professionnels de l'hôtellerie de luxe ».
>   - **M14** : la vision, avec les 8 moteurs (tous « Bientôt ») et « Le système nerveux RH de l'hospitalité ».
>   - **M15D** (fin DRH) / **M15B** (fin BA).
>   - **Aucun prix, aucune feuille de route datée.**
> - **Transitions :** assemblage avec `tools/build.py`. Fondus enchaînés, glissés doux Julien ↔ Nadia, raccords invisibles (même téléphone, même cercle), coupes franches sur les cartons. Aucun plan n'est raccourci.
> - **Voix off : 3 lignes ajoutées** (section 2 ci-dessous : V8a, V15b, V18b).

> **Mises à jour depuis la version initiale (elles priment sur le reste du document)**
> - **Voix off : ElevenLabs** (Henry n'enregistre pas). Voix française masculine, 55-65 ans, posée ; modèle Multilingual ; une génération par ligne (V01 à V19). Offre payante (Starter) avant toute diffusion à un DRH ou un BA.
> - **Budget Seedance : 500 crédits CapCut.** Seedance 2.0 en 720p, **4 plans seulement** : P04, P05, P09, P11 (≈ 20 s, ≈ 300 crédits, le reste pour les essais ratés).
> - **Deviennent des images fixes animées dans CapCut (0 crédit) :** P02, P03, P06, P07, P10, P12. P12 = travelling latéral sur une image panoramique.
> - **P02 est fait** à partir de `references/personnages/studio_nadia.jpg` : étalonnage vert, format 1.37, travelling latéral du tailleur vers la fenêtre (voir `references/P02_etalonnage_avant_apres.png`).
> - **Le vêtement sur la porte est un tailleur bleu et des escarpins**, pas un uniforme : on lit « sa tenue d'entretien, prête, qui attend ». On le garde. **P03 = insert sur le tailleur**, recadré dans la même image. L'arc devient : du tailleur d'entretien à l'uniforme de l'hôtel (acte III).
> - **K04** se génère avec la pièce en référence `[SETTING]` : Nadia sur le canapé, à gauche, qui regarde vers la droite (lumière froide venant de la fenêtre et de l'ordinateur).
> - Fiches personnages validées : `references/personnages/`. Garder le collier doré de Nadia dans tous les plans.

---

## 0. Les décisions verrouillées (on n'y revient plus)

| Sujet | Décision |
|---|---|
| Histoire | Nadia (candidate) et Julien (recruteur) : deux vies séparées, reliées par JobResolute, réunies par la rencontre |
| Structure | **Séparés** (acte I) → **Reliés** (acte II, produit) → **Réunis** (acte III) → preuves et appel à l'action (acte IV) |
| Ordre de l'acte I | **Nadia d'abord**, puis Julien |
| Écran scindé | **Non.** Montage alterné en miroir : Nadia cadrée à gauche, elle regarde à droite ; Julien cadré à droite, il regarde à gauche. Premier plan commun = la rencontre. |
| Seule exception | Acte II : téléphone de Nadia et écran de Julien **côte à côte dans le même décor** (deux appareils, pas une image coupée) |
| Format de l'image | Acte I **1.37:1** → Acte II **16:9** → Acte III **2.39:1** |
| Couleur | Nadia = **vert froid** (précaire mais digne) · Hôtel = **ambre**. Acte III : Nadia entre dans l'ambre. |
| Chapitres produit | **OBSERVER · ASSOCIER · DÉCIDER**, poids égal. Aucune fonctionnalité au-dessus des autres. |
| Carte de Cohésion | Un plan parmi d'autres, dans ASSOCIER. Aucun chiffre. |
| Le « waouh » produit | Pas une fonctionnalité : **le parcours complet**. « Pas un outil de plus. Tout le parcours. » |
| Typographie | **Inter Display** (pas SF Pro, pour des raisons de licence) · graisse 600 · interlettrage −2 % |
| Palette | Noyer `#1c130d` · Ambre `#e0a050` · Bordeaux `#5e1a24` · Laiton `#b89560` · Ivoire `#f4efe6` · Argent `#c9ccd1` · Damier noir et blanc |
| Écrans produit | Accent **bordeaux** à la place de l'indigo de la démo |
| Style | Cadrage Grand Budapest (symétrie, plongées sur les objets, panoramiques fouettés) × retenue Apple (mains, faible profondeur de champ, silences) |
| Garde-fous | Pas de « IA », pas de « turnover », pas de chiffre inventé, pas de faux clients · « sans biais » devient « sans a priori » · « certitudes » devient « en connaissance de cause » · on ne dit ni « profiler » ni « profilage » |

---

## 1. Le film, plan par plan

Sources : **S** = Seedance (à partir d'une image clé Nano Banana) · **C** = codé par Claude · **I** = image fixe animée dans CapCut (zoom lent, 0 crédit)

### ACTE I — SÉPARÉS (0:00–0:41) · 1.37:1

| # | Temps | Image | Src | Voix off | Son |
|---|---|---|---|---|---|
| P01 | 0:00–0:04 | Noir | — | **V1** « Dis-moi, Nadia… combien de candidatures as-tu envoyées ces trois derniers mois ? » | Pluie qui monte |
| P02 | 0:04–0:09 | **Plan large du studio de Nadia**, symétrique : fenêtre au centre, pluie, Nadia à sa petite table. Vert froid. Travelling avant lent. | S | *(suite de V1)* | Pluie, néon qui grésille |
| P03 | 0:09–0:11 | **Insert : l'uniforme repassé** sur la porte, le pin en laiton accroche la lumière | I | — | — |
| P04 | 0:11–0:16 | **Nadia en plan taille**, à gauche, elle regarde à droite. Le téléphone vibre, elle le retourne sans le lire. | S | **V2** « Et combien sont restées sans réponse ? » | Vibration |
| P05 | 0:16–0:21 | **Julien en plan taille**, à droite, il regarde à gauche. Il repose un CV sur la pile. Ambre. | S | **V3** « Et toi, Julien… as-tu enfin trouvé la perle rare ? » | **La vibration de P04 continue 1 s** |
| P06 | 0:21–0:27 | **Traversée de l'hôtel**, 3 flashs de 2 s reliés par des panoramiques fouettés : réception tendue · rush en salle · casier vide | I ou S | — | Sons d'ambiance seuls, la musique coupe à chaque flash |
| P07 | 0:27–0:31 | **Insert en plongée** : le CV de Nadia, avec sa photo dans *son* vert, glisse sur la pile des refus | S | **V4** « Ce serait dommage de passer à côté d'une belle rencontre… » | Papier qui glisse |
| P08 | 0:31–0:37 | Noir, texte mot à mot : *Le problème n'est pas le nombre de CV.* | C | **V5** « Le problème n'est pas le nombre de CV. C'est ce qu'on est capable d'**observer**. » | Silence |
| P09 | 0:37–0:41 | **Retour chez Nadia.** Son téléphone s'illumine sur la table (écran illisible). Elle le prend. **La caméra avance dans l'écran.** | S | — | Un seul « clic » |

### ACTE II — RELIÉS (0:41–1:26) · 16:9 · entièrement codé

| # | Temps | Image | Voix off |
|---|---|---|---|
| M01 | 0:41–0:45 | **Entrée dans l'écran** : l'écran du téléphone remplit l'image, **le cadre s'élargit de 1.37 à 16:9**, le logo apparaît dans des cercles concentriques | **V6** « Voici JobResolute. » |
| M02 | 0:45–0:51 | **Les 4 promesses d'Henry en miroir typographique** : les lignes de Nadia alignées à gauche, celles de Julien à droite (le principe du miroir, dans le texte) | **V7** « Nadia : démontrer, sans contrainte. Julien : évaluer, sans a priori. Nadia : comprendre son résultat. Julien : décider, en connaissance de cause. » |
| — | 0:51–0:52 | **Carton I · OBSERVER** (bordeaux, bordure laiton) | *(note de musique)* |
| M03 | 0:52–0:55 | Téléphone en 3D, le curseur clique sur « Je suis intéressée » | **V8** « Un clic, Nadia. Pas de **CV**. » |
| M04 | 0:55–0:59 | Cartes de situation empilées : « 20h15, table 8… », une réponse, ✓ « Observation enregistrée » | **V9** « Ton seul boulot : **vivre** l'expérience. » |
| M05 | 0:59–1:03 | Écran de Julien en 3D : les noms et visages se floutent, badge « Identité masquée » | **V10** « Julien voit ce qu'elle **fait**. Pas qui elle est. » |
| — | 1:03–1:04 | **Carton II · ASSOCIER** | — |
| M06 | 1:04–1:08 | Profil : Fit 74, 5 barres, « Observé / Reste incertain » | **V11** « Un résultat qui s'**explique**. » |
| M07 | 1:08–1:11 | **Carte de Cohésion** : l'équipe apparaît, le point de Nadia vient se placer. Aucun chiffre. | **V12** « Et sa place dans ton **équipe**. » |
| — | 1:11–1:12 | **Carton III · DÉCIDER** | — |
| M08 | 1:12–1:15 | **Deux appareils, même décor** : le compte-rendu arrive sur le téléphone de Nadia (badge « 1 ») puis sur l'écran de Julien | **V13** « Le même résultat, des deux côtés. » |
| M09 | 1:15–1:18 | La **fiche d'entretien** sort de l'écran, avec les 3 questions | **V14** « Une rencontre qu'on **prépare** ensemble. » |
| M10 | 1:18–1:21 | **L'entonnoir inversé** : un cercle d'avatars, chacun reçoit sa réponse, les non-retenus repartent vers d'autres offres | **V15** « Et personne ne reste sans **réponse**. » |
| M11 | 1:21–1:24 | **La ligne courbe dézoome** : tout le parcours apparaît, du clic à la décision, les 3 chapitres alignés | **V16** « Pas un outil de plus. **Tout le parcours.** » |
| M12 | 1:24–1:26 | **Sortie d'écran** : on recule hors de l'ordinateur de Julien → acte III | — |

### ACTE III — RÉUNIS (1:26–1:45) · 2.39:1

| # | Temps | Image | Src | Voix off |
|---|---|---|---|---|
| P10 | 1:26–1:30 | Suite de la sortie d'écran : on est dans le bureau de Julien. Il se lève et regarde vers la porte. Ambre. | S | — |
| P11 | 1:30–1:36 | **Le lobby.** Nadia passe la porte tournante, **elle entre dans l'ambre** (plus de vert). Julien vient à sa rencontre, poignée de main. **Premier plan où ils sont ensemble.** | S | **V17** « La décision finale sera la tienne, Julien. » |
| P12 | 1:36–1:45 | **Travelling latéral « maison de poupée »** : on longe l'hôtel pièce par pièce. Nadia en uniforme au service, l'équipe en phase. La caméra ne s'arrête jamais. | S | **V18** « Et toi, Nadia, quelle que soit la décision, on reste à tes côtés. » |

### ACTE IV — PREUVES ET APPEL À L'ACTION (1:45–1:58) · 16:9 · codé

| # | Temps | Image | Voix off |
|---|---|---|---|
| M13 | 1:45–1:51 | Compteur **44 %** des recrutements CHR jugés difficiles (France Travail, BMO 2026) → *Protocole de validation en 8 étapes* → *Conçu pour l'AI Act et le RGPD* → *Incubé chez BIC Innov'Up* | — |
| M14 | 1:51–1:58 | Logo, **« Être, et faire. »**, bouton cliqué par le curseur | **V19** « JobResolute. La technologie au service de l'humain. » |

**Fin DRH :** « Programme pilote fondateur : vérifiez l'éligibilité de votre établissement. »
**Fin BA :** + « Nous ne digitalisons pas le recrutement. Nous changeons ce que l'on mesure. » puis « Découvrir l'opportunité ». Environ 10 s de plus.

---

## 2. Le texte de la voix off (à envoyer à Henry)

Environ 170 mots. Le ton : posé, chaleureux, un mentor qui parle à deux personnes qu'il connaît. Laisser des silences.

```
V1  Dis-moi, Nadia… combien de candidatures as-tu envoyées ces trois derniers mois ?
V2  Et combien sont restées sans réponse ?
V3  Et toi, Julien… as-tu enfin trouvé la perle rare ?
V4  Ce serait dommage de passer à côté d'une belle rencontre…
V5  Le problème n'est pas le nombre de CV. C'est ce qu'on est capable d'observer.
V6  Voici JobResolute.
V7  Pour le candidat : démontrer, sans contrainte. Pour le recruteur : évaluer, sans a priori.
    Pour le candidat : comprendre son résultat. Pour le recruteur : décider, en connaissance de cause.
V8a Vous décrivez le poste. Rien à installer, personne à former.
V8  Le candidat postule en un clic. Sans CV.
V9  Puis il démontre ce qu'il sait faire, sur les cinq dimensions du poste.
V10 Vous voyez ce que la personne fait. Pas qui elle est.
V11 Un résultat qui s'explique.
V12 Et sa place dans votre équipe.
V13 Le même résultat, des deux côtés, au même instant.
V14 Chacun prépare la rencontre.
V15 Et personne ne reste sans réponse.
V15b Et demain, les talents que le CV aurait écartés refont surface.
V16 Pas un outil de plus. Tout le parcours.
V17 La décision finale sera la tienne, Julien.
V18 Et toi, Nadia, quelle que soit la décision, on reste à tes côtés.
V18b Notre ambition : devenir le système nerveux RH de l'hospitalité.     (M14)
V18c Nous ne digitalisons pas le recrutement. Nous changeons ce que l'on mesure.   (M15, fin unique)
V19 JobResolute. La technologie au service de l'humain.
```

**Enregistrement :** un fichier par ligne, dans une pièce avec des rideaux ou des coussins, téléphone à 20 cm. Faire 2 prises par ligne.

---

## 3. Les transitions

| Entre | Transition | Technique |
|---|---|---|
| P04 → P05 | **Coupe sur le regard** (Nadia regarde à droite, Julien à gauche) + la vibration continue 1 s | Grille de cadrage · son décalé dans CapCut |
| Flashs de P06 | **Panoramiques fouettés** | Flou de mouvement + glissé rapide dans CapCut, coupe au milieu du flou |
| P07 → P08 | Coupe au noir | — |
| P09 → M01 | **Entrée dans l'écran** du téléphone + le cadre s'élargit | Tu m'envoies la dernière image de P09 ; l'animation démarre avec un rectangle exactement à la place de l'écran |
| Chapitres | **Cartons** avec coupe franche sur un temps de musique | Codés |
| M12 → P10 | **Sortie d'écran** de l'ordinateur de Julien, le cadre passe en 2.39 | La première image de P10 doit être cadrée sur son écran ; je termine l'animation dessus |
| P11 | Premier plan commun | — |
| P12 → M13 | Fondu au noyer | — |

---

## 4. Les images clés (Nano Banana), dans l'ordre de production

**À faire d'abord : les fiches personnages**
```
Character sheet, front and three-quarter view, plain neutral background, soft light.
NADIA: woman late 20s, dark curly hair in a low bun, small gold hoop earrings, tired but determined expression, grey oversized sweater.
JULIEN: man early 40s, short dark brown hair greying at temples, thin steel glasses, charcoal three-piece suit, white shirt, dark tie.
```
Pour la fin du film, fais aussi une fiche **NADIA EN UNIFORME** (black fitted hotel service uniform, brass pin), même visage.

**Préfixe « chez Nadia »** (P02, P03, P04, P09) :
```
Cinematic film still, 16:9, 35mm lens, eye-level. Small Parisian studio apartment at night. Cold sickly green-cyan color grade, desaturated, lifted blacks, flickering fluorescent tube, damp stained wall, radiator with laundry drying, rain on the window. Precarious but dignified. 35mm film grain. Keep all important elements inside the central area. No text, no logos, no readable screen content.
```

**Préfixe « hôtel »** (P05, P06, P07, P10, P11, P12) :
```
Cinematic film still, 16:9, symmetrical centered composition, one-point perspective. Grand old-world European palace hotel. Dark walnut paneling, black and white checkerboard marble floor, warm amber light from pleated lampshades and brass sconces, deep burgundy and brass accents, crisp white linen. Warm amber grade, rich shadows, subtle 35mm film grain. Keep all important elements inside the central area. No text, no logos, no readable signage.
```

| Clé | Plan | Description (à ajouter après le préfixe) |
|---|---|---|
| K02 | P02 | Wide symmetrical shot: window centered with rain, Nadia [CHARACTER] small in frame at a tiny table, laptop glow. |
| K03 | P03 | Close insert: black service uniform carefully ironed on a hanger on the door, small brass pin catching lamp light, shallow depth of field. |
| K04 | P04 | Medium waist-up, Nadia slightly left of center, three-quarter, looking toward the right side of the frame at her laptop; face lit by cold laptop glow from the right; phone face up on the table; printed CVs, mug. |
| K05 | P05 | Medium waist-up, mirror of K04: 1930s HR office, Julien [CHARACTER] slightly right of center, three-quarter, looking toward the left; pleated amber lamp on the left lighting his face; tall stack of blank printed CVs. |
| K06a/b/c | P06 | a) reception: a young receptionist seen from behind frozen over a screen, a guest waiting · b) dining room in full rush, a waiter seen from behind holding the wrong plate, the maître d' looking away · c) staff corridor, one open empty locker, a blank brass badge on the shelf. |
| K07 | P07 | Top-down insert on a walnut desk: a printed CV with a small green-toned portrait photo of Nadia sliding onto a pile of other CVs; a man's hand; amber light. Text blank and unreadable. |
| K09 | P09 | Same framing as K04: the phone on the table lights up with a warm glow (screen unreadable), Nadia reaching for it, a first hint of warmth on her face. |
| K10 | P10 | Julien in his office, framed from behind his laptop screen, then standing and looking toward the door; amber. Screen content blank. |
| K11 | P11 | Symmetrical lobby, revolving door centered: Nadia [NADIA SHEET] walking in, warm amber light now on her, Julien stepping forward to greet her; handshake at the exact center. |
| K12 | P12 | Cross-section view of the hotel like a dollhouse: several rooms side by side through doorways, Nadia [NADIA IN UNIFORM] serving calmly in the dining room, colleagues in sync. |

**Vérification avant Seedance :** pose `grille_capcut.png` sur K04 et K05. Les yeux doivent être à 40 % de la hauteur, Nadia à 43 % de la largeur, Julien à 57 %.

---

## 5. Seedance (image vers vidéo)

**À coller en tête de chaque prompt :**
```
Cinematic, stabilized camera, precise and deliberate, never handheld. Restrained realistic acting. Keep face, outfit, palette and lighting identical to the image. No text, no logos, no dialogue, no music.
```

| Plan | Durée | Prompt |
|---|---|---|
| P02 | 5 s | Very slow straight push-in toward Nadia at her table. Rain streams down the window. The fluorescent tube flickers once. END STATE: still. |
| P04 | 5 s | Slow push-in. At 2s the phone vibrates; she looks at it, then slowly turns it face down without reading it and exhales. END STATE: she looks back toward the right of the frame, still. |
| P05 | 5 s | Slow push-in. Julien lifts a CV from the pile, glances at it one second, sets it down. END STATE: he raises his eyes toward the left of the frame, still, tired. |
| P06 ×3 | 2-3 s | *(ou images fixes avec zoom dans CapCut pour économiser)* Each ends with a fast whip pan to the right. |
| P07 | 4 s | Static top-down. The hand slides the CV with the small portrait onto the pile and lets go. The paper settles. |
| P09 | 4 s | The phone lights up warmly; Nadia picks it up and looks at the screen. Slow push-in toward the phone screen until it fills most of the frame. END STATE: screen centered, large. |
| P10 | 4 s | Starts framed on the laptop screen; slow pull-back revealing Julien, who stands up and looks toward the door. |
| P11 | 6 s | Nadia enters through the revolving door into warm amber light; Julien steps forward; they shake hands at the exact center of the frame. END STATE: symmetrical two-shot. |
| P12 | 9 s | Slow continuous lateral tracking shot along a cross-section of the hotel; rooms pass by; Nadia serves calmly; the team moves in sync. The camera never stops. |

**Budget :** environ 45 à 55 s de génération au total. Avec 2 essais par plan, compte **≈ 100 s**. Génère en 720p, upscale dans CapCut.
**Ordre :** d'abord **P04 + P05 seuls** (le test du miroir). Si le raccord tient, lance le reste.

---

## 6. Ce que je code et livre (0 crédit)

- **P08** : texte animé sur noir.
- **Acte II complet** (M01 à M12) : logo, promesses en miroir typographique, 3 cartons, écrans 3D, Carte de Cohésion, les deux appareils, fiche d'entretien, entonnoir inversé, dézoom du parcours, entrée et sortie d'écran.
- **Acte IV** (M13, M14) : preuves, logo, « Être, et faire. », 2 versions de l'appel à l'action (DRH / BA).
- Livraison : **MP4 1080p, 25 im/s**, grain et vignettage intégrés. **Deux fichiers pour l'acte IV** (DRH et BA).
- J'ai besoin de toi : **la dernière image de P09** et **la première image de P10**, pour caler les entrées et sorties d'écran au pixel près.

---

## 7. Montage CapCut (dans cet ordre)

1. Projet 16:9, **25 im/s**.
2. **Pose toute la voix off d'abord** (V1 à V19) : c'est elle qui fait le rythme.
3. Place les plans sur la voix.
4. **Masques de format :** 1.37 sur l'acte I, ouverture animée en 16:9 sur M01, passage en 2.39 sur M12/P10, retour en 16:9 à M13.
5. **Étalonnage :**
   - **chez Nadia** : ombres vert-cyan, saturation −25 %, noirs relevés, grain fort ;
   - **à l'hôtel** : ambre, noirs profonds, grain léger ;
   - **P11** : Nadia dans l'ambre.
6. **Son :**
   - pluie et néon chez Nadia ;
   - la vibration qui déborde sur P05 ;
   - la musique qui coupe sur les flashs de P06 ;
   - pizzicato et célesta, puis piano minimaliste pendant l'acte II ;
   - un « tic » par apparition d'écran ;
   - la musique qui monte jusqu'au logo.
7. Sous-titres automatiques, puis corrigés à la main (beaucoup regarderont sans le son).
8. Exporter **2 versions** : DRH et BA.

---

## 8. Le planning (5 jours)

| Jour | Toi | Henry | Moi |
|---|---|---|---|
| J1 | Fiches personnages + K04 et K05 → tu me les envoies | Valide le texte (section 2) et enregistre la voix off | Je vérifie le miroir sur K04/K05 · je commence l'acte II |
| J2 | Seedance **P04 + P05** (test). Si ok : K02, K03, K06, K07, K09 + Seedance | — | Acte II |
| J3 | K10, K11, K12 + Seedance acte III · tu m'envoies la dernière image de P09 et la première de P10 | — | Entrées/sorties d'écran calées · acte IV · **livraison des MP4** |
| J4 | Montage CapCut complet (section 7) | Écoute la V0 | Je relis la V0 et te fais une liste de corrections |
| J5 | Test sur 5 personnes : *« Qu'est-ce que fait JobResolute ? »* → corrections → export DRH + BA | Validation finale | Corrections de mes séquences si besoin |

**Test du J5 :** si les gens ne répondent pas « on observe la personne en situation réelle, tout le parcours est pris en charge, et l'humain décide », on corrige **le texte**, pas les images.

---

## 9. À aligner dans la démo (pour que le film et la démo racontent la même chose)

- Carte de Cohésion : remplacer « Fonctionnalité signature » par « Une fonctionnalité exclusive ».
- Les 3 étapes de la méthode : **Observer · Associer · Décider**.
- Couleur d'accent : bordeaux au lieu de l'indigo.
- Page d'accueil : « Sans biais. Sans hasard. » devient « Sans a priori. »
