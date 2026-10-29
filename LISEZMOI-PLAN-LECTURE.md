# LILOBA — Plan de lecture : version modernisée (sans casse)

Principe : rien d'existant n'est supprimé. Même clé de sauvegarde (`liloba-reading-plan`),
même mode famille (une copie par profil), même style : SVG stroke, variables du thème, aucun emoji.
Les anciennes sauvegardes sont relues telles quelles (testé).

## Contenu (miroir exact de `frontend/`)

```
frontend/lib/reading-plan.ts              MODIFIÉ (additif) : logique
frontend/components/plan/ReadingPlan.tsx  MODIFIÉ : fenêtre à 3 onglets
frontend/components/plan/PlanIcons.tsx    NOUVEAU : icônes SVG du plan
frontend/components/plan/PlanBooks.tsx    NOUVEAU : onglet Parcours
frontend/components/plan/PlanStats.tsx    NOUVEAU : onglet Bilan
frontend/components/plan/PlanBuilder.tsx  NOUVEAU : parcours personnalisé
modifs.patch                              diff git complet (git apply modifs.patch)
```

`ProgressRing.tsx`, `HamburgerMenu.tsx` et `HomeQuickActions.tsx` ne changent pas :
le bouton rond de l'accueil garde exactement la même API.

## Nouvelles fonctionnalités

1. **Reprendre la lecture** : bouton en tête de l'onglet Aujourd'hui qui ouvre le prochain chapitre
   (Rattraper / Continuer / Lire en avance selon ta situation).
2. **Série de lecture** : jours consécutifs, record, bandeau des 7 derniers jours.
3. **Pause** : le calendrier se fige. À la reprise, la date de début est repoussée du temps de pause,
   aucun retard n'apparaît et la série est préservée.
4. **Recaler le calendrier** : quand tu as pris du retard, aujourd'hui redevient le jour de ton premier
   chapitre non lu. La progression est conservée.
5. **Carte du parcours** (onglet Parcours) : progression livre par livre, chapitres cochables un par un,
   « Tout marquer comme lu » pour un livre déjà lu, contour sur la lecture du jour, point sur le retard.
6. **Bilan** : rythme réel, avance ou retard, fin estimée selon ton rythme vs fin prévue, jalons 25/50/75/100 %.
7. **Parcours personnalisé** : du livre X au livre Y, durée au choix.
8. **Nouveaux parcours** : Ancien Testament (270 j), Psaumes en 30 jours, Proverbes en 31 jours.
9. **Début différé** : commencer aujourd'hui, demain ou lundi prochain.
10. **Cocher en ouvrant** (option) : le chapitre est marqué lu dès l'ouverture depuis le plan.

## Installation (depuis la racine du repo)

```bash
# 1) dézippe à la racine (remplace 2 fichiers, ajoute 4 fichiers)
git status --short
#  M frontend/components/plan/ReadingPlan.tsx
#  M frontend/lib/reading-plan.ts
# ?? frontend/components/plan/PlanBooks.tsx
# ?? frontend/components/plan/PlanBuilder.tsx
# ?? frontend/components/plan/PlanIcons.tsx
# ?? frontend/components/plan/PlanStats.tsx

# 2) test local
cd frontend && npm run build && npm run start
```

## Vérifié

- `tsc --noEmit` : 0 erreur ; `eslint` sur les fichiers du plan : 0 erreur.
- 18 tests de logique : ancienne sauvegarde, pause/reprise, recalage, séries, parcours personnalisé, dates.
- Rendu serveur des composants : OK, aucun emoji.
- Non vérifié : `next build` complet (Google Fonts était bloqué dans mon environnement) et rendu visuel sur appareil.
  Fais un tour rapide sur mobile en thème clair et sombre.
