// ============================================================
// LILOBA — SELAH · contenus (états du cœur + versets)
// ============================================================
// Textes bibliques : Louis Segond 1910 (domaine public), extraits
// automatiquement de public/bible.json (aucune recopie à la main).
// ============================================================

export type SoulState =
  | "paix"
  | "joie"
  | "fatigue"
  | "angoisse"
  | "colere"
  | "culpabilite"
  | "secheresse";

export interface SoulMeta {
  id: SoulState;
  emoji: string;
  fr: string;
  en: string;
}

export interface Prescription {
  ref: string;
  texte: string;
  meditation: string;
  pas: string;
  priere: string;
}

export const SELAH_STATES: SoulMeta[] = [
  { id: "paix", emoji: "🕊️", fr: "En paix", en: "At peace" },
  { id: "joie", emoji: "☀️", fr: "Joyeux(se)", en: "Joyful" },
  { id: "fatigue", emoji: "🌙", fr: "Fatigué(e)", en: "Weary" },
  { id: "angoisse", emoji: "🌊", fr: "Inquiet(ète)", en: "Anxious" },
  { id: "colere", emoji: "🔥", fr: "En colère", en: "Angry" },
  { id: "culpabilite", emoji: "💧", fr: "Besoin de pardon", en: "Needing forgiveness" },
  { id: "secheresse", emoji: "🏜️", fr: "Dans le désert", en: "In a dry season" },
];

