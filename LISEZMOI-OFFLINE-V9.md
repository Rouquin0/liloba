# LILOBA v9 — Carnet / Historique / Histoires hors ligne

## Pourquoi ça renvoyait à l'accueil ?
- `sw.js` v7/v8 ne pré-cachait que `/, /chat, /bible, /histoires, /selah`.
- En hors ligne, `handleNavigation` ne connaissait comme secours que `/bible`, `/chat`, `/histoires`, `/selah`, sinon `/`.
- Donc `/carnet` et `/historique` → aucun cache → fallback `/` = retour accueil.
- Bonne nouvelle : les données sont déjà 100% locales, aucun backend requis :
  - Carnet : `localStorage` (notes, favoris, prières, jeux, scores) + code bundlé.
  - Historique : `localStorage` + code bundlé.
  - Histoires : texte dans le bundle JS (`lib/stories-content.ts`, 23 histoires) + images optionnelles avec fallback dégradé auto (`StoryArt` → `StoryFallback` si JPG absent).

## Ce que fait ce ZIP (cumulatif : contient aussi le fix écran blanc v8)
- `frontend/public/sw.js` → **v9** : pré-cache `/carnet`, `/historique` + 3 histoires stars, mapping secours `/carnet` → `/carnet`, `/historique` → `/historique`, `/histoires/*` → fiche exacte sinon liste `/histoires`, `/images/*` en cache-first (sans image = dégradé, pas d'erreur).
- `frontend/public/offline.html` → **v2** : boutons 📓 Carnet + Jeux / 🕘 Historique / 📚 Histoires / 📖 Bible.
- `frontend/components/ServiceWorkerRegister.tsx` → pré-chauffe `/bible`, `/carnet`, `/historique`, `/histoires` + 3 histoires dès la 1re visite en ligne (fire-and-forget).
- `frontend/app/layout.tsx` + `frontend/public/splash/` → inchangés depuis le ZIP 1 (inclus pour ceux qui ne l'ont pas encore appliqué).
- `BIBLE_CACHE` toujours `liloba-bible-v4` → pas de retéléchargement 45 Mo.

## Installation (depuis Téléchargements, sans casser)
PowerShell (VS Code, racine projet) :
```powershell
$zip="$env:USERPROFILE\Downloads\liloba-offline-carnet-histoires.zip"; if(!(Test-Path $zip)){Write-Error "ZIP introuvable : $zip"; break}; mkdir backup-avant-v9 -Force | Out-Null; Copy-Item frontend/public/sw.js backup-avant-v9/sw.js -Force; Copy-Item frontend/public/offline.html backup-avant-v9/offline.html -Force -ErrorAction SilentlyContinue; Copy-Item frontend/components/ServiceWorkerRegister.tsx backup-avant-v9/ServiceWorkerRegister.tsx -Force; Expand-Archive -Path $zip -DestinationPath . -Force; git status --short
```
Attendu : `M frontend/public/sw.js`, `M frontend/public/offline.html` (si v8 déjà appliqué, sinon `??`), `M frontend/components/ServiceWorkerRegister.tsx`, + splash/layout si 1er ZIP pas encore appliqué.

Puis :
```bash
cd frontend && npm run build && npm run start
# Test : DevTools > Application > Service Workers (v9), coche "Offline", visite /carnet /historique /histoires/david-goliath → doivent s'afficher, jeux jouables, sans images = dégradé emoji (normal).
```

Push :
```bash
git add frontend/public/sw.js frontend/public/offline.html frontend/components/ServiceWorkerRegister.tsx frontend/app/layout.tsx frontend/public/splash/
git commit -m "PWA v9: offline carnet/historique/histoires (precache + shells + images) + splash sombre"
git push origin main
```

## Recette iPhone pour tes utilisateurs
1. Ouvrir l'app **une fois en ligne** (remplit le cache v9 : carnet, historique, histoires).
2. Passer en mode avion → aller dans Carnet (Jeux 🎮 jouables), Historique, Histoires → tout s'ouvre.
3. Les 20 histoires non pré-cachées : ouvrir chacune **une fois en ligne**, ensuite dispo hors ligne (runtime cache).
4. Sans image = normal : `public/images/stories/` ne contient qu'un README, le dégradé + emoji s'affiche (voulu, robuste offline).
