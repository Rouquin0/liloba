# Histoires Bibliques — Images

Le composant `StoryArt.tsx` charge l'image locale :

```
/images/stories/<slug>.jpg
```

**Tant que le fichier n'existe pas, un dégradé + emoji SVG s'affiche automatiquement. L'app fonctionne donc sans aucune image.**

## Fichiers attendus (8)

| slug | fichier | Unsplash libre de droits suggérée |
|------|---------|-----------------------------------|
| david-goliath | `david.jpg` | https://unsplash.com → recherche « desert valley sunrise » |
| joseph-pardon | `joseph.jpg` | recherche « golden wheat field sunset » |
| noe-obeissance | `noe.jpg` | recherche « ocean waves storm » |
| ruth-loyaute | `ruth.jpg` | recherche « wheat harvest field » |
| daniel-lions | `daniel.jpg` | recherche « lion portrait » |
| esther-courage | `esther.jpg` | recherche « queen golden veil » |
| fils-perdu | `fils-perdu.jpg` | recherche « road home sunset » |
| samaritain | `samaritain.jpg` | recherche « desert road judea » |

## Comment ajouter une image

1. Télécharge une image libre de droits (Unsplash, Pexels, Pixabay).
2. Renomme-la exactement, ex : `david.jpg`.
3. Dépose-la ici (`frontend/public/images/stories/`).
4. Redéploie — aucune modification de code nécessaire.

Astuce : 1200px de large, format JPG compressé (< 300 Ko), ex :

```bash
# Exemple (à adapter avec la vraie URL Unsplash choisie)
curl -L "https://images.unsplash.com/photo-...?w=1200&q=80" -o public/images/stories/david.jpg
```
