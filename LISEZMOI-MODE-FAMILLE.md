# LILOBA — Mode famille (multi-profil) + Plan de lecture

100 % local : aucun serveur, aucune API, aucun `fetch`, aucune dépendance ajoutée.
Tout est stocké dans `localStorage` (profils, plan de lecture) comme le reste de l'app.

---

## 1. Ce qui change à l'écran

**Page d'accueil**, juste sous le carrousel de versets et au-dessus du bloc « Lire la Bible » :
deux boutons ronds côte à côte.

| Gauche | Droite |
|---|---|
| **Profil famille** : avatar SVG + prénom du profil actif. Un clic ouvre « Qui lit aujourd'hui ? » : on choisit un profil, la page se recharge avec SES données. On y ajoute / modifie / supprime des profils, avec un code PIN optionnel. | **Plan de lecture** : anneau de progression, lectures du jour avec case à cocher, 5 parcours. Le bouton affiche un mini-anneau + le pourcentage quand un plan est en cours. |

**Dans le menu hamburger** (Apollos, Bible, lecteur, Selah) : deux rubriques **dépliables**, cachées par défaut.

- **« Profil et plan de lecture »**, juste en dessous de Historique / Mon Carnet / Selah : un clic la déplie et montre les deux
  boutons (profil famille, plan de lecture).
- **« La Bible »** : un clic la déplie et montre « Tous les livres », « Ancien Testament » et « Nouveau Testament »
  (avant, ces choix étaient toujours affichés).

Les deux rubriques **se referment toutes seules** dès qu'on change de page ou qu'on ferme le menu.
Un clic sur « Lire » dans le plan ferme aussi le menu. Les pages sans menu (Histoires, Carnet, Historique, Recherche, Paramètres)
ont une flèche retour vers la page précédente.

Le bandeau **« Apollos en maintenance »** est supprimé de l'accueil (mobile et desktop).
Le composant `ApollosMaintenanceBanner.tsx` reste dans le projet car la page `/chat` l'utilise encore.

Sur desktop, les deux boutons sont posés au-dessus des cartes, en style sombre (l'accueil desktop a un fond sombre fixe).

---

## 2. Installation

Windows (PowerShell) :

```powershell
cd C:\chemin\vers\liloba
git add -A
git commit -m "backup avant mode famille"
Expand-Archive "$HOME\Downloads\liloba-mode-famille.zip" -DestinationPath "$env:TEMP\liloba-mf" -Force
Copy-Item "$env:TEMP\liloba-mf\liloba-mode-famille\frontend\*" ".\frontend\" -Recurse -Force
git status
cd frontend
npx tsc --noEmit
npm run build
```

Mac / Linux :

```bash
cd ~/chemin/vers/liloba
git add -A && git commit -m "backup avant mode famille"
unzip -o ~/Downloads/liloba-mode-famille.zip -d /tmp/liloba-mf
cp -R /tmp/liloba-mf/liloba-mode-famille/frontend/. ./frontend/
git status
cd frontend && npx tsc --noEmit && npm run build
```

`git status` doit montrer environ 37 fichiers (modifiés ou nouveaux).
Pour annuler : `git reset --hard HEAD && git clean -fd`.

Aucun `npm install` à faire.

---

## 3. Comment les données sont séparées par profil

### Le principe
Les fichiers de l'app importent maintenant le stockage sous le nom `localStorage` depuis `@/lib/profile-storage` :

```ts
import { localStorage } from "@/lib/profile-storage";
// le reste du fichier ne change pas :
localStorage.getItem("liloba-journal");
```

Ce stockage « profil-conscient » renomme tout seul les clés **personnelles** :

```
liloba-journal   →   liloba-main-journal        (profil Principal)
liloba-journal   →   liloba-p-k3x9a-journal     (profil d'un enfant)
```

### Clés PERSONNELLES (une copie par profil)
carnet/journal, notes, favoris, surlignages, historique des versets, série (streak), temps de lecture,
intentions / favoris / série / amen de prière, **Selah** (parcours, préférences, sursis, sujets, graines, capsules),
conversations Apollos, scores des jeux et records, notes privées chiffrées, historique de recherche,
niveau lecteur (âge) et onboarding, préférences de lecture (taille, police, interligne, mode d'affichage, couleur d'accent),
version de Bible par défaut, **plan de lecture**.

### Clés de l'APPAREIL (communes, inchangées)
thème clair/sombre, langue de l'app, notifications et rappels, limites d'usage d'Apollos (volontairement communes :
changer de profil ne les remet pas à zéro), mise en page Split View, session Supabase, Bible hors ligne (IndexedDB :
téléchargée une seule fois pour toute la famille).

