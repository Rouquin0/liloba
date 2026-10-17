import json
import numpy as np
from sentence_transformers import SentenceTransformer

print("📖 Chargement de la Bible...")

with open("bible.json", "r", encoding="utf-8") as fichier:
    bible = json.load(fichier)

print("✅ Bible chargée !")

print("\n🧠 Chargement du modèle sémantique...")

modele = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

print("✅ Modèle chargé !")

# Liste qui contiendra les références et les textes
versets = []

print("\n📚 Préparation des versets...")

for livre in bible:
    for chapitre in bible[livre]:
        for verset in bible[livre][chapitre]:
            texte = bible[livre][chapitre][verset]

            reference = f"{livre} {chapitre}:{verset}"

            versets.append({
                "reference": reference,
                "texte": texte
            })

print(f"✅ {len(versets)} versets préparés !")

# Récupération des textes uniquement
textes = [verset["texte"] for verset in versets]

print("\n🧠 Transformation des versets en représentations numériques...")
print("⏳ Cette étape peut prendre quelques minutes...")

embeddings = modele.encode(
    textes,
    show_progress_bar=True,
    convert_to_numpy=True
)

print("\n✅ Tous les versets ont été transformés !")

# Sauvegarde des embeddings
np.save("embeddings.npy", embeddings)

# Sauvegarde des références et textes
with open("versets_index.json", "w", encoding="utf-8") as fichier:
    json.dump(versets, fichier, ensure_ascii=False, indent=2)

print("\n💾 Fichiers créés :")
print("   📊 embeddings.npy")
print("   📖 versets_index.json")

print("\n🎉 INDEX SÉMANTIQUE TERMINÉ !")
print(f"📚 Nombre de versets indexés : {len(versets)}")
