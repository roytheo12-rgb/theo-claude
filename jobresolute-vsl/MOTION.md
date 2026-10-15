# MOTION.md — JobResolute

À lire en entier avant de concevoir, générer ou animer quoi que ce soit pour JobResolute.
Références visuelles : `references/style-frames/` (02 carton, 03 écran produit, 04 texte animé).

Formule : **le cadrage de Grand Budapest × la retenue d'Apple**, dans une palette d'hôtel de luxe.
On ne copie ni l'un ni l'autre : pas de pastel Anderson, pas de bleu Apple, pas de SF Pro.

---

## 1. Couleurs

| Rôle | Hex | Usage |
|---|---|---|
| Fond (V5, demande de Théo) | dégradé radial `#3d111a` → `#16060a` → `#040102` | Fond du motion design (actes II et IV, et P08) : le bordeaux sombre des cartons de chapitre. **Plus de reflets vert d'eau ni ambre, plus de halo ambre.** |
| Bordeaux (accent fort) | `#5e1a24` | Cartons de chapitre, boutons, barres de score, sélection |
| Bordeaux clair | `#7a2533` | Dégradé des barres et du centre des cartons |
| Gris clair (ex-laiton, V5) | `#a9a39b` | Mots mis en valeur sur fond sombre, filets, bordures |
| Blanc (ex-laiton clair, V5) | `#ffffff` | Mot mis en valeur dans les grandes phrases (meilleur contraste) |
| Ivoire (nappe) | `#f4efe6` | Texte sur fond sombre, cartes d'interface |
| Ivoire ombré | `#ebe4d8` | Blocs secondaires dans les cartes |
| Encre | `#1a1411` | Texte sur les cartes ivoire |
| Gris taupe | `#7a6c62` | Texte secondaire dans les cartes |
| Argent | `#c9ccd1` | Détails métalliques, séparateurs fins |
| Vert Nadia (étalonnage) | `#2f5a45` | Uniquement pour étalonner les plans chez Nadia (acte I). Jamais dans l'interface. |
| Vert validation | `#2f6a45` | Uniquement pour le « ✓ Observation enregistrée » |

**L'indigo de la démo (`#4f46e5`) n'apparaît jamais dans le film.**

## 2. Typographie

- **Titres et phrases :** Inter Display (`assets/fonts/`), graisse 600, interlettrage −0,02 à −0,035 em.
- **Interface et petits textes :** Inter, 400 à 600.
- **Petites capitales** (chapitres, étiquettes) : Inter 500-600, 13-20 px, interlettrage 0,18 à 0,5 em, en majuscules.
- **Tailles de référence en 1920×1080 :**
  - carton de chapitre : 210 px ;
  - grande phrase : 110 px ;
  - légende sous un écran : 46 px ;
  - chiffre de score : 128 px ;
  - texte d'interface : 15-26 px.
- **Une seule ligne par phrase** si possible, deux au maximum. Un seul mot mis en valeur par phrase, en blanc pur (V5 : **plus aucun texte doré**, demande de Théo).
- **Interdit :** SF Pro (licence Apple), toute police serif en titre, les majuscules sur une phrase entière.

## 3. Rythme : entrée, tenue, sortie

- **Texte :** apparition mot par mot. Chaque mot passe de l'opacité 0, flou 12 px et +16 px vers le bas, à 1 / 0 / 0, en **0,45 s**, avec **0,08 s** de décalage entre les mots.
- **Tenue minimale :** le temps de lire la phrase deux fois (≈ 0,35 s par mot, 1,2 s minimum).
- **Sortie :** fondu et flou en 0,3 s, tous les mots ensemble. On ne fait jamais sortir un mot à la fois.
- **Écrans et cartes :** entrée en 0,7 s (montée de 40 px, rotation 3D qui se stabilise, opacité). Tenue de 2 à 3 s. Sortie en transition floue (0,25 s) ou par la caméra qui recule.
- **Cartons de chapitre :** coupe franche sur un temps de musique, tenue de 1 à 1,5 s, coupe franche en sortie.
- **Un plan de produit = 3 à 4 s**, et toutes les fonctionnalités ont la même durée. Aucune ne dure plus longtemps que les autres.
- **Chaque apparition tombe sur un temps de la musique.**

## 4. Le mouvement