Chaque enfant a donc ses propres trophées, son niveau lecteur, sa série et son carnet.

La liste exacte est dans `lib/profile-storage.ts` (`SCOPED_EXACT` et `SCOPED_PREFIXES`).
Pour qu'une future clé soit propre à chaque profil : l'ajouter à ces listes, et dans le fichier qui l'utilise
écrire `import { localStorage } from "@/lib/profile-storage";`.

---

## 4. Migration automatique de tes données actuelles

Au tout premier lancement après la mise à jour (`ProfileSync` réveille le système au démarrage) :

1. Un profil **« Principal »** (id `main`) est créé.
2. Toutes les données personnelles existantes sont **COPIÉES** vers `liloba-main-…` (chaque copie est relue pour vérification).
3. **Rien n'est supprimé.** Les anciennes clés restent en place comme filet de sécurité pendant **30 jours**.
   Au-delà, et seulement si la copie du profil Principal existe bien, elles sont nettoyées automatiquement.
4. Si le stockage est plein et que la copie échoue, le profil Principal continue de lire ses anciennes clés.
5. Si la liste des profils est perdue mais que les clés `liloba-<profil>-…` existent, la liste est reconstruite automatiquement.

### Vérifier la migration (optionnel)
Ouvre la console du navigateur (F12 puis Console) :

```js
Object.keys(localStorage).filter(k => k.startsWith("liloba-main-"))   // tes données migrées
JSON.parse(localStorage.getItem("liloba-profiles"))                   // liste des profils
```

### Retour en arrière (après la mise à jour)
Pendant 30 jours, les anciennes clés existent toujours : si tu retournes à l'ancienne version, tes données y sont.
Au-delà, pour recréer les anciennes clés à partir du profil Principal :

```js
for (const k of Object.keys(localStorage)) {
  const m = k.match(/^liloba-main-(.+)$/);
  if (m) localStorage.setItem("liloba-" + m[1], localStorage.getItem(k));
}
```

---

## 5. Profils et code PIN

- Jusqu'à 8 profils. Prénom (20 caractères max), 8 avatars SVG (colombe, agneau, lion, poisson, olivier, étoile, couronne, ancre), 8 couleurs.
- **Code PIN optionnel (4 chiffres)** : demandé pour ouvrir, modifier ou supprimer ce profil. Il est stocké haché (SHA-256 + sel), jamais en clair.
  Après 5 erreurs de suite : attente de 30 secondes.
- Ce PIN protège un profil des enfants curieux. Ce n'est pas un coffre-fort : quelqu'un qui sait lire le stockage de l'appareil
  (outils de développement) peut le contourner.
- **PIN oublié** (aucune récupération automatique, voulu) : console du navigateur :
  ```js
  const s = JSON.parse(localStorage.getItem("liloba-profiles"));
  s.profiles.forEach(p => delete p.pin);
  localStorage.setItem("liloba-profiles", JSON.stringify(s)); location.reload();
  ```
- Supprimer un profil efface toutes ses données (confirmation demandée). Le dernier profil ne peut pas être supprimé.
- Changer de profil oublie le code de session des notes privées.
- Si le profil change dans un autre onglet, celui-ci se recharge tout seul pour ne jamais écrire dans le mauvais profil.

---

## 6. Plan de lecture

| Plan | Contenu | Chapitres | Par jour |
|---|---|---|---|
| Bible en 1 an | La Bible entière | 1189 | environ 3,3 |
| 90 jours | Le Nouveau Testament | 260 | environ 2,9 |
| 1 mois | Les Évangiles et les Actes | 117 | environ 3,9 |
| 3 semaines | Les lettres de Paul | 87 | environ 4,1 |
| 1 semaine | L'Évangile et les lettres de Jean | 28 | 4 |

