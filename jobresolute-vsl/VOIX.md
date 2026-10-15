# VOIX.md — générer la voix off avec ElevenLabs

Une voix, 24 répliques, **un fichier par réplique**. Ensuite, tu me les envoies : je mesure leur durée exacte, je recale l'acte II et l'acte IV dessus, et je te rends des vidéos où la voix tombe pile sur les animations.

---

## 1. Avant de commencer

- **Licence :** les voix générées avec l'offre gratuite ne peuvent pas être utilisées commercialement. Passe à une offre payante (Starter suffit) **avant** d'envoyer le film à un DRH ou à un investisseur. Tu peux générer en gratuit pour tester, et regénérer les répliques finales une fois abonné.
- **Une seule voix pour tout le film**, avec les mêmes réglages du début à la fin.

## 2. Choisir la voix

Dans **Voices → Voice Library**, filtre **Language : French**, **Gender : Male**, **Age : Middle aged / Old**, **Use case : Narration**.
Le personnage : un mentor de 55 à 65 ans, posé, chaleureux, qui parle à deux personnes qu'il connaît. Pas une voix de bande-annonce, pas une voix de publicité radio.

**Le test pour choisir :** génère les répliques V1 et V17 avec 3 ou 4 voix différentes, et garde celle qui sonne le plus « vrai » sur « La décision finale sera la tienne, Julien. » C'est la réplique la plus difficile : elle doit être chaleureuse sans être mielleuse.

## 3. Réglages (identiques pour toutes les répliques)

| Réglage | Valeur | Pourquoi |
|---|---|---|
| Modèle | **Eleven Multilingual v2** | Le plus stable en français, et la voix reste la même d'une réplique à l'autre. (Eleven v3 est plus expressif mais varie davantage d'une génération à l'autre : à essayer seulement si v2 sonne trop plat.) |
| Stability | **50 %** | En dessous, la voix devient théâtrale et change d'une réplique à l'autre. Au-dessus, elle devient monotone. |
| Similarity | **75 %** | |
| Style exaggeration | **0 à 10 %** | Le plus bas possible : on veut de la retenue. |
| Speaker boost | **Activé** | |
| Speed | **0,95** | Un peu plus lent que la normale : un mentor ne se presse pas. |
| Format de sortie | **MP3 44,1 kHz, 192 kb/s** (ou WAV si ton offre le permet) | |

**Les pauses :** une virgule = petite respiration, des points de suspension = pause plus longue. Si une pause ne sort pas assez, ajoute `<break time="0.6s" />` à l'endroit voulu (fonctionne avec Multilingual v2).

**La prononciation de « JobResolute » :** c'est le seul mot à risque. Décide avec Henry comment vous le dites (à l'anglaise « djob-rézolout » ou à la française « job-résolute »). Si ElevenLabs ne le prononce pas comme vous voulez, écris-le phonétiquement **dans ElevenLabs seulement** : par exemple `Djob Rézolute`. Garde la même écriture pour V6 et V19.

## 4. Les répliques à générer

