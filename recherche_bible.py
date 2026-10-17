 
import json
import re
import sys

from intentions import intentions


# ---------------------------------------------------------------------------
# Chargement de la Bible
# ---------------------------------------------------------------------------

def charger_bible(chemin="bible.json"):
    try:
        with open(chemin, "r", encoding="utf-8") as fichier:
            return json.load(fichier)
    except FileNotFoundError:
        print(f"❌ Le fichier '{chemin}' est introuvable.")
        sys.exit(1)
    except json.JSONDecodeError as erreur:
        print(f"❌ Le fichier '{chemin}' n'est pas un JSON valide : {erreur}")
        sys.exit(1)


bible = charger_bible()


# ---------------------------------------------------------------------------
# Mots associés et leur importance
#
# Chaque thème (ex: "pardon") pointe vers un ensemble de mots à rechercher
# dans les versets, avec un score d'importance pour chacun.
# ---------------------------------------------------------------------------

mots_associes = {
    "pardon": {
        "pardon": 3,
        "pardonner": 2,
        "pardonne": 2,
        "pardonné": 2,
        "pardonnée": 2,
        "offense": 1,
        "offenses": 1
    },

    "foi": {
        "foi": 3,
        "croire": 2,
        "crois": 2,
        "croyant": 2
    },

    "amour": {
        "amour": 3,
        "aimer": 2,
        "aime": 2,
        "aimé": 2,
        "aimée": 2
    }
}


# ---------------------------------------------------------------------------
# Table inversée : forme du mot -> thème
#
# C'est la correction principale du bug n°1. Avant, on ne détectait un thème
# que si l'utilisateur tapait EXACTEMENT "pardon", "foi" ou "amour". Ici, on
# construit une table qui associe CHAQUE variante (pardonne, pardonné,
# crois, aimée, ...) à son thème, pour que n'importe quelle forme du mot
# déclenche la bonne recherche.
# ---------------------------------------------------------------------------

forme_vers_theme = {}

for theme, variantes in mots_associes.items():
    for variante in variantes:
        forme_vers_theme[variante] = theme


# Petits mots que nous ignorons
mots_inutiles = {
    "le", "la", "les", "un", "une",
    "des", "du", "de", "d",
    "et", "ou", "à", "au", "aux",
    "que", "qui", "est", "sont",
    "dans", "sur", "pour", "avec",
    "me", "moi", "je", "tu",
    "il", "elle", "nous", "vous",
    "ils", "elles",
    "ce", "ces", "cet", "cette",
    "mon", "ma", "mes",
    "ton", "ta", "tes",
    "quel", "quelle", "quels", "quelles"
}


def analyser_question(question):

    # Mettre en minuscules
    question = question.lower()

    # Remplacer certains signes
    signes = "?!.,;:()[]{}\"'"

    for signe in signes:
        question = question.replace(signe, " ")

    # Séparer la phrase en mots
    mots = question.split()

    # Garder seulement les mots importants
    mots_importants = []

    for mot in mots:
        if mot not in mots_inutiles:
            mots_importants.append(mot)

    return mots_importants


def trouver_intentions(mots):
    """Détecte les thèmes/intentions présents dans la question, à partir
    du module intentions.py, en gardant chaque thème une seule fois."""

    intentions_trouvees = []

    for intention, mots_de_l_intention in intentions.items():

        for mot in mots:

            if mot in mots_de_l_intention and intention not in intentions_trouvees:
                intentions_trouvees.append(intention)
                break

    return intentions_trouvees


def construire_recherches(mots, themes):
    """Construit le dictionnaire {mot_a_chercher: score} en se basant à la
    fois sur les thèmes détectés par intentions.py et sur les formes de mots
    reconnues directement dans la question (correction du bug n°1 : on
    reconnaît maintenant "pardonne", "crois", "aimée", etc., pas seulement
    "pardon", "foi", "amour")."""

    recherches = {}

    # 1) Thèmes détectés via intentions.py -> on ajoute tout le vocabulaire
    #    associé à ce thème.
    for theme in themes:
        if theme in mots_associes:
            for mot_associe, points in mots_associes[theme].items():
                recherches[mot_associe] = max(recherches.get(mot_associe, 0), points)

    # 2) Formes de mots reconnues directement dans la question, via la
    #    table inversée construite plus haut.
    for mot in mots:
        theme = forme_vers_theme.get(mot)
        if theme:
            for mot_associe, points in mots_associes[theme].items():
                recherches[mot_associe] = max(recherches.get(mot_associe, 0), points)

    return recherches


def contient_mot_entier(mot, texte):
    """Recherche 'mot' comme mot entier dans 'texte', pas comme simple
    sous-chaîne (correction du bug n°3 : évite que "foi" matche dans
    "fois" ou "parfois")."""

    motif = r"\b" + re.escape(mot) + r"\b"
    return re.search(motif, texte) is not None


def rechercher_versets(bible, recherches):

    resultats = []

    for livre in bible:

        for chapitre in bible[livre]:

            for verset in bible[livre][chapitre]:

                texte = bible[livre][chapitre][verset]
                texte_minuscule = texte.lower()

                score = 0

                for mot, points in recherches.items():
                    if contient_mot_entier(mot, texte_minuscule):
                        score += points

                if score > 0:
                    reference = f"{livre} {chapitre}:{verset}"
                    resultats.append((score, reference, texte))

    resultats.sort(reverse=True)

    return resultats


def main():

    print("📖 Recherche biblique intelligente")
    print("Pose une question sur la Bible.")
    print("Tape 'quitter' pour arrêter.\n")

    while True:

        question = input("🤖 Ta question : ")

        if question.lower().strip() == "quitter":
            print("👋 À bientôt !")
            break

        mots = analyser_question(question)

        print("\n🧠 Mots importants :", mots)

        themes = trouver_intentions(mots)

        print("🎯 Thème(s) détecté(s) :", themes)

        recherches = construire_recherches(mots, themes)

        if not recherches:
            print("\n❌ Je ne reconnais pas encore le thème de cette question.")
            print("💡 Essaie par exemple : pardon, foi ou amour.")
            continue

        resultats = rechercher_versets(bible, recherches)

        print(f"\n⭐ {len(resultats)} résultat(s) trouvé(s).")

        for score, reference, texte in resultats[:10]:
            print(f"\n⭐ Score : {score}")
            print(f"📖 {reference}")
            print(f"📜 {texte}")

        print()


if __name__ == "__main__":
    main()
    


    