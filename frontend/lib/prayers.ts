"use client";

// ============================================================
// LILOBA — Bibliothèque de prières chrétiennes
// ============================================================

export interface Prayer {
  id: string;
  title: string;
  text: string;
  verse: string;
  verseText?: string;
}

export interface PrayerCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  prayers: Prayer[];
}

export const PRAYER_CATEGORIES: PrayerCategory[] = [
  // ==========================================================
  // 1. RÉCONFORT
  // ==========================================================
  {
    id: "confort",
    name: "Réconfort",
    icon: "confort",
    description: "Tristesse, paix, espoir",
    prayers: [
      {
        id: "confort-1",
        title: "Dieu est mon refuge",
        text: "Seigneur, dans les tempêtes de la vie, je me tourne vers toi. Tu es mon rocher, ma forteresse, mon libérateur. Quand l'angoisse m'envahit, rappelle-moi que tu es toujours là, que tu ne m'abandonnes jamais. Donne-moi ta paix qui surpasse toute compréhension, cette paix qui garde mon cœur et mes pensées en Jésus-Christ. Aide-moi à me reposer en ta présence, à faire confiance à tes promesses, et à trouver en toi le réconfort dont j'ai tant besoin. Amen.",
        verse: "Psaume 46:1",
        verseText: "Dieu est pour nous un refuge et un appui, un secours qui ne manque jamais dans la détresse.",
      },
      {
        id: "confort-2",
        title: "Dans la nuit, ta lumière",
        text: "Père céleste, quand tout semble sombre autour de moi, quand les soucis m'oppressent et que la tristesse m'envahit, je viens à toi. Tu connais chaque larme, chaque soupir, chaque peur. Éclaire mon chemin, réchauffe mon cœur, et rappelle-moi que la nuit n'est jamais totale avec toi. Ta parole est une lampe à mes pieds et une lumière sur mon sentier. Aide-moi à marcher par la foi et non par la vue, et à trouver en toi la joie qui subsiste même dans l'épreuve. Amen.",
        verse: "Psaume 119:105",
        verseText: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.",
      },
      {
        id: "confort-3",
        title: "Paix au milieu de la tempête",
        text: "Jésus, tu as calmé la mer déchaînée d'un seul mot. Aujourd'hui, calme le tumulte dans mon cœur. Fais taire mes pensées agitées, mes inquiétudes, mes craintes. Apprends-moi à m'abandonner entre tes mains, à te faire confiance même quand je ne comprends pas. Que ta paix, qui dépasse toute intelligence, soit mon héritage aujourd'hui. Repose-toi en moi, Seigneur, et donne-moi ton repos. Je te remets mes fardeaux, car tu prends soin de moi. Amen.",
        verse: "Marc 4:39",
        verseText: "S'étant réveillé, il menaça le vent, et dit à la mer : Silence ! tais-toi ! Et le vent cessa, et il y eut un grand calme.",
      },
      {
        id: "confort-4",
        title: "Viens à moi, je te donnerai du repos",
        text: "Seigneur Jésus, je suis fatigué, épuisé, accablé par les charges de la vie. Tu m'invites à venir à toi et tu promets de me donner du repos. Me voici, je viens. Allège mon fardeau, soulage mon âme. Apprends-moi à porter ton joug qui est doux, à te suivre avec un cœur humble et confiant. Que ton repos descende sur moi comme une rosée rafraîchissante. Ranime mes forces, restaure mon espérance, et remplis-moi de ta paix. Amen.",
        verse: "Matthieu 11:28",
        verseText: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.",
      },
    ],
  },

  // ==========================================================
  // 2. GUÉRISON
  // ==========================================================
  {
    id: "guerison",
    name: "Guérison",
    icon: "guerison",
    description: "Maladie, blessure, fatigue",
    prayers: [
      {
        id: "guerison-1",
        title: "Guéris-moi, Seigneur",
        text: "Seigneur, tu es le Dieu qui guérit. Tu connais mon corps, mes douleurs, mes faiblesses. Je viens à toi avec confiance, car tu es le médecin des âmes et des corps. Pose ta main sur moi, apaise mes souffrances, restaure ma santé. Donne-moi la force d'endurer, la patience d'attendre ton timing, et la foi de croire que tu peux tout. Que ta volonté soit faite, mais je te demande la guérison, si cela est dans ton plan d'amour pour moi. Amen.",
        verse: "Exode 15:26",
        verseText: "Car je suis l'Éternel, qui te guérit.",
      },
      {
        id: "guerison-2",
        title: "Force dans la faiblesse",
        text: "Père, quand mon corps défaille et que mes forces m'abandonnent, rappelle-moi que ta grâce me suffit. Ta puissance s'accomplit dans la faiblesse. Donne-moi de puiser en toi la force dont j'ai besoin pour traverser cette épreuve. Soutiens-moi, porte-moi, entoure-moi de ta présence. Que cette maladie ne soit pas un mur mais un chemin vers toi. Guéris ce qui doit être guéri, et fortifie ce qui doit être fortifié. Amen.",
        verse: "2 Corinthiens 12:9",
        verseText: "Ma grâce te suffit, car ma puissance s'accomplit dans la faiblesse.",
      },
      {
        id: "guerison-3",
        title: "Guérison de l'âme",
        text: "Seigneur, il n'y a pas que le corps qui souffre. Mon âme aussi a besoin de guérison. Guéris mes blessures intérieures, mes souvenirs douloureux, mes peurs cachées. Enlève l'amertume, la rancune, le ressentiment. Remplace-les par ton amour, ta paix, ton pardon. Restaure mon cœur brisé, relève mon esprit abattu. Tu es le Dieu qui relève, qui restaure, qui guérit. Fais-moi entier en toi. Amen.",
        verse: "Psaume 147:3",
        verseText: "Il guérit ceux qui ont le cœur brisé, et il panse leurs blessures.",
      },
      {
        id: "guerison-4",
        title: "Repos pour mon corps fatigué",
        text: "Seigneur, je suis épuisé. Mon corps crie grâce, mon esprit est à bout. Toi qui donnes le sommeil à tes bien-aimés, accorde-moi un repos profond. Que cette nuit soit un temps de restauration, de renouvellement. Ressource mes énergies, calme mes pensées, apaise mes tensions. Que demain je puisse me lever avec une force nouvelle, prêt à te servir à nouveau. Prends soin de moi, Seigneur, car tu es mon berger. Amen.",
        verse: "Psaume 127:2",
        verseText: "Il en donne autant à ses bien-aimés pendant leur sommeil.",
      },
    ],
  },

  // ==========================================================
  // 3. PROTECTION
  // ==========================================================
  {
    id: "protection",
    name: "Protection",
    icon: "protection",
    description: "Sécurité, famille, travail",
    prayers: [
      {
        id: "protection-1",
        title: "Sous tes ailes",
        text: "Seigneur, je me réfugie sous l'ombre de tes ailes. Tu es mon bouclier, ma citadelle, ma tour forte. Protège-moi des dangers visibles et invisibles, des attaques du malin, des pièges du monde. Garde mes pensées, mes paroles, mes actions. Que ta main puissante me couvre aujourd'hui et tous les jours de ma vie. Je dors en paix, car toi seul me fais habiter en sécurité. Veille sur moi, sur ma famille, sur ceux que j'aime. Amen.",
        verse: "Psaume 91:1",
        verseText: "Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant.",
      },
      {
        id: "protection-2",
        title: "Protection de ma famille",
        text: "Père céleste, je te confie ma famille. Entoure chacun de ses membres de ta protection. Garde les enfants des mauvaises influences, protège les parents des pièges du monde, préserve notre foyer de la division et du mal. Sois le rempart autour de notre maison, la lumière dans nos cœurs, la paix entre nous. Que ta présence habite chaque pièce, chaque conversation, chaque geste. Bénis-nous et garde-nous unis dans ton amour. Amen.",
        verse: "Nombres 6:24",
        verseText: "Que l'Éternel te bénisse, et qu'il te garde !",
      },
      {
        id: "protection-3",
        title: "Protection au travail",
        text: "Seigneur, je te confie mon travail. Protège-moi des pièges, des injustices, des mauvaises intentions. Donne-moi la sagesse dans mes décisions, l'intégrité dans mes actions, la bonté dans mes relations. Que je sois un témoignage vivant de ta grâce au milieu de mes collègues. Éloigne de moi les mauvaises influences, donne-moi des opportunités justes, protège ma carrière. Que ton nom soit glorifié à travers mon travail. Amen.",
        verse: "Deutéronome 28:12",
        verseText: "L'Éternel t'ouvrira son bon trésor, le ciel, pour envoyer à ton pays la pluie en son temps.",
      },
      {
        id: "protection-4",
        title: "Contre les attaques spirituelles",
        text: "Seigneur, je sais que nous ne luttons pas contre la chair et le sang, mais contre les puissances spirituelles du mal. Revêts-moi de ton armure : la vérité pour ceinture, la justice pour cuirasse, la paix pour chaussures, la foi pour bouclier, le salut pour casque, et ta Parole pour épée. Rends-moi fort dans ta puissance, capable de résister aux attaques de l'ennemi. Que ta victoire à la croix soit ma force aujourd'hui. Amen.",
        verse: "Éphésiens 6:11",
        verseText: "Revêtez-vous de toutes les armes de Dieu, afin de pouvoir tenir ferme contre les ruses du diable.",
      },
    ],
  },

  // ==========================================================
  // 4. GRATITUDE
  // ==========================================================
  {
    id: "gratitude",
    name: "Gratitude",
    icon: "gratitude",
    description: "Remerciements, louange",
    prayers: [
      {
        id: "gratitude-1",
        title: "Merci pour tout",
        text: "Mon Dieu, je viens te remercier pour ta bonté infinie. Merci pour la vie, la santé, la nourriture, le toit, les vêtements. Merci pour les personnes que tu as placées sur mon chemin. Merci pour les joies et même pour les épreuves, car tu utilises tout pour mon bien. Mon cœur déborde de reconnaissance. Apprends-moi à ne jamais oublier tes bienfaits, à cultiver la gratitude chaque jour, et à te louer en toutes circonstances. Tu es digne de toute ma reconnaissance. Amen.",
        verse: "1 Thessaloniciens 5:18",
        verseText: "Rendez grâces en toutes choses, car c'est à votre égard la volonté de Dieu en Jésus-Christ.",
      },
      {
        id: "gratitude-2",
        title: "Tu es bon, Seigneur",
        text: "Seigneur, tu es bon, ton amour dure à toujours. Je te loue pour ta fidélité, car tu ne m'as jamais abandonné. Chaque matin, tes bontés se renouvellent. Chaque soir, ta fidélité m'accompagne. Je veux te louer non seulement quand tout va bien, mais aussi dans l'épreuve, car tu restes bon en tout temps. Que ma vie entière soit une action de grâce, un chant de louange qui monte vers toi. Béni soit ton saint nom. Amen.",
        verse: "Psaume 100:5",
        verseText: "Car l'Éternel est bon ; sa bonté dure toujours, et sa fidélité de génération en génération.",
      },
      {
        id: "gratitude-3",
        title: "Pour ta grâce",
        text: "Père, je te remercie pour ta grâce. Je ne méritais rien, et tu m'as tout donné. Tu m'as sauvé, pardonné, adopté, aimé. Tu m'as donné ton Fils, ton Esprit, ta Parole, ton Église. Que puis-je faire sinon tomber à tes pieds et te remercier ? Ton amour me dépasse, ta miséricorde m'émerveille. Vis dans mon cœur, transforme ma vie, fais de moi un témoignage vivant de ta grâce. À toi soient la gloire et l'honneur. Amen.",
        verse: "Éphésiens 2:8",
        verseText: "C'est par la grâce que vous êtes sauvés, par le moyen de la foi.",
      },
            {
        id: "gratitude-4",
        title: "Merci pour les épreuves",
        text: "Seigneur, je te remercie même pour les épreuves. Car tu utilises tout pour mon bien, même ce qui est douloureux. Merci pour les leçons apprises, les forces découvertes, la foi affermie. Merci parce que tu ne m'abandonnes jamais dans la tempête, tu me tiens par la main. Aide-moi à voir tes bontés même dans les moments difficiles, à te remercier en toutes circonstances, et à te faire confiance quand je ne comprends pas. Tu es bon, en tout temps. Amen.",
        verse: "Romains 8:28",
        verseText: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.",
      },
    ],
  },

  // ==========================================================
  // 5. GUIDANCE
  // ==========================================================
  {
    id: "guidance",
    name: "Guidance",
    icon: "guidance",
    description: "Décisions, volonté de Dieu",
    prayers: [
      {
        id: "guidance-1",
        title: "Éclaire mon chemin",
        text: "Seigneur, je suis à la croisée des chemins. Je ne sais pas quelle direction prendre. Mes pensées s'agitent, mes options se multiplient, et je ne veux pas me tromper. Toi qui connais toutes choses, éclaire mon esprit. Parle-moi, je t'écoute. Ferme les portes qui ne viennent pas de toi, ouvre celles qui sont dans ta volonté. Que ta Parole soit une lampe à mes pieds et un guide sur mon sentier. Je m'abandonne à ta direction. Amen.",
        verse: "Proverbes 3:5-6",
        verseText: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse ; reconnais-le dans toutes tes voies, et il aplanira tes sentiers.",
      },
      {
        id: "guidance-2",
        title: "Ta volonté, pas la mienne",
        text: "Père, je viens à toi avec mes désirs, mes projets, mes ambitions. Mais je veux que ta volonté soit faite, pas la mienne. Aide-moi à lâcher prise, à te faire confiance, à accepter que tes plans sont meilleurs que les miens. Que ton Esprit me guide dans les décisions grandes et petites. Éloigne de moi l'orgueil et la peur. Donne-moi un cœur soumis, obéissant, disponible. Que ma vie soit un reflet de ta volonté parfaite. Amen.",
        verse: "Jacques 4:15",
        verseText: "Vous devriez dire, au contraire : Si le Seigneur le veut, nous vivrons, et nous ferons ceci ou cela.",
      },
      {
        id: "guidance-3",
        title: "Discernement",
        text: "Seigneur, donne-moi le discernement. Apprends-moi à distinguer ta voix des autres voix qui m'entourent : la voix de mes peurs, du monde, de l'ennemi. Que ton Esprit m'éclaire, me guide, me corrige. Donne-moi la sagesse pour discerner ce qui est bon, agréable et parfait à tes yeux. Garde-moi des faux chemins, des illusions, des pièges. Que je marche toujours dans ta lumière, avec confiance et obéissance. Amen.",
        verse: "Psaume 143:10",
        verseText: "Enseigne-moi à faire ta volonté ! Car tu es mon Dieu.",
      },
            {
        id: "guidance-4",
        title: "Direction pour ma vie",
        text: "Seigneur, ma vie t'appartient. Je ne veux pas vivre selon mes propres désirs, mais selon ton plan parfait. Montre-moi le chemin que tu as préparé pour moi, révèle-moi ta volonté. Guide mes pas, oriente mes choix, éclaire mes décisions. Que ta voix soit plus forte que toutes les autres, que ta direction soit plus claire que mes propres pensées. Donne-moi la sagesse d'écouter, la patience d'attendre, le courage d'obéir. Je marche par la foi, pas par la vue. Amen.",
        verse: "Psaume 37:23",
        verseText: "L'Éternel affermit les pas de l'homme, et il prend plaisir à sa voie.",
      },
    ],
  },

  // ==========================================================
  // 6. PARDON
  // ==========================================================
  {
    id: "pardon",
    name: "Pardon",
    icon: "pardon",
    description: "Pardon, repentance, conversion",
    prayers: [
      {
        id: "pardon-1",
        title: "Pardonne-moi, Seigneur",
        text: "Père, je viens à toi avec un cœur brisé et contrit. Je reconnais mes péchés, mes erreurs, mes manquements. J'ai fait le mal à tes yeux, j'ai suivi ma propre voie, je t'ai attristé. Mais je sais que tu es fidèle et juste pour pardonner. Lave-moi par le sang de ton Fils, purifie-moi de toute souillure. Éloigne mes transgressions, efface mes fautes. Je me repens et je reviens à toi. Restaure-moi dans ta grâce. Amen.",
        verse: "1 Jean 1:9",
        verseText: "Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner, et pour nous purifier de toute iniquité.",
      },
      {
        id: "pardon-2",
        title: "Crée en moi un cœur pur",
        text: "Seigneur, crée en moi un cœur pur, renouvelle en moi un esprit bien disposé. Je ne veux pas te servir avec un cœur partagé, ni t'aimer à moitié. Enlève de moi tout ce qui ne vient pas de toi : l'orgueil, la jalousie, l'amertume, la colère, la convoitise. Rends-moi un cœur nouveau, un cœur qui t'appartient totalement. Que ton Esprit habite en moi, transforme mes pensées, mes désirs, mes actions. Fais de moi une créature nouvelle. Amen.",
        verse: "Psaume 51:10",
        verseText: "Ô Dieu ! crée en moi un cœur pur, renouvelle en moi un esprit bien disposé.",
      },
      {
        id: "pardon-3",
        title: "Pardonner aux autres",
        text: "Seigneur, tu m'as pardonné tant de choses. Mais moi, j'ai du mal à pardonner à ceux qui m'ont fait du mal. Je porte des blessures, des rancunes, des désirs de vengeance. Aide-moi à lâcher prise, à pardonner comme tu m'as pardonné. Libère-moi de l'amertume, donne-moi un cœur généreux, capable d'aimer mes ennemis. Que ton amour transforme mes sentiments, que ta grâce guérisse mes relations. Je choisis de pardonner, avec ta force. Amen.",
        verse: "Colossiens 3:13",
        verseText: "Supportez-vous les uns les autres, et, si l'un a sujet de se plaindre de l'autre, pardonnez-vous réciproquement.",
      },
            {
        id: "pardon-4",
        title: "Pardon pour mes fautes cachées",
        text: "Seigneur, tu connais mon cœur mieux que moi-même. Il y a des fautes que je n'ose même pas regarder en face. Des pensées, des attitudes, des gestes que j'ai cachés. Mais toi, tu vois tout, tu connais tout. Lave-moi de mes fautes cachées, purifie-moi de ce qui est enfoui. Que ton Esprit m'éclaire, me révèle mes péchés, me conduise à la repentance. Crée en moi un cœur nouveau, transforme-moi en profondeur. Je veux être entier devant toi. Amen.",
        verse: "Psaume 19:12",
        verseText: "Qui connaît ses égarements ? Pardonne-moi ceux que j'ignore.",
      },
    ],
  },

  // ==========================================================
  // 7. INTERCESSION
  // ==========================================================
  {
    id: "intercession",
    name: "Intercession",
    icon: "intercession",
    description: "Prier pour les autres",
    prayers: [
      {
        id: "intercession-1",
        title: "Pour un être cher",
        text: "Seigneur, je viens te présenter mon être cher. Tu le connais, tu l'aimes, tu veux son bien. Je te demande de veiller sur lui, de le protéger, de le bénir. Si tu le sais dans l'épreuve, réconforte-le. Si tu le vois fatigué, restaure-le. Si tu le vois perdu, cherche-le et ramène-le. Qu'il sente ta présence, qu'il découvre ton amour, qu'il marche dans tes voies. Je te remets entre tes mains, car tu l'aimes plus que moi. Amen.",
        verse: "Jacques 5:16",
        verseText: "Priez les uns pour les autres, afin que vous soyez guéris.",
      },
      {
        id: "intercession-2",
        title: "Pour les malades",
        text: "Seigneur Jésus, je te présente tous ceux qui souffrent en ce moment, tous les malades, ceux qui sont hospitalisés, ceux qui souffrent en silence. Tu es le grand médecin. Pose ta main sur eux, apaise leurs douleurs, restaure leur santé. Donne-leur la force d'endurer, la foi de croire, l'espérance de guérir. Console leurs familles, soutiens les soignants. Que ta présence soit leur réconfort, ta grâce leur remède. Amen.",
        verse: "Psaume 103:3",
        verseText: "C'est lui qui pardonne toutes tes iniquités, qui guérit toutes tes maladies.",
      },
      {
        id: "intercession-3",
        title: "Pour le monde",
        text: "Père, je te prie pour ce monde qui souffre. Pour les peuples en guerre, les familles déplacées, les enfants orphelins. Pour les pays en crise, les économies fragiles, les dirigeants qui prennent des décisions. Pour l'Église persécutée, les missionnaires isolés, les croyants qui souffrent pour leur foi. Que ta paix vienne, que ta justice règne, que ton règne arrive. Utilise-moi pour être un instrument de ton amour. Amen.",
        verse: "1 Timothée 2:1",
        verseText: "J'exhorte donc, avant toutes choses, à faire des prières, des supplications, des requêtes, des actions de grâces, pour tous les hommes.",
      },
            {
        id: "intercession-4",
        title: "Pour les âmes perdues",
        text: "Père, mon cœur se brise pour ceux qui ne te connaissent pas encore. Pour ceux qui cherchent sans trouver, qui souffrent sans espoir, qui vivent loin de toi. Touche leur cœur, ouvre leurs yeux spirituels, attire-les à toi. Utilise-moi pour être un témoin, un reflet de ton amour, un messager de ta grâce. Que personne autour de moi ne périsse faute d'avoir entendu la bonne nouvelle. Donne-moi la compassion, la sagesse, et l'audace de partager ma foi. Amen.",
        verse: "Romains 10:1",
        verseText: "Frères, le vœu de mon cœur et ma prière à Dieu pour eux, c'est qu'ils soient sauvés.",
      },
    ],
  },

  // ==========================================================
  // 8. FORCE
  // ==========================================================
  {
    id: "force",
    name: "Force",
    icon: "force",
    description: "Épreuves, tentations",
    prayers: [
      {
        id: "force-1",
        title: "Force dans l'épreuve",
        text: "Seigneur, l'épreuve est lourde. Mes forces s'épuisent, mon courage flanche. Mais toi, tu es ma force, mon appui, mon secours. Je ne peux pas avancer seul, mais avec toi je peux tout. Renouvelle mes forces comme celles de l'aigle, donne-moi ton énergie, soutiens mes pas. Que cette épreuve ne me détruise pas, mais me fortifie. Apprends-moi à persévérer, à garder les yeux sur toi, à croire que le matin viendra. Tu es fidèle. Amen.",
        verse: "Ésaïe 40:31",
        verseText: "Mais ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles.",
      },
      {
        id: "force-2",
        title: "Résister à la tentation",
        text: "Père, la tentation m'attire, me séduit, me tente. Mais je ne veux pas tomber. Aide-moi à résister, à fuir le mal, à choisir la sainteté. Donne-moi la force de dire non, la sagesse de ne pas m'exposer, la grâce de me repentir vite si je tombe. Ton Esprit en moi est plus grand que celui qui est dans le monde. Fortifie ma volonté, garde mon cœur, protège mes pensées. Que je reste ferme dans la foi. Amen.",
        verse: "1 Corinthiens 10:13",
        verseText: "Dieu est fidèle, il ne permettra pas que vous soyez tentés au-delà de vos forces.",
      },
      {
        id: "force-3",
        title: "Ne me laisse pas abandonner",
        text: "Seigneur, je suis tenté d'abandonner. Les obstacles s'accumulent, les critiques me découragent, les résultats tardent. Mais tu m'invites à persévérer. Aide-moi à ne pas baisser les bras, à continuer à semer même dans les larmes, à faire le bien sans me lasser. Rappelle-moi que tu es avec moi, que tu vois mes efforts, que tu récompenseras ma fidélité. Donne-moi la force de tenir jusqu'au bout. Amen.",
        verse: "Galates 6:9",
        verseText: "Ne nous lassons pas de faire le bien ; car nous moissonnerons au temps convenable, si nous ne nous relâchons pas.",
      },
            {
        id: "force-4",
        title: "Force pour aujourd'hui",
        text: "Seigneur, je ne demande pas la force pour demain, ni pour la semaine, ni pour l'année. Je te demande la force pour aujourd'hui. Juste ce qu'il faut pour ce jour, cette heure, cet instant. Donne-moi la grâce de vivre un jour à la fois, sans m'inquiéter du lendemain. Ta manne tombe chaque matin, et elle suffit pour la journée. Aide-moi à me contenter de ta provision quotidienne, à faire face aux défis d'aujourd'hui avec toi. Amen.",
        verse: "Matthieu 6:34",
        verseText: "Ne vous inquiétez donc pas du lendemain ; car le lendemain aura soin de lui-même. À chaque jour suffit sa peine.",
      },
    ],
  },

  // ==========================================================
  // 9. ADORATION
  // ==========================================================
  {
    id: "adoration",
    name: "Adoration",
    icon: "adoration",
    description: "Pour Dieu seul",
    prayers: [
      {
        id: "adoration-1",
        title: "Tu es digne",
        text: "Seigneur, tu es digne de toute ma louange. Tu es le Roi des rois, le Seigneur des seigneurs, le Dieu trois fois saint. Les anges t'adorent, la création te loue, les cieux racontent ta gloire. Je viens m'incliner devant toi, non pour demander, mais pour t'adorer. Tu es grand, tu es bon, tu es fidèle. Mon âme te bénit, mon esprit te célèbre, mon cœur t'exalte. Sois glorifié dans ma vie, aujourd'hui et pour toujours. Amen.",
        verse: "Apocalypse 4:11",
        verseText: "Tu es digne, notre Seigneur et notre Dieu, de recevoir la gloire, l'honneur et la puissance.",
      },
      {
        id: "adoration-2",
        title: "Saint, saint, saint",
        text: "Saint, saint, saint est l'Éternel des armées ! Toute la terre est remplie de ta gloire. Tu es le Dieu trois fois saint, parfait en tout, sans défaut, sans ombre. Je t'adore pour ta sainteté, ta majesté, ta transcendance. Aide-moi à vivre dans la sainteté, à te refléter, à te ressembler. Que ma vie chante ta gloire, que mes paroles proclament ta bonté, que mes actions témoignent de ta grâce. Tu es mon Dieu, je t'adore. Amen.",
        verse: "Ésaïe 6:3",
        verseText: "Saint, saint, saint est l'Éternel des armées ! toute la terre est pleine de sa gloire !",
      },
      {
        id: "adoration-3",
        title: "Mon âme te bénit",
        text: "Mon âme, bénis l'Éternel, et tout ce qui est en moi, bénis son saint nom ! Seigneur, je te célèbre pour ce que tu es, pas seulement pour ce que tu fais. Tu es amour, tu es lumière, tu es vie. Tu es le commencement et la fin, l'alpha et l'oméga. Rien ni personne n'est au-dessus de toi. Que ma vie soit une adoration continue, un chant qui monte vers toi. Prends toute la place dans mon cœur. Amen.",
        verse: "Psaume 103:1",
        verseText: "Mon âme, bénis l'Éternel ! Que tout ce qui est en moi bénisse son saint nom !",
      },
            {
        id: "adoration-4",
        title: "Adoration dans l'épreuve",
        text: "Seigneur, je t'adore même quand tout va mal. Je te loue même quand je ne comprends pas. Tu es digne de louange en tout temps, dans la joie comme dans la tristesse, dans l'abondance comme dans le manque. Je choisis de t'adorer non pour ce que tu fais, mais pour ce que tu es. Tu es bon, tu es fidèle, tu es Dieu. Que ma louange monte vers toi comme un parfum agréable, même dans les larmes. Tu es digne. Amen.",
        verse: "Habacuc 3:17-18",
        verseText: "Car le figuier ne bourgeonnera plus, et il n'y aura plus de raisins à la vigne ; le produit de l'olivier manquera, et les champs ne donneront pas de nourriture ; les brebis disparaîtront du pâturage, et il n'y aura plus de bœufs dans les étables. Mais moi, je me réjouirai en l'Éternel, je me réjouirai dans le Dieu de mon salut.",
      },
    ],
  },

  // ==========================================================
  // 10. ACTION DE GRÂCE
  // ==========================================================
  {
    id: "action-de-grace",
    name: "Action de grâce",
    icon: "action",
    description: "Bénédictions reçues",
    prayers: [
      {
        id: "action-1",
        title: "Merci pour tes bénédictions",
        text: "Seigneur, je viens te remercier pour tes bénédictions innombrables. Merci pour ta protection, ta provision, ta fidélité. Merci pour les portes ouvertes, les prières exaucées, les miracles discrets. Merci pour ce que tu as donné et pour ce que tu as retiré, car tout vient de ta main d'amour. Mon cœur déborde de reconnaissance. Aide-moi à ne jamais oublier, à te remercier chaque jour, à vivre dans la gratitude. Tu es un Dieu généreux. Amen.",
        verse: "Psaume 103:2",
        verseText: "Mon âme, bénis l'Éternel, et n'oublie aucun de ses bienfaits !",
      },
      {
        id: "action-2",
        title: "Merci pour le salut",
        text: "Père, je te remercie pour le salut. Tu m'as cherché quand j'étais perdu, tu m'as sauvé quand j'étais condamné, tu m'as aimé quand je ne le méritais pas. Par grâce, tu m'as donné la vie éternelle. Je ne peux que tomber à tes pieds et te remercier. Que ma vie entière soit une réponse à ton amour. Donne-moi de partager cette bonne nouvelle, de vivre dans la reconnaissance, et d'aimer comme tu m'as aimé. Amen.",
        verse: "Jean 3:16",
        verseText: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique.",
      },
      {
        id: "action-3",
        title: "Merci pour chaque jour",
        text: "Seigneur, merci pour aujourd'hui. Merci pour le souffle, la vie, les couleurs du ciel. Merci pour les petites joies : un sourire, un rayon de soleil, un moment de calme. Merci pour les grandes choses : ta présence, ta Parole, ton Esprit. Chaque jour est un cadeau de ta part. Apprends-moi à vivre pleinement, à savourer chaque instant, à te remercier en toutes choses. Que ma vie soit un chant d'action de grâce. Amen.",
        verse: "Psaume 118:24",
        verseText: "C'est ici la journée que l'Éternel a faite : qu'elle soit pour nous un sujet d'allégresse et de joie !",
      },
            {
        id: "action-4",
        title: "Merci pour mes proches",
        text: "Seigneur, je te remercie pour les personnes que tu as placées sur mon chemin. Pour ma famille, mes amis, mes frères et sœurs en Christ. Merci pour leur amour, leur soutien, leur présence. Merci pour les moments partagés, les rires, les larmes, les prières communes. Bénis chacun d'eux, protège-les, conduis-les. Apprends-moi à les aimer comme tu les aimes, à les servir, à les encourager. Merci pour cette grande famille que tu m'as donnée. Amen.",
        verse: "Philippiens 1:3",
        verseText: "Je rends grâces à mon Dieu de tout le souvenir que je garde de vous.",
      },
    ],
  },

  // ==========================================================
  // 11. PRIÈRES BIBLIQUES
  // ==========================================================
  {
    id: "prayers-bibliques",
    name: "Prières bibliques",
    icon: "biblique",
    description: "Les grandes prières de la Bible",
    prayers: [
      {
        id: "biblique-notre-pere",
        title: "Notre Père",
        text: "Notre Père qui es aux cieux ! Que ton nom soit sanctifié ; que ton règne vienne ; que ta volonté soit faite sur la terre comme au ciel. Donne-nous aujourd'hui notre pain quotidien ; pardonne-nous nos offenses, comme nous aussi nous pardonnons à ceux qui nous ont offensés ; ne nous induis pas en tentation, mais délivre-nous du malin. Car c'est à toi qu'appartiennent, dans tous les siècles, le règne, la puissance et la gloire. Amen !",
        verse: "Matthieu 6:9-13",
        verseText: "Voici donc comment vous devez prier : Notre Père qui es aux cieux ! Que ton nom soit sanctifié.",
      },
      {
        id: "biblique-psaume-23",
        title: "L'Éternel est mon berger (Psaume 23)",
        text: "L'Éternel est mon berger : je ne manquerai de rien. Il me fait reposer dans de verts pâturages, il me dirige près des eaux paisibles. Il restaure mon âme, il me conduit dans les sentiers de la justice, à cause de son nom. Quand je marche dans la vallée de l'ombre de la mort, je ne crains aucun mal, car tu es avec moi : ta houlette et ton bâton me rassurent. Tu dresses devant moi une table, en face de mes adversaires ; tu oins d'huile ma tête, et ma coupe déborde. Oui, le bonheur et la grâce m'accompagneront tous les jours de ma vie, et j'habiterai dans la maison de l'Éternel jusqu'à la fin de mes jours.",
        verse: "Psaume 23:1-6",
        verseText: "L'Éternel est mon berger : je ne manquerai de rien. Il me fait reposer dans de verts pâturages, il me dirige près des eaux paisibles.",
      },
            {
        id: "biblique-jabets",
        title: "Prière de Jabets",
        text: "Jabets invoqua le Dieu d'Israël, en disant : Si tu me bénis et que tu étendes mes limites, si ta main est avec moi, et si tu me préserves du malheur, en sorte que je ne sois pas dans la souffrance ! Et Dieu accorda ce qu'il avait demandé. Seigneur, je viens te demander ta bénédiction, élargis mon territoire, élargis ma vision, élargis mon cœur. Que ta main soit avec moi dans tout ce que j'entreprends, protège-moi du mal et de la souffrance. Je veux être un instrument entre tes mains. Amen.",
        verse: "1 Chroniques 4:10",
        verseText: "Jabets invoqua le Dieu d'Israël, en disant : Si tu me bénis et que tu étendes mes limites, si ta main est avec moi, et si tu me préserves du malheur, en sorte que je ne sois pas dans la souffrance ! Et Dieu accorda ce qu'il avait demandé.",
      },
      {
        id: "biblique-aaron",
        title: "Bénédiction d'Aaron",
        text: "Que l'Éternel te bénisse, et qu'il te garde ! Que l'Éternel fasse luire sa face sur toi, et qu'il t'accorde sa grâce ! Que l'Éternel tourne sa face vers toi, et qu'il te donne la paix ! Seigneur, je reçois ta bénédiction. Que ta face brille sur moi, que ta grâce m'accompagne, que ta paix règne dans mon cœur. Garde-moi, protège-moi, conduis-moi. Que je sois une bénédiction pour ceux qui m'entourent. Amen.",
        verse: "Nombres 6:24-26",
        verseText: "Que l'Éternel te bénisse, et qu'il te garde ! Que l'Éternel fasse luire sa face sur toi, et qu'il t'accorde sa grâce ! Que l'Éternel tourne sa face vers toi, et qu'il te donne la paix !",
      },
      {
        id: "biblique-hebreux",
        title: "Bénédiction d'Hébreux",
        text: "Que le Dieu de paix, qui a ramené d'entre les morts le grand pasteur des brebis, par le sang d'une alliance éternelle, notre Seigneur Jésus, vous rende capables de toute bonne œuvre pour l'accomplissement de sa volonté, et qu'il fasse en vous ce qui lui est agréable, par Jésus-Christ, auquel soit la gloire aux siècles des siècles ! Amen. Seigneur, rends-moi capable de faire ta volonté, transforme-moi, utilise-moi. Que ta gloire se manifeste à travers ma vie. Amen.",
        verse: "Hébreux 13:20-21",
        verseText: "Que le Dieu de paix, qui a ramené d'entre les morts le grand pasteur des brebis, par le sang d'une alliance éternelle, notre Seigneur Jésus, vous rende capables de toute bonne œuvre.",
      },
      {
        id: "biblique-1",
        title: "Prière de Moïse (Psaume 90)",
        text: "Seigneur, tu as été notre refuge de génération en génération. Avant que les montagnes soient nées, tu es Dieu, d'éternité en éternité. Mille ans sont à tes yeux comme hier qui passe. Apprends-nous à compter nos jours, afin que nous acquérions un cœur sage. Rassasie-nous chaque matin de ta bonté, et nous serons dans l'allégresse. Que l'œuvre de nos mains soit établie par toi. Amen.",
        verse: "Psaume 90:1-2",
        verseText: "Seigneur, tu as été pour nous un refuge, de génération en génération.",
      },
      {
        id: "biblique-2",
        title: "Prière d'Anne (1 Samuel 2)",
        text: "Mon cœur se réjouit en l'Éternel, ma force a été relevée par l'Éternel. Ma bouche s'est ouverte contre mes ennemis, car je me réjouis de ton secours. Nul n'est saint comme l'Éternel ; il n'y a point d'autre Dieu que toi. L'Éternel fait mourir et fait vivre, il abaisse et il élève. Il relève le faible de la poussière, il retire le pauvre de la cendre. Il garde les pieds de ses fidèles. Amen.",
        verse: "1 Samuel 2:1-2",
        verseText: "Mon cœur se réjouit en l'Éternel, ma force a été relevée par l'Éternel.",
      },
      {
        id: "biblique-3",
        title: "Prière de David (2 Samuel 7)",
        text: "Qui suis-je, Seigneur Éternel, et quelle est ma maison, pour que tu m'aies fait parvenir où je suis ? Tu as fait pour ton serviteur une grande chose selon ta promesse. Que ton nom soit à jamais magnifié, et qu'on dise : L'Éternel des armées est le Dieu d'Israël ! Que la maison de ton serviteur soit affermie devant toi. Car tu as révélé à ton serviteur : Je te bâtirai une maison. Amen.",
        verse: "2 Samuel 7:18",
        verseText: "Qui suis-je, Seigneur Éternel, et quelle est ma maison, pour que tu m'aies fait parvenir où je suis ?",
      },
      {
        id: "biblique-4",
        title: "Prière de Salomon (1 Rois 8)",
        text: "Éternel, Dieu d'Israël, il n'y a point de Dieu semblable à toi, ni en haut dans les cieux, ni en bas sur la terre. Tu gardes l'alliance et la miséricorde envers tes serviteurs qui marchent de tout leur cœur devant toi. Que tes yeux soient ouverts sur cette maison nuit et jour. Écoute la supplication de ton serviteur. Quand ton peuple péchera et reviendra à toi, pardonne, guéris, restaure. Amen.",
        verse: "1 Rois 8:23",
        verseText: "Éternel, Dieu d'Israël ! Il n'y a point de Dieu semblable à toi, ni en haut dans les cieux, ni en bas sur la terre.",
      },
      {
        id: "biblique-5",
        title: "Prière de Marie (Magnificat)",
        text: "Mon âme exalte le Seigneur, et mon esprit se réjouit en Dieu, mon Sauveur, parce qu'il a jeté les yeux sur la bassesse de sa servante. Le Tout-Puissant a fait pour moi de grandes choses ; son nom est saint. Il a dispersé les hommes au cœur superbe, il a renversé les puissants et élevé les humbles. Il a comblé de biens les affamés, et renvoyé les riches à vide. Amen.",
        verse: "Luc 1:46-49",
        verseText: "Mon âme exalte le Seigneur, et mon esprit se réjouit en Dieu, mon Sauveur.",
      },
      {
        id: "biblique-6",
        title: "Prière de Jésus (Jean 17)",
        text: "Père, l'heure est venue. Glorifie ton Fils, afin que ton Fils te glorifie. Je ne prie pas pour le monde, mais pour ceux que tu m'as donnés, car ils sont à toi. Qu'ils soient tous un, comme toi, Père, tu es en moi, et comme je suis en toi, afin qu'eux aussi soient un en nous. Père juste, le monde ne t'a pas connu, mais moi je t'ai connu. Je leur ai fait connaître ton nom. Amen.",
        verse: "Jean 17:1-21",
        verseText: "Père, l'heure est venue ! Glorifie ton Fils, afin que ton Fils te glorifie.",
      },
      {
        id: "biblique-7",
        title: "Prière de Paul (Éphésiens 3)",
        text: "Père, je fléchis les genoux devant toi, de qui toute famille dans les cieux et sur la terre tire son nom. Donne-leur, selon la richesse de ta gloire, d'être puissamment fortifiés par ton Esprit, que Christ habite dans leurs cœurs par la foi, qu'ils soient enracinés et fondés dans l'amour, qu'ils puissent comprendre la largeur, la longueur, la profondeur et la hauteur de ton amour. Au-delà de tout ce que nous demandons ou pensons. Amen.",
        verse: "Éphésiens 3:14-21",
        verseText: "Je fléchis les genoux devant le Père, de qui toute famille dans les cieux et sur la terre tire son nom.",
      },
      {
        id: "biblique-8",
        title: "Prière de Jude",
        text: "À celui qui peut vous préserver de toute chute et vous faire paraître devant sa gloire irrépréhensibles et dans l'allégresse, à Dieu seul, notre Sauveur, par Jésus-Christ notre Seigneur, soient gloire, majesté, force et puissance, dès avant tous les temps, et maintenant, et dans tous les siècles ! Amen.",
        verse: "Jude 1:24-25",
        verseText: "À celui qui peut vous préserver de toute chute et vous faire paraître devant sa gloire irrépréhensibles et dans l'allégresse.",
      },
    ],
  },
];

// ============================================================
// HELPERS
// ============================================================

export function getCategoryById(id: string): PrayerCategory | null {
  return PRAYER_CATEGORIES.find((c) => c.id === id) || null;
}

export function getTotalPrayers(): number {
  return PRAYER_CATEGORIES.reduce((sum, cat) => sum + cat.prayers.length, 0);
}

export function getAllPrayers(): Prayer[] {
  return PRAYER_CATEGORIES.flatMap((cat) => cat.prayers);
}

export function searchPrayers(query: string): Prayer[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return getAllPrayers().filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.text.toLowerCase().includes(q) ||
      p.verse.toLowerCase().includes(q)
  );
}
