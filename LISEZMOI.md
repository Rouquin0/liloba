# LILOBA — Correctif écran blanc iOS (PWA) — Pack sans casse

> Principe : **rien d'existant n'est supprimé**. Que des ajouts. Testé par diff + `node --check`.

## 1. Ton diagnostic est exact

- iOS purge le cache PWA / Service Worker après inactivité (~24h) pour libérer la mémoire.
- Au retour, navigation en `network-first` (ton sw v7) = attente réseau = iOS affiche son splash par défaut **blanc** (il ignore `manifest.json` pour le splash, contrairement à Android).
- Donc 2 filets : **(a)** splash sombre natif + **(b)** SW cache-first instantané + page offline.

## 2. Contenu du ZIP (miroir exact de `frontend/`)

```
frontend/app/layout.tsx        → MODIFIÉ (additif) : startupImage iOS + statusBar black-translucent
frontend/public/sw.js          → MODIFIÉ v7→v8 : navigations Cache-First + fallback offline.html
frontend/public/offline.html   → NOUVEAU : page secours fond #0a0a0f
frontend/public/splash/*.png   → NOUVEAU : 10 splash screens générés (fond #0a0a0f, logo + LILOBA or)
scripts/generate-splash.py     → script de régénération (Pillow)
snippet-apple-startup-image.html → version HTML brute (si besoin hors-Next.js)
```

## 3. Audit de ton code actuel (rien cassé)

### sw.js v7 — déjà très bon, 1 seul point faible
- ✅ Bypass RSC / prefetch Next.js : parfait, à garder (sinon chapitres au hasard).
- ✅ `isBibleData` en cache-first, `BIBLE_CACHE = liloba-bible-v4` : parfait.
- ✅ `isStaticAsset` (`/_next/static`, `/icons`, fonts) en cache-first : parfait.
- ⚠️ `handleNavigation` en **network-first** : c'est la cause de l'écran blanc quand réseau lent ou cache purgé.
- ✅ Install en `Promise.allSettled` + `skipWaiting` + `clients.claim` : parfait.

**Correctif v8 (dans le ZIP) :**
- Navigations → **Cache-First instantané** : si coquille en cache, servi en <50ms + `revalidateInBackground()` (Stale-While-Revalidate). Sinon réseau, sinon shell `/bible`/`/chat`/`/histoires`/`/selah`/`/`, sinon `/offline.html`.
- `BIBLE_CACHE` **inchangé volontairement** (`v4`) → pas de retéléchargement des 45 Mo.
- `STATIC/RUNTIME` → `v8` (purge auto du v7 à l'activation).
- `/splash/` + `/offline.html` ajoutés à `isStaticAsset` (cache-first).
- Garde-fous gardés : `IS_LOCAL`, bypass `/_next/webpack-hmr`, `/__nextjs`, `/api/ask`, RSC, `method !== GET`, cross-origin.

### manifest (frontend/app/manifest.ts) — ✅ VALIDÉ, ne rien changer
- `display: "standalone"` ✅, `start_url: "/"` ✅ (= équivalent Next.js de `"./"` — `"/"` est même recommandé en App Router ; `"./"` casserait le scope `/`), `scope: "/"` ✅, icônes 192/512 + maskable ✅.
- `background_color: "#F5EFE4"` + `theme_color: "#B91C1C"` : OK pour Android. **Ne pas passer en #0a0a0f** (casserait ton thème crème Android). iOS de toute façon **ignore** ces couleurs → d'où les splash PNG.
- Verdict : **aucune modif manifest requise**. Fichier absent du ZIP volontairement.

### layout.tsx — le seul endroit où agir pour iOS
- Pas de `index.html` en Next.js App Router : le `<head>` est généré par `metadata`.
- Modif : `appleWebApp.statusBarStyle: "default"` → `"black-translucent"` + `startupImage: IOS_SPLASH` (10 entrées) + `other.apple-mobile-web-app-capable` pour vieux iOS.
- Diff vérifié : uniquement additif.

## 4. Comment les splash ont été générés (à refaire quand ton logo change)

```bash
python3 scripts/generate-splash.py
# lit ../liloba/frontend/public/logo.png (1024×1024)
# fond #0a0a0f, logo 30% largeur centré à 38% hauteur, coins arrondis 22%,
# "LILOBA" or #D4AF37 + baseline grise, exporte 10 tailles dans frontend/public/splash/
```

Tailles couvertes (portrait, iPhone + iPad) :
750×1334, 828×1792, 1125×2436, 1170×2532, 1179×2556, 1284×2778, 1290×2796, 1536×2048, 1668×2420, 2048×2732.

Alternative sans code : https://appsco.pe/image (PWA Image Generator) → fond `#0a0a0f`, logo 30%, padding 38% top → copier dans `public/splash/` avec les mêmes noms.

## 5. Installation SANS CASSER (3 commandes, depuis la racine du repo)

```bash
# 1) Sauvegarde + dézippe ce pack à la racine du repo (remplace 2 fichiers, ajoute 2 dossiers)
# 2) Contrôle que seuls ces chemins bougent :
git status --short
# attendu :
#  M frontend/app/layout.tsx
#  M frontend/public/sw.js
# ?? frontend/public/offline.html
# ?? frontend/public/splash/

# 3) Test local (obligatoire avant push) :
cd frontend && npm run build && npm run start
# → ouvrir http://localhost:3000, vérifier DevTools > Application > Manifest + Service Workers (v8 actif)
# → tester : onglet Network en "Offline" + recharger /bible → doit afficher offline.html ou shell, jamais blanc

# 4) Push :
git add frontend/app/layout.tsx frontend/public/sw.js frontend/public/offline.html frontend/public/splash/ scripts/generate-splash.py
git commit -m "PWA iOS: splash sombre #0a0a0f + SW v8 cache-first navigations + offline.html (bible cache v4 intact)"
git push origin main
```

> Si ta branche n'est pas `main` : `git branch --show-current` puis `git push origin <branche>`.

## 6. Recette iPhone (à faire après déploiement Vercel/Render)

1. Supprime l'ancienne PWA de l'écran d'accueil (elle garde l'ancien SW/splash).
2. Ouvre le site dans Safari → Partager → **Sur l'écran d'accueil** → Ajouter.
3. Lance via l'icône : splash **sombre LILOBA** (plus blanc).
4. Visite `/bible` une fois (remplit le cache), tue l'app, coupe le réseau, relance → shell ou `offline.html`, jamais blanc.
5. Le lendemain (purge iOS simulée : Réglages Safari → effacer ? non — juste attendre) : affichage instantané du cache + maj silencieuse.

## 7. Pourquoi ça ne casse rien

- Aucune route, aucun composant, aucune API touchés. `ServiceWorkerRegister.tsx` inchangé (il promeut déjà le nouveau SW via `SKIP_WAITING` + `controllerchange` reload).
- `next.config.ts` inchangé (headers SW déjà `max-age=0, must-revalidate` ✅).
- Rollback en 1 commande si besoin : `git revert HEAD && git push origin main` (le SW v7 sera réinstallé, bible v4 intacte).