export const SELAH_RX: Record<SoulState, Prescription[]> = {
  paix: [
    {
      ref: "Psaumes 23:1",
      texte: "L'Éternel est mon berger : je ne manquerai de rien.",
      meditation: "Garde cette paix comme on garde une flamme : ne la disperse pas ce soir. Rends grâce pour un bien précis avant de dormir.",
      pas: "Écris demain matin 3 sujets de reconnaissance avant de prendre ton appareil.",
      priere: "Merci, Berger fidèle, pour ta paix. Garde mon cœur tranquille. Amen.",
    },
    {
      ref: "Néhémie 8:10",
      texte: "La joie de l'Éternel sera votre force.",
      meditation: "Ta paix est une force, pas une pause. Quelqu'un autour de toi a besoin de ce calme : transmets-le demain.",
      pas: "Encourage une personne précise demain avec un verset.",
      priere: "Fais de ma paix une force pour les autres. Amen.",
    },
    {
      ref: "Jean 14:27",
      texte: "Je vous laisse la paix, je vous donne ma paix. Je ne vous donne pas comme le monde donne. Que votre cœur ne se trouble point, et ne s'alarme point.",
      meditation: "La paix que Jésus donne ne dépend pas de ce que tu as traversé aujourd'hui. Reçois-la comme un cadeau, pas comme un résultat.",
      pas: "Avant de dormir, dis merci à Dieu pour une chose précise qui s'est bien passée.",
      priere: "Seigneur Jésus, merci pour ta paix. Que mon cœur ne se trouble pas cette nuit. Amen.",
    },
    {
      ref: "Psaumes 4:8",
      texte: "Je me couche et je m'endors en paix, Car toi seul, ô Éternel ! tu me donnes la sécurité dans ma demeure.",
      meditation: "Dormir en paix est un acte de confiance : tu remets ta journée entre les mains de celui qui veille. Tu peux lâcher prise.",
      pas: "Ce soir, remets à Dieu la liste de demain avant de fermer les yeux.",
      priere: "Je me couche en paix, Seigneur, car tu me gardes. Amen.",
    },
  ],
  joie: [
    {
      ref: "Philippiens 4:4",
      texte: "Réjouissez-vous toujours dans le Seigneur ; je le répète, réjouissez-vous.",
      meditation: "Ta joie est un témoignage. Ne la garde pas pour toi : la joie partagée devient louange.",
      pas: "Chante ou lis à voix haute un psaume de louange demain.",
      priere: "Je me réjouis en toi, Seigneur, aujourd'hui et demain. Amen.",
    },
    {
      ref: "Psaumes 118:24",
      texte: "C'est ici la journée que l'Éternel a faite : Qu'elle soit pour nous un sujet d'allégresse et de joie !",
      meditation: "Chaque jour vient de Dieu. Demain est déjà un cadeau : ouvre-le avec confiance.",
      pas: "Commence demain par ces mots : « ce jour est un cadeau ».",
      priere: "Merci pour ce jour que tu as fait. Amen.",
    },
    {
      ref: "Psaumes 126:3",
      texte: "L'Éternel a fait pour nous de grandes choses ; Nous sommes dans la joie.",
      meditation: "Fais mémoire des bienfaits de Dieu : ce que tu as reçu aujourd'hui mérite d'être nommé à voix haute.",
      pas: "Raconte demain à quelqu'un une chose que Dieu a faite pour toi.",
      priere: "Merci pour les grandes choses que tu as faites pour moi. Amen.",
    },
    {
      ref: "1 Thessaloniciens 5:16-18",
      texte: "Soyez toujours joyeux. Priez sans cesse. Rendez grâces en toutes choses, car c'est à votre égard la volonté de Dieu en Jésus-Christ.",
      meditation: "La joie, la prière et la reconnaissance vont ensemble : chacune nourrit les deux autres. Aujourd'hui, il y a au moins une chose pour laquelle rendre grâce.",
      pas: "Demain, remercie Dieu à voix haute trois fois dans la journée.",
      priere: "Merci, Seigneur, en toutes choses. Garde-moi dans la joie et dans la prière. Amen.",
    },
  ],
  fatigue: [
    {
      ref: "Matthieu 11:28",
      texte: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.",
      meditation: "Tu n'as pas à tout porter ce soir. Pose ce fardeau devant Jésus : lui ne dort pas, toi si. Le repos est un acte de foi.",
      pas: "Couche-toi 30 minutes plus tôt, appareil hors de la chambre.",
      priere: "Jésus, je te donne ma fatigue. Donne-moi ton repos. Amen.",
    },
    {
      ref: "Ésaïe 40:31",
      texte: "Mais ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles ; Ils courent, et ne se lassent point, Ils marchent, et ne se fatiguent point.",
      meditation: "Ta force ne vient pas seulement de ton sommeil, mais de ta confiance. Attends-toi à Dieu avant de t'attendre à toi-même.",
      pas: "Demain, prends 5 minutes de silence avant tout effort.",
      priere: "Renouvelle ma force, Seigneur, comme celle de l'aigle. Amen.",
    },
    {
      ref: "Psaumes 127:2",
      texte: "En vain vous levez-vous matin, vous couchez-vous tard, Et mangez-vous le pain de douleur ; Il en donne autant à ses bien-aimés pendant leur sommeil.",
      meditation: "Dieu donne du repos à ceux qu'il aime. Ton travail compte, mais ta valeur ne dépend pas de tout ce que tu as accompli aujourd'hui.",
      pas: "Demain, prévois une vraie pause de 15 minutes, sans écran.",
      priere: "Père, je te confie ce que je n'ai pas pu terminer. Donne-moi un sommeil paisible. Amen.",
    },
    {
      ref: "Psaumes 121:3-4",
      texte: "Il ne permettra point que ton pied chancelle ; Celui qui te garde ne sommeillera point. Voici, il ne sommeille ni ne dort, Celui qui garde Israël.",
      meditation: "Pendant que tu dors, celui qui te garde reste éveillé. Tu peux te reposer sans craindre que quelque chose lui échappe.",
      pas: "Ce soir, nomme à Dieu une chose qui te pèse, puis laisse-la entre ses mains.",
      priere: "Merci de veiller sur moi cette nuit. Je me repose en toi. Amen.",
    },
  ],
  angoisse: [
    {
      ref: "Ésaïe 41:10",
      texte: "Ne crains rien, car je suis avec toi ; Ne promène pas des regards inquiets, car je suis ton Dieu ; Je te fortifie, je viens à ton secours, Je te soutiens de ma droite triomphante.",
      meditation: "Dis ta peur à Dieu telle qu'elle est : elle pèse moins quand elle est nommée devant lui. Il est avec toi au milieu de ce qui t'inquiète, pas seulement après.",
      pas: "Écris ta peur sur un papier, puis recopie ce verset en dessous.",
      priere: "Je ne crains rien, car tu es avec moi. Amen.",
    },
    {
      ref: "Philippiens 4:6",
      texte: "Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.",
      meditation: "Transforme chaque « et si… » en prière concrète. L'inquiétude est une prière qui n'a pas encore trouvé son destinataire.",
      pas: "Demain, chaque inquiétude devient une prière de 30 secondes, tout de suite.",
      priere: "Je te confie mes besoins, un par un. Amen.",
    },
    {
      ref: "1 Pierre 5:7",
      texte: "Et déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous.",
      meditation: "Se décharger, c'est déposer : un souci après l'autre, dans les mains de celui qui prend soin de toi. Il ne te demande pas de les porter seul.",
      pas: "Écris tes soucis du moment, puis lis ce verset à voix haute sur cette liste.",
      priere: "Seigneur, je dépose mes soucis devant toi. Prends soin de moi. Amen.",
    },
    {
      ref: "Psaumes 94:19",
      texte: "Quand les pensées s'agitent en foule au dedans de moi, Tes consolations réjouissent mon âme.",
      meditation: "Même quand les pensées s'agitent, la consolation de Dieu est plus proche que tu ne le crois. Respire, et laisse-la t'atteindre.",
      pas: "Demain, quand une pensée t'agite, répète ce verset lentement, une fois.",
      priere: "Console mon âme, Seigneur, et apaise mes pensées. Amen.",
    },
  ],
  colere: [
    {
      ref: "Éphésiens 4:26",
      texte: "Si vous vous mettez en colère, ne péchez point ; que le soleil ne se couche pas sur votre colère.",
      meditation: "Ta colère signale souvent une blessure ou une injustice : écoute-la sans lui obéir. Règle cela avant la nuit.",
      pas: "Avant de dormir, pardonne à une personne, à voix haute, même de loin.",
      priere: "Apprends-moi la colère lente et le pardon rapide. Amen.",
    },
    {
      ref: "Proverbes 15:1",
      texte: "Une réponse douce calme la fureur, Mais une parole dure excite la colère.",
      meditation: "Une conversation importante t'attend peut-être demain. Prépare à l'avance ta première phrase douce.",
      pas: "Demain, réponds doucement une fois, là où tu aurais haussé le ton.",
      priere: "Mets une garde à ma bouche, Seigneur. Amen.",
    },
    {
      ref: "Jacques 1:19-20",
      texte: "Que tout homme soit prompt à écouter, lent à parler, lent à se mettre en colère ; car la colère de l'homme n'accomplit pas la justice de Dieu.",
      meditation: "Écouter avant de parler ralentit la colère. Ce soir, demande-toi ce que tu n'as pas écouté aujourd'hui.",
      pas: "Lors de la prochaine discussion tendue, attends trois secondes avant de répondre.",
      priere: "Apprends-moi à écouter, à parler lentement et à ne pas m'emporter. Amen.",
    },
    {
      ref: "Proverbes 14:29",
      texte: "Celui qui est lent à la colère a une grande intelligence, Mais celui qui est prompt à s'emporter proclame sa folie.",
      meditation: "Être lent à la colère est une force, pas une faiblesse. La sagesse commence quand on laisse passer la première réaction.",
      pas: "Demain, quand la colère monte, éloigne-toi une minute et prie.",
      priere: "Donne-moi un esprit calme et sage, Seigneur. Amen.",
    },
  ],
  culpabilite: [
    {
      ref: "1 Jean 1:9",
      texte: "Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner, et pour nous purifier de toute iniquité.",
      meditation: "Dis les choses précisément à Dieu, sans te cacher : il pardonne ce qui est confessé, et la honte vague s'allège. Tu peux venir tel que tu es.",
      pas: "Demain, confesse à Dieu (et à la personne concernée si possible) une chose précise.",
      priere: "Je confesse, tu pardonnes, tu purifies. Merci. Amen.",
    },
    {
      ref: "Psaumes 51:10",
      texte: "O Dieu ! crée en moi un cœur pur, Renouvelle en moi un esprit bien disposé.",
      meditation: "Ne demande pas seulement pardon : demande un cœur neuf. Dieu ne se contente pas de réparer, il renouvelle.",
      pas: "Demain, pose un acte concret qui montre ce cœur neuf (réparer, rendre, appeler).",
      priere: "Crée en moi un cœur pur, ô Dieu. Amen.",
    },
    {
      ref: "Psaumes 103:12",
      texte: "Autant l'orient est éloigné de l'occident, Autant il éloigne de nous nos transgressions.",
      meditation: "Quand Dieu pardonne, il éloigne vraiment. Ce que tu as confessé n'est plus posé sur toi : tu peux avancer sans le traîner.",
      pas: "Chaque fois que ce souvenir reviendra demain, remercie Dieu pour son pardon.",
      priere: "Merci, Père, d'éloigner de moi ce que j'ai confessé. Amen.",
    },
    {
      ref: "Romains 8:1",
      texte: "Il n'y a donc maintenant aucune condamnation pour ceux qui sont en Jésus-Christ.",
      meditation: "En Jésus-Christ, la condamnation n'a plus de place. Le regret nous conduit à Dieu ; l'accusation, elle, n'est pas sa voix.",
      pas: "Si une pensée d'accusation revient demain, réponds-lui avec ce verset.",
      priere: "Merci, Jésus, de ne pas me condamner. Je me remets à toi. Amen.",
    },
  ],
  secheresse: [
    {
      ref: "Psaumes 42:1",
      texte: "Comme une biche soupire après des courants d'eau, Ainsi mon âme soupire après toi, ô Dieu !",
      meditation: "Ta soif est déjà une prière. Les saisons sèches précèdent souvent les sources. Reviens au puits : un chapitre, lentement.",
      pas: "Demain, lis un psaume lentement, sans objectif de quantité.",
      priere: "Mon âme a soif de toi. Viens. Amen.",
    },
    {
      ref: "Lamentations 3:22-23",
      texte: "Les bontés de l'Éternel ne sont pas épuisées, Ses compassions ne sont pas à leur terme ; Elles se renouvellent chaque matin. Oh ! que ta fidélité est grande !",
      meditation: "La fidélité de Dieu ne dépend pas de tes sentiments. Demain matin, tout est renouvelé, toi aussi.",
      pas: "Demain matin, lis ce verset avant de regarder un écran.",
      priere: "Tes bontés se renouvellent, même pour moi. Amen.",
    },
    {
      ref: "Jacques 4:8",
      texte: "Approchez-vous de Dieu, et il s'approchera de vous.",
      meditation: "Quand on se sent loin, on peut commencer par un petit pas. Dieu promet de venir à la rencontre de celui qui s'approche.",
      pas: "Prends cinq minutes demain pour lire un psaume et lui parler simplement.",
      priere: "Je m'approche de toi, Seigneur. Approche-toi de moi. Amen.",
    },
    {
      ref: "Jérémie 29:13",
      texte: "Vous me chercherez, et vous me trouverez, si vous me cherchez de tout votre cœur.",
      meditation: "Chercher Dieu, même sans émotion, est déjà une réponse à son appel. Il se laisse trouver par celui qui persévère.",
      pas: "Demain, cherche-le sans objectif : lis lentement un seul verset.",
      priere: "Je te cherche de tout mon cœur. Fais-toi trouver. Amen.",
    },
  ],
};
