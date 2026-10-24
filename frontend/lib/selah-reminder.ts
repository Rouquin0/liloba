"use client";

import { EVENING_START_HOUR } from "@/lib/selah-evening";

// ============================================================
// LILOBA — SELAH · Rappel quotidien de 18h (agenda du téléphone)
// ============================================================
// Génère un événement iCalendar RÉPÉTÉ CHAQUE JOUR à 18h00 avec une alarme.
// L'heure est « flottante » (sans fuseau) : l'agenda l'interprète dans le
// fuseau de l'appareil, donc l'alarme sonne à 18h chez toi, dans n'importe
// quel pays, et suit même quand tu voyages.
//
// Pourquoi un fichier agenda plutôt qu'une notification web ? Une PWA ne
// peut pas programmer de notification locale fiable quand l'app est fermée
// (il faudrait un serveur push). L'agenda natif, lui, sonne toujours,
// hors ligne, app fermée.
// ============================================================

const TEXTS = {
  fr: {
    summary: "Selah · ta pause du soir",
    description:
      "Selah est ouvert. Dépose ta journée, reçois un verset, remercie, prie. Ouvre LILOBA > Selah.",
    alarm: "Selah est ouvert : ta pause du soir t'attend.",
  },
  en: {
    summary: "Selah · your evening pause",
    description:
      "Selah is open. Lay down your day, receive a verse, give thanks, pray. Open LILOBA > Selah.",
    alarm: "Selah is open: your evening pause is waiting.",
  },
};

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Plie les lignes longues (RFC 5545 : 75 octets max) sans couper un caractère. */
function fold(line: string): string {
  const chars = Array.from(line);
  const parts: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of chars) {
    const b = new TextEncoder().encode(ch).length;
    if (bytes + b > 72) {
      parts.push(cur);
      cur = " " + ch;
      bytes = 1 + b;
    } else {
      cur += ch;
      bytes += b;
    }
  }
  parts.push(cur);
  return parts.join("\r\n");
}

function ymd(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function utcStamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

/** Contenu du fichier .ics (événement quotidien de 18h, durée 15 min, alarme à l'heure pile). */
export function buildEveningIcs(lang: "fr" | "en", now: Date = new Date()): string {
  const t = TEXTS[lang];
  const hh = String(EVENING_START_HOUR).padStart(2, "0");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LILOBA//Selah//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:selah-evening-pause@liloba",
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${ymd(now)}T${hh}0000`,
    "DURATION:PT15M",
    "RRULE:FREQ=DAILY",
    `SUMMARY:${esc(t.summary)}`,
    `DESCRIPTION:${esc(t.description)}`,
    "TRANSP:TRANSPARENT",
    "BEGIN:VALARM",
    "TRIGGER:PT0M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(t.alarm)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** Télécharge / ouvre le fichier agenda. Retourne false si impossible. */
export function downloadEveningReminder(lang: "fr" | "en"): boolean {
  if (typeof document === "undefined") return false;
  try {
    const blob = new Blob([buildEveningIcs(lang)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selah-18h.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return true;
  } catch {
    return false;
  }
}
