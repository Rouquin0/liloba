"use client";

// ============================================================
// LILOBA — LE MIROIR · Examen spirituel quotidien
// ============================================================
// EXCLUSIVITÉ LILOBA : la seule Bible IA qui te lit AVANT de
// te répondre. Le Miroir croise TES données locales (journal
// 24 h, versets marqués, couleurs de surlignage, streak) avec
// ton état d'âme déclaré, et produit une prescription :
// 1 verset-médecine + 1 lettre + 1 défi pour demain.
// 100 % hors-ligne (moteur déterministe local). Aucune donnée
// ne quitte le téléphone. Bouton bonus : approfondir avec
// Apollos quand tu es en ligne.
// ============================================================

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { getJournal } from "@/lib/journal";
import { getHistory } from "@/lib/history";
import {
  countHighlightsByColor,
  countAllHighlights,
} from "@/lib/highlights";
import { getStreak } from "@/lib/stats";
import { addJournalEntry } from "@/lib/journal";

// ------------------------------------------------------------
// TYPES
// ------------------------------------------------------------

type SoulState =
  | "paix"
  | "joie"
  | "fatigue"
  | "angoisse"
  | "colere"
  | "culpabilite"
  | "secheresse";

interface Prescription {
  ref: string;
  texte: string;
  lettre: string;
  defi: string;
  priere: string;
}

interface SoulMeta {
  id: SoulState;
  emoji: string;
  fr: string;
  en: string;
}

const STATES: SoulMeta[] = [
  { id: "paix", emoji: "🕊️", fr: "En paix", en: "At peace" },
  { id: "joie", emoji: "☀️", fr: "Joyeux(se)", en: "Joyful" },
  { id: "fatigue", emoji: "🌙", fr: "Fatigué(e)", en: "Weary" },
  { id: "angoisse", emoji: "🌊", fr: "Angoissé(e)", en: "Anxious" },
  { id: "colere", emoji: "🔥", fr: "En colère", en: "Angry" },
  { id: "culpabilite", emoji: "💧", fr: "Coupable", en: "Guilty" },
  { id: "secheresse", emoji: "🏜️", fr: "Sec / loin", en: "Dry / distant" },
];

// ------------------------------------------------------------
// TEXTES UI (bilingue local, sans toucher à i18n.ts)
// ------------------------------------------------------------

const UI = {
  fr: {
    title: "Le Miroir",
    subtitle: "Ton examen spirituel quotidien",
    tagline:
      "La seule Bible IA qui te lit avant de te répondre : elle croise ton état d'âme avec tes lectures, tes surlignages et ton rythme — tout reste sur ton téléphone.",
    step1: "1 · Comment est ton âme ce soir ?",
    step2: "2 · Ton intention (optionnel)",
    intentionPh: "Ex : examen demain, dispute à réparer, décision à prendre…",
    reveal: "Révéler mon Miroir",
    reading: "Le Miroir lit tes dernières 24 h…",
    signals: "Ce que ton âme a fait",
    verse: "Ton verset-médecine",
    letter: "La lettre",
    challenge: "Ton défi pour demain",
    prayer: "Prière à dire à voix haute",
    save: "Sceller dans mon journal",
    saved: "Scellé dans ton journal. Reviens demain. 🌿",
    apollos: "Approfondir avec Apollos",
    apollosHint: "Question copiée : colle-la à Apollos dans le chat.",
    share: "Partager",
    copied: "Copié !",
    again: "Refaire le Miroir",
    onceDone: "Miroir du jour accompli",
  },
  en: {
    title: "The Mirror",
    subtitle: "Your daily spiritual examen",
    tagline:
      "The only Bible AI that reads you before answering: it crosses your soul-state with your readings, highlights and rhythm — everything stays on your phone.",
    step1: "1 · How is your soul tonight?",
    step2: "2 · Your intention (optional)",
    intentionPh: "E.g. exam tomorrow, a conflict to repair, a decision…",
    reveal: "Reveal my Mirror",
    reading: "The Mirror reads your last 24 hours…",
    signals: "What your soul has done",
    verse: "Your medicine-verse",
    letter: "The letter",
    challenge: "Your challenge for tomorrow",
    prayer: "Prayer to say aloud",
    save: "Seal in my journal",
    saved: "Sealed in your journal. Come back tomorrow. 🌿",
    apollos: "Go deeper with Apollos",
    apollosHint: "Question copied: paste it to Apollos in the chat.",
    share: "Share",
    copied: "Copied!",
    again: "Do the Mirror again",
    onceDone: "Today's Mirror done",
  },
};

