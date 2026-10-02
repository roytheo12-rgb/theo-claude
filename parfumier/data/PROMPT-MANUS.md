# Prompt Manus : les 2 000 parfums les plus populaires, décrits pour un conseiller

À donner à Manus **avec le fichier joint** `parfumier/data/export-base-complete.tsv` (7 193 parfums, 657 maisons ; colonnes : rang_maison, maison, parfum, concentrations, reedition_ou_variante, fiche_detaillee_existante, notes_existantes). Regénérer ce fichier avec `node tools/export-base.cjs`.

Le prompt prévoit une pause après la sélection et un pilote de 30 parfums à valider avant de lancer le reste.

````
# MISSION

Tu es un agent de recherche et de documentation en parfumerie. Tu travailles pour une application française de conseil en parfums (« Sillage »). Quand quelqu'un cherche un parfum ou pose une question (« un santal crémeux pour le bureau », « quelque chose comme Bleu de Chanel mais moins cher », « sans vanille, pour l'été », « un cadeau pour ma mère de 55 ans »), l'application doit répondre avec la plus grande précision possible. Elle ne peut le faire que si CHAQUE parfum de sa base est décrit de façon fiable, détaillée et COMPARABLE aux autres.

Ta mission : (1) choisir les 2 000 parfums les plus populaires de la base jointe, (2) produire pour chacun une fiche complète au schéma ci-dessous, avec sources, (3) livrer des fichiers prêts à importer et un rapport de qualité.

La FIABILITÉ passe avant le volume. Une fiche inventée ou approximative est pire qu'une fiche absente : elle ferait recommander un mauvais parfum. Tu préfères livrer 1 400 fiches fiables que 2 000 fiches douteuses.

# ENTRÉE

