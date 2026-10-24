"use client";

import { getOfflineLivres } from "@/lib/offline-bible";
import { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchLivres } from "@/lib/api";
import {
  ANCIEN_TESTAMENT,
  NOUVEAU_TESTAMENT,
  slugify,
  CHAPTERS_COUNT,
} from "@/lib/bible-utils";
import BibleHeader from "@/components/BibleHeader";
import BibleReader from "@/components/BibleReader";
import VersionSelector from "@/components/VersionSelector";
import { getDefaultTranslation, type DefaultTranslationId } from "@/lib/preferences";
import { TRANSLATIONS } from "@/lib/translations";

type Testament = "all" | "at" | "nt";

// Le mode Shell mobile ne change pas l'URL. On stocke donc le livre/chapitre
// ouverts dans history.state : le bouton retour natif referme le lecteur
// (retour à la liste) au lieu de quitter la page /bible.
type ShellState = { book: string; chapter: number };
const SHELL_KEY = "lilobaShell";

function readShellState(): ShellState | null {
  const s = (window.history.state as Record<string, unknown> | null)?.[SHELL_KEY];
  return s ? (s as ShellState) : null;
}
function currentUrl() {
  return window.location.pathname + window.location.search;
}

function getTestamentFromParams(searchParams: URLSearchParams): Testament {
  const t = searchParams.get("testament");
  if (t === "at" || t === "nt") return t;
  return "all";
}

export default function BiblePage() {
  return (
    <Suspense fallback={<BibleSkeleton />}>
      <BibleContent />
    </Suspense>
  );
}