// ------------------------------------------------------------
// PRESCRIPTIONS (LSG 1910 — domaine public)
// 2 variantes par état : alternance déterministe jour + activité
// ------------------------------------------------------------

const RX: Record<SoulState, Prescription[]> = {
  paix: [
    {
      ref: "Psaumes 23:1",
      texte: "L'Éternel est mon berger : je ne manquerai de rien.",
      lettre:
        "Garde cette paix comme on garde une flamme : ne la disperse pas ce soir. Rends grâce pour un bien précis avant de dormir.",
      defi: "Écris demain matin 3 grâces avant de toucher ton téléphone.",
      priere:
        "Merci, Berger fidèle, pour ta paix. Garde mon cœur tranquille. Amen.",
    },
    {
      ref: "Néhémie 8:10",
      texte: "La joie de l'Éternel sera votre force.",
      lettre:
        "Ta paix est une force, pas une pause. Quelqu'un autour de toi a besoin de ce calme : transmets-le demain.",
      defi: "Encourage une personne précise demain avec un verset.",
      priere: "Fais de ma paix une force pour les autres. Amen.",
    },
  ],
  joie: [
    {
      ref: "Philippiens 4:4",
      texte: "Réjouissez-vous toujours dans le Seigneur ; je le répète, réjouissez-vous.",
      lettre:
        "Ta joie est un témoignage. Ne la garde pas pour toi : la joie partagée devient louange.",
      defi: "Chante ou lis un psaume de louange à voix haute demain.",
      priere: "Je me réjouis en toi, Seigneur, aujourd'hui et demain. Amen.",
    },
    {
      ref: "Psaumes 118:24",
      texte: "C'est ici la journée que l'Éternel a faite : qu'elle soit pour nous un sujet d'allégresse et de joie !",
      lettre:
        "Chaque jour est fabriqué par Dieu. Demain est déjà un cadeau emballé : ouvre-le avec confiance.",
      defi: "Commence demain par : « ce jour est un cadeau ».",
      priere: "Merci pour ce jour que tu as fait. Amen.",
    },
  ],
  fatigue: [
    {
      ref: "Matthieu 11:28",
      texte:
        "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.",
      lettre:
        "Tu n'as pas à porter ce soir. Pose le fardeau nommé — Dieu ne dort pas, toi si. Le repos est un acte de foi.",
      defi: "Couche-toi 30 minutes plus tôt, téléphone hors de la chambre.",
      priere: "Jésus, je te donne ma fatigue. Donne-moi ton repos. Amen.",
    },
    {
      ref: "Ésaïe 40:31",
      texte:
        "Ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles.",
      lettre:
        "Ta force ne vient pas de ton sommeil mais de ta confiance. Attends-toi à Dieu avant de t'attendre à toi-même.",
      defi: "Demain, 5 minutes de silence avant tout effort.",
      priere: "Renouvelle ma force, Seigneur, comme l'aigle. Amen.",
    },
  ],
  angoisse: [
    {
      ref: "Ésaïe 41:10",
      texte:
        "Ne crains rien, car je suis avec toi ; ne promène pas des regards inquiets, car je suis ton Dieu.",
      lettre:
        "Nomme ta peur par son vrai nom : elle rétrécit dès qu'elle est nommée devant Dieu. Il est avec toi dedans, pas seulement après.",
      defi: "Écris ta peur sur papier, puis écris ce verset en dessous.",
      priere: "Je ne crains rien, tu es avec moi. Amen.",
    },
    {
      ref: "Philippiens 4:6",
      texte:
        "Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.",
      lettre:
        "Transforme chaque « et si… » en prière concrète. L'inquiétude est une prière qui n'a pas encore trouvé son destinataire.",
      defi: "Demain, chaque inquiétude = une prière de 30 secondes immédiate.",
      priere: "Je te confie mes besoins, un par un. Amen.",
    },
  ],
  colere: [
    {
      ref: "Éphésiens 4:26",
      texte: "Si vous vous mettez en colère, ne péchez point ; que le soleil ne se couche pas sur votre colère.",
      lettre:
        "Ta colère signale une blessure ou une injustice — écoute le signal sans obéir à l'explosion. Règle cela avant la nuit.",
      defi: "Avant de dormir : pardonne à une personne, à voix haute, même de loin.",
      priere: "Apprends-moi la colère lente et le pardon rapide. Amen.",
    },
    {
      ref: "Proverbes 15:1",
      texte: "Une réponse douce calme la fureur, mais une parole dure excite la colère.",
      lettre:
        "Demain, une conversation décisive t'attend peut-être. Prépare ta première phrase douce à l'avance.",
      defi: "Réponds doucement une fois demain là où tu aurais haussé le ton.",
      priere: "Mets une garde à ma bouche, Seigneur. Amen.",
    },
  ],
  culpabilite: [
    {
      ref: "1 Jean 1:9",
      texte:
        "Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner, et pour nous purifier de toute iniquité.",
      lettre:
        "Confesse précisément, pas vaguement : le pardon précis guérit, la honte vague ronge. C'est déjà pardonnable — viens.",
      defi: "Confesse à Dieu (et à la personne si possible) une chose précise demain.",
      priere: "Je confesse, tu pardonnes, tu purifies. Merci. Amen.",
    },
    {
      ref: "Psaumes 51:12",
      texte: "O Dieu ! crée en moi un cœur pur, renouvelle en moi un esprit bien disposé.",
      lettre:
        "Ne demande pas seulement pardon : demande un cœur neuf. Dieu ne répare pas, il recrée.",
      defi: "Demain, un acte concret qui prouve le cœur neuf (réparer, rendre, appeler).",
      priere: "Crée en moi un cœur pur. Amen.",
    },
  ],
  secheresse: [
    {
      ref: "Psaumes 42:2",
      texte: "Comme une biche soupire après des courants d'eau, ainsi mon âme soupire après toi, ô Dieu !",
      lettre:
        "Ta soif est déjà une prière. Les saisons sèches précèdent souvent les sources. Reviens au puits : un chapitre, lentement.",
      defi: "Lis un psaume lentement demain, sans objectif de quantité.",
      priere: "Mon âme a soif de toi. Viens. Amen.",
    },
    {
      ref: "Lamentations 3:22-23",
      texte:
        "Les bontés de l'Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme ; elles se renouvellent chaque matin.",
      lettre:
        "La fidélité de Dieu ne dépend pas de tes sentiments. Demain matin, tout est remis à neuf — même toi.",
      defi: "Demain matin : lis ce verset avant tout écran.",
      priere: "Tes bontés se renouvellent — même pour moi. Amen.",
    },
  ],
};

