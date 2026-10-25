# Correctif Stats Historique — Temps de lecture & Chapitres lus

## Problèmes corrigés
1. **Temps de lecture figé à 0** : calculé par `(chapitres × 3 min)` arrondi en heures
   → même 2-3 chapitres affichaient "0 h". Remplacé par un **vrai chrono** mesuré.
2. **"Chapitres lus" toujours à 0** : aucun code n'enregistrait `chapter_read`
   dans le journal. `BibleReader` le fait maintenant à chaque chapitre ouvert.
3. **Stats remises à 0 chaque jour** : basées sur l'historique 24 h (expiré).
   Basées maintenant sur le **journal persistant** + temps cumulé.
4. **"Moment favori" faux** : affichait "Le matin" même sans données → affiche "—".
5. **Calendrier décalé** : comparait en UTC (`toISOString`) → comparaison en heure locale.
6. **Stats non réactives** : écoute maintenant `liloba:journal-updated`,
   `liloba:reading-time-updated`, `liloba:history-updated`.

## Fichiers
- `frontend/lib/reading-time.ts` (NOUVEAU) : chrono + chapitres + niveaux.
- `frontend/components/BibleReader.tsx` : enregistre chapitre lu + chrono 15 s.
- `frontend/components/AdvancedStats.tsx` : réécrit (corrections + 5 nouveautés).
- `frontend/components/StatsTab.tsx` : total persistant + temps réel.

## 5 nouvelles fonctionnalités
1. **Objectif du jour** (15 min + 1 chapitre, barres de progression).
2. **Série 7 jours** (pastilles L–D avec coches SVG).
3. **Rythme de lecture** (aujourd'hui / 7 jours / moyenne par jour).
4. **Records** (meilleur jour, plus longue série, total chapitres).
5. **Niveau lecteur** (Graine → Pousse → Arbre → Forêt → Ancien + 5 trophées).

## Installation
Copiez les fichiers dans votre repo en gardant l'arborescence `frontend/...`,
puis `npm run build`. Aucune dépendance ajoutée. Données 100 % locales.
La feuille verte 🌿 du calendrier est conservée telle quelle.
