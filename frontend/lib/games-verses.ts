"use client";

// ============================================================
// LILOBA — Jeux : Complète le verset & Devine le verset
// ============================================================

export interface VerseGame {
  id: string;
  reference: string;
  fullText: string;
  missingWord: string;
  choices: string[];
  correctIndex: number;
  difficulty: "facile" | "moyen" | "difficile";
}

// ============================================================
// BASE DE VERSETS (30 versets)
// ============================================================

export const VERSE_GAMES: VerseGame[] = [
  // ---------- FACILE ----------
  {
    id: "v1",
    reference: "Jean 3:16",
    fullText:
      "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.",
    missingWord: "monde",
    choices: ["monde", "ciel", "peuple", "royaume"],
    correctIndex: 0,
    difficulty: "facile",
  },
  {
    id: "v2",
    reference: "Psaume 23:1",
    fullText: "L'Éternel est mon berger : je ne manquerai de rien.",
    missingWord: "berger",
    choices: ["berger", "roi", "père", "ami"],
    correctIndex: 0,
    difficulty: "facile",
  },
  {
    id: "v3",
    reference: "Jean 14:6",
    fullText:
      "Jésus lui dit : Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.",
    missingWord: "chemin",
    choices: ["chemin", "porte", "voie", "sentier"],
    correctIndex: 0,
    difficulty: "facile",
  },
  {
    id: "v4",
    reference: "Philippiens 4:13",
    fullText: "Je puis tout par celui qui me fortifie.",
    missingWord: "fortifie",
    choices: ["fortifie", "aime", "protège", "guide"],
    correctIndex: 0,
    difficulty: "facile",
  },
  {
    id: "v5",
    reference: "Matthieu 5:9",
    fullText:
      "Heureux ceux qui procurent la paix, car ils seront appelés fils de Dieu !",
    missingWord: "paix",
    choices: ["paix", "joie", "justice", "sagesse"],
    correctIndex: 0,
    difficulty: "facile",
  },
  {
    id: "v6",
    reference: "Psaume 119:105",
    fullText:
      "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.",
    missingWord: "lampe",
    choices: ["lampe", "épée", "flamme", "bouclier"],
    correctIndex: 0,
    difficulty: "facile",
  },
  {
    id: "v7",
    reference: "1 Jean 4:8",
    fullText: "Celui qui n'aime pas n'a pas connu Dieu, car Dieu est amour.",
    missingWord: "amour",
    choices: ["amour", "lumière", "paix", "puissance"],
    correctIndex: 0,
    difficulty: "facile",
  },
  {
    id: "v8",
    reference: "Romains 3:23",
    fullText: "Car tous ont péché et sont privés de la gloire de Dieu.",
    missingWord: "péché",
    choices: ["péché", "chuté", "failli", "erré"],
    correctIndex: 0,
    difficulty: "facile",
  },
  {
    id: "v9",
    reference: "Proverbes 3:5",
    fullText:
      "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse.",
    missingWord: "cœur",
    choices: ["cœur", "esprit", "âme", "force"],
    correctIndex: 0,
    difficulty: "facile",
  },
  {
    id: "v10",
    reference: "Jean 11:35",
    fullText: "Jésus pleura.",
    missingWord: "pleura",
    choices: ["pleura", "sourit", "pria", "parla"],
    correctIndex: 0,
    difficulty: "facile",
  },

  // ---------- MOYEN ----------
  {
    id: "v11",
    reference: "Ésaïe 40:31",
    fullText:
      "Mais ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles.",
    missingWord: "aigles",
    choices: ["aigles", "colombes", "oiseaux", "faucons"],
    correctIndex: 0,
    difficulty: "moyen",
  },
  {
    id: "v12",
    reference: "Matthieu 6:33",
    fullText:
      "Cherchez premièrement le royaume et la justice de Dieu ; et toutes ces choses vous seront données par-dessus.",
    missingWord: "royaume",
    choices: ["royaume", "amour", "salut", "chemin"],
    correctIndex: 0,
    difficulty: "moyen",
  },
  {
    id: "v13",
    reference: "Jérémie 29:11",
    fullText:
      "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.",
    missingWord: "espérance",
    choices: ["espérance", "joie", "paix", "force"],
    correctIndex: 0,
    difficulty: "moyen",
  },
  {
    id: "v14",
    reference: "Romains 8:28",
    fullText:
      "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.",
    missingWord: "bien",
    choices: ["bien", "mal", "salut", "bonheur"],
    correctIndex: 0,
    difficulty: "moyen",
  },
  {
    id: "v15",
    reference: "Galates 5:22",
    fullText:
      "Mais le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté, la bénignité, la fidélité.",
    missingWord: "Esprit",
    choices: ["Esprit", "Seigneur", "Père", "Christ"],
    correctIndex: 0,
    difficulty: "moyen",
  },
  {
    id: "v16",
    reference: "Hébreux 11:1",
    fullText:
      "Or la foi est une ferme assurance des choses qu'on espère, une démonstration de celles qu'on ne voit pas.",
    missingWord: "foi",
    choices: ["foi", "espérance", "charité", "confiance"],
    correctIndex: 0,
    difficulty: "moyen",
  },
  {
    id: "v17",
    reference: "Jacques 1:22",
    fullText:
      "Mettez en pratique la parole, et ne vous bornez pas à l'écouter, en vous trompant vous-mêmes par de faux raisonnements.",
    missingWord: "pratique",
    choices: ["pratique", "mémoire", "cœur", "vie"],
    correctIndex: 0,
    difficulty: "moyen",
  },
  {
    id: "v18",
    reference: "2 Timothée 3:16",
    fullText:
      "Toute Écriture est inspirée de Dieu, et utile pour enseigner, pour convaincre, pour corriger, pour instruire dans la justice.",
    missingWord: "inspirée",
    choices: ["inspirée", "sainte", "parfaite", "véritable"],
    correctIndex: 0,
    difficulty: "moyen",
  },
  {
    id: "v19",
    reference: "1 Corinthiens 13:13",
    fullText:
      "Maintenant donc ces trois choses demeurent : la foi, l'espérance, l'amour ; mais la plus grande de ces choses, c'est l'amour.",
    missingWord: "amour",
    choices: ["amour", "foi", "espérance", "paix"],
    correctIndex: 0,
    difficulty: "moyen",
  },
  {
    id: "v20",
    reference: "Actes 1:8",
    fullText:
      "Mais vous recevrez une puissance, le Saint-Esprit survenant sur vous, et vous serez mes témoins à Jérusalem, dans toute la Judée, dans la Samarie, et jusqu'aux extrémités de la terre.",
    missingWord: "témoins",
    choices: ["témoins", "disciples", "envoyés", "serviteurs"],
    correctIndex: 0,
    difficulty: "moyen",
  },

  // ---------- DIFFICILE ----------
  {
    id: "v21",
    reference: "Éphésiens 2:8-9",
    fullText:
      "C'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu.",
    missingWord: "grâce",
    choices: ["grâce", "miséricorde", "bonté", "faveur"],
    correctIndex: 0,
    difficulty: "difficile",
  },
  {
    id: "v22",
    reference: "Matthieu 11:28",
    fullText:
      "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.",
    missingWord: "repos",
    choices: ["repos", "paix", "joie", "force"],
    correctIndex: 0,
    difficulty: "difficile",
  },
  {
    id: "v23",
    reference: "Psaume 46:1",
    fullText:
      "Dieu est pour nous un refuge et un appui, un secours qui ne manque jamais dans la détresse.",
    missingWord: "refuge",
    choices: ["refuge", "abri", "tour", "forteresse"],
    correctIndex: 0,
    difficulty: "difficile",
  },
  {
    id: "v24",
    reference: "Proverbes 22:6",
    fullText:
      "Instruis l'enfant dans la voie qu'il doit suivre ; et quand il sera vieux, il ne s'en détournera pas.",
    missingWord: "Instruis",
    choices: ["Instruis", "Élève", "Corrige", "Guide"],
    correctIndex: 0,
    difficulty: "difficile",
  },
  {
    id: "v25",
    reference: "Lamentations 3:22-23",
    fullText:
      "Les bontés de l'Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme ; elles se renouvellent chaque matin.",
    missingWord: "renouvellent",
    choices: ["renouvellent", "multiplient", "grandissent", "reviennent"],
    correctIndex: 0,
    difficulty: "difficile",
  },
  {
    id: "v26",
    reference: "Ésaïe 41:10",
    fullText:
      "Ne crains rien, car je suis avec toi ; ne promène pas des regards inquiets, car je suis ton Dieu ; je te fortifie, je viens à ton secours.",
    missingWord: "fortifie",
    choices: ["fortifie", "protège", "aime", "guide"],
    correctIndex: 0,
    difficulty: "difficile",
  },
  {
    id: "v27",
    reference: "Matthieu 7:7",
    fullText:
      "Demandez, et l'on vous donnera ; cherchez, et vous trouverez ; frappez, et l'on vous ouvrira.",
    missingWord: "frappez",
    choices: ["frappez", "criez", "priez", "appelez"],
    correctIndex: 0,
    difficulty: "difficile",
  },
  {
    id: "v28",
    reference: "Colossiens 3:23",
    fullText:
      "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes.",
    missingWord: "Seigneur",
    choices: ["Seigneur", "Dieu", "Père", "Christ"],
    correctIndex: 0,
    difficulty: "difficile",
  },
  {
    id: "v29",
    reference: "1 Pierre 5:7",
    fullText:
      "Déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous.",
    missingWord: "soucis",
    choices: ["soucis", "péchés", "fardeaux", "peines"],
    correctIndex: 0,
    difficulty: "difficile",
  },
  {
    id: "v30",
    reference: "Apocalypse 21:4",
    fullText:
      "Il essuiera toute larme de leurs yeux, et la mort ne sera plus, et il n'y aura plus ni deuil, ni cri, ni douleur, car les premières choses ont disparu.",
    missingWord: "larme",
    choices: ["larme", "peine", "douleur", "crainte"],
    correctIndex: 0,
    difficulty: "difficile",
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
// SCORES (localStorage)
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
