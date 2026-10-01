const GENDERS = { m: 'un homme', f: 'une femme', x: 'une personne qui ne précise pas son genre' };
const DRESS = { casual: 'décontracté (jean, t-shirt, baskets)', smart: 'smart casual (chemise, chino, blazer léger)', costume: 'élégant, costume ou tailleur', street: 'streetwear', sport: 'sportswear', soiree: 'chic de soirée' };
// Profil de la personne : contexte pour le choix, sans enfermer dans des cases « masculin / féminin ».
export function profileLine(p) {
  if (!p || typeof p !== 'object') return '';
  const bits = [];
  if (GENDERS[p.gender]) bits.push('je suis ' + GENDERS[p.gender]);
  if (DRESS[p.dress]) bits.push('je m\'habille plutôt ' + DRESS[p.dress]);
  const note = String(p.note || '').replace(/[\r\n]+/g, ' ').slice(0, 160); if (note) bits.push('mes couleurs et matières : ' + note);
  return bits.length ? '\nProfil : ' + bits.join(' ; ') + '. Ne te limite pas aux flacons étiquetés « masculin » ou « féminin » : choisis ce qui me va.' : '';
}

// Prompt d'identification d'un parfum à partir d'un nom, d'une image ou d'un lien (modèle léger, côté serveur).
export function identifyPrompt(a) {
  return `Tu es un expert en parfumerie (niche et designer). Identifie le ou les parfums (4 maximum) à partir du texte et/ou de l'image jointe : flacon, boîte, étiquette ou capture d'écran d'un site marchand. Corrige les fautes, complète la maison, ne devine pas : si l'image n'est pas un parfum, renvoie {"items":[]}.\nTexte saisi : \"\"\"${String(a.text || '').slice(0, 600) || '(aucun)'}\"\"\"\nRéponds UNIQUEMENT par un JSON : {"items":[{"name":"nom officiel","house":"maison","family":"${a.families.join('|')}","notes":["5 à 8 notes en français, de l'ouverture au fond"],"projection":1-5,"longevity":1-5,"weight":1-5,"price":prix indicatif en euros,"confidence":0 à 1}]}. Si tu hésites, mets confidence sous 0.4.`;
}

// Prompt du conseil du jour. Source unique : le site public l'exécute côté serveur (jamais envoyé au navigateur).
export function dayPrompt(a) {
  const wx = a.wx, text = String(a.text || '').slice(0, 600);
  return `Tu es un nez de parfumerie qui compose avec goût. Ton chaleureux, tutoiement, image sensorielle, jamais de jargon creux. Réponds UNIQUEMENT par un JSON.\n\nMa collection (id | nom | maison | famille | notes | projection | tenue | poids | ma note | dernier port) :\n${String(a.collection || '').slice(0, 14000)}\n\nMa journée : """${text || '(non précisée)'}"""${a.explicit || ''}${profileLine(a.profile)}${wx ? `\nMétéo indiquée : ${wx.l}, environ ${wx.t}°C${wx.rain ? ', pluie' : ''}.` : ''}${a.hasPhoto ? '\nUne photo de ma tenue est jointe : lis-y les couleurs, matières et le style.' : ''}\nDate : ${a.date || ''}.\n\nFormat : {"cond":{"temp":nombre ou null,"ctx":"pro|perso|date|event|famille|amis","with":"seul|partenaire|premier|collegues|boss|famille|amis|inconnus","moment":"jour|soir|nuit","mood":"confiant|calme|energique|romantique|mysterieux|joyeux|fatigue|creatif","style":"costume|smart|casual|sport|soiree|street","color":"sombre|neutre|clair|colore","fabric":"coton|lin|laine|cuir|denim|soie|technique|","place":"interieur|exterieur|transport|foule|","dur":"courte|longue|"},"read":"ma journée reformulée, 12 mots max","pick":"id du parfum","vibe":["3 mots courts"],"story":"2 phrases : pourquoi celui-là aujourd'hui (météo, tenue, moment, personnes)","alts":[{"id":"","line":"8 mots max"},{"id":"","line":""}],"layers":[{"id":"","effect":"ce que l'accord change, 1 phrase","how":"ordre, dosage en sprays, où vaporiser selon la tenue, 2 phrases","score":1-5},{"id":"","effect":"","how":"","score":1-5}],"avoid":"vide, ou 1 phrase si un parfum est à éviter aujourd'hui"}\nRègles : le mood et les conditions (météo, humidité, lieu, durée) pèsent autant que l'occasion : ne propose jamais un parfum qui les contredit, et cite-les dans "story". N'utilise que les id fournis. Évite ce qui a été porté hier ou aujourd'hui sauf raison forte. Les 2 accords de layering doivent être différents de "pick" et cohérents avec la chaleur et la tenue.`;
}
