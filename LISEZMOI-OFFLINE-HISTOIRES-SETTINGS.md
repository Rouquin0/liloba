# Correctif Offline : Histoires + Paramètres — LILOBA

## Causes trouvées
1. **Paramètres → accueil hors ligne** : `/settings` n'était ni pré-caché
   ni mappé dans le service worker. Hors ligne, le SW servait le shell
   `/` (accueil) en repli. La page Paramètres elle-même est 100 % locale
   (localStorage + IndexedDB), aucun appel réseau ne la bloque.
2. **Histoires illisibles hors ligne** : seules 3 fiches sur 20 étaient
   pré-cachées (`david-goliath`, `fils-perdu`, `joseph-pardon`). Les 17
   autres n'étaient cachées qu'après une 1re visite en ligne.
   Les images ont déjà un repli élégant (StoryArt → dégradé + emoji)
   si le JPG n'est pas encore en cache.

## Modifications (service worker v9 → v10, style et logique inchangés)
- `frontend/public/sw.js` :
  - caches `liloba-static-v10` / `liloba-runtime-v10`
    (`liloba-bible-v4` INCHANGÉ : la Bible n'est jamais retéléchargée).
  - `STORY_PRECACHE` : les **20 fiches** `/histoires/<slug>` pré-cachées.
  - `PRECACHE_URLS` : ajout de `/settings`.
  - `handleNavigation` : repli `/settings` pour les chemins `/settings*`
    (au lieu de retomber sur `/`).
- `frontend/components/ServiceWorkerRegister.tsx` : commentaire v10
  (aucun changement de comportement).

## Installation
1. Copiez les 2 fichiers en gardant l'arborescence `frontend/...`.
2. `npm run build` puis déployez (le SW se met à jour seul, anciens
   caches v9 purgés à l'activation, Bible conservée).
3. Test : visitez une fois en ligne, passez en mode avion, ouvrez
   chaque histoire + les paramètres : tout s'affiche.
