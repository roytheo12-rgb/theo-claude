# Prompt Manus, packshots de parfums détourés

Copie le bloc ci-dessous dans Manus, **un lot à la fois** (45 à 50 parfums maximum, c'est ce qui évite les ratés). Colle la liste du lot à la fin.

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

## Liste à traiter (colle ici un lot)


### Lot 1 · Sans photo (25)

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

### Lot 2 · À refaire, première moitié (50)

026 | Xerjoff | Naxos
027 | Comme des Garçons | Wonderwood
028 | Nasomatto | Baraonda
029 | Creed | Silver Mountain Water
030 | Glossier | You
031 | Guerlain | L'Heure Bleue
032 | Le Labo | Thé Matcha 26
033 | Penhaligon's | The Tragedy of Lord George
034 | Nishane | Hacivat
035 | Chanel | Pour Monsieur Concentrée
036 | Dior | Dior Homme Original
037 | Frédéric Malle | French Lover
038 | Tom Ford | Noir Extreme
039 | Dior | Dior Homme
040 | Dior | Miss Dior EDP
041 | Giardini di Toscana | Bianco Latte
042 | Vilhelm Parfumerie | Basilico & Fellini
043 | Amouage | Opus XIV Royal Tobacco
044 | Carner Barcelona | Tennis Club
045 | Chanel | Boy Chanel
046 | Chanel | Chance Eau Fraîche
047 | Chanel | Paris-Venise
048 | Floris | 1927
049 | Giardini di Toscana | Borabora
050 | Giardini di Toscana | Verde Respiro
051 | Kilian | Old Fashioned
052 | Maison Margiela | Bubble Bath
053 | Memo Paris | Sintra
054 | Memo Paris | Siwa
055 | Oman Luxury | Dejan
056 | Prada | Paradoxe
057 | Une Nuit Nomade | Nothing but Sea and Sky
058 | Yves Saint Laurent | Mon Paris
059 | BDK Parfums | Bouquet de Hongrie
060 | Better World Fragrance House | Cloudar
061 | Better World Fragrance House | Summer Mink
062 | Bortnikoff | Siberia
063 | Boucheron | Ambre d'Alexandrie
064 | Boucheron | Patchouli d'Angkor
065 | Bvlgari | Mon Jasmin Noir
066 | Byredo | Mumbai Noise
067 | Carner Barcelona | D600
068 | Carner Barcelona | El Born
069 | Chanel | 31 Rue Cambon
070 | Chanel | Eau de Cologne
071 | Chloé | Chloé
072 | Contes de Parfums | Agra
073 | Contes de Parfums | Alexandria
074 | Contes de Parfums | Atlantis
075 | Contes de Parfums | Marrakesh

### Lot 3 · À refaire, seconde moitié (50)

076 | Contes de Parfums | Pompeii
077 | Contes de Parfums | Salvador da Bahia
078 | Corner Barcelona | Isla Bohemia
079 | Creed | Aventus for Her
080 | D'Orsay | Tilleul
081 | Dior | Cologne Blanche
082 | Dior | Dior Homme Cologne
083 | Dior | Dior Homme Sport
084 | Diptyque | 34 Boulevard Saint Germain
085 | Fendi | Fan di Fendi Pour Homme
086 | Fendi | Fendi Furiosa
087 | Giardini di Toscana | Bianco Oro
088 | Giardini di Toscana | Colonia Nobile
089 | Guerlain | Angelique Noire
090 | Guerlain | Aqua Allegoria Bergamote Calabria
091 | Guerlain | L'Homme Idéal Cologne Forte
092 | Guerlain | Oud Nude
093 | Guerlain | Pêche Mirage
094 | Hermès | Barénia
095 | Houbigant | Fougère Nobile
096 | Jo Malone | Sea Salt & Bergamot
097 | Khadlaj | Pure Musk
098 | Laboratorio Olfattivo | Baliflora
099 | Laboratorio Olfattivo | Nirmal
100 | Lalique | Encre Noire
101 | Loewe | Paula's Ibiza Eclectic
102 | Louis Vuitton | Pur Oud
103 | Mancera | Tonka Cola
104 | Memo Paris | Sherwood
105 | Montale | Black Aoud
106 | Montale | Vanille Absolu
107 | Nasomatto | Pardon
108 | Nina Ricci | Love in Paris
109 | Parfum d'Empire | Acqua di Scandola
110 | Parfum d'Empire | Musc Tonkin
111 | Parfum d'Empire | Yuzu Fou
112 | Parfums de Marly | Greenley
113 | Parfums de Marly | Oajan
114 | Parfums de Marly | Sedley
115 | Penhaligon's | The Bewitching Yasmine
116 | Rosendo Mateu | No. 4
117 | Santa Maria Novella | Russian Cologne
118 | Theodoros Kalotinis | Aegean Salt & Citrus
119 | Valentino | Voce Viva
120 | Vilhelm Parfumerie | 125th & Bloom
121 | Xerjoff | Mefisto
122 | Xerjoff | Mefisto Gentiluomo
123 | Yves Saint Laurent | Exquisite Embroidery
124 | Yves Saint Laurent | Paris
125 | Yves Saint Laurent | Supreme Bouquet

### Lot 4 · À améliorer (47)

126 | Marc-Antoine Barrois | Ganymede
127 | DS & Durga | Bowmakers
128 | Etat Libre d'Orange | Rien
129 | Kilian | Angels' Share
130 | Acqua di Parma | Colonia
131 | Aesop | Tacit
132 | Creed | Royal Oud
133 | Maison Margiela | Jazz Club
134 | Le Labo | Thé Noir 29
135 | Acqua di Parma | Colonia Assoluta
136 | Amouage | Reflection Man
137 | BDK Parfums | Citrus Riviera
138 | Initio | Musk Therapy
139 | BDK Parfums | Pas Ce Soir
140 | Creed | Aventus Cologne
141 | Essential Parfums | Nice Bergamote
142 | Juliette Has a Gun | Not a Perfume
143 | Oman Luxury | Angham
144 | Comme des Garçons | Garage
145 | Escentric Molecules | Molecule 04
146 | Essential Parfums | Mon Vetiver
147 | Floris | Jermyn Street
148 | Heeley | Sel Marin
149 | Jean Patou | Joy
150 | Maison Crivelli | Papyrus Moléculaire
151 | Maison Margiela | Coffee Break
152 | Memo Paris | Corfu
153 | Penhaligon's | The Favourite
154 | Tom Ford | Beau de Jour
155 | Zoologist | Bat
156 | BDK Parfums | Velvet Tonka
157 | Bvlgari | Man Wood Essence
158 | Bvlgari | Man in Black
159 | Comme des Garçons | Floriental
160 | Creed | Tabarome
161 | Dior | Dioriviera
162 | Ella K | Poème de Sagano
163 | Essential Parfums | Fig Infusion
164 | Essential Parfums | Néroli Botanica
165 | Guerlain | L'Homme Idéal
166 | Guerlain | Mitsouko
167 | Initio | Rehab
168 | L'Artisan Parfumeur | Tea for Two
169 | Maison Crivelli | Iris Malikhân
170 | Maison Crivelli | Santal Volcanique
171 | Mancera | Cedrat Boise
172 | Memo Paris | Flam

### Lot 5 · À améliorer (47)

173 | Memo Paris | Ilha do Mel
174 | Memo Paris | Lalibela
175 | Memo Paris | Winter Palace
176 | Nasomatto | Fantomas
177 | Oman Luxury | Mariya
178 | Parfum d'Empire | Corsica Furiosa
179 | Parfum d'Empire | Wazamba
180 | Roja Parfums | Elysium Pour Femme
181 | Santa Maria Novella | Melograno
182 | Acqua di Parma | Magnolia Infinita
183 | Amouage | Love Tuberose
184 | Armani | Acqua di Giò Profumo
185 | Armani | Oud Nacré
186 | Atelier des Ors | Bois Sikar
187 | Atelier des Ors | Crepuscule Des Ames
188 | Azzaro | Wanted
189 | Azzaro | Wanted Girl
190 | Better World Fragrance House | Carby Musk
191 | Beyoncé | Heat
192 | Bortnikoff | Spanish Honey
193 | Bottega Veneta | Bottega Veneta Pour Homme
194 | Bottega Veneta | Bottega Veneta Pour Homme Extreme
195 | Bottega Veneta | Knot
196 | Bottega Veneta | Parco Palladiano IX: Violetta
197 | Bottega Veneta | Parco Palladiano XII: Quercia
198 | Bvlgari | Pour Homme
199 | Byredo | Casablanca Lily
200 | Byredo | Elevator Music
201 | Cacharel | Amor Amor
202 | Celine | Un Été Français
203 | Chanel | Cuir de Russie
204 | Coelia | Cap Spartel
205 | Contes de Parfums | Paris
206 | D'Orsay | Tilleul Extrait
207 | Dior | Miss Dior Original
208 | Dior | Sauvage EDT
209 | Diptyque | L'Eau Trois
210 | Ella K | Pluie sur Ha Long
211 | Essential Parfums | Orange x Santal
212 | Ex Nihilo | Blue Talisman Extrait
213 | Ex Nihilo | The Hedonist
214 | Fenty | Eau de Parfum
215 | Floraïku | Morning Mist
216 | Gucci | Bloom
217 | Guerlain | Aqua Allegoria Limon Verde
218 | Guerlain | Aqua Allegoria Nerolia Bianca
219 | Guerlain | Bois d'Arménie

### Lot 6 · À améliorer (47)

220 | Guerlain | Eau de Tulle
221 | Guerlain | Iris Torréfié
222 | Guerlain | Oeillet Pourpre
223 | Hugo Boss | Boss Bottled Parfum
224 | Kilian | Angels' Share Paradis
225 | Kilian | Roses on Ice
226 | La Via Del Profumo | Milano Caffe
227 | Laboratorio Olfattivo | Vanagloria
228 | Lattafa | Asad Zanzibar
229 | Liquides Imaginaires | Bello Rabelo
230 | Loewe | Paula's Ibiza
231 | Maison Crivelli | Cuir InfraRouge
232 | Maison Crivelli | Iris Malhikân
233 | Maison Crivelli | Lys Solaberg
234 | Maison Crivelli | Tubéreuse Astrale
235 | Maison Matine | Esprit de Contradiction
236 | Maison Siraj | Élixir d'Amande Extrait
237 | Maison Unika | Oud Osmanthus
238 | Maison Violet | Un Air d'Apogée
239 | Mancera | Amore Caffè
240 | Mancera | Aoud Lemon Mint
241 | Mancera | Red Tobacco
242 | Mancera | Roses Vanille
243 | Memo Paris | Luxor
244 | Montale | Chocolate Greedy
245 | Nishane | Boszporusz
246 | Nishane | Meant To Be Seen
247 | Nissaba | Les Alpes
248 | Oman Luxury | Flowerlush
249 | Oman Luxury | Royal Incense
250 | Oman Luxury | Zafar
251 | Parfum d'Empire | Aziyadé
252 | Penhaligon's | Constantinople
253 | Phlur | Matcha Milk
254 | Profumo di Firenze | Viandante
255 | Santa Maria Novella | Angeli di Firenze
256 | Santa Maria Novella | Fresia
257 | Serge Lutens | Borneo 1834
258 | Strangers Parfumerie | Muscat Jasmine Tea
259 | Sultan Pasha Perfumes | Thebes
260 | Tom Ford | Fougère d'Argent
261 | Tom Ford | Vanille Fatale
262 | Valentino | Uomo Intense
263 | Xerjoff | 1861 - Naxos
264 | Xerjoff | NeoRio
265 | Xerjoff | Starlight
266 | Yves Saint Laurent | Atlas Garden