Fichier joint : `export-base-complete.tsv` (la base de l'application). Colonnes : rang_maison (notoriété de la maison, 1 = la plus célèbre ; vide = inconnue), maison, parfum, concentrations (EDT, EDP, EXT = extrait, PAR = parfum, COL = cologne), reedition_ou_variante (1 = édition limitée, collector ou variante), fiche_detaillee_existante, notes_existantes.
Tu ne dois pas ajouter de parfum qui n'est pas dans ce fichier, sauf s'il manque un grand classique évident (dans ce cas ajoute-le en l'indiquant dans le rapport, colonne « absent_de_la_base »).

# PHASE 1 : sélection des 2 000 parfums les plus populaires

Définition de « populaire » : un parfum que beaucoup de gens portent, cherchent ou achètent. Construis un score de popularité avec plusieurs signaux, sans te limiter à un seul :
- nombre de votes/avis et notes sur les communautés (Fragrantica, Parfumo, Basenotes) lus normalement, page par page ;
- présence dans les meilleures ventes et classements des grands distributeurs (Sephora, Nocibé, Marionnaud, Douglas, Notino, Jovoy, Luckyscent, Harrods…) ;
- parfum phare de sa maison (la maison le met en tête de gamme) ;
- classements de presse spécialisée et listes « best of » de l'année en cours et des trois dernières ;
- le rang de la maison fourni dans le fichier (simple indice a priori, pas un critère unique).

Règles de sélection :
1. Exclure les rééditions et variantes (reedition_ou_variante = 1), sauf si c'est le best-seller de la maison.
2. UNE version par famille de parfum (la concentration la plus vendue : en général EDP). Maximum 2 versions si la deuxième est un best-seller à part entière (ex. Sauvage EDT et Sauvage Elixir).
3. Équilibre obligatoire pour que l'application puisse conseiller dans tous les cas : environ 35 % masculins, 35 % féminins, 30 % mixtes ; au moins 60 parfums pour chacun des accords principaux (santal, vanille, cuir, oud, rose, iris, vétiver, agrumes, musqué, encens, tabac, tubéreuse, jasmin, ambre, patchouli, café/gourmand, aquatique, aromatique) ; des parfums de tous niveaux de prix (moins de 60 €, 60 à 120 €, 120 à 250 €, plus de 250 €) ; designers (grand public) ET niche.
4. Un parfum arrêté (discontinué) peut figurer s'il est très recherché, avec disponibilité = « discontinue ».

Livrable de la phase 1 : `selection_2000.tsv` avec colonnes rang_popularite, maison, parfum, concentration_retenue, signal_de_popularite (une phrase : quelle source, quel chiffre ou classement), accord_principal. ARRÊTE-TOI ensuite et présente-moi : le fichier, la répartition (genre, accords, prix) et 10 choix que tu hésites à garder. Attends ma validation avant la phase 2.

# PHASE 2 : pilote de 30 parfums (à valider)

Choisis 30 parfums variés dans la sélection (dont 6 santals pour montrer que tu sais les différencier). Produis leurs fiches complètes (schéma ci-dessous) dans `pilote_30.jsonl` et attends mon feu vert. Dans ce pilote, les 30 parfums servent aussi de GAMME DE RÉFÉRENCE : tu garderas leurs scores en mémoire et tu t'y référeras pour tout le reste afin que les notations restent cohérentes.

# PHASE 3 : production des 2 000 fiches

Travaille par lots de 100 fiches (`fiches_0001-0100.jsonl`, `fiches_0101-0200.jsonl`, …). Regroupe dans un même lot des parfums du MÊME accord principal (15 santals ensemble, puis 15 vanilles…) : c'est ainsi que tu repères ce qui les différencie. Après chaque lot, lance ton script de validation (voir plus bas), corrige les erreurs, puis passe au lot suivant. Sauvegarde à chaque lot : je dois pouvoir reprendre si tu t'arrêtes.

# SCHÉMA D'UNE FICHE (JSON Lines : un objet JSON par ligne, UTF-8)

```
{
 "id": "maison-parfum (minuscules, sans accents, tirets)",
 "maison": "orthographe officielle",
 "parfum": "nom officiel exact",
 "concentration": "EDT|EDP|EXT|PAR|COL",
 "annee": 2015,
 "parfumeurs": ["Nom Prénom"],
 "genre": "m|f|u (positionnement officiel de la maison)",
 "famille": "UNE valeur parmi : agrumes, aquatique, aromatique, vert, floral, fruité, gourmand, ambré, boisé, épicé, cuir, musqué, oud (dominante À LA PEAU pendant les heures qui suivent)",
 "sous_famille": "précision libre : santal crémeux, chypre fruité, fougère, oriental vanillé…",
 "notes": {"tete": ["..."], "coeur": ["..."], "fond": ["..."]},
 "accord_principal": ["jusqu'à 3 mots : santal, vanille, ..."],
 "profil": {"fraicheur":0,"douceur":0,"floral":0,"boise":0,"epice":0,"resine":0,"fume":0,"poudre":0,"vert":0,"fruite":0,"musque":0,"cremeux":0,"densite":0,"originalite":0,"clivage":0,"formalite":0,"sensualite":0,"evolution":0},
 "performance": {"projection":1,"tenue":1,"poids":1},
 "saisons": {"printemps":0,"ete":0,"automne":0,"hiver":0},
 "moment": {"jour":0,"soir":0},
 "usages": ["bureau","quotidien","rendez-vous","soiree","ceremonie","sport","voyage","cadeau","detente"],
 "public": ["jeune|adulte|mature","actif|elegant|creatif|romantique|mysterieux|confiant","debutant|connaisseur"],
 "age_cible": ["18-25","25-35","35-50","50+"],
 "prix": {"eur": 0, "format_ml": 100, "niveau": "abordable|moyen|premium|luxe"},
 "disponibilite": "actuel|discontinue|edition_limitee",
 "parent": "id du parfum d'origine si c'est une déclinaison, sinon null",
 "ressemble_a": ["3 à 5 parfums réels qui lui ressemblent le plus"],
 "alternatives_abordables": ["0 à 3 parfums moins chers dans le même esprit"],
 "dominante": "la première chose qu'on sent après 30 minutes, 1 à 3 mots",
 "difference": "8 à 20 mots : ce qui le distingue de ses voisins du même accord, concret",
 "pitch": "une ligne, 12 mots maximum, en français courant",
 "description": "2 à 3 phrases sensorielles, concrètes, en tes propres mots, qui ne citent que des notes présentes dans la fiche",
 "pour_qui": "à qui il ira le mieux (1 phrase)",
 "pas_pour_qui": "à qui il ne conviendra pas, ou qui risque de ne pas l'aimer (1 phrase)",
 "mots_cles": ["10 à 20 façons dont les gens le décrivent ou le cherchent, en français courant : « sent le propre », « vanille brûlée », « parfum de vestiaire », « odeur de livre ancien »…"],
 "popularite": {"signal": "source et chiffre", "rang_estime": 0},
 "sources": ["URL1", "URL2"],
 "confiance": 1,
 "a_verifier": ["noms des champs incertains"]
}
```

## Échelles et ancrages

Notes en français, minuscules, singulier (« rose de Turquie » oui, « rose sublime » non). Une note n'est écrite que si elle figure dans la pyramide officielle de la maison, ou dans au moins deux sources concordantes. Si la maison ne donne pas de pyramide, mets toutes les notes dans « coeur ».

Les 18 scores de "profil" sont des entiers de 0 à 5 mesurant l'impression olfactive RÉELLE sur la peau (pas la présence d'une note dans la liste), par rapport à L'ENSEMBLE de la parfumerie : 0 absent, 1 trace, 2 secondaire, 3 net, 4 dominant, 5 écrasant (signature).
- fraicheur : 0 ≈ Tobacco Vanille (Tom Ford) ; 5 ≈ Light Blue (Dolce & Gabbana).
- douceur (sucré) : 0 ≈ Terre d'Hermès ; 5 ≈ Angel (Mugler).
- floral : 0 ≈ Sauvage (Dior) ; 5 ≈ Fracas (Robert Piguet).
- boise : 0 ≈ Light Blue ; 5 ≈ Santal 33 (Le Labo).
- epice : 0 ≈ Light Blue ; 5 ≈ Opium (Yves Saint Laurent).
- resine (encens, ambre, benjoin, myrrhe, labdanum) : 0 ≈ Light Blue ; 5 ≈ Ambre Sultan (Serge Lutens).
- fume (fumé, cuiré, animal, tabac, goudron) : 0 ≈ Light Blue ; 5 ≈ Tuscan Leather (Tom Ford).
- poudre : 0 ≈ Terre d'Hermès ; 5 ≈ Iris Poudre (Frédéric Malle).
- vert : 0 ≈ Angel ; 5 ≈ N°19 (Chanel).
- fruite : 0 ≈ Tuscan Leather ; 5 ≈ Bitter Peach (Tom Ford).
- musque (peau propre, savon, linge) : 0 ≈ Tuscan Leather ; 5 ≈ Narciso for Her (Narciso Rodriguez).
- cremeux (texture) : 0 = sec, cassant, crayon (Vétiver de Guerlain) ; 5 = crémeux, lacté (Samsara de Guerlain). Essentiel pour départager santals, iris, ambrés.
- densite : 0 = transparent, aérien ; 5 = opaque, massif (1 ≈ Light Blue ; 5 ≈ Opium).
- originalite : 0 = ultra consensuel (Sauvage) ; 5 = avant-garde (Stercus, Orto Parisi).
- clivage : 0 = tout le monde aime ; 5 = on adore ou on déteste (Black Afgano). Fonde-toi sur les avis divergents.
- formalite : 0 = décontracté ; 3 = polyvalent ; 5 = tenue de soirée ou costume.
- sensualite : 0 = innocent, propre ; 5 = très charnel.
- evolution : 0 = linéaire ; 5 = change beaucoup entre tête, cœur et fond.
"performance" : projection 1 = peau, 5 = sillage énorme ; tenue 1 = moins de 3 h, 3 = 5 à 7 h, 5 = plus de 10 h ; poids 1 = estival et transparent, 5 = dense et hivernal.
"saisons" et "moment" : 0 à 5 (0 = à éviter, 4 et plus = excellent), cohérents avec fraicheur et densite.

## Règles de scoring (obligatoires)
1. Utilise toute l'échelle. Un parfum a typiquement 2 à 4 axes ≥ 4 et plusieurs à 0 ou 1. Un profil tout à 2 ou 3 est refusé.
2. Cohérence : boise ≥ 4 suppose un bois dans les notes ; fraicheur ≥ 4 interdit densite ≥ 4 et hiver ≥ 4 ; douceur ≥ 4 suppose une note sucrée ; une projection 5 ne se range pas dans « discret ».
3. Comparabilité : dans un lot, deux parfums du même accord ne doivent pas avoir des profils quasi identiques. Entre le plus proche et le plus différent du lot, au moins 4 axes varient d'au moins 2 points. Classe-les mentalement sur cremeux, douceur, fume, poudre, densite, fraicheur, originalite et vérifie que l'ordre correspond à ce qu'on sent.
4. Les scores concernent la concentration retenue (un EDT n'a pas le profil de l'extrait).
5. En cas de doute sur un axe : valeur centrale (2 ou 3) ET baisse la confiance. Jamais d'extrême inventé.
6. « confiance » : 3 = pyramide officielle ET au moins une autre source concordante ET scores recoupés ; 2 = pyramide fiable, scores en partie estimés ; 1 = incertain. Tout parfum de confiance 1 va aussi dans `a_verifier.tsv`.

# SOURCES ET RESPECT DES RÈGLES

- Priorité : site officiel de la maison, pages produit de distributeurs, Wikipedia/Wikidata, Luckyscent, Jovoy, Sephora, Nocibé. Les communautés (Fragrantica, Parfumo, Basenotes) se lisent normalement, une page à la fois, pour recouper et jauger l'opinion ; tu n'en copies jamais les textes ni les avis.
- Respecte le robots.txt et les conditions d'utilisation de chaque site. Ne contourne jamais un blocage (Cloudflare, captcha, connexion obligatoire) : si un site te bloque, passe à une autre source. Pas de scraping massif ni de requêtes abusives (une page toutes les 2 à 3 secondes maximum).
- Les faits (notes, année, parfumeur, prix) se recoupent. Les descriptions, pitchs, « difference », « pour_qui », « mots_cles » sont rédigés EN TES PROPRES MOTS, jamais recopiés.
- Chaque fiche liste au moins 2 URL dans "sources" (une seule si le parfum est très confidentiel, avec confiance ≤ 2).
- N'invente jamais une note, un parfumeur, une année ou un prix. Inconnu = null (ou [] pour une liste) et signale-le dans "a_verifier".

# CONTRÔLES DE QUALITÉ (script à écrire et à lancer après chaque lot)

Écris un script (Python) qui vérifie sur chaque ligne : JSON valide ; tous les champs présents ; famille dans la liste autorisée ; 18 scores entiers 0 à 5 ; saisons et moments 0 à 5 ; performance 1 à 5 ; au moins 2 notes ; "ressemble_a" de 3 à 5 éléments réels ; "mots_cles" de 10 à 20 ; "pitch" de 12 mots maximum ; au moins 1 source ; cohérence (règles 2 ci-dessus) ; pas de doublon d'id ; pas de profils identiques entre deux parfums différents ; pas de texte copié depuis une source (compare tes phrases aux sources lues : similarité faible). Les erreurs sont corrigées avant de passer au lot suivant. Tous les 5 lots, re-note à l'aveugle 10 parfums déjà faits (gamme de référence incluse) et compare : si tes scores dérivent de plus de 1 point en moyenne, corrige la dérive et recale le lot concerné.

# LIVRABLES FINAUX

1. `selection_2000.tsv` (phase 1).
2. `pilote_30.jsonl` (phase 2).
3. `fiches_0001-0100.jsonl` … (phase 3), 2 000 fiches au total ou le nombre fiable que tu as pu atteindre.
4. `a_verifier.tsv` : id, champs incertains, raison.
5. `sources.tsv` : id, URL, ce que la source a confirmé.
6. `rapport_qualite.md` : nombre de fiches par niveau de confiance ; répartition genre / accords / prix ; parfums de la sélection non documentés et pourquoi ; erreurs trouvées par le script ; dérive éventuelle constatée ; classiques ajoutés hors base.
7. `validate.py` : ton script de contrôle.

# CONSIGNES D'EXÉCUTION

- Écris tout en français.
- Ne te contente jamais de paraphraser : chaque description doit pouvoir distinguer ce parfum de ses voisins.
- Si tu manques de temps ou de moyens, réduis le nombre de fiches, pas la qualité : classe-les par popularité et livre d'abord les plus populaires.
- À chaque étape, dis-moi ce que tu as fait, ce que tu n'as pas pu faire, et pourquoi.
````

## Ce que l'application fera de ces fiches
- **Questions libres** (« un parfum frais pour le bureau ») : `mots_cles`, `usages`, `saisons`, `moment` et le profil permettent un classement précis.
- **Comparaison de parfums proches** (10 santals) : `cremeux`, `douceur`, `fume`, `poudre`, `densite` et la phrase `difference` départagent ; `pas_pour_qui` et `clivage` signalent les risques.
- **« Comme X mais moins cher »** : `ressemble_a` et `alternatives_abordables`.
- **Cadeau, âge, public** : `age_cible`, `public`, `pour_qui`.
- **Fiabilité** : `confiance` et `a_verifier` font peser moins les données incertaines ; `sources` permet de vérifier.
