// ============================================================
// LILOBA — Accueil mobile : réserve de versets
// ============================================================
// Textes : Louis Segond 1910 (domaine public), extraits automatiquement
// de public/bible.json (aucune recopie à la main).
//
// Chaque jour, 5 versets sont tirés "au hasard" mais de façon
// DÉTERMINISTE : le même jour = les mêmes versets sur tous les appareils,
// et ils changent à minuit (heure locale). Aucun verset ne revient avant
// ~22 jours. Fonctionne 100 % hors ligne.
//
// Ajouter un verset : ajoute { ref, text } à la fin de la liste.
// ============================================================

export interface HomeVerse {
  /** Référence affichée, ex : "Psaumes 23:1" */
  ref: string;
  /** Texte du verset (LSG 1910) */
  text: string;
}

export const HOME_VERSES: HomeVerse[] = [
  // ---------- Confiance & refuge ----------
  { ref: "Psaumes 119:105", text: "Ta parole est une lampe à mes pieds, Et une lumière sur mon sentier." },
  { ref: "Psaumes 23:1", text: "L'Éternel est mon berger : je ne manquerai de rien." },
  { ref: "Psaumes 23:4", text: "Quand je marche dans la vallée de l'ombre de la mort, Je ne crains aucun mal, car tu es avec moi : Ta houlette et ton bâton me rassurent." },
  { ref: "Psaumes 27:1", text: "L'Éternel est ma lumière et mon salut : De qui aurais-je crainte ? L'Éternel est le soutien de ma vie : De qui aurais-je peur ?" },
  { ref: "Psaumes 46:2", text: "C'est pourquoi nous sommes sans crainte quand la terre est bouleversée, Et que les montagnes chancellent au cœur des mers." },
  { ref: "Psaumes 91:1-2", text: "Celui qui demeure sous l'abri du Très-Haut Repose à l'ombre du Tout Puissant. Je dis à l'Éternel : Mon refuge et ma forteresse, Mon Dieu en qui je me confie !" },
  { ref: "Psaumes 121:1-2", text: "Je lève mes yeux vers les montagnes... D'où me viendra le secours ? Le secours me vient de l'Éternel, Qui a fait les cieux et la terre." },
  { ref: "Psaumes 34:9", text: "Craignez l'Éternel, vous ses saints ! Car rien ne manque à ceux qui le craignent." },
  { ref: "Psaumes 37:5", text: "Recommande ton sort à l'Éternel, Mets en lui ta confiance, et il agira." },
  { ref: "Psaumes 56:4", text: "Je me glorifierai en Dieu, en sa parole ; Je me confie en Dieu, je ne crains rien : Que peuvent me faire des hommes ?" },
  { ref: "Psaumes 62:2", text: "Oui, c'est lui qui est mon rocher et mon salut ; Ma haute retraite : je ne chancellerai guère." },
  { ref: "Proverbes 3:5-6", text: "Confie-toi en l'Éternel de tout ton cœur, Et ne t'appuie pas sur ta sagesse ; Reconnais-le dans toutes tes voies, Et il aplanira tes sentiers." },
  { ref: "Proverbes 18:10", text: "Le nom de l'Éternel est une tour forte ; Le juste s'y réfugie, et se trouve en sûreté." },
  { ref: "Ésaïe 26:3", text: "A celui qui est ferme dans ses sentiments Tu assures la paix, la paix, Parce qu'il se confie en toi." },
  { ref: "Jérémie 17:7", text: "Béni soit l'homme qui se confie dans l'Éternel, Et dont l'Éternel est l'espérance !" },
  { ref: "Nahum 1:7", text: "L'Éternel est bon, Il est un refuge au jour de la détresse ; Il connaît ceux qui se confient en lui." },
  // ---------- Courage & force ----------
  { ref: "Josué 1:9", text: "Ne t'ai-je pas donné cet ordre : Fortifie-toi et prends courage ? Ne t'effraie point et ne t'épouvante point, car l'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras." },
  { ref: "Deutéronome 31:6", text: "Fortifiez-vous et ayez du courage ! Ne craignez point et ne soyez point effrayés devant eux ; car l'Éternel, ton Dieu, marchera lui-même avec toi, il ne te délaissera point, il ne t'abandonnera point." },
  { ref: "Ésaïe 41:10", text: "Ne crains rien, car je suis avec toi ; Ne promène pas des regards inquiets, car je suis ton Dieu ; Je te fortifie, je viens à ton secours, Je te soutiens de ma droite triomphante." },
  { ref: "Ésaïe 40:31", text: "Mais ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles ; Ils courent, et ne se lassent point, Ils marchent, et ne se fatiguent point." },
  { ref: "Ésaïe 43:2", text: "Si tu traverses les eaux, je serai avec toi ; Et les fleuves, ils ne te submergeront point ; Si tu marches dans le feu, tu ne te brûleras pas, Et la flamme ne t'embrasera pas." },
  { ref: "Psaumes 27:14", text: "Espère en l'Éternel ! Fortifie-toi et que ton cœur s'affermisse ! Espère en l'Éternel !" },
  { ref: "Psaumes 73:26", text: "Ma chair et mon cœur peuvent se consumer : Dieu sera toujours le rocher de mon cœur et mon partage." },
  { ref: "Exode 14:14", text: "L'Éternel combattra pour vous ; et vous, gardez le silence." },
  { ref: "Philippiens 4:13", text: "Je puis tout par celui qui me fortifie." },
  { ref: "Éphésiens 6:10", text: "Au reste, fortifiez-vous dans le Seigneur, et par sa force toute-puissante." },
  { ref: "1 Corinthiens 16:13-14", text: "Veillez, demeurez fermes dans la foi, soyez des hommes, fortifiez-vous. Que tout ce que vous faites se fasse avec charité !" },
  { ref: "2 Timothée 1:7", text: "Car ce n'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d'amour et de sagesse." },
  { ref: "2 Corinthiens 12:9", text: "Et il m'a dit : Ma grâce te suffit, car ma puissance s'accomplit dans la faiblesse. Je me glorifierai donc bien plus volontiers de mes faiblesses, afin que la puissance de Christ repose sur moi." },
  { ref: "Romains 8:31", text: "Que dirons-nous donc à l'égard de ces choses ? Si Dieu est pour nous, qui sera contre nous ?" },
  { ref: "Néhémie 8:10", text: "La joie de l'Éternel sera votre force." },
  { ref: "Habacuc 3:19", text: "L'Éternel, le Seigneur, est ma force ; Il rend mes pieds semblables à ceux des biches, Et il me fait marcher sur mes lieux élevés. Au chef des chantres. Avec instruments à cordes." },
  // ---------- Paix & repos ----------
  { ref: "Jean 14:27", text: "Je vous laisse la paix, je vous donne ma paix. Je ne vous donne pas comme le monde donne. Que votre cœur ne se trouble point, et ne s'alarme point." },
  { ref: "Jean 16:33", text: "Je vous ai dit ces choses, afin que vous ayez la paix en moi. Vous aurez des tribulations dans le monde ; mais prenez courage, j'ai vaincu le monde." },
  { ref: "Philippiens 4:6-7", text: "Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces. Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées en Jésus-Christ." },
  { ref: "Matthieu 11:28-29", text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos. Prenez mon joug sur vous et recevez mes instructions, car je suis doux et humble de cœur ; et vous trouverez du repos pour vos âmes." },
  { ref: "Psaumes 4:8", text: "Je me couche et je m'endors en paix, Car toi seul, ô Éternel ! tu me donnes la sécurité dans ma demeure." },
  { ref: "Psaumes 46:11", text: "L'Éternel des armées est avec nous, Le Dieu de Jacob est pour nous une haute retraite. -Pause." },
  { ref: "Nombres 6:24-26", text: "Que l'Éternel te bénisse, et qu'il te garde ! Que l'Éternel fasse luire sa face sur toi, et qu'il t'accorde sa grâce ! Que l'Éternel tourne sa face vers toi, et qu'il te donne la paix !" },
  { ref: "Colossiens 3:15", text: "Et que la paix de Christ, à laquelle vous avez été appelés pour former un seul corps, règne dans vos cœurs. Et soyez reconnaissants." },
  { ref: "1 Pierre 5:7", text: "Et déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous." },
  { ref: "Psaumes 94:19", text: "Quand les pensées s'agitent en foule au dedans de moi, Tes consolations réjouissent mon âme." },
  { ref: "Psaumes 127:2", text: "En vain vous levez-vous matin, vous couchez-vous tard, Et mangez-vous le pain de douleur ; Il en donne autant à ses bien-aimés pendant leur sommeil." },
  { ref: "Romains 15:13", text: "Que le Dieu de l'espérance vous remplisse de toute joie et de toute paix dans la foi, pour que vous abondiez en espérance, par la puissance du Saint-Esprit !" },
  // ---------- Amour de Dieu ----------
  { ref: "Jean 3:16", text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle." },
  { ref: "Romains 5:8", text: "Mais Dieu prouve son amour envers nous, en ce que, lorsque nous étions encore des pécheurs, Christ est mort pour nous." },
  { ref: "1 Jean 4:19", text: "Pour nous, nous l'aimons, parce qu'il nous a aimés le premier." },
  { ref: "1 Jean 4:8", text: "Celui qui n'aime pas n'a pas connu Dieu, car Dieu est amour." },
  { ref: "Jean 15:13", text: "Il n'y a pas de plus grand amour que de donner sa vie pour ses amis." },
  { ref: "Jean 13:34", text: "Je vous donne un commandement nouveau : Aimez-vous les uns les autres ; comme je vous ai aimés, vous aussi, aimez-vous les uns les autres." },
  { ref: "Sophonie 3:17", text: "L'Éternel, ton Dieu, est au milieu de toi, comme un héros qui sauve ; Il fera de toi sa plus grande joie ; Il gardera le silence dans son amour ; Il aura pour toi des transports d'allégresse." },
  { ref: "Jérémie 31:3", text: "De loin l'Éternel se montre à moi : Je t'aime d'un amour éternel ; C'est pourquoi je te conserve ma bonté." },
  { ref: "Psaumes 136:1", text: "Louez l'Éternel, car il est bon, Car sa miséricorde dure à toujours !" },
  { ref: "Psaumes 103:8", text: "L'Éternel est miséricordieux et compatissant, Lent à la colère et riche en bonté ;" },
  { ref: "1 Corinthiens 13:13", text: "Maintenant donc ces trois choses demeurent : la foi, l'espérance, la charité ; mais la plus grande de ces choses, c'est la charité." },
  { ref: "Éphésiens 2:4-5", text: "Mais Dieu, qui est riche en miséricorde, à cause du grand amour dont il nous a aimés, nous qui étions morts par nos offenses, nous a rendus à la vie avec Christ c'est par grâce que vous êtes sauvés) ;" },
  // ---------- Espérance & avenir ----------
  { ref: "Jérémie 29:11", text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance." },
  { ref: "Romains 8:28", text: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein." },
  { ref: "Romains 12:12", text: "Réjouissez-vous en espérance. Soyez patients dans l'affliction. Persévérez dans la prière." },
  { ref: "Lamentations 3:22-23", text: "Les bontés de l'Éternel ne sont pas épuisées, Ses compassions ne sont pas à leur terme ; Elles se renouvellent chaque matin. Oh ! que ta fidélité est grande !" },
  { ref: "Apocalypse 21:4", text: "Il essuiera toute larme de leurs yeux, et la mort ne sera plus, et il n'y aura plus ni deuil, ni cri, ni douleur, car les premières choses ont disparu." },
  { ref: "Hébreux 11:1", text: "Or la foi est une ferme assurance des choses qu'on espère, une démonstration de celles qu'on ne voit pas." },
  { ref: "Romains 15:4", text: "Or, tout ce qui a été écrit d'avance l'a été pour notre instruction, afin que, par la patience, et par la consolation que donnent les Ecritures, nous possédions l'espérance." },
  { ref: "Psaumes 42:6", text: "Mon âme est abattue au dedans de moi : Aussi c'est à toi que je pense, depuis le pays du Jourdain, Depuis l'Hermon, depuis la montagne de Mitsear." },
  { ref: "Ésaïe 55:12", text: "Oui, vous sortirez avec joie, Et vous serez conduits en paix ; Les montagnes et les collines éclateront d'allégresse devant vous, Et tous les arbres de la campagne battront des mains." },
  { ref: "Jérémie 33:3", text: "Invoque-moi, et je te répondrai ; Je t'annoncerai de grandes choses, des choses cachées, Que tu ne connais pas." },
  { ref: "Matthieu 28:20", text: "Et enseignez-leur à observer tout ce que je vous ai prescrit. Et voici, je suis avec vous tous les jours, jusqu'à la fin du monde." },
  { ref: "Hébreux 13:8", text: "Jésus-Christ est le même hier, aujourd'hui, et éternellement." },
  // ---------- Foi & prière ----------
  { ref: "Marc 9:23", text: "Jésus lui dit : Si tu peux!... Tout est possible à celui qui croit." },
  { ref: "Luc 1:37", text: "Car rien n'est impossible à Dieu." },
  { ref: "Matthieu 7:7", text: "Demandez, et l'on vous donnera ; cherchez, et vous trouverez ; frappez, et l'on vous ouvrira." },
  { ref: "Matthieu 6:33", text: "Cherchez premièrement le royaume et la justice de Dieu ; et toutes ces choses vous seront données par-dessus." },
  { ref: "Jacques 1:5", text: "Si quelqu'un d'entre vous manque de sagesse, qu'il la demande à Dieu, qui donne à tous simplement et sans reproche, et elle lui sera donnée." },
  { ref: "Jacques 4:8", text: "Approchez-vous de Dieu, et il s'approchera de vous. Nettoyez vos mains, pécheurs ; purifiez vos cœurs, hommes irrésolus." },
  { ref: "Hébreux 4:16", text: "Approchons-nous donc avec assurance du trône de la grâce, afin d'obtenir miséricorde et de trouver grâce, pour être secourus dans nos besoins." },
  { ref: "2 Corinthiens 5:7", text: "Car nous marchons par la foi et non par la vue." },
  { ref: "Philippiens 4:4", text: "Réjouissez-vous toujours dans le Seigneur ; je le répète, réjouissez-vous." },
  { ref: "1 Thessaloniciens 5:16-18", text: "Soyez toujours joyeux. Priez sans cesse. Rendez grâces en toutes choses, car c'est à votre égard la volonté de Dieu en Jésus-Christ." },
  { ref: "Jean 14:6", text: "Jésus lui dit : Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi." },
  { ref: "Apocalypse 3:20", text: "Voici, je me tiens à la porte, et je frappe. Si quelqu'un entend ma voix et ouvre la porte, j'entrerai chez lui, je souperai avec lui, et lui avec moi." },
  { ref: "Jean 15:5", text: "Je suis le cep, vous êtes les sarments. Celui qui demeure en moi et en qui je demeure porte beaucoup de fruit, car sans moi vous ne pouvez rien faire." },
  { ref: "Romains 10:17", text: "Ainsi la foi vient de ce qu'on entend, et ce qu'on entend vient de la parole de Christ." },
  { ref: "Psaumes 145:18", text: "L'Éternel est près de tous ceux qui l'invoquent, De tous ceux qui l'invoquent avec sincérité ;" },
  // ---------- Sagesse & vie droite ----------
  { ref: "Proverbes 16:3", text: "Recommande à l'Éternel tes œuvres, Et tes projets réussiront." },
  { ref: "Proverbes 4:23", text: "Garde ton cœur plus que toute autre chose, Car de lui viennent les sources de la vie." },
  { ref: "Proverbes 17:17", text: "L'ami aime en tout temps, Et dans le malheur il se montre un frère." },
  { ref: "Proverbes 22:6", text: "Instruis l'enfant selon la voie qu'il doit suivre ; Et quand il sera vieux, il ne s'en détournera pas." },
  { ref: "Psaumes 90:12", text: "Enseigne-nous à bien compter nos jours, Afin que nous appliquions notre cœur à la sagesse." },
  { ref: "Michée 6:8", text: "On t'a fait connaître, ô homme, ce qui est bien ; Et ce que l'Éternel demande de toi, C'est que tu pratiques la justice, Que tu aimes la miséricorde, Et que tu marches humblement avec ton Dieu." },
  { ref: "Matthieu 5:16", text: "Que votre lumière luise ainsi devant les hommes, afin qu'ils voient vos bonnes œuvres, et qu'ils glorifient votre Père qui est dans les cieux." },
  { ref: "Colossiens 3:23", text: "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes." },
  { ref: "Galates 6:9", text: "Ne nous lassons pas de faire le bien ; car nous moissonnerons au temps convenable, si nous ne nous relâchons pas." },
  { ref: "Galates 5:22-23", text: "Mais le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté, la bénignité, la fidélité, la douceur, la tempérance ; la loi n'est pas contre ces choses." },
  { ref: "Ecclésiaste 3:1", text: "Il y a un temps pour tout, un temps pour toute chose sous les cieux :" },
  { ref: "1 Samuel 16:7", text: "Et l'Éternel dit à Samuel : Ne prends point garde à son apparence et à la hauteur de sa taille, car je l'ai rejeté. L'Éternel ne considère pas ce que l'homme considère ; l'homme regarde à ce qui frappe les yeux, mais l'Éternel regarde au cœur." },
  { ref: "Éphésiens 4:32", text: "Soyez bons les uns envers les autres, compatissants, vous pardonnant réciproquement, comme Dieu vous a pardonné en Christ." },
  { ref: "Psaumes 37:4", text: "Fais de l'Éternel tes délices, Et il te donnera ce que ton cœur désire." },
  { ref: "Psaumes 1:1-2", text: "Heureux l'homme qui ne marche pas selon le conseil des méchants, Qui ne s'arrête pas sur la voie des pécheurs, Et qui ne s'assied pas en compagnie des moqueurs, Mais qui trouve son plaisir dans la loi de l'Éternel, Et qui la médite jour et nuit !" },
  // ---------- Grâce, pardon, nouveauté ----------
  { ref: "Éphésiens 2:8-9", text: "Car c'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu. Ce n'est point par les œuvres, afin que personne ne se glorifie." },
  { ref: "2 Corinthiens 5:17", text: "Si quelqu'un est en Christ, il est une nouvelle créature. Les choses anciennes sont passées ; voici, toutes choses sont devenues nouvelles." },
  { ref: "1 Jean 1:9", text: "Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner, et pour nous purifier de toute iniquité." },
  { ref: "Romains 8:1", text: "Il n'y a donc maintenant aucune condamnation pour ceux qui sont en Jésus-Christ." },
  { ref: "Psaumes 103:12", text: "Autant l'orient est éloigné de l'occident, Autant il éloigne de nous nos transgressions." },
  { ref: "Psaumes 51:10", text: "O Dieu ! crée en moi un cœur pur, Renouvelle en moi un esprit bien disposé." },
  { ref: "Ésaïe 53:5", text: "Mais il était blessé pour nos péchés, Brisé pour nos iniquités ; Le châtiment qui nous donne la paix est tombé sur lui, Et c'est par ses meurtrissures que nous sommes guéris." },
  { ref: "Galates 2:20", text: "J'ai été crucifié avec Christ ; et si je vis, ce n'est plus moi qui vis, c'est Christ qui vit en moi ; si je vis maintenant dans la chair, je vis dans la foi au Fils de Dieu, qui m'a aimé et qui s'est livré lui-même pour moi." },
  { ref: "Jean 10:10", text: "Le voleur ne vient que pour dérober, égorger et détruire ; moi, je suis venu afin que les brebis aient la vie, et qu'elles soient dans l'abondance." },
  { ref: "Jean 8:12", text: "Jésus leur parla de nouveau, et dit : Je suis la lumière du monde ; celui qui me suit ne marchera pas dans les ténèbres, mais il aura la lumière de la vie." },
  { ref: "Psaumes 139:14", text: "Je te loue de ce que je suis une créature si merveilleuse. Tes œuvres sont admirables, Et mon âme le reconnaît bien." },
  { ref: "Psaumes 103:2", text: "Mon âme, bénis l'Éternel, Et n'oublie aucun de ses bienfaits !" },
  { ref: "Psaumes 118:24", text: "C'est ici la journée que l'Éternel a faite : Qu'elle soit pour nous un sujet d'allégresse et de joie !" },
  { ref: "Psaumes 100:4", text: "Entrez dans ses portes avec des louanges, Dans ses parvis avec des cantiques ! Célébrez-le, bénissez son nom !" },
  { ref: "1 Chroniques 16:34", text: "Louez l'Éternel, car il est bon, Car sa miséricorde dure à toujours !" },
  { ref: "Psaumes 147:3", text: "Il guérit ceux qui ont le cœur brisé, Et il panse leurs blessures." },
];

/** Nombre de versets proposés chaque jour. */
export const VERSES_PER_DAY = 5;

// ------------------------------------------------------------
// Tirage déterministe
// ------------------------------------------------------------

/** Numéro du jour local (change à minuit, heure de l'appareil). */
export function getDayNumber(date: Date = new Date()): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  );
}

/** Clé AAAA-MM-JJ du jour local (sert à détecter le changement de jour). */
export function getHomeDayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

// Petit générateur pseudo-aléatoire reproductible (mulberry32)
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Un ordre mélangé différent pour chaque "cycle" complet de la réserve
const permutationCache = new Map<number, number[]>();

function getPermutation(cycle: number, size: number): number[] {
  const key = cycle * 100000 + size;
  const cached = permutationCache.get(key);
  if (cached) return cached;
  const rand = mulberry32(cycle * 2654435761 + 1013904223);
  const order = Array.from({ length: size }, (_, i) => i);
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (permutationCache.size > 8) permutationCache.clear();
  permutationCache.set(key, order);
  return order;
}

/**
 * Les versets du jour : count versets (5 par défaut), tous différents.
 * Même date = mêmes versets, changement chaque jour à minuit.
 *
 * La réserve est parcourue par "cycles" : dans un cycle (≈ 22 jours avec
 * 5 versets par jour), aucun verset ne revient. À chaque nouveau cycle,
 * l'ordre est remélangé, donc ce ne sont jamais les mêmes séries.
 */
export function getTodayVerses(
  date: Date = new Date(),
  count: number = VERSES_PER_DAY
): HomeVerse[] {
  const size = HOME_VERSES.length;
  const daysPerCycle = Math.max(1, Math.floor(size / count));
  const day = getDayNumber(date);
  const cycle = Math.floor(day / daysPerCycle);
  const dayInCycle = day % daysPerCycle;
  const order = getPermutation(cycle, size);
  const result: HomeVerse[] = [];
  for (let i = 0; i < count; i++) {
    result.push(HOME_VERSES[order[(dayInCycle * count + i) % size]]);
  }
  return result;
}
