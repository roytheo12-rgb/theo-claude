# Prompt ChatGPT : fiches comparables (v2)

À coller tel quel dans ChatGPT, puis ajouter la liste (10 à 20 parfums par envoi, **de préférence du même accord**, par exemple 15 santals d'un coup : c'est ce qui rend les scores comparables). Garder la même conversation d'un envoi à l'autre pour que l'échelle reste stable, et recoller le prompt tous les 5 envois.

Sortie : 4 blocs. Le bloc 1 est au format `data/fiches-N.txt` (déjà géré par l'app). Le bloc 2 (profil comparable) est le nouveau fichier `data/profils-N.txt`.

````
Tu es nez, évaluateur et documentaliste en parfumerie, rigoureux et honnête. Je construis la base d'une application française de conseil olfactif. Son but : parmi des dizaines de parfums du même accord (par exemple 10 santals), trouver CELUI QUI PLAIRA RÉELLEMENT LE PLUS à une personne donnée selon ses goûts, son occasion, la météo, son âge et son style. Pour cela, deux parfums « santal » ne doivent surtout pas recevoir la même fiche : tes scores doivent faire ressortir ce qui les DIFFÉRENCIE. La fiabilité passe avant l'exhaustivité : une donnée inventée fausse les conseils.

# Sources et honnêteté
- Si tu peux consulter le web, recoupe : site officiel de la maison, Fragrantica (pyramide, votes « ressemble à », « saisons », « jour/nuit », « longévité », « sillage »), Parfumo, Basenotes, Luckyscent, avis de parfumeurs-blogueurs. Sinon n'écris que ce que tu sais avec certitude.
- N'invente JAMAIS une note. Une note n'apparaît que si elle est dans la pyramide officielle ou dans au moins deux sources concordantes.
- Si tu ne connais pas un parfum assez bien, mets `?` dans ses champs et ajoute-le au bloc 4. Une case vide vaut mieux qu'une case fausse.
- Version exacte demandée (EDT ≠ EDP ≠ Parfum ≠ Extrait ≠ Intense) : ne mélange pas les versions.

# BLOC 1 : fiche (11 champs séparés par |)
Maison|Parfum|famille|genre|notes de tête|notes de cœur|notes de fond|projection|tenue|poids|prix
- famille : UNE parmi agrumes, aquatique, aromatique, vert, floral, fruité, gourmand, ambré, boisé, épicé, cuir, musqué, oud. C'est la famille dominante À LA PEAU pendant les heures qui suivent, pas celle de la tête.
- genre : m, f ou u (positionnement officiel).
- notes : en français, minuscules, singulier, séparées par des ; (3 à 8 par niveau). Si la maison ne donne pas de pyramide, mets toutes les notes dans « cœur ».
- projection, tenue, poids : 1 à 5. Projection 1 = peau, 5 = sillage énorme. Tenue 1 = moins de 3 h, 3 = 5 à 7 h, 5 = plus de 10 h. Poids 1 = estival et transparent, 5 = dense et hivernal.
- prix : euros pour 100 ml, entier, 0 si inconnu.
Exemple : Frédéric Malle|Portrait of a Lady|floral|f|cassis;framboise;clou de girofle;cannelle|rose de Turquie;patchouli;encens|santal;musc;benjoin;ambre|4|5|4|210

# BLOC 2 : profil comparable (une ligne par parfum, champs séparés par |)
Maison|Parfum|FRA|DOU|FLO|BOI|ÉPI|RÉS|FUM|POU|VER|FRU|MUS|CRÉ|DEN|ORI|CLI|FOR|SEN|ÉVO|SAISONS|MOMENT|DOMINANTE|DIFFÉRENCE|PROCHE DE|PUBLIC|CONFIANCE

Tous les scores vont de 0 à 5 (entiers). Ils mesurent l'impression OLFACTIVE RÉELLE sur la peau (ce qu'on sent vraiment), pas la simple présence d'une note dans la liste. Note par rapport à L'ENSEMBLE de la parfumerie, pas par rapport au lot : 0 = absent, 1 = trace, 2 = présent mais secondaire, 3 = net, 4 = dominant, 5 = écrasant, signature du parfum.

Axes olfactifs :
- FRA fraîcheur : vif, pétillant, froid. 0 ≈ Tobacco Vanille (Tom Ford) ; 5 ≈ Light Blue (Dolce & Gabbana).
- DOU douceur sucrée : sucre, vanille, caramel, miel, fruits confits. 0 ≈ Terre d'Hermès ; 5 ≈ Angel (Mugler).
- FLO floral : 0 ≈ Sauvage (Dior) ; 5 ≈ Fracas (Robert Piguet).
- BOI boisé : santal, cèdre, vétiver, patchouli, gaïac. 0 ≈ Light Blue ; 5 ≈ Santal 33 (Le Labo).
- ÉPI épicé : poivre, cannelle, clou de girofle, safran, cardamome. 0 ≈ Light Blue ; 5 ≈ Opium (Yves Saint Laurent).
- RÉS résineux et balsamique : encens, ambre, benjoin, myrrhe, labdanum. 0 ≈ Light Blue ; 5 ≈ Ambre Sultan (Serge Lutens).
- FUM fumé, cuiré, animal, tabac, goudron. 0 ≈ Light Blue ; 5 ≈ Tuscan Leather (Tom Ford).
- POU poudré : iris, violette, héliotrope, aldéhydes, talc. 0 ≈ Terre d'Hermès ; 5 ≈ Iris Poudre (Frédéric Malle).
- VER vert et herbacé : feuille, herbe, galbanum, thé, aromatiques. 0 ≈ Angel ; 5 ≈ N°19 (Chanel).
- FRU fruité : 0 ≈ Tuscan Leather ; 5 ≈ Bitter Peach (Tom Ford).
- MUS musqué et « peau propre » : savon, linge, musc blanc. 0 ≈ Tuscan Leather ; 5 ≈ Narciso for Her (Narciso Rodriguez).
- CRÉ texture : 0 = sec, cassant, crayon (ex. Vétiver de Guerlain) ; 5 = crémeux, lacté, enveloppant (ex. Samsara de Guerlain). Très important pour départager les santals, les iris et les ambrés.
- DEN densité : 0 = transparent, aérien ; 5 = opaque, massif. 1 ≈ Light Blue ; 5 ≈ Opium.

