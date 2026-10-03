const GENDERS = { m: 'un homme', f: 'une femme', x: 'une personne qui ne précise pas son genre' };
// Profil de la personne : contexte pour le choix, sans enfermer dans des cases « masculin / féminin ».
export function profileLine(p) {
  if (!p || typeof p !== 'object') return '';
  const bits = [], age = Math.round(Number(p.age));
  if (GENDERS[p.gender]) bits.push('je suis ' + GENDERS[p.gender]);
  if (age >= 10 && age <= 99) bits.push('j\'ai ' + age + ' ans');
  return bits.length ? '\nProfil : ' + bits.join(' ; ') + '. Un parfum mixte me va, mais évite les parfums nettement féminins ou girly si je suis un homme, et nettement masculins si je suis une femme.' : '';
}

// Prompt d'identification d'un parfum à partir d'un nom, d'une image ou d'un lien (modèle léger, côté serveur).
export function identifyPrompt(a) {
  return `Tu es un expert en parfumerie (niche et designer). Identifie le ou les parfums (4 maximum) à partir du texte et/ou de l'image jointe : flacon, boîte, étiquette ou capture d'écran d'un site marchand. Corrige les fautes, complète la maison, ne devine pas : si l'image n'est pas un parfum, renvoie {"items":[]}.\nTexte saisi : \"\"\"${String(a.text || '').slice(0, 600) || '(aucun)'}\"\"\"\nRéponds UNIQUEMENT par un JSON : {"items":[{"name":"nom officiel","house":"maison","family":"${a.families.join('|')}","notes":["5 à 8 notes en français, de l'ouverture au fond"],"projection":1-5,"longevity":1-5,"weight":1-5,"price":prix indicatif en euros,"confidence":0 à 1}]}. Si tu hésites, mets confidence sous 0.4.`;
}

// Prompt du conseil du jour. Source unique : le site public l'exécute côté serveur (jamais envoyé au navigateur).
export function dayPrompt(a) {
  const wx = a.wx, text = String(a.text || '').slice(0, 600);
  return `Tu es un nez de parfumerie qui compose avec goût. Ton chaleureux, tutoiement, image sensorielle, jamais de jargon creux. Un parfum fait rêver et voyager : utilise le champ lexical du voyage et de la rêverie (une lumière, un lieu, une matière, un souvenir), avec parcimonie, une seule image par parfum, sans emphase ni lyrisme appuyé. Réponds UNIQUEMENT par un JSON.\n\nMa collection (id | nom | maison | famille | notes | projection | tenue | poids | ma note | dernier port | stock) :\n${String(a.collection || '').slice(0, 14000)}\n\nMa journée : """${text || '(non précisée)'}"""${a.explicit || ''}${profileLine(a.profile)}${wx ? `\nMétéo indiquée : ${wx.l}, environ ${wx.t}°C${wx.rain ? ', pluie' : ''}.` : ''}${a.hasPhoto ? '\nUne photo de ma tenue est jointe : lis-y les couleurs, matières et le style.' : ''}\nDate : ${a.date || ''}.\n\nFormat : {"cond":{"temp":nombre ou null,"ctx":"pro|perso|date|event|famille|amis","with":"seul|partenaire|premier|collegues|boss|famille|amis|inconnus","moment":"jour|soir|nuit","mood":"confiant|calme|energique|romantique|mysterieux|joyeux|fatigue|creatif","style":"costume|smart|casual|sport|soiree|street","color":"sombre|neutre|clair|colore","fabric":"coton|lin|laine|cuir|denim|soie|technique|","place":"interieur|exterieur|transport|foule|","venue":"resto|bar|boite|musee|concert|theatre|bureau|maison|dehors|","dur":"courte|longue|"},"read":"ma journée reformulée, 12 mots max","pick":"id du parfum","vibe":["3 mots courts"],"story":"2 phrases : pourquoi celui-là aujourd'hui (météo, tenue, moment, personnes)","alts":[{"id":"","line":"8 mots max"},{"id":"","line":""}],"layers":[{"id":"","effect":"ce que l'accord change, 1 phrase","how":"ordre, dosage en sprays, où vaporiser selon la tenue, 2 phrases","score":1-5},{"id":"","effect":"","how":"","score":1-5}],"avoid":"vide, ou 1 phrase si un parfum est à éviter aujourd'hui"}\nRègles : le mood et les conditions (météo, humidité, moment de la journée, endroit précis, durée) pèsent autant que l'occasion : à table ou au théâtre on reste discret, en boîte de nuit on peut s'affirmer ; de jour on évite ce qui est lourd et nocturne : ne propose jamais un parfum qui les contredit, et cite-les dans "story". N'utilise que les id fournis. Évite ce qui a été porté hier ou aujourd'hui sauf raison forte. Respecte le stock : un parfum « grandes occasions », un échantillon ou un flacon presque fini ne se propose pas pour une journée ordinaire ; réserve-le à un événement, un rendez-vous ou une soirée. Les 2 accords de layering doivent être différents de "pick" et cohérents avec la chaleur et la tenue.`;
}

// Conseil sur mesure à partir d'un besoin libre : le moteur présélectionne des candidats vérifiés, l'IA tranche, compare et explique.
export function needPrompt(a) {
  const need = String(a.need || '').slice(0, 500), list = String(a.shortlist || '').slice(0, 9000), col = String(a.collection || '').slice(0, 3000);
  return `Tu es le meilleur conseiller en parfumerie : un nez formé à Grasse qui trouve LE parfum qui plaira réellement à cette personne, pas le plus célèbre. Tu tutoies, tu es chaleureux, précis et franc. Un parfum fait rêver et voyager : utilise le champ lexical du voyage et de la rêverie (une lumière, un lieu, une matière, un souvenir), avec parcimonie, une seule image par parfum, sans emphase ni lyrisme appuyé. Réponds UNIQUEMENT par un JSON.

Sa demande : """${need}"""${profileLine(a.profile)}
${col ? `\nSa collection actuelle (ce qu'elle aime déjà) :\n${col}\n` : ''}
CANDIDATS vérifiés par l'application (maison | parfum | famille | notes réelles | ce qui le distingue | % de correspondance calculé) :
${list || '(aucun candidat : propose uniquement des parfums que tu connais avec certitude)'}

Méthode : 1) comprends ce qu'elle veut et ce qu'elle fuit ; 2) élimine tout parfum contenant une note qu'elle refuse ; 3) compare les finalistes sur ce qui les distingue vraiment (texture, douceur, fumé, fraîcheur, densité, projection) ; 4) tranche : trois recommandations (le choix le plus juste, le choix sûr, la petite audace), puis un parfum « à éviter pour toi » qui paraît logique mais ne lui irait pas.
Règles : choisis dans la liste des CANDIDATS. N'ajoute un parfum hors liste que s'il manque clairement un excellent choix et que tu en connais l'existence et les notes avec certitude (alors "hors_liste": true). N'invente aucune note, aucun prix. Chaque raison s'accroche à SES mots ou à SES parfums, jamais à des généralités. Pourcentage de justesse calibré (90 et plus seulement si presque sûr).
Format : {"compris":"1 à 2 phrases","picks":[{"role":"choix|sur|audace","name":"","house":"","pct":0-100,"pourquoi":"2 à 3 phrases","tete":"ce qu'on sent au début","peau":"ce qu'on sent après 3 h","attention":"un point d'attention","hors_liste":false}],"eviter":{"name":"","house":"","raison":""},"test":"conseil de test en une phrase"}`;
}
