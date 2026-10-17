import json
import numpy as np
from sentence_transformers import SentenceTransformer


# ==========================================
# 1. CHARGEMENT DU MODÈLE
# ==========================================

print("🧠 Chargement du modèle sémantique...")

modele = SentenceTransformer(
    "paraphrase-multilingual-MiniLM-L12-v2"
)

print("✅ Modèle chargé !")


# ==========================================
# 2. CHARGEMENT DES DONNÉES
# ==========================================

print("\n📚 Chargement de l'index biblique...")

embeddings = np.load("embeddings.npy")

with open("versets_index.json", "r", encoding="utf-8") as fichier:
    versets = json.load(fichier)

print(f"✅ {len(versets)} versets chargés !")


# ==========================================
# 3. RECHERCHE SÉMANTIQUE
# ==========================================

def rechercher(question, nombre_resultats=10):

    # Transformer la question en vecteur
    vecteur_question = modele.encode(
        question,
        convert_to_numpy=True
    )

    # Normalisation
    vecteur_question = vecteur_question / np.linalg.norm(vecteur_question)

    # Normalisation des versets
    normes = np.linalg.norm(
        embeddings,
        axis=1,
        keepdims=True
    )

    embeddings_normalises = embeddings / normes

    # Calcul de la similarité cosinus
    scores = np.dot(
        embeddings_normalises,
        vecteur_question
    )

    # Récupérer les meilleurs résultats
    meilleurs_indices = np.argsort(scores)[::-1][:nombre_resultats]

    resultats = []

    for indice in meilleurs_indices:

        resultats.append({
            "score": float(scores[indice]),
            "reference": versets[indice]["reference"],
            "texte": versets[indice]["texte"]
        })

    return resultats


# ==========================================
# 4. INTERFACE
# ==========================================

def main():

    print("\n📖 RECHERCHE BIBLIQUE SÉMANTIQUE")
    print("Pose une question sur la Bible.")
    print("Tape 'quitter' pour arrêter.\n")

    while True:

        question = input("🤖 Ta question : ").strip()

        if question.lower() == "quitter":
            print("\n👋 À bientôt mon ami !")
            break

        if not question:
            print("⚠️ Écris une question.")
            continue

        print("\n🔎 Recherche en cours...")

        resultats = rechercher(question)

        print("\n" + "=" * 60)
        print("📖 MEILLEURS PASSAGES TROUVÉS")
        print("=" * 60)

        for numero, resultat in enumerate(resultats, start=1):

            print(f"\n#{numero}")
            print(f"⭐ Similarité : {resultat['score']:.4f}")
            print(f"📖 {resultat['reference']}")
            print(f"📜 {resultat['texte']}")

        print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
    