Axes de personnalité (échelle de lecture, pas de note « bonne » ou « mauvaise ») :
- ORI originalité : 0 = ultra consensuel et classique (Sauvage) ; 5 = avant-garde, déroutant (Stercus, Orto Parisi).
- CLI clivage : 0 = tout le monde aime ; 5 = on adore ou on déteste (Black Afgano, Nasomatto). Base-toi sur les avis divergents.
- FOR formalité : 0 = décontracté, week-end ; 3 = polyvalent ; 5 = tenue de soirée ou costume.
- SEN sensualité : 0 = innocent, propre ; 5 = très charnel, séducteur.
- ÉVO évolution : 0 = linéaire (même odeur de bout en bout) ; 5 = change beaucoup entre la tête, le cœur et le fond.

Champs textes :
- SAISONS : quatre chiffres 0 à 5 séparés par ; dans l'ordre printemps;été;automne;hiver (4 = excellent à cette saison, 0 = à éviter). Cohérent avec FRA, DEN et la chaleur.
- MOMENT : deux chiffres 0 à 5 séparés par ; dans l'ordre jour;soir (le soir inclut la nuit).
- DOMINANTE : la PREMIÈRE chose qu'on sent sur la peau après 30 minutes, en un ou deux mots (ex. « santal crémeux », « vétiver sec »). Pas une liste de notes.
- DIFFÉRENCE : une phrase de 8 à 20 mots disant ce qui distingue ce parfum de ses voisins du même accord. Concret, jamais de pub (« plus lacté et sucré que Santal 33, moins fumé », pas « sublime et envoûtant »).
- PROCHE DE : trois parfums connus qui lui ressemblent le plus, séparés par ; (réels, de la base mondiale), ou ? si tu hésites.
- PUBLIC : 1 à 3 étiquettes parmi : jeune, adulte, mature ; actif, élégant, créatif, romantique, mystérieux, confiant ; débutant (facile d'accès), connaisseur (demande un nez entraîné). Séparées par ;.
- CONFIANCE : 1 = je suis peu sûr (notes ou scores en partie estimés), 2 = assez sûr, 3 = très sûr (pyramide et avis recoupés).

Règles de scoring :
1. UTILISE TOUTE L'ÉCHELLE. Un profil où tout est à 2 ou 3 est inutile. Un parfum a typiquement 2 à 4 axes élevés (≥ 4) et plusieurs à 0 ou 1. Les 0 sont aussi importants que les 5.
2. COHÉRENCE ENTRE LES CHAMPS : un parfum noté BOI 5 mais dont la liste de notes ne contient aucun bois est une erreur. Un FRA ≥ 4 ne peut pas avoir DEN ≥ 4 ni hiver ≥ 4. Un DOU ≥ 4 a au moins une note sucrée.
3. COMPARABILITÉ : quand plusieurs parfums du lot partagent un accord (par exemple 10 santals), vérifie qu'ils ne reçoivent pas les mêmes scores. Classe-les mentalement sur CRÉ, DOU, FUM, POU, DEN, FRA, ORI et assure-toi que l'ordre correspond à ce qu'on sent vraiment. Au moins 4 axes doivent varier d'au moins 2 points entre le plus différent et le plus proche du lot.
4. Scores en fonction de la version exacte demandée.
5. En cas de doute sur un axe : donne la valeur centrale (2 ou 3) ET baisse CONFIANCE. N'invente pas un extrême.

# BLOC 3 : descriptions et nez
Pour chaque parfum : `Parfum|moment|description|nez`. moment = jour, soir, nuit ou tous. Description = 1 phrase de 12 à 25 mots, sensorielle et concrète, qui cite uniquement des notes présentes dans la fiche. Nez = parfumeur(s) si tu en es sûr, sinon ?.

# BLOC 4 : à vérifier
Liste des parfums avec ? ou CONFIANCE = 1, et une phrase sur ce qui est incertain.

# Contrôle final (obligatoire, ne le montre pas)
Pour chaque ligne : (1) bloc 1 = exactement 11 champs ; (2) bloc 2 = exactement 27 champs, tous les scores entiers de 0 à 5 ; (3) famille valide ; (4) scores cohérents avec les notes ; (5) deux parfums de même accord ne sont pas des copies ; (6) aucun doublon. Corrige, puis réponds UNIQUEMENT avec les blocs 1, 2, 3 et 4, sans introduction ni commentaire, chacun dans son propre encadré de code.

# Ma liste (Maison | Parfum | concentration)
[COLLE ICI TA LISTE, de préférence des parfums du même accord]
````

## Pourquoi ça permet de comparer
- 13 axes olfactifs ancrés sur des parfums connus : les scores restent comparables d'un envoi à l'autre.
- Les axes de texture (CRÉ), de densité (DEN) et de fumé (FUM) départagent les parfums d'un même accord. C'est ce qui distingue un santal crémeux d'un santal sec.
- Clivage, originalité, formalité, sensualité, évolution, public et saisons permettent de choisir selon la personne, et pas seulement selon la note.
- DIFFÉRENCE et PROCHE DE servent à expliquer chaque recommandation dans l'app.
- CONFIANCE permet à l'app de peser moins une donnée incertaine.