- Les chapitres de chaque jour sont générés automatiquement depuis `CHAPTERS_COUNT` (répartition régulière, ±1 chapitre).
- **Choix de conception :** lire toute la Bible en 1 mois ou 1 semaine (40 à 170 chapitres par jour) n'est pas réaliste.
  Les parcours courts portent donc sur une partie de la Bible, pour rester à 3-4 chapitres par jour.
  Pour changer le contenu ou la durée d'un plan : tableau `PLANS` en haut de `lib/reading-plan.ts`.
- Sauvegarde : plan choisi + date de début + chapitres lus, dans `liloba-<profil>-reading-plan` (une progression par profil).
- Les chapitres prévus avant aujourd'hui et non lus apparaissent dans « À rattraper ».
- Chaque ligne a un lien « Lire » vers le chapitre (`/bible/<livre>/<chapitre>`), disponible hors ligne comme le reste du lecteur.
- Changer de plan remet la progression à zéro (confirmation demandée).

---

## 7. Sauvegarde / restauration

L'export des paramètres contient **tous les profils** d'un coup (la liste + les clés `liloba-<profil>-…`).
Importer une **ancienne** sauvegarde (d'avant le mode famille) range son contenu dans le profil actif : rien n'est perdu.

---

## 8. Liste des fichiers

Nouveaux :
`lib/profile-storage.ts` (cœur : stockage par profil, migration, PIN) · `lib/reading-plan.ts` ·
`hooks/useProfiles.ts` · `components/profile/{ProfileSwitcher,ProfileAvatar,ProfileSync}.tsx` ·
`components/plan/{ReadingPlan,ProgressRing}.tsx` · `components/ui/{ModalShell,MenuAccordion}.tsx` · `components/HomeQuickActions.tsx`

Modifiés :
`app/page.tsx` · `app/layout.tsx` (ajout de `<ProfileSync />`) · `components/MobileHome.tsx` · `components/HamburgerMenu.tsx` (rubriques dépliables « Profil et plan de lecture » et « La Bible ») · `lib/backup.ts`
et, pour chacun, **une seule ligne ajoutée** (l'import du stockage profil-conscient) :
`components/PrayerCompanion.tsx` · `lib/{conversations,games-characters,games-crossword,games-mobile,games-verses,games-wordsearch,highlights,history,i18n,journal,notes,prayer-life,prayers-fav,preferences,private-notes,reading-time,search-history,search,selah-capsules,selah-grace,selah-prefs,selah-seeds,selah-topics,selah,stats}.ts`

`lib/prayers.ts` n'est pas touché : aucune phrase de prière n'est modifiée.

---

## 9. Vérifications faites

- `tsc --noEmit` : aucune erreur.
- ESLint : aucune erreur ni alerte sur les nouveaux fichiers ; les fichiers existants modifiés n'ont pas plus d'alertes qu'avant
  (`app/page.tsx` en a même moins).
- Test de migration (anciennes clés → profil Principal, aucune perdue, clés de l'appareil intactes), d'isolation entre profils,
  de suppression, de reconstruction de la liste, du PIN (haché, verrouillage après 5 erreurs).
- Test de l'accueil dans un navigateur simulé : création d'un profil, bascule, plan de lecture (choix, cases, anneau, sauvegarde
  dans le bon profil), PIN (mauvais code refusé, bon code accepté), ordre des éléments (sous le carrousel, au-dessus de « Lire la Bible »),
  bandeau de maintenance absent.
- **Non testé sur un vrai téléphone** : à essayer sur ton appareil, y compris en mode avion.

## 10. À tester sur ton téléphone

0. Ouvre Apollos, ouvre le menu : touche « Profil et plan de lecture » (sous Selah) : les deux boutons apparaissent. Touche « La Bible » : Tous les livres / Ancien / Nouveau Testament apparaissent. Change de page : tout se replie.

1. Ouvre l'app : l'accueil montre les deux boutons ronds sous le carrousel. Ton carnet, ta série et tes trophées sont toujours là (profil « Principal »).
2. Crée un profil enfant, bascule : carnet vide, série à zéro, l'onboarding demande l'âge.
3. Reviens sur Principal : tout est intact.
4. Mets un PIN sur Principal, bascule sur l'enfant, essaie de revenir : le code est demandé.
5. Lance un plan (par exemple « 1 semaine »), coche les lectures du jour : l'anneau avance. Change de profil : chaque profil garde son plan.
6. Passe en mode avion et recommence : tout fonctionne.
