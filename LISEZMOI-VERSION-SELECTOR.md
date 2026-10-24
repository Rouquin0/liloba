# LILOBA — Sélecteur de version déplacé en lecture (pilule, hors ligne)

## Contenu du ZIP (fichiers COMPLETS, prêts à copier)

```
frontend/components/VersionSelector.tsx   → NOUVEAU : pilule "LSG ▾" + menu déroulant
frontend/components/BibleHeader.tsx      → MODIFIÉ : nouveau prop optionnel `rightSlot`
frontend/app/bible/page.tsx              → MODIFIÉ : pilule en haut à droite + sous-titre dynamique
frontend/components/BibleReader.tsx      → MODIFIÉ : pilule dans le header de lecture (mobile)
frontend/app/settings/page.tsx           → MODIFIÉ : sélecteur de version SUPPRIMÉ (aucune trace)
```

## Ce qui a été fait (sans rien casser)

1. **Suppression définitive dans Paramètres** : bloc « 2. LANGUE (mobile uniquement) »
   supprimé, ainsi que son state, son handler, ses imports
   (`SettingSelect`, `TRANSLATIONS`, `DefaultTranslationId`,
   `get/setDefaultTranslation`) et l'icône `IconBook` devenue inutile.
   Sections renumérotées. Vérifié : 0 occurrence restante.
   Le fichier `SettingSelect.tsx` est conservé (inutilisé, inoffensif).

2. **`VersionSelector.tsx` (nouveau)** : bouton pilule `rounded-full`
   (VOLONTAIREMENT différent du hamburger qui est un bouton carré à 3 lignes) :
   icône « livre ouvert » + sigle (ex : « LSG ») + chevron qui pivote.
   Menu vers le bas (`absolute right-0`, animation `animate-scale-in`
   déjà présente dans ton thème), 10 versions avec badge drapeau,
   langue, coche sur l'active, pied « ✓ instantané, même en mode avion ».
   Thème : uniquement `var(--surface)`, `var(--surface-hover)`,
   `var(--border)`, `var(--foreground)`, `var(--muted)`, `var(--color-accent)`.
   Ferme au clic ailleurs + touche Échap. Anti-saut : placeholder avant hydratation.

3. **Logique** : clic → `setDefaultTranslation(id)` (localStorage +
   event `liloba:default-translation-updated`) + `preloadTranslation(id)`.
   `BibleReader` écoute déjà cet event → **rechargement instantané du texte
   depuis IndexedDB, sans réseau**. Le sous-titre de la liste suit aussi
   (« Martin 1744 », « Ancien Testament · KJV », …).

4. **Placement** : `BibleHeader` accepte `rightSlot` (optionnel, donc les
   autres pages utilisant `BibleHeader` ne changent pas). Liste Bible :
   visible mobile + desktop. Lecture chapitre (`BibleReader`) : visible sur
   mobile uniquement (`md:hidden`) — le desktop garde son comportement
   actuel (Split + LSG forcé en comparatif), aucun risque sur le Split View.

## Installation (VS Code, racine du repo)

```powershell
$zip="$env:USERPROFILE\Downloads\liloba-version-selector.zip"; if(!(Test-Path $zip)){Write-Error "ZIP introuvable : $zip"; break}; mkdir backup-avant-version-selector -Force | Out-Null; Copy-Item frontend/app/bible/page.tsx,frontend/app/settings/page.tsx,frontend/components/BibleHeader.tsx,frontend/components/BibleReader.tsx backup-avant-version-selector/ -Force; Expand-Archive -Path $zip -DestinationPath . -Force; git status --short
```

Attendu :
```
M frontend/app/bible/page.tsx
M frontend/app/settings/page.tsx
M frontend/components/BibleHeader.tsx
M frontend/components/BibleReader.tsx
?? frontend/components/VersionSelector.tsx
```

Puis :
```bash
cd frontend && npm run build && npm run dev
# /bible → pilule "LSG" en haut à droite, clic → menu, choisir KJV →
# sous-titre + chapitres rechargés aussitôt (même en mode avion).
# /settings → plus aucune trace du choix de version.
```

Push :
```bash
git add frontend/components/VersionSelector.tsx frontend/components/BibleHeader.tsx frontend/app/bible/page.tsx frontend/components/BibleReader.tsx frontend/app/settings/page.tsx
git commit -m "Bible: selecteur de version en lecture (pilule) + retire des parametres"
git push origin main
```

Rollback : `Copy-Item backup-avant-version-selector/* frontend/...` (fichier par fichier
vers son dossier) ou `git checkout -- frontend/...`.
