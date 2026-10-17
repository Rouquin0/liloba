"use client";

import { useEffect, useRef, useState } from "react";
import {
  TEMPLATES,
  FORMATS,
  getTemplate,
  getFormat,
  elementToBlob,
  downloadBlob,
  shareBlob,
  canShare,
  makeFilename,
  type CardTemplate,
  type CardFormat,
} from "@/lib/verse-card";
import { addJournalEntry } from "@/lib/journal";

interface VerseCardModalProps {
  reference: string;
  text: string;
  onClose: () => void;
}

export default function VerseCardModal({
  reference,
  text,
  onClose,
}: VerseCardModalProps) {
  const [template, setTemplate] = useState<CardTemplate>("beige");
  const [format, setFormat] = useState<CardFormat>("square");
  const [isGenerating, setIsGenerating] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Empêche le scroll de la page en arrière-plan
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  const templateConfig = getTemplate(template);
  const formatConfig = getFormat(format);

  // Calcul des dimensions d'aperçu (réduit pour l'écran)
  const previewWidth = format === "landscape" ? 340 : 280;
  const previewHeight =
    (previewWidth * formatConfig.height) / formatConfig.width;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    setSaved(null);

    try {
      const blob = await elementToBlob(cardRef.current);
      if (!blob) {
        setSaved("❌ Erreur");
        setTimeout(() => setSaved(null), 2000);
        return;
      }

            downloadBlob(blob, makeFilename(reference));
      setSaved("Téléchargé");
      setTimeout(() => setSaved(null), 2000);

      // 📔 Ajoute au journal
      addJournalEntry("verse_card_created", reference, {
        detail: "Image téléchargée",
        reference,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    setSaved(null);

    try {
      const blob = await elementToBlob(cardRef.current);
      if (!blob) {
        setSaved("❌ Erreur");
        setTimeout(() => setSaved(null), 2000);
        return;
      }

      const shared = await shareBlob(
        blob,
        makeFilename(reference),
        `Verset — ${reference}`,
        `« ${text.slice(0, 100)}${text.length > 100 ? "…" : ""} » — ${reference}`
      );

            if (shared) {
        setSaved("Partagé");
      } else {
        downloadBlob(blob, makeFilename(reference));
        setSaved("Téléchargé");
      }
      setTimeout(() => setSaved(null), 2000);

      // 📔 Ajoute au journal
      addJournalEntry("verse_card_created", reference, {
        detail: shared ? "Partagée" : "Téléchargée",
        reference,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!mounted) return null;

  const shareAvailable = canShare();

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-3 backdrop-blur-md md:items-center md:p-6"
      onClick={onClose}
    >
      <div
        className="animate-scale-in flex max-h-[95dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{
              background:
                "color-mix(in srgb, var(--color-accent) 15%, transparent)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              style={{ color: "var(--color-accent)" }}
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-semibold text-[var(--foreground)]">
              Partager le verset
            </div>
            <div className="truncate text-[10px] text-[var(--muted)]">
              {reference}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)]"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* APERÇU */}
        <div className="flex flex-1 items-center justify-center overflow-y-auto bg-[var(--surface-hover)]/50 p-4">
          <div
            ref={cardRef}
            style={{
              width: `${previewWidth}px`,
              height: `${previewHeight}px`,
              background: templateConfig.background,
              color: templateConfig.textColor,
              fontFamily: templateConfig.fontFamily,
              padding:
                format === "landscape"
                  ? "24px 32px"
                  : format === "portrait"
                    ? "40px 24px"
                    : "28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Citation mark */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: "20px",
                fontSize: "56px",
                lineHeight: 1,
                opacity: 0.15,
                fontFamily: "Georgia, serif",
                color: templateConfig.accentColor,
              }}
            >
              &ldquo;
            </div>

            {/* Texte du verset */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontSize:
                  format === "landscape"
                    ? "16px"
                    : format === "portrait"
                      ? "18px"
                      : "17px",
                lineHeight: 1.6,
                fontStyle: "italic",
                padding: "20px 8px",
              }}
            >
              {text}
            </div>

            {/* Référence + Logo */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "2px",
                  background: templateConfig.accentColor,
                  opacity: 0.5,
                }}
              />
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  color: templateConfig.refColor,
                }}
              >
                {reference}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  opacity: 0.5,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                LILOBA
              </div>
            </div>
          </div>
        </div>

        {/* SÉLECTEUR DE STYLE */}
        <div className="border-t border-[var(--border)] px-4 py-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Style
          </div>
          <div className="grid grid-cols-4 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTemplate(t.value)}
                className={`group flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all ${
                  template === t.value
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                    : "border-[var(--border)] hover:border-[var(--color-accent)]/40"
                }`}
              >
                <div
                  className="h-8 w-8 rounded-lg border border-black/10"
                  style={{ background: t.background }}
                />
                <span
                  className={`text-[9px] font-medium ${
                    template === t.value
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--muted)]"
                  }`}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* SÉLECTEUR DE FORMAT */}
        <div className="border-t border-[var(--border)] px-4 py-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Format
          </div>
          <div className="grid grid-cols-3 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFormat(f.value)}
                className={`flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2 transition-all ${
                  format === f.value
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                    : "border-[var(--border)] hover:border-[var(--color-accent)]/40"
                }`}
              >
                <span
                  className={`text-[10px] font-semibold ${
                    format === f.value
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {f.label}
                </span>
                <span className="font-mono text-[9px] text-[var(--muted)]">
                  {f.aspectLabel}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 border-t border-[var(--border)] p-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--color-accent)]/50 hover:bg-[var(--surface-hover)] disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            <span>{isGenerating ? "..." : "Télécharger"}</span>
          </button>

          {shareAvailable && (
            <button
              type="button"
              onClick={handleShare}
              disabled={isGenerating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-medium text-white transition-all hover:brightness-90 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" x2="12" y1="2" y2="15" />
              </svg>
              <span>{isGenerating ? "..." : "Partager"}</span>
            </button>
          )}
        </div>

        {/* Feedback */}
        {saved && (
          <div className="border-t border-[var(--border)] bg-[var(--surface-hover)]/50 py-2 text-center text-xs font-medium text-[var(--color-accent)]">
            {saved}
          </div>
        )}
      </div>
    </div>
  );
}
