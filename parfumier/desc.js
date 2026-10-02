// Petites descriptions des parfums les plus connus (moment idéal : jour / soir / nuit / tous), parfumeurs connus, et lexique.
(function (root) {
  // nom du catalogue -> [moment, description courte]
  const DESC = {
    'Acqua di Giò': ['jour', 'Le grand classique aquatique : marin, léger, propre. Pour l\'été et les journées chaudes.'],
    'Bleu de Chanel EDP': ['tous', 'Agrumes, encens et cèdre : l\'élégant masculin qui va partout, du bureau au dîner.'],
    'Bleu de Chanel EDT': ['jour', 'Plus frais et plus vif que l\'EDP : agrumes, menthe, bois secs. Très propre.'],
    'Sauvage EDT': ['jour', 'Bergamote et poivre sur fond d\'ambroxan : frais, puissant, immédiatement reconnaissable.'],
    'Sauvage Elixir': ['nuit', 'La version dense : épices, lavande, réglisse et santal. Pour le froid et les soirées.'],
    'Aventus': ['tous', 'Ananas fumé, bouleau et musc : le best-seller de niche, sûr de lui, très complimenté.'],
    'Layton': ['soir', 'Pomme, lavande et vanille épicée : élégant, chaud, très tenace. Un parfum d\'automne.'],
    'Tobacco Vanille': ['nuit', 'Tabac et vanille enveloppants, façon salon feutré : un parfum d\'hiver et de soirée.'],
    'Terre d\'Hermès': ['jour', 'Orange et silex, minéral et boisé : sobre, élégant, passe-partout.'],
    'Light Blue': ['jour', 'Citron de Sicile et pomme verte : l\'été en flacon, frais et léger.'],
    'Baccarat Rouge 540': ['soir', 'Ambré floral à la fois sucré et minéral : un sillage immense, reconnaissable entre mille.'],
    'Santal 33': ['tous', 'Santal fumé, cuir et cardamome : le parfum « cool » devenu un signe de reconnaissance.'],
    'Another 13': ['tous', 'Musc et ambroxan minéraux : propre, métallique, mystérieux. Il se fond dans la peau.'],
    'Oud Wood': ['soir', 'Oud boisé et crémeux, poivre de Sichuan : l\'oud le plus facile à porter.'],
    'Black Opium': ['soir', 'Café et vanille gourmande : addictif, pour sortir.'],
    'Libre': ['tous', 'Lavande et fleur d\'oranger sur fond de vanille : affirmé, aussi à l\'aise sur une femme que sur un homme.'],
    'Libre Le Parfum': ['soir', 'La version plus dense de Libre : fleur d\'oranger, vanille et ambre, plus tenace.'],
    'Y EDP': ['jour', 'Pomme, gingembre et sauge sur bois : net, propre, moderne.'],
    'La Nuit de l\'Homme': ['soir', 'Cardamome, lavande et cèdre : le séducteur épicé du soir.'],
    'Good Girl': ['soir', 'Tubéreuse, jasmin, cacao et tonka : sensuel et sombre, pour sortir.'],
    'La Vie est Belle': ['tous', 'Iris, praliné et vanille : un gourmand doux et lumineux, un des plus populaires au monde.'],
    'Coco Mademoiselle': ['tous', 'Orange, rose et patchouli : un chypre frais et chic, très polyvalent.'],
    'N°5 EDP': ['soir', 'Le mythe : aldéhydes et fleurs (ylang, jasmin, rose). Poudré, intemporel.'],
    'Miss Dior EDP': ['jour', 'Un floral frais et vert, rose et pivoine : joyeux et élégant.'],
    'J\'adore': ['jour', 'Un bouquet floral fruité et lumineux : élégant et facile à porter.'],
    'Angel': ['nuit', 'Le pionnier des gourmands : patchouli, caramel, chocolat. On l\'adore ou on le fuit.'],
    'Alien': ['soir', 'Jasmin solaire sur des bois ambrés : lumineux et très présent.'],
    'Flowerbomb': ['soir', 'Une explosion florale sucrée (rose, freesia, patchouli).'],
    'Daisy': ['jour', 'Floral fruité léger, fraise et violette : frais, joyeux, jeune.'],
    'Eau Sauvage': ['jour', 'Le classique citron-vétiver : sec, élégant, sans âge.'],
    'Fahrenheit': ['soir', 'Violette, cuir et une note d\'essence : un ovni culte, à part.'],
    'Invictus': ['jour', 'Pamplemousse marin sur bois : sportif, énergique, pour la journée.'],
    '1 Million': ['nuit', 'Cuir sucré, cannelle et ambre : tape-à-l\'œil et festif, pour la nuit.'],
    'Le Male': ['tous', 'Lavande, menthe et vanille : le barbershop gourmand, un classique qui ne se démode pas.'],
    'Le Male Elixir': ['nuit', 'Miel, tabac, lavande et vanille : une version dense et sucrée pour les soirées d\'hiver.'],
    'Jazz Club': ['soir', 'Rhum, tabac et cuir doux : l\'ambiance d\'un club de jazz.'],
    'By the Fireplace': ['nuit', 'Feu de cheminée : châtaigne, bois fumé et vanille. Le parfum cocon de l\'hiver.'],
    'Lazy Sunday Morning': ['jour', 'Draps propres, musc blanc et poire : un dimanche matin paresseux.'],
    'Tuscan Leather': ['nuit', 'Cuir dense, framboise et safran : puissant, hivernal, pas pour tous les jours.'],
    'Neroli Portofino': ['jour', 'Agrumes et néroli : la Riviera, frais et chic. Parfait dès les premières chaleurs.'],
    'Molecule 01': ['tous', 'Une seule molécule boisée : une aura discrète qui change selon la peau.'],
    'Delina': ['jour', 'Rose, litchi et rhubarbe : romantique et délicat.'],
    'Gypsy Water': ['jour', 'Bois, vanille, pin et bergamote : doux, libre, comme un feu de camp.'],
    'Portrait of a Lady': ['nuit', 'Rose, patchouli, encens et mûre : un monument oriental floral, imposant.'],
    'Musc Ravageur': ['nuit', 'Musc ambré, vanille et épices : sensuel et envoûtant.'],
    'Mojave Ghost': ['jour', 'Fleur de désert, ambrette et santal : léger, poudré, presque fantomatique.'],
    'Philosykos': ['jour', 'La figue en entier, feuille, fruit et bois : vert et lacté.'],
    'Tam Dao': ['tous', 'Santal, cyprès et cèdre : des bois chauds et crémeux, apaisants.'],
    'Do Son': ['jour', 'Tubéreuse blanche, douce et poudrée.'],
    'Ambre Sultan': ['nuit', 'Ambre résineux, épicé et herbal : chaud et enveloppant.'],
    'Naxos': ['nuit', 'Miel, tabac, lavande, cannelle et vanille : l\'un des gourmands-tabac les plus aimés.'],
    'Khamrah': ['nuit', 'Cannelle, datte, praliné et vanille : un gourmand à petit prix devenu ultra populaire.'],
    'Club de Nuit Intense Man': ['tous', 'Citron, ananas, bouleau et musc : souvent comparé à Aventus, à une fraction du prix.'],
    'Hawas': ['jour', 'Pomme, cannelle et notes marines : frais, fruité, très présent.'],
    'Straight to Heaven': ['nuit', 'Rhum, vanille et patchouli : chaud et sensuel.'],
    'Shalimar': ['nuit', 'Le grand oriental : bergamote, iris, vanille et cuir, d\'une sensualité poudrée.'],
    'Aqua Universalis': ['jour', 'Une eau de cologne pure : citron, bergamote, fleur d\'oranger, linge propre.'],
    'Thé Noir 29': ['tous', 'Thé noir, figue et tabac : élégant, un peu fumé, très réconfortant.'],
    'Rose 31': ['soir', 'Une rose épicée et boisée, cuminée : très peu « bouquet de fleurs ».'],
    'Bergamote 22': ['jour', 'Bergamote, pamplemousse et ambre : frais, net, universel.'],
    'Black Afgano': ['nuit', 'Cannabis, résine et café : sombre, dense, très niche.'],
    'Grey Vetiver': ['jour', 'Vétiver sec, pamplemousse et poivre : élégant, sobre, pour le bureau.'],
    'Ombré Leather': ['soir', 'Cuir doux, cardamome et patchouli : plus abordable que d\'autres cuirs.'],
    'Eros': ['soir', 'Menthe, pomme verte et vanille : frais, sucré, très « soirée ».'],
    'Black Orchid': ['nuit', 'Truffe, orchidée noire, patchouli et vanille : sombre, luxuriant, sensuel.'],
    'Lost Cherry': ['soir', 'Cerise noire, amande amère et fève tonka : gourmand, luxueux, très présent.'],
    'Habit Rouge': ['soir', 'Agrumes, cuir et vanille : un classique ambré-poudré, élégant et un peu rétro.'],
    'Colonia': ['jour', 'Le grand classique italien : agrumes, lavande et romarin, frais et soigné.'],
    'Ultra Male': ['nuit', 'Poire, lavande et vanille noire : un gourmand frais et sucré, pour sortir.'],
    'Phantom': ['soir', 'Lavande et citron sur vanille et bois : frais, sucré, très marqué.'],
    'Sauvage EDP': ['soir', 'Plus doux et plus vanillé que l\'EDT : bergamote, lavande et fève tonka.'],
    'Herod': ['nuit', 'Cannelle, tabac et vanille : chaud, doux et boisé, un parfum d\'hiver.'],
    'Khamrah Qahwa': ['nuit', 'Café, cannelle et vanille gourmande : la version « café » de Khamrah.'],
    'Gentleman Réserve Privée': ['soir', 'Rhum, iris et vanille : un boisé gourmand et chaud.'],
    'Scandal': ['soir', 'Miel, gardénia et caramel : gourmand, joueur, sensuel.'],
    'Le Beau': ['jour', 'Noix de coco, bergamote et bois : solaire, crémeux, très estival.'],
  };
  // parfumeur (nez) quand il est connu et sûr ; sinon absent
  const NOSE = {
    'Baccarat Rouge 540': 'Francis Kurkdjian', 'Aqua Universalis': 'Francis Kurkdjian', 'Oud Satin Mood': 'Francis Kurkdjian', '724': 'Francis Kurkdjian', 'Le Male': 'Francis Kurkdjian',
    'Portrait of a Lady': 'Dominique Ropion', 'Vétiver Extraordinaire': 'Dominique Ropion', 'Musc Ravageur': 'Maurice Roucel',
    'Terre d\'Hermès': 'Jean-Claude Ellena', 'Santal 33': 'Frank Voelkl', 'Rose 31': 'Daphné Bugey', 'Thé Noir 29': 'Daphné Bugey',
    'Gypsy Water': 'Jérôme Epinette', 'Mojave Ghost': 'Jérôme Epinette', 'Bal d\'Afrique': 'Jérôme Epinette',
    'N°5 EDP': 'Ernest Beaux', 'Coco Mademoiselle': 'Jacques Polge', 'Bleu de Chanel EDP': 'Jacques Polge', 'Bleu de Chanel EDT': 'Jacques Polge',
    'Shalimar': 'Jacques Guerlain', 'Habit Rouge': 'Jean-Paul Guerlain', 'Sauvage EDT': 'François Demachy', 'Sauvage Elixir': 'François Demachy', 'Sauvage EDP': 'François Demachy', 'Eau Sauvage': 'Edmond Roudnitska', 'J\'adore': 'Calice Becker',
    'Tobacco Vanille': 'Harry Fremont', 'Black Orchid': 'Pierre Negrin et David Apel', 'Lost Cherry': 'Louise Turner', 'Tuscan Leather': 'Rodrigo Flores-Roux',
    'Jazz Club': 'Marie Salamagne', 'By the Fireplace': 'Marie Salamagne', 'Lazy Sunday Morning': 'Aurélien Guichard', 'Eros': 'Aurélien Guichard',
    'Angel': 'Olivier Cresp et Yves de Chirin', 'Alien': 'Dominique Ropion et Laurent Bruyère', 'Light Blue': 'Olivier Cresp', 'Acqua di Giò': 'Alberto Morillas',
    'Layton': 'Nicolas Beaulieu', 'Delina': 'Quentin Bisch', 'Tam Dao': 'Daniela Andrier', 'Philosykos': 'Olivia Giacobetti', 'Do Son': 'Olivia Giacobetti',
    'Ambre Sultan': 'Christopher Sheldrake', 'Molecule 01': 'Geza Schoen', 'Naxos': 'Christian Carbonnel', 'Black Afgano': 'Alessandro Gualtieri',
    'La Vie est Belle': 'Olivier Polge, Dominique Ropion et Anne Flipo',
  };
  const NOSE_HOUSE = { 'Maison Francis Kurkdjian': 'Francis Kurkdjian' };
  // Lexique, astuces et histoire : une carte par jour, sans en faire trop
  const LEX = [
    ['Mot', 'Sillage', 'La trace qui reste derrière toi quand tu passes. Un bon sillage se remarque sans s\'imposer.'],
    ['Mot', 'Tête, cœur, fond', 'Les trois étages d\'un parfum : la tête s\'évapore en quelques minutes, le cœur dure quelques heures, le fond reste.'],
    ['Mot', 'Accord', 'Plusieurs notes mélangées qui forment une impression nouvelle : un « accord cuir », un « accord marin ».'],
    ['Mot', 'Projection et tenue', 'La projection, c\'est jusqu\'où il se sent autour de toi. La tenue, c\'est combien de temps il reste. Ce n\'est pas la même chose.'],
    ['Mot', 'EDT, EDP, extrait', 'Plus un parfum est concentré, plus il dure en général. Ce n\'est pas toujours « plus fort » : l\'extrait est souvent plus doux et plus profond.'],
    ['Mot', 'Absolu', 'Une extraction très concentrée d\'une matière naturelle (jasmin absolu, rose absolue). Riche, dense, coûteuse.'],
    ['Mot', 'Oud', 'Un bois résineux du bois d\'agar, transformé par un champignon : fumé, animal, balsamique. Très présent, très recherché.'],
    ['Mot', 'Chypre', 'Une famille bâtie sur la bergamote, le labdanum, la mousse de chêne et le patchouli. Son nom vient de « Chypre », de Coty, en 1917.'],
    ['Mot', 'Fougère', 'Lavande, mousse de chêne et coumarine : le grand classique des parfums masculins, sec et propre.'],
    ['Mot', 'Aldéhydes', 'Des molécules qui donnent un effet pétillant, un peu savonneux. Elles ont rendu célèbre le N°5 de Chanel.'],
    ['Mot', 'Ambroxan', 'Une molécule ambrée, minérale et très tenace, présente dans de nombreux parfums frais modernes.'],
    ['Mot', 'Flanker', 'Une déclinaison d\'un parfum existant (Elixir, Intense, Parfum…) : même nom, autre dosage, autre humeur.'],
    ['Mot', 'Gourmand', 'Des notes qui font penser à la pâtisserie : vanille, caramel, praliné, cacao. Réconfortant, souvent plus lourd.'],
    ['Mot', 'Musc blanc', 'Un effet « peau propre » ou « linge frais », doux et discret, qui s\'accroche très bien à une autre note.'],
    ['Astuce', 'Peau hydratée', 'Vaporise sur une peau hydratée : le parfum accroche et tient plus longtemps.'],
    ['Astuce', 'Ne frotte pas', 'Frotter les poignets l\'un contre l\'autre écrase les notes de tête. Vaporise, puis laisse sécher.'],
    ['Astuce', 'Là où il fait chaud', 'Cou, poignets, creux du coude : la chaleur de la peau diffuse le parfum.'],
    ['Astuce', 'Attends avant de juger', 'Sur la peau, un parfum change : attends 20 à 30 minutes avant de savoir s\'il te va.'],
    ['Astuce', 'Pas plus de trois', 'Au-delà de trois parfums testés d\'affilée, le nez sature. Fais une pause, sors prendre l\'air.'],
    ['Astuce', 'À l\'abri', 'Garde tes flacons à l\'abri de la lumière et de la chaleur, dans leur boîte : surtout pas dans la salle de bain.'],
    ['Astuce', 'Le layering', 'Pour superposer deux parfums, commence par le plus léger, termine par le plus marqué. Et un spray de chaque suffit.'],
    ['Histoire', 'L\'eau de Cologne', 'Elle est née à Cologne au début du XVIIIe siècle, avec Giovanni Maria Farina : agrumes frais, pensés comme un souffle d\'un matin de printemps.'],
    ['Histoire', 'Fougère Royale', 'Créé par Houbigant en 1882, c\'est le premier parfum à utiliser la coumarine de synthèse : il a lancé toute la famille des fougères.'],
    ['Histoire', 'Chanel N°5', 'Sorti en 1921, composé par Ernest Beaux, il a popularisé les aldéhydes. Un siècle plus tard, il reste une référence.'],
    ['Histoire', 'Shalimar', 'Créé par Jacques Guerlain en 1925, c\'est l\'un des premiers grands parfums orientaux : bergamote, vanille, cuir.'],
    ['Histoire', 'Angel', 'Lancé par Mugler en 1992, il a imposé le parfum gourmand : patchouli, caramel, chocolat. Tout un courant est parti de là.'],
    ['Histoire', 'Santa Maria Novella', 'La pharmacie florentine, dont l\'histoire remonte aux dominicains du XIIIe siècle, vend ses parfums au public depuis 1612.'],
    ['Histoire', 'Diptyque', 'Née en 1961 d\'une boutique du 34 boulevard Saint-Germain, à Paris, la maison est restée liée à cette adresse.'],
    ['Histoire', 'Grasse', 'La ville de Grasse est devenue la capitale du parfum après avoir été celle du cuir : on y parfumait les gants.'],
  ];

  // ---------- Tags pour trier : abordable, niche, designer, luxe, collection privée, arabe, maison historique, iconique ----------
  const TAGS = { abordable: 'Abordable', designer: 'Designer', niche: 'Niche', luxe: 'Luxe', prive: 'Collection privée', arabe: 'Arabe / oriental', historique: 'Maison historique', iconique: 'Iconique' };
  const H = {};
  const put = (tag, list) => list.forEach((h) => { (H[h] = H[h] || new Set()).add(tag); });
  put('niche', ['19-69', 'Aedes de Venustas', 'Aesop', 'Akro', 'Amouage', 'Andrea Maack', 'Andy Tauer', 'Areej le Doré', 'Atelier Cologne', 'Atelier des Ors', 'Atelier Materi', 'BDK Parfums', 'Bogue Profumo', 'Bon Parfumeur', 'Bontemps Paris', 'Bortnikoff', 'Brume Orpin', 'Byredo', 'Carner Barcelona', 'Clive Christian', 'Contes de Parfums', 'Creed', 'D.S. & Durga', 'Diptyque', 'Dries Van Noten', 'Ella K', 'Escentric Molecules', 'Essential Parfums', 'Etat Libre d\'Orange', 'Ex Nihilo', 'Filippo Sorcinelli', 'Floraïku', 'Floris', 'Fragrance du Bois', 'Francesca Bianchi', 'Frédéric Malle', 'Fueguia 1833', 'Giardini di Toscana', 'Goldfield & Banks', 'Grossmith', 'Hiram Green', 'Histoires de Parfums', 'Horace', 'Initio', 'Isabey', 'Jeroboam', 'Jo Malone', 'Jorum Studio', 'Jovoy', 'Juliette Has a Gun', 'Kilian', 'L\'Artisan Parfumeur', 'L\'Entropiste', 'Laboratorio Olfattivo', 'Le Labo', 'Les Bains Guerbois', 'Les Indémodables', 'Librery', 'Liquides Imaginaires', 'Lubin', 'Maison Crivelli', 'Maison Francis Kurkdjian', 'Maison Goutal', 'Maison Louis Marie', 'Maison Matahá', 'Maison Matine', 'Maison Rebatchi', 'Maison Tahité', 'Maison Violet', 'Mancera', 'Marc-Antoine Barrois', 'Masque Milano', 'Matière Première', 'MDCI', 'Memo Paris', 'Mendittorosa', 'Miglot', 'Miller Harris', 'Montale', 'Naomi Goodsir', 'Nasomatto', 'Nicolaï', 'Nishane', 'Nissaba', 'Nobile 1942', 'Nomenclature', 'Obvious', 'Officine Universelle Buly', 'Oman Luxury', 'Ormonde Jayne', 'Orto Parisi', 'Papillon Artisan Perfumes', 'Parfum d\'Empire', 'Parfums de Marly', 'Parle Moi de Parfum', 'Penhaligon\'s', 'Perfumer H', 'Perris Monte Carlo', 'Phaedon Paris', 'Pierre Guillaume Paris', 'Place de la Rêverie', 'Poécile', 'Profumum Roma', 'Ramon Monegal', 'Rania J', 'Réservation Parfums', 'Roja Parfums', 'Room 1015', 'Santa Maria Novella', 'Serge Lutens', 'Teo Cabanel', 'The Different Company', 'Thomas de Monaco', 'Tiziana Terenzi', 'Une Nuit Nomade', 'Vilhelm Parfumerie', 'Widian', 'Xerjoff']);
  put('designer', ['Armani', 'Azzaro', 'Boucheron', 'Burberry', 'Bvlgari', 'Calvin Klein', 'Carolina Herrera', 'Cartier', 'Chanel', 'Courrèges', 'Dior', 'Dolce & Gabbana', 'Emporio Armani', 'Fendi', 'Givenchy', 'Gucci', 'Guerlain', 'Hermès', 'Hugo Boss', 'Issey Miyake', 'Jean Paul Gaultier', 'Kenzo', 'Lalique', 'Lancôme', 'Loewe', 'Louis Vuitton', 'Maison Margiela', 'Marc Jacobs', 'Montblanc', 'Mugler', 'Narciso Rodriguez', 'Nautica', 'Nina Ricci', 'Prada', 'Rabanne', 'Rochas', 'Tom Ford', 'Valentino', 'Van Cleef & Arpels', 'Versace', 'Viktor&Rolf', 'Yves Saint Laurent', 'Zara', 'Acqua di Parma']);
  put('abordable', ['Afnan', 'Armaf', 'French Avenue', 'Lattafa', 'Rasasi', 'Zara', 'Nautica', 'Calvin Klein', 'Azzaro', 'Hugo Boss', 'Montblanc', 'Versace', 'Burberry', 'Kenzo', 'Issey Miyake', 'Rochas', 'Nina Ricci', 'Carolina Herrera', 'Marc Jacobs', 'Fragonard', 'Bon Parfumeur']);
  put('luxe', ['Louis Vuitton', 'Hermès', 'Roja Parfums', 'Clive Christian', 'Creed', 'Amouage', 'Xerjoff', 'MDCI', 'Cartier', 'Van Cleef & Arpels', 'Tiziana Terenzi', 'Ormonde Jayne', 'Floris']);
  put('arabe', ['Afnan', 'Armaf', 'French Avenue', 'Lattafa', 'Rasasi', 'Oman Luxury', 'Amouage', 'Widian', 'Areej le Doré']);
  put('historique', ['Guerlain', 'Houbigant', 'Caron', 'Floris', 'Penhaligon\'s', 'Lubin', 'Santa Maria Novella', 'Grossmith', 'Acqua di Parma', 'Creed']);
  // Parfums du catalogue détaillé qui sortent d'une collection privée (les autres sont repérés par la ligne d'origine dans l'index)
  const PRIVATE = new Set(['Oud Ispahan', 'Rouge Trafalgar', 'Tobacco Vanille', 'Oud Wood', 'Tuscan Leather', 'Ombré Leather', 'Neroli Portofino', 'Lost Cherry', 'Jasmin Rouge', 'Tuxedo', 'Babycat', 'Néroli Amara']);
  function tagsOf(name, house, price, flags) {
    const t = new Set(H[house] || []);
    if (price > 0 && price <= 100) t.add('abordable');
    if (price >= 250) t.add('luxe');
    if ((flags && String(flags).includes('P')) || PRIVATE.has(name)) { t.add('prive'); t.add('luxe'); }
    if (DESC[name]) t.add('iconique');
    if (t.has('luxe')) t.delete('abordable');
    if (t.has('niche') && t.has('designer')) t.delete('designer');
    return [...t];
  }
  root.TAGS = TAGS; root.tagsOf = tagsOf;

  // Les nez les plus connus : rôle et petite présentation (faits sûrs uniquement)
  const NOSE_BIO = {
    'Bruno Jovanovic': ['Parfumeur', 'Dior Homme Sport, Tom Ford Noir, Burberry Hero, Jil Sander Strictly Fresh et plusieurs parfums de Dries Van Noten : des masculins frais et boisés, nets et faciles à porter.'],
    'Edmond Roudnitska': ['Parfumeur du XXe siècle', 'Eau Sauvage (Dior, 1966) et Diorissimo : la fraîcheur citronnée et le muguet comme référence. Un des grands théoriciens du parfum.'],
    'Jacques Guerlain': ['Parfumeur de la maison Guerlain', 'Shalimar, Mitsouko, L\'Heure Bleue : les grands classiques ambrés de Guerlain, créés au début du XXe siècle.'],
    'Francis Kurkdjian': ['Parfumeur et fondateur de sa maison', 'Révélé à 25 ans avec Le Mâle de Jean Paul Gaultier (1995), il fonde sa maison en 2009 : Baccarat Rouge 540, Aqua Universalis, 724. Il dirige aussi la création des parfums Dior depuis 2021. Son style : lumineux, aérien, très reconnaissable.'],
    'Alberto Morillas': ['Parfumeur, l\'un des plus prolifiques au monde', 'Né à Séville, installé en Suisse. Il a signé CK One (avec Harry Fremont), Acqua di Giò, Daisy et Bright Crystal. Son style : propre, lumineux, facile à aimer, souvent aquatique ou frais.'],
    'Dominique Ropion': ['Parfumeur, maître des fleurs blanches', 'Il a composé Portrait of a Lady, Carnal Flower et Vetiver Extraordinaire pour Frédéric Malle, Alien (avec Laurent Bruyère) et Amarige. Ses parfums sont amples, riches, très présents.'],
    'Jean-Claude Ellena': ['Ancien nez exclusif d\'Hermès', 'Nez d\'Hermès de 2004 à 2016 : Terre d\'Hermès et la série des Jardins. Son style : épuré, minimaliste, quelques notes seulement, jamais lourd. Il a aussi écrit plusieurs livres sur le parfum.'],
    'Olivier Polge': ['Nez de Chanel', 'Nez de la maison depuis 2015, fils de Jacques Polge. Gabrielle, Bleu de Chanel Eau de Parfum, N°5 L\'Eau ; il a aussi signé Flowerbomb (avec Carlos Benaïm et Domitille Bertier) et Dior Homme.'],
    'Jacques Polge': ['Ancien nez de Chanel', 'Nez de Chanel de 1978 à 2015 : Coco, Coco Mademoiselle, Chance, Allure et Bleu de Chanel. Une élégance classique, très française.'],
    'Jacques Cavallier-Belletrud': ['Parfumeur maison de Louis Vuitton', 'Formé à Grasse, nez de Louis Vuitton depuis 2012 : Ombre Nomade, Imagination, Étoile Filante. Auteur aussi de L\'Eau d\'Issey. Il aime les matières nobles et les grands espaces.'],
    'Christine Nagel': ['Nez d\'Hermès', 'Nez d\'Hermès depuis 2014 : Twilly d\'Hermès, H24, Galop d\'Hermès, Eau de Citron Noir. Son style : sensuel, texturé, souvent plus chaud que celui de son prédécesseur.'],
    'Thierry Wasser': ['Nez de Guerlain', 'Parfumeur maison de Guerlain depuis 2008 : L\'Homme Idéal, La Petite Robe Noire, et la collection L\'Art & la Matière. Il veille sur l\'héritage de la maison tout en le modernisant.'],
    'Maurice Roucel': ['Parfumeur, l\'audace du musc', 'Il a signé Musc Ravageur et Dans Tes Bras (Frédéric Malle) ainsi qu\'Insolence (Guerlain). Son style : sensuel, animal, sans peur du caractère.'],
    'Quentin Bisch': ['Parfumeur de la nouvelle génération', 'Delina (Parfums de Marly), Ganymede (Marc-Antoine Barrois), Fleur Narcotique (Ex Nihilo), des Gaultier récents : des parfums modernes, très commentés.'],
    'Bertrand Duchaufour': ['Parfumeur indépendant et voyageur', 'Timbuktu et Dzongkha (L\'Artisan Parfumeur), Amaranthine (Penhaligon\'s), Avignon (Comme des Garçons). Son style : encens, bois fumés, matières inattendues.'],
    'Calice Becker': ['Parfumeuse', 'Elle a composé J\'adore (Dior) et plusieurs parfums de Kilian (Good Girl Gone Bad, Straight to Heaven). Son style : floral lumineux, soyeux.'],
    'Olivier Cresp': ['Parfumeur', 'Angel (1992, avec Yves de Chirin) a lancé la famille des gourmands. Il a aussi signé Light Blue (Dolce & Gabbana) et des parfums Montblanc.'],
    'Pierre Bourdon': ['Parfumeur de classiques', 'À l\'origine de Cool Water (Davidoff), Kouros (YSL) et Green Irish Tweed (Creed) : des parfums masculins qui ont fait date.'],
    'Jérôme Epinette': ['Parfumeur de Byredo', 'Collaborateur de longue date de Byredo : Gypsy Water, Bal d\'Afrique, Mojave Ghost, Blanche. Un style doux, poudré, très contemporain.'],
    'Alessandro Gualtieri': ['Fondateur et parfumeur de Nasomatto', 'Il compose seul, avec des concentrations très élevées : Black Afgano, Baraonda, Pardon, Narcotic Venus. Des parfums radicaux, sombres, hypnotiques.'],
    'Frank Voelkl': ['Parfumeur de Le Labo', 'Il a signé les grands classiques du Labo : Santal 33, Another 13, Thé Noir 29. Il a aussi travaillé pour Kilian.'],
    'Daniela Andrier': ['Parfumeuse de Prada', 'Infusion d\'Iris, L\'Homme Prada, Luna Rossa : l\'élégance sobre et poudrée de la maison.'],
    'Anne Flipo': ['Parfumeuse', 'Libre (Yves Saint Laurent), Lady Million, des Jo Malone : des parfums grand public à forte personnalité.'],
    'Mathilde Laurent': ['Nez de Cartier', 'Baiser Volé, La Panthère, Déclaration d\'un soir : des parfums raffinés, souvent floraux et sensuels.'],
    'François Demachy': ['Ancien parfumeur-créateur de Dior', 'Nez de Dior de 2006 à 2021 : Sauvage, Miss Dior et une grande partie de la Collection Privée. Son style : élégant, généreux, très français.'],
    'Ernest Beaux': ['Parfumeur historique de Chanel', 'Il a composé le N°5 de Chanel (1921), qui a popularisé les aldéhydes. Un nom entré dans l\'histoire du parfum.'],
    'Olivia Giacobetti': ['Parfumeuse', 'Philosykos et Do Son pour Diptyque, En Passant pour Frédéric Malle : un style transparent, aérien, très épuré.'],
    'Christophe Raynaud': ['Parfumeur', 'L\'un des créateurs de 1 Million de Paco Rabanne (avec Olivier Pescheux et Michel Girard).'],
    'Jean-Paul Guerlain': ['Ancien nez de Guerlain', 'Héritier de la famille Guerlain : Habit Rouge, Samsara. Un style ambré, poudré, très classique.'],
    'Marie Salamagne': ['Parfumeuse de Maison Margiela Replica', 'Jazz Club, By the Fireplace : l\'art de raconter un souvenir en parfum.'],
    'Antoine Lie': ['Parfumeur', 'Etat Libre d\'Orange (Rien, Jasmin et Cigarette), Interlude Man (Amouage), Nasomatto : des parfums audacieux.'],
    'Mark Buxton': ['Parfumeur indépendant', 'La collection Comme des Garçons (Black, 2), mais aussi Jovoy et Nasomatto : un style graphique, très affirmé.'],
    'Nathalie Lorson': ['Parfumeuse', 'Libre et Black Opium (Yves Saint Laurent), Encre Noire (Lalique), L\'Interdit (Givenchy).'],
    'Fabrice Pellegrin': ['Parfumeur de BDK et d\'Essential Parfums', 'Gris Charnel, Tabac Rose, Velvet Tonka (BDK), Patchouli Mania, Fig Infusion (Essential Parfums), Habanita (Molinard) : une signature musquée, boisée et très actuelle.'],
    'Aurélien Guichard': ['Parfumeur', 'Matière Première, Parfums de Marly, Azzaro The Most Wanted.'],
    'Louise Turner': ['Parfumeuse', 'BDK Parfums (Gris Charnel), Jo Malone, Diptyque.'],
    'Daphné Bugey': ['Parfumeuse', 'Le Labo (Rose 31, Thé Noir 29), Byredo, Serge Lutens.'],
    'Julien Rasquinet': ['Parfumeur', 'Layton et Carlisle (Parfums de Marly), Side Effect (Initio).'],
    'Sidonie Lancesseur': ['Parfumeuse', 'Delina (Parfums de Marly), Kilian, Initio.'],
    'Carlos Benaïm': ['Parfumeur', 'Tom Ford (Oud Wood, Neroli Portofino), Estée Lauder, Calvin Klein.'],
    'Olivier Pescheux': ['Parfumeur', 'Dior Sauvage, Montblanc Explorer, Diptyque Philosykos.'],
    'Sophie Labbé': ['Parfumeuse', 'Bvlgari (Omnia, Rose Goldea), Dior, Valentino.'],
    'Annick Menardo': ['Parfumeuse', 'A*Men (Mugler), Bvlgari Black, Hypnotic Poison (Dior).'],
  };
  const NOSE_TOP = ['Francis Kurkdjian', 'Alberto Morillas', 'Dominique Ropion', 'Jean-Claude Ellena', 'Olivier Polge', 'Jacques Polge', 'François Demachy', 'Jacques Cavallier-Belletrud', 'Christine Nagel', 'Thierry Wasser', 'Maurice Roucel', 'Quentin Bisch', 'Bertrand Duchaufour', 'Calice Becker', 'Olivier Cresp', 'Jérôme Epinette', 'Marie Salamagne', 'Fabrice Pellegrin', 'Bruno Jovanovic', 'Annick Menardo', 'Julien Rasquinet'];
  root.NOSE_BIO = NOSE_BIO; root.NOSE_TOP = NOSE_TOP;

  // ---------- Genre : pour lui / pour elle / mixte (repère de commercialisation, pour ne pas recommander un parfum nettement « girly » à un homme, ni l'inverse) ----------
  const GM = ['Acqua di Giò', 'Bleu de Chanel EDP', 'Bleu de Chanel EDT', 'Sauvage EDT', 'Sauvage EDP', 'Sauvage Elixir', 'Terre d\'Hermès', 'Y EDP', 'La Nuit de l\'Homme', 'Eau Sauvage', 'Fahrenheit', 'Invictus', '1 Million', 'Stronger With You', 'Stronger With You Intensely', 'Le Male', 'Le Male Elixir', 'Grey Vetiver', 'Encre Noire', 'Green Irish Tweed', 'Vétiver', 'Explorer', 'Legend', 'L\'Homme', 'Club de Nuit Intense Man', 'Hawas', 'Voyage', 'Reflection Man', 'Interlude Man', 'Boss Bottled', 'Pour un Homme de Caron', 'Dior Homme Intense', 'Ultra Male', 'Phantom', 'Eros', 'Habit Rouge', 'Gentleman Réserve Privée', 'Le Beau', 'Spicebomb Extreme', 'Aventus', 'Armani Code', 'Ombré Leather'];
  const GF = ['Light Blue', 'Black Opium', 'Libre', 'Libre Le Parfum', 'Good Girl', 'La Vie est Belle', 'Coco Mademoiselle', 'N°5 EDP', 'Chance Eau Tendre', 'Miss Dior EDP', 'Miss Dior Essence', 'J\'adore', 'Angel', 'Alien', 'Flowerbomb', 'Daisy', 'Si', 'Burberry Her', 'Pure Musc Blanc', 'L\'Interdit Rouge', 'Power of You', 'Scandal', 'Scandal By Night', 'Paradoxe Intense', 'Shalimar', 'Aqua Allegoria Rosa Verde', 'Delina', 'Yara', 'Jasmin Rouge', 'Acne Studios', 'Stellar Times', 'Radical Rose', 'Étoile Filante', 'Contre Moi', 'Coeur Battant'];
  const GSET = {}; GM.forEach((n) => { GSET[n] = 'm'; }); GF.forEach((n) => { GSET[n] = 'f'; });
  const WM = /\b(homme|men|man|uomo|male|mâle|lui|him|boy|gentleman|sport|sir|pour monsieur|monsieur|hero|wanted)\b/, WF = /\b(femme|woman|women|donna|her|girl|lady|belle|fille|she|bloom|blossom|princess|miss|mademoiselle|dame|elle|queen|rose goldea|omnia)\b/;
  // Règles par maison : (maison, nom) -> 'm' / 'f'. Ce qui n'est pas reconnu reste mixte.
  const GR = [
    [/marc jacobs/, /daisy|perfect|lola/, 'f'], [/mugler/, /^(alien|angel|aura|womanity)(?!.*\bman\b)/, 'f'], [/mugler/, /a\*men|alien man/, 'm'],
    [/carolina herrera/, /^(212(?!.*\bmen\b)(?!.*\bsexy men)|good girl|very good girl|la bomba|chic|ch priv|me first)/, 'f'], [/carolina herrera/, /bad boy|212 (men|sexy men|nyc men)|heroes/, 'm'],
    [/gaultier/, /la belle|classique|ma dame|fragile|gaultier divine|gaultier 2/, 'f'], [/gaultier/, /le beau|le male|ultra male|scandal pour homme|monsieur|fleur du m/, 'm'],
    [/burberry/, /my burberry|\bher\b|blush|brit rhythm for her|goddess/, 'f'], [/burberry/, /mr\.? burberry|hero|the beat for men|brit rhythm for him/, 'm'],
    [/rabanne|paco/, /lady million|olymp|fame|pure xs for her|black xs for her/, 'f'], [/rabanne|paco/, /1 million|one million|invictus|phantom|pure xs(?! for her)|black xs(?! for her)/, 'm'],
    [/lanc[oô]me/, /la vie est belle|id[oô]le|miracle(?! homme)|tr[eé]sor|po[eê]me|hypn[oô]se(?! homme)|la nuit tr/, 'f'],
    [/guerlain/, /petite robe noire|idylle|mon guerlain|aqua allegoria|shalimar|insolence|mitsouko|l'heure|champs|samsara|rose barbare|elixir charnel/, 'f'], [/guerlain/, /habit rouge|l'homme id|guerlain homme|l'instant pour homme|vetiver|v[eé]tiver/, 'm'],
    [/chanel/, /chance|coco|gabrielle|n[°o] ?5|n[°o] ?1|no\.? ?5|misia|cristalle|boy/, 'f'], [/chanel/, /bleu|allure homme|[eé]go[iï]ste|platinum|pour monsieur/, 'm'],
    [/saint laurent|ysl/, /libre|black opium|mon paris|parisienne|cinema|elle\b|manifesto|opium(?! pour homme)|belle d'opium|lady/, 'f'], [/saint laurent|ysl/, /^y\b|l'homme|nuit de l'homme|opium pour homme|kouros|rive gauche pour homme|jazz/, 'm'],
    [/herm[eè]s/, /twilly|jour d'herm|kelly|24 faubourg|merveilles|rose amazone|galop|bar[eé]nia|narcisse|cythère|cythere/, 'f'], [/herm[eè]s/, /terre d'herm|h24|bel ami|[eé]quipage|paddock|brin de r|voyage/, 'm'],
    [/dior/, /miss dior|j'adore|addict|poison|dune(?! pour homme)|diorissimo|diorella|dioressence|dolce vita|forever and ever|jasmin des anges|lucky|rose star|diorling|joy|bonne [eé]toile|j'adior/, 'f'], [/dior/, /sauvage|homme|fahrenheit|dune pour homme|jules|higher/, 'm'],
    [/armani/, /^s[iì]\b|^s[iì] |code (for )?women|my way|la femme|rose|figuier|ambre soie|armani mania|diamonds/, 'f'], [/armani/, /acqua di gi[oò](?! (pour )?femme)|armani code(?! (for )?women)|stronger with you|emporio.*(him|lui)|code profumo|attitude/, 'm'],
    [/dolce/, /light blue(?! (pour|eau intense pour))|the one(?! (for )?men)|devotion(?! pour homme)|dolce shine|q by|dolce\b/, 'f'], [/dolce/, /pour homme|for men|k by|masculine|by man/, 'm'],
    [/montblanc/, /legend|explorer|emblem|individuel(?! femme)/, 'm'], [/hugo boss|boss/, /bottled|the scent|orange man|man|hugo/, 'm'], [/hugo boss|boss/, /alive|ma vie|nuit|femme|woman/, 'f'],
    [/davidoff/, /cool water(?! woman)|horizon|zino/, 'm'], [/issey miyake/, /l'eau d'issey(?! pour homme)|lumi[eè]re d'issey|a drop d'issey/, 'f'], [/kenzo/, /flower|kenzo world|eau de fleur|l'eau kenzo pour femme/, 'f'],
    [/narciso/, /./, 'f'], [/versace/, /bright crystal|crystal noir|yellow diamond|dylan purple|pour femme|woman|versense/, 'f'], [/versace/, /eros|dylan blue(?! pour femme)|pour homme|man eau/, 'm'],
    [/jimmy choo/, /^jimmy choo(?! man)/, 'f'], [/nina ricci/, /./, 'f'], [/stella mccartney/, /./, 'f'], [/cacharel/, /./, 'f'], [/chlo[eé]/, /^(?!.*homme)/, 'f'], [/tommy hilfiger/, /^tommy( 10)?$/, 'm'],
    [/balmain/, /monsieur|carbone|destin/, 'm'], [/calvin klein/, /euphoria|truth|obsession|eternity(?! (for )?men)/, 'f'], [/calvin klein/, /eternity (parfum )?for men|obsession for men/, 'm'],
    [/lalique/, /encre noire/, 'm'], [/jean paul/, /^(?!.*(le male|le beau|ultra|scandal pour|monsieur))/, 'u'],
  ];
  function genderOf(name, house) {
    if (root.FACTS) { const nz = (x) => String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(), f = root.FACTS[nz(house) + '|' + nz(name)]; if (f && f.g) return f.g; }   // faits vérifiés (sites des marques) avant les règles
    if (GSET[name]) return GSET[name];
    const hn = String(house || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), nn = String(name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const base = String(name || '').replace(/\s+(EDP|EDT|EDC|Elixir|Intense|Parfum|Extrait)$/i, '');
    if (GSET[base]) return GSET[base];
    for (const c of ['EDT', 'EDP']) if (GSET[base + ' ' + c]) return GSET[base + ' ' + c];
    for (const [hr, nr, g] of GR) if (hr.test(hn) && nr.test(nn)) return g;
    const t = String(name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (WM.test(t)) return 'm';
    if (WF.test(t)) return 'f';
    return 'u';
  }
  root.genderOf = genderOf;
  // Maisons du plus au moins connu (pour classer la liste) ; les autres suivent par nombre de parfums
  const HOUSE_FAME = ['Chanel', 'Dior', 'Yves Saint Laurent', 'Guerlain', 'Hermès', 'Tom Ford', 'Armani', 'Givenchy', 'Louis Vuitton', 'Jean Paul Gaultier', 'Rabanne', 'Prada', 'Gucci', 'Dolce & Gabbana', 'Versace', 'Calvin Klein', 'Burberry', 'Lancôme', 'Mugler', 'Viktor&Rolf', 'Carolina Herrera', 'Montblanc', 'Bvlgari', 'Cartier', 'Valentino', 'Byredo', 'Le Labo', 'Maison Francis Kurkdjian', 'Diptyque', 'Maison Margiela', 'Jo Malone', 'Creed', 'Parfums de Marly', 'Kilian', 'Frédéric Malle', 'Contes de Parfums', 'Zadig & Voltaire', 'Lanvin', 'Les Eaux Primordiales', 'D\'Orsay', 'Chopard', 'Bottega Veneta', 'Place de la Rêverie', 'Giardini di Toscana', 'Ella K', 'Dries Van Noten', 'Clive Christian', 'Bon Parfumeur', 'Nina Ricci', 'Caron', 'Les Bains Guerbois', 'Atelier des Ors', 'Histoires de Parfums', 'Oman Luxury', 'Initio', 'Nishane', 'Amouage', 'Xerjoff', 'Acqua di Parma', 'Penhaligon\'s', 'Serge Lutens', 'L\'Artisan Parfumeur', 'Atelier Cologne', 'Maison Crivelli', 'Ex Nihilo', 'BDK Parfums', 'Nasomatto', 'Marc-Antoine Barrois', 'Matière Première', 'Memo Paris', 'Montale', 'Mancera', 'Lattafa', 'Armaf', 'Rasasi', 'Afnan', 'Issey Miyake', 'Kenzo', 'Narciso Rodriguez', 'Marc Jacobs', 'Azzaro', 'Hugo Boss', 'Van Cleef & Arpels', 'Chloé', 'Fragonard', 'Houbigant', 'Essential Parfums', 'Jovoy', 'Etat Libre d\'Orange', 'Juliette Has a Gun', 'Parfum d\'Empire', 'Comme des Garçons', 'Roja Parfums', 'Floris', 'Santa Maria Novella', 'Mizensir', 'Horace', 'Maison Goutal'];
  root.HOUSE_FAME = HOUSE_FAME;
  root.DESC = DESC; root.NOSE = NOSE; root.NOSE_HOUSE = NOSE_HOUSE; root.LEX = LEX;
})(typeof window !== 'undefined' ? window : globalThis);