Copie chaque texte tel quel. La **durée maximale** est celle qui tient sur le plan sans le déborder : si une génération est plus longue, regénère-la (ou baisse un peu la vitesse des autres pour garder un rythme constant, plutôt que d'accélérer celle-ci).

### Acte I — Séparés (sur tes plans Flow)

| Fichier | Texte | Durée max | Tombe sur |
|---|---|---|---|
| `V01.mp3` | Dis-moi, Nadia… combien de candidatures as-tu envoyées ces trois derniers mois ? | **7 s** | Les toits, puis la fenêtre (P01 → P02) |
| `V02.mp3` | Et combien sont restées sans réponse ? | **3,5 s** | Le téléphone retourné (P04) |
| `V03.mp3` | Et toi, Julien… as-tu enfin trouvé la perle rare ? | **4 s** | L'hôtel à l'aube, puis le bureau (P05a → P05b) |
| `V04.mp3` | Ce serait dommage de passer à côté d'une belle rencontre… | **4 s** | Le CV sur la pile (P07) |
| `V05.mp3` | Le problème n'est pas le nombre de CV. <break time="0.6s" /> C'est ce qu'on est capable d'observer. | **5,5 s** | P08 (la pause tombe entre les deux phrases à l'écran) |

### Acte II — Reliés (sur ACTE2.mp4)

| Fichier | Texte | Durée max | Tombe sur |
|---|---|---|---|
| `V06.mp3` | Voici JobResolute. | **1,5 s** | Le logo, à 3,0 s du début d'ACTE2 |
| `V07.mp3` | **Version courte (recommandée)** : Démontrer, sans contrainte. Évaluer, sans a priori. Comprendre son résultat. Décider, en connaissance de cause. | **6 s** | Les 4 promesses (M02) |
| `V08a.mp3` | Vous décrivez le poste. Rien à installer, personne à former. | **4 s** | Le recruteur publie l'offre (M03a) |
| `V08.mp3` | Le candidat postule en un clic. Sans CV. | **3,5 s** | « Je suis intéressée » (M03) |
| `V09.mp3` | Puis il démontre ce qu'il sait faire, sur les cinq dimensions du poste. | **4,5 s** | La mise en situation (M04) |
| `V10.mp3` | Vous voyez ce que la personne fait. Pas qui elle est. | **4 s** | Identité masquée (M05) |
| `V11.mp3` | Un résultat qui s'explique. | **4 s** | Le Fit 74 (M06) |
| `V12.mp3` | Et sa place dans votre équipe. | **4 s** | La Carte de Cohésion (M07) |
| `V13.mp3` | Le même résultat, des deux côtés, au même instant. | **4 s** | Le compte-rendu des deux côtés (M08) |
| `V14.mp3` | Chacun prépare la rencontre. | **4,5 s** | Les questions et la fiche d'entretien (M09) |
| `V15.mp3` | Et personne ne reste sans réponse. | **4,2 s** | Le cercle (M10) |
| `V15b.mp3` | Et demain, les talents que le CV aurait écartés refont surface. | **4,5 s** | Hidden Gems, « Bientôt » (M10b) |
| `V16.mp3` | Pas un outil de plus. <break time="0.4s" /> Tout le parcours. | **4,8 s** | Le parcours complet (M11) |

> **V07 : il faut trancher.** Le texte du plan (« Pour le candidat : démontrer, sans contrainte. Pour le recruteur : évaluer… ») dure environ 9 à 10 s, alors que la séquence fait 6 s. Comme l'écran affiche déjà « Le candidat » et « Le recruteur » au-dessus de chaque ligne, la version courte ne perd rien. Si tu préfères la version longue, génère-la quand même : je rallongerai la séquence M02 à sa durée.

### Acte III — Réunis (sur tes plans Flow)

| Fichier | Texte | Durée max | Tombe sur |
|---|---|---|---|
| `V17.mp3` | La décision finale sera la tienne, Julien. | **4 s** | La poignée de main (P11) |
| `V18.mp3` | Et toi, Nadia, quelle que soit la décision, on reste à tes côtés. | **6 s** | La maison de poupée (P12) |

### Acte IV — Preuves et fin (sur ACTE4.mp4)

| Fichier | Texte | Durée max | Tombe sur |
|---|---|---|---|
| `V18b.mp3` | Notre ambition : devenir le système nerveux RH de l'hospitalité. | **5 s** | La vision, 9 s après le début d'ACTE4 |
| `V18c.mp3` | Nous ne digitalisons pas le recrutement. Nous changeons ce que l'on mesure. | **5,5 s** | La fin, 17 s après le début d'ACTE4 |
| `V19.mp3` | JobResolute. <break time="0.5s" /> La technologie au service de l'humain. | **4 s** | Juste après V18c, sur le logo et les deux boutons |

## 5. Méthode de génération

1. Génère **chaque réplique 3 fois** (ElevenLabs varie à chaque génération) et garde la meilleure.
2. Écoute-les **à la suite**, dans l'ordre du film : le ton doit rester le même d'une réplique à l'autre. Si une réplique détonne (plus aiguë, plus rapide), regénère-la.
3. Les 5 répliques qui comptent le plus : **V01** (la première impression), **V06** (le nom), **V13** (la promesse clé), **V17** et **V18** (l'émotion).
4. Nomme les fichiers **exactement** comme dans les tableaux (`V01.mp3`, `V08a.mp3`…).
5. **Envoie-les-moi** : je mesure chaque durée, je recale les séquences de l'acte II et de l'acte IV sur la voix, je mixe la voix avec les effets sonores (la voix devant, les effets en dessous), et je te rends ACTE2 et ACTE4 avec la voix intégrée, plus un tableau des temps pour poser les répliques des actes I et III sur tes plans Flow.
