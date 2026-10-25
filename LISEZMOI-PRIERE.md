# Nouveautés Prière du Carnet — LILOBA

## Garantie
Aucune phrase de prière existante n'a été modifiée (`lib/prayers.ts`
est intact). Ajouts 100 % additifs, 100 % locaux (offline), style
épuré + icônes SVG uniquement.

## Fichiers
- `frontend/lib/prayer-life.ts` (NOUVEAU) : intentions, compteurs Amen,
  jours de prière / série, clés locales `liloba-prayer-*`.
- `frontend/components/PrayerCompanion.tsx` (NOUVEAU) : les 5 widgets
  + bouton `AmenButton` pour la vue détail.
- `frontend/components/PrayerTab.tsx` (MODIFIÉ, ajouts seulement) :
  affiche le compagnon en vue principale + bouton Amen en vue détail.
- `frontend/lib/journal.ts` (MODIFIÉ, additif) : nouveau type
  `prayer_session` (sessions, routines, intentions exaucées).
- `frontend/components/JournalTab.tsx` (MODIFIÉ, additif) : icône
  bouclier pour `prayer_session`.

## Les 5 nouveautés
1. **Prière du moment** — une prière existante mise en avant chaque jour
   (sélection déterministe, change à minuit), ouvre sa fiche au clic.
2. **Routine de prière** — bouton "J'ai prié aujourd'hui", pastilles
   L–D sur 7 jours, compteur de série, journalisé en `prayer_session`.
3. **Mes intentions** — sujets personnels (50 max), coche "exaucée"
   (journalisée), liste exaucées repliable, suppression.
4. **Silence** — minuteur de prière silencieuse 1/3/5 min avec anneau
   de progression SVG ; à la fin : jour marqué + entrée journal.
5. **Mes Amen** — bouton "Dire Amen" sur chaque fiche prière (compteur
   par prière), total + top 3 dans le compagnon.

## Installation
Copiez les fichiers en gardant l'arborescence `frontend/...`,
puis `npm run build`. Aucune dépendance ajoutée.