// ------------------------------------------------------------
// MOTEUR LOCAL (déterministe, hors-ligne)
// ------------------------------------------------------------

interface SoulSignals {
  journal24h: number;
  chapitresLus: number;
  versetsMarques: number;
  surlignages: number;
  couleurDominante: string | null;
  streak: number;
  lignes: string[];
}

function lireSignaux(lang: "fr" | "en"): SoulSignals {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  let journal24h = 0;
  let chapitresLus = 0;
  try {
    const j = getJournal();
    for (const e of j) {
      if (now - e.createdAt > day) break;
      journal24h++;
      if (e.type === "chapter_read") chapitresLus++;
    }
  } catch {
    // ignore
  }
  let versetsMarques = 0;
  try {
    versetsMarques = getHistory().length;
  } catch {
    // ignore
  }
  let surlignages = 0;
  let couleurDominante: string | null = null;
  try {
    surlignages = countAllHighlights();
    const byColor = countHighlightsByColor();
    let best = 0;
    for (const [c, n] of Object.entries(byColor)) {
      if ((n as number) > best) {
        best = n as number;
        couleurDominante = c;
      }
    }
  } catch {
    // ignore
  }
  let streak = 0;
  try {
    streak = getStreak().current ?? 0;
  } catch {
    // ignore
  }

  const lignes: string[] = [];
  if (lang === "fr") {
    lignes.push(
      chapitresLus > 0
        ? `📖 ${chapitresLus} chapitre${chapitresLus > 1 ? "s" : ""} lu${chapitresLus > 1 ? "s" : ""} ces dernières 24 h`
        : "📖 Aucun chapitre lu ces dernières 24 h — le Miroir t'y renvoie doucement"
    );
    lignes.push(
      versetsMarques > 0
        ? `✦ ${versetsMarques} verset${versetsMarques > 1 ? "s" : ""} marqué${versetsMarques > 1 ? "s" : ""} (touchez ton cœur)`
        : "✦ Aucun verset marqué — ton cœur n'a rien retenu hier"
    );
    if (couleurDominante === "red")
      lignes.push("🔴 Tes surlignages rouges dominent : saison de combat");
    else if (couleurDominante === "yellow")
      lignes.push("🟡 Tes surlignages jaunes dominent : saison de gratitude");
    else if (couleurDominante === "green")
      lignes.push("🟢 Tes surlignages verts dominent : saison de croissance");
    else if (couleurDominante === "blue")
      lignes.push("🔵 Tes surlignages bleus dominent : saison de paix cherchée");
    else if (couleurDominante === "pink")
      lignes.push("🌸 Tes surlignages roses dominent : saison d'amour et de liens");
    else if (surlignages > 0) lignes.push(`🖍️ ${surlignages} surlignages au total`);
    lignes.push(
      streak >= 2
        ? `🔥 Série de ${streak} jours : ta régularité parle pour toi`
        : "🔥 Série à (re)construire : demain compte double"
    );
  } else {
    lignes.push(
      chapitresLus > 0
        ? `📖 ${chapitresLus} chapter${chapitresLus > 1 ? "s" : ""} read in the last 24h`
        : "📖 No chapter read in the last 24h — the Mirror gently sends you back"
    );
    lignes.push(
      versetsMarques > 0
        ? `✦ ${versetsMarques} verse${versetsMarques > 1 ? "s" : ""} marked (touched your heart)`
        : "✦ No verse marked — your heart kept nothing yesterday"
    );
    if (couleurDominante) lignes.push(`🖍️ Dominant highlight color: ${couleurDominante}`);
    lignes.push(
      streak >= 2
        ? `🔥 ${streak}-day streak: your consistency speaks for you`
        : "🔥 Streak to (re)build: tomorrow counts double"
    );
  }
  return { journal24h, chapitresLus, versetsMarques, surlignages, couleurDominante, streak, lignes };
}

