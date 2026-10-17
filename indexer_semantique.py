import json
import numpy as np
import os
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Charge la clé API depuis le fichier .env (ou depuis Render)
load_dotenv()

# Configuration de Gemini (nouveau SDK)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY non trouvée dans les variables d'environnement")

client = genai.Client(api_key=GEMINI_API_KEY)

print("📖 Chargement de la Bible...")

with open("bible.json", "r", encoding="utf-8") as fichier:
    bible = json.load(fichier)

print("✅ Bible chargée !")

print("\n📚 Préparation des versets...")

versets = []
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

# ============================================================
# GÉNÉRATION DES EMBEDDINGS VIA L'API GEMINI
# ============================================================

print("\n🧠 Appel à l'API Gemini pour générer les vecteurs...")
print("⏳ Cette étape peut prendre quelques minutes (API Google)...")

# Modèle d'embedding actuel de Google (remplace text-embedding-004)
MODELE_EMBEDDING = "gemini-embedding-001"

# On traite par lots (batchs) pour éviter de surcharger l'API d'un coup
BATCH_SIZE = 100
embeddings = []

for i in range(0, len(versets), BATCH_SIZE):
    batch = versets[i:i + BATCH_SIZE]
    textes_batch = [v["texte"] for v in batch]

    # Appel à l'API Gemini (nouveau SDK)
    try:
        result = client.models.embed_content(
            model=MODELE_EMBEDDING,
            contents=textes_batch,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT",
                output_dimensionality=768,  # réduit 3072 → 768 (RAM/stockage)
            ),
        )

        # result.embeddings est une liste d'objets avec .values
        for emb in result.embeddings:
            embeddings.append(emb.values)

        # Petite pause pour ne pas dépasser le quota de l'API gratuite
        time.sleep(1)

        print(f"   ✅ {min(i + BATCH_SIZE, len(versets))} / {len(versets)} versets traités")

    except Exception as e:
        print(f"❌ Erreur sur le batch {i} : {e}")
        raise e

print("\n✅ Tous les versets ont été transformés !")

# Sauvegarde des embeddings
embeddings_array = np.array(embeddings, dtype=np.float32)
np.save("embeddings.npy", embeddings_array)

# Sauvegarde des références et textes
with open("versets_index.json", "w", encoding="utf-8") as fichier:
    json.dump(versets, fichier, ensure_ascii=False, indent=2)

print("\n💾 Fichiers créés :")
print("   📊 embeddings.npy")
print("   📖 versets_index.json")

print("\n🎉 INDEX SÉMANTIQUE TERMINÉ !")
print(f"📚 Nombre de versets indexés : {len(versets)}")
print(f"📐 Forme du tableau d'embeddings : {embeddings_array.shape}")
