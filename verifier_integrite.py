# """
# ============================================================
# 🔐 VÉRIFICATION DE L'INTÉGRITÉ DES DONNÉES — BIBLE-IA
# ============================================================

# À QUOI SERT CE FICHIER ?

# Il calcule une "empreinte" unique (un hash SHA-256) pour chaque
# fichier de données important du projet, et vérifie ensuite que
# ces fichiers n'ont pas changé.

# C'est comme un sceau de cire sur une enveloppe :
# si quelqu'un modifie ne serait-ce qu'une seule lettre dans
# bible.json, l'empreinte devient complètement différente et
# on le détecte immédiatement.

# COMMENT L'UTILISER ?

# 1. Une fois, quand tes fichiers sont sains :

#        python verifier_integrite.py --creer

#    Cela crée un fichier empreintes.json.

# 2. Ensuite, quand tu veux vérifier :

#        python verifier_integrite.py

#    Le script te dira si un fichier a été modifié.

# ============================================================
# """

# import hashlib
# import json
# import sys
# from pathlib import Path


# # ============================================================
# # CONFIGURATION
# # ============================================================

# # Les fichiers dont on veut protéger l'intégrité.
# # Ajoute ou retire des noms selon tes besoins.

# FICHIERS_A_PROTEGER = [
#     "bible.json",
#     "versets_index.json",
#     "embeddings.npy",
#     "profils_versets.json",
# ]

# FICHIER_EMPREINTES = "empreintes.json"


# # ============================================================
# # CALCUL D'UNE EMPREINTE
# # ============================================================

# def calculer_empreinte(chemin):
#     """
#     Calcule l'empreinte SHA-256 d'un fichier.

#     On lit le fichier par petits morceaux (et non d'un seul coup)
#     pour que cela fonctionne même avec des fichiers volumineux
#     comme embeddings.npy.
#     """

#     hacheur = hashlib.sha256()

#     with open(chemin, "rb") as fichier:

#         while True:

#             morceau = fichier.read(65536)

#             if not morceau:
#                 break

#             hacheur.update(morceau)

#     return hacheur.hexdigest()


# # ============================================================
# # CRÉATION DES EMPREINTES DE RÉFÉRENCE
# # ============================================================

# def creer_empreintes():
#     """
#     Calcule et enregistre les empreintes de tous les fichiers
#     protégés. À lancer UNE SEULE FOIS, quand tu es certain que
#     tes fichiers sont dans un état correct.
#     """

#     print()
#     print("=" * 60)
#     print("🔐 CRÉATION DES EMPREINTES DE RÉFÉRENCE")
#     print("=" * 60)
#     print()

#     empreintes = {}

#     for nom_fichier in FICHIERS_A_PROTEGER:

#         chemin = Path(nom_fichier)

#         if not chemin.exists():
#             print(f"⚠️  {nom_fichier} : introuvable, ignoré")
#             continue

#         empreinte = calculer_empreinte(chemin)

#         empreintes[nom_fichier] = {
#             "sha256": empreinte,
#             "taille_octets": chemin.stat().st_size,
#         }

#         print(f"✅ {nom_fichier}")
#         print(f"   empreinte : {empreinte[:32]}...")

#     with open(
#         FICHIER_EMPREINTES,
#         "w",
#         encoding="utf-8"
#     ) as fichier:

#         json.dump(
#             empreintes,
#             fichier,
#             ensure_ascii=False,
#             indent=2
#         )

#     print()
#     print(f"💾 Empreintes enregistrées dans {FICHIER_EMPREINTES}")
#     print()


# # ============================================================
# # VÉRIFICATION
# # ============================================================

# def verifier_empreintes(silencieux=False):
#     """
#     Compare les fichiers actuels aux empreintes enregistrées.

#     Retourne True si tout est intact, False sinon.

#     Le mode silencieux sert à appeler cette fonction depuis
#     un autre script sans polluer l'affichage.
#     """

