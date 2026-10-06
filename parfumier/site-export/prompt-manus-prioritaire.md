# Prompt Manus, packshots de parfums détourés

Copie le bloc ci-dessous dans Manus. Il y a 49 parfums, fais-en deux lots (les 25 sans photo, puis les 24 à refaire). Colle la liste à la fin.

---

Tu es chargé de constituer une banque de packshots de parfums pour une application. Je te donne une liste numérotée de parfums (maison + nom). Pour CHAQUE ligne, tu dois trouver, télécharger, vérifier puis détourer la photo du flacon. La qualité prime sur la vitesse. Travaille ligne par ligne, dans l'ordre, sans en sauter.

## 1. Quelle image chercher

- Le **packshot officiel** du flacon, vu de face, droit, sur **fond blanc ou uni** (gris clair, beige). Sources par ordre de préférence : site officiel de la maison, puis boutiques officielles ou revendeurs autorisés (Sephora, Nocibé, Douglas, Notino, Jovoy, Nose, Luckyscent, Harrods, Selfridges, Nordstrom, Saks, Bloomingdale's), puis Fragrantica en dernier recours.
- **Format du flacon** : choisis le **100 ml**. Si le 100 ml n'existe pas, 90 ml, puis 75 ml, puis 50 ml. Ne prends un format inférieur à 50 ml que s'il n'en existe pas d'autre, et dis-le dans le rapport.
- **Le bon produit exact** : même nom, même concentration (EDP, EDT, extrait, cologne, parfum) et même ligne que ce qui est demandé. Vérifie que le nom écrit sur le flacon correspond. Si la liste dit « Dior Homme Original », ne prends pas « Dior Homme Intense ». En cas de doute entre deux versions, prends l'EDP et signale-le.
- **Taille** : au moins **1000 px** sur le plus grand côté, idéalement 1500 px ou plus. Pas de vignette agrandie, pas d'image floue, pas de pixels visibles, pas de filigrane, pas de logo de revendeur, pas de bandeau « promo ».

## 2. Ce qui est interdit (rejette l'image et cherches-en une autre)

- Deux flacons ou plus côte à côte, une gamme, un trio.
- Un coffret, une boîte seule, un coffret cadeau, un set, un miniature, une recharge, un rollerball, un spray corps, un déodorant, une crème, une bougie.
- Une photo d'ambiance : flacon posé sur du marbre, des fleurs, un mannequin, une main, un décor, un reflet, une ombre portée forte.
- Des matières premières, des fleurs, des fruits, des insert à côté du flacon.
- Un flacon coupé, penché, vu de trois quarts ou de dessus, un flacon dont le bouchon ou le haut sont cachés.
- Une image générée par IA. Uniquement de vraies photos de produit.
- Une page de revendeur où la photo montre un autre parfum de la même maison.

## 3. Détourage (suppression du fond)

Pour chaque image retenue, produis un **PNG avec fond transparent** de ce flacon seul.
- Utilise un vrai modèle de détourage (rembg avec le modèle isnet ou BiRefNet, ou SAM) avec **alpha matting** pour les bords. N'utilise pas un simple seuil sur le blanc.
- **Aucun liseré blanc ni halo** autour du flacon. Décontamine les bords : si un pixel de bord est teinté de blanc, rapproche sa couleur de celle du flacon.
- Garde **toutes** les parties du flacon : bouchon, pompe, étiquette, gravures, verre transparent et reflets. Pour un flacon en verre transparent ou blanc, conserve la transparence réelle du verre et le liquide, ne troue pas le flacon et ne laisse pas de bords déchiquetés.
- **Un seul objet** dans l'image finale. Supprime toute ombre portée, tout reflet de sol, tout texte du fond.
- Recadre au plus près du flacon avec une marge de 3 %, flacon **centré**, orienté droit. Sortie en PNG RGBA, côté le plus long entre 1200 et 2000 px.

## 4. Vérification OBLIGATOIRE avant de livrer chaque image

Pour chaque PNG, regarde-le vraiment (ouvre l'image) sur **deux fonds** : noir et blanc. Contrôle :
1. le flacon est entier, droit, net et centré ;
2. aucun morceau de fond n'est resté, aucun halo clair sur fond noir ;
3. rien du flacon n'a été mangé par le détourage (bouchon, bords, verre) ;
4. c'est bien le bon parfum, avec le bon nom lisible ;
5. le fichier fait au moins 1000 px.
Si un critère échoue, **refais le détourage ou cherche une autre source**, jusqu'à trois essais. Si c'est toujours raté, marque la ligne « échec » avec la raison. Ne livre jamais une image douteuse en la déclarant bonne.

## 5. Nommage et livraison

- Nomme chaque fichier **`NNN_maison_nom.png`** avec le numéro de la liste sur 3 chiffres, en minuscules, sans accent, avec des underscores. Exemple : `014_contes_de_parfums_atlantis.png`, `052_matiere_premiere_cologne_cedrat.png`.
- Livre aussi l'image d'origine non détourée dans un second dossier, avec le même nom : `originaux/NNN_maison_nom.jpg`.
- Livre tout dans **un seul zip** : `detoures/` et `originaux/`.
- Ajoute un fichier **`rapport.csv`** avec une ligne par parfum : numéro, maison, nom, statut (ok, échec, doute), URL source, nom officiel lu sur le flacon, format en ml, largeur, hauteur, remarque.

## 6. Règles générales

- Ne t'arrête pas en route pour me poser une question. Si une ligne est ambiguë, choisis la version la plus courante, note-la dans le rapport.
- Ne saute aucune ligne : s'il n'y a vraiment aucune image acceptable, écris « échec » avec la raison.
- À la fin, donne-moi le nombre de lignes ok, en doute et en échec.

## Liste à traiter

### Lot A · Sans photo (25)

001 | Chopard | Miel de Marrakech
002 | Contes de Parfums | Angkor
003 | Contes de Parfums | Miami
004 | Contes de Parfums | New York
005 | Contes de Parfums | Rio de Janeiro
006 | Ella K | Epice Majorelle
007 | Ella K | Epilogue de Sylt
008 | Ella K | Khmer Orris
009 | Ella K | Pluie à Shimonoseki
010 | Hermès | Eau de Ginza
011 | Jovoy | Parisian Memories
012 | Lanvin | Spanish Town
013 | Les Bains Guerbois | 1968 Rhapsody In Paris
014 | Maison Francis Kurkdjian | 754
015 | Matière Première | Cologne Cédrat
016 | Mizensir | Eau de Kalahari
017 | Nishane | Meltemia
018 | Nissaba | Jardin de Mogador
019 | Officine Universelle Buly | Maracujá do Brasil
020 | Officine Universelle Buly | Pamplemousse du Mexique
021 | Pierre Guillaume Paris | Arabie Persane 29
022 | Roja Parfums | Haute Luxe
023 | Tom Ford | Amber Intrigue
024 | Trudon | Tuileries
025 | Zara | Gourmand Oud

### Lot B · Photos à refaire (24), avec le défaut constaté

030 | Glossier | You   (défaut : flacon délavé, bords flous)
037 | Frédéric Malle | French Lover   (défaut : fond blanc non détouré)
039 | Dior | Dior Homme   (défaut : liseré blanc visible)
040 | Dior | Miss Dior EDP   (défaut : liseré blanc visible)
045 | Chanel | Boy Chanel   (défaut : liseré blanc visible)
046 | Chanel | Chance Eau Fraîche   (défaut : liseré blanc visible)
056 | Prada | Paradoxe   (défaut : liseré blanc visible)
060 | Better World Fragrance House | Cloudar   (défaut : sphère floue, texte illisible)
061 | Better World Fragrance House | Summer Mink   (défaut : sphère floue, texte illisible)
071 | Chloé | Chloé   (défaut : flou, ruban blanc collé)
078 | Corner Barcelona | Isla Bohemia   (défaut : on voit un bouchon en bois, pas le flacon)
082 | Dior | Dior Homme Cologne   (défaut : bords dessinés, flacon transparent abîmé)
083 | Dior | Dior Homme Sport   (défaut : bords dessinés, flacon abîmé)
085 | Fendi | Fan di Fendi Pour Homme   (défaut : flacon avec sa boîte)
086 | Fendi | Fendi Furiosa   (défaut : flacon avec sa boîte)
099 | Laboratorio Olfattivo | Nirmal   (défaut : détourage cassé, formes blanches)
109 | Parfum d'Empire | Acqua di Scandola   (défaut : liseré blanc visible)
160 | Creed | Tabarome   (défaut : halo blanc rond autour)
162 | Ella K | Poème de Sagano   (défaut : flacon délavé)
210 | Ella K | Pluie sur Ha Long   (défaut : flacon délavé)
212 | Ex Nihilo | Blue Talisman Extrait   (défaut : tache blanche sous le flacon)
215 | Floraïku | Morning Mist   (défaut : une boîte, pas un flacon)
217 | Guerlain | Aqua Allegoria Limon Verde   (défaut : une boîte avec filigrane)
231 | Maison Crivelli | Cuir InfraRouge   (défaut : trou dans l'étiquette)
235 | Maison Matine | Esprit de Contradiction   (défaut : détourage cassé, image illisible)