function choisirPrescription(etat: SoulState, sig: SoulSignals): Prescription {
  const variantes = RX[etat];
  const jour = Math.floor(Date.now() / 86400000);
  const idx =
    Math.abs(jour + sig.journal24h + sig.versetsMarques + sig.streak) % variantes.length;
  return variantes[idx];
}

// ------------------------------------------------------------
// COMPOSANT
// ------------------------------------------------------------

export default function MiroirTab() {
  const { lang } = useAppLanguage();
  const l = lang === "en" ? UI.en : UI.fr;
  const router = useRouter();

  const [etat, setEtat] = useState<SoulState | null>(null);
  const [intention, setIntention] = useState("");
  const [revele, setRevele] = useState(false);
  const [scelle, setScelle] = useState(false);
  const [copie, setCopie] = useState(false);

  const signaux = useMemo(() => (revele ? lireSignaux(lang === "en" ? "en" : "fr") : null), [revele, lang]);
  const prescription = useMemo(
    () => (revele && etat && signaux ? choisirPrescription(etat, signaux) : null),
    [revele, etat, signaux]
  );

  const meta = STATES.find((s) => s.id === etat);

  const reveler = () => {
    if (!etat) return;
    setScelle(false);
    setCopie(false);
    // Petit suspens : le Miroir "lit" (local uniquement)
    setRevele(false);
    setTimeout(() => setRevele(true), 600);
  };

  const sceller = () => {
    if (!prescription || !meta) return;
    addJournalEntry("private_note_added", `Miroir — ${meta.fr}`, {
      detail: `${prescription.ref} · ${prescription.texte} | Défi : ${prescription.defi}${intention ? ` | Intention : ${intention}` : ""}`,
      reference: prescription.ref,
    });
    setScelle(true);
  };

  const partager = async () => {
    if (!prescription) return;
    const texte = `${l.verse} : ${prescription.ref}\n« ${prescription.texte} »\n\n${l.challenge} : ${prescription.defi}\n— Le Miroir · LILOBA`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Le Miroir · LILOBA", text: texte });
        return;
      }
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(texte);
        setCopie(true);
        setTimeout(() => setCopie(false), 2000);
      } catch {
        // ignore
      }
    }
  };

  const versApollos = () => {
    if (!prescription || !meta) return;
    const q =
      lang === "en"
        ? `My soul-state tonight: ${meta.en}. My medicine-verse: ${prescription.ref} ("${prescription.texte}"). My intention: ${intention || "—"}. Explain this verse deeply and give me one concrete step for tomorrow.`
        : `Mon état d'âme ce soir : ${meta.fr}. Mon verset-médecine : ${prescription.ref} (« ${prescription.texte} »). Mon intention : ${intention || "—"}. Explique-moi ce verset en profondeur et donne-moi un pas concret pour demain.`;
    try {
      navigator.clipboard.writeText(q).catch(() => {});
    } catch {
      // ignore
    }
    router.push("/chat");
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-6">
      <header className="mb-6 text-center">
        <p className="text-3xl">🪞</p>
        <h1
          className="mt-1 text-2xl font-bold text-[var(--color-primary)] md:text-3xl"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {l.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{l.subtitle}</p>
        <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-[var(--muted)]">
          {l.tagline}
        </p>
      </header>

      {!revele && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">{l.step1}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {STATES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setEtat(s.id)}
                className={`rounded-xl border px-3 py-3 text-sm transition-all active:scale-95 ${
                  etat === s.id
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 font-semibold text-[var(--color-accent)]"
                    : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--color-accent)]/40"
                }`}
              >
                <span className="mr-1">{s.emoji}</span>
                {lang === "en" ? s.en : s.fr}
              </button>
            ))}
          </div>

          <p className="mb-2 mt-5 text-sm font-semibold text-[var(--foreground)]">{l.step2}</p>
          <input
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder={l.intentionPh}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-accent)]"
          />

          <button
            type="button"
            onClick={reveler}
            disabled={!etat}
            className="mt-4 w-full rounded-xl bg-[var(--color-accent)] py-3 text-sm font-bold text-white transition-all hover:brightness-90 active:scale-[0.99] disabled:opacity-40"
          >
            {l.reveal}
          </button>
        </div>
      )}

      {revele && !prescription && (
        <div className="flex flex-col items-center gap-3 py-16 text-sm text-[var(--muted)]">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)]"
            style={{ borderTopColor: "var(--color-accent)" }}
          />
          {l.reading}
        </div>
      )}

      {revele && prescription && signaux && (
        <div className="flex flex-col gap-4">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
              {l.signals}
            </p>
            <ul className="flex flex-col gap-1.5 text-sm text-[var(--foreground)]">
              {signaux.lignes.map((ligne, i) => (
                <li key={i}>{ligne}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
              {l.verse}
            </p>
            <p
              className="text-lg font-semibold leading-relaxed text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              « {prescription.texte} »
            </p>
            <p className="mt-1 text-sm font-bold text-[var(--color-accent)]">{prescription.ref}</p>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
              {l.letter}
            </p>
            <p className="text-sm leading-relaxed text-[var(--foreground)]">{prescription.lettre}</p>
            {intention ? (
              <p className="mt-2 border-l-2 border-[var(--color-accent)] pl-2 text-xs italic text-[var(--muted)]">
                {intention}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
              {l.challenge}
            </p>
            <p className="text-sm font-medium text-[var(--foreground)]">🎯 {prescription.defi}</p>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
              {l.prayer}
            </p>
            <p
              className="text-sm italic leading-relaxed text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {prescription.priere}
            </p>
          </section>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={sceller}
              disabled={scelle}
              className="rounded-xl bg-[var(--color-accent)] py-3 text-sm font-bold text-white transition-all hover:brightness-90 disabled:opacity-60"
            >
              {scelle ? l.onceDone : l.save}
            </button>
            <button
              type="button"
              onClick={partager}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 text-sm font-semibold text-[var(--foreground)] transition-all hover:border-[var(--color-accent)]"
            >
              {copie ? l.copied : `📤 ${l.share}`}
            </button>
          </div>
          {scelle ? (
            <p className="text-center text-xs text-[var(--muted)]">{l.saved}</p>
          ) : null}

          <button
            type="button"
            onClick={versApollos}
            className="rounded-xl border border-dashed border-[var(--color-accent)]/60 py-3 text-sm font-semibold text-[var(--color-accent)] transition-all hover:bg-[var(--color-accent)]/5"
            title={l.apollosHint}
          >
            ✨ {l.apollos}
          </button>

          <button
            type="button"
            onClick={() => {
              setRevele(false);
              setEtat(null);
              setIntention("");
            }}
            className="py-1 text-center text-xs text-[var(--muted)] underline-offset-2 hover:underline"
          >
            {l.again}
          </button>
        </div>
      )}
    </div>
  );
}