- **25 images/s** (projet CapCut en 25 im/s), 1920×1080.
- **Courbe d'accélération par défaut :** `cubic-bezier(0.22, 1, 0.36, 1)`, une arrivée douce.
- **Pour les écrans et appareils : des ressorts, pas des interpolations linéaires.** Amortis, **sans rebond visible** à l'arrêt.
- **Caméra virtuelle :** perspective de 2200 px, écrans inclinés de 12 à 22°, travelling lent et continu (2 à 4 % d'échelle par plan). **Rien n'est jamais parfaitement immobile.**
- **Profondeur de champ :** les panneaux du second plan sont floutés (4 à 6 px) et à 50-60 % d'opacité.
- **Symétrie et perspective centrale** pour les compositions en plan large (héritage Grand Budapest).
- **Le mouvement est calculé depuis le début du film**, avec une fonction `window.seek(t)` qui dessine l'image exacte à l'instant t. On ne l'accroche jamais à des minuteurs par scène.

## 5. Texture et finition

- **Grain 35 mm** sur tout ce qui est codé : bruit fractal, opacité 0,10 à 0,14, mode incrustation. Le même grain que sur les plans tournés.
- **Vignettage :** dégradé radial, transparent jusqu'à 45 % puis noir à 55 % d'opacité sur les bords.
- **Halo ambre** derrière les écrans : dégradé radial de 30 % au centre à 0 à 70 %.
- **Ombres des cartes :** longues et douces (`0 60px 120px rgba(0,0,0,.55)`), angles arrondis de 26 px pour les cartes et 52 px pour les téléphones.
- **Formats d'image :** acte I en 1.37:1, acte II en 16:9, acte III en 2.39:1, acte IV en 16:9.

## 6. Cinq interdits

1. **Jamais d'indigo, de bleu Apple ou de dégradé néon.** La palette ci-dessus, rien d'autre.
2. **Jamais une fonctionnalité mise en avant plus que les autres.** Même durée, même taille, même traitement. Le seul sommet, c'est le parcours complet.
3. **Jamais un chiffre, un nom de client ou une promesse absents de `FACTS.md`.** Et jamais les mots « IA », « turnover », « profilage » ou « sans biais ».
4. **Jamais d'interface inventée quand la démo existe.** On reprend la structure réelle de la démo (voir `CLAUDE.md`).
5. **Jamais de rebond, de rotation gratuite ni d'effet « tape-à-l'œil ».** Si un mouvement ne sert pas le sens, on le retire.

## 7. Un exemple bien fait, plan par plan (M06, « Un résultat qui s'explique », 4 s)

- **0,0 s :** fond noyer, halo ambre centré. La carte profil (ivoire, inclinée à −13° en Y et 5° en X) monte de 40 px en 0,7 s. Derrière, flouté, le panneau pipeline arrive 0,1 s plus tard.
- **0,4 s :** le chiffre 74 compte de 0 à 74 en 0,9 s. Les 5 barres bordeaux se remplissent l'une après l'autre (0,12 s d'écart, 0,6 s chacune).
- **1,3 s :** les blocs « Observé » et « Reste incertain » apparaissent en fondu. Le badge « Identité masquée » est déjà là depuis le début.
- **1,6 s :** la légende « Un résultat qui s'explique. » arrive mot par mot sous la carte, avec « s'explique » en laiton clair. Le bouton « Décision humaine » s'allume discrètement.
- **Pendant tout le plan :** la caméra avance de 3 %. Le grain et le vignettage ne bougent pas.
- **3,75 s :** sortie en transition floue vers le plan suivant, sur un temps de la musique.

---

**Non défini, à demander :** la musique exacte (pizzicato et célesta pour l'acte I, piano minimaliste pour l'acte II : titre à choisir dans CapCut) et le logo définitif de JobResolute (en attendant, le logotype est écrit en Inter Display 600).

---

## 8. V6 — Consignes de motion design « présentation de startup » (recherche du 15/10, demande de Théo)

Sources : guide « Claude Opus 5.5 Motion Design » (aiidelist.com), prompt « motion design system » (YouMind), fil CoCréateur, article de Charlie Hills. Ce qui en ressort, traduit en règles pour ce film :

**Rôle et méthode.** Agir en motion designer senior et réalisateur de film produit. Storyboard d'abord, puis animation, puis inspection des images rendues (planche contact), puis polissage du timing, et seulement ensuite le rendu final. « Un code qui tourne n'est pas une image juste. » Corrections classées P0 (obligatoire), P1 (majeur), P2 (finition).

**Fond et couleurs (V6).** Fond **noir** (dégradé `#121212` → `#000`), texte blanc. Plus de fond bordeaux ni de reflets colorés. Le bordeaux ne reste que dans l'interface du produit (boutons, barres), le vert seulement là où Théo l'a choisi.

**Rythme.** Quelque chose de signifiant change toutes les 1 à 2 s. Aucun temps mort. Mais au moins **un instant de quasi-immobilité** avant chaque grande révélation (0,3 à 0,6 s). Un titre reste lisible au moins 1,2 s.

**Courbes, selon la fonction (jamais un seul réglage pour tout).**
- Interface (cartes, téléphones, boutons) : ressort serré, dépassement minime.
- Caméra : accélération et décélération douces (ease-in-out), cadrage qui va vers ce qui compte.
- Texte : sortie de masque en courbe exponentielle (arrivée nette, fin très douce).
- Chiffres : montée progressive.
- Interdit : rebond élastique, secousses, rotations gratuites.

**Typographie cinétique.** Les mots **sortent d'un masque** (ils montent depuis une ligne invisible), un par un, décalage 0,05 s, 0,55 s chacun. Une seule famille (Inter Display), chiffres tabulaires. Le sens pilote le mouvement : l'échelle pour l'importance.

**Transitions : trois familles seulement, réutilisées.**
1. **Poussée vers l'avant** (zoom à travers) : on avance dans le récit.
2. **Glissé latéral** : on passe du candidat au recruteur (le miroir du film).
3. **Coupe franche sur le temps** : les cartons de chapitre.
Et les **raccords d'objet** (un élément déjà à l'écran devient le suivant) partout où c'est possible : même téléphone, même cercle, même écran.

**Interdits ajoutés.** Particules, halos lumineux appuyés, reflets d'objectif, séparation RVB, faux tableaux de bord, cartes qui flottent sans raison. Une transition forte vaut mieux que cinq effets.

**Contrôle avant livraison.** Planche contact de chaque séquence : débordements, hiérarchie, espacements, couleurs hors charte, zones de sécurité, raccords cassés.