function BibleContent() {
  const searchParams = useSearchParams();
  const testament = getTestamentFromParams(searchParams);

  const [livres, setLivres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🆕 État pour le mode Shell (uniquement utilisé sur mobile)
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);

  // 🆕 Version de la Bible (pilule en haut à droite, synchro instantanée)
  const [translationId, setTranslationId] =
    useState<DefaultTranslationId>("lsg");

  // 🆕 Détection mobile / desktop
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setTranslationId(getDefaultTranslation());
    const sync = () => setTranslationId(getDefaultTranslation());
    window.addEventListener("liloba:default-translation-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("liloba:default-translation-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Ouvre le lecteur Shell + ajoute une entrée d'historique (même URL)
  const openBook = useCallback((book: string, chapter = 1) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    window.history.pushState({ [SHELL_KEY]: { book, chapter } }, "", currentUrl());
  }, []);

  // Fermeture via la flèche de l'en-tête : on passe par l'historique pour
  // rester cohérent avec le bouton retour natif (popstate ferme le lecteur).
  const closeReader = useCallback(() => {
    if (readShellState()) window.history.back();
    else setSelectedBook(null);
  }, []);

  // Retour natif / restauration : history.state fait foi.
  useEffect(() => {
    const sync = () => {
      const s = readShellState();
      setSelectedBook(s ? s.book : null);
      if (s) setSelectedChapter(s.chapter);
    };
    sync(); // revenir sur /bible depuis une autre page avec le lecteur ouvert
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const offlineLivres = await getOfflineLivres();

        if (offlineLivres && offlineLivres.length > 0) {
          if (!cancelled) {
            setLivres(offlineLivres);
            setIsLoading(false);
          }
          return;
        }

        const data = await fetchLivres();
        if (!cancelled) setLivres(data.livres);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Impossible de charger la Bible."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // 🔥 Sur MOBILE uniquement : si un livre est sélectionné, on affiche le lecteur
  if (selectedBook && !isDesktop) {
    return (
      <div className="flex h-full flex-col">
        <BibleReader
          livre={slugify(selectedBook)}
          chapitre={selectedChapter}
          onNavigate={(livreSlug, chap) => {
            const bookName = livres.find((b) => slugify(b) === livreSlug) || livreSlug;
            setSelectedBook(bookName);
            setSelectedChapter(chap);
            // changer de chapitre n'empile rien : retour = liste des livres
            window.history.replaceState(
              { [SHELL_KEY]: { book: bookName, chapter: chap } },
              "",
              currentUrl()
            );
          }}
          onBackToList={closeReader}
        />
      </div>
    );
  }

  const translationConfig =
    TRANSLATIONS.find((t) => t.id === translationId) ?? TRANSLATIONS[0];

  // 🔥 CORRECTION : on utilise shortName (ex: "LSG") partout pour éviter que le texte ne pousse le bouton
  const subtitle =
    testament === "at"
      ? `Ancien Testament · ${translationConfig.shortName}`
      : testament === "nt"
        ? `Nouveau Testament · ${translationConfig.shortName}`
        : translationConfig.shortName;

  return (
    <div className="flex h-full flex-col">
      <BibleHeader
        title="La Bible"
        subtitle={subtitle}
        showMenuButton
        rightSlot={
          // 🔥 CACHE LE SELECTEUR SUR DESKTOP
          <div className="md:hidden">
            <VersionSelector />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
          <div className="mb-8 flex flex-wrap gap-2">
            <FilterTab href="/bible" active={testament === "all"} label="Tous" count={66} />
            <FilterTab
              href="/bible?testament=at"
              active={testament === "at"}
              label="Ancien Testament"
              count={ANCIEN_TESTAMENT.length}
            />
            <FilterTab
              href="/bible?testament=nt"
              active={testament === "nt"}
              label="Nouveau Testament"
              count={NOUVEAU_TESTAMENT.length}
            />
          </div>

          {isLoading && <LoadingState />}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <div className="flex flex-col gap-10">
              {(testament === "all" || testament === "at") && (
                <TestamentSection
                  title="Ancien Testament"
                  books={ANCIEN_TESTAMENT}
                  available={livres}
                  isDesktop={isDesktop}
                  onSelectBook={(book) => openBook(book, 1)}
                />
              )}
              {(testament === "all" || testament === "nt") && (
                <TestamentSection
                  title="Nouveau Testament"
                  books={NOUVEAU_TESTAMENT}
                  available={livres}
                  isDesktop={isDesktop}
                  onSelectBook={(book) => openBook(book, 1)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterTab({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      replace
      className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--color-accent)]/40 hover:text-[var(--foreground)]"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
          active
            ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
            : "bg-[var(--surface-hover)] text-[var(--muted)]"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

function TestamentSection({
  title,
  books,
  available,
  isDesktop,
  onSelectBook,
}: {
  title: string;
  books: string[];
  available: string[];
  isDesktop: boolean;
  onSelectBook: (book: string) => void;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 px-1 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
        <span>{title}</span>
        <span className="font-mono font-normal opacity-60">
          ({books.length} livres)
        </span>
      </h2>

      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        {books.map((book) => {
          const isAvailable = available.includes(book);
          const slug = slugify(book);
          const chapterCount = CHAPTERS_COUNT[book] ?? 0;

          if (!isAvailable) {
            return (
              <div
                key={book}
                className="flex items-center gap-3 border-b border-[var(--border)] px-2 py-3 text-sm text-[var(--muted)] opacity-40"
              >
                <BookIcon />
                <span className="flex-1">{book}</span>
              </div>
            );
          }

          // 🖥️ SUR DESKTOP : On garde le <Link> classique pour le Split View
          if (isDesktop) {
            return (
              <Link
                key={book}
                href={`/bible/${slug}`}
                className="group relative flex items-center gap-3 border-b border-[var(--border)] px-2 py-3 text-sm transition-all hover:bg-[var(--surface-hover)] hover:pl-4"
              >
                <BookIcon />
                <span className="flex-1 font-medium text-[var(--foreground)] transition-colors group-hover:text-[var(--color-accent)]">
                  {book}
                </span>
                <span className="rounded-md border border-[var(--border)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--muted)]">
                  {chapterCount} ch.
                </span>
              </Link>
            );
          }

          // 📱 SUR MOBILE : On utilise un <button> pour le mode hors-ligne
          return (
            <button
              key={book}
              type="button"
              onClick={() => onSelectBook(book)}
              className="group relative flex w-full items-center gap-3 border-b border-[var(--border)] px-2 py-3 text-left text-sm transition-all hover:bg-[var(--surface-hover)] hover:pl-4"
            >
              <BookIcon />
              <span className="flex-1 font-medium text-[var(--foreground)] transition-colors group-hover:text-[var(--color-accent)]">
                {book}
              </span>
              <span className="rounded-md border border-[var(--border)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--muted)]">
                {chapterCount} ch.
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BookIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 stroke-[var(--muted)]"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-6 w-40 animate-pulse rounded bg-[var(--surface-hover)]" />
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded-lg bg-[var(--surface-hover)]"
        />
      ))}
    </div>
  );
}

function BibleSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 py-3 md:px-6">
        <div className="h-5 w-24 animate-pulse rounded bg-[var(--surface-hover)]" />
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <LoadingState />
      </div>
    </div>
  );
}
