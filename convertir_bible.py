# import sqlite3
# import json

# # Ouvrir la base de données
# connexion = sqlite3.connect("frelsg.bbl.gz")
# curseur = connexion.cursor()

# # Afficher les tables disponibles
# curseur.execute("""
# SELECT name
# FROM sqlite_master
# WHERE type='table';
# """)

# tables = curseur.fetchall()

# print("📚 Tables trouvées :")

# for table in tables:
#     print("➡️", table[0])

# connexion.close()

# import sqlite3
# import os

# fichier = "frelsg.bbl.gz"

# print("📁 Fichier utilisé :", os.path.abspath(fichier))
# print("📦 Taille du fichier :", os.path.getsize(fichier), "octets")

# connexion = sqlite3.connect(fichier)
# curseur = connexion.cursor()


# curseur.execute("""
# SELECT name
# FROM sqlite_master
# WHERE type='table';
# """)

# tables = curseur.fetchall()

# print("\n📚 Tables trouvées :")

# if tables:
#     for table in tables:
#         print("➡️", table[0])
# else:
#     print("❌ Aucune table trouvée.")

# connexion.close()

# import sqlite3
# import os

# fichier = "frelsg.bbl.mybible.gz"

# print("📁 Fichier utilisé :", os.path.abspath(fichier))
# print("📦 Taille du fichier :", os.path.getsize(fichier), "octets")

# connexion = sqlite3.connect(fichier)
# curseur = connexion.cursor()

# curseur.execute("""
# SELECT name
# FROM sqlite_master
# WHERE type='table';
# """)

# tables = curseur.fetchall()

# print("\n📚 Tables trouvées :")

# if tables:
#     for table in tables:
#         print("➡️", table[0])
# else:
#     print("❌ Aucune table trouvée.")

# connexion.close()

# import sqlite3

# fichier = "frelsg.bbl.mybible.gz"

# connexion = sqlite3.connect(fichier)
# curseur = connexion.cursor()

# print("🔎 Analyse de la base biblique...\n")

# curseur.execute("""
# SELECT name
# FROM sqlite_master
# WHERE type='table';
# """)

# tables = curseur.fetchall()

# print("📚 Tables trouvées :")

# for table in tables:
#     print("➡️", table[0])

# connexion.close()

# import sqlite3

# fichier = "frelsg.bbl.mybible.gz"

# connexion = sqlite3.connect(fichier)
# curseur = connexion.cursor()

# curseur.execute("""
# SELECT Book, Chapter, Verse, Scripture
# FROM Bible
# LIMIT 5;
# """)

# versets = curseur.fetchall()

# print("📖 Premiers versets de la Bible :\n")

# for book, chapter, verse, scripture in versets:
#     print(f"{book} {chapter}:{verse} → {scripture}")

# connexion.close()

import sqlite3
import json

fichier = "frelsg.bbl.mybible.gz"

# Les noms des 66 livres de la Bible
livres = [
    "Genèse", "Exode", "Lévitique", "Nombres", "Deutéronome",
    "Josué", "Juges", "Ruth", "1 Samuel", "2 Samuel",
    "1 Rois", "2 Rois", "1 Chroniques", "2 Chroniques",
    "Esdras", "Néhémie", "Esther", "Job", "Psaumes",
    "Proverbes", "Ecclésiaste", "Cantique des Cantiques",
    "Ésaïe", "Jérémie", "Lamentations", "Ézéchiel", "Daniel",
    "Osée", "Joël", "Amos", "Abdias", "Jonas", "Michée",
    "Nahum", "Habacuc", "Sophonie", "Aggée", "Zacharie",
    "Malachie",

    "Matthieu", "Marc", "Luc", "Jean", "Actes",
    "Romains", "1 Corinthiens", "2 Corinthiens", "Galates",
    "Éphésiens", "Philippiens", "Colossiens",
    "1 Thessaloniciens", "2 Thessaloniciens", "1 Timothée",
    "2 Timothée", "Tite", "Philémon", "Hébreux", "Jacques",
    "1 Pierre", "2 Pierre", "1 Jean", "2 Jean", "3 Jean",
    "Jude", "Apocalypse"
]

# Connexion à la base
connexion = sqlite3.connect(fichier)
curseur = connexion.cursor()

# Récupérer tous les versets
curseur.execute("""
SELECT Book, Chapter, Verse, Scripture
FROM Bible
ORDER BY Book, Chapter, Verse
""")

donnees = curseur.fetchall()

# Construire notre Bible
bible = {}

for book, chapter, verse, scripture in donnees:

    nom_livre = livres[book - 1]

    if nom_livre not in bible:
        bible[nom_livre] = {}

    chapitre = str(chapter)

    if chapitre not in bible[nom_livre]:
        bible[nom_livre][chapitre] = {}

    bible[nom_livre][chapitre][str(verse)] = scripture

# Créer le fichier JSON
with open("bible.json", "w", encoding="utf-8") as fichier_json:
    json.dump(bible, fichier_json, ensure_ascii=False, indent=2)

connexion.close()

print("✅ Bible convertie avec succès !")
print("📖 Nombre de versets :", len(donnees))
print("📚 Nombre de livres :", len(bible))
print("💾 Fichier créé : bible.json")


