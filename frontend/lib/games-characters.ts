"use client";

// ============================================================
// LILOBA — Jeu : Qui suis-je ?
// ============================================================

export interface CharacterGame {
  id: string;
  name: string;
  hints: [string, string, string]; // 3 indices
  choices: string[]; // 4 choix (dont le bon)
  correctIndex: number;
  reference: string;
}

// ============================================================
// BASE DE PERSONNAGES (20)
// ============================================================

export const CHARACTER_GAMES: CharacterGame[] = [
  {
    id: "c1",
    name: "David",
    hints: [
      "J'ai été berger avant de devenir roi.",
      "J'ai vaincu un géant avec une fronde et une pierre.",
      "J'ai écrit de nombreux Psaumes.",
    ],
    choices: ["David", "Saül", "Salomon", "Josué"],
    correctIndex: 0,
    reference: "1 Samuel 17",
  },
  {
    id: "c2",
    name: "Moïse",
    hints: [
      "J'ai été sauvé des eaux étant bébé.",
      "J'ai conduit mon peuple hors d'Égypte.",
      "J'ai reçu les Dix Commandements sur le mont Sinaï.",
    ],
    choices: ["Moïse", "Aaron", "Josué", "Abraham"],
    correctIndex: 0,
    reference: "Exode 3",
  },
  {
    id: "c3",
    name: "Abraham",
    hints: [
      "J'ai quitté ma patrie sur l'ordre de Dieu.",
      "Dieu m'a promis une descendance aussi nombreuse que les étoiles.",
      "J'ai été prêt à sacrifier mon fils Isaac.",
    ],
    choices: ["Abraham", "Noé", "Jacob", "Isaac"],
    correctIndex: 0,
    reference: "Genèse 22",
  },
  {
    id: "c4",
    name: "Noé",
    hints: [
      "J'ai construit une arche en bois.",
      "J'ai sauvé ma famille et les animaux du déluge.",
      "J'ai reçu l'arc-en-ciel comme signe d'alliance.",
    ],
    choices: ["Noé", "Adam", "Énoch", "Lémec"],
    correctIndex: 0,
    reference: "Genèse 6",
  },
  {
    id: "c5",
    name: "Josué",
    hints: [
      "J'ai succédé à Moïse.",
      "J'ai fait tomber les murs de Jéricho.",
      "J'ai conduit Israël dans la Terre promise.",
    ],
    choices: ["Josué", "Caleb", "Gédéon", "Samuel"],
    correctIndex: 0,
    reference: "Josué 6",
  },
  {
    id: "c6",
    name: "Samson",
    hints: [
      "Ma force résidait dans mes cheveux.",
      "J'ai été trahi par Dalila.",
      "J'ai fait s'écrouler le temple des Philistins.",
    ],
    choices: ["Samson", "Gédéon", "Saül", "Élie"],
    correctIndex: 0,
    reference: "Juges 16",
  },
  {
    id: "c7",
    name: "Salomon",
    hints: [
      "J'étais le fils de David.",
      "J'ai demandé à Dieu la sagesse plutôt que la richesse.",
      "J'ai construit le Temple de Jérusalem.",
    ],
    choices: ["Salomon", "Absalom", "Amnon", "Éliab"],
    correctIndex: 0,
    reference: "1 Rois 3",
  },
  {
    id: "c8",
    name: "Élie",
    hints: [
      "J'ai été nourri par des corbeaux.",
      "J'ai défié les prophètes de Baal sur le mont Carmel.",
      "Je suis monté au ciel dans un char de feu.",
    ],
    choices: ["Élie", "Élisée", "Ésaïe", "Jérémie"],
    correctIndex: 0,
    reference: "1 Rois 18",
  },
  {
    id: "c9",
    name: "Daniel",
    hints: [
      "J'ai été jeté dans la fosse aux lions.",
      "J'ai interprété les rêves de rois.",
      "J'ai prié trois fois par jour malgré les menaces.",
    ],
    choices: ["Daniel", "Ézéchiel", "Néhémie", "Esdras"],
    correctIndex: 0,
    reference: "Daniel 6",
  },
  {
    id: "c10",
    name: "Jonas",
    hints: [
      "J'ai fui l'appel de Dieu.",
      "J'ai été avalé par un grand poisson.",
      "J'ai prêché à Ninive, qui s'est repentie.",
    ],
    choices: ["Jonas", "Amos", "Osée", "Michée"],
    correctIndex: 0,
    reference: "Jonas 1",
  },
  {
    id: "c11",
    name: "Marie (mère de Jésus)",
    hints: [
      "J'ai reçu la visite de l'ange Gabriel.",
      "J'ai donné naissance à Jésus à Bethléem.",
      "J'ai répondu : « Je suis la servante du Seigneur. »",
    ],
    choices: [
      "Marie (mère de Jésus)",
      "Marthe",
      "Marie de Magdala",
      "Élisabeth",
    ],
    correctIndex: 0,
    reference: "Luc 1",
  },
  {
    id: "c12",
    name: "Pierre",
    hints: [
      "J'étais pêcheur sur le lac de Galilée.",
      "Jésus m'a appelé « Pierre », le rocher.",
      "J'ai renié Jésus trois fois, puis je me suis repenti.",
    ],
    choices: ["Pierre", "Jean", "Jacques", "André"],
    correctIndex: 0,
    reference: "Matthieu 4",
  },
  {
    id: "c13",
    name: "Paul",
    hints: [
      "Je persécutais les chrétiens avant ma conversion.",
      "J'ai rencontré Jésus sur le chemin de Damas.",
      "J'ai écrit de nombreuses épîtres.",
    ],
    choices: ["Paul", "Barnabas", "Silas", "Timothée"],
    correctIndex: 0,
    reference: "Actes 9",
  },
  {
    id: "c14",
    name: "Jean (apôtre)",
    hints: [
      "J'étais l'un des douze disciples.",
      "Jésus m'appelait souvent « le disciple que Jésus aimait ».",
      "J'ai écrit l'Apocalypse sur l'île de Patmos.",
    ],
    choices: ["Jean (apôtre)", "Jacques", "André", "Philippe"],
    correctIndex: 0,
    reference: "Apocalypse 1",
  },
  {
    id: "c15",
    name: "Marthe",
    hints: [
      "J'étais la sœur de Marie et de Lazare.",
      "J'étais occupée à servir quand Jésus venait chez nous.",
      "J'ai confessé : « Tu es le Christ, le Fils de Dieu. »",
    ],
    choices: ["Marthe", "Marie de Magdala", "Élisabeth", "Anne"],
    correctIndex: 0,
    reference: "Jean 11",
  },
  {
    id: "c16",
    name: "Esther",
    hints: [
      "J'étais une reine juive en Perse.",
      "J'ai sauvé mon peuple d'un massacre.",
      "J'ai jeûné trois jours avant d'approcher le roi.",
    ],
    choices: ["Esther", "Ruth", "Rachel", "Débora"],
    correctIndex: 0,
    reference: "Esther 4",
  },
  {
    id: "c17",
    name: "Ruth",
    hints: [
      "J'étais une Moabite devenue l'ancêtre de David.",
      "J'ai dit à Naomi : « Ton peuple sera mon peuple. »",
      "J'ai épousé Boaz dans les champs de Bethléem.",
    ],
    choices: ["Ruth", "Naomi", "Orpa", "Rahab"],
    correctIndex: 0,
    reference: "Ruth 1",
  },
  {
    id: "c18",
    name: "Abraham",
    hints: [
      "Mon nom signifie « père d'une multitude ».",
      "J'ai quitté Ur en Chaldée sur l'ordre de Dieu.",
      "J'ai cru à Dieu, et cela m'a été compté comme justice.",
    ],
    choices: ["Abraham", "Nachor", "Térach", "Loth"],
    correctIndex: 0,
    reference: "Genèse 15",
  },
  {
    id: "c19",
    name: "Jean-Baptiste",
    hints: [
      "J'étais le cousin de Jésus.",
      "Je baptisais dans le Jourdain.",
      "J'ai préparé le chemin du Seigneur dans le désert.",
    ],
    choices: ["Jean-Baptiste", "Élie", "Élisée", "Zacharie"],
    correctIndex: 0,
    reference: "Matthieu 3",
  },
  {
    id: "c20",
    name: "Jésus",
    hints: [
      "Je suis né à Bethléem.",
      "J'ai accompli de nombreux miracles.",
      "Je suis mort et ressuscité pour sauver le monde.",
    ],
    choices: ["Jésus", "Moïse", "Élie", "Énoch"],
    correctIndex: 0,
    reference: "Jean 3:16",
  },
];

// ============================================================
// HELPERS
// ============================================================

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================
// SCORES
// ============================================================

const SCORES_KEY = "liloba-games-scores";

export interface GameScores {
  completeVerse: { best: number; played: number };
  guessVerse: { best: number; played: number };
  whoAmI: { best: number; played: number };
}

export function getScores(): GameScores {
  if (typeof window === "undefined") {
    return {
      completeVerse: { best: 0, played: 0 },
      guessVerse: { best: 0, played: 0 },
      whoAmI: { best: 0, played: 0 },
    };
  }
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) {
      return {
        completeVerse: { best: 0, played: 0 },
        guessVerse: { best: 0, played: 0 },
        whoAmI: { best: 0, played: 0 },
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      completeVerse: { best: 0, played: 0 },
      guessVerse: { best: 0, played: 0 },
      whoAmI: { best: 0, played: 0 },
    };
  }
}

export function updateScore(
  game: "completeVerse" | "guessVerse" | "whoAmI",
  score: number
): void {
  if (typeof window === "undefined") return;
  try {
    const scores = getScores();
    scores[game].played += 1;
    if (score > scores[game].best) {
      scores[game].best = score;
    }
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  } catch {
    // ignore
  }
}