#     chemin_empreintes = Path(FICHIER_EMPREINTES)

#     if not chemin_empreintes.exists():

#         if not silencieux:
#             print()
#             print("⚠️  Aucun fichier d'empreintes trouvé.")
#             print("    Lance d'abord :")
#             print("    python verifier_integrite.py --creer")
#             print()

#         return False

#     with open(
#         chemin_empreintes,
#         "r",
#         encoding="utf-8"
#     ) as fichier:

#         empreintes_attendues = json.load(fichier)

#     if not silencieux:
#         print()
#         print("=" * 60)
#         print("🔐 VÉRIFICATION DE L'INTÉGRITÉ")
#         print("=" * 60)
#         print()

#     tout_est_intact = True

#     for nom_fichier, donnees in empreintes_attendues.items():

#         chemin = Path(nom_fichier)

#         if not chemin.exists():

#             if not silencieux:
#                 print(f"❌ {nom_fichier} : FICHIER MANQUANT")

#             tout_est_intact = False
#             continue

#         empreinte_actuelle = calculer_empreinte(chemin)

#         if empreinte_actuelle == donnees["sha256"]:

#             if not silencieux:
#                 print(f"✅ {nom_fichier} : intact")

#         else:

#             if not silencieux:
#                 print(f"❌ {nom_fichier} : MODIFIÉ !")
#                 print(f"   attendu : {donnees['sha256'][:32]}...")
#                 print(f"   trouvé  : {empreinte_actuelle[:32]}...")

#             tout_est_intact = False

#     if not silencieux:

#         print()

#         if tout_est_intact:
#             print("🎉 Tous les fichiers sont intacts.")
#         else:
#             print("⚠️  ATTENTION : au moins un fichier a changé.")
#             print()
#             print("    Si c'est normal (tu viens de régénérer")
#             print("    profils_versets.json par exemple), relance :")
#             print("    python verifier_integrite.py --creer")

#         print()

#     return tout_est_intact


# # ============================================================
# # PROGRAMME PRINCIPAL
# # ============================================================

# if __name__ == "__main__":

#     if "--creer" in sys.argv:
#         creer_empreintes()

#     else:
#         verifier_empreintes()

"""
============================================================
🔐 VÉRIFICATION DE L'INTÉGRITÉ DES DONNÉES — BIBLE-IA
============================================================

À QUOI SERT CE FICHIER ?

Il calcule une "empreinte" unique (un hash SHA-256) pour chaque
fichier de données important du projet, et vérifie ensuite que
ces fichiers n'ont pas changé.

C'est comme un sceau de cire sur une enveloppe :
si quelqu'un modifie ne serait-ce qu'une seule lettre dans
bible.json, l'empreinte devient complètement différente et
on le détecte immédiatement.

COMMENT L'UTILISER ?

1. Une fois, quand tes fichiers sont sains :

       python verifier_integrite.py --creer

   Cela crée un fichier empreintes.json.

2. Ensuite, quand tu veux vérifier :

       python verifier_integrite.py

   Le script te dira si un fichier a été modifié.

============================================================
"""

import hashlib
import json
import sys
from pathlib import Path


# ============================================================
# CONFIGURATION
# ============================================================

# Les fichiers dont on veut protéger l'intégrité.
# Ajoute ou retire des noms selon tes besoins.

FICHIERS_A_PROTEGER = [
    "bible.json",
    "versets_index.json",
    "embeddings.npy",
    "profils_versets.json",
]

FICHIER_EMPREINTES = "empreintes.json"


# ============================================================
# CALCUL D'UNE EMPREINTE
# ============================================================

def calculer_empreinte(chemin):
    """
    Calcule l'empreinte SHA-256 d'un fichier.

    On lit le fichier par petits morceaux (et non d'un seul coup)
    pour que cela fonctionne même avec des fichiers volumineux
    comme embeddings.npy.
    """

    hacheur = hashlib.sha256()

    with open(chemin, "rb") as fichier:

        while True:

            morceau = fichier.read(65536)

            if not morceau:
                break

            hacheur.update(morceau)

    return hacheur.hexdigest()


# ============================================================
# CRÉATION DES EMPREINTES DE RÉFÉRENCE
# ============================================================

def creer_empreintes():
    """
    Calcule et enregistre les empreintes de tous les fichiers
    protégés. À lancer UNE SEULE FOIS, quand tu es certain que
    tes fichiers sont dans un état correct.
    """

    print()
    print("=" * 60)
    print("🔐 CRÉATION DES EMPREINTES DE RÉFÉRENCE")
    print("=" * 60)
    print()

    empreintes = {}

    for nom_fichier in FICHIERS_A_PROTEGER:

        chemin = Path(nom_fichier)

        if not chemin.exists():
            print(f"⚠️  {nom_fichier} : introuvable, ignoré")
            continue

        empreinte = calculer_empreinte(chemin)

        empreintes[nom_fichier] = {
            "sha256": empreinte,
            "taille_octets": chemin.stat().st_size,
        }

        print(f"✅ {nom_fichier}")
        print(f"   empreinte : {empreinte[:32]}...")

    with open(
        FICHIER_EMPREINTES,
        "w",
        encoding="utf-8"
    ) as fichier:

        json.dump(
            empreintes,
            fichier,
            ensure_ascii=False,
            indent=2
        )

    print()
    print(f"💾 Empreintes enregistrées dans {FICHIER_EMPREINTES}")
    print()


# ============================================================
# VÉRIFICATION
# ============================================================

def verifier_empreintes(silencieux=False):
    """
    Compare les fichiers actuels aux empreintes enregistrées.

    Retourne True si tout est intact, False sinon.

    Le mode silencieux sert à appeler cette fonction depuis
    un autre script sans polluer l'affichage.
    """

    chemin_empreintes = Path(FICHIER_EMPREINTES)

    if not chemin_empreintes.exists():

        if not silencieux:
            print()
            print("⚠️  Aucun fichier d'empreintes trouvé.")
            print("    Lance d'abord :")
            print("    python verifier_integrite.py --creer")
            print()

        return False

    with open(
        chemin_empreintes,
        "r",
        encoding="utf-8"
    ) as fichier:

        empreintes_attendues = json.load(fichier)

    if not silencieux:
        print()
        print("=" * 60)
        print("🔐 VÉRIFICATION DE L'INTÉGRITÉ")
        print("=" * 60)
        print()

    tout_est_intact = True

    for nom_fichier, donnees in empreintes_attendues.items():

        chemin = Path(nom_fichier)

        if not chemin.exists():

            if not silencieux:
                print(f"❌ {nom_fichier} : FICHIER MANQUANT")

            tout_est_intact = False
            continue

        empreinte_actuelle = calculer_empreinte(chemin)

        if empreinte_actuelle == donnees["sha256"]:

            if not silencieux:
                print(f"✅ {nom_fichier} : intact")

        else:

            if not silencieux:
                print(f"❌ {nom_fichier} : MODIFIÉ !")
                print(f"   attendu : {donnees['sha256'][:32]}...")
                print(f"   trouvé  : {empreinte_actuelle[:32]}...")

            tout_est_intact = False

    if not silencieux:

        print()

        if tout_est_intact:
            print("🎉 Tous les fichiers sont intacts.")
        else:
            print("⚠️  ATTENTION : au moins un fichier a changé.")
            print()
            print("    Si c'est normal (tu viens de régénérer")
            print("    profils_versets.json par exemple), relance :")
            print("    python verifier_integrite.py --creer")

        print()

    return tout_est_intact


# ============================================================
# PROGRAMME PRINCIPAL
# ============================================================

if __name__ == "__main__":

    if "--creer" in sys.argv:
        creer_empreintes()

    else:
        verifier_empreintes()
        
